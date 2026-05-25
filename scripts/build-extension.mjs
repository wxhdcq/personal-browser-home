import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const nextCli = join(rootDir, "node_modules", "next", "dist", "bin", "next");
const buildOutputDir = join(rootDir, ".next-extension");
const extensionOutDir = join(rootDir, "out-extension");
const sourceAssetDirName = "_next";
const extensionAssetDirName = "next-assets";
const manifestSource = join(rootDir, "extension", "manifest.chrome.json");
const manifestTarget = join(extensionOutDir, "manifest.json");
const inlineScriptDir = join(
  extensionOutDir,
  sourceAssetDirName,
  "static",
  "extension-inline",
);

const textFileExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".svg",
  ".txt",
  ".webmanifest",
  ".xml",
]);

function runNextBuild() {
  const result = spawnSync(process.execPath, [nextCli, "build"], {
    cwd: rootDir,
    env: {
      ...process.env,
      NEXT_PUBLIC_APP_TARGET: "extension",
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function copyManifest() {
  const manifest = readFileSync(manifestSource, "utf8");
  writeFileSync(manifestTarget, manifest);
}

function writeInlineScript(content) {
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 16);
  const filename = `inline-${hash}.js`;
  const target = join(inlineScriptDir, filename);

  mkdirSync(inlineScriptDir, { recursive: true });
  if (!existsSync(target)) {
    writeFileSync(target, content);
  }

  return `/${extensionAssetDirName}/static/extension-inline/${filename}`;
}

function externalizeExecutableInlineScripts(html) {
  return html.replace(
    /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi,
    (match, attributes, content) => {
      const typeMatch = String(attributes).match(/\stype=["']([^"']+)["']/i);
      const type = typeMatch?.[1]?.toLowerCase();
      const isExecutable =
        !type || type === "text/javascript" || type === "application/javascript";

      if (!isExecutable || !content.trim()) return match;

      const src = writeInlineScript(content);
      return `<script${attributes} src="${src}"></script>`;
    },
  );
}

function walkHtmlFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const target = join(dir, entry);
    const stat = statSync(target);

    if (stat.isDirectory()) {
      walkHtmlFiles(target, files);
    } else if (target.endsWith(".html")) {
      files.push(target);
    }
  }

  return files;
}

function walkFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const target = join(dir, entry);
    const stat = statSync(target);

    if (stat.isDirectory()) {
      walkFiles(target, files);
    } else {
      files.push(target);
    }
  }

  return files;
}

function externalizeInlineScripts() {
  for (const file of walkHtmlFiles(extensionOutDir)) {
    const html = readFileSync(file, "utf8");
    const nextHtml = externalizeExecutableInlineScripts(html);

    if (nextHtml !== html) {
      writeFileSync(file, nextHtml);
    }
  }
}

function injectExtensionTargetAttribute() {
  for (const file of walkHtmlFiles(extensionOutDir)) {
    const html = readFileSync(file, "utf8");
    const nextHtml = html.replace(
      /<html\b(?![^>]*\bdata-app-target=)/i,
      '<html data-app-target="extension"',
    );

    if (nextHtml !== html) {
      writeFileSync(file, nextHtml);
    }
  }
}

function rewriteAssetReferences() {
  for (const file of walkFiles(extensionOutDir)) {
    if (!textFileExtensions.has(extname(file))) continue;

    const content = readFileSync(file, "utf8");
    const nextContent = content.replaceAll(
      `/${sourceAssetDirName}/`,
      `/${extensionAssetDirName}/`,
    );

    if (nextContent !== content) {
      writeFileSync(file, nextContent);
    }
  }
}

function sanitizeReservedName(name) {
  if (name === sourceAssetDirName) return extensionAssetDirName;
  return `next-${name.replace(/^_+/, "") || "asset"}`;
}

function renameReservedEntries(dir) {
  for (const entry of readdirSync(dir)) {
    const currentPath = join(dir, entry);
    const stat = statSync(currentPath);

    if (stat.isDirectory()) {
      renameReservedEntries(currentPath);
    }

    if (!entry.startsWith("_")) continue;

    const safeName = sanitizeReservedName(entry);
    const nextPath = join(dir, safeName);
    rmSync(nextPath, { recursive: true, force: true });
    renameSync(currentPath, nextPath);
  }
}

rmSync(buildOutputDir, { recursive: true, force: true });
rmSync(extensionOutDir, { recursive: true, force: true });

runNextBuild();

if (!existsSync(join(buildOutputDir, "index.html"))) {
  throw new Error("Next.js did not generate the expected extension output.");
}

renameSync(buildOutputDir, extensionOutDir);
copyManifest();
externalizeInlineScripts();
injectExtensionTargetAttribute();
rewriteAssetReferences();
renameReservedEntries(extensionOutDir);

console.log("Extension build generated at out-extension");

import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const extensionOutDir = join(rootDir, "out-extension");

const requiredFiles = [
  "manifest.json",
  "index.html",
  "bookmarks/index.html",
  "history/index.html",
  "downloads/index.html",
  "settings/index.html",
  "plugins/index.html",
  "notes/index.html",
];

const requiredPermissions = ["storage", "bookmarks", "history", "downloads"];
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

function fail(message) {
  throw new Error(`Extension verification failed: ${message}`);
}

function walkEntries(dir, entries = []) {
  for (const entry of readdirSync(dir)) {
    const target = join(dir, entry);
    const stat = statSync(target);
    entries.push({ name: entry, path: target, stat });

    if (stat.isDirectory()) {
      walkEntries(target, entries);
    }
  }

  return entries;
}

function walkFiles(dir) {
  return walkEntries(dir)
    .filter((entry) => entry.stat.isFile())
    .map((entry) => entry.path);
}

function isExecutableInlineScript(attributes, content) {
  const typeMatch = String(attributes).match(/\stype=["']([^"']+)["']/i);
  const type = typeMatch?.[1]?.toLowerCase();
  return (
    content.trim() &&
    (!type || type === "text/javascript" || type === "application/javascript")
  );
}

if (!existsSync(extensionOutDir)) {
  fail("out-extension does not exist. Run npm run build:extension first.");
}

for (const file of requiredFiles) {
  if (!existsSync(join(extensionOutDir, file))) {
    fail(`missing ${file}`);
  }
}

const manifest = JSON.parse(
  readFileSync(join(extensionOutDir, "manifest.json"), "utf8"),
);

if (manifest.manifest_version !== 3) {
  fail("manifest_version must be 3");
}

if (manifest.chrome_url_overrides?.newtab !== "index.html") {
  fail("chrome_url_overrides.newtab must point to index.html");
}

for (const permission of requiredPermissions) {
  if (!manifest.permissions?.includes(permission)) {
    fail(`manifest missing ${permission} permission`);
  }
}

const entries = walkEntries(extensionOutDir);
const reservedNames = entries.filter((entry) => entry.name.startsWith("_"));
if (reservedNames.length > 0) {
  fail(
    `reserved Chrome extension names found: ${reservedNames
      .map((entry) => entry.name)
      .join(", ")}`,
  );
}

if (existsSync(join(extensionOutDir, "api"))) {
  fail("extension output must not include Next.js API routes");
}

for (const file of walkFiles(extensionOutDir)) {
  if (!textFileExtensions.has(extname(file))) continue;

  const content = readFileSync(file, "utf8");
  if (content.includes("/_next/")) {
    fail(`${file} still references /_next/`);
  }

  if (file.endsWith(".html")) {
    if (!/<html\b[^>]*\bdata-app-target=["']extension["']/.test(content)) {
      fail(`${file} is missing data-app-target="extension"`);
    }

    const inlineScripts = [...content.matchAll(/<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/gi)]
      .filter(([, attributes, scriptContent]) =>
        isExecutableInlineScript(attributes, scriptContent),
      );

    if (inlineScripts.length > 0) {
      fail(`${file} contains executable inline scripts`);
    }
  }
}

console.log("Extension build verification passed.");

const isExtensionTarget = process.env.NEXT_PUBLIC_APP_TARGET === "extension";

function splitRoute(href: string) {
  const hashIndex = href.indexOf("#");
  const beforeHash = hashIndex < 0 ? href : href.slice(0, hashIndex);
  const hash = hashIndex < 0 ? "" : href.slice(hashIndex);
  const queryIndex = beforeHash.indexOf("?");

  if (queryIndex < 0) return { path: beforeHash, query: "", hash };

  return {
    path: beforeHash.slice(0, queryIndex),
    query: beforeHash.slice(queryIndex),
    hash,
  };
}

export function appHref(href: string) {
  if (!isExtensionTarget) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith("#")) return href;

  const { path, query, hash } = splitRoute(href);
  if (!path || path === "/") return `/index.html${query}${hash}`;

  return `${path.replace(/\/$/, "")}/index.html${query}${hash}`;
}

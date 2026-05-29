/**
 * Client origin for redirects (OAuth, emails).
 * Uses CLIENT_PROD in production — never prefers CLIENT_DEV when NODE_ENV=production.
 */
function getClientUrl() {
  const isProd = process.env.NODE_ENV === "production";

  const url = isProd
    ? process.env.CLIENT_PROD || process.env.CLIENT_URL
    : process.env.CLIENT_DEV || process.env.CLIENT_PROD || "http://localhost:5173";

  if (!url) {
    throw new Error(
      isProd
        ? "CLIENT_PROD (or CLIENT_URL) must be set in production"
        : "CLIENT_DEV must be set for local redirects"
    );
  }

  return url.replace(/\/$/, "");
}

/** @param {string} path e.g. "/auth-success" */
function clientPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getClientUrl()}${normalized}`;
}

module.exports = { getClientUrl, clientPath };

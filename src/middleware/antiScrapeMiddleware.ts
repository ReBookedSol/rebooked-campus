// src/middleware/antiScrapeMiddleware.ts
/**
 * Simple anti‑scraping middleware for Vite dev/preview server.
 * Blocks requests that do not contain a typical browser User‑Agent string.
 * Adds X‑Robots‑Tag header to discourage indexing by crawlers.
 */
import type { Connect } from "vite";

// Regex matches common browser identifiers in the User‑Agent header.
const BROWSER_UA_REGEX = /\b(Mozilla|Chrome|Safari|Firefox|Edge)\b/i;

export function antiScrapeMiddleware(): Connect.NextHandleFunction {
  return (req, res, next) => {
    const ua = req.headers["user-agent"] ?? "";
    if (!BROWSER_UA_REGEX.test(ua as string)) {
      res.statusCode = 403;
      res.end("Forbidden: Automated scraping is not allowed.");
      return;
    }
    // Suggest crawlers not index the page.
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    next();
  };
}

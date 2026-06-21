/**
 * Scroll position memory for auth redirects.
 *
 * Before sending the user to /auth (or any flow that interrupts the session),
 * call rememberCurrentScroll(). Once they return, the Auth page reads the
 * stored return path and the global RouteScrollManager restores scrollY.
 */

const MAP_KEY = "scroll-memory:v1";
const RETURN_KEY = "scroll-memory:return-to";

type ScrollMap = Record<string, number>;

const read = (): ScrollMap => {
  try { return JSON.parse(sessionStorage.getItem(MAP_KEY) || "{}"); } catch { return {}; }
};
const write = (m: ScrollMap) => {
  try { sessionStorage.setItem(MAP_KEY, JSON.stringify(m)); } catch { /* ignore */ }
};

/** Persist current path + scrollY and mark it as the return target. */
export function rememberCurrentScroll(path?: string) {
  if (typeof window === "undefined") return;
  const p = path ?? (window.location.pathname + window.location.search);
  const m = read();
  m[p] = window.scrollY;
  write(m);
  try { sessionStorage.setItem(RETURN_KEY, p); } catch { /* ignore */ }
}

/** Returns the stored return path (and clears it). */
export function consumeReturnTo(): string | null {
  try {
    const v = sessionStorage.getItem(RETURN_KEY);
    if (v) sessionStorage.removeItem(RETURN_KEY);
    return v;
  } catch {
    return null;
  }
}

/** Restore (and clear) the saved scrollY for a path, if any. */
export function restoreScrollFor(path: string) {
  const m = read();
  if (m[path] != null) {
    const y = m[path];
    delete m[path];
    write(m);
    // Wait two frames so layout has stabilised
    requestAnimationFrame(() =>
      requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }))
    );
  }
}

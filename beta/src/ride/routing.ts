/**
 * URL handling. The Vercel build uses real paths (/labs). The artifact
 * preview build (`npm run build:artifact`) uses plain hashes (#labs),
 * because an Artifact frame only carries a `#name` hash.
 */
const HASH = import.meta.env.VITE_ROUTER === 'hash';

/** Event that fires when the browser moves through history. */
export const HISTORY_EVENT = HASH ? 'hashchange' : 'popstate';

const hashToPath = (hash: string) => {
  const name = hash.replace(/^#/, '');
  return !name || name === 'about' ? '/' : `/${name}`;
};

/** The current station route ("/", "/labs", …). */
export const currentPath = () => (HASH ? hashToPath(window.location.hash) : window.location.pathname);

/** href for a station route in this build. */
export const hrefFor = (route: string) => (HASH ? `#${route === '/' ? 'about' : route.slice(1)}` : route);

export function pushRoute(route: string) {
  if (HASH) window.location.hash = hrefFor(route);
  else window.history.pushState(null, '', route);
}

/** Replace an unknown URL with the About station. */
export function resetToStart() {
  if (HASH) window.history.replaceState(null, '', '#about');
  else window.history.replaceState(null, '', '/');
}

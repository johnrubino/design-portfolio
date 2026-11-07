const KEY = 'rta:map-collapsed';

export function readCollapsed(): boolean | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === null ? null : v === '1';
  } catch {
    return null;
  }
}

export function writeCollapsed(collapsed: boolean) {
  try {
    window.localStorage.setItem(KEY, collapsed ? '1' : '0');
  } catch {
    /* storage unavailable (private mode, blocked): the preference just isn't remembered */
  }
}

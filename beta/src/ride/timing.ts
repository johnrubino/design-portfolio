/** Ride timing, straight from the brief (§4). */
export const RIDE_EASE = 'cubic-bezier(.65,0,.35,1)';
export const MORPH_MS = 700;
/** Morph lock: a little longer than the transition so nothing starts mid-morph. */
export const MORPH_LOCK_MS = 760;
/** How long after the start of a ride the new content starts entering. */
export const ENTER_DELAY_RATIO = 0.18;
/** First-load content delay: lines draw (1500ms) before the page enters. */
export const BOOT_BASE_MS = 1500;
export const REDUCED_T = 150;

export function rideDuration(distancePx: number, reduced: boolean): number {
  if (reduced) return REDUCED_T;
  return Math.round(Math.min(2400, Math.max(1100, 800 + distancePx * 2)));
}

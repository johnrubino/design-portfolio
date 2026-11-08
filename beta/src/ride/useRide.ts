/**
 * The ride state machine.
 *
 *   idle ──go(i)──▶ depart ──T/2──▶ arrive ──T+40──▶ idle
 *   idle ──setExpanded──▶ (morph) ──540ms──▶ idle
 *
 * - depart: target/T/dir are set in one update, so the map marker, rail marker
 *   and wipe all start together from the same T and easing.
 * - at T/2 the page swaps (the wipe fully covers the content then); the
 *   caller resets scroll and updates the URL in `onSwap`.
 * - clicks are ignored unless idle; browser back/forward cannot be ignored
 *   (the URL already changed) so it is queued and ridden on arrival.
 */
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { BUILT_STATIONS } from '../geometry/network';
import { BOOT_BASE_MS, ENTER_DELAY_RATIO, MORPH_LOCK_MS, rideDuration } from './timing';

export type Phase = 'idle' | 'depart' | 'arrive';
export type Dir = 'f' | 'b';

export interface RideState {
  /** Station the marker is at (updates on arrival). */
  cur: number;
  /** Station whose page is shown (updates at T/2). */
  page: number;
  /** Station the marker is heading to (equals cur when idle). */
  target: number;
  phase: Phase;
  moving: boolean;
  T: number;
  dir: Dir;
  /** Delay before the new page's elements enter, in ms. */
  base: number;
  collapsed: boolean;
  morph: boolean;
}

type Action =
  | { type: 'start'; target: number; T: number; dir: Dir }
  | { type: 'swap'; base: number }
  | { type: 'arrive' }
  | { type: 'morphTo'; collapsed: boolean }
  | { type: 'setCollapsed'; collapsed: boolean }
  | { type: 'morphDone' };

function reducer(s: RideState, a: Action): RideState {
  switch (a.type) {
    case 'start':
      return { ...s, target: a.target, T: a.T, dir: a.dir, moving: true, phase: 'depart' };
    case 'swap':
      return { ...s, page: s.target, phase: 'arrive', base: a.base };
    case 'arrive':
      return { ...s, cur: s.target, moving: false, phase: 'idle' };
    case 'morphTo':
      return { ...s, collapsed: a.collapsed, morph: true, T: 0 };
    case 'setCollapsed':
      return s.collapsed === a.collapsed ? s : { ...s, collapsed: a.collapsed, T: 0 };
    case 'morphDone':
      return { ...s, morph: false };
  }
}

export interface RideOptions {
  initial: number;
  initialCollapsed: boolean;
  reducedMotion: boolean;
  /** Called at T/2 with the new station index and whether a URL push is needed. */
  onSwap: (index: number, push: boolean) => void;
  /** Called when the marker arrives. */
  onArrive: (index: number) => void;
}

export function useRide(opts: RideOptions) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    cur: opts.initial,
    page: opts.initial,
    target: opts.initial,
    phase: 'idle' as Phase,
    moving: false,
    T: 0,
    dir: 'f' as Dir,
    base: opts.reducedMotion ? 0 : BOOT_BASE_MS,
    collapsed: opts.initialCollapsed,
    morph: false,
  }));

  const live = useRef(state);
  live.current = state;
  const busy = useRef(false);
  const queued = useRef<number | null>(null);
  /** Open/closed request that arrived mid-ride or mid-morph (true = collapsed). */
  const wantCollapsed = useRef<boolean | null>(null);
  const timers = useRef<number[]>([]);
  const cb = useRef(opts);
  cb.current = opts;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const flushQueue = useCallback(() => {
    const q = queued.current;
    queued.current = null;
    if (q !== null && q !== live.current.cur) {
      go(q, { fromHistory: true });
      return;
    }
    const w = wantCollapsed.current;
    wantCollapsed.current = null;
    if (w !== null && w !== live.current.collapsed) setExpanded(!w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = useCallback((i: number, o: { fromHistory?: boolean } = {}) => {
    const s = live.current;
    if (busy.current) {
      // A click mid-ride is ignored; a history move is remembered.
      if (o.fromHistory) queued.current = i;
      return;
    }
    if (i === s.cur) return;
    busy.current = true;
    const reduced = cb.current.reducedMotion;
    const distance = Math.abs(BUILT_STATIONS[i].dE - BUILT_STATIONS[s.cur].dE);
    const T = rideDuration(distance, reduced);
    const dir: Dir = i > s.cur ? 'f' : 'b';
    dispatch({ type: 'start', target: i, T, dir });
    later(() => {
      dispatch({ type: 'swap', base: reduced ? 0 : Math.round(T * ENTER_DELAY_RATIO) });
      cb.current.onSwap(i, !o.fromHistory);
    }, T / 2);
    later(() => {
      dispatch({ type: 'arrive' });
      busy.current = false;
      cb.current.onArrive(i);
      flushQueue();
    }, T + 40);
  }, [flushQueue]);

  /** Open or close the map with the morph; a request mid-ride or mid-morph is applied afterwards. */
  const setExpanded = useCallback((expanded: boolean) => {
    const collapsed = !expanded;
    if (busy.current) {
      wantCollapsed.current = collapsed;
      return;
    }
    wantCollapsed.current = null;
    if (live.current.collapsed === collapsed) return;
    busy.current = true;
    dispatch({ type: 'morphTo', collapsed });
    later(() => {
      dispatch({ type: 'morphDone' });
      busy.current = false;
      flushQueue();
    }, MORPH_LOCK_MS);
  }, [flushQueue]);

  /** Set collapse without animation (e.g. crossing a breakpoint). */
  const setCollapsed = useCallback((collapsed: boolean) => {
    wantCollapsed.current = null;
    dispatch({ type: 'setCollapsed', collapsed });
  }, []);

  return { state, go, setExpanded, setCollapsed };
}

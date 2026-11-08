import type React from 'react';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type CSSProperties } from 'react';
import { byOrder } from './content/lines';
import { SITE } from './content/site';
import { STATIONS, isAlias, isKnownPath, stationIndexForPath } from './content/stations';
import { LineStrip } from './components/LineStrip';
import { LiveRegion } from './components/LiveRegion';
import { ManualPage } from './components/Manual/ManualPage';
import { MapSheet } from './components/MapSheet';
import { MobileBar } from './components/MobileBar';
import { NavSign } from './components/NavSign';
import { RouteMap } from './components/RouteMap/RouteMap';
import { Wipe } from './components/Wipe';
import { About } from './pages/About';
import { CaseStudies } from './pages/CaseStudies';
import { Labs } from './pages/Labs';
import { Resume } from './pages/Resume';
import { Writing } from './pages/Writing';
import { HISTORY_EVENT, currentPath, pushRoute, resetToStart } from './ride/routing';
import { useMedia } from './ride/useMedia';
import { useRide } from './ride/useRide';

const PAGES: ComponentType[] = [About, CaseStudies, Labs, Writing, Resume];

const MOBILE = '(max-width: 899.98px)';
/** The map collapses by itself in this range, live as the window resizes. */
const NARROW = '(min-width: 900px) and (max-width: 1279.98px)';
const SIGN_H = 96;
const MAP_H = 900 - SIGN_H;

const titleFor = (i: number) => (i === 0 ? SITE.titleSuffix : `${STATIONS[i].name} · ${SITE.titleSuffix}`);

/** Hover intent: a short pause before opening, a longer one before closing. */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 280;

const initialCollapsed = () => window.matchMedia(NARROW).matches;

function useViewport() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener('resize', cb);
      return () => window.removeEventListener('resize', cb);
    },
    () => `${window.innerWidth}x${window.innerHeight}`,
  )
    .split('x')
    .map(Number) as [number, number];
}

export function App() {
  const isMobile = useMedia(MOBILE);
  const isNarrow = useMedia(NARROW);
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const [vw, vh] = useViewport();

  const scrollRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [initial] = useState(() => stationIndexForPath(currentPath()));
  const [announce, setAnnounce] = useState('');
  const [hover, setHover] = useState(-1);
  const [sheet, setSheet] = useState(false);
  const sheetRef = useRef(sheet);
  sheetRef.current = sheet;

  const navRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
  const overMap = useRef(false);
  const hoverTimer = useRef<number | undefined>(undefined);
  const lastPointer = useRef('mouse');
  /** Keyboard focus is inside the map (a mouse click's focus doesn't count). */
  const keyboardInMap = () => {
    const a = document.activeElement;
    return !!a && a !== logoRef.current && !!navRef.current?.contains(a) && a.matches(':focus-visible');
  };

  const { state, go, setExpanded, setCollapsed } = useRide({
    initial,
    initialCollapsed: initialCollapsed(),
    reducedMotion: reduced,
    onSwap: (i, push) => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      if (push) pushRoute(STATIONS[i].route);
      document.title = titleFor(i);
      // If focus was inside the old page (e.g. the Next sign), it was
      // just unmounted: move it to the new station name.
      requestAnimationFrame(() => {
        const a = document.activeElement;
        if (!a || a === document.body || !a.isConnected) titleRef.current?.focus({ preventScroll: true });
      });
    },
    onArrive: (i) => {
      setAnnounce(`${STATIONS[i].name} page`);
      if (sheetRef.current) window.setTimeout(() => setSheet(false), 350);
      // A ride started from the open map (touch, keyboard): close it unless the pointer is still over it.
      if (isNarrow && !overMap.current && !keyboardInMap()) setExpanded(false);
    },
  });

  // Deep links: normalise unknown paths, set the first title.
  useEffect(() => {
    if (!isKnownPath(currentPath())) resetToStart();
    else if (isAlias(currentPath())) window.history.replaceState(null, '', STATIONS[initial].route);
    document.title = titleFor(initial);
  }, [initial]);

  // Browser back/forward rides the marker back and forth.
  useEffect(() => {
    const onPop = () => go(stationIndexForPath(currentPath()), { fromHistory: true });
    window.addEventListener(HISTORY_EVENT, onPop);
    return () => window.removeEventListener(HISTORY_EVENT, onPop);
  }, [go]);

  // Crossing the breakpoint switches instantly: collapsed below 1280px, expanded above.
  const firstBreakpoint = useRef(true);
  useEffect(() => {
    if (firstBreakpoint.current) {
      firstBreakpoint.current = false;
      return;
    }
    window.clearTimeout(hoverTimer.current);
    if (!isMobile) setCollapsed(isNarrow);
  }, [isNarrow, isMobile, setCollapsed]);

  // Narrow screens: the map opens as a floating panel on hover, logo focus or a tap on the logo.
  const request = useCallback(
    (open: boolean, delay: number) => {
      window.clearTimeout(hoverTimer.current);
      if (!isNarrow) return;
      if (!open) setHover(-1);
      hoverTimer.current = window.setTimeout(() => setExpanded(open), delay);
    },
    [isNarrow, setExpanded],
  );
  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const flyoutOpen = isNarrow && !state.collapsed;
  // A tap outside the open map closes it.
  useEffect(() => {
    if (!flyoutOpen) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) request(false, 0);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [flyoutOpen, request]);

  const navHandlers = isNarrow
    ? {
        // Open on movement, not mere presence: a cursor that happens to rest
        // where the map renders (e.g. on page load) shouldn't pop it open.
        onPointerMove: (e: React.PointerEvent) => {
          if (e.pointerType !== 'mouse' || overMap.current) return;
          overMap.current = true;
          request(true, OPEN_DELAY);
        },
        onPointerLeave: (e: React.PointerEvent) => {
          if (e.pointerType !== 'mouse') return;
          overMap.current = false;
          if (!keyboardInMap()) request(false, CLOSE_DELAY);
        },
        onBlur: (e: React.FocusEvent) => {
          if (!overMap.current && !navRef.current?.contains(e.relatedTarget as Node | null)) request(false, 0);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key !== 'Escape' || state.collapsed) return;
          request(false, 0);
          logoRef.current?.focus();
        },
      }
    : {};

  const onGo = useCallback(
    (i: number) => {
      setHover(-1);
      if (sheetRef.current && i === state.cur && !state.moving) {
        setSheet(false);
        return;
      }
      go(i);
    },
    [go, state.cur, state.moving],
  );

  const mapScale = Math.min(1, Math.max(0.5, (vh - SIGN_H) / MAP_H));
  const sheetScale = Math.min(vw / 460, (vh - SIGN_H) / MAP_H);
  const Page = PAGES[state.page];
  const wipeColours = byOrder(STATIONS[state.target].lines).map((l) => l.colour);

  return (
    <div className="app" data-layout={isMobile ? 'mobile' : 'desktop'}>
      {isMobile ? (
        <MobileBar onMap={() => setSheet(true)} mapOpen={sheet} />
      ) : (
        <nav
          ref={navRef}
          className="routemap"
          aria-label="Map"
          data-c={state.collapsed}
          data-slot={isNarrow ? 'narrow' : 'wide'}
          data-flyout={isNarrow && (!state.collapsed || state.morph)}
          {...navHandlers}
        >
          {/* The slot keeps its width in the layout; on narrow screens the panel opens over the page. */}
          <div className="routemap-panel">
            <NavSign
              interactive={isNarrow}
              expanded={!state.collapsed}
              logoRef={logoRef}
              onLogoPointerDown={(e) => {
                lastPointer.current = e.pointerType;
              }}
              onLogoFocus={(e) => {
                // Focus arriving from inside the map (e.g. Escape returning it here) doesn't re-open it.
                if (navRef.current?.contains(e.relatedTarget as Node | null)) return;
                request(true, 0);
              }}
              onLogoClick={(e) => {
                // Mouse: hover already opens it. Touch and keyboard: the logo toggles.
                const keyboard = e.detail === 0;
                if (!keyboard && lastPointer.current === 'mouse') request(true, 0);
                else request(state.collapsed, 0);
                lastPointer.current = 'mouse';
              }}
            />
            <RouteMap ride={state} hover={hover} setHover={setHover} onGo={onGo} scale={mapScale} intro={!reduced} />
          </div>
        </nav>
      )}

      <main className="content" data-phase={state.phase} data-dir={state.dir}>
        {/* Phones only: the map is a sheet there, so the page rail is the navigation. */}
        {isMobile && <LineStrip ride={state} onGo={onGo} />}
        <div className="scroll" ref={scrollRef} style={{ '--base': `${state.base}ms` } as CSSProperties}>
          <ManualPage key={state.page} index={state.page} onGo={onGo} titleRef={titleRef}>
            <Page />
          </ManualPage>
        </div>
        {state.moving && !reduced && (
          <Wipe key={`${state.target}-${state.dir}-${state.T}`} T={state.T} dir={state.dir} colours={wipeColours} />
        )}
      </main>

      {isMobile && (
        <MapSheet
          open={sheet}
          onClose={() => setSheet(false)}
          ride={state}
          hover={hover}
          setHover={setHover}
          onGo={onGo}
          scale={sheetScale}
          offsetX={Math.max(0, (vw - 460 * sheetScale) / 2)}
        />
      )}
      <LiveRegion message={announce} />
    </div>
  );
}

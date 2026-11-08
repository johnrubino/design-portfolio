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
import { Home } from './pages/Home';
import { Labs } from './pages/Labs';
import { Resume } from './pages/Resume';
import { Writing } from './pages/Writing';
import { HISTORY_EVENT, currentPath, pushRoute, resetToStart } from './ride/routing';
import { useMedia } from './ride/useMedia';
import { useRide } from './ride/useRide';

const PAGES: ComponentType[] = [Home, Labs, About, Writing, Resume];

const MOBILE = '(max-width: 899.98px)';
/** The map collapses by itself in this range, live as the window resizes. */
const NARROW = '(min-width: 900px) and (max-width: 1279.98px)';
const SIGN_H = 96;
const MAP_H = 900 - SIGN_H;

const titleFor = (i: number) => (i === 0 ? SITE.titleSuffix : `${STATIONS[i].name} · ${SITE.titleSuffix}`);

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
  /** A project chosen on the map, shown once the ride to its page arrives. */
  const pendingProject = useRef<string | null>(null);
  const logoRef = useRef<HTMLButtonElement>(null);
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
      if (pendingProject.current) {
        const slug = pendingProject.current;
        pendingProject.current = null;
        requestAnimationFrame(() => showProject(slug));
      }
      if (sheetRef.current) window.setTimeout(() => setSheet(false), 350);
      // A ride started from the open map closes it, unless keyboard focus is inside the map.
      if (isNarrow && !keyboardInMap()) setExpanded(false);
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
    if (!isMobile) setCollapsed(isNarrow);
  }, [isNarrow, isMobile, setCollapsed]);

  // Narrow screens: clicking the logo opens the map as a floating panel over the page.
  const setOpen = useCallback(
    (open: boolean) => {
      if (!isNarrow) return;
      if (!open) setHover(-1);
      setExpanded(open);
    },
    [isNarrow, setExpanded],
  );

  const flyoutOpen = isNarrow && !state.collapsed;
  // A tap outside the open map closes it.
  useEffect(() => {
    if (!flyoutOpen) return;
    const onDown = (e: globalThis.PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [flyoutOpen, setOpen]);

  const navHandlers = isNarrow
    ? {
        // Tabbing out of the open map closes it.
        onBlur: (e: React.FocusEvent) => {
          const to = e.relatedTarget as Node | null;
          if (to && !navRef.current?.contains(to)) setOpen(false);
        },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key !== 'Escape' || state.collapsed) return;
          setOpen(false);
          logoRef.current?.focus();
        },
      }
    : {};

  /** Scroll the page to a project's row and highlight it briefly. */
  const showProject = (slug: string) => {
    const row = document.getElementById(`project-${slug}`);
    if (!row) return;
    row.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
    row.classList.remove('flash');
    void row.offsetWidth; // restart the highlight
    row.classList.add('flash');
  };
  const onProject = (station: number, slug: string) => {
    setHover(-1);
    if (state.moving || state.morph) return;
    if (state.cur === station) {
      showProject(slug);
      if (isNarrow) setOpen(false);
      if (sheetRef.current) window.setTimeout(() => setSheet(false), 200);
      return;
    }
    pendingProject.current = slug;
    go(station);
  };

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
              onLogoClick={() => setOpen(state.collapsed)}
            />
            <RouteMap ride={state} hover={hover} setHover={setHover} onGo={onGo} onProject={onProject} scale={mapScale} intro={!reduced} />
          </div>
        </nav>
      )}

      <main className="content" data-phase={state.phase} data-dir={state.dir}>
        {/* Phones only: the map is a sheet there, so the page rail is the navigation. */}
        {isMobile && <LineStrip ride={state} onGo={onGo} />}
        <div className="scroll" ref={scrollRef} style={{ '--base': `${state.base}ms` } as CSSProperties}>
          <ManualPage key={state.page} index={state.page} titleRef={titleRef}>
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
          onProject={onProject}
          scale={sheetScale}
          offsetX={Math.max(0, (vw - 460 * sheetScale) / 2)}
        />
      )}
      <LiveRegion message={announce} />
    </div>
  );
}

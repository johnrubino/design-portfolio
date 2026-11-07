import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ComponentType, type CSSProperties } from 'react';
import { byDisc } from './content/lines';
import { SITE } from './content/site';
import { STATIONS, isKnownPath, stationIndexForPath } from './content/stations';
import { LineStrip } from './components/LineStrip';
import { LiveRegion } from './components/LiveRegion';
import { ManualPage } from './components/Manual/ManualPage';
import { MapSheet } from './components/MapSheet';
import { MobileBar } from './components/MobileBar';
import { NavSign } from './components/NavSign';
import { RouteMap } from './components/RouteMap/RouteMap';
import { Textures } from './components/Textures';
import { Wipe } from './components/Wipe';
import { About } from './pages/About';
import { CaseStudies } from './pages/CaseStudies';
import { Labs } from './pages/Labs';
import { Timetable } from './pages/Timetable';
import { Writing } from './pages/Writing';
import { readCollapsed, writeCollapsed } from './ride/storage';
import { HISTORY_EVENT, currentPath, pushRoute, resetToStart } from './ride/routing';
import { useMedia } from './ride/useMedia';
import { useRide } from './ride/useRide';

const PAGES: ComponentType[] = [About, CaseStudies, Labs, Writing, Timetable];

const MOBILE = '(max-width: 899.98px)';
const MID = '(min-width: 900px) and (max-width: 1199.98px)';
const SIGN_H = 96;
const MAP_H = 900 - SIGN_H;

const titleFor = (i: number) => (i === 0 ? SITE.titleSuffix : `${STATIONS[i].name} · ${SITE.titleSuffix}`);

function initialCollapsed(): boolean {
  if (window.matchMedia(MID).matches) return true;
  return readCollapsed() ?? false;
}

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
  const isMid = useMedia(MID);
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

  const { state, go, toggle, setCollapsed } = useRide({
    initial,
    initialCollapsed: initialCollapsed(),
    reducedMotion: reduced,
    onSwap: (i, push) => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      if (push) pushRoute(STATIONS[i].route);
      document.title = titleFor(i);
      // If focus was inside the old page (e.g. the Next stop sign), it was
      // just unmounted: move it to the new station name.
      requestAnimationFrame(() => {
        const a = document.activeElement;
        if (!a || a === document.body || !a.isConnected) titleRef.current?.focus({ preventScroll: true });
      });
    },
    onArrive: (i) => {
      setAnnounce(`Now at ${STATIONS[i].name}`);
      if (sheetRef.current) window.setTimeout(() => setSheet(false), 350);
    },
  });

  // Deep links: normalise unknown paths, set the first title.
  useEffect(() => {
    if (!isKnownPath(currentPath())) resetToStart();
    document.title = titleFor(initial);
  }, [initial]);

  // Browser back/forward rides the train.
  useEffect(() => {
    const onPop = () => go(stationIndexForPath(currentPath()), { fromHistory: true });
    window.addEventListener(HISTORY_EVENT, onPop);
    return () => window.removeEventListener(HISTORY_EVENT, onPop);
  }, [go]);

  // 900–1199px starts collapsed; wider restores the remembered preference.
  const firstBreakpoint = useRef(true);
  useEffect(() => {
    if (firstBreakpoint.current) {
      firstBreakpoint.current = false;
      return;
    }
    if (isMid) setCollapsed(true);
    else if (!isMobile) setCollapsed(readCollapsed() ?? false);
  }, [isMid, isMobile, setCollapsed]);

  const onToggle = useCallback(() => {
    if (state.moving || state.morph) return;
    writeCollapsed(!state.collapsed);
    setHover(-1);
    toggle();
  }, [state.moving, state.morph, state.collapsed, toggle]);

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
  const wipeColours = byDisc(STATIONS[state.target].lines).map((l) => l.colour);

  return (
    <div className="app" data-layout={isMobile ? 'mobile' : 'desktop'}>
      <Textures />
      {isMobile ? (
        <MobileBar onMap={() => setSheet(true)} mapOpen={sheet} />
      ) : (
        <nav className="routemap" aria-label="Route map" data-c={state.collapsed}>
          <NavSign collapsed={state.collapsed} onToggle={onToggle} />
          <RouteMap ride={state} hover={hover} setHover={setHover} onGo={onGo} scale={mapScale} intro={!reduced} />
        </nav>
      )}

      <main className="content" data-phase={state.phase} data-dir={state.dir}>
        <LineStrip ride={state} onGo={onGo} />
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

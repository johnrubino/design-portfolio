import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { ALSO_LIT, LINE, LINE_IDS, type LineId } from '../content/lines';
import {
  BADGE, BASE_WIDTH, BASE_X, CASE_STUDIES_PILL, CASING, DRAW_ORDER, H, HOME_PILL, HOME_Y, LABEL_X,
  LINE_WIDTH, PPR_LABS_PILL, ROUTES, STOPS, TERMINUS_X, TIMETABLE, W,
} from '../geometry/rail';
import { Icon } from './Icon';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * The rail: a sticky line map on desktop, a strip of line badges on phones.
 *
 * HARD RULE (brief §6): nothing here reads or changes the content column.
 * Hover state lives in this component only, and the preview card is a child
 * of the rail that overlays the content without touching it.
 */
export function Rail() {
  const [active, setActive] = useState<LineId | null>(null);
  /** The card keeps its last content while it fades out. */
  const [shown, setShown] = useState<LineId>('fowa');
  const [pos, setPos] = useState({ top: 8, arrow: 20 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const trainRef = useRef<SVGCircleElement>(null);

  const lit = new Set<LineId>(active ? [active, ...(ALSO_LIT[active] ?? [])] : []);
  /** Class for a map element that belongs to these lines. */
  const ln = (lines: readonly LineId[], extra = '') =>
    ['ln', ...lines.map((l) => `ln-${l}`), extra, lines.some((l) => lit.has(l)) ? 'lit' : ''].filter(Boolean).join(' ');

  const enter = (id: LineId) => {
    setShown(id);
    setActive(id);
  };
  const leave = () => setActive(null);

  // Place the card beside the hovered line end, kept inside the viewport.
  useIsoLayoutEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    const badge = svgRef.current?.querySelector(`[data-stop="${active}"] .badge`);
    if (!active || !wrap || !card || !badge) return;
    const w = wrap.getBoundingClientRect();
    const b = badge.getBoundingClientRect();
    const y = b.top + b.height / 2 - w.top;
    const room = window.innerHeight - w.top;
    const top = Math.min(Math.max(8, y - 30), room - card.offsetHeight - 12);
    setPos({ top, arrow: y - top - 6 });
  }, [active]);

  // The train: a dot that runs from Home along the hovered line. Map only.
  useEffect(() => {
    const train = trainRef.current;
    const path = active && svgRef.current?.querySelector<SVGPathElement>(`#p-${active}`);
    if (!train || !path || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const length = path.getTotalLength();
    const duration = Math.max(900, length * 2.2);
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const u = Math.min(1, ((t - t0) % (duration + 500)) / duration);
      const eased = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const pt = path.getPointAtLength(eased * length);
      train.setAttribute('cx', String(pt.x));
      train.setAttribute('cy', String(pt.y));
      raf = requestAnimationFrame(step);
    };
    train.style.opacity = '1';
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      train.style.opacity = '0';
    };
  }, [active]);

  const card = LINE[shown].card;

  return (
    <nav className="rail" aria-label="System map">
      <div className="rail-head">
        <div className="name">System map</div>
        <div className="tag">Every line and stop</div>
      </div>

      <div className={`map-wrap${active ? ' dim' : ''}`} ref={wrapRef}>
        <svg id="mapsvg" ref={svgRef} viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blur" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="12" />
            </filter>
            {/* Depth: raised markers cast a small shadow down the page. */}
            <filter id="lift" x="-30%" y="-40%" width="160%" height="200%">
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodColor="#000" floodOpacity="0.55" />
            </filter>
            <filter id="glow" x="-80%" y="-40%" width="260%" height="180%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f2efe8" floodOpacity="0.45" />
              <feDropShadow dx="0" dy="1.2" stdDeviation="1.1" floodColor="#000" floodOpacity="0.55" />
            </filter>
            {/* Enamel gloss laid over each badge's flat colour. */}
            <linearGradient id="enamel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.06" />
              <stop offset="0.51" stopColor="#000" stopOpacity="0.04" />
              <stop offset="1" stopColor="#000" stopOpacity="0.14" />
            </linearGradient>
            {/* Raised white capsules: lit from above. */}
            <linearGradient id="capsule" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#ddd8cd" />
            </linearGradient>
            {/* The train: a small glossy bead. */}
            <radialGradient id="bead" cx="0.35" cy="0.3" r="0.75">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.55" stopColor="#f2efe8" />
              <stop offset="1" stopColor="#b9b3a7" />
            </radialGradient>
            {/* Timetable end: a dark socket. */}
            <radialGradient id="socket" cx="0.5" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#2a2a28" />
              <stop offset="1" stopColor="#0e0e0d" />
            </radialGradient>
          </defs>

          {/* Soft glow behind each line end */}
          {LINE_IDS.map((id) => (
            <circle key={id} className={ln([id], 'field')} cx={ROUTES[id].end[0] + 22} cy={ROUTES[id].end[1]} r="22" fill={LINE[id].colour} fillOpacity="0.12" filter="url(#blur)" />
          ))}

          <line className="ln base" x1={BASE_X} y1={HOME_Y} x2={BASE_X} y2={TIMETABLE[1]} strokeWidth={BASE_WIDTH} strokeLinecap="round" />

          {DRAW_ORDER.map((id) => (
            <path key={id} className={ln([id], 'case')} d={ROUTES[id].d} strokeWidth={LINE_WIDTH + CASING} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}
          {DRAW_ORDER.map((id) => (
            <path key={id} id={`p-${id}`} className={ln([id], 'rt')} style={{ '--c': LINE[id].colour } as CSSProperties} d={ROUTES[id].d} stroke={LINE[id].colour} strokeWidth={LINE_WIDTH} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          ))}

          <a href="#home" aria-label="Home, you are here">
            <rect className="pill home-pill" {...rect(HOME_PILL)} rx="10" filter="url(#glow)" />
            <text className="ln t-home" x={LABEL_X + 6} y={HOME_Y + 2}>Home</text>
            <text className="ln t-mono yah" x={LABEL_X + 6} y={HOME_Y + 20}>YOU ARE HERE</text>
          </a>

          <a href="#list" aria-label="Case studies" className={ln(CASE_STUDIES_PILL.lines)}>
            <rect className="pill" {...rect(CASE_STUDIES_PILL)} rx="8" filter="url(#lift)" />
            <text className="t-station" x={LABEL_X + 6} y={171}>Case studies</text>
          </a>

          <g className={ln(PPR_LABS_PILL.lines)}>
            <rect className="pill" {...rect(PPR_LABS_PILL)} rx="8" filter="url(#lift)" />
          </g>

          {STOPS.map((s) => (
            <a key={s.line} href={s.line === 'labs' ? '#stop-labs' : '#stop-write'} aria-label={s.name} className={ln([s.line])}>
              <circle cx={s.at[0]} cy={s.at[1]} r="5.5" fill="url(#capsule)" stroke={LINE[s.line].colour} strokeWidth="3" filter="url(#lift)" />
              <text className="t-station" x={s.at[0] + 16} y={s.at[1] + 5}>{s.name}</text>
            </a>
          ))}

          {LINE_IDS.map((id) => {
            const info = LINE[id];
            const [, y] = ROUTES[id].end;
            const firstLabelY = y + 22 + (id === 'write' ? 16 : 0);
            return (
              <a
                key={id}
                href={info.href}
                {...(info.external ? { target: '_blank', rel: 'noopener' } : {})}
                aria-label={info.external ? `${info.name} (opens in a new tab)` : info.name}
                onMouseEnter={() => enter(id)}
                onMouseLeave={leave}
                onFocus={() => enter(id)}
                onBlur={leave}
              >
                <g className={ln([id, ...(ALSO_LIT[id] ?? [])], 'stop')} data-stop={id}>
                  <rect className="badge" x={TERMINUS_X + 4} y={y - BADGE.h / 2} width={BADGE.w} height={BADGE.h} rx={BADGE.r} fill={info.colour} filter="url(#lift)" />
                  <rect className="sheen" x={TERMINUS_X + 4} y={y - BADGE.h / 2} width={BADGE.w} height={BADGE.h} rx={BADGE.r} fill="url(#enamel)" />
                  <text className="t-mono code" x={TERMINUS_X + 4 + BADGE.w / 2} y={y + 4} textAnchor="middle">{info.code}</text>
                  {id === 'write' && <text className="t-mono kicker" x={LABEL_X} y={y + 22}>LATEST ESSAY</text>}
                  {info.mapLabel.map((row, i) => (
                    <text key={row} className="lbl" x={LABEL_X} y={firstLabelY + i * 16}>{row}</text>
                  ))}
                  <rect className="hit" x={LABEL_X - 8} y={y - 16} width={W - LABEL_X + 8} height={firstLabelY - y + 16 + 36} fill="transparent" />
                </g>
              </a>
            );
          })}

          <a href="#stop-timetable" aria-label="Timetable" className="ln">
            <circle className="end" cx={TIMETABLE[0]} cy={TIMETABLE[1]} r="6" />
            <text className="t-station dimmer" x={TIMETABLE[0] + 16} y={TIMETABLE[1] + 5}>Timetable</text>
          </a>

          <circle id="train" ref={trainRef} r="4" />
        </svg>

        {/* Supplementary preview: the link itself carries the name. */}
        <div
          className={`preview${active ? ' show' : ''}`}
          ref={cardRef}
          aria-hidden="true"
          style={{ top: pos.top, '--ay': `${pos.arrow}px`, '--c': LINE[shown].colour } as CSSProperties}
        >
          <div className="pv-k"><Icon id={LINE[shown].icon} /><span>{card.kind}</span></div>
          <div className="pv-t">{card.title}</div>
          <div className="pv-d">{card.text}</div>
          {card.status && (
            <div className="pv-s"><Icon id={card.status.icon} /><span>{card.status.text}</span></div>
          )}
        </div>
      </div>

      {/* Phones: the map becomes a strip of line badges. */}
      <div className="strip">
        <a href="#home" className="st st-home">Home</a>
        {LINE_IDS.map((id) => (
          <a
            key={id}
            href={LINE[id].href}
            className="st"
            style={{ '--c': LINE[id].colour } as CSSProperties}
            aria-label={`${LINE[id].code}: ${LINE[id].name}${LINE[id].external ? ' (opens in a new tab)' : ''}`}
            {...(LINE[id].external ? { target: '_blank', rel: 'noopener' } : {})}
          >
            {LINE[id].code}
          </a>
        ))}
      </div>
    </nav>
  );
}

const rect = (r: { x: number; y: number; w: number; h: number }) => ({ x: r.x, y: r.y, width: r.w, height: r.h });

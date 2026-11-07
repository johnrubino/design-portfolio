import type { CSSProperties } from 'react';
import { LINES, LINE_WIDTH, LANE, COLLAPSED_LANE } from '../../content/lines';
import { STATIONS } from '../../content/stations';
import { BUILT_LINES, BUILT_STATIONS, MARKER_PATH_C, MARKER_PATH_E, type Marker } from '../../geometry/network';
import type { RideState } from '../../ride/useRide';
import { RIDE_EASE } from '../../ride/timing';
import { MapBase } from './MapBase';
import { Chip } from '../Chip';

export interface RouteMapProps {
  ride: RideState;
  hover: number;
  setHover: (i: number) => void;
  onGo: (i: number) => void;
  /** Uniform scale of the map below the sign (fits short viewports). */
  scale: number;
  /** Play the first-load line draw and fades. */
  intro: boolean;
}

/**
 * The map: schematic plane, lines, station slots, labels and the moving marker.
 * Purely a view of ride state. Everything is laid out in 460 × 900 map space
 * and scaled as one layer, so the marker's offset-path stays aligned.
 */
export function RouteMap({ ride, hover, setHover, onGo, scale, intro }: RouteMapProps) {
  const { collapsed, moving, cur, target, morph, T } = ride;
  const hl = hover >= 0 ? STATIONS[hover].lines : null;
  const leave = () => setHover(-1);

  const markerStyle: CSSProperties = {
    offsetPath: `path('${collapsed ? MARKER_PATH_C : MARKER_PATH_E}')`,
    offsetDistance: `${collapsed ? BUILT_STATIONS[target].dC : BUILT_STATIONS[target].dE}px`,
    opacity: morph ? 0 : 1,
    transition: `offset-distance ${T}ms ${RIDE_EASE}, opacity ${morph ? 0 : 350}ms ease`,
  };

  return (
    <>
    <div className={`map${intro ? ' map--intro' : ''}`} data-c={collapsed} style={{ '--s': scale } as CSSProperties}>
      <div className="map-layer">
        <svg aria-hidden="true" className="map-svg" width="460" height="900" viewBox="0 0 460 900">
          <MapBase />
          <g className="lines" filter="url(#glow)">
            {BUILT_LINES.map((b, i) => (
              <path
                key={b.line.id}
                className="ln"
                pathLength={1}
                d={collapsed ? b.dC : b.dE}
                fill="none"
                stroke={b.line.colour}
                strokeWidth={LINE_WIDTH}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{
                  d: `path('${collapsed ? b.dC : b.dE}')`,
                  opacity: !hl || hl.includes(b.line.id) ? 1 : 0.22,
                  animationDelay: `${200 + i * 90}ms`,
                } as CSSProperties}
              />
            ))}
          </g>
          <g className="stn">
            <g className="exp-only">
              {BUILT_STATIONS.map((s) => (
                <Slot key={s.id} m={s.expanded} h={LANE - 1} />
              ))}
              <LineEnds />
            </g>
            <g className="col-only">
              {BUILT_STATIONS.map((s) => (
                <Slot key={s.id} m={s.collapsed} h={COLLAPSED_LANE - 1} />
              ))}
              {BUILT_LINES.filter((b) => b.line.id !== 'l7').map((b) => (
                <path
                  key={b.line.id}
                  d={`M${b.collapsed[b.collapsed.length - 1].p[0] - 4} ${b.line.collapsedEndY} h8`}
                  stroke="var(--ink)"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          </g>
        </svg>

        <div className="fold exp-only fold-v" />
        <div className="fold fold-h" />

        {!moving && <HereCapsule key={`${cur}-${collapsed}`} m={collapsed ? BUILT_STATIONS[cur].collapsed : BUILT_STATIONS[cur].expanded} />}

        <div className="exp-only labels" inert={collapsed}>
          {STATIONS.map((st, i) => {
            const b = BUILT_STATIONS[i];
            const active = !moving && cur === i;
            const c = b.expanded.capsule;
            const arriving = moving && target === i;
            return (
              <div key={st.id}>
                <button
                  type="button"
                  className="hot"
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={() => onGo(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={leave}
                  style={{ left: c.x, top: c.y, width: c.w + 14, transform: `translate(-50%,-50%) rotate(${c.angle}deg)` }}
                />
                <button
                  type="button"
                  className={`stop stop--${st.label.side}`}
                  data-active={active}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => onGo(i)}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={leave}
                  onFocus={() => setHover(i)}
                  onBlur={leave}
                  style={
                    st.label.side === 'left'
                      ? { right: 460 - st.label.x, top: b.labelY }
                      : { left: st.label.x, top: b.labelY }
                  }
                >
                  <span className="nm">{st.name}</span>
                  <span className="sb">{arriving ? <span className="dash" aria-hidden="true" /> : st.sub}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="mover" style={markerStyle}>
          <b />
        </div>
      </div>
    </div>
    {/* Collapsed-mode targets live outside the clipped map so their signs can hang over the content. */}
    <div className="map-tips" style={{ '--s': scale } as CSSProperties}>
      <div className="map-layer">
        <div className="col-only" inert={!collapsed}>
          {STATIONS.map((st, i) => {
            const active = !moving && cur === i;
            return (
              <button
                key={st.id}
                type="button"
                className="hotc"
                aria-label={st.name}
                aria-current={active ? 'page' : undefined}
                onClick={() => onGo(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={leave}
                onFocus={() => setHover(i)}
                onBlur={leave}
                style={{ top: st.collapsedY }}
              >
                <span className="tip" aria-hidden="true">
                  {st.name}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
    </>
  );
}

/** Station slot: a hollow pill across the stopping lanes, with a tick on each line that stops. */
function Slot({ m, h }: { m: Marker; h: number }) {
  const c = m.capsule;
  return (
    <g>
      <rect
        x={-c.w / 2}
        y={-h / 2}
        width={c.w}
        height={h}
        rx={h / 2}
        fill="var(--slot)"
        stroke="var(--ink)"
        strokeWidth={1.5}
        transform={`translate(${c.x} ${c.y}) rotate(${c.angle})`}
      />
      {m.dots.map((d) => (
        <circle key={d.line} cx={d.x} cy={d.y} r={1.9} fill="var(--ink)" />
      ))}
    </g>
  );
}

function HereCapsule({ m }: { m: Marker }) {
  const c = m.capsule;
  return (
    <span
      aria-hidden="true"
      className="here"
      style={{ left: c.x, top: c.y, width: c.w, transform: `translate(-50%,-50%) rotate(${c.angle}deg)` }}
    >
      <span className="here-pulse" />
    </span>
  );
}

/** Line ends: a short ink tick across the line, the line chip and the project name. */
function LineEnds() {
  return (
    <g>
      {BUILT_LINES.filter((b) => b.line.id !== 'l7').map((b) => {
        const [x, y] = b.end;
        const south = b.endDir[1] > 0.5;
        const line = LINES.find((l) => l.id === b.line.id)!;
        const tick = south ? `M${x - 6} ${y} h12` : `M${x} ${y - 6} v12`;
        const chip = south ? { x: x - 10, y: y + 8 } : { x: x + 8, y: y - 10 };
        const label = south ? { x: x - 16, y: y + 22 } : { x: x - 2, y: y - 10 };
        return (
          <g key={line.id}>
            <path d={tick} stroke="var(--ink)" strokeWidth={1.5} />
            <svg x={chip.x} y={chip.y} width={20} height={20} overflow="visible">
              <Chip line={line.id} size={20} />
            </svg>
            <text x={label.x} y={label.y} textAnchor="end" fontWeight={500} fontSize={10.5} fill="var(--ink)" className="signage">
              {line.short}
            </text>
          </g>
        );
      })}
    </g>
  );
}

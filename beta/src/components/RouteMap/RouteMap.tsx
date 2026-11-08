import type { CSSProperties } from 'react';
import { LINES, LINE_WIDTH } from '../../content/lines';
import { STATIONS } from '../../content/stations';
import { BUILT_LINES, BUILT_STATIONS, MARKER_PATH_C, MARKER_PATH_E, type Marker } from '../../geometry/network';
import type { RideState } from '../../ride/useRide';
import { RIDE_EASE } from '../../ride/timing';
import { MapBase } from './MapBase';
import { Disc } from '../Disc';

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
          <g className="lines">
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
                <StationDots key={s.id} m={s.expanded} />
              ))}
              <LineEnds />
            </g>
            <g className="col-only">
              {BUILT_STATIONS.map((s) => (
                <StationDots key={s.id} m={s.collapsed} />
              ))}
              {BUILT_LINES.filter((b) => b.line.id !== 'l7').map((b) => (
                <circle
                  key={b.line.id}
                  cx={b.collapsed[b.collapsed.length - 1].p[0]}
                  cy={b.line.collapsedEndY}
                  r={3.2}
                  fill="var(--ink)"
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

/** Vignelli station marker: a black dot on each line that stops, joined by a short black bar. */
function StationDots({ m }: { m: Marker }) {
  return (
    <g>
      <line x1={m.bar[0][0]} y1={m.bar[0][1]} x2={m.bar[1][0]} y2={m.bar[1][1]} stroke="var(--ink)" strokeWidth={3} strokeLinecap="round" />
      {m.dots.map((d) => (
        <circle key={d.line} cx={d.x} cy={d.y} r={3.6} fill="var(--ink)" stroke="#fff" strokeWidth={1.2} />
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

/** Line ends: a black end dot, the numbered route disc and the project name. */
function LineEnds() {
  return (
    <g>
      {BUILT_LINES.filter((b) => b.line.id !== 'l7').map((b) => {
        const [x, y] = b.end;
        const south = b.endDir[1] > 0.5;
        const west = b.endDir[0] < -0.5;
        const line = LINES.find((l) => l.id === b.line.id)!;
        const disc = south ? { x: x - 9, y: y + 6 } : west ? { x: x - 24, y: y - 9 } : { x: x + 6, y: y - 9 };
        const label = line.endLabel
          ? { x: x + line.endLabel.dx, y: y + line.endLabel.dy, anchor: line.endLabel.anchor }
          : south
            ? { x: x - 14, y: y + 19, anchor: 'end' as const }
            : west
              ? { x: x - 28, y: y + 4, anchor: 'end' as const }
              : { x: x - 2, y: y - 9, anchor: 'end' as const };
        return (
          <g key={line.id}>
            <circle cx={x} cy={y} r={3.2} fill="var(--ink)" />
            <svg x={disc.x} y={disc.y} width={18} height={18} overflow="visible">
              <Disc line={line.id} size={18} />
            </svg>
            <text x={label.x} y={label.y} textAnchor={label.anchor} fontWeight={500} fontSize={10.5} fill="var(--ink)" className="signage">
              {line.short}
            </text>
          </g>
        );
      })}
    </g>
  );
}

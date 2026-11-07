import type { CSSProperties } from 'react';
import { LINES } from '../../content/lines';
import { STATIONS } from '../../content/stations';
import { BUILT_LINES, BUILT_STATIONS, TRAIN_PATH_C, TRAIN_PATH_E, type Marker } from '../../geometry/network';
import type { RideState } from '../../ride/useRide';
import { RIDE_EASE } from '../../ride/timing';
import { MapBase } from './MapBase';

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
 * The route map: land, lines, station markers, labels and the train.
 * Purely a view of ride state. Everything is laid out in 460 × 900 map space
 * and scaled as one layer, so the train's offset-path stays aligned.
 */
export function RouteMap({ ride, hover, setHover, onGo, scale, intro }: RouteMapProps) {
  const { collapsed, moving, cur, target, morph, T } = ride;
  const hl = hover >= 0 ? STATIONS[hover].lines : null;
  const leave = () => setHover(-1);

  const trainStyle: CSSProperties = {
    offsetPath: `path('${collapsed ? TRAIN_PATH_C : TRAIN_PATH_E}')`,
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
          {/* Colour lines: offset ~1px from the ink, like a slightly misregistered print. */}
          <g filter="url(#riso)" transform="translate(1.2 -0.8)" className="lines">
            {BUILT_LINES.map((b, i) => (
              <path
                key={b.line.id}
                className="ln"
                pathLength={1}
                d={collapsed ? b.dC : b.dE}
                fill="none"
                stroke={b.line.colour}
                strokeWidth={8}
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
                <MarkerDots key={s.id} m={s.expanded} />
              ))}
              <LineEnds />
            </g>
            <g className="col-only">
              {BUILT_STATIONS.map((s) => (
                <MarkerDots key={s.id} m={s.collapsed} />
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
            const sub = active ? 'You are here' : moving && target === i ? 'Arriving' : st.sub;
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
                  <span className="sb">{sub}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="train" style={trainStyle}>
          <i />
          <i />
          <i />
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

function MarkerDots({ m }: { m: Marker }) {
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

/** Black end dot, coloured route disc and project name at each terminus. */
function LineEnds() {
  return (
    <g>
      {BUILT_LINES.filter((b) => b.line.id !== 'l7').map((b) => {
        const [x, y] = b.end;
        const south = b.endDir[1] > 0.5;
        const disc = south ? [x, y + 15] : [x + 15, y];
        const label = south ? { x: x - 12, y: y + 4 } : { x: x + 2, y: y - 9 };
        const line = LINES.find((l) => l.id === b.line.id)!;
        return (
          <g key={line.id}>
            <circle cx={x} cy={y} r={3.2} fill="var(--ink)" />
            <circle cx={disc[0]} cy={disc[1]} r={9} fill={line.colour} />
            <text x={disc[0]} y={disc[1] + 3.6} textAnchor="middle" fontWeight={600} fontSize={10.5} fill={line.ink}>
              {line.disc}
            </text>
            <text x={label.x} y={label.y} textAnchor="end" fontWeight={500} fontSize={10.5} fill="var(--ink)">
              {line.name}
            </text>
          </g>
        );
      })}
    </g>
  );
}

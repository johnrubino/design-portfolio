import { byOrder } from '../content/lines';
import { STATIONS } from '../content/stations';
import { STRIP_X } from '../geometry/network';
import type { RideState } from '../ride/useRide';
import { RIDE_EASE } from '../ride/timing';
import { Arrow } from './Arrow';
import { Disc } from './Disc';

/**
 * The page rail at the top of the content: the five pages as stops on a
 * thin rail. The capsule marker slides with the same T and easing as the
 * map marker.
 */
export function LineStrip({ ride, onGo }: { ride: RideState; onGo: (i: number) => void }) {
  const { cur, target, moving, T } = ride;
  const last = STATIONS.length - 1;
  return (
    <nav className="strip" aria-label="Pages">
      {/* The glass bar stays put; on small screens this inner layer scrolls sideways. */}
      <div className="strip-scroll">
      <div className="strip-in">
        <span className="st-rail" />
        {STATIONS.map((st, i) => {
          const active = !moving && cur === i;
          const align = i === 0 ? 'start' : i === last ? 'end' : 'mid';
          return (
            <div key={st.id}>
              <span className="st-stop" style={{ left: `${STRIP_X[i]}%` }} />
              <button
                type="button"
                className={`st-lab st-lab--${align} signage`}
                data-active={active}
                aria-current={active ? 'page' : undefined}
                onClick={() => onGo(i)}
                style={{ left: `${STRIP_X[i]}%` }}
              >
                {st.name}
              </button>
              <span className={`st-tr st-tr--${align}`} style={{ left: `${STRIP_X[i]}%` }}>
                {byOrder(st.lines).map((l) => (
                  <Disc key={l.id} line={l.id} size={13} />
                ))}
              </span>
            </div>
          );
        })}
        <span className="st-here" style={{ left: `${STRIP_X[target]}%`, transition: `left ${T}ms ${RIDE_EASE}` }}>
          <b />
        </span>
        {moving && (
          <span className="st-status" aria-hidden="true">
            <Arrow size={11} />
            {STATIONS[target].name}
          </span>
        )}
      </div>
      </div>
    </nav>
  );
}

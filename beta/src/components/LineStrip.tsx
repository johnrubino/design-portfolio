import { byDisc } from '../content/lines';
import { STATIONS } from '../content/stations';
import { STRIP_X } from '../geometry/network';
import type { RideState } from '../ride/useRide';
import { RIDE_EASE } from '../ride/timing';
import { Disc } from './Disc';

/**
 * The line map inside the train (NYCTA Graphics Standards Manual, p. 76).
 * The orange marker slides with the same T and easing as the map train.
 */
export function LineStrip({ ride, onGo }: { ride: RideState; onGo: (i: number) => void }) {
  const { cur, target, moving, T } = ride;
  return (
    <nav className="strip" aria-label="Stations">
      <div className="strip-in">
        <span className="st-e st-e1" aria-hidden="true">7</span>
        <span className="st-e st-e2" aria-hidden="true">7</span>
        <span className="st-band" />
        {STATIONS.map((st, i) => {
          const active = !moving && cur === i;
          return (
            <div key={st.id}>
              <span className="st-dot" style={{ left: `${STRIP_X[i]}%` }} />
              <button
                type="button"
                className="st-lab"
                data-active={active || (!moving && ride.page === i)}
                aria-current={active ? 'page' : undefined}
                onClick={() => onGo(i)}
                style={{ left: `calc(${STRIP_X[i]}% - 2px)` }}
              >
                {st.name}
              </button>
              <span className="st-tr" style={{ left: `${STRIP_X[i]}%` }}>
                {byDisc(st.lines).map((l) => (
                  <Disc key={l.id} line={l.id} size={13} fontSize={8} />
                ))}
              </span>
            </div>
          );
        })}
        <span
          className="st-here"
          style={{ left: `${STRIP_X[target]}%`, transition: `left ${T}ms ${RIDE_EASE}` }}
        />
        {moving && (
          <span className="st-status" aria-hidden="true">
            <span className="blink" />
            Next stop · {STATIONS[target].name}
          </span>
        )}
      </div>
    </nav>
  );
}

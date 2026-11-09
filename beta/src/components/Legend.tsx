import type { CSSProperties } from 'react';
import { LINE, LINE_IDS } from '../content/lines';
import { Icon } from './Icon';

/** "The lines": one row per line. Badges read from the same data as the map, so they always match. */
export function Legend({ heading }: { heading: string }) {
  return (
    <>
      <h2 className="sec" id="h-lines">{heading}</h2>
      <ul className="legend" aria-labelledby="h-lines">
        {LINE_IDS.map((id) => {
          const l = LINE[id];
          return (
            <li key={id}>
              <a
                className="lg"
                href={l.href}
                style={{ '--c': l.colour } as CSSProperties}
                {...(l.external ? { target: '_blank', rel: 'noopener' } : {})}
              >
                <i className="sw" />
                <span className="lg-c"><b className="rb">{l.code}</b></span>
                <span className="lg-d">{l.legend}</span>
                <span className="swap">
                  <Icon id={l.icon} className="a" />
                  <Icon id="arrow" className="b" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </>
  );
}

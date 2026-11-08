import type { ReactNode, RefObject } from 'react';
import { SITE } from '../../content/site';
import { STATIONS } from '../../content/stations';
import { LINE_BY_ID } from '../../content/lines';
import { Disc } from '../Disc';
import { Reveal } from './Reveal';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Shared page layout: station-sign header, body (children) and footer.
 */
export function ManualPage({
  index,
  titleRef,
  children,
}: {
  index: number;
  titleRef: RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  const st = STATIONS[index];

  return (
    <div className="page">
      {/* Page header: the station sign — the line's disc, then a dark plate
          with the line and the page name. */}
      <header className="psign">
        <span className="sg-chip">
          <Disc line={st.mainLine} size={96} />
        </span>
        <span className="sg-p">
          <span className="sg-l">
            <span className="sg-k">
              Line {LINE_BY_ID[st.mainLine].order} · {LINE_BY_ID[st.mainLine].name}
            </span>
            <h1 className="psign-n signage" tabIndex={-1} ref={titleRef}>
              <span className="ttl-in">{st.plate ?? st.name}</span>
            </h1>
          </span>
        </span>
      </header>

      {children}

      <Reveal i={9} className="foot">
        <footer className="mf">
          <span>{SITE.name}</span>
          <span>{SITE.role}</span>
          <span>{SITE.domain}</span>
          <span className="mono">{pad(index + 1)} / {pad(STATIONS.length)}</span>
        </footer>
      </Reveal>
    </div>
  );
}

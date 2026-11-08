import type { MouseEvent, ReactNode, RefObject } from 'react';
import { SITE } from '../../content/site';
import { STATIONS } from '../../content/stations';
import { LINE_BY_ID } from '../../content/lines';
import { hrefFor } from '../../ride/routing';
import { Arrow } from '../Arrow';
import { Disc } from '../Disc';
import { Reveal } from './Reveal';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Shared page layout: page-name plate, body (children), Next sign and footer.
 */
export function ManualPage({
  index,
  onGo,
  titleRef,
  children,
}: {
  index: number;
  onGo: (i: number) => void;
  titleRef: RefObject<HTMLHeadingElement | null>;
  children: ReactNode;
}) {
  const st = STATIONS[index];
  const last = index === STATIONS.length - 1;
  const nextIndex = last ? 0 : index + 1;
  const next = STATIONS[nextIndex];

  const follow = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    onGo(nextIndex);
  };

  return (
    <div className="page">
      {/* Page header: the station sign, in the same form as the Next sign —
          the line's disc, then a dark plate with the line and the page name. */}
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
        <a className="sign" href={hrefFor(next.route)} onClick={follow}>
          <span className="sg-chip">
            <Disc line={next.mainLine} size={96} />
          </span>
          <span className="sg-p">
            <span className="sg-l">
              <span className="sg-k">{last ? 'Back to start' : 'Next'}</span>
              <span className="sg-n signage">{next.name}</span>
            </span>
            <Arrow size={40} colour="var(--on-ink)" />
          </span>
        </a>
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

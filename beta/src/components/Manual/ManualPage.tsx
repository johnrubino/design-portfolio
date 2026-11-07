import type { MouseEvent, ReactNode, RefObject } from 'react';
import { byOrder } from '../../content/lines';
import { SITE } from '../../content/site';
import { STATIONS } from '../../content/stations';
import { hrefFor } from '../../ride/routing';
import { Arrow } from '../Arrow';
import { Chip } from '../Chip';
import { Reveal } from './Reveal';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Shared page layout: header row, page-name plate, body (children),
 * Next sign and footer.
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
  const lines = byOrder(st.lines);
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
      <Reveal i={0} className="mh">
        <span className="mh-b">
          <span className="mono mh-n">{pad(index + 1)} / {pad(STATIONS.length)}</span>
          <span className="signage">{st.name}</span>
        </span>
        <ul className="mh-legend" aria-label="Lines on this page">
          {lines.map((l) => (
            <li key={l.id}>
              <Chip line={l.id} size={20} />
              <span>{l.name}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <h1 className="ttl signage" tabIndex={-1} ref={titleRef}>
        <span className="ttl-in">{st.name}</span>
      </h1>

      {children}

      <Reveal i={9} className="foot">
        <a className="sign" href={hrefFor(next.route)} onClick={follow}>
          <span className="sg-chip">
            <Chip line={next.mainLine} size={96} />
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

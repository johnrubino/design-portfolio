import type { MouseEvent, ReactNode, RefObject } from 'react';
import { byDisc, LINE_BY_ID } from '../../content/lines';
import { SITE } from '../../content/site';
import { STATIONS } from '../../content/stations';
import { Disc } from '../Disc';
import { NycArrow } from '../NycArrow';
import { Reveal } from './Reveal';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The "manual page" grammar shared by every station: header row, station ID
 * plate, body (children), Next stop sign and footer.
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
  const lines = byDisc(st.lines);
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
          Station {pad(index + 1)}
          <br />
          {st.name}
        </span>
        <span className="mh-d">
          {lines.map((l) => (
            <Disc key={l.id} line={l.id} size={20} fontSize={10} />
          ))}
        </span>
        <span>Served by {lines.map((l) => l.name).join(', ')}.</span>
      </Reveal>

      <h1 className="ttl" tabIndex={-1} ref={titleRef}>
        <span className="ttl-in">{st.name}</span>
      </h1>

      {children}

      <Reveal i={9} className="foot">
        <a className="sign" href={next.route} onClick={follow}>
          <span className="sg-disc" style={{ background: LINE_BY_ID[next.mainLine].colour, color: LINE_BY_ID[next.mainLine].ink }} aria-hidden="true">
            {LINE_BY_ID[next.mainLine].disc}
          </span>
          <span className="sg-p">
            <span className="sg-l">
              <span className="sg-k">{last ? 'End of the line' : 'Next stop'}</span>
              <span className="sg-n">{last ? `Back to ${next.name}` : next.name}</span>
            </span>
            <NycArrow size={44} colour="#F3E8D3" />
          </span>
        </a>
        <footer className="mf">
          <span>{SITE.authority}</span>
          <span>
            {SITE.manual}
            <br />
            {SITE.year}
          </span>
          <span>
            {SITE.name}
            <br />
            {SITE.role}
          </span>
          <span>
            {st.name}
            <br />
            Page {pad(index + 1)}
          </span>
        </footer>
      </Reveal>
    </div>
  );
}

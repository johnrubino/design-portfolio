import type { ReactNode, RefObject } from 'react';
import { SITE } from '../../content/site';
import { STATIONS } from '../../content/stations';
import { LINE_BY_ID } from '../../content/lines';
import { Arrow } from '../Arrow';
import { Disc } from '../Disc';
import { Reveal } from './Reveal';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Shared page layout: direction-sign header, body (children) and footer.
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
  const prev = index > 0 ? STATIONS[index - 1] : null;
  const next = index < STATIONS.length - 1 ? STATIONS[index + 1] : null;

  return (
    <div className="page">
      {/* Page header: a direction sign after the 1970 standards manual — a black
          band over a row of square modules: back arrow, page name, line disc,
          forward arrow. The arrows ride to the previous / next page. At either
          end of the route the arrow module is left blank. */}
      <header className="dsign">
        <div className="ds-row">
          {prev ? (
            <button
              type="button"
              className="ds-m ds-arrow ds-prev"
              onClick={() => onGo(index - 1)}
              aria-label={`Previous page: ${prev.name}`}
              title={prev.name}
            >
              <Arrow size={52} weight={16} colour="var(--ink)" />
            </button>
          ) : (
            <span className="ds-m ds-blank" aria-hidden="true" />
          )}
          <div className="ds-m ds-title">
            <h1 className="ds-name signage" tabIndex={-1} ref={titleRef}>
              <span className="ttl-in">{st.plate ?? st.name}</span>
            </h1>
          </div>
          <span className="ds-m ds-disc">
            <Disc line={st.mainLine} size={64} />
          </span>
          {next ? (
            <button
              type="button"
              className="ds-m ds-arrow ds-next"
              onClick={() => onGo(index + 1)}
              aria-label={`Next page: ${next.name}`}
              title={next.name}
            >
              <Arrow size={52} weight={16} colour="var(--ink)" />
            </button>
          ) : (
            <span className="ds-m ds-blank" aria-hidden="true" />
          )}
        </div>
      </header>
      <p className="ds-cap mono">
        Line {LINE_BY_ID[st.mainLine].order} · {LINE_BY_ID[st.mainLine].name}
      </p>

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

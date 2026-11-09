import type { CSSProperties } from 'react';
import { STOP_LIST as C, type StopRow } from '../content/home';
import { LINE } from '../content/lines';
import { SITE } from '../content/site';
import { Icon } from './Icon';

const GREY = '#8a867f';

/** "Every stop": the same map as a list, grouped by line. The rail's in-page links land on these rows. */
export function StopList() {
  return (
    <section id="list" className="stone" aria-labelledby="h-list">
      <div className="lh">
        <div>
          <h2 id="h-list">{C.title}</h2>
          <p>{C.intro}</p>
        </div>
        {/* Static, as in the reference. See TODO(john) in content/home.ts. */}
        <div className="toggle" aria-hidden="true">
          <span>{C.toggle[0]}</span>
          <span className="on">{C.toggle[1]}</span>
        </div>
      </div>

      <div className="cols">
        {C.groups.map((g) => (
          <div key={g.title} className="grp">
            <h3>
              <span className="lines">
                {g.lines.map((l) => <i key={l} style={{ background: LINE[l].colour }} />)}
              </span>
              {g.title}
            </h3>
            <ul>{g.rows.map(row)}</ul>
          </div>
        ))}
      </div>

      <div className="lfoot"><span>{SITE.footer}</span><span>{C.footRight}</span></div>
    </section>
  );
}

function row(r: StopRow, n: number) {
  const style = { '--c': r.line ? LINE[r.line].colour : GREY } as CSSProperties;
  const body = (
    <>
      <span className="li-i"><Icon id={r.icon} /></span>
      <span>
        <span className="li-t">{r.title}</span>
        <span className="li-s">
          {r.subIcon && <Icon id={r.subIcon} className="st" />}
          {r.sub}
        </span>
      </span>
      {r.href && <span className="li-go"><Icon id="arrow" /></span>}
    </>
  );
  return (
    <li key={n} id={r.id}>
      {r.href ? (
        <a className="li" style={style} href={r.href} target="_blank" rel="noopener">{body}</a>
      ) : (
        <div className="li" style={style}>{body}</div>
      )}
    </li>
  );
}

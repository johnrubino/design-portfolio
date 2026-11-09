import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react';
import { HOW_I_AI as C, type Proof } from '../content/home';
import { SITE } from '../content/site';
import { Icon } from './Icon';

const i = (n: number) => ({ '--i': n }) as CSSProperties;

/** Dark section after the hero: what John thinks about AI, and what he has done with it. */
export function HowIAI() {
  const [tools, setTools] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Scroll reveal: items fade and rise as they enter the viewport.
  useEffect(() => {
    const items = ref.current?.querySelectorAll('.rv');
    if (!items) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.15 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const essay = SITE.latestEssay;

  return (
    <section id="howai" aria-labelledby="howai-h" ref={ref}>
      <div className="ai-l">
        <div className="ai-k rv">{C.label}<span className="ph3">{C.tag}</span></div>
        <h2 id="howai-h" className="rv">{C.title}</h2>
        <p className="ai-lead rv">{C.quote}</p>
        <p className="ai-cite rv">
          From <a className="tl" href={essay.url} target="_blank" rel="noopener">{essay.title}</a> · {essay.date}
        </p>

        <h3 className="ai-lab rv">{C.thinkHeading}</h3>
        <ol className="pps">
          {C.principles.map((p, n) => (
            <li key={p.lead} className="pp rv" style={i(n)}>
              <span className="pp-t">{p.lead}</span>
              <span className="pp-d">{p.text}</span>
              <a className="pp-l" href={p.link.href} target="_blank" rel="noopener">
                {p.link.text}
                <Icon id="arrow" />
              </a>
            </li>
          ))}
        </ol>

        <div className="ai-more rv">
          <button type="button" className="tools-b" aria-expanded={tools} aria-controls="tools" onClick={() => setTools((v) => !v)}>
            {C.toolsToggle}
          </button>
          <a className="tl" href={C.allEssays.href} target="_blank" rel="noopener">{C.allEssays.text}</a>
        </div>
        <div className={`xw tools${tools ? ' open' : ''}`} id="tools" inert={!tools}>
          <div className="xi">
            <p className="tools-p">
              {C.tools.map((t) => (
                <Fragment key={t.text}>
                  <a className="tl" href={t.href} target="_blank" rel="noopener">{t.text}</a>
                  {' · '}
                </Fragment>
              ))}
              <span className="slot">{C.toolsSlot}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="ai-r">
        <h3 className="ai-lab rv">{C.doneHeading}</h3>
        <div className="acs">
          {C.cards.map((card, n) => (
            <article key={card.title} className="ac rv" style={i(n)}>
              <i className="node" aria-hidden="true" />
              <div className="ac-h">
                <h4>{card.title}</h4>
                <p>{card.summary}</p>
              </div>
              <ul>{card.proof.map(proof)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function proof(p: Proof, n: number) {
  if ('slot' in p) {
    return <li key={n} className="pf slot"><span>{p.slot}</span></li>;
  }
  return (
    <li key={n} className="pf" style={{ '--u': `var(--${p.line})` } as CSSProperties}>
      <a href={p.href} target="_blank" rel="noopener">{p.text}</a>
    </li>
  );
}

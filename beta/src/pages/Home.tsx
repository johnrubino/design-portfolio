import { useState } from 'react';
import { CASES_INTRO, CASE_STUDIES, WALKTHROUGH_COPY } from '../content/caseStudies';
import { HOME } from '../content/home';
import { LINKS } from '../content/site';
import { Arrow } from '../components/Arrow';
import { Reveal } from '../components/Manual/Reveal';
import { StopMark } from '../components/StopMark';
import { WalkthroughDialog } from '../components/WalkthroughDialog';

/** Home: intro, current roles, selected work (the Work line's stops) and the call to action. */
export function Home() {
  const [project, setProject] = useState<string | null>(null);
  return (
    <>
      <Reveal i={3} as="p" className="lede">{HOME.lede}</Reveal>

      <Reveal i={4} as="dl" className="stats">
        {HOME.stats.map((s) => (
          <div key={s.label}>
            <dt className="mono">{s.label}</dt>
            <dd>{s.value}</dd>
          </div>
        ))}
      </Reveal>

      <Reveal i={5} as="section" className="sec" aria-labelledby="h-current">
        <h2 className="sec-h mono" id="h-current">{HOME.currentHeading}</h2>
        <ul className="rows">
          {HOME.current.map((c) => (
            <li key={c.name} className="row row-cur">
              <div className="mono r-m lab-n">{c.role}</div>
              <div>
                <h3 className="r-t">{c.name}</h3>
                <p className="r-d">{c.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal i={6} as="section" className="sec" aria-labelledby="h-work">
        <h2 className="sec-h mono" id="h-work">{HOME.workHeading}</h2>
        <p className="body">{CASES_INTRO}</p>
        <ul className="rows">
          {CASE_STUDIES.map((c) => (
            <li key={c.slug} id={`project-${c.slug}`} className="row">
              <span><StopMark line="work" /></span>
              <div>
                <h3 className="r-t">{c.title}</h3>
                <div className="mono r-m">{c.meta}</div>
                <p className="r-d">{c.summary}</p>
              </div>
              <button type="button" className="r-a" onClick={() => setProject(c.title)} aria-label={`${WALKTHROUGH_COPY.cta}: ${c.title}`}>
                {WALKTHROUGH_COPY.cta}
                <Arrow size={12} colour="currentColor" />
              </button>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal i={7} as="section" className="sec cta" aria-labelledby="h-cta">
        <h2 className="cta-h" id="h-cta">{HOME.cta.heading}</h2>
        <p className="body">{HOME.cta.body}</p>
        <a className="sub" href={LINKS.email}>
          {HOME.cta.link}
          <Arrow size={13} colour="currentColor" />
        </a>
      </Reveal>

      <WalkthroughDialog project={project} onClose={() => setProject(null)} />
    </>
  );
}

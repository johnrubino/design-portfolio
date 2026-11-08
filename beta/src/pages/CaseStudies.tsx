import { useState } from 'react';
import { CASES_INTRO, CASE_STUDIES, WALKTHROUGH_COPY } from '../content/caseStudies';
import { StopMark } from '../components/StopMark';
import { Arrow } from '../components/Arrow';
import { Reveal } from '../components/Manual/Reveal';
import { WalkthroughDialog } from '../components/WalkthroughDialog';

export function CaseStudies() {
  const [project, setProject] = useState<string | null>(null);
  return (
    <>
      <Reveal i={3} as="p" className="body">{CASES_INTRO}</Reveal>
      <Reveal i={4} as="ul" className="rows">
        {CASE_STUDIES.map((c) => (
          <li key={c.title} id={`project-${c.slug}`} className="row">
            <span><StopMark line="cs" /></span>
            <div>
              <h2 className="r-t">{c.title}</h2>
              <div className="mono r-m">{c.meta}</div>
              <p className="r-d">{c.summary}</p>
            </div>
            <button type="button" className="r-a" onClick={() => setProject(c.title)} aria-label={`${WALKTHROUGH_COPY.cta}: ${c.title}`}>
              {WALKTHROUGH_COPY.cta}
              <Arrow size={12} colour="currentColor" />
            </button>
          </li>
        ))}
      </Reveal>
      <WalkthroughDialog project={project} onClose={() => setProject(null)} />
    </>
  );
}

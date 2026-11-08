import { LABS, LABS_INTRO } from '../content/labs';
import { Reveal } from '../components/Manual/Reveal';
import { StopMark } from '../components/StopMark';

/** Labs: the Labs line's stops. */
export function Labs() {
  return (
    <>
      <Reveal i={3} as="p" className="body">{LABS_INTRO}</Reveal>
      <Reveal i={4} as="ul" className="rows">
        {LABS.map((lab) => (
          <li key={lab.slug} id={`project-${lab.slug}`} className="row row-lab">
            <span><StopMark line="labs" /></span>
            <div>
              <h2 className="r-t">{lab.title}</h2>
              <p className="r-d">{lab.summary}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </>
  );
}

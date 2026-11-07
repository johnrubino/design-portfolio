import { LABS, LABS_INTRO } from '../content/labs';
import { Reveal } from '../components/Manual/Reveal';

export function Labs() {
  return (
    <>
      <Reveal i={3} as="p" className="body">{LABS_INTRO}</Reveal>
      <Reveal i={4} as="ul" className="rows">
        {LABS.map((lab, n) => (
          <li key={lab.title} className="row row-s">
            <div className="mono r-m lab-n">Lab {String(n + 1).padStart(2, '0')}</div>
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

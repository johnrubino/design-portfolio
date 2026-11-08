import { ABOUT } from '../content/about';
import { Reveal } from '../components/Manual/Reveal';

export function About() {
  return (
    <>
      <Reveal i={3} as="p" className="lede">{ABOUT.lede}</Reveal>
      <Reveal i={4} as="p" className="body">{ABOUT.body}</Reveal>
      <Reveal i={5} as="ul" className="rows">
        {ABOUT.sections.map((s) => (
          <li key={s.title} className="row row-text">
            <div>
              <h2 className="r-t">{s.title}</h2>
              <p className="r-d r-d-wide">{s.body}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </>
  );
}

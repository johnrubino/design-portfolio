import { LINKS } from '../content/site';
import { POSTS, SUBSTACK_CTA, WRITING_INTRO } from '../content/writing';
import { Arrow } from '../components/Arrow';
import { Reveal } from '../components/Manual/Reveal';

export function Writing() {
  return (
    <>
      <Reveal i={3} as="p" className="body">{WRITING_INTRO}</Reveal>
      <Reveal i={4} as="ul" className="posts">
        {POSTS.map((p) => (
          <li key={p.title}>
            <a className="post" href={p.url} target="_blank" rel="noopener">
              <span className="p-t">{p.title}</span>
              <span className="mono r-m">{p.date}</span>
            </a>
          </li>
        ))}
      </Reveal>
      <Reveal i={5} as="a" className="sub" href={LINKS.substack} target="_blank" rel="noopener">
        {SUBSTACK_CTA}
        <Arrow size={13} colour="currentColor" />
      </Reveal>
    </>
  );
}

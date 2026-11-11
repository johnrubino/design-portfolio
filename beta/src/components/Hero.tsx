import headshot from '../assets/headshot.webp';
import { GREETINGS, HERO, INTRO } from '../content/home';
import { SITE } from '../content/site';
import { Currently } from './Currently';
import { ExpandText, Greeting } from './ExpandText';

/** Hero: greeting and intro with the name inline and expanding words, then "Currently shipping for". */
export function Hero() {
  return (
    <section className="screen stone" id="home" aria-labelledby="h-name">
      <div className="content">
        <div className="hero">
          {/* Intro: spans the hero, up to a readable width. Expanding paragraphs grow below it. */}
          <div className="hero-top">
            <div className="eyebrow" />
            {/* The name is in the first sentence; this heading names the page for screen readers and search. */}
            <h1 id="h-name" className="sr-only">{SITE.name}</h1>
            <Greeting greetings={GREETINGS} />
            <ExpandText paragraphs={INTRO} portrait={headshot} />
          </div>

          <Currently />

        </div>

        <div className="foot"><span>{SITE.footer}</span><span>{HERO.footRight}</span></div>
      </div>
    </section>
  );
}

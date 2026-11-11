import fowa from '../assets/file-text-fowa.webp';
import fpl from '../assets/file-text-fpl.webp';
import ppr from '../assets/file-text-ppr.webp';
import headshot from '../assets/headshot.webp';
import { GREETINGS, HERO, INTRO } from '../content/home';
import { SITE } from '../content/site';
import { Currently } from './Currently';
import { ExpandText, Greeting } from './ExpandText';
import { Icon } from './Icon';

/** Hero: greeting and intro with the name inline and expanding words, "Currently shipping for", then the case-studies key. */
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

          <div className="hero-r">
            <a className="continue" href={HERO.continueHref}>
              <span>
                <span className="kicker">{HERO.continueKicker}</span>
                <span className="dest">{HERO.continueDest}</span>
              </span>
              <span className="fan" aria-hidden="true">
                <img src={fowa} alt="" width="40" height="40" decoding="async" />
                <img src={fpl} alt="" width="40" height="40" decoding="async" />
                <img src={ppr} alt="" width="40" height="40" decoding="async" />
              </span>
              <span className="arrow"><Icon id="arrow" /></span>
            </a>
          </div>
        </div>

        <div className="foot"><span>{SITE.footer}</span><span>{HERO.footRight}</span></div>
      </div>
    </section>
  );
}

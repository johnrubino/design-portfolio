import fowa from '../assets/file-text-fowa.webp';
import fpl from '../assets/file-text-fpl.webp';
import ppr from '../assets/file-text-ppr.webp';
import headshot from '../assets/headshot.webp';
import pencil from '../assets/pencil-write.webp';
import { HERO, INTRO, PLACEHOLDER_TAG } from '../content/home';
import { SITE } from '../content/site';
import { ExpandText } from './ExpandText';
import { Icon } from './Icon';
import { Legend } from './Legend';

/** First screen: name, intro with expanding words, the legend, latest essay and the case-studies bar. */
export function Hero() {
  const essay = SITE.latestEssay;
  return (
    <section className="screen stone" id="home" aria-labelledby="h-name">
      <div className="content">
        <div className="meta"><span>{HERO.metaLeft}</span><span>{HERO.metaRight}</span></div>

        <div className="hero">
          {/* Intro: spans the hero, up to a readable width. Expanding paragraphs grow below it. */}
          <div className="hero-top">
            <div className="eyebrow" />
            <h1 id="h-name">
              {SITE.name}
              <span className="portrait">
                <img src={headshot} alt="" width="256" height="256" decoding="async" />
              </span>
            </h1>
            <ExpandText paragraphs={INTRO} />
            <span className="ph">{PLACEHOLDER_TAG}</span>
          </div>

          <div className="hero-l">
            <Legend heading={HERO.legendHeading} />
          </div>

          <div className="hero-r">
            <a className="dt" href={essay.url} target="_blank" rel="noopener">
              <img className="d3" src={pencil} alt="" width="48" height="48" decoding="async" />
              <span>
                <span className="k">{HERO.essayKicker}</span>
                <span className="t">{essay.title}</span>
                <span className="s">{essay.date} · {HERO.essaySource}</span>
              </span>
            </a>
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

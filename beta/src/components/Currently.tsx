import { CURRENTLY as C } from '../content/home';
import { LINE } from '../content/lines';

/** What John is doing now: one column per role, each tied to its line on the map by colour. */
export function Currently() {
  return (
    <section className="now" aria-labelledby="h-now">
      <h2 className="sec" id="h-now">{C.heading}</h2>
      <ul className="now-list">
        {C.items.map((item) => (
          <li key={item.name} className="now-item">
            <span className="now-lines" aria-hidden="true">
              {item.lines.map((l) => <i key={l} style={{ background: LINE[l].colour }} />)}
            </span>
            <span className="now-k">{item.eyebrow}</span>
            <h3 className="now-t">{item.name}</h3>
            <p className="now-d">{item.text}</p>
            <ul className="now-tags" aria-label={`${item.name} focus areas`}>
              {item.tags.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

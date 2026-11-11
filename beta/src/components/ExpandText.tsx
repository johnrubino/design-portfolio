import { Fragment, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { Expansion, IntroPara, Seg } from '../content/home';
import { LINE } from '../content/lines';

const INK = '#141413';

/**
 * Inline word expansion, modelled on emilycampbell.co (at John's request).
 *
 * Some words are pills. Clicking one turns it into plain text for good and a
 * new paragraph fades in under its paragraph. That paragraph can hold more
 * pills, so the intro unfolds layer by layer. Nothing folds back up.
 *
 * Keyboard: the pills are real buttons. Because the button disappears once
 * used, focus moves to the paragraph it opened, so the reader keeps their place.
 */
export function ExpandText({ paragraphs, portrait }: { paragraphs: IntroPara[]; portrait?: string }) {
  /** Opened expansion ids, in the order they were opened. */
  const [open, setOpen] = useState<string[]>([]);
  const panels = useRef(new Map<string, HTMLParagraphElement>());
  const justOpened = useRef<string | null>(null);

  const expand = (id: string) => {
    justOpened.current = id;
    setOpen((cur) => (cur.includes(id) ? cur : [...cur, id]));
  };

  useEffect(() => {
    const id = justOpened.current;
    if (!id) return;
    justOpened.current = null;
    panels.current.get(id)?.focus({ preventScroll: true });
  }, [open]);

  const renderSegs = (segs: Seg[]) =>
    segs.map((seg, i) => {
      if (typeof seg === 'string') return <Fragment key={i}>{seg}</Fragment>;
      if ('name' in seg) {
        // The name sits in the sentence, with the photo right after it.
        return (
          <span key={i} className="nm">
            {seg.name}
            {portrait && (
              <span className="portrait">
                <img src={portrait} alt="" width="256" height="256" decoding="async" />
              </span>
            )}
          </span>
        );
      }
      if ('href' in seg) {
        return (
          <a key={i} className="tl" href={seg.href} target="_blank" rel="noopener">
            {seg.text}
          </a>
        );
      }
      // Once opened, the word is just part of the sentence again.
      if (open.includes(seg.word)) return <Fragment key={i}>{seg.text}</Fragment>;
      return (
        <button
          key={i}
          type="button"
          className={`hl${seg.line ? '' : ' n'}`}
          style={{ '--c': seg.line ? LINE[seg.line].colour : INK } as CSSProperties}
          aria-expanded="false"
          aria-controls={`xp-${seg.word}`}
          onClick={() => expand(seg.word)}
          onMouseEnter={flood}
          onMouseLeave={flood}
        >
          {seg.text}
        </button>
      );
    });

  const panel = (e: Expansion) => {
    const isOpen = open.includes(e.id);
    return (
      <div key={e.id} className={`xw${isOpen ? ' open' : ''}`} id={`xp-${e.id}`} inert={!isOpen}>
        <div className="xi">
          <p
            className="xpp"
            tabIndex={-1}
            ref={(el) => {
              if (el) panels.current.set(e.id, el);
              else panels.current.delete(e.id);
            }}
          >
            {renderSegs(e.body)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {paragraphs.map((p) => (
        <Fragment key={p.kind}>
          <p className={p.kind}>{renderSegs(p.segs)}</p>
          {p.expansions.map(panel)}
        </Fragment>
      ))}
    </>
  );
}

/** The greeting: each click swaps in the next one, as on emilycampbell.co. */
export function Greeting({ greetings }: { greetings: string[] }) {
  const [i, setI] = useState(0);
  return (
    <p className="hello">
      <button type="button" className="greet" onClick={() => setI((n) => (n + 1) % greetings.length)} aria-label={`${greetings[i]} (say it another way)`}>
        <span aria-live="polite">{greetings[i]}</span>
      </button>
    </p>
  );
}

/** The pill's fill grows from (and shrinks back to) where the pointer crossed its edge. */
function flood(e: MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--x', `${e.clientX - r.left}px`);
  el.style.setProperty('--y', `${e.clientY - r.top}px`);
}

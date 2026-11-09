import { Fragment, useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import type { Expansion, IntroPara, Seg } from '../content/home';
import { LINE } from '../content/lines';

const INK = '#141413';

/**
 * Inline word expansion (brief §7).
 *
 * Some words are pills. Clicking one turns it back into plain underlined text
 * and opens a new paragraph in the flow directly under its paragraph. Several
 * can be open at once. Folding a parent folds its children; Esc folds the most
 * recently opened one and returns focus to its word.
 */
export function ExpandText({ paragraphs, portrait }: { paragraphs: IntroPara[]; portrait?: string }) {
  /** Open expansion ids, oldest first. */
  const [open, setOpen] = useState<string[]>([]);
  const openRef = useRef(open);
  openRef.current = open;
  const words = useRef(new Map<string, HTMLButtonElement>());

  const all = paragraphs.flatMap((p) => p.expansions);

  const toggle = useCallback(
    (id: string) => {
      setOpen((cur) => {
        if (!cur.includes(id)) return [...cur, id];
        const gone = new Set([id]);
        // Fold children with their parent (children can nest further).
        let grew = true;
        while (grew) {
          grew = false;
          for (const e of all) {
            if (e.parent && gone.has(e.parent) && !gone.has(e.id)) {
              gone.add(e.id);
              grew = true;
            }
          }
        }
        return cur.filter((x) => !gone.has(x));
      });
    },
    // `all` is derived from static content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const last = openRef.current[openRef.current.length - 1];
      if (e.key !== 'Escape' || !last) return;
      toggle(last);
      words.current.get(last)?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggle]);

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
      const isOpen = open.includes(seg.word);
      return (
        <button
          key={i}
          type="button"
          ref={(el) => {
            if (el) words.current.set(seg.word, el);
            else words.current.delete(seg.word);
          }}
          className={`hl${seg.line ? '' : ' n'}${isOpen ? ' done' : ''}`}
          style={{ '--c': seg.line ? LINE[seg.line].colour : INK } as CSSProperties}
          aria-expanded={isOpen}
          aria-controls={`xp-${seg.word}`}
          onClick={() => toggle(seg.word)}
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
          <p className="xpp">{renderSegs(e.body)}</p>
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

/** The pill's fill grows from (and shrinks back to) where the pointer crossed its edge. */
function flood(e: MouseEvent<HTMLButtonElement>) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--x', `${e.clientX - r.left}px`);
  el.style.setProperty('--y', `${e.clientY - r.top}px`);
}

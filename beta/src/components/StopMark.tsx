import { LINE_BY_ID, type LineId } from '../content/lines';

/**
 * A stop on a line, as a small glyph: a short run of the line in its colour
 * with a station dot. Used beside each project on the Case studies page.
 * Decorative (the project name is right next to it).
 */
export function StopMark({ line, size = 30 }: { line: LineId; size?: number }) {
  const l = LINE_BY_ID[line];
  const c = size / 2;
  return (
    <svg aria-hidden="true" focusable="false" className="stopmark" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect x={c - 4} y={0} width={8} height={size} fill={l.colour} />
      <circle cx={c} cy={c} r={4.6} fill="var(--ink)" stroke="#fff" strokeWidth={1.4} />
    </svg>
  );
}

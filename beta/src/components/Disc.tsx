import { LINE_BY_ID, type LineId } from '../content/lines';

/**
 * Route disc in the Vignelli manner: a round bullet in the line's colour
 * with the line number. Decorative: the line's name is always given in
 * nearby text, so the disc is aria-hidden.
 */
export function Disc({ line, size }: { line: LineId; size: number }) {
  const l = LINE_BY_ID[line];
  return (
    <svg aria-hidden="true" focusable="false" className="disc" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={l.colour} />
      <text
        x={size / 2}
        y={size / 2}
        dy="0.36em"
        textAnchor="middle"
        fontSize={Math.max(7.5, size * 0.56)}
        fontWeight={600}
        fill={l.ink}
        style={{ fontFamily: 'var(--font)' }}
      >
        {l.order}
      </text>
    </svg>
  );
}

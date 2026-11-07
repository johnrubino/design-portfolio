import { LINE_BY_ID, type LineId } from '../content/lines';

/**
 * A route disc. Drawn as SVG so the number is decoration: the line's name is
 * always given in adjacent text, and the disc itself is aria-hidden.
 */
export function Disc({ line, size, fontSize }: { line: LineId; size: number; fontSize?: number }) {
  const l = LINE_BY_ID[line];
  const fs = fontSize ?? Math.max(8, Math.round(size * 0.52));
  return (
    <svg aria-hidden="true" focusable="false" className="disc" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={size / 2} fill={l.colour} />
      <text
        x={size / 2}
        y={size / 2}
        dy="0.36em"
        textAnchor="middle"
        fontSize={fs}
        fontWeight={500}
        fill={l.ink}
      >
        {l.disc}
      </text>
    </svg>
  );
}

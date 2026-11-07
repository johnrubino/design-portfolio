import { LINE_BY_ID, type LineId } from '../content/lines';

/**
 * The line chip: a square with its top-left corner cut at 45° (the map's
 * own angle), filled with the line colour and carrying the line's
 * two-letter code. Decorative: the line's name is always given in nearby
 * text, so the chip is aria-hidden.
 */
export function Chip({ line, size, code = true }: { line: LineId; size: number; code?: boolean }) {
  const l = LINE_BY_ID[line];
  const cut = Math.round(size * 0.3 * 10) / 10;
  return (
    <svg aria-hidden="true" focusable="false" className="chip" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={`M${cut} 0 H${size} V${size} H0 V${cut} Z`} fill={l.colour} />
      {code && (
        <text
          x={size / 2 + size * 0.04}
          y={size / 2}
          dy="0.36em"
          textAnchor="middle"
          fontSize={Math.max(7, size * 0.4)}
          fontWeight={600}
          letterSpacing="0.02em"
          fill={l.ink}
          style={{ fontStretch: '112%' }}
        >
          {l.code}
        </text>
      )}
    </svg>
  );
}

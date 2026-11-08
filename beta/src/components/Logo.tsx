/**
 * Logo placeholder. Swap this file for the real mark when it exists:
 * everything that shows the logo (map header, phone bar, map sheet)
 * renders this component.
 *
 * Placeholder: the line chip's cut-corner square in ink with a JR monogram.
 */
export function Logo({ size = 44, tone = 'ink' }: { size?: number; tone?: 'ink' | 'light' }) {
  const [bg, fg] = tone === 'ink' ? ['var(--ink)', 'var(--on-ink)'] : ['var(--on-ink)', 'var(--ink)'];
  const cut = Math.round(size * 0.3);
  return (
    <svg aria-hidden="true" focusable="false" className="logo" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={`M${cut} 0 H${size} V${size} H0 V${cut} Z`} fill={bg} />
      <text
        x={size / 2 + size * 0.04}
        y={size / 2}
        dy="0.36em"
        textAnchor="middle"
        fontSize={size * 0.38}
        fontWeight={600}
        fill={fg}
        style={{ fontStretch: '112%', fontFamily: 'var(--font)' }}
      >
        JR
      </text>
    </svg>
  );
}

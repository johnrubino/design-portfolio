/**
 * Static map furniture in the style of the 1972 Vignelli map: flat land,
 * parks and rivers, the frame, grid references and district names.
 * Values are from the approved prototype.
 */
const GRID_ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const GRID_COLS = ['1', '2', '3', '4'];

export function MapBase() {
  return (
    <>
      <rect x="0" y="0" width="460" height="900" fill="var(--paper-map)" />
      <g className="exp-only">
        {/* Land */}
        <path d="M40 112 H446 V770 L370 868 H40 Z" fill="var(--land)" />
        <path d="M250 470 H446 V560 H330 Z" fill="var(--land-2)" />
        <path d="M40 560 H130 L210 640 V868 H40 Z" fill="var(--land-2)" />
        {/* Rivers */}
        <path d="M232 112 V150 L276 194 H446" fill="none" stroke="var(--river)" strokeWidth="26" />
        <path d="M40 660 H96 L176 740 V868" fill="none" stroke="var(--river)" strokeWidth="28" />
        {/* Parks */}
        <rect x="60" y="392" width="40" height="100" fill="var(--park)" />
        <rect x="392" y="474" width="40" height="40" fill="var(--park)" />
        <rect x="62" y="214" width="30" height="36" fill="var(--park)" />
        {/* Districts */}
        <text x="412" y="342" textAnchor="end" className="district">Enterprise</text>
        <text x="412" y="556" textAnchor="end" className="district">Colllective</text>
        <text x="56" y="806" className="district">Writing</text>
        <text x="300" y="198" fontWeight="500" fontSize="10.5" fill="#806650">Handoff Channel</text>
        {/* Frame + grid */}
        <rect x="26.5" y="112.5" width="420" height="756" fill="none" stroke="var(--ink)" strokeOpacity=".28" />
        {GRID_ROWS.map((r, i) => (
          <text key={r} x="13" y={179 + i * 126} textAnchor="middle" fontSize="10.5" fill="var(--ink)">{r}</text>
        ))}
        {GRID_COLS.map((c, i) => (
          <text key={c} x={78.5 + i * 105} y="886" textAnchor="middle" fontSize="10.5" fill="var(--ink)">{c}</text>
        ))}
        <g stroke="var(--ink)" strokeWidth=".8" fill="none" opacity=".7">
          <circle cx="448" cy="886" r="5" />
          <path d="M439 886 H457 M448 877 V895" />
        </g>
      </g>
    </>
  );
}

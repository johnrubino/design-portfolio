/**
 * The schematic plane, drawn straight onto the page: a 24px dot grid with small
 * crosshairs every four cells. No geography: the map is fictional, and nothing
 * on the plane has a hard edge.
 */
const MODULE = 24;
const ORIGIN = 12; // grid offset so trunk and turns land on dots

export function MapBase() {
  const crosses: [number, number][] = [];
  for (let x = ORIGIN + MODULE * 2; x < 460; x += MODULE * 4) {
    for (let y = ORIGIN + MODULE * 6; y < 900; y += MODULE * 4) crosses.push([x, y]);
  }
  return (
    <>
      <defs>
        <pattern id="grid-dots" x={ORIGIN} y={ORIGIN} width={MODULE} height={MODULE} patternUnits="userSpaceOnUse">
          <circle cx="0" cy="0" r="1.1" fill="var(--grid-dot)" />
          <circle cx={MODULE} cy="0" r="1.1" fill="var(--grid-dot)" />
          <circle cx="0" cy={MODULE} r="1.1" fill="var(--grid-dot)" />
          <circle cx={MODULE} cy={MODULE} r="1.1" fill="var(--grid-dot)" />
        </pattern>
        {/* The grid, zones and crosses fade out toward the page, so the map has no edge. */}
        <linearGradient id="seam-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.5" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="seam-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="460" height="900">
          <rect x="0" y="0" width="460" height="900" fill="url(#seam-grad)" />
        </mask>
      </defs>
      <g className="exp-only" mask="url(#seam-fade)">
        <rect x="0" y="96" width="460" height="804" fill="url(#grid-dots)" />
        <g stroke="var(--grid-cross)" strokeWidth="1">
          {crosses.map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x - 4} ${y} H${x + 4} M${x} ${y - 4} V${y + 4}`} />
          ))}
        </g>
      </g>
    </>
  );
}

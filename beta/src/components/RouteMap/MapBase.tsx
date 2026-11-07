/**
 * The schematic plane: a frosted panel over a 24px dot grid with small
 * crosshairs every four cells, plus a few faint unlabelled zones that give
 * the branches room. No geography: the map is fictional.
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
      </defs>
      <rect x="0" y="0" width="460" height="900" fill="var(--panel)" />
      <rect x="0" y="96" width="460" height="804" fill="url(#grid-dots)" />
      <g className="exp-only">
        {/* Zones: quiet fields behind each group of branches */}
        <rect x="252" y="324" width="184" height="168" rx="2" fill="var(--zone)" />
        <rect x="300" y="564" width="136" height="96" rx="2" fill="var(--zone)" />
        <rect x="36" y="780" width="192" height="96" rx="2" fill="var(--zone)" />
        <g stroke="var(--grid-cross)" strokeWidth="1">
          {crosses.map(([x, y]) => (
            <path key={`${x}-${y}`} d={`M${x - 4} ${y} H${x + 4} M${x} ${y - 4} V${y + 4}`} />
          ))}
        </g>
      </g>
    </>
  );
}

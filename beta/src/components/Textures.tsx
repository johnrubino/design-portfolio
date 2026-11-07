/**
 * Print texture: SVG filters referenced by CSS (`filter: url(#riso)` etc.).
 * The paper grain itself is a tiled background on body::after (base.css).
 */
export function Textures() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      {/* Edge-roughening + ink speckle for the coloured map lines. */}
      <filter id="riso" x="-2%" y="-2%" width="104%" height="104%">
        <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="4" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale=".5" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.9" numOctaves="1" seed="9" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 7.6" result="m" />
        <feComposite in="d" in2="m" operator="in" />
      </filter>
      {/* Same treatment, tuned for the big station names. */}
      <filter id="riso-t" x="-2%" y="-5%" width="104%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="2" result="w" />
        <feDisplacementMap in="SourceGraphic" in2="w" scale=".6" result="d" />
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="7" result="n" />
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 7.7" result="m" />
        <feComposite in="d" in2="m" operator="in" />
      </filter>
    </svg>
  );
}

/** Wayfinding arrow, drawn as SVG (never the "→" glyph). 100 × 100 box, miter joins. */
export function Arrow({ size, colour = 'currentColor', className = 'ar', weight = 11 }: { size: number; colour?: string; className?: string; weight?: number }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width={size} height={size} viewBox="0 0 100 100">
      <path d="M10 50 H84" stroke={colour} strokeWidth={weight} fill="none" />
      <path d="M54 20 L84 50 L54 80" stroke={colour} strokeWidth={weight} fill="none" strokeLinejoin="miter" strokeMiterlimit="10" />
    </svg>
  );
}

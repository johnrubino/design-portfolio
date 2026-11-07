/** The NYCTA arrow (never the "→" glyph). 100 × 100 box, stroke 15, miter joins. */
export function NycArrow({ size, colour = 'currentColor', className = 'ar' }: { size: number; colour?: string; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" className={className} width={size} height={size} viewBox="0 0 100 100">
      <path d="M8 50 H82" stroke={colour} strokeWidth="15" fill="none" />
      <path d="M50 16 L84 50 L50 84" stroke={colour} strokeWidth="15" fill="none" strokeLinejoin="miter" strokeMiterlimit="10" />
    </svg>
  );
}

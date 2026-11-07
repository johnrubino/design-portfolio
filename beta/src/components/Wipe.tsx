import type { Dir } from '../ride/useRide';

/**
 * Paper-coloured panel that sweeps across the content over T, edged with
 * 9px stripes in the destination's line colours. Symmetric easing, so at
 * T/2 the panel fully covers the content — that's when the page swaps.
 */
export function Wipe({ T, dir, colours }: { T: number; dir: Dir; colours: string[] }) {
  const stripes = colours.map((c, i) => <i key={i} style={{ background: c }} />);
  return (
    <div className={`wipe ${dir}`} style={{ animationDuration: `${T}ms` }} aria-hidden="true">
      <span className="eL">{stripes}</span>
      <span className="eR">{stripes}</span>
    </div>
  );
}

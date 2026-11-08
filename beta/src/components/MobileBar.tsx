import { SITE } from '../content/site';
import { Logo } from './Logo';

/** Small screens: a slim bar with the logo and the Map button. */
export function MobileBar({ onMap, mapOpen }: { onMap: () => void; mapOpen: boolean }) {
  return (
    <header className="mbar">
      <span className="mbar-logo" role="img" aria-label={`${SITE.name}, ${SITE.role}`}>
        <Logo size={32} tone="light" />
      </span>
      <button type="button" className="mbar-map" onClick={onMap} aria-haspopup="dialog" aria-expanded={mapOpen}>
        Map
      </button>
    </header>
  );
}

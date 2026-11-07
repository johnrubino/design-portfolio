import { SITE } from '../content/site';

/** Small screens: a slim black sign bar with the Map button. */
export function MobileBar({ onMap, mapOpen }: { onMap: () => void; mapOpen: boolean }) {
  return (
    <header className="mbar">
      <span className="mbar-n signage">{SITE.name}</span>
      <button type="button" className="mbar-map" onClick={onMap} aria-haspopup="dialog" aria-expanded={mapOpen}>
        Map
      </button>
    </header>
  );
}

import { SITE } from '../content/site';
import { Arrow } from './Arrow';

/** The dark-glass sign at the top of the map. */
export function NavSign({
  collapsed,
  onToggle,
  onClose,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="navsign">
      <div className="ns-t exp-only">
        <div className="ns-n signage">{SITE.name}</div>
        <div className="ns-s">{SITE.role}</div>
      </div>
      {onToggle && (
        <button
          type="button"
          className="ns-tg"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand map' : 'Collapse map'}
          aria-expanded={!collapsed}
        >
          <Arrow size={18} colour="var(--ink)" />
        </button>
      )}
      {onClose && (
        <button type="button" className="ns-tg ns-close" onClick={onClose} aria-label="Close map">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 100 100">
            <path d="M16 16 L84 84 M84 16 L16 84" stroke="var(--ink)" strokeWidth="11" />
          </svg>
        </button>
      )}
    </div>
  );
}

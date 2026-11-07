import { SITE } from '../content/site';
import { NycArrow } from './NycArrow';

/** The black station sign at the top of the route map. */
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
        <div className="ns-n">{SITE.name}</div>
        <div className="ns-s">{SITE.signSub}</div>
      </div>
      {onToggle && (
        <button
          type="button"
          className="ns-tg"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand route map' : 'Collapse route map'}
          aria-expanded={!collapsed}
        >
          <NycArrow size={18} colour="#F3E8D3" />
        </button>
      )}
      {onClose && (
        <button type="button" className="ns-tg ns-close" onClick={onClose} aria-label="Close route map">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 100 100">
            <path d="M14 14 L86 86 M86 14 L14 86" stroke="#F3E8D3" strokeWidth="14" />
          </svg>
        </button>
      )}
    </div>
  );
}

import type { FocusEvent, MouseEvent, PointerEvent, RefObject } from 'react';
import { SITE } from '../content/site';
import { Logo } from './Logo';

const NAME = `${SITE.name}, ${SITE.role}`;

/**
 * The top of the map: the logo, and on the phone sheet a close button.
 * On narrow screens the logo is a button that opens the map (it also
 * opens on hover, handled by the nav in App.tsx); elsewhere it is just a logo.
 */
export function NavSign({
  interactive = false,
  expanded = false,
  logoRef,
  onLogoClick,
  onLogoPointerDown,
  onLogoFocus,
  onClose,
}: {
  interactive?: boolean;
  expanded?: boolean;
  logoRef?: RefObject<HTMLButtonElement | null>;
  onLogoClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  onLogoPointerDown?: (e: PointerEvent<HTMLButtonElement>) => void;
  onLogoFocus?: (e: FocusEvent<HTMLButtonElement>) => void;
  onClose?: () => void;
}) {
  return (
    <div className="navsign">
      {interactive ? (
        <button
          type="button"
          ref={logoRef}
          className="logo-btn"
          aria-label={`${NAME}. Map`}
          aria-expanded={expanded}
          onClick={onLogoClick}
          onPointerDown={onLogoPointerDown}
          onFocus={onLogoFocus}
        >
          <Logo />
        </button>
      ) : (
        <span className="logo-btn" role="img" aria-label={NAME}>
          <Logo />
        </span>
      )}
      {onClose && (
        <button type="button" className="ns-close" onClick={onClose} aria-label="Close map">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 100 100">
            <path d="M16 16 L84 84 M84 16 L16 84" stroke="var(--ink)" strokeWidth="11" />
          </svg>
        </button>
      )}
    </div>
  );
}

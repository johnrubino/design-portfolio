import type { IconId } from '../content/lines';

const PATHS: Record<IconId, React.ReactNode> = {
  case: (<><rect x="2.5" y="3" width="11" height="10" rx="1.5" /><path d="M2.5 6.5h11" /></>),
  lab: <path d="M6 2.5h4M7 2.5v4L3.6 12.3a1 1 0 0 0 .9 1.2h7a1 1 0 0 0 .9-1.2L9 6.5v-4M5 10h6" />,
  essay: <path d="M3 4h10M3 8h10M3 12h6" />,
  about: (<><circle cx="8" cy="5.5" r="2.5" /><path d="M3.5 13.5c.8-2.4 2.5-3.5 4.5-3.5s3.7 1.1 4.5 3.5" /></>),
  time: (<><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></>),
  progress: (<><circle cx="8" cy="8" r="5.5" /><path d="M8 2.5a5.5 5.5 0 0 1 0 11z" fill="currentColor" stroke="none" /></>),
  arrow: <path d="M3 8h10M9.5 4.5 13 8l-3.5 3.5" />,
};

/** 16px line icon. Decorative: always hidden from screen readers. */
export function Icon({ id, className = '' }: { id: IconId; className?: string }) {
  return (
    <svg
      className={`ic ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[id]}
    </svg>
  );
}

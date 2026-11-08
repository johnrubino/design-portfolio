import type { Pt } from '../geometry/path';

export interface CaseStudy {
  /** Used for the row's anchor (#project-<slug>). */
  slug: string;
  title: string;
  /** Name at the project's stop on the Case studies line. */
  mapLabel: string;
  /** The stop's position on the Case studies line's centreline (map space). */
  stop: Pt;
  /** Role · year line. */
  meta: string;
  summary: string;
}

export const CASES_INTRO =
  'Enterprise work is shown as a live walkthrough under NDA, so each one starts with a short request.';

/** Selected work, in the order the Work line calls at it. Copy from johnrubino.design. */
export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'future-of-wealth-advisory',
    title: 'Future of Wealth Advisory',
    mapLabel: 'Future of Wealth',
    stop: [300, 320],
    meta: 'BNY Pershing · Wealth Services',
    summary:
      'Reimagined account opening and asset movement workflows for a platform consolidation, designing the To-Do List pattern and collapsing stepper.',
  },
  {
    slug: 'fully-paid-lending',
    title: 'Fully Paid Lending',
    mapLabel: 'Fully Paid Lending',
    stop: [300, 368],
    meta: 'BNY Pershing · Wealth Services',
    summary:
      'Streamlined the fully paid lending program experience, enabling advisors to unlock liquidity for clients while maintaining compliance.',
  },
  {
    slug: 'purple-panda-rentals',
    title: 'Purple Panda Rentals',
    mapLabel: 'Purple Panda',
    stop: [300, 416],
    meta: 'Founder project · Mobile',
    summary:
      'Founded a rental platform for college students, designing the mobile app from research through validated prototypes with 270 survey respondents.',
  },
];

export const WALKTHROUGH_COPY = {
  cta: 'Request walkthrough',
  title: 'Request a walkthrough',
  intro: 'Enterprise work is under NDA, so I show it live. Tell me who you are and I will set up a time.',
  submit: 'Send request',
  sending: 'Sending…',
  doneTitle: 'Request received',
  done: 'Thanks. I will reply to your work email within two working days.',
  error: 'That did not send. Try again, or email me directly.',
};

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
  'Four projects, all on one platform. Client work is shown as a live walkthrough under NDA, so each one starts with a short request.';

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'fully-paid-lending',
    title: 'Fully Paid Lending',
    mapLabel: 'Fully Paid Lending',
    stop: [300, 468],
    meta: 'Lead product designer · Launched 2026',
    summary:
      'An opportunity view that shows advisors which positions qualify for securities lending, and lets them enroll clients from the book they already work in.',
  },
  {
    slug: 'future-of-wealth-advisory',
    title: 'Future of Wealth Advisory',
    mapLabel: 'Future of Wealth',
    stop: [300, 516],
    meta: 'Vision work · 2026',
    summary:
      'An AI-first workspace for advisors, organised around the work they do in a day instead of the menus of the systems behind it.',
  },
  {
    slug: 'new-account-opening',
    title: 'New Account Opening',
    mapLabel: 'New Account Opening',
    stop: [300, 564],
    meta: 'Product designer · In progress',
    summary:
      'Opening and funding accounts across clearing firms, rebuilt so fewer forms bounce back for missing information.',
  },
  {
    slug: 'purple-panda-rentals',
    title: 'Purple Panda Rentals',
    mapLabel: 'Purple Panda',
    stop: [300, 612],
    meta: 'Founder · Sunset',
    summary: 'A rental business I started, designed and ran end to end, from booking flow to operations.',
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

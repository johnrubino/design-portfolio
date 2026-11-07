import type { LineId } from './lines';

export interface CaseStudy {
  line: LineId;
  title: string;
  /** Role · year line. */
  meta: string;
  summary: string;
}

export const CASES_INTRO =
  'Four projects, all on one platform. Client work is shown as a live walkthrough under NDA, so each one starts with a short request.';

export const CASE_STUDIES: CaseStudy[] = [
  {
    line: 'l2',
    title: 'Fully Paid Lending',
    meta: 'Lead product designer · Launched 2026',
    summary:
      'An opportunity view that shows advisors which positions qualify for securities lending, and lets them enroll clients from the book they already work in.',
  },
  {
    line: 'l1',
    title: 'Future of Wealth Advisory',
    meta: 'Vision work · 2026',
    summary:
      'An AI-first workspace for advisors, organised around the work they do in a day instead of the menus of the systems behind it.',
  },
  {
    line: 'l3',
    title: 'New Account Opening',
    meta: 'Product designer · In progress',
    summary:
      'Opening and funding accounts across clearing firms, rebuilt so fewer forms bounce back for missing information.',
  },
  {
    line: 'l4',
    title: 'Purple Panda Rentals',
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

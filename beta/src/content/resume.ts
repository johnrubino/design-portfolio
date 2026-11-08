import { LINKS } from './site';

/** Copy from johnrubino.design/resume. */
export const RESUME_INTRO =
  'I design complex financial workflows for advisors at BNY Pershing and build with AI. My lending redesign helped a client lend a $27M position in a single day.';

export const WORK_HISTORY = [
  { when: '2023 – now', where: 'BNY Pershing', role: 'Senior Product Designer, Wealth Services' },
  { when: '2024 – now', where: 'Colllective Design', role: 'Design Advisor' },
  { when: 'Ongoing', where: 'Design Thinker', role: 'Writer' },
  { when: '2020 – 2023', where: 'Purple Panda Rentals', role: 'Founder & Product Designer' },
];

// TODO(john): contact links are placeholders until confirmed (see site.ts).
export const CONTACT = [
  { label: 'Email', href: LINKS.email },
  { label: 'LinkedIn', href: LINKS.linkedin },
  { label: 'Résumé PDF', href: LINKS.resume },
];

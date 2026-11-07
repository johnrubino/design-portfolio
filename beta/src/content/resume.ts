import { LINKS } from './site';

export const RESUME_INTRO = 'Where I have worked, and how to reach me.';

export const WORK_HISTORY = [
  { when: 'Now', where: 'BNY Pershing', role: 'Senior Product Designer, Wealth Services' },
  { when: 'Ongoing', where: 'Colllective Design', role: 'Co-founder' },
  { when: 'Ongoing', where: 'Design Thinker', role: 'Writer' },
  { when: 'Earlier', where: 'Purple Panda Rentals', role: 'Founder' },
];

// TODO(john): contact links are placeholders until confirmed (see site.ts).
export const CONTACT = [
  { label: 'Email', href: LINKS.email },
  { label: 'LinkedIn', href: LINKS.linkedin },
  { label: 'Résumé PDF', href: LINKS.resume },
];

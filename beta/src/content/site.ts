/** Site-wide facts and links. */
import { ESSAY_URL } from './lines';

export const SITE = {
  name: 'John Rubino',
  footer: 'John Rubino · Product designer',
  substack: 'https://johnrubino.substack.com',
  about: 'https://johnrubino.design/about',
  // Contact links, as on the live site. TODO(john): confirm these (brief §13 Q7).
  contact: [
    { text: 'Email me', href: 'mailto:johnrubinodesign@gmail.com' },
    { text: 'LinkedIn', href: 'https://www.linkedin.com/in/john-rubino/' },
    { text: 'Substack', href: 'https://johnrubino.substack.com' },
  ],
  latestEssay: {
    title: 'Figma isn’t always the starting line',
    date: 'Sep 29, 2026',
    url: ESSAY_URL,
  },
};

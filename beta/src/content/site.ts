/** Site-wide copy and links. */
export const SITE = {
  name: 'John Rubino',
  authority: 'Rubino Transit Authority',
  signSub: 'Rubino Transit Authority · Select a station to ride',
  manual: 'Portfolio Standards Manual',
  year: '2026',
  role: 'Product Designer',
  titleSuffix: 'John Rubino · Rubino Transit Authority',
} as const;

export const LINKS = {
  // TODO(john): confirm the address recruiters should use.
  email: 'mailto:johnrubinodesign@gmail.com',
  // TODO(john): confirm LinkedIn URL.
  linkedin: 'https://www.linkedin.com/in/john-rubino/',
  // TODO(john): swap in the current résumé PDF (served from beta/public/).
  resume: '/john-rubino-resume.pdf',
  substack: 'https://johnrubino.substack.com',
} as const;

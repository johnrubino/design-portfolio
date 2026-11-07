/** Site-wide copy and links. */
export const SITE = {
  name: 'John Rubino',
  role: 'Product designer',
  domain: 'johnrubino.design',
  titleSuffix: 'John Rubino, product designer',
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

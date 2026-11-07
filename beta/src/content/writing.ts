import { LINKS } from './site';

export interface Post {
  title: string;
  date: string;
  url: string;
}

export const WRITING_INTRO =
  'Short notes on design, technology and working alongside AI. Published on Substack when there is something worth saying.';

export const SUBSTACK_CTA = 'Read Design Thinker on Substack';

// TODO(john): placeholder posts. The build (scripts/fetch-posts.mjs) replaces
// these with the latest four posts from the Substack RSS feed when it can reach it.
const FALLBACK_POSTS: Post[] = [
  { title: 'The interface is becoming a conversation', date: 'Sep 2026', url: LINKS.substack },
  { title: 'Design systems are policy', date: 'Aug 2026', url: LINKS.substack },
  { title: 'What AI takes off the designer’s plate', date: 'Jun 2026', url: LINKS.substack },
  { title: 'Handoff is a relationship, not a file', date: 'Apr 2026', url: LINKS.substack },
];

const generated = import.meta.glob<{ default: Post[] }>('./posts.generated.json', { eager: true });
const fetched = Object.values(generated)[0]?.default ?? [];

export const POSTS: Post[] = fetched.length ? fetched.slice(0, 4) : FALLBACK_POSTS;

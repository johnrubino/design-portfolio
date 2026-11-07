// Prebuild: pull the latest Design Thinker posts from the Substack RSS feed
// into src/content/posts.generated.json. If the feed can't be reached, the
// build carries on and the site falls back to the static list in
// src/content/writing.ts.
import { existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const FEED = 'https://johnrubino.substack.com/feed';
const OUT = fileURLToPath(new URL('../src/content/posts.generated.json', import.meta.url));
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim() : '';
};
const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, '’');

try {
  const res = await fetch(FEED, { signal: AbortSignal.timeout(6000), headers: { 'User-Agent': 'rta-beta-build/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const posts = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 4).map(([, item]) => {
    const d = new Date(tag(item, 'pubDate'));
    return {
      title: decode(tag(item, 'title')),
      date: Number.isNaN(d.getTime()) ? '' : `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`,
      url: tag(item, 'link'),
    };
  }).filter((p) => p.title && p.url);
  writeFileSync(OUT, JSON.stringify(posts, null, 2) + '\n');
  console.log(`[fetch-posts] wrote ${posts.length} posts`);
} catch (err) {
  if (!existsSync(OUT)) writeFileSync(OUT, '[]\n');
  console.warn(`[fetch-posts] feed unavailable (${err.message}); using fallback posts`);
}

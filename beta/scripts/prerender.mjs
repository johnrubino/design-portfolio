// Build step: render the React page to HTML and write it into the built
// index.html, so visitors see the page before any JavaScript loads. React
// then attaches to that HTML in the browser (src/entry-client.tsx).
//
// Usage: node scripts/prerender.mjs [outDir]   (default: dist)
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const out = resolve(root, process.argv[2] ?? 'dist');
const ssr = resolve(root, 'dist-ssr');

const { render } = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);
const file = join(out, 'index.html');
let html = readFileSync(file, 'utf8');

// Preload the fonts used on the first screen (Public Sans 500 is only used further down).
const base = /(?:href|src)="(\.?\/?)assets\//.exec(html)?.[1] ?? '/';
const first = ['bricolage-grotesque-650', 'public-sans-300', 'public-sans-400', 'jetbrains-mono-400'];
const fonts = readdirSync(join(out, 'assets')).filter((f) => f.endsWith('.woff2'));
const preloads = first
  .map((name) => fonts.find((f) => f.startsWith(name)))
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="${base}assets/${f}" as="font" type="font/woff2" crossorigin />`)
  .join('\n    ');

// Put the stylesheet in the page itself, so the first paint doesn't wait on a second request.
const cssTag = /<link rel="stylesheet"[^>]*href="[^"]*assets\/([^"]+\.css)"[^>]*>/.exec(html);
if (!cssTag) throw new Error('index.html has no stylesheet link');
const cssFile = join(out, 'assets', cssTag[1]);
const css = readFileSync(cssFile, 'utf8').replaceAll('url(./', 'url(./assets/');
html = html.replace(cssTag[0], () => `<style>${css}</style>`);
rmSync(cssFile);

// The page is already readable without the script, so let fonts and images download first.
html = html.replace('<script type="module" crossorigin', '<script type="module" fetchpriority="low" crossorigin');

if (!html.includes('<!--app-->') || !html.includes('<!--preload-->')) throw new Error('index.html is missing its <!--app--> or <!--preload--> marker');
html = html.replace('<!--preload-->', preloads).replace('<!--app-->', () => render());
writeFileSync(file, html);
rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered ${file} (${(html.length / 1024).toFixed(1)} kB, ${preloads.split('\n').length} fonts preloaded)`);

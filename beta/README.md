# johnrubino.design — portfolio beta (v5 "side rail")

The home page of John Rubino's portfolio: a dark 220px rail carrying a line map, and one content column on stone. Each body of work is a **line** (FoWA, FPL, PPR, Labs, Writing).

- **Spec:** `../design/v5/CLAUDE_CODE_HANDOFF.md`. Where the spec and the reference disagree, the spec wins.
- **Visual reference:** `../design/v5/reference/portfolio-home-BC-v5.html`, with renders in `../design/v5/renders/`.
- **Earlier direction:** `../design/DIRECTION-v2.md` and `../design/RTA-beta-brief.md` describe the previous beta (a ride-between-pages map). v5 replaces it; the old code is in git history before this change.

**All copy is placeholder.** John writes his own prose. Don't polish it or add facts.

Stack: Vite + React + TypeScript, plain CSS with one tokens file, no UI kit and no animation library. This app lives in `beta/`, separate from the static site at the repo root, so the live site, hiring links and board are never touched.

---

## Run it

```bash
cd beta
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server. |
| `npm run build` | Typechecks, builds to `dist/`, then writes the finished page into `dist/index.html`. |
| `npm run preview` | Serves the production build on port 4173. |
| `npm test` | Rail geometry tests (Vitest). |
| `npm run test:e2e` | Browser acceptance tests (Playwright) against the production build. Run `npm run build` first. The first time, also run `npx playwright install chromium`. |
| `npm run build:artifact` | Same build with relative asset paths, into `dist-artifact/`, for previews served from a sub-path. |

### How the page is delivered

`npm run build` renders the React page to HTML ahead of time (`scripts/prerender.mjs`), so visitors see the whole page before any JavaScript arrives. React then loads and attaches to that HTML (`src/entry-client.tsx`) to run the interactions. The stylesheet is placed inline in the page and the four first-screen fonts are preloaded.

**Departure from the spec, approved by John:** §2 and §11 ask for no client framework and under 15 kB of JavaScript. John chose React in the browser so later features aren't limited. The script is about 70 kB gzipped, loads at low priority, and the page doesn't depend on it to be read.

---

## Edit content

All copy lives in typed files in `src/content/`. You don't need to touch components.

| File | What's in it |
|---|---|
| `site.ts` | Name, footer line, Substack and About links, the latest essay |
| `lines.ts` | The five lines: badge code, colour, map label, legend row, destination, hover card |
| `home.ts` | Intro paragraphs and their expanding words, How I AI, Every stop |

Open items are marked `TODO(john)`. Find them all with:

```bash
grep -rn "TODO(john)" src index.html
```

**Expanding words.** In `home.ts`, a paragraph is a list of pieces: plain text, `{ word, text, line? }` for a pill, or `{ href, text }` for a link. Each `word` opens the expansion with the same `id`. An expansion with `parent` set belongs to a word inside another expansion (Wove sits inside "product designer") and folds with it.

**Two slots stay exactly as written** until John fills them: `[Project name · link · John to confirm]` and `[daily stack · John to confirm]`.

---

## Change the map

Edit the constants at the top of `src/geometry/rail.ts`, never raw SVG paths: `SPACING` (9, between bundled lines), `LINE_WIDTH` (5), `CORNER` (14), `ROWS` (where each line ends) and `LANE` (each line's lane on the trunk). `src/components/Rail.tsx` draws the map from them.

The geometry is a port of `../design/v5/map/map5.py`, and `npm test` checks it draws the same paths as the approved export (`../design/v5/map/rail-map.svg`). The tests also fail if a leg isn't at 0°, 45° or 90°, if two lines touch or cross, or if a badge code or colour changes.

**Hard rule (spec §6):** the map never filters, highlights, dims or scroll-syncs the content column, and the content never drives the map. Hover state lives inside `Rail.tsx` only. A test asserts that a map hover changes nothing under `<main>`.

---

## Type, colour and fonts

- `src/styles/tokens.css` is the only place raw values live (the five line colours are in `src/content/lines.ts`, shared by the map and legend).
- Only four type sizes exist: 12, 16, 22 and 72px. No italics anywhere. Both are tested.
- Fonts are self-hosted in `src/assets/fonts/`: Bricolage Grotesque 650, Public Sans 300/400/500, JetBrains Mono 400, cut down to Latin. Rebuild them with `python3 scripts/subset-fonts.py` (see the notes in that file) if you need a character they don't have.
- Quiet text is slightly darker than the reference (68% ink instead of 56% and 40%), because the spec asks for WCAG AA contrast and the reference values fail it at 12px.

**3D icons** (at John's request, in place of the line icons): 3dicons by Vijay Verma (realvjy), https://3dicons.co, CC0 1.0, "Color" style (multi-colour), dynamic angle. They lead each "Every stop" row and the map's hover card. Small arrows stay as line glyphs. The file icon is hue-shifted per case study so it matches its line (coral, yellow, blue); the others keep their own colours. Source PNGs are in `../design/v5/assets/3d-icons/source-color/`, and `icons3d.py` there writes the WebP files in `src/assets/3d/` (`pip install pillow numpy`). To add one, download its Color PNG from 3dicons.co into `source-color/`, add a line to `JOBS`, rerun it, and map it in `src/components/Icon3D.tsx`.

---

## Deploy (Vercel preview, private)

The beta is its **own Vercel project**, so production isn't affected.

1. In Vercel: **Add New → Project**, import `johnrubino/design-portfolio`.
2. Set **Root Directory** to `beta`. The framework (Vite), build command and output come from `beta/vercel.json`.
3. Under **Settings → Environment Variables**, add `BETA_PASSWORD` (required; without it every request gets 503).
4. Deploy the branch. Visitors get a browser password prompt; any username works.

**Private beta protections**, all to be removed when the site goes live:

- `<meta name="robots" content="noindex, nofollow">` in `index.html`
- `public/robots.txt` disallows all crawlers
- An `X-Robots-Tag: noindex, nofollow, noarchive` header on every response (`vercel.json` and `middleware.js`)
- A Basic-auth password gate in `middleware.js`

The repo-root `.vercelignore` keeps `beta/` and `design/` out of the main site's deployment.

---

## Layout

| Width | Behaviour |
|---|---|
| ≥ 761px | Rail (220px, sticky, full height) beside the content column. The first screen fits 1440 × 900 exactly. On short windows the map scales down as one piece. |
| ≤ 760px | The rail becomes a sticky top strip: "System map" and a sideways-scrolling row of line badges. Content is one column with 20px padding. |

Reduced motion turns off the train, the blur, the pill flood, the scroll reveal and the portrait spring.

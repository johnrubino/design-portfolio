# johnrubino.design — portfolio beta

A working beta of johnrubino.design, laid out as a fictional line map. Each body of work is a **line**, each page is a **station**, and the map is the only navigation. Choosing a station sends a marker along line 7 (Résumé) while the page changes behind a colour wipe.

- **Current direction:** `../design/DIRECTION-v2.md`. It overrides the brief and prototype where they disagree: an abstract schematic, line chips, and a frosted-glass material instead of 1972 paper.

- **Original spec:** `../design/RTA-beta-brief.md`
- **Original prototype:** `../design/Journey.dc.html`. v1 was a port of it.
- **Targets:** `../design/ref-expanded.png`, `../design/ref-collapsed.png` (1440 × 900)

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
| `npm run dev` | Dev server. The walkthrough form fakes a successful send. |
| `npm run build` | Pulls Substack posts, typechecks, builds to `dist/`. |
| `npm run preview` | Serves the production build on port 4173. |
| `npm run build:artifact` | Builds a preview for a claude.ai Artifact into `dist-artifact/`: hash URLs (`#labs`), relative assets, stubbed form. |
| `npm test` | Geometry tests: 45°/90° turns, morphable paths, stations clear of corners, markers in route order. |

Every station is a real URL: `/`, `/case-studies`, `/labs`, `/writing`, `/resume` (the old `/timetable` redirects). Deep links work, and back/forward ride the marker in the right direction.

---

## Edit content

All copy lives in typed files in `src/content/`. You don't need to touch components.

| File | What's in it |
|---|---|
| `site.ts` | Name, role, domain, page-title suffix, **contact links** |
| `about.ts` | Lede, bio, line-board headings |
| `caseStudies.ts` | The four case-study rows and the walkthrough form copy |
| `labs.ts` | Labs experiments |
| `writing.ts` | Intro, Substack link, fallback post list |
| `resume.ts` | Work history and contact links |
| `lines.ts` | Line names (full and short), colours, chip codes, "appears on" notes, **geometry** |
| `stations.ts` | Station names, routes, map sub-lines, which lines stop, **positions** |

Placeholders are marked `// TODO(john)`. Find them all with:

```bash
grep -rn "TODO(john)" src
```

**Substack posts:** `npm run build` runs `scripts/fetch-posts.mjs`, which writes the latest four posts from `johnrubino.substack.com/feed` to `src/content/posts.generated.json` (git-ignored). If the feed can't be reached, the static list in `writing.ts` is used.

**Résumé:** replace `public/john-rubino-resume.pdf`.

---

## Change the map

You edit centrelines and lanes, never raw SVG paths.

The constants at the top of `src/content/lines.ts` are `LANE` (13, the distance between neighbouring lines), `LINE_WIDTH` (3.5), `CORNER_RADIUS` (32), `COLLAPSED_X` (64) and `COLLAPSED_LANE` (10).

Each line has:
- `centre`: the centreline vertices in 460 × 900 map space. Turn only at 45° or 90°. Every line starts on the shared trunk at x = 180. The dot grid sits on a 24px module offset by 12, so vertices like 180, 348 and 492 land on dots.
- `lane`: the sideways offset in `LANE` steps. A positive lane is to the right of the direction of travel, which runs from About outward.
- `collapsedEndY`: where the line stops in the collapsed bundle.
- `code` and `short`: the chip code, and the name shown at the line's end on the map.

`src/geometry/network.ts` turns these into paths:

```
expanded:  centre → offsetPts(lane × LANE, miter joins) → rounded(CORNER_RADIUS)
collapsed: centre vertices → same vertices on a vertical lane (x = COLLAPSED_X − lane × COLLAPSED_LANE),
           each at its proportional arclength → rounded(CORNER_RADIUS)
```

Both go through `rounded()` with the same vertex count, so the expanded and collapsed command lists always match and the CSS `d` transition can morph between them.

Each station in `src/content/stations.ts` has:
- `at`: a point on the shared centreline. The slot spans every line in `lines`.
- `label`: which side the label sits on, and the x of its inner edge.
- `collapsedY`: the station's height in the collapsed bundle.
- `mainLine`: the chip on the "Next" sign that points to this station.

Run `npm test` after editing. It fails if a line turns at an angle other than 45° or 90°, if a station sits within 40px of a corner, if the morph would break, or if markers fall out of route order.

## How the ride works

`src/ride/useRide.ts` is a small reducer with timers:

```
idle ──go(i)──▶ depart ──T/2──▶ arrive ──T+40──▶ idle
idle ──toggle──▶ morph ──760ms──▶ idle
```

- `T = clamp(800 + distance × 2, 1100, 2400)` ms. Distance is measured along line 7.
- On `go`, one state update sets the target, `T` and the direction. The map marker (`offset-path` on line 7), the rail marker and the wipe all start from that update, with the same `T` and easing, so they stay in sync.
- At `T/2` the wipe fully covers the content. The page swaps, scroll resets, and the URL is pushed.
- Clicks are ignored mid-ride. Back/forward can't be ignored, because the URL has already changed, so it is queued and ridden on arrival.
- With reduced motion: `T = 150`, no wipe, line draw or stagger. The marker jumps and the page crossfades.

---

## Deploy (Vercel preview, private)

The beta is its **own Vercel project**, so production isn't affected.

1. In Vercel: **Add New → Project**, import `johnrubino/design-portfolio`.
2. Set **Root Directory** to `beta`. The framework (Vite), build command and output come from `beta/vercel.json`.
3. Under **Settings → Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `BETA_PASSWORD` | the beta password (required; without it every request gets 503) |
   | `RESEND_API_KEY` | same key as the main site, for the walkthrough form |
   | `NOTIFY_EMAIL` | where walkthrough requests go (optional) |
   | `RESEND_FROM` | sender address (optional) |

4. Deploy the `design/rta-beta` branch. Visitors get a browser password prompt; any username works.

**Private beta protections:**

- `<meta name="robots" content="noindex, nofollow">` in `index.html`
- An `X-Robots-Tag: noindex, nofollow, noarchive` header on every response (`vercel.json` and `middleware.js`)
- A Basic-auth password gate in `middleware.js` (Vercel Routing Middleware)

The repo-root `.vercelignore` keeps `beta/` and `design/` out of the main site's deployment.

**Walkthrough form:** posts to `api/walkthrough.js`, which emails you through Resend. To use Formspree or similar instead, set `VITE_WALKTHROUGH_ENDPOINT` to the form URL.

---

## Layout and responsive behaviour

| Width | Behaviour |
|---|---|
| ≥ 1280 px | Full layout: the expanded map is the only navigation, and the page starts at the top. The map's collapsed state is remembered in `localStorage`. There is no top navigation at any width where the map exists. |
| 900–1279 px | The map collapses by itself, live as the window resizes, and expands again above 1280. The toggle still works; a manual choice holds until the width crosses 1280 again. |
| < 900 px | The map is hidden and the page rail becomes the navigation (it scrolls sideways). A **Map** button opens the full route map as a sheet; the ride plays there, then the sheet closes. |

On windows shorter than 900 px, the whole map layer (lines, labels and marker) scales down together, so the marker stays on its line.

## Departures from the original prototype

See `../design/DIRECTION-v2.md` for the full list. In short:
- No authority branding and no transit voice.
- An abstract schematic with thinner, wider-spaced lines.
- Invented markers: line chips and station slots.
- Frosted glass instead of 1972 paper: a translucent rail, backlit lines, dark-glass signs. The map has no panel of its own; it sits directly on the page, and the frosted rail appears on phones only.
- The last stop is Résumé.
- The page-name plate uses `--title` (`#C04A16`) so 80px names pass WCAG AA large-text contrast. Focus rings are 2px orange everywhere.

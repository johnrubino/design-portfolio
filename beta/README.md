# Rubino Transit Authority — portfolio beta

A working beta of johnrubino.design, built as a subway system. Each body of work is a **line**, each page is a **station**, and the route map is the only navigation. Choosing a station sends a train along line 7 while the page changes behind a colour wipe.

- **Spec:** `../design/RTA-beta-brief.md`
- **Approved prototype:** `../design/Journey.dc.html`. It was ported to this app, not run.
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
| `npm test` | Geometry tests. They check the generated map against the prototype's paths. |

Every station is a real URL: `/`, `/case-studies`, `/labs`, `/writing`, `/timetable`. Deep links work, and back/forward ride the train in the right direction.

---

## Edit content

All copy lives in typed files in `src/content/`. You don't need to touch components.

| File | What's in it |
|---|---|
| `site.ts` | Name, sign line, footer text, **contact links** |
| `about.ts` | Lede, bio, departure-board headings |
| `caseStudies.ts` | The four case-study rows and the walkthrough form copy |
| `labs.ts` | Labs experiments |
| `writing.ts` | Intro, Substack link, fallback post list |
| `timetable.ts` | Work history board and contact links |
| `lines.ts` | Line names, colours, disc numbers, "calls at" notes, **geometry** |
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

Each line in `src/content/lines.ts` has:

- `centre`: the centreline vertices in 460 × 900 map space. Turn only at 45° or 90°. Every line starts on the shared trunk at x = 150.
- `lane`: the sideways offset in 9 px steps. A positive lane is to the right of the direction of travel, which runs from About outward. Lane 0 is the trunk.
- `collapsedEndY`: where the line stops in the collapsed bundle.

`src/geometry/network.ts` turns these into paths:

```
expanded:  centre → offsetPts(lane × 9, miter joins) → rounded(radius 20)
collapsed: centre vertices → same vertices on a vertical lane (x = 64 − lane × 9),
           each at its proportional arclength → rounded(radius 20)
```

Both versions go through `rounded()` with the same vertex count. It always emits `M`, then `L Q` for each corner, then `L`, keeping zero-length segments. So expanded and collapsed paths always share one command list, and the CSS `d` transition can morph between them. `npm test` checks this for every line.

Each station in `src/content/stations.ts` has:

- `at`: a point on the shared centreline. Dots appear on every line in `lines` that passes through it, and the train's parking spot is measured from line 7's dot.
- `label`: which side the label sits on, and the x of its inner edge.
- `collapsedY`: the station's height in the collapsed bundle.
- `mainLine`: the colour of the big disc on the "Next stop" sign that points to this station.

After editing, run `npm test`. The "matches the prototype" tests will fail once you deliberately move away from the prototype. Update or delete the reference paths in `src/geometry/network.test.ts` at that point. The "morphable" and "distances increase" tests should always pass.

---

## How the ride works

`src/ride/useRide.ts` is a small reducer with timers:

```
idle ──go(i)──▶ depart ──T/2──▶ arrive ──T+40──▶ idle
idle ──toggle──▶ morph ──760ms──▶ idle
```

- `T = clamp(800 + distance × 2, 1100, 2400)` ms. Distance is measured along line 7.
- On `go`, one state update sets the target, `T` and the direction. The train (`offset-path` on line 7), the strip marker and the wipe all start from that update, with the same `T` and easing, so they stay in sync.
- At `T/2` the wipe fully covers the content. The page swaps, scroll resets, and the URL is pushed.
- Clicks are ignored mid-ride. Back/forward can't be ignored, because the URL has already changed, so it is queued and ridden on arrival.
- With reduced motion: `T = 150`, no wipe, line draw or stagger. The train jumps and the page crossfades.

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
| ≥ 1200 px | Full layout. The map's collapsed state is remembered in `localStorage`. |
| 900–1199 px | Starts with the map collapsed. |
| < 900 px | The map is hidden and the in-train strip becomes the navigation (it scrolls sideways). A **Map** button opens the full route map as a sheet; the ride plays there, then the sheet closes. |

On windows shorter than 900 px, the whole map layer (lines, labels and train) scales down together, so the train stays on its line.

## Deliberate departures from the prototype

- **Station-name plate colour** is `--title: #C4501A` instead of `#F26B2A`. The brief's orange is 2.4:1 on the paper; the darker cut passes WCAG AA for large text (3.7:1). Everything else orange still uses `#F26B2A`. To revert, change `--title` in `src/styles/tokens.css`.
- **Focus rings** are 2 px orange everywhere. The prototype used blue on some elements.
- **Route discs** are SVG and `aria-hidden`. Each line's name is always given in nearby text.

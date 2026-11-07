# Brief: Rubino Transit Authority portfolio (beta)

Build a working beta of my new portfolio site, johnrubino.design. The site works like a subway system. Each body of work is a **line**, each page is a **station**, and a route map is the only navigation. Clicking a station sends a train along the map to it while the page changes behind a colour wipe.

The attached `Journey.dc.html` is the approved design prototype. Treat it as the source of truth for layout, colours, map geometry (every SVG path is in it), copy and animation timing. It uses a proprietary canvas runtime (`<x-dc>`, `{{holes}}`, `<sc-if>`, `class Component extends DCLogic`), so **port it, don't run it**. Read it for values and rebuild it as a normal web app. Screenshots are attached for visual reference.

---

## 1. Stack and setup

- **Framework:** Vite + React + TypeScript. Plain CSS with custom properties, one tokens file. No Tailwind, and no UI kit.
- **Routing:** one route per station: `/` (About), `/case-studies`, `/labs`, `/writing`, `/timetable`. URLs must be shareable and back/forward must work. Browser back rides the train backwards.
- **Animation:** CSS transitions and keyframes plus a small React state machine. Add Framer Motion only if something can't be done cleanly in CSS. The SVG path morph uses the CSS `d` property.
- **Content:** each station's copy lives in a typed content file (`src/content/*.ts`), so I can edit copy without touching components.
- **Deploy:** a Vercel preview with `noindex` (meta tag + `X-Robots-Tag`) and simple password protection, because this is a private beta.
- Write a README covering how to run it, how to edit content, and how to change the map.

## 2. Layout (desktop, 1440 × 900 reference)

The page is two panels side by side at full viewport height.

**Left panel: the route map.** 460 px wide, collapsible to 128 px. This is the only navigation; there is no top nav and no site header.
- **Top 96 px is a station sign:** true black `#111`, a 2 px white rule 8 px from the top, "John Rubino" in white (31 px, weight 500), and under it in grey `#BDBDBD`, 12 px: "Rubino Transit Authority · Select a station to ride". A round 44 px collapse button sits on the right, with the arrow described below.
- **Below the sign is the map.** It's styled after the 1972 Vignelli NYC subway map: flat beige land `#E9D8B8`, a second flat land tone `#DFC79F`, flat grey parks `#CBBFA8` and cream rivers `#F3E8D3`. There's no texture on the land. The map has a thin frame, A–F grid letters down the left and 1–4 along the bottom, and district names (Enterprise, Colllective, Writing) at 19 px weight 500.

**Right panel: the content.** It fills the remaining width and scrolls on its own.
- **Top 150 px is a fixed "line map in the train" strip** that doesn't scroll (§5).
- The page content scrolls below the strip.

## 3. The network

There are seven lines, drawn 8 px wide and tightly bundled at 9 px spacing, so neighbouring lines are separated by a 1 px gap. Lines turn only at 45° and 90°, with rounded corners. Take the exact paths from the prototype's SVG, or rebuild them from the centreline + lane-offset data in §9.

| Disc | Colour | Line | Ends at |
|---|---|---|---|
| 1 | `#E8453C` red | Future of Wealth Advisory | east, after Case studies |
| 2 | `#F26B2A` orange | Fully Paid Lending | east, after Case studies |
| 3 | `#F4AE1E` yellow (dark text) | New Account Opening | east, after Case studies |
| 4 | `#1E9A5B` green | Purple Panda Rentals | east, after Labs |
| 5 | `#7A5BA6` purple | Colllective Labs | east, after Labs |
| 6 | `#8E5A45` brown | Design Thinker on Substack | south-west, after Design Thinker |
| 7 | `#1F6FB8` blue | the "local": calls at every station | Timetable |

There are five stations, in this order, which is the train's route on line 7:

| # | Station | Route | Lines stopping | Map label sub-line |
|---|---|---|---|---|
| 01 | About | `/` | all 7 (every line starts here) | Start here |
| 02 | Case studies | `/case-studies` | 1, 2, 3, 4, 7 | 4 projects |
| 03 | Labs | `/labs` | 4, 5, 7 | Experiments |
| 04 | Design Thinker | `/writing` | 6, 7 | Writing |
| 05 | Timetable | `/timetable` | 7 | Résumé · contact |

- **Station markers (Vignelli style):** a small black dot on each line that stops there, joined by a 3 px black bar. Lines that pass through without stopping get no dot.
- **Line ends:** a black end dot plus a coloured route disc with its number, labelled with the project name.
- **Station labels are the navigation.** They're real `<button>`s at 15 px weight 500, with a mono sub-line.
- **The current station's label becomes a mini station sign:** dark plate, light text and a thin light rule near the top. Its sub-line reads "You are here". During a ride, the destination's sub-line reads "Arriving".
- **Hovering a station** fades every line that doesn't stop there to 22 % opacity (280 ms).
- **The current station** gets a white capsule with a 3 px dark border laid across its lanes. It pops in on arrival (520 ms, overshoot easing) and has a slow orange pulse ring.

## 4. The ride (the main interaction)

Clicking a station, a strip label or a "Next stop" sign does this:

1. **Duration:** `T = clamp(800 + distance_px × 2, 1100, 2400) ms`, where distance is measured along line 7 between the two stations.
2. **The train** is a 30 × 13 px dark capsule with three small windows and an orange headlight. It rides line 7 using CSS `offset-path` (line 7's path), `offset-rotate: auto`, and `offset-distance` transitioning over `T` with `cubic-bezier(.65,0,.35,1)`. At rest it parks 24 px past its station (24 px before Timetable). The train only travels along the line; it never jumps.
3. **The old page** slides 36 px away from the direction of travel and fades to 25 % (520 ms).
4. **The wipe:** a panel the colour of the paper sweeps across the content area over `T`, with a bundle of 9 px vertical stripes on both edges. The stripes are the destination station's line colours, in disc order. Going forward, it travels right to left; going back, left to right. The easing is symmetric, so at `T/2` the panel fully covers the content.
5. **At `T/2`:** swap the page content, reset the scroll to the top, and update the URL.
6. **The new page enters:**
   - Elements rise 16 px and fade in, staggered 70 ms apart (760 ms, `cubic-bezier(.2,.7,.1,1)`), starting at `T × 0.18`.
   - The big station name rolls up from below inside its plate (900 ms, `cubic-bezier(.16,1,.3,1)`).
7. **While moving:** a blinking orange dot reads "Next stop · {station}" at the top-left of the strip. Ignore clicks during a ride.
8. **First load:**
   - The lines draw outward from About (stroke-dashoffset, 1500 ms, staggered 90 ms per line).
   - Station dots fade in at 1300 ms, then the labels and the train.
   - The content enters after that.

## 5. In-train line strip (top of the content panel)

This is based on page 76 of the NYCTA Graphics Standards Manual.

- **The strip:** a 14 px tan band with a 12 px black dot for each station, spaced across the width.
- **Station names** are set at −45° above their dots. The current station is in weight 500; the others are weight 300, like the manual's express/local distinction. The names are clickable.
- **Transfer discs:** small 13 px discs for each station's lines hang below its dot, wrapping 4 per row. A "7" sits at each end of the band.
- **The orange marker:** a 20 px disc that slides along the band in sync with the train, using the same `T` and easing.

## 6. Collapse mode

The arrow button in the black sign collapses the map from 460 px to 128 px over 700 ms with `cubic-bezier(.65,0,.35,1)`. The content panel grows to fill the space.

- **The lines morph** into a straight vertical bundle using a CSS transition on `d`. Expanded and collapsed paths must use the same commands, so generate both from the same vertices.
  - Each line runs down its own lane: lanes centred at x = 64, 9 px apart.
  - Each line ends at its own height: 1 → 380, 2 → 405, 3 → 430, 5 → 600, 4 → 630, 7 → 835, 6 → 860.
  - Each vertex keeps its proportional position along the line.
- **Land, rivers, labels, frame and line-end labels** fade out (380 ms) as the panel narrows. Collapsed-mode station dots fade in after 420 ms.
- **The train** is hidden during the morph, then reappears on the collapsed line-7 path at the right distance.
- **In collapsed mode,** each station has a hover/focus target over the bundle. It shows the station name as a small black sign to the right of the rail and rides there on click.
- **The arrow** rotates 180° between states. Use `aria-expanded` and an "Expand route map" / "Collapse route map" label.
- Remember the collapsed state in `localStorage`, wrapped in try/catch.

## 7. Content pages: the "manual page" grammar

Each station page follows the NYCTA manual's page layout:

1. **Header row:** a 1 px rule, then three columns at 11.5 px.
   - First column: "Station 02" over the station name, in weight 500.
   - Second column: the station's line discs at 20 px.
   - Third column: "Served by {line names}."
2. **Station ID plate:** like "Avenue M" / "Times Square" on manual page 63. The station name is 84 px, weight 500, tracking −0.03em, in orange `#F26B2A`, inside a 1 px dark outline with a 13 px dark band across the top.
3. **The body copy for the page** (§8), using ruled tables and lists with 2 px dark top rules.
4. **"Next stop" sign:** like "179 Street / Euclid Avenue" on manual page 76.
   - A 112 px disc in the next station's main line colour sits beside a dark plate with a thin light rule near its top.
   - The plate reads "Next stop" (small) and the station name (40 px), with the arrow at the right; the arrow slides 8 px on hover.
   - The last station shows "End of the line → Back to About" instead.
5. **Footer:** a 1 px rule, then four columns at 10.5 px: "Rubino Transit Authority" · "Portfolio Standards Manual 2026" · "John Rubino, Product Designer" · "{Station} Page 0X".

**The arrow is the NYCTA arrow,** drawn as SVG, never the "→" character. In a 100 × 100 box: shaft `M8 50 H82`, head `M50 16 L84 50 L50 84`, stroke 15, miter joins. Use it on "Request walkthrough", the Substack link and the Next stop sign.

## 8. Content (copy is in the prototype; flagged items are placeholders)

- **About:**
  - Lede: "I design the systems behind enterprise wealth platforms."
  - A short bio paragraph.
  - A departure board listing all 7 lines with columns Line / Destination / Calls at.
- **Case studies:** four rows: Fully Paid Lending, Future of Wealth Advisory, New Account Opening, Purple Panda Rentals.
  - Each row has its disc, title, role · year, a one-line description and a "Request walkthrough" link.
  - The enterprise work is under NDA, so "Request walkthrough" opens a simple request form (name, work email, project; validated; with a confirmation state). For the beta, the form can post to a stub or Formspree.
- **Labs:** three experiments. *Placeholder copy.*
- **Design Thinker:** four post titles with dates and a link to Substack. *Placeholder: pull real posts from the Substack RSS feed if that's easy, otherwise keep them static.*
- **Timetable:** a departure board with When / Where / Role, then Email · LinkedIn · Résumé PDF links. *The links are placeholders.*

Put every placeholder in the content files with a `// TODO(john)` comment.

## 9. Visual system

- **Colours:**
  - Paper: `#F3E8D3` (map), `#EFE3CC` (content).
  - Ink: warm dark brown `#2A1C14` for text, rules and dots. True black `#111` is used only for the nav sign.
  - Secondary text: `#4A382B`. Mono/meta text: `#76604C`.
  - Accent: orange `#F26B2A`, hover `#D4561C`.
- **Type:** Archivo (Google Fonts) at weight 500 throughout, like the manual's single-weight Standard Medium. Weight 300 is used only for the non-current strip labels. IBM Plex Mono is for small meta text.
- **Texture (subtle; it should barely show):**
  - A paper grain over everything: an SVG `feTurbulence` overlay with `mix-blend-mode: multiply` at low alpha.
  - The coloured map lines and the big station names get a very light ink-speckle/edge-roughening filter.
  - The colour lines are offset about 1 px from the dark ink, like a slightly misregistered print.
  - Faint fold creases cross the map.
- **Geometry source:** port `offset_pts` + `rounded` (lane offset with miter intersection, then quadratic-rounded corners, radius 20) as a small TS util. That way I can edit centrelines and lanes instead of raw paths.
  - Line centrelines and lane indices: see the line definitions in the prototype.
  - Lane spacing is 9; a positive lane is to the right of the direction of travel.

## 10. Responsive (beta minimum)

- **Desktop ≥ 1200 px:** the full layout as above.
- **900–1199 px:** start with the map collapsed.
- **< 900 px:**
  - Hide the left map.
  - The in-train strip becomes the main navigation, pinned to the top, scrolling sideways if needed, with labels kept readable.
  - Add a "Map" button in a slim black sign bar that opens the full route map as a full-screen sheet. The ride animation plays there, and the sheet then closes.

## 11. Accessibility

- All stations are real buttons/links that work from the keyboard, with visible focus rings (2 px orange).
- The current station has `aria-current="page"`.
- The map SVG is `aria-hidden`; the labels carry the meaning.
- Announce each arrival in an `aria-live="polite"` region ("Now at Labs").
- `prefers-reduced-motion`: no wipe, no line draw and no stagger. The train jumps and the page crossfades in 150 ms.
- Body text contrast must pass WCAG AA on the paper colour.

## 12. Done when

- [ ] All five routes render, deep links work, and back/forward rides the train in the right direction.
- [ ] The ride timing, wipe colours, strip marker and train stay in sync, with no jumps or flashes at `T/2`.
- [ ] Collapse/expand morphs smoothly in both directions and the train lands correctly afterwards.
- [ ] At 1440 × 900 it matches the attached screenshots within reason.
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95 on desktop.
- [ ] The site is deployed to a password-protected, noindex Vercel preview, and the README is written.

**Out of scope for the beta:** a CMS, analytics, real case-study detail pages (the walkthrough form stands in for them), and dark mode.

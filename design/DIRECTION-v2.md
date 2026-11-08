# Direction v2: abstract schematic

v2 keeps the core idea of the beta: pages as stations on a line map, and a marker that rides between them while the page changes behind a wipe. It drops the parts that impersonated a real transit system. Where this note and `RTA-beta-brief.md` / `Journey.dc.html` disagree, this note wins.

## What changed, and why

| Brief section | v1 (prototype port) | v2 |
|---|---|---|
| §2 Left panel | 460px panel (collapsible to 128px) under a black station sign, divided from the page | **No panel** (v2.2). The map sits directly on the page: no fill, edge or shadow, and the name and toggle are plain ink. The page rail's left edge fades into the map. The map collapses by itself below 1280px, live as the window resizes. |
| Name and voice | "Rubino Transit Authority", "Select a station to ride", "Next stop", "You are here", "Portfolio Standards Manual" | No authority brand. Plain first-person copy: "John Rubino / Product designer", "Next", "Back to start", "02 / 05". |
| §2 Map | Vignelli-style borough map: land, rivers, parks, districts, A–F grid | A fictional schematic drawn straight onto the page: a 24px dot grid with crosshairs every four cells, fading out toward the content. No panel, frame or zones. |
| §3 Lines | 8px lines bundled 9px apart, radius 20 | 3.5px lines 13px apart, radius 32, centrelines on a 24px module, branches peel off one at a time |
| §3 Markers | MTA-style numbered discs; Vignelli dots and bar | The **line chip**: a square with a 45° cut corner and a two-letter code (FW, FP, NA, PP, CL, DT, RE). Stations are **slots**: a hollow pill across the stopping lanes, with a tick on each line that stops. |
| §3 Current station | White capsule with an orange pulse ring | The slot fills with ink, an accent line runs through it, and a soft halo breathes |
| §4 Train | Three-window car with a headlight | A slim ink capsule with one accent light; same path, timing and easing |
| §4 Wipe | Paper-coloured panel with 9px stripes | A frosted sweep (blurred glass) with thin 3px stripes in the destination's line colours |
| §5 Strip | NYCTA manual p.76 band, −45° labels, "7" at each end, always visible | A thin rail with tick stops, horizontal labels and small chips. **Phones only** (v2.4): wherever the left map exists, collapsed or not, the map is the only navigation. |
| §7 Page grammar | "Station 02 / Served by …"; footer quoting the manual | The header row is removed (v2.5), so each page opens with the page-name plate; footer is name · role · domain · page |
| §8 Last stop | Timetable, `/timetable` | Résumé, `/resume` (`/timetable` redirects) |
| §9 Material | 1972 paper: grain, ink speckle, misregistration, fold creases | **Frosted glass** (v2.1): a cool off-white ground lit by faint washes of the line colours; translucent, blurred map panel and page rail with bright inner edges; page content scrolls under the rail; lines carry a soft backlit glow in their own colour; dark-glass signs. No print effects. |
| §9 Ink | Warm brown `#2A1C14` | Cool graphite `#1A1E24` |
| §9 Type | Archivo 500 | Archivo, with signage text at width 112% |

## The hint of signage that stays
- The dark band across the top of the page-name plate
- A thin light rule inside the dark signs
- The wayfinding arrow, thinner
- The inverted label that marks the current page

## Unchanged
Routing, the ride state machine and its timing, the T/2 swap, the collapse morph, the responsive behaviour, accessibility, and the deploy setup.

## v2.1: frosted glass
v2 first shipped with a mix of matte enamel and frosted panels. v2.1 commits to the frosted-panel direction. All of it lives in `beta/src/styles/tokens.css` (`--glass*`, `--wash-*`, `--sign*`) plus the glow filter in `RouteMap/MapBase.tsx`.

CSS backdrop blur only samples inside the element's own box, so the page rail's fill gets denser toward its bottom edge to keep content passing underneath from showing sharp there.

## v2.2: the map is part of the page
The map no longer reads as a separate panel.
- `.routemap` has no fill, edge or shadow. The washes behind the glass run continuously behind map and page.
- The black sign is gone: "John Rubino / Product designer" and the toggle are ink on the page. Dark plates stay only where they carry meaning: the current-page label, collapsed-mode tooltips, the Next sign and the page-name band.
- The dot grid and crosshairs fade out toward the content through an SVG mask (`seam-fade` in `MapBase.tsx`) and hide when the map is collapsed. The faint zone rectangles were removed because they had hard edges.
- The frosted page rail's left edge fades in (`mask-image` in `strip.css`).
- The map auto-collapses below **1280px** and expands above it, live. A manual toggle holds until the width crosses the breakpoint again. Below 900px the map becomes the full-screen sheet, which is now an opaque ground.

## v2.3 and v2.4: the page rail
v2.3 showed the rail whenever the map was collapsed. v2.4 removes it entirely wherever the left map exists (900px and wider, collapsed or expanded). It is not rendered at all there, so it costs nothing in the DOM or the tab order, and the page starts at the top. On phones (under 900px) the map is a sheet, so the rail (`LineStrip`, rendered only when `isMobile` in `App.tsx`) is the navigation. The collapse morph, the rail's left-edge fade and the show/hide rules were deleted.

Consequence: in the collapsed map, page names appear only on hover or keyboard focus (the dark tooltip beside each stop).

## v2.5: no page header row
Removed on every page, following a comment on the preview. The "02 / 05 + line legend" row repeated the page name and the footer's page number. Chips still carry their project names beside them wherever they appear (case-study rows, About board, line ends on the map).

## v2.6: logo placeholder; hover opens the map
Following a comment on the preview, the "John Rubino / Product designer" block at the top of the map is replaced by a **logo placeholder** (`beta/src/components/Logo.tsx`): the line chip's cut-corner square in ink with a JR monogram. Swap that one file for the real mark. The expand/collapse button is gone.
- **1280px and up:** the map stays expanded, and the logo is just a logo.
- **900–1279px:** the map is collapsed. Moving the pointer over the logo or the line bundle opens it after 120ms, as a floating frosted panel over the page (the page doesn't move). It closes 280ms after the pointer leaves. Opening is triggered by movement, so a cursor that happens to rest there on page load doesn't pop it open.
- **Keyboard:** focusing the logo opens the map; Escape closes it and returns focus to the logo.
- **Touch:** tapping the logo toggles it. A tap outside closes it, and after a station tap the map closes once the ride arrives.
- **Mid-ride requests:** an open/close request during a ride or morph is applied when it finishes (`setExpanded` in `useRide.ts`).
- **Morph speed:** the expand/collapse morph is now 480ms (`--morph-ms`, `MORPH_MS`).
- **Phones:** the logo also replaces the name in the phone bar (light version) and the map sheet header. The remembered collapse preference (`localStorage`) was removed.

## v2.7: open on click, not hover
On narrow screens (900–1279px) the map now opens when you **click or tap the logo**, not on hover. It stays open until you click the logo again, click outside the map, press Escape, or ride to a station (it closes on arrival, unless you're moving through the map with the keyboard). Keyboard: focusing the logo doesn't open it; Enter or Space does. The collapsed bundle keeps its small hover labels. The hover-intent timers were removed.

## v2.8: Vignelli discs and lines
At John's request, the line markers and the lines go back to the Vignelli language:
- **Route discs:** round bullets in the line colour with the line number 1–7 (`components/Disc.tsx`). They replace the cut-corner chips and two-letter codes everywhere: line ends, page rows, the About board, the Next sign and the phone rail.
- **Lines:** the Vignelli bundle. 8px lines 9px apart (a 1px gap), corner radius 20, flat colour with the backlit glow removed. The routes (centrelines) are unchanged.
- **Stations:** a black dot on each line that stops, joined by a short black bar. The current page keeps its ink capsule with the orange line and halo.
- **Line ends:** a black end dot, then the disc.

The schematic plane (dot grid), frosted material, logo, copy and behaviour are unchanged.

## v2.9: each area carries only its own lines
Before, lines 5 and 6 ran straight through Case studies (and 6 through Labs) without stopping, so the stations looked like they spanned every line. The routes are reorganised so each station sits only on the lines that stop there:
- **About:** all seven lines start here.
- **Case studies:** right after About, lines 5 and 6 split off as a pair onto their own track down the left, so Case studies carries only lines 1, 2, 3, 4 and 7.
- **Labs:** line 5 rejoins the spine here, so Labs carries lines 4, 5 and 7. Line 5 then ends in the space to the left.
- **Writing:** line 6 rejoins here, so Writing carries lines 6 and 7. Line 6 then ends to the left.
- **Line 7 (Résumé)** is now one straight spine (x = 228), so every ride travels in a straight line.

Station labels for Case studies and Labs moved to the right of the spine. A new geometry test fails if any line passes through a station it doesn't stop at.

## v2.10: five lines
Labs and Writing are pages, not bodies of work, so the Colllective Labs and Design Thinker on Substack lines are removed (and with them the left-hand track from v2.9).
- **Lines:** five now. 1 Future of Wealth Advisory, 2 Fully Paid Lending, 3 New Account Opening, 4 Purple Panda Rentals, 5 Résumé (renumbered from 7 so the discs run 1–5).
- **Stations:** About and Case studies carry lines 1–5; Labs carries 4 and 5; Writing and Résumé sit on line 5 only.
- **Map:** one straight Résumé spine, with the enterprise branches after Case studies and Purple Panda's branch after Labs. Writing and Résumé moved up to y 708 and 840.
- **Collapsed bundle:** recentred under the logo (`COLLAPSED_X` 55).
- **Next signs:** the Labs sign shows disc 4 and the Writing sign disc 5.

## v2.11: expanded map centred
The expanded map is centred in its 460px space, with equal room left and right (measured at 84 / 83px at 1440px). `RouteMap.tsx` measures the lines, the end discs and the station labels on load (and again once fonts are ready), then shifts the whole map layer sideways via `--shift-x`. The marker's path moves with it. Collapsed mode ignores the shift, and the shift animates with the expand/collapse morph. Because it's measured, the map stays centred after routes or labels change.

## v2.12: Case studies as a parent line
Each case study used to be its own line from About, so Case studies looked like a junction of separate lines. Now Case studies is **one line** (red, disc 1) with the projects as stops along it:
- **Route:** the Case studies line leaves About alongside the Résumé spine (blue, disc 2) and stops at the Case studies station. It then branches off and runs down to the right, calling at Fully Paid Lending, Future of Wealth Advisory, New Account Opening and Purple Panda Rentals, and ends in its disc.
- **Clicking a project stop:** the marker rides to Case studies, then the page scrolls to that project's row and highlights it. If you're already on Case studies, it just scrolls and highlights.
- **Data:** project stops are defined in `content/caseStudies.ts` (`slug`, `mapLabel`, `stop`). Lines are now just `cs` and `resume` in `content/lines.ts`.
- **Pages:** case-study rows show a small stop mark (a run of the red line with a station dot) instead of separate discs. The About board lists the two lines and what each one stops at.
- **Labs, Writing and Résumé** sit on the Résumé line only.

## v3.0: the site's own IA
The beta now follows the live site's information architecture (johnrubino.design): **Home → Labs → About → Writing → Résumé**, with copy taken from the live pages.
- **Home** (`/`): the "John Rubino" plate, positioning line, the four figures (4+ years, 3 enterprise platforms, $1T+ AUM context, 0→1), "Currently" (BNY Pershing, Colllective Design, Design Thinker), selected work, and the "Let's build something that matters" call to action. It replaces both the old About-as-landing page and the separate Case studies page. `/case-studies` now redirects to `/`.
- **Labs:** the real projects (Navori, Music Maker, AI Knowledge Co-op).
- **About:** the live About copy. **Résumé:** the live summary and real roles and dates.
- **Lines:** three, each one a body of work:
  - **Work** (red, 1): leaves Home and stops at Future of Wealth Advisory, Fully Paid Lending and Purple Panda Rentals, the three projects on the live homepage. New Account Opening is no longer listed; add it back in `content/caseStudies.ts` to restore it.
  - **Labs** (purple, 2): runs with the spine to Labs, then stops at each project.
  - **Résumé** (blue, 3): the spine through every page.
- **Project stops** on either line ride to that page, then scroll to and highlight the project.
- **Station labels** for pages sit in a column to the left of the spine; project names sit to the right of their lines.

## v3.1: station-sign page headers
Following a comment on the preview, every page now opens with a **station sign** in the same form as the Next sign at the bottom: the page's line disc, then a dark plate reading "Line N · Name" above the page name (Home: "Line 1 · Work / John Rubino"; Labs: "Line 2 · Labs"; About, Writing and Résumé: "Line 3 · Résumé"). It replaces the orange page-name plate. The roll-up animation and focus-on-arrival moved to the new heading, and the `--title` token is gone.

## v3.2: no Next tiles
Following a comment on the preview, the "Next / Back to start" tiles at the bottom of each page are removed. Pages end with the footer, and the map (or the phone rail) is the only way to move between pages, as the original concept intended.

## v3.3: printed-ink texture on the lines
The lines get a light printed-ink texture after the 1972 map in print: fine speckle where the ink didn't take, a soft uneven tone along each run, and very slightly roughened edges. It's one SVG filter (`#print-ink` in `RouteMap/MapBase.tsx`) applied to the lines group, so it also covers the collapsed bundle. Discs, station dots and labels stay crisp. To tune it: the speckle amount is the `speck` matrix (alpha row `-6 … 5.35`; a lower offset gives more speckle), the tone variation is the `wash` matrix (`0.14 … -0.05`), and edge roughness is the displacement `scale` (0.35). v3.4 reduced all three so the texture is barely visible.

## v3.5: line texture removed
The printed-ink texture (v3.3, reduced in v3.4) is removed for now; lines are flat colour again. To bring it back, restore the `#print-ink` filter from commit 977431f in `RouteMap/MapBase.tsx` and add `filter="url(#print-ink)"` to the lines group in `RouteMap.tsx`.

## v3.6: direction-sign page headers
Page headers now follow the direction signs in the 1970 standards manual (p. 59): a black band over a row of square modules divided by thin rules.
- **Modules, left to right:** ← back arrow, the page's line disc, the page name (set large, top-left), → forward arrow. The disc always sits directly left of the page name (v3.7, per a preview comment).
- **The arrows are buttons:** they ride to the previous or next page exactly as a station click does, with the wipe reversed going back.
- **Ends of the route:** the arrow module is left blank (no ← on Home, no → on Résumé), the manual's way of showing no direction.
- **Caption:** the line's name and number sit in a small caption under the sign ("Line 2 · Labs"), the way the manual numbers each example.
- **Phones:** modules shrink to 56px.

Tokens: `--sign-panel`, `--ds-rule`. Styles live in `page.css` (`.dsign`). `Arrow` gained a `weight` prop for the heavier manual arrow.

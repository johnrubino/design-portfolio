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

# Direction v2: abstract schematic

v2 keeps the core idea of the beta: pages as stations on a line map, and a marker that rides between them while the page changes behind a wipe. It drops the parts that impersonated a real transit system. Where this note and `RTA-beta-brief.md` / `Journey.dc.html` disagree, this note wins.

## What changed, and why

| Brief section | v1 (prototype port) | v2 |
|---|---|---|
| Name and voice | "Rubino Transit Authority", "Select a station to ride", "Next stop", "You are here", "Portfolio Standards Manual" | No authority brand. Plain first-person copy: "John Rubino / Product designer", "Next", "Back to start", "02 / 05". |
| §2 Map | Vignelli-style borough map: land, rivers, parks, districts, A–F grid | A fictional schematic: frosted panel, 24px dot grid, crosshairs every four cells, three faint unlabelled zones |
| §3 Lines | 8px lines bundled 9px apart, radius 20 | 3.5px lines 13px apart, radius 32, centrelines on a 24px module, branches peel off one at a time |
| §3 Markers | MTA-style numbered discs; Vignelli dots and bar | The **line chip**: a square with a 45° cut corner and a two-letter code (FW, FP, NA, PP, CL, DT, RE). Stations are **slots**: a hollow pill across the stopping lanes, with a tick on each line that stops. |
| §3 Current station | White capsule with an orange pulse ring | The slot fills with ink, an accent line runs through it, and a soft halo breathes |
| §4 Train | Three-window car with a headlight | A slim ink capsule with one accent light; same path, timing and easing |
| §5 Strip | NYCTA manual p.76 band, −45° labels, "7" at each end | A thin rail with tick stops, horizontal labels and small chips |
| §7 Page grammar | "Station 02 / Served by …"; footer quoting the manual | "02 / 05" plus a chip legend; footer is name · role · domain · page |
| §8 Last stop | Timetable, `/timetable` | Résumé, `/resume` (`/timetable` redirects) |
| §9 Material | 1972 paper: grain, ink speckle, misregistration, fold creases | Matte enamel ground, frosted map panel, dark-glass signs. No print effects. |
| §9 Ink | Warm brown `#2A1C14` | Cool graphite `#1C1F23` |
| §9 Type | Archivo 500 | Archivo, with signage text at width 112% |

## The hint of signage that stays
- The dark band across the top of the page-name plate
- A thin light rule inside the dark signs
- The wayfinding arrow, thinner
- The inverted label that marks the current page

## Unchanged
Routing, the ride state machine and its timing, the T/2 swap, the collapse morph, the responsive behaviour, accessibility, and the deploy setup.

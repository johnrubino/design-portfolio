# Handoff: John Rubino portfolio home page (v5 "side rail")

You're building **one page**, the home page of John Rubino's portfolio. The approved visual source of truth is
`reference/portfolio-home-BC-v5.html`, a single self-contained static file. Open it in a browser and match it.
The renders in `renders/` were taken from that file at 2x.

John is a Senior Product Designer at BNY Pershing. **He writes his own prose.** Everything marked placeholder stays placeholder. Don't write, polish or "improve" copy, and don't invent facts, metrics, clients, tools or dates.

---

## 0. Bundle contents

| Path | What |
|---|---|
| `reference/portfolio-home-BC-v5.html` | Visual and behaviour reference: CSS, JS and inline SVG. Images are embedded as base64. |
| `renders/home_v5_fold.png` | 1440×900 first screen at rest (2x) |
| `renders/home_v5_full.png` | Full page (2x). The rail shows only at the top because the screenshot doesn't scroll. In the browser it is sticky. |
| `renders/home_v5_hover.png` | Rail hover on FPL: line lit, train dot, preview card |
| `renders/home_v5_mobile.png` | 390×844 mobile with the top strip |
| `renders/home_v4a_v5_compare.png` | Previous wide-map layout vs v5, for context only |
| `map/rail-map.svg` | Exported rail map (220×800 viewBox) |
| `map/map5.py` (+ `map4.py`) | Map geometry generator: octilinear offset bundles and rounded corners. Run `python3 map/map5.py` to regenerate `rail-map.svg`. |
| `assets/img/headshot-crop.jpg` | 320×320 headshot crop |
| `assets/3d-icons/tinted/*.png` | 192px tinted 3D icons used on the page |
| `assets/3d-icons/source-clay/*.png` | Original 500px 3dicons Clay/Dynamic PNGs |
| `assets/3d-icons/tint.py` | Script that made the tints (duotone luminance LUT, alpha kept) |

## 1. Goal and scope

- **In scope:** the home page only, desktop and mobile.
  - Sections: rail map, hero (name, intro with expanding words, "The lines" legend, latest essay, "Start with Case studies"), How I AI, and "Every stop" list.
- **Out of scope:**
  - Case-study pages, About and Timetable pages.
  - CMS and analytics.
  - Any copywriting.
- **Fidelity:** pixel-close to the reference at 1440×900 and 390×844. Where the reference and this brief disagree, **this brief wins**. Tell John about any such case.

## 2. Stack

- **First,** check whether John's existing johnrubino.design repo is available. If it is, **adapt to its stack and conventions** and build this as its home route.
- **If there's no repo:** use Astro + plain CSS, or Next.js App Router + CSS Modules. Use no CSS framework unless the repo already has one.
- Ship static HTML with progressive JS, and no client framework runtime for this page.
- **Components:** `Rail` (SVG map, hover card, train), `ExpandText` (inline word expansion), `Legend`, `HowIAI`, `StopList`.
- **Rail map:** render the SVG at build time from data (port `map5.py`'s geometry to TS) or inline `map/rail-map.svg`. Keep the class and data hooks listed in §7.

## 3. Layout

| | Desktop (≥761px) | Mobile (≤760px) |
|---|---|---|
| App | `display:flex`: rail + main column | Stacked |
| Rail | **220px** wide, `position:sticky; top:0; height:100vh`, z-index above content, dark | Becomes a ~46px sticky top strip: "System map" plus a horizontally scrollable row of line badges (Home, FoWA, FPL, PPR, Labs, W) on a thin gradient line |
| Main | `flex:1`, stone background | Full width, 20px padding |
| Hero (first screen) | `min-height:100vh`, padding 28px 56px 24px. Grid: `minmax(0,600px)` and `minmax(0,420px)`, `justify-content:space-between`, gap 56px. **Left:** eyebrow bar, name, standfirst, body, placeholder tag, then "The lines" legend pushed to the bottom (`margin-top:auto`). **Right:** column bottom-aligned with the latest-essay block and the "Start with Case studies" bar. Footer row at the bottom. | One column; `h1` may wrap |
| How I AI | Dark section. Grid `420px 1fr`, gap 72px, padding 96px 56px 104px | One column, padding 56px 20px |
| Every stop | Stone. 4-column grid of grouped rows | One column |

- At 1440×900 the hero must fit exactly with no scrollbar inside it. The empty middle of the left column is intentional: it's where the expanding paragraphs grow.

## 4. Design tokens

```
--stone:#ebe7de   --ink:#141413   --body:#3a3834   --name:#7a3a28   --paper:#f2efe8
--rail:#161615    --rail-card:#1d1d1c   --rail-label:#c9c4bb   --rail-muted:#8f8b84   --base-line:#5a5752
Line colours (fixed, do not change):
--fowa:#FF6B4A  --fpl:#E8A317  --ppr:#5B8CFF  --labs:#B57BFF  --write:#D4C09A
Placeholder tag: text #7a3a28, 1px dashed rgba(122,58,40,.5), radius 4px (on dark: #e0a58e)
```

- **Stone texture,** two layers on the main column:
  1. Grain: SVG `feTurbulence` fractalNoise (baseFrequency .85, 3 octaves), 200px tile, `mix-blend-mode:soft-light`, opacity .45.
  2. Dot grid: `radial-gradient(circle, #d3cdc0 1.4px, transparent 1.5px)` at an 18px spacing, offset 9px.
- **Rail background:** `#161615` with a faint 24px line grid (`rgba(255,255,255,.022)` 1px lines). The dark rail was chosen so the yellow and tan lines keep their contrast.
- **Line-colour glows:** a soft 12% glow (blurred circle) behind each line end.

## 5. Typography

- **Fonts (Google):**
  - Bricolage Grotesque 650: headings, the 72px name, station names
  - Public Sans 300/400/500: body. Light (300) is the body default.
  - JetBrains Mono 400: labels, codes, meta
- **Scale: only 12 / 16 / 22 / 72 px.**
  - 72: name and section titles ("How I AI", "Every stop")
  - 22: card and section-item titles, "Home" on the rail
  - 16: body, standfirst, quotes, station names
  - 12: labels, mono, legend, rail labels
- **No italics anywhere.** No `font-style:italic`, no italic font files, no `<em>` styling, and set `font-synthesis:none`.
- **Standfirst and the How I AI quote are body size (16px).** Hierarchy comes from weight and colour only.
  - Standfirst: Public Sans 400, `--ink`.
  - Body: Public Sans 300, `--body`.
  - Quote on dark: 400, `--paper`.
- Name: `#7a3a28`, letter-spacing −0.045em, line-height .92, `white-space:nowrap` on desktop. The 0.78em headshot sits inline after it; it scales 2.2× and tilts −2° on hover.

## 6. Rail map spec (see `map/rail-map.svg` and `map/map5.py`)

**Geometry:**
- Octilinear only (0/45/90°).
- **5px** lines with a 3px dark outline (`#1d1d1c`, drawn under each line) so lines running together stay distinct.
- Rounded corners, 14px corner cut.
- Lines in a bundle sit **9px** apart, centre to centre.

**Routing:**
- The grey **base line** (3px, `--base-line`) runs vertically at x=28: About (top) → Home → Timetable (bottom).
- All five coloured lines leave **Home** eastward as one bundle, turn south into vertical lanes, and peel off **to the right one at a time**, east-most first, so **no lines cross**.
- Order down the rail: FoWA → FPL → PPR → Labs → Writing.
- Each line ends at a terminus on one shared x-position.

**Station vocabulary:**
- **Interchange pills** (white `#f2efe8`, 2px dark stroke) span the lines they serve:
  - Home: a vertical pill spanning all 5 lines
  - Case studies: spans the FoWA/FPL/PPR lanes, with the label to its right
  - PPR × Labs: spans the PPR and Labs lanes
- **Regular stops:** a white circle (r 5.5) with a 3px stroke in the line colour, for the "Labs" and "Design Thinker" stations.
- **Base-line ends** (About, Timetable): a dark circle with a grey ring.

**Line badges** must match the legend exactly:
- A 44×18 pill (radius 9), filled with the line colour.
- Code in JetBrains Mono 12, text colour `#141413`.
- Codes: **FoWA, FPL, PPR, Labs, W**.

**Labels:**
- Horizontal only. End-of-line labels are Public Sans 12 in `#c9c4bb`, placed below the line end at x=96, two lines where needed:
  - "Future of / Wealth Advisory"
  - "Fully Paid / Lending"
  - "Purple Panda / Rentals"
  - "Colllective / Design"
  - "LATEST ESSAY" (mono) then "Figma isn't always / the starting line"
- Station names are Bricolage 16. "Home" is Bricolage 22, with "YOU ARE HERE" in mono 12 beneath.
- No label may touch another label, a line or a station marker.

**Hover** (per line end, using the line group's hit area):
- The hovered line lights (glow `drop-shadow(0 0 4px <line colour>)`); all other map elements dim to 14% opacity.
- Hovering **PPR** also lights Labs, because they meet at the interchange.
- A 280px paper preview card pops out **to the right of the rail, overlaying the content**, vertically aligned to the stop, with its arrow pointing left.
  - Card contents: kind label + icon, title (22px), one-line description, status.
- **Train dot:** a 4px white dot with a dark ring travels from Home along the hovered line (ease-in-out, ~2.2ms per px of path, minimum 900ms, looping).
  - Hidden and not animated under `prefers-reduced-motion: reduce`.

**Clicks:** every line end and station is a real link.

| Stop | Destination |
|---|---|
| FoWA | `#stop-fowa` (Every stop row) |
| FPL | `#stop-fpl` |
| PPR | `#stop-ppr` |
| Colllective Design | `#stop-labs` |
| Latest essay | https://johnrubino.substack.com/p/figma-isnt-always-the-starting-line (new tab) |
| About | https://johnrubino.design/about (new tab) |
| Timetable | `#stop-timetable` |
| Home | `#home` |

**HARD RULE: map interactions never filter, highlight, dim or scroll-sync the content column, and content interactions never drive the map.** The only thing the map may affect outside itself is its own hover card overlay.

## 7. Inline word expansion (modelled on emilycampbell.co)

Some words in the intro are pills: rounded, tinted 18% with their line colour, or ink 8% for neutral words.

**Hover:** the pill floods with its colour, a `clip-path` circle growing from the pointer's entry point over 0.3s. Text turns `--ink` on coloured pills and `--paper` on neutral ones.

**Click or Enter/Space:**
- The pill **turns back into plain text** with a dotted 1.5px underline in its colour (solid on hover).
- A **new paragraph appears in-flow directly under that paragraph.** It uses the same body typography, with **no box, border, background, icon, close button or source line**.
- Animation: height grows (`grid-template-rows: 0fr → 1fr`, 0.42s, cubic-bezier(.16,1,.3,1)) while the text goes from `blur(8px)`/opacity 0 to sharp in ~0.26s.
- Several paragraphs can be open at once, and they stack in document order.

**Nesting:**
- The "product designer" paragraph contains a **Wove** pill, which opens a second paragraph.
- Folding a parent folds its children.

**Close:**
- Clicking the underlined word again folds its paragraph.
- **Esc** folds the most recently opened one and returns focus to its word.

**Accessibility:**
- The words are real `<button type="button">` with `aria-expanded` and `aria-controls`.
- Closed paragraphs are `inert`.
- Under reduced motion: no blur and no animation.

The intro text and expansions are in the reference. Keep the wording verbatim; it is **placeholder**. One subtle tag, "Placeholder copy · John to rewrite", sits under the intro block.

| Word | Expands to (facts it carries) |
|---|---|
| product designer | Wealth Services group, Clearing & Servicing pods, complex financial workflows for advisors managing institutional-scale assets; ground floor of [Wove] |
| ↳ Wove | Complete rebuild of the bank's financial platform; bridging legacy software with modern UX → systems that scale |
| wealth advisory (FoWA) | Reimagined account opening and asset movement workflows for a platform consolidation; To-Do List pattern, collapsing stepper; NDA, walkthrough on request |
| lending (FPL) | Streamlined the fully paid lending program experience; advisors unlock liquidity for clients while staying compliant; NDA |
| asset movement | Sits next to account opening in Clearing & Servicing; reimagined both on FoWA |
| systems | Enterprise-level systems thinking for early-stage teams; foundations that won't break as they scale |
| handoff | Internal study with developers, tech leads, QE and Scrum leads on Figma Dev Mode; handoff is a communication problem (links the essay) |
| Design Thinker | His Substack: design practice, AI as creative infrastructure, sustainable design careers; latest essay link |
| Colllective Design | **Advisor** to Colllective Design, an AI-native product and brand studio (venture design, product strategy, 0-to-1, helping founders) |

## 8. Content facts (use exactly; don't add to them)

- **Role:** Senior Product Designer, BNY Pershing, Wealth Services, Clearing & Servicing pods.
- **Colllective Design:** John is an **advisor**, not a founder or co-founder. The spelling has **three l's**.
- **Case studies are exactly three:**

| Code | Name | Legend descriptor | List subline |
|---|---|---|---|
| FoWA | Future of Wealth Advisory | account opening, asset movement | BNY Pershing · Wealth Services · NDA |
| FPL | Fully Paid Lending | liquidity for clients, kept compliant | BNY Pershing · Wealth Services · NDA |
| PPR | Purple Panda Rentals | founder project, student rentals | Founder project · In progress |

- **Other lines:**
  - Labs: "Colllective Design · AI-native studio I advise"
  - Writing (W): "Design Thinker, essays on design and AI"
- **Latest essay:** "Figma isn't always the starting line", **Sep 29, 2026**, at https://johnrubino.substack.com/p/figma-isnt-always-the-starting-line
- **Don't use:**
  - New Account Opening (removed).
  - "AI-first advisor workspace" for FoWA.
  - Any year counts or dollar figures.

## 9. How I AI section (modelled on rakeshpatwari.work/#ai, adapted)

- **Placement:** dark section directly after the hero.
- **Section tag:** "Placeholder · John to rewrite" next to the label.

**Left column:**
- Mono label, then the 72px title "How I AI".
- **Quote** (16px, upright): "Figma isn't done. It just isn't always the starting line anymore." with the cite line "From [essay] · Sep 29, 2026".
- "WHAT I THINK": four principles. Each is a 16px/500 lead, a 16px/300 line and a mono link with an arrow. They're separated by hairlines.
- Footer links:
  - "Tools I've written about +": an inline toggle that uses the same expand mechanic as the intro words.
  - "All essays on Design Thinker".

**Right column:**
- "WHAT I'VE DONE": three dark cards (`#1d1d1c`, 1px `rgba(242,239,232,.12)`, radius 18px) stacked on a vertical purple line, with a station dot per card.
- Card hover: border goes purple, the card slides right 6px and its dot fills.
- Inside each card: a 200px title/summary column, plus dash-bullet proof links. Underlines are 40% of the line colour at rest and full on hover (Writing colour for essays, Labs colour for Colllective).
- **Scroll reveal:** items fade and rise, staggered ~90ms (IntersectionObserver). Disabled under reduced motion.

**Two slots stay exactly as written for John to fill:**
1. `[Project name · link · John to confirm]`: the AI-first vision prototype with four designers.
2. `[daily stack · John to confirm]`: at the end of the tools list.

Copy the item text and links from the reference verbatim. Every link points to one of John's own Substack posts or johnrubino.design.

## 10. 3D icons

- **Source:** 3dicons by Vijay Verma (realvjy), https://3dicons.co, **CC0 1.0** (https://github.com/realvjy/3dicons). Style: **Clay**, angle **Dynamic**.
- **Tinting:** recoloured toward the line colours with `assets/3d-icons/tint.py`.
- **Used only in two places:**
  - The latest-essay block: `pencil-write`, 48px, tilts −8° on hover.
  - The "Start with Case studies" bar: a fan of `file-text-fowa/fpl/ppr`, 40px, that spreads on hover.
- **Never** in the 16px legend or list rows (keep the line icons there) or inside the text expansions.
- Keep this credit as an HTML comment in `<head>`: `3D icons: 3dicons by Vijay Verma (realvjy), https://3dicons.co — CC0 1.0 (github.com/realvjy/3dicons). Clay style, dynamic angle; recoloured.`
- Serve the icons as optimised WebP/PNG with explicit width and height, not base64.

## 11. Acceptance criteria

**Accessibility:**
- Semantic landmarks: `nav` (rail), `main`, `section` with headings.
- Every interactive element is reachable by keyboard and has a visible `:focus-visible` style. Rail stops are links with `aria-label`s.
- `aria-expanded` and `aria-controls` are correct on every expanding word and on the tools toggle. Closed regions are `inert`.
- Esc behaves as in §7.
- Text meets WCAG AA contrast, including rail labels on `#161615` and pill text.
- The hover card is supplementary (`aria-hidden`). The link itself carries the name.
- `prefers-reduced-motion` turns off the train, blur, flood, reveal and portrait spring.

**Performance:**
- Lighthouse mobile scores ≥ 95 for Performance, Accessibility, Best Practices and SEO.
- CLS < 0.02 (reserve image sizes and use `font-display:swap` with metric-matched fallbacks).
- LCP < 2.0s on a fast 3G-class profile.
- Total JS for the page < 15 KB gzipped, with no framework runtime on the client.
- Fonts subset to Latin, only the weights in §5, and preloaded.

**Layout:**
- At 1440×900 the hero fits one screen at rest, and nothing overlaps at 1280, 1440 and 1920 wide.
- Mobile at 390 wide has no horizontal page scroll; only the strip scrolls sideways.

## 12. Definition of done

- [ ] Home route matches `renders/home_v5_fold.png`, `home_v5_full.png` and `home_v5_mobile.png` (screenshot diff reviewed by John).
- [ ] Rail map:
  - [ ] Octilinear, 5px lines, 9px bundle spacing.
  - [ ] No line crossings and no label collisions (add an automated test that checks every text's bounding box against the other labels and the lines).
  - [ ] Badges match the legend.
- [ ] Rail hover:
  - [ ] Lights its line and shows the card and train (train hidden under reduced motion).
  - [ ] **Changes nothing in the content column** (add a test asserting no class or style changes under `main` during a map hover).
- [ ] All rail destinations work as in §6.
- [ ] Word expansions:
  - [ ] In-flow paragraphs, no containers.
  - [ ] Nested Wove works.
  - [ ] Esc folds the most recent.
  - [ ] Keyboard-only run-through passes.
- [ ] Typography:
  - [ ] Only 12/16/22/72 px in computed styles.
  - [ ] Only the three families.
  - [ ] **Zero computed `font-style: italic`** (add a test).
- [ ] Content:
  - [ ] Every fact matches §8.
  - [ ] Placeholder tags are present.
  - [ ] Both slots in §9 are untouched.
  - [ ] No prose was invented.
- [ ] 3dicons credit comment is in `<head>`.
- [ ] Lighthouse and the a11y/perf criteria in §11 are met.
- [ ] Mobile strip works and has no horizontal page overflow.

## 13. Open questions for John (don't guess; leave TODOs)

1. **Repo:** does johnrubino.design have an existing repo and stack to build into? Where should this route live?
2. **Case-study links:** FoWA and FPL are NDA. Should they link to the list rows (current behaviour), a "request access" flow, or gated pages? What does "walkthrough on request" link to: email, Calendly or a form?
3. **AI-first vision prototype:** project name, the public description allowed, and any link (slot 1).
4. **Daily AI tools** (slot 2). The current list only names tools he's written about.
5. **Labs list items** ("Critique loop", "Dev Mode handoff kit", "Studio autopilot") came from his own mockup. Should they ship and link anywhere?
6. **Map/List toggle:** it's static in the reference. Should it become a real view switch, or be removed?
7. **Contact:** the email/CTA destination, and whether to add a "Get in touch" link.
8. **Analytics and SEO:** metadata, OG image and tracking (if any).

/**
 * Side-rail line map (220 × 800), ported from design/v5/map/map5.py.
 *
 * Every coloured line leaves Home eastward in one bundle, turns south into its
 * own vertical lane, then peels off east to its terminus. The east-most lane
 * peels off first, so no two lines ever cross. Lines turn only at 90°.
 *
 * To move things, edit the constants below. Paths, stations and labels are
 * all derived from them, and `npm test` checks the result.
 */
import { LINE, LINE_IDS, type LineId } from '../content/lines';

export type Pt = readonly [number, number];

export const W = 220;
export const H = 800;
/** Distance between neighbouring lines in a bundle, centre to centre. */
export const SPACING = 9;
export const LINE_WIDTH = 5;
/** Dark outline drawn under each line so bundled lines stay distinct. */
export const CASING = 3;
export const CORNER = 14;
export const BASE_WIDTH = 3;
/** Grey base line (About → Home → Timetable). */
export const BASE_X = 28;
export const HOME_Y = 104;
/** Centre of the vertical trunk. */
export const TRUNK_X = 72;
/** Shared x where every line ends. */
export const TERMINUS_X = 150;
/** Left edge of the end-of-line labels. */
export const LABEL_X = 96;
export const BADGE = { w: 44, h: 18, r: 9 } as const;

export const ABOUT: Pt = [BASE_X, 36];
export const TIMETABLE: Pt = [BASE_X, H - 36];

/** The y of each line's terminus. */
export const ROWS: Record<LineId, number> = { fowa: 226, fpl: 306, ppr: 386, labs: 520, write: 650 };
/** Sideways offset of each line from the trunk centre (negative = east lane). */
export const LANE: Record<LineId, number> = {
  fowa: -2 * SPACING, fpl: -SPACING, ppr: 0, labs: SPACING, write: 2 * SPACING,
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const norm = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1]);
  return [v[0] / l, v[1] / l];
};

/** Offset a polyline sideways by `d` (positive = right of travel) with miter joins. */
export function offset(pts: readonly Pt[], d: number): Pt[] {
  return pts.map((p, i) => {
    const ns: Pt[] = [];
    if (i > 0) {
      const a = norm([p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]]);
      ns.push([-a[1], a[0]]);
    }
    if (i < pts.length - 1) {
      const b = norm([pts[i + 1][0] - p[0], pts[i + 1][1] - p[1]]);
      ns.push([-b[1], b[0]]);
    }
    let n = ns[0];
    let k = d;
    if (ns.length === 2) {
      n = norm([ns[0][0] + ns[1][0], ns[0][1] + ns[1][1]]);
      k = d / (n[0] * ns[0][0] + n[1] * ns[0][1]);
    }
    return [round2(p[0] + n[0] * k), round2(p[1] + n[1] * k)] as Pt;
  });
}

/** Polyline → SVG path with each corner cut back by `r` and rounded. */
export function roundedPath(pts: readonly Pt[], r: number): string {
  const f = (n: number) => n.toFixed(2);
  let s = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [p0, p, p1] = [pts[i - 1], pts[i], pts[i + 1]];
    const a = norm([p[0] - p0[0], p[1] - p0[1]]);
    const b = norm([p1[0] - p[0], p1[1] - p[1]]);
    const c = Math.min(r, Math.hypot(p[0] - p0[0], p[1] - p0[1]) / 2, Math.hypot(p1[0] - p[0], p1[1] - p[1]) / 2);
    s += ` L${f(p[0] - a[0] * c)} ${f(p[1] - a[1] * c)} Q${p[0]} ${p[1]} ${f(p[0] + b[0] * c)} ${f(p[1] + b[1] * c)}`;
  }
  return `${s} L${pts[pts.length - 1][0]} ${pts[pts.length - 1][1]}`;
}

export interface Route {
  id: LineId;
  colour: string;
  /** Corner vertices, before rounding. */
  pts: Pt[];
  d: string;
  /** x of this line's vertical lane. */
  laneX: number;
  /** Where the line ends. */
  end: Pt;
}

function route(id: LineId): Route {
  const d = LANE[id];
  const turnY = ROWS[id] - d; // so the last leg lands exactly on ROWS[id]
  const pts = offset([[BASE_X, HOME_Y], [TRUNK_X, HOME_Y], [TRUNK_X, turnY], [TERMINUS_X, turnY]], d);
  pts[pts.length - 1] = [TERMINUS_X, pts[pts.length - 1][1]];
  return { id, colour: LINE[id].colour, pts, d: roundedPath(pts, CORNER), laneX: TRUNK_X - d, end: pts[pts.length - 1] };
}

export const ROUTES: Record<LineId, Route> = Object.fromEntries(LINE_IDS.map((id) => [id, route(id)])) as Record<LineId, Route>;

/** Paint order: west-most lane first, so east lanes sit on top where they bundle. */
export const DRAW_ORDER: LineId[] = ['write', 'labs', 'ppr', 'fpl', 'fowa'];

export interface Interchange {
  /** Lines this pill spans (used for hover lighting). */
  lines: LineId[];
  x: number;
  y: number;
  w: number;
  h: number;
}

const pill = (y: number, lines: LineId[]): Interchange => {
  const xs = lines.map((l) => ROUTES[l].laneX);
  const x1 = Math.min(...xs);
  const x2 = Math.max(...xs);
  return { lines, x: x1 - 10, y: y - 8, w: x2 - x1 + 20, h: 16 };
};

/** White pills across the lanes they serve. */
export const CASE_STUDIES_PILL = pill(166, ['fowa', 'fpl', 'ppr']);
export const PPR_LABS_PILL = pill(352, ['ppr', 'labs']);
/** Home: a vertical pill on the base line spanning all five departing lines. */
export const HOME_PILL = { x: BASE_X - 10, y: HOME_Y - 2 * SPACING - 10, w: 20, h: 4 * SPACING + 20 };

/** Regular stops: a white circle ringed in the line colour. */
export const STOPS: { line: LineId; at: Pt; name: string }[] = [
  { line: 'labs', at: [ROUTES.labs.laneX, 462], name: 'Labs' },
  { line: 'write', at: [ROUTES.write.laneX, 592], name: 'Design Thinker' },
];

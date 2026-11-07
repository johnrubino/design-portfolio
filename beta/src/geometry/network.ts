/**
 * Builds everything the map draws from the centreline data in
 * src/content/lines.ts and src/content/stations.ts.
 *
 * Expanded:  centreline → offsetPts(lane × 9) → rounded(r = 20)
 * Collapsed: centreline vertices → same count of vertices on a vertical
 *            lane, each at its proportional arclength → rounded(r = 20)
 *
 * Both go through `rounded()` with the same vertex count, so the command
 * lists are identical and CSS can transition `d` between them.
 */
import { COLLAPSED_X, CORNER_RADIUS, LANE, LINES, TRAIN_LINE, type Line, type LineId } from '../content/lines';
import { STATIONS, type StationId } from '../content/stations';
import {
  add, cumulative, lengthAt, mul, offsetPts, pathLength, rightNormal, rounded, segmentContaining,
  sub, toD, unit, type Cmd, type Pt,
} from './path';

/** The train parks this far past its station (before the terminus). */
export const PARK_OFFSET = 24;

export interface BuiltLine {
  line: Line;
  expanded: Cmd[];
  collapsed: Cmd[];
  dE: string;
  dC: string;
  /** Expanded terminus and its direction of travel. */
  end: Pt;
  endDir: Pt;
}

export interface Marker {
  dots: { x: number; y: number; line: LineId }[];
  bar: [Pt, Pt];
  capsule: { x: number; y: number; w: number; angle: number };
}

export interface BuiltStation {
  id: StationId;
  expanded: Marker;
  collapsed: Marker;
  /** Label anchor y (expanded). */
  labelY: number;
  /** Train offset-distance along line 7, expanded / collapsed. */
  dE: number;
  dC: number;
}

export function collapsedPts(line: Line): Pt[] {
  const c = line.centre;
  const cum = cumulative(c);
  const total = cum[cum.length - 1];
  const top = c[0][1];
  const x = COLLAPSED_X - line.lane * LANE;
  return cum.map((s) => [x, top + (s / total) * (line.collapsedEndY - top)] as Pt);
}

export function buildLine(line: Line): BuiltLine {
  const pts = offsetPts(line.centre, line.lane * LANE);
  const expanded = rounded(pts, CORNER_RADIUS);
  const collapsed = rounded(collapsedPts(line), CORNER_RADIUS);
  return {
    line,
    expanded,
    collapsed,
    dE: toD(expanded),
    dC: toD(collapsed),
    end: pts[pts.length - 1],
    endDir: unit(sub(pts[pts.length - 1], pts[pts.length - 2])),
  };
}

export const BUILT_LINES: BuiltLine[] = LINES.map(buildLine);
const BUILT_BY_ID = Object.fromEntries(BUILT_LINES.map((b) => [b.line.id, b])) as Record<LineId, BuiltLine>;

/** Where `line` passes the centreline point `at`, plus its direction there. */
function lanePoint(line: Line, at: Pt): { p: Pt; dir: Pt } {
  const i = segmentContaining(line.centre, at);
  if (i < 0) throw new Error(`Station point ${at} is not on the centreline of ${line.id}`);
  const dir = unit(sub(line.centre[i + 1], line.centre[i]));
  return { p: add(at, mul(rightNormal(dir), line.lane * LANE)), dir };
}

function marker(dots: { x: number; y: number; line: LineId; lane: number }[], angle: number): Marker {
  const sorted = [...dots].sort((a, b) => a.lane - b.lane);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const span = Math.hypot(last.x - first.x, last.y - first.y);
  return {
    dots: sorted.map(({ x, y, line }) => ({ x, y, line })),
    bar: [[first.x, first.y], [last.x, last.y]],
    capsule: { x: (first.x + last.x) / 2, y: (first.y + last.y) / 2, w: span + 2 * LANE, angle },
  };
}

const trainE = BUILT_BY_ID[TRAIN_LINE].expanded;
const trainC = BUILT_BY_ID[TRAIN_LINE].collapsed;
const trainLenE = pathLength(trainE);
const trainLenC = pathLength(trainC);

export const TRAIN_PATH_E = BUILT_BY_ID[TRAIN_LINE].dE;
export const TRAIN_PATH_C = BUILT_BY_ID[TRAIN_LINE].dC;

export const BUILT_STATIONS: BuiltStation[] = STATIONS.map((st) => {
  const lines = st.lines.map((id) => BUILT_BY_ID[id].line);
  const exp = lines.map((l) => ({ l, ...lanePoint(l, st.at) }));
  const dir = exp[0].dir;
  const angle = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI + 90;
  const expanded = marker(exp.map(({ l, p }) => ({ x: p[0], y: p[1], line: l.id, lane: l.lane })), angle);
  const collapsed = marker(
    lines.map((l) => ({ x: COLLAPSED_X - l.lane * LANE, y: st.collapsedY, line: l.id, lane: l.lane })),
    0,
  );
  const trainPt = exp.find((e) => e.l.id === TRAIN_LINE);
  if (!trainPt) throw new Error(`Line ${TRAIN_LINE} must stop at ${st.id}`);
  const sE = lengthAt(trainE, trainPt.p);
  const sC = lengthAt(trainC, [COLLAPSED_X - BUILT_BY_ID[TRAIN_LINE].line.lane * LANE, st.collapsedY]);
  return {
    id: st.id,
    expanded,
    collapsed,
    labelY: expanded.capsule.y,
    dE: round1(Math.min(sE + PARK_OFFSET, trainLenE - PARK_OFFSET)),
    dC: round1(Math.min(sC + PARK_OFFSET, trainLenC - PARK_OFFSET)),
  };
});

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

/** Positions of the stations along the in-train strip, in %. */
export const STRIP_X = STATIONS.map((_, i) => 3 + (94 * i) / (STATIONS.length - 1));

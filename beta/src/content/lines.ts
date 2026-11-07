/**
 * The seven lines on the map. Each line is one body of work.
 *
 * Geometry is a CENTRELINE plus a LANE. The map draws each line offset
 * sideways from its centreline by `lane × LANE` px (positive lanes sit to the
 * right of the direction of travel; every line runs from About at the top
 * outward to its end). Corners are rounded with CORNER_RADIUS.
 *
 * Centrelines share a trunk at x = 180, snap to a 24px module and turn only
 * at 45° / 90°. Coordinates are in the 460 × 900 map space (the header sign
 * covers y < 96).
 *
 * To reroute a line, edit its `centre` vertices. The expanded map and the
 * collapsed bundle are both generated from them (src/geometry/network.ts).
 */
import type { Pt } from '../geometry/path';

export type LineId = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'l6' | 'l7';

export interface Line {
  id: LineId;
  /** Sort order (chips, wipe stripes, strip legend). */
  order: number;
  /** Two-letter code shown on the line chip. */
  code: string;
  colour: string;
  /** Chip text colour (yellow takes dark text). */
  ink: string;
  name: string;
  /** Shorter name for the map's line ends. */
  short: string;
  /** Pages the line appears on, for the About board. */
  appearsOn: string;
  lane: number;
  centre: Pt[];
  /** Where the line ends in the collapsed bundle (y in map space). */
  collapsedEndY: number;
}

/** Expanded map: distance between neighbouring lanes, and stroke width. */
export const LANE = 13;
export const LINE_WIDTH = 3.5;
export const CORNER_RADIUS = 32;
/** Collapsed bundle: lane 0 sits at this x; lanes are COLLAPSED_LANE px apart. */
export const COLLAPSED_X = 64;
export const COLLAPSED_LANE = 10;

const TOP: Pt = [180, 132];

/** Drawing order (also the line-draw stagger order on first load). */
export const LINES: Line[] = [
  {
    id: 'l1', order: 1, code: 'FW', colour: '#E4473C', ink: '#fff', name: 'Future of Wealth Advisory', short: 'Future of Wealth', appearsOn: 'Case studies',
    lane: -3,
    centre: [TOP, [180, 348], [228, 396], [412, 396]],
    collapsedEndY: 380,
  },
  {
    id: 'l2', order: 2, code: 'FP', colour: '#EE6A2C', ink: '#fff', name: 'Fully Paid Lending', short: 'Fully Paid Lending', appearsOn: 'Case studies',
    lane: -2,
    centre: [TOP, [180, 396], [228, 444], [412, 444]],
    collapsedEndY: 420,
  },
  {
    id: 'l3', order: 3, code: 'NA', colour: '#EDB12A', ink: '#1B1E22', name: 'New Account Opening', short: 'Account Opening', appearsOn: 'Case studies',
    lane: -1,
    centre: [TOP, [180, 444], [228, 492], [412, 492]],
    collapsedEndY: 460,
  },
  {
    id: 'l5', order: 5, code: 'CL', colour: '#7A5CB2', ink: '#fff', name: 'Colllective Labs', short: 'Colllective Labs', appearsOn: 'Labs',
    lane: 0,
    centre: [TOP, [180, 492], [276, 588], [412, 588]],
    collapsedEndY: 600,
  },
  {
    id: 'l4', order: 4, code: 'PP', colour: '#1F9C63', ink: '#fff', name: 'Purple Panda Rentals', short: 'Purple Panda', appearsOn: 'Case studies, Labs',
    lane: 1,
    centre: [TOP, [180, 492], [324, 636], [412, 636]],
    collapsedEndY: 640,
  },
  {
    id: 'l7', order: 7, code: 'RE', colour: '#2471C4', ink: '#fff', name: 'Résumé', short: 'Résumé', appearsOn: 'Every page',
    lane: 2,
    centre: [TOP, [180, 492], [348, 660], [348, 852]],
    collapsedEndY: 852,
  },
  {
    id: 'l6', order: 6, code: 'DT', colour: '#8C5B45', ink: '#fff', name: 'Design Thinker on Substack', short: 'Design Thinker', appearsOn: 'Writing',
    lane: 3,
    centre: [TOP, [180, 492], [348, 660], [348, 780], [300, 828], [300, 866]],
    collapsedEndY: 872,
  },
];

export const LINE_BY_ID = Object.fromEntries(LINES.map((l) => [l.id, l])) as Record<LineId, Line>;

/** Lines in chip order (used for chips, wipe stripes, strip legend). */
export const byOrder = (ids: readonly LineId[]) =>
  ids.map((id) => LINE_BY_ID[id]).sort((a, b) => a.order - b.order);

/** The line the moving marker rides. */
export const MARKER_LINE: LineId = 'l7';

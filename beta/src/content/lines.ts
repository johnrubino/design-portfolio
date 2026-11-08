/**
 * The seven lines on the map. Each line is one body of work.
 *
 * Geometry is a CENTRELINE plus a LANE. The map draws each line offset
 * sideways from its centreline by `lane × LANE` px (positive lanes sit to the
 * right of the direction of travel; every line runs from About at the top
 * outward to its end). Corners are rounded with CORNER_RADIUS.
 *
 * Organisation: line 5 (Résumé) is a straight spine at x = 228 that calls at
 * every station. Each area carries only its own lines:
 *   About, Case studies   1, 2, 3, 4, 5
 *   Labs                  4, 5
 *   Writing, Résumé       5
 * Lines turn only at 45° / 90°. Coordinates are in the 460 × 900 map space
 * (the header covers y < 96).
 *
 * To reroute a line, edit its `centre` vertices. The expanded map and the
 * collapsed bundle are both generated from them (src/geometry/network.ts).
 */
import type { Pt } from '../geometry/path';

export type LineId = 'l1' | 'l2' | 'l3' | 'l4' | 'l5';

export interface Line {
  id: LineId;
  /** Line number: shown on the route disc, and the sort order everywhere. */
  order: number;
  colour: string;
  /** Disc number colour (yellow takes dark text). */
  ink: string;
  name: string;
  /** Shorter name for the map's line ends. */
  short: string;
  /** Pages the line appears on, for the About board. */
  appearsOn: string;
  lane: number;
  /** Optional placement of the end label, relative to the line's end point. */
  endLabel?: { dx: number; dy: number; anchor: 'start' | 'end' };
  centre: Pt[];
  /** Where the line ends in the collapsed bundle (y in map space). */
  collapsedEndY: number;
}

/** Vignelli bundle: 8px lines packed 9px apart (a 1px gap), tight rounded corners. */
export const LANE = 9;
export const LINE_WIDTH = 8;
export const CORNER_RADIUS = 20;
/** Collapsed bundle: lane 0 sits at this x; lanes are COLLAPSED_LANE px apart (lanes −3…+1 centre on 64). */
export const COLLAPSED_X = 55;
export const COLLAPSED_LANE = 9;

const TOP: Pt = [228, 132];

/** Drawing order (also the line-draw stagger order on first load). */
export const LINES: Line[] = [
  {
    id: 'l1', order: 1, colour: '#E4473C', ink: '#fff', name: 'Future of Wealth Advisory', short: 'Future of Wealth', appearsOn: 'Case studies',
    lane: -3,
    centre: [TOP, [228, 348], [276, 396], [412, 396]],
    collapsedEndY: 380,
  },
  {
    id: 'l2', order: 2, colour: '#EE6A2C', ink: '#fff', name: 'Fully Paid Lending', short: 'Fully Paid Lending', appearsOn: 'Case studies',
    lane: -2,
    centre: [TOP, [228, 396], [276, 444], [412, 444]],
    collapsedEndY: 420,
  },
  {
    id: 'l3', order: 3, colour: '#EDB12A', ink: '#1B1E22', name: 'New Account Opening', short: 'Account Opening', appearsOn: 'Case studies',
    lane: -1,
    centre: [TOP, [228, 444], [276, 492], [412, 492]],
    collapsedEndY: 460,
  },
  {
    id: 'l4', order: 4, colour: '#1F9C63', ink: '#fff', name: 'Purple Panda Rentals', short: 'Purple Panda', appearsOn: 'Case studies, Labs',
    lane: 0,
    centre: [TOP, [228, 584], [276, 632], [412, 632]],
    collapsedEndY: 640,
  },
  {
    id: 'l5', order: 5, colour: '#2471C4', ink: '#fff', name: 'Résumé', short: 'Résumé', appearsOn: 'Every page',
    lane: 1,
    centre: [TOP, [228, 840]],
    collapsedEndY: 840,
  },
];

export const LINE_BY_ID = Object.fromEntries(LINES.map((l) => [l.id, l])) as Record<LineId, Line>;

/** Lines in number order (discs, wipe stripes, page rail). */
export const byOrder = (ids: readonly LineId[]) =>
  ids.map((id) => LINE_BY_ID[id]).sort((a, b) => a.order - b.order);

/** The line the moving marker rides. */
export const MARKER_LINE: LineId = 'l5';

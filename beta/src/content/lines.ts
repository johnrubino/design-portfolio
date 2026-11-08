/**
 * The seven lines on the map. Each line is one body of work.
 *
 * Geometry is a CENTRELINE plus a LANE. The map draws each line offset
 * sideways from its centreline by `lane × LANE` px (positive lanes sit to the
 * right of the direction of travel; every line runs from About at the top
 * outward to its end). Corners are rounded with CORNER_RADIUS.
 *
 * Organisation: the Résumé line is a straight spine at x = 228 that calls at
 * every page. The Case studies line runs with it from About to the Case
 * studies station, then branches off and calls at each project (the project
 * stops are defined in content/caseStudies.ts).
 * Lines turn only at 45° / 90°. Coordinates are in the 460 × 900 map space
 * (the header covers y < 96).
 *
 * To reroute a line, edit its `centre` vertices. The expanded map and the
 * collapsed bundle are both generated from them (src/geometry/network.ts).
 */
import type { Pt } from '../geometry/path';

export type LineId = 'work' | 'labs' | 'resume';

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
  /** What the line stops at, for the About board. */
  stops: string;
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
/** Collapsed bundle: lane 0 sits at this x; lanes are COLLAPSED_LANE px apart (lanes 0…−2 centre on 64). */
export const COLLAPSED_X = 55;
export const COLLAPSED_LANE = 9;

const TOP: Pt = [228, 132];

/** Drawing order (also the line-draw stagger order on first load). */
export const LINES: Line[] = [
  {
    id: 'work', order: 1, colour: '#E4473C', ink: '#fff', name: 'Work', short: 'Work',
    stops: 'Future of Wealth Advisory, Fully Paid Lending, Purple Panda Rentals',
    lane: -2,
    centre: [TOP, [228, 200], [300, 272], [300, 470]],
    collapsedEndY: 300,
    endLabel: { dx: 16, dy: 19, anchor: 'start' },
  },
  {
    id: 'labs', order: 2, colour: '#7A5CB2', ink: '#fff', name: 'Labs', short: 'Labs',
    stops: 'Navori, Music Maker, AI Knowledge Co-op',
    lane: -1,
    centre: [TOP, [228, 564], [300, 636], [300, 812]],
    collapsedEndY: 600,
    endLabel: { dx: 16, dy: 19, anchor: 'start' },
  },
  {
    id: 'resume', order: 3, colour: '#2471C4', ink: '#fff', name: 'Résumé', short: 'Résumé',
    stops: 'Every page',
    lane: 0,
    centre: [TOP, [228, 840]],
    collapsedEndY: 840,
  },
];

export const LINE_BY_ID = Object.fromEntries(LINES.map((l) => [l.id, l])) as Record<LineId, Line>;

/** Lines in number order (discs, wipe stripes, page rail). */
export const byOrder = (ids: readonly LineId[]) =>
  ids.map((id) => LINE_BY_ID[id]).sort((a, b) => a.order - b.order);

/** The line the moving marker rides. */
export const MARKER_LINE: LineId = 'resume';

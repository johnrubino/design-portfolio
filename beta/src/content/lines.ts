/**
 * The seven lines of the Rubino Transit Authority.
 *
 * Geometry is defined as a CENTRELINE plus a LANE. The map draws each line
 * offset sideways from its centreline by `lane × 9 px` (positive lanes sit
 * to the right of the direction of travel; every line travels from About
 * at the top outward to its terminus). Corners are rounded with radius 20.
 *
 * All centrelines share the trunk at x = 150 and only turn at 45°/90°.
 * Coordinates are in the 460 × 900 map space (the black sign covers y < 96).
 *
 * To reroute a line: edit its `centre` vertices. Both the expanded map and
 * the collapsed bundle are generated from these points (src/geometry/network.ts).
 */
import type { Pt } from '../geometry/path';

export type LineId = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'l6' | 'l7';

export interface Line {
  id: LineId;
  /** Route disc number. */
  disc: number;
  colour: string;
  /** Disc number colour (yellow takes dark text). */
  ink: string;
  name: string;
  /** Short destination note used on the About departure board. */
  callsAt: string;
  lane: number;
  centre: Pt[];
  /** Where the line ends in the collapsed bundle (y in map space). */
  collapsedEndY: number;
}

export const LANE = 9;
export const CORNER_RADIUS = 20;
/** Collapsed bundle: lane 0 sits at this x; lanes are LANE px apart. */
export const COLLAPSED_X = 64;

/** Drawing order (also the line-draw stagger order on first load). */
export const LINES: Line[] = [
  {
    id: 'l1', disc: 1, colour: '#E8453C', ink: '#fff', name: 'Future of Wealth Advisory', callsAt: 'Case studies',
    lane: -3,
    centre: [[150, 130], [150, 350], [190, 390], [230, 390], [310, 310], [412, 310]],
    collapsedEndY: 380,
  },
  {
    id: 'l2', disc: 2, colour: '#F26B2A', ink: '#fff', name: 'Fully Paid Lending', callsAt: 'Case studies',
    lane: -2,
    centre: [[150, 130], [150, 350], [190, 390], [412, 390]],
    collapsedEndY: 405,
  },
  {
    id: 'l3', disc: 3, colour: '#F4AE1E', ink: '#2A1C14', name: 'New Account Opening', callsAt: 'Case studies',
    lane: -1,
    centre: [[150, 130], [150, 350], [190, 390], [230, 390], [290, 450], [412, 450]],
    collapsedEndY: 430,
  },
  {
    id: 'l5', disc: 5, colour: '#7A5BA6', ink: '#fff', name: 'Colllective Labs', callsAt: 'Labs',
    lane: 0,
    centre: [[150, 130], [150, 470], [270, 590], [412, 590]],
    collapsedEndY: 600,
  },
  {
    id: 'l4', disc: 4, colour: '#1E9A5B', ink: '#fff', name: 'Purple Panda Rentals', callsAt: 'Case studies, Labs',
    lane: 1,
    centre: [[150, 130], [150, 470], [310, 630], [412, 630]],
    collapsedEndY: 630,
  },
  {
    id: 'l7', disc: 7, colour: '#1F6FB8', ink: '#fff', name: 'Timetable', callsAt: 'All stations',
    lane: 2,
    centre: [[150, 130], [150, 470], [350, 670], [350, 835]],
    collapsedEndY: 835,
  },
  {
    id: 'l6', disc: 6, colour: '#8E5A45', ink: '#fff', name: 'Design Thinker on Substack', callsAt: 'Design Thinker',
    lane: 3,
    centre: [[150, 130], [150, 470], [350, 670], [350, 760], [290, 820], [290, 842]],
    collapsedEndY: 860,
  },
];

export const LINE_BY_ID = Object.fromEntries(LINES.map((l) => [l.id, l])) as Record<LineId, Line>;

/** Lines sorted by disc number (used for discs, wipe stripes, strip transfers). */
export const byDisc = (ids: readonly LineId[]) =>
  ids.map((id) => LINE_BY_ID[id]).sort((a, b) => a.disc - b.disc);

/** The line the train rides. */
export const TRAIN_LINE: LineId = 'l7';

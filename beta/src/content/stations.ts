/**
 * The five stations, in route order along line 7.
 * Order matters: it defines ride direction (forward = higher index).
 */
import type { Pt } from '../geometry/path';
import type { LineId } from './lines';

export type StationId = 'about' | 'cases' | 'labs' | 'writing' | 'timetable';

export interface Station {
  id: StationId;
  name: string;
  route: string;
  /** Mono sub-line under the map label. */
  sub: string;
  /** Lines that stop here (dots are drawn only for these). */
  lines: LineId[];
  /** Station position on the shared centreline, in map space. */
  at: Pt;
  /** Map label: which side of the lines, and the x of its inner edge. */
  label: { side: 'left' | 'right'; x: number };
  /** Station y in the collapsed bundle. */
  collapsedY: number;
  /** Colour of the big disc on the "Next stop" sign that points here. */
  mainLine: LineId;
}

export const STATIONS: Station[] = [
  {
    id: 'about', name: 'About', route: '/', sub: 'Start here',
    lines: ['l1', 'l2', 'l3', 'l5', 'l4', 'l7', 'l6'],
    at: [150, 160], label: { side: 'left', x: 109 }, collapsedY: 160, mainLine: 'l7',
  },
  {
    id: 'cases', name: 'Case studies', route: '/case-studies', sub: '4 projects',
    lines: ['l1', 'l2', 'l3', 'l4', 'l7'],
    at: [150, 300], label: { side: 'left', x: 118 }, collapsedY: 300, mainLine: 'l2',
  },
  {
    id: 'labs', name: 'Labs', route: '/labs', sub: 'Experiments',
    lines: ['l5', 'l4', 'l7'],
    at: [202, 522], label: { side: 'left', x: 153.3 }, collapsedY: 520, mainLine: 'l5',
  },
  {
    id: 'writing', name: 'Design Thinker', route: '/writing', sub: 'Writing',
    lines: ['l7', 'l6'],
    at: [350, 722], label: { side: 'right', x: 348 }, collapsedY: 722, mainLine: 'l6',
  },
  {
    id: 'timetable', name: 'Timetable', route: '/timetable', sub: 'Résumé · contact',
    lines: ['l7'],
    at: [350, 835], label: { side: 'right', x: 348 }, collapsedY: 835, mainLine: 'l7',
  },
];

export const stationIndexForPath = (pathname: string): number => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const i = STATIONS.findIndex((s) => s.route === clean);
  return i === -1 ? 0 : i;
};

export const isKnownPath = (pathname: string): boolean => {
  const clean = pathname.replace(/\/+$/, '') || '/';
  return STATIONS.some((s) => s.route === clean);
};

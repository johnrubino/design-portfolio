/**
 * The five stations, in route order along line 7.
 * Order matters: it defines ride direction (forward = higher index).
 */
import type { Pt } from '../geometry/path';
import type { LineId } from './lines';

export type StationId = 'about' | 'cases' | 'labs' | 'writing' | 'resume';

export interface Station {
  id: StationId;
  name: string;
  route: string;
  /** Mono sub-line under the map label. */
  sub: string;
  /** Lines that stop here (dots are drawn only on these). */
  lines: LineId[];
  /** Station position on the shared centreline, in map space. */
  at: Pt;
  /** Map label: which side of the lines, and the x of its inner edge. */
  label: { side: 'left' | 'right'; x: number };
  /** Station y in the collapsed bundle. */
  collapsedY: number;
  /** Disc on the "Next" sign that points here. */
  mainLine: LineId;
}

export const STATIONS: Station[] = [
  {
    id: 'about', name: 'About', route: '/', sub: 'Intro',
    lines: ['l1', 'l2', 'l3', 'l5', 'l4', 'l7', 'l6'],
    at: [228, 156], label: { side: 'left', x: 187 }, collapsedY: 156, mainLine: 'l7',
  },
  {
    id: 'cases', name: 'Case studies', route: '/case-studies', sub: '4 projects',
    lines: ['l1', 'l2', 'l3', 'l4', 'l7'],
    at: [228, 300], label: { side: 'right', x: 269 }, collapsedY: 300, mainLine: 'l2',
  },
  {
    id: 'labs', name: 'Labs', route: '/labs', sub: 'Experiments',
    lines: ['l5', 'l4', 'l7'],
    at: [228, 540], label: { side: 'right', x: 242 }, collapsedY: 540, mainLine: 'l5',
  },
  {
    id: 'writing', name: 'Writing', route: '/writing', sub: 'Essays',
    lines: ['l7', 'l6'],
    at: [228, 788], label: { side: 'right', x: 233 }, collapsedY: 788, mainLine: 'l6',
  },
  {
    id: 'resume', name: 'Résumé', route: '/resume', sub: 'Work · contact',
    lines: ['l7'],
    at: [228, 876], label: { side: 'right', x: 233 }, collapsedY: 876, mainLine: 'l7',
  },
];

/** Old routes that still resolve. */
const ALIASES: Record<string, string> = { '/timetable': '/resume' };

const clean = (pathname: string) => {
  const p = pathname.replace(/\/+$/, '') || '/';
  return ALIASES[p] ?? p;
};

export const stationIndexForPath = (pathname: string): number => {
  const i = STATIONS.findIndex((s) => s.route === clean(pathname));
  return i === -1 ? 0 : i;
};

export const isKnownPath = (pathname: string): boolean => STATIONS.some((s) => s.route === clean(pathname));

/** True when the URL should be rewritten to the station's current route. */
export const isAlias = (pathname: string): boolean => (pathname.replace(/\/+$/, '') || '/') in ALIASES;

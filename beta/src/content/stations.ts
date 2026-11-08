/**
 * The five stations, in route order along line 7.
 * Order matters: it defines ride direction (forward = higher index).
 */
import type { Pt } from '../geometry/path';
import type { LineId } from './lines';

export type StationId = 'home' | 'labs' | 'about' | 'writing' | 'resume';

export interface Station {
  id: StationId;
  name: string;
  /** Text on the page-name plate, if different from `name`. */
  plate?: string;
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
    id: 'home', name: 'Home', plate: 'John Rubino', route: '/', sub: 'Intro · work',
    lines: ['work', 'labs', 'resume'],
    at: [228, 156], label: { side: 'left', x: 214 }, collapsedY: 156, mainLine: 'work',
  },
  {
    id: 'labs', name: 'Labs', route: '/labs', sub: 'Experiments',
    lines: ['labs', 'resume'],
    at: [228, 520], label: { side: 'left', x: 214 }, collapsedY: 520, mainLine: 'labs',
  },
  {
    id: 'about', name: 'About', route: '/about', sub: 'Bio',
    lines: ['resume'],
    at: [228, 640], label: { side: 'left', x: 214 }, collapsedY: 640, mainLine: 'resume',
  },
  {
    id: 'writing', name: 'Writing', route: '/writing', sub: 'Essays',
    lines: ['resume'],
    at: [228, 740], label: { side: 'left', x: 214 }, collapsedY: 740, mainLine: 'resume',
  },
  {
    id: 'resume', name: 'Résumé', route: '/resume', sub: 'Experience · contact',
    lines: ['resume'],
    at: [228, 840], label: { side: 'left', x: 214 }, collapsedY: 840, mainLine: 'resume',
  },
];

/** Old routes that still resolve. */
const ALIASES: Record<string, string> = { '/timetable': '/resume', '/case-studies': '/' };

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

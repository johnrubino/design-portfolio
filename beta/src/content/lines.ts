/**
 * The five lines. Colours and codes are fixed by the v5 brief (§4, §6):
 * the map badges and the legend both read from here, so they always match.
 */
export type LineId = 'fowa' | 'fpl' | 'ppr' | 'labs' | 'write';

export const LINE_IDS: LineId[] = ['fowa', 'fpl', 'ppr', 'labs', 'write'];

export type IconId = 'case' | 'lab' | 'essay' | 'about' | 'time' | 'progress' | 'arrow';

export interface LineInfo {
  id: LineId;
  /** Text on the badge. */
  code: string;
  colour: string;
  /** Full name, used as the link name for screen readers. */
  name: string;
  /** End-of-line label on the map, one entry per row. */
  mapLabel: string[];
  /** Legend row under "The lines". */
  legend: string;
  icon: IconId;
  /** Where the line end goes. In-page anchors point at "Every stop" rows. */
  href: string;
  external?: boolean;
  /** Hover card beside the rail. */
  card: { kind: string; title: string; text: string; status?: { icon: IconId; text: string } };
}

export const ESSAY_URL = 'https://johnrubino.substack.com/p/figma-isnt-always-the-starting-line';

export const LINE: Record<LineId, LineInfo> = {
  fowa: {
    id: 'fowa', code: 'FoWA', colour: '#FF6B4A', name: 'Future of Wealth Advisory',
    mapLabel: ['Future of', 'Wealth Advisory'],
    legend: 'Future of Wealth Advisory · account opening, asset movement',
    icon: 'case', href: '#stop-fowa',
    card: {
      kind: 'Case study', title: 'Future of Wealth Advisory',
      text: 'Reimagined account opening and asset movement workflows for a platform consolidation.',
      status: { icon: 'case', text: 'BNY Pershing · NDA' },
    },
  },
  fpl: {
    id: 'fpl', code: 'FPL', colour: '#E8A317', name: 'Fully Paid Lending',
    mapLabel: ['Fully Paid', 'Lending'],
    legend: 'Fully Paid Lending · liquidity for clients, kept compliant',
    icon: 'case', href: '#stop-fpl',
    card: {
      kind: 'Case study', title: 'Fully Paid Lending',
      text: 'Streamlined the program so advisors can unlock liquidity for clients while staying compliant.',
      status: { icon: 'case', text: 'BNY Pershing · NDA' },
    },
  },
  ppr: {
    id: 'ppr', code: 'PPR', colour: '#5B8CFF', name: 'Purple Panda Rentals',
    mapLabel: ['Purple Panda', 'Rentals'],
    legend: 'Purple Panda Rentals · founder project, student rentals',
    icon: 'case', href: '#stop-ppr',
    card: {
      kind: 'Case study + Labs', title: 'Purple Panda Rentals',
      text: 'A rental platform for college students; mobile app from research to validated prototypes.',
      status: { icon: 'progress', text: 'Founder project · In progress' },
    },
  },
  labs: {
    id: 'labs', code: 'Labs', colour: '#B57BFF', name: 'Colllective Design',
    mapLabel: ['Colllective', 'Design'],
    legend: 'Colllective Design · AI-native studio I advise',
    icon: 'lab', href: '#stop-labs',
    card: {
      kind: 'Labs · Advisor', title: 'Colllective Design',
      text: 'AI-native product and brand studio: venture design, product strategy and 0-to-1 products.',
    },
  },
  write: {
    id: 'write', code: 'W', colour: '#D4C09A', name: 'Figma isn’t always the starting line',
    mapLabel: ['Figma isn’t always', 'the starting line'],
    legend: 'Design Thinker, essays on design and AI',
    icon: 'essay', href: ESSAY_URL, external: true,
    card: {
      kind: 'Design Thinker · Latest', title: 'Figma isn’t always the starting line',
      text: 'Two skills for working with AI — inside the system, and inventing outside it.',
      status: { icon: 'time', text: 'Sep 29, 2026' },
    },
  },
};

/** Hovering a line end also lights these lines (PPR meets Labs at the interchange). */
export const ALSO_LIT: Partial<Record<LineId, LineId[]>> = { ppr: ['labs'] };

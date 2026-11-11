/**
 * Home page copy, verbatim from the approved v5 reference
 * (design/v5/reference/portfolio-home-BC-v5.html).
 *
 * ALL OF THIS IS PLACEHOLDER: John writes his own prose. Do not polish it.
 * Open items are marked TODO(john).
 */
import type { IconId, LineId } from './lines';
import { ESSAY_URL } from './lines';
import { SITE } from './site';

/** A run of text: plain, an expanding word, a link, or John's name with his photo beside it. */
export type Seg =
  | string
  | { word: string; text: string; line?: LineId }
  | { href: string; text: string }
  | { name: string };

export interface Expansion {
  /** Matches the `word` that opens it. */
  id: string;
  /** Set when the word that opens this lives inside another expansion. */
  parent?: string;
  body: Seg[];
}

export interface IntroPara {
  kind: 'stand' | 'body';
  segs: Seg[];
  /** Paragraphs that open under this one, in document order. */
  expansions: Expansion[];
}

/**
 * The intro follows the structure of emilycampbell.co (at John's request):
 * a greeting (click it for another), a first-person sentence with the name and
 * photo inline, a second paragraph, a sign-off, then contact links. Clicking a
 * highlighted word turns it into plain text and opens a paragraph below it.
 *
 * TODO(john): the greeting and the "I’m … , a" glue words were added only to
 * fit that structure. Everything here is still placeholder for John to rewrite.
 */
/**
 * Clicking the greeting cycles through these. The first one shows on load.
 * TODO(john): placeholder list; swap in your own.
 */
export const GREETINGS = ['Hello.', 'Hi there.', 'Good day.', 'Hey.', 'Welcome.'];

// TODO(john): write the sign-off line. Left as a slot rather than invented.
export const SIGN_OFF_SLOT = '[Sign-off line · John to write]';

export const INTRO: IntroPara[] = [
  {
    kind: 'stand',
    segs: [
      'I’m ',
      { name: SITE.name },
      ', a senior ',
      { word: 'designer', text: 'product designer' },
      ' at BNY Pershing, working on ',
      { word: 'fowa', text: 'wealth advisory', line: 'fowa' },
      ', ',
      { word: 'fpl', text: 'lending', line: 'fpl' },
      ' and ',
      { word: 'assets', text: 'asset movement' },
      ' for wealth and clearing firms.',
    ],
    expansions: [
      {
        id: 'designer',
        body: [
          'I’m in the Wealth Services group, in the Clearing & Servicing pods, designing complex financial workflows for advisors managing institutional-scale assets. I was on the ground floor of ',
          { word: 'wove', text: 'Wove' },
          '.',
        ],
      },
      {
        id: 'wove',
        parent: 'designer',
        body: [
          'Wove is a complete rebuild of the bank’s financial platform. Years of bridging legacy software with modern UX taught me how to design systems that scale.',
        ],
      },
      {
        id: 'fowa',
        body: [
          'On Future of Wealth Advisory I reimagined account opening and asset movement workflows for a platform consolidation, designing a To-Do List pattern and a collapsing stepper. It’s under NDA, so I walk through it on request.',
        ],
      },
      {
        id: 'fpl',
        body: [
          'On Fully Paid Lending I streamlined the program experience so advisors can unlock liquidity for clients while staying compliant. Also under NDA; walkthrough on request.',
        ],
      },
      {
        id: 'assets',
        body: [
          'Asset movement sits next to account opening in my Clearing & Servicing work, and on Future of Wealth Advisory I reimagined both.',
        ],
      },
    ],
  },
  {
    kind: 'body',
    segs: [
      'I think in ',
      { word: 'systems', text: 'systems' },
      ', work close to engineering on design–dev ',
      { word: 'handoff', text: 'handoff' },
      ', write ',
      { word: 'write', text: 'Design Thinker', line: 'write' },
      ' and advise ',
      { word: 'labs', text: 'Colllective Design', line: 'labs' },
      ', an AI-native studio.',
    ],
    expansions: [
      {
        id: 'systems',
        body: [
          'I bring the same enterprise-level systems thinking to early-stage teams: foundations that won’t break as they scale.',
        ],
      },
      {
        id: 'handoff',
        body: [
          'I ran an internal study with developers, tech leads, QE and Scrum leads on how they really use Figma Dev Mode. The short version: handoff is a communication problem, and no single tool solves it. ',
          { href: 'https://johnrubino.substack.com/p/i-ran-a-study-on-how-engineers-actually', text: 'Read the study' },
          '.',
        ],
      },
      {
        id: 'write',
        body: [
          'Design Thinker is my Substack: short essays on design practice, AI as creative infrastructure and building sustainable design careers. The latest is ',
          { href: ESSAY_URL, text: '“Figma isn’t always the starting line”' },
          '.',
        ],
      },
      {
        id: 'labs',
        body: [
          'I’m an advisor to Colllective Design, an AI-native product and brand studio focused on venture design, product strategy and 0-to-1 product development, helping founders build intelligent, human-centered products.',
        ],
      },
    ],
  },
];

export const HERO = {
  legendHeading: 'The lines',
  essayKicker: 'Design Thinker · Latest essay',
  essaySource: 'johnrubino.substack.com',
  continueKicker: 'Start with',
  continueDest: 'Case studies',
  // TODO(john): where should "Start with Case studies" go? (brief §13 Q2). For now it scrolls to "Every stop".
  continueHref: '#list',
  footRight: 'Home',
};

/* ---------- How I AI ---------- */

const S = 'https://johnrubino.substack.com/p/';

export const HOW_I_AI = {
  label: 'How I AI',
  tag: 'Placeholder · John to rewrite',
  title: 'How I AI',
  quote: '“Figma isn’t done. It just isn’t always the starting line anymore.”',
  thinkHeading: 'What I think',
  principles: [
    {
      lead: 'Process dictates tooling.',
      text: 'Shipping inside a locked design system and inventing outside it are different skills, so I pick the starting line per mode.',
      link: { text: 'Figma isn’t always the starting line', href: ESSAY_URL },
    },
    {
      lead: 'Orchestrate, then judge.',
      text: 'Outcome clarity, system awareness and direction-setting get work moving; output judgment, where taste and domain expertise live, decides if it’s good.',
      link: { text: 'From Pixel Pusher to Orchestrator', href: `${S}from-pixel-pusher-to-orchestrator` },
    },
    {
      lead: 'Design the substrate, not just the surface.',
      text: 'As interfaces get generated at runtime, the design moves into the rules and context that decide what shows.',
      link: { text: 'The Interface Is Disappearing', href: `${S}the-interface-is-disappearing-heres` },
    },
    {
      lead: 'Handoff is a communication problem.',
      text: 'No single tool fixes it. Clear freeze points, branches and edge-case specs do more than another plugin.',
      link: { text: 'The Dev Mode study', href: `${S}i-ran-a-study-on-how-engineers-actually` },
    },
  ],
  toolsToggle: 'Tools I’ve written about',
  allEssays: { text: 'All essays on Design Thinker', href: SITE.substack },
  tools: [
    { text: 'Figma MCP', href: ESSAY_URL },
    { text: 'Figma Make', href: ESSAY_URL },
    { text: 'Codex', href: ESSAY_URL },
    { text: 'Devin', href: ESSAY_URL },
    { text: 'Claude Design', href: `${S}claude-design-just-dropped-heres` },
    { text: 'Lovable', href: `${S}building-a-figma-plugin-with-lovable` },
    { text: 'Gemini Gems', href: `${S}building-an-ai-powered-ux-research` },
  ],
  // TODO(john): slot 2 (brief §9, §13 Q4). Leave exactly as written until John fills it.
  toolsSlot: '[daily stack · John to confirm]',
  doneHeading: 'What I’ve done',
  cards: [
    {
      title: 'Design with AI in production',
      summary: 'Figma plus AI inside a locked design system, constraints first.',
      proof: [
        {
          line: 'write' as const,
          href: ESSAY_URL,
          text: 'Figma designs into an AI coding environment through a Figma MCP, pulling design-system components into prototypes and back into Figma. Iteration time roughly halved once configured.',
        },
        {
          line: 'write' as const,
          href: ESSAY_URL,
          text: 'Account-opening concepts: ideated low-navigation directions in Figma Make, then refined them by hand on canvas.',
        },
        // TODO(john): slot 1 (brief §9, §13 Q3). Leave exactly as written until John fills it.
        { slot: 'An AI-first vision prototype with four designers. [Project name · link · John to confirm]' },
      ],
    },
    {
      title: 'Build my own AI tools',
      summary: 'Small tools that sit beside the design process.',
      proof: [
        {
          line: 'write' as const,
          href: `${S}building-a-figma-plugin-with-lovable`,
          text: 'Your AI Co-Pilot: a Figma plugin built with Lovable that reviews UI, content, UX and accessibility against WCAG.',
        },
        {
          line: 'write' as const,
          href: `${S}building-an-ai-powered-ux-research`,
          text: 'A UX research agent built with Google Gemini Gems, for personas and usability analysis.',
        },
      ],
    },
    {
      title: 'Advise and write in the open',
      summary: 'AI-native work with founders, and essays on where design is going.',
      proof: [
        {
          line: 'labs' as const,
          href: 'https://johnrubino.design',
          text: 'Advisor to Colllective Design, an AI-native product and brand studio for founders.',
        },
        {
          line: 'write' as const,
          href: `${S}claude-design-just-dropped-heres`,
          text: 'A hands-on read of Claude Design, a conversational design environment.',
        },
        {
          line: 'write' as const,
          href: `${S}mcp-and-the-agentic-future`,
          text: 'MCP and the agentic future: what it means for designers building tomorrow’s tools.',
        },
      ],
    },
  ],
};

export type Proof = (typeof HOW_I_AI.cards)[number]['proof'][number];

/* ---------- Every stop ---------- */

export interface StopRow {
  /** Anchor the rail links to (#stop-…). */
  id?: string;
  /** Line colour for the icon; omit for the grey base line. */
  line?: LineId;
  icon: IconId;
  title: string;
  sub: string;
  subIcon?: IconId;
  /** Only set where the destination is known. Rows without one are plain rows. */
  href?: string;
}

export interface StopGroup {
  title: string;
  lines: LineId[];
  rows: StopRow[];
}

export const STOP_LIST = {
  title: 'Every stop',
  intro: 'The same map as a list, grouped by line.',
  // TODO(john): the Map/List toggle is static, as in the reference (brief §13 Q6).
  toggle: ['Map', 'List'],
  footRight: 'Home · List view',
  groups: [
    {
      title: 'Case studies',
      lines: ['fowa', 'fpl', 'ppr'],
      // TODO(john): case-study destinations (brief §13 Q2). No links until decided.
      rows: [
        { id: 'stop-fpl', line: 'fpl', icon: 'case', title: 'Fully Paid Lending', sub: 'BNY Pershing · Wealth Services · NDA' },
        { id: 'stop-fowa', line: 'fowa', icon: 'case', title: 'Future of Wealth Advisory', sub: 'BNY Pershing · Wealth Services · NDA' },
        { id: 'stop-ppr', line: 'ppr', icon: 'case', title: 'Purple Panda Rentals', sub: 'Founder project · In progress', subIcon: 'progress' },
      ],
    },
    {
      title: 'Labs',
      lines: ['labs', 'ppr'],
      // TODO(john): should these three Labs items ship, and where do they link? (brief §13 Q5)
      rows: [
        { id: 'stop-labs', line: 'labs', icon: 'lab', title: 'Critique loop', sub: 'A design critic that scores work against a studio bar and names the gaps.' },
        { line: 'labs', icon: 'lab', title: 'Dev Mode handoff kit', sub: 'Conventions so design, engineering and QA read the same Figma file the same way.' },
        { line: 'labs', icon: 'lab', title: 'Studio autopilot', sub: 'No-code pipelines for intake, proposals and invoicing.' },
        { line: 'ppr', icon: 'case', title: 'Purple Panda Rentals', sub: 'Interchange with Case studies' },
      ],
    },
    {
      title: 'Design Thinker',
      lines: ['write'],
      rows: [
        { id: 'stop-write', line: 'write', icon: 'essay', title: 'Figma isn’t always the starting line', sub: 'Sep 29, 2026', href: ESSAY_URL },
        { line: 'write', icon: 'essay', title: 'Claude Design Just Dropped. Here’s What Designers Actually Need to Know.', sub: 'Apr 20, 2026', href: `${S}claude-design-just-dropped-heres` },
        // TODO(john): add this essay's URL.
        { line: 'write', icon: 'essay', title: 'I Don’t Know What’s Coming. But I Know Where I’m Looking.', sub: 'Apr 8, 2026' },
      ],
    },
    {
      title: 'About & Timetable',
      lines: [],
      rows: [
        { icon: 'about', title: 'About', sub: 'Who I am and how the work connects', href: SITE.about },
        // TODO(john): the Timetable page is out of scope for this build; the rail links here.
        { id: 'stop-timetable', icon: 'time', title: 'Timetable', sub: 'Where I have worked, and how to reach me' },
      ],
    },
  ] satisfies StopGroup[] as StopGroup[],
};

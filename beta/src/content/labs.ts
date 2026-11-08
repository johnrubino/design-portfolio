import type { Pt } from '../geometry/path';

// TODO(john): one-line intro for Labs (the live page has none).
export const LABS_INTRO = 'Things I build to test ideas about AI-native products and creative tools.';

export interface LabProject {
  /** Used for the row's anchor (#project-<slug>). */
  slug: string;
  title: string;
  /** Name at the project's stop on the Labs line. */
  mapLabel: string;
  /** The stop's position on the Labs line's centreline (map space). */
  stop: Pt;
  summary: string;
}

/** Labs projects, in the order the Labs line calls at them. Copy from johnrubino.design/labs. */
export const LABS: LabProject[] = [
  {
    slug: 'navori',
    title: 'Navori',
    mapLabel: 'Navori',
    stop: [300, 684],
    summary:
      'A personal AI operating system built around four specialized agents, designed to replace fragmented productivity tools with something that actually knows where you left off.',
  },
  {
    slug: 'music-maker',
    title: 'Music Maker',
    mapLabel: 'Music Maker',
    stop: [300, 732],
    summary:
      'A browser-based sequencer that makes it easy to sketch musical ideas without knowing how to play an instrument. Still figuring out the right interaction model.',
  },
  {
    slug: 'ai-knowledge-co-op',
    title: 'AI Knowledge Co-op',
    mapLabel: 'AI Knowledge Co-op',
    stop: [300, 780],
    summary:
      'A shared context layer for design teams, where institutional knowledge, critique, and past decisions live alongside your AI assistant instead of getting buried in Notion.',
  },
];

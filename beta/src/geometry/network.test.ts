import { describe, expect, it } from 'vitest';
import { LANE, LINES, LINE_WIDTH } from '../content/lines';
import { STATIONS } from '../content/stations';
import { BUILT_LINES, BUILT_PROJECT_STOPS, BUILT_STATIONS, STATION_TOL } from './network';
import { CASE_STUDIES } from '../content/caseStudies';
import { dist, segmentContaining, signature, type Pt } from './path';

const angleOf = (a: Pt, b: Pt) => ((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 360) % 360;

describe('route network geometry', () => {
  it.each(LINES.map((l) => [l.id, l] as const))('%s turns only at 0°, 45° or 90° multiples', (_id, l) => {
    for (let i = 0; i < l.centre.length - 1; i++) {
      const a = angleOf(l.centre[i], l.centre[i + 1]);
      expect(Math.abs(((a + 22.5) % 45) - 22.5)).toBeLessThan(1e-6);
    }
  });

  it.each(BUILT_LINES.map((b) => [b.line.id, b] as const))(
    '%s expanded and collapsed paths share one command list (morphable)',
    (_id, b) => {
      expect(signature(b.expanded)).toBe(signature(b.collapsed));
    },
  );

  it('neighbouring lines never overlap (Vignelli 1px gap)', () => {
    expect(LANE - LINE_WIDTH).toBeGreaterThanOrEqual(1);
  });

  it('every station sits on the centreline of each line that stops there', () => {
    for (const st of STATIONS) {
      for (const id of st.lines) {
        const line = LINES.find((l) => l.id === id)!;
        expect(segmentContaining(line.centre, st.at, STATION_TOL), `${st.id} on ${id}`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('stations stay clear of rounded corners on every stopping line', () => {
    for (const st of STATIONS) {
      for (const id of st.lines) {
        const line = LINES.find((l) => l.id === id)!;
        const corners = line.centre.slice(1, -1);
        const nearest = Math.min(...corners.map((c) => dist(c, st.at)));
        expect(nearest, `${st.id} on ${id}`).toBeGreaterThan(40);
      }
    }
  });

  it('each station carries only the lines that stop there', () => {
    // No line that passes a station without stopping may run within one lane of it.
    for (const st of STATIONS) {
      for (const line of LINES) {
        if (st.lines.includes(line.id)) continue;
        expect(segmentContaining(line.centre, st.at, STATION_TOL), `${line.id} passes through ${st.id}`).toBe(-1);
      }
    }
  });

  it('marker positions increase along the route, expanded and collapsed', () => {
    const dE = BUILT_STATIONS.map((s) => s.dE);
    const dC = BUILT_STATIONS.map((s) => s.dC);
    expect([...dE].sort((a, b) => a - b)).toEqual(dE);
    expect([...dC].sort((a, b) => a - b)).toEqual(dC);
  });

  it('every line passes its collapsed stations before it ends', () => {
    for (const st of STATIONS) {
      for (const id of st.lines) {
        const line = LINES.find((l) => l.id === id)!;
        expect(line.collapsedEndY, `${id} at ${st.id}`).toBeGreaterThanOrEqual(st.collapsedY);
      }
    }
  });

  it('project stops sit on the Case studies line, in order, clear of its corners', () => {
    const cs = LINES.find((l) => l.id === 'cs')!;
    for (const c of CASE_STUDIES) {
      expect(segmentContaining(cs.centre, c.stop), c.slug).toBeGreaterThanOrEqual(0);
      const nearest = Math.min(...cs.centre.slice(1, -1).map((v) => dist(v, c.stop)));
      expect(nearest, c.slug).toBeGreaterThan(40);
    }
    const ys = BUILT_PROJECT_STOPS.map((p) => p.y);
    expect([...ys].sort((a, b) => a - b)).toEqual(ys);
  });
});

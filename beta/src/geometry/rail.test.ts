import { describe, expect, it } from 'vitest';
import { LINE, LINE_IDS } from '../content/lines';
import { BADGE, CASE_STUDIES_PILL, CASING, HOME_PILL, LINE_WIDTH, PPR_LABS_PILL, ROUTES, SPACING, STOPS, TERMINUS_X, type Pt } from './rail';

/** The paths in the approved export, design/v5/map/rail-map.svg. */
const APPROVED: Record<string, string> = {
  write: 'M28.0 122.0 L41.00 122.00 Q54.0 122.0 54.00 135.00 L54.00 636.00 Q54.0 650.0 68.00 650.00 L150 650.0',
  labs: 'M28.0 113.0 L49.00 113.00 Q63.0 113.0 63.00 127.00 L63.00 506.00 Q63.0 520.0 77.00 520.00 L150 520.0',
  ppr: 'M28.0 104.0 L58.00 104.00 Q72.0 104.0 72.00 118.00 L72.00 372.00 Q72.0 386.0 86.00 386.00 L150 386.0',
  fpl: 'M28.0 95.0 L67.00 95.00 Q81.0 95.0 81.00 109.00 L81.00 292.00 Q81.0 306.0 95.00 306.00 L150 306.0',
  fowa: 'M28.0 86.0 L76.00 86.00 Q90.0 86.0 90.00 100.00 L90.00 212.00 Q90.0 226.0 104.00 226.00 L150 226.0',
};
const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

type Seg = [Pt, Pt];
const segments = (pts: Pt[]): Seg[] => pts.slice(1).map((p, i) => [pts[i], p]);
const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
/** True if the two segments touch or cross anywhere. */
function touch([a, b]: Seg, [c, d]: Seg) {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  const on = (p: Pt, q: Pt, r: Pt) =>
    cross(p, q, r) === 0 && Math.min(p[0], q[0]) <= r[0] && r[0] <= Math.max(p[0], q[0]) && Math.min(p[1], q[1]) <= r[1] && r[1] <= Math.max(p[1], q[1]);
  return on(c, d, a) || on(c, d, b) || on(a, b, c) || on(a, b, d);
}

describe('rail map geometry', () => {
  it('draws the same paths as the approved export', () => {
    for (const id of LINE_IDS) expect(numbers(ROUTES[id].d)).toEqual(numbers(APPROVED[id]));
  });

  it('is octilinear: every leg runs at 0°, 45° or 90°', () => {
    for (const id of LINE_IDS) {
      for (const [a, b] of segments(ROUTES[id].pts)) {
        const dx = Math.abs(b[0] - a[0]);
        const dy = Math.abs(b[1] - a[1]);
        expect(dx === 0 || dy === 0 || dx === dy, `${id} ${a} → ${b}`).toBe(true);
      }
    }
  });

  it('uses 5px lines with a 3px outline, bundled 9px apart', () => {
    expect(LINE_WIDTH).toBe(5);
    expect(CASING).toBe(3);
    expect(SPACING).toBe(9);
    // Order down the rail, and east to west across the trunk: FoWA → FPL → PPR → Labs → Writing.
    for (let i = 1; i < LINE_IDS.length; i++) {
      const prev = ROUTES[LINE_IDS[i - 1]];
      const cur = ROUTES[LINE_IDS[i]];
      expect(prev.laneX - cur.laneX).toBe(SPACING); // vertical lanes
      expect(cur.pts[0][1] - prev.pts[0][1]).toBe(SPACING); // leaving Home
      expect(cur.end[1]).toBeGreaterThan(prev.end[1]);
    }
  });

  it('never crosses or touches another line', () => {
    for (let i = 0; i < LINE_IDS.length; i++) {
      for (let j = i + 1; j < LINE_IDS.length; j++) {
        for (const s of segments(ROUTES[LINE_IDS[i]].pts)) {
          for (const t of segments(ROUTES[LINE_IDS[j]].pts)) {
            expect(touch(s, t), `${LINE_IDS[i]} × ${LINE_IDS[j]}`).toBe(false);
          }
        }
      }
    }
  });

  it('ends every line on one shared x', () => {
    for (const id of LINE_IDS) expect(ROUTES[id].end[0]).toBe(TERMINUS_X);
  });

  it('spans each interchange pill across exactly the lanes it serves', () => {
    for (const p of [CASE_STUDIES_PILL, PPR_LABS_PILL]) {
      const xs = p.lines.map((l) => ROUTES[l].laneX);
      expect(p.x + 10).toBe(Math.min(...xs));
      expect(p.x + p.w - 10).toBe(Math.max(...xs));
    }
    const ys = LINE_IDS.map((id) => ROUTES[id].pts[0][1]);
    expect(HOME_PILL.y + 10).toBe(Math.min(...ys));
    expect(HOME_PILL.y + HOME_PILL.h - 10).toBe(Math.max(...ys));
  });

  it('puts each regular stop on its own line', () => {
    for (const s of STOPS) {
      const r = ROUTES[s.line];
      expect(s.at[0]).toBe(r.laneX);
      expect(s.at[1]).toBeGreaterThan(r.pts[1][1]);
      expect(s.at[1]).toBeLessThan(r.pts[2][1]);
    }
  });

  it('keeps the fixed badge codes, colours and size', () => {
    expect(BADGE).toEqual({ w: 44, h: 18, r: 9 });
    expect(LINE_IDS.map((id) => LINE[id].code)).toEqual(['FoWA', 'FPL', 'PPR', 'Labs', 'W']);
    expect(LINE_IDS.map((id) => LINE[id].colour)).toEqual(['#FF6B4A', '#E8A317', '#5B8CFF', '#B57BFF', '#D4C09A']);
  });
});

import { describe, expect, it } from 'vitest';
import { BUILT_LINES, BUILT_STATIONS } from './network';
import { signature } from './path';

/** Paths copied from the approved prototype (design/Journey.dc.html). */
const PROTOTYPE_EXPANDED: Record<string, string> = {
  l1: 'M177 130 L177 321.7 Q177 338.8 189.1 350.9 L194.9 356.8 Q201.2 363 210 363 L210 363 Q218.8 363 225.1 356.8 L284.7 297.1 Q298.8 283 318.8 283 L412 283',
  l2: 'M168 130 L168 322.5 Q168 342.5 182.1 356.7 L183.3 357.9 Q197.5 372 217.5 372 L412 372',
  l3: 'M159 130 L159 326.3 Q159 346.3 173.1 360.4 L179.6 366.9 Q193.7 381 213.7 381 L213.7 381 Q233.7 381 247.9 395.1 L279.6 426.9 Q293.7 441 313.7 441 L412 441',
  l5: 'M150 130 L150 450 Q150 470 164.1 484.1 L255.9 575.9 Q270 590 290 590 L412 590',
  l4: 'M141 130 L141 453.7 Q141 473.7 155.1 487.9 L292.1 624.9 Q306.3 639 326.3 639 L412 639',
  l7: 'M132 130 L132 457.5 Q132 477.5 146.1 491.6 L317.9 663.3 Q332 677.5 332 697.5 L332 835',
  l6: 'M123 130 L123 461.2 Q123 481.2 137.1 495.3 L308.9 667 Q323 681.2 323 701.2 L323 728.8 Q323 748.8 308.9 763 L274.7 797.1 Q263 808.8 263 825.4 L263 842',
};

const PROTOTYPE_COLLAPSED: Record<string, string> = {
  l1: 'M91 130 L91 220.1 Q91 233.4 91 246.7 L91 250.6 Q91 260 91 269.4 L91 269.4 Q91 278.8 91 288.2 L91 312 Q91 332 91 352 L91 380',
  l7: 'M46 130 L46 414.2 Q46 434.2 46 454.2 L46 667.3 Q46 687.3 46 707.3 L46 835',
  l6: 'M37 130 L37 412.8 Q37 432.8 37 452.8 L37 664.7 Q37 684.7 37 704.7 L37 744.8 Q37 764.8 37 784.8 L37 830.6 Q37 840.4 37 850.2 L37 860',
};

const nums = (d: string) => d.match(/-?\d+(\.\d+)?/g)!.map(Number);

function expectClose(actual: string, expected: string) {
  expect(actual.replace(/[^A-Z]/g, '')).toBe(expected.replace(/[^A-Z]/g, ''));
  const a = nums(actual);
  const e = nums(expected);
  expect(a.length).toBe(e.length);
  a.forEach((v, i) => expect(Math.abs(v - e[i])).toBeLessThanOrEqual(0.15));
}

describe('route network geometry', () => {
  it.each(BUILT_LINES.map((b) => [b.line.id, b] as const))('%s matches the prototype expanded path', (id, b) => {
    expectClose(b.dE, PROTOTYPE_EXPANDED[id]);
  });

  it.each(Object.keys(PROTOTYPE_COLLAPSED))('%s matches the prototype collapsed path', (id) => {
    const b = BUILT_LINES.find((l) => l.line.id === id)!;
    expectClose(b.dC, PROTOTYPE_COLLAPSED[id]);
  });

  it.each(BUILT_LINES.map((b) => [b.line.id, b] as const))(
    '%s expanded and collapsed paths share one command list (morphable)',
    (_id, b) => {
      expect(signature(b.expanded)).toBe(signature(b.collapsed));
    },
  );

  it('station markers sit where the prototype draws them', () => {
    const labs = BUILT_STATIONS.find((s) => s.id === 'labs')!;
    expect(labs.expanded.capsule.angle).toBeCloseTo(135);
    expect(labs.expanded.capsule.w).toBeCloseTo(36);
    expect(labs.expanded.dots.map((d) => [+d.x.toFixed(1), +d.y.toFixed(1)])).toEqual([
      [202, 522], [195.6, 528.4], [189.3, 534.7],
    ]);
    const about = BUILT_STATIONS[0];
    expect(about.expanded.capsule).toMatchObject({ x: 150, y: 160, w: 72, angle: 180 });
  });

  it('train parking distances increase along the route', () => {
    const dE = BUILT_STATIONS.map((s) => s.dE);
    const dC = BUILT_STATIONS.map((s) => s.dC);
    expect([...dE].sort((a, b) => a - b)).toEqual(dE);
    expect([...dC].sort((a, b) => a - b)).toEqual(dC);
  });
});

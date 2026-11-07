/**
 * Small path toolkit for the route map.
 *
 * A line is stored as a list of commands (M, then alternating L/Q, then L).
 * Expanded and collapsed versions of a line are both produced by
 * `rounded()` from the same number of vertices, so their command lists
 * always match and the CSS `d` transition can interpolate between them.
 */

export type Pt = readonly [number, number];

export type Cmd =
  | { t: 'M'; p: Pt }
  | { t: 'L'; p: Pt }
  | { t: 'Q'; c: Pt; p: Pt };

export const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
export const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
export const mul = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
export const len = (a: Pt): number => Math.hypot(a[0], a[1]);
export const dist = (a: Pt, b: Pt): number => len(sub(a, b));
export const unit = (a: Pt): Pt => {
  const l = len(a);
  return l === 0 ? [0, 0] : [a[0] / l, a[1] / l];
};

/** Normal pointing to the RIGHT of the direction of travel (screen coords, y down). */
export const rightNormal = (dir: Pt): Pt => {
  const u = unit(dir);
  return [-u[1], u[0]];
};

/**
 * Offset a polyline sideways by `d` px (positive = right of travel).
 * End points move perpendicular to their segment; interior points sit on
 * the miter intersection of the two offset segments.
 */
export function offsetPts(pts: readonly Pt[], d: number): Pt[] {
  if (d === 0) return pts.map((p) => [p[0], p[1]] as Pt);
  const segs = pts.slice(1).map((p, i) => {
    const a = pts[i];
    const n = mul(rightNormal(sub(p, a)), d);
    return { a: add(a, n), b: add(p, n), dir: unit(sub(p, a)) };
  });
  const out: Pt[] = [segs[0].a];
  for (let i = 1; i < segs.length; i++) {
    const s0 = segs[i - 1];
    const s1 = segs[i];
    const x = intersect(s0.a, s0.dir, s1.a, s1.dir);
    out.push(x ?? s0.b);
  }
  out.push(segs[segs.length - 1].b);
  return out;
}

function intersect(p: Pt, r: Pt, q: Pt, s: Pt): Pt | null {
  const cross = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(cross) < 1e-9) return null;
  const qp = sub(q, p);
  const t = (qp[0] * s[1] - qp[1] * s[0]) / cross;
  return add(p, mul(r, t));
}

/**
 * Round every interior corner with a quadratic curve. The cut back from
 * each corner is `radius`, limited to half of each adjacent segment.
 * Always emits M, then (L, Q) per interior vertex, then a final L, even
 * when a segment is zero length, so the command list depends only on the
 * vertex count.
 */
export function rounded(pts: readonly Pt[], radius = 20): Cmd[] {
  const cmds: Cmd[] = [{ t: 'M', p: pts[0] }];
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const v = pts[i];
    const next = pts[i + 1];
    const cut = Math.min(radius, dist(prev, v) / 2, dist(v, next) / 2);
    const a = sub(v, mul(unit(sub(v, prev)), cut));
    const b = add(v, mul(unit(sub(next, v)), cut));
    cmds.push({ t: 'L', p: a });
    cmds.push({ t: 'Q', c: v, p: b });
  }
  cmds.push({ t: 'L', p: pts[pts.length - 1] });
  return cmds;
}

const f = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Object.is(r, -0) ? '0' : String(r);
};

export function toD(cmds: readonly Cmd[]): string {
  return cmds
    .map((c) => {
      if (c.t === 'Q') return `Q${f(c.c[0])} ${f(c.c[1])} ${f(c.p[0])} ${f(c.p[1])}`;
      return `${c.t}${f(c.p[0])} ${f(c.p[1])}`;
    })
    .join(' ');
}

/** Command letters only, e.g. "MLQLQL". Used to assert morph compatibility. */
export const signature = (cmds: readonly Cmd[]) => cmds.map((c) => c.t).join('');

/** Densely sample a path into points with cumulative arclength. */
export function sample(cmds: readonly Cmd[], step = 0.5): { p: Pt; s: number }[] {
  const out: { p: Pt; s: number }[] = [];
  let cur: Pt = [0, 0];
  let s = 0;
  const push = (p: Pt) => {
    if (out.length) s += dist(out[out.length - 1].p, p);
    out.push({ p, s });
  };
  for (const c of cmds) {
    if (c.t === 'M') {
      cur = c.p;
      push(cur);
      continue;
    }
    const start = cur;
    const approx = c.t === 'L' ? dist(start, c.p) : dist(start, c.c) + dist(c.c, c.p);
    const n = Math.max(1, Math.ceil(approx / step));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      if (c.t === 'L') push(add(start, mul(sub(c.p, start), t)));
      else {
        const u = 1 - t;
        push([
          u * u * start[0] + 2 * u * t * c.c[0] + t * t * c.p[0],
          u * u * start[1] + 2 * u * t * c.c[1] + t * t * c.p[1],
        ]);
      }
    }
    cur = c.p;
  }
  return out;
}

export const pathLength = (cmds: readonly Cmd[]) => {
  const s = sample(cmds);
  return s[s.length - 1].s;
};

/** Arclength along the path of the sample nearest to `pt`. */
export function lengthAt(cmds: readonly Cmd[], pt: Pt): number {
  let best = Infinity;
  let bestS = 0;
  for (const { p, s } of sample(cmds, 0.25)) {
    const d = dist(p, pt);
    if (d < best) {
      best = d;
      bestS = s;
    }
  }
  return bestS;
}

/** Cumulative arclength at every polyline vertex. */
export function cumulative(pts: readonly Pt[]): number[] {
  const out = [0];
  for (let i = 1; i < pts.length; i++) out.push(out[i - 1] + dist(pts[i - 1], pts[i]));
  return out;
}

/** Index of the polyline segment that contains `pt` (within `tol` px), or -1. */
export function segmentContaining(pts: readonly Pt[], pt: Pt, tol = 0.75): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const ab = sub(b, a);
    const l2 = ab[0] * ab[0] + ab[1] * ab[1];
    const t = Math.max(0, Math.min(1, ((pt[0] - a[0]) * ab[0] + (pt[1] - a[1]) * ab[1]) / l2));
    if (dist(add(a, mul(ab, t)), pt) <= tol) return i;
  }
  return -1;
}

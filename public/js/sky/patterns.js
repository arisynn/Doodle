import { W } from './constants.js';
import { BALANCE as B } from './balance.js';
import { reach } from './jumpmodel.js';
const lerp = (a, b, t) => a + (b - a) * t, clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function makeKit(rng, d, taps) {
  const kit = { rng, d, taps };
  kit.gap = (rest = false) => rest ? B.gap.rest + rng() * 8 : Math.min(B.gap.max, lerp(B.gap.easy, B.gap.hard, d) + rng() * (B.gap.jitter + 8 * d));
  kit.width = kind => ({ precision: B.width.precision + rng() * 6, recovery: B.width.recovery, branch: B.width.branch + rng() * 6 })[kind] ?? lerp(B.width.easy, B.width.hard, d) + rng() * B.width.jitter;
  kit.maxShift = (dy, wa, wb, frac = 1) => reach(dy, taps) * B.safety * frac + (wa + wb) / 2;
  kit.place = (cx, w) => clamp(cx, 24 + w / 2, W - 24 - w / 2);
  return kit;
}
function walk(kit, ctx, count, widthKind, shiftFn, restRows = false) {
  const rows = [];
  let cx = ctx.cx, prevW = ctx.prevW, prevType = ctx.prevType;
  for (let i = 0; i < count; i++) {
    const dy = kit.gap(restRows), w = kit.width(widthKind), type = ctx.pickType(i, prevType, dy, w);
    const S = kit.maxShift(dy, prevW, w);
    cx = kit.place(cx + shiftFn(i, S, cx), w);
    rows.push({ dy, rest: restRows, nodes: [{ cx, w, type, spine: true }] });
    prevW = w; prevType = type;
  }
  return rows;
}
const count = (kit, lo, hi) => lo + Math.floor(kit.rng() * (hi - lo + 1));
export const PATTERN_BUILDERS = {
  staircase(kit, ctx) {
    let dir = kit.rng() < .5 ? -1 : 1;
    return walk(kit, ctx, count(kit, 5, 8), 'normal', (i, S, cx) => { if (cx < 110) dir = 1; if (cx > 290) dir = -1; return dir * S * (.4 + .4 * kit.rng()); });
  },
  zigzag(kit, ctx) {
    let sign = kit.rng() < .5 ? -1 : 1;
    return walk(kit, ctx, count(kit, 5, 7), 'normal', (i, S, cx) => { sign = -sign; const s = sign * S * (.65 + .3 * kit.rng()); return cx + s < 60 || cx + s > 340 ? -s : s; });
  },
  lanes(kit, ctx) {
    let side = kit.rng() < .5 ? -1 : 1;
    return walk(kit, ctx, count(kit, 5, 7), 'normal', (i, S, cx) => { const amp = Math.min(95, S * .47); side = -side; return clamp(200 + side * amp - cx, -S * .95, S * .95); });
  },
  moving(kit, ctx) {
    const rows = walk(kit, ctx, count(kit, 4, 6), 'normal', () => (kit.rng() - .5) * 50);
    rows.forEach((row, i) => { const n = row.nodes[0]; n.type = 'moving'; n.w = 84 + kit.rng() * 8; n.phase = i % 2 ? Math.PI : 0; n.cx = kit.place(n.cx, n.w); });
    return rows;
  },
  precision(kit, ctx) {
    let sign = kit.rng() < .5 ? -1 : 1;
    return walk(kit, ctx, count(kit, 4, 5), 'precision', (i, S, cx) => { sign = -sign; const s = sign * S * (.8 + .15 * kit.rng()); return cx + s < 50 || cx + s > 350 ? -s : s; });
  },
  recovery(kit, ctx) {
    return walk(kit, ctx, count(kit, 4, 6), 'recovery', () => (kit.rng() - .5) * 60, true);
  },
  branch(kit, ctx) {
    const rng = kit.rng, dyFork = kit.gap(), forkW = 100;
    const S = kit.maxShift(dyFork, ctx.prevW, forkW) * .9, target = clamp(ctx.cx, 140, 260);
    const forkCx = kit.place(ctx.cx + clamp(target - ctx.cx, -S, S), forkW);
    const fork = { cx: forkCx, w: forkW, type: 'normal', spine: true };
    const rows = [{ dy: dyFork, nodes: [fork] }];
    const sideA = rng() < .5 ? -1 : 1;
    let prevB = fork, prevTypeA = 'normal', prevTypeB = 'normal';
    for (let i = 0; i < 3; i++) {
      const dy = kit.gap(), wA = kit.width('branch'), wB = kit.width('branch');
      const typeA = ctx.pickType(i, prevTypeA, dy, wA), typeB = ctx.pickType(i + 1, prevTypeB, dy, wB);
      const a = { cx: kit.place(forkCx + sideA * 70, wA), w: wA, type: typeA === 'moving' ? 'normal' : typeA, spine: true };
      const b = { cx: kit.place(forkCx - sideA * 70, wB), w: wB, type: typeB === 'moving' ? 'normal' : typeB, spine: false, risk: true, from: prevB };
      rows.push({ dy, nodes: [a, b] }); prevB = b; prevTypeA = a.type; prevTypeB = b.type;
    }
    rows.push({ dy: kit.gap(), nodes: [{ cx: kit.place(forkCx + (rng() - .5) * 30, forkW), w: forkW, type: 'normal', spine: true }] });
    return rows;
  }
};

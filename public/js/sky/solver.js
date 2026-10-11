import { W } from './constants.js';
import { APEX, MAX_RISE, reach } from './jumpmodel.js';
import { BALANCE as B } from './balance.js';
import { tileBounds, overlaps } from './placement.js';
const PERIOD = W + 35;
const sweep = n => { const s = n.type === 'moving' ? 27 : 0; return [n.x - s, n.x + n.w + s]; };
const gap1 = (al, ar, bl, br) => Math.max(0, bl - ar, al - br);
// Horizontal gap between takeoff span of a and landing span of b, including screen wrapping.
export function hGap(a, b) {
  const [al, ar] = sweep(a), [bl, br] = sweep(b);
  return Math.min(...[-PERIOD, 0, PERIOD].map(s => gap1(al, ar, bl - 8 + s, br + 8 + s)));
}
export const dyWorst = (a, b) => (a.y - b.y) + (a.type === 'elevator' ? 15 : 0) + (b.type === 'elevator' ? 15 : 0);
export function edgeOk(a, b, taps) {
  const dy = dyWorst(a, b);
  if (dy > APEX - B.edgeMargin) return false;
  return hGap(a, b) <= reach(Math.max(0, dy), taps);
}
const ELEV = 15;
// A normal jump must never land two levels up (springs are the intended exception). Elevators are taken at their most favourable pose.
export const twoLevelOk = (a, c) => a.type === 'spring' || (a.y - c.y) - (a.type === 'elevator' ? ELEV : 0) - (c.type === 'elevator' ? ELEV : 0) >= MAX_RISE + B.twoLevelMargin;
// Returns a list of problems; empty means every node is reachable and nothing collides.
export function validateRows(prev, rows, existing, taps, ctx = {}) {
  const issues = [], placed = [];
  let last = prev;
  rows.forEach((row, i) => {
    let spine = null;
    for (const n of row.nodes) {
      if (!edgeOk(n.from ?? last, n, taps)) issues.push(`row ${i}: ${n.type} unreachable`);
      const box = tileBounds(n);
      if ([...existing, ...placed].some(o => overlaps(box, tileBounds(o), 10))) issues.push(`row ${i}: ${n.type} overlaps`);
      placed.push(n);
      if (n.spine) spine = n;
    }
    if (!spine) issues.push(`row ${i}: no spine`);
    last = spine ?? last;
  });
  const levels = [ctx.before ?? [], ctx.prevRow ?? [prev], ...rows.map(r => r.nodes)];
  for (let i = 0; i + 2 < levels.length; i++) for (const a of levels[i]) for (const c of levels[i + 2]) if (!twoLevelOk(a, c)) issues.push(`level ${i}: ${a.type} reaches two levels up`);
  for (let i = 0; i < rows.length - 1; i++) for (const n of rows[i].nodes) if (!rows[i + 1].nodes.some(m => edgeOk(n, m, taps))) issues.push(`row ${i}: dead end`);
  return issues;
}

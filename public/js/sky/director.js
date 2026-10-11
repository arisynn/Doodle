import { BALANCE as B, difficultyAt, tapsFor } from './balance.js';
import { toMeters } from './constants.js';
import { weighted, ENEMIES } from './catalog.js';
import { PATTERN_BUILDERS, makeKit } from './patterns.js';
import { validateRows } from './solver.js';
const clamp = (n, a, b) => Math.max(a, Math.min(b, n)), lerp = (a, b, t) => a + (b - a) * t;
const TYPE_RULES = { precision: ['normal', 'spring'], recovery: ['normal'], branch: ['normal', 'spring', 'fragile', 'ice', 'conveyor', 'cloud'], lanes: ['normal', 'moving', 'ice', 'conveyor', 'spring'] };
const STRAIN = ['moving', 'elevator', 'phase', 'ice', 'fragile', 'cloud', 'conveyor'];
// Decides what the next ~6 platforms look like: pacing role -> difficulty -> pattern -> validated layout.
export class LevelDirector {
  constructor(rng, introduced) {
    this.rng = rng; this.introduced = introduced; this.beatIndex = 0; this.cycleIndex = 0; this.lastPattern = ''; this.enemyIntroTries = {};
    this.stats = { beats: 0, retries: 0, fallbacks: 0 };
  }
  pendingIntro(m) {
    for (const [id, at] of B.platformUnlock) if (m >= at && !this.introduced.has('type:' + id)) return { kind: 'type', id };
    const enemies = Object.entries(ENEMIES).sort((a, b) => a[1].at - b[1].at);
    for (const [id, data] of enemies) if (m >= data.at && !this.introduced.has('enemy:' + id)) return { kind: 'enemy', id };
    return null;
  }
  choosePattern(role, d, m, featured) {
    if (featured?.kind === 'type') return 'staircase';
    const options = [];
    for (const [id, weight] of Object.entries(B.grammar[role])) {
      if (id === 'moving' && !this.introduced.has('type:moving')) continue;
      if (id === 'precision' && d < .25) continue;
      if (id === 'branch' && m < 60) continue;
      options.push({ id, weight: id === this.lastPattern ? weight * .2 : weight });
    }
    return weighted(this.rng, options) ?? 'staircase';
  }
  typePicker(c, pattern) {
    const featured = c.featured?.kind === 'type' ? c.featured.id : null, allowed = TYPE_RULES[pattern];
    return (i, prevType, dy, w) => {
      if (featured) return i % 3 === 1 ? featured : 'normal';
      if (c.role === 'intro') return 'normal';
      if (pattern === 'moving') return 'moving';
      const options = [{ id: 'normal', weight: Math.max(18, 65 - c.d * 42) }];
      for (const [id, , weight] of B.platformUnlock) {
        if (!this.introduced.has('type:' + id) || (allowed && !allowed.includes(id))) continue;
        if (id === 'elevator' && (dy > B.gap.elevatorMax || prevType === 'elevator')) continue;
        if (B.disappearing.includes(id) && B.disappearing.includes(prevType) && c.d < .7) continue;
        options.push({ id, weight });
      }
      return weighted(this.rng, options);
    };
  }
  build(pattern, c) {
    const kit = makeKit(this.rng, c.d, c.taps);
    return PATTERN_BUILDERS[pattern](kit, { cx: c.prev.x + c.prev.w / 2, prevW: c.prev.w, prevType: c.prev.type, pickType: this.typePicker(c, pattern) });
  }
  layout(rows, topY) {
    let y = topY;
    for (const row of rows) { y -= row.dy; for (const n of row.nodes) { n.y = y; n.x = n.cx - n.w / 2; } }
  }
  fallback(c) {
    const rows = Array.from({ length: 5 }, () => ({ dy: B.gap.rest, rest: true, nodes: [{ cx: c.prev.x + c.prev.w / 2, w: B.width.recovery, type: 'normal', spine: true }] }));
    return rows;
  }
  nextBeat(world) {
    const m = toMeters(world.top), first = this.beatIndex === 0;
    this.beatIndex++;
    const featured = first ? null : this.pendingIntro(m);
    const role = first || featured ? 'intro' : B.pacing.cycle[this.cycleIndex++ % B.pacing.cycle.length];
    const warm = m < B.difficulty.warmupMeters ? lerp(B.difficulty.warmupFloor, 1, m / B.difficulty.warmupMeters) : 1;
    const d = clamp(difficultyAt(m) * B.pacing.mult[role] * warm, 0, 1), taps = tapsFor(d), prev = world.lastSpine;
    const c = { d, m, taps, prev, featured, role };
    let rows, pattern, issues = ['x'], attempts = 0;
    for (; attempts < B.maxAttempts && issues.length; attempts++) {
      pattern = attempts < B.maxAttempts - 2 ? this.choosePattern(role, d, m, featured) : 'recovery';
      rows = this.build(pattern, c); this.layout(rows, world.top);
      issues = validateRows(prev, rows, world.platforms, taps, { before: world.rowBefore, prevRow: world.rowPrev });
    }
    if (issues.length) { rows = this.fallback(c); this.layout(rows, world.top); pattern = 'fallback'; this.stats.fallbacks++; }
    this.stats.beats++; this.stats.retries += attempts - 1; this.lastPattern = pattern;
    if (featured?.kind === 'type') this.introduced.add('type:' + featured.id);
    if (featured?.kind === 'enemy' && (this.enemyIntroTries[featured.id] = (this.enemyIntroTries[featured.id] || 0) + 1) >= 3) this.introduced.add('enemy:' + featured.id);
    const spine = rows.flatMap(r => r.nodes.filter(n => n.spine));
    const load = clamp(spine.reduce((sum, n) => sum + (n.w < 72 ? 1 : 0) + (STRAIN.includes(n.type) ? .5 : 0), 0) / spine.length, 0, 1);
    const noEnemies = role === 'recovery' || ['precision', 'recovery', 'fallback'].includes(pattern) || (role === 'intro' && featured?.kind !== 'enemy');
    return { idx: this.beatIndex, role, pattern, d, m, taps, rows, prev, featured, attempts, load, noEnemies, y0: world.top };
  }
}

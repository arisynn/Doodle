import { zoneAt, POWERS } from './catalog.js';
import { sideTile } from './placement.js';
import { toMeters } from './constants.js';
import { BALANCE } from './balance.js';
import { LevelDirector } from './director.js';
import { EncounterDirector } from './encounters.js';
export { W, H, GRAVITY, JUMP, SPEED, PX_PER_M, START_Y, toMeters } from './constants.js';
import { W, H } from './constants.js';
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function random(seed) { return () => { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export class World {
  constructor(seed, options = {}) {
    this.seed = seed; this.rng = random(seed); this.introduced = new Set(); this.history = options.history ? [] : null;
    this.platforms = [{ x: 142, y: 660, baseY: 660, w: 116, type: 'normal', id: 0, baseX: 142, zone: 0, safe: true }];
    this.lastSpine = { x: 142, y: 660, w: 116, type: 'normal' }; this.rowBefore = []; this.rowPrev = [this.lastSpine]; this.rowLevel = 0;
    this.items = []; this.enemies = []; this.level = 0; this.top = 660; this.motionTime = 0;
    this.nextPower = 80; this.lastPowers = []; this.lastDrop = {};
    this.director = new LevelDirector(this.rng, this.introduced); this.encounters = new EncounterDirector(this.rng, this.introduced);
    this.beatLog = []; this.spineLog = []; this.currentBeat = null;
    this.generate(-300);
  }
  generate(top, active = {}) { while (this.top > top - BALANCE.lookahead) this.addBeat(active); }
  addBeat(active) {
    const beat = this.director.nextBeat(this), made = [];
    for (const row of beat.rows) { this.rowLevel++; for (const n of row.nodes) {
      n.level = this.rowLevel;
      const p = { level: this.rowLevel, id: ++this.level, x: n.x, baseX: n.x, y: n.y, baseY: n.y, w: n.w, type: n.type, phase: n.phase ?? this.rng() * Math.PI * 2, zone: zoneAt(toMeters(n.y)), speed: 1 + beat.d * .8, active: true, direction: this.rng() < .5 ? -1 : 1, safe: n.type !== 'phase', spine: n.spine };
      n.platform = p; made.push(p); this.platforms.push(p);
    } }
    this.rowBefore = beat.rows.length > 1 ? beat.rows.at(-2).nodes : this.rowPrev; this.rowPrev = beat.rows.at(-1).nodes;
    const lastNode = beat.rows.at(-1).nodes.find(n => n.spine), lastY = beat.rows.at(-1).nodes[0].y;
    this.top = lastY; this.lastSpine = { x: lastNode.x, y: lastNode.y, w: lastNode.w, type: lastNode.type, platform: lastNode.platform };
    // Phase tiles always get a fixed side alternative; if none fits they become solid.
    for (const p of made.filter(q => q.type === 'phase')) {
      const alternative = sideTile(this.platforms, p, 64, `safe-${p.id}`);
      if (alternative) { alternative.level = p.level; this.platforms.push(alternative); } else { p.type = 'normal'; p.safe = true; }
    }
    const powerRows = new Set();
    beat.rows.forEach((row, i) => {
      const n = row.nodes.find(q => q.spine), p = n.platform, meters = toMeters(p.baseY);
      this.spineLog.push({ x: p.baseX + p.w / 2, y: p.baseY });
      if (this.rng() < BALANCE.starChance) this.items.push({ type: 'star', x: n.cx, y: n.y - 32, phase: p.id });
      if (row.rest && i > 0) for (const dx of [-24, 24]) this.items.push({ type: 'star', x: n.cx + dx, y: n.y - 44, phase: p.id });
      for (const r of row.nodes.filter(q => q.risk)) for (const dx of [-18, 0, 18]) this.items.push({ type: 'star', x: r.cx + dx, y: r.y - 40 - Math.abs(dx) / 3, phase: p.id });
      if (meters >= this.nextPower && !['phase', 'fragile', 'cloud'].includes(p.type) && this.spawnPower(p, meters, active)) powerRows.add(i);
    });
    this.encounters.plan(beat, this, powerRows);
    this.currentBeat = beat;
    this.beatLog.push({ idx: beat.idx, role: beat.role, pattern: beat.pattern, d: +beat.d.toFixed(2), taps: beat.taps, attempts: beat.attempts, budget: beat.budget, spent: beat.spent, load: +beat.load.toFixed(2), decisions: beat.decisions, y: beat.y0 });
    if (this.beatLog.length > 12) this.beatLog.shift();
    if (this.history) this.history.push(beat);
  }
  spawnPower(p, meters, active) {
    const available = Object.entries(POWERS).filter(([id, power]) => meters >= power.at && !this.lastPowers.includes(id)
      && meters - (this.lastDrop[id] ?? -1e9) >= power.dropCooldown && !(active.cool?.[id] > 0) && !(id === 'jetpack' ? active.jet > 0 : active[id]));
    if (!available.length) { this.nextPower = meters + 12; return false; }
    const total = available.reduce((n, [, data]) => n + data.weight, 0);
    let roll = this.rng() * total, type = available.at(-1)[0];
    for (const [id, data] of available) { roll -= data.weight; if (roll <= 0) { type = id; break; } }
    this.items.push({ type, x: p.baseX + p.w / 2, y: p.baseY - 43, phase: p.id });
    this.lastPowers = [...this.lastPowers, type].slice(-2); this.lastDrop[type] = meters;
    this.nextPower = meters + 18 + this.rng() * 12 + Math.min(12, meters / 250);
    return true;
  }
  update(time, dt, camera, active = {}) {
    const speed = active.slow > 0 ? .42 : 1;
    this.motionTime += dt * speed;
    this.generate(camera, active);
    for (const p of this.platforms) {
      const t = this.motionTime * (p.speed || 1) + (p.phase || 0);
      if (p.type === 'moving') p.x = clamp(p.baseX + Math.sin(t * 1.35) * 27, 5, W - p.w - 5);
      if (p.type === 'elevator') p.y = p.baseY + Math.sin(t * 1.3) * 15;
      if (p.type === 'phase') { const cycle = ((t % 4.2) + 4.2) % 4.2; p.active = cycle < 2.9; p.fading = cycle > 2.3; }
      if (p.dissolve !== undefined) { p.dissolve -= dt; if (p.dissolve <= 0) p.broken = true; }
    }
    this.platforms = this.platforms.filter(p => p.y < camera + H + 110 && !p.broken);
    this.items = this.items.filter(p => p.y < camera + H + 100 && !p.taken);
    this.enemies = this.enemies.filter(p => p.y < camera + H + 100 && !p.dead);
    if (this.spineLog.length > 160) this.spineLog.splice(0, this.spineLog.length - 160);
    for (const e of this.enemies) {
      const t = this.motionTime * e.speed;
      if (e.type === 'bat') e.x = clamp(e.baseX + Math.sin(t * 1.3 + e.phase) * 70, 30, W - 30);
      if (e.type === 'drone') e.x = clamp(e.baseX + Math.sin(t * .6 + e.phase) * 25, 30, W - 30);
      if (e.type === 'bee') { e.x = clamp(e.baseX + Math.sin(t * 1.9 + e.phase) * 63, 30, W - 30); e.y = e.baseY + Math.sin(t * 3.8 + e.phase) * 17; }
      if (e.type === 'jelly') { e.y = e.baseY + Math.sin(t * 1.5 + e.phase) * 21; e.x = e.baseX + Math.sin(t * .7 + e.phase) * 25; }
      if (e.type === 'beetle') e.x = e.baseX + Math.sin(t + e.phase) * 12;
      if (e.type === 'wisp' && !e.dash) e.y = e.baseY + Math.sin(t * 1.7 + e.phase) * 12;
    }
  }
}

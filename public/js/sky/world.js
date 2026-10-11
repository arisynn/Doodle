import { zoneAt, POWERS, ENEMIES, weighted } from './catalog.js';
import { sideTile } from './placement.js';
export const W = 400, H = 720, GRAVITY = 1550, JUMP = -720, SPEED = 340;
// Physical scale: the 40px collision body is a 1 m tall character, so 1 m = 40 px.
export const PX_PER_M = 40, START_Y = 636;
export const toMeters = y => Math.max(0, (START_Y - y) / PX_PER_M);
export const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
export function random(seed) { return () => { let t = seed += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export class World {
  constructor(seed) {
    this.rng = random(seed); this.platforms = [{ x: 142, y: 660, baseY: 660, w: 116, type: 'normal', id: 0, baseX: 142, zone: 0, safe: true }];
    this.items = []; this.enemies = []; this.level = 0; this.top = 660; this.lastCenter = 200; this.motionTime = 0;
    this.nextPower = 80; this.nextEnemy = 150; this.lastShooter = -1000; this.lastPowers = []; this.lastDrop = {}; this.lastEnemy = ''; this.pattern = 'stairs'; this.direction = 1;
    this.generate(-300);
  }
  generate(top, active = {}) {
    while (this.top > top - 190) {
      const n = ++this.level, meters = toMeters(this.top), zone = zoneAt(meters);
      const intensity = Math.min(1, meters / 3500), late = 1 - Math.exp(-Math.max(0, meters - 3500) / 8000);
      // Pattern chunks create recognizable choices instead of unrelated random tiles.
      if (n % 10 === 1) { this.pattern = ['stairs', 'zigzag', 'scatter', 'rest'][Math.floor(this.rng() * 4)]; this.direction = this.rng() < .5 ? -1 : 1; }
      const rest = this.pattern === 'rest' && n % 10 < 3;
      const gap = (rest ? 75 : 76 + intensity * 24 + late * 7) + this.rng() * (16 + intensity * 8);
      this.top -= Math.min(gap, 132);
      const w = rest ? 112 : 110 - intensity * 38 - late * 14 + this.rng() * 7;
      let shift = (this.rng() - .5) * (130 + intensity * 90);
      if (this.pattern === 'stairs') shift = this.direction * (35 + this.rng() * 50);
      if (this.pattern === 'zigzag') shift = (n % 2 ? -1 : 1) * (60 + this.rng() * 50);
      const center = clamp(this.lastCenter + shift, 24 + w / 2, W - 24 - w / 2), x = center - w / 2;
      if (center < 90 || center > 310) this.direction *= -1;
      const type = rest || n < 4 ? 'normal' : this.platformType(meters, intensity);
      const p = { id: n, x, baseX: x, y: this.top, baseY: this.top, w, type, phase: this.rng() * Math.PI * 2, zone, speed: 1 + intensity * .8 + late * .2, active: true, direction: this.rng() < .5 ? -1 : 1, safe: type !== 'phase' };
      this.platforms.push(p); this.lastCenter = center;
      // Maximum vertical gap < jump apex (167px), including elevator motion.
      // Phase alternatives sit BESIDE the full swept footprint, never beneath it.
      if (type === 'phase') {
        const alternative = sideTile(this.platforms, p, 64, `safe-${n}`);
        if (alternative) this.platforms.push(alternative);
        else { p.type = 'normal'; p.safe = true; }
      }
      if (this.rng() < .7) this.items.push({ type: 'star', x: center, y: this.top - 32, phase: n });
      if (rest && n > 5) for (const dx of [-24, 24]) this.items.push({ type: 'star', x: center + dx, y: this.top - 44, phase: n });
      const hasPower = meters >= this.nextPower && !['phase', 'fragile', 'cloud'].includes(type) && this.spawnPower(p, meters, active);
      if (meters >= this.nextEnemy && !hasPower && !rest) this.spawnEnemy(p, meters, intensity, late);
    }
  }
  platformType(meters, intensity) {
    const options = [{ id: 'normal', weight: Math.max(18, 65 - intensity * 42) }];
    const entries = [['spring', 80, 8], ['moving', 120, 14], ['fragile', 250, 12], ['ice', 500, 10], ['conveyor', 700, 10], ['cloud', 950, 9], ['elevator', 1400, 12], ['phase', 1850, 10]];
    for (const [id, at, weight] of entries) if (meters >= at) options.push({ id, weight });
    return weighted(this.rng, options);
  }
  spawnPower(p, meters, active) {
    const available = Object.entries(POWERS).filter(([id, power]) => meters >= power.at && !this.lastPowers.includes(id)
      && meters - (this.lastDrop[id] ?? -1e9) >= power.dropCooldown && !(active.cool?.[id] > 0) && !(id === 'jetpack' ? active.jet > 0 : active[id]));
    if (!available.length) { this.nextPower = meters + 12; return false; }
    const type = weighted(this.rng, available.map(([id, data]) => ({ id, weight: data.weight })));
    this.items.push({ type, x: p.baseX + p.w / 2, y: p.baseY - 43, phase: p.id });
    this.lastPowers = [...this.lastPowers, type].slice(-2); this.lastDrop[type] = meters;
    // Meter-based drop cooldown: global gap plus a per-type gap above; no burst spawns.
    this.nextPower = meters + 18 + this.rng() * 12 + Math.min(12, meters / 250);
    return true;
  }
  spawnEnemy(p, meters, intensity, late) {
    const shooterMeters = toMeters(p.y - 66);
    const options = Object.entries(ENEMIES).filter(([id, data]) => meters >= data.at && (id !== this.lastEnemy || meters < 250) && (!['drone', 'jelly'].includes(id) || shooterMeters - this.lastShooter >= 13));
    const type = weighted(this.rng, options.map(([id, data]) => ({ id, weight: data.weight })));
    if (!type) return;
    const grounded = ['slime', 'beetle', 'mimic'].includes(type);
    const support = grounded ? sideTile(this.platforms, p, 64, `enemy-${p.id}`, -20) : null;
    if (grounded && !support) { this.nextEnemy = meters + 2; return; }
    const ex = support ? support.x + support.w / 2 : p.baseX + p.w / 2 < W / 2 ? 332 : 68;
    const y = support ? support.y - 19 : p.y - 66;
    // Check every affected neighborhood, not just the candidate platform.
    const proposed = [...this.enemies.filter(e => !e.dead), { y }];
    const affected = proposed.filter(e => Math.abs(e.y - y) < H);
    if (affected.some(e => proposed.filter(other => Math.abs(other.y - e.y) < H).length > 3)) {
      this.nextEnemy = meters + 3; return;
    }
    if (support) { support.safe = false; this.platforms.push(support); }
    this.enemies.push({ type, x: ex, baseX: ex, y, baseY: y, phase: p.id, hp: 1, zone: p.zone, revealed: type !== 'mimic', revealGrace: 0, speed: 1 + intensity * .65 + late * .3, cooldown: 2 + this.rng(), warning: 0, warnDuration: Math.max(.65, .95 - intensity * .2), dash: 0 });
    this.lastEnemy = type;
    if (['drone', 'jelly'].includes(type)) this.lastShooter = toMeters(y);
    this.nextEnemy = meters + (130 - intensity * 37 - late * 9 + this.rng() * 45) / 20;
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

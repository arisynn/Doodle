import { ENEMIES, weighted } from './catalog.js';
import { BALANCE as B } from './balance.js';
import { W, H, toMeters } from './constants.js';
import { APEX } from './jumpmodel.js';
import { sideTile, tileBounds } from './placement.js';
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
// kind: blocker | patroller | special | projectile | timed. sx/sy = patrol sweep around the spawn point.
export const ARCH = {
  slime: { kind: 'blocker', cost: 1, ground: true }, beetle: { kind: 'patroller', cost: 1.5, ground: true }, mimic: { kind: 'special', cost: 2, ground: true },
  bat: { kind: 'patroller', cost: 2, sx: 70, sy: 0 }, bee: { kind: 'special', cost: 2.5, sx: 63, sy: 17 },
  drone: { kind: 'projectile', cost: 2.5, sx: 25, sy: 0, shooter: true }, jelly: { kind: 'projectile', cost: 3, sx: 25, sy: 21, shooter: true },
  wisp: { kind: 'timed', cost: 3.5, sx: 0, sy: 12 }
};
const AFFINITY = {
  flow: { blocker: 1.5, patroller: 1.3, special: .7, projectile: .5, timed: .2 },
  escalation: { blocker: 1, patroller: 1, special: 1, projectile: 1, timed: 1 },
  climax: { blocker: .6, patroller: .9, special: 1.2, projectile: 1.4, timed: 1.5 }
};
const sweepX = n => (n.type === 'moving' ? 27 : 0);
const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
// Region the player can occupy while travelling spine node a -> b (full jump arc, plus lateral slack).
export const corridor = (a, b) => {
  const ca = a.x + a.w / 2, cb = b.x + b.w / 2, s = Math.max(sweepX(a), sweepX(b));
  return { l: Math.min(ca, cb) - 20 - s, r: Math.max(ca, cb) + 20 + s, t: a.y - APEX - 10, b: a.y + 10 };
};
export const enemyBox = (type, x, y) => {
  const a = ARCH[type], sx = a.sx ?? 0, sy = a.sy ?? 0;
  return { l: clamp(x - sx, 30, W - 30) - 30, r: clamp(x + sx, 30, W - 30) + 30, t: y - sy - 33, b: y + sy + 33 };
};
export class EncounterDirector {
  constructor(rng, introduced) { this.rng = rng; this.introduced = introduced; this.lastEnemy = ''; this.lastShooterM = -1000; }
  crowded(world, y) {
    const alive = world.enemies.filter(e => !e.dead), near = alive.filter(e => Math.abs(e.y - y) < H);
    return near.length >= B.hazard.perScreenCap || near.some(e => alive.filter(o => Math.abs(o.y - e.y) < H).length >= B.hazard.perScreenCap);
  }
  clearOfPlatforms(box, world) { return !world.platforms.some(p => hit({ l: box.l - 4, r: box.r + 4, t: box.t - 4, b: box.b + 4 }, tileBounds(p))); }
  placeGround(type, rowIdx, beat, world, corridors) {
    const main = beat.rows[rowIdx].nodes.find(n => n.spine).platform;
    for (const side of ['left', 'right']) {
      const tile = sideTile(world.platforms, main, 64, `enemy-${main.id}`, 0, [side]);
      if (tile) tile.level = main.level;
      if (!tile) continue;
      const x = tile.x + tile.w / 2, y = tile.y - 19, box = enemyBox(type, x, y);
      if (corridors.some(c => hit(box, c))) continue;
      if (this.crowded(world, y)) return { why: 'crowded' };
      return { x, y, tile };
    }
    return { why: 'no clear side tile' };
  }
  placeAir(type, rowIdx, beat, world, corridors) {
    const row = beat.rows[rowIdx], spine = row.nodes.find(n => n.spine), risk = row.nodes.find(n => n.risk), base = risk ?? spine, y = base.y - 66;
    const xs = risk ? [risk.cx] : [68, 332, 130, 270, 200].sort((p, q) => Math.abs(q - spine.cx) - Math.abs(p - spine.cx));
    for (const x of xs) {
      const box = enemyBox(type, x, y);
      if (corridors.some(c => hit(box, c)) || !this.clearOfPlatforms(box, world)) continue;
      if (this.crowded(world, y)) return { why: 'crowded' };
      return { x, y };
    }
    return { why: 'no lane clear of the route' };
  }
  plan(beat, world, skipRows) {
    const log = beat.decisions = [];
    const forced = beat.featured?.kind === 'enemy' ? beat.featured.id : null;
    beat.budget = 0; beat.spent = 0;
    if (beat.noEnemies && !forced) { log.push(`no enemies (${beat.role}/${beat.pattern})`); return; }
    let left = forced ? 99 : (B.hazard.base + B.hazard.perDifficulty * beat.d) * B.hazard.roleMult[beat.role] * (1 - B.hazard.loadPenalty * beat.load);
    beat.budget = forced ? ARCH[forced].cost : +left.toFixed(2);
    const spine = [beat.prev, ...beat.rows.map(r => r.nodes.find(n => n.spine))];
    const corridors = spine.slice(0, -1).map((a, i) => corridor(a, spine[i + 1]));
    const last = beat.rows.length - 1;
    let order = Array.from({ length: last + 1 }, (_, i) => i).filter(i => i >= B.hazard.minRow && !skipRows.has(i));
    order = forced ? order.filter(i => i >= 2).concat(order.filter(i => i < 2)) : order.map(i => [this.rng(), i]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
    for (const idx of order) {
      if (left <= 0.5) break;
      const meters = toMeters(beat.rows[idx].nodes[0].y);
      let options = Object.entries(ENEMIES).filter(([id, data]) => {
        const a = ARCH[id];
        if (idx > last - 2) return false;
        if (a.shooter && toMeters(beat.rows[idx].nodes[0].y - 66) - this.lastShooterM < B.hazard.shooterSpacingM) return false;
        if (forced) return id === forced;
        if (meters < data.at || !this.introduced.has('enemy:' + id) || a.cost > left || (id === this.lastEnemy && meters >= 250)) return false;
        return !a.shooter || toMeters(beat.rows[idx].nodes[0].y - 66) - this.lastShooterM >= B.hazard.shooterSpacingM;
      }).map(([id, data]) => ({ id, weight: data.weight * (AFFINITY[beat.role]?.[ARCH[id].kind] ?? 1) }));
      while (options.length) {
        const type = weighted(this.rng, options), a = ARCH[type];
        const spot = a.ground ? this.placeGround(type, idx, beat, world, corridors) : this.placeAir(type, idx, beat, world, corridors);
        if (spot.x === undefined) { log.push(`rejected ${type} row ${idx}: ${spot.why}`); options = options.filter(o => o.id !== type); continue; }
        this.spawn(type, spot, beat, world, idx);
        left -= a.cost; beat.spent += a.cost; this.lastEnemy = type;
        if (a.shooter) this.lastShooterM = toMeters(spot.y);
        log.push(`placed ${type} row ${idx} (cost ${a.cost})`);
        if (forced) { this.introduced.add('enemy:' + forced); return; }
        break;
      }
    }
  }
  spawn(type, spot, beat, world, idx) {
    if (spot.tile) { spot.tile.safe = false; world.platforms.push(spot.tile); }
    const { x, y } = spot, node = beat.rows[idx].nodes[0];
    world.enemies.push({ type, x, baseX: x, y, baseY: y, phase: node.platform.id, hp: 1, zone: node.platform.zone, revealed: type !== 'mimic', revealGrace: 0, speed: 1 + beat.d * .65, cooldown: 2 + this.rng(), warning: 0, warnDuration: Math.max(.65, .95 - beat.d * .2), dash: 0, beat: beat.idx });
  }
}

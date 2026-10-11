import { World, W, H, GRAVITY, JUMP, SPEED, clamp, toMeters } from './world.js';
import { ZONES, POWERS, zoneAt } from './catalog.js';
import { findItem } from './economy.js';
import { L, loc } from './i18n.js';
import { updateCombat } from './combat.js';
import { horizontalStep } from './physics.js';
export class Game {
  constructor(store, feedback, callbacks = {}) {
    this.store = store; this.feedback = feedback; this.callbacks = callbacks; this.state = 'idle';
    this.keys = { left: false, right: false }; this.particles = [];
  }
  start(seed = Math.floor(Math.random() * 2147483647)) {
    this.world = new World(seed);
    this.player = { x: 200, y: 640, vx: 0, vy: 0, facing: 1, move: 0, squash: 0, grounded: true, platform: this.world.platforms[0], offset: 58, doubleUsed: false, stompReady: 0, coyote: 0 }; this.buffer = 0;
    this.camera = 0; this.time = 0; this.height = 0; this.stars = 0; this.kills = 0;
    this.beforeBest = this.store.data.best; this.shield = false; this.jet = 0; this.magnet = 0; this.invincible = 0;
    this.doublejump = 0; this.slow = 0; this.balloon = false; this.runStarted = false; this.supplyUsed = null; this.partyUsed = null; this.cool = {};
    this.bullets = []; this.hostile = []; this.particles = []; this.shake = 0; this.committed = false; this.trailClock = 0;
    this.keys = { left: false, right: false }; this.state = 'playing'; this.message = { text: L('Tap kiri atau kanan untuk melompat', '왼쪽이나 오른쪽을 탭해서 점프'), until: 999 }; this.biome = 0;
    this.callbacks.update?.(this);
  }
  beginRun() {
    if (this.runStarted) return;
    this.runStarted = true; this.message = { text: L('Setiap pijakan butuh tap baru.', '발판마다 새로 탭해야 합니다.'), until: this.time + 2 };
    const used = this.store.consumeLoadout?.() || {};
    this.supplyUsed = used.supply; this.partyUsed = used.party;
    if (used.supply) this.collect({ type: findItem(used.supply).power, x: this.player.x, y: this.player.y });
  }
  command(direction) {
    if (this.state !== 'playing') return false;
    this.beginRun(); const p = this.player;
    p.move = direction < 0 ? -1 : 1; p.facing = p.move;
    // Each tap sets one bounded push. Repeated taps never stack speed.
    p.vx = p.move * SPEED;
    if (this.jet > 0) return false;
    if (p.grounded || p.stompReady > 0 || p.coyote > 0) { this.launch(p.platform?.type === 'spring' ? JUMP * 1.55 : JUMP); return true; }
    if (this.doublejump > 0 && !p.doubleUsed) { p.doubleUsed = true; this.launch(JUMP * .96); this.feedback.play('power'); return true; }
    this.buffer = .09;
    return false;
  }
  launch(force) {
    const p = this.player, pl = p.platform;
    if (pl?.type === 'fragile') { pl.broken = true; this.burst(pl.x + pl.w / 2, pl.y, '#b78c65', 12, 'chip'); }
    p.grounded = false; p.platform = null; p.stompReady = 0; p.coyote = 0; this.buffer = 0; p.vy = force; p.vx = p.move * SPEED; p.squash = .5;
    this.feedback.play(force < JUMP ? 'power' : 'jump');
  }
  pause() { if (this.state !== 'playing') return; this.state = 'paused'; this.clearInput(); this.callbacks.pause?.(); }
  resume() { if (this.state !== 'paused') return; this.clearInput(); this.state = 'playing'; }
  clearInput() { this.keys.left = false; this.keys.right = false; }
  finish(reason = L('Jatuh dari langit', '하늘에서 추락'), abandoned = false) {
    if (this.committed || this.state === 'idle') return;
    this.committed = true; this.state = 'over'; this.clearInput(); if (this.runStarted) this.store.data.runs++;
    this.store.height(this.height); this.store.save();
    if (!abandoned) { this.feedback.play('over'); this.feedback.vibrate(70); this.callbacks.over?.({ height: this.height, stars: this.stars, kills: this.kills, reason, record: this.height > this.beforeBest, party: this.partyUsed, supply: this.supplyUsed }); }
  }
  burst(x, y, color = '#f2c655', count = 9, kind = 'dot', sprite = null) {
    for (let i = 0; i < count; i++) this.particles.push({ x, y, vx: (Math.random() - .5) * 200, vy: -40 - Math.random() * 120, life: .55 + Math.random() * .25, color, kind, sprite });
    if (this.particles.length > 180) this.particles.splice(0, this.particles.length - 180);
  }
  defeat(e) {
    if (e.dead) return;
    e.dead = true; this.kills++; this.store.defeat(); this.feedback.play('hit'); this.burst(e.x, e.y, '#ddbacf', 13);
    const loot = ['mimic', 'beetle', 'wisp'].includes(e.type) ? 3 : 2;
    for (let i = 0; i < loot; i++) this.world.items.push({ type: 'star', x: e.x + (i - 1) * 16, y: e.y - i * 12, homing: true, phase: i });
  }
  damage(reason) {
    if (this.jet > 0 || this.invincible > 0) return;
    if (this.shield) { this.shield = false; this.invincible = 1.8; this.shake = .2; this.feedback.vibrate(); this.burst(this.player.x, this.player.y, '#b5eaf5', 18); this.message = { text: L('Perisai melindungimu!', '방패가 지켜줬어요!'), until: this.time + 1.8 }; }
    else this.finish(reason);
  }
  collect(item) {
    if (item.taken) return false;
    const power = POWERS[item.type];
    if (power) {
      const held = item.type === 'jetpack' ? this.jet > 0 : item.type === 'balloon' ? this.balloon : item.type === 'shield' ? this.shield : false;
      const wait = Math.ceil(this.cool[item.type] || 0);
      if (held || wait > 0) {
        if (!item.blockedUntil || this.time > item.blockedUntil) {
          const name = loc(power, 'name');
          this.message = { text: held ? L(`${power.name} masih aktif — tidak ditumpuk`, `${name} 사용 중 — 중첩되지 않습니다`) : L(`${power.name} cooldown ${wait} dtk`, `${name} 쿨다운 ${wait}초`), until: this.time + 1.4 };
          item.blockedUntil = this.time + 2;
        }
        return false;
      }
      if (power.cooldown) this.cool[item.type] = power.cooldown;
    }
    item.taken = true;
    if (item.type === 'star') { this.stars++; this.store.earn(); this.feedback.play('star'); this.burst(item.x, item.y, '#e9b943', 5); return true; }
    this.feedback.play('power'); this.feedback.vibrate(25); this.burst(item.x, item.y, '#b2dcd0', 16);
    if (item.type === 'shield') this.shield = true;
    if (item.type === 'jetpack') { this.jet = 3.8; this.player.grounded = false; this.player.platform = null; }
    if (item.type === 'magnet') this.magnet = 9;
    if (item.type === 'doublejump') { if (this.doublejump <= 0) this.player.doubleUsed = false; this.doublejump = 10; }
    if (item.type === 'slow') this.slow = 6;
    if (item.type === 'balloon') this.balloon = true;
    this.message = { text: power ? loc(power, 'message') : L('Power-up aktif!', '파워업 발동!'), until: this.time + 1.8 }; return true;
  }
  update(dt) {
    if (this.state !== 'playing') return;
    this.time += dt; const p = this.player;
    for (const k of ['jet', 'magnet', 'doublejump', 'slow', 'invincible', 'shake']) this[k] = Math.max(0, this[k] - dt);
    for (const k in this.cool) this.cool[k] = Math.max(0, this.cool[k] - dt);
    p.stompReady = Math.max(0, p.stompReady - dt); p.coyote = Math.max(0, p.coyote - dt); this.buffer = Math.max(0, this.buffer - dt); p.squash = Math.max(0, p.squash - dt * 5);
    this.world.update(this.time, dt, this.camera, this);
    if (p.grounded) this.ridePlatform(dt);
    const prevY = p.y;
    if (!p.grounded) {
      const horizontal = horizontalStep(p.vx, dt);
      p.vx = horizontal.velocity; p.x += horizontal.distance;
      if (p.x < -18) p.x = W + 17;
      if (p.x > W + 18) p.x = -17;
      if (this.jet > 0) { p.vy = -820; if (Math.random() < .4) this.burst(p.x, p.y + 22, '#f1ba59', 1); }
      else p.vy = Math.min(950, p.vy + GRAVITY * dt);
      p.y += p.vy * dt;
      if (p.vy > 0) this.land(prevY);
      this.cosmeticTrail(dt);
    }
    this.height = Math.max(this.height, Math.floor(toMeters(p.y))); this.camera = Math.min(this.camera, p.y - H * .43);
    if (this.height > this.store.data.best + 5) this.store.height(this.height);
    const biome = zoneAt(this.height);
    if (biome !== this.biome) { this.biome = biome; this.message = { text: `${loc(ZONES[biome], 'name')} · ${loc(ZONES[biome], 'label')}`, until: this.time + 3 }; this.feedback.play('power'); }
    for (const i of this.world.items) {
      if (i.taken) continue;
      const dx = p.x - i.x, dy = p.y - i.y, dist = Math.hypot(dx, dy);
      if (i.type === 'star' && (i.homing || (this.magnet > 0 && dist < 165))) { i.x += dx * Math.min(1, dt * 7); i.y += dy * Math.min(1, dt * 7); }
      if (dist < (i.type === 'star' ? 30 : 35)) this.collect(i);
    }
    this.combat(dt, prevY);
    for (const part of this.particles) { part.life -= dt; part.x += part.vx * dt; part.y += part.vy * dt; part.vy += 260 * dt; }
    this.particles = this.particles.filter(part => part.life > 0);
    if (this.balloon && p.y > this.camera + H - 20 && this.state === 'playing') this.rescue();
    else if (p.y > this.camera + H + 45) this.finish(L('Jatuh dari langit', '하늘에서 추락'));
    this.callbacks.update?.(this);
  }
  ridePlatform(dt) {
    const p = this.player, pl = p.platform;
    if (!pl || pl.broken || pl.active === false || !this.world.platforms.includes(pl)) { p.grounded = false; p.platform = null; p.vy = 30; p.coyote = .1; return; }
    if (pl.type === 'ice') { p.offset += p.vx * dt; p.vx *= Math.exp(-dt * 2); }
    if (pl.type === 'conveyor') p.offset += pl.direction * 100 * dt;
    p.x = pl.x + p.offset; p.y = pl.y - 20; p.vy = 0;
    if (p.offset < -10 || p.offset > pl.w + 10) { p.grounded = false; p.platform = null; p.vy = 30; p.coyote = .1; }
  }
  land(prevY) {
    const p = this.player;
    for (const pl of this.world.platforms) if (!pl.broken && pl.active !== false && prevY + 20 <= pl.y + 5 && p.y + 20 >= pl.y && p.x + 14 > pl.x && p.x - 14 < pl.x + pl.w) {
      p.y = pl.y - 20; p.vy = 0; p.grounded = true; p.platform = pl; p.offset = p.x - pl.x; p.doubleUsed = false; p.squash = .7;
      p.vx = pl.type === 'ice' ? p.vx * .55 : 0;
      if (pl.type === 'cloud' && pl.dissolve === undefined) pl.dissolve = .65;
      const effect = this.store.data.equipped?.landing;
      const sprite = { 'landing-petal': 'particle-petal', 'landing-ripple': 'particle-ripple', 'landing-comet': 'particle-comet' }[effect];
      const feel = { spring: ['#f1c24f', 12], cloud: ['#ffffff', 8], ice: ['#bfe9f7', 8], fragile: ['#b78c65', 6], conveyor: ['#d4c39a', 6] }[pl.type];
      this.burst(p.x, pl.y, feel ? feel[0] : '#fff8df', sprite ? 10 : feel ? feel[1] : 4, 'dot', sprite);
      if (pl.type === 'spring') { this.shake = Math.max(this.shake, .06); this.feedback.play('power'); }
      if (this.buffer > 0) this.command(p.move);
      break;
    }
  }
  cosmeticTrail(dt) {
    this.trailClock -= dt;
    const sprite = { 'trail-leaf': 'particle-leaf', 'trail-spark': 'particle-spark', 'trail-aurora': 'particle-aurora' }[this.store.data.equipped?.trail];
    if (sprite && this.trailClock <= 0) { this.trailClock = .08; this.burst(this.player.x, this.player.y + 15, '#fff5d7', 1, 'dot', sprite); }
  }
  rescue() {
    this.balloon = false; const p = this.player; p.grounded = false; p.platform = null; p.y = this.camera + H - 60; p.vy = JUMP * 1.2; p.x = clamp(p.x, 35, W - 35);
    // Rescue is a power-up lift, not an extra tile that could overlap the map.
    this.burst(p.x, p.y, '#eac2a7', 20); this.feedback.play('power'); this.feedback.vibrate(30);
    this.message = { text: L('Balon menyelamatkanmu. Cari pijakan!', '풍선이 구해줬어요. 발판을 찾으세요!'), until: this.time + 2 };
  }
  combat(dt, prevY) { updateCombat(this, dt, prevY); }
}
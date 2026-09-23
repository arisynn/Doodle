import { W, H, JUMP, clamp } from './world.js';
import { ENEMIES } from './catalog.js';
function enemyAttack(g, e, dt) {
  const p = g.player;
  if (e.dash > 0) {
    e.dash -= dt; e.x = clamp(e.x + e.dashVx * dt, 25, W - 25); e.y += e.dashVy * dt;
    if (e.dash <= 0) { e.dash = 0; e.baseX = e.x; e.baseY = e.y; }
    return;
  }
  e.cooldown -= dt;
  const warningDuration = e.warnDuration || .85;
  const warning = e.cooldown < warningDuration ? warningDuration - e.cooldown : 0;
  if (e.type === 'wisp' && warning > 0 && !e.warning) { e.lockedX = p.x; e.lockedY = clamp(p.y, e.y - 80, e.y + 80); }
  e.warning = warning;
  if (e.cooldown > 0) return;
  if (e.type === 'wisp') {
    e.dash = .65; e.dashVx = clamp(((e.lockedX ?? p.x) - e.x) / .65, -440, 440); e.dashVy = ((e.lockedY ?? p.y) - e.y) / .65;
    e.cooldown = 3.6 / (e.speed || 1); e.warning = 0; return;
  }
  if (g.hostile.length < 12) {
    const speed = Math.min(205, 145 + ((e.speed || 1) - 1) * 65);
    const angle = e.type === 'jelly' ? Math.PI / 2 : Math.atan2(p.y - e.y, p.x - e.x);
    for (const spread of e.type === 'jelly' ? [-.34, 0, .34] : [0]) {
      if (g.hostile.length >= 12) break;
      g.hostile.push({ x: e.x, y: e.y + 17, vx: Math.cos(angle + spread) * speed, vy: Math.sin(angle + spread) * speed });
    }
  }
  e.cooldown = Math.max(1.9, (e.type === 'jelly' ? 4.2 : 3.2) / (e.speed || 1)); e.warning = 0;
}
export function updateCombat(g, dt, prevY) {
  const p = g.player, enemyDt = dt * (g.slow > 0 ? .42 : 1);
  const visible = g.world.enemies.filter(e => !e.dead && e.y > g.camera + 50 && e.y < g.camera + H);
  for (const e of visible) {
    if (g.state !== 'playing') break;
    e.flash = Math.max(0, (e.flash || 0) - dt);
    if (e.dead) continue;
    if (e.type === 'mimic') {
      if (!e.revealed && Math.hypot(e.x - p.x, e.y - p.y) < 155) { e.revealed = true; e.revealGrace = .6; g.message = { text: 'Pijakan palsu! Injak dari atas.', until: g.time + 1.8 }; }
      e.revealGrace = Math.max(0, e.revealGrace - enemyDt); e.warning = e.revealGrace;
    }
    if (['drone', 'jelly', 'wisp'].includes(e.type)) enemyAttack(g, e, enemyDt);
    if (Math.abs(p.x - e.x) < 30 && Math.abs(p.y - e.y) < 33) {
      if (p.vy > 0 && prevY + 20 <= e.y + 6) {
        g.defeat(e); p.vy = 45; p.stompReady = .35; p.doubleUsed = false; p.squash = .6;
        g.message = { text: 'Kena! Tap cepat untuk lompat lagi.', until: g.time + 1 };
      } else if (e.type !== 'mimic' || (e.revealed && e.revealGrace <= 0)) g.damage('Terkena ' + ENEMIES[e.type].name);
    }
  }
  for (const b of g.hostile) {
    if (g.state !== 'playing') break;
    b.x += b.vx * enemyDt; b.y += b.vy * enemyDt;
    if (Math.hypot(b.x - p.x, b.y - p.y) < 22) { b.dead = true; g.damage('Terkena proyektil musuh'); }
  }
  g.hostile = g.hostile.filter(b => !b.dead && b.y > g.camera - 100 && b.y < g.camera + H + 100 && b.x > -30 && b.x < W + 30);
}
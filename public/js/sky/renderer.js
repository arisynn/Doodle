import { W, H } from './world.js';
import { ZONES, PLATFORM_TYPES, ENEMIES, POWERS } from './catalog.js';
export const ASSET = '/assets/sky/';
export async function loadImages() {
  const names = [...new Set(['piko', 'momo', 'luna', 'nimbus', 'normal', 'moving', 'fragile', 'spring', 'star', 'hostile', 'morning', 'sunset', 'night', 'aurora', 'cloud', 'mimic-eyes', ...['leaf','spark','aurora','petal','ripple','comet'].map(n => 'particle-' + n), ...Object.keys(ENEMIES), ...Object.keys(POWERS), ...ZONES.flatMap(z => PLATFORM_TYPES.map(type => `tile-${z.tile}-${type}`))])];
  const images = {};
  await Promise.all(names.map(name => new Promise((resolve, reject) => { const img = new Image(); img.onload = () => { images[name] = img; resolve(); }; img.onerror = () => reject(new Error(`Gambar ${name} gagal dimuat`)); img.src = ASSET + name + '.png'; })));
  return images;
}
export class Renderer {
  constructor(canvas, images) { this.canvas = canvas; this.ctx = canvas.getContext('2d'); this.images = images; this.background = 0; this.lastBiome = 0; this.fade = 1; this.resize(); }
  resize() { const dpr = Math.min(window.devicePixelRatio || 1, 2); this.canvas.width = W * dpr; this.canvas.height = H * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  image(name, x, y, w, h) { const i = this.images[name]; if (i) this.ctx.drawImage(i, x, y, w, h); }
  draw(g) {
    if (!g.world) return;
    const c = this.ctx, cam = g.camera, p = g.player;
    c.save(); c.clearRect(0, 0, W, H);
    const bg = ZONES.map(zone => zone.background);
    if (this.background !== g.biome) { this.lastBiome = this.background; this.background = g.biome; this.fade = 0; }
    this.image(bg[this.lastBiome], 0, 0, W, H); c.globalAlpha = this.fade; this.image(bg[this.background], 0, 0, W, H); c.globalAlpha = 1; this.fade = Math.min(1, this.fade + .012);
    if (g.shake > 0) c.translate(Math.sin(g.time * 100) * 3, Math.cos(g.time * 80) * 2);
    // Soft parallax clouds are decorative sprites, not collision surfaces.
    c.globalAlpha = .28;
    for (let i = 0; i < 4; i++) { const y = ((i * 215 - cam * .18) % (H + 180)) - 80; this.image('cloud', (i * 153) % 370 - 45, y, 135, 70); }
    c.globalAlpha = 1;
    for (const pl of g.world.platforms) {
      const y = pl.y - cam; if (y < -40 || y > H + 40 || pl.broken) continue;
      c.save();
      if (pl.type === 'phase') c.globalAlpha = pl.active === false ? .17 : pl.fading ? .45 + Math.sin(g.time * 20) * .25 : 1;
      if (pl.dissolve !== undefined) c.globalAlpha = Math.max(.1, pl.dissolve / .35);
      const tile = `tile-${ZONES[pl.zone || 0].tile}-${pl.type}`;
      if (pl.type === 'conveyor' && pl.direction < 0) { c.translate(pl.x + pl.w, y - 4); c.scale(-1, 1); this.image(tile, 0, 0, pl.w, 28); }
      else this.image(tile, pl.x, y - 4, pl.w, 28);
      c.restore();
      if (pl.type === 'spring') this.image('spring', pl.x + pl.w / 2 - 12, y - 22, 25, 27);
    }
    for (const i of g.world.items) if (!i.taken) {
      const s = i.type === 'star' ? 25 : 33, y = i.y - cam + Math.sin(g.time * 3 + i.phase) * 3;
      if (i.type !== 'star') { c.save(); c.globalAlpha = .23; c.fillStyle = '#fffdf0'; c.beginPath(); c.arc(i.x, y, 24 + Math.sin(g.time * 3) * 2, 0, Math.PI * 2); c.fill(); c.restore(); }
      this.image(i.type, i.x - s / 2, y - s / 2, s, s);
    }
    for (const e of g.world.enemies) if (!e.dead) {
      const y = e.y - cam, size = { bat: [64,43], drone: [55,44], bee: [58,44], beetle: [53,44], jelly: [45,51], wisp: [65,44] }[e.type] || [51,43];
      if (e.type === 'mimic' && !e.revealed) { this.image(`tile-${ZONES[e.zone || 0].tile}-normal`, e.x - 31, y - 13, 62, 23); if (Math.sin(g.time * 2) > .8) this.image('mimic-eyes', e.x - 13, y - 3, 26, 10); continue; }
      if (e.warning > 0) { c.strokeStyle = '#ce654d'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.arc(e.x, y, 32 + Math.sin(g.time * 12) * 4, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); c.fillStyle = '#a14137'; c.font = '900 20px Nunito'; c.textAlign = 'center'; c.fillText('!', e.x, y - 37); }
      if (e.type === 'wisp' && e.warning > 0 && e.lockedX !== undefined) { c.strokeStyle = '#e6a072'; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(e.x, y); c.lineTo(e.lockedX, e.lockedY - cam); c.stroke(); c.setLineDash([]); }
      c.globalAlpha = e.flash ? .45 : 1; this.image(e.type, e.x - size[0] / 2, y - size[1] / 2 + (e.type === 'bat' ? Math.sin(g.time * 13) * 3 : 0), ...size); c.globalAlpha = 1;
      if (e.maxHp > 1) for (let hp = 0; hp < e.maxHp; hp++) { c.fillStyle = hp < e.hp ? '#d4a662' : '#7f858866'; c.fillRect(e.x - e.maxHp * 4 + hp * 8, y + size[1] / 2 + 3, 5, 3); }
    }
    for (const b of g.hostile) this.image('hostile', b.x - 7, b.y - cam - 7, 14, 14);
    if (g.shield || g.jet > 0) { c.fillStyle = '#bcebf633'; c.strokeStyle = g.jet > 0 ? '#ffe4a1' : '#a4d7e7'; c.lineWidth = 2; c.beginPath(); c.arc(p.x, p.y - cam, 34 + Math.sin(g.time * 4) * 2, 0, Math.PI * 2); c.fill(); c.stroke(); }
    c.save(); c.translate(p.x, p.y - cam); c.scale(p.facing * (1 + p.squash * .12), 1 - p.squash * .12);
    if (g.invincible && Math.floor(g.time * 14) % 2) c.globalAlpha = .4;
    this.image(g.store.data.skin, -29, -37, 58, 65);
    if (g.jet > 0) this.image('jetpack', -34, -4, 23, 30);
    c.restore();
    if (g.balloon) this.image('balloon', p.x + 15, p.y - cam - 65, 24, 36);
    for (const pt of g.particles) { c.globalAlpha = Math.min(1, pt.life * 2); c.fillStyle = pt.color; if (pt.sprite) this.image(pt.sprite, pt.x - 6, pt.y - cam - 6, 12, 12); else if (pt.kind === 'chip') c.fillRect(pt.x, pt.y - cam, 7, 4); else { c.beginPath(); c.arc(pt.x, pt.y - cam, 2.8, 0, Math.PI * 2); c.fill(); } }
    c.restore();
  }
}
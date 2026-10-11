// Run: node --experimental-default-type=module tests/level_engine_validation.mjs [seeds] [meters]
globalThis.document = { documentElement: {} }; globalThis.window = { localStorage: { getItem: () => null, setItem() {} } }; globalThis.navigator = { language: 'id' };
const { World, toMeters, GRAVITY, JUMP, H } = await import('../public/js/sky/world.js');
const { ENEMIES, POWERS } = await import('../public/js/sky/catalog.js');
const { horizontalStep } = await import('../public/js/sky/physics.js');
const { edgeOk, twoLevelOk } = await import('../public/js/sky/solver.js');
const { MAX_RISE, APEX } = await import('../public/js/sky/jumpmodel.js');
const { tileBounds, overlaps } = await import('../public/js/sky/placement.js');
const { corridor, enemyBox, ARCH } = await import('../public/js/sky/encounters.js');
const { BALANCE } = await import('../public/js/sky/balance.js');
const CAP = +process.env.SIM_TAPS || 3;
const SEEDS = +process.argv[2] || 60, METERS = +process.argv[3] || 2600;
const fail = {}, note = (k, msg) => { (fail[k] ||= []).push(msg); };
const hit = (a, b) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
const stats = { beats: 0, fallbacks: 0, retries: 0, edges: 0, simFail: 0, enemies: 0, patterns: {}, roles: {}, byEnemy: {}, byType: {} };

// Independent check: fly the real physics (gravity, drag, wrap, one-way landing) with <= maxTaps evenly spaced pushes.
function canLand(a, b, maxTaps) {
  const dt = 1 / 240, cb = b.x + b.w / 2;
  const poses = b.type === 'moving' ? [b.x - 27, b.x, b.x + 27] : [b.x];
  const ay = a.y + (a.type === 'elevator' ? 15 : 0), by = b.y - (b.type === 'elevator' ? 15 : 0);
  const spanL = a.x - (a.type === 'moving' ? 27 : 0), spanR = a.x + a.w + (a.type === 'moving' ? 27 : 0);
  for (const bx of poses) for (let taps = 1; taps <= maxTaps; taps++) for (let s = 0; s <= 6; s++) {
    let x = spanL + (spanR - spanL) * s / 6, y = ay - 20, vy = JUMP, vx = 0, prev = y, t = 0;
    const target = bx + b.w / 2, direction = target >= x ? 1 : -1;
    const air = (-JUMP + Math.sqrt(JUMP * JUMP - 2 * GRAVITY * Math.max(0, ay - by))) / GRAVITY;
    let next = 0;
    for (let step = 0; step < 4000; step++) {
      if (next < taps && t >= next * air / taps) { vx = direction * 340; next++; }
      const h = horizontalStep(vx, dt); vx = h.velocity; x += h.distance;
      if (x < -18) x = 417; if (x > 418) x = -17;
      vy += GRAVITY * dt; prev = y; y += vy * dt; t += dt;
      if (vy > 0 && prev + 20 <= by + 5 && y + 20 >= by && x + 14 > bx && x - 14 < bx + b.w) return true;
      if (y > ay + 400) break;
    }
  }
  return false;
}
const clampX = (n, a, b) => Math.max(a, Math.min(b, n));
const posX = (p, t) => (p.type === 'moving' ? clampX(p.baseX + Math.sin(t * (p.speed || 1) * 1.35 + (p.phase || 0)) * 27, 5, 400 - p.w - 5) : p.baseX);
// Moving tiles: the jump starts at any time t0, the target tile is wherever it really is during the flight.
function canLandTimed(a, b, maxTaps) {
  const dt = 1 / 240, dy = a.baseY - b.baseY, air = (-JUMP + Math.sqrt(JUMP * JUMP - 2 * GRAVITY * Math.max(0, dy))) / GRAVITY;
  for (let k = 0; k < 24; k++) for (let taps = 1; taps <= maxTaps; taps++) for (let mask = 0; mask < (1 << taps); mask++) for (const off of [0, -.3, .3]) {
    const t0 = k * 0.29;
    let x = posX(a, t0) + a.w / 2 + off * a.w / 2, y = a.baseY - 20, vy = JUMP, vx = 0, prev = y, t = 0, next = 0;
    for (let step = 0; step < 4000; step++) {
      if (next < taps && t >= next * air / taps) { vx = (mask >> next & 1 ? -1 : 1) * 340; next++; }
      const h = horizontalStep(vx, dt); vx = h.velocity; x += h.distance;
      if (x < -18) x = 417; if (x > 418) x = -17;
      vy += GRAVITY * dt; prev = y; y += vy * dt; t += dt;
      const bx = posX(b, t0 + t);
      if (vy > 0 && prev + 20 <= b.baseY + 5 && y + 20 >= b.baseY && x + 14 > bx && x - 14 < bx + b.w) return true;
      if (y > a.baseY + 400) break;
    }
  }
  return false;
}
// Vertical-only flight with the engine's integrator: can a normal jump from tile a ever land on tile c (any x)?
function verticallyReachable(a, c) {
  const dt = 1 / 120, ay = a.baseY - (a.type === 'elevator' ? 15 : 0), cy = c.baseY + (c.type === 'elevator' ? 15 : 0);
  let y = ay - 20, vy = JUMP;
  for (let step = 0; step < 600; step++) { const prev = y; vy += GRAVITY * dt; y += vy * dt; if (vy > 0 && prev + 20 <= cy + 5 && y + 20 >= cy) return true; if (y > ay + 50) return false; }
  return false;
}
const spineOf = beat => [beat.prev, ...beat.rows.map(r => r.nodes.find(n => n.spine))];

for (let seed = 1; seed <= SEEDS; seed++) {
  const w = new World(seed * 7919, { history: true });
  const seen = new Set();
  for (let cam = 0; cam > -METERS * 40; cam -= 300) w.generate(cam, {});
  stats.beats += w.director.stats.beats; stats.fallbacks += w.director.stats.fallbacks; stats.retries += w.director.stats.retries;
  const typeFirst = {}, enemyFirst = {};
  for (const beat of w.history) {
    stats.patterns[beat.pattern] = (stats.patterns[beat.pattern] || 0) + 1; stats.roles[beat.role] = (stats.roles[beat.role] || 0) + 1;
    const chain = spineOf(beat);
    chain.slice(1).forEach((n, i) => {
      stats.edges++;
      if (!edgeOk(chain[i], n, 3)) note('solver-edge', `seed ${seed} beat ${beat.idx} row ${i}`);
      if (!canLand(chain[i], n, beat.taps)) note('design-sim', `seed ${seed} beat ${beat.idx} row ${i} needs more than the designed ${beat.taps} taps`);
      if (i % 2 === 0 || n.type !== 'normal') { if (!canLand(chain[i], n, CAP)) { stats.simFail++; note('physics-sim', `seed ${seed} beat ${beat.idx} row ${i} ${chain[i].type}->${n.type} dy=${(chain[i].y - n.y).toFixed(0)}`); } }
      if (n.type !== 'normal' && !(n.type in typeFirst)) typeFirst[n.type] = beat;
      if ((n.type === 'moving' || chain[i].type === 'moving') && n.platform && (chain[i].platform || i === 0)) { stats.timed = (stats.timed || 0) + 1; const pa = chain[i].platform ?? { ...chain[i], baseX: chain[i].x, baseY: chain[i].y }; if (!canLandTimed(pa, n.platform, beat.taps)) note('moving-timed', `seed ${seed} beat ${beat.idx} row ${i} ${pa.type}(${pa.baseX.toFixed(0)},w${pa.w.toFixed(0)})->${n.platform.type}(${n.platform.baseX.toFixed(0)},w${n.platform.w.toFixed(0)}) dy=${(pa.baseY - n.platform.baseY).toFixed(0)} taps=${beat.taps}`); }
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
    });
    const dys = beat.rows.map(r => r.dy);
    if (Math.max(...dys) > BALANCE.gap.max + 0.001) note('gap', `seed ${seed} beat ${beat.idx}`);
    for (const e of w.enemies.filter(q => q.beat === beat.idx)) { if (!(e.type in enemyFirst)) enemyFirst[e.type] = beat; }
    const cost = w.enemies.filter(q => q.beat === beat.idx).reduce((n, e) => n + ARCH[e.type].cost, 0);
    if (!beat.featured && cost > beat.budget + 0.001) note('budget', `seed ${seed} beat ${beat.idx} cost ${cost} > ${beat.budget}`);
    if (beat.noEnemies && !beat.featured && cost) note('no-enemy-beat', `seed ${seed} beat ${beat.idx} ${beat.pattern}`);
  }
  for (const [t, beat] of Object.entries(typeFirst)) if (beat.role !== 'intro' && !(beat.pattern === 'branch')) {
    // Types may appear in any beat after intro; require that an intro beat for this type came first.
    const introIdx = w.history.findIndex(b => b.featured?.kind === 'type' && b.featured.id === t);
    if (introIdx < 0 || w.history[introIdx].idx > beat.idx) note('type-intro', `seed ${seed} ${t} first used in beat ${beat.idx} before intro`);
  }
  for (const [t, beat] of Object.entries(enemyFirst)) {
    stats.byEnemy[t] = (stats.byEnemy[t] || 0) + 1;
    if (beat.featured?.id !== t && !w.introduced.has('enemy:' + t)) note('enemy-intro', `seed ${seed} ${t} before intro`);
    const introIdx = w.history.findIndex(b => b.featured?.kind === 'enemy' && b.featured.id === t);
    if (introIdx >= 0 && w.history[introIdx].idx > beat.idx) note('enemy-intro', `seed ${seed} ${t} appeared before its intro beat`);
    if (toMeters(beat.y0) < ENEMIES[t].at - 5) note('enemy-gate', `seed ${seed} ${t} too early`);
  }
  // Platform collisions (swept bounds, strict) among generated tiles.
  const tiles = [...w.platforms].sort((p, q) => p.baseY - q.baseY);
  for (let i = 0; i < tiles.length; i++) for (let j = i + 1; j < tiles.length && tiles[j].baseY - tiles[i].baseY < 90; j++)
    if (overlaps(tileBounds(tiles[i]), tileBounds(tiles[j]), 0)) note('tile-overlap', `seed ${seed} ids ${tiles[i].id}/${tiles[j].id} ${tiles[i].type}/${tiles[j].type}`);
  // One jump, one level: no normal jump may land two or more levels up (springs excepted); every tile has a way onward.
  const byLevel = new Map(); for (const p of w.platforms) { if (!byLevel.has(p.level)) byLevel.set(p.level, []); byLevel.get(p.level).push(p); }
  const maxLevel = Math.max(...byLevel.keys());
  for (const [lvl, group] of byLevel) {
    for (const a of group) {
      stats.levelChecks = (stats.levelChecks || 0) + 1;
      if (a.type !== 'spring') for (const k of [lvl + 2, lvl + 3]) for (const c of byLevel.get(k) ?? []) {
        const ra = { x: a.baseX, y: a.baseY, w: a.w, type: a.type }, rc = { x: c.baseX, y: c.baseY, w: c.w, type: c.type };
        if (!twoLevelOk(ra, rc) || verticallyReachable(a, c)) note('level-skip', `seed ${seed} level ${lvl}->${k} ${a.type}->${c.type} dy=${(a.baseY - c.baseY).toFixed(0)}`);
      }
      if (lvl < maxLevel - 1 && !(byLevel.get(lvl + 1) ?? []).concat(group).some(c => c !== a && edgeOk({ x: a.baseX, y: a.baseY, w: a.w, type: a.type }, { x: c.baseX, y: c.baseY, w: c.w, type: c.type }, 3))) note('dead-end', `seed ${seed} level ${lvl} ${a.type}`);
    }
    for (const a of group) for (const c of byLevel.get(lvl + 1) ?? []) { /* adjacent level exists */ }
  }
  // Enemy fairness: clear of tiles, clear of spine corridors (except lane-B risk enemies), bounded density, shooter spacing.
  const alive = w.enemies.filter(e => !e.dead);
  stats.enemies += alive.length;
  const corridors = w.history.flatMap(beat => { const s = spineOf(beat); return s.slice(0, -1).map((a, i) => corridor(a, s[i + 1])); });
  let lastShooter = null;
  for (const e of [...alive].sort((p, q) => q.baseY - p.baseY)) {
    const box = enemyBox(e.type, e.baseX, e.baseY);
    const risk = w.history.find(b => b.idx === e.beat)?.rows.some(r => r.nodes.some(n => n.risk && Math.abs(n.cx - e.baseX) < 1));
    if (!risk && corridors.some(c => hit(box, c))) note('enemy-corridor', `seed ${seed} ${e.type} @${toMeters(e.baseY).toFixed(0)}m`);
    if (alive.filter(o => Math.abs(o.baseY - e.baseY) < H).length > 3) note('density', `seed ${seed} @${toMeters(e.baseY).toFixed(0)}m`);
    if (ARCH[e.type].shooter) { if (lastShooter !== null && Math.abs(toMeters(e.baseY) - lastShooter) < 12.9) note('shooter-spacing', `seed ${seed}`); lastShooter = toMeters(e.baseY); }
  }
  // Determinism.
  if (seed <= 5) { const w2 = new World(seed * 7919); for (let cam = 0; cam > -METERS * 40; cam -= 300) w2.generate(cam, {}); const sig = x => x.platforms.map(p => `${p.type}:${p.baseX.toFixed(2)}:${p.baseY.toFixed(2)}`).join('|'); if (sig(w) !== sig(w2)) note('determinism', `seed ${seed}`); }
}
stats.maxRiseBudget = { apex: +APEX.toFixed(1), landable: +MAX_RISE.toFixed(1) };
console.log(JSON.stringify(stats));
const keys = Object.keys(fail);
for (const k of keys) console.log(`FAIL ${k}: ${fail[k].length} e.g. ${fail[k].slice(0, 3).join(' ; ')}`);
if (keys.length) process.exit(1);
console.log('ALL CHECKS PASSED');

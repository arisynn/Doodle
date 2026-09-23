import { World, H, GRAVITY } from '../public/js/sky/world.js';
import { zoneAt, ZONES } from '../public/js/sky/catalog.js';
import { Game } from '../public/js/sky/engine.js';

const failures = [];
const notes = [];
const approx = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;
const assertCheck = (condition, message, context = {}) => {
  if (!condition) failures.push({ message, context });
};

const POWER_TYPES = new Set(['shield', 'magnet', 'jetpack', 'spread', 'slow', 'balloon']);
const gates = {
  spring: 170,
  moving: 240,
  fragile: 380,
  ice: 700,
  conveyor: 950,
  cloud: 1350,
  elevator: 1900,
  phase: 2600
};

function heightFromY(y) {
  return Math.max(0, (636 - y) / 2);
}

function makeGame(seed = 12345) {
  const store = {
    data: {
      best: 0,
      runs: 0,
      skin: 'piko',
      settings: { sound: false, vibration: false, control: 'swipe' }
    },
    save() {},
    earn() {},
    defeat() {},
    height(h) { this.data.best = Math.max(this.data.best, h); },
    missions() { return []; }
  };
  const feedback = { play() {}, vibrate() {} };
  const g = new Game(store, feedback, {});
  g.start(seed);
  return g;
}

function testZoneBoundaries() {
  const expected = [0, 350, 900, 1800, 3200];
  expected.forEach((at, idx) => {
    assertCheck(ZONES[idx].at === at, 'Zone threshold mismatch', { idx, at: ZONES[idx].at, expected: at });
  });
  assertCheck(zoneAt(0) === 0 && zoneAt(349) === 0, 'Zone 0 boundaries incorrect');
  assertCheck(zoneAt(350) === 1 && zoneAt(899) === 1, 'Zone 1 boundaries incorrect');
  assertCheck(zoneAt(900) === 2 && zoneAt(1799) === 2, 'Zone 2 boundaries incorrect');
  assertCheck(zoneAt(1800) === 3 && zoneAt(3199) === 3, 'Zone 3 boundaries incorrect');
  assertCheck(zoneAt(3200) === 4 && zoneAt(99999) === 4, 'Zone 4 boundaries incorrect');
}

function testProceduralWorld() {
  const seenPlatforms = new Set();
  const seenEnemies = new Set();
  const gateViolations = [];
  const allWidthsLow = [];
  const allWidthsHigh = [];
  const maxHeights = [];
  const jumpViolations = [];
  const phaseAltViolations = [];
  const powerCooldownViolations = [];
  const powerRepeatViolations = [];
  const sameRowEnemyPowerViolations = [];
  const enemyProximityViolations = [];
  const shooterSpacingViolations = [];
  let jetpackWhileActiveFound = false;

  for (let seed = 1; seed <= 80; seed++) {
    const world = new World(seed * 9973);
    world.generate(-26000);

    const platforms = world.platforms.filter(p => typeof p.y === 'number').sort((a, b) => b.y - a.y);
    const safeRoute = platforms.filter(p => p.safe !== false);
    const powers = world.items.filter(i => POWER_TYPES.has(i.type));
    const enemies = world.enemies;

    platforms.forEach(pl => {
      seenPlatforms.add(pl.type);
      const h = heightFromY(pl.y);
      if (pl.type in gates && h + 1e-6 < gates[pl.type]) gateViolations.push({ seed, type: pl.type, h });
      if (h < 500) allWidthsLow.push(pl.w);
      if (h > 4000) allWidthsHigh.push(pl.w);
    });

    enemies.forEach(e => seenEnemies.add(e.type));

    for (let i = 1; i < safeRoute.length; i++) {
      const dy = safeRoute[i - 1].y - safeRoute[i].y;
      if (dy > 182.1) jumpViolations.push({ seed, dy, from: safeRoute[i - 1].id, to: safeRoute[i].id });
    }

    const phases = platforms.filter(p => p.type === 'phase');
    for (const ph of phases) {
      const alt = platforms.find(p => p.type === 'normal' && Math.abs(p.y - (ph.y + 18)) <= 0.1 && Math.abs(p.x - ph.x) <= 60);
      if (!alt) phaseAltViolations.push({ seed, phaseId: ph.id, x: ph.x, y: ph.y });
    }

    const powerHeights = powers.map(p => ({ ...p, h: heightFromY(p.y) })).sort((a, b) => a.h - b.h);
    for (let i = 1; i < powerHeights.length; i++) {
      const delta = powerHeights[i].h - powerHeights[i - 1].h;
      if (delta < 219.5) powerCooldownViolations.push({ seed, prev: powerHeights[i - 1].type, next: powerHeights[i].type, delta });
      if (powerHeights[i].type === powerHeights[i - 1].type || (i > 1 && powerHeights[i].type === powerHeights[i - 2].type)) {
        powerRepeatViolations.push({ seed, idx: i, type: powerHeights[i].type });
      }
    }

    const powerPhases = new Set(powers.map(p => p.phase));
    enemies.forEach(e => {
      if (powerPhases.has(e.phase)) sameRowEnemyPowerViolations.push({ seed, phase: e.phase, enemy: e.type });
    });

    for (const e of enemies) {
      const nearby = enemies.filter(o => !o.dead && Math.abs(o.y - e.y) < H).length;
      if (nearby > 3) enemyProximityViolations.push({ seed, y: e.y, nearby });
    }

    const shooters = enemies
      .filter(e => ['drone', 'jelly'].includes(e.type))
      .map(e => heightFromY(e.y))
      .sort((a, b) => a - b);
    for (let i = 1; i < shooters.length; i++) {
      const diff = shooters[i] - shooters[i - 1];
      if (diff < 260) shooterSpacingViolations.push({ seed, diff });
    }

    maxHeights.push(Math.max(...platforms.map(p => heightFromY(p.y))));

    const worldJet = new World(seed * 113);
    worldJet.items = [];
    worldJet.nextPower = 0;
    worldJet.generate(-8000, { jet: 1.4 });
    if (worldJet.items.some(i => i.type === 'jetpack')) jetpackWhileActiveFound = true;
  }

  assertCheck(gateViolations.length === 0, 'Platform unlock gate violated', gateViolations[0]);
  assertCheck(jumpViolations.length === 0, 'Reachability vertical gap violated (>182px)', jumpViolations[0]);
  assertCheck(phaseAltViolations.length === 0, 'Phase platform missing normal +18px alternative', phaseAltViolations[0]);
  assertCheck(powerCooldownViolations.length === 0, 'Power spawn cooldown below ~220m', powerCooldownViolations[0]);
  assertCheck(powerRepeatViolations.length === 0, 'Power repeated within last two spawns', powerRepeatViolations[0]);
  assertCheck(sameRowEnemyPowerViolations.length === 0, 'Enemy and power spawned on same row', sameRowEnemyPowerViolations[0]);
  assertCheck(enemyProximityViolations.length === 0, 'Enemy proximity cap (>3 within 720px) violated', enemyProximityViolations[0]);
  assertCheck(shooterSpacingViolations.length === 0, 'Shooter spacing below 260m', shooterSpacingViolations[0]);
  assertCheck(!jetpackWhileActiveFound, 'Jetpack spawned while jet active');

  const avgLow = allWidthsLow.reduce((a, b) => a + b, 0) / allWidthsLow.length;
  const avgHigh = allWidthsHigh.reduce((a, b) => a + b, 0) / allWidthsHigh.length;
  assertCheck(avgHigh < avgLow, 'Difficulty width scaling missing (high not narrower)', { avgLow, avgHigh });
  assertCheck(maxHeights.some(h => h > 6200), 'Generation did not continue beyond 5000m', { max: Math.max(...maxHeights) });

  ['normal', 'moving', 'fragile', 'spring', 'ice', 'conveyor', 'cloud', 'phase', 'elevator'].forEach(type => {
    assertCheck(seenPlatforms.has(type), 'Platform type not observed across tested seeds', { type });
  });
  ['slime', 'bat', 'bee', 'drone', 'beetle', 'jelly', 'wisp'].forEach(type => {
    assertCheck(seenEnemies.has(type), 'Enemy type not observed across tested seeds', { type });
  });

  notes.push({ avgLowWidth: avgLow, avgHighWidth: avgHigh, maxHeight: Math.max(...maxHeights) });
}

function testGameRules() {
  const g = makeGame(999);

  const firstJet = { type: 'jetpack', taken: false, x: 0, y: 0 };
  assertCheck(g.collect(firstJet) === true, 'First jetpack should be collectable');
  g.jet = 2.2;
  g.time = 12;
  const blockedJet = { type: 'jetpack', taken: false, x: 0, y: 0 };
  const before = g.jet;
  assertCheck(g.collect(blockedJet) === false, 'Active jetpack should block stacking');
  assertCheck(approx(g.jet, before), 'Blocked jetpack must not reset/extend timer', { before, after: g.jet });
  assertCheck(blockedJet.taken !== true, 'Blocked jetpack should remain untaken');
  assertCheck(g.collect(blockedJet) === false && approx(g.jet, before), 'Repeated same-frame blocked collect changed jet timer');

  g.update(0.5);
  assertCheck(g.jet < before, 'Jet timer should naturally decrement during update', { before, after: g.jet });

  g.slow = 6;
  g.jet = 2.2;
  g.update(1.0);
  assertCheck(Math.abs(g.jet - 1.2) < 0.03, 'Slow should not extend real jet gameplay time', { jetAfter1s: g.jet });

  g.pause();
  const pausedJet = g.jet;
  g.update(1.0);
  assertCheck(approx(g.jet, pausedJet), 'Pause should freeze jet timer', { pausedJet, after: g.jet });
  g.resume();

  g.jet = 0;
  const laterJet = { type: 'jetpack', taken: false, x: 0, y: 0 };
  assertCheck(g.collect(laterJet) === true && g.jet > 3.7, 'Jet should be collectable after expiry');

  const star = { type: 'star', x: 10, y: 10 };
  const s0 = g.stars;
  assertCheck(g.collect(star) === undefined || g.collect(star) === false, 'Star collect flow expected to short-return on repeat');
  assertCheck(g.stars === s0 + 1, 'Duplicate taken star should not give duplicate reward');

  const shieldGame = makeGame(321);
  shieldGame.shield = true;
  shieldGame.damage('hit');
  assertCheck(shieldGame.state === 'playing', 'Shield hit should not end game');
  assertCheck(shieldGame.shield === false, 'Shield should consume on one hit');
  shieldGame.invincible = 0;
  shieldGame.damage('hit-again');
  assertCheck(shieldGame.state === 'over', 'Second hit without shield should end game');

  const balloonGame = makeGame(654);
  const pCount = balloonGame.world.platforms.length;
  balloonGame.balloon = true;
  balloonGame.rescue();
  assertCheck(balloonGame.balloon === false, 'Balloon rescue should consume balloon');
  assertCheck(balloonGame.world.platforms.length === pCount + 1, 'Balloon rescue should add rescue platform');

  const gravityGame = makeGame(777);
  gravityGame.world.update = () => {};
  gravityGame.world.platforms = [];
  gravityGame.player.vy = 0;
  gravityGame.slow = 6;
  gravityGame.update(0.5);
  assertCheck(Math.abs(gravityGame.player.vy - GRAVITY * 0.5) < 0.01, 'Slow should not affect player gravity', { vy: gravityGame.player.vy });

  const timerGame = makeGame(888);
  timerGame.world.enemies = [];
  timerGame.shotTimer = 1;
  timerGame.slow = 6;
  timerGame.combat(0.5, timerGame.player.y);
  assertCheck(Math.abs(timerGame.shotTimer - 0.5) < 0.01, 'Slow should not affect shot timer decrement', { shotTimer: timerGame.shotTimer });

  const spreadGame = makeGame(919);
  spreadGame.world.enemies = [{ type: 'slime', x: 200, y: spreadGame.camera + 140, dead: false, hp: 1 }];
  spreadGame.spread = 0;
  spreadGame.shotTimer = 0;
  spreadGame.combat(0.1, spreadGame.player.y);
  const normalBullets = spreadGame.bullets.length;
  const spreadGame2 = makeGame(920);
  spreadGame2.world.enemies = [{ type: 'slime', x: 200, y: spreadGame2.camera + 140, dead: false, hp: 1 }];
  spreadGame2.spread = 8;
  spreadGame2.shotTimer = 0;
  spreadGame2.combat(0.1, spreadGame2.player.y);
  const spreadBullets = spreadGame2.bullets.length;
  assertCheck(normalBullets === 1, 'Normal shot should fire one bullet', { normalBullets });
  assertCheck(spreadBullets === 3, 'Spread shot should fire three bullets', { spreadBullets });

  const shooterGame = makeGame(444);
  shooterGame.hostile = Array.from({ length: 12 }, (_, i) => ({ x: i, y: i, vx: 0, vy: 0 }));
  shooterGame.world.enemies = [{ type: 'jelly', x: 180, y: shooterGame.camera + 120, dead: false, hp: 2, speed: 1, cooldown: 0, warning: 0, warnDuration: 0.8, dash: 0 }];
  shooterGame.combat(0.1, shooterGame.player.y);
  assertCheck(shooterGame.hostile.length === 12, 'Hostile projectile cap should stay at 12', { hostile: shooterGame.hostile.length });

  const jellyGame = makeGame(445);
  jellyGame.world.enemies = [{ type: 'jelly', x: 180, y: jellyGame.camera + 120, dead: false, hp: 2, speed: 1, cooldown: 0, warning: 0, warnDuration: 0.8, dash: 0 }];
  jellyGame.hostile = [];
  jellyGame.combat(0.1, jellyGame.player.y);
  assertCheck(jellyGame.hostile.length === 3, 'Jelly should fire fan of three projectiles', { hostile: jellyGame.hostile.length });

  const wispGame = makeGame(446);
  const wisp = { type: 'wisp', x: 120, y: wispGame.camera + 130, baseX: 120, baseY: wispGame.camera + 130, dead: false, hp: 2, speed: 1, cooldown: 0.2, warning: 0, warnDuration: 0.8, dash: 0 };
  wispGame.world.enemies = [wisp];
  wispGame.player.x = 200;
  wispGame.combat(0.1, wispGame.player.y);
  const lockedX = wisp.lockedX;
  wispGame.player.x = 320;
  wispGame.combat(0.2, wispGame.player.y);
  assertCheck(wisp.dash > 0, 'Wisp should enter dash after warning');
  assertCheck(Math.abs((wisp.lockedX ?? 0) - lockedX) < 0.1, 'Wisp dash should use locked target, not live homing', { lockedX, now: wisp.lockedX });
}

function testPlatformMotionMechanics() {
  const world = new World(101010);
  const elevator = { id: 'e1', x: 100, baseX: 100, y: 200, baseY: 200, w: 100, type: 'elevator', zone: 0, speed: 1, phase: 0 };
  const phase = { id: 'ph', x: 120, baseX: 120, y: 260, baseY: 260, w: 100, type: 'phase', zone: 0, speed: 1, phase: 0, active: true };
  world.platforms = [elevator, phase];
  let minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < 420; i++) {
    world.update(i / 60, 1 / 60, 1000, { slow: 0 });
    minY = Math.min(minY, elevator.y);
    maxY = Math.max(maxY, elevator.y);
  }
  const ampUp = maxY - elevator.baseY;
  const ampDown = elevator.baseY - minY;
  assertCheck(ampUp <= 15.2 && ampDown <= 15.2, 'Elevator amplitude exceeded ±15', { ampUp, ampDown });
  assertCheck(ampUp > 13 && ampDown > 13, 'Elevator not reaching expected motion range', { ampUp, ampDown });
  assertCheck(phase.active === false || phase.active === true, 'Phase platform active flag invalid type');
  assertCheck(phase.fading === true || phase.fading === false || phase.fading === undefined, 'Phase platform fading state invalid');

  const cloudWorld = new World(101011);
  const cloud = { id: 'cl', x: 140, baseX: 140, y: 300, baseY: 300, w: 100, type: 'cloud', zone: 0, speed: 1, phase: 0, dissolve: 0.35 };
  cloudWorld.platforms = [cloud];
  cloudWorld.update(0, 0.1, 1000, { slow: 0 });
  assertCheck(cloudWorld.platforms.some(p => p.id === 'cl'), 'Cloud should remain before dissolve expiry');
  cloudWorld.update(0.1, 0.3, 1000, { slow: 0 });
  assertCheck(cloudWorld.platforms.every(p => p.id !== 'cl'), 'Cloud should dissolve and be removed after ~0.35s');

  const conveyorInputGame = makeGame(2020);
  conveyorInputGame.world.update = () => {};
  conveyorInputGame.world.platforms = [];
  conveyorInputGame.player.conveyor = 0.55;
  conveyorInputGame.player.conveyorDirection = 1;
  conveyorInputGame.player.vx = 0;
  conveyorInputGame.keys.right = true;
  conveyorInputGame.update(0.1);
  assertCheck(conveyorInputGame.player.vx > 200, 'Player input should still control while conveyor active', { vx: conveyorInputGame.player.vx });
}

function run() {
  testZoneBoundaries();
  testProceduralWorld();
  testGameRules();
  testPlatformMotionMechanics();

  if (failures.length) {
    console.error('FRONTEND PROCEDURAL REGRESSION: FAIL');
    failures.slice(0, 30).forEach((f, i) => console.error(`${i + 1}. ${f.message}`, JSON.stringify(f.context)));
    if (failures.length > 30) console.error(`...and ${failures.length - 30} more`);
    process.exit(1);
  }
  console.log('FRONTEND PROCEDURAL REGRESSION: PASS');
  console.log(JSON.stringify({ notes }, null, 2));
}

run();
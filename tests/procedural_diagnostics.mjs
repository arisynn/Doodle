import { World, H } from '../public/js/sky/world.js';

const proxSeeds = [];
const shooterSeeds = [];

function heightFromY(y) { return Math.max(0, (636 - y) / 2); }

for (let seed = 1; seed <= 300; seed++) {
  const w = new World(seed * 9973);
  w.generate(-26000);
  const enemies = w.enemies;

  let proxHit = null;
  for (const e of enemies) {
    const nearby = enemies.filter(o => Math.abs(o.y - e.y) < H).length;
    if (nearby > 3) { proxHit = { seed, y: e.y, nearby }; break; }
  }
  if (proxHit) proxSeeds.push(proxHit);

  const shooters = enemies
    .filter(e => ['drone', 'jelly'].includes(e.type))
    .map(e => heightFromY(e.y))
    .sort((a, b) => a - b);
  let shooterHit = null;
  for (let i = 1; i < shooters.length; i++) {
    const diff = shooters[i] - shooters[i - 1];
    if (diff < 260) { shooterHit = { seed, diff }; break; }
  }
  if (shooterHit) shooterSeeds.push(shooterHit);
}

console.log(JSON.stringify({
  testedSeeds: 300,
  enemyProximityViolationCount: proxSeeds.length,
  enemyProximitySample: proxSeeds.slice(0, 10),
  shooterSpacingViolationCount: shooterSeeds.length,
  shooterSpacingSample: shooterSeeds.slice(0, 10)
}, null, 2));

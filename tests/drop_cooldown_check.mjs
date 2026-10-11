globalThis.document={documentElement:{}}; globalThis.window={localStorage:{getItem:()=>null,setItem(){}}}; globalThis.navigator={language:'id'};
const { World, toMeters } = await import('../public/js/sky/world.js');
const { POWERS } = await import('../public/js/sky/catalog.js');
const w = new World(4321); const seen = [];
const grab = new Set();
for (let cam = 0; cam > -400000; cam -= 200) {
  w.update(0, .01, cam, { cool: {} });
  for (const i of w.items) if (i.type !== 'star' && !grab.has(i)) { grab.add(i); seen.push([i.type, toMeters(i.y)]); }
}
const last = {}; let minGlobal = Infinity, bad = 0, prev = null;
for (const [t, m] of seen) {
  if (last[t] !== undefined && m - last[t] < POWERS[t].dropCooldown - 2) bad++;
  last[t] = m; if (prev !== null) minGlobal = Math.min(minGlobal, m - prev); prev = m;
}
console.log({ drops: seen.length, perTypeViolations: bad, minGlobalGapM: minGlobal.toFixed(1), firstDrops: seen.slice(0, 5).map(s => s[0] + '@' + s[1].toFixed(0)) });
if (bad) process.exit(1);

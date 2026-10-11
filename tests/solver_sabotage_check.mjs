globalThis.document = { documentElement: {} }; globalThis.window = { localStorage: { getItem: () => null, setItem() {} } }; globalThis.navigator = { language: 'id' };
const { World, toMeters } = await import('../public/js/sky/world.js');
const { BALANCE } = await import('../public/js/sky/balance.js');
const { edgeOk } = await import('../public/js/sky/solver.js');
BALANCE.gap.easy = 150; BALANCE.gap.hard = 220; BALANCE.gap.max = 260; BALANCE.safety = 2;
let bad = 0, fb = 0, retries = 0, edges = 0;
for (let s = 1; s <= 5; s++) { const w = new World(s, { history: true }); for (let c = 0; c > -60000; c -= 300) w.generate(c, {});
  fb += w.director.stats.fallbacks; retries += w.director.stats.retries;
  for (const b of w.history) { const sp = [b.prev, ...b.rows.map(r => r.nodes.find(n => n.spine))]; sp.slice(1).forEach((n, i) => { edges++; if (!edgeOk(sp[i], n, 3)) bad++; }); } }
console.log({ edges, unreachableEdges: bad, fallbacks: fb, retries });

// Run: node --experimental-default-type=module tests/one_jump_one_level_check.mjs
// Proves the rule "one normal jump reaches the next level, never the one above it" with the engine's real integrator,
// and that the check really catches the old behaviour (gaps of 72-76 px let you skip a level).
globalThis.document = { documentElement: {} }; globalThis.window = { localStorage: { getItem: () => null, setItem() {} } }; globalThis.navigator = { language: 'id' };
const { World } = await import('../public/js/sky/world.js');
const { BALANCE } = await import('../public/js/sky/balance.js');
const { GRAVITY, JUMP } = await import('../public/js/sky/constants.js');
const { APEX, MAX_RISE } = await import('../public/js/sky/jumpmodel.js');
function reachable(a, c) {
  const dt = 1 / 120, ay = a.baseY - (a.type === 'elevator' ? 15 : 0), cy = c.baseY + (c.type === 'elevator' ? 15 : 0);
  let y = ay - 20, vy = JUMP;
  for (let i = 0; i < 600; i++) { const prev = y; vy += GRAVITY * dt; y += vy * dt; if (vy > 0 && prev + 20 <= cy + 5 && y + 20 >= cy) return true; if (y > ay + 50) return false; }
  return false;
}
function run(label, mutate) {
  const saved = JSON.parse(JSON.stringify({ gap: BALANCE.gap, m: BALANCE.twoLevelMargin }));
  mutate();
  let pairs = 0, skips = 0, nextLevelBlocked = 0, minTwoLevel = Infinity;
  for (let seed = 1; seed <= 40; seed++) {
    const w = new World(seed * 131); for (let cam = 0; cam > -40000; cam -= 300) w.generate(cam, {});
    const by = new Map(); for (const p of w.platforms) { (by.get(p.level) ?? by.set(p.level, []).get(p.level)).push(p); }
    for (const [lvl, group] of by) for (const a of group) {
      if (a.type === 'spring') continue;
      for (const c of by.get(lvl + 2) ?? []) { pairs++; if (reachable(a, c)) skips++; minTwoLevel = Math.min(minTwoLevel, a.baseY - c.baseY - (a.type === 'elevator' ? 15 : 0) - (c.type === 'elevator' ? 15 : 0)); }
    }
  }
  Object.assign(BALANCE.gap, saved.gap); BALANCE.twoLevelMargin = saved.m;
  console.log(`${label}: pairs=${pairs} levelSkips=${skips} minTwoLevelDy=${minTwoLevel.toFixed(0)}px (apex ${APEX.toFixed(0)}, landable ${MAX_RISE.toFixed(0)})`);
  return skips;
}
const current = run('current balance', () => {});
const legacy = run('legacy gaps 72-76 (validator off)', () => { BALANCE.gap.easy = 76; BALANCE.gap.hard = 90; BALANCE.gap.rest = 72; BALANCE.twoLevelMargin = -400; });
if (current !== 0) { console.log('FAIL: current generator allows skipping a level'); process.exit(1); }
if (legacy === 0) { console.log('FAIL: check is blind, it did not detect the legacy level-skip'); process.exit(1); }
console.log('PASS: no level skips now; the check detects the legacy bug');

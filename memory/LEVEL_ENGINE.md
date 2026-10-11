# Procedural Level Engine (Lompat Langit)

## Audit summary (derived from live physics, constants.js / physics.js)
- Gravity 1550, jump v=720 -> apex 167 px (4.2 m), airtime 0.93 s. One tap = 340 px/s push decaying at 3.8/s; taps reset speed, never stack.
- Reach during a jump to a tile `dy` px higher with k evenly spaced taps: `reach(dy,k)` in jumpmodel.js (dy=128: 83 px with 1 tap, 130 with 2, 155 with 3).
- Old generator: one random tile per step, enemies by a distance counter, no route validation, no pacing, fixed difficulty ramp.

## Architecture (public/js/sky)
- `balance.js`  all tuning (difficulty curve, taps per difficulty, gaps/widths, pacing cycle, pattern weights by role, hazard budget, unlock meters).
- `jumpmodel.js` physics-derived reach/apex. `solver.js` reachability + overlap validator (screen wrap, moving/elevator sweeps).
- `patterns.js` pattern grammar: staircase, zigzag, lanes, moving sequence, precision, recovery, branch (safe spine lane + risk-reward lane).
- `director.js` LevelDirector: pacing roles (intro/flow/escalation/climax/recovery) -> difficulty -> pattern -> layout -> validate (6 bounded attempts, then safe fallback chain). Introduces each new tile type / enemy alone in an `intro` beat.
- `encounters.js` EncounterDirector: archetypes (blocker, patroller, special, projectile, timed), hazard budget per beat, spawn safety (never inside the jump-arc corridor of the guaranteed route, never on rows adjacent to the next beat), per-screen cap, shooter spacing, forced intro encounters.
- `world.js` instantiates beats (platforms, stars, power-ups with drop cooldown, enemies). Deterministic by seed.
- Game feel: 90 ms jump buffer, 100 ms coyote time when a tile vanishes, landing feedback per tile type, off-screen threat chevrons, `?debug=1` overlay (seed, beat/role/pattern, difficulty, taps, hazard budget, decisions, route, enemy boxes).

## Tests
- `node --experimental-default-type=module tests/level_engine_validation.mjs [seeds] [meters]` : solver, independent physics simulation of every route edge with the designed tap count (and 3), overlaps, enemy fairness, budgets, intro ordering, determinism. `SIM_TAPS=1` shows sensitivity (5% of edges need 2+ taps).
- `tests/solver_sabotage_check.mjs` : sabotages balance values and verifies the validator rejects/regenerates.
- `tests/drop_cooldown_check.mjs` : power-up drop cooldown.
- Older tests in tests/ (frontend_procedural_regression, procedural_diagnostics) target the previous generator and are obsolete.

## One jump, one level (rule enforced in generation + tests)
- Real physics: apex 167.2 px, engine lands on a tile only if the feet were <= 5 px below its surface -> highest landable rise 172.2 px (`MAX_RISE`).
- Vertical gaps are now 100-128 px (balance.js `gap`), so any two consecutive gaps sum to >= 200 px (> 172 + `twoLevelMargin` 12). Elevators are evaluated at their most favourable pose (+-15 px each).
- `solver.twoLevelOk` is checked for every node pair two rows apart, including across beat boundaries (`world.rowBefore/rowPrev`); violations trigger bounded regeneration. Springs (and power-ups/stomp bounces) are the intended exceptions.
- Enemy support tiles and phase alternatives sit on the same level as their host tile (offset 0), so they can't create a shortcut.
- Dead-end rule: every tile in a beat needs an onward tile in the next row (solver `dead end`), and the test checks all tiles incl. side tiles.
- Moving tiles are validated over their whole swept range (solver) and, in the test, with time-aware flights (24 start times, tap directions/timings) against the tile's true position during the jump.
- Test: `tests/one_jump_one_level_check.mjs` (current: 0 skips of 17k pairs, min two-level distance 200 px; legacy 72-76 px gaps: 12.8k skips, proving the check detects the bug) and the extended `level_engine_validation.mjs`.

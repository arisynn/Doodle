// Central tuning for the procedural level engine. Distances are px (40 px = 1 m), times are seconds.
export const BALANCE = {
  lookahead: 420,
  safety: .85,
  edgeMargin: 18,
  maxAttempts: 6,
  difficulty: { scale: 1500, warmupMeters: 60, warmupFloor: .35 },
  taps: [[0, 1], [.4, 2], [.8, 3]],
  gap: { easy: 76, hard: 108, jitter: 12, max: 128, rest: 72, elevatorMax: 112 },
  width: { easy: 112, hard: 66, jitter: 7, precision: 58, recovery: 118, branch: 76 },
  pacing: { cycle: ['flow', 'flow', 'escalation', 'climax', 'recovery'], mult: { intro: .3, flow: .75, escalation: 1, climax: 1.25, recovery: .25 } },
  grammar: {
    intro: { staircase: 5, recovery: 2 },
    flow: { staircase: 4, zigzag: 3, lanes: 2, moving: 2, branch: 2 },
    escalation: { zigzag: 4, lanes: 3, moving: 3, branch: 3, precision: 2 },
    climax: { precision: 4, moving: 3, branch: 3, zigzag: 3, lanes: 3 },
    recovery: { recovery: 1 }
  },
  platformUnlock: [['spring', 80, 8], ['moving', 120, 14], ['fragile', 250, 12], ['ice', 500, 10], ['conveyor', 700, 10], ['cloud', 950, 9], ['elevator', 1400, 12], ['phase', 1850, 10]],
  disappearing: ['fragile', 'cloud', 'phase'],
  hazard: { base: 1.2, perDifficulty: 6, roleMult: { intro: 0, flow: .6, escalation: 1, climax: 1.4, recovery: 0 }, loadPenalty: .6, perScreenCap: 3, shooterSpacingM: 13, minRow: 1 },
  starChance: .7
};
export const difficultyAt = meters => 1 - Math.exp(-meters / BALANCE.difficulty.scale);
export const tapsFor = d => BALANCE.taps.reduce((taps, [from, n]) => (d >= from ? n : taps), 1);

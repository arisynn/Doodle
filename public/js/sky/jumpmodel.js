import { GRAVITY, JUMP, SPEED } from './constants.js';
import { AIR_DRAG } from './physics.js';
// Everything here is derived from the live physics constants, never hand-tuned.
export const APEX = JUMP * JUMP / (2 * GRAVITY);
export const airTime = dy => { const disc = JUMP * JUMP - 2 * GRAVITY * dy; return disc < 0 ? 0 : (-JUMP + Math.sqrt(disc)) / GRAVITY; };
// Max horizontal travel before landing on a platform dy px above takeoff, using `taps` evenly spaced pushes (the jump tap counts as one).
export function reach(dy, taps = 1) {
  const total = airTime(dy);
  if (!total) return 0;
  return taps * (SPEED / AIR_DRAG) * (1 - Math.exp(-AIR_DRAG * total / taps));
}

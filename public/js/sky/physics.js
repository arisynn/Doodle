// Tap delivers a bounded impulse, never a persistent movement command.
export const AIR_DRAG = 3.8;
export const STOP_SPEED = 9;
export function horizontalStep(velocity, dt) {
  if (Math.abs(velocity) <= STOP_SPEED) return { velocity: 0, distance: 0 };
  const duration = Math.min(dt, Math.log(Math.abs(velocity) / STOP_SPEED) / AIR_DRAG);
  const next = velocity * Math.exp(-AIR_DRAG * duration);
  return { velocity: duration < dt || Math.abs(next) <= STOP_SPEED ? 0 : next, distance: (velocity - next) / AIR_DRAG };
}
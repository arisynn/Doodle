export const W = 400, H = 720, GRAVITY = 1550, JUMP = -720, SPEED = 340, PX_PER_M = 40, START_Y = 636, PLAYER_HALF = 14;
export const toMeters = y => Math.max(0, (START_Y - y) / PX_PER_M);

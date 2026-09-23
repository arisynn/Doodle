// Swept sprite bounds include every position a tile can occupy, not just spawn.
export function tileBounds(tile) {
  const dx = tile.type === 'moving' ? 27 : 0, dy = tile.type === 'elevator' ? 15 : 0;
  const x = tile.baseX ?? tile.x, y = tile.baseY ?? tile.y;
  return { left: x - dx, right: x + tile.w + dx, top: y - dy - (tile.type === 'spring' ? 22 : 0), bottom: y + dy + 28 };
}
export function overlaps(a, b, gap = 10) {
  return a.left < b.right + gap && a.right + gap > b.left && a.top < b.bottom + gap && a.bottom + gap > b.top;
}
export function sideTile(platforms, main, width, id, offsetY = 0) {
  const bounds = tileBounds(main), y = main.baseY + offsetY;
  const choices = [bounds.right + 18, bounds.left - width - 18];
  if (main.baseX + main.w / 2 > 200) choices.reverse();
  for (const x of choices) {
    if (x < 12 || x + width > 388) continue;
    const tile = { id, x, baseX: x, y, baseY: y, w: width, type: 'normal', zone: main.zone, safe: true };
    if (platforms.every(other => !overlaps(tileBounds(tile), tileBounds(other)))) return tile;
  }
  return null;
}
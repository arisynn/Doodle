export function bindInput(game, canvas, left, right, store) {
  canvas.addEventListener('pointerdown', e => {
    if (game.state !== 'playing' || store.data.settings.control === 'buttons') return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    game.command(e.clientX - rect.left < rect.width / 2 ? -1 : 1);
  });
  [[left, -1], [right, 1]].forEach(([button, direction]) => {
    button.addEventListener('pointerdown', e => { if (game.state !== 'playing') return; e.preventDefault(); game.command(direction); });
  });
  window.addEventListener('keydown', e => {
    if (game.state !== 'playing' || e.repeat) return;
    if (['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(e.key)) { e.preventDefault(); game.command(['ArrowLeft', 'a', 'A'].includes(e.key) ? -1 : 1); }
    if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); game.command(game.player.facing); }
    if (['Escape', 'p', 'P'].includes(e.key)) { e.preventDefault(); game.pause(); }
  });
  window.addEventListener('blur', () => game.pause());
  document.addEventListener('visibilitychange', () => { if (document.hidden) game.pause(); });
  window.addEventListener('pagehide', () => { if (game.player) store.height(game.height); store.save(); });
}
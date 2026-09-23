import { Store } from './store.js';
import { Feedback } from './audio.js';
import { Game } from './engine.js';
import { Renderer, loadImages } from './renderer.js';
import { bindInput } from './input.js';
import { header, home, missions, icon, img, format } from './views.js';
import { shop, handleShopAction } from './shop.js';
import { settings, guide, guideLibrary, tutorial, pauseView, resultView } from './panels.js';
import { ZONES, POWERS } from './catalog.js';

export const store = new Store();
const audio = new Feedback(store), $ = id => document.getElementById(id);
let renderer, loading = false, lastHud = -1, activeRoute = '', toastTimer, shopTab = 'skins';
const overlay = $('game-overlay');
export const game = new Game(store, audio, {
  pause: () => showOverlay(pauseView()),
  over: result => showOverlay(resultView(result, store)),
  update: updateHud
});
function stamp(root, prefix) {
  root.querySelectorAll('button,a,h1,h2,h3,p,small,span,strong,progress,input,img[alt]:not([alt=""])').forEach((el, i) => {
    if (!el.dataset.testid) el.dataset.testid = `${prefix}-${el.id || el.tagName.toLowerCase() + '-' + i}`;
  });
}
function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').hidden = false; toastTimer = setTimeout(() => { $('toast').hidden = true; }, 3500); }
function showOverlay(html) {
  overlay.innerHTML = html; overlay.hidden = false; stamp(overlay, 'overlay');
  $('game-canvas').tabIndex = -1;
  overlay.querySelector('button:not([disabled])')?.focus({ preventScroll: true });
}
function hideOverlay() { overlay.hidden = true; overlay.innerHTML = ''; $('game-canvas').tabIndex = 0; }
function renderHeader() { $('topbar').innerHTML = header(store); stamp($('topbar'), 'header'); updateSaveStatus(store.saveError); }
function updateSaveStatus(failed) {
  const note = document.querySelector('.saved-note');
  note.innerHTML = failed ? 'Penyimpanan tidak tersedia — progres sementara' : '<i></i> Progres tersimpan di perangkat ini';
  note.dataset.testid = 'save-status';
}
function render() {
  const route = location.hash.slice(1) || 'beranda';
  if (route === 'main') { activeRoute = route; $('app-shell').hidden = true; $('play-screen').hidden = false; document.body.classList.add('is-playing'); if (game.state === 'idle' || game.state === 'over') start(); return; }
  if (activeRoute === 'main' && ['playing', 'paused'].includes(game.state)) game.finish('Perjalanan disimpan', true);
  if (activeRoute === 'main' && game.state === 'tutorial') { game.state = 'idle'; game.clearInput(); }
  activeRoute = route; hideOverlay(); document.body.classList.remove('is-playing'); $('app-shell').hidden = false; $('play-screen').hidden = true;
  renderHeader();
  $('screen').innerHTML = ({ beranda: home, toko: () => shop(store, shopTab), misi: missions, pengaturan: settings, panduan: guide }[route] || home)(store);
  stamp($('screen'), route); stamp($('footer'), 'footer');
}
async function start() {
  if (loading) return;
  loading = true; hideOverlay(); audio.unlock();
  try {
    if (!renderer) { showOverlay('<div class="overlay-card" data-testid="loading-game"><p>Menyiapkan langit untukmu…</p></div>'); renderer = new Renderer($('game-canvas'), await loadImages()); }
    if (activeRoute !== 'main') return;
    game.start(); lastHud = -1; hideOverlay();
    $('touch-controls').hidden = store.data.settings.control !== 'buttons';
    $('game-gesture').textContent = 'BERPIJAK · Tap arah untuk melompat';
    if (!store.data.tutorial) { game.state = 'tutorial'; showOverlay(tutorial(store.data.settings.control)); }
    renderer.draw(game); updateHud(game);
  } catch (err) { showOverlay(`<div class="overlay-card"><h2>Langit belum siap.</h2><p>Aset permainan belum berhasil dimuat.</p><button class="primary-button" data-action="restart" data-testid="load-retry">Coba lagi</button><button class="text-button" data-action="home" data-testid="load-home">Kembali</button></div>`); }
  finally { loading = false; }
}
function updateHud(g) {
  if (Math.floor(g.time * 10) === lastHud) return;
  lastHud = Math.floor(g.time * 10);
  $('hud-height').innerHTML = `${format(g.height)} <em>m</em>`;
  $('hud-best').textContent = `Rekor ${format(Math.max(g.beforeBest, g.height))} m`;
  $('hud-stars').textContent = g.stars;
  const powers = [g.shield && ['shield', '1 benturan'], g.jet > 0 && ['jetpack', `${Math.ceil(g.jet)} dtk`], g.magnet > 0 && ['magnet', `${Math.ceil(g.magnet)} dtk`], g.doublejump > 0 && ['doublejump', `${g.player.doubleUsed ? '0' : '1'} ekstra · ${Math.ceil(g.doublejump)} dtk`], g.slow > 0 && ['slow', `${Math.ceil(g.slow)} dtk`], g.balloon && ['balloon', '1 jatuh']].filter(Boolean);
  const powerText = powers.map(([name, text]) => `<span data-testid="power-${name}" title="${POWERS[name].name}">${img(name, '', POWERS[name].name)}${text}</span>`).join('');
  if ($('power-status').innerHTML !== powerText) $('power-status').innerHTML = powerText;
  $('zone-name').textContent = ZONES[g.biome].name;
  $('zone-difficulty').textContent = ZONES[g.biome].label;
  const message = g.message?.until > g.time ? g.message.text : '';
  $('game-message').textContent = message; $('game-message').classList.toggle('visible', !!message);
  $('game-gesture').textContent = g.player.grounded ? 'BERPIJAK · Tap lagi untuk lompat' : g.doublejump > 0 && !g.player.doubleUsed ? 'DOUBLE JUMP · 1 tap udara ekstra' : 'DI UDARA · Tap untuk dorongan pendek';
}
document.addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn || btn.disabled) return;
  if (handleShopAction(btn, store, render, toast, audio)) return;
  if (btn.dataset.shopTab) { shopTab = btn.dataset.shopTab; render(); return; }
  const { action, skin, claim, setting, control, guideTab } = btn.dataset;
  if (btn.classList.contains('sound-toggle')) { store.data.settings.sound = !store.data.settings.sound; store.save(); audio.unlock(); renderHeader(); toast(store.data.settings.sound ? 'Suara diaktifkan' : 'Suara dimatikan'); }
  if (action === 'play') { audio.unlock(); location.hash = 'main'; }
  if (action === 'tutorial-ready') { store.data.tutorial = true; store.save(); audio.unlock(); hideOverlay(); game.state = 'playing'; }
  if (action === 'resume') { audio.unlock(); hideOverlay(); game.resume(); }
  if (action === 'restart') { game.finish('Perjalanan disimpan', true); start(); }
  if (action === 'home') { game.finish('Perjalanan disimpan', true); location.hash = 'beranda'; }
  if (skin) {
    if (store.data.owned.includes(skin)) { store.equip(skin); toast('Teman petualanganmu sudah siap!'); }
    else if (store.buy(skin)) { audio.unlock(); audio.play('power'); toast('Skin baru terbuka. Selamat menjelajah!'); }
    else toast('Bintang belum cukup. Yuk, melompat lagi!');
    render();
  }
  if (claim) { const reward = store.claim(claim); if (reward) { audio.unlock(); audio.play('power'); toast(`Misi selesai! +${reward} Bintang untukmu.`); render(); } }
  if (setting) { store.data.settings[setting] = !store.data.settings[setting]; store.save(); audio.unlock(); if (setting === 'vibration') audio.vibrate(25); render(); }
  if (control) { store.data.settings.control = control; store.save(); render(); }
  if (guideTab) {
    document.querySelectorAll('[data-guide-tab]').forEach(tab => { tab.classList.toggle('selected', tab === btn); tab.setAttribute('aria-pressed', String(tab === btn)); });
    $('guide-library').innerHTML = guideLibrary(guideTab); stamp($('guide-library'), 'guide-' + guideTab);
  }
});
$('pause-button').innerHTML = icon('pause'); $('pause-button').addEventListener('click', () => game.pause());
$('control-left').innerHTML = icon('back'); $('control-right').innerHTML = icon('arrow');
bindInput(game, $('game-canvas'), $('control-left'), $('control-right'), store);
// Trap keyboard focus inside a visible dialog without capturing game controls.
overlay.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const focusable = [...overlay.querySelectorAll('button:not([disabled]),a')];
  if (!focusable.length) return;
  const first = focusable[0], last = focusable.at(-1);
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
let last = performance.now(), accumulator = 0;
function loop(now) {
  const elapsed = Math.min((now - last) / 1000, .1); last = now;
  if (game.state === 'playing') { accumulator += elapsed; while (accumulator >= 1 / 120) { game.update(1 / 120); accumulator -= 1 / 120; } }
  else accumulator = 0;
  if (renderer && activeRoute === 'main') renderer.draw(game);
  requestAnimationFrame(loop);
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
window.addEventListener('resize', () => renderer?.resize());
window.addEventListener('progress-saved', e => updateSaveStatus(e.detail));
// Replace the old application's caches so old names and sprites cannot linger.
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
stamp($('play-screen'), 'game'); render(); requestAnimationFrame(loop);
if (store.saveError) toast('Penyimpanan perangkat tidak tersedia. Progres sementara hanya di sesi ini.');
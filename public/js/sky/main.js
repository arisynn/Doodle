import { Store } from './store.js';
import { Feedback } from './audio.js';
import { Game } from './engine.js';
import { Renderer, loadImages } from './renderer.js';
import { bindInput } from './input.js';
import { header, home, missions, icon, img, format } from './views.js';
import { shop, handleShopAction } from './shop.js';
import { settings, guide, guideLibrary, tutorial, pauseView, resultView } from './panels.js';
import { ZONES, POWERS } from './catalog.js';
import { L, loc, setLang } from './i18n.js';

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
  note.innerHTML = failed ? L('Penyimpanan tidak tersedia — progres sementara', '저장소를 사용할 수 없음 — 임시 진행') : '<i></i> ' + L('Progres tersimpan di perangkat ini', '진행 상황이 이 기기에 저장됩니다');
  note.dataset.testid = 'save-status';
}
function applyStatic() {
  document.title = L('Lompat Langit — Satu tap, jangan salah langkah', '하늘 점프 — 탭 한 번, 한 걸음도 틀리지 마');
  document.querySelector('meta[name=description]').content = L('Lompat Langit — satu tap, jangan salah langkah. Lompatan manual, pijakan menipu, dan musuh yang harus diinjak.', '하늘 점프 — 탭 한 번, 한 걸음도 틀리지 마. 수동 점프, 속이는 발판, 밟아야 하는 적.');
  const set = (id, text) => { $(id).textContent = text; };
  set('foot-tagline', L('Petualangan kecil. Langit tak terbatas.', '작은 모험. 끝없는 하늘.'));
  $('top-brand').innerHTML = L('lompat langit', '하늘 점프') + '<span>.</span>'; set('top-mode', L('MODE TANPA AKHIR', '무한 모드'));
  set('hud-label', L('KETINGGIAN', '고도')); set('hint-keys', L('Tap ← → atau A / D untuk melompat', '← → 또는 A / D로 점프')); set('hint-esc', L('ESC untuk jeda', 'ESC로 일시정지'));
  $('game-canvas').setAttribute('aria-label', L('Arena permainan. Tap sisi kiri atau kanan untuk lompat manual. Mendarat dulu sebelum lompat lagi.', '게임 영역. 화면 왼쪽 또는 오른쪽을 탭해서 수동 점프. 먼저 착지해야 다시 점프할 수 있어요.'));
  $('pause-button').setAttribute('aria-label', L('Jeda permainan', '게임 일시정지'));
  $('control-left').setAttribute('aria-label', L('Bergerak ke kiri', '왼쪽으로 이동')); $('control-right').setAttribute('aria-label', L('Bergerak ke kanan', '오른쪽으로 이동'));
  $('play-screen').setAttribute('aria-label', L('Arena Lompat Langit', '하늘 점프 게임 영역')); $('hud-star-img').alt = L('Bintang', '별');
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
    if (!renderer) { showOverlay(`<div class="overlay-card" data-testid="loading-game"><p>${L('Menyiapkan langit untukmu…', '하늘을 준비하는 중…')}</p></div>`); renderer = new Renderer($('game-canvas'), await loadImages()); }
    if (activeRoute !== 'main') return;
    game.start(); lastHud = -1; hideOverlay();
    $('touch-controls').hidden = store.data.settings.control !== 'buttons';
    $('game-gesture').textContent = L('BERPIJAK · Tap arah untuk melompat', '착지 · 방향을 탭해서 점프');
    if (!store.data.tutorial) { game.state = 'tutorial'; showOverlay(tutorial(store.data.settings.control)); }
    renderer.draw(game); updateHud(game);
  } catch (err) { showOverlay(`<div class="overlay-card"><h2>${L('Langit belum siap.', '하늘이 아직 준비되지 않았어요.')}</h2><p>${L('Aset permainan belum berhasil dimuat.', '게임 리소스를 불러오지 못했어요.')}</p><button class="primary-button" data-action="restart" data-testid="load-retry">${L('Coba lagi', '다시 시도')}</button><button class="text-button" data-action="home" data-testid="load-home">${L('Kembali', '뒤로')}</button></div>`); }
  finally { loading = false; }
}
function updateHud(g) {
  if (Math.floor(g.time * 10) === lastHud) return;
  lastHud = Math.floor(g.time * 10);
  $('hud-height').innerHTML = `${format(g.height)} <em>m</em>`;
  $('hud-best').textContent = `${L('Rekor', '기록')} ${format(Math.max(g.beforeBest, g.height))} m`;
  $('hud-stars').textContent = g.stars;
  const sec = n => `${Math.ceil(n)} ${L('dtk', '초')}`;
  const powers = [g.shield && ['shield', L('1 benturan', '충돌 1회')], g.jet > 0 && ['jetpack', sec(g.jet)], g.magnet > 0 && ['magnet', sec(g.magnet)], g.doublejump > 0 && ['doublejump', `${g.player.doubleUsed ? '0' : '1'} ${L('ekstra', '추가')} · ${sec(g.doublejump)}`], g.slow > 0 && ['slow', sec(g.slow)], g.balloon && ['balloon', L('1 jatuh', '추락 1회')]].filter(Boolean);
  const shown = new Set(powers.map(([name]) => name));
  const cooling = Object.entries(g.cool).filter(([name, left]) => left > 0 && !shown.has(name));
  const powerText = powers.map(([name, text]) => `<span data-testid="power-${name}" title="${loc(POWERS[name], 'name')}">${img(name, '', loc(POWERS[name], 'name'))}${text}</span>`).join('')
    + cooling.map(([name, left]) => `<span class="cooling" data-testid="cooldown-${name}" title="${loc(POWERS[name], 'name')}">${img(name, '', loc(POWERS[name], 'name'))}${L('CD', '쿨다운')} ${sec(left)}</span>`).join('');
  if ($('power-status').innerHTML !== powerText) $('power-status').innerHTML = powerText;
  $('zone-name').textContent = loc(ZONES[g.biome], 'name');
  $('zone-difficulty').textContent = loc(ZONES[g.biome], 'label');
  const message = g.message?.until > g.time ? g.message.text : '';
  $('game-message').textContent = message; $('game-message').classList.toggle('visible', !!message);
  $('game-gesture').textContent = g.player.grounded ? L('BERPIJAK · Tap lagi untuk lompat', '착지 · 다시 탭해서 점프') : g.doublejump > 0 && !g.player.doubleUsed ? L('DOUBLE JUMP · 1 tap udara ekstra', '더블 점프 · 공중 탭 1회 추가') : L('DI UDARA · Tap untuk dorongan pendek', '공중 · 탭해서 짧게 추진');
}
document.addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn || btn.disabled) return;
  if (handleShopAction(btn, store, render, toast, audio)) return;
  if (btn.dataset.shopTab) { shopTab = btn.dataset.shopTab; render(); return; }
  const { action, skin, claim, setting, control, guideTab, lang } = btn.dataset;
  if (btn.classList.contains('sound-toggle')) { store.data.settings.sound = !store.data.settings.sound; store.save(); audio.unlock(); renderHeader(); toast(store.data.settings.sound ? L('Suara diaktifkan', '소리가 켜졌어요') : L('Suara dimatikan', '소리가 꺼졌어요')); }
  if (lang) { setLang(lang); applyStatic(); render(); toast(L('Bahasa diubah ke Bahasa Indonesia', '언어가 한국어로 변경되었어요')); }
  if (action === 'play') { audio.unlock(); location.hash = 'main'; }
  if (action === 'tutorial-ready') { store.data.tutorial = true; store.save(); audio.unlock(); hideOverlay(); game.state = 'playing'; }
  if (action === 'resume') { audio.unlock(); hideOverlay(); game.resume(); }
  if (action === 'restart') { game.finish('Perjalanan disimpan', true); start(); }
  if (action === 'home') { game.finish('Perjalanan disimpan', true); location.hash = 'beranda'; }
  if (skin) {
    if (store.data.owned.includes(skin)) { store.equip(skin); toast(L('Teman petualanganmu sudah siap!', '모험 친구가 준비됐어요!')); }
    else if (store.buy(skin)) { audio.unlock(); audio.play('power'); toast(L('Skin baru terbuka. Selamat menjelajah!', '새 스킨 해금! 즐거운 탐험 되세요!')); }
    else toast(L('Bintang belum cukup. Yuk, melompat lagi!', '별이 부족해요. 다시 점프해 볼까요?'));
    render();
  }
  if (claim) { const reward = store.claim(claim); if (reward) { audio.unlock(); audio.play('power'); toast(L(`Misi selesai! +${reward} Bintang untukmu.`, `미션 완료! 별 +${reward}개를 받았어요.`)); render(); } }
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
applyStatic(); stamp($('play-screen'), 'game'); render(); requestAnimationFrame(loop);
if (store.saveError) toast(L('Penyimpanan perangkat tidak tersedia. Progres sementara hanya di sesi ini.', '기기 저장소를 사용할 수 없어요. 진행 상황은 이번 세션에만 유지됩니다.'));
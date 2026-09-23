import { SHOP_ITEMS, INVENTORY_LIMIT, findItem, isPermanent, ledgerLabel } from './economy.js';
import { img, icon, format, wallet, pageHead, skinGrid } from './views.js';
const TABS = [['skins','Karakter'], ['trail','Jejak'], ['landing','Pendaratan'], ['supply','Bekal'], ['party','Perayaan'], ['balance','Buku Bintang']];
function itemCard(item, store) {
  const d = store.data, permanent = isPermanent(item), owned = d.ownedItems.includes(item.id), equipped = d.equipped[item.category] === item.id;
  const quantity = d.inventory[item.id] || 0, locked = !owned && d.best < item.at, enough = d.balance >= item.price;
  const selected = item.category === 'supply' ? d.loadout === item.id : d.party === item.id;
  const disabled = locked || !enough || (!permanent && quantity >= INVENTORY_LIMIT);
  return `<article class="goods-card ${equipped || selected ? 'goods-selected' : ''}" data-testid="item-${item.id}"><div class="goods-art">${img(item.art, '', item.name)}<span class="goods-type">${permanent ? 'PERMANEN' : 'SEKALI PAKAI'}</span></div><div class="goods-info"><h2>${item.name}</h2><p>${item.description}</p>${permanent && owned ? `<button class="secondary-button" data-equip-item="${item.id}" data-testid="equip-${item.id}" ${equipped ? 'disabled' : ''}>${equipped ? icon('check') + ' Dipakai' : 'Pakai efek'}</button>` : `<button class="secondary-button" data-buy-item="${item.id}" data-testid="buy-${item.id}" ${disabled ? 'disabled' : ''}>${img('star')} ${item.price} Bintang ${!permanent ? '· Beli 1' : ''}</button>`}<small data-testid="item-requirement-${item.id}">${locked ? `Terbuka pada rekor ${format(item.at)} m` : !permanent && quantity >= INVENTORY_LIMIT ? 'Penyimpanan item penuh' : !owned && !enough ? `Butuh ${item.price - d.balance} Bintang lagi` : permanent ? 'Milikmu selamanya' : `Tersimpan: ${quantity} / ${INVENTORY_LIMIT}`}</small>${!permanent && quantity > 0 ? `<button class="prepare-button ${selected ? 'ready' : ''}" data-prepare-item="${item.id}" data-testid="prepare-${item.id}">${icon(selected ? 'check' : 'play')}${selected ? 'Disiapkan · Batalkan' : 'Siapkan sekali main'}</button>` : ''}</div></article>`;
}
function balanceBook(store) {
  const d = store.data, rows = [...d.ledger].reverse();
  return `<div class="balance-book" data-testid="balance-book"><div class="economy-counters"><div><small>Masuk</small><strong data-testid="economy-earned">+${format(d.economy.earned)}</strong></div><div><small>Dibelanjakan</small><strong data-testid="economy-spent">−${format(d.economy.spent)}</strong></div><div><small>Saldo sekarang</small><strong data-testid="economy-balance">${format(d.balance)}</strong></div></div><p class="book-note">Dicatat sejak pembaruan ekonomi. Saldo awal ${format(d.economy.opening)} Bintang tetap dipertahankan.</p><div class="ledger-list">${rows.length ? rows.map((t, i) => `<div class="ledger-row" data-testid="ledger-row-${i}"><span>${ledgerLabel(t.source)}</span><strong class="${t.amount > 0 ? 'income' : 'expense'}">${t.amount > 0 ? '+' : '−'}${format(Math.abs(t.amount))}</strong></div>`).join('') : '<p data-testid="ledger-empty">Belum ada transaksi. Setiap Bintang yang didapat atau dibelanjakan akan tercatat di sini.</p>'}</div><div class="economy-rules"><h2>Bintang punya arti.</h2><p>Tanpa bonus pasif, pengganda pendapatan, atau bunga saldo. Hadiah misi dibatasi; target bertambah. Item tidak bisa dijual kembali. Bekal dan perayaan adalah pengeluaran berulang, tetapi bermain tetap gratis.</p></div></div>`;
}
export function shop(store, tab = 'skins') {
  const supply = findItem(store.data.loadout), party = findItem(store.data.party);
  const collected = store.data.owned.length + store.data.ownedItems.length;
  let content = tab === 'skins' ? skinGrid(store) : tab === 'balance' ? balanceBook(store) : `<div class="goods-grid">${SHOP_ITEMS.filter(item => item.category === tab).map(item => itemCard(item, store)).join('')}</div>`;
  if (tab === 'supply') content = `<div class="store-warning" data-testid="supply-rules">${icon('help')}<p><strong>Satu slot bekal, bukan jalan pintas tak terbatas.</strong><br>Beli lalu pilih Siapkan. Satu item habis saat tap pertama; tidak otomatis disiapkan ulang. Maksimal 5 per jenis. Power-up di arena tetap gratis. Roket tidak bisa ditumpuk.</p></div>` + content;
  if (tab === 'party') content = `<div class="store-warning" data-testid="party-rules">${icon('star')}<p>Perayaan hanya tampilan. Dipakai satu kali saat perjalanan dimulai, tanpa menambah skor atau pendapatan. Boleh dibatalkan sebelum tap pertama.</p></div>` + content;
  return `<section class="subpage" data-testid="shop-screen">${pageHead('Setiap Bintang berarti.', 'Kumpulkan dengan usaha. Belanjakan dengan rencana.', 'shop')}<div class="shop-info">${wallet(store.data.balance, 'shop-balance')}<span data-testid="collection-progress">${collected} / 12 kosmetik dikoleksi</span></div><div class="loadout-strip" data-testid="prepared-loadout"><span>${icon('bag')} <strong>${supply ? supply.name : 'Tanpa bekal'}</strong>${supply ? ' · 1 slot terisi' : ' · Bermain tetap gratis'}</span><span>${party ? 'Festival disiapkan' : 'Tanpa perayaan'}</span></div><nav class="shop-tabs" aria-label="Kategori toko">${TABS.map(([id, label]) => `<button data-shop-tab="${id}" data-testid="shop-tab-${id}" aria-pressed="${tab === id}" class="${tab === id ? 'selected' : ''}">${label}</button>`).join('')}</nav><div data-testid="shop-content-${tab}">${content}</div></section>`;
}
export function handleShopAction(btn, store, render, toast, audio) {
  const { buyItem, equipItem, prepareItem } = btn.dataset;
  if (buyItem) {
    if (store.buyItem(buyItem)) { audio.unlock(); audio.play('power'); toast(isPermanent(findItem(buyItem)) ? 'Efek terbuka dan dipakai selamanya!' : 'Item dibeli. Pilih Siapkan untuk perjalanan berikutnya.'); }
    else toast('Belum bisa dibeli. Periksa Bintang, rekor, atau kapasitas item.');
    render(); return true;
  }
  if (equipItem) { if (store.equipItem(equipItem)) toast('Efek petualangan diperbarui.'); render(); return true; }
  if (prepareItem) {
    const item = findItem(prepareItem), field = item.category === 'supply' ? 'loadout' : 'party';
    const selected = store.data[field] === prepareItem;
    if (item.category === 'supply') store.prepareSupply(selected ? null : prepareItem); else store.prepareParty(selected ? null : prepareItem);
    toast(selected ? 'Item disimpan kembali, tidak terpakai.' : 'Siap untuk satu perjalanan. Terpakai pada tap pertama.'); render(); return true;
  }
  return false;
}
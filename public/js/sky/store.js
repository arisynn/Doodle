import { SHOP_ITEMS, INVENTORY_LIMIT, findItem, isPermanent, missionTarget, missionReward } from './economy.js';
export const SAVE_KEY = 'lompat-langit-v1';
export const SKINS = [
  { id: 'piko', name: 'Piko', title: 'Si penjelajah kecil', price: 0, at: 0, color: '#daf4da' },
  { id: 'momo', name: 'Momo', title: 'Hangat seperti senja', price: 80, at: 0, color: '#ffe4cb' },
  { id: 'luna', name: 'Luna', title: 'Teman para bintang', price: 240, at: 900, color: '#e3e9fd' },
  { id: 'nimbus', name: 'Nimbus', title: 'Pilot di atas awan', price: 600, at: 3200, color: '#f8eabd' }
];
const fresh = () => ({ version: 2, balance: 0, best: 0, stars: 0, kills: 0, runs: 0, owned: ['piko'], skin: 'piko', tutorial: false, tutorialVersion: 2,
  ownedItems: ['trail-none', 'landing-none'], equipped: { trail: 'trail-none', landing: 'landing-none' }, inventory: {}, loadout: null, party: null,
  economy: { opening: 0, earned: 0, spent: 0 }, ledger: [],
  settings: { sound: true, vibration: false, control: 'tap' }, tiers: { height: 0, stars: 0, kills: 0 }, bases: { stars: 0, kills: 0 } });
const integer = n => Number.isSafeInteger(n) && n >= 0 ? n : 0;
export class Store {
  constructor(storage) {
    this.storage = storage; this.saveError = false;
    this.data = fresh();
    try {
      this.storage ||= window.localStorage;
      const raw = JSON.parse(this.storage.getItem(SAVE_KEY));
      if (raw?.version === 1 || raw?.version === 2) {
        for (const k of ['balance', 'best', 'stars', 'kills', 'runs']) this.data[k] = integer(raw[k]);
        this.data.owned = [...new Set(['piko', ...(Array.isArray(raw.owned) ? raw.owned : []).filter(id => SKINS.some(s => s.id === id))])];
        if (this.data.owned.includes(raw.skin)) this.data.skin = raw.skin;
        this.data.tutorial = !!raw.tutorial && raw.tutorialVersion === 2;
        for (const k of ['sound', 'vibration']) if (typeof raw.settings?.[k] === 'boolean') this.data.settings[k] = raw.settings[k];
        this.data.settings.control = raw.settings?.control === 'buttons' ? 'buttons' : 'tap';
        for (const k of ['height', 'stars', 'kills']) this.data.tiers[k] = integer(raw.tiers?.[k]);
        for (const k of ['stars', 'kills']) this.data.bases[k] = Math.min(integer(raw.bases?.[k]), this.data[k]);
        this.data.ownedItems = [...new Set(['trail-none', 'landing-none', ...(Array.isArray(raw.ownedItems) ? raw.ownedItems : []).filter(id => { const item = findItem(id); return item && isPermanent(item); })])];
        for (const category of ['trail', 'landing']) if (this.data.ownedItems.includes(raw.equipped?.[category]) && findItem(raw.equipped[category])?.category === category) this.data.equipped[category] = raw.equipped[category];
        for (const item of SHOP_ITEMS.filter(item => !isPermanent(item))) this.data.inventory[item.id] = Math.min(INVENTORY_LIMIT, integer(raw.inventory?.[item.id]));
        if (raw.inventory?.['supply-spread']) this.data.inventory['supply-doublejump'] = Math.min(INVENTORY_LIMIT, this.data.inventory['supply-doublejump'] + integer(raw.inventory['supply-spread']));
        if (raw.loadout === 'supply-spread') raw.loadout = 'supply-doublejump';
        if (findItem(raw.loadout)?.category === 'supply' && this.data.inventory[raw.loadout] > 0) this.data.loadout = raw.loadout;
        if (findItem(raw.party)?.category === 'party' && this.data.inventory[raw.party] > 0) this.data.party = raw.party;
        if (raw.version === 1) this.data.economy.opening = this.data.balance;
        else {
          for (const k of ['opening', 'earned', 'spent']) this.data.economy[k] = integer(raw.economy?.[k]);
          this.data.ledger = (Array.isArray(raw.ledger) ? raw.ledger : []).filter(t => Number.isSafeInteger(t.amount) && t.amount !== 0 && typeof t.source === 'string' && typeof t.at === 'number').slice(-30);
        }
      }
    } catch { this.saveError = true; }
  }
  save() {
    try { this.storage.setItem(SAVE_KEY, JSON.stringify(this.data)); this.saveError = false; }
    catch { this.saveError = true; }
    window.dispatchEvent(new CustomEvent('progress-saved', { detail: this.saveError }));
  }
  transaction(amount, source) {
    if (!Number.isSafeInteger(amount) || !amount || this.data.balance + amount < 0) return false;
    this.data.balance += amount;
    if (amount > 0) this.data.economy.earned += amount;
    else this.data.economy.spent -= amount;
    const last = this.data.ledger.at(-1);
    if (source === 'collect' && last?.source === source && Date.now() - last.at < 600000) { last.amount += amount; last.at = Date.now(); }
    else this.data.ledger.push({ amount, source, at: Date.now() });
    this.data.ledger = this.data.ledger.slice(-30); return true;
  }
  earn(amount = 1) { if (amount > 0 && this.transaction(amount, 'collect')) { this.data.stars += amount; this.save(); } }
  defeat() { this.data.kills++; this.save(); }
  height(height) { if (height > this.data.best) { this.data.best = height; this.save(); } }
  buy(id) {
    const skin = SKINS.find(s => s.id === id);
    if (!skin || this.data.owned.includes(id) || this.data.best < skin.at || this.data.balance < skin.price) return false;
    this.transaction(-skin.price, 'skin-' + id); this.data.owned.push(id); this.data.skin = id; this.save(); return true;
  }
  equip(id) { if (!this.data.owned.includes(id)) return false; this.data.skin = id; this.save(); return true; }
  missions() {
    return ['height', 'stars', 'kills'].map((id, i) => {
      const tier = this.data.tiers[id], target = missionTarget(id, tier);
      const progress = Math.min(target, id === 'height' ? this.data.best : this.data[id] - this.data.bases[id]);
      return { id, tier, target, progress, reward: missionReward(id, tier),
        title: ['Menyapa awan', 'Pemburu bintang', 'Langit yang aman'][i],
        text: [`Capai ${target} m dalam satu permainan`, `Kumpulkan ${target} Bintang`, `Kalahkan ${target} musuh`][i],
        icon: ['flag', 'star', 'slime'][i], done: progress >= target };
    });
  }
  claim(id) {
    const m = this.missions().find(m => m.id === id);
    if (!m?.done) return 0;
    this.transaction(m.reward, 'mission-' + id); this.data.tiers[id]++;
    if (id !== 'height') this.data.bases[id] += m.target;
    this.save(); return m.reward;
  }
  buyItem(id) {
    const item = findItem(id);
    if (!item || item.price === 0 || this.data.best < item.at || this.data.balance < item.price) return false;
    if (isPermanent(item) ? this.data.ownedItems.includes(id) : (this.data.inventory[id] || 0) >= INVENTORY_LIMIT) return false;
    if (!this.transaction(-item.price, id)) return false;
    if (isPermanent(item)) { this.data.ownedItems.push(id); this.data.equipped[item.category] = id; }
    else {
      this.data.inventory[id] = (this.data.inventory[id] || 0) + 1;
      if (item.category === 'party') this.data.party = id;
    }
    this.save(); return true;
  }
  equipItem(id) {
    const item = findItem(id);
    if (!item || !isPermanent(item) || !this.data.ownedItems.includes(id)) return false;
    this.data.equipped[item.category] = id; this.save(); return true;
  }
  prepareSupply(id) {
    if (id !== null && (findItem(id)?.category !== 'supply' || !this.data.inventory[id])) return false;
    this.data.loadout = id; this.save(); return true;
  }
  prepareParty(id) {
    if (id !== null && (findItem(id)?.category !== 'party' || !this.data.inventory[id])) return false;
    this.data.party = id; this.save(); return true;
  }
  consumeLoadout() {
    const result = { supply: null, party: null };
    for (const [field, category] of [['loadout', 'supply'], ['party', 'party']]) {
      const id = this.data[field];
      if (id && this.data.inventory[id] > 0) { this.data.inventory[id]--; result[category] = id; }
      this.data[field] = null;
    }
    this.save(); return result;
  }
}
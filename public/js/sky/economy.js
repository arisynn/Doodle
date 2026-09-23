export const INVENTORY_LIMIT = 5;
export const SHOP_ITEMS = [
  { id: 'trail-none', category: 'trail', name: 'Angin biasa', description: 'Jejak sederhana, petualangan luar biasa.', price: 0, at: 0, art: 'cosmetic-trail-none' },
  { id: 'trail-leaf', category: 'trail', name: 'Daun menari', description: 'Dedaunan kecil mengikuti setiap lompatan.', price: 120, at: 350, art: 'cosmetic-trail-leaf' },
  { id: 'trail-spark', category: 'trail', name: 'Debu bintang', description: 'Tinggalkan kilau hangat di belakangmu.', price: 280, at: 900, art: 'cosmetic-trail-spark' },
  { id: 'trail-aurora', category: 'trail', name: 'Pita aurora', description: 'Warna langit utara menyertai perjalanan.', price: 650, at: 3200, art: 'cosmetic-trail-aurora' },
  { id: 'landing-none', category: 'landing', name: 'Langkah ringan', description: 'Pendaratan lembut seperti biasanya.', price: 0, at: 0, art: 'cosmetic-landing-none' },
  { id: 'landing-petal', category: 'landing', name: 'Mekar kecil', description: 'Kelopak bunga bermekaran saat mendarat.', price: 150, at: 350, art: 'cosmetic-landing-petal' },
  { id: 'landing-ripple', category: 'landing', name: 'Riak langit', description: 'Riak biru kecil di setiap pijakan.', price: 320, at: 1800, art: 'cosmetic-landing-ripple' },
  { id: 'landing-comet', category: 'landing', name: 'Salam komet', description: 'Percikan komet untuk langkah istimewa.', price: 720, at: 3200, art: 'cosmetic-landing-comet' },
  { id: 'supply-shield', category: 'supply', power: 'shield', name: 'Bekal perisai', description: 'Mulai dengan satu pelindung benturan.', price: 35, at: 0, art: 'shield' },
  { id: 'supply-magnet', category: 'supply', power: 'magnet', name: 'Bekal magnet', description: 'Magnet aktif 9 detik saat mulai.', price: 30, at: 200, art: 'magnet' },
  { id: 'supply-jetpack', category: 'supply', power: 'jetpack', name: 'Bekal roket', description: 'Terbang 3,8 detik. Tidak bisa ditumpuk.', price: 90, at: 450, art: 'jetpack' },
  { id: 'supply-doublejump', category: 'supply', power: 'doublejump', name: 'Bekal Double Jump', description: 'Satu lompatan udara ekstra per pijakan selama 10 detik.', price: 45, at: 600, art: 'doublejump' },
  { id: 'supply-slow', category: 'supply', power: 'slow', name: 'Bekal jam awan', description: 'Dunia melambat selama 6 detik.', price: 40, at: 950, art: 'slow' },
  { id: 'supply-balloon', category: 'supply', power: 'balloon', name: 'Bekal balon', description: 'Satu penyelamat ketika jatuh.', price: 60, at: 1300, art: 'balloon' },
  { id: 'party-confetti', category: 'party', name: 'Festival kecil', description: 'Konfeti di layar hasil untuk satu perjalanan. Tanpa bonus skor atau Bintang.', price: 18, at: 0, art: 'cosmetic-party-confetti' }
];
export const findItem = id => SHOP_ITEMS.find(item => item.id === id);
export const isPermanent = item => ['trail', 'landing'].includes(item.category);
export function missionTarget(id, tier) {
  if (id === 'height') return Math.min(1000000000, Math.ceil((250 * Math.pow(1.7, Math.min(tier, 28))) / 50) * 50);
  if (id === 'stars') return 30 + 15 * tier + 5 * tier * tier;
  return 5 + 4 * tier + Math.floor(Math.pow(tier, 1.5));
}
export function missionReward(id, tier) {
  if (id === 'height') return Math.min(60, 25 + 5 * tier);
  if (id === 'stars') return Math.min(30, 12 + 3 * tier);
  return Math.min(40, 20 + 4 * tier);
}
export function ledgerLabel(source) {
  if (source === 'collect') return 'Bintang dari petualangan';
  if (source.startsWith('mission-')) return 'Hadiah misi';
  if (source.startsWith('skin-')) return 'Skin ' + ({ piko: 'Piko', momo: 'Momo', luna: 'Luna', nimbus: 'Nimbus' }[source.slice(5)] || 'karakter');
  return findItem(source)?.name || 'Transaksi Bintang';
}
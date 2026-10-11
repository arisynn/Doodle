import { L, loc } from './i18n.js';
export const INVENTORY_LIMIT = 5;
export const SHOP_ITEMS = [
  { id: 'trail-none', category: 'trail', name: 'Angin biasa', description: 'Jejak sederhana, petualangan luar biasa.', price: 0, at: 0, art: 'cosmetic-trail-none', ko: { name: '평범한 바람', description: '소박한 궤적, 놀라운 모험.' } },
  { id: 'trail-leaf', category: 'trail', name: 'Daun menari', description: 'Dedaunan kecil mengikuti setiap lompatan.', price: 120, at: 250, art: 'cosmetic-trail-leaf', ko: { name: '춤추는 나뭇잎', description: '작은 나뭇잎이 점프마다 따라옵니다.' } },
  { id: 'trail-spark', category: 'trail', name: 'Debu bintang', description: 'Tinggalkan kilau hangat di belakangmu.', price: 280, at: 700, art: 'cosmetic-trail-spark', ko: { name: '별가루', description: '뒤에 따뜻한 반짝임을 남깁니다.' } },
  { id: 'trail-aurora', category: 'trail', name: 'Pita aurora', description: 'Warna langit utara menyertai perjalanan.', price: 650, at: 2200, art: 'cosmetic-trail-aurora', ko: { name: '오로라 리본', description: '북쪽 하늘의 빛깔이 여정을 함께합니다.' } },
  { id: 'landing-none', category: 'landing', name: 'Langkah ringan', description: 'Pendaratan lembut seperti biasanya.', price: 0, at: 0, art: 'cosmetic-landing-none', ko: { name: '가벼운 발걸음', description: '평소처럼 부드러운 착지.' } },
  { id: 'landing-petal', category: 'landing', name: 'Mekar kecil', description: 'Kelopak bunga bermekaran saat mendarat.', price: 150, at: 250, art: 'cosmetic-landing-petal', ko: { name: '작은 꽃망울', description: '착지할 때 꽃잎이 피어납니다.' } },
  { id: 'landing-ripple', category: 'landing', name: 'Riak langit', description: 'Riak biru kecil di setiap pijakan.', price: 320, at: 1300, art: 'cosmetic-landing-ripple', ko: { name: '하늘 물결', description: '발판마다 작은 파란 물결이 번집니다.' } },
  { id: 'landing-comet', category: 'landing', name: 'Salam komet', description: 'Percikan komet untuk langkah istimewa.', price: 720, at: 2200, art: 'cosmetic-landing-comet', ko: { name: '혜성 인사', description: '특별한 걸음에 혜성 불꽃을 더합니다.' } },
  { id: 'supply-shield', category: 'supply', power: 'shield', name: 'Bekal perisai', description: 'Mulai dengan satu pelindung benturan. Cooldown 12 detik.', price: 35, at: 0, art: 'shield', ko: { name: '방패 보급품', description: '충돌 방어 1회와 함께 시작합니다. 쿨다운 12초.' } },
  { id: 'supply-magnet', category: 'supply', power: 'magnet', name: 'Bekal magnet', description: 'Magnet aktif 9 detik saat mulai.', price: 30, at: 150, art: 'magnet', ko: { name: '자석 보급품', description: '시작할 때 9초 동안 자석이 작동합니다.' } },
  { id: 'supply-jetpack', category: 'supply', power: 'jetpack', name: 'Bekal roket', description: 'Terbang 3,8 detik. Tidak bisa ditumpuk. Cooldown 30 detik.', price: 90, at: 350, art: 'jetpack', ko: { name: '로켓 보급품', description: '3.8초 동안 비행합니다. 중첩 불가. 쿨다운 30초.' } },
  { id: 'supply-doublejump', category: 'supply', power: 'doublejump', name: 'Bekal Double Jump', description: 'Satu lompatan udara ekstra per pijakan selama 10 detik. Cooldown 20 detik.', price: 45, at: 450, art: 'doublejump', ko: { name: '더블 점프 보급품', description: '10초 동안 착지마다 공중 점프 1회 추가. 쿨다운 20초.' } },
  { id: 'supply-slow', category: 'supply', power: 'slow', name: 'Bekal jam awan', description: 'Dunia melambat selama 6 detik. Cooldown 25 detik.', price: 40, at: 750, art: 'slow', ko: { name: '구름 시계 보급품', description: '6초 동안 세상이 느려집니다. 쿨다운 25초.' } },
  { id: 'supply-balloon', category: 'supply', power: 'balloon', name: 'Bekal balon', description: 'Satu penyelamat ketika jatuh. Cooldown 60 detik.', price: 60, at: 900, art: 'balloon', ko: { name: '풍선 보급품', description: '추락할 때 구출 1회. 쿨다운 60초.' } },
  { id: 'party-confetti', category: 'party', name: 'Festival kecil', description: 'Konfeti di layar hasil untuk satu perjalanan. Tanpa bonus skor atau Bintang.', price: 18, at: 0, art: 'cosmetic-party-confetti', ko: { name: '작은 축제', description: '한 번의 여정 동안 결과 화면에 색종이가 날립니다. 점수·별 보너스는 없습니다.' } }
];
export const findItem = id => SHOP_ITEMS.find(item => item.id === id);
export const isPermanent = item => ['trail', 'landing'].includes(item.category);
export const itemName = item => loc(item, 'name');
export const itemDescription = item => loc(item, 'description');
export function missionTarget(id, tier) {
  if (id === 'height') return Math.min(1000000, Math.ceil((100 * Math.pow(1.7, Math.min(tier, 20))) / 50) * 50);
  if (id === 'stars') return 30 + 15 * tier + 5 * tier * tier;
  return 5 + 4 * tier + Math.floor(Math.pow(tier, 1.5));
}
export function missionReward(id, tier) {
  if (id === 'height') return Math.min(60, 25 + 5 * tier);
  if (id === 'stars') return Math.min(30, 12 + 3 * tier);
  return Math.min(40, 20 + 4 * tier);
}
export function ledgerLabel(source) {
  if (source === 'collect') return L('Bintang dari petualangan', '모험에서 얻은 별');
  if (source.startsWith('mission-')) return L('Hadiah misi', '미션 보상');
  if (source.startsWith('skin-')) return L('Skin ', '스킨 ') + ({ piko: L('Piko', '피코'), momo: L('Momo', '모모'), luna: L('Luna', '루나'), nimbus: L('Nimbus', '님버스') }[source.slice(5)] || L('karakter', '캐릭터'));
  const item = findItem(source);
  return item ? itemName(item) : L('Transaksi Bintang', '별 거래');
}

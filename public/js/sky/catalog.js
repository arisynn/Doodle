export const ZONES = [
  { name: 'Taman Awan', at: 0, tile: 'garden', background: 'morning', label: 'Pemanasan' },
  { name: 'Lembah Angin', at: 350, tile: 'wind', background: 'morning', label: 'Mulai menantang' },
  { name: 'Kepulauan Senja', at: 900, tile: 'sunset', background: 'sunset', label: 'Waspada' },
  { name: 'Rasi Bintang', at: 1800, tile: 'moon', background: 'night', label: 'Sulit' },
  { name: 'Puncak Aurora', at: 3200, tile: 'aurora', background: 'aurora', label: 'Ekstrem' }
];
export const zoneAt = height => Math.max(0, ZONES.findLastIndex(zone => height >= zone.at));
export const PLATFORM_TYPES = ['normal', 'moving', 'fragile', 'spring', 'ice', 'conveyor', 'cloud', 'phase', 'elevator'];
export const PLATFORMS = {
  normal: ['Pijakan kokoh', 'Pijakan tetap untuk menyusun langkah berikutnya.'],
  moving: ['Pengelana', 'Bergerak mendatar. Semakin tinggi, semakin cepat.'],
  fragile: ['Batu rapuh', 'Retak dan pecah setelah satu lompatan.'],
  spring: ['Pegas', 'Berpijak, lalu tap untuk melompat lebih tinggi.'],
  ice: ['Es licin', 'Masih meluncur setelah mendarat. Tap sebelum tergelincir!'],
  conveyor: ['Sabuk angin', 'Menggeser posisi pijakanmu mengikuti panah.'],
  cloud: ['Awan tipis', 'Menghilang 0,65 detik setelah dipijak. Cepat tap lagi!'],
  phase: ['Gerbang cahaya', 'Berkedip sebelum menghilang sementara. Ada jalur alternatif tetap.'],
  elevator: ['Lift langit', 'Naik-turun dengan ritme yang bisa dipelajari.']
};
export const POWERS = {
  shield: { name: 'Perisai', at: 120, weight: 4, text: 'Menahan satu benturan, bukan jatuh.', message: 'Perisai siap!' },
  magnet: { name: 'Magnet', at: 200, weight: 4, duration: 9, text: 'Menarik Bintang di sekitar selama 9 detik.', message: 'Bintang, kemari!' },
  jetpack: { name: 'Roket', at: 450, weight: 2, duration: 3.8, text: 'Terbang kebal 3,8 detik. Roket aktif tidak bisa ditumpuk atau diperpanjang.', message: 'Wusss! Roket aktif!' },
  doublejump: { name: 'Double Jump', at: 600, weight: 3, duration: 10, text: 'Selama 10 detik, satu tap tambahan di udara memberi satu lompatan ekstra. Isi ulang setelah berpijak.', message: 'Double Jump: satu lompatan ekstra di udara!' },
  slow: { name: 'Jam Awan', at: 950, weight: 3, duration: 6, text: 'Musuh, proyektil, dan platform melambat selama 6 detik.', message: 'Dunia melambat, kamu tetap lincah!' },
  balloon: { name: 'Balon Penyelamat', at: 1300, weight: 2, text: 'Menyelamatkan dari satu kali jatuh. Tidak menahan serangan.', message: 'Satu penyelamat jatuh sudah siap!' }
};
export const ENEMIES = {
  slime: { name: 'Slime Awan', at: 260, hp: 1, weight: 4, text: 'Menjaga pijakan bonus. Injak dari atas, jangan dari samping.' },
  bat: { name: 'Kelelawar Langit', at: 450, hp: 1, weight: 4, text: 'Berpatroli mendatar dengan ritme teratur.' },
  bee: { name: 'Lebah Angin', at: 750, hp: 1, weight: 3, text: 'Terbang zig-zag. Tunggu celah, lalu lewati.' },
  drone: { name: 'Drone Penjaga', at: 1050, hp: 1, weight: 3, text: 'Memberi tanda sebelum menembak. Lewati proyektil, lalu injak.' },
  mimic: { name: 'Pijakan Palsu', at: 1350, hp: 1, weight: 3, text: 'Menyamar sebagai tile. Terbuka saat didekati, lalu berbahaya setelah jeda peringatan. Injak dari atas!' },
  beetle: { name: 'Kumbang Baja', at: 1550, hp: 1, weight: 2, text: 'Pelindung di sisi tubuhnya berbahaya. Satu injakan dari atas mengalahkannya.' },
  jelly: { name: 'Ubur Bintang', at: 2050, hp: 1, weight: 2, text: 'Menembakkan kipas proyektil setelah peringatan. Cari jalan untuk menginjaknya.' },
  wisp: { name: 'Roh Komet', at: 2800, hp: 1, weight: 2, text: 'Mengunci arah sebelum menerjang. Hindari garisnya, lalu injak.' }
};
export function weighted(rng, options) {
  const sum = options.reduce((n, option) => n + option.weight, 0);
  let roll = rng() * sum;
  for (const option of options) { roll -= option.weight; if (roll <= 0) return option.id; }
  return options.at(-1)?.id;
}
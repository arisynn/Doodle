import { getLang } from './i18n.js';
export const ZONES = [
  { name: 'Taman Awan', at: 0, tile: 'garden', background: 'morning', label: 'Pemanasan', ko: { name: '구름 정원', label: '워밍업' } },
  { name: 'Lembah Angin', at: 250, tile: 'wind', background: 'morning', label: 'Mulai menantang', ko: { name: '바람 계곡', label: '도전 시작' } },
  { name: 'Kepulauan Senja', at: 700, tile: 'sunset', background: 'sunset', label: 'Waspada', ko: { name: '노을 섬', label: '경계' } },
  { name: 'Rasi Bintang', at: 1300, tile: 'moon', background: 'night', label: 'Sulit', ko: { name: '별자리', label: '어려움' } },
  { name: 'Puncak Aurora', at: 2200, tile: 'aurora', background: 'aurora', label: 'Ekstrem', ko: { name: '오로라 봉우리', label: '극한' } }
];
export const zoneAt = meters => Math.max(0, ZONES.findLastIndex(zone => meters >= zone.at));
export const PLATFORM_TYPES = ['normal', 'moving', 'fragile', 'spring', 'ice', 'conveyor', 'cloud', 'phase', 'elevator'];
export const PLATFORMS = {
  normal: ['Pijakan kokoh', 'Pijakan tetap untuk menyusun langkah berikutnya.', '단단한 발판', '다음 걸음을 준비할 수 있는 고정 발판입니다.'],
  moving: ['Pengelana', 'Bergerak mendatar. Semakin tinggi, semakin cepat.', '떠돌이 발판', '좌우로 움직입니다. 높이 올라갈수록 빨라집니다.'],
  fragile: ['Batu rapuh', 'Retak dan pecah setelah satu lompatan.', '부서지는 바위', '한 번 뛰고 나면 갈라져 부서집니다.'],
  spring: ['Pegas', 'Berpijak, lalu tap untuk melompat lebih tinggi.', '스프링', '밟은 뒤 탭하면 훨씬 높이 뜁니다.'],
  ice: ['Es licin', 'Masih meluncur setelah mendarat. Tap sebelum tergelincir!', '미끄러운 얼음', '착지 후에도 미끄러집니다. 미끄러지기 전에 탭하세요!'],
  conveyor: ['Sabuk angin', 'Menggeser posisi pijakanmu mengikuti panah.', '바람 벨트', '화살표 방향으로 발밑을 밀어냅니다.'],
  cloud: ['Awan tipis', 'Menghilang 0,65 detik setelah dipijak. Cepat tap lagi!', '얇은 구름', '밟고 0.65초 뒤에 사라집니다. 빨리 다시 탭하세요!'],
  phase: ['Gerbang cahaya', 'Berkedip sebelum menghilang sementara. Ada jalur alternatif tetap.', '빛의 문', '깜빡이다가 잠시 사라집니다. 고정된 대체 경로가 있습니다.'],
  elevator: ['Lift langit', 'Naik-turun dengan ritme yang bisa dipelajari.', '하늘 엘리베이터', '익힐 수 있는 리듬으로 오르내립니다.']
};
export const platformInfo = id => { const p = PLATFORMS[id]; return getLang() === 'ko' ? [p[2], p[3]] : [p[0], p[1]]; };
// at = first meter it can appear; dropCooldown = min meters before the same drop spawns again; cooldown = seconds after pickup before it can be used again.
export const POWERS = {
  shield: { name: 'Perisai', at: 80, weight: 4, dropCooldown: 60, cooldown: 12, text: 'Menahan satu benturan, bukan jatuh.', message: 'Perisai siap!',
    ko: { name: '방패', text: '충돌 한 번을 막아줍니다. 추락은 막지 못합니다.', message: '방패 준비 완료!' } },
  magnet: { name: 'Magnet', at: 150, weight: 4, duration: 9, dropCooldown: 70, cooldown: 0, text: 'Menarik Bintang di sekitar selama 9 detik.', message: 'Bintang, kemari!',
    ko: { name: '자석', text: '9초 동안 주변의 별을 끌어당깁니다.', message: '별아, 이리 와!' } },
  jetpack: { name: 'Roket', at: 350, weight: 2, duration: 3.8, dropCooldown: 150, cooldown: 30, text: 'Terbang kebal 3,8 detik. Roket aktif tidak bisa ditumpuk atau diperpanjang.', message: 'Wusss! Roket aktif!',
    ko: { name: '로켓', text: '3.8초 동안 무적으로 날아갑니다. 작동 중인 로켓은 중첩되거나 연장되지 않습니다.', message: '슈웅! 로켓 작동!' } },
  doublejump: { name: 'Double Jump', at: 450, weight: 3, duration: 10, dropCooldown: 90, cooldown: 20, text: 'Selama 10 detik, satu tap tambahan di udara memberi satu lompatan ekstra. Isi ulang setelah berpijak.', message: 'Double Jump: satu lompatan ekstra di udara!',
    ko: { name: '더블 점프', text: '10초 동안 공중에서 탭 한 번으로 추가 점프 1회. 착지하면 다시 충전됩니다.', message: '더블 점프: 공중에서 한 번 더!' } },
  slow: { name: 'Jam Awan', at: 750, weight: 3, duration: 6, dropCooldown: 110, cooldown: 25, text: 'Musuh, proyektil, dan platform melambat selama 6 detik.', message: 'Dunia melambat, kamu tetap lincah!',
    ko: { name: '구름 시계', text: '6초 동안 적, 발사체, 발판이 느려집니다.', message: '세상이 느려졌지만 너는 그대로!' } },
  balloon: { name: 'Balon Penyelamat', at: 900, weight: 2, dropCooldown: 200, cooldown: 60, text: 'Menyelamatkan dari satu kali jatuh. Tidak menahan serangan.', message: 'Satu penyelamat jatuh sudah siap!',
    ko: { name: '구출 풍선', text: '추락 한 번을 막아줍니다. 공격은 막지 못합니다.', message: '추락 구출 풍선 준비 완료!' } }
};
export const ENEMIES = {
  slime: { name: 'Slime Awan', at: 150, hp: 1, weight: 4, text: 'Menjaga pijakan bonus. Injak dari atas, jangan dari samping.',
    ko: { name: '구름 슬라임', text: '보너스 발판을 지킵니다. 옆이 아니라 위에서 밟으세요.' } },
  bat: { name: 'Kelelawar Langit', at: 300, hp: 1, weight: 4, text: 'Berpatroli mendatar dengan ritme teratur.',
    ko: { name: '하늘 박쥐', text: '일정한 리듬으로 좌우를 순찰합니다.' } },
  bee: { name: 'Lebah Angin', at: 550, hp: 1, weight: 3, text: 'Terbang zig-zag. Tunggu celah, lalu lewati.',
    ko: { name: '바람 벌', text: '지그재그로 날아다닙니다. 틈을 기다렸다가 지나가세요.' } },
  drone: { name: 'Drone Penjaga', at: 800, hp: 1, weight: 3, text: 'Memberi tanda sebelum menembak. Lewati proyektil, lalu injak.',
    ko: { name: '경비 드론', text: '발사 전에 신호를 보냅니다. 발사체를 피한 뒤 밟으세요.' } },
  mimic: { name: 'Pijakan Palsu', at: 950, hp: 1, weight: 3, text: 'Menyamar sebagai tile. Terbuka saat didekati, lalu berbahaya setelah jeda peringatan. Injak dari atas!',
    ko: { name: '가짜 발판', text: '발판으로 위장합니다. 다가가면 정체를 드러내고, 경고 뒤에 위험해집니다. 위에서 밟으세요!' } },
  beetle: { name: 'Kumbang Baja', at: 1050, hp: 1, weight: 2, text: 'Pelindung di sisi tubuhnya berbahaya. Satu injakan dari atas mengalahkannya.',
    ko: { name: '강철 딱정벌레', text: '몸 옆면의 방어막이 위험합니다. 위에서 한 번 밟으면 쓰러집니다.' } },
  jelly: { name: 'Ubur Bintang', at: 1500, hp: 1, weight: 2, text: 'Menembakkan kipas proyektil setelah peringatan. Cari jalan untuk menginjaknya.',
    ko: { name: '별 해파리', text: '경고 뒤에 부채꼴로 발사체를 쏩니다. 밟을 수 있는 길을 찾으세요.' } },
  wisp: { name: 'Roh Komet', at: 2000, hp: 1, weight: 2, text: 'Mengunci arah sebelum menerjang. Hindari garisnya, lalu injak.',
    ko: { name: '혜성 도깨비불', text: '돌진하기 전에 방향을 고정합니다. 선을 피한 뒤 밟으세요.' } }
};
export function weighted(rng, options) {
  const sum = options.reduce((n, option) => n + option.weight, 0);
  let roll = rng() * sum;
  for (const option of options) { roll -= option.weight; if (roll <= 0) return option.id; }
  return options.at(-1)?.id;
}

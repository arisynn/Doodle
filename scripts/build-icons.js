const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const dir = path.join(__dirname, '../public/assets/sky');
fs.mkdirSync(dir, { recursive: true });
const paths = {
  play: '<path d="m9 5 11 7-11 7Z" fill="#35584c" stroke="none"/>',
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>', back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="4"/>', check: '<path d="m5 12 4 4L19 6"/>',
  sound: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8q5 4 0 8M18 4q8 8 0 16"/>', mute: '<path d="m11 4-6 5H2v6h3l6 5ZM16 9l6 6m0-6-6 6"/>',
  settings: '<path d="m10 3-1 3-3 1-3 3 2 3-1 3 3 3 3-1 3 2 3-2 1-3 3-2-1-4-3-1-1-3Z"/><circle cx="11.5" cy="12" r="3"/>',
  bag: '<path d="M5 8h14l2 13H3ZM8 8V6a4 4 0 0 1 8 0v2"/>', flag: '<path d="M5 21V3m0 1q4-3 8 0t7 0v10q-4 3-8 0t-7 0"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 8a2.5 2.5 0 1 1 4 2l-1.5 2v1M12 17h.01"/>',
  swipe: '<path d="M5 5h14m-3-3 3 3-3 3M8 2 5 5l3 3M9 22l-4-5q-1-3 2-2l3 2v-7q2-3 3 0v5q6-2 6 3l-1 4"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  home: '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8"/>', restart: '<path d="M4 11a8 8 0 1 1 1 6M4 4v7h7"/>',
  vibration: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M4 7v10M1 10v4M20 7v10M23 10v4"/>', star: '<path d="m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z"/>'
};
Promise.all(Object.entries(paths).map(([name, shape]) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#35584c" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${shape}</svg>`)).png().toFile(path.join(dir, 'ui-' + name + '.png')))).then(() => console.log('PNG interface icons ready.'));
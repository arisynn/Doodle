const sharp = require('sharp'), path = require('path');
const dir = path.join(__dirname, '../public/assets/sky'), jobs = [];
const write = (name, w, h, body) => jobs.push(sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`), { density: 144 }).png().toFile(path.join(dir, name + '.png')));
const line = 'stroke="#355c52" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"';
write('doublejump', 62, 66, `<path d="M6 39Q9 15 29 25L28 49Q12 52 6 39M56 39Q53 15 33 25L34 49Q50 52 56 39" fill="#e8d099" ${line}/><path d="M12 28L16 42M19 25L22 44M50 28L46 42M43 25L40 44" stroke="#bc9c67" stroke-width="2"/><path d="M20 23L31 9L42 23M20 39L31 25L42 39" fill="none" stroke="#4e958b" stroke-width="5" stroke-linecap="round"/><rect x="22" y="46" width="19" height="15" rx="5" fill="#9cceaa" ${line}/><path d="M28 51h6l-6 5h6" stroke="#355c52" stroke-width="2" fill="none"/>`);
write('mimic', 84, 62, `<path d="M10 26L18 53L33 49L44 58L57 49L71 53L79 26" fill="#ac9364" ${line}/><path d="M9 16Q5 5 24 9Q33 1 43 9Q60 1 68 11Q84 7 80 23L73 31H15Z" fill="#aac782" ${line}/><path d="M18 28Q44 19 70 28L65 45Q40 51 22 42Z" fill="#514c3f" ${line}/><path d="M24 27L28 36L33 27M48 26L53 37L58 26M29 44L35 36L39 46M54 45L59 37L64 42" fill="#f5ead0"/><path d="M24 17L31 20M58 17L51 20" stroke="#355c52" stroke-width="4" stroke-linecap="round"/><path d="M8 38L2 34M77 38L82 32" stroke="#355c52" stroke-width="3"/>`);
write('mimic-eyes', 44, 18, `<path d="M6 6L15 10M37 6L28 10" stroke="#4e6548" stroke-width="3" stroke-linecap="round"/>`);
const shapes = {
  leaf: '<path d="M4 26Q1 6 29 3Q31 28 4 26" fill="#a7c78b" stroke="#709567" stroke-width="2"/><path d="M5 26L24 9" stroke="#709567" stroke-width="2"/>',
  spark: '<path d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12Z" fill="#ffe5a0" stroke="#dcb469" stroke-width="1.5"/>',
  aurora: '<path d="M3 26Q6 3 15 12Q25 23 28 4L28 18Q24 34 15 23Q6 12 3 31Z" fill="#9dddc6" stroke="#78b4b4" stroke-width="1.5"/>',
  petal: '<path d="M15 29Q-2 22 6 7Q14-2 19 14Q35 3 30 19Q28 28 15 29" fill="#e6ada6" stroke="#bc8b88" stroke-width="1.5"/>',
  ripple: '<ellipse cx="16" cy="18" rx="14" ry="8" fill="none" stroke="#8abbcd" stroke-width="3"/><ellipse cx="16" cy="18" rx="7" ry="3" fill="none" stroke="#b4dfe4" stroke-width="2"/>',
  comet: '<path d="M4 27L10 7L18 11L29 1L26 20L18 17L12 29Z" fill="#e8ba7c" stroke="#b8926c" stroke-width="1.5"/><circle cx="10" cy="23" r="7" fill="#ffe4a2"/>',
  none: '<circle cx="10" cy="19" r="5" fill="#d1d7bd"/><circle cx="22" cy="10" r="3" fill="#e2e6cf"/>'
};
for (const [name, shape] of Object.entries(shapes)) write('particle-' + name, 34, 34, shape);
for (const [category, effects] of [['trail',['none','leaf','spark','aurora']],['landing',['none','petal','ripple','comet']],['party',['confetti']]]) for (const effect of effects) {
  let particles = '';
  for (let i = 0; i < 9; i++) {
    const name = effect === 'confetti' ? ['leaf','petal','spark','aurora'][i%4] : effect;
    const x = category === 'trail' ? 20 + i * 19 : 30 + (i * 67) % 190;
    const y = category === 'trail' ? 80 - Math.sin(i / 4) * 48 : 15 + (i * 31) % 70;
    particles += `<g transform="translate(${x} ${y}) scale(${.4+(i%3)*.1}) rotate(${i*21})">${shapes[name]}</g>`;
  }
  const platform = category === 'landing' ? `<path d="M65 89H183L173 111H77Z" fill="#b7986b" ${line}/><rect x="59" y="81" width="130" height="17" rx="8" fill="#aec78b" ${line}/>` : '';
  write(`cosmetic-${category}-${effect}`, 250, 130, `<ellipse cx="125" cy="67" rx="109" ry="54" fill="#f5efcf" opacity=".7"/>${particles}${platform}`);
}
Promise.all(jobs).then(() => console.log(`Created ${jobs.length} manual-play and cosmetic PNG assets.`));
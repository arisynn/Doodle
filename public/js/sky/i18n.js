const KEY = 'lompat-langit-lang';
let lang = 'id';
try {
  const saved = window.localStorage.getItem(KEY);
  lang = saved === 'ko' || saved === 'id' ? saved : (navigator.language || '').toLowerCase().startsWith('ko') ? 'ko' : 'id';
} catch {}
document.documentElement.lang = lang;
export const getLang = () => lang;
export function setLang(next) {
  lang = next === 'ko' ? 'ko' : 'id';
  try { window.localStorage.setItem(KEY, lang); } catch {}
  document.documentElement.lang = lang;
}
export const L = (id, ko) => (lang === 'ko' ? ko : id);
export const loc = (obj, field) => (lang === 'ko' && obj.ko?.[field]) || obj[field];
export const format = n => new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'id-ID').format(n);

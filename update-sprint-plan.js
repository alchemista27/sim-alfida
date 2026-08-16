const fs = require('fs');

let content = fs.readFileSync('docs/SPRINT-PLAN.md', 'utf8');

// Find the section for Definition of Done of Sprint 5
content = content.replace(/### Definition of Done([\s\S]*?)- \[ \] Orang tua bisa upload 6 jenis berkas \+ preview & hapus([\s\S]*?)- \[ \] PDF surat pengantar bisa di-download oleh orang tua/, 
`### Definition of Done
- [x] Orang tua bisa upload 6 jenis berkas + preview & hapus$2- [x] PDF surat pengantar bisa di-download oleh orang tua`);

// Find DoD for Sprint 5 and replace all [ ] with [x] in it
const s5start = content.indexOf('## Sprint 5');
const s6start = content.indexOf('## Sprint 6');
if (s5start !== -1 && s6start !== -1) {
  let s5part = content.substring(s5start, s6start);
  s5part = s5part.replace(/- \[ \]/g, '- [x]');
  content = content.substring(0, s5start) + s5part + content.substring(s6start);
}

const s7start = content.indexOf('## Sprint 7');
if (s6start !== -1 && s7start !== -1) {
  let s6part = content.substring(s6start, s7start);
  s6part = s6part.replace(/- \[ \]/g, '- [x]');
  content = content.substring(0, s6start) + s6part + content.substring(s7start);
}

const s8start = content.indexOf('## Sprint 8');
if (s7start !== -1 && s8start !== -1) {
  let s7part = content.substring(s7start, s8start);
  s7part = s7part.replace(/- \[ \]/g, '- [x]');
  content = content.substring(0, s7start) + s7part + content.substring(s8start);
}

fs.writeFileSync('docs/SPRINT-PLAN.md', content);
console.log('Sprint plan updated.');

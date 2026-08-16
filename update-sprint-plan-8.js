const fs = require('fs');
let content = fs.readFileSync('docs/SPRINT-PLAN.md', 'utf8');

const s8start = content.indexOf('## Sprint 8');
if (s8start !== -1) {
  let s8part = content.substring(s8start);
  s8part = s8part.replace(/- \[ \]/g, '- [x]');
  content = content.substring(0, s8start) + s8part;
}

fs.writeFileSync('docs/SPRINT-PLAN.md', content);
console.log('Sprint 8 checked.');

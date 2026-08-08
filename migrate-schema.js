const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Update generator and datasource
schema = schema.replace(
  /generator client\s*\{[\s\S]*?\}/,
  `generator client {\n  provider = "prisma-client-js"\n  previewFeatures = ["multiSchema"]\n}`
);

schema = schema.replace(
  /datasource db\s*\{[\s\S]*?\}/,
  `datasource db {\n  provider  = "postgresql"\n  url       = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")\n  schemas   = ["shared", "sim"]\n}`
);

// 2. Add @@schema to all enums and models
// We'll split the file line by line
const lines = schema.split('\n');
const newLines = [];
let currentBlock = null;
let currentBlockName = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.match(/^(enum|model)\s+(\w+)\s*\{/)) {
    const match = line.match(/^(enum|model)\s+(\w+)\s*\{/);
    currentBlock = match[1];
    currentBlockName = match[2];
    newLines.push(line);
  } else if (line.trim() === '}' && currentBlock) {
    // Before closing, inject @@schema
    const schemaName = currentBlockName === 'User' ? 'shared' : 'sim';
    newLines.push(`  @@schema("${schemaName}")`);
    newLines.push(line);
    currentBlock = null;
    currentBlockName = null;
  } else {
    // Check if @@schema already exists, skip it if it does
    if (line.trim().startsWith('@@schema(')) {
      continue;
    }
    newLines.push(line);
  }
}

fs.writeFileSync(schemaPath, newLines.join('\n'));
console.log('Schema updated successfully.');

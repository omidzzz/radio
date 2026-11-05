const fs = require('fs');
const c = fs.readFileSync('c:\\Users\\ghada\\Desktop\\Projects\\radiotherapist-website\\components\\home\\Process.tsx', 'utf8');
const lines = c.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<dl') || lines[i].includes('<ul') || lines[i].includes('<dt') || lines[i].includes('<dd') || lines[i].includes('<li')) {
    console.log((i + 1) + ': ' + lines[i].trim());
  }
}
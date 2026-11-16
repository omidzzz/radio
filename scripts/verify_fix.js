// Verify the fix in setWorkspace function
const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/ghada/Desktop/Projects/radiotherapist-website';
const filePath = path.join(projectRoot, 'api', 'admin.php');
const c = fs.readFileSync(filePath, 'utf8');

const start = c.indexOf('function setWorkspace');
const end = c.indexOf('// Load data', start);

const funcCode = c.substring(start, end);
console.log('setWorkspace function:');
console.log(funcCode);
console.log('');

// Check for duplicate if statements
const ifCount = (funcCode.match(/if \(name ===/g) || []).length;
console.log('Number of "if (name ===" statements:', ifCount);

if (ifCount === 6) {
    console.log('SUCCESS: No duplicates!');
} else if (ifCount === 12) {
    console.log('WARNING: Still have duplicates!');
} else {
    console.log('Unexpected count:', ifCount);
}
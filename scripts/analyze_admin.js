// Analyze the admin.php JavaScript code
const fs = require('fs');
const c = fs.readFileSync('api/admin.php', 'utf8');

// Find all function definitions
const funcRegex = /function\s+(\w+)\s*\(/g;
const funcMatches = [];
let match;
while ((match = funcRegex.exec(c)) !== null) {
    funcMatches.push(match[1]);
}
console.log('Functions found:', funcMatches.length);
console.log('Functions:', funcMatches);

// Find duplicate function definitions or suspicious patterns
const loadFuncs = funcMatches.filter(f => f.startsWith('load'));
console.log('\nLoad functions:', loadFuncs);

// Check for duplicate event listeners
const domContentRegex = /DOMContentLoaded/g;
const domContentMatches = [];
while ((match = domContentRegex.exec(c)) !== null) {
    domContentMatches.push(match.index);
}
console.log('\nDOMContentLoaded locations:', domContentMatches);

// Find setWorkspace function
const setWorkspaceIdx = c.indexOf('function setWorkspace');
console.log('\nsetWorkspace at:', setWorkspaceIdx);
const setWorkspaceEnd = c.indexOf('{', setWorkspaceIdx);
const setWorkspaceCode = c.substring(setWorkspaceIdx, setWorkspaceEnd + 1000);
console.log('setWorkspace code:', setWorkspaceCode);

// Check for duplicate load calls
const loadCalls = c.match(/load(Forums|Bookings|Comments|Messages|Dashboard|Media|Post\()/g) || [];
console.log('\nLoad calls found:', loadCalls.length);
console.log(loadCalls);

// Check for recursion
console.log('\n--- Checking for recursion ---');
const loadCallPattern = /load(Forums|Bookings|Comments|Messages|Dashboard|Media|Post)\(\)\s*;/g;
const recursionMatches = [];
while ((match = loadCallPattern.exec(c)) !== null) {
    recursionMatches.push(match);
}
console.log(recursionMatches);

// Fix duplicate code in setWorkspace function
const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/ghada/Desktop/Projects/radiotherapist-website';
const filePath = path.join(projectRoot, 'api', 'admin.php');

// Read the file
let c = fs.readFileSync(filePath, 'utf8');

// Find the setWorkspace function start
const start = c.indexOf('function setWorkspace');
if (start === -1) {
    console.log('Could not find setWorkspace function');
    process.exit(1);
}

// Find the end of the function (the closing brace)
let braceCount = 0;
let end = start;
for (let i = start; i < c.length; i++) {
    if (c[i] === '{') braceCount++;
    else if (c[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
            end = i + 1;
            break;
        }
    }
}

// Get the function code
const funcCode = c.substring(start, end);
console.log('Found setWorkspace function, length:', funcCode.length);

// Check if it has duplicates
const ifCount = (funcCode.match(/if \(name ===/g) || []).length;
console.log('Number of "if (name ===" statements:', ifCount);

// If there are 12 (6 duplicated), we need to remove the second half
if (ifCount === 12) {
    // The first 6 if statements are the correct ones
    // Remove the second set of if statements (from the 7th "if (name ===" to the closing brace)
    const firstHalfEnd = funcCode.indexOf("if (name === 'messages') loadMessages();", 600) + "if (name === 'messages') loadMessages();".length;
    
    const newFuncCode = funcCode.substring(0, firstHalfEnd);
    c = c.substring(0, start) + newFuncCode + c.substring(end);
    fs.writeFileSync(filePath, c);
    console.log('Fixed duplicate code!');
} else {
    console.log('Unexpected number of if statements:', ifCount);
}
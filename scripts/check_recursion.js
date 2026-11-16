// Check for recursive calls in load functions
const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/ghada/Desktop/Projects/radiotherapist-website';
const filePath = path.join(projectRoot, 'api', 'admin.php');
const c = fs.readFileSync(filePath, 'utf8');

// Find loadForums function
const funcStart = c.indexOf('async function loadForums()');
if (funcStart !== -1) {
    // Find the end of the function (next async or event listener)
    let braceCount = 0;
    let funcEnd = funcStart;
    for (let i = funcStart; i < c.length; i++) {
        if (c[i] === '{') braceCount++;
        else if (c[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                funcEnd = i + 1;
                break;
            }
        }
    }
    
    const funcCode = c.substring(funcStart, funcEnd);
    console.log('loadForums function:');
    console.log(funcCode.substring(0, 800));
    console.log('...');
    console.log('');
}

// Find loadBookings function
const funcStart2 = c.indexOf('async function loadBookings()');
if (funcStart2 !== -1) {
    let braceCount = 0;
    let funcEnd = funcStart2;
    for (let i = funcStart2; i < c.length; i++) {
        if (c[i] === '{') braceCount++;
        else if (c[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
                funcEnd = i + 1;
                break;
            }
        }
    }
    
    const funcCode = c.substring(funcStart2, funcEnd);
    console.log('loadBookings function:');
    console.log(funcCode.substring(0, 800));
}
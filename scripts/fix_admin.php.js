// Fix the duplicate code in setWorkspace function
const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/ghada/Desktop/Projects/radiotherapist-website';
const filePath = path.join(projectRoot, 'api', 'admin.php');
let c = fs.readFileSync(filePath, 'utf8');

// Pattern for the duplicate if statements
const dupPattern1 = /if \(name === 'overview'\) loadDashboard\(\);(\n\s*if \(name === 'media'\) loadMedia\(\);){1,}/g;
const dupPattern2 = /(\n\s*if \(name === 'forum'\) loadForums\(\);){1,}/g;
const dupPattern3 = /(\n\s*if \(name === 'bookings'\) loadBookings\(\);){1,}/g;
const dupPattern4 = /(\n\s*if \(name === 'comments'\) loadComments\(\);){1,}/g;
const dupPattern5 = /(\n\s*if \(name === 'messages'\) loadMessages\(\);){1,}/g;

let count = 0;
c = c.replace(dupPattern1, (match) => {
    count++;
    return "      if (name === 'overview') loadDashboard();";
});
c = c.replace(dupPattern2, (match) => {
    count++;
    return "";
});
c = c.replace(dupPattern3, (match) => {
    count++;
    return "";
});
c = c.replace(dupPattern4, (match) => {
    count++;
    return "";
});
c = c.replace(dupPattern5, (match) => {
    count++;
    return "";
});

fs.writeFileSync(filePath, c);
console.log('Fixed duplicate code. Replacements:', count);
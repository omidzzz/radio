// Check for JavaScript syntax errors in the script section
const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/Users/ghada/Desktop/Projects/radiotherapist-website';
const filePath = path.join(projectRoot, 'api', 'admin.php');
const c = fs.readFileSync(filePath, 'utf8');

// Extract the JavaScript between <script> tags
const firstScript = c.indexOf('<script>');
const lastScript = c.lastIndexOf('</script>');

if (firstScript !== -1 && lastScript !== -1) {
    const jsCode = c.substring(firstScript + 8, lastScript);
    console.log('JavaScript code length:', jsCode.length);
    
    // Find the exact location of unbalanced braces
    let braceCount = 0;
    for (let i = 0; i < jsCode.length; i++) {
        if (jsCode[i] === '{') braceCount++;
        else if (jsCode[i] === '}') braceCount--;
        if (braceCount < 0) {
            console.log('UNBALANCED BRACES at position', i, 'character:', jsCode[i], 'before it:', jsCode.substring(i-20, i));
            break;
        }
    }
    console.log('Final brace count:', braceCount);
    
    // Find the exact location of unbalanced brackets
    let bracketCount = 0;
    for (let i = 0; i < jsCode.length; i++) {
        if (jsCode[i] === '[') bracketCount++;
        else if (jsCode[i] === ']') bracketCount--;
        if (bracketCount < 0) {
            console.log('UNBALANCED BRACKETS at position', i, 'character:', jsCode[i], 'before it:', jsCode.substring(i-20, i));
            break;
        }
    }
    console.log('Final bracket count:', bracketCount);
    
    // Find the location of the orphan closing brace
    // This is the second extra brace
    braceCount = 0;
    let extraBraces = [];
    for (let i = 0; i < jsCode.length; i++) {
        if (jsCode[i] === '{') braceCount++;
        else if (jsCode[i] === '}') braceCount--;
        if (braceCount === -1) {
            console.log('Extra closing brace at position', i, 'character:', jsCode[i]);
            break;
        }
    }
    
} else {
    console.log('Could not find script tags');
}
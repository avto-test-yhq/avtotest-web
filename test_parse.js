const fs = require('fs');

const code = fs.readFileSync('app/exam/page.js', 'utf8');

// We will find all < and > tags and see which ones match
// Instead of writing a parser, I will just grep for the number of <div and </div
const divOpens = (code.match(/<div /g) || []).length + (code.match(/<div\>/g) || []).length;
const divCloses = (code.match(/<\/div>/g) || []).length;

console.log('divOpens:', divOpens, 'divCloses:', divCloses);

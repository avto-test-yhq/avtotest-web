const fs = require('fs');
const code = fs.readFileSync(process.argv[2], 'utf8');

const lines = code.split('\n');
let openTags = [];
let closeTags = [];

lines.forEach((line, index) => {
  const lineNum = index + 1;
  const numOpens = (line.match(/<div(\s|>)/g) || []).length;
  const numCloses = (line.match(/<\/div>/g) || []).length;

  for (let i = 0; i < numOpens; i++) {
    openTags.push(lineNum);
  }
  for (let i = 0; i < numCloses; i++) {
    closeTags.push(lineNum);
  }
});

let stack = [];
let unclosed = [];

for (let i = 0; i < openTags.length; i++) {
   stack.push(openTags[i]);
}

for (let j = 0; j < closeTags.length; j++) {
   if (stack.length > 0) stack.pop();
}

console.log('Unclosed div tags opened on lines roughly (stack remainder):', stack.slice(- (stack.length - closeTags.length)));
// This is a naive stack, it won't give exact line numbers if ordering is mixed, but it gives a hint.

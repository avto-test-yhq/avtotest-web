const fs = require('fs');

function checkTags(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const lines = code.split('\n');
  const stack = [];
  
  // Very simplistic parser tailored for this code
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Find all <div... and </div>
    // This is naive and will fail on comments or strings, but works for checking structure roughly
    let match;
    const divRegex = /<(div)(\s|>)|<\/(div)>/g;
    
    while ((match = divRegex.exec(line)) !== null) {
      if (match[1] === 'div') { // Open
        stack.push({ tag: 'div', line: lineNum });
      } else if (match[3] === 'div') { // Close
        if (stack.length === 0) {
          console.log(`Extra </div> at ${filePath}:${lineNum}`);
        } else {
          stack.pop();
        }
      }
    }
  });

  if (stack.length > 0) {
    console.log(`Unclosed div(s) in ${filePath}:`);
    stack.forEach(s => console.log(`  Line ${s.line}`));
  } else {
    console.log(`All divs matched in ${filePath}.`);
  }
}

checkTags('app/exam/page.js');
checkTags('app/biletlar/' + '[ticketId]' + '/page.js');

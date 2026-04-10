const fs = require('fs');
const text = fs.readFileSync('src/components/FlashcardManager.tsx', 'utf8');
const re = /<(/?)([A-Za-z0-9_:-]+)([^>]*)>/g;
const selfClosing = new Set(['br','img','input','hr','meta','link','path','circle','rect','source','track']);
const lines = text.split(/\r?\n/);
let stack = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  let m;
  while ((m = re.exec(line)) !== null) {
    const closing = m[1] === '/';
    const tag = m[2];
    const attrs = m[3];
    if (selfClosing.has(tag.toLowerCase()) || attrs.trim().endsWith('/')) continue;
    if (closing) {
      if (stack.length && stack[stack.length-1] === tag) {
        stack.pop();
      } else {
        console.log(`Mismatch closing ${tag} at line ${i+1}, stack top ${stack[stack.length-1]}`);
        process.exit(0);
      }
    } else {
      stack.push(tag);
    }
  }
}
console.log('remaining', stack.length, stack.slice(-20));

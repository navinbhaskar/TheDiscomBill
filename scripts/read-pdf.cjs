const fs = require('fs');
const path = process.argv[2];
const buf = fs.readFileSync(path);
const text = buf.toString('latin1');
const strings = text.match(/[\x20-\x7E]{6,}/g) || [];
const readable = strings.filter(s => /[a-zA-Z]{2,}/.test(s) && !/^\s*$/.test(s));
console.log(readable.join('\n'));

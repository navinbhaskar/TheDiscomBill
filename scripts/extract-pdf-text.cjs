// Extract text from FlateDecode streams in a PDF
const fs = require('fs');
const zlib = require('zlib');

const pdfPath = process.argv[2];
const buf = fs.readFileSync(pdfPath);

const results = [];
let i = 0;
const data = buf;

while (i < data.length - 20) {
  // Look for "stream\r\n" or "stream\n"
  const streamTag = Buffer.from('stream');
  const idx = data.indexOf(streamTag, i);
  if (idx === -1) break;

  // Check preceding headers for FlateDecode
  const headerStart = Math.max(0, idx - 500);
  const header = data.slice(headerStart, idx).toString('latin1');

  const isFlateDecode = header.includes('FlateDecode') && !header.includes('DCTDecode');
  if (!isFlateDecode) { i = idx + 6; continue; }

  // Find length
  const lenMatch = header.match(/\/Length\s+(\d+)/);
  const len = lenMatch ? parseInt(lenMatch[1]) : 0;
  if (!len) { i = idx + 6; continue; }

  // Stream starts after \n
  let streamStart = idx + 6;
  if (data[streamStart] === 13) streamStart++; // \r
  if (data[streamStart] === 10) streamStart++; // \n

  const compressed = data.slice(streamStart, streamStart + len);

  try {
    const decompressed = zlib.inflateSync(compressed);
    const text = decompressed.toString('latin1');

    // Look for text rendering commands: BT...ET blocks
    const btMatches = text.match(/BT[\s\S]*?ET/g) || [];
    for (const block of btMatches) {
      // Extract text from Tj, TJ, ' operators
      const strings = [];

      // Match (text) Tj
      const tjMatches = block.match(/\(([^)]*)\)\s*Tj/g) || [];
      for (const m of tjMatches) {
        const s = m.match(/\(([^)]*)\)/);
        if (s) strings.push(s[1].replace(/\\n/g, ' ').trim());
      }

      // Match [(text)] TJ
      const tjArrayMatches = block.match(/\[([^\]]*)\]\s*TJ/g) || [];
      for (const m of tjArrayMatches) {
        const inner = m.slice(1, m.lastIndexOf(']'));
        const parts = inner.match(/\(([^)]*)\)/g) || [];
        const combined = parts.map(p => p.slice(1,-1)).join('').trim();
        if (combined.length > 1) strings.push(combined);
      }

      if (strings.length) results.push(strings.join(' '));
    }
  } catch(e) {
    // ignore decompression errors
  }

  i = streamStart + len;
}

console.log(results.filter(s => s.trim().length > 0).join('\n'));

const fs=require("fs");const p="generate-seo.js";let s=fs.readFileSync(p,"utf8");
const bad = `  if (//solar/.test(h)) return 'sun';
  if (//compare/.test(h)) return 'compare';
  if (/smart-meter/.test(h)) return 'gauge';
  if (/new-connection|services/.test(h)) return 'plug';
  if (//fppa|fuel-surcharge/.test(h)) return 'trend';
  if (//tariffs/.test(h)) return 'table';
  if (//guides/.test(h)) return 'guide';`;
const good = [
  "  if (/solar/.test(h)) return 'sun';",
  "  if (/compare/.test(h)) return 'compare';",
  "  if (/smart-meter/.test(h)) return 'gauge';",
  "  if (/new-connection|services/.test(h)) return 'plug';",
  "  if (/fppa|fuel-surcharge/.test(h)) return 'trend';",
  "  if (/tariffs/.test(h)) return 'table';",
  "  if (/guides/.test(h)) return 'guide';",
].join("\n");
if(!s.includes(bad)){ console.error("pattern not found — inspect manually"); process.exit(1); }
fs.writeFileSync(p, s.replace(bad, good), "utf8");
console.log("regexes repaired");

// scripts/og-images.mjs — generate per-page Open Graph cards (1200×630) for social shares.
//
// WhatsApp/Twitter/Facebook previews of a guide currently all show one generic card.
// This renders a branded card with the page's own title per guide, so a shared link
// looks like a real article. Run: `npm run og`. NOT part of `npm run seo` (headless
// renders are slow); generate-seo.js references /og/<key>.jpg only when it exists
// (existsSync fallback), so a missing card degrades to the default — never a 404.
//
// Incremental: a manifest hashes each card's inputs + TEMPLATE_VERSION, so re-runs only
// re-render cards whose title (or the template) changed.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GUIDES } from '../guides-content.js';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OG_DIR = path.join(ROOT, 'og');
const TMP = path.join(ROOT, 'og', '_tmp.html');
const MANIFEST = path.join(OG_DIR, '.manifest.json');
const TEMPLATE_VERSION = 1;
const CHROME = process.env.CHROME_PATH ||
  'C:/Program Files/Google/Chrome/Application/chrome.exe';

fs.mkdirSync(OG_DIR, { recursive: true });
const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};

const esc = (s) => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function cardHtml({ title, meta }) {
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@500;600;700&family=Sora:wght@800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{font-family:'Inter',sans-serif;color:#fff;position:relative;padding:70px 72px;
    display:flex;flex-direction:column;
    background:radial-gradient(820px 620px at 88% -12%,rgba(59,130,246,.40),transparent 60%),
      radial-gradient(640px 520px at -8% 116%,rgba(37,99,235,.30),transparent 55%),
      linear-gradient(158deg,#0b1226 0%,#172554 56%,#1e3a8a 100%)}
  body::before{content:'';position:absolute;inset:0;
    background-image:linear-gradient(rgba(148,163,184,.06) 1px,transparent 1px),
      linear-gradient(90deg,rgba(148,163,184,.06) 1px,transparent 1px);
    background-size:56px 56px;pointer-events:none}
  .brand{display:flex;align-items:center;gap:14px}
  .mark{width:52px;height:52px;border-radius:14px;
    background:linear-gradient(135deg,#3b82f6,#1d4ed8);display:flex;align-items:center;
    justify-content:center;box-shadow:0 8px 24px rgba(37,99,235,.45)}
  .mark svg{width:30px;height:30px}
  .name{font-family:'Sora',sans-serif;font-weight:800;font-size:29px;letter-spacing:-.5px}
  .name span{color:#60a5fa}
  h1{font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-1.5px;
    line-height:1.1;margin-top:auto;max-width:1010px;
    font-size:${title.length > 72 ? 52 : title.length > 48 ? 60 : 68}px}
  .foot{margin-top:auto;display:flex;align-items:center;gap:14px;
    font-size:24px;color:#93c5fd;font-weight:600}
  .dot{width:6px;height:6px;border-radius:50%;background:#3b82f6}
  .url{color:#cbd5e1}
</style></head><body>
  <div class="brand">
    <div class="mark"><svg viewBox="0 0 24 24" fill="none"><path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2Z" fill="#fff"/></svg></div>
    <div class="name">The<span>Discom</span>Bill</div>
  </div>
  <h1>${esc(title)}</h1>
  <div class="foot"><span>${esc(meta)}</span><span class="dot"></span><span class="url">thediscombill.com</span></div>
</body></html>`;
}

// Build the work list: guides (English titles). Extendable to state pages later.
const jobs = GUIDES.map(g => ({
  key: `guide-${g.slug}`,
  title: g.title,
  meta: `Guide · ${g.minutes} min read`,
}));

let rendered = 0, skipped = 0;
const pngs = [];
for (const job of jobs) {
  const hash = crypto.createHash('sha1')
    .update(`${TEMPLATE_VERSION}\0${job.title}\0${job.meta}`).digest('hex').slice(0, 12);
  const jpg = path.join(OG_DIR, `${job.key}.jpg`);
  if (manifest[job.key] === hash && fs.existsSync(jpg)) { skipped++; continue; }
  fs.writeFileSync(TMP, cardHtml(job), 'utf8');
  const png = path.join(OG_DIR, `${job.key}.png`);
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--window-size=1200,630', '--default-background-color=00000000',
    `--screenshot=${png}`, '--virtual-time-budget=6000',
    'file:///' + TMP.replace(/\\/g, '/')], { stdio: 'ignore' });
  pngs.push({ png, jpg, key: job.key, hash });
  rendered++;
}

// Convert the freshly rendered PNGs to JPG (q88) in one PowerShell pass, then drop the PNGs.
if (pngs.length) {
  const ps = `Add-Type -AssemblyName System.Drawing
$codec=[System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()|?{$_.MimeType -eq 'image/jpeg'}
$ep=New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0]=New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality,[long]88)
${pngs.map(p => `$i=[System.Drawing.Image]::FromFile('${p.png.replace(/\\/g, '\\\\')}');$i.Save('${p.jpg.replace(/\\/g, '\\\\')}',$codec,$ep);$i.Dispose();Remove-Item '${p.png.replace(/\\/g, '\\\\')}'`).join('\n')}`;
  execSync(`powershell -NoProfile -Command -`, { input: ps, stdio: ['pipe', 'ignore', 'inherit'] });
  for (const p of pngs) manifest[p.key] = p.hash;
}

if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 0), 'utf8');
console.log(`OG images: ${rendered} rendered, ${skipped} unchanged. Total cards: ${jobs.length}.`);

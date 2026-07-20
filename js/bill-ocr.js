// ── Bill OCR auto-fill ────────────────────────────────────────────────────────
// Lets the user upload a photo or PDF of their electricity bill and auto-fills
// the calculator form:
//   • Digital PDFs (DISCOM portal downloads) — read the embedded text layer via
//     pdf.js right in the browser; no OCR at all, instant and exact.
//   • Scanned PDFs / photos — sent to cloud OCR (Supabase Edge Function →
//     OCR.space) after the user consents once per session; it reads noisy scans
//     far better than on-device OCR. If the user declines or the cloud is
//     unreachable/over-quota, Tesseract.js runs on-device as the fallback.
// Libraries are lazy-loaded from jsDelivr only when actually needed, so normal
// page loads carry zero extra weight.

import { getStates, getDiscoms } from './tariffs/registry.js';
import { isConfigured, getStoredUser, getSupabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const TESSERACT_SRC = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
const PDFJS_SRC     = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
const PDFJS_WORKER  = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const loadedScripts = {};
function loadScript(src) {
  if (!loadedScripts[src]) {
    loadedScripts[src] = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }
  return loadedScripts[src];
}

// ── PDF extraction ────────────────────────────────────────────────────────────

// Digital bills carry a text layer — read it and skip OCR entirely.
async function pdfTextLayer(pdf) {
  let text = '';
  const pages = Math.min(pdf.numPages, 4);
  for (let i = 1; i <= pages; i++) {
    const tc = await (await pdf.getPage(i)).getTextContent();
    text += tc.items.map((it) => it.str).join(' ') + '\n';
  }
  return text;
}

// Scanned bills are full-page JPEGs inside the PDF. Slice them out of the raw
// bytes (SOI FF D8 FF … EOI FF D9) instead of rasterizing pages.
function extractJpegs(buf) {
  const u = new Uint8Array(buf);
  const out = [];
  for (let i = 0; i < u.length - 3; i++) {
    if (u[i] === 0xff && u[i + 1] === 0xd8 && u[i + 2] === 0xff) {
      for (let j = i + 2; j < u.length - 1; j++) {
        if (u[j] === 0xff && u[j + 1] === 0xd9) {
          if (j + 2 - i > 50000) out.push(new Blob([u.slice(i, j + 2)], { type: 'image/jpeg' }));
          i = j + 1;
          break;
        }
      }
    }
  }
  // biggest images first — those are the page scans, not logos
  return out.sort((a, b) => b.size - a.size).slice(0, 2);
}

async function extractFromPdf(file, setStatus) {
  setStatus('Opening PDF…');
  await loadScript(PDFJS_SRC);
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  const data = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: data.slice(0) }).promise;

  const text = await pdfTextLayer(pdf);
  if (text.replace(/\s/g, '').length > 150) return { text };

  const jpegs = extractJpegs(data);
  if (jpegs.length) return { images: jpegs };

  // Last resort: rasterize page 1. Some e-bills (UPPCL portal PDFs) carry
  // pathological vector content that pdf.js renders forever — cap it hard and
  // steer the user to a screenshot instead of hanging.
  setStatus('Converting PDF page — can take up to half a minute…');
  const page = await pdf.getPage(1);
  const vp1 = page.getViewport({ scale: 1 });
  const scale = Math.min(2200 / Math.max(vp1.width, vp1.height), 3);
  const vp = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = vp.width;
  canvas.height = vp.height;
  const task = page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
  const timeout = new Promise((_, rej) => setTimeout(() => {
    task.cancel();
    rej(new Error('this PDF is too complex to read in the browser — take a screenshot or photo of the bill and upload that image instead'));
  }, 30000));
  await Promise.race([task.promise, timeout]);
  return { images: [canvas] };
}

// ── Image preprocessing ───────────────────────────────────────────────────────
// Small phone photos OCR badly; upscale to ~2000px on the long edge.

async function prepareImage(fileOrBlob) {
  try {
    const bmp = await createImageBitmap(fileOrBlob);
    const long = Math.max(bmp.width, bmp.height);
    if (long >= 1400 || long === 0) { bmp.close?.(); return fileOrBlob; }
    const scale = Math.min(2000 / long, 3);
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = true;
    x.imageSmoothingQuality = 'high';
    x.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close?.();
    return c;
  } catch (e) {
    return fileOrBlob; // unsupported format for bitmap — let Tesseract try raw
  }
}

async function ocrImages(sources, setStatus, setProgress) {
  await loadScript(TESSERACT_SRC);
  const worker = await window.Tesseract.createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') setProgress(m.progress);
    },
  });
  try {
    let text = '';
    for (let i = 0; i < sources.length; i++) {
      setStatus(sources.length > 1 ? `Reading page ${i + 1}/${sources.length}…` : 'Reading your bill…');
      setProgress(0);
      const prepared = await prepareImage(sources[i]);
      const { data } = await worker.recognize(prepared);
      text += '\n' + data.text;
    }
    return text;
  } finally {
    await worker.terminate();
  }
}

// ── Parsing ───────────────────────────────────────────────────────────────────
// OCR output from bill photos is noisy; every pattern tolerates junk between the
// label and the value and accepts the label wording used by UPPCL/MVVNL and most
// other Indian DISCOMs (English + common Hindi labels from digital text layers).

const num = (s) => parseFloat(String(s).replace(/,/g, ''));

// OCR loves turning 0→O/o and 1→l/I inside numbers. Fix digits that sit next to
// other digits so words like "Old" are untouched.
function fixDigitConfusions(text) {
  let prev;
  do {
    prev = text;
    text = text
      .replace(/(\d)[Oo](?=\d|\b)/g, '$10')
      .replace(/(?<=\d)[lI](?=\d)/g, '1')
      .replace(/\b[Oo](?=\d)/g, '0');
  } while (text !== prev);
  return text;
}

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };

// ── DISCOM detection ──────────────────────────────────────────────────────────
// The utility's name is printed at the top of every bill; matching it against
// the tariff registry gives us DISCOM + state in one shot. Generic words that
// appear in almost every utility name carry no signal — only the distinctive
// ones (Madhyanchal, Torrent, BESCOM…) count.
const DISCOM_STOPWORDS = new Set([
  'vidyut', 'vitaran', 'vitran', 'nigam', 'limited', 'ltd', 'power', 'distribution',
  'company', 'corporation', 'corp', 'electricity', 'electrical', 'electricals',
  'energy', 'board', 'state', 'city', 'supply', 'undertaking', 'department',
  'operations', 'services', 'utility', 'zone', 'region', 'area', 'discom',
]);

function detectDiscom(rawText) {
  const text = ' ' + rawText.toLowerCase().replace(/[^a-z0-9]+/g, ' ') + ' ';
  let best = null;
  for (const state of getStates()) {
    for (const d of getDiscoms(state)) {
      let score = 0;
      // Acronym token, e.g. "MVVNL" / "BESCOM" printed on the bill
      const acro = d.name.toLowerCase();
      if (/^[a-z]{3,10}$/.test(acro) && text.includes(' ' + acro + ' ')) score += 3;
      // All distinctive words of the full name present (spelling variants of the
      // generic words — Vitaran/Vitran — are in the stoplist, so they can't hurt)
      const words = d.fullName.toLowerCase().replace(/[^a-z]+/g, ' ').split(' ')
        .filter((w) => w.length >= 4 && !DISCOM_STOPWORDS.has(w));
      if (words.length && words.every((w) => text.includes(w))) score += 2 + words.length;
      if (!best || score > best.score) best = { state, id: d.id, name: d.name, score };
    }
  }
  return best && best.score >= 2 ? { state: best.state, id: best.id, name: best.name } : null;
}

// UPPCL e-bills print the amount summary as boxes: one line of labels, the
// next line the values in the same column order —
//   "Previous Dues   Current Bill Amount   Payable Amount"
//   "188.30          -15.89                172.00"
// A flat regex would pair "Payable Amount" with 188.30 (the first number on the
// next line), so match labels and numbers per-line and zip them by position.
const BOX_LABELS = [
  ['prevDues', /previous\s*dues/i],
  ['rebate', /due\s*date\s*rebate/i],
  ['payableByDue', /payable\s*by\s*due\s*date/i],
  ['minPayable', /minimum\s*payable/i],
  ['currentBill', /current\s*bill\s*amount/i],
  // Tata Power-DDL's "Your Electricity Bill Summary" strip uses its own wording
  ['arrearsBox', /arrears?\s*\/?\s*refund/i],
  ['adjustments', /adjustments?/i],
  ['currentDemandBox', /current\s*demand/i],
  ['subsidy', /subsidy/i],
  ['lpscBox', /\bLPSC\b/i],
  ['payable', /(?<!minimum\s)(?:net\s*amount\s*)?payable(?:\s*amount)?/i],
];

// Zip a row of labels to the row of numbers underneath it.
//
// Numbers are matched to labels by horizontal position, not by index: a summary
// strip routinely leaves cells blank (Tata Power-DDL prints nothing under
// "Adjustments" and "LPSC"), and index-zipping then shifts every value one
// column left — which is how an ₹8.51 arrears figure ended up being shown as the
// amount payable. Requires the caller to pass text with its spacing intact.
const COL_TOLERANCE = 30; // chars; a value may sit this far from its label's centre

function zipColumns(labelLine, valueLine) {
  const found = [];
  for (const [key, re] of BOX_LABELS) {
    const m = labelLine.match(re);
    if (!m) continue;
    // "Payable Amount" also matches inside "Minimum Payable Amount" — keep the
    // more specific label when both land on the same spot.
    if (key === 'payable' && found.some(f => f.key === 'minPayable' && Math.abs(f.pos - m.index) < 12)) continue;
    found.push({ key, pos: m.index + m[0].length / 2 });
  }
  if (found.length < 2) return [];

  const nums = [...valueLine.matchAll(/-?\d[\d,]*(?:\.\d+)?/g)]
    .map((m) => ({ v: num(m[0]), pos: m.index + m[0].length / 2 }));
  if (!nums.length || nums.length > found.length) return [];

  // Exact fill (no blank cells) — order alone is unambiguous, so trust it.
  if (nums.length === found.length) {
    const byPos = found.slice().sort((a, b) => a.pos - b.pos);
    return byPos.map((f, k) => [f.key, nums[k].v]);
  }

  // Blanks present — pair off closest label/value first so a gap can't cascade.
  const pairs = [];
  for (const n of nums) {
    for (const f of found) pairs.push({ key: f.key, v: n.v, d: Math.abs(f.pos - n.pos), n });
  }
  pairs.sort((a, b) => a.d - b.d);
  const usedKey = new Set(), usedNum = new Set(), out = [];
  for (const p of pairs) {
    if (p.d > COL_TOLERANCE || usedKey.has(p.key) || usedNum.has(p.n)) continue;
    usedKey.add(p.key); usedNum.add(p.n);
    out.push([p.key, p.v]);
  }
  return out;
}

function columnarAmounts(text) {
  const out = {};
  const lines = text.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    for (const [key, v] of zipColumns(lines[i], lines[i + 1])) {
      if (out[key] === undefined) out[key] = v;
    }
  }
  return out;
}

function parseBillText(raw) {
  // Two views of the same bill: `text` has runs of whitespace collapsed (what the
  // label regexes want), `spaced` keeps them so the summary-box columns can still
  // be lined up by horizontal position.
  const spaced = fixDigitConfusions(raw.replace(/[|]/g, ' '));
  const text = spaced.replace(/[ \t]+/g, ' ');
  const f = {};
  const grab = (re, idx = 1) => {
    const m = text.match(re);
    return m ? m[idx] : null;
  };
  // Try several patterns, first hit wins.
  const grabAny = (res, idx = 1) => {
    for (const re of res) {
      const v = grab(re, idx);
      if (v != null) return v;
    }
    return null;
  };

  const NUM = '(\\d[\\d,]{0,8}(?:\\.\\d+)?)';
  const GAP = '[^0-9\\-]{0,20}';

  // MSEDCL prints ".5 KW" (leading decimal point, no zero) and abbreviates the
  // labels to "Sanct. Load" / "Conn. Load". The gap must exclude "." too, or it
  // greedily swallows the leading decimal point and captures ".5" as 5.
  const LNUM = `(\\.\\d+|${NUM.slice(1, -1)})`;
  const LGAP = '[^0-9.\\-]{0,20}';
  const load = grabAny([
    new RegExp(`(?:sanct(?:ion(?:ed)?)?|conn(?:ect(?:ed)?)?|contract(?:ed)?)\\s*\\.?\\s*(?:load|demand)\\s*(?:\\(?\\s*(?:in\\s*)?k[vw]a?\\s*\\)?)?${LGAP}${LNUM}`, 'i'),
    new RegExp(`(?:load|भार)\\s*\\(?\\s*k[vw]a?\\s*\\)?${LGAP}${LNUM}`, 'i'),
    // Value-anchored: "Load" label with the number and KW unit nearby ("Load .5 KW")
    new RegExp(`load[^0-9.]{0,20}${LNUM}\\s*k\\s*[vw]a?\\b`, 'i'),
    new RegExp(`स्वीकृत\\s*भार${LGAP}${LNUM}`, 'i'),
  ]);
  if (load && num(load) > 0 && num(load) < 5000) f.sanctionedLoad = num(load);

  const units = grabAny([
    // BSES prints units only inside the billing table, summed on a "TOTAL ->"
    // row with no "units" label nearby — anchor on the TOTAL marker itself.
    new RegExp(`\\bTOTAL\\s*[-–—=>\\]]{1,4}\\s*${NUM}\\b`, 'i'),
    // KWH-anchored first: UPPCL prints "Net Billed Unit ⁷ : 993.00 KWH" and OCR
    // sometimes eats the colon or wraps the line — the number right before KWH
    // is the value, never the footnote superscript.
    new RegExp(`(?:(?:net|total|chargeable|billed|billable|consumed|adjusted)\\s+){1,3}units?[\\s\\S]{0,15}?${NUM}\\s*k\\s*[vw]\\s*a?h`, 'i'),
    // Colon-anchored next so footnote digits can't be mistaken for the value
    // (gap may span a line break when OCR wraps before the colon):
    new RegExp(`(?:(?:net|total|chargeable|billed|billable|consumed|adjusted)\\s+){1,3}units?[^:]{0,12}[:\\-]\\s*${NUM}`, 'i'),
    // allow stacked qualifiers, e.g. "Net Billed Units 54"
    new RegExp(`(?:(?:net|total|chargeable|billed|billable|consumed|adjusted)\\s+){1,3}units?\\s*(?:consum(?:ed|ption))?\\s*(?:\\(?\\s*k[vw]ah?\\s*\\)?)?${GAP}${NUM}`, 'i'),
    new RegExp(`units?\\s*(?:consum(?:ed|ption)|billed|charged)${GAP}${NUM}`, 'i'),
    new RegExp(`(?:energy|k[vw]ah?)\\s*consum(?:ed|ption)${GAP}${NUM}`, 'i'),
    new RegExp(`consumption\\s*(?:\\(?\\s*units?\\s*\\)?)?${GAP}${NUM}`, 'i'),
    new RegExp(`(?:कुल|खपत)\\s*यूनिट${GAP}${NUM}`, 'i'),
  ]);
  if (units && num(units) > 0 && num(units) < 1000000) f.units = num(units);

  const prevRead = grab(new RegExp(`(?:previous|prev|old|opening|last)\\s*(?:meter\\s*)?read(?:ing)?s?\\s*(?:\\(?\\s*k[vw]ah?\\s*\\)?)?${GAP}${NUM}`, 'i'));
  const currRead = grab(new RegExp(`(?:current|curr|present|new|closing)\\s*(?:meter\\s*)?read(?:ing)?s?\\s*(?:\\(?\\s*k[vw]ah?\\s*\\)?)?${GAP}${NUM}`, 'i'));
  if (prevRead !== null && currRead !== null && num(currRead) >= num(prevRead)) {
    f.prevRead = num(prevRead);
    f.currRead = num(currRead);
  }

  // Meter tables with no "Previous/Current Reading" labels on the value row (Tata
  // Power-DDL prints date+reading pairs side by side under a spanning header).
  // Two "date then number" pairs on one line are that table; the later date is the
  // current read, so the column order on the bill does not matter.
  if (f.prevRead === undefined) {
    for (const line of text.split('\n')) {
      const pairs = [...line.matchAll(/(\d{1,2}[-\/.]\d{1,2}[-\/.]\d{2,4})\s+(\d[\d,]*(?:\.\d+)?)/g)]
        .map((m) => ({ d: normDate(m[1]), v: num(m[2]) }))
        .filter((p) => p.d);
      if (pairs.length !== 2) continue;
      const [older, newer] = pairs.slice().sort((a, b) => a.d.iso < b.d.iso ? -1 : 1);
      const days = (Date.parse(newer.d.iso) - Date.parse(older.d.iso)) / 86400000;
      // A real billing cycle, and a meter that ran forward by a believable amount.
      if (days < 20 || days > 70) continue;
      if (!(newer.v >= older.v) || newer.v - older.v > 100000) continue;
      f.prevRead = older.v;
      f.currRead = newer.v;
      if (!f.fromDate) { f.fromDate = older.d; f.toDate = newer.d; }
      break;
    }
  }

  const mf = grab(new RegExp(`(?:multiply(?:ing)?\\s*factor|\\bMF\\b)${GAP}(\\d+(?:\\.\\d+)?)`, 'i'));
  if (mf && num(mf) >= 1 && num(mf) <= 5000) f.mf = num(mf);

  const md = grabAny([
    // UPPCL: "Billed Demand (Load)¹ : 0.78 KW" — swallow the "(Load)" and the
    // footnote digit so the superscript isn't mistaken for the value
    new RegExp(`(?:max(?:imum)?|recorded|billed)\\s*demand\\s*(?:\\(\\s*load\\s*\\))?\\s*\\d?\\s*[:\\-]\\s*${NUM}`, 'i'),
    new RegExp(`(?:max(?:imum)?|recorded|billed)\\s*demand\\s*(?:\\(?\\s*k[vw]a?\\s*\\)?)?${GAP}${NUM}`, 'i'),
    // BSES prints "MDI : .00" — leading-decimal value, gap must not eat the dot
    new RegExp(`\\bMDI?\\b\\s*(?:\\(?\\s*k[vw]a?\\s*\\)?)?${LGAP}${LNUM}`),
  ]);
  if (md && num(md) > 0 && num(md) < 10000) {
    let mdVal = num(md);
    // The red footnote ¹ (and sometimes the colon) after "Billed Demand (Load)"
    // fuses into the value — "¹ : 0.78" comes out as "10.78" or "20.78". An MD
    // far above sanctioned load means glued junk digits: peel them off the
    // front; if it never becomes plausible, leave the field for the user.
    if (f.sanctionedLoad) {
      while (mdVal >= 10 && mdVal > f.sanctionedLoad * 3) {
        mdVal = num(String(mdVal).replace(/^\d/, ''));
      }
      if (!(mdVal > 0) || mdVal > f.sanctionedLoad * 3) mdVal = 0;
    }
    if (mdVal > 0) f.maxDemand = mdVal;
  }

  const amount = grabAny([
    // "Bill Amount Payable / Rs. 230.00" (BSES) — the currency marker is required
    // so a garbled duplicate of the label elsewhere on the page can't win.
    new RegExp(`bill\\s*amount\\s*payable\\s*:?[^0-9]{0,12}(?:rs\\.?|₹|inr)\\s*\\.?\\s*${NUM}`, 'i'),
    new RegExp(`(?:net|total|current)?\\s*(?:amount|bill)?\\s*payable\\s*(?:amount)?\\s*(?:by|before)?\\s*(?:due\\s*date)?${GAP}(?:rs\\.?|₹|inr)?\\s*${NUM}`, 'i'),
    new RegExp(`(?:net|total|bill)\\s*amount\\s*(?:due)?${GAP}(?:rs\\.?|₹|inr)?\\s*${NUM}`, 'i'),
    new RegExp(`amount\\s*(?:before|by)\\s*due\\s*date${GAP}(?:rs\\.?|₹|inr)?\\s*${NUM}`, 'i'),
    new RegExp(`देय\\s*(?:धन)?राशि${GAP}(?:rs\\.?|₹)?\\s*${NUM}`, 'i'),
    // MSEDCL prints the amount table column-scrambled, but the DPC box carries
    // "Pay Rs. 1830" with real adjacency — currency marker required.
    new RegExp(`\\bpay\\s*(?:rs\\.?|₹)\\s*\\.?\\s*${NUM}`, 'i'),
  ]);
  if (amount && num(amount) > 0) f.billAmount = Math.round(num(amount) * 100) / 100;

  // Column-aware summary boxes override the flat matches — they know which
  // number belongs to which label.
  const box = columnarAmounts(spaced);
  if (box.payable > 0) f.billAmount = box.payable;
  else if (box.payableByDue > 0) f.billAmount = box.payableByDue;
  // Which fields the box settled — the flat fallbacks below must not overwrite these.
  const boxSaw = new Set();
  if (box.prevDues > 0) { f.arrears = box.prevDues; boxSaw.add('arrears'); }
  else if (box.arrearsBox > 0) { f.arrears = box.arrearsBox; boxSaw.add('arrears'); }
  // The box knows which column LPSC actually sits in; a flat match on the label
  // row would pick up whichever number happens to come first underneath it. A
  // blank LPSC cell is an answer too — it means there is no late-payment charge.
  if (box.lpscBox !== undefined) {
    boxSaw.add('lpsc');
    if (box.lpscBox > 0) f.lpsc = box.lpscBox;
  } else if (box.arrearsBox !== undefined) {
    boxSaw.add('lpsc');
  }
  // Subsidy prints as a negative (a deduction). Carry it as a positive amount —
  // the review screen and the calculator both treat it as a rebate.
  if (box.subsidy !== undefined && box.subsidy !== 0) f.subsidy = Math.abs(box.subsidy);

  // UPPCL prints the account number hyphen-grouped ("1538-298-215")
  const acct = grabAny([
    /\b(?:account|consumer|a\/?c|ca|connection)\s*(?:no|number|id)\s*\.?\s*[:\-]?\s*(\d[\d\- ]{7,15}\d)/i,
    /(?:खाता|उपभोक्ता)\s*(?:सं(?:ख्या)?|क्रमांक)\.?\s*[:\-]?\s*(\d[\d\- ]{7,15}\d)/i,
  ]);
  if (acct) {
    const digits = acct.replace(/\D/g, '');
    if (digits.length >= 8 && digits.length <= 14) f.accountNo = acct.replace(/ /g, '').trim();
  }

  // Prefer a match where the label's colon survived OCR; when it didn't, the
  // bold ":" was usually misread as a "1" fused onto the number ("Meter
  // Number : 3265063" → "13265063") — strip that leading 1.
  let meterNo = grab(/meter\s*(?:no|number|संख्या)\s*\.?\s*[:\-]\s*([A-Z]{0,3}\d{5,12})\b/i);
  if (!meterNo) {
    meterNo = grab(/meter\s*(?:no|number|संख्या)\s*\.?\s*([A-Z]{0,3}\d{5,12})\b/i);
    if (meterNo && /^1\d{6,}$/.test(meterNo)) meterNo = meterNo.slice(1);
  }
  if (meterNo) f.meterNo = meterNo;

  // Flat label matches, used only where the summary box did not already answer —
  // the box is column-aware and always the better source when it fired.
  if (!boxSaw.has('arrears')) {
    const prevDues = grab(new RegExp(`(?:previous|past)\\s*(?:dues|balance|outstanding|arrears?)${GAP}${NUM}`, 'i'))
      || grab(new RegExp(`arrears?\\s*(?:amount)?${GAP}${NUM}`, 'i'));
    if (prevDues && num(prevDues) > 0) f.arrears = num(prevDues);
  }

  if (!boxSaw.has('lpsc')) {
    const lpsc = grab(new RegExp(`(?:lpsc|late\\s*payment\\s*surcharge|surcharge\\s*on\\s*arrears?|विलंब\\s*भुगतान\\s*अधिभार)${GAP}${NUM}`, 'i'));
    if (lpsc && num(lpsc) > 0) f.lpsc = num(lpsc);
  }

  // Name capture stays on one line ([ \t] separators only) so it can't swallow
  // the next label on the bill.
  const name = grab(/\bname\s*(?:of\s*consumer|of\s*the\s*consumer)?\s*[:\-][ \t]*((?:M\/S[ \t]+)?[A-Za-z.]+(?:[ \t]+[A-Za-z.]+){0,4})/i);
  if (name && !/^(and|address|the)\b/i.test(name)) f.consumerName = name.trim();

  // Tariff / category code, e.g. LMV-1, LMV1, ST-17, HV-2 (UPPCL uses LMV/HV; some
  // DISCOMs print ST/LT/HT codes)
  // Anchor on the "Category" label first — a global scan otherwise skips "LMVI"
  // (OCR reads the "1" in LMV1 as the letter I/l) and wrongly latches onto an
  // "ST <digit>" printed elsewhere on the bill. The digit group accepts I/l/O so
  // an OCR'd "LMVI" / "LMVl" resolves to LMV-1.
  const catDigit = (s) => s.replace(/[Il]/g, '1').replace(/O/g, '0').toUpperCase();
  const catM = text.match(/category[^A-Za-z0-9\n]{0,6}(LMV|HV|ST|LT|HT)\s*[-–]?\s*([0-9IlO]{1,2}[A-Za-z]?)/i)
            || text.match(/\b(LMV|HV|ST|LT|HT)\s*[-–]?\s*(\d{1,2}[A-Za-z]?)\b/i);
  if (catM) f.category = `${catM[1].toUpperCase()}-${catDigit(catM[2])}`;
  else {
    // BSES/MSEDCL print a word category ("Tariff Category : Domestic
    // [Residential]", "Category / LT Res 1-Phase") instead of a code — capture
    // up to 4 words and match against the category select's option text; when
    // no option matches, applyFields shows it to the user as a note.
    const catW = text.match(/(?:tariff\s*)?\bcategory\b[^A-Za-z0-9]{0,6}([A-Za-z]+(?:[^\S\n]+[A-Za-z]+){0,3})/i);
    if (catW) f.category = catW[1].replace(/\s+/g, ' ').trim().toUpperCase();
  }

  // "Supply Type : 17" (UPPCL prints the ST schedule number here). The bold ":" is
  // often misread as a "0"/"1" fused onto the number ("Supply Type : 17" → "017" or
  // "117"). UPPCL ST schedule codes are 1–2 digits, so a 3-digit code starting with
  // 0/1 is that fused colon — strip the leading digit.
  const st = grab(/supply\s*type[^A-Za-z0-9\n]{0,8}([A-Z]{0,3}[- ]?\d{1,3}[A-Za-z]?)\b/i);
  if (st) {
    let stv = st.trim();
    const d = stv.replace(/[^0-9]/g, '');
    if (/^[01]\d{2}$/.test(d)) stv = d.slice(1);
    f.supplyType = stv;
  }

  const discom = detectDiscom(raw);
  if (discom) f.discom = discom;

  // Billing period: numeric (14-05-2026) or month-name (25-JAN-2026, UPPCL e-bills),
  // after "Bill Duration / Period / from … to …"
  const D = '(\\d{1,2}[-\\/. ](?:\\d{1,2}|[A-Za-z]{3,9})[-\\/. ]\\d{2,4})';
  const period = text.match(new RegExp(`(?:duration|period|from)[^0-9]{0,20}${D}\\s*(?:to|[-–])\\s*${D}`, 'i'))
    || text.match(new RegExp(`${D}\\s*(?:to|[-–])\\s*${D}`, 'i'));
  if (period) {
    f.fromDate = normDate(period[1]);
    f.toDate = normDate(period[2]);
    if (!f.fromDate || !f.toDate) { delete f.fromDate; delete f.toDate; }
  }
  if (!f.fromDate) {
    const pd = grab(new RegExp(`(?:previous|last)\\s*(?:meter\\s*)?read(?:ing)?\\s*date[^0-9]{0,20}${D}`, 'i'));
    const cd = grab(new RegExp(`(?:current|present)\\s*(?:meter\\s*)?read(?:ing)?\\s*date[^0-9]{0,20}${D}`, 'i'));
    if (pd && cd) { f.fromDate = normDate(pd); f.toDate = normDate(cd); }
  }

  // Bill month, e.g. "Bill Month : MAY-2026". Scan every "bill …" hit so that
  // "Bill Duration"/"Bill Date" earlier on the page can't shadow it.
  for (const bm of text.matchAll(/bill(?:ing)?\s*month[^A-Za-z0-9\n]{0,8}([A-Za-z]{3,9})[-\s\/]*(\d{4}|\d{2})\b/gi)) {
    const mo = MONTHS[bm[1].slice(0, 3).toLowerCase()];
    if (mo) {
      f.billMonth = mo;
      f.billYear = bm[2].length === 2 ? 2000 + +bm[2] : +bm[2];
      break;
    }
  }
  // No labelled bill month (MSEDCL prints "Bill For:" and "DEC - 16" in separate
  // table cells) — fall back to the first standalone MON-YY token. The lookbehind
  // rejects month names inside dates like "18-JAN-17".
  if (!f.billMonth) {
    const sm = text.match(/(?<![\dA-Za-z][-\/])\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*[-\/ ]\s*(\d{4}|\d{2})\b/i);
    if (sm) {
      f.billMonth = MONTHS[sm[1].toLowerCase()];
      f.billYear = sm[2].length === 2 ? 2000 + +sm[2] : +sm[2];
    }
  }

  return f;
}

function normDate(s) {
  const m = String(s).match(/(\d{1,2})[-\/. ](\d{1,2}|[A-Za-z]{3,9})[-\/. ](\d{2,4})/);
  if (!m) return null;
  let [, d, mo, y] = m;
  if (/[A-Za-z]/.test(mo)) {
    mo = MONTHS[mo.slice(0, 3).toLowerCase()];
    if (!mo) return null;
    mo = String(mo);
  }
  if (y.length === 2) y = (+y > 50 ? '19' : '20') + y;
  if (+mo > 12 || +mo < 1 || +d > 31 || +d < 1) return null;
  return { display: `${d.padStart(2, '0')}-${mo.padStart(2, '0')}-${y}`, iso: `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}` };
}

// ── Form filling ──────────────────────────────────────────────────────────────

const fire = (el, type = 'input') => el && el.dispatchEvent(new Event(type, { bubbles: true }));

// Lenis owns page scrolling (native scrollIntoView is a no-op under it); if its
// animation loop is throttled (background tab), snap instead so the user is
// never left staring at the wrong part of the page.
function smoothTo(el, offset = -90) {
  if (!el) return;
  if (window.__lenis) {
    const y0 = window.scrollY;
    window.__lenis.scrollTo(el, { offset });
    setTimeout(() => {
      if (Math.abs(window.scrollY - y0) < 4) window.__lenis.scrollTo(el, { offset, immediate: true });
    }, 600);
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function setValue(id, v) {
  const el = document.getElementById(id);
  if (!el || v == null) return false;
  el.value = v;
  fire(el); fire(el, 'change');
  return true;
}

function setDateField(id, d) {
  const el = document.getElementById(id);
  if (!el || !d) return false;
  el.dataset.iso = d.iso;          // datepicker reads dataset.iso as the canonical value
  el.value = d.display;
  fire(el); fire(el, 'change');
  return true;
}

function applyFields(f) {
  const applied = [];
  const row = document.querySelector('#advancedRows .meter-row');

  // State + DISCOM first: their change events cascade the Category and Supply
  // Type selects, which the category/supply-type steps below depend on.
  if (f.discom) {
    const sSel = document.getElementById('stateSelect');
    const dSel = document.getElementById('discomSelect');
    if (sSel && [...sSel.options].some((o) => o.value === f.discom.state)) {
      sSel.value = f.discom.state;
      fire(sSel, 'change');
      if (dSel && [...dSel.options].some((o) => o.value === f.discom.id)) {
        dSel.value = f.discom.id;
        fire(dSel, 'change');
        applied.push(['DISCOM', `${f.discom.name} (${f.discom.state})`]);
      }
    }
  }

  if (f.units != null) {
    // Direct-units mode on the first meter row — works in both Simple and
    // Detailed, and beats prev/curr reads because it needs no multiplying factor.
    const chk = row?.querySelector('.m-override-chk');
    if (chk && !chk.checked) { chk.checked = true; fire(chk, 'change'); }
    const unitsEl = row?.querySelector('.m-units');
    if (unitsEl) {
      unitsEl.value = f.units;
      fire(unitsEl); fire(unitsEl, 'change');
      applied.push(['Units consumed', f.units]);
    }
  } else if (f.prevRead != null && f.currRead != null) {
    const chk = row?.querySelector('.m-override-chk');
    if (chk && chk.checked) { chk.checked = false; fire(chk, 'change'); }
    const prev = row?.querySelector('.m-prevread');
    const curr = row?.querySelector('.m-currread');
    if (prev && curr) {
      prev.value = f.prevRead; fire(prev);
      curr.value = f.currRead; fire(curr); fire(curr, 'change');
      applied.push(['Meter readings', `${f.prevRead} → ${f.currRead}`]);
      if (f.mf != null && f.mf !== 1) {
        const mfEl = row?.querySelector('.m-mf');
        if (mfEl) { mfEl.value = f.mf; fire(mfEl); fire(mfEl, 'change'); applied.push(['Multiplying factor', f.mf]); }
      }
    }
  }

  if (f.meterNo) {
    const mEl = row?.querySelector('.m-label');
    if (mEl) { mEl.value = f.meterNo; fire(mEl); applied.push(['Meter no.', f.meterNo]); }
  }
  if (f.arrears != null && setValue('arrears', f.arrears)) applied.push(['Previous dues (arrears)', '₹' + f.arrears]);
  if (f.lpsc != null && setValue('arrearLpsc', f.lpsc)) applied.push(['LPSC on arrears', '₹' + f.lpsc]);
  if (f.sanctionedLoad != null && setValue('connectedLoad', f.sanctionedLoad)) applied.push(['Sanctioned load', f.sanctionedLoad + ' kW']);
  if (f.maxDemand != null && setValue('billedDemand', f.maxDemand)) applied.push(['Maximum demand', f.maxDemand]);
  if (f.consumerName && setValue('consumerName', f.consumerName)) applied.push(['Name', f.consumerName]);
  if (f.accountNo && setValue('accountNo', f.accountNo)) applied.push(['Account no.', f.accountNo]);
  if (f.billAmount != null && setValue('billedAmount', f.billAmount)) applied.push(['Billed amount', '₹' + f.billAmount]);
  // Fill both the global period fields (Simple/TOD) and the meter row's own
  // Start/End dates — in Meter Reading mode only the row dates are visible and
  // they are what drives the billing-period proration.
  const setRowDate = (cls, d) => {
    const el = row?.querySelector(cls);
    if (!el || !d) return;
    el.dataset.iso = d.iso;
    el.value = d.display;
    fire(el); fire(el, 'change');
  };
  if (f.fromDate && setDateField('fromDate', f.fromDate)) {
    setRowDate('.m-prevdate', f.fromDate);
    applied.push(['From', f.fromDate.display]);
  }
  if (f.toDate && setDateField('toDate', f.toDate)) {
    setRowDate('.m-currdate', f.toDate);
    applied.push(['To', f.toDate.display]);
  }

  if (f.billMonth && f.billYear) {
    const my = document.getElementById('billingMonthYear');
    if (my) {
      my.dataset.m = f.billMonth;
      my.dataset.y = f.billYear;
      my.value = new Date(f.billYear, f.billMonth - 1, 1).toLocaleString('en', { month: 'short' }) + ' ' + f.billYear;
      fire(my, 'change'); // syncBillingMonthYear copies dataset.m/.y into the hidden fields
      applied.push(['Bill month', my.value]);
    }
  }

  let categoryNote = null;
  if (f.category) {
    const sel = document.getElementById('categorySelect');
    const opt = sel && !sel.disabled
      ? [...sel.options].find((o) => (o.textContent + ' ' + o.value).toUpperCase().includes(f.category))
      : null;
    if (opt) {
      sel.value = opt.value;
      fire(sel, 'change');
      applied.push(['Category', f.category]);
    } else {
      categoryNote = `Detected tariff category ${f.category} — pick your State & DISCOM above, then choose it in the Category list.`;
    }
  }

  // Supply type — the category change above just repopulated this select
  if (f.supplyType) {
    const stSel = document.getElementById('supplyTypeSelect');
    const stNum = f.supplyType.replace(/[^0-9]/g, '');
    if (stSel && stNum) {
      const re = new RegExp(`\\bST\\s*[-–]?\\s*${stNum}\\b`, 'i');
      const opt = [...stSel.options].find((o) => re.test(o.value + ' ' + o.textContent));
      if (opt) {
        stSel.value = opt.value;
        fire(stSel, 'change');
        applied.push(['Supply type', 'ST-' + stNum]);
      }
    }
  }

  return { applied, categoryNote };
}

// ── UI ────────────────────────────────────────────────────────────────────────

function initBillOcr() {
  const box = document.getElementById('ocrUpload');
  const fileInput = document.getElementById('ocrFile');
  const btn = document.getElementById('ocrBtn'); // optional — entry is the gated chooser
  if (!box || !fileInput) return;

  const progressWrap = document.getElementById('ocrProgress');
  const progressBar = document.getElementById('ocrProgressBar');
  const statusEl = document.getElementById('ocrStatus');
  const resultEl = document.getElementById('ocrResult');

  const setStatus = (t) => { statusEl.textContent = t; };
  const setProgress = (p) => { progressBar.style.width = Math.round(p * 100) + '%'; };

  btn?.addEventListener('click', () => fileInput.click());

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ── Cloud OCR (Supabase Edge Function → OCR.space) — the primary engine ──────
  // Privacy contract: NOTHING is uploaded until the user confirms the consent
  // notice (once per session). The Edge Function passes the image through
  // transiently (no storage); the provider key never reaches the client.
  const CLOUD_MAX_BYTES = 1024 * 1024; // OCR.space free-tier file cap
  const CONSENT_KEY = 'ocrCloudConsent';

  const fileToDataUrl = (blob) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => reject(new Error('Could not read the file'));
    r.readAsDataURL(blob);
  });

  // Images over the cap are downscaled to a JPEG that fits; PDFs can't be shrunk
  // here. Accepts a File, an extracted-JPEG Blob (no .name), or a rasterized canvas.
  async function cloudPayload(source) {
    if (source instanceof HTMLCanvasElement) {
      const dataUrl = source.toDataURL('image/jpeg', 0.85);
      if (dataUrl.length > CLOUD_MAX_BYTES * 1.4) throw new Error('This page is too large for cloud OCR — try a screenshot of the bill.');
      return { image: dataUrl, filetype: 'JPG' };
    }
    const isPdf = source.type === 'application/pdf' || /\.pdf$/i.test(source.name || '');
    if (source.size <= CLOUD_MAX_BYTES) {
      return { image: await fileToDataUrl(source), filetype: isPdf ? 'PDF' : undefined };
    }
    if (isPdf) throw new Error('This PDF is over the 1 MB cloud limit — upload a screenshot of the bill instead.');
    const bmp = await createImageBitmap(source);
    for (const maxDim of [2000, 1600, 1200]) {
      const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
      const c = document.createElement('canvas');
      c.width = Math.round(bmp.width * scale);
      c.height = Math.round(bmp.height * scale);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      const dataUrl = c.toDataURL('image/jpeg', 0.85);
      if (dataUrl.length <= CLOUD_MAX_BYTES * 1.4) return { image: dataUrl, filetype: 'JPG' };
    }
    throw new Error('This photo is too large for cloud OCR even after resizing — try a screenshot.');
  }

  async function cloudOcrText(source, setStatus, setProgress) {
    setStatus('Reading your bill with cloud OCR…');
    setProgress(0.2);
    const sb = await getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    if (!session) throw new Error('Please sign in first.');
    const payload = await cloudPayload(source);
    setProgress(0.5);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Cloud OCR failed (HTTP ${res.status}).`);
    setProgress(1);
    return data.text;
  }

  // One-time (per session) consent before anything is uploaded. Resolves true
  // (scan in the cloud) or false (user chose to stay on-device).
  function askCloudConsent() {
    if (sessionStorage.getItem(CONSENT_KEY) === 'yes') return Promise.resolve(true);
    return new Promise((resolve) => {
      progressWrap.hidden = true;
      resultEl.hidden = false;
      resultEl.innerHTML =
        '<div id="ocrCloudConsent"><p class="ocr-note-cat">To read your bill accurately, it is sent to OCR.space ' +
        '(a third-party service) through our server. The bill contains personal details like your name and account ' +
        'number; it is processed transiently and never stored. Upload happens only if you agree.</p>' +
        '<div class="ocr-rev-actions">' +
        '<button type="button" class="ocr-btn" id="ocrCloudYes">Agree &amp; scan</button>' +
        '<button type="button" class="ocr-btn ocr-btn-ghost" id="ocrCloudNo">Read on-device instead (less accurate)</button>' +
        '</div></div>';
      document.getElementById('ocrCloudYes').addEventListener('click', () => {
        sessionStorage.setItem(CONSENT_KEY, 'yes');
        resultEl.hidden = true; resultEl.innerHTML = '';
        progressWrap.hidden = false;
        resolve(true);
      });
      document.getElementById('ocrCloudNo').addEventListener('click', () => {
        resultEl.hidden = true; resultEl.innerHTML = '';
        progressWrap.hidden = false;
        resolve(false);
      });
    });
  }

  // ── Review screen: user confirms / completes values BEFORE they hit the form ──
  const REVIEW_FIELDS = [
    // 4th element flags the fields Apply blocks on (see validate() below). Units is
    // satisfied either directly or by both readings, so its label carries the alternative.
    ['units', 'Units consumed (or both readings below)', 'number', true],
    ['sanctionedLoad', 'Sanctioned load (kW)', 'number', true],
    ['prevRead', 'Previous reading', 'number'],
    ['currRead', 'Current reading', 'number'],
    ['fromDate', 'From date (DD-MM-YYYY)', 'text'],
    ['toDate', 'To date (DD-MM-YYYY)', 'text'],
    ['meterNo', 'Meter number', 'text'],
    ['maxDemand', 'Maximum demand (kW)', 'number'],
    ['arrears', 'Previous dues / arrears (₹)', 'number'],
    ['lpsc', 'LPSC — late payment surcharge (₹)', 'number'],
    ['billAmount', 'Billed amount on the bill (₹)', 'number'],
    ['consumerName', 'Consumer name', 'text'],
    ['accountNo', 'Account no.', 'text'],
  ];

  function renderReview(fields, opts = {}) {
    resultEl.hidden = false;
    const foundCount = Object.keys(fields).filter((k) => !['billMonth', 'billYear', 'category', 'discom', 'supplyType'].includes(k)).length;

    // Unreadable upload → ask for a better picture up front
    const unclearNote = foundCount < 2
      ? '<p class="ocr-fail">This upload was too unclear to read — take a sharper, well-lit photo straight-on (or a screenshot of the PDF) and try again. You can also type the values below yourself.</p>'
      : '';

    const rows = REVIEW_FIELDS.map(([key, label, type, required]) => {
      let v = fields[key];
      if (v && typeof v === 'object') v = v.display; // dates
      return `<label class="ocr-rev-row"><span${required ? ' class="req"' : ''}>${label}</span>` +
        `<input data-ocr-k="${key}" type="${type}" step="any"${required ? ' aria-required="true"' : ''} value="${v != null ? esc(v) : ''}" placeholder="${v != null ? '' : 'not read — fill if known'}"></label>`;
    }).join('');

    const extras = [];
    if (fields.discom) extras.push(`DISCOM <b>${esc(fields.discom.name)}</b> (${esc(fields.discom.state)})`);
    if (fields.category) extras.push(`Tariff category <b>${esc(fields.category)}</b>`);
    if (fields.supplyType) extras.push(`Supply type <b>${esc(fields.supplyType)}</b>`);
    if (fields.billMonth && fields.billYear) extras.push(`Bill month <b>${fields.billMonth}/${fields.billYear}</b>`);
    // Read-only: the calculator derives the subsidy from the tariff itself, so this
    // is shown to confirm the bill was understood, not as a value to apply.
    if (fields.subsidy) extras.push(`Subsidy on the bill <b>₹${esc(fields.subsidy)}</b>`);

    resultEl.innerHTML =
      unclearNote +
      `<p class="ocr-ok">Check what was read from your bill${foundCount ? ` (${foundCount} value${foundCount > 1 ? 's' : ''} found)` : ''} — correct or fill anything before applying:</p>` +
      (extras.length ? `<p class="ocr-note-cat">${extras.join(' · ')}</p>` : '') +
      '<p class="req-legend">Marks a required field</p>' +
      `<div class="ocr-rev-grid">${rows}</div>` +
      '<p class="ocr-rev-missing" id="ocrRevMissing"></p>' +
      '<div class="ocr-rev-actions">' +
      '<button type="button" class="ocr-btn" id="ocrApplyBtn">Use these values →</button>' +
      '<button type="button" class="ocr-btn ocr-btn-ghost" id="ocrRetryBtn">↺ Upload again</button>' +
      '</div>' +
      (opts.cloud ? '<p class="ocr-note-cat">☁ Read by cloud OCR. Your bill was processed transiently and not stored.</p>' : '') +
      (opts.note ? `<p class="ocr-note-cat">${esc(opts.note)}</p>` : '');

    const missingEl = document.getElementById('ocrRevMissing');
    const applyBtn = document.getElementById('ocrApplyBtn');
    const val = (k) => resultEl.querySelector(`[data-ocr-k="${k}"]`)?.value.trim() ?? '';

    // Units (directly, or via both readings) and sanctioned load are the minimum
    // the calculator needs — block Apply until they're in.
    const validate = () => {
      const missing = [];
      const unitsOk = parseFloat(val('units')) > 0 ||
        (val('prevRead') !== '' && val('currRead') !== '' && parseFloat(val('currRead')) >= parseFloat(val('prevRead')));
      if (!unitsOk) missing.push('Units consumed (or both meter readings)');
      if (!(parseFloat(val('sanctionedLoad')) > 0)) missing.push('Sanctioned load');
      applyBtn.disabled = missing.length > 0;
      missingEl.textContent = missing.length ? 'Still needed before calculating: ' + missing.join(', ') + ' — please fill manually.' : '';
      return missing.length === 0;
    };
    resultEl.querySelectorAll('[data-ocr-k]').forEach((i) => i.addEventListener('input', validate));
    validate();

    document.getElementById('ocrRetryBtn').addEventListener('click', () => fileInput.click());

    applyBtn.addEventListener('click', () => {
      if (!validate()) return;
      const f = {};
      const numVal = (k) => { const n = parseFloat(val(k)); return isFinite(n) ? n : null; };
      f.units = numVal('units');
      if (f.units == null || f.units <= 0) { delete f.units; f.prevRead = numVal('prevRead'); f.currRead = numVal('currRead'); }
      f.sanctionedLoad = numVal('sanctionedLoad');
      f.maxDemand = numVal('maxDemand');
      f.arrears = numVal('arrears');
      f.lpsc = numVal('lpsc');
      f.billAmount = numVal('billAmount');
      f.meterNo = val('meterNo') || null;
      f.consumerName = val('consumerName') || null;
      f.accountNo = val('accountNo') || null;
      f.fromDate = normDate(val('fromDate'));
      f.toDate = normDate(val('toDate'));
      f.category = fields.category;
      f.billMonth = fields.billMonth;
      f.billYear = fields.billYear;
      f.discom = fields.discom;
      f.supplyType = fields.supplyType;
      Object.keys(f).forEach((k) => { if (f[k] == null) delete f[k]; });

      // Detailed mode first, so every field the user just confirmed is visible
      // and Simple mode can't re-force the direct-units override underneath.
      document.querySelector('#calcMode .calc-mode-btn[data-mode="detailed"]')?.click();
      const { applied, categoryNote } = applyFields(f);
      const chips = applied.map(([k, v]) =>
        `<span class="ocr-chip"><span class="ocr-chip-k">${esc(k)}</span>${esc(v)}</span>`).join('');
      resultEl.innerHTML =
        `<p class="ocr-ok">Applied ${applied.length} field${applied.length > 1 ? 's' : ''} to the calculator:</p>` +
        `<div class="ocr-chips">${chips}</div>` +
        (categoryNote ? `<p class="ocr-note-cat">${categoryNote}</p>` : '');
      // Intentionally no scroll here: applying OCR values should leave the page where it is
      // (the confirmed-fields chips render in place). The calculate-bill scroll is separate.
    });
  }

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    fileInput.value = ''; // allow re-picking the same file

    box.hidden = false; // the workspace card stays hidden until a scan starts
    smoothTo(box);
    if (btn) btn.disabled = true;
    resultEl.hidden = true;
    resultEl.innerHTML = '';
    progressWrap.hidden = false;
    setProgress(0);
    setStatus('Preparing…');

    try {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
      let text = null;
      let images = null;
      let cloud = false;
      let note = null;

      if (isPdf) {
        // Digital PDFs keep the free, instant, exact local path — no upload.
        const got = await extractFromPdf(file, setStatus);
        if (got.text != null) text = got.text;
        else images = got.images;
      } else {
        images = [file];
      }

      if (text == null) {
        // Scan/photo → cloud OCR is the primary engine (needs consent);
        // Tesseract on-device is the fallback.
        if (isConfigured() && await askCloudConsent()) {
          try {
            // A small-enough PDF goes up whole; otherwise the extracted page image.
            const source = isPdf && file.size <= CLOUD_MAX_BYTES ? file : images[0];
            text = await cloudOcrText(source, setStatus, setProgress);
            cloud = true;
          } catch (err) {
            note = '☁ Cloud OCR unavailable (' + (err && err.message ? err.message : 'unknown error') + ') — this bill was read on-device instead, which can be less accurate.';
            text = await ocrImages(images, setStatus, setProgress);
          }
        } else {
          text = await ocrImages(images, setStatus, setProgress);
        }
      }

      window.__lastOcrText = text; // debugging hook: inspect what OCR actually saw
      const fields = parseBillText(text);
      progressWrap.hidden = true;
      renderReview(fields, { cloud, note });
    } catch (err) {
      console.error('Bill OCR failed:', err);
      progressWrap.hidden = true;
      resultEl.hidden = false;
      resultEl.innerHTML = '<p class="ocr-fail">Something went wrong reading the bill (' +
        (err && err.message ? err.message : 'unknown error') +
        '). Check your connection and try again.</p>';
    } finally {
      if (btn) btn.disabled = false;
    }
  });
}

// Sign-in gate for the review flows: configured deployments require an account
// before the chooser opens; local/dev builds without Supabase skip the gate.
function requireSignIn(triggerEl, afterSignIn) {
  if (!isConfigured() || getStoredUser()) return true;
  window.__openAuthModal?.(triggerEl, { afterSignIn });
  return false;
}

// Hero "Get your bill reviewed" chooser: OCR self-check vs expert review.
function initReviewChooser() {
  const btn = document.getElementById('reviewChooserBtn');
  const menu = document.getElementById('reviewChooser');
  if (!btn || !menu) return;
  // The hero section is overflow:hidden + z-index:0 (page-curtain effect), which
  // clips and buries an absolutely-positioned menu inside it. Portal the menu to
  // <body> and position it fixed under the button instead.
  document.body.appendChild(menu);
  menu.style.position = 'fixed';
  menu.style.zIndex = '1000';
  const place = () => {
    const r = btn.getBoundingClientRect();
    menu.style.top = Math.min(r.bottom + 8, window.innerHeight - 40) + 'px';
    const w = menu.offsetWidth || 300;
    menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8)) + 'px';
  };
  const close = () => { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); };
  // Register with the shared popup coordinator (main.js) so this chooser and the
  // header popups (account, Quick Links, language) never stack — opening one closes
  // the rest. Optional-chained: main.js loads first on every page and creates it.
  window.__popups?.register('reviewChooser', close);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    // Sign in first; once done, the chooser reopens by itself so the flow continues
    if (menu.hidden && !requireSignIn(btn, () => btn.click())) return;
    const willOpen = menu.hidden;
    if (willOpen) window.__popups?.closeOthers('reviewChooser');   // only one popup open at a time
    menu.hidden = !menu.hidden;
    if (!menu.hidden) place();
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  window.addEventListener('scroll', () => { if (!menu.hidden) close(); }, { passive: true });
  // Static hero element, never re-rendered — a plain always-on outside-close
  // listener is safe here (unlike the header account dropdown).
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.getElementById('reviewViaOcr')?.addEventListener('click', () => {
    close();
    // A file picker can only open from a user gesture, so post-sign-in we reopen
    // the chooser instead — one tap on OCR then goes straight to the picker.
    if (!requireSignIn(btn, () => btn.click())) return;
    document.getElementById('ocrFile')?.click(); // same user gesture — picker is allowed
  });

  // Quick Links "Scan Bill" item: on the calculator page run the same gated OCR
  // flow instead of a plain anchor jump (other pages navigate to /#calculator).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('#quickLinksMenu a[href="/#calculator"]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    if (!requireSignIn(a, () => btn.click())) return;
    document.getElementById('ocrFile')?.click();
  });
}

function initAll() {
  initBillOcr();
  initReviewChooser();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}

export { parseBillText }; // for tests

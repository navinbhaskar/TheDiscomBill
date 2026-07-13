// ── Bill OCR auto-fill ────────────────────────────────────────────────────────
// Lets the user upload a photo or PDF of their electricity bill and auto-fills
// the calculator form. Everything runs client-side and free:
//   • Digital PDFs (DISCOM portal downloads) — read the embedded text layer via
//     pdf.js; no OCR at all, so extraction is instant and exact.
//   • Scanned PDFs — the scan JPEGs are pulled straight out of the PDF bytes and
//     OCR'd with Tesseract.js (pdf.js page.render can hang for minutes on big
//     scans, so we never rasterize whole pages).
//   • Photos — upscaled if small, then OCR'd.
// Libraries are lazy-loaded from jsDelivr only when a file is picked, so normal
// page loads carry zero extra weight and the bill never leaves the device.

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
  ['payable', /(?<!minimum\s)payable\s*amount/i],
];
function columnarAmounts(text) {
  const out = {};
  const lines = text.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    const found = [];
    for (const [key, re] of BOX_LABELS) {
      const m = lines[i].match(re);
      if (m && !(key === 'payable' && found.some(f => f.key === 'minPayable' && Math.abs(f.pos - m.index) < 12))) {
        found.push({ key, pos: m.index });
      }
    }
    if (found.length < 2) continue;
    found.sort((a, b) => a.pos - b.pos);
    const nums = (lines[i + 1].match(/-?\d[\d,]*(?:\.\d+)?/g) || []).map(num);
    if (!nums.length || nums.length > found.length) continue;
    found.slice(0, nums.length).forEach((fnd, k) => {
      if (out[fnd.key] === undefined) out[fnd.key] = nums[k];
    });
  }
  return out;
}

function parseBillText(raw) {
  const text = fixDigitConfusions(raw.replace(/[|]/g, ' ').replace(/[ \t]+/g, ' '));
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

  const load = grabAny([
    new RegExp(`(?:sanction(?:ed)?|contract(?:ed)?|connected)\\s*(?:load|demand)\\s*(?:\\(?\\s*(?:in\\s*)?k[vw]a?\\s*\\)?)?${GAP}${NUM}`, 'i'),
    new RegExp(`(?:load|भार)\\s*\\(?\\s*k[vw]a?\\s*\\)?${GAP}${NUM}`, 'i'),
    new RegExp(`स्वीकृत\\s*भार${GAP}${NUM}`, 'i'),
  ]);
  if (load && num(load) > 0 && num(load) < 5000) f.sanctionedLoad = num(load);

  const units = grabAny([
    // Colon-anchored first so footnote digits can't be mistaken for the value:
    // UPPCL prints "Net Billed Unit ⁷ : 54.00 KWH"
    new RegExp(`(?:(?:net|total|chargeable|billed|billable|consumed|adjusted)\\s+){1,3}units?[^:\\n]{0,10}[:\\-]\\s*${NUM}`, 'i'),
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

  const mf = grab(new RegExp(`(?:multiply(?:ing)?\\s*factor|\\bMF\\b)${GAP}(\\d+(?:\\.\\d+)?)`, 'i'));
  if (mf && num(mf) >= 1 && num(mf) <= 5000) f.mf = num(mf);

  const md = grabAny([
    // UPPCL: "Billed Demand (Load)¹ : 0.78 KW" — swallow the "(Load)" and the
    // footnote digit so the superscript isn't mistaken for the value
    new RegExp(`(?:max(?:imum)?|recorded|billed)\\s*demand\\s*(?:\\(\\s*load\\s*\\))?\\s*\\d?\\s*[:\\-]\\s*${NUM}`, 'i'),
    new RegExp(`(?:max(?:imum)?|recorded|billed)\\s*demand\\s*(?:\\(?\\s*k[vw]a?\\s*\\)?)?${GAP}${NUM}`, 'i'),
    new RegExp(`\\bMD\\b\\s*(?:\\(?\\s*k[vw]a?\\s*\\)?)?${GAP}${NUM}`),
  ]);
  if (md && num(md) > 0 && num(md) < 10000) f.maxDemand = num(md);

  const amount = grabAny([
    new RegExp(`(?:net|total|current)?\\s*(?:amount|bill)?\\s*payable\\s*(?:amount)?\\s*(?:by|before)?\\s*(?:due\\s*date)?${GAP}(?:rs\\.?|₹|inr)?\\s*${NUM}`, 'i'),
    new RegExp(`(?:net|total|bill)\\s*amount\\s*(?:due)?${GAP}(?:rs\\.?|₹|inr)?\\s*${NUM}`, 'i'),
    new RegExp(`amount\\s*(?:before|by)\\s*due\\s*date${GAP}(?:rs\\.?|₹|inr)?\\s*${NUM}`, 'i'),
    new RegExp(`देय\\s*(?:धन)?राशि${GAP}(?:rs\\.?|₹)?\\s*${NUM}`, 'i'),
  ]);
  if (amount && num(amount) > 0) f.billAmount = Math.round(num(amount) * 100) / 100;

  // Column-aware summary boxes override the flat matches — they know which
  // number belongs to which label.
  const box = columnarAmounts(text);
  if (box.payable > 0) f.billAmount = box.payable;
  else if (box.payableByDue > 0) f.billAmount = box.payableByDue;
  if (box.prevDues > 0) f.arrears = box.prevDues;

  // UPPCL prints the account number hyphen-grouped ("1538-298-215")
  const acct = grabAny([
    /(?:account|consumer|a\/?c|connection)\s*(?:no|number|id)\s*\.?\s*[:\-]?\s*(\d[\d\- ]{7,15}\d)/i,
    /(?:खाता|उपभोक्ता)\s*(?:सं(?:ख्या)?|क्रमांक)\.?\s*[:\-]?\s*(\d[\d\- ]{7,15}\d)/i,
  ]);
  if (acct) {
    const digits = acct.replace(/\D/g, '');
    if (digits.length >= 8 && digits.length <= 14) f.accountNo = acct.replace(/ /g, '').trim();
  }

  const meterNo = grab(/meter\s*(?:no|number|संख्या)\s*\.?\s*[:\-]?\s*([A-Z]{0,3}\d{5,12})\b/i);
  if (meterNo) f.meterNo = meterNo;

  const prevDues = grab(new RegExp(`(?:previous|past)\\s*(?:dues|balance|outstanding|arrears?)${GAP}${NUM}`, 'i'))
    || grab(new RegExp(`arrears?\\s*(?:amount)?${GAP}${NUM}`, 'i'));
  if (prevDues && num(prevDues) > 0) f.arrears = num(prevDues);

  const lpsc = grab(new RegExp(`(?:lpsc|late\\s*payment\\s*surcharge|surcharge\\s*on\\s*arrears?|विलंब\\s*भुगतान\\s*अधिभार)${GAP}${NUM}`, 'i'));
  if (lpsc && num(lpsc) > 0) f.lpsc = num(lpsc);

  // Name capture stays on one line ([ \t] separators only) so it can't swallow
  // the next label on the bill.
  const name = grab(/\bname\s*(?:of\s*consumer|of\s*the\s*consumer)?\s*[:\-][ \t]*((?:M\/S[ \t]+)?[A-Za-z.]+(?:[ \t]+[A-Za-z.]+){0,4})/i);
  if (name && !/^(and|address|the)\b/i.test(name)) f.consumerName = name.trim();

  // Tariff / category code, e.g. LMV-1, LMV1, ST-17, HV-2 (UPPCL uses LMV/HV; some
  // DISCOMs print ST/LT/HT codes)
  const catM = text.match(/\b(LMV|HV|ST|LT|HT)\s*[-–]?\s*(\d{1,2}[A-Za-z]?)\b/i);
  if (catM) f.category = `${catM[1].toUpperCase()}-${catM[2].toUpperCase()}`;

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

  return { applied, categoryNote };
}

// ── UI ────────────────────────────────────────────────────────────────────────

function initBillOcr() {
  const box = document.getElementById('ocrUpload');
  const fileInput = document.getElementById('ocrFile');
  const btn = document.getElementById('ocrBtn');
  if (!box || !fileInput || !btn) return;

  const progressWrap = document.getElementById('ocrProgress');
  const progressBar = document.getElementById('ocrProgressBar');
  const statusEl = document.getElementById('ocrStatus');
  const resultEl = document.getElementById('ocrResult');

  const setStatus = (t) => { statusEl.textContent = t; };
  const setProgress = (p) => { progressBar.style.width = Math.round(p * 100) + '%'; };

  btn.addEventListener('click', () => fileInput.click());

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ── Review screen: user confirms / completes values BEFORE they hit the form ──
  const REVIEW_FIELDS = [
    ['units', 'Units consumed', 'number'],
    ['sanctionedLoad', 'Sanctioned load (kW)', 'number'],
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

  function renderReview(fields) {
    resultEl.hidden = false;
    const foundCount = Object.keys(fields).filter((k) => !['billMonth', 'billYear', 'category'].includes(k)).length;

    // Unreadable upload → ask for a better picture up front
    const unclearNote = foundCount < 2
      ? '<p class="ocr-fail">This upload was too unclear to read — take a sharper, well-lit photo straight-on (or a screenshot of the PDF) and try again. You can also type the values below yourself.</p>'
      : '';

    const rows = REVIEW_FIELDS.map(([key, label, type]) => {
      let v = fields[key];
      if (v && typeof v === 'object') v = v.display; // dates
      return `<label class="ocr-rev-row"><span>${label}</span>` +
        `<input data-ocr-k="${key}" type="${type}" step="any" value="${v != null ? esc(v) : ''}" placeholder="${v != null ? '' : 'not read — fill if known'}"></label>`;
    }).join('');

    const extras = [];
    if (fields.category) extras.push(`Detected tariff category <b>${esc(fields.category)}</b>`);
    if (fields.billMonth && fields.billYear) extras.push(`Bill month <b>${fields.billMonth}/${fields.billYear}</b>`);

    resultEl.innerHTML =
      unclearNote +
      `<p class="ocr-ok">Check what was read from your bill${foundCount ? ` (${foundCount} value${foundCount > 1 ? 's' : ''} found)` : ''} — correct or fill anything before applying:</p>` +
      (extras.length ? `<p class="ocr-note-cat">${extras.join(' · ')}</p>` : '') +
      `<div class="ocr-rev-grid">${rows}</div>` +
      '<p class="ocr-rev-missing" id="ocrRevMissing"></p>' +
      '<div class="ocr-rev-actions">' +
      '<button type="button" class="ocr-btn" id="ocrApplyBtn">Use these values →</button>' +
      '<button type="button" class="ocr-btn ocr-btn-ghost" id="ocrRetryBtn">↺ Upload again</button>' +
      '</div>';

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
      document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    fileInput.value = ''; // allow re-picking the same file

    btn.disabled = true;
    resultEl.hidden = true;
    resultEl.innerHTML = '';
    progressWrap.hidden = false;
    setProgress(0);
    setStatus('Preparing…');

    try {
      let text;
      if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
        const got = await extractFromPdf(file, setStatus);
        text = got.text != null ? got.text : await ocrImages(got.images, setStatus, setProgress);
      } else {
        text = await ocrImages([file], setStatus, setProgress);
      }
      window.__lastOcrText = text; // debugging hook: inspect what OCR actually saw
      const fields = parseBillText(text);
      progressWrap.hidden = true;
      renderReview(fields);
    } catch (err) {
      console.error('Bill OCR failed:', err);
      progressWrap.hidden = true;
      resultEl.hidden = false;
      resultEl.innerHTML = '<p class="ocr-fail">Something went wrong reading the bill (' +
        (err && err.message ? err.message : 'unknown error') +
        '). Check your connection and try again.</p>';
    } finally {
      btn.disabled = false;
    }
  });
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
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
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
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('ocrFile')?.click(); // same user gesture — picker is allowed
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

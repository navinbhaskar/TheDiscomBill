# ⚡ TheDiscomBill

![tests](https://github.com/navinbhaskar/TheDiscomBill/actions/workflows/test.yml/badge.svg)

**A free, browser-based electricity bill calculator for every DISCOM in India.**

Pick your state → DISCOM → consumer category, enter your meter readings, and get an instant
**provisional bill** with a full slab-wise breakdown — fixed/demand charges, telescopic energy
slabs, Electricity Duty, FPPA fuel surcharge, excess-demand penalty, arrears, LPSC, payments and
adjustments. No sign-up, no backend — it runs entirely in the browser.

> ⚠️ **Provisional / educational tool.** Rates are based on publicly available tariff orders and may
> not reflect the latest revisions or local surcharges. Always confirm with your DISCOM. Not
> affiliated with any utility, SERC, or government body.

---

## Features

- **All-India coverage** — 35 states & UTs, 70+ DISCOMs, 150+ consumer categories.
- **Telescopic slab billing** — each rate applies only to the units within its band; slab limits
  prorate automatically for multi-month periods.
- **Three meter-reading modes**
  - **Simple** — previous/current reading or direct units.
  - **Advanced** — a per-meter table with **Single Meter** and **Meter Replacement** sub-modes,
    a **Multiplying Factor (MF)** and **Maximum Demand (MD)** column; units are summed across
    meters and the billing period is derived from the reading dates.
  - **TOD** — Time-of-Day billing (peak +20% / off-peak −20%).
- **Maximum Demand (MD)** — drives the demand charge and the excess-demand penalty for
  demand-billed (commercial/HT) categories; domestic categories always bill on sanctioned load.
- **Billing Basis selector (kWh / kVA based)** — a main-page control that works on any DISCOM:
  - **Active energy (kWh)** — standard: energy on kWh, demand in kW.
  - **kVA based** — demand billed in **kVA** (with a configurable **billing-demand floor** — the
    higher of recorded MD or, by default, 75% of contract demand) and energy on **apparent units
    kVAh = kWh ÷ Power Factor**, so a poor PF raises the bill directly (no separate PF penalty). This
    is the model used by MH, GJ, KA, TN, AP, TG, MP, Delhi.
  - Auto-defaults to kVA based for `demandUnit: "kVA"` tariffs and kWh otherwise; override per bill.
- **FPPA / FPPCA fuel surcharge** — auto-filled from verified, period-dated government notices
  (`js/tariffs/fppa.js`). Because FPPA is notified monthly, a multi-month bill applies **each
  month's own rate** (averaged over the period).
- **Lifeline handling (UP)** — defaults the sanctioned load to 1 kW for ST-10A/ST-17 and
  auto-switches to the non-lifeline tariff when load > 1 kW or units exceed the (period-scaled)
  100-unit cap.
- **LPSC (Late Payment Surcharge)** — an "LPSC Applicable" toggle on the main page. For a
  **multi-month period it runs a month-by-month bill revision**: each month is billed at its own
  FPPA/tariff and LPSC **compounds on the running balance**, with payments applied by date.
- **Arrears, payments (by date) & adjustments**, Delhi GNCTD subsidy, and **date-versioned
  historical tariffs** (bills before the current rate set resolve to the rate in force then).
- **Printable & shareable** — print the bill or copy a link that reproduces it.
- **In-browser tariff editor** (`/editor.html`) — add/update tariffs and FPPA windows from a form,
  with live validation and preview, instead of hand-editing data files.

---

## Running locally

It's a static site, but it uses **ES modules**, so it must be served over HTTP (opening
`index.html` from `file://` will not work).

```bash
# Any static server works. The repo's launch config uses http-server:
npx http-server . -p 3456 --cors -c-1
#  → open http://localhost:3456

# Alternatives:
python -m http.server 3456      # then open http://localhost:3456
#  …or use the VS Code "Live Server" extension.
```

No build step and no `npm install` — the dev server just serves the files. The only runtime
dependency is a vendored copy of **html2pdf** (`js/vendor/`, loaded lazily for the "Save as PDF"
download); everything else is hand-written vanilla JS. (`.claude/launch.json` defines the
`http-server` config used during development.)

### Tests

The calculation engine has a dependency-free regression suite (run by CI on every push/PR):

```bash
npm test        # node tests/engine.test.mjs
```

It pins the slab, fixed-charge, kVA/kVAh, billing-demand-floor, excess-demand, FPPA and
net-metering logic, so a tariff edit or refactor can't silently change results.

---

## Contributing

The most valuable contributions are **accurate tariff data** (with a cited official order) and bug
fixes. See **[CONTRIBUTING.md](CONTRIBUTING.md)**, or open an issue with the **Tariff correction**
template. Verified rates show a "✓ Verified rates" badge on the bill; everything else shows
"≈ Representative rates".

---

## Project structure

```
index.html              Main calculator page
editor.html             Tariff & FPPA editor (admin tool, noindex, not linked from the site)
css/
  styles.css            App styles + design tokens
  editor.css            Editor styles
js/
  main.js               Entry point — wires up DOM events
  ui.js                 All DOM manipulation + orchestration (mode-aware units, lifeline, revision)
  engine.js             Pure bill-calculation engine (no DOM)
  renderer.js           Bill HTML output (provisional bill + month-by-month revision)
  datepicker.js         Lightweight calendar for the billing-period fields
  editor.js             In-browser tariff/FPPA editor logic
  tariffs/
    registry.js         Aggregates all per-state files into one TARIFF_DB
    <state>.js          One file per state/UT (rates, slabs, fixed charges, supply types)
    fppa.js             Verified, period-dated FPPA/FPPCA/PPAC surcharge windows
scripts/
  generate-tariff-files.cjs   Split the legacy monolith into per-state files (one-off)
  render-pdf.ps1              Rasterize scanned PDF pages to PNG via the native Windows PDF API
  extract-pdf-text.cjs / read-pdf.cjs   PDF text helpers
TARIFF_GUIDE.md         How to add/update tariff data (schema + step-by-step)
```

**Architecture:** `engine.js` and `renderer.js` are pure (no DOM); `ui.js` is the only module that
touches the DOM and orchestrates everything; `main.js` just wires events. This keeps the
calculation logic testable in isolation.

---

## How the bill is calculated

1. **Fixed / demand charge** — flat, per-kW, or tiered-by-load; billed per whole month of the
   period. Demand-billed categories use the recorded **MD**; others use the sanctioned load.
2. **Energy charge** — telescopic slabs; limits prorate for multi-month periods.
3. **Excess-demand penalty** — `max(0, MD − sanctioned load) × penalty rate`, where defined.
4. **TOD** — +20% on peak units, −20% on off-peak (TOD mode only).
5. **FPPA / FPPCA** — `% of (fixed + energy + excess)` or `₹/unit × units`, per the notified rate.
6. **Electricity Duty & other levies** — e.g. `% of (fixed + energy + excess + FPPA)`.
7. **Subsidy** (e.g. Delhi GNCTD), then **arrears, LPSC, payments and adjustments** → amount payable.

The engine has been **cross-checked against real MVVNL (Uttar Pradesh) LMV-1 and LMV-2 bills** —
energy, fixed/demand, excess-demand, FPPA and ED match to the paisa.

---

## Updating tariff data

Two ways:

- **In the browser:** open `/editor.html`, load a state (or start a new one), edit in the form
  (it validates and previews using the real engine), then **Download** the generated
  `js/tariffs/<state>.js` (and a regenerated `fppa.js`).
- **By hand:** edit the per-state file under `js/tariffs/`. See **[TARIFF_GUIDE.md](TARIFF_GUIDE.md)**
  for the full field schema. FPPA/fuel-surcharge values live in `js/tariffs/fppa.js`.

No build step is required — refresh the page after saving.

---

## License & disclaimer

Provided for reference and educational purposes. Tariff data is approximate and based on publicly
available information. Actual bills from your DISCOM may differ. Not affiliated with any electricity
utility, State Electricity Regulatory Commission, or government body.

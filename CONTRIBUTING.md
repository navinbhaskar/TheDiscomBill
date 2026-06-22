# Contributing to TheDiscomBill

Thanks for helping make electricity bills less confusing! The most valuable contributions are
**accurate tariff data** and **bug fixes**. No build step, no framework — just vanilla JS.

## Local setup

```bash
git clone https://github.com/navinbhaskar/TheDiscomBill
cd TheDiscomBill
npx http-server . -p 3456      # then open http://localhost:3456
npm test                       # run the engine regression tests (no install needed)
```

The app is static ES modules: `js/engine.js` + `js/renderer.js` are pure (no DOM), `js/ui.js` is the
only DOM/orchestration module, `js/main.js` wires events. Tariff data lives in `js/tariffs/<state>.js`,
aggregated by `registry.js`.

## Adding or correcting a tariff

1. **Easiest:** open `/editor.html`, load the state, edit rates/slabs in the form (it previews with
   the real engine), then **Download** the regenerated `js/tariffs/<state>.js`. The editor preserves
   advanced fields (`demandUnit`, `excessDemand`, `billingDemandFloorPct`, …) on round-trip.
2. **By hand:** follow [TARIFF_GUIDE.md](TARIFF_GUIDE.md) for the full field schema.
3. Always cite the **official SERC / DISCOM tariff order** in your PR (and ideally set the data-
   confidence fields below).

### Data-confidence fields (please set when you've verified against an order)

On a state's default export, a DISCOM, or a tariff:

```js
verified: true,                 // checked against the official tariff order
ratesAsOf: "FY 2025-26 (UPERC)",// shown on the bill's confidence badge
sourceUrl: "https://...",       // link to the order
```

Without these a bill shows a "≈ Representative rates" badge; with `verified: true` it shows
"✓ Verified rates". Don't set `verified` unless you've actually checked the numbers.

## Before opening a PR

- Run `npm test` and make sure it passes (CI runs it too).
- If you changed engine logic, add/adjust a case in `tests/engine.test.mjs` with a hand-computed
  expectation.
- Keep the code style of the surrounding file (comment density, naming, no new dependencies).

## Reporting a wrong rate

Open an issue with the **Tariff correction** template — include the state, DISCOM, category, the
wrong vs. correct value, and a link to the official order.

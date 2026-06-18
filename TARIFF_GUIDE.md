# Tariff Update Guide

How to update or add electricity tariff data in TheDiscomBill.

## Folder Structure

```
js/tariffs/
├── registry.js          ← auto-aggregator, do NOT edit directly
├── andhra-pradesh.js    ← one file per state
├── delhi.js
├── uttar-pradesh.js
├── ...                  ← 34 state files total
```

Each state file exports a single default object:

```js
export default {
  state: "State Name",          // must match exactly what's in registry.js
  discoms: [ ... ]              // array of DISCOM objects
};
```

---

## DISCOM Object Schema

```js
{
  id:          "discom_id",       // unique lowercase slug, e.g. "bescom"
  name:        "BESCOM",          // short name shown in dropdown
  fullName:    "Bangalore Electricity Supply Company Ltd.",
  area:        "Bangalore Urban and Rural Districts",
  tariffYear:  "2024-25",
  website:     "https://bescom.karnataka.gov.in",
  lpscRate:    1.5,              // optional: late payment surcharge % per month
  categories:  [ ... ]          // array of Category objects
}
```

---

## Category Object Schema

```js
{
  id:    "domestic",
  name:  "LT-I Domestic",
  notes: "Optional note shown on the printed bill.",

  // Either direct tariff fields (no supplyTypes):
  fixedCharge:       100,          // see Fixed Charge section below
  energySlabs:       [ ... ],      // see Energy Slabs section below
  additionalCharges: [ ... ],      // see Additional Charges section below
  fac:               0.20,         // Fuel Adjustment Charge ₹/unit

  // OR sub-divided by supply type (if there are urban/rural/ST-10A variants):
  supplyTypes: [
    {
      id:                "10A",
      name:              "ST-10A – Urban Metered (Load ≤ 1 kW)",
      description:       "Shown below the dropdown to help the user choose.",
      fixedCharge:       90,
      energySlabs:       [ ... ],
      additionalCharges: [ ... ],
      fac:               0.20
    },
    // ... more supply types
  ]
}
```

---

## Fixed Charge Formats

```js
// 1. Flat amount per month
fixedCharge: 90

// 2. Per kW of connected load
fixedCharge: { type: "per_kw", rate: 50 }     // ₹50 × connected kW

// 3. Tiered by connected load
fixedCharge: {
  type: "tiered",
  slabs: [
    { maxLoad: 2,        rate: 90,  label: "Up to 2 kW" },
    { maxLoad: 5,        rate: 130, label: "2 kW – 5 kW" },
    { maxLoad: Infinity, rate: 190, label: "Above 5 kW" }
  ]
}
```

---

## Energy Slabs

Telescopic (cumulative) slabs — rate applies only to units within each slab:

```js
energySlabs: [
  { limit: 100,      rate: 3.85 },   // first 100 units @ ₹3.85
  { limit: 200,      rate: 4.90 },   // next 100 (101–200) @ ₹4.90
  { limit: 500,      rate: 5.85 },   // next 300 (201–500) @ ₹5.85
  { limit: Infinity, rate: 6.65 }    // above 500 @ ₹6.65
]
```

`limit` is the **cumulative upper boundary** (not the slab width).
Always use `Infinity` for the last slab's limit.

---

## Additional Charges

Applied on top of energy + fixed charges:

```js
additionalCharges: [
  // % of energy charges only
  { name: "Electricity Duty", type: "percent_energy", rate: 5 },

  // % of (fixed + energy) total
  { name: "Wheeling Charge", type: "percent_total", rate: 2 },

  // flat ₹ per unit consumed
  { name: "Cross-Subsidy Surcharge", type: "per_unit", rate: 0.50 },

  // fixed amount regardless of consumption
  { name: "Meter Rent", type: "flat", rate: 20 }
]
```

---

## Step-by-Step: Update an Existing Tariff

**Example: BESCOM Domestic rates changed for FY 2025-26**

1. Open `js/tariffs/karnataka.js`
2. Find the `id: "bescom"` object
3. Find `id: "domestic"` inside its `categories` array
4. Edit `energySlabs` rates to the new values from the tariff order
5. Update `fixedCharge` if it changed
6. Update `tariffYear: "2025-26"` on the DISCOM object
7. Save. No build step needed — the browser loads the file directly.

---

## Step-by-Step: Add a New State

1. Create `js/tariffs/your-state.js` following the schema above
2. Open `js/tariffs/registry.js`
3. Add at the top: `import _your_state from './your-state.js';`
4. Add `_your_state` inside the `[...]` array passed to `.forEach`
5. Save.

---

## Tips

- Use `Infinity` (not `999999`) for the last energy slab.
- `lpscRate` on the DISCOM object pre-fills the LPSC rate field (default 1.5% if absent).
- Verify rates against the official SERC tariff order PDF before publishing.
- Update `tariffYear` whenever you change rates so the bill clearly shows which year's tariff was used.

---

## FPPA / fuel surcharge (separate file)

The Fuel & Power Purchase Adjustment (FPPA / FPPCA / PPAC) is **not** taken from the per-state
tariff files — it is notified per billing *period*, so it lives in **`js/tariffs/fppa.js`** as
dated windows:

```js
// state-wide (applies to every DISCOM in the state):
"Uttar Pradesh": [
  { from: "2026-06-01", to: "2026-06-30", mode: "percent", rate: 10.00, label: "Jun 2026 FPPAS" },
  // …newest first; specific dated windows BEFORE any open-ended (no `to`) entry
]
// DISCOM-specific overrides go in FPPA_BY_DISCOM, keyed by discom id (take priority).
```

- `mode`: `"percent"` (% of fixed + energy + excess) or `"per_unit"` (₹/unit × units).
- The calculator auto-fills the matching window by billing date; a **multi-month** bill applies
  each month's own rate (averaged over the period).
- The legacy `fac` field on a tariff object is **not** used for auto-fill — leave FPPA to `fppa.js`.

---

## Advanced / optional fields

- `supplyTypes: [ … ]` on a category — sub-divide into urban/rural/lifeline variants (each with its
  own `fixedCharge`/`energySlabs`/`additionalCharges`); see Uttar Pradesh for examples.
- `excessDemandRate: <₹/kW>` on a tariff — enables the excess-demand penalty and makes the category
  "demand-billed" (its fixed charge bills on the recorded Maximum Demand instead of sanctioned load).
- `currentRatesFrom: "YYYY-MM-DD"` at the state level + `rateHistory: [ … ]` on a tariff — for
  date-versioned historical rates (bills dated before the current set resolve to the older rates).

---

## Easiest way: the in-browser editor

Open **`/editor.html`**, load a state (or start a new one), edit the rates/slabs/FPPA in a form
(it validates and previews using the real engine), then **Download** the generated
`js/tariffs/<state>.js` and the regenerated `fppa.js`. No hand-editing required.

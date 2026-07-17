// subsidy.js — domestic electricity subsidies by state.
//
// Applies ONLY to the domestic category (categoryId === 'domestic'). The engine reads a scheme
// from here when the user opts in, and applies it conservatively:
//
//   type 'free-units'  — the first N units/month are free: we waive the telescopic ENERGY charge
//                        on those units (fixed charge, FPPA and duty still apply). This under-claims
//                        rather than over-claims — schemes with extra rebates may reduce the bill a
//                        little further. `units` is the monthly free allowance (scaled by the whole
//                        months in the billing period). A scheme may TAPER: with `thresholdUnits`
//                        set, consumption above it (per month, same scaling) drops the allowance to
//                        `reducedUnits` and the bill shows `reducedLabel` — Tamil Nadu's free units
//                        halve once a consumer bills over 500 units bi-monthly.
//   type 'delhi-gnctd' — Delhi's rebate schedule (≤200 units: nil bill; 201–400: 50% on first 200).
//
// Every scheme carries a plain-language `label` that is shown on the bill, so the exact rule being
// applied is always visible and verifiable. Where a real scheme is baseline- or slab-dependent
// (e.g. Karnataka Gruha Jyoti is avg-consumption + 10%, capped at 200), we model the simple flat
// free-units cap and say so in the label. States absent here have no modelled subsidy.
export const DOMESTIC_SUBSIDY = {
  'Delhi':      { type: 'delhi-gnctd', label: 'Delhi GNCTD subsidy (≤200 units: nil; 201–400: 50% on first 200)' },
  'Punjab':     { type: 'free-units', units: 300, label: 'Punjab domestic subsidy: first 300 units/month free' },
  'Karnataka':  { type: 'free-units', units: 200, label: 'Karnataka Gruha Jyoti: up to 200 units/month free' },
  'Telangana':  { type: 'free-units', units: 200, label: 'Telangana Gruha Jyoti: 200 units/month free' },
  // GoTN G.O.(Ms) No.50 dt.10-05-2026 (TNERC Order No.5 of 2026): 200 units free per 2-month
  // cycle for consumers billing up to 500 units bi-monthly; above that the older allowance of
  // 100 units per cycle continues. Stated here per month (TN bills bi-monthly), so the engine's
  // month-scaling reproduces the 200/500/100 bi-monthly figures on a normal 2-month bill.
  'Tamil Nadu': {
    type: 'free-units',
    units: 100, thresholdUnits: 250, reducedUnits: 50,
    label: 'Tamil Nadu domestic subsidy: 200 units free per 2-month cycle (≤500 units billed)',
    reducedLabel: 'Tamil Nadu domestic subsidy: 100 units free per 2-month cycle (>500 units billed)',
  },
};

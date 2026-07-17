// Tamil Nadu — Electricity Tariff Data (FY 2025-26)
// Source: TNERC Suo-motu Tariff Order No. 6 of 2025, dt. 30-06-2025, effective 01-07-2025
//         (Determination of Tariff for Distribution for FY 2025-26, TNPDCL).
//         https://www.tnerc.tn.gov.in/Orders/files/TO-Order%20No6300620252131.pdf
// Free units: GoTN G.O.(Ms) No.50 dt.10-05-2026, given effect by TNERC Order No.5 of 2026
//         (dt.26-05-2026) — see DOMESTIC_SUBSIDY['Tamil Nadu'] in ./subsidy.js.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.
//
// NOTE — FY 2026-27: T.O.6 of 2025 (§3.2.2, §3.2.15) states that the FY 2025-26 fixed and
// energy charges "shall undergo an inflation based adjustment, as per para 6.2.1.m. of
// T.O.No.7 of 2022 dt.09.09.2022", effective 01-07-2026. As of 17-07-2026 no order carrying
// the adjusted figures is published on the TNERC tariff-orders index (latest listed: Order
// No.5 of 2026, 26-05-2026, a subsidy order), so the rates below — the last ones actually
// notified — remain the best available. Re-check the index and lift the new rates when they
// appear; the FY 2025-26 set then moves into rateHistory with from: "2025-07-01".
//
// Billing: TNPDCL bills LT-IA and LT-V bi-monthly. The order states both the monthly and the
// bi-monthly band for each slab; the MONTHLY ranges are used here because the engine works in
// monthly terms and prorates slab limits by the billing period.

export default {
  state: "Tamil Nadu",
  // TNERC/TNPDCL: for every kW of recorded demand over the sanctioned demand, 1% of the
  // total energy charges is levied as the excess-demand charge.
  excessDemand: { pctEnergyPerKw: 1, tolerancePct: 0 },
  currentRatesFrom: "2025-07-01",
  ratesAsOf: "FY 2025-26 (TNERC T.O. No.6 of 2025)",
  sourceUrl: "https://www.tnerc.tn.gov.in/Orders/files/TO-Order%20No6300620252131.pdf",
  discoms: [
    {
      id: "tangedco",   // URL/id kept as tangedco — the public still searches the old name
      name: "TNPDCL (TANGEDCO)",
      fullName: "Tamil Nadu Power Distribution Corporation Ltd.",
      area: "Entire Tamil Nadu",
      tariffYear: "2025-26",
      website: "https://www.tnpdcl.org",
      categories: [
        {
          id: "domestic",
          name: "LT-IA (Domestic)",
          // T.O.6 of 2025 §3.2.2: Fixed Charges "Nil" for LT-IA.
          fixedCharge: 0,
          // Telescopic — each band's rate applies only to the units within it. The order gives
          // paise/kWh (495, 665, 880, 995, 1105, 1215) against monthly / bi-monthly ranges.
          energySlabs: [
            { limit: 200, rate: 4.95 },     // 0–200/month  · 0–400 bi-monthly
            { limit: 250, rate: 6.65 },     // 201–250      · 401–500
            { limit: 300, rate: 8.80 },     // 251–300      · 501–600
            { limit: 400, rate: 9.95 },     // 301–400      · 601–800
            { limit: 500, rate: 11.05 },    // 401–500      · 801–1000
            { limit: Infinity, rate: 12.15 } // 501+        · 1001+
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 5
            }
          ],
          notes: "TNPDCL bills bi-monthly; rates here are the order's monthly-equivalent bands. Free units (GoTN G.O.(Ms) No.50, 10-05-2026): 200 units free per 2-month cycle if you bill ≤500 units bi-monthly, otherwise 100 units per cycle — tick the Government Subsidy box to apply it. Fixed charge is Nil for this category.",
          // Pre-revision rates from the same order's comparison table
          // ("Existing Tariff - FY 2024-25 (Suo-Motu T.O.6 / 2024)").
          rateHistory: [
            {
              from: "2024-07-01",
              label: "FY 2024-25 (TNERC T.O. No.6 of 2024)",
              estimated: false,
              fixedCharge: 0,
              energySlabs: [
                { limit: 200, rate: 4.80 },
                { limit: 250, rate: 6.45 },
                { limit: 300, rate: 8.55 },
                { limit: 400, rate: 9.65 },
                { limit: 500, rate: 10.70 },
                { limit: Infinity, rate: 11.80 }
              ]
            }
          ]
        },
        {
          id: "commercial",
          name: "LT-V (Commercial / General Purpose)",
          // §3.2.15 — shops, malls, hotels, private hospitals, offices, banks, marriage halls…
          // NOT telescopic: crossing 50 units/month re-rates EVERY unit at the higher figure,
          // so each band is a flat single-rate supply type rather than a slab.
          supplyTypes: [
            {
              id: "V-general",
              name: "LT-V – Above 50 units/month (100 bi-monthly)",
              description: "Commercial / general-purpose supply billing more than 50 units a month (100 units bi-monthly). The higher rate applies to ALL units, not just those above the threshold — this is the normal case for almost every commercial connection. Fixed charge ₹110/kW/month applies up to 50 kW; above 50–112 kW it is ₹332/kW/month and above 112 kW ₹608/kW/month.",
              fixedCharge: { type: "per_kw", rate: 110 },
              energySlabs: [
                { limit: Infinity, rate: 10.45 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              rateHistory: [
                {
                  from: "2024-07-01",
                  label: "FY 2024-25 (TNERC T.O. No.6 of 2024)",
                  estimated: false,
                  fixedCharge: { type: "per_kw", rate: 107 },
                  energySlabs: [{ limit: Infinity, rate: 10.15 }]
                }
              ]
            },
            {
              id: "V-low",
              name: "LT-V – Up to 50 units/month (100 bi-monthly)",
              description: "Commercial / general-purpose supply billing 50 units a month (100 bi-monthly) or less — a small shop or kiosk. Fixed charge ₹110/kW/month up to 50 kW.",
              fixedCharge: { type: "per_kw", rate: 110 },
              energySlabs: [
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              rateHistory: [
                {
                  from: "2024-07-01",
                  label: "FY 2024-25 (TNERC T.O. No.6 of 2024)",
                  estimated: false,
                  fixedCharge: { type: "per_kw", rate: 107 },
                  energySlabs: [{ limit: Infinity, rate: 6.45 }]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

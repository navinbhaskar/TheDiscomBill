// Maharashtra — Electricity Tariff Data
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.
//
// STATUS (2026-07): MSEDCL (whole state ex-Mumbai) updated to FY 2026-27 from the MERC MYT
// Order Case 217/2024. The three Mumbai licensees below — Adani (Case 211/2024), Tata Power
// (Case 210/2024) and BEST (Case 207/2024) — are each on FY 2026-27 rates read from their own
// MERC MYT press-note annexures (5th Control Period, eff. 1 Apr 2026), with FY 2025-26 in each
// category's rateHistory. All three levy the residential FIXED charge by CONSUMPTION slab
// (₹90 ≤100 u, ₹135 up to 500, ₹160 above — held at FY 2024-25 levels across the control period),
// modelled with fixedCharge.type "by_consumption". Wheeling is itemised separately (per unit) and
// Electricity Duty is 16% on the energy charge, as for MSEDCL. Not yet checked against a real
// Mumbai bill → no verified badge.

export default {
  state: "Maharashtra",
  // MERC: demand exceeding contract demand is billed at 150% of the normal demand-charge rate.
  excessDemand: { multiplier: 1.5, tolerancePct: 0 },
  discoms: [
    {
      id: "msedcl",
      name: "MSEDCL",
      fullName: "Maharashtra State Electricity Distribution Co. Ltd.",
      area: "Maharashtra (except Mumbai city area served by Adani/BEST/Tata Power)",
      tariffYear: "2026-27",
      website: "https://www.mahadiscom.in",
      // LT-I(B) domestic and LT-II commercial both taken from MERC's 5th-Control-Period MYT
      // Order (Case 217 of 2024, dt. 31-Mar-2025), Annexure I tariff schedule, read from the
      // order PDF: FY 2026-27 rates (eff. 1 Apr 2026) with FY 2025-26 in each category's
      // rateHistory. The MYT trajectory REDUCES rates year-on-year, so the old FY2024-25 data
      // was overestimating bills. Not yet checked against a real bill → no verified badge.
      sourceUrl: "https://www.mahadiscom.in/consumer/wp-content/uploads/2025/08/MSEDCL-MYT-Order_Case_no_217-of-2024.pdf",
      ratesAsOf: "FY 2026-27 (MERC Case 217/2024)",
      categories: [
        {
          id: "domestic",
          name: "LT-I(B) (Residential)",
          // MERC Case 217/2024 sets a flat fixed charge by phase, not by load: ₹130/month
          // single-phase, ₹435/month three-phase (FY 2026-27). Single-phase LT supply runs up
          // to ~5 kW, so the load tiers approximate the phase split for the common household.
          fixedCharge: {
            type: "tiered",
            slabs: [
              { maxLoad: 5, rate: 130, label: "Single phase (≤ 5 kW)" },
              { maxLoad: Infinity, rate: 435, label: "Three phase (> 5 kW)" }
            ]
          },
          // Telescopic energy slabs, FY 2026-27 (effective 1 Apr 2026).
          energySlabs: [
            { limit: 100, rate: 4.32 },
            { limit: 300, rate: 9.40 },
            { limit: 500, rate: 12.51 },
            { limit: Infinity, rate: 13.97 }
          ],
          // Wheeling (distribution-network use) itemised separately on MSEDCL LT bills.
          wheelingCharge: { type: "per_unit", rate: 1.20, label: "Wheeling Charges" },
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ],
          currentRatesFrom: "2026-04-01",
          periodLabel: "FY 2026-27 (MERC Case 217/2024)",
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (MERC Case 217/2024)",
              estimated: false,
              fixedCharge: {
                type: "tiered",
                slabs: [
                  { maxLoad: 5, rate: 130, label: "Single phase (≤ 5 kW)" },
                  { maxLoad: Infinity, rate: 430, label: "Three phase (> 5 kW)" }
                ]
              },
              energySlabs: [
                { limit: 100, rate: 4.43 },
                { limit: 300, rate: 9.64 },
                { limit: 500, rate: 12.83 },
                { limit: Infinity, rate: 14.33 }
              ],
              wheelingCharge: { type: "per_unit", rate: 1.24, label: "Wheeling Charges" }
            }
          ]
        },
        // LT-II Commercial is banded by SANCTIONED LOAD, not consumption, and the two upper
        // bands bill on kVA / kVAh (apparent energy), so each band is its own supply type.
        {
          id: "commercial",
          name: "LT-II (Commercial / Non-Residential)",
          supplyTypes: [
            {
              id: "II-A",
              name: "LT-II(A) — up to 20 kW",
              description: "Commercial / non-residential supply with sanctioned load up to 20 kW. Billed on kWh; fixed charge is a flat ₹525 per connection per month (FY 2026-27).",
              fixedCharge: 525,
              energySlabs: [{ limit: Infinity, rate: 6.44 }],
              wheelingCharge: { type: "per_unit", rate: 1.20, label: "Wheeling Charges" },
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }],
              currentRatesFrom: "2026-04-01",
              periodLabel: "FY 2026-27 (MERC Case 217/2024)",
              rateHistory: [{
                from: "2025-04-01", label: "FY 2025-26 (MERC Case 217/2024)", estimated: false,
                fixedCharge: 520,
                energySlabs: [{ limit: Infinity, rate: 6.60 }],
                wheelingCharge: { type: "per_unit", rate: 1.24, label: "Wheeling Charges" }
              }]
            },
            {
              id: "II-B",
              name: "LT-II(B) — 20 to 50 kW",
              description: "Commercial supply with sanctioned load above 20 kW and up to 50 kW. Billed on kVA demand and kVAh (apparent energy): a poor power factor raises the bill directly. Demand charge ₹525/kVA/month (FY 2026-27).",
              demandUnit: "kVA",
              fixedCharge: { type: "per_kva", rate: 525 },
              energySlabs: [{ limit: Infinity, rate: 10.07 }],
              wheelingCharge: { type: "per_unit", rate: 1.14, label: "Wheeling Charges" },
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }],
              currentRatesFrom: "2026-04-01",
              periodLabel: "FY 2026-27 (MERC Case 217/2024)",
              rateHistory: [{
                from: "2025-04-01", label: "FY 2025-26 (MERC Case 217/2024)", estimated: false,
                fixedCharge: { type: "per_kva", rate: 520 },
                energySlabs: [{ limit: Infinity, rate: 10.33 }],
                wheelingCharge: { type: "per_unit", rate: 1.17, label: "Wheeling Charges" }
              }]
            },
            {
              id: "II-C",
              name: "LT-II(C) — above 50 kW",
              description: "Commercial supply with sanctioned load above 50 kW. Billed on kVA demand and kVAh (apparent energy). Demand charge ₹525/kVA/month (FY 2026-27).",
              demandUnit: "kVA",
              fixedCharge: { type: "per_kva", rate: 525 },
              energySlabs: [{ limit: Infinity, rate: 12.16 }],
              wheelingCharge: { type: "per_unit", rate: 1.14, label: "Wheeling Charges" },
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }],
              currentRatesFrom: "2026-04-01",
              periodLabel: "FY 2026-27 (MERC Case 217/2024)",
              rateHistory: [{
                from: "2025-04-01", label: "FY 2025-26 (MERC Case 217/2024)", estimated: false,
                fixedCharge: { type: "per_kva", rate: 520 },
                energySlabs: [{ limit: Infinity, rate: 12.47 }],
                wheelingCharge: { type: "per_unit", rate: 1.17, label: "Wheeling Charges" }
              }]
            }
          ]
        }
      ]
    },
    {
      id: "adani_mumbai",
      name: "Adani Electricity Mumbai",
      fullName: "Adani Electricity Mumbai Ltd. (formerly Reliance Infrastructure)",
      area: "Mumbai suburbs (Bandra, Andheri, Kurla, Borivali, Malad, etc.)",
      tariffYear: "2026-27",
      website: "https://www.adanielectricity.com",
      sourceUrl: "https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_AEML_English.pdf",
      ratesAsOf: "FY 2026-27 (MERC Case 211/2024)",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Residential)",
          // MERC AEML-D MYT Order (Case 211/2024), Annexure 3: fixed charge by consumption slab
          // (₹90 ≤100 u, ₹135 up to 500, ₹160 above), held at FY 2024-25 levels across the period.
          fixedCharge: {
            type: "by_consumption",
            slabs: [
              { maxUnits: 100, rate: 90, label: "Up to 100 units" },
              { maxUnits: 500, rate: 135, label: "101 – 500 units" },
              { maxUnits: Infinity, rate: 160, label: "Above 500 units" }
            ]
          },
          // Energy charge (₹/kWh), telescopic, FY 2026-27 (effective 1 Apr 2026).
          energySlabs: [
            { limit: 100, rate: 2.65 },
            { limit: 300, rate: 5.85 },
            { limit: 500, rate: 7.10 },
            { limit: Infinity, rate: 8.35 }
          ],
          // Wheeling (distribution-network use) is itemised separately on Mumbai LT bills.
          wheelingCharge: { type: "per_unit", rate: 2.28, label: "Wheeling Charges" },
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ],
          currentRatesFrom: "2026-04-01",
          periodLabel: "FY 2026-27 (MERC Case 211/2024)",
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (MERC Case 211/2024)",
              estimated: false,
              fixedCharge: {
                type: "by_consumption",
                slabs: [
                  { maxUnits: 100, rate: 90, label: "Up to 100 units" },
                  { maxUnits: 500, rate: 135, label: "101 – 500 units" },
                  { maxUnits: Infinity, rate: 160, label: "Above 500 units" }
                ]
              },
              energySlabs: [
                { limit: 100, rate: 3.45 },
                { limit: 300, rate: 6.70 },
                { limit: 500, rate: 8.10 },
                { limit: Infinity, rate: 9.05 }
              ],
              wheelingCharge: { type: "per_unit", rate: 2.93, label: "Wheeling Charges" }
            }
          ]
        },
        {
          id: "ht_industrial",
          name: "HT-I Industrial (HT · kVAh)",
          demandUnit: "kVA",
          // MERC AEML-D Case 211/2024, Annexure 3 (FY 2026-27): demand ₹400/kVA, energy ₹5.73/kVAh,
          // wheeling ₹0.57/kVAh. Billing demand = higher of recorded MD or 75% of contract demand.
          fixedCharge: { type: "per_kva", rate: 400 },
          billingDemandFloorPct: 75,
          energySlabs: [ { limit: Infinity, rate: 5.73 } ],
          wheelingCharge: { type: "per_unit", rate: 0.57, label: "Wheeling Charges" },
          additionalCharges: [ { name: "Electricity Duty (ED)", type: "percent_energy", rate: 9.3 } ],
          currentRatesFrom: "2026-04-01",
          periodLabel: "FY 2026-27 (MERC Case 211/2024)",
          notes: "HT-I industrial supply, kVAh based (MERC Case 211/2024, FY 2026-27) — demand charge ₹400/kVA/month on the recorded MD (floored at 75% of contract demand), energy ₹5.73 per kVAh plus ₹0.57 wheeling (apparent units = kWh ÷ power factor, so a poor PF raises the bill directly). Demand above contract demand is charged at 150% (state rule).",
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (MERC Case 211/2024)",
              estimated: false,
              fixedCharge: { type: "per_kva", rate: 400 },
              energySlabs: [ { limit: Infinity, rate: 6.13 } ],
              wheelingCharge: { type: "per_unit", rate: 0.74, label: "Wheeling Charges" }
            }
          ]
        }
      ]
    },
    {
      id: "best_mumbai",
      name: "BEST Mumbai",
      fullName: "Brihanmumbai Electricity Supply and Transport (BEST)",
      area: "Mumbai Island City (South Mumbai – Colaba to Mahim/Sion)",
      tariffYear: "2026-27",
      website: "https://www.bestundertaking.com",
      sourceUrl: "https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_BEST_English.pdf",
      ratesAsOf: "FY 2026-27 (MERC Case 207/2024)",
      categories: [
        {
          id: "domestic",
          name: "LT-I(B) (Residential)",
          // MERC BEST MYT Order (Case 207/2024), Annexure 3: fixed charge by consumption slab
          // (₹90 ≤100 u, ₹135 up to 500, ₹160 above), held at FY 2024-25 levels across the period.
          fixedCharge: {
            type: "by_consumption",
            slabs: [
              { maxUnits: 100, rate: 90, label: "Up to 100 units" },
              { maxUnits: 500, rate: 135, label: "101 – 500 units" },
              { maxUnits: Infinity, rate: 160, label: "Above 500 units" }
            ]
          },
          // Energy charge (₹/kWh), telescopic, FY 2026-27 (effective 1 Apr 2026).
          energySlabs: [
            { limit: 100, rate: 2.02 },
            { limit: 300, rate: 5.35 },
            { limit: 500, rate: 10.04 },
            { limit: Infinity, rate: 11.25 }
          ],
          wheelingCharge: { type: "per_unit", rate: 1.82, label: "Wheeling Charges" },
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ],
          currentRatesFrom: "2026-04-01",
          periodLabel: "FY 2026-27 (MERC Case 207/2024)",
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (MERC Case 207/2024)",
              estimated: false,
              fixedCharge: {
                type: "by_consumption",
                slabs: [
                  { maxUnits: 100, rate: 90, label: "Up to 100 units" },
                  { maxUnits: 500, rate: 135, label: "101 – 500 units" },
                  { maxUnits: Infinity, rate: 160, label: "Above 500 units" }
                ]
              },
              energySlabs: [
                { limit: 100, rate: 1.74 },
                { limit: 300, rate: 5.33 },
                { limit: 500, rate: 9.81 },
                { limit: Infinity, rate: 12.01 }
              ],
              wheelingCharge: { type: "per_unit", rate: 2.10, label: "Wheeling Charges" }
            }
          ]
        }
      ]
    },
    {
      id: "tata_power_mumbai",
      name: "Tata Power Mumbai",
      fullName: "Tata Power Company Ltd. – Mumbai Distribution",
      area: "Parts of Mumbai (Dharavi, Wadala, parts of Kurla, Chembur, etc.)",
      tariffYear: "2026-27",
      website: "https://www.tatapower.com",
      sourceUrl: "https://merc.gov.in/wp-content/uploads/2025/03/Press-Note_MYT-Order_TPC_English.pdf",
      ratesAsOf: "FY 2026-27 (MERC Case 210/2024)",
      categories: [
        {
          id: "domestic",
          name: "LT-I(B) (Residential)",
          // MERC TPC-D MYT Order (Case 210/2024), Annexure 3: fixed charge by consumption slab
          // (₹90 ≤100 u, ₹135 up to 500, ₹160 above), held at FY 2024-25 levels across the period.
          fixedCharge: {
            type: "by_consumption",
            slabs: [
              { maxUnits: 100, rate: 90, label: "Up to 100 units" },
              { maxUnits: 500, rate: 135, label: "101 – 500 units" },
              { maxUnits: Infinity, rate: 160, label: "Above 500 units" }
            ]
          },
          // Energy charge (₹/kWh), telescopic, FY 2026-27 (effective 1 Apr 2026).
          energySlabs: [
            { limit: 100, rate: 1.90 },
            { limit: 300, rate: 4.70 },
            { limit: 500, rate: 9.24 },
            { limit: Infinity, rate: 10.24 }
          ],
          wheelingCharge: { type: "per_unit", rate: 2.40, label: "Wheeling Charges" },
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ],
          currentRatesFrom: "2026-04-01",
          periodLabel: "FY 2026-27 (MERC Case 210/2024)",
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (MERC Case 210/2024)",
              estimated: false,
              fixedCharge: {
                type: "by_consumption",
                slabs: [
                  { maxUnits: 100, rate: 90, label: "Up to 100 units" },
                  { maxUnits: 500, rate: 135, label: "101 – 500 units" },
                  { maxUnits: Infinity, rate: 160, label: "Above 500 units" }
                ]
              },
              energySlabs: [
                { limit: 100, rate: 2.00 },
                { limit: 300, rate: 5.20 },
                { limit: 500, rate: 10.79 },
                { limit: Infinity, rate: 11.79 }
              ],
              wheelingCharge: { type: "per_unit", rate: 2.76, label: "Wheeling Charges" }
            }
          ]
        }
      ]
    }
  ]
};

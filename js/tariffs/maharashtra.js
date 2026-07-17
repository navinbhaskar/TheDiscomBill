// Maharashtra — Electricity Tariff Data
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.
//
// STATUS (2026-07): MSEDCL (whole state ex-Mumbai) updated to FY 2026-27 from the MERC MYT
// Order Case 217/2024. The three Mumbai licensees below — Adani, BEST, Tata Power — are each
// governed by their OWN MERC order (different case numbers) and are still on FY 2024-25 data;
// they remain to be audited against their respective FY 2026-27 orders.

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
      tariffYear: "2024-25",
      website: "https://www.adanielectricity.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Residential)",
          fixedCharge: {
            type: "tiered",
            slabs: [
              {
                maxLoad: 1,
                rate: 175,
                label: "Up to 1 kW"
              },
              {
                maxLoad: 2,
                rate: 280,
                label: "1 kW – 2 kW"
              },
              {
                maxLoad: 5,
                rate: 420,
                label: "2 kW – 5 kW"
              },
              {
                maxLoad: Infinity,
                rate: 630,
                label: "Above 5 kW"
              }
            ]
          },
          energySlabs: [
            {
              limit: 100,
              rate: 3.35
            },
            {
              limit: 300,
              rate: 6.58
            },
            {
              limit: 500,
              rate: 9.6
            },
            {
              limit: Infinity,
              rate: 10.57
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ]
        },
        {
          id: "ht_industrial",
          name: "HT-I Industrial (HT · kVA)",
          demandUnit: "kVA",
          fixedCharge: { type: "per_kva", rate: 472 },
          // Billing demand = higher of recorded MD or 75% of contract demand (common HT rule).
          billingDemandFloorPct: 75,
          energySlabs: [ { limit: Infinity, rate: 6.73 } ],
          additionalCharges: [ { name: "Electricity Duty (ED)", type: "percent_energy", rate: 9.3 } ],
          notes: "HT-I industrial supply, kVA based — demand charge ₹472/kVA/month on the recorded MD (floored at 75% of contract demand), energy ₹6.73 per kVAh (apparent units = kWh ÷ power factor, so a poor PF raises the bill directly). Demand above contract demand is charged at 150% (state rule). Representative FY2024-25 MSEDCL HT rates; verify with the official tariff order."
        }
      ]
    },
    {
      id: "best_mumbai",
      name: "BEST Mumbai",
      fullName: "Brihanmumbai Electricity Supply and Transport (BEST)",
      area: "Mumbai Island City (South Mumbai – Colaba to Mahim/Sion)",
      tariffYear: "2024-25",
      website: "https://www.bestundertaking.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Residential)",
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 3.07
            },
            {
              limit: 300,
              rate: 5.98
            },
            {
              limit: 500,
              rate: 8.9
            },
            {
              limit: Infinity,
              rate: 10
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
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
      tariffYear: "2024-25",
      website: "https://www.tatapower.com",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Residential)",
          fixedCharge: 70,
          energySlabs: [
            {
              limit: 100,
              rate: 3.1
            },
            {
              limit: 300,
              rate: 5.95
            },
            {
              limit: 500,
              rate: 8.9
            },
            {
              limit: Infinity,
              rate: 9.95
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 16
            }
          ]
        }
      ]
    }
  ]
};

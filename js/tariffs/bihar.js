// Bihar — Electricity Tariff Data (FY 2026-27)
// Source: BERC Tariff Order for NBPDCL & SBPDCL for FY 2026-27 (dt. 18-03-2026, eff. 01-04-2026)
//         Schedule of Tariff Rates: https://berc.co.in/images/pdf/tariff-order/2026-27/Tariff_Chart_FY_2026-27.pdf
// To update rates: edit the shared makeCategories() factory below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.
//
// BERC keeps a uniform "one state, one tariff" schedule across both discoms, so the categories
// are defined once and cloned per discom (same pattern as uttar-pradesh.js).
//
// Structure notes (all from the approved FY 2026-27 column of the chart):
//   · Domestic is FLAT ₹7.42/unit across Kutir Jyoti, DS-I and DS-II — BERC rejected the
//     proposed ₹7.77 and retained the FY 2025-26 rate; the old consumption slabs are gone.
//   · Non-domestic NDS-I and NDS-II (>0.5 kW) bill on kVA demand and kVAh energy.
//   · The FY 2026-27 order merged NDS slabs too (the >100-unit step is gone) and cut the
//     small-connection NDS-II fixed charge ₹200 → ₹150/connection.
//   · GoB gives every domestic consumer 125 units/month free since Aug 2025 — modelled as
//     DOMESTIC_SUBSIDY['Bihar'] in ./subsidy.js, not baked into these gross rates.

function makeCategories() {
  return [
    {
      id: "domestic",
      name: "LT Domestic (DS)",
      supplyTypes: [
        {
          id: "kutir-jyoti",
          name: "Kutir Jyoti (BPL)",
          description: "Below-poverty-line households under the Kutir Jyoti scheme. Flat ₹7.42/unit with a fixed charge of ₹20 per connection per month.",
          fixedCharge: 20,
          energySlabs: [{ limit: Infinity, rate: 7.42 }],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "ds1",
          name: "DS-I (Rural)",
          description: "Rural domestic supply. Flat ₹7.42/unit; fixed charge ₹40/kW/month on sanctioned load.",
          fixedCharge: { type: "per_kw", rate: 40 },
          energySlabs: [{ limit: Infinity, rate: 7.42 }],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          // The pre-restructure slabs our data carried for FY 2024-25 (never bill-verified).
          rateHistory: [
            {
              from: "2024-04-01",
              label: "FY 2024-25 (pre-restructure slabs)",
              estimated: true,
              fixedCharge: {
                type: "tiered",
                slabs: [
                  { maxLoad: 1, rate: 85, label: "Up to 1 kW" },
                  { maxLoad: 5, rate: 120, label: "1 kW – 5 kW" },
                  { maxLoad: Infinity, rate: 180, label: "Above 5 kW" }
                ]
              },
              energySlabs: [
                { limit: 50, rate: 4.2 },
                { limit: 100, rate: 5.25 },
                { limit: 200, rate: 5.75 },
                { limit: Infinity, rate: 6.15 }
              ]
            }
          ]
        },
        {
          id: "ds2",
          name: "DS-II (Urban / demand based)",
          description: "Urban domestic supply, demand based. Flat ₹7.42/unit; fixed charge ₹80/kW/month on sanctioned load.",
          fixedCharge: { type: "per_kw", rate: 80 },
          energySlabs: [{ limit: Infinity, rate: 7.42 }],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          rateHistory: [
            {
              from: "2024-04-01",
              label: "FY 2024-25 (pre-restructure slabs)",
              estimated: true,
              fixedCharge: {
                type: "tiered",
                slabs: [
                  { maxLoad: 1, rate: 85, label: "Up to 1 kW" },
                  { maxLoad: 5, rate: 120, label: "1 kW – 5 kW" },
                  { maxLoad: Infinity, rate: 180, label: "Above 5 kW" }
                ]
              },
              energySlabs: [
                { limit: 50, rate: 4.2 },
                { limit: 100, rate: 5.25 },
                { limit: 200, rate: 5.75 },
                { limit: Infinity, rate: 6.15 }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "commercial",
      name: "LT Non-Domestic (NDS)",
      supplyTypes: [
        {
          id: "nds1",
          name: "NDS-I (Rural, metered)",
          description: "Rural non-domestic/commercial supply. Billed on kVA demand and kVAh energy: flat ₹7.79/kVAh, fixed ₹60/kVA/month. A poor power factor raises the bill directly.",
          demandUnit: "kVA",
          fixedCharge: { type: "per_kva", rate: 60 },
          energySlabs: [{ limit: Infinity, rate: 7.79 }],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          // FY 2025-26 still had the >100-unit step, per the chart's "Existing" column.
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (BERC order)",
              estimated: false,
              fixedCharge: { type: "per_kva", rate: 60 },
              energySlabs: [
                { limit: 100, rate: 7.79 },
                { limit: Infinity, rate: 8.21 }
              ]
            }
          ]
        },
        {
          id: "nds2-small",
          name: "NDS-II (contract load up to 0.5 kW)",
          description: "Small non-domestic connections up to 0.5 kW contract load — kiosks, small shops. Flat ₹7.73/unit; fixed charge ₹150 per connection per month (cut from ₹200 in the FY 2026-27 order).",
          fixedCharge: 150,
          energySlabs: [{ limit: Infinity, rate: 7.73 }],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (BERC order)",
              estimated: false,
              fixedCharge: 200,
              energySlabs: [{ limit: Infinity, rate: 7.73 }]
            }
          ]
        },
        {
          id: "nds2",
          name: "NDS-II (above 0.5 kW, up to 70 kW)",
          description: "Non-domestic/commercial supply above 0.5 kW and up to 70 kW contract demand. Billed on kVA demand and kVAh energy: flat ₹7.73/kVAh, fixed ₹300/kVA/month.",
          demandUnit: "kVA",
          fixedCharge: { type: "per_kva", rate: 300 },
          energySlabs: [{ limit: Infinity, rate: 7.73 }],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          rateHistory: [
            {
              from: "2025-04-01",
              label: "FY 2025-26 (BERC order)",
              estimated: false,
              fixedCharge: { type: "per_kva", rate: 300 },
              energySlabs: [
                { limit: 100, rate: 7.73 },
                { limit: Infinity, rate: 8.93 }
              ]
            }
          ]
        }
      ]
    }
  ];
}

const DISCOM_META = [
  {
    id: "nbpdcl",
    name: "NBPDCL",
    fullName: "North Bihar Power Distribution Company Ltd.",
    area: "North Bihar (Muzaffarpur, Darbhanga, Begusarai, Bhagalpur, Purnia, etc.)",
    website: "https://www.nbpdcl.co.in"
  },
  {
    id: "sbpdcl",
    name: "SBPDCL",
    fullName: "South Bihar Power Distribution Company Ltd.",
    area: "South Bihar (Patna, Gaya, Nalanda, Aurangabad, Rohtas, etc.)",
    website: "https://www.sbpdcl.co.in"
  }
];

export default {
  state: "Bihar",
  currentRatesFrom: "2026-04-01",
  ratesAsOf: "FY 2026-27 (BERC order dt. 18-03-2026)",
  sourceUrl: "https://berc.co.in/images/pdf/tariff-order/2026-27/Tariff_Chart_FY_2026-27.pdf",
  discoms: DISCOM_META.map(d => ({
    ...d,
    tariffYear: "2026-27",
    categories: makeCategories(),
  })),
};

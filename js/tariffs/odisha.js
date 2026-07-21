// Odisha — Electricity Tariff Data (FY 2026-27)
// Source: OERC Retail Supply Tariff Order for FY 2026-27 (Case Nos. 124/128/132/136 of 2025,
//         dt. 24-03-2026, effective 01-04-2026):
//         https://www.orierc.org/CuteSoft_Client/writereaddata/upload/DISCOM_TARIFF_ORDER_FY_2026-27.pdf
// To update rates: edit the shared makeCategories() factory below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.
//
// OERC sets ONE uniform retail schedule for all four TP discoms (TPCODL/TPNODL/TPWODL/TPSODL),
// so the categories are defined once and cloned per discom (same pattern as bihar.js).
//
// Structure notes (from the order's tariff schedule + §467-471):
//   · Domestic (non-Kutir-Jyoti) slabs are telescopic: 290/470/570/610 paise at
//     ≤50 / 51-200 / 201-400 / >400 units per month. §469: the 10-paise-per-slab cut made in
//     FY 2024-25 "shall continue" in FY 2026-27 — rates are unchanged since 01-04-2024.
//   · Fixed charge is the MMFC: domestic ₹20 for the first kW + ₹20 per additional kW
//     (i.e. ₹20/kW); LT General Purpose <110 kVA ₹30/kW.
//   · Kutir Jyoti (≤30 units/month) is a SINGLE-part tariff: ₹70/month fixed, no energy charge
//     (§468: "will only pay the MMFC @ Rs.70.00 per month").
//   · Electricity duty under the Odisha Electricity (Duty) Act, 1961 is levied over and above
//     the tariff but is NOT part of the OERC schedule; for domestic it is a few paise per unit
//     (sources conflict on the exact figure), so it is deliberately not modelled here — the
//     previous 5%-of-energy entry was wrong and materially overstated bills.
//   · Rebates not modelled: 10 p/u prompt-payment rebate, 4% digital-payment rebate (LT
//     domestic/GP single-phase), 10 p/u rural-domestic discount.

function makeCategories() {
  return [
    {
      id: "domestic",
      name: "LT Domestic",
      supplyTypes: [
        {
          id: "general",
          name: "Domestic (other than Kutir Jyoti)",
          description: "Standard LT domestic supply. Telescopic slabs; MMFC ₹20 per kW of connected load.",
          fixedCharge: { type: "per_kw", rate: 20 },
          energySlabs: [
            { limit: 50, rate: 2.90 },
            { limit: 200, rate: 4.70 },
            { limit: 400, rate: 5.70 },
            { limit: Infinity, rate: 6.10 }
          ],
          notes: "Rates unchanged since 01-04-2024 (OERC cut every slab by 10 paise for FY 2024-25 and has retained the schedule in FY 2025-26 and FY 2026-27). Prompt-payment (10 p/unit) and 4% digital-payment rebates, and the 10 p/unit rural discount, are not included. Electricity duty (a few paise per unit under the Odisha Electricity (Duty) Act) is extra and not modelled.",
          rateHistory: [
            {
              from: "2023-04-01",
              label: "FY 2023-24 (pre-cut slabs, OERC RST Order FY 2023-24)",
              estimated: false,
              fixedCharge: { type: "per_kw", rate: 20 },
              energySlabs: [
                { limit: 50, rate: 3.00 },
                { limit: 200, rate: 4.80 },
                { limit: 400, rate: 5.80 },
                { limit: Infinity, rate: 6.20 }
              ]
            }
          ]
        },
        {
          id: "kutir-jyoti",
          name: "Kutir Jyoti (≤ 30 units/month)",
          description: "BPL households consuming up to 30 units a month pay only a flat ₹70/month — no energy charge.",
          fixedCharge: 70,
          energySlabs: [{ limit: Infinity, rate: 0 }],
          notes: "Single-part tariff: a Kutir Jyoti consumer pays the ₹70 monthly fixed charge only, provided consumption stays within 30 units/month. Above that, the general domestic schedule applies."
        }
      ]
    },
    {
      id: "commercial",
      name: "LT General Purpose (< 110 kVA)",
      fixedCharge: { type: "per_kw", rate: 30 },
      energySlabs: [
        { limit: 100, rate: 5.90 },
        { limit: 300, rate: 7.00 },
        { limit: Infinity, rate: 7.60 }
      ],
      notes: "OERC's General Purpose LT category (shops, offices and other non-domestic use below 110 kVA). MMFC ₹30 per kW. Rates retained from FY 2025-26. Electricity duty is extra and not modelled."
    }
  ];
}

const DISCOM_META = [
  {
    id: "tpcodl",
    name: "TPCODL",
    fullName: "TP Central Odisha Distribution Ltd. (Tata Power)",
    area: "Central Odisha (Bhubaneswar, Cuttack, Puri, Khordha, Jagatsinghpur, Kendrapara, Nayagarh, Angul, Dhenkanal)",
    website: "https://www.tpcentralodisha.com"
  },
  {
    id: "tpnodl",
    name: "TPNODL",
    fullName: "TP Northern Odisha Distribution Ltd. (Tata Power)",
    area: "North Odisha (Balasore, Bhadrak, Jajpur, Kendujhar, Mayurbhanj, Sundargarh)",
    website: "https://www.tpnodl.com"
  },
  {
    id: "tpwodl",
    name: "TPWODL",
    fullName: "TP Western Odisha Distribution Ltd. (Tata Power)",
    area: "West Odisha (Sambalpur, Bargarh, Boudh, Deogarh, Jharsuguda, Nuapada, Bolangir, Subarnapur)",
    website: "https://www.tpwesternodisha.com"
  },
  {
    id: "tpsodl",
    name: "TPSODL",
    fullName: "TP Southern Odisha Distribution Ltd. (Tata Power)",
    area: "South Odisha (Ganjam, Gajapati, Kandhamal, Kalahandi, Koraput, Nabarangpur, Rayagada, Malkangiri)",
    website: "https://www.tpsouthernodisha.com"
  }
];

export default {
  state: "Odisha",
  currentRatesFrom: "2024-04-01",
  ratesAsOf: "FY 2026-27 (OERC RST Order dt. 24-03-2026 — FY 2024-25 rates retained)",
  sourceUrl: "https://www.orierc.org/CuteSoft_Client/writereaddata/upload/DISCOM_TARIFF_ORDER_FY_2026-27.pdf",
  discoms: DISCOM_META.map(meta => ({
    ...meta,
    tariffYear: "2026-27",
    categories: makeCategories()
  }))
};

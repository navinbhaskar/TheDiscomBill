// West Bengal — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "West Bengal",
  discoms: [
    {
      id: "wbsedcl",
      name: "WBSEDCL",
      fullName: "West Bengal State Electricity Distribution Company Ltd.",
      area: "All of West Bengal outside the CESC and DPL licence areas",
      tariffYear: "2025-26",
      website: "https://www.wbsedcl.in",
      ratesAsOf: "FY 2025-26 (WBERC tariff order, effective 01-Apr-2025, continues till further order)",
      sourceUrl: "https://www.wbsedcl.in/irj/go/km/docs/internet/new_website/pdf/Tariff_Volumn/Gist%20of%20Tariff%20Order%202025-26_28_03.pdf",
      categories: [
        {
          id: "domestic",
          name: "Rate A (DM) — Domestic",
          // Rs 30 per kVA per month, NOT the flat Rs 35 the previous data carried. WBSEDCL
          // states this as a demand charge in Rs/kVA/month; for a domestic consumer the
          // calculator resolves it on sanctioned load.
          fixedCharge: { type: "per_kva", rate: 30 },
          // WBSEDCL bills QUARTERLY and its published slabs are quarterly: first 102 kWh,
          // next 78, next 120, next 300, next 300, above 900. Stored here as monthly
          // equivalents (divided by 3 — 34 / 60 / 100 / 200 / 300) because the engine
          // prorates slab limits by the number of billing months, and the calculator's
          // default period is one month. The division lands on round numbers, which is a
          // good sign the quarterly figures were derived from monthly ones in the first
          // place. Same convention as Tamil Nadu, which bills bi-monthly.
          // Rates are Domestic (Urban), Rate A(DM-U), in paise per kWh.
          energySlabs: [
            { limit: 34,       rate: 5.04 },
            { limit: 60,       rate: 6.33 },
            { limit: 100,      rate: 7.12 },
            { limit: 200,      rate: 7.52 },
            { limit: 300,      rate: 7.69 },
            { limit: Infinity, rate: 9.22 },
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              // UNVERIFIED — carried from the previous data. The order says statutory levies
              // are imposed by the State Govt and sit outside the tariff schedule (note 12).
              rate: 4,
            },
          ],
          supplyTypes: [
            {
              id: "urban",
              name: "Domestic (Urban) — Rate A(DM-U)",
              description: "Domestic supply in municipal areas",
              fixedCharge: { type: "per_kva", rate: 30 },
              energySlabs: [
                { limit: 34,       rate: 5.04 },
                { limit: 60,       rate: 6.33 },
                { limit: 100,      rate: 7.12 },
                { limit: 200,      rate: 7.52 },
                { limit: 300,      rate: 7.69 },
                { limit: Infinity, rate: 9.22 },
              ],
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 }],
            },
            {
              id: "rural",
              name: "Domestic (Rural) — Rate A(DM-R)",
              description: "Domestic supply outside municipal areas",
              fixedCharge: { type: "per_kva", rate: 30 },
              energySlabs: [
                { limit: 34,       rate: 5.00 },
                { limit: 60,       rate: 6.24 },
                { limit: 100,      rate: 6.89 },
                { limit: 200,      rate: 7.44 },
                { limit: 300,      rate: 7.61 },
                { limit: Infinity, rate: 9.22 },
              ],
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 }],
            },
            {
              id: "lifeline",
              name: "Lifeline (Domestic) — Rate A(DM-LL), \"Hasir Alo\"",
              description: "Up to 75 units a quarter (25 a month); fully covered by the State subsidy",
              fixedCharge: { type: "per_kva", rate: 10 },
              // 368 paise gross. The State subsidy takes both the energy and fixed charge to
              // nil for this scheme, so an eligible household pays zero — the gross rate is
              // modelled here and the subsidy is not applied automatically.
              energySlabs: [{ limit: Infinity, rate: 3.68 }],
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 }],
            },
          ],
          notes: "WBSEDCL bills quarterly; the slabs above are the published quarterly bands (102 / 78 / 120 / 300 / 300 / above 900 kWh) expressed as monthly equivalents. Lifeline consumers under the Hasir Alo scheme pay nothing after the State subsidy. Bills also carry a Monthly Variable Cost Adjustment (MVCA), which WBERC revises month to month and which is not modelled here.",
        },
        {
          id: "commercial",
          name: "Rate A (CM) — Commercial",
          fixedCharge: { type: "per_kva", rate: 60 },
          // Quarterly bands first 180 / next 120 / next 150 / next 450 / above 900,
          // as monthly equivalents.
          energySlabs: [
            { limit: 60,       rate: 5.77 },
            { limit: 100,      rate: 7.52 },
            { limit: 150,      rate: 8.20 },
            { limit: 300,      rate: 8.51 },
            { limit: Infinity, rate: 9.02 },
          ],
          additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 }],
          notes: "Quarterly bands expressed as monthly equivalents. Excludes the MVCA.",
        },
      ],
    },
    {
      id: "cesc_kolkata",
      name: "CESC (Kolkata)",
      fullName: "CESC Ltd. (Calcutta Electric Supply Corporation)",
      area: "Kolkata city, Howrah, Hooghly (parts)",
      tariffYear: "2024-25",
      website: "https://www.cesc.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic (Residential)",
          fixedCharge: 15,
          energySlabs: [
            {
              limit: 25,
              rate: 4.61
            },
            {
              limit: 75,
              rate: 5.83
            },
            {
              limit: 200,
              rate: 7.41
            },
            {
              limit: 300,
              rate: 7.99
            },
            {
              limit: Infinity,
              rate: 8.84
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 4
            },
            {
              name: "Meter Rent",
              type: "flat",
              rate: 15
            }
          ]
        }
      ]
    },
    {
      id: "dpl",
      name: "DPL",
      fullName: "CESC DPL (Durgapur Projects Ltd.)",
      area: "Durgapur industrial and urban area",
      tariffYear: "2024-25",
      website: "https://www.dpl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 35,
          energySlabs: [
            {
              limit: 25,
              rate: 4.5
            },
            {
              limit: 75,
              rate: 5.5
            },
            {
              limit: 200,
              rate: 7
            },
            {
              limit: Infinity,
              rate: 8.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty (ED)",
              type: "percent_energy",
              rate: 4
            }
          ]
        }
      ]
    }
  ]
};

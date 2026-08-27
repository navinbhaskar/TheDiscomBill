// West Bengal — Electricity Tariff Data (FY 2025-26, continuing till further order)
// Three separate schedules, each with its own WBERC order and its own ratesAsOf below:
//   wbsedcl      — WBERC order dt. 28-03-2025. Published QUARTERLY; stored as monthly bands.
//   cesc_kolkata — WBERC order dt. 25-03-2025. Published monthly.
//   dpl          — WBERC order dt. 20-03-2025. Not a licensee since 01-01-2019; WBSEDCL bills
//                  these consumers on a schedule frozen at its 31-12-2018 level.
// Every WB bill also carries an MVCA that WBERC revises and trues up; it is not modelled.
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
          // The order says statutory levies are imposed by the State Govt and sit outside the
          // tariff schedule (note 12), so the rate is not in it. This was carried as a flat 4%
          // and flagged unverified; West Bengal actually charges nothing on the first 300 units
          // a month and 10% above that, so the flat rate overcharged small households and
          // undercharged large ones. West Bengal is not in CEA's energy-charge-only list, so
          // the base is the wider bill.
          // Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge.
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_total", rate: 10, minUnits: 300 },
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
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_total", rate: 10, minUnits: 300 }],
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
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_total", rate: 10, minUnits: 300 }],
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
              additionalCharges: [{ name: "Electricity Duty (ED)", type: "percent_total", rate: 10, minUnits: 300 }],
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
      tariffYear: "2025-26",
      // Note 13 of the schedule: the rates are effective from 1 April 2025 "and onwards",
      // and continue till further order of the Commission — so they remain in force.
      ratesAsOf: "WBERC order dt. 25-Mar-2025, w.e.f. 1 April 2025 (continues till further order)",
      sourceUrl: "https://www.cesc.co.in/tariff",
      categories: [
        {
          id: "domestic",
          name: "Rate G — LT Domestic",
          // Rs/kVA/month. Note to the schedule: a Fixed Charge applies below 50 kVA of
          // contract demand and a Demand Charge at 50 kVA and above.
          fixedCharge: { type: "per_kva", rate: 15 },
          // Published as First 25 / Next 35 / Next 40 / Next 50 / Next 50 / Next 100 /
          // Above 300, in paise per kWh. Kept as separate bands even where two carry the
          // same rate (151-200 and 201-300 are both 762p), to mirror the schedule.
          energySlabs: [
            { limit: 25,       rate: 5.18 },
            { limit: 60,       rate: 5.69 },
            { limit: 100,      rate: 6.70 },
            { limit: 150,      rate: 7.45 },
            { limit: 200,      rate: 7.62 },
            { limit: 300,      rate: 7.62 },
            { limit: Infinity, rate: 9.21 },
          ],
          supplyTypes: [
            {
              id: "urban",
              name: "Domestic (Urban) — Rate G",
              description: "The ordinary CESC household tariff: seven telescopic bands from ₹5.18 to ₹9.21, on a ₹15/kVA/month fixed charge.",
              fixedCharge: { type: "per_kva", rate: 15 },
              energySlabs: [
                { limit: 25,       rate: 5.18 },
                { limit: 60,       rate: 5.69 },
                { limit: 100,      rate: 6.70 },
                { limit: 150,      rate: 7.45 },
                { limit: 200,      rate: 7.62 },
                { limit: 300,      rate: 7.62 },
                { limit: Infinity, rate: 9.21 },
              ],
            },
            {
              id: "lifeline",
              name: "Life Line (Domestic) — Rate G(LL)",
              description: "For eligible low-consumption households only, capped at 25 units a month: ₹4.07/unit on a ₹5 fixed charge.",
              fixedCharge: { type: "per_kva", rate: 5 },
              energySlabs: [{ limit: Infinity, rate: 4.07 }],
            },
          ],
          notes: "CESC's domestic tariff is telescopic across seven published bands. The fixed charge is ₹15 per kVA per month — CESC states it in Rs/kVA, and it becomes a demand charge once contract demand reaches 50 kVA. Bills also carry a Monthly Variable Cost Adjustment (MVCA), which WBERC trues up and which is not modelled here, and statutory levies such as electricity duty which note 12 of the schedule places outside the tariff.",
        },
        {
          id: "commercial",
          name: "Rate M — LT Commercial & others",
          fixedCharge: { type: "per_kva", rate: 24 },
          energySlabs: [
            { limit: 60,       rate: 6.57 },
            { limit: 100,      rate: 7.24 },
            { limit: 150,      rate: 7.93 },
            { limit: 300,      rate: 8.49 },
            { limit: Infinity, rate: 9.26 },
          ],
          supplyTypes: [
            {
              id: "commercial",
              name: "Commercial (Urban) — Rate M(i)",
              description: "Shops and offices: five telescopic bands from ₹6.57 to ₹9.26 on ₹24/kVA/month. An optional Time-of-Day scheme is available at the same fixed charge.",
              fixedCharge: { type: "per_kva", rate: 24 },
              energySlabs: [
                { limit: 60,       rate: 6.57 },
                { limit: 100,      rate: 7.24 },
                { limit: 150,      rate: 7.93 },
                { limit: 300,      rate: 8.49 },
                { limit: Infinity, rate: 9.26 },
              ],
            },
            {
              id: "cottage",
              name: "Cottage industry / artisan / weavers — Rate M(ii)",
              description: "Small production units not run by electricity as motive power: ₹5.82 for the first 100 units, ₹7.01 for the next 100, ₹8.46 above 200.",
              fixedCharge: { type: "per_kva", rate: 24 },
              energySlabs: [
                { limit: 100,      rate: 5.82 },
                { limit: 200,      rate: 7.01 },
                { limit: Infinity, rate: 8.46 },
              ],
            },
            {
              id: "schools",
              name: "Government / Government-aided schools — Rate P1",
              description: "₹5.24 on all units at a ₹12/kVA/month fixed charge — the cheapest non-lifeline rate CESC publishes.",
              fixedCharge: { type: "per_kva", rate: 12 },
              energySlabs: [{ limit: Infinity, rate: 5.24 }],
            },
            {
              id: "education_hospital",
              name: "Private educational institutions and hospitals — Rate L",
              description: "₹7.32 on all units at ₹42/kVA/month.",
              fixedCharge: { type: "per_kva", rate: 42 },
              energySlabs: [{ limit: Infinity, rate: 7.32 }],
            },
            {
              id: "industry",
              name: "Industries (Urban) — Rate K",
              description: "₹6.77 for the first 500 units, ₹7.47 for the next 1500, ₹7.87 for the next 1500 and ₹8.07 above 3500, on ₹50/kVA/month.",
              fixedCharge: { type: "per_kva", rate: 50 },
              energySlabs: [
                { limit: 500,      rate: 6.77 },
                { limit: 2000,     rate: 7.47 },
                { limit: 3500,     rate: 7.87 },
                { limit: Infinity, rate: 8.07 },
              ],
            },
          ],
          notes: "CESC publishes a long list of LT categories; the ones modelled here are selectable above. Most non-domestic categories also offer an optional Time-of-Day or prepaid scheme at the same fixed charge, which is not modelled. MVCA and statutory levies are extra.",
        },
      ],
    },
    {
      // DPL stopped being a distribution licensee on 01-01-2019, when its distribution
      // business transferred to WBSEDCL; DPL's own WBERC orders are now GENERATION tariffs
      // (capacity and energy charge per generating unit). WBERC nonetheless maintains a
      // separate, frozen retail schedule for erstwhile-DPL consumers — "similar to that as
      // on 31.12.2018" — which is materially cheaper than either CESC or WBSEDCL proper.
      // The `dpl` id is kept for URL continuity, the same reasoning as Telangana's tsspdcl.
      id: "dpl",
      name: "Erstwhile DPL area",
      fullName: "Erstwhile Durgapur Projects Ltd. area — supplied by WBSEDCL",
      area: "Durgapur industrial and urban area (billed by WBSEDCL on the frozen erstwhile-DPL schedule)",
      tariffYear: "2025-26",
      ratesAsOf: "WBERC order dt. 20-Mar-2025 for FY 2025-26 (schedule maintained at its 31-12-2018 level)",
      sourceUrl: "https://www.wbsedcl.in/irj/go/km/docs/internet/new_website/pdf/Tariff_Volumn/Gist%20of%20Tariff%20Order%202025-26_28_03.pdf",
      categories: [
        {
          id: "domestic",
          name: "Rate C(3) — Domestic",
          fixedCharge: { type: "per_kva", rate: 15 },
          // Published monthly (unlike WBSEDCL's own quarterly bands): First 25 / Next 25 /
          // Next 50 / Next 100 / Next 100 / Above 300, in paise per kWh.
          energySlabs: [
            { limit: 25,       rate: 3.45 },
            { limit: 50,       rate: 4.20 },
            { limit: 100,      rate: 4.35 },
            { limit: 200,      rate: 4.67 },
            { limit: 300,      rate: 4.86 },
            { limit: Infinity, rate: 4.99 },
          ],
          supplyTypes: [
            {
              id: "normal",
              name: "Domestic (Rural or Urban) — Rate C(3)",
              description: "Six telescopic bands from ₹3.45 to ₹4.99 on a ₹15/kVA/month fixed charge — frozen at 2018 levels, and about a third cheaper than a CESC household pays at the same consumption.",
              fixedCharge: { type: "per_kva", rate: 15 },
              energySlabs: [
                { limit: 25,       rate: 3.45 },
                { limit: 50,       rate: 4.20 },
                { limit: 100,      rate: 4.35 },
                { limit: 200,      rate: 4.67 },
                { limit: 300,      rate: 4.86 },
                { limit: Infinity, rate: 4.99 },
              ],
            },
            {
              id: "prepaid",
              name: "Domestic prepaid — Rate C(3)pp",
              description: "A single ₹4.18/unit on all units for prepaid domestic consumers, at the same ₹15/kVA fixed charge. Better than the standard schedule above about 100 units a month.",
              fixedCharge: { type: "per_kva", rate: 15 },
              energySlabs: [{ limit: Infinity, rate: 4.18 }],
            },
            {
              id: "lifeline",
              name: "Life Line (Domestic) — Rate C(3-LL)",
              description: "Up to 25 units a month at ₹2.50/unit on a ₹5 fixed charge. The State's Hasir Alo subsidy applies to this category.",
              fixedCharge: { type: "per_kva", rate: 5 },
              energySlabs: [{ limit: Infinity, rate: 2.50 }],
            },
          ],
          notes: "Durgapur Projects Ltd. stopped distributing electricity on 1 January 2019, when its distribution business passed to WBSEDCL. WBERC has since held the retail schedule for erstwhile-DPL consumers at its 31 December 2018 level, so these rates are markedly lower than either CESC's or WBSEDCL's own — 300 units costs about ₹1,392 here against roughly ₹2,142 on CESC's domestic schedule. Bills are issued by WBSEDCL. Unlike WBSEDCL's main schedule, these bands are monthly, not quarterly. MVCA and statutory levies are extra.",
        },
        {
          id: "commercial",
          name: "Rate C(4) — Commercial",
          fixedCharge: { type: "per_kva", rate: 30 },
          energySlabs: [
            { limit: 60,       rate: 4.31 },
            { limit: 100,      rate: 4.72 },
            { limit: 300,      rate: 4.92 },
            { limit: Infinity, rate: 5.05 },
          ],
          notes: "Four telescopic monthly bands from ₹4.31 to ₹5.05 on a ₹30/kVA/month fixed charge, frozen at the 31-12-2018 level. Optional Time-of-Day and prepaid schemes exist and are not modelled. MVCA and statutory levies are extra.",
        },
      ],
    },
  ],
};

// Meghalaya — Electricity Tariff Data (FY 2026-27)
// Rates: MSERC Order in Case No. 11 of 2025, "Order on Revised ARR & Distribution Tariff
// for FY 2026-27 for MePDCL", dated 26-03-2026, Chapter 9 Schedule of Approved Tariffs.
// Every figure below is the APPROVED column. MePDCL proposed no change to the domestic or
// non-domestic structure and MSERC retained it.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

const ML_DOMESTIC_TYPES = [
  {
    id: "domestic",
    name: "Domestic (DLT)",
    description: "Three telescopic slabs on ₹90 per kVA per month. The slabs barely differ — ₹5.00, ₹5.04 and ₹5.10 — so consumption has almost no effect on the rate you pay.",
    fixedCharge: { type: "per_kva", rate: 90 },
    energySlabs: [
      { limit: 100, rate: 5.00 },
      { limit: 200, rate: 5.04 },
      { limit: Infinity, rate: 5.10 },
    ],
  },
  {
    id: "kutir_jyoti",
    name: "Kutir Jyoti / BPL — metered, up to 30 units",
    description: "₹4.57/unit for BPL metered connections, for consumption up to 30 units a month. Beyond 30 units the excess is billed at ordinary domestic slab rates.",
    fixedCharge: { type: "per_kva", rate: 90 },
    energySlabs: [{ limit: Infinity, rate: 4.57 }],
  },
  {
    id: "kutir_jyoti_unmetered",
    name: "Kutir Jyoti — unmetered",
    description: "A flat ₹210 per connection per month, with no metering and no energy charge.",
    fixedCharge: { type: "flat", rate: 210 },
    energySlabs: [{ limit: Infinity, rate: 0 }],
  },
];

export default {
  state: "Meghalaya",
  ratesAsOf: "FY 2026-27 (MSERC Order in Case No. 11 of 2025, dated 26-03-2026)",
  sourceUrl: "https://mserc.gov.in/tarifforders.html",
  discoms: [
    {
      id: "mepdcl",
      name: "MePDCL",
      fullName: "Meghalaya Power Distribution Corporation Ltd.",
      area: "Entire Meghalaya",
      tariffYear: "2026-27",
      website: "https://www.mepdcl.in",
      categories: [
        {
          id: "domestic",
          // Domestic electricity duty: 5 paise/unit. CEA does not list this state as energy-charge-only, so duty applies to the wider bill.
          // Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply
          // in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge.
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: [{ name: "Electricity Duty", type: "per_unit", rate: 0.05 }],
          name: "Domestic (Low Tension)",
          supplyTypes: ML_DOMESTIC_TYPES,
          fixedCharge: ML_DOMESTIC_TYPES[0].fixedCharge,
          energySlabs: ML_DOMESTIC_TYPES[0].energySlabs,
          notes: "Meghalaya's domestic slabs are almost flat — ₹5.00, ₹5.04 and ₹5.10 — so unlike most states, cutting consumption to stay under a slab boundary saves you essentially nothing here. What matters instead is the fixed charge, which is levied per kVA of load rather than per kW, so it is your sanctioned load and power factor that drive the standing cost. The domestic category is broad: it also covers places of worship, non-profit hospitals and schools, hostels, dharamshalas and community halls. Domestic bills here include Meghalaya's 5 paise/unit electricity duty; other State levies are charged in addition.",
        },
        {
          id: "commercial",
          name: "Non-Domestic / Commercial (Low Tension)",
          fixedCharge: { type: "per_kva", rate: 170 },
          energySlabs: [{ limit: Infinity, rate: 7.45 }],
          notes: "Non-domestic is a single rate on every unit — ₹7.45 — with no slabs at all, against a ₹170 per kVA monthly fixed charge. That is nearly twice the domestic energy rate and nearly twice the domestic fixed charge, so the commercial/domestic classification of a connection matters far more in Meghalaya than any consumption threshold. Electricity duty and other State levies are charged in addition.",
        },
      ],
    },
  ],
};

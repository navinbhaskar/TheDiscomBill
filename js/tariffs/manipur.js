// Manipur — Electricity Tariff Data (FY 2026-27)
// Source: MnERC retail tariff order for MSPDCL, Petition (ARR & Tariff) No. 2 of 2025-26.
// Effective from 01-May-2026 until the next tariff order. Corrigendum dated 17-Jun-2026
// changes pole/tower usage charges only; LT domestic and commercial rates remain unchanged.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Manipur",
  ratesAsOf: "FY 2026-27 (MnERC MSPDCL tariff order dated 14-May-2026, effective from 01-May-2026)",
  sourceUrl: "https://mnerc.mn.gov.in/wp-content/uploads/2026/05/MSPDCL-Tariff-Order-FY-2026-27_compressed.pdf",
  discoms: [
    {
      id: "mspdcl",
      name: "MSPDCL",
      fullName: "Manipur State Power Distribution Company Ltd.",
      area: "Entire Manipur",
      tariffYear: "2026-27",
      website: "https://mspdcl.in/",
      categories: [
        {
          id: "domestic",
          name: "LT Category-2 (Domestic)",
          fixedCharge: { type: "per_kw", rate: 65 },
          energySlabs: [
            {
              limit: 100,
              rate: 5.36
            },
            {
              limit: 200,
              rate: 6.25
            },
            {
              limit: Infinity,
              rate: 7.1
            }
          ],
          // No domestic electricity duty. CEA records Nil for Manipur in both the FY2021-22 and
          // FY2023-24 editions of its duty compilation, so the 5% we carried here was not a rate
          // that has since changed — it was never levied. Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: []
        },
        {
          id: "commercial",
          name: "LT Category-3 (Non-Domestic / Commercial)",
          fixedCharge: { type: "per_kw", rate: 85 },
          energySlabs: [
            {
              limit: 100,
              rate: 7.07
            },
            {
              limit: 200,
              rate: 7.85
            },
            {
              limit: Infinity,
              rate: 8.3
            }
          ],
          // No non-domestic electricity duty. CEA records Nil for Manipur in both the FY2021-22 and
          // FY2023-24 editions of its duty compilation, so the 5% we carried here was not a rate
          // that has since changed — it was never levied. Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: []
        }
      ]
    }
  ]
};

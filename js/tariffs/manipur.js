// Manipur — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Manipur",
  discoms: [
    {
      id: "mspdcl",
      name: "MSPDCL",
      fullName: "Manipur State Power Distribution Company Ltd.",
      area: "Entire Manipur",
      tariffYear: "2024-25",
      website: "https://www.mspdcl.com",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 40,
          energySlabs: [
            {
              limit: 30,
              rate: 2.35
            },
            {
              limit: 100,
              rate: 4.45
            },
            {
              limit: Infinity,
              rate: 5.95
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
          name: "LT-II (Commercial)",
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 6
            },
            {
              limit: Infinity,
              rate: 7.5
            }
          ],
          // No domestic electricity duty. CEA records Nil for Manipur in both the FY2021-22 and
          // FY2023-24 editions of its duty compilation, so the 5% we carried here was not a rate
          // that has since changed — it was never levied. Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: []
        }
      ]
    }
  ]
};

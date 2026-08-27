// Mizoram — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Mizoram",
  discoms: [
    {
      id: "ped_mizoram",
      name: "P&E Dept., Mizoram",
      fullName: "Power & Electricity Department, Government of Mizoram",
      area: "Entire Mizoram",
      tariffYear: "2024-25",
      website: "https://mizoram.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 2.5
            },
            {
              limit: 100,
              rate: 4
            },
            {
              limit: Infinity,
              rate: 6
            }
          ],
          // No domestic electricity duty. CEA records Nil for Mizoram in both the FY2021-22 and
          // FY2023-24 editions of its duty compilation, so the 5% we carried here was not a rate
          // that has since changed — it was never levied. Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: []
        }
      ]
    }
  ]
};

// Ladakh — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Ladakh",
  discoms: [
    {
      id: "lpdcl",
      name: "LPDCL / Ladakh Power Dept.",
      fullName: "Ladakh Power Development Corp. / Power Development Dept., Ladakh",
      area: "Leh, Kargil districts",
      tariffYear: "2024-25",
      website: "https://ladakh.gov.in",
      categories: [
        {
          id: "domestic",
          // Domestic electricity duty: 15% of energy. CEA records duty on the energy charge only for this state.
          // Source: CEA, "Electricity Tariff & Duty and Average Rates of Electricity Supply
          // in India" (FY 2023-24), Table: Details of electricity duty/taxes/cess/surcharge.
          // https://cea.nic.in/wp-content/uploads/fs___a/2025/06/Book_2024.pdf
          additionalCharges: [{ name: "Electricity Duty", type: "percent_energy", rate: 15 }],
          name: "LT Domestic",
          fixedCharge: 20,
          energySlabs: [
            {
              limit: 50,
              rate: 0.5
            },
            {
              limit: 100,
              rate: 1
            },
            {
              limit: Infinity,
              rate: 2.5
            }
          ],
          notes: "Heavily subsidized by UT Administration."
        }
      ]
    }
  ]
};

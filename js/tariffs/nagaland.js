// Nagaland — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Nagaland",
  discoms: [
    {
      id: "doe_nagaland",
      name: "DoE Nagaland",
      fullName: "Department of Electricity, Government of Nagaland",
      area: "Entire Nagaland",
      tariffYear: "2024-25",
      website: "https://nagaland.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 35,
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
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 5
            }
          ]
        }
      ]
    }
  ]
};

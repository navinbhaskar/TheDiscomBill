// Sikkim — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Sikkim",
  discoms: [
    {
      id: "energy_sikkim",
      name: "Energy & Power Dept., Sikkim",
      fullName: "Energy & Power Department, Government of Sikkim",
      area: "Entire Sikkim",
      tariffYear: "2024-25",
      website: "https://sikkim.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT Domestic",
          fixedCharge: 20,
          energySlabs: [
            {
              limit: 50,
              rate: 1.5
            },
            {
              limit: 100,
              rate: 3
            },
            {
              limit: Infinity,
              rate: 5
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

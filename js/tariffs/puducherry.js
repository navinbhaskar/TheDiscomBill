// Puducherry — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Puducherry",
  discoms: [
    {
      id: "pdicl",
      name: "PDICL / Electricity Dept.",
      fullName: "Puducherry Electricity Dept. / PDI Corporation Ltd.",
      area: "Puducherry, Karaikal, Mahe, Yanam",
      tariffYear: "2024-25",
      website: "https://electricity.py.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 50,
              rate: 1.5
            },
            {
              limit: 100,
              rate: 2
            },
            {
              limit: 200,
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
        },
        {
          id: "commercial",
          name: "LT-II (Commercial)",
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 5
            },
            {
              limit: Infinity,
              rate: 7
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

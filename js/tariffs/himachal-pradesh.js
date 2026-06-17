// Himachal Pradesh — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Himachal Pradesh",
  discoms: [
    {
      id: "hpsebl",
      name: "HPSEBL",
      fullName: "Himachal Pradesh State Electricity Board Ltd.",
      area: "Entire Himachal Pradesh",
      tariffYear: "2024-25",
      website: "https://www.hpseb.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic)",
          fixedCharge: 20,
          energySlabs: [
            {
              limit: 60,
              rate: 0.35,
              label: "Subsidised slab"
            },
            {
              limit: 125,
              rate: 2
            },
            {
              limit: 300,
              rate: 3.5
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
          ],
          notes: "First 60 units at heavily subsidized rate per HP government policy."
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial)",
          fixedCharge: 50,
          energySlabs: [
            {
              limit: 100,
              rate: 4
            },
            {
              limit: 300,
              rate: 5.5
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

// Chandigarh — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Chandigarh",
  discoms: [
    {
      id: "chandigarh_ed",
      name: "Chandigarh Admin. Electricity Dept.",
      fullName: "Electricity Department, Chandigarh Administration",
      area: "Chandigarh Union Territory",
      tariffYear: "2024-25",
      website: "https://www.edc.gov.in",
      categories: [
        {
          id: "domestic",
          name: "DS (Domestic Supply)",
          fixedCharge: 40,
          energySlabs: [
            {
              limit: 150,
              rate: 2.12
            },
            {
              limit: 400,
              rate: 3.97
            },
            {
              limit: Infinity,
              rate: 4.95
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
          name: "NDS (Non-Domestic Supply)",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: 300,
              rate: 6.5
            },
            {
              limit: Infinity,
              rate: 7.5
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

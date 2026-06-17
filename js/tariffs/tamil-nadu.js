// Tamil Nadu — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Tamil Nadu",
  discoms: [
    {
      id: "tangedco",
      name: "TANGEDCO",
      fullName: "Tamil Nadu Generation and Distribution Corporation Ltd.",
      area: "Entire Tamil Nadu",
      tariffYear: "2024-25",
      website: "https://www.tangedco.gov.in",
      categories: [
        {
          id: "domestic",
          name: "LT-1 (Domestic – Bimonthly Billing)",
          fixedCharge: 30,
          energySlabs: [
            {
              limit: 100,
              rate: 0,
              label: "Free (first 100 units per 2 months)"
            },
            {
              limit: 200,
              rate: 1.5
            },
            {
              limit: 500,
              rate: 3
            },
            {
              limit: 1000,
              rate: 5.75
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
          ],
          notes: "TANGEDCO bills bimonthly. First 100 units free per 2-month cycle for consumers using ≤500 units. If usage >500 units/2 months, regular rate applies to all units. This calculator shows monthly estimate; multiply units by 2 for bimonthly check."
        },
        {
          id: "commercial",
          name: "LT-2 (Commercial / Non-Domestic)",
          fixedCharge: 60,
          energySlabs: [
            {
              limit: 100,
              rate: 5.25
            },
            {
              limit: 300,
              rate: 6.75
            },
            {
              limit: Infinity,
              rate: 8
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

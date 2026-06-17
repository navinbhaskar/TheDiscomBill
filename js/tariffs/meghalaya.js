// Meghalaya — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Meghalaya",
  discoms: [
    {
      id: "mepdcl",
      name: "MePDCL",
      fullName: "Meghalaya Power Distribution Corporation Ltd.",
      area: "Entire Meghalaya",
      tariffYear: "2024-25",
      website: "https://www.mepdcl.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 40,
          energySlabs: [
            {
              limit: 60,
              rate: 3
            },
            {
              limit: 120,
              rate: 4.5
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
        },
        {
          id: "commercial",
          name: "LT-II (Commercial)",
          fixedCharge: 70,
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

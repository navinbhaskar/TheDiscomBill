// Chhattisgarh — Electricity Tariff Data (2024-25)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit energySlabs, fixedCharge, or additionalCharges below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.

export default {
  state: "Chhattisgarh",
  discoms: [
    {
      id: "cspdcl",
      name: "CSPDCL",
      fullName: "Chhattisgarh State Power Distribution Company Ltd.",
      area: "Entire Chhattisgarh",
      tariffYear: "2024-25",
      website: "https://www.cspdcl.co.in",
      categories: [
        {
          id: "domestic",
          name: "LT-I (Domestic)",
          fixedCharge: 50,
          energySlabs: [
            {
              limit: 30,
              rate: 0,
              label: "BPL (free for qualifying consumers)"
            },
            {
              limit: 100,
              rate: 3.3
            },
            {
              limit: 200,
              rate: 5
            },
            {
              limit: 400,
              rate: 5.5
            },
            {
              limit: Infinity,
              rate: 6.5
            }
          ],
          additionalCharges: [
            {
              name: "Electricity Duty",
              type: "percent_energy",
              rate: 5
            }
          ],
          notes: "First 30 units at reduced / zero rate for BPL consumers. Regular domestic consumer: full rate applies from unit 1."
        },
        {
          id: "commercial",
          name: "LT-II (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            {
              limit: 100,
              rate: 5.5
            },
            {
              limit: 300,
              rate: 7
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

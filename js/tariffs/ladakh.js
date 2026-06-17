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
          additionalCharges: [],
          notes: "Heavily subsidized by UT Administration."
        }
      ]
    }
  ]
};

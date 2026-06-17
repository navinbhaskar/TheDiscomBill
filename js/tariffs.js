// Comprehensive DISCOM Tariff Database for India
// Tariff rates are approximate based on 2024-25 tariff orders.
// Actual rates may vary. Always verify with your DISCOM.

// Fixed charge types:
//   number           → flat monthly amount (Rs.)
//   {type:"tiered", slabs:[{maxLoad, rate}]}  → tiered by connected load (kW)
//   {type:"per_kw",  rate}                    → Rs. per kW per month

// Energy slab format: [{limit, rate}]
//   limit = cumulative upper limit (use Infinity for last slab)
//   rate  = Rs. per unit

const TARIFF_DB = {

  "Andhra Pradesh": [
    {
      id: "apspdcl", name: "APSPDCL",
      fullName: "Southern Power Distribution Company of Andhra Pradesh Ltd.",
      area: "Southern AP (Kurnool, Nellore, Prakasam, Chittoor, Kadapa, Tirupati)",
      tariffYear: "2024-25", website: "https://www.apspdcl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 0.5, rate: 30,  label: "Up to 500W" },
            { maxLoad: 1,   rate: 60,  label: "501W – 1 kW" },
            { maxLoad: 2,   rate: 90,  label: "1 kW – 2 kW" },
            { maxLoad: 5,   rate: 120, label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 160, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 1.45 },
            { limit: 100,      rate: 2.75 },
            { limit: 200,      rate: 4.50 },
            { limit: 300,      rate: 6.50 },
            { limit: 400,      rate: 7.00 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ],
          notes: "Telescopic tariff. Fixed charge based on connected load."
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,   rate: 100, label: "Up to 1 kW" },
            { maxLoad: 5,   rate: 150, label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 5.00 },
            { limit: 100,      rate: 7.00 },
            { limit: Infinity, rate: 9.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 6 }
          ]
        },
        {
          id: "agricultural", name: "LT-V (Agricultural / Irrigation Pump Sets)",
          fixedCharge: 0,
          energySlabs: [{ limit: Infinity, rate: 0 }],
          additionalCharges: [],
          notes: "Free power supply to agricultural consumers as per GoAP scheme. Actual supply hours may be limited."
        }
      ]
    },
    {
      id: "apepdcl", name: "APEPDCL",
      fullName: "Eastern Power Distribution Company of Andhra Pradesh Ltd.",
      area: "Eastern AP (Vishakhapatnam, East Godavari, West Godavari, Krishna, Guntur)",
      tariffYear: "2024-25", website: "https://www.apepdcl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 0.5, rate: 30,  label: "Up to 500W" },
            { maxLoad: 1,   rate: 60,  label: "501W – 1 kW" },
            { maxLoad: 2,   rate: 90,  label: "1 kW – 2 kW" },
            { maxLoad: 5,   rate: 120, label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 160, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 1.45 },
            { limit: 100,      rate: 2.75 },
            { limit: 200,      rate: 4.50 },
            { limit: 300,      rate: 6.50 },
            { limit: 400,      rate: 7.00 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,   rate: 100, label: "Up to 1 kW" },
            { maxLoad: 5,   rate: 150, label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 5.00 },
            { limit: 100,      rate: 7.00 },
            { limit: Infinity, rate: 9.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 6 }
          ]
        }
      ]
    }
  ],

  "Arunachal Pradesh": [
    {
      id: "appdcl", name: "APPDCL / Dept. of Power",
      fullName: "Arunachal Pradesh Power Distribution Corporation Ltd.",
      area: "Entire Arunachal Pradesh",
      tariffYear: "2024-25", website: "https://appdcl.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 30,
          energySlabs: [
            { limit: 30,       rate: 0.00, label: "Subsidised" },
            { limit: 100,      rate: 2.00 },
            { limit: 200,      rate: 3.50 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          notes: "First 30 units subsidized. Subject to state government schemes."
        },
        {
          id: "commercial", name: "LT Commercial",
          fixedCharge: 50,
          energySlabs: [
            { limit: 100,      rate: 4.50 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Assam": [
    {
      id: "apdcl", name: "APDCL",
      fullName: "Assam Power Distribution Company Ltd.",
      area: "Entire Assam",
      tariffYear: "2024-25", website: "https://www.apdcl.org",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 50,
          energySlabs: [
            { limit: 30,       rate: 2.10 },
            { limit: 100,      rate: 4.60 },
            { limit: 200,      rate: 5.95 },
            { limit: Infinity, rate: 7.20 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 7.50 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Bihar": [
    {
      id: "nbpdcl", name: "NBPDCL",
      fullName: "North Bihar Power Distribution Company Ltd.",
      area: "North Bihar (Patna, Muzaffarpur, Darbhanga, Begusarai, Bhagalpur, etc.)",
      tariffYear: "2024-25", website: "https://www.nbpdcl.co.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic (DS)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 85,  label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 120, label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 180, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 4.20 },
            { limit: 100,      rate: 5.25 },
            { limit: 200,      rate: 5.75 },
            { limit: Infinity, rate: 6.15 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT Commercial (CS)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 150, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 7.50 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "sbpdcl", name: "SBPDCL",
      fullName: "South Bihar Power Distribution Company Ltd.",
      area: "South Bihar (Patna City, Gaya, Nalanda, Aurangabad, Rohtas, etc.)",
      tariffYear: "2024-25", website: "https://www.sbpdcl.co.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic (DS)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 85,  label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 120, label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 180, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 4.20 },
            { limit: 100,      rate: 5.25 },
            { limit: 200,      rate: 5.75 },
            { limit: Infinity, rate: 6.15 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT Commercial (CS)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 150, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 7.50 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Chandigarh": [
    {
      id: "chandigarh_ed", name: "Chandigarh Admin. Electricity Dept.",
      fullName: "Electricity Department, Chandigarh Administration",
      area: "Chandigarh Union Territory",
      tariffYear: "2024-25", website: "https://www.edc.gov.in",
      categories: [
        {
          id: "domestic", name: "DS (Domestic Supply)",
          fixedCharge: 40,
          energySlabs: [
            { limit: 150,      rate: 2.12 },
            { limit: 400,      rate: 3.97 },
            { limit: Infinity, rate: 4.95 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "NDS (Non-Domestic Supply)",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 6.50 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Chhattisgarh": [
    {
      id: "cspdcl", name: "CSPDCL",
      fullName: "Chhattisgarh State Power Distribution Company Ltd.",
      area: "Entire Chhattisgarh",
      tariffYear: "2024-25", website: "https://www.cspdcl.co.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 50,
          energySlabs: [
            { limit: 30,       rate: 0.00, label: "BPL (free for qualifying consumers)" },
            { limit: 100,      rate: 3.30 },
            { limit: 200,      rate: 5.00 },
            { limit: 400,      rate: 5.50 },
            { limit: Infinity, rate: 6.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          notes: "First 30 units at reduced / zero rate for BPL consumers. Regular domestic consumer: full rate applies from unit 1."
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 7.00 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Dadra & Nagar Haveli and Daman & Diu": [
    {
      id: "dnhpdcl", name: "DNHPDCL",
      fullName: "DNH Power Distribution Corporation Ltd.",
      area: "Dadra & Nagar Haveli and Daman & Diu",
      tariffYear: "2024-25", website: "https://www.dnhpdcl.co.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 1.50 },
            { limit: 100,      rate: 2.00 },
            { limit: 200,      rate: 3.00 },
            { limit: Infinity, rate: 4.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT Commercial",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 4.50 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Delhi": [
    {
      id: "brpl", name: "BRPL (BSES Rajdhani)",
      fullName: "BSES Rajdhani Power Ltd.",
      area: "South & West Delhi",
      tariffYear: "2024-25", website: "https://www.bsesdelhi.com",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 20,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 50,  label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 100, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 3.00 },
            { limit: 400,      rate: 4.50 },
            { limit: 800,      rate: 6.50 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ],
          notes: "GNCTD subsidy: consumers using ≤200 units pay ₹0 (100% subsidy). Consumers using 201–400 units get 50% rebate on first 200 units. Subsidy optional – consumer can opt out.",
          specialSchemes: [
            {
              id: "delhi_subsidy",
              label: "Apply GNCTD Subsidy (Optional)",
              description: "0–200 units: ₹0 bill. 201–400 units: 50% rebate on first 200 units.",
              calculate: function(units, grossAmount, energyCharge, fixedCharge) {
                if (units <= 200) return { label: "GNCTD Subsidy (100% – ≤200 units)", amount: -(grossAmount) };
                if (units <= 400) {
                  const rebate = Math.min(200 * 3.00, energyCharge) * 0.5;
                  return { label: "GNCTD Subsidy (50% on first 200 units)", amount: -rebate };
                }
                return null;
              }
            }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 125, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 6.00 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "bypl", name: "BYPL (BSES Yamuna)",
      fullName: "BSES Yamuna Power Ltd.",
      area: "East & Central Delhi",
      tariffYear: "2024-25", website: "https://www.bsesdelhi.com",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 20,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 50,  label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 100, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 3.00 },
            { limit: 400,      rate: 4.50 },
            { limit: 800,      rate: 6.50 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ],
          notes: "GNCTD subsidy applicable (same as BRPL). ≤200 units: zero bill; 201–400 units: 50% rebate on first 200 units."
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 125, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 6.00 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "tpddl", name: "Tata Power-DDL (TPDDL)",
      fullName: "Tata Power Delhi Distribution Ltd.",
      area: "North & North-West Delhi",
      tariffYear: "2024-25", website: "https://www.tatapower-ddl.com",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 20,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 50,  label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 100, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 3.00 },
            { limit: 400,      rate: 4.50 },
            { limit: 800,      rate: 6.50 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ],
          notes: "GNCTD subsidy applicable. Same tariff as BRPL/BYPL per DERC order."
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 125, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 6.00 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "ndmc_delhi", name: "NDMC",
      fullName: "New Delhi Municipal Council",
      area: "Lutyens' Delhi (Central Government area)",
      tariffYear: "2024-25", website: "https://www.ndmc.gov.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 40,
          energySlabs: [
            { limit: 200,      rate: 3.00 },
            { limit: 400,      rate: 4.50 },
            { limit: Infinity, rate: 6.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Goa": [
    {
      id: "ged", name: "Goa Electricity Dept.",
      fullName: "Electricity Department, Government of Goa",
      area: "Entire Goa",
      tariffYear: "2024-25", website: "https://www.goaelectricity.gov.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 30,       rate: 1.79 },
            { limit: 100,      rate: 3.04 },
            { limit: 200,      rate: 3.37 },
            { limit: 500,      rate: 5.00 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Gujarat": [
    {
      id: "ugvcl", name: "UGVCL",
      fullName: "Uttar Gujarat Vij Company Ltd.",
      area: "North Gujarat (Mehsana, Patan, Banaskantha, Sabarkantha, Gandhinagar, Aravalli)",
      tariffYear: "2024-25", website: "https://www.ugvcl.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            { limit: 50,       rate: 1.00 },
            { limit: 100,      rate: 2.20 },
            { limit: 250,      rate: 3.45 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ],
          notes: "Telescopic tariff. Electricity Duty is 20% of energy charges."
        },
        {
          id: "commercial", name: "LT-2 (Commercial / Non-Industrial)",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 7.00 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ]
        },
        {
          id: "agricultural", name: "LT-3 (Agriculture / Irrigation)",
          fixedCharge: 0,
          energySlabs: [{ limit: Infinity, rate: 0.60 }],
          additionalCharges: [],
          notes: "Heavily subsidized. Actual supply hours limited."
        }
      ]
    },
    {
      id: "mgvcl", name: "MGVCL",
      fullName: "Madhya Gujarat Vij Company Ltd.",
      area: "Central Gujarat (Vadodara, Anand, Kheda, Panchmahal, Dahod, Chhota Udaipur)",
      tariffYear: "2024-25", website: "https://www.mgvcl.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            { limit: 50,       rate: 1.00 },
            { limit: 100,      rate: 2.20 },
            { limit: 250,      rate: 3.45 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 7.00 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ]
        }
      ]
    },
    {
      id: "pgvcl", name: "PGVCL",
      fullName: "Paschim Gujarat Vij Company Ltd.",
      area: "West Gujarat (Rajkot, Jamnagar, Junagadh, Porbandar, Surat, Bharuch, Narmada)",
      tariffYear: "2024-25", website: "https://www.pgvcl.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            { limit: 50,       rate: 1.00 },
            { limit: 100,      rate: 2.20 },
            { limit: 250,      rate: 3.45 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 7.00 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ]
        }
      ]
    },
    {
      id: "dgvcl", name: "DGVCL",
      fullName: "Dakshin Gujarat Vij Company Ltd.",
      area: "South Gujarat (Surat city, Navsari, Valsad, Tapi, Dang)",
      tariffYear: "2024-25", website: "https://www.dgvcl.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            { limit: 50,       rate: 1.00 },
            { limit: 100,      rate: 2.20 },
            { limit: 250,      rate: 3.45 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial)",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 7.00 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 20 }
          ]
        }
      ]
    }
  ],

  "Haryana": [
    {
      id: "dhbvn", name: "DHBVN",
      fullName: "Dakshin Haryana Bijli Vitran Nigam Ltd.",
      area: "South Haryana (Gurugram, Faridabad, Rewari, Mahendragarh, Mewat, Palwal, Bhiwani)",
      tariffYear: "2024-25", website: "https://www.dhbvn.org.in",
      categories: [
        {
          id: "domestic", name: "DS (Domestic Supply)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 60,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 100, label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 180, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 2.00 },
            { limit: 100,      rate: 2.50 },
            { limit: 200,      rate: 4.25 },
            { limit: 400,      rate: 5.25 },
            { limit: 500,      rate: 5.50 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "NDS (Non-Domestic Supply)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 150, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 300, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 6.50 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "uhbvn", name: "UHBVN",
      fullName: "Uttar Haryana Bijli Vitran Nigam Ltd.",
      area: "North Haryana (Ambala, Kurukshetra, Karnal, Sonipat, Panipat, Yamunanagar, Hisar, Rohtak)",
      tariffYear: "2024-25", website: "https://www.uhbvn.org.in",
      categories: [
        {
          id: "domestic", name: "DS (Domestic Supply)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 60,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 100, label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 180, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 2.00 },
            { limit: 100,      rate: 2.50 },
            { limit: 200,      rate: 4.25 },
            { limit: 400,      rate: 5.25 },
            { limit: 500,      rate: 5.50 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "NDS (Non-Domestic Supply)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 150, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 300, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 6.50 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Himachal Pradesh": [
    {
      id: "hpsebl", name: "HPSEBL",
      fullName: "Himachal Pradesh State Electricity Board Ltd.",
      area: "Entire Himachal Pradesh",
      tariffYear: "2024-25", website: "https://www.hpseb.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic)",
          fixedCharge: 20,
          energySlabs: [
            { limit: 60,       rate: 0.35, label: "Subsidised slab" },
            { limit: 125,      rate: 2.00 },
            { limit: 300,      rate: 3.50 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          notes: "First 60 units at heavily subsidized rate per HP government policy."
        },
        {
          id: "commercial", name: "LT-2 (Commercial)",
          fixedCharge: 50,
          energySlabs: [
            { limit: 100,      rate: 4.00 },
            { limit: 300,      rate: 5.50 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Jammu & Kashmir": [
    {
      id: "jkpdd_jammu", name: "JKPDD (Jammu Region)",
      fullName: "J&K Power Development Department – Jammu Region",
      area: "Jammu, Samba, Kathua, Udhampur, Reasi, Ramban, Doda, Kishtwar, Rajouri, Poonch",
      tariffYear: "2024-25", website: "https://jkpdd.gov.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 50,
          energySlabs: [
            { limit: 50,       rate: 1.50 },
            { limit: 100,      rate: 2.00 },
            { limit: 200,      rate: 3.00 },
            { limit: Infinity, rate: 4.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT Commercial",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 4.50 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "jkpdd_kashmir", name: "JKPDD (Kashmir Region)",
      fullName: "J&K Power Development Department – Kashmir Region",
      area: "Srinagar, Baramulla, Anantnag, Kupwara, Pulwama, Kulgam, Ganderbal, Shopian, Bandipora",
      tariffYear: "2024-25", website: "https://jkpdd.gov.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 50,
          energySlabs: [
            { limit: 50,       rate: 1.50 },
            { limit: 100,      rate: 2.00 },
            { limit: 200,      rate: 3.00 },
            { limit: Infinity, rate: 4.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT Commercial",
          fixedCharge: 80,
          energySlabs: [
            { limit: 100,      rate: 4.50 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Jharkhand": [
    {
      id: "jbvnl", name: "JBVNL",
      fullName: "Jharkhand Bijli Vitran Nigam Ltd.",
      area: "Entire Jharkhand",
      tariffYear: "2024-25", website: "https://jbvnl.co.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 55,  label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 90,  label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 150, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 2.95 },
            { limit: 200,      rate: 4.55 },
            { limit: 300,      rate: 5.75 },
            { limit: Infinity, rate: 6.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 120, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 200, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 6.00 },
            { limit: 300,      rate: 7.00 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Karnataka": [
    {
      id: "bescom", name: "BESCOM",
      fullName: "Bangalore Electricity Supply Company Ltd.",
      area: "Bangalore Urban, Bangalore Rural, Tumkur, Kolar, Chikkaballapur, Ramanagara, Chitradurga",
      tariffYear: "2024-25", website: "https://www.bescom.co.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2.5,      rate: 30,  label: "Single phase (up to 2.5 kW)" },
            { maxLoad: 5,        rate: 50,  label: "2.5 kW – 5 kW" },
            { maxLoad: Infinity, rate: 75,  label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 30,       rate: 1.30, label: "First 30 units" },
            { limit: 100,      rate: 4.95 },
            { limit: 200,      rate: 7.10 },
            { limit: 500,      rate: 8.10 },
            { limit: Infinity, rate: 8.35 }
          ],
          additionalCharges: [],
          notes: "Tariff is inclusive of all duties. BPL consumers (Kutir Jyoti): first 30 units may be zero per scheme. No separate electricity duty line – already included."
        },
        {
          id: "commercial", name: "LT-2 (Commercial / Non-Domestic LT)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2.5,      rate: 75,  label: "Single phase" },
            { maxLoad: Infinity, rate: 120, label: "Three phase" }
          ]},
          energySlabs: [
            { limit: 200,      rate: 8.50 },
            { limit: Infinity, rate: 9.50 }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "mescom", name: "MESCOM",
      fullName: "Mangalore Electricity Supply Company Ltd.",
      area: "Dakshina Kannada, Udupi, Shivamogga, Kodagu, Chikkamagaluru",
      tariffYear: "2024-25", website: "https://www.mescom.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2.5,      rate: 30,  label: "Single phase" },
            { maxLoad: Infinity, rate: 50,  label: "Three phase" }
          ]},
          energySlabs: [
            { limit: 30,       rate: 1.30 },
            { limit: 100,      rate: 4.95 },
            { limit: 200,      rate: 7.10 },
            { limit: 500,      rate: 8.10 },
            { limit: Infinity, rate: 8.35 }
          ],
          additionalCharges: []
        },
        {
          id: "commercial", name: "LT-2 (Commercial)",
          fixedCharge: 75,
          energySlabs: [
            { limit: 200,      rate: 8.50 },
            { limit: Infinity, rate: 9.50 }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "cesc_karnataka", name: "CESC (Karnataka)",
      fullName: "Chamundeshwari Electricity Supply Corporation Ltd.",
      area: "Mysuru, Mandya, Hassan, Chamarajanagar",
      tariffYear: "2024-25", website: "https://www.cescmysore.org",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 30,       rate: 1.30 },
            { limit: 100,      rate: 4.95 },
            { limit: 200,      rate: 7.10 },
            { limit: 500,      rate: 8.10 },
            { limit: Infinity, rate: 8.35 }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "gescom", name: "GESCOM",
      fullName: "Gulbarga Electricity Supply Company Ltd.",
      area: "Kalaburagi, Bidar, Yadgir, Raichur, Koppal",
      tariffYear: "2024-25", website: "https://www.gescom.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 30,       rate: 1.30 },
            { limit: 100,      rate: 4.95 },
            { limit: 200,      rate: 7.10 },
            { limit: 500,      rate: 8.10 },
            { limit: Infinity, rate: 8.35 }
          ],
          additionalCharges: []
        }
      ]
    },
    {
      id: "hescom", name: "HESCOM",
      fullName: "Hubli Electricity Supply Company Ltd.",
      area: "Dharwad, Gadag, Haveri, Belagavi, Uttara Kannada, Ballari, Vijayanagara",
      tariffYear: "2024-25", website: "https://www.hescom.co.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 30,       rate: 1.30 },
            { limit: 100,      rate: 4.95 },
            { limit: 200,      rate: 7.10 },
            { limit: 500,      rate: 8.10 },
            { limit: Infinity, rate: 8.35 }
          ],
          additionalCharges: []
        }
      ]
    }
  ],

  "Kerala": [
    {
      id: "kseb", name: "KSEB",
      fullName: "Kerala State Electricity Board Ltd.",
      area: "Entire Kerala",
      tariffYear: "2024-25", website: "https://www.kseb.in",
      categories: [
        {
          id: "domestic_low", name: "LT-1A (Domestic – load < 500W)",
          fixedCharge: 35,
          energySlabs: [
            { limit: 40,       rate: 2.90 },
            { limit: 80,       rate: 3.50 },
            { limit: 140,      rate: 4.70 },
            { limit: 180,      rate: 6.90 },
            { limit: 250,      rate: 8.90 },
            { limit: Infinity, rate: 9.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 10 }
          ]
        },
        {
          id: "domestic", name: "LT-1B (Domestic – load 500W to 5kW)",
          fixedCharge: 75,
          energySlabs: [
            { limit: 40,       rate: 3.25 },
            { limit: 80,       rate: 4.05 },
            { limit: 140,      rate: 5.10 },
            { limit: 180,      rate: 7.40 },
            { limit: 250,      rate: 9.60 },
            { limit: Infinity, rate: 10.30 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 10 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial / Non-Domestic)",
          fixedCharge: 125,
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 7.50 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 10 }
          ]
        }
      ]
    }
  ],

  "Ladakh": [
    {
      id: "lpdcl", name: "LPDCL / Ladakh Power Dept.",
      fullName: "Ladakh Power Development Corp. / Power Development Dept., Ladakh",
      area: "Leh, Kargil districts",
      tariffYear: "2024-25", website: "https://ladakh.gov.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 20,
          energySlabs: [
            { limit: 50,       rate: 0.50 },
            { limit: 100,      rate: 1.00 },
            { limit: Infinity, rate: 2.50 }
          ],
          additionalCharges: [],
          notes: "Heavily subsidized by UT Administration."
        }
      ]
    }
  ],

  "Madhya Pradesh": [
    {
      id: "mppkvvcl", name: "MPPKVVCL",
      fullName: "Madhya Pradesh Paschim Kshetra Vidyut Vitaran Company Ltd.",
      area: "West-Central MP (Indore, Ujjain, Ratlam, Mandsaur, Dewas, Khandwa, Khargone)",
      tariffYear: "2024-25", website: "https://www.mppkvvcl.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 100, label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 140, label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 200, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 30,       rate: 2.05 },
            { limit: 100,      rate: 3.65 },
            { limit: 150,      rate: 4.75 },
            { limit: 300,      rate: 5.60 },
            { limit: Infinity, rate: 6.55 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 200, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 350, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 7.50 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "mpmkvvcl", name: "MPMKVVCL",
      fullName: "Madhya Pradesh Madhya Kshetra Vidyut Vitaran Company Ltd.",
      area: "Central MP (Bhopal, Sagar, Rewa, Satna, Narsinghpur, Hoshangabad, Raisen, Vidisha)",
      tariffYear: "2024-25", website: "https://www.mpmkvvcl.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 100, label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 140, label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 200, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 30,       rate: 2.05 },
            { limit: 100,      rate: 3.65 },
            { limit: 150,      rate: 4.75 },
            { limit: 300,      rate: 5.60 },
            { limit: Infinity, rate: 6.55 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial)",
          fixedCharge: 200,
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 7.50 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "mpez", name: "MPEZ",
      fullName: "Madhya Pradesh Poorv Kshetra Vidyut Vitaran Company Ltd.",
      area: "East MP (Jabalpur, Chhindwara, Seoni, Mandla, Balaghat, Dindori)",
      tariffYear: "2024-25", website: "https://mpez.co.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 100, label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 140, label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 200, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 30,       rate: 2.05 },
            { limit: 100,      rate: 3.65 },
            { limit: 150,      rate: 4.75 },
            { limit: 300,      rate: 5.60 },
            { limit: Infinity, rate: 6.55 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Maharashtra": [
    {
      id: "msedcl", name: "MSEDCL",
      fullName: "Maharashtra State Electricity Distribution Co. Ltd.",
      area: "Maharashtra (except Mumbai city area served by Adani/BEST/Tata Power)",
      tariffYear: "2024-25", website: "https://www.mahadiscom.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 100, label: "Up to 1 kW" },
            { maxLoad: 2,        rate: 180, label: "1 kW – 2 kW" },
            { maxLoad: 5,        rate: 335, label: "2 kW – 5 kW" },
            { maxLoad: 10,       rate: 605, label: "5 kW – 10 kW" },
            { maxLoad: Infinity, rate: 900, label: "Above 10 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 3.46 },
            { limit: 300,      rate: 6.71 },
            { limit: 500,      rate: 10.45 },
            { limit: Infinity, rate: 11.13 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial / Non-Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 450, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 750, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 7.50 },
            { limit: 300,      rate: 9.50 },
            { limit: Infinity, rate: 11.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ]
        }
      ]
    },
    {
      id: "adani_mumbai", name: "Adani Electricity Mumbai",
      fullName: "Adani Electricity Mumbai Ltd. (formerly Reliance Infrastructure)",
      area: "Mumbai suburbs (Bandra, Andheri, Kurla, Borivali, Malad, etc.)",
      tariffYear: "2024-25", website: "https://www.adanielectricity.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 175, label: "Up to 1 kW" },
            { maxLoad: 2,        rate: 280, label: "1 kW – 2 kW" },
            { maxLoad: 5,        rate: 420, label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 630, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 3.35 },
            { limit: 300,      rate: 6.58 },
            { limit: 500,      rate: 9.60 },
            { limit: Infinity, rate: 10.57 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ]
        }
      ]
    },
    {
      id: "best_mumbai", name: "BEST Mumbai",
      fullName: "Brihanmumbai Electricity Supply and Transport (BEST)",
      area: "Mumbai Island City (South Mumbai – Colaba to Mahim/Sion)",
      tariffYear: "2024-25", website: "https://www.bestundertaking.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Residential)",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 3.07 },
            { limit: 300,      rate: 5.98 },
            { limit: 500,      rate: 8.90 },
            { limit: Infinity, rate: 10.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ]
        }
      ]
    },
    {
      id: "tata_power_mumbai", name: "Tata Power Mumbai",
      fullName: "Tata Power Company Ltd. – Mumbai Distribution",
      area: "Parts of Mumbai (Dharavi, Wadala, parts of Kurla, Chembur, etc.)",
      tariffYear: "2024-25", website: "https://www.tatapower.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Residential)",
          fixedCharge: 70,
          energySlabs: [
            { limit: 100,      rate: 3.10 },
            { limit: 300,      rate: 5.95 },
            { limit: 500,      rate: 8.90 },
            { limit: Infinity, rate: 9.95 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 16 }
          ]
        }
      ]
    }
  ],

  "Manipur": [
    {
      id: "mspdcl", name: "MSPDCL",
      fullName: "Manipur State Power Distribution Company Ltd.",
      area: "Entire Manipur",
      tariffYear: "2024-25", website: "https://www.mspdcl.com",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 40,
          energySlabs: [
            { limit: 30,       rate: 2.35 },
            { limit: 100,      rate: 4.45 },
            { limit: Infinity, rate: 5.95 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 6.00 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Meghalaya": [
    {
      id: "mepdcl", name: "MePDCL",
      fullName: "Meghalaya Power Distribution Corporation Ltd.",
      area: "Entire Meghalaya",
      tariffYear: "2024-25", website: "https://www.mepdcl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 40,
          energySlabs: [
            { limit: 60,       rate: 3.00 },
            { limit: 120,      rate: 4.50 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: 70,
          energySlabs: [
            { limit: 100,      rate: 6.00 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Mizoram": [
    {
      id: "ped_mizoram", name: "P&E Dept., Mizoram",
      fullName: "Power & Electricity Department, Government of Mizoram",
      area: "Entire Mizoram",
      tariffYear: "2024-25", website: "https://mizoram.gov.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 2.50 },
            { limit: 100,      rate: 4.00 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Nagaland": [
    {
      id: "doe_nagaland", name: "DoE Nagaland",
      fullName: "Department of Electricity, Government of Nagaland",
      area: "Entire Nagaland",
      tariffYear: "2024-25", website: "https://nagaland.gov.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 35,
          energySlabs: [
            { limit: 50,       rate: 2.50 },
            { limit: 100,      rate: 4.00 },
            { limit: Infinity, rate: 6.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Odisha": [
    {
      id: "tpnodl", name: "TPNODL",
      fullName: "TP Northern Odisha Distribution Ltd. (Tata Power)",
      area: "North Odisha (Balasore, Bhadrak, Jajpur, Kendujhar, Mayurbhanj, Sundargarh)",
      tariffYear: "2024-25", website: "https://www.tpnodl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 2.10 },
            { limit: 200,      rate: 3.50 },
            { limit: 400,      rate: 5.00 },
            { limit: Infinity, rate: 6.20 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 6.50 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "tpsodl", name: "TPSODL",
      fullName: "TP Southern Odisha Distribution Ltd. (Tata Power)",
      area: "South Odisha (Ganjam, Gajapati, Kandhamal, Kalahandi, Koraput, Nabarangpur, Rayagada, Malkangiri)",
      tariffYear: "2024-25", website: "https://www.tpsodl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 2.10 },
            { limit: 200,      rate: 3.50 },
            { limit: 400,      rate: 5.00 },
            { limit: Infinity, rate: 6.20 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "tpwodl", name: "TPWODL",
      fullName: "TP Western Odisha Distribution Ltd. (Tata Power)",
      area: "West Odisha (Sambalpur, Bargarh, Boudh, Deogarh, Jharsuguda, Nuapada, Bolangir, Subarnapur)",
      tariffYear: "2024-25", website: "https://www.tpwodl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 2.10 },
            { limit: 200,      rate: 3.50 },
            { limit: 400,      rate: 5.00 },
            { limit: Infinity, rate: 6.20 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "tpcodl", name: "TPCODL",
      fullName: "TP Central Odisha Distribution Ltd. (Tata Power)",
      area: "Central Odisha (Bhubaneswar, Cuttack, Puri, Khordha, Jagatsinghpur, Kendrapara, Nayagarh, Angul, Dhenkanal)",
      tariffYear: "2024-25", website: "https://www.tpcodl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 2.10 },
            { limit: 200,      rate: 3.50 },
            { limit: 400,      rate: 5.00 },
            { limit: Infinity, rate: 6.20 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Puducherry": [
    {
      id: "pdicl", name: "PDICL / Electricity Dept.",
      fullName: "Puducherry Electricity Dept. / PDI Corporation Ltd.",
      area: "Puducherry, Karaikal, Mahe, Yanam",
      tariffYear: "2024-25", website: "https://electricity.py.gov.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 1.50 },
            { limit: 100,      rate: 2.00 },
            { limit: 200,      rate: 3.00 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 5.00 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Punjab": [
    {
      id: "pspcl", name: "PSPCL",
      fullName: "Punjab State Power Corporation Ltd.",
      area: "Entire Punjab (excl. Chandigarh)",
      tariffYear: "2024-25", website: "https://www.pspcl.in",
      categories: [
        {
          id: "domestic", name: "DS (Domestic Supply)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 60,  label: "Up to 2 kW" },
            { maxLoad: 7,        rate: 100, label: "2 kW – 7 kW" },
            { maxLoad: Infinity, rate: 175, label: "Above 7 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 3.49 },
            { limit: 300,      rate: 5.00 },
            { limit: 500,      rate: 6.11 },
            { limit: Infinity, rate: 6.89 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 3 }
          ],
          notes: "Government of Punjab: 600 units free per year for domestic consumers (50 units/month). AAP scheme."
        },
        {
          id: "commercial", name: "NRS (Non-Residential Supply / Commercial)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 150, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 250, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 7.50 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 3 }
          ]
        }
      ]
    }
  ],

  "Rajasthan": [
    {
      id: "jvvnl", name: "JVVNL",
      fullName: "Jaipur Vidyut Vitaran Nigam Ltd.",
      area: "Jaipur, Sikar, Jhunjhunu, Alwar, Bharatpur, Sawai Madhopur, Karauli, Dausa, Dholpur",
      tariffYear: "2024-25", website: "https://www.jaipurdiscom.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 65,  label: "Up to 2 kW (single phase)" },
            { maxLoad: 5,        rate: 80,  label: "2 kW – 5 kW" },
            { maxLoad: 10,       rate: 125, label: "5 kW – 10 kW" },
            { maxLoad: Infinity, rate: 200, label: "Above 10 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 3.00 },
            { limit: 150,      rate: 4.50 },
            { limit: 300,      rate: 6.00 },
            { limit: Infinity, rate: 6.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_total", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-4 (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 150, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 300, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 6.50 },
            { limit: 300,      rate: 8.00 },
            { limit: Infinity, rate: 9.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_total", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "avvnl", name: "AVVNL",
      fullName: "Ajmer Vidyut Vitaran Nigam Ltd.",
      area: "Ajmer, Bhilwara, Chittorgarh, Rajsamand, Nagaur, Tonk",
      tariffYear: "2024-25", website: "https://www.avvnl.com",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 65,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 80,  label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 125, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 3.00 },
            { limit: 150,      rate: 4.50 },
            { limit: 300,      rate: 6.00 },
            { limit: Infinity, rate: 6.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_total", rate: 5 }
          ]
        }
      ]
    },
    {
      id: "jdvvnl", name: "JdVVNL",
      fullName: "Jodhpur Vidyut Vitaran Nigam Ltd.",
      area: "Jodhpur, Barmer, Jaisalmer, Bikaner, Churu, Hanumangarh, Ganganagar, Pali, Jalor, Sirohi, Jalore",
      tariffYear: "2024-25", website: "https://www.jdvvnl.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 65,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 80,  label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 125, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 3.00 },
            { limit: 150,      rate: 4.50 },
            { limit: 300,      rate: 6.00 },
            { limit: Infinity, rate: 6.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_total", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Sikkim": [
    {
      id: "energy_sikkim", name: "Energy & Power Dept., Sikkim",
      fullName: "Energy & Power Department, Government of Sikkim",
      area: "Entire Sikkim",
      tariffYear: "2024-25", website: "https://sikkim.gov.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 20,
          energySlabs: [
            { limit: 50,       rate: 1.50 },
            { limit: 100,      rate: 3.00 },
            { limit: Infinity, rate: 5.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Tamil Nadu": [
    {
      id: "tangedco", name: "TANGEDCO",
      fullName: "Tamil Nadu Generation and Distribution Corporation Ltd.",
      area: "Entire Tamil Nadu",
      tariffYear: "2024-25", website: "https://www.tangedco.gov.in",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic – Bimonthly Billing)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 100,      rate: 0.00, label: "Free (first 100 units per 2 months)" },
            { limit: 200,      rate: 1.50 },
            { limit: 500,      rate: 3.00 },
            { limit: 1000,     rate: 5.75 },
            { limit: Infinity, rate: 7.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          notes: "TANGEDCO bills bimonthly. First 100 units free per 2-month cycle for consumers using ≤500 units. If usage >500 units/2 months, regular rate applies to all units. This calculator shows monthly estimate; multiply units by 2 for bimonthly check."
        },
        {
          id: "commercial", name: "LT-2 (Commercial / Non-Domestic)",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 5.25 },
            { limit: 300,      rate: 6.75 },
            { limit: Infinity, rate: 8.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Telangana": [
    {
      id: "tsspdcl", name: "TSSPDCL",
      fullName: "Telangana State Southern Power Distribution Company Ltd.",
      area: "Southern Telangana (Hyderabad, Rangareddy, Mahbubnagar, Nalgonda, Medak, Sangareddy, Vikarabad)",
      tariffYear: "2024-25", website: "https://www.tssouthernpower.com",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 30,  label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 50,  label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 100, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 1.45 },
            { limit: 100,      rate: 2.45 },
            { limit: 200,      rate: 4.00 },
            { limit: 300,      rate: 6.05 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 7.5 }
          ],
          notes: "Lifeline consumers (BPL): first 50 units free. LT-1A – loads up to 900W."
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 100, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 200, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 5.50 },
            { limit: 100,      rate: 7.00 },
            { limit: Infinity, rate: 9.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 7.5 }
          ]
        }
      ]
    },
    {
      id: "tsnpdcl", name: "TSNPDCL",
      fullName: "Telangana State Northern Power Distribution Company Ltd.",
      area: "Northern Telangana (Warangal, Karimnagar, Nizamabad, Adilabad, Khammam, Peddapalli, Rajanna Sircilla)",
      tariffYear: "2024-25", website: "https://www.tsnpdcl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 1,        rate: 30,  label: "Up to 1 kW" },
            { maxLoad: 5,        rate: 50,  label: "1 kW – 5 kW" },
            { maxLoad: Infinity, rate: 100, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 50,       rate: 1.45 },
            { limit: 100,      rate: 2.45 },
            { limit: 200,      rate: 4.00 },
            { limit: 300,      rate: 6.05 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 7.5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial / Non-Domestic)",
          fixedCharge: 100,
          energySlabs: [
            { limit: 50,       rate: 5.50 },
            { limit: 100,      rate: 7.00 },
            { limit: Infinity, rate: 9.00 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 7.5 }
          ]
        }
      ]
    }
  ],

  "Tripura": [
    {
      id: "tsecl", name: "TSECL",
      fullName: "Tripura State Electricity Corporation Ltd.",
      area: "Entire Tripura",
      tariffYear: "2024-25", website: "https://www.tsecl.in",
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          fixedCharge: 30,
          energySlabs: [
            { limit: 50,       rate: 2.55 },
            { limit: 100,      rate: 4.30 },
            { limit: 200,      rate: 5.30 },
            { limit: Infinity, rate: 6.30 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-II (Commercial)",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100,      rate: 6.00 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Uttar Pradesh": [
    {
      id: "dvvnl", name: "DVVNL",
      fullName: "Dakshinanchal Vidyut Vitaran Nigam Ltd.",
      area: "South UP (Agra, Mathura, Aligarh, Firozabad, Hathras, Etah, Mainpuri, Etawah, Farrukhabad, Kannauj, Jhansi, Lalitpur, Jalaun, Hamirpur, Mahoba, Banda, Chitrakoot)",
      tariffYear: "2024-25", website: "https://www.dvvnl.org",
      lpscRate: 1.5,
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          supplyTypes: [
            {
              id: "10A",
              name: "ST-10A – Urban Metered (Load ≤ 1 kW)",
              description: "Single-phase 5A: metered urban/non-rural domestic consumers with sanctioned load up to 1 kW",
              fixedCharge: 90,
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "10B",
              name: "ST-10B – Urban Metered (Load > 1 kW)",
              description: "Single-phase 15A or 3-phase: metered urban/non-rural domestic consumers with sanctioned load above 1 kW",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 2,        rate: 90,  label: "Up to 2 kW" },
                { maxLoad: 5,        rate: 130, label: "2 kW – 5 kW" },
                { maxLoad: Infinity, rate: 190, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "17",
              name: "ST-17 – Rural Metered",
              description: "Metered consumers getting supply as per rural schedule (village / gram sabha area)",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            },
            {
              id: "13",
              name: "ST-13 – Rural Unmetered (≤ 2 kW)",
              description: "Unmetered consumers getting supply up to 2 kW in rural areas",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        },
        {
          id: "commercial", name: "LT-IV Commercial / Non-Domestic",
          supplyTypes: [
            {
              id: "20",
              name: "ST-20 – Urban / Non-Rural Metered",
              description: "Metered commercial consumers getting supply as per non-rural (urban) schedule",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 5,        rate: 180, label: "Up to 5 kW" },
                { maxLoad: Infinity, rate: 300, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 6.50 },
                { limit: 300,      rate: 7.50 },
                { limit: Infinity, rate: 8.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "27",
              name: "ST-27 – Rural Metered",
              description: "Metered commercial consumers getting supply as per rural schedule",
              fixedCharge: 120,
              energySlabs: [
                { limit: 100,      rate: 5.50 },
                { limit: 300,      rate: 6.50 },
                { limit: Infinity, rate: 7.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        }
      ]
    },
    {
      id: "mvvnl", name: "MVVNL",
      fullName: "Madhyanchal Vidyut Vitaran Nigam Ltd.",
      area: "Central UP (Lucknow, Sitapur, Hardoi, Unnao, Rae Bareli, Lakhimpur Kheri, Barabanki, Gonda, Balrampur, Shravasti, Bahraich)",
      tariffYear: "2024-25", website: "https://www.mvvnl.in",
      lpscRate: 1.5,
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          supplyTypes: [
            {
              id: "10A",
              name: "ST-10A – Urban Metered (Load ≤ 1 kW)",
              description: "Single-phase 5A: metered urban/non-rural domestic consumers with sanctioned load up to 1 kW",
              fixedCharge: 90,
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "10B",
              name: "ST-10B – Urban Metered (Load > 1 kW)",
              description: "Single-phase 15A or 3-phase: metered urban/non-rural domestic consumers with sanctioned load above 1 kW",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 2,        rate: 90,  label: "Up to 2 kW" },
                { maxLoad: 5,        rate: 130, label: "2 kW – 5 kW" },
                { maxLoad: Infinity, rate: 190, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "17",
              name: "ST-17 – Rural Metered",
              description: "Metered consumers getting supply as per rural schedule (village / gram sabha area)",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            },
            {
              id: "13",
              name: "ST-13 – Rural Unmetered (≤ 2 kW)",
              description: "Unmetered consumers getting supply up to 2 kW in rural areas",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        },
        {
          id: "commercial", name: "LT-IV Commercial / Non-Domestic",
          supplyTypes: [
            {
              id: "20",
              name: "ST-20 – Urban / Non-Rural Metered",
              description: "Metered commercial consumers getting supply as per non-rural (urban) schedule",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 5,        rate: 180, label: "Up to 5 kW" },
                { maxLoad: Infinity, rate: 300, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 6.50 },
                { limit: 300,      rate: 7.50 },
                { limit: Infinity, rate: 8.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "27",
              name: "ST-27 – Rural Metered",
              description: "Metered commercial consumers getting supply as per rural schedule",
              fixedCharge: 120,
              energySlabs: [
                { limit: 100,      rate: 5.50 },
                { limit: 300,      rate: 6.50 },
                { limit: Infinity, rate: 7.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        }
      ]
    },
    {
      id: "pvvnl", name: "PVVNL",
      fullName: "Paschimanchal Vidyut Vitaran Nigam Ltd.",
      area: "West UP (Meerut, Ghaziabad, Noida, Hapur, Bulandshahr, Muzaffarnagar, Saharanpur, Shamli, Baghpat, Amroha, Moradabad, Rampur, Bijnor, Pilibhit, Shahjahanpur)",
      tariffYear: "2024-25", website: "https://www.pvvnl.org",
      lpscRate: 1.5,
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          supplyTypes: [
            {
              id: "10A",
              name: "ST-10A – Urban Metered (Load ≤ 1 kW)",
              description: "Single-phase 5A: metered urban/non-rural domestic consumers with sanctioned load up to 1 kW",
              fixedCharge: 90,
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "10B",
              name: "ST-10B – Urban Metered (Load > 1 kW)",
              description: "Single-phase 15A or 3-phase: metered urban/non-rural domestic consumers with sanctioned load above 1 kW",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 2,        rate: 90,  label: "Up to 2 kW" },
                { maxLoad: 5,        rate: 130, label: "2 kW – 5 kW" },
                { maxLoad: Infinity, rate: 190, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "17",
              name: "ST-17 – Rural Metered",
              description: "Metered consumers getting supply as per rural schedule (village / gram sabha area)",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            },
            {
              id: "13",
              name: "ST-13 – Rural Unmetered (≤ 2 kW)",
              description: "Unmetered consumers getting supply up to 2 kW in rural areas",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        },
        {
          id: "commercial", name: "LT-IV Commercial / Non-Domestic",
          supplyTypes: [
            {
              id: "20",
              name: "ST-20 – Urban / Non-Rural Metered",
              description: "Metered commercial consumers getting supply as per non-rural (urban) schedule",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 5,        rate: 180, label: "Up to 5 kW" },
                { maxLoad: Infinity, rate: 300, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 6.50 },
                { limit: 300,      rate: 7.50 },
                { limit: Infinity, rate: 8.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "27",
              name: "ST-27 – Rural Metered",
              description: "Metered commercial consumers getting supply as per rural schedule",
              fixedCharge: 120,
              energySlabs: [
                { limit: 100,      rate: 5.50 },
                { limit: 300,      rate: 6.50 },
                { limit: Infinity, rate: 7.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        }
      ]
    },
    {
      id: "puvvnl", name: "PuVVNL",
      fullName: "Purvanchal Vidyut Vitaran Nigam Ltd.",
      area: "East UP (Varanasi, Prayagraj, Gorakhpur, Mirzapur, Sonbhadra, Azamgarh, Mau, Jaunpur, Bhadohi, Chandauli, Ghazipur)",
      tariffYear: "2024-25", website: "https://www.puvvnl.com",
      lpscRate: 1.5,
      categories: [
        {
          id: "domestic", name: "LT-I (Domestic)",
          supplyTypes: [
            {
              id: "10A",
              name: "ST-10A – Urban Metered (Load ≤ 1 kW)",
              description: "Single-phase 5A: metered urban/non-rural domestic consumers with sanctioned load up to 1 kW",
              fixedCharge: 90,
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "10B",
              name: "ST-10B – Urban Metered (Load > 1 kW)",
              description: "Single-phase 15A or 3-phase: metered urban/non-rural domestic consumers with sanctioned load above 1 kW",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 2,        rate: 90,  label: "Up to 2 kW" },
                { maxLoad: 5,        rate: 130, label: "2 kW – 5 kW" },
                { maxLoad: Infinity, rate: 190, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 3.85 },
                { limit: 150,      rate: 4.90 },
                { limit: 300,      rate: 5.85 },
                { limit: Infinity, rate: 6.65 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "17",
              name: "ST-17 – Rural Metered",
              description: "Metered consumers getting supply as per rural schedule (village / gram sabha area)",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            },
            {
              id: "13",
              name: "ST-13 – Rural Unmetered (≤ 2 kW)",
              description: "Unmetered consumers getting supply up to 2 kW in rural areas",
              fixedCharge: 60,
              energySlabs: [
                { limit: 100,      rate: 3.35 },
                { limit: 150,      rate: 4.40 },
                { limit: 300,      rate: 5.25 },
                { limit: Infinity, rate: 6.10 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        },
        {
          id: "commercial", name: "LT-IV Commercial / Non-Domestic",
          supplyTypes: [
            {
              id: "20",
              name: "ST-20 – Urban / Non-Rural Metered",
              description: "Metered commercial consumers getting supply as per non-rural (urban) schedule",
              fixedCharge: { type: "tiered", slabs: [
                { maxLoad: 5,        rate: 180, label: "Up to 5 kW" },
                { maxLoad: Infinity, rate: 300, label: "Above 5 kW" }
              ]},
              energySlabs: [
                { limit: 100,      rate: 6.50 },
                { limit: 300,      rate: 7.50 },
                { limit: Infinity, rate: 8.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.20
            },
            {
              id: "27",
              name: "ST-27 – Rural Metered",
              description: "Metered commercial consumers getting supply as per rural schedule",
              fixedCharge: 120,
              energySlabs: [
                { limit: 100,      rate: 5.50 },
                { limit: 300,      rate: 6.50 },
                { limit: Infinity, rate: 7.50 }
              ],
              additionalCharges: [
                { name: "Electricity Duty", type: "percent_energy", rate: 5 }
              ],
              fac: 0.15
            }
          ]
        }
      ]
    },
    {
      id: "kesco", name: "KESCO",
      fullName: "Kanpur Electricity Supply Company Ltd.",
      area: "Kanpur city and district",
      tariffYear: "2024-25", website: "https://www.kesco.co.in",
      categories: [
        {
          id: "domestic", name: "LT-I Domestic (Urban)",
          fixedCharge: 90,
          energySlabs: [
            { limit: 100,      rate: 3.85 },
            { limit: 150,      rate: 4.90 },
            { limit: 300,      rate: 5.85 },
            { limit: Infinity, rate: 6.65 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "Uttarakhand": [
    {
      id: "upcl", name: "UPCL",
      fullName: "Uttarakhand Power Corporation Ltd.",
      area: "Entire Uttarakhand",
      tariffYear: "2024-25", website: "https://www.upcl.org",
      categories: [
        {
          id: "domestic", name: "LT-1 (Domestic / Residential)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 2,        rate: 60,  label: "Up to 2 kW" },
            { maxLoad: 5,        rate: 100, label: "2 kW – 5 kW" },
            { maxLoad: Infinity, rate: 170, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 2.50 },
            { limit: 200,      rate: 3.25 },
            { limit: 400,      rate: 4.00 },
            { limit: Infinity, rate: 5.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        },
        {
          id: "commercial", name: "LT-2 (Commercial / Non-Domestic)",
          fixedCharge: { type: "tiered", slabs: [
            { maxLoad: 5,        rate: 150, label: "Up to 5 kW" },
            { maxLoad: Infinity, rate: 280, label: "Above 5 kW" }
          ]},
          energySlabs: [
            { limit: 100,      rate: 5.50 },
            { limit: 300,      rate: 6.50 },
            { limit: Infinity, rate: 7.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ]
        }
      ]
    }
  ],

  "West Bengal": [
    {
      id: "wbsedcl", name: "WBSEDCL",
      fullName: "West Bengal State Electricity Distribution Company Ltd.",
      area: "All of West Bengal except CESC area (Kolkata city and DPL area)",
      tariffYear: "2024-25", website: "https://www.wbsedcl.in",
      categories: [
        {
          id: "domestic", name: "LT-A1 (Domestic / Residential)",
          fixedCharge: 35,
          energySlabs: [
            { limit: 25,       rate: 4.61 },
            { limit: 75,       rate: 5.83 },
            { limit: 200,      rate: 7.41 },
            { limit: 300,      rate: 7.99 },
            { limit: Infinity, rate: 8.84 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 }
          ]
        },
        {
          id: "commercial", name: "LT-B (Commercial / Non-Domestic)",
          fixedCharge: 70,
          energySlabs: [
            { limit: 100,      rate: 7.50 },
            { limit: 300,      rate: 9.00 },
            { limit: Infinity, rate: 10.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 }
          ]
        }
      ]
    },
    {
      id: "cesc_kolkata", name: "CESC (Kolkata)",
      fullName: "CESC Ltd. (Calcutta Electric Supply Corporation)",
      area: "Kolkata city, Howrah, Hooghly (parts)",
      tariffYear: "2024-25", website: "https://www.cesc.co.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic (Residential)",
          fixedCharge: 15,
          energySlabs: [
            { limit: 25,       rate: 4.61 },
            { limit: 75,       rate: 5.83 },
            { limit: 200,      rate: 7.41 },
            { limit: 300,      rate: 7.99 },
            { limit: Infinity, rate: 8.84 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 },
            { name: "Meter Rent", type: "flat", rate: 15 }
          ]
        }
      ]
    },
    {
      id: "dpl", name: "DPL",
      fullName: "CESC DPL (Durgapur Projects Ltd.)",
      area: "Durgapur industrial and urban area",
      tariffYear: "2024-25", website: "https://www.dpl.co.in",
      categories: [
        {
          id: "domestic", name: "LT Domestic",
          fixedCharge: 35,
          energySlabs: [
            { limit: 25,       rate: 4.50 },
            { limit: 75,       rate: 5.50 },
            { limit: 200,      rate: 7.00 },
            { limit: Infinity, rate: 8.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty (ED)", type: "percent_energy", rate: 4 }
          ]
        }
      ]
    }
  ]
};

// Helper: get sorted list of all states
function getStates() {
  return Object.keys(TARIFF_DB).sort();
}

// Helper: get DISCOMs for a state
function getDiscoms(state) {
  return TARIFF_DB[state] || [];
}

// Helper: find a DISCOM by id
function findDiscom(discomId) {
  for (const state of Object.values(TARIFF_DB)) {
    const d = state.find(x => x.id === discomId);
    if (d) return d;
  }
  return null;
}

// Helper: get categories for a DISCOM
function getCategories(discomId) {
  const discom = findDiscom(discomId);
  return discom ? discom.categories : [];
}

// Helper: get a specific category
function getCategory(discomId, categoryId) {
  const cats = getCategories(discomId);
  return cats.find(c => c.id === categoryId) || null;
}

// Helper: get supply types for a category (empty array if none)
function getSupplyTypes(discomId, categoryId) {
  const cat = getCategory(discomId, categoryId);
  return (cat && cat.supplyTypes) ? cat.supplyTypes : [];
}

// Helper: resolve effective tariff (merges supplyType into category if present)
function getEffectiveTariff(discomId, categoryId, supplyTypeId) {
  const cat = getCategory(discomId, categoryId);
  if (!cat) return null;
  if (cat.supplyTypes && cat.supplyTypes.length > 0) {
    const st = supplyTypeId
      ? (cat.supplyTypes.find(s => s.id === supplyTypeId) || cat.supplyTypes[0])
      : cat.supplyTypes[0];
    return { ...st, categoryId: cat.id, categoryName: cat.name };
  }
  return { ...cat, categoryId: cat.id, categoryName: cat.name };
}

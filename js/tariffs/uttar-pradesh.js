// Uttar Pradesh — Electricity Tariff Data (2026-27; rates retained from 2025-26 per UPERC order dt. 02-Jul-2026)
// Source: Publicly available tariff orders from the respective SERC.
// To update rates: edit the shared makeCategories() factory below.
// See TARIFF_GUIDE.md for the complete field schema and step-by-step instructions.
//
// All 5 UP DISCOMs (DVVNL, MVVNL, PVVNL, PuVVNL, KESCO) share the same UPERC-notified
// tariff schedule. Rates are defined ONCE in makeCategories() and cloned per DISCOM to
// keep the module small (~240 lines vs. ~1,160 with inline repetition).

// ── Shared UPERC tariff schedule (FY 2026-27 — retained unchanged from FY 2025-26) ───────────

function makeCategories() {
  return [
    {
      id: "domestic",
      name: "LMV-1 Residential / Domestic",
      supplyTypes: [
        {
          id: "10A",
          name: "ST-10A – Urban Life Line (Sanctioned Load ≤ 1 kW)",
          description: "Urban/non-rural domestic Life Line consumers: contracted load ≤ 1 kW, consuming up to 100 units/month. Gross ₹6.50/unit; ₹3.75/unit Govt. subsidy (raised from ₹3.50 in the FY 2026-27 order); net consumer rate ₹2.75/unit. For load > 1 kW or > 100 units/month, select ST-10B.",
          fixedCharge: { type: "per_kw", rate: 50 },
          energySlabs: [
            { limit: 100, rate: 2.75 },
            { limit: Infinity, rate: 5.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_total", rate: 5 }
          ],
          fac: 0.00,
          // Gross tariff unchanged in the FY 2026-27 order (dt. 02-Jul-2026); only the GoUP
          // lifeline subsidy moved (₹3.50 → ₹3.75/unit), so the net first-slab rate is what changes.
          currentRatesFrom: "2026-07-02",
          periodLabel: "FY 2026-27 (subsidy revised 02-Jul-2026)",
          rateHistory: [
            {
              from: "2024-10-01",
              label: "FY 2024-25 – Jun 2026 (₹3.50/unit subsidy)",
              estimated: false,
              fixedCharge: { type: "per_kw", rate: 50 },
              energySlabs: [
                { limit: 100, rate: 3.00 },
                { limit: Infinity, rate: 5.50 }
              ]
            }
          ]
        },
        {
          id: "10B",
          name: "ST-10B – Urban Domestic (Sanctioned Load > 1 kW)",
          description: "Metered urban/non-rural domestic consumers with sanctioned load above 1 kW (non-Life Line). Fixed charge ₹110/kW/month.",
          fixedCharge: { type: "per_kw", rate: 110 },
          energySlabs: [
            { limit: 150, rate: 5.50 },
            { limit: 300, rate: 6.00 },
            { limit: Infinity, rate: 6.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_total", rate: 5 }
          ],
          fac: 0.00,
          // Verified: UP urban domestic slabs (₹5.50/6.00/6.50, fixed ₹110/kW) have been
          // stable since the UPERC FY2019-20 order (eff. 12 Sep 2019) — multiple no-hike years.
          rateHistory: [
            {
              from: "2019-09-12",
              label: "FY 2019-20 (Sep 2019 – Oct 2024)",
              estimated: false,
              fixedCharge: { type: "per_kw", rate: 110 },
              energySlabs: [
                { limit: 150, rate: 5.50 },
                { limit: 300, rate: 6.00 },
                { limit: Infinity, rate: 6.50 }
              ]
            }
          ]
        },
        {
          id: "17",
          name: "ST-17 – Rural Life Line (≤ 1 kW, ≤ 100 units)",
          description: "Life Line rural consumers: contracted load ≤ 1 kW consuming up to 100 units/month. Gross ₹6.50/unit; ₹3.75/unit Govt. subsidy (raised from ₹3.50 in the FY 2026-27 order); net consumer rate ₹2.75/unit. For load > 1 kW or > 100 units/month, select 'Rural Non-Life Line'.",
          fixedCharge: { type: "per_kw", rate: 50 },
          energySlabs: [
            { limit: 100, rate: 2.75 },
            { limit: Infinity, rate: 2.95 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_total", rate: 5 }
          ],
          fac: 0.00,
          // Gross tariff unchanged in the FY 2026-27 order (dt. 02-Jul-2026); GoUP subsidy moved
          // (lifeline ₹3.50 → ₹3.75, rural 0–100 ₹3.30 → ₹3.70), changing both net slab rates.
          // The Infinity slab mirrors rural non-lifeline's first slab, as before.
          currentRatesFrom: "2026-07-02",
          periodLabel: "FY 2026-27 (subsidy revised 02-Jul-2026)",
          rateHistory: [
            {
              from: "2024-10-01",
              label: "FY 2024-25 – Jun 2026 (₹3.50/unit subsidy)",
              estimated: false,
              fixedCharge: { type: "per_kw", rate: 50 },
              energySlabs: [
                { limit: 100, rate: 3.00 },
                { limit: Infinity, rate: 3.35 }
              ]
            }
          ]
        },
        {
          id: "17B",
          name: "ST-17 – Rural Non-Life Line (Sanctioned Load > 1 kW)",
          description: "Metered rural/gram sabha domestic consumers with sanctioned load above 1 kW, or consuming more than 100 units/month. Fixed charge ₹90/kW/month. First two slabs are net of the GoUP subsidy (0–100: ₹3.70/unit, 101–150: ₹3.50/unit, both raised in the FY 2026-27 order).",
          fixedCharge: { type: "per_kw", rate: 90 },
          energySlabs: [
            { limit: 100, rate: 2.95 },
            { limit: 150, rate: 3.35 },
            { limit: 300, rate: 5.00 },
            { limit: Infinity, rate: 5.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_total", rate: 5 }
          ],
          fac: 0.00,
          // Gross tariff unchanged in the FY 2026-27 order (dt. 02-Jul-2026); GoUP subsidy moved
          // on the first two slabs only (0–100: ₹3.30 → ₹3.70 ⇒ net 3.35 → 2.95; 101–150:
          // ₹3.00 → ₹3.50 ⇒ net 3.85 → 3.35). Slabs above 150 units carry no subsidy — unchanged.
          currentRatesFrom: "2026-07-02",
          periodLabel: "FY 2026-27 (subsidy revised 02-Jul-2026)",
          rateHistory: [
            {
              from: "2024-10-01",
              label: "FY 2024-25 – Jun 2026 (₹3.30/₹3.00 subsidy)",
              estimated: false,
              fixedCharge: { type: "per_kw", rate: 90 },
              energySlabs: [
                { limit: 100, rate: 3.35 },
                { limit: 150, rate: 3.85 },
                { limit: 300, rate: 5.00 },
                { limit: Infinity, rate: 5.50 }
              ]
            }
          ]
        },
        {
          id: "13",
          name: "ST-13 – Rural Unmetered (≤ 2 kW)",
          description: "Unmetered consumers getting supply up to 2 kW in rural areas",
          fixedCharge: 60,
          energySlabs: [
            { limit: 100, rate: 3.35 },
            { limit: 150, rate: 4.4 },
            { limit: 300, rate: 5.25 },
            { limit: Infinity, rate: 6.1 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_energy", rate: 5 }
          ],
          fac: 0.15
        }
      ]
    },
    {
      id: "commercial",
      name: "LMV-2 Commercial / Non-Domestic",
      supplyTypes: [
        {
          id: "20",
          name: "ST-20 – Urban / Non-Rural (Sanctioned Load ≤ 4 kW)",
          description: "Metered commercial consumers with sanctioned load up to 4 kW, non-rural (urban) schedule. Fixed charge ₹330/kW/month.",
          fixedCharge: { type: "per_kw", rate: 330 },
          excessDemandRate: 660,
          energySlabs: [
            { limit: 300, rate: 7.50 },
            { limit: Infinity, rate: 8.40 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_total", rate: 7.5 }
          ],
          fac: 1.02
        },
        {
          id: "20HV",
          name: "ST-20 – Urban / Non-Rural (Sanctioned Load > 4 kW)",
          description: "Metered commercial consumers with sanctioned load above 4 kW, non-rural (urban) schedule. Fixed charge ₹450/kW/month.",
          fixedCharge: { type: "per_kw", rate: 450 },
          excessDemandRate: 660,
          energySlabs: [
            { limit: 1000, rate: 7.50 },
            { limit: Infinity, rate: 8.75 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_total", rate: 7.5 }
          ],
          fac: 1.02
        },
        {
          id: "27",
          name: "ST-27 – Rural Non-Domestic Metered",
          description: "Metered commercial/non-domestic consumers in rural/gram sabha areas. Fixed charge ₹110/kW/month; flat energy rate ₹5.50/unit.",
          fixedCharge: { type: "per_kw", rate: 110 },
          energySlabs: [
            { limit: Infinity, rate: 5.50 }
          ],
          additionalCharges: [
            { name: "Electricity Duty", type: "percent_total", rate: 7.5 }
          ],
          fac: 0.00
        }
      ]
    }
  ];
}

// ── DISCOM metadata (unique per DISCOM) ──────────────────────────────────────

const DISCOM_META = [
  {
    id: "dvvnl",
    name: "DVVNL",
    fullName: "Dakshinanchal Vidyut Vitaran Nigam Ltd.",
    area: "South UP (Agra, Mathura, Aligarh, Firozabad, Hathras, Etah, Mainpuri, Etawah, Farrukhabad, Kannauj, Jhansi, Lalitpur, Jalaun, Hamirpur, Mahoba, Banda, Chitrakoot)",
    website: "https://www.dvvnl.org",
  },
  {
    id: "mvvnl",
    name: "MVVNL",
    fullName: "Madhyanchal Vidyut Vitaran Nigam Ltd.",
    area: "Central UP (Lucknow, Sitapur, Hardoi, Unnao, Rae Bareli, Lakhimpur Kheri, Barabanki, Gonda, Balrampur, Shravasti, Bahraich)",
    website: "https://www.mvvnl.in",
  },
  {
    id: "pvvnl",
    name: "PVVNL",
    fullName: "Paschimanchal Vidyut Vitaran Nigam Ltd.",
    area: "West UP (Meerut, Ghaziabad, Noida, Hapur, Bulandshahr, Muzaffarnagar, Saharanpur, Shamli, Baghpat, Amroha, Moradabad, Rampur, Bijnor, Pilibhit, Shahjahanpur)",
    website: "https://www.pvvnl.org",
  },
  {
    id: "puvvnl",
    name: "PuVVNL",
    fullName: "Purvanchal Vidyut Vitaran Nigam Ltd.",
    area: "East UP (Varanasi, Prayagraj, Gorakhpur, Mirzapur, Sonbhadra, Azamgarh, Mau, Jaunpur, Bhadohi, Chandauli, Ghazipur)",
    website: "https://www.puvvnl.com",
  },
  {
    id: "kesco",
    name: "KESCO",
    fullName: "Kanpur Electricity Supply Company Ltd.",
    area: "Kanpur city and district",
    website: "https://www.kesco.co.in",
  },
];

export default {
  state: "Uttar Pradesh",
  // Date the current (latest) rate set took effect. Bills before this resolve to a
  // historical entry (see each supply type's rateHistory) or are flagged ESTIMATED.
  // UPERC's FY 2026-27 order (dt. 02-Jul-2026) retained the whole retail schedule unchanged —
  // gross rates and fixed charges date from Oct 2024, so that stays the state-level default.
  // Only the GoUP domestic subsidy moved; the three subsidised supply types (ST-10A, ST-17,
  // ST-17B) self-declare currentRatesFrom: "2026-07-02" with their pre-July nets in rateHistory.
  currentRatesFrom: "2024-10-01",
  // The FY2025-26 schedule was checked to the paisa against real MVVNL bills; the FY 2026-27
  // order retains it unchanged, so the "Verified rates" badge stands. The July-2026
  // subsidy-adjusted lifeline/rural nets are computed from the notified subsidy amounts and
  // still await confirmation against a post-July real bill.
  verified: true,
  ratesAsOf: "FY 2026-27 (UPERC order dt. 02-Jul-2026, rates retained)",
  sourceUrl: "https://www.uperc.org",
  discoms: DISCOM_META.map(d => ({
    ...d,
    tariffYear: "2026-27",
    lpscRate: 1.5,
    categories: makeCategories(),
  })),
};

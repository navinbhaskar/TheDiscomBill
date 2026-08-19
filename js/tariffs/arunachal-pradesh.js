// Arunachal Pradesh - Electricity Tariff Data (FY 2024-25)
// Source analysed: APSERC retail supply tariff order for APDOP, issued 26-Jul-2024.
// The order is effective from 01-Jul-2024 and remains in force until 31-Mar-2025 unless amended.
// APSERC here is Arunachal Pradesh State Electricity Regulatory Commission.

const flat = (rate) => [
  {
    limit: Infinity,
    rate
  }
];

const NO_FIXED_CHARGE = 0;
const NO_MINIMUM_CHARGE = 0;

const SINGLE_PART_NOTE =
  "APSERC continued a single-part retail tariff for FY 2024-25. The schedule has energy charges only; no fixed charge or minimum monthly charge is applied in this model.";

const REBATE_NOTE =
  "Post-paid consumers receive a 3% rebate on current bills paid within the due date. Prepaid consumers receive a 5% rebate on recharge amount. Rebates are not automatically deducted by this calculator.";

const ltSingleMeterRent = {
  name: "Post-paid meter rent - LT single phase",
  type: "flat_monthly",
  rate: 20
};

const ltThreeMeterRent = {
  name: "Post-paid meter rent - LT three phase without CT",
  type: "flat_monthly",
  rate: 50
};

const ht11MeterRent = {
  name: "Post-paid meter rent - HT 11 kV",
  type: "flat_monthly",
  rate: 500
};

const ht33MeterRent = {
  name: "Post-paid meter rent - HT 33 kV",
  type: "flat_monthly",
  rate: 750
};

const ht132MeterRent = {
  name: "Post-paid meter rent - HT 132 kV",
  type: "flat_monthly",
  rate: 1000
};

const supply = (id, name, rate, meterCharge, description) => ({
  id,
  name,
  description,
  fixedCharge: NO_FIXED_CHARGE,
  minCharge: NO_MINIMUM_CHARGE,
  energySlabs: flat(rate),
  meterCharge,
  notes: SINGLE_PART_NOTE
});

export default {
  state: "Arunachal Pradesh",
  ratesAsOf: "FY 2024-25 APSERC retail supply tariff order for APDOP",
  currentRatesFrom: "2024-07-01",
  verifiedOn: "2026-08-19",
  sourceUrl: "https://apserc.nic.in",
  notes: `${SINGLE_PART_NOTE} ${REBATE_NOTE} Prepaid consumers have nil monthly energy meter rent under Schedule-II.`,
  discoms: [
    {
      id: "appdcl",
      name: "APDOP / Dept. of Power",
      fullName: "Department of Power, Government of Arunachal Pradesh",
      area: "Entire Arunachal Pradesh",
      tariffYear: "2024-25",
      website: "https://appdcl.in",
      sourceUrl: "https://apserc.nic.in",
      lpscRate: 2,
      notes:
        "Late payment penalty is simple interest at 2% for each successive 30-day period or part thereof until the bill is paid.",
      categories: [
        {
          id: "domestic",
          name: "Category 1 - Residential / Domestic",
          notes: `${SINGLE_PART_NOTE} Kutir Jyoti and BPL connections have a separate lower energy rate. ${REBATE_NOTE}`,
          supplyTypes: [
            supply(
              "domestic_lt_single_phase",
              "Domestic LT - 1-phase 230 V",
              4.0,
              ltSingleMeterRent,
              "Domestic and non-commercial LT single-phase consumers."
            ),
            supply(
              "domestic_lt_three_phase",
              "Domestic LT - 3-phase 400 V",
              4.0,
              ltThreeMeterRent,
              "Domestic and non-commercial LT three-phase consumers."
            ),
            supply(
              "domestic_kjp_bpl",
              "Kutir Jyoti / BPL connection",
              2.65,
              ltSingleMeterRent,
              "Kutir Jyoti and BPL domestic connections."
            ),
            supply(
              "domestic_ht_11kv",
              "Domestic HT - 11 kV",
              3.4,
              ht11MeterRent,
              "Domestic and non-commercial consumers supplied at 11 kV."
            ),
            supply(
              "domestic_ht_33kv",
              "Domestic HT - 33 kV",
              3.25,
              ht33MeterRent,
              "Domestic and non-commercial consumers supplied at 33 kV."
            )
          ]
        },
        {
          id: "commercial",
          name: "Category 2 - Commercial / Non-industrial",
          notes: `${SINGLE_PART_NOTE} Mixed domestic and commercial premises are treated as commercial when commercial load exceeds 10% of total connected load.`,
          supplyTypes: [
            supply(
              "commercial_lt_single_phase",
              "Commercial LT - 1-phase 230 V",
              5.0,
              ltSingleMeterRent,
              "Commercial and non-industrial LT single-phase consumers."
            ),
            supply(
              "commercial_lt_three_phase",
              "Commercial LT - 3-phase 400 V",
              5.0,
              ltThreeMeterRent,
              "Commercial and non-industrial LT three-phase consumers."
            ),
            supply(
              "commercial_ht_11kv",
              "Commercial HT - 11 kV",
              4.2,
              ht11MeterRent,
              "Commercial and non-industrial consumers supplied at 11 kV."
            ),
            supply(
              "commercial_ht_33kv",
              "Commercial HT - 33 kV",
              4.0,
              ht33MeterRent,
              "Commercial and non-industrial consumers supplied at 33 kV."
            )
          ]
        },
        {
          id: "public_lighting_water",
          name: "Category 3 - Public lighting and water supply",
          notes: SINGLE_PART_NOTE,
          supplyTypes: [
            supply(
              "public_lt_single_phase",
              "Public lighting / water LT - 1-phase 230 V",
              5.1,
              ltSingleMeterRent,
              "Public lighting and water supply LT single-phase consumers."
            ),
            supply(
              "public_lt_three_phase",
              "Public lighting / water LT - 3-phase 400 V",
              5.1,
              ltThreeMeterRent,
              "Public lighting and water supply LT three-phase consumers."
            ),
            supply(
              "public_ht_11kv",
              "Public lighting / water HT - 11 kV",
              4.2,
              ht11MeterRent,
              "Public lighting and water supply consumers supplied at 11 kV."
            ),
            supply(
              "public_ht_33kv",
              "Public lighting / water HT - 33 kV",
              4.0,
              ht33MeterRent,
              "Public lighting and water supply consumers supplied at 33 kV."
            )
          ]
        },
        {
          id: "agricultural",
          name: "Category 4 - Agricultural",
          notes: SINGLE_PART_NOTE,
          supplyTypes: [
            supply(
              "agriculture_lt_single_phase",
              "Agricultural LT - 1-phase 230 V",
              3.1,
              ltSingleMeterRent,
              "Agricultural LT single-phase consumers."
            ),
            supply(
              "agriculture_lt_three_phase",
              "Agricultural LT - 3-phase 400 V",
              3.1,
              ltThreeMeterRent,
              "Agricultural LT three-phase consumers."
            ),
            supply(
              "agriculture_ht_11kv",
              "Agricultural HT - 11 kV",
              2.75,
              ht11MeterRent,
              "Agricultural consumers supplied at 11 kV."
            ),
            supply(
              "agriculture_ht_33kv",
              "Agricultural HT - 33 kV",
              2.65,
              ht33MeterRent,
              "Agricultural consumers supplied at 33 kV."
            )
          ]
        },
        {
          id: "industrial",
          name: "Category 5 - Industrial",
          notes:
            `${SINGLE_PART_NOTE} Non-industrial or commercial use within an industrial premises is treated as industrial only when it is below 10% of total connected load; otherwise separate metering/tariff applies.`,
          supplyTypes: [
            supply(
              "industrial_lt_single_phase",
              "Industrial LT - 1-phase 230 V",
              4.3,
              ltSingleMeterRent,
              "Industrial LT single-phase consumers."
            ),
            supply(
              "industrial_lt_three_phase",
              "Industrial LT - 3-phase 400 V",
              4.3,
              ltThreeMeterRent,
              "Industrial LT three-phase consumers."
            ),
            supply(
              "industrial_ht_11kv",
              "Industrial HT - 11 kV",
              3.85,
              ht11MeterRent,
              "Industrial consumers supplied at 11 kV."
            ),
            supply(
              "industrial_ht_33kv",
              "Industrial HT - 33 kV",
              3.5,
              ht33MeterRent,
              "Industrial consumers supplied at 33 kV."
            ),
            supply(
              "industrial_ht_132kv",
              "Industrial HT - 132 kV",
              3.35,
              ht132MeterRent,
              "Industrial consumers supplied at 132 kV."
            )
          ]
        },
        {
          id: "bulk_mixed",
          name: "Category 6 - Bulk mixed consumers",
          notes: SINGLE_PART_NOTE,
          supplyTypes: [
            supply(
              "bulk_mixed_ht_11kv",
              "Bulk mixed HT - 11 kV",
              3.75,
              ht11MeterRent,
              "Bulk mixed consumers supplied at 11 kV."
            ),
            supply(
              "bulk_mixed_ht_33kv",
              "Bulk mixed HT - 33 kV",
              3.4,
              ht33MeterRent,
              "Bulk mixed consumers supplied at 33 kV."
            ),
            supply(
              "bulk_mixed_ht_132kv",
              "Bulk mixed HT - 132 kV and above",
              3.25,
              ht132MeterRent,
              "Bulk mixed consumers supplied at 132 kV and above."
            )
          ]
        },
        {
          id: "temporary",
          name: "Category 7 - Temporary consumers",
          notes:
            `${SINGLE_PART_NOTE} Temporary supply is for construction, repairs, ceremonies, exhibitions and similar short-duration uses normally not exceeding 90 days.`,
          supplyTypes: [
            supply(
              "temporary_lt_single_phase",
              "Temporary LT - 1-phase 230 V",
              6.5,
              ltSingleMeterRent,
              "Temporary LT single-phase consumers."
            ),
            supply(
              "temporary_lt_three_phase",
              "Temporary LT - 3-phase 400 V",
              6.5,
              ltThreeMeterRent,
              "Temporary LT three-phase consumers."
            )
          ]
        }
      ]
    }
  ]
};

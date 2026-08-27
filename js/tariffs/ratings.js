// js/tariffs/ratings.js
// Integrated Rating grades for each DISCOM, as published by Power Finance Corporation Ltd (PFC)
// under the Ministry of Power framework. One grade per utility, refreshed annually.
//
// WHAT THE GRADE MEASURES — worth being precise about, because readers will assume it scores
// the quality of their supply. It does not. The rating scores a utility's FINANCIAL and
// OPERATIONAL performance (AT&C losses, billing/collection efficiency, ACS-ARR gap, payment
// of dues, corporate governance) plus the regulatory environment and state support it gets.
// A C- utility is in financial trouble; it is not a statement about how often the power cuts
// out. Any page showing a grade has to say so, or it misleads.
//
// TWO SEPARATE TABLES. The report ranks state and private distribution utilities (1-54) and
// state power departments (1-11) in different tables, so a rank is only meaningful against
// its own cohort. NDMC is 3rd of 11 power departments, NOT 3rd in India. `rankOf` carries the
// cohort size so no page can accidentally claim otherwise.
//
// NOT EVERY DISCOM IS RATED. Seven of our 65 are absent from the report (see UNRATED below).
// Their pages show nothing — an inferred grade would be a fabrication.
//
// SOURCE NOTE. PFC rebuilt its website and the DocumentRepository path that hosted the PDF now
// returns the site shell for every request, so the live link is dead. sourceUrl points at the
// Internet Archive capture, which resolves and is content-addressed by date; `source` names the
// document itself. Re-check when PFC republishes.

export const RATING_REPORT = {
  edition: 14,
  name: "14th Annual Integrated Rating & Ranking of Power Distribution Utilities",
  publisher: "Power Finance Corporation Ltd (PFC), for the Ministry of Power",
  fy: "2024-25",            // the financial year the performance data covers
  publishedOn: "2026-01-23",
  source: "PFC / Ministry of Power, 14th Annual Integrated Rating & Ranking of Power Distribution Utilities (FY 2024-25), Tables II and III",
  sourceUrl: "https://web.archive.org/web/20260421013237/https://www.pfcindia.co.in/ensite/DocumentRepository/ckfinder/files/GoI_Initiatives/Annual_Integrated_Ratings_of_State_DISCOMs/14th_Annual_Integrated%20Rating%20and%20Ranking%20of%20Power%20Distribution_Utilities.pdf",
  verifiedOn: "2026-08-26",
};

// Grade overrides the report applies on top of the raw score, and footnotes. These matter:
// TPDDL scores 84.35 — an A band — but is graded B- because of the regulatory-asset
// disincentive, and a page that showed the score without the reason would look wrong.
export const OVERRIDE_REASON = {
  "regulatory-asset": "Graded down from its score under the report's regulatory-asset disincentive.",
  "acs-arr": "Graded down from its score under the report's ACS-ARR gap rule.",
};

// Keyed by our own DISCOM id. grade: A+ | A | B | B- | C | C-
export const DISCOM_RATING = {
  adani_mumbai: { grade: "A+", score: 99.75, rank: 3, rankOf: 54, kind: "utility", movement: null, reportName: "AEML" },
  ugvcl: { grade: "A+", score: 98.94, rank: 4, rankOf: 54, kind: "utility", movement: null, reportName: "UGVCL" },
  mgvcl: { grade: "A+", score: 98.6, rank: 5, rankOf: 54, kind: "utility", movement: null, reportName: "MGVCL" },
  dgvcl: { grade: "A+", score: 97.85, rank: 6, rankOf: 54, kind: "utility", movement: null, reportName: "DGVCL" },
  pgvcl: { grade: "A+", score: 95.74, rank: 8, rankOf: 54, kind: "utility", movement: null, reportName: "PGVCL" },
  tpnodl: { grade: "A+", score: 94.77, rank: 9, rankOf: 54, kind: "utility", movement: null, reportName: "TPNODL" },
  tpcodl: { grade: "A+", score: 93.0, rank: 10, rankOf: 54, kind: "utility", movement: null, reportName: "TPCODL" },
  pspcl: { grade: "A+", score: 89.22, rank: 11, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "PSPCL" },
  pvvnl: { grade: "A+", score: 86.57, rank: 12, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "PVVNL" },
  nbpdcl: { grade: "A", score: 82.02, rank: 13, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "NBPDCL" },
  apdcl: { grade: "A", score: 80.99, rank: 14, rankOf: 54, kind: "utility", movement: null, reportName: "APDCL" },
  tpwodl: { grade: "A", score: 78.3, rank: 16, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "TPWODL" },
  dhbvn: { grade: "A", score: 74.44, rank: 17, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "DHBVNL" },
  mppkvvcl: { grade: "A", score: 71.85, rank: 18, rankOf: 54, kind: "utility", movement: null, reportName: "MPPaKVVCL" },
  cspdcl: { grade: "A", score: 70.4, rank: 19, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "CSPDCL" },
  sbpdcl: { grade: "A", score: 67.37, rank: 20, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "SBPDCL" },
  uhbvn: { grade: "A", score: 66.32, rank: 21, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "UHBVNL" },
  wbsedcl: { grade: "A", score: 65.39, rank: 22, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "WBSEDCL" },
  kseb: { grade: "B", score: 63.25, rank: 24, rankOf: 54, kind: "utility", movement: null, reportName: "KSEBL" },
  upcl: { grade: "B", score: 60.97, rank: 25, rankOf: 54, kind: "utility", movement: null, reportName: "UPCL" },
  mescom: { grade: "B", score: 56.44, rank: 26, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "MESCOM" },
  apspdcl: { grade: "B", score: 54.24, rank: 27, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "APSPDCL" },
  hpsebl: { grade: "B", score: 53.69, rank: 28, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "HPSEBL" },
  mepdcl: { grade: "B", score: 50.9, rank: 29, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "MePDCL" },
  jdvvnl: { grade: "B", score: 50.47, rank: 30, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "JdVVNL" },
  apepdcl: { grade: "B", score: 50.46, rank: 31, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "APEPDCL" },
  tpddl: { grade: "B-", score: 84.35, rank: 32, rankOf: 54, kind: "utility", movement: null, override: "regulatory-asset", reportName: "TPDDL" },
  brpl: { grade: "B-", score: 70.24, rank: 33, rankOf: 54, kind: "utility", movement: null, override: "regulatory-asset", reportName: "BRPL" },
  bypl: { grade: "B-", score: 69.54, rank: 34, rankOf: 54, kind: "utility", movement: null, override: "regulatory-asset", reportName: "BYPL" },
  tpsodl: { grade: "B-", score: 63.91, rank: 35, rankOf: 54, kind: "utility", movement: null, override: "acs-arr", reportName: "TPSODL" },
  mspdcl: { grade: "B-", score: 48.53, rank: 36, rankOf: 54, kind: "utility", movement: null, reportName: "MSPDCL" },
  jvvnl: { grade: "B-", score: 47.27, rank: 37, rankOf: 54, kind: "utility", movement: null, reportName: "JVVNL" },
  dvvnl: { grade: "B-", score: 45.04, rank: 38, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "DVVNL" },
  tangedco: { grade: "B-", score: 43.92, rank: 39, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "TNPDCL" },
  kesco: { grade: "B-", score: 42.52, rank: 40, rankOf: 54, kind: "utility", movement: null, reportName: "KESCO" },
  mvvnl: { grade: "B-", score: 38.82, rank: 41, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "MVVNL" },
  avvnl: { grade: "B-", score: 37.51, rank: 42, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "AVVNL" },
  mpez: { grade: "B-", score: 37.14, rank: 43, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "MPPoKVVCL" },
  cesc_karnataka: { grade: "B-", score: 36.85, rank: 44, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "CHESCOM" },
  puvvnl: { grade: "C", score: 29.38, rank: 45, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "PuVVNL" },
  mpmkvvcl: { grade: "C", score: 27.77, rank: 46, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "MPMKVVCL" },
  hescom: { grade: "C", score: 27.15, rank: 47, rankOf: 54, kind: "utility", movement: null, reportName: "HESCOM" },
  gescom: { grade: "C", score: 18.45, rank: 48, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "GESCOM" },
  msedcl: { grade: "C", score: 16.63, rank: 49, rankOf: 54, kind: "utility", movement: "Upgrade", reportName: "MSEDCL" },
  tsecl: { grade: "C", score: 15.42, rank: 50, rankOf: 54, kind: "utility", movement: null, reportName: "TSECL" },
  bescom: { grade: "C-", score: 12.44, rank: 51, rankOf: 54, kind: "utility", movement: "Downgrade", reportName: "BESCOM" },
  tsspdcl: { grade: "C-", score: 11.84, rank: 52, rankOf: 54, kind: "utility", movement: null, reportName: "TGSPDCL" },
  jbvnl: { grade: "C-", score: 9.65, rank: 53, rankOf: 54, kind: "utility", movement: null, reportName: "JBVNL" },
  tsnpdcl: { grade: "C-", score: 8.48, rank: 54, rankOf: 54, kind: "utility", movement: null, reportName: "TGNPDCL" },
  best_mumbai: { grade: "A+", score: 95.95, rank: 2, rankOf: 11, kind: "power-dept", movement: "Upgrade", reportName: "BEST" },
  ndmc_delhi: { grade: "A+", score: 88.63, rank: 3, rankOf: 11, kind: "power-dept", movement: null, reportName: "NDMC" },
  ged: { grade: "A", score: 84.82, rank: 4, rankOf: 11, kind: "power-dept", movement: null, reportName: "Goa PD" },
  energy_sikkim: { grade: "A", score: 81.52, rank: 5, rankOf: 11, kind: "power-dept", movement: null, reportName: "Sikkim PD" },
  pdicl: { grade: "A", score: 80.95, rank: 6, rankOf: 11, kind: "power-dept", movement: null, reportName: "Puducherry PD" },
  doe_nagaland: { grade: "A", score: 76.49, rank: 7, rankOf: 11, kind: "power-dept", movement: "Upgrade", reportName: "Nagaland PD" },
  lpdcl: { grade: "A", score: 74.56, rank: 8, rankOf: 11, kind: "power-dept", movement: "Upgrade", reportName: "Ladakh PD" },
  ped_mizoram: { grade: "A", score: 67.32, rank: 9, rankOf: 11, kind: "power-dept", movement: "Upgrade", reportName: "Mizoram PD" },
  appdcl: { grade: "B", score: 56.16, rank: 10, rankOf: 11, kind: "power-dept", movement: "Downgrade", reportName: "Arunachal PD" },
};

// Present in our data, absent from the 14th IR report. Listed so the gap is a recorded decision
// rather than an oversight, and so a future edition can be diffed against it.
export const UNRATED = {
  chandigarh_ed: "CPDL Chandigarh is not in the 14th IR report.",
  dnhpdcl: "DNHPDCL is not in the 14th IR report.",
  jkpdd_jammu: "JPDCL is not in the 14th IR report.",
  jkpdd_kashmir: "KPDCL is not in the 14th IR report.",
  tata_power_mumbai: "Tata Power Mumbai Distribution is not separately rated.",
  cesc_kolkata: "Not rated. The report's West Bengal private entry is IPCL, a different licensee.",
  dpl: "Erstwhile DPL area is supplied by WBSEDCL and is not separately rated.",
};

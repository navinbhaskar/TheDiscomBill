// bill-strings.js — every word the bill on /understand-your-bill/ renders, in all four
// languages.
//
// This is separate from understand-bill-content.js for one reason: THIS file ships to the
// browser. The bill re-renders whenever the reader changes an input, so the row labels, the
// formulas and the "on this bill" notes all have to be available at runtime, in the reader's
// language. The prose module stays a build-time file and never reaches the browser.
//
// Notes are functions rather than strings because every one of them interpolates figures the
// engine produced. `c` is a context of ALREADY-FORMATTED values (see buildContext() in
// bill-anatomy.js) — no number formatting happens in here, so a translator can move the
// pieces of a sentence around freely without touching arithmetic.
//
// WHAT IS DELIBERATELY NOT TRANSLATED: FPPA, PPAC, FAC, LPSC, MD, OK, kW, kWh, kVA, kVAh and
// DISCOM. These are what is printed on a real Indian bill and what people search for, in
// every one of these languages. Translating them would make the page harder to match against
// the bill in the reader's hand — the same rule the meter diagram already follows for the
// markings on the casing.

const en = {
  // ── document chrome ──────────────────────────────────────────────────────
  docSub: 'Illustration · not a real bill',
  stamp: 'Sample',
  verified: 'Verified against the order',
  representative: 'Representative rates',
  source: 'Source',
  fallbackDiscom: 'Electricity Distribution Company',

  // ── block headings ───────────────────────────────────────────────────────
  blkAccount: 'Account',
  blkPeriod: 'Billing period',
  blkReading: 'Meter reading',
  blkSlabs: 'Slab ladder behind the energy charge',
  blkCharges: 'Charges',
  blkPayable: 'Amount payable',
  thSlab: 'Slab', thUnits: 'Units', thRate: 'Rate', thAmount: 'Amount',

  // ── row labels ───────────────────────────────────────────────────────────
  consumerNo: 'Consumer number',
  consumerName: 'Consumer name',
  sampleName: 'A. Kumar',
  tariffCategory: 'Tariff category',
  sanctionedLoad: 'Sanctioned load',
  meterNo: 'Meter number',
  billMonth: 'Bill month',
  readingPeriod: 'Reading period',
  billDate: 'Bill date',
  dueDate: 'Due date',
  prevReading: 'Previous reading',
  presReading: 'Present reading',
  unitsConsumed: 'Units consumed',
  maxDemand: 'Maximum demand',
  readingStatus: 'Reading status',
  energyCharge: 'Energy charge',
  fixedCharge: 'Fixed charge',
  demandCharge: 'Demand charge',
  excessPenalty: 'Excess demand penalty',
  fppa: 'Fuel surcharge (FPPA)',
  fppaCredit: 'Fuel surcharge credit (FPPA)',
  wheeling: 'Wheeling charge',
  minTopUp: 'Minimum charge top-up',
  currentCharges: 'Current charges',
  subsidy: 'Subsidy',
  netCurrentBill: 'Net current bill',
  arrears: 'Arrears',
  lpsc: 'Late payment surcharge',
  payments: 'Payments received',
  totalPayable: 'Total payable',
  rebateBy: (c) => `Rebate if paid by ${c.due}`,
  payableByDue: 'Payable on or before due date',
  singlePhase: 'Single phase',
  threePhase: 'Three phase',

  // words used inside built-up formulas and sums
  wArrears: 'arrears',
  wSurcharge: 'surcharge',
  wPaid: 'paid',
  wNetCurrentBill: 'net current bill',
  wStateScheme: 'A state scheme',

  // ── formulas ─────────────────────────────────────────────────────────────
  fFixedLoad: (c) => `Fixed charge = rate per ${c.dUnit} × sanctioned load`,
  fDemand: (c) => `Demand charge = rate per ${c.dUnit} × billed demand`,
  fBilledDemand: 'Billed demand = higher of (recorded MD, contractual floor)',
  fUnits: 'Units = (Present reading − Previous reading) × Meter constant',
  fEnergy: 'Energy charge = Σ (units falling in each slab × that slab’s rate)',
  fPenaltyRate: (c) => `Penalty = excess demand × penalty rate per ${c.dUnit}`,
  fPenaltyPct: 'Penalty = excess demand × (% of energy charge per excess kW)',
  fFppaPct: 'FPPA = (energy charge + fixed/demand charge + penalties) × notified rate %',
  fFppaUnit: 'FPPA = units × notified rate per unit',
  fWheelUnit: 'Wheeling charge = units × wheeling rate per unit',
  fWheelLoad: (c) => `Wheeling charge = rate per ${c.dUnit} × sanctioned load`,
  fDutyEnergy: 'Duty = energy charge × duty rate %',
  fDutyTotal: 'Duty = (energy + fixed + penalties + wheeling + FPPA) × duty rate %',
  fDutyUnit: 'Duty = units × duty rate per unit',
  fNetAfterSubsidy: 'Net current bill = current charges − subsidy',
  fNetSum: 'Net current bill = ',
  fLpsc: 'LPSC = arrears × surcharge rate % per month',
  fTotal: 'Total payable = net current bill + arrears + surcharge − payments already credited',
  fRebateUnit: 'Rebate = units × rebate rate per unit',
  fRebatePct: 'Rebate = energy charge × rebate rate %',
  cBase: (c) => `Base = ${c.base}`,
  cExcess: (c) => `Excess = ${c.md} − ${c.threshold} = ${c.excess} ${c.dUnit}`,

  // ── notes ────────────────────────────────────────────────────────────────
  nTariffCategory: (c) => `This bill is on ${c.tariffLabel}. Every rate below — the slabs, the fixed
    charge, whether a demand penalty can apply at all — follows from that one code and nothing else.`,
  nLoadDemandBilled: (c) => `${c.load} ${c.dUnit} sanctioned, against ${c.md} ${c.dUnit} actually
    recorded. On this category the charge follows the recorded figure, not the sanctioned one — and the
    gap between them is what the penalty is levied on.`,
  nLoadFixed: () => `The sanctioned load is the only thing this charge depends on. Set the units to
    zero above and it is all that remains on the bill.`,
  nBillMonth: (c) => `${c.month} — the month the power was USED (${c.from} to ${c.to}), not the month
    the bill was printed. It matters more than it looks: the fuel surcharge is notified per month, so
    this field decides which rate applies. Switch DISCOM above and watch the same UPPCL connection
    charge +10% in June and refund 4.43% in July.`,
  nDueDate: (c) => `Pay on or before ${c.due} and the bill costs exactly what it says. After it, a late
    payment surcharge starts accruing on the whole outstanding amount and compounds monthly — and where
    the DISCOM offers a prompt-payment rebate, you lose that too. The gap between the bill date and the
    due date is typically 15 days.`,
  nUnits: (c) => `About ${c.perDay} units a day over ${c.days} days. The meter constant is 1 on almost
    every domestic connection; where it is not, it is printed on the meter and multiplies the difference.`,
  nMdBilled: (c) => `The highest half-hour average the meter logged this month. On this category the
    demand charge and any excess-demand penalty are both levied on it, so a few minutes with everything
    running at once sets the price of the whole month.`,
  nMdRecorded: (c) => `The highest half-hour average the meter logged. On a domestic connection it is
    recorded but NOT what you are billed on — the fixed charge follows the sanctioned load regardless.
    It still matters: if it creeps above your sanctioned load, the DISCOM can raise a penalty or ask you
    to regularise the connection.`,
  nMdResult: (c) => `${c.md} ${c.dUnit} recorded, against ${c.load} ${c.dUnit} sanctioned`,
  nStatusOk: () => `OK means the meter was physically read and the reading was accepted — the bill is
    based on real consumption. `,
  nStatus: (c) => `How the reading was obtained. ${c.okPrefix}DISCOMs print a short code here and the
    vocabulary is utility-specific. What matters is the distinction: a status saying the meter was
    actually read, versus one saying it was estimated, inaccessible or faulty. Anything in the second
    group means the units above are a guess that will be trued up later, and it is worth taking your own
    reading and quoting it.`,
  nEnergyLadder: (c) => `The slabs STACK — crossing into a higher one raises the price of the extra units
    only. The last unit cost ${c.lastRate}, but the average across the bill is ${c.energy} ÷ ${c.units} =
    ${c.avgRate} a unit.`,
  nEnergyFlat: (c) => `A single slab, so there is no ladder here: every unit cost ${c.avgRate}.`,
  nDemandCharge: () => `Billed demand is the higher of the recorded maximum demand and any contractual
    floor, so on this category the charge moves month to month with how hard you ran.`,
  nFixedCharge: () => `Consumption does not enter this formula anywhere. That is why a locked, empty
    house still receives a bill.`,
  nPenaltyPct: (c) => `Threshold: ${c.threshold} ${c.dUnit}${c.tolerance}. Recorded demand was
    ${c.md} ${c.dUnit}.`,
  nToleranceClause: (c) => ` (sanctioned load plus a ${c.tolerancePct} tolerance)`,
  nPenaltyRate: (c) => `${c.multiplierClause}Raise the sanctioned load above and watch this line
    disappear — then check whether the higher fixed charge costs you more or less than the penalty did.`,
  nMultiplierClause: (c) => `The penalty rate is ${c.multiplier}× the normal demand rate. `,
  nFppaCreditClause: () => `This month the rate is NEGATIVE, so the line is a credit: power cost the
    DISCOM less than the regulator assumed and the difference comes back to you. `,
  nFppaPct: (c) => `${c.creditClause}The rate is notified per month and it applies to the fixed charge as
    well as the energy charge — not to the units alone, which is the commonest misreading of this line.`,
  nFppaUnit: () => `The per-unit rate is the gap between what power actually cost the DISCOM and what the
    regulator assumed when your tariff was set.`,
  nWheelUnit: () => `This state unbundles the cost of the wires from the cost of the power. States that
    do not have folded the same cost into the energy rate — you are not paying it twice.`,
  nWheelLoad: () => `Levied on the load rather than the units, because the network has to be sized for
    the capacity you might draw, not the energy you happened to use.`,
  nDutyEnergy: () => `Here the duty sits on the energy charge alone — the fixed charge is not taxed.`,
  nDutyTotal: () => `Here the duty sits on the WHOLE bill, fixed charge included. Which base a state uses
    is a state-by-state decision, and it is why two identical households across a border pay different
    totals.`,
  nDutyUnit: () => `A per-unit duty, so it scales with consumption rather than with the bill.`,
  nSubsidy: (c) => `${c.subsidyLabel} applies here. The DISCOM still bills the full tariff above and the
    state reimburses it, which is why this shows as a deduction rather than as a lower rate — and why the
    subsidy can be withdrawn without any tariff order changing.`,
  nNetCurrentBill: (c) => `THIS MONTH ONLY — it is not what you owe. Across ${c.units} units it works out
    to ${c.net} ÷ ${c.units} = ${c.allIn} all-in per unit, always above the slab rate. This is the figure
    to compare month to month; the total payable below mixes in old dues and would tell you the wrong
    story about your usage.`,
  nArrears: () => `Carried forward from earlier bills. It is not part of this month’s consumption and
    should not be read as such when you compare months.`,
  nLpsc: () => `It compounds while the arrear is outstanding. Paying by the due date removes this line
    entirely — it is the one charge on the bill that is purely optional.`,
  nTotalDiffers: () => `Different from the net current bill above because old dues are in it. `,
  nTotalSame: () => `Equal to the net current bill above only because nothing is carried forward on this
    bill. `,
  nTotalPayable: (c) => `${c.diffClause}Pay the full amount: a part payment does not stop the surcharge
    accruing on the remainder.`,
  nRebate: (c) => `${c.rebateLabel} Pay on or before ${c.due} and you owe ${c.payByDue} instead of
    ${c.payable}. Miss it and you lose the rebate AND start accruing late payment surcharge — the due
    date is worth two separate amounts of money, not one.`,
};

export const BILL_STRINGS = { en, hi: en, mr: en, ta: en };

/** Strings for a language, falling back to English for anything not yet translated. */
export function billT(lang) {
  const table = BILL_STRINGS[lang];
  return table ? { ...en, ...table } : en;
}

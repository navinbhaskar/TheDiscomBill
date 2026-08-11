// understand-bill-content.js — every string and every annotation on /understand-your-bill/.
//
// The page shows a SCHEMATIC bill, not a facsimile of any one DISCOM's paper. Real bills
// from UPPCL, MSEDCL and KSEB share almost no layout: different field names, different
// orderings, some print FPPA as its own line and some fold it into the energy charge. A
// drawn copy of one utility's stationery would be wrong for everyone else and would go
// stale silently the next time that utility redesigned its bill. So the layout is one
// honest canonical arrangement, labelled as such, and the DISCOM selector changes the
// NUMBERS and WHICH LINES EXIST — which is the part that actually teaches something.
//
// The numbers are not written here. Every figure on the bill comes from js/engine.js, the
// same engine behind the calculator, so the explanations describe arithmetic that really
// ran. That also means a tariff revision flows into this page for free; there is no second
// copy of the rates to drift.
//
// Strings are in { en } objects even though only English is generated today. T() in
// generate-seo.js falls back to .en for any missing language, so adding hi/mr/ta later is
// additive and needs no change to the template.

/**
 * Labels for the scenarios. The scenarios themselves — which DISCOM, which category, the
 * default units and load — live in js/bill-anatomy.js, because the browser needs those and
 * must not be made to download this file's prose to get them.
 *
 * Keyed by scenario id; a scenario without an entry here would render an empty <option>, so
 * the generator asserts on that rather than shipping one.
 */
export const SCENARIO_COPY = {
  'uppcl-domestic': {
    label: { en: 'UPPCL (Uttar Pradesh) — Domestic' },
    note: { en: 'Urban domestic above 1 kW. Electricity Duty is a percentage of the whole bill here.' },
  },
  'msedcl-domestic': {
    label: { en: 'MSEDCL (Maharashtra) — Domestic' },
    note: { en: 'Adds a Wheeling Charge line, and levies Electricity Duty on the energy charge only.' },
  },
  'kseb-domestic': {
    label: { en: 'KSEB (Kerala) — Domestic' },
    note: { en: 'Five narrow slabs, and no additional charges at all — the simplest shape a bill takes.' },
  },
  'delhi-domestic': {
    label: { en: 'BRPL (Delhi) — Domestic' },
    note: { en: 'A percentage fuel surcharge (PPAC) at 17.94%, plus the GNCTD subsidy shown as a deduction.' },
  },
  'odisha-domestic': {
    label: { en: 'TPCODL (Odisha) — Domestic' },
    note: { en: 'Carries a prompt-payment rebate, so the bill shows two totals: one if you pay by the due date, one if you do not.' },
  },
  'uppcl-commercial': {
    label: { en: 'UPPCL (Uttar Pradesh) — Commercial' },
    note: { en: 'Billed on recorded maximum demand — and July 2026’s fuel surcharge was a credit, so that line is a refund.' },
  },
};

/**
 * The annotated lines, in the order they are numbered on the bill.
 *
 * `id`        anchors the explanation (#explain-<id>) and ties the marker to it
 * `always`    true = the line is on every bill; false = it appears only when the engine
 *             produces it, and its number is skipped when it does not
 * `title`     the heading of the explanation, and the row label on the bill
 * `body`      build-time prose. Never contains a figure — figures live in `live`, which the
 *             JS rewrites on every change. Mixing the two would mean stale numbers in the
 *             served HTML the moment anything moved.
 * `live`      key into the readout the renderer builds from the engine result (see
 *             js/understand-bill.js). Rendered as "On this bill: …".
 */
export const LINES = [
  {
    id: 'consumer-no', always: true, group: 'header',
    title: { en: 'Consumer number' },
    body: { en: `The account the connection is billed to, not the meter. It survives a meter
      replacement, and it is the number every portal, payment app and complaint form asks for.
      Names vary by state — <strong>Account ID</strong>, <strong>K Number</strong>,
      <strong>CA Number</strong>, <strong>Service Number</strong> — but they are all this
      field. Copy it exactly, including leading zeroes.` },
  },
  {
    id: 'tariff-category', always: true, group: 'header',
    title: { en: 'Tariff category' },
    body: { en: `Which rate schedule your connection is billed under. This one code decides your
      slab rates, your fixed charge and whether a demand penalty can apply, so it is the single
      most consequential field on the bill — and the one most often wrong. A home billed under a
      commercial code pays roughly double. If yours does not match how the premises are actually
      used, that is a correction worth chasing.` },
    live: 'tariffCategory',
  },
  {
    id: 'sanctioned-load', always: true, group: 'header',
    title: { en: 'Sanctioned load' },
    body: { en: `The capacity the DISCOM has contracted to supply you, in kW — not what you used.
      On a domestic bill it usually sets the fixed charge directly. Raising it costs a one-time
      fee and a higher monthly fixed charge; leaving it too low risks a penalty if your recorded
      demand overshoots it. It is a genuine trade-off, not a number to minimise.` },
    live: 'sanctionedLoad',
  },

  {
    id: 'bill-month', always: true, group: 'period',
    title: { en: 'Bill month' },
    body: { en: `The month the electricity was <em>used</em>, which is not the month the bill was
      printed and not the month you pay it. Three different dates, and bills label them
      inconsistently. This is the one that identifies the consumption, so it is the one to quote in
      a complaint — and, because the fuel surcharge is notified monthly, it is also what decides
      which surcharge rate applies to you.` },
    live: 'billMonth',
  },
  {
    id: 'due-date', always: true, group: 'period',
    title: { en: 'Due date' },
    body: { en: `The last day the bill costs what it says. It is worth money in two directions:
      past it, a late payment surcharge starts accruing on the whole outstanding amount and
      compounds every month; and where the DISCOM offers a prompt-payment rebate, paying on time is
      the only way to get it. Disconnection notices are driven off this date too, not off the bill
      date.` },
    live: 'dueDate',
  },

  {
    id: 'units-consumed', always: true, group: 'reading',
    title: { en: 'Units consumed' },
    body: { en: `Present reading minus previous reading, multiplied by the meter constant (the
      multiplying factor, almost always 1 on a domestic connection). One unit is one kilowatt-hour.
      This is the only measured quantity on the whole bill — everything below it is arithmetic
      performed on this one number.` },
    live: 'unitsConsumed',
  },
  {
    id: 'md', always: true, group: 'reading',
    title: { en: 'Maximum demand (MD)' },
    body: { en: `The highest half-hour average power your connection drew during the month, in kW —
      a peak, not a total. Consumption and demand are different things: run a 2 kW geyser for ten
      hours and you use 20 units at 2 kW of demand; run ten 2 kW appliances for one hour and you use
      the same 20 units at 20 kW. On a commercial or industrial connection the second one costs far
      more, because the charge follows the peak.` },
    live: 'md',
  },
  {
    id: 'reading-status', always: true, group: 'reading',
    title: { en: 'Reading status' },
    body: { en: `A short code saying how the reading was obtained — whether a meter reader actually
      read the meter, or the DISCOM estimated it because the meter was locked away, unreadable or
      faulty. The vocabulary is utility-specific and the codes are rarely expanded anywhere on the
      bill, but the distinction is the thing that matters: a real reading is a fact, an estimate is
      a placeholder that will be corrected later, usually by a much larger bill.` },
    live: 'readingStatus',
  },

  {
    id: 'energy-charge', always: true, group: 'charges',
    title: { en: 'Energy charge' },
    body: { en: `What the units themselves cost. Almost every Indian domestic tariff is
      <em>telescopic</em>: the slabs stack rather than replace each other, so crossing into a
      higher slab raises the price of the extra units only, never of the units below. Your bill
      prints one total; the table above shows the ladder it came from.` },
    live: 'energyCharge',
  },
  {
    id: 'fixed-charge', always: true, group: 'charges',
    title: { en: 'Fixed charge / demand charge' },
    body: { en: `Payable whether you use a single unit or none. It funds the wires, the meter and
      the crew, and it is why a locked, empty house still gets a bill. On a domestic connection it
      is levied per kW of <em>sanctioned load</em>; on a commercial or industrial one it is levied
      on the <em>recorded maximum demand</em>, which is why the same rate produces very different
      amounts on the two bills.` },
    live: 'fixedCharge',
  },
  {
    id: 'excess-demand', always: false, group: 'charges',
    title: { en: 'Excess demand penalty' },
    body: { en: `Charged when the maximum demand the meter recorded during the month exceeded your
      sanctioned load. The meter logs the highest half-hour average, so a few minutes of everything
      running at once is enough to trigger it — and it recurs every month you overshoot. Two fixes:
      stagger the heavy loads, or apply to raise the sanctioned load. Which one is cheaper depends
      on how far over you are running.` },
    live: 'excessDemand',
  },
  {
    id: 'fppa', always: false, group: 'charges',
    title: { en: 'Fuel surcharge (FPPA / FPPAS / PPAC / FAC)' },
    body: { en: `The one line that changes month to month for reasons nothing to do with you. When
      the DISCOM's actual cost of buying power differs from what the regulator assumed when your
      tariff was set, the gap is passed through here. Four things surprise people about it: it is
      recalculated <em>monthly</em> in several states; it can be <em>negative</em>, in which case it
      is a refund; where it is a percentage it usually applies to the fixed charge as well as the
      energy charge; and the notified rate is public, so a bill that shows this line without a rate
      is worth questioning.` },
    live: 'fppa',
  },
  {
    id: 'wheeling', always: false, group: 'charges',
    title: { en: 'Wheeling charge' },
    body: { en: `The cost of moving the electricity across the distribution network to your premises,
      unbundled from the cost of the electricity itself. States that separate the two — Maharashtra
      most visibly — print it as its own line. States that do not have folded the same cost into the
      energy rate. You are not paying it twice.` },
    live: 'wheeling',
  },
  {
    id: 'electricity-duty', always: false, group: 'charges',
    title: { en: 'Electricity duty' },
    body: { en: `A state tax, collected by the DISCOM on the government's behalf. Whether it lands on
      the energy charge alone or on the whole bill is a state-by-state decision, and it is the reason
      two bills with identical consumption can differ by a few hundred rupees across a state border.
      There is no GST on domestic electricity supply — if you see one, look again.` },
    live: 'electricityDuty',
  },

  {
    id: 'subsidy', always: false, group: 'totals',
    title: { en: 'Subsidy' },
    body: { en: `A state government rebate, shown as a deduction from the charges above rather than
      as a lower rate. The DISCOM bills the full tariff and the state reimburses it — which is why
      the gross figure stays high, and why a subsidy can be withdrawn without any tariff order
      changing. Most schemes are conditional: on consumption staying under a cap, on the category,
      sometimes on a registration you have to renew.` },
    live: 'subsidy',
  },
  {
    id: 'net-current-bill', always: true, group: 'totals',
    title: { en: 'Net current bill' },
    body: { en: `This month's charges, after any subsidy — and <strong>not</strong> what you owe.
      This is the figure to compare against last month, because it contains this month's consumption
      and nothing else. The total payable below is a different quantity: it mixes in old dues, and
      comparing <em>it</em> month to month will tell you a story about your payment history rather
      than about your electricity use.` },
    live: 'netCurrentBill',
  },
  {
    id: 'arrears', always: false, group: 'totals',
    title: { en: 'Arrears' },
    body: { en: `Unpaid amounts carried forward. An arrear that appears on a bill you believe you paid
      is usually a payment posted after the bill was generated — check the payment date against the
      bill date before raising it. A stubborn one that survives two cycles is worth a written
      complaint with the transaction reference.` },
    live: 'arrears',
  },
  {
    id: 'lpsc', always: false, group: 'totals',
    title: { en: 'Late payment surcharge (LPSC)' },
    body: { en: `Interest on what you did not pay by the due date, typically 1.25–2% a month, compounding
      on the arrear. It is the most avoidable line on any bill: paying on the due date removes it
      entirely. If a disputed amount is sitting in arrears, LPSC keeps accruing on it while the dispute
      is open, so raise disputes early.` },
    live: 'lpsc',
  },
  {
    id: 'total-payable', always: true, group: 'totals',
    title: { en: 'Total payable' },
    body: { en: `Net current bill, plus arrears and surcharge, minus payments already credited. This is
      what you owe today. Pay the full amount — a part payment does not stop the surcharge on the
      remainder, and on a prepaid or disconnection-notice account it does not stop the clock either.` },
    live: 'totalPayable',
  },
  {
    id: 'due-date-rebate', always: false, group: 'totals',
    title: { en: 'Prompt-payment rebate' },
    body: { en: `Several DISCOMs take a small amount <em>off</em> the bill if you pay on or before the
      due date — a few paise per unit, or a percentage of the energy charge, sometimes with an extra
      slice for paying digitally. It is easy to miss because it is printed as a second, lower total
      near the bottom rather than as a charge. Where it exists, the due date is worth money twice
      over: you gain the rebate by meeting it and start paying surcharge by missing it.` },
    live: 'dueDateRebate',
  },
];

export const UB = {
  title: { en: 'Understand Your Electricity Bill: Every Line Explained' },
  description: {
    en: 'An interactive electricity bill you can change. Switch DISCOM, units and sanctioned load and see what every line means — fixed charge, slabs, FPPA, duty, demand penalty.',
  },
  crumb: { en: 'Understand Your Bill' },
  h1: { en: 'Understand Your Electricity Bill, Line by Line' },
  meta: {
    en: 'Updated %DATE% · Figures computed live by the same engine behind our calculator · <a href="/methodology/">How we source and verify</a>',
  },
  lead: {
    en: `Almost nobody is taught to read an electricity bill, and the bill does not help — a dozen
      charges in abbreviations, most of them unexplained. Below is a working bill. Change the DISCOM,
      the units or the sanctioned load and it recalculates, and every numbered marker explains the
      line it points at using the numbers you are looking at.`,
  },

  toc: {
    label: { en: 'On this page' },
    bill: { en: 'The bill' },
    header: { en: 'Who and what' },
    period: { en: 'Dates that cost money' },
    reading: { en: 'The meter reading' },
    charges: { en: 'The charges' },
    totals: { en: 'The totals' },
    higher: { en: 'Why it exceeds units × rate' },
    faq: { en: 'Common questions' },
  },

  controlsH2: { en: 'Change the bill' },
  controlsIntro: {
    en: `Every figure below is recalculated from the real tariff schedule for the DISCOM you pick, so
      the explanations describe arithmetic that actually ran — not a worked example written once and
      left to age.`,
  },
  ctl: {
    scenario: { en: 'DISCOM and category' },
    units: { en: 'Units consumed' },
    load: { en: 'Sanctioned load (kW)' },
    md: { en: 'Maximum demand (kW)' },
    optional: { en: 'optional' },
    mdHint: { en: 'Leave blank to use the demand the meter recorded on this bill. Enter one above the sanctioned load to see what a penalty does.' },
    messy: { en: 'Add arrears, late payment surcharge and a part payment' },
    messyHint: { en: 'Most real bills carry old dues. Turn this on to see how they change the total.' },
    reset: { en: 'Reset' },
  },

  billH2: { en: 'A typical electricity bill' },
  illustrative: { en: 'Illustrative example' },
  illustrativeBody: {
    en: `This is not a real bill and not a copy of any DISCOM's stationery. Bills differ in layout,
      field names and ordering from one utility to the next; what is common between them is the set of
      charges shown here. The consumer number, meter number and address are invented.`,
  },

  billHead: {
    consumer: { en: 'Consumer details' },
    summary: { en: 'Bill summary' },
    name: { en: 'Consumer name' },
    address: { en: 'Address' },
    meterNo: { en: 'Meter number' },
    phase: { en: 'Connection' },
    billDate: { en: 'Bill date' },
    dueDate: { en: 'Due date' },
    period: { en: 'Billing period' },
    sampleName: { en: 'A. Kumar' },
    sampleAddress: { en: '14, MG Road (address is invented)' },
  },
  readingH3: { en: 'Meter reading' },
  readingTh: {
    prev: { en: 'Previous' }, pres: { en: 'Present' },
    mf: { en: 'Multiplying factor' }, units: { en: 'Units consumed' },
  },
  slabH3: { en: 'How the energy charge was built' },
  slabTh: { en: ['Slab', 'Units', 'Rate', 'Amount'] },
  chargesH3: { en: 'Charges' },
  totalsH3: { en: 'Amount payable' },

  markerLabel: { en: 'Explanation for %LINE%' },
  onThisBill: { en: 'On this bill' },
  notOnThisBill: {
    en: 'Not charged on the bill shown — pick another DISCOM or category above and it appears.',
  },

  sectionH2: {
    header: { en: 'Who the bill is for, and under what tariff' },
    period: { en: 'The dates, and which ones cost you money' },
    reading: { en: 'What the meter said' },
    charges: { en: 'What you are being charged' },
    totals: { en: 'What you actually owe' },
  },
  sectionIntro: {
    period: { en: `A bill carries three dates and they are not interchangeable. One identifies the
      consumption, one is when the bill was cut, and one is a deadline with money attached to both
      sides of it.` },
    header: { en: `The top block identifies the account and, crucially, the rate schedule it is billed
      under. Errors here are expensive and they persist quietly for years, so it is worth two minutes.` },
    reading: { en: `The only measured quantity on the whole bill. Everything below is arithmetic
      performed on this one number.` },
    charges: { en: `A bill is not one price. It is a stack of separate charges, each set by a different
      rule, and knowing which is which tells you which ones you can do something about.` },
    totals: { en: `Where this month's charges meet whatever was left over from before.` },
  },

  higherH2: { en: 'Why the bill is more than units × rate' },
  higherIntro: {
    en: `The most common complaint about an electricity bill is that the total does not match units
      multiplied by the rate the reader has in mind. It usually is not an error. Four things account
      for nearly all of the gap:`,
  },
  higherPoints: {
    en: [
      ['The slabs stack.', `There is no single rate. The last unit you used cost more than the first
        one, and the average rate you paid sits somewhere between the two — always higher than the
        cheapest slab you remember.`],
      ['The fixed charge is not consumption.', `It is levied per kW of sanctioned load regardless of
        use, so it lands hardest, per unit, in a month you used very little.`],
      ['Tax comes last.', `Electricity duty is applied on top of the charges — in several states on the
        whole bill, not just the energy component.`],
      ['A pass-through can move without warning.', `Fuel surcharge is recalculated periodically and can
        appear on one bill and not the next, with no change in your usage at all.`],
    ],
  },
  higherOutro: {
    en: `If the total still looks wrong after accounting for those, the next thing to check is the
      reading — an estimated or averaged bill followed by a real reading produces one alarming month
      that is really two months of consumption.`,
  },

  faqH2: { en: 'Common questions' },
  faq: [
    {
      q: { en: 'Why does my bill have a fixed charge when I used no electricity?' },
      a: { en: `Because the fixed charge pays for the connection, not the consumption — the line to your
        premises, the meter, and the capacity kept available for you. It is levied per kW of sanctioned
        load and applies to a locked house. The only way to stop it is to surrender the connection
        formally; simply not using power does not.` },
    },
    {
      q: { en: 'What is FPPA on my electricity bill?' },
      a: { en: `Fuel and Power Purchase Adjustment: the difference between what the DISCOM actually paid
        for power and what the regulator assumed when your tariff was fixed, passed through to you. It is
        recalculated periodically, so it varies month to month even when your usage does not. Some states
        charge it in paise per unit, others as a percentage of the energy charge.` },
    },
    {
      q: { en: 'Is GST charged on an electricity bill?' },
      a: { en: `No. The supply of electricity to a domestic consumer is exempt from GST. What you see is
        electricity duty, a state tax, which is a different thing. GST can appear on ancillary items a
        DISCOM bills separately — a new connection fee, a meter testing charge — but not on the energy
        supply itself.` },
    },
    {
      q: { en: 'My bill says "Average" or "Provisional". What does that mean?' },
      a: { en: `Nobody read the meter that month, so the DISCOM estimated the consumption from your
        history. It is trued up on the next actual reading, which is why an estimated month is often
        followed by an unusually large one. Take your own reading and quote it when you raise it — the
        adjustment is routine.` },
    },
    {
      q: { en: 'Can I change my tariff category?' },
      a: { en: `Yes, by applying to the DISCOM with evidence of how the premises is used. It matters:
        a home billed under a commercial schedule can pay close to double. The change is normally
        prospective, so the sooner a wrong category is caught the less it costs.` },
    },
  ],

  nextH2: { en: 'Next steps' },
  cards: {
    calc: {
      t: { en: 'Calculate your actual bill' },
      d: { en: 'Your DISCOM, your units, your load — the full bill with every line itemised.' },
      href: '/#calculator',
    },
    check: {
      t: { en: 'Check a bill you have received' },
      d: { en: 'Upload or type in a bill and see whether the charges add up.' },
      href: '/check-my-bill/',
    },
    glossary: {
      t: { en: 'Glossary of billing terms' },
      d: { en: 'Every abbreviation an Indian electricity bill can print, defined.' },
      href: '/glossary/',
    },
    load: {
      t: { en: 'Is your sanctioned load right?' },
      d: { en: 'What raising or lowering it costs, and when the penalty starts to bite.' },
      href: '/sanctioned-load-optimizer/',
    },
  },

  sourceLine: { en: 'Rates shown: %LABEL%' },
  verified: { en: 'Verified against the tariff order' },
  unverified: { en: 'Representative rates — not yet verified line-by-line against the order' },

  disclaimer: {
    en: `The bill above is an illustration built from published tariff schedules. It is not a bill, not a
      quotation, and not a substitute for the one your DISCOM issues. Where a figure here and a figure on
      your bill disagree, your bill is the authority — and if you think it is wrong, raise it with the
      DISCOM.`,
  },
};

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

const hi = {
  docSub: 'उदाहरण · वास्तविक बिल नहीं',
  stamp: 'नमूना',
  verified: 'टैरिफ आदेश से मिलान किया गया',
  representative: 'प्रतिनिधि दरें',
  source: 'स्रोत',
  fallbackDiscom: 'विद्युत वितरण कंपनी',

  blkAccount: 'खाता',
  blkPeriod: 'बिलिंग अवधि',
  blkReading: 'मीटर रीडिंग',
  blkSlabs: 'ऊर्जा प्रभार के पीछे की स्लैब सीढ़ी',
  blkCharges: 'प्रभार',
  blkPayable: 'देय राशि',
  thSlab: 'स्लैब', thUnits: 'यूनिट', thRate: 'दर', thAmount: 'राशि',

  consumerNo: 'उपभोक्ता संख्या',
  consumerName: 'उपभोक्ता का नाम',
  sampleName: 'ए. कुमार',
  tariffCategory: 'टैरिफ श्रेणी',
  sanctionedLoad: 'स्वीकृत भार',
  meterNo: 'मीटर संख्या',
  billMonth: 'बिल माह',
  readingPeriod: 'रीडिंग अवधि',
  billDate: 'बिल तिथि',
  dueDate: 'देय तिथि',
  prevReading: 'पिछली रीडिंग',
  presReading: 'वर्तमान रीडिंग',
  unitsConsumed: 'खपत यूनिट',
  maxDemand: 'अधिकतम मांग (MD)',
  readingStatus: 'रीडिंग स्थिति',
  energyCharge: 'ऊर्जा प्रभार',
  fixedCharge: 'नियत प्रभार',
  demandCharge: 'मांग प्रभार',
  excessPenalty: 'अतिरिक्त मांग शास्ति',
  fppa: 'ईंधन अधिभार (FPPA)',
  fppaCredit: 'ईंधन अधिभार क्रेडिट (FPPA)',
  wheeling: 'व्हीलिंग प्रभार',
  minTopUp: 'न्यूनतम प्रभार की भरपाई',
  currentCharges: 'वर्तमान प्रभार',
  subsidy: 'सब्सिडी',
  netCurrentBill: 'शुद्ध वर्तमान बिल',
  arrears: 'बकाया',
  lpsc: 'विलंब भुगतान अधिभार (LPSC)',
  payments: 'प्राप्त भुगतान',
  totalPayable: 'कुल देय राशि',
  rebateBy: (c) => `${c.due} तक भुगतान पर छूट`,
  payableByDue: 'देय तिथि तक भुगतान करने पर देय',
  singlePhase: 'सिंगल फेज़',
  threePhase: 'थ्री फेज़',

  wArrears: 'बकाया',
  wSurcharge: 'अधिभार',
  wPaid: 'भुगतान',
  wNetCurrentBill: 'शुद्ध वर्तमान बिल',
  wStateScheme: 'एक राज्य योजना',

  fFixedLoad: (c) => `नियत प्रभार = प्रति ${c.dUnit} दर × स्वीकृत भार`,
  fDemand: (c) => `मांग प्रभार = प्रति ${c.dUnit} दर × बिल की गई मांग`,
  fBilledDemand: 'बिल की गई मांग = (दर्ज MD, अनुबंधित न्यूनतम) में से अधिक',
  fUnits: 'यूनिट = (वर्तमान रीडिंग − पिछली रीडिंग) × मीटर गुणांक',
  fEnergy: 'ऊर्जा प्रभार = Σ (हर स्लैब में आने वाली यूनिट × उस स्लैब की दर)',
  fPenaltyRate: (c) => `शास्ति = अतिरिक्त मांग × प्रति ${c.dUnit} शास्ति दर`,
  fPenaltyPct: 'शास्ति = अतिरिक्त मांग × (प्रति अतिरिक्त kW, ऊर्जा प्रभार का %)',
  fFppaPct: 'FPPA = (ऊर्जा प्रभार + नियत/मांग प्रभार + शास्ति) × अधिसूचित दर %',
  fFppaUnit: 'FPPA = यूनिट × अधिसूचित प्रति-यूनिट दर',
  fWheelUnit: 'व्हीलिंग प्रभार = यूनिट × प्रति-यूनिट व्हीलिंग दर',
  fWheelLoad: (c) => `व्हीलिंग प्रभार = प्रति ${c.dUnit} दर × स्वीकृत भार`,
  fDutyEnergy: 'शुल्क = ऊर्जा प्रभार × शुल्क दर %',
  fDutyTotal: 'शुल्क = (ऊर्जा + नियत + शास्ति + व्हीलिंग + FPPA) × शुल्क दर %',
  fDutyUnit: 'शुल्क = यूनिट × प्रति-यूनिट शुल्क दर',
  fNetAfterSubsidy: 'शुद्ध वर्तमान बिल = वर्तमान प्रभार − सब्सिडी',
  fNetSum: 'शुद्ध वर्तमान बिल = ',
  fLpsc: 'LPSC = बकाया × प्रति माह अधिभार दर %',
  fTotal: 'कुल देय = शुद्ध वर्तमान बिल + बकाया + अधिभार − पहले जमा भुगतान',
  fRebateUnit: 'छूट = यूनिट × प्रति-यूनिट छूट दर',
  fRebatePct: 'छूट = ऊर्जा प्रभार × छूट दर %',
  cBase: (c) => `आधार = ${c.base}`,
  cExcess: (c) => `अतिरिक्त = ${c.md} − ${c.threshold} = ${c.excess} ${c.dUnit}`,

  nTariffCategory: (c) => `यह बिल ${c.tariffLabel} पर बना है। नीचे की हर दर — स्लैब, नियत प्रभार, और मांग
    शास्ति लग सकती है या नहीं — सिर्फ़ इसी एक कोड से तय होती है।`,
  nLoadDemandBilled: (c) => `स्वीकृत भार ${c.load} ${c.dUnit}, जबकि मीटर ने ${c.md} ${c.dUnit} दर्ज किया।
    इस श्रेणी में प्रभार दर्ज आंकड़े पर लगता है, स्वीकृत भार पर नहीं — और दोनों का अंतर ही वह है जिस पर
    शास्ति लगती है।`,
  nLoadFixed: () => `यह प्रभार सिर्फ़ स्वीकृत भार पर निर्भर करता है। ऊपर यूनिट शून्य कर दीजिए, बिल पर
    केवल यही बचेगा।`,
  nBillMonth: (c) => `${c.month} — वह महीना जिसमें बिजली इस्तेमाल हुई (${c.from} से ${c.to}), वह नहीं
    जिसमें बिल छपा। यह दिखने से ज़्यादा मायने रखता है: ईंधन अधिभार हर महीने अधिसूचित होता है, इसलिए यही
    खाना तय करता है कि कौन-सी दर लगेगी। ऊपर DISCOM बदलिए और देखिए कि वही UPPCL कनेक्शन जून में +10%
    वसूलता है और जुलाई में 4.43% लौटाता है।`,
  nDueDate: (c) => `${c.due} तक भुगतान कीजिए तो बिल उतना ही है जितना लिखा है। उसके बाद पूरी बकाया राशि पर
    विलंब भुगतान अधिभार लगना शुरू हो जाता है और हर महीने चक्रवृद्धि होता है — और जहाँ DISCOM समय पर
    भुगतान की छूट देता है, वह भी चली जाती है। बिल तिथि और देय तिथि के बीच आमतौर पर 15 दिन होते हैं।`,
  nUnits: (c) => `${c.days} दिनों में लगभग ${c.perDay} यूनिट प्रतिदिन। लगभग हर घरेलू कनेक्शन पर मीटर
    गुणांक 1 होता है; जहाँ नहीं होता, वह मीटर पर छपा रहता है और अंतर से गुणा होता है।`,
  nMdBilled: () => `इस महीने मीटर ने जो सबसे ऊँचा आधे घंटे का औसत दर्ज किया। इस श्रेणी में मांग प्रभार और
    अतिरिक्त मांग शास्ति, दोनों इसी पर लगते हैं — यानी कुछ मिनट सब कुछ एक साथ चलाना पूरे महीने की कीमत
    तय कर देता है।`,
  nMdRecorded: () => `मीटर ने जो सबसे ऊँचा आधे घंटे का औसत दर्ज किया। घरेलू कनेक्शन पर यह दर्ज तो होता है
    पर इस पर बिल नहीं बनता — नियत प्रभार फिर भी स्वीकृत भार पर ही लगता है। फिर भी यह मायने रखता है: अगर
    यह आपके स्वीकृत भार से ऊपर जाने लगे, तो DISCOM शास्ति लगा सकता है या कनेक्शन नियमित कराने को कह
    सकता है।`,
  nMdResult: (c) => `दर्ज ${c.md} ${c.dUnit}, स्वीकृत ${c.load} ${c.dUnit}`,
  nStatusOk: () => `OK का मतलब है कि मीटर सचमुच पढ़ा गया और रीडिंग स्वीकार हुई — बिल असली खपत पर बना है। `,
  nStatus: (c) => `रीडिंग कैसे ली गई। ${c.okPrefix}DISCOM यहाँ एक छोटा कोड छापते हैं और यह शब्दावली हर
    कंपनी की अलग होती है। असल फ़र्क़ यह है: कोड कह रहा है कि मीटर वाक़ई पढ़ा गया, या यह कि रीडिंग अनुमान से
    लगाई गई, मीटर तक पहुँच नहीं हुई, या मीटर ख़राब था। दूसरी स्थिति का मतलब है कि ऊपर की यूनिट एक अनुमान
    हैं जिन्हें बाद में ठीक किया जाएगा — ऐसे में अपनी रीडिंग खुद लेकर बतानी चाहिए।`,
  nEnergyLadder: (c) => `स्लैब जुड़ते हैं, बदलते नहीं — ऊपर वाले स्लैब में जाने से सिर्फ़ अतिरिक्त यूनिट
    महँगी होती हैं। आख़िरी यूनिट ${c.lastRate} की पड़ी, पर पूरे बिल का औसत ${c.energy} ÷ ${c.units} =
    ${c.avgRate} प्रति यूनिट है।`,
  nEnergyFlat: (c) => `यहाँ एक ही स्लैब है, इसलिए कोई सीढ़ी नहीं: हर यूनिट ${c.avgRate} की पड़ी।`,
  nDemandCharge: () => `बिल की गई मांग, दर्ज अधिकतम मांग और अनुबंधित न्यूनतम में से जो ज़्यादा हो वही होती
    है — इसलिए इस श्रेणी में यह प्रभार हर महीने आपके इस्तेमाल के साथ बदलता है।`,
  nFixedCharge: () => `इस सूत्र में खपत कहीं आती ही नहीं। यही वजह है कि बंद पड़े ख़ाली घर का भी बिल आता है।`,
  nPenaltyPct: (c) => `सीमा: ${c.threshold} ${c.dUnit}${c.tolerance}। दर्ज मांग ${c.md} ${c.dUnit} थी।`,
  nToleranceClause: (c) => ` (स्वीकृत भार और उस पर ${c.tolerancePct} की छूट)`,
  nPenaltyRate: (c) => `${c.multiplierClause}ऊपर स्वीकृत भार बढ़ाइए और देखिए कि यह पंक्ति ग़ायब हो जाती है
    — फिर देखिए कि बढ़ा हुआ नियत प्रभार शास्ति से ज़्यादा महँगा पड़ता है या कम।`,
  nMultiplierClause: (c) => `शास्ति दर सामान्य मांग दर की ${c.multiplier} गुना है। `,
  nFppaCreditClause: () => `इस महीने दर ऋणात्मक है, इसलिए यह पंक्ति क्रेडिट है: बिजली DISCOM को नियामक के
    अनुमान से सस्ती पड़ी और अंतर आपको वापस मिल रहा है। `,
  nFppaPct: (c) => `${c.creditClause}दर हर महीने अधिसूचित होती है और यह ऊर्जा प्रभार के साथ-साथ नियत
    प्रभार पर भी लगती है — सिर्फ़ यूनिट पर नहीं, जो इस पंक्ति की सबसे आम ग़लतफ़हमी है।`,
  nFppaUnit: () => `प्रति-यूनिट दर वह अंतर है जो बिजली की असली लागत और आपका टैरिफ़ तय करते समय नियामक के
    अनुमान के बीच रहा।`,
  nWheelUnit: () => `यह राज्य तारों की लागत को बिजली की लागत से अलग दिखाता है। जो राज्य ऐसा नहीं करते,
    उन्होंने वही लागत ऊर्जा दर में जोड़ रखी है — आप दो बार नहीं दे रहे।`,
  nWheelLoad: () => `यह यूनिट पर नहीं, भार पर लगता है, क्योंकि नेटवर्क को उतनी क्षमता के लिए बनाना पड़ता है
    जितनी आप खींच सकते हैं — न कि उतनी बिजली के लिए जितनी आपने वाक़ई इस्तेमाल की।`,
  nDutyEnergy: () => `यहाँ शुल्क सिर्फ़ ऊर्जा प्रभार पर लगता है — नियत प्रभार पर कर नहीं लगता।`,
  nDutyTotal: () => `यहाँ शुल्क पूरे बिल पर लगता है, नियत प्रभार समेत। कौन-सा आधार लिया जाए यह हर राज्य
    अपने हिसाब से तय करता है, और यही वजह है कि सीमा के दोनों ओर एक जैसे दो घरों का बिल अलग आता है।`,
  nDutyUnit: () => `यह प्रति-यूनिट शुल्क है, इसलिए यह बिल के साथ नहीं, खपत के साथ बढ़ता-घटता है।`,
  nSubsidy: (c) => `यहाँ ${c.subsidyLabel} लागू है। DISCOM ऊपर पूरा टैरिफ़ ही लगाता है और राज्य उसकी भरपाई
    करता है — इसीलिए यह कम दर के बजाय कटौती के रूप में दिखता है, और इसीलिए बिना कोई टैरिफ़ आदेश बदले
    सब्सिडी वापस भी ली जा सकती है।`,
  nNetCurrentBill: (c) => `सिर्फ़ इस महीने का — यह वह नहीं है जो आपको चुकाना है। ${c.units} यूनिट पर यह
    ${c.net} ÷ ${c.units} = ${c.allIn} प्रति यूनिट पड़ता है, जो हमेशा स्लैब दर से ऊपर रहता है। महीने-दर-महीने
    तुलना इसी से कीजिए; नीचे की कुल देय राशि में पुराना बकाया मिला होता है और वह आपकी खपत की ग़लत तस्वीर
    दिखाएगी।`,
  nArrears: () => `पिछले बिलों से आगे लाया गया। यह इस महीने की खपत का हिस्सा नहीं है और महीनों की तुलना
    करते समय इसे ऐसा समझना नहीं चाहिए।`,
  nLpsc: () => `जब तक बकाया रहता है यह चक्रवृद्धि होता रहता है। देय तिथि तक भुगतान कर देने से यह पंक्ति
    पूरी तरह हट जाती है — बिल पर यही एक प्रभार है जो पूरी तरह टाला जा सकता है।`,
  nTotalDiffers: () => `ऊपर के शुद्ध वर्तमान बिल से अलग, क्योंकि इसमें पुराना बकाया शामिल है। `,
  nTotalSame: () => `ऊपर के शुद्ध वर्तमान बिल के बराबर, सिर्फ़ इसलिए कि इस बिल पर कुछ भी आगे नहीं लाया
    गया। `,
  nTotalPayable: (c) => `${c.diffClause}पूरी राशि चुकाइए: आंशिक भुगतान से बची हुई रकम पर अधिभार लगना बंद
    नहीं होता।`,
  nRebate: (c) => `${c.rebateLabel} ${c.due} तक भुगतान कीजिए तो ${c.payable} के बजाय ${c.payByDue} देने
    होंगे। चूक गए तो छूट भी गई और विलंब भुगतान अधिभार भी शुरू — देय तिथि एक नहीं, दो अलग-अलग रकमों के
    बराबर है।`,
};

const mr = {
  docSub: 'उदाहरण · खरे बिल नाही',
  stamp: 'नमुना',
  verified: 'टॅरिफ आदेशाशी पडताळले',
  representative: 'प्रातिनिधिक दर',
  source: 'स्रोत',
  fallbackDiscom: 'वीज वितरण कंपनी',

  blkAccount: 'खाते',
  blkPeriod: 'बिलिंग कालावधी',
  blkReading: 'मीटर रीडिंग',
  blkSlabs: 'ऊर्जा आकारामागील स्लॅब शिडी',
  blkCharges: 'आकार',
  blkPayable: 'देय रक्कम',
  thSlab: 'स्लॅब', thUnits: 'युनिट', thRate: 'दर', thAmount: 'रक्कम',

  consumerNo: 'ग्राहक क्रमांक',
  consumerName: 'ग्राहकाचे नाव',
  sampleName: 'ए. कुमार',
  tariffCategory: 'टॅरिफ श्रेणी',
  sanctionedLoad: 'मंजूर भार',
  meterNo: 'मीटर क्रमांक',
  billMonth: 'बिल महिना',
  readingPeriod: 'रीडिंग कालावधी',
  billDate: 'बिल दिनांक',
  dueDate: 'देय दिनांक',
  prevReading: 'मागील रीडिंग',
  presReading: 'सध्याची रीडिंग',
  unitsConsumed: 'वापरलेली युनिट',
  maxDemand: 'कमाल मागणी (MD)',
  readingStatus: 'रीडिंग स्थिती',
  energyCharge: 'ऊर्जा आकार',
  fixedCharge: 'स्थिर आकार',
  demandCharge: 'मागणी आकार',
  excessPenalty: 'अतिरिक्त मागणी दंड',
  fppa: 'इंधन अधिभार (FPPA)',
  fppaCredit: 'इंधन अधिभार क्रेडिट (FPPA)',
  wheeling: 'व्हीलिंग आकार',
  minTopUp: 'किमान आकाराची भरपाई',
  currentCharges: 'चालू आकार',
  subsidy: 'सबसिडी',
  netCurrentBill: 'निव्वळ चालू बिल',
  arrears: 'थकबाकी',
  lpsc: 'विलंब भरणा अधिभार (LPSC)',
  payments: 'मिळालेले भरणे',
  totalPayable: 'एकूण देय रक्कम',
  rebateBy: (c) => `${c.due} पर्यंत भरल्यास सवलत`,
  payableByDue: 'देय दिनांकापर्यंत भरल्यास देय',
  singlePhase: 'सिंगल फेज',
  threePhase: 'थ्री फेज',

  wArrears: 'थकबाकी',
  wSurcharge: 'अधिभार',
  wPaid: 'भरणा',
  wNetCurrentBill: 'निव्वळ चालू बिल',
  wStateScheme: 'एक राज्य योजना',

  fFixedLoad: (c) => `स्थिर आकार = प्रति ${c.dUnit} दर × मंजूर भार`,
  fDemand: (c) => `मागणी आकार = प्रति ${c.dUnit} दर × बिल केलेली मागणी`,
  fBilledDemand: 'बिल केलेली मागणी = (नोंदलेली MD, करारातील किमान) यांपैकी जास्त',
  fUnits: 'युनिट = (सध्याची रीडिंग − मागील रीडिंग) × मीटर गुणक',
  fEnergy: 'ऊर्जा आकार = Σ (प्रत्येक स्लॅबमधील युनिट × त्या स्लॅबचा दर)',
  fPenaltyRate: (c) => `दंड = अतिरिक्त मागणी × प्रति ${c.dUnit} दंड दर`,
  fPenaltyPct: 'दंड = अतिरिक्त मागणी × (प्रति अतिरिक्त kW, ऊर्जा आकाराच्या %)',
  fFppaPct: 'FPPA = (ऊर्जा आकार + स्थिर/मागणी आकार + दंड) × अधिसूचित दर %',
  fFppaUnit: 'FPPA = युनिट × अधिसूचित प्रति-युनिट दर',
  fWheelUnit: 'व्हीलिंग आकार = युनिट × प्रति-युनिट व्हीलिंग दर',
  fWheelLoad: (c) => `व्हीलिंग आकार = प्रति ${c.dUnit} दर × मंजूर भार`,
  fDutyEnergy: 'शुल्क = ऊर्जा आकार × शुल्क दर %',
  fDutyTotal: 'शुल्क = (ऊर्जा + स्थिर + दंड + व्हीलिंग + FPPA) × शुल्क दर %',
  fDutyUnit: 'शुल्क = युनिट × प्रति-युनिट शुल्क दर',
  fNetAfterSubsidy: 'निव्वळ चालू बिल = चालू आकार − सबसिडी',
  fNetSum: 'निव्वळ चालू बिल = ',
  fLpsc: 'LPSC = थकबाकी × दरमहा अधिभार दर %',
  fTotal: 'एकूण देय = निव्वळ चालू बिल + थकबाकी + अधिभार − आधी जमा झालेले भरणे',
  fRebateUnit: 'सवलत = युनिट × प्रति-युनिट सवलत दर',
  fRebatePct: 'सवलत = ऊर्जा आकार × सवलत दर %',
  cBase: (c) => `आधार = ${c.base}`,
  cExcess: (c) => `अतिरिक्त = ${c.md} − ${c.threshold} = ${c.excess} ${c.dUnit}`,

  nTariffCategory: (c) => `हे बिल ${c.tariffLabel} वर आहे. खालचा प्रत्येक दर — स्लॅब, स्थिर आकार, मागणी दंड
    लागू होऊ शकतो की नाही — फक्त याच एका कोडवरून ठरतो.`,
  nLoadDemandBilled: (c) => `मंजूर भार ${c.load} ${c.dUnit}, तर मीटरने ${c.md} ${c.dUnit} नोंदवले. या
    श्रेणीत आकार नोंदलेल्या आकड्यावर लागतो, मंजूर भारावर नाही — आणि दोघांतील फरकावरच दंड आकारला जातो.`,
  nLoadFixed: () => `हा आकार फक्त मंजूर भारावर अवलंबून असतो. वरची युनिट शून्य करा, बिलावर हेच तेवढे उरेल.`,
  nBillMonth: (c) => `${c.month} — ज्या महिन्यात वीज वापरली गेली तो (${c.from} ते ${c.to}), बिल छापले तो
    नाही. हे दिसते त्यापेक्षा महत्त्वाचे आहे: इंधन अधिभार दरमहा अधिसूचित होतो, त्यामुळे कोणता दर लागेल हे
    हेच रकाना ठरवते. वर DISCOM बदला आणि पाहा — तेच UPPCL कनेक्शन जूनमध्ये +10% घेते आणि जुलैमध्ये 4.43%
    परत करते.`,
  nDueDate: (c) => `${c.due} पर्यंत भरल्यास बिल लिहिले आहे तेवढेच पडते. त्यानंतर संपूर्ण थकीत रकमेवर विलंब
    भरणा अधिभार लागू होतो आणि दरमहा चक्रवाढ होतो — आणि जिथे DISCOM वेळेवर भरण्याची सवलत देते, तीही जाते.
    बिल दिनांक आणि देय दिनांक यांत साधारण 15 दिवस असतात.`,
  nUnits: (c) => `${c.days} दिवसांत दररोज सुमारे ${c.perDay} युनिट. जवळपास प्रत्येक घरगुती कनेक्शनवर मीटर
    गुणक 1 असतो; जिथे नसतो, तो मीटरवर छापलेला असतो आणि फरकाने गुणला जातो.`,
  nMdBilled: () => `या महिन्यात मीटरने नोंदवलेली सर्वात जास्त अर्ध्या तासाची सरासरी. या श्रेणीत मागणी आकार
    आणि अतिरिक्त मागणी दंड दोन्ही यावरच लागतात — म्हणजे काही मिनिटे सर्व काही एकत्र चालवणे संपूर्ण
    महिन्याची किंमत ठरवते.`,
  nMdRecorded: () => `मीटरने नोंदवलेली सर्वात जास्त अर्ध्या तासाची सरासरी. घरगुती कनेक्शनवर ती नोंदली जाते
    पण तिच्यावर बिल होत नाही — स्थिर आकार तरीही मंजूर भारावरच लागतो. तरीही ती महत्त्वाची आहे: ती तुमच्या
    मंजूर भारापेक्षा वर जाऊ लागली, तर DISCOM दंड लावू शकते किंवा कनेक्शन नियमित करायला सांगू शकते.`,
  nMdResult: (c) => `नोंद ${c.md} ${c.dUnit}, मंजूर ${c.load} ${c.dUnit}`,
  nStatusOk: () => `OK म्हणजे मीटर प्रत्यक्ष वाचले गेले आणि रीडिंग स्वीकारले गेले — बिल खऱ्या वापरावर आहे. `,
  nStatus: (c) => `रीडिंग कशी घेतली गेली. ${c.okPrefix}DISCOM इथे एक छोटा कोड छापतात आणि ही शब्दावली प्रत्येक
    कंपनीची वेगळी असते. खरा फरक हा: कोड सांगतो की मीटर खरोखर वाचले गेले, की रीडिंग अंदाजाने लावली, मीटरपर्यंत
    पोहोचता आले नाही, किंवा मीटर बिघडलेले होते. दुसऱ्या प्रकाराचा अर्थ वरची युनिट हा अंदाज आहे जो नंतर दुरुस्त
    होईल — अशा वेळी स्वतःची रीडिंग घेऊन कळवणे योग्य.`,
  nEnergyLadder: (c) => `स्लॅब एकावर एक चढतात, बदलत नाहीत — वरच्या स्लॅबमध्ये गेल्याने फक्त जादा युनिट महाग
    होतात. शेवटचे युनिट ${c.lastRate} ला पडले, पण संपूर्ण बिलाची सरासरी ${c.energy} ÷ ${c.units} =
    ${c.avgRate} प्रति युनिट आहे.`,
  nEnergyFlat: (c) => `इथे एकच स्लॅब आहे, त्यामुळे शिडी नाही: प्रत्येक युनिट ${c.avgRate} ला पडले.`,
  nDemandCharge: () => `बिल केलेली मागणी म्हणजे नोंदलेली कमाल मागणी आणि करारातील किमान यांपैकी जी जास्त
    असेल ती — त्यामुळे या श्रेणीत हा आकार दरमहा तुमच्या वापरानुसार बदलतो.`,
  nFixedCharge: () => `या सूत्रात वापर कुठेच येत नाही. म्हणूनच बंद असलेल्या रिकाम्या घराचेही बिल येते.`,
  nPenaltyPct: (c) => `मर्यादा: ${c.threshold} ${c.dUnit}${c.tolerance}. नोंदलेली मागणी ${c.md} ${c.dUnit} होती.`,
  nToleranceClause: (c) => ` (मंजूर भार अधिक ${c.tolerancePct} सूट)`,
  nPenaltyRate: (c) => `${c.multiplierClause}वर मंजूर भार वाढवा आणि पाहा — ही ओळ नाहीशी होते. मग तपासा की
    वाढलेला स्थिर आकार दंडापेक्षा जास्त पडतो की कमी.`,
  nMultiplierClause: (c) => `दंड दर सामान्य मागणी दराच्या ${c.multiplier} पट आहे. `,
  nFppaCreditClause: () => `या महिन्यात दर ऋण आहे, त्यामुळे ही ओळ क्रेडिट आहे: वीज DISCOM ला नियामकाच्या
    अंदाजापेक्षा स्वस्त पडली आणि फरक तुम्हाला परत मिळतो आहे. `,
  nFppaPct: (c) => `${c.creditClause}दर दरमहा अधिसूचित होतो आणि तो ऊर्जा आकाराबरोबरच स्थिर आकारावरही लागतो
    — फक्त युनिटवर नाही, हाच या ओळीचा सर्वात सामान्य गैरसमज आहे.`,
  nFppaUnit: () => `प्रति-युनिट दर म्हणजे विजेची खरी किंमत आणि तुमचा टॅरिफ ठरवताना नियामकाने गृहीत धरलेली
    किंमत यांतील फरक.`,
  nWheelUnit: () => `हे राज्य तारांची किंमत विजेच्या किमतीपासून वेगळी दाखवते. जी राज्ये तसे करत नाहीत,
    त्यांनी तीच किंमत ऊर्जा दरात मिसळली आहे — तुम्ही दोनदा देत नाही.`,
  nWheelLoad: () => `हा युनिटवर नव्हे तर भारावर लागतो, कारण नेटवर्क तुम्ही जेवढी वीज ओढू शकता तेवढ्या
    क्षमतेचे बांधावे लागते — तुम्ही प्रत्यक्षात वापरलेल्या विजेएवढे नव्हे.`,
  nDutyEnergy: () => `इथे शुल्क फक्त ऊर्जा आकारावर आहे — स्थिर आकारावर कर नाही.`,
  nDutyTotal: () => `इथे शुल्क संपूर्ण बिलावर आहे, स्थिर आकारासह. कोणता आधार घ्यायचा हे प्रत्येक राज्य
    स्वतः ठरवते, आणि म्हणूनच सीमेच्या दोन्ही बाजूंची सारखी दोन घरे वेगळे बिल भरतात.`,
  nDutyUnit: () => `हे प्रति-युनिट शुल्क आहे, त्यामुळे ते बिलासोबत नव्हे तर वापरासोबत कमी-जास्त होते.`,
  nSubsidy: (c) => `इथे ${c.subsidyLabel} लागू आहे. DISCOM वर पूर्ण टॅरिफच लावते आणि राज्य त्याची भरपाई
    करते — म्हणूनच हे कमी दराऐवजी वजावट म्हणून दिसते, आणि म्हणूनच कोणताही टॅरिफ आदेश न बदलता सबसिडी मागेही
    घेतली जाऊ शकते.`,
  nNetCurrentBill: (c) => `फक्त या महिन्याचे — हे तुम्हाला भरायचे आहे ते नव्हे. ${c.units} युनिटवर हे
    ${c.net} ÷ ${c.units} = ${c.allIn} प्रति युनिट पडते, जे नेहमी स्लॅब दरापेक्षा जास्त असते. महिन्या-महिन्याची
    तुलना याच आकड्याने करा; खालच्या एकूण देय रकमेत जुनी थकबाकी मिसळलेली असते आणि ती तुमच्या वापराचे चुकीचे
    चित्र दाखवेल.`,
  nArrears: () => `मागील बिलांतून पुढे आणलेली. ती या महिन्याच्या वापराचा भाग नाही आणि महिन्यांची तुलना
    करताना तशी समजू नये.`,
  nLpsc: () => `थकबाकी शिल्लक असेपर्यंत तो चक्रवाढ होत राहतो. देय दिनांकापर्यंत भरल्यास ही ओळ पूर्णपणे
    निघून जाते — बिलावरचा हा एकमेव आकार आहे जो पूर्णपणे टाळता येतो.`,
  nTotalDiffers: () => `वरच्या निव्वळ चालू बिलापेक्षा वेगळे, कारण यात जुनी थकबाकी आहे. `,
  nTotalSame: () => `वरच्या निव्वळ चालू बिलाइतकेच, फक्त कारण या बिलावर काहीही पुढे आणलेले नाही. `,
  nTotalPayable: (c) => `${c.diffClause}पूर्ण रक्कम भरा: अंशतः भरल्याने उरलेल्या रकमेवरचा अधिभार थांबत नाही.`,
  nRebate: (c) => `${c.rebateLabel} ${c.due} पर्यंत भरल्यास ${c.payable} ऐवजी ${c.payByDue} भरावे लागतील.
    चुकलात तर सवलतही गेली आणि विलंब भरणा अधिभारही सुरू — देय दिनांक एक नव्हे, दोन वेगळ्या रकमांइतका
    महत्त्वाचा आहे.`,
};

const ta = {
  docSub: 'விளக்கப்படம் · உண்மையான பில் அல்ல',
  stamp: 'மாதிரி',
  verified: 'கட்டண ஆணையுடன் சரிபார்க்கப்பட்டது',
  representative: 'பிரதிநிதி விகிதங்கள்',
  source: 'ஆதாரம்',
  fallbackDiscom: 'மின் விநியோக நிறுவனம்',

  blkAccount: 'கணக்கு',
  blkPeriod: 'பில்லிங் காலம்',
  blkReading: 'மீட்டர் ரீடிங்',
  blkSlabs: 'ஆற்றல் கட்டணத்தின் பின்னால் உள்ள ஸ்லாப் ஏணி',
  blkCharges: 'கட்டணங்கள்',
  blkPayable: 'செலுத்த வேண்டிய தொகை',
  thSlab: 'ஸ்லாப்', thUnits: 'யூனிட்', thRate: 'விகிதம்', thAmount: 'தொகை',

  consumerNo: 'நுகர்வோர் எண்',
  consumerName: 'நுகர்வோர் பெயர்',
  sampleName: 'ஏ. குமார்',
  tariffCategory: 'கட்டண வகை',
  sanctionedLoad: 'அனுமதிக்கப்பட்ட சுமை',
  meterNo: 'மீட்டர் எண்',
  billMonth: 'பில் மாதம்',
  readingPeriod: 'ரீடிங் காலம்',
  billDate: 'பில் தேதி',
  dueDate: 'கடைசி தேதி',
  prevReading: 'முந்தைய ரீடிங்',
  presReading: 'தற்போதைய ரீடிங்',
  unitsConsumed: 'பயன்படுத்திய யூனிட்',
  maxDemand: 'அதிகபட்ச தேவை (MD)',
  readingStatus: 'ரீடிங் நிலை',
  energyCharge: 'ஆற்றல் கட்டணம்',
  fixedCharge: 'நிலையான கட்டணம்',
  demandCharge: 'தேவை கட்டணம்',
  excessPenalty: 'கூடுதல் தேவை அபராதம்',
  fppa: 'எரிபொருள் கூடுதல் கட்டணம் (FPPA)',
  fppaCredit: 'எரிபொருள் கட்டண வரவு (FPPA)',
  wheeling: 'வீலிங் கட்டணம்',
  minTopUp: 'குறைந்தபட்ச கட்டண நிரப்பு',
  currentCharges: 'நடப்பு கட்டணங்கள்',
  subsidy: 'மானியம்',
  netCurrentBill: 'நிகர நடப்பு பில்',
  arrears: 'நிலுவை',
  lpsc: 'தாமத கட்டண அபராதம் (LPSC)',
  payments: 'பெறப்பட்ட பணம்',
  totalPayable: 'மொத்தம் செலுத்த வேண்டியது',
  rebateBy: (c) => `${c.due} க்குள் செலுத்தினால் தள்ளுபடி`,
  payableByDue: 'கடைசி தேதிக்குள் செலுத்தினால் செலுத்த வேண்டியது',
  singlePhase: 'சிங்கிள் ஃபேஸ்',
  threePhase: 'த்ரீ ஃபேஸ்',

  wArrears: 'நிலுவை',
  wSurcharge: 'அபராதம்',
  wPaid: 'செலுத்தியது',
  wNetCurrentBill: 'நிகர நடப்பு பில்',
  wStateScheme: 'ஒரு மாநிலத் திட்டம்',

  fFixedLoad: (c) => `நிலையான கட்டணம் = ஒரு ${c.dUnit}-க்கான விகிதம் × அனுமதிக்கப்பட்ட சுமை`,
  fDemand: (c) => `தேவை கட்டணம் = ஒரு ${c.dUnit}-க்கான விகிதம் × பில் செய்யப்பட்ட தேவை`,
  fBilledDemand: 'பில் செய்யப்பட்ட தேவை = (பதிவான MD, ஒப்பந்த குறைந்தபட்சம்) இரண்டில் அதிகம்',
  fUnits: 'யூனிட் = (தற்போதைய ரீடிங் − முந்தைய ரீடிங்) × மீட்டர் மாறிலி',
  fEnergy: 'ஆற்றல் கட்டணம் = Σ (ஒவ்வொரு ஸ்லாபிலும் வரும் யூனிட் × அந்த ஸ்லாபின் விகிதம்)',
  fPenaltyRate: (c) => `அபராதம் = கூடுதல் தேவை × ஒரு ${c.dUnit}-க்கான அபராத விகிதம்`,
  fPenaltyPct: 'அபராதம் = கூடுதல் தேவை × (கூடுதல் kW ஒன்றுக்கு, ஆற்றல் கட்டணத்தின் %)',
  fFppaPct: 'FPPA = (ஆற்றல் கட்டணம் + நிலையான/தேவை கட்டணம் + அபராதம்) × அறிவிக்கப்பட்ட விகிதம் %',
  fFppaUnit: 'FPPA = யூனிட் × அறிவிக்கப்பட்ட ஒரு-யூனிட் விகிதம்',
  fWheelUnit: 'வீலிங் கட்டணம் = யூனிட் × ஒரு-யூனிட் வீலிங் விகிதம்',
  fWheelLoad: (c) => `வீலிங் கட்டணம் = ஒரு ${c.dUnit}-க்கான விகிதம் × அனுமதிக்கப்பட்ட சுமை`,
  fDutyEnergy: 'வரி = ஆற்றல் கட்டணம் × வரி விகிதம் %',
  fDutyTotal: 'வரி = (ஆற்றல் + நிலையான + அபராதம் + வீலிங் + FPPA) × வரி விகிதம் %',
  fDutyUnit: 'வரி = யூனிட் × ஒரு-யூனிட் வரி விகிதம்',
  fNetAfterSubsidy: 'நிகர நடப்பு பில் = நடப்பு கட்டணங்கள் − மானியம்',
  fNetSum: 'நிகர நடப்பு பில் = ',
  fLpsc: 'LPSC = நிலுவை × மாதம் ஒன்றுக்கான அபராத விகிதம் %',
  fTotal: 'மொத்தம் செலுத்த வேண்டியது = நிகர நடப்பு பில் + நிலுவை + அபராதம் − ஏற்கெனவே செலுத்தியது',
  fRebateUnit: 'தள்ளுபடி = யூனிட் × ஒரு-யூனிட் தள்ளுபடி விகிதம்',
  fRebatePct: 'தள்ளுபடி = ஆற்றல் கட்டணம் × தள்ளுபடி விகிதம் %',
  cBase: (c) => `அடிப்படை = ${c.base}`,
  cExcess: (c) => `கூடுதல் = ${c.md} − ${c.threshold} = ${c.excess} ${c.dUnit}`,

  nTariffCategory: (c) => `இந்தப் பில் ${c.tariffLabel} வகையில் உள்ளது. கீழே உள்ள ஒவ்வொரு விகிதமும் —
    ஸ்லாப்கள், நிலையான கட்டணம், தேவை அபராதம் விதிக்க முடியுமா என்பது வரை — இந்த ஒரு குறியீட்டிலிருந்தே
    வருகிறது.`,
  nLoadDemandBilled: (c) => `அனுமதிக்கப்பட்ட சுமை ${c.load} ${c.dUnit}, ஆனால் மீட்டர் ${c.md} ${c.dUnit}
    பதிவு செய்தது. இந்த வகையில் கட்டணம் பதிவான எண்ணின் மீதே விதிக்கப்படுகிறது, அனுமதிக்கப்பட்ட சுமையின்
    மீது அல்ல — இரண்டுக்கும் இடையிலான இடைவெளிதான் அபராதத்திற்கு அடிப்படை.`,
  nLoadFixed: () => `இந்தக் கட்டணம் அனுமதிக்கப்பட்ட சுமையை மட்டுமே சார்ந்தது. மேலே யூனிட்டை பூஜ்ஜியமாக
    வையுங்கள், பில்லில் இது மட்டுமே மிஞ்சும்.`,
  nBillMonth: (c) => `${c.month} — மின்சாரம் பயன்படுத்தப்பட்ட மாதம் (${c.from} முதல் ${c.to} வரை), பில்
    அச்சிடப்பட்ட மாதம் அல்ல. இது தோற்றத்தை விட முக்கியம்: எரிபொருள் கூடுதல் கட்டணம் மாதந்தோறும்
    அறிவிக்கப்படுகிறது, எனவே எந்த விகிதம் பொருந்தும் என்பதை இந்தப் புலமே தீர்மானிக்கிறது. மேலே DISCOM-ஐ
    மாற்றிப் பாருங்கள் — அதே UPPCL இணைப்பு ஜூனில் +10% வசூலிக்கிறது, ஜூலையில் 4.43% திருப்பித் தருகிறது.`,
  nDueDate: (c) => `${c.due} அல்லது அதற்கு முன் செலுத்தினால் பில் எழுதியுள்ள தொகைதான். அதன் பிறகு மொத்த
    நிலுவைத் தொகையின் மீது தாமத கட்டண அபராதம் சேரத் தொடங்கி மாதந்தோறும் கூட்டு வட்டியாகிறது — DISCOM
    விரைவுச் செலுத்துதல் தள்ளுபடி தந்தால் அதுவும் போய்விடும். பில் தேதிக்கும் கடைசி தேதிக்கும் இடையே
    பொதுவாக 15 நாட்கள்.`,
  nUnits: (c) => `${c.days} நாட்களில் ஒரு நாளைக்கு சுமார் ${c.perDay} யூனிட். கிட்டத்தட்ட ஒவ்வொரு வீட்டு
    இணைப்பிலும் மீட்டர் மாறிலி 1; இல்லாத இடத்தில் அது மீட்டரில் அச்சிடப்பட்டிருக்கும், வித்தியாசத்தால்
    பெருக்கப்படும்.`,
  nMdBilled: () => `இந்த மாதம் மீட்டர் பதிவு செய்த மிக உயர்ந்த அரை மணி நேர சராசரி. இந்த வகையில் தேவை
    கட்டணமும் கூடுதல் தேவை அபராதமும் இரண்டுமே இதன் மீதே விதிக்கப்படுகின்றன — அதாவது எல்லாவற்றையும் ஒரே
    நேரத்தில் இயக்கிய சில நிமிடங்கள் முழு மாதத்தின் விலையைத் தீர்மானிக்கின்றன.`,
  nMdRecorded: () => `மீட்டர் பதிவு செய்த மிக உயர்ந்த அரை மணி நேர சராசரி. வீட்டு இணைப்பில் இது
    பதிவாகிறது, ஆனால் இதன் மீது பில் போடப்படுவதில்லை — நிலையான கட்டணம் அனுமதிக்கப்பட்ட சுமையைத்தான்
    பின்பற்றும். இருந்தும் இது முக்கியம்: இது உங்கள் அனுமதிக்கப்பட்ட சுமையை மீறத் தொடங்கினால், DISCOM
    அபராதம் விதிக்கலாம் அல்லது இணைப்பை ஒழுங்குபடுத்தச் சொல்லலாம்.`,
  nMdResult: (c) => `பதிவு ${c.md} ${c.dUnit}, அனுமதி ${c.load} ${c.dUnit}`,
  nStatusOk: () => `OK என்றால் மீட்டர் நேரில் படிக்கப்பட்டு ரீடிங் ஏற்கப்பட்டது — பில் உண்மையான நுகர்வின்
    அடிப்படையில் உள்ளது. `,
  nStatus: (c) => `ரீடிங் எப்படிப் பெறப்பட்டது. ${c.okPrefix}DISCOM-கள் இங்கே ஒரு சிறு குறியீட்டை
    அச்சிடுகின்றன, இந்தச் சொற்கள் ஒவ்வொரு நிறுவனத்திற்கும் வேறுபடும். முக்கியமான வேறுபாடு இதுதான்: மீட்டர்
    உண்மையில் படிக்கப்பட்டது என்கிறதா, அல்லது ரீடிங் மதிப்பிடப்பட்டது, மீட்டரை அணுக முடியவில்லை, அல்லது
    மீட்டர் பழுதானது என்கிறதா. இரண்டாவது வகை என்றால் மேலே உள்ள யூனிட் ஒரு மதிப்பீடு, பின்னர் சரிசெய்யப்படும்
    — அப்போது நீங்களே ரீடிங் எடுத்துத் தெரிவிப்பது நல்லது.`,
  nEnergyLadder: (c) => `ஸ்லாப்கள் ஒன்றன் மேல் ஒன்றாகச் சேரும், மாறாது — உயர்ந்த ஸ்லாபுக்குச் செல்வது
    கூடுதல் யூனிட்டுகளின் விலையை மட்டுமே உயர்த்தும். கடைசி யூனிட் ${c.lastRate}, ஆனால் முழு பில்லின் சராசரி
    ${c.energy} ÷ ${c.units} = ${c.avgRate} ஒரு யூனிட்டுக்கு.`,
  nEnergyFlat: (c) => `இங்கே ஒரே ஸ்லாப், எனவே ஏணி இல்லை: ஒவ்வொரு யூனிட்டும் ${c.avgRate}.`,
  nDemandCharge: () => `பில் செய்யப்பட்ட தேவை என்பது பதிவான அதிகபட்ச தேவைக்கும் ஒப்பந்தக் குறைந்தபட்சத்திற்கும்
    இடையே எது அதிகமோ அது — எனவே இந்த வகையில் இந்தக் கட்டணம் நீங்கள் எவ்வளவு பயன்படுத்தினீர்கள் என்பதற்கேற்ப
    மாதந்தோறும் மாறும்.`,
  nFixedCharge: () => `இந்த சூத்திரத்தில் நுகர்வு எங்கும் வருவதில்லை. அதனால்தான் பூட்டிய காலி வீட்டுக்கும்
    பில் வருகிறது.`,
  nPenaltyPct: (c) => `வரம்பு: ${c.threshold} ${c.dUnit}${c.tolerance}. பதிவான தேவை ${c.md} ${c.dUnit}.`,
  nToleranceClause: (c) => ` (அனுமதிக்கப்பட்ட சுமை மற்றும் ${c.tolerancePct} சலுகை)`,
  nPenaltyRate: (c) => `${c.multiplierClause}மேலே அனுமதிக்கப்பட்ட சுமையை உயர்த்திப் பாருங்கள் — இந்த வரி
    மறைந்துவிடும். பிறகு உயர்ந்த நிலையான கட்டணம் அபராதத்தை விட அதிகமா குறைவா என்று பாருங்கள்.`,
  nMultiplierClause: (c) => `அபராத விகிதம் சாதாரண தேவை விகிதத்தை விட ${c.multiplier} மடங்கு. `,
  nFppaCreditClause: () => `இந்த மாதம் விகிதம் எதிர்மறை, எனவே இந்த வரி ஒரு வரவு: ஒழுங்குமுறை ஆணையம்
    எதிர்பார்த்ததை விடக் குறைவாகவே DISCOM-க்கு மின்சாரம் விலைப்பட்டது, வித்தியாசம் உங்களுக்குத் திரும்பி
    வருகிறது. `,
  nFppaPct: (c) => `${c.creditClause}விகிதம் மாதந்தோறும் அறிவிக்கப்படுகிறது, அது ஆற்றல் கட்டணத்துடன்
    நிலையான கட்டணத்திற்கும் பொருந்தும் — யூனிட்டுகளுக்கு மட்டும் அல்ல, இதுவே இந்த வரியைப் பற்றிய மிகப்
    பொதுவான தவறான புரிதல்.`,
  nFppaUnit: () => `ஒரு-யூனிட் விகிதம் என்பது மின்சாரத்தின் உண்மையான விலைக்கும், உங்கள் கட்டணம்
    நிர்ணயிக்கப்பட்டபோது ஒழுங்குமுறை ஆணையம் கருதிய விலைக்கும் இடையிலான வித்தியாசம்.`,
  nWheelUnit: () => `இந்த மாநிலம் கம்பிகளின் செலவை மின்சாரத்தின் செலவிலிருந்து தனியாகக் காட்டுகிறது.
    காட்டாத மாநிலங்கள் அதே செலவை ஆற்றல் விகிதத்திற்குள் சேர்த்துவிட்டன — நீங்கள் இரண்டு முறை
    செலுத்தவில்லை.`,
  nWheelLoad: () => `இது யூனிட்டின் மீது அல்ல, சுமையின் மீது விதிக்கப்படுகிறது, ஏனெனில் நெட்வொர்க்கை
    நீங்கள் எடுக்கக்கூடிய கொள்ளளவுக்கு ஏற்பக் கட்ட வேண்டும் — நீங்கள் உண்மையில் பயன்படுத்திய
    மின்சாரத்திற்கு ஏற்ப அல்ல.`,
  nDutyEnergy: () => `இங்கே வரி ஆற்றல் கட்டணத்தின் மீது மட்டுமே — நிலையான கட்டணத்திற்கு வரி இல்லை.`,
  nDutyTotal: () => `இங்கே வரி முழு பில்லின் மீதும், நிலையான கட்டணம் உட்பட. எந்த அடிப்படையை எடுப்பது
    என்பதை ஒவ்வொரு மாநிலமும் தானே முடிவு செய்கிறது, அதனால்தான் எல்லைக்கு இருபுறமும் உள்ள ஒரே மாதிரியான
    இரு வீடுகள் வெவ்வேறு தொகையைச் செலுத்துகின்றன.`,
  nDutyUnit: () => `இது ஒரு-யூனிட் வரி, எனவே இது பில்லுடன் அல்ல, நுகர்வுடன் ஏறி இறங்கும்.`,
  nSubsidy: (c) => `இங்கே ${c.subsidyLabel} பொருந்துகிறது. DISCOM மேலே முழுக் கட்டணத்தையே விதிக்கிறது,
    மாநிலம் அதைத் திருப்பித் தருகிறது — அதனால்தான் இது குறைந்த விகிதமாக அல்லாமல் கழிவாகத் தெரிகிறது,
    மேலும் அதனால்தான் எந்தக் கட்டண ஆணையையும் மாற்றாமல் மானியத்தைத் திரும்பப் பெற முடியும்.`,
  nNetCurrentBill: (c) => `இந்த மாதம் மட்டும் — இது நீங்கள் செலுத்த வேண்டியது அல்ல. ${c.units} யூனிட்டுக்கு
    இது ${c.net} ÷ ${c.units} = ${c.allIn} ஒரு யூனிட்டுக்கு, எப்போதும் ஸ்லாப் விகிதத்தை விட அதிகம். மாதம்
    மாதம் ஒப்பிட வேண்டியது இந்த எண்ணைத்தான்; கீழே உள்ள மொத்தத் தொகையில் பழைய நிலுவை கலந்திருக்கும், அது
    உங்கள் பயன்பாட்டைப் பற்றித் தவறான கதையைச் சொல்லும்.`,
  nArrears: () => `முந்தைய பில்களிலிருந்து கொண்டு வரப்பட்டது. இது இந்த மாதத்தின் நுகர்வின் பகுதி அல்ல,
    மாதங்களை ஒப்பிடும்போது அப்படிப் புரிந்து கொள்ளக் கூடாது.`,
  nLpsc: () => `நிலுவை இருக்கும் வரை இது கூட்டு வட்டியாகச் சேர்ந்துகொண்டே இருக்கும். கடைசி தேதிக்குள்
    செலுத்தினால் இந்த வரி முற்றிலும் நீங்கும் — பில்லில் முழுமையாகத் தவிர்க்கக்கூடிய ஒரே கட்டணம் இதுதான்.`,
  nTotalDiffers: () => `மேலே உள்ள நிகர நடப்பு பில்லிலிருந்து வேறுபடுகிறது, ஏனெனில் இதில் பழைய நிலுவை
    உள்ளது. `,
  nTotalSame: () => `மேலே உள்ள நிகர நடப்பு பில்லுக்குச் சமம், ஏனெனில் இந்தப் பில்லில் எதுவும் கொண்டு
    வரப்படவில்லை. `,
  nTotalPayable: (c) => `${c.diffClause}முழுத் தொகையையும் செலுத்துங்கள்: பகுதியாகச் செலுத்துவது மீதித்
    தொகையின் மீதான அபராதத்தை நிறுத்தாது.`,
  nRebate: (c) => `${c.rebateLabel} ${c.due} அல்லது அதற்கு முன் செலுத்தினால் ${c.payable} அல்ல,
    ${c.payByDue} செலுத்தினால் போதும். தவறவிட்டால் தள்ளுபடியும் போகும், தாமத கட்டண அபராதமும் தொடங்கும் —
    கடைசி தேதி ஒரு தொகைக்கு அல்ல, இரண்டு தனித் தொகைகளுக்குச் சமம்.`,
};

export const BILL_STRINGS = { en, hi, mr, ta };


/** Strings for a language, falling back to English for anything not yet translated. */
export function billT(lang) {
  const table = BILL_STRINGS[lang];
  return table ? { ...en, ...table } : en;
}

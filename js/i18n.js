// js/i18n.js — lightweight i18n layer. Elements carrying a data-i18n="key" attribute have their
// text replaced from the active language's dictionary; data-i18n-html sets innerHTML (for strings
// with inline markup) and data-i18n-ph sets an input placeholder. English is the source/fallback.
// Hindi covers the page chrome — labels, buttons, tabs, hints and the About section. The generated
// bill, dynamic select options and JS-managed unit labels stay English (they're value/logic-bound).
// The choice is persisted in localStorage.

// Exported so generate-seo.js can reuse the same Hindi strings when pre-rendering the
// static /hi/ pages (single source of truth for chrome/glossary shell translations).
export const STRINGS = {
  en: {
    // Header / nav
    'tagline': 'Electricity Bill Calculator · All India',
    'nav.calculator': 'Calculator',
    'nav.compare': 'Compare',
    'nav.about': 'About',
    // Quick Links dropdown (shared chrome on every page)
    'nav.quickLinks': 'Quick Links',
    'ql.tools': 'Tools',
    'ql.tariffs': 'Tariffs',
    'ql.services': 'Services',
    'ql.learn': 'Learn',
    'ql.compare': 'Compare DISCOM Tariffs',
    'ql.usage': 'Usage Estimator',
    'ql.solar': 'Rooftop Solar Savings',
    'ql.tariffsByState': 'Tariffs by State & DISCOM',
    'ql.discomServices': 'DISCOM Services',
    'ql.smartMeter': 'Smart Meter Recharge',
    'ql.billReviewGroup': 'Get Your Bill Reviewed',
    'ql.ocrCheck': 'Instant Self-Check (OCR)',
    'ql.billReview': 'From an Expert',
    'ql.guides': 'Electricity Bill Guides',
    'ql.glossary': 'Electricity Bill Glossary',
    'ql.methodology': 'Methodology & Accuracy',
    // Shared footer links (generated pages + key pages)
    'footer.rights': '© 2026 TheDiscomBill. All rights reserved.',
    'footer.disclaimer': 'Disclaimer',
    'footer.methodology': 'Methodology',
    'footer.allStates': 'All States & DISCOMs',
    'footer.glossary': 'Bill Glossary',
    // Hero
    'hero.badge': 'Free · All DISCOMs · Instant Estimate',
    'hero.title': 'Electricity Bill Calculator for Every DISCOM in India',
    'hero.sub': 'Get an instant provisional bill with slab-wise breakdown for any state electricity utility.',
    'hero.cta': 'Calculate my bill',
    'hero.cta2': 'Get my bill reviewed',
    'review.title': 'How would you like your bill checked?',
    'review.ocr': 'Instant self-check (OCR)',
    'review.ocrSub': 'Upload a bill photo/PDF — the calculator fills itself',
    'review.expert': 'From an expert',
    'review.expertSub': 'Free human review of your uploaded bill',
    'hero.stat.states': 'States & UTs',
    'hero.stat.discoms': 'DISCOMs',
    'hero.stat.categories': 'Categories',
    'hero.feat.slab': 'Slab-wise energy charges',
    'hero.feat.fppa': 'Fixed & fuel surcharge (FPPA)',
    'hero.feat.solar': 'Solar net metering',
    'hero.feat.tod': 'Time-of-Day & kVAh billing',
    'hero.feat.demand': 'Excess demand penalty',
    'hero.feat.duty': 'Electricity duty & state levies',
    'hero.discoms.label': 'Tariffs for 70+ DISCOMs across 35 states & UTs — including',
    'hero.trust': 'Built on publicly available tariff orders · Updated for FY 2025-26',
    // Calculator form
    'calc.title': 'Bill Calculator',
    'label.state': 'State / Union Territory',
    'label.discom': 'Electricity Utility (DISCOM)',
    'label.category': 'Consumer Category',
    'label.supplyType': 'Supply Type / Area',
    'label.consumerName': 'Consumer Name',
    'label.accountNo': 'Account / Consumer No.',
    'label.address': 'Address',
    'label.billingMonth': 'Billing Month & Year',
    'label.billingBasis': 'Billing Basis (energy & demand)',
    'label.fromDate': 'From Date',
    'label.toDate': 'To Date',
    'small.fromDate': 'Billing period start date',
    'small.toDate': 'Billing period end date',
    'label.sanctioned': 'Sanctioned Load (kW)',
    'small.sanctioned': 'Contracted / sanctioned load. Used for fixed charge and excess demand check.',
    'small.fppa': 'Fuel & Power Purchase Adjustment. ₹/unit = (actual − base power cost) × units, or % of supply+demand charges (UP MYT 2025). Uncheck above (or type a value) to enter manually. Can be negative (credit).',
    // Tabs
    'tab.meterread': 'Meter Read',
    'tab.arrear': 'Arrear',
    'tab.payment': 'Payment',
    'tab.adjustment': 'Adjustment',
    'mode.meterReading': 'Meter Reading',
    'mode.tod': 'TOD',
    'label.billedAmount': 'Amount on your DISCOM bill (₹) — optional',
    'small.billedAmount': "We'll compare it with our calculation and tell you if your bill looks right.",

    // Solar calculator (/solar/)
    'sol.title': 'Rooftop Solar Savings Calculator',
    'sol.intro': 'See how much a rooftop solar system would cost and save you, including the <strong>PM Surya Ghar</strong> central subsidy. Enter your monthly units and roof area to get a system size, net cost after subsidy, monthly savings and payback period.',
    'sol.chip1': 'Up to ₹78,000 central subsidy',
    'sol.chip2': '25-year panel life',
    'sol.chip3': 'Free · no sign-up',
    'sol.monthly': 'Average monthly consumption (units)',
    'sol.phMonthly': 'e.g., 350',
    'sol.or': 'or, if you only know your bill',
    'sol.billAmt': 'Monthly bill amount (₹)',
    'sol.phBillAmt': 'e.g., 2450',
    'sol.billAmtHint': "We'll convert it to units using your tariff below.",
    'sol.chartTitle': 'Your savings over 25 years',
    'sol.share': 'Share this estimate on WhatsApp',
    'sol.subNone': 'Not sure / no state top-up (₹0)',
    'sol.subUP': 'Uttar Pradesh — ₹15,000/kW (max ₹30,000)',
    'sol.subAS': 'Assam — ₹15,000/kW (max ₹45,000)',
    'sol.subCustom': 'Custom amount…',
    'sol.pull': 'Use my estimate',
    'sol.roof': 'Shadow-free roof area (sq ft)',
    'sol.phRoof': 'e.g., 300',
    'sol.roofHint': '~100 sq ft of clear roof is needed per 1 kW.',
    'sol.rate': 'Tariff (₹/unit)',
    'sol.stateSub': 'State subsidy (₹)',
    'sol.advanced': 'Advanced',
    'sol.cost': 'System cost (₹ per kW)',
    'sol.costHint': 'Turnkey installed cost before subsidy. Typically ₹50,000–65,000/kW.',
    'sol.empty': 'Enter your monthly units or roof area to see your solar estimate.',
    'sol.heroLabel': 'Recommended system size',
    'sol.paysFor': 'Pays for itself in',
    'sol.gen': 'Estimated generation',
    'sol.grossCost': 'System cost (before subsidy)',
    'sol.centralSub': 'PM Surya Ghar central subsidy',
    'sol.stateSub2': 'State subsidy',
    'sol.netCost': 'Net cost to you',
    'sol.monthlySave': 'Monthly savings',
    'sol.lifetime': 'Net savings over 25 years',
    'sol.co2': 'CO₂ avoided',
    'sol.note': "Estimates use India-average generation (~4 units per kW per day) and the PM Surya Ghar residential central subsidy (₹30,000/kW up to 2 kW, ₹18,000 for the 3rd kW, capped at ₹78,000). Actual generation, cost and state subsidy vary with location, roof orientation, shading and your DISCOM's net-metering policy. Treat this as a planning guide and get a quote from an empanelled vendor on the <a href=\"https://pmsuryaghar.gov.in\" target=\"_blank\" rel=\"noopener noreferrer\">National Portal ↗</a>.",

    // Usage estimator (/usage/)
    'est.title': 'Electricity Usage Estimator',
    'est.intro': "Add the appliances you use, set how many you own and how long they run each day. We'll estimate your <strong>monthly units (kWh)</strong> and approximate cost in real time.",
    'est.chip1': '19 common appliances',
    'est.chip2': 'Live kWh & ₹ estimate',
    'est.chip3': 'Free · no sign-up',
    'est.season': 'Season',
    'est.summer': 'Summer',
    'est.monsoon': 'Monsoon',
    'est.winter': 'Winter',
    'est.colAppliance': 'Appliance',
    'est.colWatts': 'Watts',
    'est.colQty': 'Qty',
    'est.colHrs': 'Hrs/day',
    'est.colKwh': 'kWh/mo',
    'est.emptyRows': 'No appliances yet — tap a chip above to start.',
    'est.addCustom': '+ Add custom appliance',
    'est.totalLabel': 'Estimated monthly consumption',
    'est.perDay': 'kWh per day ·',
    'est.appliances': 'appliances',
    'est.tariff': 'Tariff',
    'est.perUnit': '/unit',
    'est.perMonth': ' / month',
    'est.calcExact': 'Calculate exact bill →',
    'est.handoff': 'Use your real DISCOM slabs, fixed charges & FPPA in the full calculator.',
    'est.solarLink': 'See how much rooftop solar would save on this usage →',
    'est.breakdownTitle': 'Where your units go',
    'est.note': 'Estimates assume a 30-day month. Refrigerator and AC hours mean <em>effective</em> compressor run-time, not clock hours (a fridge cycles on/off). Actual consumption varies with appliance efficiency (star rating), ambient temperature and usage. Treat this as a planning guide, then use the <a href="/#calculator">bill calculator</a> for an exact, tariff-accurate amount.',

    // Buttons
    'btn.addMeter': '+ Add meter',
    'btn.calculate': '⚡ Calculate Provisional Bill',
    'btn.sample': 'Try a sample bill',
    'btn.sampleHero': 'See a sample bill in one click',
    'mode.simple': '⚡ Simple',
    'mode.detailed': 'Detailed',
    'mode.simpleHint': 'Just your DISCOM and units — we handle the rest.',
    'btn.compare': '⚖ Compare DISCOMs',
    'btn.addPayment': '+ Add Payment',
    'btn.addAdjustment': '+ Add Adjustment',
    // Checkboxes / toggles
    'chk.fppaAuto': 'Auto-fill from verified government data',
    'chk.netMetering': '<strong>Rooftop solar / net metering</strong> — bill on net import',
    'label.exportUnits': 'Exported Units (kWh)',
    'label.openingCredit': 'Opening Banked Credit (kWh)',
    'chk.lpsc': '<strong>LPSC Applicable</strong> — apply late-payment surcharge on the current bill',
    'label.subsidy': 'Government Domestic Subsidy',
    'chk.applySubsidy': 'Apply government subsidy',
    // Arrear / Payment / Adjustment
    'hint.arrear': 'Enter amounts exactly as shown on your previous bill. LPSC on previous arrear is a direct amount, not computed.',
    'label.prevArrear': 'Previous Arrear (₹)',
    'label.prevArrearLpsc': 'Prev. Arrear LPSC (₹)',
    'total.arrear': 'Total Arrear:',
    'hint.lpsc': 'LPSC is enabled by the “LPSC Applicable” toggle on the Meter Read tab. These fields set the rate and how many months the current bill is overdue.',
    'label.lpscRate': 'Current Bill LPSC Rate (% / month)',
    'label.lpscMonths': 'Current Bill Months Late',
    'hint.payment': 'Payments already made during this billing period — these reduce the total amount due.',
    'total.payment': 'Total Payment:',
    'hint.adjustment': 'Any miscellaneous credits or charges — e.g., meter cost, security deposit refund, or rebate. Use negative values for credits.',
    'total.adjustment': 'Total Adjustment:',
    // Meter reading hint (advHint)
    'hint.advanced': 'Enter each meter’s previous → current reading (Units = (Current − Previous) \xd7 MF). Use “+ Add meter” for a mid-cycle replacement (old + new meter) or for multiple meters — their units are summed.',
    // Input placeholders
    'ph.consumerName': 'e.g., Rajesh Kumar',
    'ph.accountNo': 'Optional',
    'ph.address': 'e.g., 12 Main Road, New Delhi',
    'label.meterNo': 'Meter Number',
    'ph.meterNo': 'Optional',
    'ph.totalUnits': 'Total Consumed Units',
    'ph.meterLabel': 'Meter Number (Optional)',
    // Dropdown default options
    'opt.selectState': '— Select State / UT —',
    'opt.selectStateFirst': '— Select State First —',
    'opt.selectDiscomFirst': '— Select DISCOM First —',
    // Billing Basis small
    'small.billingBasis': '<strong>kWh</strong>: meter read in kWh, demand in kW. <strong>kVA based</strong>: meter read in kVAh (apparent energy) and demand billed in kVA — a low power factor already shows up as more kVAh, so there is no separate PF penalty. Auto-set for kVA (HT/large-LT) tariffs — override as needed.',
    // Billed demand
    'label.billedDemand': 'Maximum Demand (MD) (kW)',
    'small.billedDemand': 'Peak demand recorded by the meter this period. For demand-billed (commercial) categories it drives the demand charge and the excess-demand penalty when it exceeds the sanctioned load. Leave blank to bill on sanctioned load.',
    // Net metering
    'small.netMetering': 'The units consumed above are your <strong>import</strong> from the grid. Net billed = import − exported − opening credit; any surplus is banked and carried forward (across months in a multi-month revision too).',
    // LPSC
    'small.lpscApplicable': 'Rate & months-late are set in the Arrear tab. Uncheck if late-payment surcharge does not apply for this consumer / period.',
    'small.arrearLpsc': 'LPSC amount on the previous arrear, as shown on your last bill.',
    'small.lpscRate': 'Late Payment Surcharge per SERC order. Typically 1.5%.',
    'small.lpscMonths': 'Months late in paying the current bill (LPSC applied on current net).',
    // TOD
    'label.todPeak': 'Peak Units <span class="tod-badge tod-badge-peak tod-badge-sm">+20%</span>',
    'label.todNormal': 'Normal Units',
    'label.todOffPeak': 'Off-Peak Units <span class="tod-badge tod-badge-offpeak tod-badge-sm">−20%</span>',
    'small.todPeak': '6AM–10AM &amp; 6PM–10PM',
    'small.todNormal': '10AM–6PM (base rate)',
    'small.todOffPeak': '10PM–6AM',
    // Billing period / totals display labels
    'lbl.billingPeriod': 'Billing period:',
    'lbl.days': 'days',
    'lbl.months': 'months',
    'lbl.total': 'Total:',
    'lbl.period': 'period',
    'lbl.todTotal': 'TOD Total:',
    'lbl.peak': 'Peak',
    'lbl.normal': 'Normal',
    'lbl.offPeak': 'Off-Peak',
    // Bill placeholder
    'placeholder.title': 'Your provisional bill will appear here',
    'placeholder.sub': 'Select your DISCOM, fill in the details, and click<br><strong>Calculate Provisional Bill</strong>',
    // About
    'about.title': 'About TheDiscomBill',
    'about.p1': 'TheDiscomBill is a free, browser-based electricity bill calculator that covers <strong>all Distribution Companies (DISCOMs) across India</strong> — from BESCOM in Karnataka to MSEDCL in Maharashtra, PSPCL in Punjab, TANGEDCO in Tamil Nadu, and dozens more. Simply select your state, choose your DISCOM, pick your consumer category, enter your units consumed, and get an instant provisional bill with a complete slab-wise breakdown.',
    'about.stat.states': 'States & UTs covered',
    'about.stat.discoms': 'DISCOMs supported',
    'about.stat.categories': 'Consumer categories',
    'about.stat.free': 'No sign-up needed',
    'about.howTitle': 'How It Works',
    'about.p2': 'The calculator uses the latest publicly available tariff orders from each DISCOM. It computes charges using the <strong>telescopic (cumulative) slab method</strong>: the rate for each slab applies only to the units consumed within that slab, not to the entire consumption. Fixed / demand charges are applied separately based on your connected (sanctioned) load.',
    'about.p3': "Electricity Duty, fuel adjustment charges, and other state levies are applied as specified in each DISCOM's tariff schedule.",
    'about.disclaimer': '<strong>⚠ Disclaimer:</strong> This is a <strong>provisional bill calculator</strong> for reference and educational purposes only. The tariff rates used here are approximate, based on publicly available tariff orders, and may not reflect the latest revisions or local surcharges. Actual bills from your DISCOM may differ. Always contact your DISCOM or visit their official website for accurate and official billing information. TheDiscomBill is not affiliated with any electricity utility or government body.',
    // Breadcrumb (shared)
    'bc.home': 'Home',
    // DISCOM Services page (/services/)
    'svc.h2': 'DISCOM Services',
    'svc.intro': 'Everything you need from your electricity provider in one place. Pick a service, choose your state and DISCOM, and we\'ll take you straight to its <strong>official portal</strong> — plus the 24×7 power helpline.',
    'svc.tab.pay': 'Pay Bill',
    'svc.tab.new': 'New Connection',
    'svc.tab.complaint': 'Complaint',
    'svc.tab.helplines': 'Helplines',
    'svc.lead.pay': 'Select your state and electricity provider — we\'ll take you straight to its <strong>official bill-payment portal</strong>, where you can view, download and pay your bill on the authentic source.',
    'svc.lead.new': 'Applying for a new connection? Select your state and DISCOM to apply on its <strong>official portal</strong>, and see the typical process, documents and charges below.',
    'svc.lead.complaint': 'Facing an outage, a wrong bill or a faulty meter? Pick your DISCOM to file a complaint on its <strong>official portal</strong> — or call the 24×7 helpline on the <strong>Helplines</strong> tab.',
    'svc.lead.helplines': 'Numbers and the escalation path that work in any state, regardless of your DISCOM.',
    'svc.label.state': 'State / UT',
    'svc.label.discom': 'Your DISCOM',
    'svc.helpline.label': '24×7 National Power Helpline',
    'svc.helpline.sub': 'Outage & supply complaints, any state',
    'svc.info.title': 'If your complaint isn\'t resolved',
    'svc.step1': '<strong>DISCOM complaint portal / 1912</strong><span>File the complaint first with your DISCOM and note the complaint number and the notified resolution time.</span>',
    'svc.step2': '<strong>Consumer Grievance Redressal Forum (CGRF)</strong><span>If it isn\'t resolved in time, escalate to your DISCOM\'s CGRF — a statutory forum for consumer complaints.</span>',
    'svc.step3': '<strong>Electricity Ombudsman</strong><span>Still unresolved? Approach the Electricity Ombudsman of your State Electricity Regulatory Commission — the final appellate authority.</span>',
    'svc.chargeNote': '💡 Keep your consumer / account number and the DISCOM complaint number handy at every step.',
    'svc.note': 'TheDiscomBill is independent and not affiliated with any DISCOM. We link only to official portals and helplines — we never ask for your account number, OTP or password. For an estimate of your charges before paying, use the <a href="/#calculator">bill calculator</a>.',
    // Compare page (/compare/)
    'cmp.h2': 'Tariff Comparison (Major DISCOMs)',
    'cmp.intro': 'See how major electricity providers stack up against each other for a typical month at a <strong>1&nbsp;kW sanctioned load</strong>. Calculated dynamically based on current FY 2025-26 tariffs.',
    'cmp.cc.title': 'Compare any two DISCOMs',
    'cmp.cc.sub': 'Not just the majors — pick any two providers and enter your own monthly usage for a like-for-like bill estimate, with a full breakdown.',
    'cmp.cc.discomA': 'DISCOM A',
    'cmp.cc.discomB': 'DISCOM B',
    'cmp.cc.units': 'Monthly units (kWh)',
    'cmp.cc.load': 'Load (kW)',
    'cmp.cc.category': 'Category',
    'cmp.cat.domestic': 'Domestic',
    'cmp.cat.commercial': 'Commercial',
    'cmp.cc.btn': 'Compare',
    'cmp.cc.subsidy': 'Include government subsidy (eligible domestic connections)',
    'cmp.cc.note': 'Subsidy is applied to eligible <strong>domestic</strong> connections. Currently modelled: <strong>Delhi</strong> (GNCTD — first 200 units free, 50% rebate to 400). Other states\' subsidies (e.g. Punjab, Karnataka) may reduce your actual bill further.',
    'cmp.th.discom': 'DISCOM / State',
    'cmp.th.u200': '200 Units',
    'cmp.th.u400': '400 Units',
    'cmp.th.u600': '600 Units',
    'cmp.th.u1000': '1000 Units',
    'cmp.note1.title': 'What each figure includes',
    'cmp.note1.body': 'Figures are the estimated <strong>total monthly bill</strong> — energy + fixed/demand charges + FPPA (where applicable) — for a single-phase connection on the standard urban tariff, computed with the same engine as the calculator and verified against real bills (<a href="/methodology/">see our methodology</a>). A fixed <strong>1&nbsp;kW sanctioned load</strong> is assumed across all consumption tiers.',
    'cmp.note2.title': 'Subsidies & exclusions',
    'cmp.note2.body': 'Eligible <strong>domestic government subsidy</strong> is applied where modelled — <strong>Delhi</strong> (GNCTD), <strong>Punjab</strong>, <strong>Karnataka</strong>, <strong>Telangana</strong> and <strong>Tamil Nadu</strong> — as free energy on the eligible units. States without a listed scheme aren\'t subsidised here and may bill lower. Net-metering and late-payment surcharge are excluded.',
    'cmp.note3.title': 'Reading the table',
    'cmp.note3.body': 'The <span class="comp-best" style="padding:1px 6px;border-radius:5px">green</span> cell marks the cheapest DISCOM at each consumption level. Always verify against your actual bill — tariffs vary by sub-category, slab and city.',
    // Methodology page (/methodology/)
    'meth.crumb': 'Methodology',
    'meth.h1': 'Methodology & Accuracy',
    'meth.lead': 'Every figure our <a href="/#calculator">calculator</a> shows traces back to a published tariff order — and we check the result against real consumer bills. This page explains where the numbers come from, how a tariff order becomes a calculation, how we verify it, and — just as important — what we do <em>not</em> yet model.',
    'meth.s1.h2': '1. Where the numbers come from',
    'meth.s1.p1': 'There is no "typical" or invented rate anywhere in the tool. Every slab rate, fixed charge, duty and surcharge is taken from a primary source:',
    'meth.s1.ul': '<li><strong>SERC tariff orders</strong> — the annual (or multi-year) tariff order issued by each State Electricity Regulatory Commission, which is the legal document that sets what a DISCOM may charge.</li><li><strong>DISCOM tariff schedules &amp; FPPA circulars</strong> — the rate cards and the monthly/quarterly fuel-surcharge (FPPA/FPPCA/FAC) notifications that DISCOMs publish under those orders.</li><li><strong>Real consumer bills</strong> — actual printed bills, used both to confirm how the order is applied in practice and to verify our output (see section 3).</li>',
    'meth.s1.p2': 'When a new order or FPPA circular is published, the corresponding rates in the tool are updated to match it. The current tariff figures reflect the <strong>2025-26</strong> orders, with the FPPA refreshed for July 2026.',
    'meth.s2.h2': '2. How a tariff order becomes a calculation',
    'meth.s2.p1': 'A tariff order is prose and tables; a bill is arithmetic applied in a specific order. Our engine encodes that arithmetic exactly as the order specifies, rather than approximating it:',
    'meth.s2.ul': '<li><strong>Telescopic slabs</strong> — each slab rate applies only to the units that fall within its band, so a higher rate never applies to your whole consumption (see <a href="/glossary/#telescopic-slabs">telescopic slabs</a>). Non-telescopic "slab-benefit-lost" tariffs are modelled where a DISCOM uses them.</li><li><strong>Fixed / demand charges</strong> — billed per kW of sanctioned load, per kVA of demand, or as a flat amount, following the category. For demand-billed categories the <a href="/glossary/#maximum-demand">billed demand</a> and any excess-demand penalty over the sanctioned/contract limit are computed.</li><li><strong>FPPA (fuel surcharge)</strong> — applied by whichever method the order specifies: a flat <em>per-unit</em> paise amount, or a <em>percentage</em> of the supply and demand charges (as under the UP MYT Regulations 2025). It can be a negative credit.</li><li><strong>Electricity duty and levies</strong> — the state duty is applied on the correct base and in the correct sequence (it is charged on the energy/fuel component, not on itself), because the ordering changes the final figure.</li><li><strong>kVAh billing</strong> — where a meter and tariff use apparent energy, energy is metered in <a href="/glossary/#kvah">kVAh</a> and demand in kVA, so a poor <a href="/glossary/#power-factor">power factor</a> raises the bill directly instead of through a separate penalty.</li><li><strong>Time-of-Day, subsidies, net metering, LPSC and arrears</strong> — peak/off-peak blocks, eligible government subsidy, rooftop-solar net import, and late-payment surcharge are each applied where they apply.</li>',
    'meth.s3.h2': '3. Verified against real bills — to the paisa',
    'meth.s3.p1': 'The strongest test of a billing engine is not whether it looks right, but whether it reproduces an actual bill line for line. It does. Our engine reproduces real <strong>MVVNL (Madhyanchal Vidyut Vitran Nigam, a UPPCL DISCOM) bills to the paisa</strong> for the categories we have tested against printed bills, including:',
    'meth.s3.ul': '<li><strong>LMV-1 domestic</strong> and small-consumer bills — energy, fixed charge, fuel surcharge and electricity duty all reconcile with the printed total.</li><li><strong>LMV-17 / LMV-20</strong> non-domestic and larger connections, including the demand-based and percentage-FPPA arithmetic.</li>',
    'meth.s3.p2': 'When a real bill and our engine disagree, we treat it as a bug in our encoding of the tariff order and fix the logic — not as an acceptable rounding difference.',
    'meth.s4.h2': '4. What we model — and what we don\'t yet',
    'meth.s4.p1': 'Being clear about the edges is part of being accurate. What the tool models well:',
    'meth.s4.ul1': '<li>Telescopic and non-telescopic energy slabs, fixed/demand charges, excess-demand penalty.</li><li>FPPA by both per-unit and percentage methods, electricity duty, and common state levies.</li><li>kVAh apparent-energy billing and power-factor effects.</li><li>Time-of-Day peak/off-peak billing and rooftop-solar net metering.</li><li>Eligible domestic government subsidies for the states that run them — Delhi (GNCTD), Punjab, Karnataka (Gruha Jyoti), Telangana and Tamil Nadu — applied to the domestic category when you opt in.</li>',
    'meth.s4.p2': 'What we do <strong>not</strong> yet fully model, and where a real bill may differ:',
    'meth.s4.ul2': '<li><strong>Some category-specific minimum charges</strong> — for example the LMV-2 minimum monthly charge is a known gap we have not yet reproduced exactly.</li><li><strong>Subsidy fine print</strong> — we model each subsidy conservatively as free energy on the eligible units (fixed charge, FPPA and duty still apply) and take Karnataka/Telangana\'s cap as a flat 200 units rather than the exact avg-consumption formula. States without a listed scheme have no subsidy applied, so a real bill there may be lower.</li><li><strong>Net metering and late-payment surcharge in the multi-DISCOM comparison table</strong> — these are excluded there for a like-for-like comparison, though the main calculator supports them.</li>',
    'meth.s4.p3': 'Every result is a <strong>provisional estimate</strong>. Tariffs vary by sub-category, slab, city and sanction, so we always recommend verifying against your printed bill.',
    'meth.s5.h2': '5. How often it\'s updated',
    'meth.s5.p1': 'Rates are refreshed as new tariff orders and FPPA circulars are published — typically once a year for the base tariff (following each SERC\'s order) and more often for the fuel surcharge, which moves monthly or quarterly. Corrections raised through real bills are applied to the underlying tariff data, so a fix for one consumer improves the estimate for everyone on that tariff.',
    'meth.s6.h2': '6. Independence',
    'meth.s6.p1': 'TheDiscomBill is <strong>independent</strong> and not affiliated with any DISCOM, SERC or government body. Our estimate is guidance, not a legal ruling or an official bill. For a formal dispute, use your DISCOM\'s grievance forum; for a human read of a specific bill, our <a href="/bill-review/">expert Bill Review</a> service can help.',
    'meth.s7.h2': 'See it in action',
    'meth.card1': '<strong>Bill Calculator</strong><span>Enter your own units and load for an itemised, slab-wise estimate</span>',
    'meth.card2': '<strong>Tariffs by State</strong><span>The exact slab rates, fixed charges and FPPA behind every estimate</span>',
    'meth.card3': '<strong>Bill Glossary</strong><span>Plain-language definitions of every charge line and code</span>',
    'meth.disclaimer': 'Figures are provisional estimates computed from published tariff orders and verified against sample bills; the exact treatment of any charge varies by state, DISCOM and consumer category. Always verify against your DISCOM\'s tariff order or your printed bill.',
    // Glossary page framing (/glossary/) — the 14 term definitions stay in English (technical reference)
    'gloss.crumb': 'Glossary',
    'gloss.h1': 'Electricity Bill Glossary',
    'gloss.lead': 'Every charge line and code on an Indian electricity bill, defined in plain language. These are the terms behind our <a href="/#calculator">bill calculator</a> and <a href="/tariffs/states/">tariff pages</a> — from <a href="#fppa">FPPA</a> and <a href="#electricity-duty">electricity duty</a> to <a href="#telescopic-slabs">telescopic slabs</a> and <a href="#kvah">kVAh</a>.',
    'gloss.aka': 'Also called:',
    'gloss.backToTop': '↑ Back to all terms',
    'gloss.work.h2': 'Put these terms to work',
    'gloss.card1': '<strong>Bill Calculator</strong><span>Apply these charges to your own units and load for an itemised estimate</span>',
    'gloss.card2': '<strong>Bill Guides</strong><span>Longer walkthroughs: reading your bill, why bills rise, Time-of-Day billing</span>',
    'gloss.card3': '<strong>Tariffs by State</strong><span>The live slab rates, fixed charges and FPPA for every DISCOM</span>',
    'gloss.disclaimer': 'General definitions based on common Indian tariff practice; the exact treatment of any charge varies by state, DISCOM and consumer category. Verify against your DISCOM\'s tariff order or your printed bill.',
    // Footer
    'footer.l1': '&copy; 2026 TheDiscomBill &nbsp;·&nbsp; Free Electricity Bill Calculator for India',
    'footer.l2': 'Tariff data is approximate and based on publicly available information (2025-26). Not affiliated with any DISCOM, SERC, or government body. &nbsp;|&nbsp; <a href="#about">Disclaimer</a>',
  },
  hi: {
    // Header / nav
    'tagline': 'बिजली बिल कैलकुलेटर · पूरे भारत के लिए',
    'nav.calculator': 'कैलकुलेटर',
    'nav.compare': 'तुलना',
    'nav.about': 'परिचय',
    // Quick Links dropdown (shared chrome on every page)
    'nav.quickLinks': 'त्वरित लिंक',
    'ql.tools': 'टूल्स',
    'ql.tariffs': 'टैरिफ',
    'ql.services': 'सेवाएँ',
    'ql.learn': 'जानें',
    'ql.compare': 'डिस्कॉम टैरिफ तुलना',
    'ql.usage': 'खपत अनुमानक',
    'ql.solar': 'रूफटॉप सोलर बचत',
    'ql.tariffsByState': 'राज्य व डिस्कॉम अनुसार टैरिफ',
    'ql.discomServices': 'डिस्कॉम सेवाएँ',
    'ql.smartMeter': 'स्मार्ट मीटर रिचार्ज',
    'ql.billReviewGroup': 'अपने बिल की जाँच कराएँ',
    'ql.ocrCheck': 'तुरंत स्व-जाँच (OCR)',
    'ql.billReview': 'विशेषज्ञ से',
    'ql.guides': 'बिजली बिल गाइड',
    'ql.glossary': 'बिजली बिल शब्दावली',
    'ql.methodology': 'कार्यप्रणाली व सटीकता',
    // Shared footer links (generated pages + key pages)
    'footer.rights': '© 2026 TheDiscomBill. सर्वाधिकार सुरक्षित।',
    'footer.disclaimer': 'अस्वीकरण',
    'footer.methodology': 'कार्यप्रणाली',
    'footer.allStates': 'सभी राज्य व डिस्कॉम',
    'footer.glossary': 'बिल शब्दावली',
    // Hero
    'hero.badge': 'निःशुल्क · सभी डिस्कॉम · तुरंत अनुमान',
    'hero.title': 'भारत के हर डिस्कॉम के लिए बिजली बिल कैलकुलेटर',
    'hero.sub': 'किसी भी राज्य की बिजली कंपनी के लिए स्लैब-वार विवरण के साथ तुरंत अनुमानित बिल पाएं।',
    'hero.cta': 'मेरा बिल जानें',
    'hero.cta2': 'मेरे बिल की जाँच कराएँ',
    'review.title': 'अपने बिल की जाँच कैसे कराना चाहेंगे?',
    'review.ocr': 'तुरंत स्व-जाँच (OCR)',
    'review.ocrSub': 'बिल की फोटो/PDF अपलोड करें — कैलकुलेटर अपने आप भर जाएगा',
    'review.expert': 'विशेषज्ञ से',
    'review.expertSub': 'अपलोड किए गए बिल की मुफ़्त विशेषज्ञ समीक्षा',
    'hero.stat.states': 'राज्य व केंद्रशासित',
    'hero.stat.discoms': 'डिस्कॉम',
    'hero.stat.categories': 'श्रेणियाँ',
    'hero.feat.slab': 'स्लैब-वार ऊर्जा शुल्क',
    'hero.feat.fppa': 'फिक्स्ड व ईंधन अधिभार (FPPA)',
    'hero.feat.solar': 'सोलर नेट मीटरिंग',
    'hero.feat.tod': 'टाइम-ऑफ-डे व kVAh बिलिंग',
    'hero.feat.demand': 'अतिरिक्त मांग जुर्माना',
    'hero.feat.duty': 'बिजली शुल्क व राज्य उद्ग्रहण',
    'hero.discoms.label': '35+ राज्यों व केंद्रशासित प्रदेशों के 70+ डिस्कॉम के टैरिफ — जैसे',
    'hero.trust': 'सार्वजनिक टैरिफ आदेशों पर आधारित · वित्त वर्ष 2025-26 हेतु अद्यतन',
    // Calculator form
    'calc.title': 'बिल कैलकुलेटर',
    'label.state': 'राज्य / केंद्र शासित प्रदेश',
    'label.discom': 'बिजली कंपनी (डिस्कॉम)',
    'label.category': 'उपभोक्ता श्रेणी',
    'label.supplyType': 'आपूर्ति प्रकार / क्षेत्र',
    'label.consumerName': 'उपभोक्ता का नाम',
    'label.accountNo': 'खाता / उपभोक्ता संख्या',
    'label.address': 'पता',
    'label.billingMonth': 'बिलिंग माह व वर्ष',
    'label.billingBasis': 'बिलिंग आधार (ऊर्जा व मांग)',
    'label.fromDate': 'आरंभ तिथि',
    'label.toDate': 'अंतिम तिथि',
    'small.fromDate': 'बिलिंग अवधि की आरंभ तिथि',
    'small.toDate': 'बिलिंग अवधि की अंतिम तिथि',
    'label.sanctioned': 'स्वीकृत भार (kW)',
    'small.sanctioned': 'अनुबंधित / स्वीकृत भार। फिक्स्ड शुल्क और अतिरिक्त मांग जाँच के लिए।',
    'small.fppa': 'ईंधन व विद्युत क्रय समायोजन। ₹/यूनिट = (वास्तविक − आधार विद्युत लागत) × यूनिट, या आपूर्ति+मांग शुल्क का % (UP MYT 2025)। मैन्युअल दर्ज करने हेतु ऊपर अनचेक करें (या मान टाइप करें)। ऋणात्मक (क्रेडिट) हो सकता है।',
    // Tabs
    'tab.meterread': 'मीटर रीडिंग',
    'tab.arrear': 'बकाया',
    'tab.payment': 'भुगतान',
    'tab.adjustment': 'समायोजन',
    'mode.meterReading': 'मीटर रीडिंग',
    'mode.tod': 'टीओडी',
    'label.billedAmount': 'आपके डिस्कॉम बिल की राशि (₹) — वैकल्पिक',
    'small.billedAmount': 'हम इसे अपनी गणना से मिलाकर बताएँगे कि आपका बिल सही लगता है या नहीं।',

    // Solar calculator (/solar/)
    'sol.title': 'रूफटॉप सोलर बचत कैलकुलेटर',
    'sol.intro': 'देखें कि रूफटॉप सोलर सिस्टम की लागत कितनी होगी और यह आपको कितनी बचत देगा — <strong>PM सूर्य घर</strong> केंद्रीय सब्सिडी सहित। सिस्टम साइज़, सब्सिडी के बाद की नेट लागत, मासिक बचत और पेबैक अवधि जानने के लिए अपनी मासिक यूनिट और छत का क्षेत्रफल डालें।',
    'sol.chip1': '₹78,000 तक केंद्रीय सब्सिडी',
    'sol.chip2': '25 वर्ष पैनल लाइफ़',
    'sol.chip3': 'मुफ़्त · कोई साइन-अप नहीं',
    'sol.monthly': 'औसत मासिक खपत (यूनिट)',
    'sol.phMonthly': 'जैसे 350',
    'sol.or': 'या, अगर आपको सिर्फ़ बिल की राशि पता है',
    'sol.billAmt': 'मासिक बिल राशि (₹)',
    'sol.phBillAmt': 'जैसे 2450',
    'sol.billAmtHint': 'हम नीचे दिए टैरिफ से इसे यूनिट में बदल देंगे।',
    'sol.chartTitle': '25 वर्षों में आपकी बचत',
    'sol.share': 'यह अनुमान WhatsApp पर शेयर करें',
    'sol.subNone': 'पता नहीं / कोई राज्य टॉप-अप नहीं (₹0)',
    'sol.subUP': 'उत्तर प्रदेश — ₹15,000/kW (अधिकतम ₹30,000)',
    'sol.subAS': 'असम — ₹15,000/kW (अधिकतम ₹45,000)',
    'sol.subCustom': 'अपनी राशि डालें…',
    'sol.pull': 'मेरा अनुमान इस्तेमाल करें',
    'sol.roof': 'छाया-रहित छत क्षेत्र (वर्ग फ़ुट)',
    'sol.phRoof': 'जैसे 300',
    'sol.roofHint': 'प्रति 1 kW के लिए लगभग 100 वर्ग फ़ुट खुली छत चाहिए।',
    'sol.rate': 'टैरिफ (₹/यूनिट)',
    'sol.stateSub': 'राज्य सब्सिडी (₹)',
    'sol.advanced': 'एडवांस्ड',
    'sol.cost': 'सिस्टम लागत (₹ प्रति kW)',
    'sol.costHint': 'सब्सिडी से पहले टर्नकी इंस्टॉल लागत। आमतौर पर ₹50,000–65,000/kW।',
    'sol.empty': 'अपना सोलर अनुमान देखने के लिए मासिक यूनिट या छत का क्षेत्रफल डालें।',
    'sol.heroLabel': 'अनुशंसित सिस्टम साइज़',
    'sol.paysFor': 'लागत वसूल होगी',
    'sol.gen': 'अनुमानित उत्पादन',
    'sol.grossCost': 'सिस्टम लागत (सब्सिडी से पहले)',
    'sol.centralSub': 'PM सूर्य घर केंद्रीय सब्सिडी',
    'sol.stateSub2': 'राज्य सब्सिडी',
    'sol.netCost': 'आपकी नेट लागत',
    'sol.monthlySave': 'मासिक बचत',
    'sol.lifetime': '25 वर्षों में नेट बचत',
    'sol.co2': 'CO₂ बचत',
    'sol.note': 'अनुमान भारत के औसत उत्पादन (~4 यूनिट प्रति kW प्रति दिन) और PM सूर्य घर आवासीय केंद्रीय सब्सिडी (2 kW तक ₹30,000/kW, तीसरे kW पर ₹18,000, अधिकतम ₹78,000) पर आधारित हैं। वास्तविक उत्पादन, लागत और राज्य सब्सिडी स्थान, छत की दिशा, छाया और आपके डिस्कॉम की नेट-मीटरिंग नीति पर निर्भर करती है। इसे एक योजना-गाइड मानें और <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer">राष्ट्रीय पोर्टल ↗</a> पर सूचीबद्ध विक्रेता से कोटेशन लें।',

    // Usage estimator (/usage/)
    'est.title': 'बिजली खपत अनुमानक',
    'est.intro': "अपने उपकरण जोड़ें, बताएँ कि कितने हैं और रोज़ कितने घंटे चलते हैं। हम आपकी <strong>मासिक यूनिट (kWh)</strong> और अनुमानित लागत तुरंत बता देंगे।",
    'est.chip1': '19 आम उपकरण',
    'est.chip2': 'लाइव kWh व ₹ अनुमान',
    'est.chip3': 'मुफ़्त · कोई साइन-अप नहीं',
    'est.season': 'मौसम',
    'est.summer': 'गर्मी',
    'est.monsoon': 'मानसून',
    'est.winter': 'सर्दी',
    'est.colAppliance': 'उपकरण',
    'est.colWatts': 'वाट',
    'est.colQty': 'संख्या',
    'est.colHrs': 'घंटे/दिन',
    'est.colKwh': 'kWh/माह',
    'est.emptyRows': 'अभी कोई उपकरण नहीं — ऊपर किसी चिप पर टैप करके शुरू करें।',
    'est.addCustom': '+ कस्टम उपकरण जोड़ें',
    'est.totalLabel': 'अनुमानित मासिक खपत',
    'est.perDay': 'kWh प्रति दिन ·',
    'est.appliances': 'उपकरण',
    'est.tariff': 'टैरिफ',
    'est.perUnit': '/यूनिट',
    'est.perMonth': ' / माह',
    'est.calcExact': 'सटीक बिल जानें →',
    'est.handoff': 'पूरे कैलकुलेटर में अपने असली डिस्कॉम स्लैब, फिक्स्ड चार्ज व FPPA इस्तेमाल करें।',
    'est.solarLink': 'देखें इस खपत पर रूफटॉप सोलर कितना बचाएगा →',
    'est.breakdownTitle': 'आपकी यूनिट कहाँ जाती हैं',
    'est.note': 'अनुमान 30-दिन के महीने पर आधारित हैं। रेफ्रिजरेटर और AC के घंटे <em>प्रभावी</em> कंप्रेसर रन-टाइम हैं, घड़ी के घंटे नहीं (फ्रिज चालू-बंद होता रहता है)। वास्तविक खपत उपकरण की दक्षता (स्टार रेटिंग), तापमान और उपयोग पर बदलती है। इसे एक योजना-गाइड मानें, फिर सटीक, टैरिफ-अनुसार राशि के लिए <a href="/#calculator">बिल कैलकुलेटर</a> इस्तेमाल करें।',

    // Buttons
    'btn.addMeter': '+ मीटर जोड़ें',
    'btn.calculate': '⚡ अनुमानित बिल गणना करें',
    'btn.sample': 'नमूना बिल देखें',
    'btn.sampleHero': 'एक क्लिक में नमूना बिल देखें',
    'mode.simple': '⚡ आसान',
    'mode.detailed': 'विस्तृत',
    'mode.simpleHint': 'बस डिस्कॉम और यूनिट — बाक़ी हम संभालेंगे।',
    'btn.compare': '⚖ डिस्कॉम की तुलना करें',
    'btn.addPayment': '+ भुगतान जोड़ें',
    'btn.addAdjustment': '+ समायोजन जोड़ें',
    // Checkboxes / toggles
    'chk.fppaAuto': 'सत्यापित सरकारी डेटा से स्वतः भरें',
    'chk.netMetering': '<strong>रूफटॉप सोलर / नेट मीटरिंग</strong> — नेट आयात पर बिल',
    'label.exportUnits': 'निर्यातित यूनिट (kWh)',
    'label.openingCredit': 'प्रारंभिक संचित क्रेडिट (kWh)',
    'chk.lpsc': '<strong>LPSC लागू</strong> — वर्तमान बिल पर विलंब-भुगतान अधिभार लगाएँ',
    'label.subsidy': 'सरकारी घरेलू सब्सिडी',
    'chk.applySubsidy': 'सरकारी सब्सिडी लागू करें',
    // Arrear / Payment / Adjustment
    'hint.arrear': 'राशियाँ ठीक वैसे ही दर्ज करें जैसे आपके पिछले बिल में दिखाई गई हैं। पिछले बकाया पर LPSC एक सीधी राशि है, गणना की गई नहीं।',
    'label.prevArrear': 'पिछला बकाया (₹)',
    'label.prevArrearLpsc': 'पिछला बकाया LPSC (₹)',
    'total.arrear': 'कुल बकाया:',
    'hint.lpsc': 'LPSC मीटर रीडिंग टैब के “LPSC लागू” टॉगल से सक्षम होता है। ये फ़ील्ड दर और वर्तमान बिल कितने माह विलंबित है, यह निर्धारित करते हैं।',
    'label.lpscRate': 'वर्तमान बिल LPSC दर (% / माह)',
    'label.lpscMonths': 'वर्तमान बिल विलंब (माह)',
    'hint.payment': 'इस बिलिंग अवधि में पहले से किए गए भुगतान — ये देय कुल राशि को घटाते हैं।',
    'total.payment': 'कुल भुगतान:',
    'hint.adjustment': 'कोई विविध क्रेडिट या शुल्क — जैसे मीटर लागत, सुरक्षा जमा वापसी, या छूट। क्रेडिट के लिए ऋणात्मक मान का उपयोग करें।',
    'total.adjustment': 'कुल समायोजन:',
    // Meter reading hint (advHint)
    'hint.advanced': 'प्रत्येक मीटर की पिछली → वर्तमान रीडिंग दर्ज करें (यूनिट = (वर्तमान − पिछली) × MF)। मध्य-चक्र प्रतिस्थापन या एकाधिक मीटर के लिए "+ मीटर जोड़ें" का उपयोग करें — उनकी यूनिट जोड़ी जाती हैं।',
    // Input placeholders
    'ph.consumerName': 'जैसे, राजेश कुमार',
    'ph.accountNo': 'वैकल्पिक',
    'ph.address': 'जैसे, 12 मुख्य सड़क, नई दिल्ली',
    'label.meterNo': 'मीटर संख्या',
    'ph.meterNo': 'वैकल्पिक',
    'ph.totalUnits': 'कुल खपत यूनिट',
    'ph.meterLabel': 'मीटर संख्या (वैकल्पिक)',
    // Dropdown default options
    'opt.selectState': '— राज्य / UT चुनें —',
    'opt.selectStateFirst': '— पहले राज्य चुनें —',
    'opt.selectDiscomFirst': '— पहले डिस्कॉम चुनें —',
    // Billing Basis small
    'small.billingBasis': '<strong>kWh</strong>: मीटर रीडिंग kWh में, मांग kW में। <strong>kVA आधारित</strong>: मीटर रीडिंग kVAh में (आभासी ऊर्जा) और मांग kVA में — कम पावर फैक्टर सीधे अधिक kVAh के रूप में दिखता है, अलग PF जुर्माना नहीं। kVA (HT/बड़े-LT) टैरिफ के लिए स्वतः सेट — आवश्यकतानुसार बदलें।',
    // Billed demand
    'label.billedDemand': 'अधिकतम मांग (MD) (kW)',
    'small.billedDemand': 'इस अवधि में मीटर द्वारा दर्ज शिखर मांग। व्यावसायिक श्रेणियों में यह मांग शुल्क और स्वीकृत भार से अधिक होने पर अतिरिक्त-मांग दंड निर्धारित करती है। स्वीकृत भार पर बिल के लिए खाली छोड़ें।',
    // Net metering
    'small.netMetering': 'ऊपर दर्ज यूनिट आपकी ग्रिड से <strong>आयात</strong> हैं। शुद्ध बिल = आयात − निर्यात − प्रारंभिक क्रेडिट; अतिरिक्त निर्यात अगले माह के लिए क्रेडिट के रूप में संग्रहीत होता है।',
    // LPSC
    'small.lpscApplicable': 'दर व विलंब माह बकाया टैब में निर्धारित होते हैं। यदि इस उपभोक्ता / अवधि पर विलंब-भुगतान अधिभार लागू नहीं है तो अनचेक करें।',
    'small.arrearLpsc': 'पिछले बकाया पर LPSC राशि, जैसा आपके पिछले बिल में दिखाया गया।',
    'small.lpscRate': 'SERC आदेश के अनुसार विलंब भुगतान अधिभार। सामान्यतः 1.5%।',
    'small.lpscMonths': 'वर्तमान बिल के भुगतान में विलंब (माह)। LPSC वर्तमान शुद्ध राशि पर लागू।',
    // TOD
    'label.todPeak': 'पीक यूनिट <span class="tod-badge tod-badge-peak tod-badge-sm">+20%</span>',
    'label.todNormal': 'सामान्य यूनिट',
    'label.todOffPeak': 'ऑफ-पीक यूनिट <span class="tod-badge tod-badge-offpeak tod-badge-sm">−20%</span>',
    'small.todPeak': 'सुबह 6–10 व शाम 6–10',
    'small.todNormal': 'सुबह 10 – शाम 6 (आधार दर)',
    'small.todOffPeak': 'रात 10 – सुबह 6',
    // Billing period / totals display labels
    'lbl.billingPeriod': 'बिलिंग अवधि:',
    'lbl.days': 'दिन',
    'lbl.months': 'माह',
    'lbl.total': 'कुल:',
    'lbl.period': 'अवधि',
    'lbl.todTotal': 'TOD कुल:',
    'lbl.peak': 'पीक',
    'lbl.normal': 'सामान्य',
    'lbl.offPeak': 'ऑफ-पीक',
    // Bill placeholder
    'placeholder.title': 'आपका अनुमानित बिल यहाँ दिखाई देगा',
    'placeholder.sub': 'अपना डिस्कॉम चुनें, विवरण भरें, और क्लिक करें<br><strong>अनुमानित बिल गणना करें</strong>',
    // About
    'about.title': 'TheDiscomBill के बारे में',
    'about.p1': 'TheDiscomBill एक निःशुल्क, ब्राउज़र-आधारित बिजली बिल कैलकुलेटर है जो <strong>पूरे भारत की सभी वितरण कंपनियों (डिस्कॉम)</strong> को कवर करता है — कर्नाटक के BESCOM से लेकर महाराष्ट्र के MSEDCL, पंजाब के PSPCL, तमिलनाडु के TANGEDCO और कई अन्य तक। बस अपना राज्य चुनें, डिस्कॉम चुनें, उपभोक्ता श्रेणी चुनें, खपत यूनिट दर्ज करें, और पूर्ण स्लैब-वार विवरण के साथ तुरंत अनुमानित बिल पाएं।',
    'about.stat.states': 'राज्य व केंद्रशासित प्रदेश कवर',
    'about.stat.discoms': 'समर्थित डिस्कॉम',
    'about.stat.categories': 'उपभोक्ता श्रेणियाँ',
    'about.stat.free': 'कोई साइन-अप नहीं',
    'about.howTitle': 'यह कैसे काम करता है',
    'about.p2': 'कैलकुलेटर प्रत्येक डिस्कॉम के नवीनतम सार्वजनिक टैरिफ आदेशों का उपयोग करता है। यह <strong>टेलिस्कोपिक (संचयी) स्लैब विधि</strong> से शुल्क की गणना करता है: प्रत्येक स्लैब की दर केवल उसी स्लैब की यूनिट पर लागू होती है, पूरी खपत पर नहीं। फिक्स्ड / मांग शुल्क आपके स्वीकृत भार के आधार पर अलग से लगाए जाते हैं।',
    'about.p3': 'बिजली शुल्क (इलेक्ट्रिसिटी ड्यूटी), ईंधन समायोजन शुल्क और अन्य राज्य लेवी प्रत्येक डिस्कॉम के टैरिफ शेड्यूल के अनुसार लगाए जाते हैं।',
    'about.disclaimer': '<strong>⚠ अस्वीकरण:</strong> यह केवल संदर्भ और शैक्षिक उद्देश्यों हेतु एक <strong>अनुमानित बिल कैलकुलेटर</strong> है। यहाँ उपयोग की गई टैरिफ दरें अनुमानित हैं, सार्वजनिक टैरिफ आदेशों पर आधारित हैं, और नवीनतम संशोधनों या स्थानीय अधिभारों को नहीं दर्शा सकतीं। आपके डिस्कॉम का वास्तविक बिल भिन्न हो सकता है। सटीक और आधिकारिक बिलिंग जानकारी के लिए हमेशा अपने डिस्कॉम से संपर्क करें या उनकी आधिकारिक वेबसाइट देखें। TheDiscomBill किसी भी बिजली कंपनी या सरकारी संस्था से संबद्ध नहीं है।',
    // Breadcrumb (shared)
    'bc.home': 'होम',
    // DISCOM Services page (/services/)
    'svc.h2': 'डिस्कॉम सेवाएँ',
    'svc.intro': 'अपने बिजली प्रदाता से जुड़ी हर सेवा एक ही जगह। कोई सेवा चुनें, अपना राज्य व डिस्कॉम चुनें, और हम आपको सीधे उसके <strong>आधिकारिक पोर्टल</strong> तक ले जाएँगे — साथ ही 24×7 पावर हेल्पलाइन।',
    'svc.tab.pay': 'बिल भुगतान',
    'svc.tab.new': 'नया कनेक्शन',
    'svc.tab.complaint': 'शिकायत',
    'svc.tab.helplines': 'हेल्पलाइन',
    'svc.lead.pay': 'अपना राज्य व बिजली प्रदाता चुनें — हम आपको सीधे उसके <strong>आधिकारिक बिल-भुगतान पोर्टल</strong> तक ले जाएँगे, जहाँ आप प्रामाणिक स्रोत पर अपना बिल देख, डाउनलोड व भुगतान कर सकते हैं।',
    'svc.lead.new': 'नए कनेक्शन के लिए आवेदन कर रहे हैं? अपने राज्य व डिस्कॉम को चुनकर उसके <strong>आधिकारिक पोर्टल</strong> पर आवेदन करें, और नीचे सामान्य प्रक्रिया, दस्तावेज़ व शुल्क देखें।',
    'svc.lead.complaint': 'बिजली कटौती, गलत बिल या खराब मीटर की समस्या? अपने डिस्कॉम को चुनकर उसके <strong>आधिकारिक पोर्टल</strong> पर शिकायत दर्ज करें — या <strong>हेल्पलाइन</strong> टैब पर 24×7 हेल्पलाइन पर कॉल करें।',
    'svc.lead.helplines': 'ऐसे नंबर व शिकायत बढ़ाने का क्रम जो हर राज्य में, आपके डिस्कॉम की परवाह किए बिना काम करते हैं।',
    'svc.label.state': 'राज्य / केंद्रशासित',
    'svc.label.discom': 'आपका डिस्कॉम',
    'svc.helpline.label': '24×7 राष्ट्रीय पावर हेल्पलाइन',
    'svc.helpline.sub': 'बिजली कटौती व आपूर्ति शिकायत, किसी भी राज्य में',
    'svc.info.title': 'यदि आपकी शिकायत हल न हो',
    'svc.step1': '<strong>डिस्कॉम शिकायत पोर्टल / 1912</strong><span>पहले अपने डिस्कॉम में शिकायत दर्ज करें और शिकायत संख्या व निर्धारित समाधान समय नोट करें।</span>',
    'svc.step2': '<strong>उपभोक्ता शिकायत निवारण फोरम (CGRF)</strong><span>यदि समय पर हल न हो, तो अपने डिस्कॉम के CGRF तक शिकायत बढ़ाएँ — उपभोक्ता शिकायतों के लिए एक वैधानिक फोरम।</span>',
    'svc.step3': '<strong>विद्युत लोकपाल (Ombudsman)</strong><span>फिर भी हल नहीं हुआ? अपने राज्य विद्युत नियामक आयोग के विद्युत लोकपाल से संपर्क करें — अंतिम अपीलीय प्राधिकरण।</span>',
    'svc.chargeNote': '💡 हर चरण पर अपना उपभोक्ता / खाता संख्या और डिस्कॉम शिकायत संख्या साथ रखें।',
    'svc.note': 'TheDiscomBill स्वतंत्र है और किसी भी डिस्कॉम से संबद्ध नहीं है। हम केवल आधिकारिक पोर्टल व हेल्पलाइन से लिंक करते हैं — हम कभी आपका खाता संख्या, OTP या पासवर्ड नहीं माँगते। भुगतान से पहले अपने शुल्क का अनुमान लगाने के लिए <a href="/#calculator">बिल कैलकुलेटर</a> का उपयोग करें।',
    // Compare page (/compare/)
    'cmp.h2': 'टैरिफ तुलना (प्रमुख डिस्कॉम)',
    'cmp.intro': 'देखें कि प्रमुख बिजली प्रदाता एक सामान्य महीने के लिए <strong>1&nbsp;kW स्वीकृत भार</strong> पर एक-दूसरे की तुलना में कैसे हैं। वर्तमान वित्त वर्ष 2025-26 के टैरिफ के आधार पर गतिशील रूप से गणना।',
    'cmp.cc.title': 'किन्हीं दो डिस्कॉम की तुलना करें',
    'cmp.cc.sub': 'सिर्फ बड़े ही नहीं — किन्हीं दो प्रदाताओं को चुनें और पूर्ण विवरण के साथ समान आधार पर बिल अनुमान हेतु अपनी मासिक खपत दर्ज करें।',
    'cmp.cc.discomA': 'डिस्कॉम A',
    'cmp.cc.discomB': 'डिस्कॉम B',
    'cmp.cc.units': 'मासिक यूनिट (kWh)',
    'cmp.cc.load': 'भार (kW)',
    'cmp.cc.category': 'श्रेणी',
    'cmp.cat.domestic': 'घरेलू',
    'cmp.cat.commercial': 'व्यावसायिक',
    'cmp.cc.btn': 'तुलना करें',
    'cmp.cc.subsidy': 'सरकारी सब्सिडी शामिल करें (पात्र घरेलू कनेक्शन)',
    'cmp.cc.note': 'सब्सिडी पात्र <strong>घरेलू</strong> कनेक्शनों पर लागू होती है। वर्तमान में मॉडल किया गया: <strong>दिल्ली</strong> (GNCTD — पहली 200 यूनिट निःशुल्क, 400 तक 50% छूट)। अन्य राज्यों की सब्सिडी (जैसे पंजाब, कर्नाटक) आपके वास्तविक बिल को और कम कर सकती है।',
    'cmp.th.discom': 'डिस्कॉम / राज्य',
    'cmp.th.u200': '200 यूनिट',
    'cmp.th.u400': '400 यूनिट',
    'cmp.th.u600': '600 यूनिट',
    'cmp.th.u1000': '1000 यूनिट',
    'cmp.note1.title': 'प्रत्येक आँकड़े में क्या शामिल है',
    'cmp.note1.body': 'आँकड़े एकल-फेज कनेक्शन के लिए मानक शहरी टैरिफ पर अनुमानित <strong>कुल मासिक बिल</strong> हैं — ऊर्जा + फिक्स्ड/मांग शुल्क + FPPA (जहाँ लागू) — कैलकुलेटर के समान इंजन से गणना और वास्तविक बिलों के विरुद्ध सत्यापित (<a href="/methodology/">हमारी कार्यप्रणाली देखें</a>)। सभी खपत स्तरों पर एक निश्चित <strong>1&nbsp;kW स्वीकृत भार</strong> माना गया है।',
    'cmp.note2.title': 'सब्सिडी व अपवाद',
    'cmp.note2.body': 'पात्र <strong>घरेलू सरकारी सब्सिडी</strong> वहाँ लागू की जाती है जहाँ मॉडल की गई है — <strong>दिल्ली</strong> (GNCTD), <strong>पंजाब</strong>, <strong>कर्नाटक</strong>, <strong>तेलंगाना</strong> व <strong>तमिलनाडु</strong> — पात्र यूनिटों पर निःशुल्क ऊर्जा के रूप में। जिन राज्यों की कोई सूचीबद्ध योजना नहीं है, वे यहाँ सब्सिडीकृत नहीं हैं और कम बिल कर सकते हैं। नेट-मीटरिंग व विलंब-भुगतान अधिभार शामिल नहीं हैं।',
    'cmp.note3.title': 'तालिका कैसे पढ़ें',
    'cmp.note3.body': '<span class="comp-best" style="padding:1px 6px;border-radius:5px">हरा</span> सेल प्रत्येक खपत स्तर पर सबसे सस्ते डिस्कॉम को दर्शाता है। हमेशा अपने वास्तविक बिल से मिलान करें — टैरिफ उप-श्रेणी, स्लैब व शहर के अनुसार भिन्न होते हैं।',
    // Methodology page (/methodology/)
    'meth.crumb': 'कार्यप्रणाली',
    'meth.h1': 'कार्यप्रणाली व सटीकता',
    'meth.lead': 'हमारे <a href="/#calculator">कैलकुलेटर</a> में दिखने वाला हर आँकड़ा एक प्रकाशित टैरिफ आदेश से जुड़ा है — और हम परिणाम को वास्तविक उपभोक्ता बिलों के विरुद्ध जाँचते हैं। यह पृष्ठ बताता है कि आँकड़े कहाँ से आते हैं, कोई टैरिफ आदेश गणना कैसे बनता है, हम उसे कैसे सत्यापित करते हैं, और — उतना ही महत्वपूर्ण — हम अभी क्या <em>मॉडल नहीं</em> करते।',
    'meth.s1.h2': '1. आँकड़े कहाँ से आते हैं',
    'meth.s1.p1': 'इस टूल में कहीं भी कोई "सामान्य" या मनगढ़ंत दर नहीं है। हर स्लैब दर, फिक्स्ड शुल्क, शुल्क व अधिभार किसी प्राथमिक स्रोत से लिया गया है:',
    'meth.s1.ul': '<li><strong>SERC टैरिफ आदेश</strong> — प्रत्येक राज्य विद्युत नियामक आयोग द्वारा जारी वार्षिक (या बहु-वर्षीय) टैरिफ आदेश, जो वह कानूनी दस्तावेज़ है जो निर्धारित करता है कि कोई डिस्कॉम क्या शुल्क ले सकता है।</li><li><strong>डिस्कॉम टैरिफ शेड्यूल व FPPA परिपत्र</strong> — दर-सूची और मासिक/त्रैमासिक ईंधन-अधिभार (FPPA/FPPCA/FAC) अधिसूचनाएँ जो डिस्कॉम इन आदेशों के अंतर्गत प्रकाशित करते हैं।</li><li><strong>वास्तविक उपभोक्ता बिल</strong> — असली मुद्रित बिल, जिनका उपयोग यह पुष्टि करने के लिए भी होता है कि व्यवहार में आदेश कैसे लागू होता है और हमारे परिणाम को सत्यापित करने के लिए भी (खंड 3 देखें)।</li>',
    'meth.s1.p2': 'जब कोई नया आदेश या FPPA परिपत्र प्रकाशित होता है, तो टूल की संबंधित दरें उससे मिलान हेतु अद्यतन की जाती हैं। वर्तमान टैरिफ आँकड़े <strong>2025-26</strong> के आदेशों को दर्शाते हैं, तथा FPPA जुलाई 2026 के लिए अद्यतन है।',
    'meth.s2.h2': '2. कोई टैरिफ आदेश गणना कैसे बनता है',
    'meth.s2.p1': 'टैरिफ आदेश गद्य व तालिकाएँ हैं; बिल एक निश्चित क्रम में लागू अंकगणित है। हमारा इंजन उस अंकगणित को अनुमान लगाने के बजाय ठीक वैसे ही एनकोड करता है जैसा आदेश निर्दिष्ट करता है:',
    'meth.s2.ul': '<li><strong>टेलिस्कोपिक स्लैब</strong> — प्रत्येक स्लैब दर केवल उन्हीं यूनिटों पर लागू होती है जो उसकी सीमा में आती हैं, इसलिए कोई उच्च दर आपकी पूरी खपत पर कभी लागू नहीं होती (देखें <a href="/glossary/#telescopic-slabs">टेलिस्कोपिक स्लैब</a>)। गैर-टेलिस्कोपिक "स्लैब-लाभ-हानि" टैरिफ वहाँ मॉडल किए जाते हैं जहाँ कोई डिस्कॉम उनका उपयोग करता है।</li><li><strong>फिक्स्ड / मांग शुल्क</strong> — श्रेणी के अनुसार प्रति kW स्वीकृत भार, प्रति kVA मांग, या एक निश्चित राशि के रूप में बिल किया जाता है। मांग-बिल श्रेणियों के लिए <a href="/glossary/#maximum-demand">बिल की गई मांग</a> और स्वीकृत/अनुबंध सीमा से अधिक होने पर कोई भी अतिरिक्त-मांग जुर्माना गणना किया जाता है।</li><li><strong>FPPA (ईंधन अधिभार)</strong> — आदेश जिस विधि को निर्दिष्ट करता है उसी से लागू: एक निश्चित <em>प्रति-यूनिट</em> पैसा राशि, या आपूर्ति व मांग शुल्क का <em>प्रतिशत</em> (जैसा UP MYT विनियम 2025 के अंतर्गत)। यह ऋणात्मक क्रेडिट हो सकता है।</li><li><strong>बिजली शुल्क व उद्ग्रहण</strong> — राज्य शुल्क सही आधार पर और सही क्रम में लगाया जाता है (यह ऊर्जा/ईंधन घटक पर लगता है, स्वयं पर नहीं), क्योंकि क्रम अंतिम आँकड़े को बदल देता है।</li><li><strong>kVAh बिलिंग</strong> — जहाँ मीटर व टैरिफ आभासी ऊर्जा का उपयोग करते हैं, ऊर्जा <a href="/glossary/#kvah">kVAh</a> में और मांग kVA में मापी जाती है, इसलिए कम <a href="/glossary/#power-factor">पावर फैक्टर</a> अलग जुर्माने के बजाय सीधे बिल बढ़ा देता है।</li><li><strong>टाइम-ऑफ-डे, सब्सिडी, नेट मीटरिंग, LPSC व बकाया</strong> — पीक/ऑफ-पीक ब्लॉक, पात्र सरकारी सब्सिडी, रूफटॉप-सोलर नेट आयात, और विलंब-भुगतान अधिभार प्रत्येक वहाँ लागू होते हैं जहाँ वे लागू होते हैं।</li>',
    'meth.s3.h2': '3. वास्तविक बिलों के विरुद्ध सत्यापित — पैसे तक',
    'meth.s3.p1': 'किसी बिलिंग इंजन की सबसे मजबूत परीक्षा यह नहीं है कि वह सही दिखता है या नहीं, बल्कि यह है कि वह किसी वास्तविक बिल को पंक्ति-दर-पंक्ति पुन: उत्पन्न करता है या नहीं। यह करता है। हमारा इंजन उन श्रेणियों के लिए वास्तविक <strong>MVVNL (मध्यांचल विद्युत वितरण निगम, एक UPPCL डिस्कॉम) बिलों को पैसे तक</strong> पुन: उत्पन्न करता है जिन्हें हमने मुद्रित बिलों के विरुद्ध परखा है, जिनमें शामिल हैं:',
    'meth.s3.ul': '<li><strong>LMV-1 घरेलू</strong> व छोटे-उपभोक्ता बिल — ऊर्जा, फिक्स्ड शुल्क, ईंधन अधिभार व बिजली शुल्क सभी मुद्रित कुल से मेल खाते हैं।</li><li><strong>LMV-17 / LMV-20</strong> गैर-घरेलू व बड़े कनेक्शन, जिनमें मांग-आधारित व प्रतिशत-FPPA अंकगणित शामिल है।</li>',
    'meth.s3.p2': 'जब कोई वास्तविक बिल और हमारा इंजन असहमत होते हैं, तो हम इसे टैरिफ आदेश की हमारी एनकोडिंग में बग मानते हैं और तर्क को ठीक करते हैं — न कि एक स्वीकार्य राउंडिंग अंतर के रूप में।',
    'meth.s4.h2': '4. हम क्या मॉडल करते हैं — और अभी क्या नहीं',
    'meth.s4.p1': 'किनारों के बारे में स्पष्ट रहना सटीकता का हिस्सा है। टूल क्या अच्छी तरह मॉडल करता है:',
    'meth.s4.ul1': '<li>टेलिस्कोपिक व गैर-टेलिस्कोपिक ऊर्जा स्लैब, फिक्स्ड/मांग शुल्क, अतिरिक्त-मांग जुर्माना।</li><li>प्रति-यूनिट व प्रतिशत दोनों विधियों से FPPA, बिजली शुल्क, व सामान्य राज्य उद्ग्रहण।</li><li>kVAh आभासी-ऊर्जा बिलिंग व पावर-फैक्टर प्रभाव।</li><li>टाइम-ऑफ-डे पीक/ऑफ-पीक बिलिंग व रूफटॉप-सोलर नेट मीटरिंग।</li><li>उन राज्यों के लिए पात्र घरेलू सरकारी सब्सिडी जो इन्हें चलाते हैं — दिल्ली (GNCTD), पंजाब, कर्नाटक (गृह ज्योति), तेलंगाना व तमिलनाडु — जब आप चुनते हैं तो घरेलू श्रेणी पर लागू।</li>',
    'meth.s4.p2': 'हम अभी <strong>पूरी तरह</strong> क्या मॉडल नहीं करते, और जहाँ वास्तविक बिल भिन्न हो सकता है:',
    'meth.s4.ul2': '<li><strong>कुछ श्रेणी-विशिष्ट न्यूनतम शुल्क</strong> — उदाहरण के लिए LMV-2 न्यूनतम मासिक शुल्क एक ज्ञात कमी है जिसे हमने अभी ठीक-ठीक पुन: उत्पन्न नहीं किया है।</li><li><strong>सब्सिडी की बारीकियाँ</strong> — हम प्रत्येक सब्सिडी को पात्र यूनिटों पर निःशुल्क ऊर्जा के रूप में संरक्षी ढंग से मॉडल करते हैं (फिक्स्ड शुल्क, FPPA व शुल्क फिर भी लागू) और कर्नाटक/तेलंगाना की सीमा को ठीक औसत-खपत सूत्र के बजाय एक निश्चित 200 यूनिट मानते हैं। जिन राज्यों की कोई सूचीबद्ध योजना नहीं है, वहाँ कोई सब्सिडी लागू नहीं होती, इसलिए वहाँ वास्तविक बिल कम हो सकता है।</li><li><strong>बहु-डिस्कॉम तुलना तालिका में नेट मीटरिंग व विलंब-भुगतान अधिभार</strong> — समान आधार पर तुलना के लिए इन्हें वहाँ छोड़ा गया है, हालाँकि मुख्य कैलकुलेटर इनका समर्थन करता है।</li>',
    'meth.s4.p3': 'हर परिणाम एक <strong>अनुमानित आकलन</strong> है। टैरिफ उप-श्रेणी, स्लैब, शहर व स्वीकृति के अनुसार भिन्न होते हैं, इसलिए हम हमेशा आपके मुद्रित बिल से मिलान करने की सलाह देते हैं।',
    'meth.s5.h2': '5. इसे कितनी बार अद्यतन किया जाता है',
    'meth.s5.p1': 'नए टैरिफ आदेश व FPPA परिपत्र प्रकाशित होने पर दरें ताज़ा की जाती हैं — आधार टैरिफ के लिए आम तौर पर साल में एक बार (प्रत्येक SERC के आदेश के अनुसार) और ईंधन अधिभार के लिए अधिक बार, जो मासिक या त्रैमासिक बदलता है। वास्तविक बिलों के माध्यम से उठाए गए सुधार अंतर्निहित टैरिफ डेटा पर लागू होते हैं, इसलिए एक उपभोक्ता के लिए किया गया सुधार उस टैरिफ पर सभी के लिए आकलन बेहतर करता है।',
    'meth.s6.h2': '6. स्वतंत्रता',
    'meth.s6.p1': 'TheDiscomBill <strong>स्वतंत्र</strong> है और किसी भी डिस्कॉम, SERC या सरकारी संस्था से संबद्ध नहीं है। हमारा आकलन मार्गदर्शन है, कोई कानूनी निर्णय या आधिकारिक बिल नहीं। औपचारिक विवाद के लिए अपने डिस्कॉम के शिकायत फोरम का उपयोग करें; किसी विशिष्ट बिल की मानवीय समीक्षा के लिए हमारी <a href="/bill-review/">विशेषज्ञ बिल समीक्षा</a> सेवा सहायता कर सकती है।',
    'meth.s7.h2': 'इसे काम करते देखें',
    'meth.card1': '<strong>बिल कैलकुलेटर</strong><span>मदवार, स्लैब-वार आकलन के लिए अपनी यूनिट व भार दर्ज करें</span>',
    'meth.card2': '<strong>राज्य अनुसार टैरिफ</strong><span>हर आकलन के पीछे की सटीक स्लैब दरें, फिक्स्ड शुल्क व FPPA</span>',
    'meth.card3': '<strong>बिल शब्दावली</strong><span>हर शुल्क पंक्ति व कोड की सरल-भाषा परिभाषाएँ</span>',
    'meth.disclaimer': 'आँकड़े प्रकाशित टैरिफ आदेशों से गणना किए गए और नमूना बिलों के विरुद्ध सत्यापित अनुमानित आकलन हैं; किसी भी शुल्क का सटीक उपचार राज्य, डिस्कॉम व उपभोक्ता श्रेणी के अनुसार भिन्न होता है। हमेशा अपने डिस्कॉम के टैरिफ आदेश या मुद्रित बिल से मिलान करें।',
    // Glossary page framing (/glossary/) — the 14 term definitions stay in English (technical reference)
    'gloss.crumb': 'शब्दावली',
    'gloss.h1': 'बिजली बिल शब्दावली',
    'gloss.lead': 'भारतीय बिजली बिल की हर शुल्क पंक्ति व कोड, सरल भाषा में परिभाषित। ये वही शब्द हैं जो हमारे <a href="/#calculator">बिल कैलकुलेटर</a> व <a href="/tariffs/states/">टैरिफ पृष्ठों</a> के पीछे हैं — <a href="#fppa">FPPA</a> व <a href="#electricity-duty">बिजली शुल्क</a> से लेकर <a href="#telescopic-slabs">टेलिस्कोपिक स्लैब</a> व <a href="#kvah">kVAh</a> तक।',
    'gloss.aka': 'इन नामों से भी:',
    'gloss.backToTop': '↑ सभी शब्दों पर वापस',
    'gloss.work.h2': 'इन शब्दों को काम में लाएँ',
    'gloss.card1': '<strong>बिल कैलकुलेटर</strong><span>मदवार आकलन के लिए इन शुल्कों को अपनी यूनिट व भार पर लागू करें</span>',
    'gloss.card2': '<strong>बिल गाइड</strong><span>विस्तृत मार्गदर्शिका: अपना बिल पढ़ना, बिल क्यों बढ़ते हैं, टाइम-ऑफ-डे बिलिंग</span>',
    'gloss.card3': '<strong>राज्य अनुसार टैरिफ</strong><span>हर डिस्कॉम की लाइव स्लैब दरें, फिक्स्ड शुल्क व FPPA</span>',
    'gloss.disclaimer': 'सामान्य भारतीय टैरिफ व्यवहार पर आधारित सामान्य परिभाषाएँ; किसी भी शुल्क का सटीक उपचार राज्य, डिस्कॉम व उपभोक्ता श्रेणी के अनुसार भिन्न होता है। अपने डिस्कॉम के टैरिफ आदेश या मुद्रित बिल से मिलान करें।',
    // Footer
    'footer.l1': '&copy; 2026 TheDiscomBill &nbsp;·&nbsp; भारत के लिए निःशुल्क बिजली बिल कैलकुलेटर',
    'footer.l2': 'टैरिफ डेटा अनुमानित है और सार्वजनिक रूप से उपलब्ध जानकारी (2025-26) पर आधारित है। किसी भी डिस्कॉम, SERC या सरकारी संस्था से संबद्ध नहीं। &nbsp;|&nbsp; <a href="#about">अस्वीकरण</a>',
  },
  mr: {
    // Header / nav
    'tagline': 'वीज बिल कॅल्क्युलेटर · संपूर्ण भारतासाठी',
    'nav.calculator': 'कॅल्क्युलेटर',
    'nav.compare': 'तुलना',
    'nav.about': 'आमच्याबद्दल',
    // Quick Links dropdown (shared chrome on every page)
    'nav.quickLinks': 'क्विक लिंक्स',
    'ql.tools': 'टूल्स',
    'ql.tariffs': 'टॅरिफ',
    'ql.services': 'सेवा',
    'ql.learn': 'जाणून घ्या',
    'ql.compare': 'डिस्कॉम टॅरिफ तुलना',
    'ql.usage': 'वापर अंदाजक',
    'ql.solar': 'रूफटॉप सोलर बचत',
    'ql.tariffsByState': 'राज्य व डिस्कॉमनुसार टॅरिफ',
    'ql.discomServices': 'डिस्कॉम सेवा',
    'ql.smartMeter': 'स्मार्ट मीटर रिचार्ज',
    'ql.billReviewGroup': 'तुमचे बिल तपासून घ्या',
    'ql.ocrCheck': 'झटपट स्व-तपासणी (OCR)',
    'ql.billReview': 'तज्ज्ञांकडून',
    'ql.guides': 'वीज बिल मार्गदर्शक',
    'ql.glossary': 'वीज बिल शब्दकोश',
    'ql.methodology': 'कार्यपद्धती व अचूकता',
    // Shared footer links (generated pages + key pages)
    'footer.rights': '© 2026 TheDiscomBill. सर्व हक्क राखीव.',
    'footer.disclaimer': 'अस्वीकरण',
    'footer.methodology': 'कार्यपद्धती',
    'footer.allStates': 'सर्व राज्ये व डिस्कॉम',
    'footer.glossary': 'बिल शब्दकोश',
    // Hero
    'hero.badge': 'मोफत · सर्व डिस्कॉम · त्वरित अंदाज',
    'hero.title': 'भारतातील प्रत्येक डिस्कॉमसाठी वीज बिल कॅल्क्युलेटर',
    'hero.sub': 'कोणत्याही राज्याच्या वीज कंपनीसाठी स्लॅबनिहाय तपशीलासह त्वरित अंदाजित बिल मिळवा.',
    'hero.cta': 'माझे बिल काढा',
    'hero.cta2': 'माझे बिल तपासून घ्या',
    'review.title': 'तुमचे बिल कसे तपासायचे?',
    'review.ocr': 'झटपट स्व-तपासणी (OCR)',
    'review.ocrSub': 'बिलाचा फोटो/PDF अपलोड करा — कॅल्क्युलेटर आपोआप भरेल',
    'review.expert': 'तज्ज्ञांकडून',
    'review.expertSub': 'अपलोड केलेल्या बिलाची मोफत तज्ज्ञ तपासणी',
    'hero.stat.states': 'राज्ये व केंद्रशासित',
    'hero.stat.discoms': 'डिस्कॉम',
    'hero.stat.categories': 'श्रेणी',
    'hero.feat.slab': 'स्लॅबनिहाय ऊर्जा शुल्क',
    'hero.feat.fppa': 'फिक्स्ड व इंधन अधिभार (FPPA)',
    'hero.feat.solar': 'सोलर नेट मीटरिंग',
    'hero.feat.tod': 'टाइम-ऑफ-डे व kVAh बिलिंग',
    'hero.feat.demand': 'जादा मागणी दंड',
    'hero.feat.duty': 'वीज शुल्क व राज्य कर',
    'hero.discoms.label': '35+ राज्ये व केंद्रशासित प्रदेशांतील 70+ डिस्कॉमचे टॅरिफ — यांसह',
    'hero.trust': 'सार्वजनिक टॅरिफ आदेशांवर आधारित · आर्थिक वर्ष 2025-26 साठी अद्ययावत',
    // Calculator form
    'calc.title': 'बिल कॅल्क्युलेटर',
    'label.state': 'राज्य / केंद्रशासित प्रदेश',
    'label.discom': 'वीज कंपनी (डिस्कॉम)',
    'label.category': 'ग्राहक श्रेणी',
    'label.supplyType': 'पुरवठा प्रकार / क्षेत्र',
    'label.consumerName': 'ग्राहकाचे नाव',
    'label.accountNo': 'खाते / ग्राहक क्रमांक',
    'label.address': 'पत्ता',
    'label.billingMonth': 'बिलिंग महिना व वर्ष',
    'label.billingBasis': 'बिलिंग आधार (ऊर्जा व मागणी)',
    'label.fromDate': 'प्रारंभ दिनांक',
    'label.toDate': 'अंतिम दिनांक',
    'small.fromDate': 'बिलिंग कालावधीची सुरुवात',
    'small.toDate': 'बिलिंग कालावधीचा शेवट',
    'label.sanctioned': 'मंजूर भार (kW)',
    'small.sanctioned': 'करारित / मंजूर भार. फिक्स्ड शुल्क व जादा मागणी तपासणीसाठी वापरला जातो.',
    'small.fppa': 'इंधन व वीज खरेदी समायोजन. ₹/युनिट = (प्रत्यक्ष − आधार वीज खर्च) × युनिट, किंवा पुरवठा+मागणी शुल्काचा % (UP MYT 2025). स्वतः भरण्यासाठी वर अनचेक करा (किंवा मूल्य टाका). ऋण (क्रेडिट) असू शकतो.',
    // Tabs
    'tab.meterread': 'मीटर रीडिंग',
    'tab.arrear': 'थकबाकी',
    'tab.payment': 'भरणा',
    'tab.adjustment': 'समायोजन',
    'mode.meterReading': 'मीटर रीडिंग',
    'mode.tod': 'टीओडी',
    'label.billedAmount': 'तुमच्या डिस्कॉम बिलावरील रक्कम (₹) — ऐच्छिक',
    'small.billedAmount': 'आम्ही ती आमच्या गणनेशी पडताळून तुमचे बिल बरोबर वाटते का ते सांगू.',

    // Solar calculator (/solar/)
    'sol.title': 'रूफटॉप सोलर बचत कॅल्क्युलेटर',
    'sol.intro': 'रूफटॉप सोलर यंत्रणेचा खर्च किती येईल आणि ती किती बचत देईल ते पाहा — <strong>PM सूर्य घर</strong> केंद्रीय अनुदानासह. सिस्टम आकार, अनुदानानंतरची निव्वळ किंमत, मासिक बचत व परतफेड कालावधी जाणून घेण्यासाठी तुमची मासिक युनिट व छताचे क्षेत्रफळ टाका.',
    'sol.chip1': '₹78,000 पर्यंत केंद्रीय अनुदान',
    'sol.chip2': '25 वर्षे पॅनेल आयुष्य',
    'sol.chip3': 'मोफत · साइन-अप नाही',
    'sol.monthly': 'सरासरी मासिक वापर (युनिट)',
    'sol.phMonthly': 'उदा. 350',
    'sol.or': 'किंवा, फक्त बिलाची रक्कम माहीत असल्यास',
    'sol.billAmt': 'मासिक बिल रक्कम (₹)',
    'sol.phBillAmt': 'उदा. 2450',
    'sol.billAmtHint': 'खालील टॅरिफनुसार आम्ही ती युनिटमध्ये रूपांतरित करू.',
    'sol.chartTitle': '25 वर्षांतील तुमची बचत',
    'sol.share': 'हा अंदाज WhatsApp वर शेअर करा',
    'sol.subNone': 'माहीत नाही / राज्य टॉप-अप नाही (₹0)',
    'sol.subUP': 'उत्तर प्रदेश — ₹15,000/kW (कमाल ₹30,000)',
    'sol.subAS': 'आसाम — ₹15,000/kW (कमाल ₹45,000)',
    'sol.subCustom': 'स्वतःची रक्कम…',
    'sol.pull': 'माझा अंदाज वापरा',
    'sol.roof': 'सावलीमुक्त छत क्षेत्र (चौ. फूट)',
    'sol.phRoof': 'उदा. 300',
    'sol.roofHint': 'प्रति 1 kW साठी सुमारे 100 चौ. फूट मोकळे छत लागते.',
    'sol.rate': 'टॅरिफ (₹/युनिट)',
    'sol.stateSub': 'राज्य अनुदान (₹)',
    'sol.advanced': 'प्रगत',
    'sol.cost': 'सिस्टम किंमत (₹ प्रति kW)',
    'sol.costHint': 'अनुदानापूर्वीची टर्नकी उभारणी किंमत. साधारण ₹50,000–65,000/kW.',
    'sol.empty': 'तुमचा सोलर अंदाज पाहण्यासाठी मासिक युनिट किंवा छताचे क्षेत्रफळ टाका.',
    'sol.heroLabel': 'शिफारस केलेला सिस्टम आकार',
    'sol.paysFor': 'खर्च वसूल होईल',
    'sol.gen': 'अंदाजित वीजनिर्मिती',
    'sol.grossCost': 'सिस्टम किंमत (अनुदानापूर्वी)',
    'sol.centralSub': 'PM सूर्य घर केंद्रीय अनुदान',
    'sol.stateSub2': 'राज्य अनुदान',
    'sol.netCost': 'तुमची निव्वळ किंमत',
    'sol.monthlySave': 'मासिक बचत',
    'sol.lifetime': '25 वर्षांतील निव्वळ बचत',
    'sol.co2': 'CO₂ बचत',
    'sol.note': 'अंदाज भारताच्या सरासरी निर्मितीवर (~4 युनिट प्रति kW प्रति दिवस) आणि PM सूर्य घर निवासी केंद्रीय अनुदानावर (2 kW पर्यंत ₹30,000/kW, तिसऱ्या kW वर ₹18,000, कमाल ₹78,000) आधारित आहेत. प्रत्यक्ष निर्मिती, किंमत व राज्य अनुदान हे ठिकाण, छताची दिशा, सावली आणि तुमच्या डिस्कॉमच्या नेट-मीटरिंग धोरणावर अवलंबून असते. याला नियोजन-मार्गदर्शक माना आणि <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer">राष्ट्रीय पोर्टलवर ↗</a> नोंदणीकृत विक्रेत्याकडून कोटेशन घ्या.',

    // Usage estimator (/usage/)
    'est.title': 'वीज वापर अंदाजक',
    'est.intro': 'तुमची उपकरणे जोडा, किती आहेत व दररोज किती तास चालतात ते सांगा. आम्ही तुमची <strong>मासिक युनिट (kWh)</strong> व अंदाजे खर्च लगेच दाखवू.',
    'est.chip1': '19 सामान्य उपकरणे',
    'est.chip2': 'लाइव्ह kWh व ₹ अंदाज',
    'est.chip3': 'मोफत · साइन-अप नाही',
    'est.season': 'ऋतू',
    'est.summer': 'उन्हाळा',
    'est.monsoon': 'पावसाळा',
    'est.winter': 'हिवाळा',
    'est.colAppliance': 'उपकरण',
    'est.colWatts': 'वॅट',
    'est.colQty': 'संख्या',
    'est.colHrs': 'तास/दिवस',
    'est.colKwh': 'kWh/महिना',
    'est.emptyRows': 'अजून एकही उपकरण नाही — सुरू करण्यासाठी वरील चिपवर टॅप करा.',
    'est.addCustom': '+ कस्टम उपकरण जोडा',
    'est.totalLabel': 'अंदाजित मासिक वापर',
    'est.perDay': 'kWh प्रति दिवस ·',
    'est.appliances': 'उपकरणे',
    'est.tariff': 'टॅरिफ',
    'est.perUnit': '/युनिट',
    'est.perMonth': ' / महिना',
    'est.calcExact': 'अचूक बिल काढा →',
    'est.handoff': 'पूर्ण कॅल्क्युलेटरमध्ये तुमचे खरे डिस्कॉम स्लॅब, फिक्स्ड शुल्क व FPPA वापरा.',
    'est.solarLink': 'या वापरावर रूफटॉप सोलर किती बचत देईल ते पाहा →',
    'est.breakdownTitle': 'तुमची युनिट कुठे जातात',
    'est.note': 'अंदाज 30 दिवसांच्या महिन्यावर आधारित आहेत. रेफ्रिजरेटर व AC चे तास म्हणजे <em>प्रभावी</em> कॉम्प्रेसर चालण्याचा वेळ, घड्याळी तास नव्हे (फ्रिज चालू-बंद होत राहतो). प्रत्यक्ष वापर उपकरणाची कार्यक्षमता (स्टार रेटिंग), तापमान व वापरानुसार बदलतो. याला नियोजन-मार्गदर्शक माना, मग अचूक, टॅरिफनुसार रकमेसाठी <a href="/#calculator">बिल कॅल्क्युलेटर</a> वापरा.',

    // Buttons
    'btn.addMeter': '+ मीटर जोडा',
    'btn.calculate': '⚡ अंदाजित बिल काढा',
    'btn.sample': 'नमुना बिल पाहा',
    'btn.sampleHero': 'एका क्लिकमध्ये नमुना बिल पाहा',
    'mode.simple': '⚡ सोपे',
    'mode.detailed': 'सविस्तर',
    'mode.simpleHint': 'फक्त तुमचा डिस्कॉम व युनिट — बाकी आम्ही सांभाळतो.',
    'btn.compare': '⚖ डिस्कॉमची तुलना करा',
    'btn.addPayment': '+ भरणा जोडा',
    'btn.addAdjustment': '+ समायोजन जोडा',
    // Checkboxes / toggles
    'chk.fppaAuto': 'पडताळलेल्या सरकारी डेटामधून आपोआप भरा',
    'chk.netMetering': '<strong>रूफटॉप सोलर / नेट मीटरिंग</strong> — निव्वळ आयातीवर बिल',
    'label.exportUnits': 'निर्यात युनिट (kWh)',
    'label.openingCredit': 'सुरुवातीचे साठवलेले क्रेडिट (kWh)',
    'chk.lpsc': '<strong>LPSC लागू</strong> — चालू बिलावर विलंब-भरणा अधिभार लावा',
    'label.subsidy': 'सरकारी घरगुती अनुदान',
    'chk.applySubsidy': 'सरकारी अनुदान लागू करा',
    // Arrear / Payment / Adjustment
    'hint.arrear': 'मागील बिलात दाखवल्याप्रमाणेच रकमा भरा. मागील थकबाकीवरील LPSC ही थेट रक्कम आहे, गणना केलेली नाही.',
    'label.prevArrear': 'मागील थकबाकी (₹)',
    'label.prevArrearLpsc': 'मागील थकबाकी LPSC (₹)',
    'total.arrear': 'एकूण थकबाकी:',
    'hint.lpsc': 'LPSC मीटर रीडिंग टॅबवरील “LPSC लागू” टॉगलने सुरू होते. हे रकाने दर व चालू बिल किती महिने थकीत आहे ते ठरवतात.',
    'label.lpscRate': 'चालू बिल LPSC दर (% / महिना)',
    'label.lpscMonths': 'चालू बिल विलंब (महिने)',
    'hint.payment': 'या बिलिंग कालावधीत आधीच केलेले भरणे — हे एकूण देय रक्कम कमी करतात.',
    'total.payment': 'एकूण भरणा:',
    'hint.adjustment': 'कोणतेही किरकोळ क्रेडिट वा शुल्क — उदा. मीटर किंमत, अनामत परतावा, किंवा सवलत. क्रेडिटसाठी ऋण मूल्य वापरा.',
    'total.adjustment': 'एकूण समायोजन:',
    // Meter reading hint (advHint)
    'hint.advanced': 'प्रत्येक मीटरची मागील → चालू रीडिंग भरा (युनिट = (चालू − मागील) × MF). मध्य-चक्र बदलासाठी किंवा अनेक मीटरसाठी "+ मीटर जोडा" वापरा — त्यांची युनिट बेरीज होते.',
    // Input placeholders
    'ph.consumerName': 'उदा. राजेश कुमार',
    'ph.accountNo': 'ऐच्छिक',
    'ph.address': 'उदा. 12 मुख्य रस्ता, पुणे',
    'label.meterNo': 'मीटर क्रमांक',
    'ph.meterNo': 'ऐच्छिक',
    'ph.totalUnits': 'एकूण वापरलेली युनिट',
    'ph.meterLabel': 'मीटर क्रमांक (ऐच्छिक)',
    // Dropdown default options
    'opt.selectState': '— राज्य / UT निवडा —',
    'opt.selectStateFirst': '— आधी राज्य निवडा —',
    'opt.selectDiscomFirst': '— आधी डिस्कॉम निवडा —',
    // Billing Basis small
    'small.billingBasis': '<strong>kWh</strong>: मीटर रीडिंग kWh मध्ये, मागणी kW मध्ये. <strong>kVA आधारित</strong>: मीटर रीडिंग kVAh मध्ये (आभासी ऊर्जा) व मागणी kVA मध्ये — कमी पॉवर फॅक्टर थेट जास्त kVAh म्हणून दिसतो, वेगळा PF दंड नाही. kVA (HT/मोठ्या-LT) टॅरिफसाठी आपोआप निवडले जाते — गरजेनुसार बदला.',
    // Billed demand
    'label.billedDemand': 'कमाल मागणी (MD) (kW)',
    'small.billedDemand': 'या कालावधीत मीटरने नोंदवलेली सर्वोच्च मागणी. मागणी-आधारित (व्यावसायिक) श्रेणींत ती मागणी शुल्क ठरवते आणि मंजूर भारापेक्षा जास्त झाल्यास जादा-मागणी दंडही. मंजूर भारावर बिलासाठी रिकामे ठेवा.',
    // Net metering
    'small.netMetering': 'वर भरलेली युनिट म्हणजे तुमची ग्रिडमधून <strong>आयात</strong>. निव्वळ बिल = आयात − निर्यात − सुरुवातीचे क्रेडिट; शिल्लक निर्यात पुढील महिन्यासाठी क्रेडिट म्हणून साठवली जाते.',
    // LPSC
    'small.lpscApplicable': 'दर व विलंब-महिने थकबाकी टॅबमध्ये ठरतात. या ग्राहक / कालावधीस विलंब-भरणा अधिभार लागू नसेल तर अनचेक करा.',
    'small.arrearLpsc': 'मागील थकबाकीवरील LPSC रक्कम, तुमच्या मागील बिलात दाखवल्याप्रमाणे.',
    'small.lpscRate': 'SERC आदेशानुसार विलंब भरणा अधिभार. सहसा 1.5%.',
    'small.lpscMonths': 'चालू बिल भरण्यातील विलंब (महिने). LPSC चालू निव्वळ रकमेवर लागू.',
    // TOD
    'label.todPeak': 'पीक युनिट <span class="tod-badge tod-badge-peak tod-badge-sm">+20%</span>',
    'label.todNormal': 'सामान्य युनिट',
    'label.todOffPeak': 'ऑफ-पीक युनिट <span class="tod-badge tod-badge-offpeak tod-badge-sm">−20%</span>',
    'small.todPeak': 'सकाळी 6–10 व सायं. 6–10',
    'small.todNormal': 'सकाळी 10 – सायं. 6 (मूळ दर)',
    'small.todOffPeak': 'रात्री 10 – सकाळी 6',
    // Billing period / totals display labels
    'lbl.billingPeriod': 'बिलिंग कालावधी:',
    'lbl.days': 'दिवस',
    'lbl.months': 'महिने',
    'lbl.total': 'एकूण:',
    'lbl.period': 'कालावधी',
    'lbl.todTotal': 'TOD एकूण:',
    'lbl.peak': 'पीक',
    'lbl.normal': 'सामान्य',
    'lbl.offPeak': 'ऑफ-पीक',
    // Bill placeholder
    'placeholder.title': 'तुमचे अंदाजित बिल येथे दिसेल',
    'placeholder.sub': 'तुमचा डिस्कॉम निवडा, तपशील भरा आणि क्लिक करा<br><strong>अंदाजित बिल काढा</strong>',
    // About
    'about.title': 'TheDiscomBill विषयी',
    'about.p1': 'TheDiscomBill हा एक मोफत, ब्राउझर-आधारित वीज बिल कॅल्क्युलेटर आहे जो <strong>संपूर्ण भारतातील सर्व वितरण कंपन्या (डिस्कॉम)</strong> कव्हर करतो — कर्नाटकच्या BESCOM पासून महाराष्ट्राच्या MSEDCL, पंजाबच्या PSPCL, तमिळनाडूच्या TANGEDCO आणि आणखी अनेकांपर्यंत. फक्त तुमचे राज्य निवडा, डिस्कॉम निवडा, ग्राहक श्रेणी निवडा, वापरलेली युनिट टाका, आणि संपूर्ण स्लॅबनिहाय तपशीलासह त्वरित अंदाजित बिल मिळवा.',
    'about.stat.states': 'राज्ये व केंद्रशासित प्रदेश',
    'about.stat.discoms': 'समर्थित डिस्कॉम',
    'about.stat.categories': 'ग्राहक श्रेणी',
    'about.stat.free': 'साइन-अपची गरज नाही',
    'about.howTitle': 'हे कसे काम करते',
    'about.p2': 'कॅल्क्युलेटर प्रत्येक डिस्कॉमच्या ताज्या सार्वजनिक टॅरिफ आदेशांचा वापर करतो. तो <strong>टेलिस्कोपिक (संचयी) स्लॅब पद्धतीने</strong> शुल्क मोजतो: प्रत्येक स्लॅबचा दर फक्त त्या स्लॅबमधील युनिटवर लागू होतो, संपूर्ण वापरावर नाही. फिक्स्ड / मागणी शुल्क तुमच्या मंजूर भारानुसार वेगळे लावले जाते.',
    'about.p3': 'वीज शुल्क (इलेक्ट्रिसिटी ड्युटी), इंधन समायोजन शुल्क आणि इतर राज्य कर प्रत्येक डिस्कॉमच्या टॅरिफ वेळापत्रकानुसार लावले जातात.',
    'about.disclaimer': '<strong>⚠ अस्वीकरण:</strong> हा केवळ संदर्भ व शैक्षणिक हेतूंसाठीचा <strong>अंदाजित बिल कॅल्क्युलेटर</strong> आहे. येथे वापरलेले टॅरिफ दर अंदाजे असून सार्वजनिक टॅरिफ आदेशांवर आधारित आहेत; ते ताजे बदल किंवा स्थानिक अधिभार दर्शवत नसतील. तुमच्या डिस्कॉमचे प्रत्यक्ष बिल वेगळे असू शकते. अचूक व अधिकृत बिलिंग माहितीसाठी नेहमी तुमच्या डिस्कॉमशी संपर्क साधा किंवा त्यांची अधिकृत वेबसाइट पाहा. TheDiscomBill कोणत्याही वीज कंपनीशी वा सरकारी संस्थेशी संलग्न नाही.',
    // Breadcrumb (shared)
    'bc.home': 'मुख्यपृष्ठ',
    // DISCOM Services page (/services/)
    'svc.h2': 'डिस्कॉम सेवा',
    'svc.intro': 'तुमच्या वीज पुरवठादाराशी संबंधित प्रत्येक सेवा एकाच ठिकाणी. सेवा निवडा, तुमचे राज्य व डिस्कॉम निवडा, आणि आम्ही तुम्हाला थेट त्याच्या <strong>अधिकृत पोर्टलवर</strong> नेऊ — शिवाय 24×7 पॉवर हेल्पलाइनही.',
    'svc.tab.pay': 'बिल भरणा',
    'svc.tab.new': 'नवीन जोडणी',
    'svc.tab.complaint': 'तक्रार',
    'svc.tab.helplines': 'हेल्पलाइन',
    'svc.lead.pay': 'तुमचे राज्य व वीज पुरवठादार निवडा — आम्ही तुम्हाला थेट त्याच्या <strong>अधिकृत बिल-भरणा पोर्टलवर</strong> नेऊ, जिथे तुम्ही अस्सल स्रोतावर बिल पाहू, डाउनलोड व भरू शकता.',
    'svc.lead.new': 'नवीन जोडणीसाठी अर्ज करत आहात? तुमचे राज्य व डिस्कॉम निवडून त्याच्या <strong>अधिकृत पोर्टलवर</strong> अर्ज करा, आणि खाली नेहमीची प्रक्रिया, कागदपत्रे व शुल्क पाहा.',
    'svc.lead.complaint': 'वीजपुरवठा खंडित, चुकीचे बिल की बिघडलेला मीटर? तुमचा डिस्कॉम निवडून त्याच्या <strong>अधिकृत पोर्टलवर</strong> तक्रार नोंदवा — किंवा <strong>हेल्पलाइन</strong> टॅबवरील 24×7 हेल्पलाइनवर कॉल करा.',
    'svc.lead.helplines': 'असे क्रमांक व तक्रार वाढवण्याचा क्रम जे कोणत्याही राज्यात, तुमच्या डिस्कॉमची पर्वा न करता चालतात.',
    'svc.label.state': 'राज्य / केंद्रशासित',
    'svc.label.discom': 'तुमचा डिस्कॉम',
    'svc.helpline.label': '24×7 राष्ट्रीय पॉवर हेल्पलाइन',
    'svc.helpline.sub': 'वीजपुरवठा व खंडित पुरवठा तक्रारी, कोणत्याही राज्यात',
    'svc.info.title': 'तुमची तक्रार सुटली नाही तर',
    'svc.step1': '<strong>डिस्कॉम तक्रार पोर्टल / 1912</strong><span>प्रथम तुमच्या डिस्कॉमकडे तक्रार नोंदवा आणि तक्रार क्रमांक व सांगितलेला निवारण कालावधी नोंदवून ठेवा.</span>',
    'svc.step2': '<strong>ग्राहक तक्रार निवारण मंच (CGRF)</strong><span>वेळेत निवारण न झाल्यास तुमच्या डिस्कॉमच्या CGRF कडे तक्रार वाढवा — ग्राहक तक्रारींसाठीचा वैधानिक मंच.</span>',
    'svc.step3': '<strong>विद्युत लोकपाल (Ombudsman)</strong><span>तरीही सुटली नाही? तुमच्या राज्य विद्युत नियामक आयोगाच्या विद्युत लोकपालाकडे जा — अंतिम अपीलीय प्राधिकरण.</span>',
    'svc.chargeNote': '💡 प्रत्येक टप्प्यावर तुमचा ग्राहक / खाते क्रमांक आणि डिस्कॉम तक्रार क्रमांक जवळ ठेवा.',
    'svc.note': 'TheDiscomBill स्वतंत्र आहे आणि कोणत्याही डिस्कॉमशी संलग्न नाही. आम्ही फक्त अधिकृत पोर्टल व हेल्पलाइनशी लिंक करतो — आम्ही कधीही तुमचा खाते क्रमांक, OTP वा पासवर्ड मागत नाही. भरण्यापूर्वी शुल्काच्या अंदाजासाठी <a href="/#calculator">बिल कॅल्क्युलेटर</a> वापरा.',
    // Compare page (/compare/)
    'cmp.h2': 'टॅरिफ तुलना (प्रमुख डिस्कॉम)',
    'cmp.intro': 'प्रमुख वीज पुरवठादार एका सामान्य महिन्यासाठी <strong>1&nbsp;kW मंजूर भारावर</strong> एकमेकांच्या तुलनेत कसे आहेत ते पाहा. चालू आर्थिक वर्ष 2025-26 च्या टॅरिफवर आधारित गतिकरीत्या गणना.',
    'cmp.cc.title': 'कोणत्याही दोन डिस्कॉमची तुलना करा',
    'cmp.cc.sub': 'फक्त मोठेच नाही — कोणतेही दोन पुरवठादार निवडा आणि संपूर्ण तपशीलासह समान आधारावर बिल अंदाजासाठी तुमचा मासिक वापर टाका.',
    'cmp.cc.discomA': 'डिस्कॉम A',
    'cmp.cc.discomB': 'डिस्कॉम B',
    'cmp.cc.units': 'मासिक युनिट (kWh)',
    'cmp.cc.load': 'भार (kW)',
    'cmp.cc.category': 'श्रेणी',
    'cmp.cat.domestic': 'घरगुती',
    'cmp.cat.commercial': 'व्यावसायिक',
    'cmp.cc.btn': 'तुलना करा',
    'cmp.cc.subsidy': 'सरकारी अनुदान समाविष्ट करा (पात्र घरगुती जोडण्या)',
    'cmp.cc.note': 'अनुदान पात्र <strong>घरगुती</strong> जोडण्यांना लागू होते. सध्या मॉडेल केलेले: <strong>दिल्ली</strong> (GNCTD — पहिल्या 200 युनिट मोफत, 400 पर्यंत 50% सूट). इतर राज्यांची अनुदाने (उदा. पंजाब, कर्नाटक) तुमचे प्रत्यक्ष बिल आणखी कमी करू शकतात.',
    'cmp.th.discom': 'डिस्कॉम / राज्य',
    'cmp.th.u200': '200 युनिट',
    'cmp.th.u400': '400 युनिट',
    'cmp.th.u600': '600 युनिट',
    'cmp.th.u1000': '1000 युनिट',
    'cmp.note1.title': 'प्रत्येक आकड्यात काय समाविष्ट आहे',
    'cmp.note1.body': 'आकडे एकल-फेज जोडणीसाठी प्रमाणित शहरी टॅरिफवरील अंदाजित <strong>एकूण मासिक बिल</strong> आहेत — ऊर्जा + फिक्स्ड/मागणी शुल्क + FPPA (जिथे लागू) — कॅल्क्युलेटरच्याच इंजिनने गणना केलेले व खऱ्या बिलांशी पडताळलेले (<a href="/methodology/">आमची कार्यपद्धती पाहा</a>). सर्व वापर-स्तरांवर <strong>1&nbsp;kW मंजूर भार</strong> गृहीत धरला आहे.',
    'cmp.note2.title': 'अनुदाने व वगळलेले',
    'cmp.note2.body': 'पात्र <strong>घरगुती सरकारी अनुदान</strong> जिथे मॉडेल केले आहे तिथे लागू होते — <strong>दिल्ली</strong> (GNCTD), <strong>पंजाब</strong>, <strong>कर्नाटक</strong>, <strong>तेलंगणा</strong> व <strong>तमिळनाडू</strong> — पात्र युनिटवर मोफत ऊर्जेच्या रूपात. ज्या राज्यांची योजना सूचीत नाही ती येथे अनुदानित नाहीत आणि तिथले बिल कमी असू शकते. नेट-मीटरिंग व विलंब-भरणा अधिभार समाविष्ट नाहीत.',
    'cmp.note3.title': 'तक्ता कसा वाचावा',
    'cmp.note3.body': '<span class="comp-best" style="padding:1px 6px;border-radius:5px">हिरवा</span> सेल प्रत्येक वापर-स्तरावर सर्वात स्वस्त डिस्कॉम दर्शवतो. नेहमी तुमच्या प्रत्यक्ष बिलाशी पडताळा — टॅरिफ उप-श्रेणी, स्लॅब व शहरानुसार बदलतात.',
    // Methodology page (/methodology/)
    'meth.crumb': 'कार्यपद्धती',
    'meth.h1': 'कार्यपद्धती व अचूकता',
    'meth.lead': 'आमच्या <a href="/#calculator">कॅल्क्युलेटरमध्ये</a> दिसणारा प्रत्येक आकडा एखाद्या प्रकाशित टॅरिफ आदेशाशी जोडलेला आहे — आणि आम्ही निकाल खऱ्या ग्राहक बिलांशी तपासतो. हे पान सांगते की आकडे कुठून येतात, टॅरिफ आदेशाची गणना कशी होते, आम्ही ती कशी पडताळतो, आणि — तितकेच महत्त्वाचे — आम्ही अजून काय <em>मॉडेल करत नाही</em>.',
    'meth.s1.h2': '1. आकडे कुठून येतात',
    'meth.s1.p1': 'या टूलमध्ये कुठेही "सर्वसाधारण" किंवा काल्पनिक दर नाही. प्रत्येक स्लॅब दर, फिक्स्ड शुल्क, कर व अधिभार प्राथमिक स्रोतातून घेतला आहे:',
    'meth.s1.ul': '<li><strong>SERC टॅरिफ आदेश</strong> — प्रत्येक राज्य विद्युत नियामक आयोगाने जारी केलेला वार्षिक (किंवा बहुवर्षीय) टॅरिफ आदेश, जो डिस्कॉम काय शुल्क आकारू शकतो हे ठरवणारा कायदेशीर दस्तऐवज आहे.</li><li><strong>डिस्कॉम टॅरिफ वेळापत्रके व FPPA परिपत्रके</strong> — दरपत्रके आणि मासिक/त्रैमासिक इंधन-अधिभार (FPPA/FPPCA/FAC) अधिसूचना ज्या डिस्कॉम या आदेशांखाली प्रकाशित करतात.</li><li><strong>खरी ग्राहक बिले</strong> — प्रत्यक्ष छापील बिले, ज्यांचा उपयोग आदेश व्यवहारात कसा लागू होतो याची खात्री करण्यासाठी आणि आमचा निकाल पडताळण्यासाठी होतो (खंड 3 पाहा).</li>',
    'meth.s1.p2': 'नवा आदेश वा FPPA परिपत्रक प्रकाशित झाल्यावर टूलमधील संबंधित दर त्याच्याशी जुळवले जातात. सध्याचे टॅरिफ आकडे <strong>2025-26</strong> च्या आदेशांचे आहेत, आणि FPPA जुलै 2026 साठी अद्ययावत आहे.',
    'meth.s2.h2': '2. टॅरिफ आदेशाची गणना कशी होते',
    'meth.s2.p1': 'टॅरिफ आदेश म्हणजे मजकूर व तक्ते; बिल म्हणजे विशिष्ट क्रमाने लावलेले अंकगणित. आमचे इंजिन ते अंकगणित अंदाजे नव्हे, तर आदेश सांगतो तसेच एनकोड करते:',
    'meth.s2.ul': '<li><strong>टेलिस्कोपिक स्लॅब</strong> — प्रत्येक स्लॅबचा दर फक्त त्याच्या पट्ट्यातील युनिटवर लागू होतो, त्यामुळे जास्त दर कधीही तुमच्या संपूर्ण वापरावर लागत नाही (<a href="/glossary/#telescopic-slabs">टेलिस्कोपिक स्लॅब</a> पाहा). डिस्कॉम वापरत असेल तिथे नॉन-टेलिस्कोपिक "स्लॅब-लाभ-गमावणारे" टॅरिफही मॉडेल केले जातात.</li><li><strong>फिक्स्ड / मागणी शुल्क</strong> — श्रेणीनुसार प्रति kW मंजूर भार, प्रति kVA मागणी, किंवा ठरावीक रक्कम म्हणून. मागणी-आधारित श्रेणींसाठी <a href="/glossary/#maximum-demand">बिल केलेली मागणी</a> व मंजूर/करार मर्यादेपलीकडील जादा-मागणी दंड मोजला जातो.</li><li><strong>FPPA (इंधन अधिभार)</strong> — आदेश सांगेल त्या पद्धतीने: ठरावीक <em>प्रति-युनिट</em> पैसे, किंवा पुरवठा व मागणी शुल्काची <em>टक्केवारी</em> (UP MYT नियम 2025 प्रमाणे). तो ऋण क्रेडिटही असू शकतो.</li><li><strong>वीज शुल्क व कर</strong> — राज्य शुल्क योग्य आधारावर व योग्य क्रमाने लावले जाते (ते ऊर्जा/इंधन घटकावर लागते, स्वतःवर नाही), कारण क्रम अंतिम आकडा बदलतो.</li><li><strong>kVAh बिलिंग</strong> — जिथे मीटर व टॅरिफ आभासी ऊर्जा वापरतात, तिथे ऊर्जा <a href="/glossary/#kvah">kVAh</a> मध्ये व मागणी kVA मध्ये मोजली जाते, त्यामुळे कमी <a href="/glossary/#power-factor">पॉवर फॅक्टर</a> वेगळ्या दंडाऐवजी थेट बिल वाढवतो.</li><li><strong>टाइम-ऑफ-डे, अनुदाने, नेट मीटरिंग, LPSC व थकबाकी</strong> — पीक/ऑफ-पीक ब्लॉक, पात्र सरकारी अनुदान, रूफटॉप-सोलर निव्वळ आयात, आणि विलंब-भरणा अधिभार जिथे लागू तिथे लावले जातात.</li>',
    'meth.s3.h2': '3. खऱ्या बिलांशी पडताळलेले — पैशापर्यंत',
    'meth.s3.p1': 'बिलिंग इंजिनची खरी कसोटी ते बरोबर दिसते का ही नसून, ते खरे बिल ओळ-न्-ओळ पुन्हा तयार करते का ही आहे. आमचे करते. आम्ही छापील बिलांशी तपासलेल्या श्रेणींसाठी आमचे इंजिन खरी <strong>MVVNL (मध्यांचल विद्युत वितरण निगम, एक UPPCL डिस्कॉम) बिले पैशापर्यंत</strong> पुन्हा तयार करते, यांसह:',
    'meth.s3.ul': '<li><strong>LMV-1 घरगुती</strong> व लहान-ग्राहक बिले — ऊर्जा, फिक्स्ड शुल्क, इंधन अधिभार व वीज शुल्क सर्व छापील एकुणाशी जुळतात.</li><li><strong>LMV-17 / LMV-20</strong> बिगर-घरगुती व मोठ्या जोडण्या, मागणी-आधारित व टक्केवारी-FPPA अंकगणितासह.</li>',
    'meth.s3.p2': 'खरे बिल आणि आमचे इंजिन जुळत नाही तेव्हा आम्ही ते टॅरिफ आदेशाच्या आमच्या एनकोडिंगमधील बग मानतो आणि लॉजिक दुरुस्त करतो — स्वीकारार्ह राउंडिंग फरक म्हणून नाही.',
    'meth.s4.h2': '4. आम्ही काय मॉडेल करतो — आणि अजून काय नाही',
    'meth.s4.p1': 'मर्यादांबद्दल स्पष्ट असणे हा अचूकतेचा भाग आहे. टूल काय चांगले मॉडेल करते:',
    'meth.s4.ul1': '<li>टेलिस्कोपिक व नॉन-टेलिस्कोपिक ऊर्जा स्लॅब, फिक्स्ड/मागणी शुल्क, जादा-मागणी दंड.</li><li>प्रति-युनिट व टक्केवारी दोन्ही पद्धतींनी FPPA, वीज शुल्क, व सामान्य राज्य कर.</li><li>kVAh आभासी-ऊर्जा बिलिंग व पॉवर-फॅक्टर परिणाम.</li><li>टाइम-ऑफ-डे पीक/ऑफ-पीक बिलिंग व रूफटॉप-सोलर नेट मीटरिंग.</li><li>योजना चालवणाऱ्या राज्यांसाठी पात्र घरगुती सरकारी अनुदाने — दिल्ली (GNCTD), पंजाब, कर्नाटक (गृह ज्योती), तेलंगणा व तमिळनाडू — तुम्ही निवडल्यावर घरगुती श्रेणीवर लागू.</li>',
    'meth.s4.p2': 'आम्ही अजून <strong>पूर्णपणे</strong> काय मॉडेल करत नाही, आणि खरे बिल कुठे वेगळे असू शकते:',
    'meth.s4.ul2': '<li><strong>काही श्रेणी-विशिष्ट किमान शुल्क</strong> — उदा. LMV-2 किमान मासिक शुल्क ही ज्ञात उणीव आहे जी आम्ही अजून तंतोतंत पुन्हा तयार केलेली नाही.</li><li><strong>अनुदानाचे बारकावे</strong> — आम्ही प्रत्येक अनुदान पात्र युनिटवर मोफत ऊर्जा म्हणून सावधपणे मॉडेल करतो (फिक्स्ड शुल्क, FPPA व कर तरीही लागू) आणि कर्नाटक/तेलंगणाची मर्यादा नेमक्या सरासरी-वापर सूत्राऐवजी सरसकट 200 युनिट धरतो. योजना नसलेल्या राज्यांत अनुदान लागू होत नाही, त्यामुळे तिथले खरे बिल कमी असू शकते.</li><li><strong>बहु-डिस्कॉम तुलना तक्त्यातील नेट मीटरिंग व विलंब-भरणा अधिभार</strong> — समान आधारावरील तुलनेसाठी ते तिथे वगळले आहेत, मुख्य कॅल्क्युलेटर मात्र त्यांना समर्थन देतो.</li>',
    'meth.s4.p3': 'प्रत्येक निकाल हा <strong>अंदाजित आकडा</strong> आहे. टॅरिफ उप-श्रेणी, स्लॅब, शहर व मंजुरीनुसार बदलतात, म्हणून नेहमी छापील बिलाशी पडताळण्याची शिफारस करतो.',
    'meth.s5.h2': '5. किती वेळा अद्ययावत होते',
    'meth.s5.p1': 'नवे टॅरिफ आदेश व FPPA परिपत्रके प्रकाशित होताच दर ताजे केले जातात — मूळ टॅरिफसाठी साधारण वर्षातून एकदा (प्रत्येक SERC च्या आदेशानुसार) आणि इंधन अधिभारासाठी अधिक वेळा, जो मासिक वा त्रैमासिक बदलतो. खऱ्या बिलांमधून आलेले दुरुस्त्या मूळ टॅरिफ डेटावर लागू होतात, त्यामुळे एका ग्राहकासाठी केलेली दुरुस्ती त्या टॅरिफवरील सर्वांसाठी अंदाज सुधारते.',
    'meth.s6.h2': '6. स्वातंत्र्य',
    'meth.s6.p1': 'TheDiscomBill <strong>स्वतंत्र</strong> आहे आणि कोणत्याही डिस्कॉम, SERC वा सरकारी संस्थेशी संलग्न नाही. आमचा अंदाज मार्गदर्शन आहे, कायदेशीर निर्णय वा अधिकृत बिल नाही. औपचारिक वादासाठी तुमच्या डिस्कॉमचा तक्रार मंच वापरा; एखाद्या विशिष्ट बिलाच्या मानवी तपासणीसाठी आमची <a href="/bill-review/">तज्ज्ञ बिल तपासणी</a> सेवा मदत करू शकते.',
    'meth.s7.h2': 'हे प्रत्यक्ष पाहा',
    'meth.card1': '<strong>बिल कॅल्क्युलेटर</strong><span>तपशीलवार, स्लॅबनिहाय अंदाजासाठी तुमची युनिट व भार टाका</span>',
    'meth.card2': '<strong>राज्यानुसार टॅरिफ</strong><span>प्रत्येक अंदाजामागील नेमक्या स्लॅब दरा, फिक्स्ड शुल्क व FPPA</span>',
    'meth.card3': '<strong>बिल शब्दकोश</strong><span>प्रत्येक शुल्क ओळीची व कोडची सोप्या भाषेतील व्याख्या</span>',
    'meth.disclaimer': 'आकडे प्रकाशित टॅरिफ आदेशांवरून गणलेले व नमुना बिलांशी पडताळलेले अंदाजित आकडे आहेत; कोणत्याही शुल्काची नेमकी अंमलबजावणी राज्य, डिस्कॉम व ग्राहक श्रेणीनुसार बदलते. नेहमी तुमच्या डिस्कॉमच्या टॅरिफ आदेशाशी वा छापील बिलाशी पडताळा.',
    // Glossary page framing (/glossary/)
    'gloss.crumb': 'शब्दकोश',
    'gloss.h1': 'वीज बिल शब्दकोश',
    'gloss.lead': 'भारतीय वीज बिलावरील प्रत्येक शुल्क ओळ व कोड, सोप्या भाषेत. हेच शब्द आमच्या <a href="/#calculator">बिल कॅल्क्युलेटर</a> व <a href="/tariffs/states/">टॅरिफ पानांमागे</a> आहेत — <a href="#fppa">FPPA</a> व <a href="#electricity-duty">वीज शुल्कापासून</a> <a href="#telescopic-slabs">टेलिस्कोपिक स्लॅब</a> व <a href="#kvah">kVAh</a> पर्यंत.',
    'gloss.aka': 'इतर नावे:',
    'gloss.backToTop': '↑ सर्व शब्दांकडे परत',
    'gloss.work.h2': 'हे शब्द वापरात आणा',
    'gloss.card1': '<strong>बिल कॅल्क्युलेटर</strong><span>तपशीलवार अंदाजासाठी ही शुल्के तुमच्या युनिट व भारावर लावा</span>',
    'gloss.card2': '<strong>बिल मार्गदर्शक</strong><span>सविस्तर वाटाड्या: बिल वाचणे, बिले का वाढतात, टाइम-ऑफ-डे बिलिंग</span>',
    'gloss.card3': '<strong>राज्यानुसार टॅरिफ</strong><span>प्रत्येक डिस्कॉमचे लाइव्ह स्लॅब दर, फिक्स्ड शुल्क व FPPA</span>',
    'gloss.disclaimer': 'सामान्य भारतीय टॅरिफ पद्धतीवर आधारित सर्वसाधारण व्याख्या; कोणत्याही शुल्काची नेमकी अंमलबजावणी राज्य, डिस्कॉम व ग्राहक श्रेणीनुसार बदलते. तुमच्या डिस्कॉमच्या टॅरिफ आदेशाशी वा छापील बिलाशी पडताळा.',
    // Footer
    'footer.l1': '&copy; 2026 TheDiscomBill &nbsp;·&nbsp; भारतासाठी मोफत वीज बिल कॅल्क्युलेटर',
    'footer.l2': 'टॅरिफ डेटा अंदाजे असून सार्वजनिकरीत्या उपलब्ध माहितीवर (2025-26) आधारित आहे. कोणत्याही डिस्कॉम, SERC वा सरकारी संस्थेशी संलग्न नाही. &nbsp;|&nbsp; <a href="#about">अस्वीकरण</a>',
  },
  ta: {
    // Header / nav
    'tagline': 'மின்சாரக் கட்டணக் கால்குலேட்டர் · இந்தியா முழுவதும்',
    'nav.calculator': 'கால்குலேட்டர்',
    'nav.compare': 'ஒப்பீடு',
    'nav.about': 'எங்களைப் பற்றி',
    // Quick Links dropdown (shared chrome on every page)
    'nav.quickLinks': 'விரைவு இணைப்புகள்',
    'ql.tools': 'கருவிகள்',
    'ql.tariffs': 'கட்டண விகிதங்கள்',
    'ql.services': 'சேவைகள்',
    'ql.learn': 'அறிந்துகொள்ள',
    'ql.compare': 'டிஸ்காம் கட்டண ஒப்பீடு',
    'ql.usage': 'பயன்பாட்டு மதிப்பீட்டுக் கருவி',
    'ql.solar': 'மேற்கூரை சோலார் சேமிப்பு',
    'ql.tariffsByState': 'மாநிலம் & டிஸ்காம் வாரியான கட்டணங்கள்',
    'ql.discomServices': 'டிஸ்காம் சேவைகள்',
    'ql.smartMeter': 'ஸ்மார்ட் மீட்டர் ரீசார்ஜ்',
    'ql.billReviewGroup': 'உங்கள் பில்லை ஆய்வு செய்யுங்கள்',
    'ql.ocrCheck': 'உடனடி சுய சரிபார்ப்பு (OCR)',
    'ql.billReview': 'நிபுணரிடமிருந்து',
    'ql.guides': 'மின் கட்டண வழிகாட்டிகள்',
    'ql.glossary': 'மின் கட்டணச் சொற்களஞ்சியம்',
    'ql.methodology': 'முறையியல் & துல்லியம்',
    // Shared footer links (generated pages + key pages)
    'footer.rights': '© 2026 TheDiscomBill. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    'footer.disclaimer': 'பொறுப்புத் துறப்பு',
    'footer.methodology': 'முறையியல்',
    'footer.allStates': 'அனைத்து மாநிலங்களும் டிஸ்காம்களும்',
    'footer.glossary': 'பில் சொற்களஞ்சியம்',
    // Hero
    'hero.badge': 'இலவசம் · அனைத்து டிஸ்காம்களும் · உடனடி மதிப்பீடு',
    'hero.title': 'இந்தியாவின் ஒவ்வொரு டிஸ்காமுக்கும் மின்சாரக் கட்டணக் கால்குலேட்டர்',
    'hero.sub': 'எந்த மாநில மின் நிறுவனத்திற்கும் அடுக்கு (ஸ்லாப்) வாரியான விவரங்களுடன் உடனடி தோராயப் பில் பெறுங்கள்.',
    'hero.cta': 'என் பில்லைக் கணக்கிடு',
    'hero.cta2': 'என் பில்லை ஆய்வு செய்யுங்கள்',
    'review.title': 'உங்கள் பில்லை எப்படி சரிபார்க்க விரும்புகிறீர்கள்?',
    'review.ocr': 'உடனடி சுய சரிபார்ப்பு (OCR)',
    'review.ocrSub': 'பில் புகைப்படம்/PDF பதிவேற்றவும் — கால்குலேட்டர் தானாக நிரம்பும்',
    'review.expert': 'நிபுணரிடமிருந்து',
    'review.expertSub': 'பதிவேற்றிய பில்லின் இலவச நிபுண ஆய்வு',
    'hero.stat.states': 'மாநிலங்கள் & யூ.டி.',
    'hero.stat.discoms': 'டிஸ்காம்கள்',
    'hero.stat.categories': 'வகைகள்',
    'hero.feat.slab': 'அடுக்கு வாரியான மின் கட்டணம்',
    'hero.feat.fppa': 'நிலைக் கட்டணம் & எரிபொருள் கூடுதல் (FPPA)',
    'hero.feat.solar': 'சோலார் நெட் மீட்டரிங்',
    'hero.feat.tod': 'நேர அடிப்படை (ToD) & kVAh பில்லிங்',
    'hero.feat.demand': 'அதிகப்படி தேவை அபராதம்',
    'hero.feat.duty': 'மின்சார வரி & மாநில வரிகள்',
    'hero.discoms.label': '35+ மாநிலங்கள் & யூனியன் பிரதேசங்களில் 70+ டிஸ்காம்களின் கட்டணங்கள் — உட்பட',
    'hero.trust': 'பொதுவில் வெளியான கட்டண ஆணைகளின் அடிப்படையில் · நிதியாண்டு 2025-26க்கு புதுப்பிக்கப்பட்டது',
    // Calculator form
    'calc.title': 'பில் கால்குலேட்டர்',
    'label.state': 'மாநிலம் / யூனியன் பிரதேசம்',
    'label.discom': 'மின் நிறுவனம் (டிஸ்காம்)',
    'label.category': 'நுகர்வோர் வகை',
    'label.supplyType': 'விநியோக வகை / பகுதி',
    'label.consumerName': 'நுகர்வோர் பெயர்',
    'label.accountNo': 'கணக்கு / நுகர்வோர் எண்',
    'label.address': 'முகவரி',
    'label.billingMonth': 'பில்லிங் மாதம் & ஆண்டு',
    'label.billingBasis': 'பில்லிங் அடிப்படை (மின்சக்தி & தேவை)',
    'label.fromDate': 'தொடக்கத் தேதி',
    'label.toDate': 'இறுதித் தேதி',
    'small.fromDate': 'பில்லிங் காலத்தின் தொடக்கத் தேதி',
    'small.toDate': 'பில்லிங் காலத்தின் இறுதித் தேதி',
    'label.sanctioned': 'அனுமதிக்கப்பட்ட சுமை (kW)',
    'small.sanctioned': 'ஒப்பந்த / அனுமதிக்கப்பட்ட சுமை. நிலைக் கட்டணம் மற்றும் அதிகப்படி தேவை சரிபார்ப்புக்குப் பயன்படும்.',
    'small.fppa': 'எரிபொருள் & மின் கொள்முதல் சரிக்கட்டல். ₹/யூனிட் = (உண்மை − அடிப்படை மின் செலவு) × யூனிட், அல்லது விநியோகம்+தேவை கட்டணத்தின் % (UP MYT 2025). கைமுறையாக உள்ளிட மேலே அன்செக் செய்யுங்கள் (அல்லது மதிப்பை உள்ளிடுங்கள்). எதிர்மறை (கிரெடிட்) ஆகவும் இருக்கலாம்.',
    // Tabs
    'tab.meterread': 'மீட்டர் ரீடிங்',
    'tab.arrear': 'நிலுவை',
    'tab.payment': 'செலுத்தியவை',
    'tab.adjustment': 'சரிக்கட்டல்',
    'mode.meterReading': 'மீட்டர் ரீடிங்',
    'mode.tod': 'ToD',
    'label.billedAmount': 'உங்கள் டிஸ்காம் பில்லில் உள்ள தொகை (₹) — விருப்பத்திற்கு',
    'small.billedAmount': 'எங்கள் கணக்கீட்டுடன் ஒப்பிட்டு உங்கள் பில் சரியாக உள்ளதா எனச் சொல்வோம்.',

    // Solar calculator (/solar/)
    'sol.title': 'மேற்கூரை சோலார் சேமிப்புக் கால்குலேட்டர்',
    'sol.intro': 'மேற்கூரை சோலார் அமைப்பின் செலவு எவ்வளவு, எவ்வளவு சேமிக்கும் என்று பாருங்கள் — <strong>PM சூர்ய கர்</strong> மத்திய மானியம் உட்பட. அமைப்பின் அளவு, மானியத்திற்குப் பிறகான நிகர விலை, மாத சேமிப்பு மற்றும் திருப்பிச் செலுத்தும் காலம் அறிய உங்கள் மாத யூனிட்களையும் கூரை பரப்பையும் உள்ளிடுங்கள்.',
    'sol.chip1': '₹78,000 வரை மத்திய மானியம்',
    'sol.chip2': '25 ஆண்டு பேனல் ஆயுள்',
    'sol.chip3': 'இலவசம் · பதிவு தேவையில்லை',
    'sol.monthly': 'சராசரி மாத பயன்பாடு (யூனிட்)',
    'sol.phMonthly': 'எ.கா. 350',
    'sol.or': 'அல்லது, பில் தொகை மட்டும் தெரிந்தால்',
    'sol.billAmt': 'மாத பில் தொகை (₹)',
    'sol.phBillAmt': 'எ.கா. 2450',
    'sol.billAmtHint': 'கீழுள்ள கட்டண விகிதத்தைக் கொண்டு அதை யூனிட்களாக மாற்றுவோம்.',
    'sol.chartTitle': '25 ஆண்டுகளில் உங்கள் சேமிப்பு',
    'sol.share': 'இந்த மதிப்பீட்டை WhatsApp-இல் பகிருங்கள்',
    'sol.subNone': 'தெரியவில்லை / மாநில கூடுதல் இல்லை (₹0)',
    'sol.subUP': 'உத்தரப் பிரதேசம் — ₹15,000/kW (அதிகபட்சம் ₹30,000)',
    'sol.subAS': 'அசாம் — ₹15,000/kW (அதிகபட்சம் ₹45,000)',
    'sol.subCustom': 'சொந்தத் தொகை…',
    'sol.pull': 'என் மதிப்பீட்டைப் பயன்படுத்து',
    'sol.roof': 'நிழலற்ற கூரைப் பரப்பு (சதுர அடி)',
    'sol.phRoof': 'எ.கா. 300',
    'sol.roofHint': 'ஒவ்வொரு 1 kW-க்கும் சுமார் 100 சதுர அடி திறந்த கூரை தேவை.',
    'sol.rate': 'கட்டண விகிதம் (₹/யூனிட்)',
    'sol.stateSub': 'மாநில மானியம் (₹)',
    'sol.advanced': 'மேம்பட்டவை',
    'sol.cost': 'அமைப்பின் விலை (₹ / kW)',
    'sol.costHint': 'மானியத்திற்கு முந்தைய முழு நிறுவல் விலை. பொதுவாக ₹50,000–65,000/kW.',
    'sol.empty': 'உங்கள் சோலார் மதிப்பீட்டைக் காண மாத யூனிட் அல்லது கூரைப் பரப்பை உள்ளிடுங்கள்.',
    'sol.heroLabel': 'பரிந்துரைக்கப்படும் அமைப்பு அளவு',
    'sol.paysFor': 'முதலீடு திரும்பும் காலம்',
    'sol.gen': 'மதிப்பிடப்பட்ட மின் உற்பத்தி',
    'sol.grossCost': 'அமைப்பின் விலை (மானியத்திற்கு முன்)',
    'sol.centralSub': 'PM சூர்ய கர் மத்திய மானியம்',
    'sol.stateSub2': 'மாநில மானியம்',
    'sol.netCost': 'உங்களுக்கான நிகர விலை',
    'sol.monthlySave': 'மாத சேமிப்பு',
    'sol.lifetime': '25 ஆண்டுகளில் நிகர சேமிப்பு',
    'sol.co2': 'தவிர்க்கப்படும் CO₂',
    'sol.note': 'மதிப்பீடுகள் இந்திய சராசரி உற்பத்தி (~ஒரு kW-க்கு நாளொன்றுக்கு 4 யூனிட்) மற்றும் PM சூர்ய கர் குடியிருப்பு மத்திய மானியம் (2 kW வரை ₹30,000/kW, 3-வது kW-க்கு ₹18,000, அதிகபட்சம் ₹78,000) அடிப்படையிலானவை. உண்மையான உற்பத்தி, விலை, மாநில மானியம் ஆகியவை இடம், கூரையின் திசை, நிழல், உங்கள் டிஸ்காமின் நெட்-மீட்டரிங் கொள்கை ஆகியவற்றைப் பொறுத்து மாறும். இதைத் திட்டமிடல் வழிகாட்டியாகக் கொண்டு, <a href="https://pmsuryaghar.gov.in" target="_blank" rel="noopener noreferrer">தேசிய போர்டலில் ↗</a> பதிவு செய்யப்பட்ட விற்பனையாளரிடம் விலைப்புள்ளி பெறுங்கள்.',

    // Usage estimator (/usage/)
    'est.title': 'மின் பயன்பாட்டு மதிப்பீட்டுக் கருவி',
    'est.intro': 'நீங்கள் பயன்படுத்தும் சாதனங்களைச் சேர்த்து, எத்தனை உள்ளன, நாளொன்றுக்கு எத்தனை மணிநேரம் இயங்குகின்றன என்று அமைத்தால் — உங்கள் <strong>மாத யூனிட்களையும் (kWh)</strong> தோராய செலவையும் உடனடியாகக் காட்டுவோம்.',
    'est.chip1': '19 பொதுவான சாதனங்கள்',
    'est.chip2': 'நேரடி kWh & ₹ மதிப்பீடு',
    'est.chip3': 'இலவசம் · பதிவு தேவையில்லை',
    'est.season': 'பருவம்',
    'est.summer': 'கோடை',
    'est.monsoon': 'மழைக்காலம்',
    'est.winter': 'குளிர்காலம்',
    'est.colAppliance': 'சாதனம்',
    'est.colWatts': 'வாட்',
    'est.colQty': 'எண்ணிக்கை',
    'est.colHrs': 'மணி/நாள்',
    'est.colKwh': 'kWh/மாதம்',
    'est.emptyRows': 'இன்னும் சாதனம் இல்லை — தொடங்க மேலே உள்ள சிப்பைத் தட்டுங்கள்.',
    'est.addCustom': '+ சொந்த சாதனம் சேர்',
    'est.totalLabel': 'மதிப்பிடப்பட்ட மாத பயன்பாடு',
    'est.perDay': 'kWh / நாள் ·',
    'est.appliances': 'சாதனங்கள்',
    'est.tariff': 'கட்டண விகிதம்',
    'est.perUnit': '/யூனிட்',
    'est.perMonth': ' / மாதம்',
    'est.calcExact': 'சரியான பில்லைக் கணக்கிடு →',
    'est.handoff': 'முழு கால்குலேட்டரில் உங்கள் உண்மையான டிஸ்காம் அடுக்குகள், நிலைக் கட்டணம் & FPPA பயன்படுத்துங்கள்.',
    'est.solarLink': 'இந்தப் பயன்பாட்டில் மேற்கூரை சோலார் எவ்வளவு சேமிக்கும் என்று பாருங்கள் →',
    'est.breakdownTitle': 'உங்கள் யூனிட்கள் எங்கே செல்கின்றன',
    'est.note': 'மதிப்பீடுகள் 30-நாள் மாதத்தை அடிப்படையாகக் கொண்டவை. குளிர்சாதனப் பெட்டி மற்றும் AC மணிநேரங்கள் <em>பயனுள்ள</em> கம்ப்ரசர் இயக்க நேரம், கடிகார நேரம் அல்ல (குளிர்சாதனப் பெட்டி இயங்கி-நின்று மாறிக்கொண்டிருக்கும்). உண்மையான பயன்பாடு சாதனத்தின் திறன் (ஸ்டார் ரேட்டிங்), வெப்பநிலை, பயன்பாட்டைப் பொறுத்து மாறும். இதைத் திட்டமிடல் வழிகாட்டியாகக் கொண்டு, துல்லியமான, கட்டண-விகிதப்படியான தொகைக்கு <a href="/#calculator">பில் கால்குலேட்டரைப்</a> பயன்படுத்துங்கள்.',

    // Buttons
    'btn.addMeter': '+ மீட்டர் சேர்',
    'btn.calculate': '⚡ தோராயப் பில்லைக் கணக்கிடு',
    'btn.sample': 'மாதிரி பில்லைப் பார்',
    'btn.sampleHero': 'ஒரே கிளிக்கில் மாதிரி பில் பாருங்கள்',
    'mode.simple': '⚡ எளிய',
    'mode.detailed': 'விரிவான',
    'mode.simpleHint': 'உங்கள் டிஸ்காமும் யூனிட்களும் மட்டும் — மீதியை நாங்கள் பார்த்துக்கொள்வோம்.',
    'btn.compare': '⚖ டிஸ்காம்களை ஒப்பிடு',
    'btn.addPayment': '+ செலுத்தியதைச் சேர்',
    'btn.addAdjustment': '+ சரிக்கட்டலைச் சேர்',
    // Checkboxes / toggles
    'chk.fppaAuto': 'சரிபார்க்கப்பட்ட அரசு தரவிலிருந்து தானாக நிரப்பு',
    'chk.netMetering': '<strong>மேற்கூரை சோலார் / நெட் மீட்டரிங்</strong> — நிகர இறக்குமதிக்கு பில்',
    'label.exportUnits': 'ஏற்றுமதி செய்த யூனிட்கள் (kWh)',
    'label.openingCredit': 'தொடக்க சேமிப்புக் கிரெடிட் (kWh)',
    'chk.lpsc': '<strong>LPSC பொருந்தும்</strong> — நடப்பு பில்லில் தாமத அபராதம் சேர்',
    'label.subsidy': 'அரசு வீட்டு மானியம்',
    'chk.applySubsidy': 'அரசு மானியத்தைச் சேர்',
    // Arrear / Payment / Adjustment
    'hint.arrear': 'முந்தைய பில்லில் காட்டியபடி அப்படியே தொகைகளை உள்ளிடுங்கள். முந்தைய நிலுவைக்கான LPSC நேரடித் தொகை, கணக்கிடப்படுவதல்ல.',
    'label.prevArrear': 'முந்தைய நிலுவை (₹)',
    'label.prevArrearLpsc': 'முந்தைய நிலுவை LPSC (₹)',
    'total.arrear': 'மொத்த நிலுவை:',
    'hint.lpsc': 'மீட்டர் ரீடிங் தாவலில் உள்ள “LPSC பொருந்தும்” டாகிள் மூலம் LPSC இயக்கப்படும். விகிதத்தையும் நடப்பு பில் எத்தனை மாதம் தாமதம் என்பதையும் இந்தப் புலங்கள் தீர்மானிக்கின்றன.',
    'label.lpscRate': 'நடப்பு பில் LPSC விகிதம் (% / மாதம்)',
    'label.lpscMonths': 'நடப்பு பில் தாமதம் (மாதங்கள்)',
    'hint.payment': 'இந்த பில்லிங் காலத்தில் ஏற்கனவே செலுத்தியவை — இவை செலுத்த வேண்டிய மொத்தத் தொகையைக் குறைக்கும்.',
    'total.payment': 'மொத்தம் செலுத்தியது:',
    'hint.adjustment': 'இதர கிரெடிட் அல்லது கட்டணங்கள் — எ.கா. மீட்டர் விலை, வைப்புத்தொகை திருப்பம், அல்லது தள்ளுபடி. கிரெடிட்டுக்கு எதிர்மறை மதிப்பைப் பயன்படுத்துங்கள்.',
    'total.adjustment': 'மொத்த சரிக்கட்டல்:',
    // Meter reading hint (advHint)
    'hint.advanced': 'ஒவ்வொரு மீட்டரின் முந்தைய → நடப்பு ரீடிங்கை உள்ளிடுங்கள் (யூனிட் = (நடப்பு − முந்தைய) × MF). இடையில் மீட்டர் மாற்றம் அல்லது பல மீட்டர்களுக்கு "+ மீட்டர் சேர்" பயன்படுத்துங்கள் — அவற்றின் யூனிட்கள் கூட்டப்படும்.',
    // Input placeholders
    'ph.consumerName': 'எ.கா. ராஜேஷ் குமார்',
    'ph.accountNo': 'விருப்பத்திற்கு',
    'ph.address': 'எ.கா. 12 மெயின் ரோடு, சென்னை',
    'label.meterNo': 'மீட்டர் எண்',
    'ph.meterNo': 'விருப்பத்திற்கு',
    'ph.totalUnits': 'மொத்த பயன்படுத்திய யூனிட்கள்',
    'ph.meterLabel': 'மீட்டர் எண் (விருப்பத்திற்கு)',
    // Dropdown default options
    'opt.selectState': '— மாநிலம் / யூ.டி. தேர்வு —',
    'opt.selectStateFirst': '— முதலில் மாநிலத்தைத் தேர்வு செய்க —',
    'opt.selectDiscomFirst': '— முதலில் டிஸ்காமைத் தேர்வு செய்க —',
    // Billing Basis small
    'small.billingBasis': '<strong>kWh</strong>: மீட்டர் ரீடிங் kWh-இல், தேவை kW-இல். <strong>kVA அடிப்படை</strong>: மீட்டர் ரீடிங் kVAh-இல் (தோற்ற மின்சக்தி), தேவை kVA-இல் — குறைந்த பவர் ஃபேக்டர் நேரடியாக அதிக kVAh ஆகத் தெரியும், தனி PF அபராதம் இல்லை. kVA (HT/பெரிய-LT) கட்டணங்களுக்குத் தானாக அமைக்கப்படும் — தேவைப்பட்டால் மாற்றுங்கள்.',
    // Billed demand
    'label.billedDemand': 'அதிகபட்ச தேவை (MD) (kW)',
    'small.billedDemand': 'இந்தக் காலத்தில் மீட்டர் பதிவு செய்த உச்ச தேவை. தேவை-அடிப்படை (வணிக) வகைகளில் இது தேவை கட்டணத்தையும், அனுமதிக்கப்பட்ட சுமையை மீறினால் அதிகப்படி-தேவை அபராதத்தையும் தீர்மானிக்கும். அனுமதிக்கப்பட்ட சுமையில் பில் போட காலியாக விடுங்கள்.',
    // Net metering
    'small.netMetering': 'மேலே உள்ளிட்ட யூனிட்கள் கிரிடில் இருந்து நீங்கள் <strong>இறக்குமதி</strong> செய்தவை. நிகர பில் = இறக்குமதி − ஏற்றுமதி − தொடக்கக் கிரெடிட்; உபரி அடுத்த மாதத்திற்கு கிரெடிட்டாகச் சேமிக்கப்படும்.',
    // LPSC
    'small.lpscApplicable': 'விகிதமும் தாமத மாதங்களும் நிலுவை தாவலில் அமைக்கப்படும். இந்த நுகர்வோர் / காலத்திற்கு தாமத அபராதம் பொருந்தாவிட்டால் அன்செக் செய்யுங்கள்.',
    'small.arrearLpsc': 'உங்கள் கடந்த பில்லில் காட்டியபடி, முந்தைய நிலுவைக்கான LPSC தொகை.',
    'small.lpscRate': 'SERC ஆணைப்படி தாமத அபராத விகிதம். பொதுவாக 1.5%.',
    'small.lpscMonths': 'நடப்பு பில் செலுத்துவதில் தாமதம் (மாதங்கள்). LPSC நடப்பு நிகரத் தொகையில் பொருந்தும்.',
    // TOD
    'label.todPeak': 'பீக் யூனிட்கள் <span class="tod-badge tod-badge-peak tod-badge-sm">+20%</span>',
    'label.todNormal': 'சாதாரண யூனிட்கள்',
    'label.todOffPeak': 'ஆஃப்-பீக் யூனிட்கள் <span class="tod-badge tod-badge-offpeak tod-badge-sm">−20%</span>',
    'small.todPeak': 'காலை 6–10 & மாலை 6–10',
    'small.todNormal': 'காலை 10 – மாலை 6 (அடிப்படை விகிதம்)',
    'small.todOffPeak': 'இரவு 10 – காலை 6',
    // Billing period / totals display labels
    'lbl.billingPeriod': 'பில்லிங் காலம்:',
    'lbl.days': 'நாட்கள்',
    'lbl.months': 'மாதங்கள்',
    'lbl.total': 'மொத்தம்:',
    'lbl.period': 'காலம்',
    'lbl.todTotal': 'ToD மொத்தம்:',
    'lbl.peak': 'பீக்',
    'lbl.normal': 'சாதாரணம்',
    'lbl.offPeak': 'ஆஃப்-பீக்',
    // Bill placeholder
    'placeholder.title': 'உங்கள் தோராயப் பில் இங்கே தோன்றும்',
    'placeholder.sub': 'உங்கள் டிஸ்காமைத் தேர்ந்தெடுத்து, விவரங்களை நிரப்பி, கிளிக் செய்யுங்கள்<br><strong>தோராயப் பில்லைக் கணக்கிடு</strong>',
    // About
    'about.title': 'TheDiscomBill பற்றி',
    'about.p1': 'TheDiscomBill என்பது <strong>இந்தியா முழுவதுமுள்ள அனைத்து மின் விநியோக நிறுவனங்களையும் (டிஸ்காம்)</strong> உள்ளடக்கிய இலவச, உலாவி-அடிப்படையிலான மின்சாரக் கட்டணக் கால்குலேட்டர் — கர்நாடகாவின் BESCOM முதல் மகாராஷ்டிராவின் MSEDCL, பஞ்சாபின் PSPCL, தமிழ்நாட்டின் TANGEDCO மற்றும் இன்னும் பல வரை. உங்கள் மாநிலத்தைத் தேர்ந்தெடுத்து, டிஸ்காமைத் தேர்ந்தெடுத்து, நுகர்வோர் வகையைத் தேர்ந்தெடுத்து, பயன்படுத்திய யூனிட்களை உள்ளிட்டால் — முழு அடுக்கு வாரியான விவரத்துடன் உடனடி தோராயப் பில் கிடைக்கும்.',
    'about.stat.states': 'மாநிலங்கள் & யூ.டி.',
    'about.stat.discoms': 'ஆதரிக்கப்படும் டிஸ்காம்கள்',
    'about.stat.categories': 'நுகர்வோர் வகைகள்',
    'about.stat.free': 'பதிவு தேவையில்லை',
    'about.howTitle': 'இது எப்படி வேலை செய்கிறது',
    'about.p2': 'கால்குலேட்டர் ஒவ்வொரு டிஸ்காமின் சமீபத்திய பொது கட்டண ஆணைகளைப் பயன்படுத்துகிறது. இது <strong>டெலஸ்கோபிக் (திரட்டு) அடுக்கு முறையில்</strong> கட்டணங்களைக் கணக்கிடுகிறது: ஒவ்வொரு அடுக்கின் விகிதமும் அந்த அடுக்கிற்குள் வரும் யூனிட்களுக்கு மட்டுமே பொருந்தும், மொத்தப் பயன்பாட்டிற்கு அல்ல. நிலை / தேவை கட்டணங்கள் உங்கள் அனுமதிக்கப்பட்ட சுமையின் அடிப்படையில் தனியாகச் சேர்க்கப்படும்.',
    'about.p3': 'மின்சார வரி, எரிபொருள் சரிக்கட்டல் கட்டணங்கள் மற்றும் பிற மாநில வரிகள் ஒவ்வொரு டிஸ்காமின் கட்டண அட்டவணைப்படி சேர்க்கப்படும்.',
    'about.disclaimer': '<strong>⚠ பொறுப்புத் துறப்பு:</strong> இது குறிப்பு மற்றும் கல்வி நோக்கங்களுக்கான <strong>தோராயப் பில் கால்குலேட்டர்</strong> மட்டுமே. இங்கு பயன்படுத்தப்படும் கட்டண விகிதங்கள் தோராயமானவை, பொதுவில் வெளியான கட்டண ஆணைகளின் அடிப்படையிலானவை; சமீபத்திய திருத்தங்களையோ உள்ளூர் கூடுதல் கட்டணங்களையோ பிரதிபலிக்காமல் இருக்கலாம். உங்கள் டிஸ்காமின் உண்மையான பில் வேறுபடலாம். துல்லியமான, அதிகாரப்பூர்வ பில்லிங் தகவலுக்கு எப்போதும் உங்கள் டிஸ்காமைத் தொடர்பு கொள்ளுங்கள் அல்லது அவர்களின் அதிகாரப்பூர்வ வலைத்தளத்தைப் பாருங்கள். TheDiscomBill எந்த மின் நிறுவனத்துடனோ அரசு அமைப்புடனோ இணைந்தது அல்ல.',
    // Breadcrumb (shared)
    'bc.home': 'முகப்பு',
    // DISCOM Services page (/services/)
    'svc.h2': 'டிஸ்காம் சேவைகள்',
    'svc.intro': 'உங்கள் மின் விநியோகஸ்தரிடமிருந்து தேவையான அனைத்தும் ஒரே இடத்தில். ஒரு சேவையைத் தேர்ந்தெடுத்து, மாநிலத்தையும் டிஸ்காமையும் தேர்ந்தெடுங்கள் — உங்களை நேரடியாக அதன் <strong>அதிகாரப்பூர்வ போர்டலுக்கு</strong> அழைத்துச் செல்வோம் — கூடவே 24×7 மின் ஹெல்ப்லைனும்.',
    'svc.tab.pay': 'பில் செலுத்த',
    'svc.tab.new': 'புதிய இணைப்பு',
    'svc.tab.complaint': 'புகார்',
    'svc.tab.helplines': 'ஹெல்ப்லைன்கள்',
    'svc.lead.pay': 'உங்கள் மாநிலத்தையும் மின் விநியோகஸ்தரையும் தேர்ந்தெடுங்கள் — நேரடியாக அதன் <strong>அதிகாரப்பூர்வ பில்-செலுத்தும் போர்டலுக்கு</strong> அழைத்துச் செல்வோம்; அங்கு அசல் மூலத்தில் பில்லைப் பார்க்கவும், பதிவிறக்கவும், செலுத்தவும் முடியும்.',
    'svc.lead.new': 'புதிய இணைப்புக்கு விண்ணப்பிக்கிறீர்களா? உங்கள் மாநிலத்தையும் டிஸ்காமையும் தேர்ந்தெடுத்து அதன் <strong>அதிகாரப்பூர்வ போர்டலில்</strong> விண்ணப்பியுங்கள்; வழக்கமான நடைமுறை, ஆவணங்கள் & கட்டணங்களை கீழே பாருங்கள்.',
    'svc.lead.complaint': 'மின்தடை, தவறான பில் அல்லது பழுதான மீட்டரா? உங்கள் டிஸ்காமைத் தேர்ந்தெடுத்து அதன் <strong>அதிகாரப்பூர்வ போர்டலில்</strong> புகார் அளியுங்கள் — அல்லது <strong>ஹெல்ப்லைன்கள்</strong> தாவலில் உள்ள 24×7 எண்ணை அழையுங்கள்.',
    'svc.lead.helplines': 'உங்கள் டிஸ்காம் எதுவாயினும், எந்த மாநிலத்திலும் வேலை செய்யும் எண்களும் புகாரை மேலே கொண்டு செல்லும் வழிமுறையும்.',
    'svc.label.state': 'மாநிலம் / யூ.டி.',
    'svc.label.discom': 'உங்கள் டிஸ்காம்',
    'svc.helpline.label': '24×7 தேசிய மின் ஹெல்ப்லைன்',
    'svc.helpline.sub': 'மின்தடை & விநியோகப் புகார்கள், எந்த மாநிலமும்',
    'svc.info.title': 'உங்கள் புகார் தீர்க்கப்படாவிட்டால்',
    'svc.step1': '<strong>டிஸ்காம் புகார் போர்டல் / 1912</strong><span>முதலில் உங்கள் டிஸ்காமில் புகார் அளித்து, புகார் எண்ணையும் அறிவிக்கப்பட்ட தீர்வு காலத்தையும் குறித்து வைத்துக்கொள்ளுங்கள்.</span>',
    'svc.step2': '<strong>நுகர்வோர் குறைதீர்ப்பு மன்றம் (CGRF)</strong><span>உரிய காலத்தில் தீர்க்கப்படாவிட்டால், உங்கள் டிஸ்காமின் CGRF-க்கு புகாரை உயர்த்துங்கள் — நுகர்வோர் புகார்களுக்கான சட்டப்பூர்வ மன்றம்.</span>',
    'svc.step3': '<strong>மின்சார குறைதீர்ப்பாளர் (Ombudsman)</strong><span>இன்னும் தீரவில்லையா? உங்கள் மாநில மின்சார ஒழுங்குமுறை ஆணையத்தின் மின்சார குறைதீர்ப்பாளரை அணுகுங்கள் — இறுதி மேல்முறையீட்டு அமைப்பு.</span>',
    'svc.chargeNote': '💡 ஒவ்வொரு கட்டத்திலும் உங்கள் நுகர்வோர் / கணக்கு எண்ணையும் டிஸ்காம் புகார் எண்ணையும் கையில் வைத்திருங்கள்.',
    'svc.note': 'TheDiscomBill சுயாதீனமானது; எந்த டிஸ்காமுடனும் இணைந்தது அல்ல. அதிகாரப்பூர்வ போர்டல்கள் & ஹெல்ப்லைன்களுக்கு மட்டுமே இணைக்கிறோம் — உங்கள் கணக்கு எண், OTP அல்லது கடவுச்சொல்லை ஒருபோதும் கேட்க மாட்டோம். செலுத்தும் முன் கட்டண மதிப்பீட்டுக்கு <a href="/#calculator">பில் கால்குலேட்டரைப்</a> பயன்படுத்துங்கள்.',
    // Compare page (/compare/)
    'cmp.h2': 'கட்டண ஒப்பீடு (முக்கிய டிஸ்காம்கள்)',
    'cmp.intro': 'ஒரு சாதாரண மாதத்திற்கு <strong>1&nbsp;kW அனுமதிக்கப்பட்ட சுமையில்</strong> முக்கிய மின் விநியோகஸ்தர்கள் ஒருவருக்கொருவர் எப்படி என்று பாருங்கள். நடப்பு நிதியாண்டு 2025-26 கட்டணங்களின் அடிப்படையில் நேரடியாகக் கணக்கிடப்படுகிறது.',
    'cmp.cc.title': 'எந்த இரு டிஸ்காம்களையும் ஒப்பிடுங்கள்',
    'cmp.cc.sub': 'பெரியவை மட்டுமல்ல — எந்த இரு விநியோகஸ்தர்களையும் தேர்ந்தெடுத்து, முழு விவரத்துடன் சம அடிப்படையில் பில் மதிப்பீட்டுக்கு உங்கள் மாத பயன்பாட்டை உள்ளிடுங்கள்.',
    'cmp.cc.discomA': 'டிஸ்காம் A',
    'cmp.cc.discomB': 'டிஸ்காம் B',
    'cmp.cc.units': 'மாத யூனிட்கள் (kWh)',
    'cmp.cc.load': 'சுமை (kW)',
    'cmp.cc.category': 'வகை',
    'cmp.cat.domestic': 'வீட்டு',
    'cmp.cat.commercial': 'வணிக',
    'cmp.cc.btn': 'ஒப்பிடு',
    'cmp.cc.subsidy': 'அரசு மானியத்தைச் சேர் (தகுதியுள்ள வீட்டு இணைப்புகள்)',
    'cmp.cc.note': 'மானியம் தகுதியுள்ள <strong>வீட்டு</strong> இணைப்புகளுக்குப் பொருந்தும். தற்போது மாதிரியாக்கப்பட்டது: <strong>டெல்லி</strong> (GNCTD — முதல் 200 யூனிட் இலவசம், 400 வரை 50% தள்ளுபடி). பிற மாநில மானியங்கள் (எ.கா. பஞ்சாப், கர்நாடகா) உங்கள் உண்மையான பில்லை இன்னும் குறைக்கலாம்.',
    'cmp.th.discom': 'டிஸ்காம் / மாநிலம்',
    'cmp.th.u200': '200 யூனிட்',
    'cmp.th.u400': '400 யூனிட்',
    'cmp.th.u600': '600 யூனிட்',
    'cmp.th.u1000': '1000 யூனிட்',
    'cmp.note1.title': 'ஒவ்வொரு எண்ணிலும் என்ன அடங்கும்',
    'cmp.note1.body': 'எண்கள் ஒற்றை-ஃபேஸ் இணைப்புக்கு நிலையான நகர்ப்புற கட்டணத்தில் மதிப்பிடப்பட்ட <strong>மொத்த மாத பில்</strong> — மின்சக்தி + நிலை/தேவை கட்டணம் + FPPA (பொருந்தும் இடங்களில்) — கால்குலேட்டரின் அதே இன்ஜினால் கணக்கிடப்பட்டு உண்மையான பில்களுடன் சரிபார்க்கப்பட்டவை (<a href="/methodology/">எங்கள் முறையியலைப் பாருங்கள்</a>). எல்லா பயன்பாட்டு நிலைகளிலும் <strong>1&nbsp;kW அனுமதிக்கப்பட்ட சுமை</strong> எடுத்துக்கொள்ளப்பட்டுள்ளது.',
    'cmp.note2.title': 'மானியங்கள் & விலக்குகள்',
    'cmp.note2.body': 'மாதிரியாக்கப்பட்ட இடங்களில் தகுதியுள்ள <strong>வீட்டு அரசு மானியம்</strong> பொருந்தும் — <strong>டெல்லி</strong> (GNCTD), <strong>பஞ்சாப்</strong>, <strong>கர்நாடகா</strong>, <strong>தெலங்கானா</strong> & <strong>தமிழ்நாடு</strong> — தகுதியுள்ள யூனிட்களில் இலவச மின்சக்தியாக. பட்டியலிடப்பட்ட திட்டம் இல்லாத மாநிலங்களுக்கு இங்கு மானியம் சேர்க்கப்படவில்லை; அங்கு பில் குறைவாக இருக்கலாம். நெட்-மீட்டரிங் & தாமத அபராதம் சேர்க்கப்படவில்லை.',
    'cmp.note3.title': 'அட்டவணையை எப்படி வாசிப்பது',
    'cmp.note3.body': '<span class="comp-best" style="padding:1px 6px;border-radius:5px">பச்சை</span> கட்டம் ஒவ்வொரு பயன்பாட்டு நிலையிலும் மிகக் குறைந்த விலை டிஸ்காமைக் குறிக்கும். எப்போதும் உங்கள் உண்மையான பில்லுடன் சரிபாருங்கள் — கட்டணங்கள் துணை-வகை, அடுக்கு & நகரம் வாரியாக மாறும்.',
    // Methodology page (/methodology/)
    'meth.crumb': 'முறையியல்',
    'meth.h1': 'முறையியல் & துல்லியம்',
    'meth.lead': 'எங்கள் <a href="/#calculator">கால்குலேட்டர்</a> காட்டும் ஒவ்வொரு எண்ணும் வெளியிடப்பட்ட கட்டண ஆணையுடன் தொடர்புடையது — முடிவை உண்மையான நுகர்வோர் பில்களுடன் சரிபார்க்கிறோம். எண்கள் எங்கிருந்து வருகின்றன, கட்டண ஆணை எப்படி கணக்காக மாறுகிறது, அதை எப்படி சரிபார்க்கிறோம், அதே அளவு முக்கியமாக — எதை இன்னும் <em>மாதிரியாக்கவில்லை</em> என்பதை இந்தப் பக்கம் விளக்குகிறது.',
    'meth.s1.h2': '1. எண்கள் எங்கிருந்து வருகின்றன',
    'meth.s1.p1': 'இந்தக் கருவியில் எங்கும் "வழக்கமான" அல்லது கற்பனை விகிதம் இல்லை. ஒவ்வொரு அடுக்கு விகிதம், நிலைக் கட்டணம், வரி & கூடுதல் கட்டணம் முதன்மை மூலத்திலிருந்து எடுக்கப்பட்டது:',
    'meth.s1.ul': '<li><strong>SERC கட்டண ஆணைகள்</strong> — ஒவ்வொரு மாநில மின்சார ஒழுங்குமுறை ஆணையம் வெளியிடும் ஆண்டு (அல்லது பல்லாண்டு) கட்டண ஆணை; டிஸ்காம் என்ன கட்டணம் வசூலிக்கலாம் என்பதை நிர்ணயிக்கும் சட்ட ஆவணம் இதுவே.</li><li><strong>டிஸ்காம் கட்டண அட்டவணைகள் & FPPA சுற்றறிக்கைகள்</strong> — அந்த ஆணைகளின் கீழ் டிஸ்காம்கள் வெளியிடும் விலைப்பட்டியல்களும் மாத/காலாண்டு எரிபொருள்-கூடுதல் (FPPA/FPPCA/FAC) அறிவிப்புகளும்.</li><li><strong>உண்மையான நுகர்வோர் பில்கள்</strong> — அச்சிடப்பட்ட உண்மைப் பில்கள்; ஆணை நடைமுறையில் எப்படி பொருந்துகிறது என்பதை உறுதிப்படுத்தவும் எங்கள் முடிவைச் சரிபார்க்கவும் (பகுதி 3 பாருங்கள்).</li>',
    'meth.s1.p2': 'புதிய ஆணை அல்லது FPPA சுற்றறிக்கை வெளியானதும், கருவியின் தொடர்புடைய விகிதங்கள் அதற்கேற்ப புதுப்பிக்கப்படும். நடப்புக் கட்டண எண்கள் <strong>2025-26</strong> ஆணைகளை பிரதிபலிக்கின்றன; FPPA ஜூலை 2026-க்கு புதுப்பிக்கப்பட்டுள்ளது.',
    'meth.s2.h2': '2. கட்டண ஆணை எப்படி கணக்காக மாறுகிறது',
    'meth.s2.p1': 'கட்டண ஆணை என்பது உரையும் அட்டவணைகளும்; பில் என்பது குறிப்பிட்ட வரிசையில் செயல்படுத்தப்படும் கணிதம். எங்கள் இன்ஜின் அந்தக் கணிதத்தை தோராயமாக்காமல், ஆணை சொல்வதுபோலவே குறியாக்குகிறது:',
    'meth.s2.ul': '<li><strong>டெலஸ்கோபிக் அடுக்குகள்</strong> — ஒவ்வொரு அடுக்கு விகிதமும் அதன் வரம்பிற்குள் வரும் யூனிட்களுக்கு மட்டுமே பொருந்தும்; உயர்ந்த விகிதம் ஒருபோதும் உங்கள் மொத்தப் பயன்பாட்டிற்குப் பொருந்தாது (<a href="/glossary/#telescopic-slabs">டெலஸ்கோபிக் அடுக்குகள்</a> பாருங்கள்). டிஸ்காம் பயன்படுத்தும் இடங்களில் நான்-டெலஸ்கோபிக் கட்டணங்களும் மாதிரியாக்கப்படுகின்றன.</li><li><strong>நிலை / தேவை கட்டணங்கள்</strong> — வகைப்படி, அனுமதிக்கப்பட்ட சுமையின் ஒரு kW-க்கு, தேவையின் ஒரு kVA-க்கு, அல்லது நிலையான தொகையாக. தேவை-அடிப்படை வகைகளுக்கு <a href="/glossary/#maximum-demand">பில் செய்யப்பட்ட தேவையும்</a> வரம்பு மீறலுக்கான அதிகப்படி-தேவை அபராதமும் கணக்கிடப்படும்.</li><li><strong>FPPA (எரிபொருள் கூடுதல்)</strong> — ஆணை குறிப்பிடும் முறைப்படியே: நிலையான <em>ஒரு-யூனிட்</em> பைசா தொகை, அல்லது விநியோக & தேவை கட்டணங்களின் <em>சதவீதம்</em> (UP MYT விதிகள் 2025 போல). இது எதிர்மறை கிரெடிட்டாகவும் இருக்கலாம்.</li><li><strong>மின்சார வரி & வரிகள்</strong> — மாநில வரி சரியான அடிப்படையில், சரியான வரிசையில் சேர்க்கப்படும் (அது மின்சக்தி/எரிபொருள் கூறின் மீது விதிக்கப்படும், தன் மீது அல்ல) — வரிசை இறுதி எண்ணை மாற்றும்.</li><li><strong>kVAh பில்லிங்</strong> — மீட்டரும் கட்டணமும் தோற்ற மின்சக்தியைப் பயன்படுத்தும் இடங்களில், மின்சக்தி <a href="/glossary/#kvah">kVAh</a>-இலும் தேவை kVA-இலும் அளக்கப்படும்; குறைந்த <a href="/glossary/#power-factor">பவர் ஃபேக்டர்</a> தனி அபராதமின்றி நேரடியாக பில்லை உயர்த்தும்.</li><li><strong>நேர அடிப்படை (ToD), மானியங்கள், நெட் மீட்டரிங், LPSC & நிலுவைகள்</strong> — பீக்/ஆஃப்-பீக் தொகுதிகள், தகுதியுள்ள அரசு மானியம், மேற்கூரை-சோலார் நிகர இறக்குமதி, தாமத அபராதம் — பொருந்தும் இடங்களில் ஒவ்வொன்றும் சேர்க்கப்படும்.</li>',
    'meth.s3.h2': '3. உண்மையான பில்களுடன் சரிபார்க்கப்பட்டது — பைசா வரை',
    'meth.s3.p1': 'பில்லிங் இன்ஜினுக்கான வலுவான சோதனை அது சரியாகத் தோன்றுகிறதா என்பதல்ல; உண்மையான பில்லை வரிக்கு வரி மீண்டும் உருவாக்குகிறதா என்பதே. எங்களது உருவாக்குகிறது. அச்சிடப்பட்ட பில்களுடன் சோதித்த வகைகளுக்கு, எங்கள் இன்ஜின் உண்மையான <strong>MVVNL (மத்யாஞ்சல் வித்யுத் வித்ரண் நிகம், ஒரு UPPCL டிஸ்காம்) பில்களை பைசா வரை</strong> மீண்டும் உருவாக்குகிறது, இவற்றுட்பட:',
    'meth.s3.ul': '<li><strong>LMV-1 வீட்டு</strong> & சிறு-நுகர்வோர் பில்கள் — மின்சக்தி, நிலைக் கட்டணம், எரிபொருள் கூடுதல் & மின்சார வரி அனைத்தும் அச்சிடப்பட்ட மொத்தத்துடன் பொருந்துகின்றன.</li><li><strong>LMV-17 / LMV-20</strong> வீட்டு-அல்லாத & பெரிய இணைப்புகள், தேவை-அடிப்படை & சதவீத-FPPA கணிதம் உட்பட.</li>',
    'meth.s3.p2': 'உண்மையான பில்லும் எங்கள் இன்ஜினும் முரண்பட்டால், அதை கட்டண ஆணையின் எங்கள் குறியாக்கத்திலுள்ள பிழையாகக் கருதி லாஜிக்கை சரிசெய்கிறோம் — ஏற்கத்தக்க ரவுண்டிங் வித்தியாசமாக அல்ல.',
    'meth.s4.h2': '4. எதை மாதிரியாக்குகிறோம் — எதை இன்னும் இல்லை',
    'meth.s4.p1': 'எல்லைகளைப் பற்றி தெளிவாக இருப்பதே துல்லியத்தின் ஒரு பகுதி. கருவி நன்றாக மாதிரியாக்குவது:',
    'meth.s4.ul1': '<li>டெலஸ்கோபிக் & நான்-டெலஸ்கோபிக் மின்சக்தி அடுக்குகள், நிலை/தேவை கட்டணங்கள், அதிகப்படி-தேவை அபராதம்.</li><li>ஒரு-யூனிட் & சதவீதம் இரு முறைகளிலும் FPPA, மின்சார வரி, பொதுவான மாநில வரிகள்.</li><li>kVAh தோற்ற-மின்சக்தி பில்லிங் & பவர்-ஃபேக்டர் விளைவுகள்.</li><li>நேர அடிப்படை பீக்/ஆஃப்-பீக் பில்லிங் & மேற்கூரை-சோலார் நெட் மீட்டரிங்.</li><li>திட்டம் நடத்தும் மாநிலங்களுக்கான தகுதியுள்ள வீட்டு அரசு மானியங்கள் — டெல்லி (GNCTD), பஞ்சாப், கர்நாடகா (க்ருஹ ஜோதி), தெலங்கானா & தமிழ்நாடு — நீங்கள் தேர்ந்தெடுத்தால் வீட்டு வகையில் பொருந்தும்.</li>',
    'meth.s4.p2': 'எதை இன்னும் <strong>முழுமையாக</strong> மாதிரியாக்கவில்லை, உண்மையான பில் எங்கு வேறுபடலாம்:',
    'meth.s4.ul2': '<li><strong>சில வகை-சார்ந்த குறைந்தபட்ச கட்டணங்கள்</strong> — எ.கா. LMV-2 குறைந்தபட்ச மாதக் கட்டணம் இன்னும் துல்லியமாக உருவாக்கப்படாத அறியப்பட்ட இடைவெளி.</li><li><strong>மானிய நுணுக்கங்கள்</strong> — ஒவ்வொரு மானியத்தையும் தகுதியுள்ள யூனிட்களில் இலவச மின்சக்தியாக எச்சரிக்கையுடன் மாதிரியாக்குகிறோம் (நிலைக் கட்டணம், FPPA & வரி தொடர்ந்து பொருந்தும்); கர்நாடகா/தெலங்கானா வரம்பை சரியான சராசரி-பயன்பாட்டு சூத்திரத்திற்குப் பதில் நேரடியாக 200 யூனிட்டாக எடுத்துக்கொள்கிறோம். பட்டியலிடப்பட்ட திட்டம் இல்லாத மாநிலங்களில் மானியம் சேர்க்கப்படாது; அங்கு உண்மைப் பில் குறைவாக இருக்கலாம்.</li><li><strong>பல-டிஸ்காம் ஒப்பீட்டு அட்டவணையில் நெட் மீட்டரிங் & தாமத அபராதம்</strong> — சம ஒப்பீட்டுக்காக அங்கு விலக்கப்பட்டுள்ளன; முதன்மை கால்குலேட்டர் இவற்றை ஆதரிக்கிறது.</li>',
    'meth.s4.p3': 'ஒவ்வொரு முடிவும் <strong>தோராய மதிப்பீடே</strong>. கட்டணங்கள் துணை-வகை, அடுக்கு, நகரம் & அனுமதிப்படி மாறும்; எனவே எப்போதும் அச்சிடப்பட்ட பில்லுடன் சரிபார்க்கப் பரிந்துரைக்கிறோம்.',
    'meth.s5.h2': '5. எவ்வளவு அடிக்கடி புதுப்பிக்கப்படுகிறது',
    'meth.s5.p1': 'புதிய கட்டண ஆணைகளும் FPPA சுற்றறிக்கைகளும் வெளியானதும் விகிதங்கள் புதுப்பிக்கப்படும் — அடிப்படைக் கட்டணத்திற்கு பொதுவாக ஆண்டுக்கு ஒருமுறை (ஒவ்வொரு SERC ஆணையின்படி), மாதமோ காலாண்டோ மாறும் எரிபொருள் கூடுதலுக்கு அடிக்கடி. உண்மையான பில்கள் மூலம் வந்த திருத்தங்கள் அடிப்படை கட்டணத் தரவில் சேர்க்கப்படும்; ஒரு நுகர்வோருக்கான திருத்தம் அந்தக் கட்டணத்திலுள்ள அனைவருக்கும் மதிப்பீட்டை மேம்படுத்தும்.',
    'meth.s6.h2': '6. சுயாட்சி',
    'meth.s6.p1': 'TheDiscomBill <strong>சுயாதீனமானது</strong>; எந்த டிஸ்காம், SERC அல்லது அரசு அமைப்புடனும் இணைந்தது அல்ல. எங்கள் மதிப்பீடு வழிகாட்டுதலே — சட்டத் தீர்ப்போ அதிகாரப்பூர்வ பில்லோ அல்ல. முறையான தகராறுக்கு உங்கள் டிஸ்காமின் குறைதீர்ப்பு மன்றத்தைப் பயன்படுத்துங்கள்; குறிப்பிட்ட பில்லின் மனித ஆய்வுக்கு எங்கள் <a href="/bill-review/">நிபுணர் பில் ஆய்வு</a> சேவை உதவும்.',
    'meth.s7.h2': 'செயலில் பாருங்கள்',
    'meth.card1': '<strong>பில் கால்குலேட்டர்</strong><span>விரிவான, அடுக்கு வாரியான மதிப்பீட்டுக்கு உங்கள் யூனிட்களையும் சுமையையும் உள்ளிடுங்கள்</span>',
    'meth.card2': '<strong>மாநிலம் வாரியான கட்டணங்கள்</strong><span>ஒவ்வொரு மதிப்பீட்டுக்கும் பின்னாலுள்ள சரியான அடுக்கு விகிதங்கள், நிலைக் கட்டணங்கள் & FPPA</span>',
    'meth.card3': '<strong>பில் சொற்களஞ்சியம்</strong><span>ஒவ்வொரு கட்டண வரிக்கும் குறியீட்டுக்கும் எளிய-மொழி விளக்கங்கள்</span>',
    'meth.disclaimer': 'எண்கள் வெளியிடப்பட்ட கட்டண ஆணைகளிலிருந்து கணக்கிடப்பட்டு மாதிரி பில்களுடன் சரிபார்க்கப்பட்ட தோராய மதிப்பீடுகள்; எந்தக் கட்டணத்தின் சரியான நடைமுறையும் மாநிலம், டிஸ்காம் & நுகர்வோர் வகைப்படி மாறும். எப்போதும் உங்கள் டிஸ்காமின் கட்டண ஆணையுடனோ அச்சிடப்பட்ட பில்லுடனோ சரிபாருங்கள்.',
    // Glossary page framing (/glossary/)
    'gloss.crumb': 'சொற்களஞ்சியம்',
    'gloss.h1': 'மின் கட்டணச் சொற்களஞ்சியம்',
    'gloss.lead': 'இந்திய மின்சாரப் பில்லின் ஒவ்வொரு கட்டண வரியும் குறியீடும், எளிய மொழியில். இவையே எங்கள் <a href="/#calculator">பில் கால்குலேட்டர்</a> & <a href="/tariffs/states/">கட்டணப் பக்கங்களுக்குப்</a> பின்னாலுள்ள சொற்கள் — <a href="#fppa">FPPA</a> & <a href="#electricity-duty">மின்சார வரி</a> முதல் <a href="#telescopic-slabs">டெலஸ்கோபிக் அடுக்குகள்</a> & <a href="#kvah">kVAh</a> வரை.',
    'gloss.aka': 'வேறு பெயர்கள்:',
    'gloss.backToTop': '↑ எல்லா சொற்களுக்கும் திரும்பு',
    'gloss.work.h2': 'இந்தச் சொற்களைப் பயன்படுத்துங்கள்',
    'gloss.card1': '<strong>பில் கால்குலேட்டர்</strong><span>விரிவான மதிப்பீட்டுக்கு இந்தக் கட்டணங்களை உங்கள் யூனிட் & சுமையில் பொருத்துங்கள்</span>',
    'gloss.card2': '<strong>பில் வழிகாட்டிகள்</strong><span>விரிவான வழிநடத்தல்: பில்லை வாசிப்பது, பில் ஏன் உயர்கிறது, நேர அடிப்படை பில்லிங்</span>',
    'gloss.card3': '<strong>மாநிலம் வாரியான கட்டணங்கள்</strong><span>ஒவ்வொரு டிஸ்காமின் நேரடி அடுக்கு விகிதங்கள், நிலைக் கட்டணங்கள் & FPPA</span>',
    'gloss.disclaimer': 'பொதுவான இந்தியக் கட்டண நடைமுறையின் அடிப்படையிலான பொது விளக்கங்கள்; எந்தக் கட்டணத்தின் சரியான நடைமுறையும் மாநிலம், டிஸ்காம் & நுகர்வோர் வகைப்படி மாறும். உங்கள் டிஸ்காமின் கட்டண ஆணையுடனோ அச்சிடப்பட்ட பில்லுடனோ சரிபாருங்கள்.',
    // Footer
    'footer.l1': '&copy; 2026 TheDiscomBill &nbsp;·&nbsp; இந்தியாவுக்கான இலவச மின்சாரக் கட்டணக் கால்குலேட்டர்',
    'footer.l2': 'கட்டணத் தரவு தோராயமானது; பொதுவில் கிடைக்கும் தகவலின் (2025-26) அடிப்படையிலானது. எந்த டிஸ்காம், SERC அல்லது அரசு அமைப்புடனும் இணைந்தது அல்ல. &nbsp;|&nbsp; <a href="#about">பொறுப்புத் துறப்பு</a>',
  },
};

// Language registry — one row per supported UI language. `badge` is the compact
// trigger label, `hreflang` matches the <link rel="alternate"> codes on pre-rendered
// twin pages, and `font` names the Google-Fonts family for the script (loaded on
// demand; null = covered by the base Latin faces). Adding a language = a STRINGS
// dict + a row here; the switcher menu on every page is built from this list.
export const LANGS = [
  { code: 'en', name: 'English', badge: 'EN',  hreflang: 'en-IN', font: null },
  { code: 'hi', name: 'हिंदी',    badge: 'हिं',  hreflang: 'hi-IN', font: 'Noto Sans Devanagari' },
  { code: 'mr', name: 'मराठी',   badge: 'म',   hreflang: 'mr-IN', font: 'Noto Sans Devanagari' },
  { code: 'ta', name: 'தமிழ்',   badge: 'த',   hreflang: 'ta-IN', font: 'Noto Sans Tamil' },
];
const langMeta = (code) => LANGS.find(l => l.code === code) || LANGS[0];

// Script webfonts are loaded on demand — only when a language needing them is
// activated — so English visitors never download them. Injected once per family;
// the CSS stack already lists the Indic families after the Latin faces, so the
// glyphs are picked up per-glyph.
const fontsRequested = new Set();
function ensureLangFont(lang) {
  const family = langMeta(lang).font;
  if (!family || fontsRequested.has(family)) return;
  fontsRequested.add(family);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

export function applyLang(lang) {
  ensureLangFont(lang);
  // The glossary page injects window.__i18nGlossary = { en:{…}, hi:{…} } with its per-term
  // strings (kept in glossary-content.js, not duplicated here). Merge them in so the same
  // data-i18n loops below translate the term headings, definitions and bodies too.
  const base = STRINGS[lang] || STRINGS.en;
  const extra = (typeof window !== 'undefined' && window.__i18nGlossary && window.__i18nGlossary[lang]) || null;
  const dict = extra ? { ...base, ...extra } : base;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const v = dict[el.dataset.i18nHtml];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = dict[el.dataset.i18nPh];
    if (v != null) el.placeholder = v;
  });
  document.documentElement.lang = STRINGS[lang] ? lang : 'en';
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

// Pages with a pre-rendered twin in the other language (tariff/guide/glossary
// pages) declare it via a hreflang alternate link. Switching language there
// must navigate to the twin — the in-place dictionary swap only covers the
// shared chrome, not the page body. Returns the twin's path, or null when the
// current page has no twin (or is already the right language).
function altUrlFor(lang) {
  const want = langMeta(lang).hreflang;
  const link = document.querySelector(`link[rel="alternate"][hreflang="${want}"]`);
  if (!link) return null;
  try {
    const u = new URL(link.href);
    return u.pathname === location.pathname ? null : u.pathname + location.search + location.hash;
  } catch (e) { return null; }
}

// Reflect the active language in the custom dropdown (trigger label + selected option).
function syncLangUI(lang) {
  const trigger = document.getElementById('langTriggerText');
  if (trigger) trigger.textContent = langMeta(lang).badge;
  document.querySelectorAll('#langMenu .lang-opt').forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.lang === lang ? 'true' : 'false');
  });
}

// Rebuild the switcher menu from the registry so every page — including the 370+
// pre-rendered ones, whose static HTML only lists EN/HI — offers every language
// without touching their markup. (The static <li>s are just a no-JS placeholder;
// the menu itself only works with JS anyway.)
function buildLangMenu(menu) {
  menu.innerHTML = LANGS.map(l =>
    `<li class="lang-opt" role="option" data-lang="${l.code}" aria-selected="false"><span class="lang-opt-name">${l.name}</span><span class="lang-opt-code">${l.badge}</span></li>`
  ).join('');
}

export function initI18n() {
  let lang = 'en';
  try { lang = localStorage.getItem('lang') || 'en'; } catch (e) {}
  if (!STRINGS[lang]) lang = 'en';

  // Honour the saved language on every landing: site links always point at the
  // English URLs, so a Hindi user following the nav lands on the English variant.
  // If this page has a twin in the chosen language, go there. (/hi/ pages persist
  // 'hi' before this runs, and explicit "Read in English" clicks persist 'en', so
  // this can't loop or fight an explicit choice.)
  const preferredTwin = altUrlFor(lang);
  if (preferredTwin) { location.replace(preferredTwin); return; }
  // Saved language has no twin here, but the page body is a pre-rendered Hindi
  // twin (e.g. an mr/ta user landing on a /hi/ URL): fall back to the English
  // body — the dictionary swap below still renders the chrome in their language.
  if (lang !== 'hi' && document.documentElement.lang === 'hi') {
    const enTwin = altUrlFor('en');
    if (enTwin) { location.replace(enTwin); return; }
  }

  const sw = document.getElementById('langSwitch');
  const trigger = document.getElementById('langTrigger');
  const menu = document.getElementById('langMenu');

  if (sw && trigger && menu) {
    buildLangMenu(menu);
    const opts = [...menu.querySelectorAll('.lang-opt')];
    const openMenu = () => { sw.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); };
    const closeMenu = (focusTrigger) => {
      sw.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      opts.forEach(o => o.classList.remove('is-active'));
      if (focusTrigger) trigger.focus();
    };
    const choose = (l) => {
      // No twin in the chosen language, and we're sitting on a Hindi-body twin
      // (mr/ta only exist as chrome for now): land on the English body instead of
      // leaving a Hindi page dressed in Marathi/Tamil chrome.
      const twin = altUrlFor(l)
        || (l !== 'hi' && document.documentElement.lang === 'hi' ? altUrlFor('en') : null);
      if (twin) {
        // Persist before navigating so the twin page boots in the chosen language.
        try { localStorage.setItem('lang', l); } catch (e) {}
        location.href = twin;
        return;
      }
      applyLang(l); syncLangUI(l); closeMenu(true);
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      sw.classList.contains('open') ? closeMenu() : openMenu();
    });
    opts.forEach(opt => opt.addEventListener('click', () => choose(opt.dataset.lang)));

    // Keyboard: arrows move a highlight, Enter/Space selects, Escape closes.
    const move = (dir) => {
      const cur = opts.findIndex(o => o.classList.contains('is-active'));
      const next = (cur < 0 ? (dir > 0 ? 0 : opts.length - 1) : (cur + dir + opts.length) % opts.length);
      opts.forEach(o => o.classList.remove('is-active'));
      opts[next].classList.add('is-active');
    };
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(); move(1); }
    });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Escape') { e.preventDefault(); closeMenu(true); }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const act = opts.find(o => o.classList.contains('is-active'));
        if (act) choose(act.dataset.lang);
      }
    });
    // Make the open menu reachable by keyboard.
    menu.setAttribute('tabindex', '-1');
    trigger.addEventListener('click', () => { if (sw.classList.contains('open')) menu.focus(); });

    document.addEventListener('click', (e) => { if (!sw.contains(e.target)) closeMenu(); });
  }

  // The in-body "यह पेज हिंदी में पढ़ें / Read in English" link navigates to the
  // twin like the dropdown does, but being a plain <a> it wouldn't persist the
  // choice — leaving the destination page's chrome in the old language. Persist
  // the target language (from the link's lang attribute) so both paths stay in sync.
  document.querySelectorAll('.seo-lang-link a[lang]').forEach(a => {
    a.addEventListener('click', () => {
      const target = a.getAttribute('lang');
      if (STRINGS[target]) { try { localStorage.setItem('lang', target); } catch (e) {} }
    });
  });

  syncLangUI(lang);
  applyLang(lang);
}

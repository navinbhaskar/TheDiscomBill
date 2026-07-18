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
    'ql.ev': 'EV Charging Cost',
    'ql.tariffsByState': 'Tariffs by State & DISCOM',
    'ql.discomServices': 'DISCOM Services',
    'ql.smartMeter': 'Smart Meter Recharge',
    'ql.billReviewGroup': 'Get Your Bill Reviewed',
    'ql.ocrCheck': 'Instant Self-Check (OCR)',
    'ql.billReview': 'From an Expert',
    'ql.guides': 'Articles & Guides',
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
    'legend.required': 'Marks a required field',
    'label.state': 'State / Union Territory',
    'label.discom': 'Electricity Utility (DISCOM)',
    'label.category': 'Consumer Category',
    'label.supplyType': 'Supply Type / Area',
    'label.consumerName': 'Consumer Name',
    'label.accountNo': 'Account / Consumer No.',
    'label.address': 'Address',
    'label.billingMonth': 'Billing Month & Year',
    'label.billingBasis': 'Billing basis',
    'label.fromDate': 'From Date',
    'label.toDate': 'To Date',
    'small.fromDate': 'Billing period start date',
    'small.toDate': 'Billing period end date',
    'label.sanctioned': 'Sanctioned Load (kW)',
    'small.sanctioned': 'Contracted / sanctioned load. Used for fixed charge and excess demand check.',
    'small.fppa': 'Uncheck above (or type a value) to enter manually · can be negative (credit).',
    // Tabs
    'tab.meterread': 'Meter Read',
    'tab.arrear': 'Arrear',
    'tab.payment': 'Payment',
    'tab.adjustment': 'Adjustment',
    'mode.todSplit': 'TOD split (peak / normal / off-peak units)',
    'label.billedAmount': 'Amount on your actual bill (₹) — optional',
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
    // EV charging cost calculator (/ev/)
    'ev.title': 'EV Charging Cost Calculator',
    'ev.intro': 'What does charging your EV at home <strong>really</strong> cost? Pick your vehicle, enter your monthly km and your tariff — get cost per charge, cost per km, your monthly charging bill and exactly how much you save vs petrol.',
    'ev.chip1': 'Real charging losses included',
    'ev.chip2': 'Petrol comparison built-in',
    'ev.chip3': 'Free · no sign-up',
    'ev.select': 'Your EV',
    'ev.battery': 'Battery (kWh)',
    'ev.range': 'Real-world range (km)',
    'ev.km': 'You drive per month (km)',
    'ev.rate': 'Your tariff (₹/unit)',
    'ev.rateLink': "Find your DISCOM's rate →",
    'ev.advanced': 'Advanced',
    'ev.loss': 'Charging loss (%)',
    'ev.lossHint': 'AC charging wastes ~8–12% as heat; you pay for it.',
    'ev.publicRate': 'Public DC rate (₹/unit)',
    'ev.petrol': 'Petrol price (₹/litre)',
    'ev.mileage': 'Petrol mileage (km/litre)',
    'ev.empty': 'Pick an EV and enter your monthly km to see your charging cost.',
    'ev.heroLabel': 'Your EV running cost',
    'ev.perKmUnit': ' per km',
    'ev.vsPetrol': 'vs petrol',
    'ev.rCharge': 'Cost per full charge',
    'ev.rUnits': 'Extra units on your bill',
    'ev.rMonthly': 'Monthly charging cost',
    'ev.rPetrol': 'Petrol for the same km',
    'ev.rSaveMo': 'You save vs petrol',
    'ev.rSaveYr': 'Yearly savings',
    'ev.rTime33': 'Charge time · 15A socket (3.3 kW)',
    'ev.rTime72': 'Charge time · wallbox (7.2 kW)',
    'ev.rPublic': 'Public DC fast charging',
    'ev.chartTitle': 'Monthly cost: home vs public vs petrol',
    'ev.share': 'Share this estimate on WhatsApp',
    'ev.note': 'Home charging is billed at your domestic slab rate — EV units land <em>on top of</em> your household usage, so use your top-slab rate for accuracy (find it on our <a href="/tariffs/states/">tariff pages</a>). Several states (Delhi, Maharashtra, Karnataka, UP and others) have dedicated EV-charging categories or night Time-of-Day discounts that can cut the rate further. Installing a 7.2 kW wallbox usually needs a sanctioned-load upgrade from your DISCOM — check before you install. Charge times are 0→100% approximations that ignore end-of-charge taper.',

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
const isLang = (code) => LANGS.some(l => l.code === code);

// Non-English string tables live in js/i18n/<lang>.js and are dynamic-imported
// the first time that language is activated — English visitors download none of
// them (they used to ride along in this file, ~160 KB of dead weight).
async function loadStrings(lang) {
  if (STRINGS[lang]) return STRINGS[lang];
  try {
    STRINGS[lang] = (await import(`./i18n/${lang}.js`)).default;
  } catch (e) { /* offline or missing table — keep English */ }
  return STRINGS[lang] || STRINGS.en;
}

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

export async function applyLang(lang) {
  if (!isLang(lang)) lang = 'en';
  ensureLangFont(lang);
  // The glossary page injects window.__i18nGlossary = { en:{…}, hi:{…} } with its per-term
  // strings (kept in glossary-content.js, not duplicated here). Merge them in so the same
  // data-i18n loops below translate the term headings, definitions and bodies too.
  const base = await loadStrings(lang);
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
  // A failed table load leaves base === STRINGS.en — report the language the
  // page actually shows, not the one that was asked for.
  document.documentElement.lang = base === STRINGS.en ? 'en' : lang;
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
// Which languages the switcher should offer on THIS page. App pages (calculator, tools)
// translate their whole body at runtime, so they offer every language. Static-body content
// pages translate only via a pre-rendered twin; they opt in with <html data-i18n-twins-only>
// and we then hide any language they have no twin for — otherwise the option is a dead click
// that leaves the body in the wrong language (e.g. the Methodology page, which has no twins).
function availableLangs() {
  if (!document.documentElement.hasAttribute('data-i18n-twins-only')) return LANGS;
  const here = document.documentElement.lang || 'en';
  return LANGS.filter(l =>
    l.code === 'en' ||
    l.code === here ||
    document.querySelector(`link[rel="alternate"][hreflang="${l.hreflang}"]`)
  );
}

function buildLangMenu(menu) {
  menu.innerHTML = availableLangs().map(l =>
    `<li class="lang-opt" role="option" data-lang="${l.code}" aria-selected="false"><span class="lang-opt-name">${l.name}</span><span class="lang-opt-code">${l.badge}</span></li>`
  ).join('');
}

export function initI18n() {
  let lang = 'en';
  try { lang = localStorage.getItem('lang') || 'en'; } catch (e) {}
  if (!isLang(lang)) lang = 'en';

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
    // Register with the shared popup coordinator so opening another popup (account,
    // Quick Links, review chooser) dismisses this one, and vice versa.
    window.__popups?.register('lang', () => closeMenu(false));
    const openMenu = () => {
      window.__popups?.closeOthers('lang');   // shared coordinator: only one popup open at a time
      sw.classList.add('open'); trigger.setAttribute('aria-expanded', 'true');
    };
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
      if (isLang(target)) { try { localStorage.setItem('lang', target); } catch (e) {} }
    });
  });

  syncLangUI(lang);
  applyLang(lang);
}

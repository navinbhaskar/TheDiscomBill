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
    'ql.billReview': 'Bill Review by Experts',
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
    'hero.cta2': 'Get my bill reviewed by an expert',
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
    // Buttons
    'btn.addMeter': '+ Add meter',
    'btn.calculate': '⚡ Calculate Provisional Bill',
    'btn.sample': 'Try a sample bill',
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
    'ql.billReview': 'विशेषज्ञ बिल समीक्षा',
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
    'hero.cta2': 'मेरे बिल की विशेषज्ञ से जाँच कराएँ',
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
    // Buttons
    'btn.addMeter': '+ मीटर जोड़ें',
    'btn.calculate': '⚡ अनुमानित बिल गणना करें',
    'btn.sample': 'नमूना बिल देखें',
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
};

const LANG_CODE = { en: 'EN', hi: 'हिं' };

// Devanagari webfont (Noto Sans Devanagari) is loaded on demand — only when Hindi is
// activated — so English visitors never download it. Injected once; the CSS stack already
// lists 'Noto Sans Devanagari' after the Latin faces, so Hindi glyphs pick it up per-glyph.
let devanagariRequested = false;
function ensureDevanagariFont() {
  if (devanagariRequested) return;
  devanagariRequested = true;
  const href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap';
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function applyLang(lang) {
  if (lang === 'hi') ensureDevanagariFont();
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
  document.documentElement.lang = (lang === 'hi') ? 'hi' : 'en';
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

// Pages with a pre-rendered twin in the other language (tariff/guide/glossary
// pages) declare it via a hreflang alternate link. Switching language there
// must navigate to the twin — the in-place dictionary swap only covers the
// shared chrome, not the page body. Returns the twin's path, or null when the
// current page has no twin (or is already the right language).
function altUrlFor(lang) {
  const want = lang === 'hi' ? 'hi-IN' : 'en-IN';
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
  if (trigger) trigger.textContent = LANG_CODE[lang] || 'EN';
  document.querySelectorAll('#langMenu .lang-opt').forEach(opt => {
    opt.setAttribute('aria-selected', opt.dataset.lang === lang ? 'true' : 'false');
  });
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

  const sw = document.getElementById('langSwitch');
  const trigger = document.getElementById('langTrigger');
  const menu = document.getElementById('langMenu');

  if (sw && trigger && menu) {
    const opts = [...menu.querySelectorAll('.lang-opt')];
    const openMenu = () => { sw.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); };
    const closeMenu = (focusTrigger) => {
      sw.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      opts.forEach(o => o.classList.remove('is-active'));
      if (focusTrigger) trigger.focus();
    };
    const choose = (l) => {
      const twin = altUrlFor(l);
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

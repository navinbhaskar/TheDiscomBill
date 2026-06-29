// js/i18n.js — lightweight i18n layer. Elements carrying a data-i18n="key" attribute have their
// text replaced from the active language's dictionary; data-i18n-html sets innerHTML (for strings
// with inline markup) and data-i18n-ph sets an input placeholder. English is the source/fallback.
// Hindi covers the page chrome — labels, buttons, tabs, hints and the About section. The generated
// bill, dynamic select options and JS-managed unit labels stay English (they're value/logic-bound).
// The choice is persisted in localStorage.

const STRINGS = {
  en: {
    // Header / nav
    'tagline': 'Electricity Bill Calculator · All India',
    'nav.calculator': 'Calculator',
    'nav.compare': 'Compare',
    'nav.about': 'About',
    // Hero
    'hero.badge': 'Free · All DISCOMs · No Login Required',
    'hero.title': 'Electricity Bill Calculator for Every DISCOM in India',
    'hero.sub': 'Get an instant provisional bill with slab-wise breakdown for any state electricity utility.',
    'hero.cta': 'Calculate my bill',
    'hero.stat.states': 'States & UTs',
    'hero.stat.discoms': 'DISCOMs',
    'hero.stat.categories': 'Categories',
    'hero.feat.slab': 'Slab-wise energy charges',
    'hero.feat.fppa': 'Fixed & fuel surcharge (FPPA)',
    'hero.feat.solar': 'Solar net metering',
    'hero.feat.tod': 'Time-of-Day & kVAh billing',
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
    'label.delhiSubsidy': 'Delhi GNCTD Subsidy',
    'chk.applySubsidy': 'Apply government subsidy',
    'small.subsidy': '≤200 units: zero bill. 201–400 units: 50% rebate.',
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
    'small.lpscApplicable': 'Rate &amp; months-late are set in the Arrear tab. Uncheck if late-payment surcharge does not apply for this consumer / period.',
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
    // Footer
    'footer.l1': '&copy; 2024 TheDiscomBill &nbsp;·&nbsp; Free Electricity Bill Calculator for India',
    'footer.l2': 'Tariff data is approximate and based on publicly available information (2024-25). Not affiliated with any DISCOM, SERC, or government body. &nbsp;|&nbsp; <a href="#about">Disclaimer</a>',
  },
  hi: {
    // Header / nav
    'tagline': 'बिजली बिल कैलकुलेटर · पूरे भारत के लिए',
    'nav.calculator': 'कैलकुलेटर',
    'nav.compare': 'तुलना',
    'nav.about': 'परिचय',
    // Hero
    'hero.badge': 'निःशुल्क · सभी डिस्कॉम · बिना लॉगिन',
    'hero.title': 'भारत के हर डिस्कॉम के लिए बिजली बिल कैलकुलेटर',
    'hero.sub': 'किसी भी राज्य की बिजली कंपनी के लिए स्लैब-वार विवरण के साथ तुरंत अनुमानित बिल पाएं।',
    'hero.cta': 'मेरा बिल जानें',
    'hero.stat.states': 'राज्य व केंद्रशासित',
    'hero.stat.discoms': 'डिस्कॉम',
    'hero.stat.categories': 'श्रेणियाँ',
    'hero.feat.slab': 'स्लैब-वार ऊर्जा शुल्क',
    'hero.feat.fppa': 'फिक्स्ड व ईंधन अधिभार (FPPA)',
    'hero.feat.solar': 'सोलर नेट मीटरिंग',
    'hero.feat.tod': 'टाइम-ऑफ-डे व kVAh बिलिंग',
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
    'label.delhiSubsidy': 'दिल्ली GNCTD सब्सिडी',
    'chk.applySubsidy': 'सरकारी सब्सिडी लागू करें',
    'small.subsidy': '≤200 यूनिट: शून्य बिल। 201–400 यूनिट: 50% छूट।',
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
    // Footer
    'footer.l1': '&copy; 2024 TheDiscomBill &nbsp;·&nbsp; भारत के लिए निःशुल्क बिजली बिल कैलकुलेटर',
    'footer.l2': 'टैरिफ डेटा अनुमानित है और सार्वजनिक रूप से उपलब्ध जानकारी (2024-25) पर आधारित है। किसी भी डिस्कॉम, SERC या सरकारी संस्था से संबद्ध नहीं। &nbsp;|&nbsp; <a href="#about">अस्वीकरण</a>',
  },
};

const LANG_CODE = { en: 'EN', hi: 'हिं' };

export function applyLang(lang) {
  const dict = STRINGS[lang] || STRINGS.en;
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
    const choose = (l) => { applyLang(l); syncLangUI(l); closeMenu(true); };

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

  syncLangUI(lang);
  applyLang(lang);
}

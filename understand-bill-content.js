// understand-bill-content.js — the prose of /understand-your-bill/, in all four languages.
//
// BUILD-TIME ONLY. This file never reaches the browser: the bill re-renders on every input
// change, so the words the BILL renders live in js/bill-strings.js, which does ship. Keeping
// the long-form prose out of that bundle is the whole reason the two files are separate.
//
// The page shows a SCHEMATIC bill, not a facsimile of any one DISCOM's paper. Real bills from
// UPPCL, MSEDCL and KSEB share almost no layout: different field names, different orderings,
// some print FPPA as its own line and some fold it into the energy charge. A drawn copy of one
// utility's stationery would be wrong for everyone else and would go stale silently the next
// time that utility redesigned its bill. So the layout is one honest canonical arrangement,
// labelled as such, and the DISCOM selector changes the NUMBERS and WHICH LINES EXIST — which
// is the part that actually teaches something.
//
// No figures are written here. Every number on the bill comes from js/engine.js, the same
// engine behind the calculator, so the explanations describe arithmetic that really ran, and a
// tariff revision reaches this page without anyone editing it.
//
// TRANSLATION NOTE — the same rule as js/bill-strings.js and the meter diagram: FPPA, PPAC,
// FAC, LPSC, MD, GST, OK, kW, kWh, kVAh and DISCOM stay in English in every language. They are
// what a real Indian bill prints and what people actually search for; translating them would
// make the page harder to match against the document in the reader's hand.

// Link labels, defined once because most of them are used from two or three different
// explanations. A typo fixed here is fixed everywhere it appears.
const L = {
  checkBill: {
    en: 'Check a bill you have received',
    hi: 'अपना आया हुआ बिल जाँचें',
    mr: 'तुम्हाला आलेले बिल तपासा',
    ta: 'உங்களுக்கு வந்த பில்லைச் சரிபாருங்கள்',
  },
  tariffsByState: {
    en: 'Tariff schedules by state and DISCOM',
    hi: 'राज्य और DISCOM के अनुसार टैरिफ़ अनुसूची',
    mr: 'राज्य आणि DISCOM नुसार टॅरिफ अनुसूची',
    ta: 'மாநிலம் மற்றும் DISCOM வாரியான கட்டண அட்டவணை',
  },
  glossary: {
    en: 'Bill glossary', hi: 'बिल शब्दावली', mr: 'बिल शब्दसंग्रह', ta: 'பில் சொற்களஞ்சியம்',
  },
  cutFixed: {
    en: 'How to cut your fixed charge',
    hi: 'नियत प्रभार कैसे घटाएँ',
    mr: 'स्थिर आकार कसा कमी करावा',
    ta: 'நிலையான கட்டணத்தை எப்படிக் குறைப்பது',
  },
  loadOptimizer: {
    en: 'Sanctioned load optimizer',
    hi: 'स्वीकृत भार ऑप्टिमाइज़र',
    mr: 'मंजूर भार ऑप्टिमायझर',
    ta: 'அனுமதிக்கப்பட்ட சுமை ஆப்டிமைசர்',
  },
  loadRight: {
    en: 'Is your sanctioned load right?',
    hi: 'क्या आपका स्वीकृत भार सही है?',
    mr: 'तुमचा मंजूर भार योग्य आहे का?',
    ta: 'உங்கள் அனுமதிக்கப்பட்ட சுமை சரியா?',
  },
  cheaperOption: {
    en: 'Work out the cheaper option',
    hi: 'कौन-सा विकल्प सस्ता है, हिसाब लगाइए',
    mr: 'कोणता पर्याय स्वस्त, हिशोब करा',
    ta: 'எது மலிவு என்று கணக்கிடுங்கள்',
  },
  fppaByState: {
    en: 'This month’s fuel surcharge, by state',
    hi: 'इस महीने का ईंधन अधिभार, राज्यवार',
    mr: 'या महिन्याचा इंधन अधिभार, राज्यनिहाय',
    ta: 'இந்த மாத எரிபொருள் கூடுதல் கட்டணம், மாநில வாரியாக',
  },
  fppaCurrent: {
    en: 'Current rates by state',
    hi: 'राज्यवार वर्तमान दरें',
    mr: 'राज्यनिहाय सध्याचे दर',
    ta: 'மாநில வாரியான நடப்பு விகிதங்கள்',
  },
  unpaid: {
    en: 'What happens when a bill goes unpaid',
    hi: 'बिल न चुकाने पर क्या होता है',
    mr: 'बिल न भरल्यास काय होते',
    ta: 'பில் செலுத்தாவிட்டால் என்ன ஆகும்',
  },
  readMeter: {
    en: 'Reading a smart meter yourself',
    hi: 'स्मार्ट मीटर खुद कैसे पढ़ें',
    mr: 'स्मार्ट मीटर स्वतः कसे वाचावे',
    ta: 'ஸ்மார்ட் மீட்டரை நீங்களே படிப்பது எப்படி',
  },
  meterSymbols: {
    en: 'What every meter symbol means',
    hi: 'मीटर के हर चिह्न का मतलब',
    mr: 'मीटरवरील प्रत्येक चिन्हाचा अर्थ',
    ta: 'ஒவ்வொரு மீட்டர் சின்னத்தின் பொருள்',
  },
  powerFactor: {
    en: 'Power factor and kVAh billing',
    hi: 'पावर फैक्टर और kVAh बिलिंग',
    mr: 'पॉवर फॅक्टर आणि kVAh बिलिंग',
    ta: 'பவர் ஃபேக்டர் மற்றும் kVAh பில்லிங்',
  },
  meterWrong: {
    en: 'When you think the meter is wrong',
    hi: 'जब लगे कि मीटर ग़लत है',
    mr: 'मीटर चुकीचे वाटत असेल तेव्हा',
    ta: 'மீட்டர் தவறு என்று தோன்றும்போது',
  },
  compareSlabs: {
    en: 'Compare slab rates across DISCOMs',
    hi: 'DISCOM के बीच स्लैब दरों की तुलना',
    mr: 'DISCOM मधील स्लॅब दरांची तुलना',
    ta: 'DISCOM-களுக்கு இடையே ஸ்லாப் விகிதங்களை ஒப்பிடுங்கள்',
  },
  tod: {
    en: 'Time-of-day billing',
    hi: 'समय-आधारित (ToD) बिलिंग',
    mr: 'वेळेनुसार (ToD) बिलिंग',
    ta: 'நேரம் சார்ந்த (ToD) பில்லிங்',
  },
  loadRaised: {
    en: 'When the DISCOM raises your load',
    hi: 'जब DISCOM आपका भार बढ़ा दे',
    mr: 'DISCOM तुमचा भार वाढवते तेव्हा',
    ta: 'DISCOM உங்கள் சுமையை உயர்த்தும்போது',
  },
  fppaHow: {
    en: 'How FPPA is calculated',
    hi: 'FPPA की गणना कैसे होती है',
    mr: 'FPPA ची गणना कशी होते',
    ta: 'FPPA எப்படிக் கணக்கிடப்படுகிறது',
  },
  fppaUpCap: {
    en: 'The 10% cap in Uttar Pradesh',
    hi: 'उत्तर प्रदेश में 10% की सीमा',
    mr: 'उत्तर प्रदेशातील 10% मर्यादा',
    ta: 'உத்தரப் பிரதேசத்தில் 10% உச்சவரம்பு',
  },
  msedclBill: {
    en: 'How to read an MSEDCL bill',
    hi: 'MSEDCL का बिल कैसे पढ़ें',
    mr: 'MSEDCL चे बिल कसे वाचावे',
    ta: 'MSEDCL பில்லை எப்படிப் படிப்பது',
  },
  msedclFppa: {
    en: 'MSEDCL’s own surcharge lines',
    hi: 'MSEDCL की अपनी अधिभार पंक्तियाँ',
    mr: 'MSEDCL च्या स्वतःच्या अधिभार ओळी',
    ta: 'MSEDCL-இன் சொந்த கூடுதல் கட்டண வரிகள்',
  },
  dutyGuide: {
    en: 'Electricity duty, state by state',
    hi: 'विद्युत शुल्क, राज्य दर राज्य',
    mr: 'वीज शुल्क, राज्यानुसार',
    ta: 'மின் வரி, மாநிலம் வாரியாக',
  },
  bsesBill: {
    en: 'How to read a BSES Delhi bill',
    hi: 'BSES दिल्ली का बिल कैसे पढ़ें',
    mr: 'BSES दिल्लीचे बिल कसे वाचावे',
    ta: 'BSES டெல்லி பில்லை எப்படிப் படிப்பது',
  },
  tpcodlBill: {
    en: 'How to read a TPCODL Odisha bill',
    hi: 'TPCODL ओडिशा का बिल कैसे पढ़ें',
    mr: 'TPCODL ओडिशाचे बिल कसे वाचावे',
    ta: 'TPCODL ஒடிசா பில்லை எப்படிப் படிப்பது',
  },
  calcOwn: {
    en: 'Calculate your own bill',
    hi: 'अपना बिल जोड़ें',
    mr: 'तुमचे बिल मोजा',
    ta: 'உங்கள் பில்லைக் கணக்கிடுங்கள்',
  },
  billReview: {
    en: 'Have a bill reviewed',
    hi: 'बिल की जाँच कराएँ',
    mr: 'बिलाची तपासणी करून घ्या',
    ta: 'பில்லை ஆய்வு செய்யச் சொல்லுங்கள்',
  },
};

/**
 * Labels for the scenarios. The scenarios themselves — which DISCOM, which category, the
 * default units and load — live in js/bill-anatomy.js, because the browser needs those and
 * must not be made to download this file's prose to get them.
 *
 * Keyed by scenario id; a scenario without an entry here would render an empty <option>, so
 * the generator throws on that rather than shipping one.
 */
export const SCENARIO_COPY = {
  'uppcl-domestic': {
    label: {
      en: 'UPPCL (Uttar Pradesh) — Domestic',
      hi: 'UPPCL (उत्तर प्रदेश) — घरेलू',
      mr: 'UPPCL (उत्तर प्रदेश) — घरगुती',
      ta: 'UPPCL (உத்தரப் பிரதேசம்) — வீட்டு உபயோகம்',
    },
    note: {
      en: 'Urban domestic above 1 kW. Electricity Duty is a percentage of the whole bill here.',
      hi: '1 kW से ऊपर शहरी घरेलू। यहाँ विद्युत शुल्क पूरे बिल का एक प्रतिशत है।',
      mr: '1 kW वरील शहरी घरगुती. इथे वीज शुल्क संपूर्ण बिलाच्या टक्केवारीत आहे.',
      ta: '1 kW மேலான நகர்ப்புற வீட்டு இணைப்பு. இங்கே மின் வரி முழு பில்லின் சதவீதமாக உள்ளது.',
    },
  },
  'msedcl-domestic': {
    label: {
      en: 'MSEDCL (Maharashtra) — Domestic',
      hi: 'MSEDCL (महाराष्ट्र) — घरेलू',
      mr: 'MSEDCL (महाराष्ट्र) — घरगुती',
      ta: 'MSEDCL (மகாராஷ்டிரா) — வீட்டு உபயோகம்',
    },
    note: {
      en: 'Adds a Wheeling Charge line, and levies Electricity Duty on the energy charge only.',
      hi: 'एक व्हीलिंग प्रभार की पंक्ति जोड़ता है, और विद्युत शुल्क सिर्फ़ ऊर्जा प्रभार पर लगाता है।',
      mr: 'व्हीलिंग आकाराची एक ओळ जोडते, आणि वीज शुल्क फक्त ऊर्जा आकारावर लावते.',
      ta: 'ஒரு வீலிங் கட்டண வரியைச் சேர்க்கிறது, மின் வரியை ஆற்றல் கட்டணத்தின் மீது மட்டும் விதிக்கிறது.',
    },
  },
  'kseb-domestic': {
    label: {
      en: 'KSEB (Kerala) — Domestic',
      hi: 'KSEB (केरल) — घरेलू',
      mr: 'KSEB (केरळ) — घरगुती',
      ta: 'KSEB (கேரளா) — வீட்டு உபயோகம்',
    },
    note: {
      en: 'Five narrow slabs, and no additional charges at all — the simplest shape a bill takes.',
      hi: 'पाँच छोटे-छोटे स्लैब, और कोई अतिरिक्त प्रभार नहीं — बिल का सबसे सरल रूप।',
      mr: 'पाच लहान स्लॅब, आणि कोणतेही अतिरिक्त आकार नाहीत — बिलाचे सर्वात सोपे रूप.',
      ta: 'ஐந்து சிறிய ஸ்லாப்கள், கூடுதல் கட்டணங்கள் எதுவும் இல்லை — பில்லின் எளிமையான வடிவம்.',
    },
  },
  'delhi-domestic': {
    label: {
      en: 'BRPL (Delhi) — Domestic',
      hi: 'BRPL (दिल्ली) — घरेलू',
      mr: 'BRPL (दिल्ली) — घरगुती',
      ta: 'BRPL (டெல்லி) — வீட்டு உபயோகம்',
    },
    note: {
      en: 'A percentage fuel surcharge (PPAC) at 17.94%, plus the GNCTD subsidy shown as a deduction.',
      hi: '17.94% की दर से प्रतिशत ईंधन अधिभार (PPAC), और साथ में GNCTD सब्सिडी कटौती के रूप में।',
      mr: '17.94% दराने टक्केवारी इंधन अधिभार (PPAC), आणि सोबत GNCTD सबसिडी वजावट म्हणून.',
      ta: '17.94% விகிதத்தில் சதவீத எரிபொருள் கூடுதல் கட்டணம் (PPAC), உடன் GNCTD மானியம் கழிவாக.',
    },
  },
  'odisha-domestic': {
    label: {
      en: 'TPCODL (Odisha) — Domestic',
      hi: 'TPCODL (ओडिशा) — घरेलू',
      mr: 'TPCODL (ओडिशा) — घरगुती',
      ta: 'TPCODL (ஒடிசா) — வீட்டு உபயோகம்',
    },
    note: {
      en: 'Carries a prompt-payment rebate, so the bill shows two totals: one if you pay by the due date, one if you do not.',
      hi: 'समय पर भुगतान की छूट देता है, इसलिए बिल पर दो कुल राशियाँ दिखती हैं: एक देय तिथि तक भुगतान पर, दूसरी उसके बाद।',
      mr: 'वेळेवर भरण्याची सवलत देते, त्यामुळे बिलावर दोन एकूण रकमा दिसतात: एक देय दिनांकापर्यंत भरल्यास, दुसरी त्यानंतर.',
      ta: 'விரைவுச் செலுத்துதல் தள்ளுபடி உண்டு, எனவே பில்லில் இரு மொத்தத் தொகைகள்: ஒன்று கடைசி தேதிக்குள் செலுத்தினால், மற்றொன்று இல்லையெனில்.',
    },
  },
  'uppcl-commercial': {
    label: {
      en: 'UPPCL (Uttar Pradesh) — Commercial',
      hi: 'UPPCL (उत्तर प्रदेश) — व्यावसायिक',
      mr: 'UPPCL (उत्तर प्रदेश) — व्यावसायिक',
      ta: 'UPPCL (உத்தரப் பிரதேசம்) — வணிகம்',
    },
    note: {
      en: 'Billed on recorded maximum demand — and July 2026’s fuel surcharge was a credit, so that line is a refund.',
      hi: 'दर्ज अधिकतम मांग पर बिल बनता है — और जुलाई 2026 का ईंधन अधिभार क्रेडिट था, इसलिए वह पंक्ति वापसी है।',
      mr: 'नोंदलेल्या कमाल मागणीवर बिल होते — आणि जुलै 2026 चा इंधन अधिभार क्रेडिट होता, त्यामुळे ती ओळ परतावा आहे.',
      ta: 'பதிவான அதிகபட்ச தேவையின் மீது பில் — ஜூலை 2026-இன் எரிபொருள் கட்டணம் ஒரு வரவு, எனவே அந்த வரி ஒரு திரும்பப் பணம்.',
    },
  },
};

/**
 * The annotated lines, in the order they are numbered on the bill.
 *
 * `id`      anchors the explanation (#explain-<id>) and ties the marker to it
 * `always`  true = the line is on every bill; false = it appears only when the engine
 *           produces it, and its number is skipped when it does not
 * `title`   the heading of the explanation
 * `body`    build-time prose. Never contains a figure — figures live in the `live` readout,
 *           which the JS rewrites on every change. Mixing the two would mean stale numbers in
 *           the served HTML the moment anything moved.
 * `live`    key into the readout built from the engine result (see js/bill-anatomy.js)
 * `links`   related pages, rendered as a row of chips under the explanation
 */
export const LINES = [
  {
    id: 'consumer-no', always: true, group: 'header',
    links: [['/check-my-bill/', L.checkBill]],
    title: {
      en: 'Consumer number', hi: 'उपभोक्ता संख्या',
      mr: 'ग्राहक क्रमांक', ta: 'நுகர்வோர் எண்',
    },
    body: {
      en: `The account the connection is billed to, not the meter. It survives a meter
        replacement, and it is the number every portal, payment app and complaint form asks for.
        Names vary by state — <strong>Account ID</strong>, <strong>K Number</strong>,
        <strong>CA Number</strong>, <strong>Service Number</strong> — but they are all this
        field. Copy it exactly, including leading zeroes.`,
      hi: `वह खाता जिस पर कनेक्शन का बिल बनता है — मीटर नहीं। मीटर बदल जाए तो भी यह वही रहता है, और
        हर पोर्टल, भुगतान ऐप और शिकायत फ़ॉर्म यही नंबर माँगता है। राज्य के हिसाब से नाम बदलते रहते हैं —
        <strong>Account ID</strong>, <strong>K Number</strong>, <strong>CA Number</strong>,
        <strong>Service Number</strong> — पर सब यही एक खाना हैं। इसे हूबहू लिखिए, शुरू के शून्य समेत।`,
      mr: `ज्या खात्यावर जोडणीचे बिल होते ते — मीटर नव्हे. मीटर बदलले तरी हे तेच राहते, आणि प्रत्येक
        पोर्टल, पेमेंट अ‍ॅप व तक्रार फॉर्म हाच क्रमांक विचारतो. राज्यानुसार नावे बदलतात —
        <strong>Account ID</strong>, <strong>K Number</strong>, <strong>CA Number</strong>,
        <strong>Service Number</strong> — पण सर्व हेच एक रकाना आहेत. सुरुवातीच्या शून्यांसह जसाच्या
        तसा लिहा.`,
      ta: `இணைப்பு எந்தக் கணக்கின் மீது பில் செய்யப்படுகிறதோ அது — மீட்டர் அல்ல. மீட்டர் மாறினாலும் இது
        அப்படியே இருக்கும், ஒவ்வொரு போர்ட்டல், கட்டண செயலி, புகார் படிவமும் இதையே கேட்கும். மாநிலத்திற்கு
        ஏற்ப பெயர்கள் மாறும் — <strong>Account ID</strong>, <strong>K Number</strong>,
        <strong>CA Number</strong>, <strong>Service Number</strong> — ஆனால் எல்லாம் இதே புலம்தான்.
        முன்னால் உள்ள பூஜ்ஜியங்கள் உட்பட அப்படியே நகலெடுங்கள்.`,
    },
  },
  {
    id: 'tariff-category', always: true, group: 'header',
    links: [['/tariffs/states/', L.tariffsByState], ['/glossary/', L.glossary]],
    title: {
      en: 'Tariff category', hi: 'टैरिफ़ श्रेणी',
      mr: 'टॅरिफ श्रेणी', ta: 'கட்டண வகை',
    },
    body: {
      en: `Which rate schedule your connection is billed under. This one code decides your
        slab rates, your fixed charge and whether a demand penalty can apply, so it is the single
        most consequential field on the bill — and the one most often wrong. A home billed under a
        commercial code pays roughly double. If yours does not match how the premises are actually
        used, that is a correction worth chasing.`,
      hi: `आपका कनेक्शन किस दर-अनुसूची पर बिल होता है। यही एक कोड आपकी स्लैब दरें, नियत प्रभार और यह तय
        करता है कि मांग शास्ति लग सकती है या नहीं — यानी बिल का सबसे भारी असर वाला खाना, और सबसे ज़्यादा
        ग़लत रहने वाला भी। व्यावसायिक कोड पर बिल बनने वाला घर लगभग दोगुना चुकाता है। अगर यह आपके परिसर के
        असली उपयोग से मेल नहीं खाता, तो यह सुधार कराने लायक है।`,
      mr: `तुमच्या जोडणीचे बिल कोणत्या दर-अनुसूचीवर होते. हाच एक कोड तुमचे स्लॅब दर, स्थिर आकार आणि मागणी
        दंड लागू होऊ शकतो का हे ठरवतो — म्हणजे बिलावरचा सर्वात परिणामकारक रकाना, आणि सर्वाधिक चुकीचा
        असणाराही. व्यावसायिक कोडवर बिल होणारे घर जवळपास दुप्पट भरते. हे तुमच्या जागेच्या प्रत्यक्ष
        वापराशी जुळत नसेल, तर ती दुरुस्ती करून घेण्यासारखी आहे.`,
      ta: `உங்கள் இணைப்பு எந்த விகித அட்டவணையின் கீழ் பில் செய்யப்படுகிறது. இந்த ஒரு குறியீடுதான் உங்கள்
        ஸ்லாப் விகிதங்கள், நிலையான கட்டணம், தேவை அபராதம் விதிக்க முடியுமா என்பதைத் தீர்மானிக்கிறது —
        எனவே பில்லில் மிக முக்கியமான புலம், மேலும் அடிக்கடி தவறாக இருக்கும் புலமும் இதுவே. வணிகக்
        குறியீட்டில் பில் செய்யப்படும் வீடு கிட்டத்தட்ட இரு மடங்கு செலுத்தும். உங்கள் இடம் உண்மையில்
        எப்படிப் பயன்படுத்தப்படுகிறதோ அதனுடன் இது பொருந்தவில்லை என்றால், அதைத் திருத்திக் கொள்வது நல்லது.`,
    },
    live: 'tariffCategory',
  },
  {
    id: 'sanctioned-load', always: true, group: 'header',
    links: [['/guides/reduce-fixed-charges-sanctioned-load/', L.cutFixed], ['/sanctioned-load-optimizer/', L.loadOptimizer]],
    title: {
      en: 'Sanctioned load', hi: 'स्वीकृत भार',
      mr: 'मंजूर भार', ta: 'அனுமதிக்கப்பட்ட சுமை',
    },
    body: {
      en: `The capacity the DISCOM has contracted to supply you, in kW — not what you used.
        On a domestic bill it usually sets the fixed charge directly. Raising it costs a one-time
        fee and a higher monthly fixed charge; leaving it too low risks a penalty if your recorded
        demand overshoots it. It is a genuine trade-off, not a number to minimise.`,
      hi: `DISCOM ने आपको जितनी क्षमता देने का अनुबंध किया है, kW में — आपने कितनी इस्तेमाल की, वह नहीं।
        घरेलू बिल पर आमतौर पर यही सीधे नियत प्रभार तय करता है। इसे बढ़ाने पर एक बार का शुल्क और हर महीने
        ज़्यादा नियत प्रभार लगता है; बहुत कम रखने पर दर्ज मांग इससे ऊपर जाने पर शास्ति का ख़तरा रहता है।
        यह वाक़ई एक संतुलन है, घटाते चले जाने वाला आंकड़ा नहीं।`,
      mr: `DISCOM ने तुम्हाला जेवढी क्षमता देण्याचा करार केला आहे ती, kW मध्ये — तुम्ही किती वापरली ती
        नव्हे. घरगुती बिलावर सहसा हेच थेट स्थिर आकार ठरवते. ते वाढवल्यास एकदाचे शुल्क आणि दरमहा जास्त
        स्थिर आकार लागतो; फार कमी ठेवल्यास नोंदलेली मागणी त्याहून वर गेल्यास दंडाचा धोका असतो. हा खरा
        समतोल आहे, कमी करत जाण्याचा आकडा नव्हे.`,
      ta: `DISCOM உங்களுக்கு வழங்க ஒப்பந்தம் செய்துள்ள கொள்ளளவு, kW-இல் — நீங்கள் எவ்வளவு பயன்படுத்தினீர்கள்
        என்பது அல்ல. வீட்டுப் பில்லில் பொதுவாக இதுவே நேரடியாக நிலையான கட்டணத்தைத் தீர்மானிக்கிறது. இதை
        உயர்த்த ஒரு முறை கட்டணமும் மாதந்தோறும் அதிக நிலையான கட்டணமும் ஆகும்; மிகக் குறைவாக வைத்தால்
        பதிவான தேவை அதைத் தாண்டினால் அபராதம் வரும் அபாயம். இது ஒரு உண்மையான சமநிலை, குறைத்துக்கொண்டே
        போக வேண்டிய எண் அல்ல.`,
    },
    live: 'sanctionedLoad',
  },

  {
    id: 'bill-month', always: true, group: 'period',
    links: [['/fuel-surcharge/', L.fppaByState]],
    title: {
      en: 'Bill month', hi: 'बिल माह', mr: 'बिल महिना', ta: 'பில் மாதம்',
    },
    body: {
      en: `The month the electricity was <em>used</em>, which is not the month the bill was
        printed and not the month you pay it. Three different dates, and bills label them
        inconsistently. This is the one that identifies the consumption, so it is the one to quote in
        a complaint — and, because the fuel surcharge is notified monthly, it is also what decides
        which surcharge rate applies to you.`,
      hi: `वह महीना जिसमें बिजली <em>इस्तेमाल</em> हुई — न वह जिसमें बिल छपा, न वह जिसमें आप भुगतान करते
        हैं। तीन अलग-अलग तारीख़ें, और बिल इन्हें एक-सा नाम नहीं देते। खपत की पहचान यही करता है, इसलिए
        शिकायत में यही बताइए — और चूँकि ईंधन अधिभार हर महीने अधिसूचित होता है, आप पर कौन-सी अधिभार दर
        लगेगी यह भी यही तय करता है।`,
      mr: `ज्या महिन्यात वीज <em>वापरली</em> गेली तो — बिल छापले तो नव्हे, आणि तुम्ही भरता तोही नव्हे.
        तीन वेगळ्या तारखा, आणि बिले त्यांना सारखी नावे देत नाहीत. वापराची ओळख हाच करून देतो, म्हणून
        तक्रारीत हाच नमूद करा — आणि इंधन अधिभार दरमहा अधिसूचित होत असल्याने, तुम्हाला कोणता अधिभार दर
        लागेल हेही हेच ठरवते.`,
      ta: `மின்சாரம் <em>பயன்படுத்தப்பட்ட</em> மாதம் — பில் அச்சிடப்பட்ட மாதமும் அல்ல, நீங்கள் செலுத்தும்
        மாதமும் அல்ல. மூன்று வெவ்வேறு தேதிகள், பில்கள் அவற்றுக்கு ஒரே மாதிரியான பெயர் வைப்பதில்லை.
        நுகர்வை அடையாளம் காட்டுவது இதுவே, எனவே புகாரில் இதைத்தான் குறிப்பிட வேண்டும் — மேலும் எரிபொருள்
        கூடுதல் கட்டணம் மாதந்தோறும் அறிவிக்கப்படுவதால், உங்களுக்கு எந்த விகிதம் பொருந்தும் என்பதையும்
        இதுவே தீர்மானிக்கிறது.`,
    },
    live: 'billMonth',
  },
  {
    id: 'due-date', always: true, group: 'period',
    links: [['/guides/smart-meter-prepaid-disconnection/', L.unpaid]],
    title: {
      en: 'Due date', hi: 'देय तिथि', mr: 'देय दिनांक', ta: 'கடைசி தேதி',
    },
    body: {
      en: `The last day the bill costs what it says. It is worth money in two directions:
        past it, a late payment surcharge starts accruing on the whole outstanding amount and
        compounds every month; and where the DISCOM offers a prompt-payment rebate, paying on time is
        the only way to get it. Disconnection notices are driven off this date too, not off the bill
        date.`,
      hi: `वह आख़िरी दिन जब तक बिल उतना ही है जितना लिखा है। यह दोनों तरफ़ से पैसे की बात है: इसके बाद पूरी
        बकाया राशि पर विलंब भुगतान अधिभार लगना शुरू होता है और हर महीने चक्रवृद्धि होता है; और जहाँ DISCOM
        समय पर भुगतान की छूट देता है, वह छूट पाने का यही एक रास्ता है। कनेक्शन काटने के नोटिस भी इसी
        तारीख़ से चलते हैं, बिल तिथि से नहीं।`,
      mr: `बिल लिहिले आहे तेवढेच राहण्याचा शेवटचा दिवस. हा दोन्ही बाजूंनी पैशाचा प्रश्न आहे: यानंतर संपूर्ण
        थकीत रकमेवर विलंब भरणा अधिभार लागू होतो आणि दरमहा चक्रवाढ होतो; आणि जिथे DISCOM वेळेवर भरण्याची
        सवलत देते, ती मिळवण्याचा हाच एकमेव मार्ग. जोडणी तोडण्याच्या नोटिसाही याच तारखेवरून चालतात, बिल
        दिनांकावरून नव्हे.`,
      ta: `பில் எழுதியுள்ள தொகையாகவே இருக்கும் கடைசி நாள். இது இரு வழிகளிலும் பணத்தின் விஷயம்: இதற்குப்
        பிறகு மொத்த நிலுவைத் தொகையின் மீது தாமத கட்டண அபராதம் சேரத் தொடங்கி மாதந்தோறும் கூட்டு
        வட்டியாகும்; மேலும் DISCOM விரைவுச் செலுத்துதல் தள்ளுபடி தந்தால், அதைப் பெறுவதற்கான ஒரே வழி இதுதான்.
        இணைப்புத் துண்டிப்பு அறிவிப்புகளும் இந்தத் தேதியிலிருந்தே கணக்கிடப்படுகின்றன, பில் தேதியிலிருந்து
        அல்ல.`,
    },
    live: 'dueDate',
  },

  {
    id: 'units-consumed', always: true, group: 'reading',
    links: [['/guides/uppcl-smart-meter-readings-explained/', L.readMeter], ['/smart-meter/', L.meterSymbols]],
    title: {
      en: 'Units consumed', hi: 'खपत यूनिट',
      mr: 'वापरलेली युनिट', ta: 'பயன்படுத்திய யூனிட்',
    },
    body: {
      en: `Present reading minus previous reading, multiplied by the meter constant (the
        multiplying factor, almost always 1 on a domestic connection). One unit is one kilowatt-hour.
        This is the only measured quantity on the whole bill — everything below it is arithmetic
        performed on this one number.`,
      hi: `वर्तमान रीडिंग में से पिछली रीडिंग घटाकर, मीटर गुणांक से गुणा (गुणक, घरेलू कनेक्शन पर लगभग
        हमेशा 1)। एक यूनिट यानी एक किलोवाट-घंटा। पूरे बिल पर यही एक चीज़ नापी गई है — नीचे का सब कुछ इसी
        एक संख्या पर किया गया गणित है।`,
      mr: `सध्याच्या रीडिंगमधून मागील रीडिंग वजा करून, मीटर गुणकाने गुणिले (गुणक, घरगुती जोडणीवर जवळपास
        नेहमी 1). एक युनिट म्हणजे एक किलोवॉट-तास. संपूर्ण बिलावर हीच एक मोजलेली गोष्ट आहे — खालचे सर्व
        याच एका आकड्यावर केलेले गणित आहे.`,
      ta: `தற்போதைய ரீடிங்கிலிருந்து முந்தைய ரீடிங்கைக் கழித்து, மீட்டர் மாறிலியால் பெருக்கியது (பெருக்கி,
        வீட்டு இணைப்பில் கிட்டத்தட்ட எப்போதும் 1). ஒரு யூனிட் என்பது ஒரு கிலோவாட்-மணி. முழு பில்லிலும்
        அளக்கப்பட்ட ஒரே அளவு இதுதான் — கீழே உள்ள அனைத்தும் இந்த ஒரு எண்ணின் மீது செய்யப்பட்ட கணக்கு.`,
    },
    live: 'unitsConsumed',
  },
  {
    id: 'md', always: true, group: 'reading',
    links: [['/guides/power-factor-kvah-billing-explained/', L.powerFactor], ['/sanctioned-load-optimizer/', L.loadRight]],
    title: {
      en: 'Maximum demand (MD)', hi: 'अधिकतम मांग (MD)',
      mr: 'कमाल मागणी (MD)', ta: 'அதிகபட்ச தேவை (MD)',
    },
    body: {
      en: `The highest half-hour average power your connection drew during the month, in kW —
        a peak, not a total. Consumption and demand are different things: run a 2 kW geyser for ten
        hours and you use 20 units at 2 kW of demand; run ten 2 kW appliances for one hour and you use
        the same 20 units at 20 kW. On a commercial or industrial connection the second one costs far
        more, because the charge follows the peak.`,
      hi: `महीने भर में आपके कनेक्शन ने आधे घंटे के औसत में जितनी सबसे ज़्यादा बिजली खींची, kW में — यह
        शिखर है, कुल नहीं। खपत और मांग अलग चीज़ें हैं: 2 kW का गीज़र दस घंटे चलाइए तो 20 यूनिट खर्च होंगी और
        मांग 2 kW रहेगी; 2 kW वाले दस उपकरण एक घंटे चलाइए तो वही 20 यूनिट लगेंगी पर मांग 20 kW हो जाएगी।
        व्यावसायिक या औद्योगिक कनेक्शन पर दूसरा तरीक़ा कहीं ज़्यादा महँगा पड़ता है, क्योंकि प्रभार शिखर के
        पीछे चलता है।`,
      mr: `महिनाभरात तुमच्या जोडणीने अर्ध्या तासाच्या सरासरीत ओढलेली सर्वाधिक वीज, kW मध्ये — हे शिखर आहे,
        एकूण नव्हे. वापर आणि मागणी वेगळ्या गोष्टी आहेत: 2 kW चा गीझर दहा तास चालवा, 20 युनिट लागतील आणि
        मागणी 2 kW राहील; 2 kW ची दहा उपकरणे एक तास चालवा, तेवढीच 20 युनिट लागतील पण मागणी 20 kW होईल.
        व्यावसायिक किंवा औद्योगिक जोडणीवर दुसरा प्रकार खूप महाग पडतो, कारण आकार शिखराच्या मागे जातो.`,
      ta: `மாதம் முழுவதும் உங்கள் இணைப்பு அரை மணி நேர சராசரியில் எடுத்த மிக அதிக மின்சாரம், kW-இல் — இது
        உச்சம், மொத்தம் அல்ல. நுகர்வும் தேவையும் வெவ்வேறு: 2 kW கீசரை பத்து மணி நேரம் இயக்கினால் 20 யூனிட்,
        தேவை 2 kW; 2 kW கொண்ட பத்து சாதனங்களை ஒரு மணி நேரம் இயக்கினால் அதே 20 யூனிட், ஆனால் தேவை 20 kW.
        வணிக அல்லது தொழிற்சாலை இணைப்பில் இரண்டாவது வழி மிக அதிக செலவாகும், ஏனெனில் கட்டணம் உச்சத்தைப்
        பின்தொடர்கிறது.`,
    },
    live: 'md',
  },
  {
    id: 'reading-status', always: true, group: 'reading',
    links: [['/guides/smart-meter-running-fast/', L.meterWrong], ['/check-my-bill/', L.checkBill]],
    title: {
      en: 'Reading status', hi: 'रीडिंग स्थिति',
      mr: 'रीडिंग स्थिती', ta: 'ரீடிங் நிலை',
    },
    body: {
      en: `A short code saying how the reading was obtained — whether a meter reader actually
        read the meter, or the DISCOM estimated it because the meter was locked away, unreadable or
        faulty. The vocabulary is utility-specific and the codes are rarely expanded anywhere on the
        bill, but the distinction is the thing that matters: a real reading is a fact, an estimate is
        a placeholder that will be corrected later, usually by a much larger bill.`,
      hi: `एक छोटा कोड जो बताता है कि रीडिंग कैसे ली गई — मीटर रीडर ने सचमुच मीटर पढ़ा, या DISCOM ने अनुमान
        लगाया क्योंकि मीटर बंद जगह पर था, पढ़ा नहीं जा सका, या ख़राब था। यह शब्दावली हर कंपनी की अलग होती
        है और बिल पर इन कोड का मतलब शायद ही कहीं लिखा होता है, पर असल बात यह फ़र्क़ है: असली रीडिंग एक
        तथ्य है, अनुमान एक अस्थायी आंकड़ा है जो बाद में ठीक होगा — आमतौर पर एक कहीं बड़े बिल के रूप में।`,
      mr: `रीडिंग कशी घेतली हे सांगणारा एक छोटा कोड — मीटर रीडरने प्रत्यक्ष मीटर वाचले, की DISCOM ने अंदाज
        लावला कारण मीटर बंद जागी होते, वाचता आले नाही, किंवा बिघडलेले होते. ही शब्दावली प्रत्येक कंपनीची
        वेगळी असते आणि बिलावर या कोडचा अर्थ क्वचितच कुठे लिहिलेला असतो, पण खरा मुद्दा हा फरक आहे: खरी
        रीडिंग हे तथ्य आहे, अंदाज हा तात्पुरता आकडा आहे जो नंतर दुरुस्त होईल — सहसा खूप मोठ्या बिलाच्या
        रूपात.`,
      ta: `ரீடிங் எப்படிப் பெறப்பட்டது என்று சொல்லும் ஒரு சிறு குறியீடு — மீட்டர் ரீடர் நேரில் மீட்டரைப்
        படித்தாரா, அல்லது மீட்டர் பூட்டிய இடத்தில் இருந்ததால், படிக்க முடியாததால், அல்லது பழுதானதால் DISCOM
        மதிப்பிட்டதா. இந்தச் சொற்கள் ஒவ்வொரு நிறுவனத்திற்கும் வேறுபடும், பில்லில் இந்தக் குறியீடுகளின்
        பொருள் எங்கும் விளக்கப்படுவதில்லை. ஆனால் முக்கியமானது இந்த வேறுபாடு: உண்மையான ரீடிங் ஒரு உண்மை,
        மதிப்பீடு என்பது பின்னர் திருத்தப்படும் தற்காலிக எண் — பொதுவாக மிகப் பெரிய பில்லாக.`,
    },
    live: 'readingStatus',
  },

  {
    id: 'energy-charge', always: true, group: 'charges',
    links: [['/compare/', L.compareSlabs], ['/guides/tod-billing-explained/', L.tod]],
    title: {
      en: 'Energy charge', hi: 'ऊर्जा प्रभार',
      mr: 'ऊर्जा आकार', ta: 'ஆற்றல் கட்டணம்',
    },
    body: {
      en: `What the units themselves cost. Almost every Indian domestic tariff is
        <em>telescopic</em>: the slabs stack rather than replace each other, so crossing into a
        higher slab raises the price of the extra units only, never of the units below. Your bill
        prints one total; the table above shows the ladder it came from.`,
      hi: `यूनिट की अपनी क़ीमत। भारत का लगभग हर घरेलू टैरिफ़ <em>टेलीस्कोपिक</em> है: स्लैब एक-दूसरे की जगह
        नहीं लेते, जुड़ते हैं — यानी ऊपर वाले स्लैब में जाने से सिर्फ़ अतिरिक्त यूनिट महँगी होती हैं, नीचे
        वाली कभी नहीं। आपका बिल एक कुल राशि छापता है; ऊपर की तालिका वह सीढ़ी दिखाती है जिससे वह बनी।`,
      mr: `युनिटची स्वतःची किंमत. भारतातील जवळपास प्रत्येक घरगुती टॅरिफ <em>टेलिस्कोपिक</em> आहे: स्लॅब
        एकमेकांची जागा घेत नाहीत, ते जोडले जातात — म्हणजे वरच्या स्लॅबमध्ये गेल्याने फक्त जादा युनिट महाग
        होतात, खालची कधीच नाही. तुमचे बिल एक एकूण रक्कम छापते; वरची तक्ता ती ज्या शिडीतून आली ती दाखवते.`,
      ta: `யூனிட்டுகளின் சொந்த விலை. இந்தியாவின் கிட்டத்தட்ட ஒவ்வொரு வீட்டுக் கட்டணமும்
        <em>டெலிஸ்கோப்பிக்</em>: ஸ்லாப்கள் ஒன்றையொன்று மாற்றுவதில்லை, சேர்ந்து கொள்கின்றன — அதாவது உயர்ந்த
        ஸ்லாபுக்குச் செல்வது கூடுதல் யூனிட்டுகளின் விலையை மட்டுமே உயர்த்தும், கீழுள்ளவற்றை ஒருபோதும் அல்ல.
        உங்கள் பில் ஒரே மொத்தத்தை அச்சிடுகிறது; மேலே உள்ள அட்டவணை அது வந்த ஏணியைக் காட்டுகிறது.`,
    },
    live: 'energyCharge',
  },
  {
    id: 'fixed-charge', always: true, group: 'charges',
    links: [['/guides/reduce-fixed-charges-sanctioned-load/', L.cutFixed]],
    title: {
      en: 'Fixed charge / demand charge', hi: 'नियत प्रभार / मांग प्रभार',
      mr: 'स्थिर आकार / मागणी आकार', ta: 'நிலையான கட்டணம் / தேவை கட்டணம்',
    },
    body: {
      en: `Payable whether you use a single unit or none. It funds the wires, the meter and
        the crew, and it is why a locked, empty house still gets a bill. On a domestic connection it
        is levied per kW of <em>sanctioned load</em>; on a commercial or industrial one it is levied
        on the <em>recorded maximum demand</em>, which is why the same rate produces very different
        amounts on the two bills.`,
      hi: `आप एक यूनिट इस्तेमाल करें या एक भी नहीं, यह देना ही है। यह तारों, मीटर और अमले का ख़र्च उठाता है,
        और यही वजह है कि बंद पड़े ख़ाली घर का भी बिल आता है। घरेलू कनेक्शन पर यह <em>स्वीकृत भार</em> के हर
        kW पर लगता है; व्यावसायिक या औद्योगिक पर <em>दर्ज अधिकतम मांग</em> पर — इसीलिए एक ही दर से दोनों
        बिलों पर बहुत अलग रक़में बनती हैं।`,
      mr: `तुम्ही एक युनिट वापरा किंवा एकही नाही, हे भरावेच लागते. हे तारा, मीटर आणि कर्मचाऱ्यांचा खर्च
        उचलते, आणि म्हणूनच बंद असलेल्या रिकाम्या घराचेही बिल येते. घरगुती जोडणीवर हे <em>मंजूर भारा</em>च्या
        प्रत्येक kW वर लागते; व्यावसायिक किंवा औद्योगिकवर <em>नोंदलेल्या कमाल मागणी</em>वर — म्हणूनच एकाच
        दराने दोन्ही बिलांवर खूप वेगळ्या रकमा येतात.`,
      ta: `நீங்கள் ஒரு யூனிட் பயன்படுத்தினாலும், ஒன்றும் பயன்படுத்தாவிட்டாலும் செலுத்த வேண்டியது. இது
        கம்பிகள், மீட்டர், பணியாளர்களின் செலவை ஈடுகட்டுகிறது, அதனால்தான் பூட்டிய காலி வீட்டுக்கும் பில்
        வருகிறது. வீட்டு இணைப்பில் இது <em>அனுமதிக்கப்பட்ட சுமையின்</em> ஒவ்வொரு kW-க்கும் விதிக்கப்படுகிறது;
        வணிக அல்லது தொழிற்சாலையில் <em>பதிவான அதிகபட்ச தேவையின்</em> மீது — அதனால்தான் ஒரே விகிதம் இரு
        பில்களிலும் மிக வேறுபட்ட தொகைகளைத் தருகிறது.`,
    },
    live: 'fixedCharge',
  },
  {
    id: 'excess-demand', always: false, group: 'charges',
    links: [['/guides/uppcl-sanctioned-load-increased/', L.loadRaised], ['/sanctioned-load-optimizer/', L.cheaperOption]],
    title: {
      en: 'Excess demand penalty', hi: 'अतिरिक्त मांग शास्ति',
      mr: 'अतिरिक्त मागणी दंड', ta: 'கூடுதல் தேவை அபராதம்',
    },
    body: {
      en: `Charged when the maximum demand the meter recorded during the month exceeded your
        sanctioned load. The meter logs the highest half-hour average, so a few minutes of everything
        running at once is enough to trigger it — and it recurs every month you overshoot. Two fixes:
        stagger the heavy loads, or apply to raise the sanctioned load. Which one is cheaper depends
        on how far over you are running.`,
      hi: `जब महीने भर में मीटर ने जो अधिकतम मांग दर्ज की वह आपके स्वीकृत भार से ऊपर निकल जाए, तब यह लगती
        है। मीटर आधे घंटे का सबसे ऊँचा औसत दर्ज करता है, इसलिए कुछ मिनट सब कुछ एक साथ चलाना ही काफ़ी है —
        और जिस-जिस महीने आप ऊपर जाएँगे, यह दोहराई जाएगी। दो उपाय: भारी उपकरण अलग-अलग समय पर चलाइए, या
        स्वीकृत भार बढ़वाने के लिए आवेदन कीजिए। कौन-सा सस्ता है यह इस पर निर्भर है कि आप कितना ऊपर चल रहे
        हैं।`,
      mr: `महिनाभरात मीटरने नोंदवलेली कमाल मागणी तुमच्या मंजूर भारापेक्षा जास्त झाल्यास हा लागतो. मीटर
        अर्ध्या तासाची सर्वात जास्त सरासरी नोंदवते, त्यामुळे काही मिनिटे सर्व काही एकत्र चालवणेही पुरेसे
        आहे — आणि ज्या ज्या महिन्यात तुम्ही वर जाल, तो पुन्हा लागेल. दोन उपाय: जड उपकरणे वेगवेगळ्या वेळी
        चालवा, किंवा मंजूर भार वाढवण्यासाठी अर्ज करा. कोणते स्वस्त हे तुम्ही किती वर चालत आहात यावर अवलंबून.`,
      ta: `மாதம் முழுவதும் மீட்டர் பதிவு செய்த அதிகபட்ச தேவை உங்கள் அனுமதிக்கப்பட்ட சுமையை மீறினால்
        விதிக்கப்படுகிறது. மீட்டர் அரை மணி நேரத்தின் மிக உயர்ந்த சராசரியைப் பதிவு செய்கிறது, எனவே சில
        நிமிடங்கள் எல்லாவற்றையும் ஒரே நேரத்தில் இயக்குவதே போதும் — நீங்கள் மீறும் ஒவ்வொரு மாதமும் இது
        திரும்பும். இரு தீர்வுகள்: கனமான சாதனங்களை வெவ்வேறு நேரங்களில் இயக்குங்கள், அல்லது அனுமதிக்கப்பட்ட
        சுமையை உயர்த்த விண்ணப்பியுங்கள். எது மலிவு என்பது நீங்கள் எவ்வளவு மீறுகிறீர்கள் என்பதைப் பொறுத்தது.`,
    },
    live: 'excessDemand',
  },
  {
    id: 'fppa', always: false, group: 'charges',
    links: [
      ['/guides/how-fppa-fuel-surcharge-is-calculated/', L.fppaHow],
      ['/guides/up-electricity-bill-10-percent-fppa-surcharge/', L.fppaUpCap],
      ['/fuel-surcharge/', L.fppaCurrent],
    ],
    title: {
      en: 'Fuel surcharge (FPPA / FPPAS / PPAC / FAC)',
      hi: 'ईंधन अधिभार (FPPA / FPPAS / PPAC / FAC)',
      mr: 'इंधन अधिभार (FPPA / FPPAS / PPAC / FAC)',
      ta: 'எரிபொருள் கூடுதல் கட்டணம் (FPPA / FPPAS / PPAC / FAC)',
    },
    body: {
      en: `The one line that changes month to month for reasons nothing to do with you. When
        the DISCOM's actual cost of buying power differs from what the regulator assumed when your
        tariff was set, the gap is passed through here. Four things surprise people about it: it is
        recalculated <em>monthly</em> in several states; it can be <em>negative</em>, in which case it
        is a refund; where it is a percentage it usually applies to the fixed charge as well as the
        energy charge; and the notified rate is public, so a bill that shows this line without a rate
        is worth questioning.`,
      hi: `यही एक पंक्ति है जो हर महीने ऐसे कारणों से बदलती है जिनका आपसे कोई लेना-देना नहीं। DISCOM को
        बिजली ख़रीदने में जो असली ख़र्च आया और आपका टैरिफ़ तय करते समय नियामक ने जो मान लिया था, उन दोनों का
        अंतर यहाँ से गुज़रता है। इसमें चार बातें लोगों को चौंकाती हैं: कई राज्यों में यह <em>हर महीने</em>
        दोबारा तय होती है; यह <em>ऋणात्मक</em> भी हो सकती है, तब यह वापसी है; जहाँ यह प्रतिशत में है, वहाँ
        आमतौर पर ऊर्जा प्रभार के साथ नियत प्रभार पर भी लगती है; और अधिसूचित दर सार्वजनिक होती है, इसलिए
        बिना दर बताए यह पंक्ति दिखाने वाला बिल पूछने लायक है।`,
      mr: `हीच एक ओळ आहे जी दरमहा अशा कारणांनी बदलते ज्यांचा तुमच्याशी काहीही संबंध नाही. DISCOM ला वीज
        खरेदीचा प्रत्यक्ष खर्च आणि तुमचा टॅरिफ ठरवताना नियामकाने गृहीत धरलेला खर्च, या दोहोंतील फरक इथून
        जातो. यात चार गोष्टी लोकांना चकित करतात: अनेक राज्यांत ती <em>दरमहा</em> पुन्हा ठरते; ती
        <em>ऋण</em>ही असू शकते, तेव्हा तो परतावा असतो; जिथे ती टक्केवारीत आहे तिथे सहसा ऊर्जा आकाराबरोबरच
        स्थिर आकारावरही लागते; आणि अधिसूचित दर सार्वजनिक असतो, त्यामुळे दर न दाखवता ही ओळ छापणारे बिल
        विचारण्यासारखे आहे.`,
      ta: `உங்களுடன் எந்தத் தொடர்பும் இல்லாத காரணங்களால் மாதந்தோறும் மாறும் ஒரே வரி இதுதான். DISCOM
        மின்சாரம் வாங்கிய உண்மையான செலவுக்கும், உங்கள் கட்டணம் நிர்ணயிக்கப்பட்டபோது ஒழுங்குமுறை ஆணையம்
        கருதிய செலவுக்கும் உள்ள இடைவெளி இங்கே கடத்தப்படுகிறது. இதில் நான்கு விஷயங்கள் மக்களை வியப்பில்
        ஆழ்த்தும்: பல மாநிலங்களில் இது <em>மாதந்தோறும்</em> மறுகணக்கிடப்படுகிறது; இது <em>எதிர்மறையாகவும்</em>
        இருக்கலாம், அப்போது அது ஒரு திரும்பப் பணம்; சதவீதமாக இருக்கும் இடங்களில் இது ஆற்றல் கட்டணத்துடன்
        நிலையான கட்டணத்திற்கும் பொருந்தும்; மேலும் அறிவிக்கப்பட்ட விகிதம் பொதுவானது, எனவே விகிதம்
        காட்டாமல் இந்த வரியைக் காட்டும் பில்லைக் கேள்வி கேட்பது நியாயம்.`,
    },
    live: 'fppa',
  },
  {
    id: 'wheeling', always: false, group: 'charges',
    links: [['/guides/how-to-read-msedcl-bill/', L.msedclBill], ['/guides/msedcl-fppa-charges-explained/', L.msedclFppa]],
    title: {
      en: 'Wheeling charge', hi: 'व्हीलिंग प्रभार',
      mr: 'व्हीलिंग आकार', ta: 'வீலிங் கட்டணம்',
    },
    body: {
      en: `The cost of moving the electricity across the distribution network to your premises,
        unbundled from the cost of the electricity itself. States that separate the two — Maharashtra
        most visibly — print it as its own line. States that do not have folded the same cost into the
        energy rate. You are not paying it twice.`,
      hi: `बिजली को वितरण नेटवर्क से होते हुए आपके परिसर तक पहुँचाने का ख़र्च, बिजली की अपनी क़ीमत से अलग
        करके। जो राज्य दोनों को अलग रखते हैं — महाराष्ट्र सबसे स्पष्ट रूप से — वे इसे अपनी पंक्ति में
        छापते हैं। जो नहीं रखते, उन्होंने वही ख़र्च ऊर्जा दर में मिला रखा है। आप इसे दो बार नहीं दे रहे।`,
      mr: `वीज वितरण नेटवर्कमधून तुमच्या जागेपर्यंत पोहोचवण्याचा खर्च, विजेच्या स्वतःच्या किमतीपासून वेगळा
        करून. जी राज्ये दोन्ही वेगळी ठेवतात — महाराष्ट्र सर्वात स्पष्टपणे — ती हे स्वतंत्र ओळीत छापतात.
        जी ठेवत नाहीत, त्यांनी तोच खर्च ऊर्जा दरात मिसळला आहे. तुम्ही तो दोनदा भरत नाही.`,
      ta: `மின்சாரத்தை விநியோக நெட்வொர்க் வழியாக உங்கள் இடத்திற்குக் கொண்டு வரும் செலவு, மின்சாரத்தின்
        சொந்த விலையிலிருந்து தனியாகப் பிரிக்கப்பட்டது. இரண்டையும் தனியாக வைக்கும் மாநிலங்கள் — மகாராஷ்டிரா
        மிகத் தெளிவாக — இதைத் தனி வரியாக அச்சிடுகின்றன. வைக்காதவை அதே செலவை ஆற்றல் விகிதத்தில்
        கலந்துவிட்டன. நீங்கள் இரண்டு முறை செலுத்தவில்லை.`,
    },
    live: 'wheeling',
  },
  {
    id: 'electricity-duty', always: false, group: 'charges',
    links: [['/guides/electricity-duty-explained/', L.dutyGuide]],
    title: {
      en: 'Electricity duty', hi: 'विद्युत शुल्क',
      mr: 'वीज शुल्क', ta: 'மின் வரி',
    },
    body: {
      en: `A state tax, collected by the DISCOM on the government's behalf. Whether it lands on
        the energy charge alone or on the whole bill is a state-by-state decision, and it is the reason
        two bills with identical consumption can differ by a few hundred rupees across a state border.
        There is no GST on domestic electricity supply — if you see one, look again.`,
      hi: `एक राज्य कर, जिसे DISCOM सरकार की ओर से वसूलता है। यह सिर्फ़ ऊर्जा प्रभार पर लगे या पूरे बिल पर,
        यह हर राज्य अपने हिसाब से तय करता है — और यही वजह है कि एक जैसी खपत वाले दो बिल राज्य की सीमा के
        आर-पार कुछ सौ रुपये तक अलग हो सकते हैं। घरेलू बिजली आपूर्ति पर GST नहीं लगता — अगर दिखे, तो दोबारा
        देखिए।`,
      mr: `एक राज्य कर, जो DISCOM सरकारच्या वतीने गोळा करते. तो फक्त ऊर्जा आकारावर लागतो की संपूर्ण बिलावर,
        हे प्रत्येक राज्य स्वतः ठरवते — आणि म्हणूनच सारखाच वापर असलेली दोन बिले राज्याच्या सीमेपलीकडे
        काही शंभर रुपयांनी वेगळी असू शकतात. घरगुती वीजपुरवठ्यावर GST नाही — दिसला तर पुन्हा तपासा.`,
      ta: `ஒரு மாநில வரி, DISCOM அரசு சார்பாக வசூலிக்கிறது. இது ஆற்றல் கட்டணத்தின் மீது மட்டும் விழுகிறதா
        அல்லது முழு பில்லின் மீதா என்பதை ஒவ்வொரு மாநிலமும் தானே முடிவு செய்கிறது — அதனால்தான் ஒரே அளவு
        நுகர்வு கொண்ட இரு பில்கள் மாநில எல்லைக்கு அப்பால் சில நூறு ரூபாய் வரை வேறுபடலாம். வீட்டு மின்
        விநியோகத்திற்கு GST இல்லை — தென்பட்டால், மீண்டும் பாருங்கள்.`,
    },
    live: 'electricityDuty',
  },

  {
    id: 'subsidy', always: false, group: 'totals',
    links: [['/guides/how-to-read-bses-delhi-bill/', L.bsesBill]],
    title: {
      en: 'Subsidy', hi: 'सब्सिडी', mr: 'सबसिडी', ta: 'மானியம்',
    },
    body: {
      en: `A state government rebate, shown as a deduction from the charges above rather than
        as a lower rate. The DISCOM bills the full tariff and the state reimburses it — which is why
        the gross figure stays high, and why a subsidy can be withdrawn without any tariff order
        changing. Most schemes are conditional: on consumption staying under a cap, on the category,
        sometimes on a registration you have to renew.`,
      hi: `राज्य सरकार की छूट, जो कम दर के बजाय ऊपर के प्रभारों में से कटौती के रूप में दिखती है। DISCOM
        पूरा टैरिफ़ ही लगाता है और राज्य उसकी भरपाई करता है — इसीलिए सकल राशि ऊँची बनी रहती है, और इसीलिए
        बिना कोई टैरिफ़ आदेश बदले सब्सिडी वापस भी ली जा सकती है। ज़्यादातर योजनाएँ शर्तों वाली हैं: खपत एक
        सीमा से नीचे रहे, श्रेणी वही हो, और कभी-कभी एक पंजीकरण जिसे नवीनीकृत कराना पड़ता है।`,
      mr: `राज्य सरकारची सवलत, जी कमी दराऐवजी वरील आकारांतून वजावट म्हणून दिसते. DISCOM पूर्ण टॅरिफच लावते
        आणि राज्य त्याची भरपाई करते — म्हणूनच स्थूल रक्कम मोठी राहते, आणि म्हणूनच कोणताही टॅरिफ आदेश न
        बदलता सबसिडी मागे घेतली जाऊ शकते. बहुतेक योजना अटींवर आधारित असतात: वापर एका मर्यादेखाली राहणे,
        श्रेणी तीच असणे, आणि कधी कधी नूतनीकरण करावे लागणारी नोंदणी.`,
      ta: `மாநில அரசின் தள்ளுபடி, குறைந்த விகிதமாக அல்லாமல் மேலே உள்ள கட்டணங்களிலிருந்து கழிவாகக்
        காட்டப்படுகிறது. DISCOM முழுக் கட்டணத்தையே விதிக்கிறது, மாநிலம் அதைத் திருப்பித் தருகிறது —
        அதனால்தான் மொத்தத் தொகை உயர்ந்தே இருக்கிறது, அதனால்தான் எந்தக் கட்டண ஆணையையும் மாற்றாமல்
        மானியத்தைத் திரும்பப் பெற முடியும். பெரும்பாலான திட்டங்கள் நிபந்தனைக்குட்பட்டவை: நுகர்வு ஒரு
        வரம்புக்குள் இருக்க வேண்டும், வகை அதுவாக இருக்க வேண்டும், சில நேரங்களில் புதுப்பிக்க வேண்டிய
        பதிவும் தேவை.`,
    },
    live: 'subsidy',
  },
  {
    id: 'net-current-bill', always: true, group: 'totals',
    links: [['/#calculator', L.calcOwn]],
    title: {
      en: 'Net current bill', hi: 'शुद्ध वर्तमान बिल',
      mr: 'निव्वळ चालू बिल', ta: 'நிகர நடப்பு பில்',
    },
    body: {
      en: `This month's charges, after any subsidy — and <strong>not</strong> what you owe.
        This is the figure to compare against last month, because it contains this month's consumption
        and nothing else. The total payable below is a different quantity: it mixes in old dues, and
        comparing <em>it</em> month to month will tell you a story about your payment history rather
        than about your electricity use.`,
      hi: `इस महीने के प्रभार, किसी भी सब्सिडी के बाद — और यह वह <strong>नहीं</strong> है जो आपको चुकाना है।
        पिछले महीने से तुलना इसी आंकड़े से कीजिए, क्योंकि इसमें सिर्फ़ इसी महीने की खपत है और कुछ नहीं। नीचे
        की कुल देय राशि एक अलग चीज़ है: उसमें पुराना बकाया मिला होता है, और महीने-दर-महीने <em>उसकी</em>
        तुलना आपको आपकी बिजली की खपत की नहीं, आपके भुगतान के इतिहास की कहानी बताएगी।`,
      mr: `या महिन्याचे आकार, कोणतीही सबसिडी वजा करून — आणि हे तुम्हाला भरायचे आहे ते <strong>नव्हे</strong>.
        मागील महिन्याशी तुलना याच आकड्याने करा, कारण यात फक्त या महिन्याचा वापर आहे, दुसरे काही नाही. खालची
        एकूण देय रक्कम वेगळी गोष्ट आहे: तिच्यात जुनी थकबाकी मिसळलेली असते, आणि महिन्या-महिन्याला
        <em>तिची</em> तुलना तुम्हाला विजेच्या वापराची नव्हे, भरण्याच्या इतिहासाची कहाणी सांगेल.`,
      ta: `இந்த மாதத்தின் கட்டணங்கள், மானியம் கழித்த பிறகு — இது நீங்கள் செலுத்த வேண்டியது
        <strong>அல்ல</strong>. கடந்த மாதத்துடன் ஒப்பிட வேண்டியது இந்த எண்ணைத்தான், ஏனெனில் இதில் இந்த
        மாதத்தின் நுகர்வு மட்டுமே உள்ளது, வேறெதுவும் இல்லை. கீழே உள்ள மொத்தத் தொகை வேறு ஒன்று: அதில் பழைய
        நிலுவை கலந்திருக்கும், <em>அதை</em> மாதம் மாதம் ஒப்பிடுவது உங்கள் மின் பயன்பாட்டைப் பற்றி அல்ல,
        உங்கள் கட்டண வரலாற்றைப் பற்றியே சொல்லும்.`,
    },
    live: 'netCurrentBill',
  },
  {
    id: 'arrears', always: false, group: 'totals',
    links: [['/check-my-bill/', L.checkBill]],
    title: {
      en: 'Arrears', hi: 'बकाया', mr: 'थकबाकी', ta: 'நிலுவை',
    },
    body: {
      en: `Unpaid amounts carried forward. An arrear that appears on a bill you believe you paid
        is usually a payment posted after the bill was generated — check the payment date against the
        bill date before raising it. A stubborn one that survives two cycles is worth a written
        complaint with the transaction reference.`,
      hi: `बिना चुकाई रक़में जो आगे लाई गई हैं। जिस बिल का भुगतान आपको याद हो, उस पर बकाया दिखे तो आमतौर पर
        भुगतान बिल बनने के बाद चढ़ा होता है — शिकायत करने से पहले भुगतान की तारीख़ और बिल तिथि मिलाकर देखिए।
        जो बकाया दो चक्र तक टिका रहे, उसके लिए लेनदेन संदर्भ के साथ लिखित शिकायत करनी चाहिए।`,
      mr: `न भरलेल्या रकमा ज्या पुढे आणल्या आहेत. ज्या बिलाचा भरणा तुम्हाला आठवतो, त्यावर थकबाकी दिसल्यास
        सहसा भरणा बिल तयार झाल्यानंतर नोंदला गेलेला असतो — तक्रार करण्यापूर्वी भरण्याची तारीख आणि बिल
        दिनांक ताडून पाहा. दोन चक्रे टिकून राहणाऱ्या थकबाकीसाठी व्यवहार संदर्भासह लेखी तक्रार करावी.`,
      ta: `செலுத்தப்படாமல் முன்னெடுத்துச் செல்லப்பட்ட தொகைகள். நீங்கள் செலுத்தியதாக நினைக்கும் பில்லில்
        நிலுவை தென்பட்டால், பொதுவாக பில் உருவான பிறகு பணம் பதிவாகியிருக்கும் — புகார் அளிக்கும் முன்
        செலுத்திய தேதியையும் பில் தேதியையும் ஒப்பிடுங்கள். இரு சுழற்சிகள் தாண்டியும் நீடிக்கும் நிலுவைக்கு
        பரிவர்த்தனை குறிப்புடன் எழுத்துப்பூர்வ புகார் அளிப்பது நல்லது.`,
    },
    live: 'arrears',
  },
  {
    id: 'lpsc', always: false, group: 'totals',
    links: [['/guides/smart-meter-prepaid-disconnection/', L.unpaid]],
    title: {
      en: 'Late payment surcharge (LPSC)', hi: 'विलंब भुगतान अधिभार (LPSC)',
      mr: 'विलंब भरणा अधिभार (LPSC)', ta: 'தாமத கட்டண அபராதம் (LPSC)',
    },
    body: {
      en: `Interest on what you did not pay by the due date, typically 1.25–2% a month, compounding
        on the arrear. It is the most avoidable line on any bill: paying on the due date removes it
        entirely. If a disputed amount is sitting in arrears, LPSC keeps accruing on it while the dispute
        is open, so raise disputes early.`,
      hi: `जो आपने देय तिथि तक नहीं चुकाया, उस पर ब्याज — आमतौर पर 1.25–2% प्रति माह, बकाया पर चक्रवृद्धि।
        किसी भी बिल की यह सबसे टाली जा सकने वाली पंक्ति है: देय तिथि तक भुगतान कर दीजिए, यह पूरी तरह हट
        जाती है। अगर कोई विवादित रकम बकाया में पड़ी है, तो विवाद खुला रहने तक उस पर भी LPSC चढ़ता रहता है —
        इसलिए विवाद जल्दी उठाइए।`,
      mr: `देय दिनांकापर्यंत तुम्ही जे भरले नाही त्यावरील व्याज — सहसा दरमहा 1.25–2%, थकबाकीवर चक्रवाढ.
        कोणत्याही बिलावरची ही सर्वात टाळता येणारी ओळ आहे: देय दिनांकापर्यंत भरा, ती पूर्णपणे निघून जाते.
        एखादी वादग्रस्त रक्कम थकबाकीत असेल, तर वाद सुरू असेपर्यंत तिच्यावरही LPSC चढत राहतो — म्हणून वाद
        लवकर मांडा.`,
      ta: `கடைசி தேதிக்குள் நீங்கள் செலுத்தாததன் மீதான வட்டி — பொதுவாக மாதம் 1.25–2%, நிலுவையின் மீது கூட்டு
        வட்டி. எந்தப் பில்லிலும் மிக எளிதாகத் தவிர்க்கக்கூடிய வரி இதுதான்: கடைசி தேதிக்குள் செலுத்தினால்
        இது முற்றிலும் நீங்கும். தகராறில் உள்ள ஒரு தொகை நிலுவையில் இருந்தால், தகராறு முடியும் வரை அதன்
        மீதும் LPSC சேர்ந்துகொண்டே இருக்கும் — எனவே தகராறுகளை விரைவில் எழுப்புங்கள்.`,
    },
    live: 'lpsc',
  },
  {
    id: 'total-payable', always: true, group: 'totals',
    links: [['/#calculator', L.calcOwn], ['/bill-review/', L.billReview]],
    title: {
      en: 'Total payable', hi: 'कुल देय राशि',
      mr: 'एकूण देय रक्कम', ta: 'மொத்தம் செலுத்த வேண்டியது',
    },
    body: {
      en: `Net current bill, plus arrears and surcharge, minus payments already credited. This is
        what you owe today. Pay the full amount — a part payment does not stop the surcharge on the
        remainder, and on a prepaid or disconnection-notice account it does not stop the clock either.`,
      hi: `शुद्ध वर्तमान बिल, साथ में बकाया और अधिभार, घटाकर वे भुगतान जो पहले जमा हो चुके हैं। आज की तारीख़
        में आपको यही चुकाना है। पूरी राशि चुकाइए — आंशिक भुगतान से बची हुई रकम पर अधिभार लगना बंद नहीं
        होता, और प्रीपेड या कटौती-नोटिस वाले खाते पर घड़ी भी नहीं रुकती।`,
      mr: `निव्वळ चालू बिल, अधिक थकबाकी आणि अधिभार, वजा आधीच जमा झालेले भरणे. आजच्या तारखेला तुम्हाला हेच
        भरायचे आहे. पूर्ण रक्कम भरा — अंशतः भरल्याने उरलेल्या रकमेवरचा अधिभार थांबत नाही, आणि प्रीपेड
        किंवा तोडणी-नोटीस असलेल्या खात्यावर घड्याळही थांबत नाही.`,
      ta: `நிகர நடப்பு பில், உடன் நிலுவையும் அபராதமும், ஏற்கெனவே வரவு வைக்கப்பட்ட பணத்தைக் கழித்து. இன்று
        நீங்கள் செலுத்த வேண்டியது இதுதான். முழுத் தொகையையும் செலுத்துங்கள் — பகுதியாகச் செலுத்துவது மீதித்
        தொகையின் மீதான அபராதத்தை நிறுத்தாது, ப்ரீபெய்டு அல்லது துண்டிப்பு அறிவிப்புள்ள கணக்கில் கடிகாரத்தையும்
        நிறுத்தாது.`,
    },
    live: 'totalPayable',
  },
  {
    id: 'due-date-rebate', always: false, group: 'totals',
    links: [['/guides/how-to-read-tpcodl-odisha-bill/', L.tpcodlBill]],
    title: {
      en: 'Prompt-payment rebate', hi: 'समय पर भुगतान की छूट',
      mr: 'वेळेवर भरण्याची सवलत', ta: 'விரைவுச் செலுத்துதல் தள்ளுபடி',
    },
    body: {
      en: `Several DISCOMs take a small amount <em>off</em> the bill if you pay on or before the
        due date — a few paise per unit, or a percentage of the energy charge, sometimes with an extra
        slice for paying digitally. It is easy to miss because it is printed as a second, lower total
        near the bottom rather than as a charge. Where it exists, the due date is worth money twice
        over: you gain the rebate by meeting it and start paying surcharge by missing it.`,
      hi: `कई DISCOM देय तिथि तक भुगतान करने पर बिल में से थोड़ी रकम <em>घटा</em> देते हैं — कुछ पैसे प्रति
        यूनिट, या ऊर्जा प्रभार का एक प्रतिशत, और कभी-कभी डिजिटल भुगतान पर थोड़ा और। यह आसानी से नज़र से चूक
        जाती है क्योंकि यह प्रभार की तरह नहीं, बल्कि नीचे की ओर एक दूसरी, कम कुल राशि के रूप में छपती है।
        जहाँ यह है, वहाँ देय तिथि दोहरे पैसे की है: समय पर चुकाने से छूट मिलती है, और चूकने से अधिभार शुरू।`,
      mr: `अनेक DISCOM देय दिनांकापर्यंत भरल्यास बिलातून थोडी रक्कम <em>वजा</em> करतात — काही पैसे प्रति
        युनिट, किंवा ऊर्जा आकाराची टक्केवारी, आणि कधी कधी डिजिटल भरण्यासाठी आणखी थोडी. ती सहज नजरेतून
        सुटते कारण ती आकारासारखी नव्हे, तर खाली एक दुसरी, कमी एकूण रक्कम म्हणून छापली जाते. जिथे ती आहे,
        तिथे देय दिनांक दुप्पट पैशाचा आहे: वेळेवर भरून सवलत मिळते, आणि चुकवून अधिभार सुरू होतो.`,
      ta: `பல DISCOM-கள் கடைசி தேதிக்குள் செலுத்தினால் பில்லிலிருந்து சிறிது தொகையைக் <em>கழிக்கின்றன</em> —
        யூனிட்டுக்கு சில பைசா, அல்லது ஆற்றல் கட்டணத்தின் ஒரு சதவீதம், சில நேரங்களில் டிஜிட்டல் முறையில்
        செலுத்த மேலும் கொஞ்சம். இது எளிதில் கவனத்தில் படாமல் போகும், ஏனெனில் இது ஒரு கட்டணமாக அல்லாமல்
        கீழே இரண்டாவது, குறைந்த மொத்தமாக அச்சிடப்படுகிறது. இது இருக்கும் இடத்தில், கடைசி தேதி இரு மடங்கு
        பணத்திற்குச் சமம்: சரியான நேரத்தில் செலுத்தி தள்ளுபடி பெறுகிறீர்கள், தவறவிட்டு அபராதம் தொடங்குகிறது.`,
    },
    live: 'dueDateRebate',
  },
];

export const UB = {
  title: {
    en: 'Understand Your Electricity Bill: Every Line Explained',
    hi: 'अपना बिजली बिल समझें: हर पंक्ति की व्याख्या',
    mr: 'तुमचे वीज बिल समजून घ्या: प्रत्येक ओळीचे स्पष्टीकरण',
    ta: 'உங்கள் மின் பில்லைப் புரிந்துகொள்ளுங்கள்: ஒவ்வொரு வரியும் விளக்கம்',
  },
  description: {
    en: 'An interactive electricity bill you can change. Switch DISCOM, units and sanctioned load and see what every line means — fixed charge, slabs, FPPA, duty, demand penalty.',
    hi: 'एक इंटरैक्टिव बिजली बिल जिसे आप बदल सकते हैं। DISCOM, यूनिट और स्वीकृत भार बदलिए और देखिए हर पंक्ति का मतलब — नियत प्रभार, स्लैब, FPPA, शुल्क, मांग शास्ति।',
    mr: 'बदलता येणारे एक इंटरअ‍ॅक्टिव्ह वीज बिल. DISCOM, युनिट आणि मंजूर भार बदला आणि प्रत्येक ओळीचा अर्थ पाहा — स्थिर आकार, स्लॅब, FPPA, शुल्क, मागणी दंड.',
    ta: 'நீங்கள் மாற்றக்கூடிய ஊடாடும் மின் பில். DISCOM, யூனிட், அனுமதிக்கப்பட்ட சுமையை மாற்றி ஒவ்வொரு வரியின் பொருளையும் பாருங்கள் — நிலையான கட்டணம், ஸ்லாப், FPPA, வரி, தேவை அபராதம்.',
  },
  crumb: {
    en: 'Understand Your Bill', hi: 'अपना बिल समझें',
    mr: 'तुमचे बिल समजून घ्या', ta: 'உங்கள் பில்லைப் புரிந்துகொள்ளுங்கள்',
  },
  h1: {
    en: 'Understand Your Electricity Bill, Line by Line',
    hi: 'अपना बिजली बिल समझें, एक-एक पंक्ति',
    mr: 'तुमचे वीज बिल समजून घ्या, ओळ न ओळ',
    ta: 'உங்கள் மின் பில்லை வரி வரியாகப் புரிந்துகொள்ளுங்கள்',
  },
  meta: {
    en: 'Updated %DATE% · Figures computed live by the same engine behind our calculator · <a href="/methodology/">How we source and verify</a>',
    hi: 'अपडेट %DATE% · आंकड़े उसी इंजन से बनते हैं जो हमारे कैलकुलेटर के पीछे है · <a href="/methodology/">हम स्रोत कैसे जुटाते और जाँचते हैं</a>',
    mr: 'अद्ययावत %DATE% · आकडे त्याच इंजिनने तयार होतात जे आमच्या कॅल्क्युलेटरमागे आहे · <a href="/methodology/">आम्ही स्रोत कसे मिळवतो आणि तपासतो</a>',
    ta: 'புதுப்பிப்பு %DATE% · எங்கள் கால்குலேட்டருக்குப் பின்னால் உள்ள அதே இன்ஜின் மூலம் கணக்கிடப்பட்ட எண்கள் · <a href="/methodology/">நாங்கள் எப்படி ஆதாரம் திரட்டி சரிபார்க்கிறோம்</a>',
  },
  lead: {
    en: `Almost nobody is taught to read an electricity bill, and the bill does not help — a dozen
      charges in abbreviations, most of them unexplained. Below is a working bill. Change the DISCOM,
      the units or the sanctioned load and it recalculates, and every numbered marker explains the
      line it points at using the numbers you are looking at.`,
    hi: `बिजली का बिल पढ़ना लगभग किसी को सिखाया नहीं जाता, और बिल ख़ुद भी मदद नहीं करता — दर्जन भर प्रभार,
      संक्षिप्त नामों में, ज़्यादातर बिना किसी व्याख्या के। नीचे एक चलता हुआ बिल है। DISCOM, यूनिट या
      स्वीकृत भार बदलिए, यह दोबारा हिसाब लगा लेगा — और हर नंबर वाला निशान उसी पंक्ति को उन्हीं आंकड़ों से
      समझाएगा जो आपके सामने हैं।`,
    mr: `वीज बिल कसे वाचावे हे जवळपास कुणालाच शिकवले जात नाही, आणि बिलही मदत करत नाही — डझनभर आकार,
      संक्षिप्त नावांत, बहुतेक कोणत्याही स्पष्टीकरणाशिवाय. खाली एक चालते बिल आहे. DISCOM, युनिट किंवा
      मंजूर भार बदला, ते पुन्हा हिशोब करेल — आणि प्रत्येक क्रमांकित खूण तीच ओळ तुमच्यासमोरच्या आकड्यांनी
      समजावून सांगेल.`,
    ta: `மின் பில்லை எப்படிப் படிப்பது என்பதை கிட்டத்தட்ட யாருக்கும் கற்றுத் தரப்படுவதில்லை, பில்லும்
      உதவுவதில்லை — டசின் கணக்கான கட்டணங்கள், சுருக்கெழுத்துகளில், பெரும்பாலானவை விளக்கமின்றி. கீழே ஒரு
      இயங்கும் பில். DISCOM, யூனிட் அல்லது அனுமதிக்கப்பட்ட சுமையை மாற்றுங்கள், அது மீண்டும் கணக்கிடும் —
      ஒவ்வொரு எண்ணிடப்பட்ட குறியும் அந்த வரியை உங்கள் கண்முன் உள்ள எண்களைக் கொண்டே விளக்கும்.`,
  },

  toc: {
    label: { en: 'On this page', hi: 'इस पेज पर', mr: 'या पानावर', ta: 'இந்தப் பக்கத்தில்' },
    bill: { en: 'The bill', hi: 'बिल', mr: 'बिल', ta: 'பில்' },
    header: { en: 'Who and what', hi: 'कौन और क्या', mr: 'कोण आणि काय', ta: 'யார், எது' },
    period: { en: 'Dates that cost money', hi: 'वे तारीख़ें जो पैसे की हैं', mr: 'पैशाच्या तारखा', ta: 'பணம் சார்ந்த தேதிகள்' },
    reading: { en: 'The meter reading', hi: 'मीटर रीडिंग', mr: 'मीटर रीडिंग', ta: 'மீட்டர் ரீடிங்' },
    charges: { en: 'The charges', hi: 'प्रभार', mr: 'आकार', ta: 'கட்டணங்கள்' },
    totals: { en: 'The totals', hi: 'कुल राशि', mr: 'एकूण रकमा', ta: 'மொத்தங்கள்' },
    higher: {
      en: 'Why it exceeds units × rate', hi: 'यूनिट × दर से ज़्यादा क्यों',
      mr: 'युनिट × दर पेक्षा जास्त का', ta: 'யூனிட் × விகிதத்தை ஏன் மீறுகிறது',
    },
    faq: { en: 'Common questions', hi: 'आम सवाल', mr: 'सामान्य प्रश्न', ta: 'பொதுவான கேள்விகள்' },
  },

  controlsH2: {
    en: 'Change the bill', hi: 'बिल बदलिए', mr: 'बिल बदला', ta: 'பில்லை மாற்றுங்கள்',
  },
  controlsIntro: {
    en: `Every figure below is recalculated from the real tariff schedule for the DISCOM you pick, so
      the explanations describe arithmetic that actually ran — not a worked example written once and
      left to age.`,
    hi: `नीचे का हर आंकड़ा आपके चुने हुए DISCOM की असली टैरिफ़ अनुसूची से दोबारा बनता है, इसलिए व्याख्याएँ
      उसी गणित का वर्णन करती हैं जो वाक़ई चला — एक बार लिखकर पुराना पड़ने के लिए छोड़ा गया उदाहरण नहीं।`,
    mr: `खालचा प्रत्येक आकडा तुम्ही निवडलेल्या DISCOM च्या खऱ्या टॅरिफ अनुसूचीतून पुन्हा तयार होतो, त्यामुळे
      स्पष्टीकरणे प्रत्यक्ष चाललेल्या गणिताचे वर्णन करतात — एकदा लिहून जुने होऊ दिलेले उदाहरण नव्हे.`,
    ta: `கீழே உள்ள ஒவ்வொரு எண்ணும் நீங்கள் தேர்ந்தெடுத்த DISCOM-இன் உண்மையான கட்டண அட்டவணையிலிருந்து மீண்டும்
      கணக்கிடப்படுகிறது, எனவே விளக்கங்கள் உண்மையில் நடந்த கணக்கையே விவரிக்கின்றன — ஒருமுறை எழுதி பழையதாக
      விடப்பட்ட எடுத்துக்காட்டு அல்ல.`,
  },
  ctl: {
    scenario: {
      en: 'DISCOM and category', hi: 'DISCOM और श्रेणी',
      mr: 'DISCOM आणि श्रेणी', ta: 'DISCOM மற்றும் வகை',
    },
    units: { en: 'Units consumed', hi: 'खपत यूनिट', mr: 'वापरलेली युनिट', ta: 'பயன்படுத்திய யூனிட்' },
    load: {
      en: 'Sanctioned load (kW)', hi: 'स्वीकृत भार (kW)',
      mr: 'मंजूर भार (kW)', ta: 'அனுமதிக்கப்பட்ட சுமை (kW)',
    },
    md: {
      en: 'Maximum demand (kW)', hi: 'अधिकतम मांग (kW)',
      mr: 'कमाल मागणी (kW)', ta: 'அதிகபட்ச தேவை (kW)',
    },
    optional: { en: 'optional', hi: 'वैकल्पिक', mr: 'ऐच्छिक', ta: 'விருப்பத்தேர்வு' },
    mdHint: {
      en: 'Leave blank to use the demand the meter recorded on this bill. Enter one above the sanctioned load to see what a penalty does.',
      hi: 'ख़ाली छोड़ दीजिए तो इस बिल पर मीटर ने जो मांग दर्ज की वही ली जाएगी। स्वीकृत भार से ऊपर कोई आंकड़ा डालिए और देखिए शास्ति क्या करती है।',
      mr: 'रिकामे ठेवल्यास या बिलावर मीटरने नोंदवलेली मागणी वापरली जाईल. मंजूर भारापेक्षा जास्त आकडा टाका आणि दंड काय करतो ते पाहा.',
      ta: 'காலியாக விட்டால் இந்தப் பில்லில் மீட்டர் பதிவு செய்த தேவை பயன்படுத்தப்படும். அனுமதிக்கப்பட்ட சுமையை விட அதிகமாக ஒன்றை உள்ளிட்டு அபராதம் என்ன செய்கிறது என்று பாருங்கள்.',
    },
    messy: {
      en: 'Add arrears, late payment surcharge and a part payment',
      hi: 'बकाया, विलंब भुगतान अधिभार और आंशिक भुगतान जोड़ें',
      mr: 'थकबाकी, विलंब भरणा अधिभार आणि अंशतः भरणा जोडा',
      ta: 'நிலுவை, தாமத கட்டண அபராதம், பகுதிச் செலுத்துதல் ஆகியவற்றைச் சேர்க்கவும்',
    },
    messyHint: {
      en: 'Most real bills carry old dues. Turn this on to see how they change the total.',
      hi: 'ज़्यादातर असली बिलों पर पुराना बकाया होता है। इसे चालू करके देखिए कि वह कुल राशि कैसे बदलता है।',
      mr: 'बहुतेक खऱ्या बिलांवर जुनी थकबाकी असते. हे चालू करून ते एकूण रक्कम कशी बदलते ते पाहा.',
      ta: 'பெரும்பாலான உண்மையான பில்களில் பழைய நிலுவை இருக்கும். இதை இயக்கி அது மொத்தத்தை எப்படி மாற்றுகிறது என்று பாருங்கள்.',
    },
    reset: { en: 'Reset', hi: 'रीसेट', mr: 'रीसेट', ta: 'மீட்டமை' },
  },

  illustrative: {
    en: 'Illustrative example', hi: 'उदाहरण मात्र',
    mr: 'केवळ उदाहरण', ta: 'விளக்கத்திற்கு மட்டும்',
  },
  illustrativeBody: {
    en: `This is not a real bill and not a copy of any DISCOM's stationery. Bills differ in layout,
      field names and ordering from one utility to the next; what is common between them is the set of
      charges shown here. The consumer number, meter number and address are invented.`,
    hi: `यह असली बिल नहीं है और न ही किसी DISCOM के छपे बिल की नक़ल। एक कंपनी से दूसरी तक बिल की बनावट,
      खानों के नाम और क्रम बदलते रहते हैं; उनमें साझा जो है वह यहाँ दिखाए गए प्रभारों का समूह है। उपभोक्ता
      संख्या, मीटर संख्या और पता काल्पनिक हैं।`,
    mr: `हे खरे बिल नाही आणि कोणत्याही DISCOM च्या छापील बिलाची नक्कलही नाही. एका कंपनीकडून दुसरीकडे बिलाची
      रचना, रकान्यांची नावे आणि क्रम बदलतात; त्यांच्यात समान असलेला भाग म्हणजे इथे दाखवलेल्या आकारांचा
      संच. ग्राहक क्रमांक, मीटर क्रमांक आणि पत्ता काल्पनिक आहेत.`,
    ta: `இது உண்மையான பில் அல்ல, எந்த DISCOM-இன் அச்சிட்ட பில்லின் நகலும் அல்ல. ஒரு நிறுவனத்திலிருந்து
      மற்றொன்றுக்கு பில்லின் அமைப்பு, புலப் பெயர்கள், வரிசை மாறும்; அவற்றுக்கு இடையே பொதுவானது இங்கே
      காட்டப்பட்டுள்ள கட்டணங்களின் தொகுப்பு. நுகர்வோர் எண், மீட்டர் எண், முகவரி ஆகியவை கற்பனையானவை.`,
  },

  onThisBill: {
    en: 'On this bill', hi: 'इस बिल पर', mr: 'या बिलावर', ta: 'இந்தப் பில்லில்',
  },
  notOnThisBill: {
    en: 'Not charged on the bill shown — pick another DISCOM or category above and it appears.',
    hi: 'दिखाए गए बिल पर यह नहीं लगा — ऊपर कोई दूसरा DISCOM या श्रेणी चुनिए, यह आ जाएगा।',
    mr: 'दाखवलेल्या बिलावर हा लागलेला नाही — वर दुसरा DISCOM किंवा श्रेणी निवडा, तो दिसेल.',
    ta: 'காட்டப்பட்ட பில்லில் இது விதிக்கப்படவில்லை — மேலே வேறு DISCOM அல்லது வகையைத் தேர்ந்தெடுத்தால் தோன்றும்.',
  },

  sectionH2: {
    header: {
      en: 'Who the bill is for, and under what tariff',
      hi: 'बिल किसका है, और किस टैरिफ़ पर',
      mr: 'बिल कोणाचे, आणि कोणत्या टॅरिफवर',
      ta: 'பில் யாருக்கு, எந்தக் கட்டணத்தில்',
    },
    period: {
      en: 'The dates, and which ones cost you money',
      hi: 'तारीख़ें, और उनमें से कौन-सी आपको पैसे में पड़ती हैं',
      mr: 'तारखा, आणि त्यांपैकी कोणत्या पैशात पडतात',
      ta: 'தேதிகள், அவற்றில் எவை உங்களுக்குப் பணச் செலவு',
    },
    reading: {
      en: 'What the meter said', hi: 'मीटर ने क्या कहा',
      mr: 'मीटरने काय सांगितले', ta: 'மீட்டர் என்ன சொன்னது',
    },
    charges: {
      en: 'What you are being charged', hi: 'आपसे क्या-क्या वसूला जा रहा है',
      mr: 'तुमच्याकडून काय काय आकारले जाते', ta: 'உங்களிடம் என்னென்ன வசூலிக்கப்படுகிறது',
    },
    totals: {
      en: 'What you actually owe', hi: 'असल में आपको क्या चुकाना है',
      mr: 'प्रत्यक्षात तुम्हाला काय भरायचे आहे', ta: 'உண்மையில் நீங்கள் செலுத்த வேண்டியது',
    },
  },
  sectionIntro: {
    header: {
      en: `The top block identifies the account and, crucially, the rate schedule it is billed
        under. Errors here are expensive and they persist quietly for years, so it is worth two minutes.`,
      hi: `ऊपर का हिस्सा खाते की पहचान बताता है और — सबसे अहम — वह दर-अनुसूची जिस पर बिल बनता है। यहाँ की
        ग़लतियाँ महँगी पड़ती हैं और सालों तक चुपचाप चलती रहती हैं, इसलिए दो मिनट देना बनता है।`,
      mr: `वरचा भाग खात्याची ओळख सांगतो आणि — सर्वात महत्त्वाचे — ज्या दर-अनुसूचीवर बिल होते ती. इथल्या
        चुका महाग पडतात आणि वर्षानुवर्षे गुपचूप चालू राहतात, म्हणून दोन मिनिटे देणे योग्य.`,
      ta: `மேல் பகுதி கணக்கை அடையாளம் காட்டுகிறது, மேலும் — மிக முக்கியமாக — எந்த விகித அட்டவணையில் பில்
        செய்யப்படுகிறது என்பதையும். இங்குள்ள தவறுகள் விலை உயர்ந்தவை, ஆண்டுக்கணக்கில் அமைதியாகத் தொடரும்,
        எனவே இரு நிமிடம் செலவிடுவது நல்லது.`,
    },
    period: {
      en: `A bill carries three dates and they are not interchangeable. One identifies the
        consumption, one is when the bill was cut, and one is a deadline with money attached to both
        sides of it.`,
      hi: `बिल पर तीन तारीख़ें होती हैं और वे आपस में बदली नहीं जा सकतीं। एक खपत की पहचान बताती है, एक बताती
        है कि बिल कब बना, और एक वह समय-सीमा है जिसके दोनों ओर पैसा जुड़ा है।`,
      mr: `बिलावर तीन तारखा असतात आणि त्या एकमेकांच्या जागी वापरता येत नाहीत. एक वापराची ओळख सांगते, एक
        बिल कधी तयार झाले ते सांगते, आणि एक ती मुदत आहे जिच्या दोन्ही बाजूंना पैसा जोडलेला आहे.`,
      ta: `ஒரு பில்லில் மூன்று தேதிகள் உள்ளன, அவை ஒன்றுக்கொன்று மாற்றாகா. ஒன்று நுகர்வை அடையாளம் காட்டுகிறது,
        ஒன்று பில் எப்போது தயாரானது என்பதைச் சொல்கிறது, ஒன்று இரு பக்கமும் பணம் இணைந்த ஒரு காலக்கெடு.`,
    },
    reading: {
      en: `The only measured quantity on the whole bill. Everything below is arithmetic
        performed on this one number.`,
      hi: `पूरे बिल पर यही एक चीज़ नापी गई है। नीचे का सब कुछ इसी एक संख्या पर किया गया गणित है।`,
      mr: `संपूर्ण बिलावर हीच एक मोजलेली गोष्ट. खालचे सर्व याच एका आकड्यावर केलेले गणित आहे.`,
      ta: `முழு பில்லிலும் அளக்கப்பட்ட ஒரே அளவு. கீழே உள்ள அனைத்தும் இந்த ஒரு எண்ணின் மீது செய்யப்பட்ட கணக்கு.`,
    },
    charges: {
      en: `A bill is not one price. It is a stack of separate charges, each set by a different
        rule, and knowing which is which tells you which ones you can do something about.`,
      hi: `बिल एक क़ीमत नहीं है। यह अलग-अलग प्रभारों का ढेर है, हर एक अलग नियम से तय होता है — और कौन-सा
        कौन है यह जानने से पता चलता है कि किन पर आप कुछ कर सकते हैं।`,
      mr: `बिल म्हणजे एक किंमत नव्हे. तो वेगवेगळ्या आकारांचा ढीग आहे, प्रत्येक वेगळ्या नियमाने ठरतो — आणि
        कोणता कोणता हे कळल्यावर कोणत्यावर तुम्ही काही करू शकता ते समजते.`,
      ta: `பில் என்பது ஒரு விலை அல்ல. இது தனித்தனி கட்டணங்களின் அடுக்கு, ஒவ்வொன்றும் வெவ்வேறு விதியால்
        நிர்ணயிக்கப்படுகிறது — எது எது என்று தெரிந்தால், எவற்றில் நீங்கள் ஏதாவது செய்ய முடியும் என்பது
        புரியும்.`,
    },
    totals: {
      en: `Where this month's charges meet whatever was left over from before.`,
      hi: `जहाँ इस महीने के प्रभार पहले से बचे हुए हिसाब से आ मिलते हैं।`,
      mr: `जिथे या महिन्याचे आकार आधीच्या उरलेल्या हिशोबाला येऊन मिळतात.`,
      ta: `இந்த மாதத்தின் கட்டணங்கள் முன்பிருந்து மீதமிருந்ததைச் சந்திக்கும் இடம்.`,
    },
  },

  higherH2: {
    en: 'Why the bill is more than units × rate',
    hi: 'बिल यूनिट × दर से ज़्यादा क्यों होता है',
    mr: 'बिल युनिट × दर पेक्षा जास्त का येते',
    ta: 'பில் ஏன் யூனிட் × விகிதத்தை விட அதிகமாக இருக்கிறது',
  },
  higherIntro: {
    en: `The most common complaint about an electricity bill is that the total does not match units
      multiplied by the rate the reader has in mind. It usually is not an error. Four things account
      for nearly all of the gap:`,
    hi: `बिजली के बिल पर सबसे आम शिकायत यही है कि कुल राशि, यूनिट को उस दर से गुणा करने पर जो दिमाग़ में है,
      मेल नहीं खाती। आमतौर पर यह ग़लती नहीं होती। इस अंतर की लगभग पूरी वजह चार बातें हैं:`,
    mr: `वीज बिलाबद्दलची सर्वात सामान्य तक्रार हीच की एकूण रक्कम, युनिटला डोक्यातल्या दराने गुणल्यावर जुळत
      नाही. सहसा ती चूक नसते. या फरकाची जवळपास पूर्ण कारणे चार आहेत:`,
    ta: `மின் பில் குறித்த மிகப் பொதுவான புகார், மொத்தத் தொகை யூனிட்டை மனதில் உள்ள விகிதத்தால் பெருக்கியதுடன்
      பொருந்தவில்லை என்பதுதான். பொதுவாக அது தவறல்ல. இந்த இடைவெளிக்கு கிட்டத்தட்ட முழுக் காரணமும் நான்கு:`,
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
    hi: [
      ['स्लैब जुड़ते हैं।', `कोई एक दर होती ही नहीं। आपकी आख़िरी यूनिट पहली से महँगी पड़ी, और आपने जो औसत दर
        चुकाई वह दोनों के बीच कहीं है — उस सबसे सस्ते स्लैब से हमेशा ऊपर जो आपको याद है।`],
      ['नियत प्रभार खपत नहीं है।', `यह स्वीकृत भार के हर kW पर लगता है, इस्तेमाल चाहे जितना हो — इसलिए जिस
        महीने आपने बहुत कम बिजली ली, उसी महीने प्रति यूनिट यह सबसे भारी पड़ता है।`],
      ['कर सबसे आख़िर में आता है।', `विद्युत शुल्क प्रभारों के ऊपर लगता है — कई राज्यों में पूरे बिल पर, सिर्फ़
        ऊर्जा वाले हिस्से पर नहीं।`],
      ['पास-थ्रू बिना चेतावनी हिल सकता है।', `ईंधन अधिभार समय-समय पर दोबारा तय होता है और एक बिल पर आ सकता
        है, अगले पर नहीं — जबकि आपकी खपत में कोई बदलाव नहीं हुआ।`],
    ],
    mr: [
      ['स्लॅब एकावर एक चढतात.', `एकच दर असा नसतोच. तुमचे शेवटचे युनिट पहिल्यापेक्षा महाग पडले, आणि तुम्ही
        भरलेला सरासरी दर दोहोंच्या मध्ये कुठेतरी आहे — तुम्हाला आठवणाऱ्या सर्वात स्वस्त स्लॅबपेक्षा नेहमीच वर.`],
      ['स्थिर आकार म्हणजे वापर नव्हे.', `तो मंजूर भाराच्या प्रत्येक kW वर लागतो, वापर कितीही असो — त्यामुळे
        ज्या महिन्यात तुम्ही फार कमी वीज वापरली, त्याच महिन्यात प्रति युनिट तो सर्वात जड पडतो.`],
      ['कर सर्वात शेवटी येतो.', `वीज शुल्क आकारांच्या वर लागते — अनेक राज्यांत संपूर्ण बिलावर, फक्त ऊर्जा
        भागावर नव्हे.`],
      ['पास-थ्रू पूर्वसूचनेशिवाय हलू शकतो.', `इंधन अधिभार वेळोवेळी पुन्हा ठरतो आणि एका बिलावर येऊ शकतो,
        पुढच्यावर नाही — तुमच्या वापरात काहीही बदल नसताना.`],
    ],
    ta: [
      ['ஸ்லாப்கள் சேர்ந்து கொள்கின்றன.', `ஒரே விகிதம் என்பதே இல்லை. உங்கள் கடைசி யூனிட் முதல் யூனிட்டை விட
        விலை அதிகம், நீங்கள் செலுத்திய சராசரி விகிதம் இரண்டுக்கும் இடையே எங்கோ உள்ளது — உங்களுக்கு நினைவில்
        உள்ள மலிவான ஸ்லாபை விட எப்போதும் அதிகம்.`],
      ['நிலையான கட்டணம் நுகர்வு அல்ல.', `இது அனுமதிக்கப்பட்ட சுமையின் ஒவ்வொரு kW-க்கும் விதிக்கப்படுகிறது,
        பயன்பாடு எதுவாக இருந்தாலும் — எனவே நீங்கள் மிகக் குறைவாகப் பயன்படுத்திய மாதத்தில்தான் ஒரு
        யூனிட்டுக்கு இது மிகக் கனமாக விழுகிறது.`],
      ['வரி கடைசியாக வருகிறது.', `மின் வரி கட்டணங்களுக்கு மேல் விதிக்கப்படுகிறது — பல மாநிலங்களில் முழு
        பில்லின் மீதும், ஆற்றல் பகுதியின் மீது மட்டும் அல்ல.`],
      ['பாஸ்-த்ரூ முன்னறிவிப்பின்றி மாறலாம்.', `எரிபொருள் கூடுதல் கட்டணம் அவ்வப்போது மறுகணக்கிடப்படுகிறது,
        ஒரு பில்லில் தோன்றி அடுத்ததில் தோன்றாமல் போகலாம் — உங்கள் பயன்பாட்டில் எந்த மாற்றமும் இல்லாமல்.`],
    ],
  },
  higherOutro: {
    en: `If the total still looks wrong after accounting for those, the next thing to check is the
      reading — an estimated or averaged bill followed by a real reading produces one alarming month
      that is really two months of consumption.`,
    hi: `इन सबका हिसाब लगाने के बाद भी कुल राशि ग़लत लगे, तो अगली चीज़ रीडिंग देखिए — अनुमान या औसत वाले बिल
      के बाद जब असली रीडिंग आती है, तो एक चौंकाने वाला महीना बनता है जो असल में दो महीनों की खपत होती है।`,
    mr: `हे सर्व हिशेबात घेतल्यावरही एकूण रक्कम चुकीची वाटत असेल, तर पुढे रीडिंग तपासा — अंदाजाच्या किंवा
      सरासरीच्या बिलानंतर खरी रीडिंग आली की एक धक्कादायक महिना तयार होतो, जो प्रत्यक्षात दोन महिन्यांचा
      वापर असतो.`,
    ta: `இவற்றையெல்லாம் கணக்கில் கொண்ட பிறகும் மொத்தம் தவறாகத் தோன்றினால், அடுத்ததாக ரீடிங்கைப் பாருங்கள் —
      மதிப்பீட்டு அல்லது சராசரி பில்லுக்குப் பிறகு உண்மையான ரீடிங் வரும்போது ஒரு அதிர்ச்சியூட்டும் மாதம்
      உருவாகும், அது உண்மையில் இரு மாத நுகர்வு.`,
  },

  faqH2: {
    en: 'Common questions', hi: 'आम सवाल', mr: 'सामान्य प्रश्न', ta: 'பொதுவான கேள்விகள்',
  },
  faq: [
    {
      q: {
        en: 'Why does my bill have a fixed charge when I used no electricity?',
        hi: 'बिजली इस्तेमाल ही नहीं की, फिर बिल पर नियत प्रभार क्यों है?',
        mr: 'वीज वापरलीच नाही, तरी बिलावर स्थिर आकार का?',
        ta: 'மின்சாரமே பயன்படுத்தவில்லை, பிறகு ஏன் பில்லில் நிலையான கட்டணம்?',
      },
      a: {
        en: `Because the fixed charge pays for the connection, not the consumption — the line to your
          premises, the meter, and the capacity kept available for you. It is levied per kW of sanctioned
          load and applies to a locked house. The only way to stop it is to surrender the connection
          formally; simply not using power does not.`,
        hi: `क्योंकि नियत प्रभार कनेक्शन का दाम है, खपत का नहीं — आपके परिसर तक की लाइन, मीटर, और आपके लिए
          तैयार रखी गई क्षमता। यह स्वीकृत भार के हर kW पर लगता है और बंद पड़े घर पर भी लगता है। इसे रोकने का
          एक ही तरीक़ा है, कनेक्शन विधिवत सरेंडर करना; सिर्फ़ बिजली न इस्तेमाल करने से यह नहीं रुकता।`,
        mr: `कारण स्थिर आकार जोडणीची किंमत आहे, वापराची नव्हे — तुमच्या जागेपर्यंतची लाइन, मीटर, आणि
          तुमच्यासाठी राखून ठेवलेली क्षमता. तो मंजूर भाराच्या प्रत्येक kW वर लागतो आणि बंद घरालाही लागतो.
          तो थांबवण्याचा एकच मार्ग म्हणजे जोडणी रीतसर परत करणे; केवळ वीज न वापरल्याने तो थांबत नाही.`,
        ta: `ஏனெனில் நிலையான கட்டணம் இணைப்பின் விலை, நுகர்வின் அல்ல — உங்கள் இடம் வரையிலான வழி, மீட்டர்,
          உங்களுக்காக ஒதுக்கி வைக்கப்பட்ட கொள்ளளவு. இது அனுமதிக்கப்பட்ட சுமையின் ஒவ்வொரு kW-க்கும்
          விதிக்கப்படுகிறது, பூட்டிய வீட்டுக்கும் பொருந்தும். இதை நிறுத்த ஒரே வழி இணைப்பை முறையாகச்
          சரணடைவதுதான்; வெறுமனே மின்சாரம் பயன்படுத்தாமல் இருப்பதால் நிற்காது.`,
      },
    },
    {
      q: {
        en: 'What is FPPA on my electricity bill?',
        hi: 'बिजली के बिल पर FPPA क्या है?',
        mr: 'वीज बिलावरील FPPA म्हणजे काय?',
        ta: 'மின் பில்லில் FPPA என்றால் என்ன?',
      },
      a: {
        en: `Fuel and Power Purchase Adjustment: the difference between what the DISCOM actually paid
          for power and what the regulator assumed when your tariff was fixed, passed through to you. It is
          recalculated periodically, so it varies month to month even when your usage does not. Some states
          charge it in paise per unit, others as a percentage of the energy charge.`,
        hi: `Fuel and Power Purchase Adjustment: DISCOM ने बिजली के लिए असल में जो चुकाया और आपका टैरिफ़ तय
          करते समय नियामक ने जो मान लिया था, उन दोनों का अंतर — जो आप तक पहुँचाया जाता है। यह समय-समय पर
          दोबारा तय होता है, इसलिए आपकी खपत न बदले तब भी महीने-दर-महीने बदलता रहता है। कुछ राज्य इसे प्रति
          यूनिट पैसे में लेते हैं, कुछ ऊर्जा प्रभार के प्रतिशत के रूप में।`,
        mr: `Fuel and Power Purchase Adjustment: DISCOM ने विजेसाठी प्रत्यक्षात जे भरले आणि तुमचा टॅरिफ
          ठरवताना नियामकाने जे गृहीत धरले, या दोहोंतील फरक — जो तुमच्यापर्यंत पोहोचवला जातो. तो वेळोवेळी
          पुन्हा ठरतो, त्यामुळे तुमचा वापर न बदलताही तो दरमहा बदलतो. काही राज्ये तो प्रति युनिट पैशांत
          घेतात, काही ऊर्जा आकाराच्या टक्केवारीत.`,
        ta: `Fuel and Power Purchase Adjustment: மின்சாரத்திற்காக DISCOM உண்மையில் செலுத்தியதற்கும், உங்கள்
          கட்டணம் நிர்ணயிக்கப்பட்டபோது ஒழுங்குமுறை ஆணையம் கருதியதற்கும் உள்ள வித்தியாசம் — அது உங்களுக்குக்
          கடத்தப்படுகிறது. இது அவ்வப்போது மறுகணக்கிடப்படுகிறது, எனவே உங்கள் பயன்பாடு மாறாவிட்டாலும் மாதந்தோறும்
          மாறும். சில மாநிலங்கள் யூனிட்டுக்கு பைசாவில் வசூலிக்கின்றன, சில ஆற்றல் கட்டணத்தின் சதவீதமாக.`,
      },
    },
    {
      q: {
        en: 'Is GST charged on an electricity bill?',
        hi: 'क्या बिजली के बिल पर GST लगता है?',
        mr: 'वीज बिलावर GST लागतो का?',
        ta: 'மின் பில்லில் GST வசூலிக்கப்படுகிறதா?',
      },
      a: {
        en: `No. The supply of electricity to a domestic consumer is exempt from GST. What you see is
          electricity duty, a state tax, which is a different thing. GST can appear on ancillary items a
          DISCOM bills separately — a new connection fee, a meter testing charge — but not on the energy
          supply itself.`,
        hi: `नहीं। घरेलू उपभोक्ता को बिजली की आपूर्ति GST से मुक्त है। आपको जो दिखता है वह विद्युत शुल्क है,
          एक राज्य कर, जो अलग चीज़ है। DISCOM जो चीज़ें अलग से बिल करता है उन पर GST आ सकता है — नए कनेक्शन का
          शुल्क, मीटर जाँच का प्रभार — पर बिजली की आपूर्ति पर नहीं।`,
        mr: `नाही. घरगुती ग्राहकाला विजेचा पुरवठा GST मधून वगळलेला आहे. तुम्हाला दिसते ते वीज शुल्क आहे, एक
          राज्य कर, जी वेगळी गोष्ट आहे. DISCOM जे स्वतंत्रपणे बिल करते त्यावर GST येऊ शकतो — नव्या जोडणीचे
          शुल्क, मीटर तपासणीचा आकार — पण विजेच्या पुरवठ्यावर नाही.`,
        ta: `இல்லை. வீட்டு நுகர்வோருக்கு மின்சார விநியோகம் GST-இலிருந்து விலக்கு பெற்றது. நீங்கள் பார்ப்பது
          மின் வரி, ஒரு மாநில வரி, அது வேறு விஷயம். DISCOM தனியாகப் பில் செய்யும் இதர விஷயங்களில் GST வரலாம் —
          புதிய இணைப்புக் கட்டணம், மீட்டர் சோதனைக் கட்டணம் — ஆனால் மின் விநியோகத்தின் மீது அல்ல.`,
      },
    },
    {
      q: {
        en: 'My bill says "Average" or "Provisional". What does that mean?',
        hi: 'मेरे बिल पर "Average" या "Provisional" लिखा है। इसका क्या मतलब?',
        mr: 'माझ्या बिलावर "Average" किंवा "Provisional" लिहिले आहे. याचा अर्थ काय?',
        ta: 'என் பில்லில் "Average" அல்லது "Provisional" என்று உள்ளது. அதன் பொருள் என்ன?',
      },
      a: {
        en: `Nobody read the meter that month, so the DISCOM estimated the consumption from your
          history. It is trued up on the next actual reading, which is why an estimated month is often
          followed by an unusually large one. Take your own reading and quote it when you raise it — the
          adjustment is routine.`,
        hi: `उस महीने किसी ने मीटर पढ़ा ही नहीं, इसलिए DISCOM ने आपके पिछले रिकॉर्ड से खपत का अनुमान लगाया।
          अगली असली रीडिंग पर इसका हिसाब बराबर होता है — इसीलिए अनुमान वाले महीने के बाद अक्सर एक असामान्य
          रूप से बड़ा महीना आता है। अपनी रीडिंग खुद लीजिए और शिकायत करते समय वही बताइए — यह सुधार आम बात है।`,
        mr: `त्या महिन्यात कुणीही मीटर वाचले नाही, म्हणून DISCOM ने तुमच्या मागील नोंदींवरून वापराचा अंदाज
          लावला. पुढच्या खऱ्या रीडिंगला त्याचा हिशोब बरोबर होतो — म्हणूनच अंदाजाच्या महिन्यानंतर बरेचदा एक
          असामान्यपणे मोठा महिना येतो. स्वतःची रीडिंग घ्या आणि तक्रार करताना तीच नमूद करा — ही दुरुस्ती
          नेहमीचीच आहे.`,
        ta: `அந்த மாதம் யாரும் மீட்டரைப் படிக்கவில்லை, எனவே DISCOM உங்கள் முந்தைய பதிவுகளிலிருந்து நுகர்வை
          மதிப்பிட்டது. அடுத்த உண்மையான ரீடிங்கில் அது சரிசெய்யப்படுகிறது — அதனால்தான் மதிப்பீட்டு மாதத்திற்குப்
          பிறகு பெரும்பாலும் வழக்கத்திற்கு மாறாக ஒரு பெரிய மாதம் வருகிறது. நீங்களே ரீடிங் எடுத்து, புகார்
          அளிக்கும்போது அதைக் குறிப்பிடுங்கள் — இந்தத் திருத்தம் வழக்கமானது.`,
      },
    },
    {
      q: {
        en: 'Can I change my tariff category?',
        hi: 'क्या मैं अपनी टैरिफ़ श्रेणी बदल सकता हूँ?',
        mr: 'मी माझी टॅरिफ श्रेणी बदलू शकतो का?',
        ta: 'என் கட்டண வகையை மாற்ற முடியுமா?',
      },
      a: {
        en: `Yes, by applying to the DISCOM with evidence of how the premises is used. It matters:
          a home billed under a commercial schedule can pay close to double. The change is normally
          prospective, so the sooner a wrong category is caught the less it costs.`,
        hi: `हाँ, DISCOM को आवेदन देकर, इस प्रमाण के साथ कि परिसर का उपयोग कैसा है। यह मायने रखता है:
          व्यावसायिक अनुसूची पर बिल बनने वाला घर लगभग दोगुना चुका सकता है। बदलाव आमतौर पर आगे के लिए होता है,
          इसलिए ग़लत श्रेणी जितनी जल्दी पकड़ी जाए, उतना कम नुक़सान।`,
        mr: `होय, जागेचा वापर कसा आहे याचा पुरावा देऊन DISCOM कडे अर्ज करून. हे महत्त्वाचे आहे: व्यावसायिक
          अनुसूचीवर बिल होणारे घर जवळपास दुप्पट भरू शकते. बदल सहसा पुढच्या काळासाठी लागू होतो, त्यामुळे चुकीची
          श्रेणी जितक्या लवकर लक्षात येईल तितका तोटा कमी.`,
        ta: `ஆம், இடம் எப்படிப் பயன்படுத்தப்படுகிறது என்பதற்கான ஆதாரத்துடன் DISCOM-இடம் விண்ணப்பித்து. இது
          முக்கியம்: வணிக அட்டவணையில் பில் செய்யப்படும் வீடு கிட்டத்தட்ட இரு மடங்கு செலுத்த நேரிடும். மாற்றம்
          பொதுவாக எதிர்காலத்திற்கே பொருந்தும், எனவே தவறான வகை எவ்வளவு விரைவில் கண்டறியப்படுகிறதோ அவ்வளவு
          நஷ்டம் குறையும்.`,
      },
    },
  ],

  realThing: {
    en: 'The real thing:', hi: 'असली चीज़:', mr: 'खरी गोष्ट:', ta: 'உண்மையானது:',
  },
  realBill: {
    en: 'See this DISCOM’s real bill layout',
    hi: 'इस DISCOM का असली बिल कैसा दिखता है',
    mr: 'या DISCOM चे खरे बिल कसे दिसते',
    ta: 'இந்த DISCOM-இன் உண்மையான பில் அமைப்பு',
  },
  realRates: {
    en: 'Its full rate schedule', hi: 'इसकी पूरी दर-अनुसूची',
    mr: 'त्याची संपूर्ण दर-अनुसूची', ta: 'அதன் முழு விகித அட்டவணை',
  },

  nextH2: { en: 'Next steps', hi: 'आगे क्या', mr: 'पुढे काय', ta: 'அடுத்த படிகள்' },
  cards: {
    calc: {
      t: {
        en: 'Calculate your actual bill', hi: 'अपना असली बिल जोड़ें',
        mr: 'तुमचे खरे बिल मोजा', ta: 'உங்கள் உண்மையான பில்லைக் கணக்கிடுங்கள்',
      },
      d: {
        en: 'Your DISCOM, your units, your load — the full bill with every line itemised.',
        hi: 'आपका DISCOM, आपकी यूनिट, आपका भार — पूरा बिल, हर पंक्ति अलग-अलग।',
        mr: 'तुमचा DISCOM, तुमची युनिट, तुमचा भार — संपूर्ण बिल, प्रत्येक ओळ स्वतंत्र.',
        ta: 'உங்கள் DISCOM, உங்கள் யூனிட், உங்கள் சுமை — ஒவ்வொரு வரியும் தனித்தனியாக முழுப் பில்.',
      },
      href: '/#calculator',
    },
    check: {
      t: {
        en: 'Check a bill you have received', hi: 'अपना आया हुआ बिल जाँचें',
        mr: 'तुम्हाला आलेले बिल तपासा', ta: 'உங்களுக்கு வந்த பில்லைச் சரிபாருங்கள்',
      },
      d: {
        en: 'Upload or type in a bill and see whether the charges add up.',
        hi: 'बिल अपलोड कीजिए या टाइप कीजिए, और देखिए कि प्रभार सही जुड़ते हैं या नहीं।',
        mr: 'बिल अपलोड करा किंवा टाइप करा, आणि आकार बरोबर जुळतात का ते पाहा.',
        ta: 'பில்லை பதிவேற்றுங்கள் அல்லது தட்டச்சு செய்யுங்கள், கட்டணங்கள் சரியாகக் கூடுகிறதா என்று பாருங்கள்.',
      },
      href: '/check-my-bill/',
    },
    glossary: {
      t: {
        en: 'Glossary of billing terms', hi: 'बिलिंग शब्दावली',
        mr: 'बिलिंग शब्दसंग्रह', ta: 'பில்லிங் சொற்களஞ்சியம்',
      },
      d: {
        en: 'Every abbreviation an Indian electricity bill can print, defined.',
        hi: 'भारतीय बिजली बिल पर छप सकने वाले हर संक्षिप्त नाम की परिभाषा।',
        mr: 'भारतीय वीज बिलावर छापल्या जाणाऱ्या प्रत्येक संक्षिप्त नावाची व्याख्या.',
        ta: 'இந்திய மின் பில்லில் அச்சிடப்படக்கூடிய ஒவ்வொரு சுருக்கெழுத்துக்கும் விளக்கம்.',
      },
      href: '/glossary/',
    },
    load: {
      t: {
        en: 'Is your sanctioned load right?', hi: 'क्या आपका स्वीकृत भार सही है?',
        mr: 'तुमचा मंजूर भार योग्य आहे का?', ta: 'உங்கள் அனுமதிக்கப்பட்ட சுமை சரியா?',
      },
      d: {
        en: 'What raising or lowering it costs, and when the penalty starts to bite.',
        hi: 'इसे बढ़ाने या घटाने में क्या लगता है, और शास्ति कब चुभने लगती है।',
        mr: 'तो वाढवण्यात किंवा कमी करण्यात काय खर्च, आणि दंड कधी बोचू लागतो.',
        ta: 'அதை உயர்த்துவதற்கோ குறைப்பதற்கோ ஆகும் செலவு, அபராதம் எப்போது வலிக்கத் தொடங்கும்.',
      },
      href: '/sanctioned-load-optimizer/',
    },
  },

  disclaimer: {
    en: `The bill above is an illustration built from published tariff schedules. It is not a bill, not a
      quotation, and not a substitute for the one your DISCOM issues. Where a figure here and a figure on
      your bill disagree, your bill is the authority — and if you think it is wrong, raise it with the
      DISCOM.`,
    hi: `ऊपर का बिल प्रकाशित टैरिफ़ अनुसूचियों से बनाया गया एक उदाहरण है। यह न बिल है, न कोई कोटेशन, और न ही
      आपके DISCOM के जारी किए बिल का विकल्प। यहाँ का कोई आंकड़ा और आपके बिल का आंकड़ा अलग हों, तो आपका बिल ही
      प्रमाण है — और अगर आपको लगे कि वह ग़लत है, तो DISCOM के सामने उठाइए।`,
    mr: `वरचे बिल प्रकाशित टॅरिफ अनुसूचींवरून तयार केलेले उदाहरण आहे. ते बिल नाही, कोटेशन नाही, आणि तुमच्या
      DISCOM ने दिलेल्या बिलाला पर्यायही नाही. इथला एखादा आकडा आणि तुमच्या बिलावरचा आकडा जुळत नसेल, तर तुमचे
      बिलच प्रमाण — आणि ते चुकीचे वाटत असेल तर DISCOM कडे मांडा.`,
    ta: `மேலே உள்ள பில் வெளியிடப்பட்ட கட்டண அட்டவணைகளிலிருந்து உருவாக்கப்பட்ட ஒரு விளக்கம். இது பில் அல்ல,
      மதிப்பீடு அல்ல, உங்கள் DISCOM வழங்கும் பில்லுக்கு மாற்றும் அல்ல. இங்குள்ள ஒரு எண்ணும் உங்கள் பில்லில்
      உள்ள எண்ணும் வேறுபட்டால், உங்கள் பில்லே அதிகாரபூர்வமானது — அது தவறு என்று நினைத்தால் DISCOM-இடம்
      எழுப்புங்கள்.`,
  },
};

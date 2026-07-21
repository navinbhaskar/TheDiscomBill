// glossary-content.js — definitions for the /glossary/ billing glossary.
//
// Rendered into a single static page by generate-seo.js (glossaryPage), which also emits
// a DefinedTermSet + DefinedTerm JSON-LD graph. Definitional content is what LLMs quote and
// it earns internal links from every tariff page (nav, footer and a contextual block).
//
// Each entry:
//   term   — display name (may include the expansion in parentheses)
//   slug   — anchor id; MUST stay stable (tariff pages deep-link to /glossary/#<slug>)
//   abbr   — short form / initialism, if any (becomes alternateName in schema)
//   aka    — other names the same concept goes by (also alternateName)
//   short  — one-sentence definition; used as the DefinedTerm.description and the lead line.
//            Keep it self-contained — this is the sentence an LLM or snippet will lift.
//   body   — trusted hand-authored HTML with the fuller explanation (no user input flows here).
//   termHi / chipHi / shortHi / bodyHi — Hindi renderings used only for the runtime language
//            switch on /glossary/ (injected as window.__i18nGlossary; see generate-seo.js).
//            The English fields above remain the source of truth for schema + snippets.
//
// Never hard-code a specific tariff rate that drifts yearly — describe the structure and link
// to /tariffs/ or the calculator, which ARE regenerated from live data.

export const GLOSSARY = [
  {
    term: 'Connected Load',
    slug: 'connected-load',
    guide: 'reduce-fixed-charges-sanctioned-load',
    aka: ['Contract Demand'],
    short: 'The total load of all the appliances and equipment wired to your connection, declared in kW — the basis on which a supply connection is sanctioned.',
    body: `<p>Connected load is the sum of the wattage of everything that can draw power on your
      premises. You declare it when applying for a connection, and the DISCOM sanctions a
      <a href="/glossary/#sanctioned-load">sanctioned load</a> against it. For low-tension (LT)
      domestic and small commercial consumers, fixed charges are usually billed per kW of
      sanctioned load. High-tension (HT) and large consumers instead contract a
      <strong>contract demand</strong> in kVA and are billed on
      <a href="/glossary/#maximum-demand">maximum demand</a>.</p>`,
    termHi: 'कनेक्टेड लोड (Connected Load)',
    chipHi: 'कनेक्टेड लोड',
    shortHi: 'आपके कनेक्शन से जुड़े सभी उपकरणों का कुल भार, kW में घोषित — वह आधार जिस पर आपूर्ति कनेक्शन स्वीकृत होता है।',
    bodyHi: `<p>कनेक्टेड लोड आपके परिसर में बिजली खींच सकने वाली हर चीज़ की वाट क्षमता का योग है। कनेक्शन के लिए
      आवेदन करते समय आप इसे घोषित करते हैं, और डिस्कॉम इसके विरुद्ध एक
      <a href="/glossary/#sanctioned-load">स्वीकृत भार</a> स्वीकृत करता है। लो-टेंशन (LT) घरेलू व छोटे व्यावसायिक
      उपभोक्ताओं के लिए फिक्स्ड शुल्क आम तौर पर प्रति kW स्वीकृत भार पर लगते हैं। हाई-टेंशन (HT) व बड़े उपभोक्ता
      इसके बजाय kVA में <strong>अनुबंध मांग</strong> तय करते हैं और
      <a href="/glossary/#maximum-demand">अधिकतम मांग</a> पर बिल किए जाते हैं।</p>`,
    termMr: 'कनेक्टेड लोड (Connected Load)',
    chipMr: 'कनेक्टेड लोड',
    shortMr: 'तुमच्या कनेक्शनला जोडलेल्या सर्व उपकरणांचा एकूण भार, kW मध्ये घोषित — ज्या आधारावर पुरवठा कनेक्शन मंजूर होते.',
    bodyMr: `<p>कनेक्टेड लोड म्हणजे तुमच्या आवारात वीज खेचू शकणाऱ्या प्रत्येक गोष्टीच्या वॅट क्षमतेची बेरीज. कनेक्शनसाठी
      अर्ज करताना तुम्ही ते घोषित करता, आणि डिस्कॉम त्याविरुद्ध एक <a href="/glossary/#sanctioned-load">मंजूर भार</a>
      मंजूर करते. लो-टेन्शन (LT) घरगुती व लहान व्यावसायिक ग्राहकांसाठी फिक्स्ड चार्ज सहसा प्रति kW मंजूर भारावर आकारले
      जातात. हाय-टेन्शन (HT) व मोठे ग्राहक त्याऐवजी kVA मध्ये <strong>करार मागणी</strong> ठरवतात आणि
      <a href="/glossary/#maximum-demand">कमाल मागणी</a>वर बिल केले जातात.</p>`,
    termTa: 'இணைக்கப்பட்ட சுமை (Connected Load)',
    chipTa: 'இணைக்கப்பட்ட சுமை',
    shortTa: 'உங்கள் இணைப்பில் இணைக்கப்பட்ட அனைத்து சாதனங்களின் மொத்த சுமை, kW-இல் அறிவிக்கப்படுகிறது — இணைப்பு அனுமதிக்கப்படும் அடிப்படை இதுவே.',
    bodyTa: `<p>இணைக்கப்பட்ட சுமை என்பது உங்கள் வளாகத்தில் மின்சாரம் இழுக்கக்கூடிய அனைத்தின் வாட் திறனின் கூட்டுத்தொகை.
      இணைப்புக்கு விண்ணப்பிக்கும்போது நீங்கள் இதை அறிவிக்கிறீர்கள், DISCOM அதற்கு எதிராக ஒரு
      <a href="/glossary/#sanctioned-load">அனுமதிக்கப்பட்ட சுமையை</a> அனுமதிக்கிறது. குறைந்த-அழுத்த (LT) வீட்டு மற்றும்
      சிறு வணிக நுகர்வோருக்கு நிலையான கட்டணங்கள் பொதுவாக ஒரு kW அனுமதிக்கப்பட்ட சுமைக்கு வசூலிக்கப்படுகின்றன. உயர்-அழுத்த
      (HT) மற்றும் பெரிய நுகர்வோர் அதற்குப் பதிலாக kVA-இல் <strong>ஒப்பந்த தேவையை</strong> ஒப்பந்தம் செய்து
      <a href="/glossary/#maximum-demand">அதிகபட்ச தேவை</a> அடிப்படையில் பட்டியலிடப்படுகிறார்கள்.</p>`,
  },
  {
    term: 'Electricity Duty',
    slug: 'electricity-duty',
    guide: 'electricity-duty-explained',
    abbr: 'ED',
    short: 'A tax levied by the state government on electricity consumption — collected through your bill but paid to the state treasury, not the DISCOM.',
    body: `<p>Electricity duty is a <strong>state tax</strong>, not a DISCOM charge. It is added to
      your bill as either paise per unit or a percentage of the energy charge, and the rate is set
      by your state government — so it varies from state to state and by consumer category. Because
      it is a government levy, it is typically calculated on the energy charge (and sometimes the
      fuel surcharge) but not on itself. Some categories, such as agriculture or lifeline domestic
      slabs, are partly or fully exempt.</p>`,
    termHi: 'बिजली शुल्क (Electricity Duty)',
    chipHi: 'बिजली शुल्क',
    shortHi: 'बिजली खपत पर राज्य सरकार द्वारा लगाया गया कर — आपके बिल के माध्यम से एकत्र किया जाता है पर डिस्कॉम को नहीं, राज्य कोष को दिया जाता है।',
    bodyHi: `<p>बिजली शुल्क एक <strong>राज्य कर</strong> है, डिस्कॉम शुल्क नहीं। यह आपके बिल में या तो पैसे प्रति
      यूनिट या ऊर्जा शुल्क के प्रतिशत के रूप में जोड़ा जाता है, और दर आपकी राज्य सरकार तय करती है — इसलिए यह
      राज्य-दर-राज्य व उपभोक्ता श्रेणी के अनुसार भिन्न होता है। चूँकि यह एक सरकारी उद्ग्रहण है, यह आम तौर पर
      ऊर्जा शुल्क (और कभी-कभी ईंधन अधिभार) पर गणना किया जाता है, स्वयं पर नहीं। कुछ श्रेणियाँ, जैसे कृषि या
      लाइफलाइन घरेलू स्लैब, आंशिक या पूर्ण रूप से छूट प्राप्त हैं।</p>`,
    termMr: 'वीज शुल्क (Electricity Duty)',
    chipMr: 'वीज शुल्क',
    shortMr: 'वीज वापरावर राज्य सरकारने आकारलेला कर — तुमच्या बिलामार्फत गोळा केला जातो पण डिस्कॉमला नाही, राज्याच्या तिजोरीत जमा होतो.',
    bodyMr: `<p>वीज शुल्क हा एक <strong>राज्य कर</strong> आहे, डिस्कॉम शुल्क नाही. ते तुमच्या बिलात एकतर पैसे प्रति
      युनिट किंवा ऊर्जा शुल्काच्या टक्केवारीच्या स्वरूपात जोडले जाते, आणि दर तुमची राज्य सरकार ठरवते — त्यामुळे ते
      राज्यानुसार व ग्राहक श्रेणीनुसार बदलते. सरकारी आकारणी असल्याने, ते सहसा ऊर्जा शुल्कावर (आणि कधीकधी इंधन अधिभारावर)
      मोजले जाते, स्वतःवर नाही. काही श्रेणी, जसे की शेती किंवा लाइफलाइन घरगुती स्लॅब, अंशतः किंवा पूर्णपणे सूट मिळालेल्या
      असतात.</p>`,
    termTa: 'மின் வரி (Electricity Duty)',
    chipTa: 'மின் வரி',
    shortTa: 'மின் நுகர்வின் மீது மாநில அரசு விதிக்கும் வரி — உங்கள் பில் மூலம் வசூலிக்கப்பட்டாலும் DISCOM-க்கு அல்ல, மாநில கருவூலத்திற்கே செலுத்தப்படுகிறது.',
    bodyTa: `<p>மின் வரி என்பது ஒரு <strong>மாநில வரி</strong>, DISCOM கட்டணம் அல்ல. இது உங்கள் பில்லில் ஒரு யூனிட்டுக்கு
      பைசா அல்லது ஆற்றல் கட்டணத்தின் சதவீதமாக சேர்க்கப்படுகிறது, விகிதத்தை உங்கள் மாநில அரசு நிர்ணயிக்கிறது — எனவே இது
      மாநிலத்திற்கு மாநிலம் மற்றும் நுகர்வோர் வகைக்கு ஏற்ப மாறுபடும். இது ஒரு அரசு வசூல் என்பதால், பொதுவாக ஆற்றல்
      கட்டணத்தின் (சில நேரங்களில் எரிபொருள் கூடுதல் கட்டணத்தின்) மீது கணக்கிடப்படுகிறது, அதன் மீதே அல்ல. விவசாயம் அல்லது
      லைஃப்லைன் வீட்டு அடுக்குகள் போன்ற சில வகைகள் பகுதியாகவோ முழுமையாகவோ விலக்கு பெற்றவை.</p>`,
  },
  {
    term: 'Fixed Charge (Demand Charge)',
    slug: 'fixed-charge',
    guide: 'reduce-fixed-charges-sanctioned-load',
    aka: ['Demand Charge', 'Fixed Cost'],
    short: 'A standing monthly charge billed on your sanctioned load or demand (per kW / kVA, or a flat amount) regardless of how many units you consume.',
    body: `<p>The fixed charge recovers the cost of keeping capacity available for you — wires,
      transformers and the sanctioned <a href="/glossary/#connected-load">load</a> reserved for your
      connection. It is billed <strong>even in a zero-consumption month</strong>. Common structures
      are a flat amount, a rate per kW of <a href="/glossary/#sanctioned-load">sanctioned load</a>, or
      (for larger consumers) a rate per kVA of <a href="/glossary/#maximum-demand">maximum demand</a>.
      For HT consumers this "demand charge" is often the single largest line on the bill.</p>`,
    termHi: 'फिक्स्ड शुल्क (मांग शुल्क)',
    chipHi: 'फिक्स्ड शुल्क',
    shortHi: 'आपके स्वीकृत भार या मांग पर लगने वाला एक स्थायी मासिक शुल्क (प्रति kW / kVA, या एक निश्चित राशि), चाहे आप कितनी भी यूनिट खपत करें।',
    bodyHi: `<p>फिक्स्ड शुल्क आपके लिए क्षमता उपलब्ध रखने की लागत की वसूली करता है — तार, ट्रांसफार्मर व आपके
      कनेक्शन के लिए आरक्षित स्वीकृत <a href="/glossary/#connected-load">भार</a>। यह
      <strong>शून्य-खपत माह में भी</strong> बिल किया जाता है। सामान्य संरचनाएँ हैं एक निश्चित राशि, प्रति kW
      <a href="/glossary/#sanctioned-load">स्वीकृत भार</a> की दर, या (बड़े उपभोक्ताओं के लिए) प्रति kVA
      <a href="/glossary/#maximum-demand">अधिकतम मांग</a> की दर। HT उपभोक्ताओं के लिए यह "मांग शुल्क" अक्सर
      बिल की सबसे बड़ी पंक्ति होती है।</p>`,
    termMr: 'फिक्स्ड चार्ज (मागणी शुल्क)',
    chipMr: 'फिक्स्ड चार्ज',
    shortMr: 'तुमच्या मंजूर भारावर किंवा मागणीवर आकारले जाणारे एक स्थायी मासिक शुल्क (प्रति kW / kVA, किंवा एक ठराविक रक्कम), तुम्ही कितीही युनिट वापरा.',
    bodyMr: `<p>फिक्स्ड चार्ज तुमच्यासाठी क्षमता उपलब्ध ठेवण्याचा खर्च वसूल करते — तारा, ट्रान्सफॉर्मर व तुमच्या
      कनेक्शनसाठी राखीव मंजूर <a href="/glossary/#connected-load">भार</a>. ते <strong>शून्य-वापर महिन्यातही</strong>
      आकारले जाते. सामान्य रचना म्हणजे एक ठराविक रक्कम, प्रति kW <a href="/glossary/#sanctioned-load">मंजूर भार</a>
      दर, किंवा (मोठ्या ग्राहकांसाठी) प्रति kVA <a href="/glossary/#maximum-demand">कमाल मागणी</a> दर. HT ग्राहकांसाठी
      हे "मागणी शुल्क" अनेकदा बिलावरील सर्वात मोठी ओळ असते.</p>`,
    termTa: 'நிலையான கட்டணம் (தேவை கட்டணம்)',
    chipTa: 'நிலையான கட்டணம்',
    shortTa: 'உங்கள் அனுமதிக்கப்பட்ட சுமை அல்லது தேவையின் மீது வசூலிக்கப்படும் ஒரு நிலையான மாதாந்திர கட்டணம் (kW / kVA-க்கு, அல்லது ஒரு நிலையான தொகை), நீங்கள் எத்தனை யூனிட் பயன்படுத்தினாலும்.',
    bodyTa: `<p>நிலையான கட்டணம் உங்களுக்காக திறனைக் கிடைக்கச் செய்யும் செலவை மீட்கிறது — கம்பிகள், மின்மாற்றிகள் மற்றும்
      உங்கள் இணைப்புக்காக ஒதுக்கப்பட்ட அனுமதிக்கப்பட்ட <a href="/glossary/#connected-load">சுமை</a>. இது
      <strong>பூஜ்ஜிய-நுகர்வு மாதத்திலும்</strong> வசூலிக்கப்படுகிறது. பொதுவான அமைப்புகள் ஒரு நிலையான தொகை, ஒரு kW
      <a href="/glossary/#sanctioned-load">அனுமதிக்கப்பட்ட சுமைக்கு</a> ஒரு விகிதம், அல்லது (பெரிய நுகர்வோருக்கு) ஒரு
      kVA <a href="/glossary/#maximum-demand">அதிகபட்ச தேவைக்கு</a> ஒரு விகிதம். HT நுகர்வோருக்கு இந்த "தேவை கட்டணம்"
      பெரும்பாலும் பில்லில் மிகப்பெரிய வரியாக இருக்கும்.</p>`,
  },
  {
    term: 'FPPA (Fuel & Power Purchase Adjustment)',
    slug: 'fppa',
    guide: 'how-fppa-fuel-surcharge-is-calculated',
    abbr: 'FPPA',
    aka: ['FPPCA', 'FAC', 'Fuel Surcharge', 'Fuel Adjustment Charge'],
    short: 'A periodic surcharge that passes the utility’s changing fuel and power-purchase costs through to consumers, levied either per unit or as a percentage of the energy charge.',
    body: `<p>DISCOMs buy power at prices that move with fuel costs and market rates. When the actual
      cost differs from the cost baked into the approved tariff, the regulator lets the DISCOM recover
      (or refund) the gap through the FPPA — a surcharge that changes every month or quarter. It is
      applied in one of two ways depending on the state's tariff order:</p>
      <ul>
        <li><strong>Per unit</strong> — a flat paise-per-unit amount added to every unit consumed.</li>
        <li><strong>Percentage</strong> — a percentage of your energy (or energy + fixed) charge.</li>
      </ul>
      <p>A negative FPPA is a <em>credit</em> that reduces your bill. Our
      <a href="/#calculator">calculator</a> applies each DISCOM's current FPPA automatically. The same
      concept is also called <strong>FPPCA</strong>, <strong>FAC</strong> or simply the fuel
      surcharge.</p>`,
    termHi: 'FPPA (ईंधन व विद्युत क्रय समायोजन)',
    chipHi: 'FPPA',
    shortHi: 'एक आवधिक अधिभार जो उपयोगिता की बदलती ईंधन व विद्युत-क्रय लागत को उपभोक्ताओं तक पहुँचाता है, या तो प्रति यूनिट या ऊर्जा शुल्क के प्रतिशत के रूप में लगाया जाता है।',
    bodyHi: `<p>डिस्कॉम बिजली उन कीमतों पर खरीदते हैं जो ईंधन लागत व बाज़ार दरों के साथ बदलती हैं। जब वास्तविक
      लागत स्वीकृत टैरिफ में शामिल लागत से भिन्न होती है, तो नियामक डिस्कॉम को FPPA के माध्यम से अंतर वसूलने
      (या वापस करने) की अनुमति देता है — एक अधिभार जो हर माह या तिमाही बदलता है। इसे राज्य के टैरिफ आदेश के
      अनुसार दो में से किसी एक तरीके से लगाया जाता है:</p>
      <ul>
        <li><strong>प्रति यूनिट</strong> — हर खपत यूनिट पर जोड़ी गई एक निश्चित पैसा-प्रति-यूनिट राशि।</li>
        <li><strong>प्रतिशत</strong> — आपके ऊर्जा (या ऊर्जा + फिक्स्ड) शुल्क का एक प्रतिशत।</li>
      </ul>
      <p>ऋणात्मक FPPA एक <em>क्रेडिट</em> है जो आपका बिल घटाता है। हमारा
      <a href="/#calculator">कैलकुलेटर</a> प्रत्येक डिस्कॉम का वर्तमान FPPA स्वतः लागू करता है। इसी अवधारणा को
      <strong>FPPCA</strong>, <strong>FAC</strong> या केवल ईंधन अधिभार भी कहा जाता है।</p>`,
    termMr: 'FPPA (इंधन व वीज खरेदी समायोजन)',
    chipMr: 'FPPA',
    shortMr: 'एक नियतकालिक अधिभार जो उपयोगिता कंपनीचा बदलता इंधन व वीज-खरेदी खर्च ग्राहकांपर्यंत पोहोचवतो, प्रति युनिट किंवा ऊर्जा शुल्काच्या टक्केवारीच्या स्वरूपात आकारला जातो.',
    bodyMr: `<p>डिस्कॉम इंधन खर्च व बाजार दरांनुसार बदलणाऱ्या किमतींवर वीज खरेदी करतात. जेव्हा प्रत्यक्ष खर्च मंजूर
      टॅरिफमध्ये समाविष्ट खर्चापेक्षा वेगळा असतो, तेव्हा नियामक डिस्कॉमला FPPA मार्फत फरक वसूल करण्याची (किंवा परत
      करण्याची) परवानगी देतो — एक अधिभार जो दर महिना किंवा तिमाही बदलतो. तो राज्याच्या टॅरिफ आदेशानुसार दोनपैकी एका
      पद्धतीने लावला जातो:</p>
      <ul>
        <li><strong>प्रति युनिट</strong> — प्रत्येक वापरलेल्या युनिटवर जोडलेली एक ठराविक पैसे-प्रति-युनिट रक्कम.</li>
        <li><strong>टक्केवारी</strong> — तुमच्या ऊर्जा (किंवा ऊर्जा + फिक्स्ड) शुल्काची एक टक्केवारी.</li>
      </ul>
      <p>ऋण FPPA हे एक <em>क्रेडिट</em> आहे जे तुमचे बिल कमी करते. आमचे <a href="/#calculator">कॅल्क्युलेटर</a>
      प्रत्येक डिस्कॉमचे सध्याचे FPPA आपोआप लावते. याच संकल्पनेला <strong>FPPCA</strong>, <strong>FAC</strong>
      किंवा फक्त इंधन अधिभार असेही म्हणतात.</p>`,
    termTa: 'FPPA (எரிபொருள் & மின் கொள்முதல் சரிசெய்தல்)',
    chipTa: 'FPPA',
    shortTa: 'நிறுவனத்தின் மாறும் எரிபொருள் மற்றும் மின் கொள்முதல் செலவுகளை நுகர்வோருக்குக் கடத்தும் ஒரு கால இடைவெளி கூடுதல் கட்டணம், ஒரு யூனிட்டுக்கு அல்லது ஆற்றல் கட்டணத்தின் சதவீதமாக விதிக்கப்படுகிறது.',
    bodyTa: `<p>DISCOM-கள் எரிபொருள் செலவுகள் மற்றும் சந்தை விலைகளுக்கு ஏற்ப மாறும் விலைகளில் மின்சாரம் வாங்குகின்றன.
      உண்மையான செலவு அங்கீகரிக்கப்பட்ட கட்டணத்தில் உள்ள செலவிலிருந்து மாறுபடும்போது, ​​அந்த இடைவெளியை FPPA மூலம்
      மீட்க (அல்லது திருப்பித் தர) கட்டுப்பாட்டாளர் DISCOM-ஐ அனுமதிக்கிறார் — இது ஒவ்வொரு மாதமும் அல்லது காலாண்டும்
      மாறும் கூடுதல் கட்டணம். மாநிலத்தின் கட்டண ஆணையைப் பொறுத்து இது இரண்டு வழிகளில் ஒன்றில் பயன்படுத்தப்படுகிறது:</p>
      <ul>
        <li><strong>ஒரு யூனிட்டுக்கு</strong> — நுகரப்படும் ஒவ்வொரு யூனிட்டிலும் சேர்க்கப்படும் ஒரு நிலையான
        பைசா-ஒரு-யூனிட் தொகை.</li>
        <li><strong>சதவீதம்</strong> — உங்கள் ஆற்றல் (அல்லது ஆற்றல் + நிலையான) கட்டணத்தின் ஒரு சதவீதம்.</li>
      </ul>
      <p>எதிர்மறை FPPA என்பது உங்கள் பில்லைக் குறைக்கும் ஒரு <em>வரவு</em>. எங்கள்
      <a href="/#calculator">கணிப்பான்</a> ஒவ்வொரு DISCOM-இன் தற்போதைய FPPA-ஐத் தானாகவே பயன்படுத்துகிறது. இதே
      கருத்து <strong>FPPCA</strong>, <strong>FAC</strong> அல்லது வெறுமனே எரிபொருள் கூடுதல் கட்டணம் எனவும்
      அழைக்கப்படுகிறது.</p>`,
  },
  {
    term: 'kVAh (Kilovolt-Ampere-Hour)',
    slug: 'kvah',
    guide: 'power-factor-kvah-billing-explained',
    abbr: 'kVAh',
    short: 'A unit of apparent energy equal to kWh divided by the power factor; on kVAh billing you pay for apparent energy, so a poor power factor directly raises the bill.',
    body: `<p>Ordinary meters record <strong>kWh</strong> (real energy). Many commercial and industrial
      connections are instead billed on <strong>kVAh</strong> — apparent energy, which is
      <code>kWh &divide; power factor</code>. Because a low <a href="/glossary/#power-factor">power
      factor</a> makes kVAh larger than kWh, kVAh billing automatically charges you more when your
      power factor is poor, replacing the separate power-factor penalty. Improving power factor (for
      example with capacitors) brings kVAh close to kWh and lowers the bill. Pick the kVAh basis in
      the calculator if your meter and tariff use apparent energy.</p>`,
    termHi: 'kVAh (किलोवोल्ट-एम्पियर-घंटा)',
    chipHi: 'kVAh',
    shortHi: 'आभासी ऊर्जा की एक इकाई जो kWh को पावर फैक्टर से विभाजित करने के बराबर है; kVAh बिलिंग पर आप आभासी ऊर्जा के लिए भुगतान करते हैं, इसलिए कम पावर फैक्टर सीधे बिल बढ़ाता है।',
    bodyHi: `<p>साधारण मीटर <strong>kWh</strong> (वास्तविक ऊर्जा) दर्ज करते हैं। कई व्यावसायिक व औद्योगिक कनेक्शन
      इसके बजाय <strong>kVAh</strong> पर बिल किए जाते हैं — आभासी ऊर्जा, जो <code>kWh &divide; पावर फैक्टर</code>
      है। चूँकि कम <a href="/glossary/#power-factor">पावर फैक्टर</a> kVAh को kWh से बड़ा बना देता है, kVAh बिलिंग
      तब स्वतः अधिक शुल्क लेती है जब आपका पावर फैक्टर खराब हो, अलग पावर-फैक्टर जुर्माने की जगह। पावर फैक्टर सुधारना
      (उदाहरण के लिए कैपेसिटर से) kVAh को kWh के करीब लाता है और बिल घटाता है। यदि आपका मीटर व टैरिफ आभासी ऊर्जा
      का उपयोग करते हैं तो कैलकुलेटर में kVAh आधार चुनें।</p>`,
    termMr: 'kVAh (किलोव्होल्ट-अँपिअर-तास)',
    chipMr: 'kVAh',
    shortMr: 'आभासी ऊर्जेचे एक एकक जे kWh भागिले पॉवर फॅक्टर एवढे असते; kVAh बिलिंगवर तुम्ही आभासी ऊर्जेसाठी पैसे देता, त्यामुळे कमी पॉवर फॅक्टर थेट बिल वाढवतो.',
    bodyMr: `<p>सामान्य मीटर <strong>kWh</strong> (वास्तविक ऊर्जा) नोंदवतात. अनेक व्यावसायिक व औद्योगिक कनेक्शन त्याऐवजी
      <strong>kVAh</strong> वर बिल केले जातात — आभासी ऊर्जा, जी <code>kWh &divide; पॉवर फॅक्टर</code> आहे. कमी
      <a href="/glossary/#power-factor">पॉवर फॅक्टर</a> kVAh ला kWh पेक्षा मोठे बनवत असल्याने, kVAh बिलिंग तुमचा पॉवर
      फॅक्टर वाईट असताना आपोआप जास्त शुल्क आकारते, स्वतंत्र पॉवर-फॅक्टर दंडाच्या जागी. पॉवर फॅक्टर सुधारल्याने (उदाहरणार्थ
      कॅपॅसिटरने) kVAh kWh च्या जवळ येते आणि बिल कमी होते. तुमचे मीटर व टॅरिफ आभासी ऊर्जा वापरत असतील तर कॅल्क्युलेटरमध्ये
      kVAh आधार निवडा.</p>`,
    termTa: 'kVAh (கிலோவோல்ட்-ஆம்பியர்-மணி)',
    chipTa: 'kVAh',
    shortTa: 'kWh-ஐ பவர் ஃபேக்டரால் வகுத்ததற்குச் சமமான ஒரு தோற்ற ஆற்றல் அலகு; kVAh பட்டியலில் நீங்கள் தோற்ற ஆற்றலுக்குப் பணம் செலுத்துகிறீர்கள், எனவே மோசமான பவர் ஃபேக்டர் நேரடியாக பில்லை உயர்த்துகிறது.',
    bodyTa: `<p>சாதாரண மீட்டர்கள் <strong>kWh</strong> (உண்மையான ஆற்றல்) பதிவு செய்கின்றன. பல வணிக மற்றும் தொழில்துறை
      இணைப்புகள் அதற்குப் பதிலாக <strong>kVAh</strong>-இல் பட்டியலிடப்படுகின்றன — தோற்ற ஆற்றல், அதாவது
      <code>kWh &divide; பவர் ஃபேக்டர்</code>. குறைந்த <a href="/glossary/#power-factor">பவர் ஃபேக்டர்</a> kVAh-ஐ
      kWh-ஐ விட பெரிதாக்குவதால், உங்கள் பவர் ஃபேக்டர் மோசமாக இருக்கும்போது kVAh பட்டியல் தானாகவே அதிக கட்டணம்
      வசூலிக்கிறது, தனி பவர்-ஃபேக்டர் அபராதத்திற்குப் பதிலாக. பவர் ஃபேக்டரை மேம்படுத்துவது (எடுத்துக்காட்டாக மின்தேக்கிகள்
      மூலம்) kVAh-ஐ kWh-க்கு அருகில் கொண்டுவந்து பில்லைக் குறைக்கிறது. உங்கள் மீட்டரும் கட்டணமும் தோற்ற ஆற்றலைப்
      பயன்படுத்தினால் கணிப்பானில் kVAh அடிப்படையைத் தேர்ந்தெடுக்கவும்.</p>`,
  },
  {
    term: 'LPSC (Late Payment Surcharge)',
    slug: 'lpsc',
    guide: 'why-did-my-electricity-bill-increase',
    abbr: 'LPSC',
    aka: ['Late Payment Surcharge', 'DPC', 'Delayed Payment Charge'],
    short: 'A surcharge added for each month a bill stays unpaid past its due date, usually a fixed percentage of the outstanding amount.',
    body: `<p>If you miss the due date, the DISCOM adds a Late Payment Surcharge — typically a
      percentage (often around 1.25–2% per month) of the unpaid amount. In a multi-month arrears
      situation it compounds on the running balance, so a small overdue amount can grow noticeably.
      Paying by the due date avoids it entirely. Our calculator can add LPSC and
      <a href="/glossary/#fppa">arrears</a> to estimate a realistic total payable.</p>`,
    termHi: 'LPSC (विलंब भुगतान अधिभार)',
    chipHi: 'LPSC',
    shortHi: 'बिल के नियत तिथि के बाद अवैतनिक रहने के प्रत्येक माह के लिए जोड़ा गया अधिभार, आम तौर पर बकाया राशि का एक निश्चित प्रतिशत।',
    bodyHi: `<p>यदि आप नियत तिथि चूक जाते हैं, तो डिस्कॉम एक विलंब भुगतान अधिभार जोड़ता है — आम तौर पर अवैतनिक
      राशि का एक प्रतिशत (अक्सर लगभग 1.25–2% प्रति माह)। बहु-माह बकाया स्थिति में यह चालू शेष पर चक्रवृद्धि होता
      है, इसलिए एक छोटी बकाया राशि उल्लेखनीय रूप से बढ़ सकती है। नियत तिथि तक भुगतान करने से यह पूरी तरह टल जाता है।
      हमारा कैलकुलेटर LPSC व <a href="/glossary/#fppa">बकाया</a> जोड़कर एक यथार्थवादी कुल देय अनुमान लगा सकता है।</p>`,
    termMr: 'LPSC (विलंब भरणा अधिभार)',
    chipMr: 'LPSC',
    shortMr: 'बिल देय तारखेनंतर न भरलेले राहिलेल्या प्रत्येक महिन्यासाठी जोडलेला अधिभार, सहसा थकीत रकमेची एक ठराविक टक्केवारी.',
    bodyMr: `<p>तुम्ही देय तारीख चुकवल्यास, डिस्कॉम एक विलंब भरणा अधिभार जोडते — सहसा न भरलेल्या रकमेची एक टक्केवारी
      (अनेकदा सुमारे 1.25–2% प्रति महिना). बहु-महिना थकबाकीच्या परिस्थितीत ते चालू शिल्लकेवर चक्रवाढ होते, त्यामुळे एक
      लहान थकीत रक्कम लक्षणीयरीत्या वाढू शकते. देय तारखेपर्यंत भरणा केल्याने ते पूर्णपणे टळते. आमचे कॅल्क्युलेटर LPSC व
      <a href="/glossary/#fppa">थकबाकी</a> जोडून एक वास्तववादी एकूण देय अंदाज लावू शकते.</p>`,
    termTa: 'LPSC (தாமத கட்டண கூடுதல் தொகை)',
    chipTa: 'LPSC',
    shortTa: 'ஒரு பில் அதன் கடைசி தேதியைக் கடந்து செலுத்தப்படாமல் இருக்கும் ஒவ்வொரு மாதத்திற்கும் சேர்க்கப்படும் கூடுதல் கட்டணம், பொதுவாக நிலுவைத் தொகையின் ஒரு நிலையான சதவீதம்.',
    bodyTa: `<p>நீங்கள் கடைசி தேதியைத் தவறவிட்டால், DISCOM ஒரு தாமத கட்டண கூடுதல் தொகையைச் சேர்க்கிறது — பொதுவாக
      செலுத்தப்படாத தொகையின் ஒரு சதவீதம் (பெரும்பாலும் மாதத்திற்கு சுமார் 1.25–2%). பல மாத நிலுவைச் சூழ்நிலையில் இது
      நடப்பு இருப்பின் மீது கூட்டுத்தொகையாகிறது, எனவே ஒரு சிறிய நிலுவைத் தொகை கணிசமாக வளரக்கூடும். கடைசி தேதிக்குள்
      செலுத்துவது இதை முழுவதுமாகத் தவிர்க்கிறது. எங்கள் கணிப்பான் LPSC மற்றும்
      <a href="/glossary/#fppa">நிலுவைத் தொகையை</a> சேர்த்து யதார்த்தமான மொத்த செலுத்த வேண்டிய தொகையை மதிப்பிடலாம்.</p>`,
  },
  {
    term: 'Maximum Demand (Billed Demand)',
    slug: 'maximum-demand',
    guide: 'reduce-fixed-charges-sanctioned-load',
    aka: ['Billed Demand', 'Recorded Demand', 'MD'],
    short: 'The highest average load (in kW or kVA) drawn over a short interval during the billing period, used as the basis for the demand charge on larger connections.',
    body: `<p>Demand meters record the peak load your connection pulls, averaged over a rolling window
      (commonly 15 or 30 minutes). The highest such value in the month is your maximum demand. The
      <strong>billed demand</strong> is usually the higher of your recorded demand and a contracted
      minimum (often a percentage of <a href="/glossary/#connected-load">contract demand</a>), and the
      <a href="/glossary/#fixed-charge">demand charge</a> is levied on it. Drawing more than your
      contracted demand can trigger an <strong>excess-demand penalty</strong> at a multiple of the
      normal rate.</p>`,
    termHi: 'अधिकतम मांग (बिल की गई मांग)',
    chipHi: 'अधिकतम मांग',
    shortHi: 'बिलिंग अवधि के दौरान एक छोटे अंतराल पर खींचा गया उच्चतम औसत भार (kW या kVA में), जो बड़े कनेक्शनों पर मांग शुल्क का आधार होता है।',
    bodyHi: `<p>मांग मीटर आपके कनेक्शन द्वारा खींचे गए शिखर भार को दर्ज करते हैं, जो एक चालू विंडो (आम तौर पर 15
      या 30 मिनट) पर औसत होता है। माह में ऐसा उच्चतम मान आपकी अधिकतम मांग है।
      <strong>बिल की गई मांग</strong> आम तौर पर आपकी दर्ज मांग और एक अनुबंधित न्यूनतम (अक्सर
      <a href="/glossary/#connected-load">अनुबंध मांग</a> का एक प्रतिशत) में से अधिक होती है, और
      <a href="/glossary/#fixed-charge">मांग शुल्क</a> उसी पर लगता है। अपनी अनुबंधित मांग से अधिक खींचने पर
      सामान्य दर के गुणक पर <strong>अतिरिक्त-मांग जुर्माना</strong> लग सकता है।</p>`,
    termMr: 'कमाल मागणी (बिल केलेली मागणी)',
    chipMr: 'कमाल मागणी',
    shortMr: 'बिलिंग कालावधीत एका लहान अंतरावर खेचलेला सर्वाधिक सरासरी भार (kW किंवा kVA मध्ये), जो मोठ्या कनेक्शनवरील मागणी शुल्काचा आधार असतो.',
    bodyMr: `<p>मागणी मीटर तुमच्या कनेक्शनने खेचलेला शिखर भार नोंदवतात, जो एका फिरत्या खिडकीवर (सामान्यतः 15 किंवा 30
      मिनिटे) सरासरी काढला जातो. महिन्यातील असे सर्वाधिक मूल्य म्हणजे तुमची कमाल मागणी. <strong>बिल केलेली मागणी</strong>
      सहसा तुमची नोंदवलेली मागणी व एक करारित किमान (अनेकदा <a href="/glossary/#connected-load">करार मागणी</a>ची एक
      टक्केवारी) यांपैकी जास्त असते, आणि <a href="/glossary/#fixed-charge">मागणी शुल्क</a> त्यावरच लावले जाते. तुमच्या
      करारित मागणीपेक्षा जास्त खेचल्यास सामान्य दराच्या पटीत <strong>अतिरिक्त-मागणी दंड</strong> लागू शकतो.</p>`,
    termTa: 'அதிகபட்ச தேவை (பட்டியலிடப்பட்ட தேவை)',
    chipTa: 'அதிகபட்ச தேவை',
    shortTa: 'பட்டியல் காலத்தில் ஒரு குறுகிய இடைவெளியில் இழுக்கப்பட்ட மிக உயர்ந்த சராசரி சுமை (kW அல்லது kVA-இல்), பெரிய இணைப்புகளில் தேவை கட்டணத்திற்கு அடிப்படையாகப் பயன்படுகிறது.',
    bodyTa: `<p>தேவை மீட்டர்கள் உங்கள் இணைப்பு இழுக்கும் உச்ச சுமையை, ஒரு நகரும் காலஅளவில் (பொதுவாக 15 அல்லது 30 நிமிடங்கள்)
      சராசரிப்படுத்திப் பதிவு செய்கின்றன. மாதத்தில் அத்தகைய மிக உயர்ந்த மதிப்பே உங்கள் அதிகபட்ச தேவை.
      <strong>பட்டியலிடப்பட்ட தேவை</strong> பொதுவாக உங்கள் பதிவு செய்யப்பட்ட தேவை மற்றும் ஒரு ஒப்பந்த குறைந்தபட்சம்
      (பெரும்பாலும் <a href="/glossary/#connected-load">ஒப்பந்த தேவையின்</a> ஒரு சதவீதம்) இவற்றில் அதிகமானது, மேலும்
      <a href="/glossary/#fixed-charge">தேவை கட்டணம்</a> அதன் மீது விதிக்கப்படுகிறது. உங்கள் ஒப்பந்த தேவையை விட அதிகமாக
      இழுப்பது சாதாரண விகிதத்தின் பன்மடங்கில் ஒரு <strong>அதிகப்படியான-தேவை அபராதத்தைத்</strong> தூண்டக்கூடும்.</p>`,
  },
  {
    term: 'MMC (Minimum Monthly Charge)',
    slug: 'mmc',
    abbr: 'MMC',
    aka: ['Minimum Charge', 'Minimum Monthly Charge'],
    short: 'A floor on your monthly bill: if your calculated energy plus fixed charges fall below this amount, you are billed the minimum charge instead.',
    body: `<p>The minimum monthly charge guarantees the DISCOM a baseline recovery per connection.
      When your energy charge plus <a href="/glossary/#fixed-charge">fixed charge</a> for the month
      add up to less than the specified minimum — common in vacant premises or very low-usage months —
      the bill is raised to the MMC. It is often expressed per kW of
      <a href="/glossary/#sanctioned-load">sanctioned load</a>, so a higher sanctioned load raises the
      floor. This is why a barely-used connection still generates a bill.</p>`,
    termHi: 'MMC (न्यूनतम मासिक शुल्क)',
    chipHi: 'MMC',
    shortHi: 'आपके मासिक बिल पर एक न्यूनतम सीमा: यदि आपके गणना किए गए ऊर्जा व फिक्स्ड शुल्क इस राशि से कम हों, तो आपसे न्यूनतम शुल्क लिया जाता है।',
    bodyHi: `<p>न्यूनतम मासिक शुल्क डिस्कॉम को प्रति कनेक्शन एक आधारभूत वसूली की गारंटी देता है। जब माह के लिए
      आपका ऊर्जा शुल्क और <a href="/glossary/#fixed-charge">फिक्स्ड शुल्क</a> निर्दिष्ट न्यूनतम से कम जुड़ते हैं —
      खाली परिसर या बहुत कम-उपयोग माह में आम — तो बिल MMC तक बढ़ा दिया जाता है। यह अक्सर प्रति kW
      <a href="/glossary/#sanctioned-load">स्वीकृत भार</a> के रूप में व्यक्त होता है, इसलिए अधिक स्वीकृत भार सीमा
      बढ़ा देता है। यही कारण है कि मुश्किल से उपयोग किया गया कनेक्शन भी बिल उत्पन्न करता है।</p>`,
    termMr: 'MMC (किमान मासिक शुल्क)',
    chipMr: 'MMC',
    shortMr: 'तुमच्या मासिक बिलावरील एक किमान मर्यादा: तुमचे मोजलेले ऊर्जा व फिक्स्ड शुल्क या रकमेपेक्षा कमी असल्यास, त्याऐवजी तुम्हाला किमान शुल्क आकारले जाते.',
    bodyMr: `<p>किमान मासिक शुल्क डिस्कॉमला प्रति कनेक्शन एक आधारभूत वसुलीची हमी देते. जेव्हा महिन्यासाठी तुमचे ऊर्जा
      शुल्क व <a href="/glossary/#fixed-charge">फिक्स्ड शुल्क</a> निर्दिष्ट किमानापेक्षा कमी जमा होतात — रिकाम्या आवारात
      किंवा फार कमी-वापराच्या महिन्यांत सामान्य — तेव्हा बिल MMC पर्यंत वाढवले जाते. ते अनेकदा प्रति kW
      <a href="/glossary/#sanctioned-load">मंजूर भार</a> स्वरूपात व्यक्त होते, त्यामुळे जास्त मंजूर भार मर्यादा वाढवते.
      यामुळेच क्वचित वापरलेले कनेक्शनही बिल तयार करते.</p>`,
    termTa: 'MMC (குறைந்தபட்ச மாதாந்திர கட்டணம்)',
    chipTa: 'MMC',
    shortTa: 'உங்கள் மாதாந்திர பில்லுக்கு ஒரு தளம்: உங்கள் கணக்கிடப்பட்ட ஆற்றல் மற்றும் நிலையான கட்டணங்கள் இந்தத் தொகைக்குக் கீழே இருந்தால், அதற்குப் பதிலாக உங்களுக்குக் குறைந்தபட்ச கட்டணம் விதிக்கப்படுகிறது.',
    bodyTa: `<p>குறைந்தபட்ச மாதாந்திர கட்டணம் DISCOM-க்கு ஒவ்வொரு இணைப்புக்கும் ஒரு அடிப்படை மீட்டெடுப்பை உறுதி செய்கிறது.
      மாதத்திற்கான உங்கள் ஆற்றல் கட்டணமும் <a href="/glossary/#fixed-charge">நிலையான கட்டணமும்</a> குறிப்பிட்ட
      குறைந்தபட்சத்தை விடக் குறைவாகச் சேரும்போது — காலியான வளாகங்கள் அல்லது மிகக் குறைந்த-பயன்பாட்டு மாதங்களில் பொதுவானது
      — பில் MMC வரை உயர்த்தப்படுகிறது. இது பெரும்பாலும் ஒரு kW <a href="/glossary/#sanctioned-load">அனுமதிக்கப்பட்ட
      சுமைக்கு</a> வெளிப்படுத்தப்படுகிறது, எனவே அதிக அனுமதிக்கப்பட்ட சுமை தளத்தை உயர்த்துகிறது. இதனால்தான் அரிதாகப்
      பயன்படுத்தப்படும் இணைப்பும் ஒரு பில்லை உருவாக்குகிறது.</p>`,
  },
  {
    term: 'Multiplying Factor (MF)',
    slug: 'multiplying-factor',
    guide: 'how-to-read-uppcl-bill',
    abbr: 'MF',
    short: 'The number by which the raw difference between two meter readings is multiplied to get the actual units consumed, used where current/voltage transformers scale the meter down.',
    body: `<p>On connections metered through a current transformer (CT) or potential transformer (PT),
      the meter sees only a scaled-down fraction of the real current or voltage. The multiplying
      factor converts the meter's raw reading back to actual consumption:
      <code>units = (present reading &minus; previous reading) &times; MF</code>. For almost all
      direct-metered domestic connections <strong>MF = 1</strong>, so the subtraction alone is your
      usage. On CT-metered commercial or HT connections MF is typically greater than 1, and a wrong
      MF is a serious billing error worth checking on your bill.</p>`,
    termHi: 'गुणक कारक (MF)',
    chipHi: 'गुणक कारक',
    shortHi: 'वह संख्या जिससे दो मीटर रीडिंग के कच्चे अंतर को गुणा करके वास्तविक खपत यूनिट प्राप्त की जाती है, वहाँ उपयोग होती है जहाँ करंट/वोल्टेज ट्रांसफार्मर मीटर को घटा देते हैं।',
    bodyHi: `<p>करंट ट्रांसफार्मर (CT) या पोटेंशियल ट्रांसफार्मर (PT) के माध्यम से मीटर किए गए कनेक्शनों पर, मीटर
      वास्तविक करंट या वोल्टेज का केवल एक घटा-हुआ अंश देखता है। गुणक कारक मीटर की कच्ची रीडिंग को वापस वास्तविक
      खपत में बदल देता है: <code>यूनिट = (वर्तमान रीडिंग &minus; पिछली रीडिंग) &times; MF</code>। लगभग सभी
      सीधे-मीटर किए गए घरेलू कनेक्शनों के लिए <strong>MF = 1</strong> होता है, इसलिए केवल घटाव ही आपकी खपत है।
      CT-मीटर किए गए व्यावसायिक या HT कनेक्शनों पर MF 1 से भिन्न हो सकता है, और गलत MF एक गंभीर बिलिंग त्रुटि है
      जिसे अपने बिल पर जाँचना उचित है।</p>`,
    termMr: 'गुणक घटक (MF)',
    chipMr: 'गुणक घटक',
    shortMr: 'ती संख्या जिने दोन मीटर रीडिंगमधील कच्च्या फरकाला गुणून प्रत्यक्ष वापर युनिट मिळतात, जिथे करंट/व्होल्टेज ट्रान्सफॉर्मर मीटर कमी करून दाखवतात तिथे वापरली जाते.',
    bodyMr: `<p>करंट ट्रान्सफॉर्मर (CT) किंवा पोटेंशियल ट्रान्सफॉर्मर (PT) मार्फत मीटर केलेल्या कनेक्शनवर, मीटर प्रत्यक्ष
      करंट किंवा व्होल्टेजचा फक्त एक कमी-केलेला अंश पाहतो. गुणक घटक मीटरची कच्ची रीडिंग परत प्रत्यक्ष वापरात रूपांतरित
      करतो: <code>युनिट = (सध्याची रीडिंग &minus; मागील रीडिंग) &times; MF</code>. जवळपास सर्व थेट-मीटर केलेल्या घरगुती
      कनेक्शनसाठी <strong>MF = 1</strong> असतो, त्यामुळे केवळ वजाबाकीच तुमचा वापर असतो. CT-मीटर केलेल्या व्यावसायिक किंवा
      HT कनेक्शनवर MF सहसा 1 पेक्षा जास्त असतो, आणि चुकीचा MF ही एक गंभीर बिलिंग चूक आहे जी तुमच्या बिलावर तपासणे योग्य
      आहे.</p>`,
    termTa: 'பெருக்கல் காரணி (MF)',
    chipTa: 'பெருக்கல் காரணி',
    shortTa: 'இரண்டு மீட்டர் அளவீடுகளுக்கு இடையிலான மூல வித்தியாசத்தைப் பெருக்கி உண்மையான நுகர்வு யூனிட்களைப் பெறும் எண், மின்னோட்ட/மின்னழுத்த மின்மாற்றிகள் மீட்டரைக் குறைத்துக் காட்டும் இடங்களில் பயன்படுகிறது.',
    bodyTa: `<p>மின்னோட்ட மின்மாற்றி (CT) அல்லது மின்னழுத்த மின்மாற்றி (PT) மூலம் மீட்டரிடப்பட்ட இணைப்புகளில், மீட்டர்
      உண்மையான மின்னோட்டம் அல்லது மின்னழுத்தத்தின் ஒரு குறைக்கப்பட்ட பகுதியை மட்டுமே பார்க்கிறது. பெருக்கல் காரணி
      மீட்டரின் மூல அளவீட்டை மீண்டும் உண்மையான நுகர்வாக மாற்றுகிறது:
      <code>யூனிட்கள் = (தற்போதைய அளவீடு &minus; முந்தைய அளவீடு) &times; MF</code>. கிட்டத்தட்ட அனைத்து நேரடி-மீட்டரிடப்பட்ட
      வீட்டு இணைப்புகளுக்கும் <strong>MF = 1</strong>, எனவே கழித்தல் மட்டுமே உங்கள் பயன்பாடு. CT-மீட்டரிடப்பட்ட வணிக
      அல்லது HT இணைப்புகளில் MF பொதுவாக 1-ஐ விட அதிகமாக இருக்கும், மேலும் தவறான MF என்பது உங்கள் பில்லில் சரிபார்க்கத்
      தகுந்த ஒரு தீவிர பட்டியல் பிழையாகும்.</p>`,
  },
  {
    term: 'Net Metering',
    slug: 'net-metering',
    guide: 'solar-net-metering-savings',
    short: 'A rooftop-solar billing arrangement where you are charged only on net import — units imported from the grid minus units exported to it — with any surplus banked as a credit.',
    body: `<p>With net metering, your solar system feeds surplus generation back into the grid and a
      bidirectional meter tracks both directions. You pay energy charges on
      <code>net import = imported &minus; exported &minus; banked credit</code>. If you export more
      than you import in a month, the surplus is <strong>banked</strong> as a unit credit carried to
      the next month (usually settled annually). <a href="/glossary/#fixed-charge">Fixed and demand
      charges</a> still apply on your sanctioned load regardless of solar. Estimate your savings with
      the <a href="/solar-calculator/">rooftop solar calculator</a>.</p>`,
    termHi: 'नेट मीटरिंग',
    chipHi: 'नेट मीटरिंग',
    shortHi: 'एक रूफटॉप-सोलर बिलिंग व्यवस्था जहाँ आपसे केवल नेट आयात पर शुल्क लिया जाता है — ग्रिड से आयातित यूनिट घटा उसे निर्यातित यूनिट — किसी भी अधिशेष को क्रेडिट के रूप में बैंक किया जाता है।',
    bodyHi: `<p>नेट मीटरिंग के साथ, आपका सोलर सिस्टम अधिशेष उत्पादन को ग्रिड में वापस भेजता है और एक द्विदिश मीटर
      दोनों दिशाओं को ट्रैक करता है। आप <code>नेट आयात = आयातित &minus; निर्यातित &minus; बैंक किया गया क्रेडिट</code>
      पर ऊर्जा शुल्क देते हैं। यदि आप किसी माह में आयात से अधिक निर्यात करते हैं, तो अधिशेष अगले माह के लिए यूनिट
      क्रेडिट के रूप में <strong>बैंक</strong> किया जाता है (आम तौर पर वार्षिक रूप से निपटाया जाता है)। सोलर की
      परवाह किए बिना आपके स्वीकृत भार पर <a href="/glossary/#fixed-charge">फिक्स्ड व मांग शुल्क</a> फिर भी लागू
      होते हैं। <a href="/solar-calculator/">रूफटॉप सोलर कैलकुलेटर</a> से अपनी बचत का अनुमान लगाएँ।</p>`,
    termMr: 'नेट मीटरिंग',
    chipMr: 'नेट मीटरिंग',
    shortMr: 'एक रूफटॉप-सोलर बिलिंग व्यवस्था जिथे तुम्हाला फक्त नेट आयातावर शुल्क लावले जाते — ग्रिडमधून आयात केलेल्या युनिटमधून त्याला निर्यात केलेल्या युनिट वजा — कोणताही अधिशेष क्रेडिट म्हणून जमा केला जातो.',
    bodyMr: `<p>नेट मीटरिंगसह, तुमची सोलर प्रणाली अधिशेष निर्मिती परत ग्रिडमध्ये पाठवते आणि एक द्विदिश मीटर दोन्ही दिशा
      मागोवा घेतो. तुम्ही <code>नेट आयात = आयात &minus; निर्यात &minus; जमा क्रेडिट</code> वर ऊर्जा शुल्क देता. जर तुम्ही
      एखाद्या महिन्यात आयातापेक्षा जास्त निर्यात केली, तर अधिशेष पुढील महिन्यासाठी युनिट क्रेडिट म्हणून <strong>जमा</strong>
      केला जातो (सहसा वार्षिक निपटारा). सोलरची पर्वा न करता तुमच्या मंजूर भारावर <a href="/glossary/#fixed-charge">फिक्स्ड
      व मागणी शुल्क</a> तरीही लागू होतात. <a href="/solar-calculator/">रूफटॉप सोलर कॅल्क्युलेटर</a>ने तुमच्या बचतीचा अंदाज
      लावा.</p>`,
    termTa: 'நெட் மீட்டரிங்',
    chipTa: 'நெட் மீட்டரிங்',
    shortTa: 'கூரை-சூரிய பட்டியல் ஏற்பாடு, இதில் நிகர இறக்குமதிக்கு மட்டுமே கட்டணம் விதிக்கப்படுகிறது — கிரிட்டிலிருந்து இறக்குமதி செய்யப்பட்ட யூனிட்கள் கழித்தல் அதற்கு ஏற்றுமதி செய்யப்பட்டவை — எஞ்சிய உபரி வரவாக வங்கியில் சேமிக்கப்படுகிறது.',
    bodyTa: `<p>நெட் மீட்டரிங்குடன், உங்கள் சூரிய அமைப்பு உபரி உற்பத்தியைக் கிரிட்டுக்குத் திரும்பச் செலுத்துகிறது, ஒரு
      இருதிசை மீட்டர் இரு திசைகளையும் கண்காணிக்கிறது. நீங்கள் <code>நிகர இறக்குமதி = இறக்குமதி &minus; ஏற்றுமதி &minus;
      சேமித்த வரவு</code> மீது ஆற்றல் கட்டணம் செலுத்துகிறீர்கள். ஒரு மாதத்தில் இறக்குமதியை விட அதிகமாக ஏற்றுமதி செய்தால்,
      உபரி அடுத்த மாதத்திற்கு ஒரு யூனிட் வரவாக <strong>சேமிக்கப்படுகிறது</strong> (பொதுவாக ஆண்டுதோறும் தீர்க்கப்படுகிறது).
      சூரிய சக்தியைப் பொருட்படுத்தாமல் உங்கள் அனுமதிக்கப்பட்ட சுமையின் மீது <a href="/glossary/#fixed-charge">நிலையான
      மற்றும் தேவை கட்டணங்கள்</a> இன்னும் பொருந்தும். <a href="/solar-calculator/">கூரை சூரிய கணிப்பானில்</a> உங்கள்
      சேமிப்பை மதிப்பிடுங்கள்.</p>`,
  },
  {
    term: 'Power Factor',
    slug: 'power-factor',
    guide: 'power-factor-kvah-billing-explained',
    abbr: 'PF',
    short: 'The ratio of real power (kW) to apparent power (kVA) drawn by a load; a value below 1 means wasted capacity, and low power factor attracts penalties or higher kVAh billing.',
    body: `<p>Power factor measures how effectively your load turns supplied power into useful work.
      A purely resistive load (heater, incandescent lamp) has a PF near 1; motors, pumps and
      transformers pull it lower. A low power factor means the DISCOM must supply more apparent power
      (kVA) for the same real work, so tariffs discourage it — either through a
      <strong>power-factor penalty/incentive</strong> or by billing on
      <a href="/glossary/#kvah">kVAh</a>, which rises automatically as PF falls. Capacitor banks are
      the usual fix.</p>`,
    termHi: 'पावर फैक्टर',
    chipHi: 'पावर फैक्टर',
    shortHi: 'किसी भार द्वारा खींची गई वास्तविक शक्ति (kW) व आभासी शक्ति (kVA) का अनुपात; 1 से कम मान बर्बाद क्षमता दर्शाता है, और कम पावर फैक्टर जुर्माना या अधिक kVAh बिलिंग आकर्षित करता है।',
    bodyHi: `<p>पावर फैक्टर मापता है कि आपका भार आपूर्ति की गई शक्ति को उपयोगी कार्य में कितनी प्रभावी ढंग से बदलता
      है। पूर्णतः प्रतिरोधी भार (हीटर, तापदीप्त लैंप) का PF 1 के करीब होता है; मोटर, पंप व ट्रांसफार्मर इसे नीचे
      खींचते हैं। कम पावर फैक्टर का अर्थ है कि डिस्कॉम को समान वास्तविक कार्य के लिए अधिक आभासी शक्ति (kVA)
      आपूर्ति करनी पड़ती है, इसलिए टैरिफ इसे हतोत्साहित करते हैं — या तो
      <strong>पावर-फैक्टर जुर्माना/प्रोत्साहन</strong> के माध्यम से या <a href="/glossary/#kvah">kVAh</a> पर बिल
      करके, जो PF घटने के साथ स्वतः बढ़ता है। कैपेसिटर बैंक सामान्य समाधान हैं।</p>`,
    termMr: 'पॉवर फॅक्टर',
    chipMr: 'पॉवर फॅक्टर',
    shortMr: 'एखाद्या भाराने खेचलेल्या वास्तविक शक्ती (kW) व आभासी शक्ती (kVA) यांचे गुणोत्तर; 1 पेक्षा कमी मूल्य वाया गेलेली क्षमता दर्शवते, आणि कमी पॉवर फॅक्टर दंड किंवा जास्त kVAh बिलिंग आकर्षित करतो.',
    bodyMr: `<p>पॉवर फॅक्टर तुमचा भार पुरवलेल्या शक्तीचे उपयुक्त कामात किती प्रभावीपणे रूपांतर करतो हे मोजतो. पूर्णतः
      प्रतिरोधक भार (हीटर, तापदीप्त दिवा) चा PF 1 च्या जवळ असतो; मोटर, पंप व ट्रान्सफॉर्मर तो खाली खेचतात. कमी पॉवर
      फॅक्टरचा अर्थ डिस्कॉमला त्याच वास्तविक कामासाठी जास्त आभासी शक्ती (kVA) पुरवावी लागते, त्यामुळे टॅरिफ त्याला निरुत्साह
      करतात — एकतर <strong>पॉवर-फॅक्टर दंड/प्रोत्साहन</strong>ने किंवा <a href="/glossary/#kvah">kVAh</a> वर बिल करून, जे
      PF घटल्यावर आपोआप वाढते. कॅपॅसिटर बँक हे नेहमीचे उपाय आहेत.</p>`,
    termTa: 'பவர் ஃபேக்டர்',
    chipTa: 'பவர் ஃபேக்டர்',
    shortTa: 'ஒரு சுமை இழுக்கும் உண்மையான திறன் (kW) மற்றும் தோற்ற திறன் (kVA) ஆகியவற்றின் விகிதம்; 1-ஐ விடக் குறைந்த மதிப்பு வீணடிக்கப்பட்ட திறனைக் குறிக்கிறது, குறைந்த பவர் ஃபேக்டர் அபராதம் அல்லது அதிக kVAh பட்டியலை ஈர்க்கிறது.',
    bodyTa: `<p>பவர் ஃபேக்டர் உங்கள் சுமை வழங்கப்பட்ட திறனை எவ்வளவு திறம்பட பயனுள்ள வேலையாக மாற்றுகிறது என்பதை அளவிடுகிறது.
      முற்றிலும் மின்தடை சுமை (ஹீட்டர், ஒளிரும் விளக்கு) 1-க்கு அருகில் PF கொண்டிருக்கும்; மோட்டார்கள், பம்புகள் மற்றும்
      மின்மாற்றிகள் அதைக் கீழே இழுக்கின்றன. குறைந்த பவர் ஃபேக்டர் என்பது அதே உண்மையான வேலைக்கு DISCOM அதிக தோற்ற திறனை
      (kVA) வழங்க வேண்டும் என்பதாகும், எனவே கட்டணங்கள் அதை ஊக்கப்படுத்துகின்றன — ஒன்று <strong>பவர்-ஃபேக்டர்
      அபராதம்/ஊக்கத்தொகை</strong> மூலம் அல்லது <a href="/glossary/#kvah">kVAh</a> மீது பட்டியலிடுவதன் மூலம், இது PF குறையும்
      போது தானாகவே உயர்கிறது. மின்தேக்கி வங்கிகள் வழக்கமான தீர்வு.</p>`,
  },
  {
    term: 'Sanctioned Load',
    slug: 'sanctioned-load',
    guide: 'reduce-fixed-charges-sanctioned-load',
    aka: ['Contracted Load', 'Sanctioned Demand'],
    short: 'The maximum load, in kW or kVA, that the DISCOM has formally contracted to supply to your connection — the basis for fixed charges and the ceiling you should stay under.',
    body: `<p>When your connection is approved, the DISCOM sanctions a load based on your declared
      <a href="/glossary/#connected-load">connected load</a>. This sanctioned figure is what
      <a href="/glossary/#fixed-charge">fixed charges</a> and the <a href="/glossary/#mmc">minimum
      charge</a> are calculated on. Regularly drawing more than your sanctioned load can attract an
      excess-demand penalty and, over time, a demand for load enhancement. It appears on your bill as
      "Sanctioned Load" or "Contract Demand" and is entered as the load in our calculator.</p>`,
    termHi: 'स्वीकृत भार (Sanctioned Load)',
    chipHi: 'स्वीकृत भार',
    shortHi: 'अधिकतम भार, kW या kVA में, जिसकी आपूर्ति डिस्कॉम ने औपचारिक रूप से आपके कनेक्शन को अनुबंधित की है — फिक्स्ड शुल्क का आधार और वह सीमा जिसके नीचे आपको रहना चाहिए।',
    bodyHi: `<p>जब आपका कनेक्शन स्वीकृत होता है, तो डिस्कॉम आपके घोषित
      <a href="/glossary/#connected-load">कनेक्टेड लोड</a> के आधार पर एक भार स्वीकृत करता है। यह स्वीकृत आँकड़ा
      वह है जिस पर <a href="/glossary/#fixed-charge">फिक्स्ड शुल्क</a> व <a href="/glossary/#mmc">न्यूनतम
      शुल्क</a> गणना किए जाते हैं। नियमित रूप से अपने स्वीकृत भार से अधिक खींचना अतिरिक्त-मांग जुर्माना और, समय
      के साथ, भार वृद्धि की माँग आकर्षित कर सकता है। यह आपके बिल पर "स्वीकृत भार" या "अनुबंध मांग" के रूप में
      दिखता है और हमारे कैलकुलेटर में भार के रूप में दर्ज किया जाता है।</p>`,
    termMr: 'मंजूर भार (Sanctioned Load)',
    chipMr: 'मंजूर भार',
    shortMr: 'kW किंवा kVA मध्ये तो कमाल भार जो डिस्कॉमने औपचारिकपणे तुमच्या कनेक्शनला पुरवण्याचा करार केला आहे — फिक्स्ड शुल्काचा आधार आणि ती मर्यादा जिच्या खाली तुम्ही राहावे.',
    bodyMr: `<p>तुमचे कनेक्शन मंजूर झाल्यावर, डिस्कॉम तुमच्या घोषित <a href="/glossary/#connected-load">कनेक्टेड
      लोड</a>च्या आधारावर एक भार मंजूर करते. या मंजूर आकड्यावरच <a href="/glossary/#fixed-charge">फिक्स्ड शुल्क</a> व
      <a href="/glossary/#mmc">किमान शुल्क</a> मोजले जातात. नियमितपणे तुमच्या मंजूर भारापेक्षा जास्त खेचणे अतिरिक्त-मागणी
      दंड आणि, कालांतराने, भार वाढीची मागणी आकर्षित करू शकते. ते तुमच्या बिलावर "मंजूर भार" किंवा "करार मागणी" म्हणून
      दिसते आणि आमच्या कॅल्क्युलेटरमध्ये भार म्हणून प्रविष्ट केले जाते.</p>`,
    termTa: 'அனுமதிக்கப்பட்ட சுமை (Sanctioned Load)',
    chipTa: 'அனுமதிக்கப்பட்ட சுமை',
    shortTa: 'உங்கள் இணைப்புக்கு வழங்க DISCOM முறையாக ஒப்பந்தம் செய்த அதிகபட்ச சுமை, kW அல்லது kVA-இல் — நிலையான கட்டணங்களுக்கான அடிப்படை மற்றும் நீங்கள் கீழே இருக்க வேண்டிய உச்சவரம்பு.',
    bodyTa: `<p>உங்கள் இணைப்பு அங்கீகரிக்கப்படும்போது, DISCOM உங்கள் அறிவிக்கப்பட்ட <a href="/glossary/#connected-load">இணைக்கப்பட்ட
      சுமையின்</a> அடிப்படையில் ஒரு சுமையை அனுமதிக்கிறது. இந்த அனுமதிக்கப்பட்ட எண்ணிக்கையின் மீதே
      <a href="/glossary/#fixed-charge">நிலையான கட்டணங்களும்</a> <a href="/glossary/#mmc">குறைந்தபட்ச கட்டணமும்</a>
      கணக்கிடப்படுகின்றன. உங்கள் அனுமதிக்கப்பட்ட சுமையை விட வழக்கமாக அதிகமாக இழுப்பது ஒரு அதிகப்படியான-தேவை அபராதத்தையும்,
      காலப்போக்கில், சுமை உயர்வுக்கான கோரிக்கையையும் ஈர்க்கக்கூடும். இது உங்கள் பில்லில் "அனுமதிக்கப்பட்ட சுமை" அல்லது
      "ஒப்பந்த தேவை" எனத் தோன்றுகிறது, மேலும் எங்கள் கணிப்பானில் சுமையாக உள்ளிடப்படுகிறது.</p>`,
  },
  {
    term: 'Slab-wise Rates',
    slug: 'telescopic-slabs',
    guide: 'why-did-my-electricity-bill-increase',
    aka: ['Telescopic Slabs', 'Telescopic Tariff', 'Cumulative Slabs'],
    short: 'A slab-rate structure where each per-unit rate applies only to the units that fall within its own slab band, so higher rates never apply to your entire consumption. (The technical name is a "telescopic" tariff.)',
    body: `<p>Most Indian domestic tariffs are billed <strong>slab-wise</strong> — the technical name is
      "telescopic". If the slabs are 0–100, 101–300 and 300+ units, a consumer using 250 units pays the
      first-slab rate on the first 100 units and the second-slab rate only on the next 150 — not the
      higher rate on all 250. This is the opposite of a <strong>"slab-benefit-lost"</strong> tariff,
      where crossing a threshold applies the higher rate to <em>every</em> unit, creating a cliff.
      Knowing which one your DISCOM uses explains why a bill can jump sharply near a slab boundary. Our
      <a href="/#calculator">calculator</a> applies each DISCOM's slabs exactly as published.</p>`,
    termHi: 'स्लैब-वार दरें',
    chipHi: 'स्लैब-वार दरें',
    shortHi: 'एक स्लैब-दर संरचना जहाँ प्रत्येक प्रति-यूनिट दर केवल उन्हीं यूनिटों पर लागू होती है जो उसके अपने स्लैब बैंड में आती हैं, इसलिए उच्च दरें आपकी पूरी खपत पर कभी लागू नहीं होतीं। (तकनीकी नाम "टेलिस्कोपिक" टैरिफ है।)',
    bodyHi: `<p>अधिकांश भारतीय घरेलू टैरिफ <strong>स्लैब-वार</strong> बिल होते हैं — तकनीकी नाम "टेलिस्कोपिक" है। यदि स्लैब
      0–100, 101–300 व 300+ यूनिट हैं, तो 250 यूनिट उपयोग करने वाला उपभोक्ता पहली 100 यूनिट पर पहले-स्लैब की दर और
      अगली 150 पर केवल दूसरे-स्लैब की दर देता है — सभी 250 पर उच्च दर नहीं। यह <strong>"स्लैब-लाभ-हानि"</strong> टैरिफ के
      विपरीत है, जहाँ किसी सीमा को पार करने पर उच्च दर <em>हर</em> यूनिट पर लागू होती है, जिससे एक झटका बनता है। यह जानना कि आपका
      डिस्कॉम कौन-सा उपयोग करता है, बताता है कि किसी स्लैब सीमा के पास बिल तेज़ी से क्यों बढ़ सकता है। हमारा
      <a href="/#calculator">कैलकुलेटर</a> प्रत्येक डिस्कॉम के स्लैब ठीक वैसे ही लागू करता है जैसे प्रकाशित हैं।</p>`,
    termMr: 'स्लॅबनिहाय दर',
    chipMr: 'स्लॅबनिहाय दर',
    shortMr: 'एक स्लॅब-दर रचना जिथे प्रत्येक प्रति-युनिट दर फक्त त्याच्याच स्लॅब पट्ट्यात येणाऱ्या युनिटवरच लागू होते, त्यामुळे जास्त दर तुमच्या संपूर्ण वापरावर कधीही लागू होत नाहीत. (तांत्रिक नाव "टेलिस्कोपिक" टॅरिफ आहे.)',
    bodyMr: `<p>बहुतांश भारतीय घरगुती टॅरिफ <strong>स्लॅबनिहाय</strong> बिल होतात — तांत्रिक नाव "टेलिस्कोपिक" आहे. जर
      स्लॅब 0–100, 101–300 व 300+ युनिट असतील, तर 250 युनिट वापरणारा ग्राहक पहिल्या 100 युनिटवर पहिल्या-स्लॅबचा दर आणि
      पुढील 150 वर फक्त दुसऱ्या-स्लॅबचा दर देतो — सर्व 250 वर जास्त दर नाही. हे <strong>"स्लॅब-लाभ-हानी"</strong> टॅरिफच्या
      विरुद्ध आहे, जिथे एखादी मर्यादा ओलांडल्यावर जास्त दर <em>प्रत्येक</em> युनिटवर लागू होतो, ज्यामुळे एक कडा तयार होतो.
      तुमचा डिस्कॉम कोणता वापरतो हे जाणल्याने बिल एखाद्या स्लॅब सीमेजवळ का झपाट्याने वाढू शकते हे स्पष्ट होते. आमचे
      <a href="/#calculator">कॅल्क्युलेटर</a> प्रत्येक डिस्कॉमचे स्लॅब प्रकाशित केल्याप्रमाणे तंतोतंत लावते.</p>`,
    termTa: 'அடுக்கு வாரியான விகிதங்கள்',
    chipTa: 'அடுக்கு வாரியான விகிதங்கள்',
    shortTa: 'ஒவ்வொரு ஒரு-யூனிட் விகிதமும் அதன் சொந்த அடுக்குப் பட்டைக்குள் வரும் யூனிட்களுக்கு மட்டுமே பொருந்தும் ஒரு அடுக்கு-விகித அமைப்பு, எனவே அதிக விகிதங்கள் உங்கள் முழு நுகர்வுக்கும் ஒருபோதும் பொருந்தாது. (தொழில்நுட்பப் பெயர் "டெலிஸ்கோபிக்" கட்டணம்.)',
    bodyTa: `<p>பெரும்பாலான இந்திய வீட்டுக் கட்டணங்கள் <strong>அடுக்கு வாரியாக</strong> பட்டியலிடப்படுகின்றன — தொழில்நுட்பப்
      பெயர் "டெலிஸ்கோபிக்". அடுக்குகள் 0–100, 101–300 மற்றும் 300+ யூனிட்கள் என்றால், 250 யூனிட் பயன்படுத்தும் ஒரு நுகர்வோர்
      முதல் 100 யூனிட்களுக்கு முதல்-அடுக்கு விகிதத்தையும் அடுத்த 150-க்கு மட்டும் இரண்டாம்-அடுக்கு விகிதத்தையும் செலுத்துகிறார்
      — அனைத்து 250-க்கும் அதிக விகிதம் அல்ல. இது <strong>"அடுக்கு-நன்மை-இழப்பு"</strong> கட்டணத்திற்கு எதிரானது, அங்கு ஒரு
      வரம்பைக் கடப்பது அதிக விகிதத்தை <em>ஒவ்வொரு</em> யூனிட்டிற்கும் பொருத்தி, ஒரு செங்குத்துப் பாய்ச்சலை உருவாக்குகிறது.
      உங்கள் DISCOM எதைப் பயன்படுத்துகிறது என்பதை அறிவது ஒரு அடுக்கு எல்லைக்கு அருகில் பில் ஏன் கூர்மையாக உயரலாம் என்பதை
      விளக்குகிறது. எங்கள் <a href="/#calculator">கணிப்பான்</a> ஒவ்வொரு DISCOM-இன் அடுக்குகளையும் வெளியிடப்பட்டபடியே சரியாகப்
      பயன்படுத்துகிறது.</p>`,
  },
  {
    term: 'Time-of-Day Tariff (ToD / ToU)',
    slug: 'tod-tariff',
    guide: 'tod-billing-explained',
    abbr: 'ToD',
    aka: ['ToU', 'Time-of-Use', 'Time-of-Day'],
    short: 'A tariff where the per-unit rate changes by time of day — higher during peak hours and lower off-peak — to reward shifting usage away from peak demand.',
    body: `<p>Under a Time-of-Day tariff, the day is split into blocks — typically <strong>peak</strong>
      (a surcharge on the base rate), <strong>normal</strong>, and <strong>off-peak</strong> (a
      rebate). Your meter records units in each block separately, and running heavy loads off-peak
      lowers the bill. ToD is becoming mandatory for larger consumers and is being extended to
      domestic consumers under national tariff reforms. Enter your peak / normal / off-peak units in
      the calculator, and see the <a href="/guides/tod-billing-explained/">Time-of-Day billing
      guide</a> for a full worked example.</p>`,
    termHi: 'टाइम-ऑफ-डे टैरिफ (ToD / ToU)',
    chipHi: 'टाइम-ऑफ-डे टैरिफ',
    shortHi: 'एक टैरिफ जहाँ प्रति-यूनिट दर दिन के समय के अनुसार बदलती है — पीक घंटों में अधिक व ऑफ-पीक में कम — ताकि पीक मांग से उपयोग हटाने को प्रोत्साहित किया जा सके।',
    bodyHi: `<p>टाइम-ऑफ-डे टैरिफ के तहत, दिन को ब्लॉकों में बाँटा जाता है — आम तौर पर <strong>पीक</strong> (आधार दर
      पर अधिभार), <strong>सामान्य</strong>, व <strong>ऑफ-पीक</strong> (छूट)। आपका मीटर प्रत्येक ब्लॉक में यूनिट
      अलग-अलग दर्ज करता है, और भारी भार ऑफ-पीक चलाने से बिल घटता है। ToD बड़े उपभोक्ताओं के लिए अनिवार्य होता जा
      रहा है और राष्ट्रीय टैरिफ सुधारों के तहत घरेलू उपभोक्ताओं तक बढ़ाया जा रहा है। कैलकुलेटर में अपनी पीक /
      सामान्य / ऑफ-पीक यूनिट दर्ज करें, और पूर्ण हल किए गए उदाहरण के लिए
      <a href="/guides/tod-billing-explained/">टाइम-ऑफ-डे बिलिंग गाइड</a> देखें।</p>`,
    termMr: 'टाइम-ऑफ-डे टॅरिफ (ToD / ToU)',
    chipMr: 'टाइम-ऑफ-डे टॅरिफ',
    shortMr: 'एक टॅरिफ जिथे प्रति-युनिट दर दिवसाच्या वेळेनुसार बदलतो — पीक तासांत जास्त व ऑफ-पीकमध्ये कमी — जेणेकरून वापर पीक मागणीपासून हलवण्यास प्रोत्साहन मिळेल.',
    bodyMr: `<p>टाइम-ऑफ-डे टॅरिफखाली, दिवस ब्लॉकमध्ये विभागला जातो — सामान्यतः <strong>पीक</strong> (आधार दरावर अधिभार),
      <strong>सामान्य</strong>, व <strong>ऑफ-पीक</strong> (सूट). तुमचे मीटर प्रत्येक ब्लॉकमधील युनिट वेगळे नोंदवते, आणि
      जड भार ऑफ-पीक चालवल्याने बिल कमी होते. ToD मोठ्या ग्राहकांसाठी अनिवार्य होत आहे आणि राष्ट्रीय टॅरिफ सुधारणांखाली
      घरगुती ग्राहकांपर्यंत वाढवले जात आहे. कॅल्क्युलेटरमध्ये तुमची पीक / सामान्य / ऑफ-पीक युनिट प्रविष्ट करा, आणि पूर्ण
      सोडवलेल्या उदाहरणासाठी <a href="/guides/tod-billing-explained/">टाइम-ऑफ-डे बिलिंग मार्गदर्शक</a> पाहा.</p>`,
    termTa: 'நேர-அடிப்படை கட்டணம் (ToD / ToU)',
    chipTa: 'நேர-அடிப்படை கட்டணம்',
    shortTa: 'ஒரு-யூனிட் விகிதம் நாளின் நேரத்திற்கு ஏற்ப மாறும் ஒரு கட்டணம் — உச்ச நேரங்களில் அதிகமாகவும் உச்சமல்லாத நேரத்தில் குறைவாகவும் — உச்ச தேவையிலிருந்து பயன்பாட்டை மாற்ற ஊக்குவிக்கிறது.',
    bodyTa: `<p>நேர-அடிப்படை கட்டணத்தின் கீழ், நாள் தொகுதிகளாகப் பிரிக்கப்படுகிறது — பொதுவாக <strong>உச்சம்</strong> (அடிப்படை
      விகிதத்தின் மீது கூடுதல் கட்டணம்), <strong>சாதாரணம்</strong>, மற்றும் <strong>உச்சமல்லாதது</strong> (தள்ளுபடி). உங்கள்
      மீட்டர் ஒவ்வொரு தொகுதியிலும் யூனிட்களைத் தனித்தனியாகப் பதிவு செய்கிறது, கனமான சுமைகளை உச்சமல்லாத நேரத்தில் இயக்குவது
      பில்லைக் குறைக்கிறது. ToD பெரிய நுகர்வோருக்குக் கட்டாயமாகி வருகிறது, தேசிய கட்டணச் சீர்திருத்தங்களின் கீழ் வீட்டு
      நுகர்வோருக்கும் விரிவுபடுத்தப்படுகிறது. கணிப்பானில் உங்கள் உச்ச / சாதாரண / உச்சமல்லாத யூனிட்களை உள்ளிடவும், முழுமையாகத்
      தீர்க்கப்பட்ட எடுத்துக்காட்டுக்கு <a href="/guides/tod-billing-explained/">நேர-அடிப்படை பட்டியல் வழிகாட்டியைப்</a>
      பார்க்கவும்.</p>`,
  },
];

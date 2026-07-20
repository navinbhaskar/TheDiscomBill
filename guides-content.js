// guides-content.js — hand-written evergreen guide content for /guides/.
//
// Each guide is rendered into a static page by generate-seo.js (guidePage), with
// Article + FAQPage JSON-LD, breadcrumbs and the shared site chrome. Content rules:
//   - Answer the query in the first paragraph (LLMs and featured snippets quote it).
//   - Structure over prose: numbered checks, tables, definition-style H2s.
//   - Never hard-code a specific tariff rate that drifts yearly — describe the
//     structure and link to /tariffs/ pages, which ARE regenerated from data.
//   - `sections` is trusted hand-authored HTML (no user input flows in here).
//   - `titleHi`/`metaTitleHi`/`descriptionHi`/`introHi`/`sectionsHi`/`faqsHi` are the Hindi
//     renderings used by generate-seo.js to emit the static /hi/guides/... variants.
//     Internal links inside Hindi sections point at the /hi/ page where one exists
//     (tariffs, guides, glossary) and at the English page otherwise. Guides without
//     `sectionsHi` simply stay English-only (no /hi/ twin is emitted).
//   - `states` (optional) tags the guide to specific states: every DISCOM page in a
//     tagged state renders a "read the guide" link back to it (topical cluster links
//     in both directions).

export const GUIDES = [
  {
    slug: 'how-to-read-uppcl-bill',
    published: "2025-08-03",
    states: ['Uttar Pradesh'],
    title: 'How to Read Your UPPCL Electricity Bill',
    metaTitle: 'How to Read Your UPPCL Electricity Bill — Every Line Explained',
    description: 'A line-by-line walkthrough of a UPPCL (MVVNL, PVVNL, DVVNL, PuVVNL, KESCO) electricity bill: account fields, meter readings, energy charges, fixed charges, FPPA, electricity duty and arrears — and how to verify the total yourself.',
    minutes: 6,
    intro: `Your UPPCL bill packs a dozen codes and charge lines into one page. This guide decodes
      every field on a bill from any of Uttar Pradesh's five distribution companies —
      <strong>MVVNL</strong> (Lucknow region), <strong>PVVNL</strong> (Meerut/West UP),
      <strong>DVVNL</strong> (Agra region), <strong>PuVVNL</strong> (Varanasi/East UP) and
      <strong>KESCO</strong> (Kanpur city) — so you can check whether the amount you're asked
      to pay is actually correct.`,
    sections: `
      <section class="seo-section">
        <h2>1. The identity block — who and what is being billed</h2>
        <p>The top of the bill identifies your connection, not your usage. The fields that matter:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Field on bill</th><th>What it means</th></tr></thead>
          <tbody>
            <tr><td><strong>Account No.</strong></td><td>Your 10-or-12-digit consumer number — needed for payments, complaints and the UPPCL portal. Keep it handy.</td></tr>
            <tr><td><strong>Book / SBM No.</strong></td><td>Internal meter-reading route codes. Useful only when visiting the sub-division office.</td></tr>
            <tr><td><strong>Tariff / Category</strong></td><td>The rate schedule applied to you. <strong>LMV-1</strong> is domestic, LMV-2 is commercial, LMV-5 is private tube-well, and so on. A wrong category here is one of the most expensive billing errors.</td></tr>
            <tr><td><strong>Sanctioned Load</strong></td><td>Your contracted load in kW. Fixed charges are billed per kW of this value, and drawing more than it can attract an excess-demand penalty.</td></tr>
            <tr><td><strong>Supply Type</strong></td><td>Rural or urban schedule — rural connections get different rates and, in some categories, unmetered options.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>2. The meter block — how your units were counted</h2>
        <p>Units billed = (Current reading − Previous reading) × <strong>MF</strong> (multiplying
        factor). For almost all domestic meters MF is 1, so the subtraction alone is your consumption.
        Two things to check every month:</p>
        <ul>
          <li><strong>Meter status code.</strong> "OK" means an actual reading. Codes like
          <strong>IDF</strong> (Inaccessible Due to Factors) or <strong>RDF</strong> (Reading Defective)
          mean UPPCL <em>estimated</em> your usage — expect a catch-up adjustment when a real reading
          finally happens.</li>
          <li><strong>Reading dates.</strong> A billing period longer than ~30 days pushes more units
          into higher slabs and inflates the bill even at normal usage.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>3. The charges table — every line, in billing order</h2>
        <ol>
          <li><strong>Energy charge.</strong> Your units priced through the LMV-1 slab schedule.
          UP domestic slabs step up with consumption, so heavy months cost more per unit.
          Current slab rates for your DISCOM are on our
          <a href="/tariffs/uttar-pradesh/">Uttar Pradesh tariff pages</a>.</li>
          <li><strong>Fixed charge.</strong> A flat ₹-per-kW-per-month amount multiplied by your
          sanctioned load. It's payable even at zero consumption.</li>
          <li><strong>FPPA / fuel surcharge.</strong> The Fuel and Power Purchase Adjustment recovers
          changes in UPPCL's power-purchase cost. Under UP's current framework it's applied as a
          percentage of your energy charge and is revised periodically — read our
          <a href="/guides/why-did-my-electricity-bill-increase/">bill-increase guide</a> if this
          line suddenly appeared.</li>
          <li><strong>Electricity duty (ED).</strong> A state levy applied <em>after</em> FPPA is
          added — i.e. as a percentage of energy + fixed + FPPA, per the tariff schedule.</li>
          <li><strong>Arrears and LPSC.</strong> Unpaid past amounts carried forward, plus a late
          payment surcharge of about 1.25% per month on dues.</li>
          <li><strong>Subsidy / adjustment.</strong> Government subsidy (where applicable) and any
          credits from earlier over-billing appear as negative lines.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. Verify the total yourself in 30 seconds</h2>
        <p>Our calculator implements the same slab, fixed-charge, FPPA and duty logic as the tariff
        order — for UPPCL DISCOMs it has been verified against real bills to the paisa. Enter your
        units and sanctioned load in the
        <a href="/?state=Uttar%20Pradesh#calculator">UPPCL bill calculator</a> and compare the
        result to the printed bill. If the difference is more than a few rupees, something on the
        bill (category, MF, estimated reading, arrears) deserves a closer look — our
        <a href="/bill-review/">expert Bill Review</a> can check it for you, free.</p>
      </section>`,
    faqs: [
      { q: 'What is LMV-1 on a UPPCL bill?',
        a: 'LMV-1 is the Low/Medium Voltage domestic (residential) tariff category in Uttar Pradesh. It covers household connections and determines the slab rates and fixed charge per kW applied to your bill. Commercial connections fall under LMV-2.' },
      { q: 'What does IDF mean on my UPPCL bill?',
        a: 'IDF ("Inaccessible Due to Factors") means the meter reader could not take an actual reading, so the month was billed on an estimate. Once a real reading is taken, the difference is adjusted — which can cause a suddenly large catch-up bill.' },
      { q: 'What is the multiplying factor (MF) on an electricity bill?',
        a: 'MF converts the meter’s internal count into actual units where current transformers are used. Billed units = (current reading − previous reading) × MF. Domestic meters almost always have MF = 1; a wrong MF multiplies your whole bill.' },
      { q: 'How is electricity duty calculated on UP bills?',
        a: 'Electricity duty is a state levy applied as a percentage after the fuel surcharge (FPPA) has been added — that is, on energy charge + fixed charge + FPPA, as specified in the UP tariff schedule.' },
    ],

    titleHi: 'अपना UPPCL बिजली बिल कैसे पढ़ें',
    metaTitleHi: 'UPPCL बिजली बिल कैसे पढ़ें — हर लाइन की पूरी जानकारी',
    descriptionHi: 'UPPCL (MVVNL, PVVNL, DVVNL, PuVVNL, KESCO) बिजली बिल की लाइन-दर-लाइन व्याख्या: खाता विवरण, मीटर रीडिंग, ऊर्जा शुल्क, फिक्स्ड चार्ज, FPPA, बिजली शुल्क और बकाया — और कुल राशि खुद कैसे जाँचें।',
    introHi: `आपके UPPCL बिल में एक ही पन्ने पर दर्जनों कोड और शुल्क लाइनें होती हैं। यह गाइड उत्तर प्रदेश की
      पाँचों वितरण कंपनियों — <strong>MVVNL</strong> (लखनऊ क्षेत्र), <strong>PVVNL</strong> (मेरठ/पश्चिमी यूपी),
      <strong>DVVNL</strong> (आगरा क्षेत्र), <strong>PuVVNL</strong> (वाराणसी/पूर्वी यूपी) और
      <strong>KESCO</strong> (कानपुर शहर) — के बिल का हर फ़ील्ड समझाती है, ताकि आप जाँच सकें कि आपसे
      माँगी गई राशि वाकई सही है या नहीं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. पहचान ब्लॉक — किसे और किस चीज़ का बिल भेजा गया है</h2>
        <p>बिल का ऊपरी हिस्सा आपके कनेक्शन की पहचान बताता है, खपत नहीं। ये फ़ील्ड मायने रखते हैं:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>बिल पर फ़ील्ड</th><th>इसका मतलब</th></tr></thead>
          <tbody>
            <tr><td><strong>खाता संख्या (Account No.)</strong></td><td>आपका 10 या 12 अंकों का उपभोक्ता नंबर — भुगतान, शिकायत और UPPCL पोर्टल के लिए ज़रूरी। इसे संभालकर रखें।</td></tr>
            <tr><td><strong>बुक / SBM नंबर</strong></td><td>मीटर-रीडिंग रूट के आंतरिक कोड। केवल उपखंड कार्यालय जाने पर काम आते हैं।</td></tr>
            <tr><td><strong>टैरिफ / श्रेणी</strong></td><td>आप पर लागू दर अनुसूची। <strong>LMV-1</strong> घरेलू है, LMV-2 व्यावसायिक, LMV-5 निजी नलकूप, इत्यादि। यहाँ गलत श्रेणी सबसे महँगी बिलिंग गलतियों में से एक है।</td></tr>
            <tr><td><strong>स्वीकृत भार (Sanctioned Load)</strong></td><td>आपका अनुबंधित भार kW में। फिक्स्ड चार्ज इसी के प्रति kW पर लगता है, और इससे अधिक खींचने पर अतिरिक्त-मांग जुर्माना लग सकता है।</td></tr>
            <tr><td><strong>आपूर्ति प्रकार (Supply Type)</strong></td><td>ग्रामीण या शहरी अनुसूची — ग्रामीण कनेक्शनों की दरें अलग होती हैं और कुछ श्रेणियों में बिना मीटर के विकल्प भी।</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>2. मीटर ब्लॉक — आपकी यूनिटें कैसे गिनी गईं</h2>
        <p>बिल की गई यूनिटें = (वर्तमान रीडिंग − पिछली रीडिंग) × <strong>MF</strong> (मल्टीप्लाइंग
        फैक्टर)। लगभग सभी घरेलू मीटरों में MF 1 होता है, यानी सिर्फ़ घटाना ही आपकी खपत है।
        हर महीने दो चीज़ें जाँचें:</p>
        <ul>
          <li><strong>मीटर स्थिति कोड।</strong> "OK" यानी वास्तविक रीडिंग। <strong>IDF</strong>
          (पहुँच से बाहर) या <strong>RDF</strong> (रीडिंग खराब) जैसे कोड का मतलब है कि UPPCL ने आपकी खपत का
          <em>अनुमान</em> लगाया — असली रीडिंग होते ही एक बड़ा समायोजन आ सकता है।</li>
          <li><strong>रीडिंग की तारीख़ें।</strong> ~30 दिन से लंबी बिलिंग अवधि ज़्यादा यूनिटों को ऊँचे
          स्लैब में धकेल देती है और सामान्य खपत पर भी बिल बढ़ा देती है।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>3. शुल्क तालिका — हर लाइन, बिलिंग क्रम में</h2>
        <ol>
          <li><strong>ऊर्जा शुल्क।</strong> आपकी यूनिटें LMV-1 स्लैब अनुसूची से मूल्यांकित। यूपी के घरेलू
          स्लैब खपत के साथ बढ़ते हैं, इसलिए भारी महीनों में प्रति यूनिट लागत ज़्यादा होती है। आपके डिस्कॉम की
          वर्तमान स्लैब दरें हमारे
          <a href="/hi/tariffs/uttar-pradesh/">उत्तर प्रदेश टैरिफ पेज</a> पर हैं।</li>
          <li><strong>फिक्स्ड चार्ज।</strong> ₹-प्रति-kW-प्रति-माह की एक स्थिर राशि, आपके स्वीकृत भार से
          गुणा। शून्य खपत पर भी देय।</li>
          <li><strong>FPPA / ईंधन अधिभार।</strong> Fuel and Power Purchase Adjustment, UPPCL की
          बिजली-खरीद लागत में बदलाव वसूलता है। यूपी के मौजूदा ढाँचे में यह आपके ऊर्जा शुल्क के प्रतिशत के रूप
          में लगता है और समय-समय पर संशोधित होता है — यह लाइन अचानक दिखे तो हमारी
          <a href="/hi/guides/why-did-my-electricity-bill-increase/">बिल-वृद्धि गाइड</a> पढ़ें।</li>
          <li><strong>बिजली शुल्क (ED)।</strong> राज्य का कर, जो FPPA जुड़ने के <em>बाद</em> लगता है —
          यानी ऊर्जा + फिक्स्ड + FPPA के प्रतिशत के रूप में, टैरिफ अनुसूची के अनुसार।</li>
          <li><strong>बकाया और LPSC।</strong> पिछली अदा न की गई राशियाँ आगे बढ़ती हैं, साथ में बकाया पर
          लगभग 1.25% प्रति माह का विलंब-भुगतान अधिभार।</li>
          <li><strong>सब्सिडी / समायोजन।</strong> सरकारी सब्सिडी (जहाँ लागू हो) और पहले की अधिक-बिलिंग के
          क्रेडिट ऋणात्मक लाइनों के रूप में दिखते हैं।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. कुल राशि 30 सेकंड में खुद जाँचें</h2>
        <p>हमारा कैलकुलेटर टैरिफ आदेश जैसा ही स्लैब, फिक्स्ड-चार्ज, FPPA और शुल्क तर्क लागू करता है —
        UPPCL डिस्कॉम के लिए इसे असली बिलों से पैसे-पैसे तक सत्यापित किया गया है। अपनी यूनिटें और स्वीकृत भार
        <a href="/?state=Uttar%20Pradesh#calculator">UPPCL बिल कैलकुलेटर</a> में डालें और नतीजे की तुलना
        छपे बिल से करें। कुछ रुपये से ज़्यादा का अंतर हो तो बिल की किसी चीज़ (श्रेणी, MF, अनुमानित रीडिंग,
        बकाया) को ग़ौर से देखना चाहिए — हमारी <a href="/bill-review/">विशेषज्ञ बिल समीक्षा</a> इसे
        मुफ़्त में जाँच सकती है।</p>
      </section>`,
    faqsHi: [
      { q: 'UPPCL बिल पर LMV-1 क्या है?',
        a: 'LMV-1 उत्तर प्रदेश की लो/मीडियम वोल्टेज घरेलू (आवासीय) टैरिफ श्रेणी है। यह घरेलू कनेक्शनों पर लागू होती है और आपके बिल की स्लैब दरें व प्रति kW फिक्स्ड चार्ज तय करती है। व्यावसायिक कनेक्शन LMV-2 में आते हैं।' },
      { q: 'मेरे UPPCL बिल पर IDF का क्या मतलब है?',
        a: 'IDF ("Inaccessible Due to Factors") का मतलब है कि मीटर रीडर वास्तविक रीडिंग नहीं ले सका, इसलिए उस महीने का बिल अनुमान पर बना। असली रीडिंग होने पर अंतर समायोजित होता है — जिससे अचानक बड़ा कैच-अप बिल आ सकता है।' },
      { q: 'बिजली बिल पर मल्टीप्लाइंग फैक्टर (MF) क्या है?',
        a: 'जहाँ करंट ट्रांसफ़ॉर्मर लगे होते हैं, वहाँ MF मीटर की आंतरिक गिनती को वास्तविक यूनिटों में बदलता है। बिल की गई यूनिटें = (वर्तमान रीडिंग − पिछली रीडिंग) × MF। घरेलू मीटरों में MF लगभग हमेशा 1 होता है; गलत MF आपका पूरा बिल गुणा कर देता है।' },
      { q: 'यूपी के बिलों पर बिजली शुल्क कैसे लगता है?',
        a: 'बिजली शुल्क राज्य का कर है, जो ईंधन अधिभार (FPPA) जुड़ने के बाद प्रतिशत के रूप में लगता है — यानी ऊर्जा शुल्क + फिक्स्ड चार्ज + FPPA पर, जैसा यूपी टैरिफ अनुसूची में निर्दिष्ट है।' },
    ],

    titleMr: 'तुमचे UPPCL वीज बिल कसे वाचावे',
    metaTitleMr: 'UPPCL वीज बिल कसे वाचावे — प्रत्येक ओळ समजावली',
    descriptionMr: 'UPPCL (MVVNL, PVVNL, DVVNL, PuVVNL, KESCO) वीज बिलाची ओळ-दर-ओळ माहिती: खाते तपशील, मीटर रीडिंग, ऊर्जा आकार, स्थिर आकार, FPPA, वीज शुल्क आणि थकबाकी — आणि एकूण रक्कम स्वतः कशी तपासावी.',
    introMr: `तुमच्या UPPCL बिलात एकाच पानावर डझनभर कोड आणि शुल्क ओळी असतात. ही मार्गदर्शिका उत्तर प्रदेशातील
      पाचही वितरण कंपन्यांच्या — <strong>MVVNL</strong> (लखनौ क्षेत्र), <strong>PVVNL</strong> (मेरठ/पश्चिम
      यूपी), <strong>DVVNL</strong> (आग्रा क्षेत्र), <strong>PuVVNL</strong> (वाराणसी/पूर्व यूपी) आणि
      <strong>KESCO</strong> (कानपूर शहर) — बिलाचे प्रत्येक क्षेत्र समजावते, जेणेकरून तुमच्याकडून मागितलेली
      रक्कम खरोखर बरोबर आहे का ते तुम्ही तपासू शकता.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. ओळख ब्लॉक — कोणाला व कशाचे बिल आले आहे</h2>
        <p>बिलाचा वरचा भाग तुमच्या जोडणीची ओळख सांगतो, वापर नव्हे. महत्त्वाची क्षेत्रे:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>बिलावरील क्षेत्र</th><th>त्याचा अर्थ</th></tr></thead>
          <tbody>
            <tr><td><strong>खाते क्रमांक (Account No.)</strong></td><td>तुमचा 10 किंवा 12 अंकी ग्राहक क्रमांक — भरणा, तक्रारी व UPPCL पोर्टलसाठी आवश्यक. तो जवळ ठेवा.</td></tr>
            <tr><td><strong>बुक / SBM क्रमांक</strong></td><td>मीटर-रीडिंग मार्गाचे अंतर्गत कोड. फक्त उपविभाग कार्यालयात जाताना उपयोगी.</td></tr>
            <tr><td><strong>टॅरिफ / श्रेणी</strong></td><td>तुम्हाला लागू दर अनुसूची. <strong>LMV-1</strong> घरगुती, LMV-2 व्यावसायिक, LMV-5 खाजगी नलकूप, इत्यादी. इथे चुकीची श्रेणी सर्वात महागड्या बिलिंग चुकांपैकी एक.</td></tr>
            <tr><td><strong>मंजूर भार (Sanctioned Load)</strong></td><td>तुमचा करार केलेला भार kW मध्ये. स्थिर आकार याच्या प्रति kW वर लागतो, आणि यापेक्षा जास्त ओढल्यास अतिरिक्त-मागणी दंड लागू शकतो.</td></tr>
            <tr><td><strong>पुरवठा प्रकार (Supply Type)</strong></td><td>ग्रामीण किंवा शहरी अनुसूची — ग्रामीण जोडण्यांचे दर वेगळे असतात आणि काही श्रेणींत मीटरशिवाय पर्यायही.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>2. मीटर ब्लॉक — तुमची युनिटे कशी मोजली गेली</h2>
        <p>बिल केलेली युनिटे = (चालू रीडिंग − मागील रीडिंग) × <strong>MF</strong> (मल्टिप्लाइंग फॅक्टर).
        जवळपास सर्व घरगुती मीटरांत MF 1 असतो, म्हणजे फक्त वजाबाकीच तुमचा वापर आहे. दर महिन्याला दोन गोष्टी
        तपासा:</p>
        <ul>
          <li><strong>मीटर स्थिती कोड.</strong> "OK" म्हणजे प्रत्यक्ष रीडिंग. <strong>IDF</strong>
          (पोहोचण्याबाहेर) किंवा <strong>RDF</strong> (रीडिंग सदोष) सारख्या कोडांचा अर्थ UPPCL ने तुमच्या
          वापराचा <em>अंदाज</em> लावला — खरी रीडिंग होताच एक मोठे समायोजन येऊ शकते.</li>
          <li><strong>रीडिंगच्या तारखा.</strong> ~30 दिवसांहून जास्त बिलिंग कालावधी जास्त युनिटे उच्च
          स्लॅबमध्ये ढकलतो आणि सामान्य वापरावरही बिल वाढवतो.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>3. शुल्क तक्ता — प्रत्येक ओळ, बिलिंग क्रमाने</h2>
        <ol>
          <li><strong>ऊर्जा आकार.</strong> तुमची युनिटे LMV-1 स्लॅब अनुसूचीने आकारलेली. यूपीचे घरगुती
          स्लॅब वापरासह वाढतात, म्हणून जास्त महिन्यांत प्रति युनिट किंमत जास्त. तुमच्या डिस्कॉमचे सध्याचे
          स्लॅब दर आमच्या <a href="/tariffs/uttar-pradesh/">उत्तर प्रदेश टॅरिफ पेजांवर</a> आहेत.</li>
          <li><strong>स्थिर आकार.</strong> ₹-प्रति-kW-प्रति-महिना एक स्थिर रक्कम, तुमच्या मंजूर भाराने
          गुणलेली. शून्य वापरावरही देय.</li>
          <li><strong>FPPA / इंधन अधिभार.</strong> Fuel and Power Purchase Adjustment, UPPCL च्या
          वीज-खरेदी खर्चातील बदल वसूल करते. यूपीच्या सध्याच्या चौकटीत तो तुमच्या ऊर्जा आकाराच्या टक्केवारीने
          लागतो आणि वेळोवेळी सुधारला जातो — ही ओळ अचानक दिसल्यास आमची
          <a href="/mr/guides/why-did-my-electricity-bill-increase/">बिल-वाढ मार्गदर्शिका</a> वाचा.</li>
          <li><strong>वीज शुल्क (ED).</strong> राज्याचा कर, जो FPPA जोडल्या<em>नंतर</em> लागतो — म्हणजे
          ऊर्जा + स्थिर + FPPA च्या टक्केवारीने, टॅरिफ अनुसूचीनुसार.</li>
          <li><strong>थकबाकी व LPSC.</strong> न भरलेल्या मागील रकमा पुढे जातात, सोबत थकबाकीवर सुमारे
          1.25% प्रति महिना विलंब-भरणा अधिभार.</li>
          <li><strong>अनुदान / समायोजन.</strong> सरकारी अनुदान (जिथे लागू) आणि आधीच्या जास्त-बिलिंगचे
          क्रेडिट ऋणात्मक ओळींच्या रूपात दिसतात.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. एकूण रक्कम 30 सेकंदात स्वतः तपासा</h2>
        <p>आमचे कॅल्क्युलेटर टॅरिफ आदेशाप्रमाणेच स्लॅब, स्थिर-आकार, FPPA आणि शुल्क तर्क लावते — UPPCL
        डिस्कॉमसाठी ते खऱ्या बिलांशी पैशापैशापर्यंत पडताळले आहे. तुमची युनिटे व मंजूर भार
        <a href="/?state=Uttar%20Pradesh#calculator">UPPCL बिल कॅल्क्युलेटर</a> मध्ये टाका आणि निकालाची
        छापील बिलाशी तुलना करा. काही रुपयांहून जास्त फरक असल्यास बिलावरील काहीतरी (श्रेणी, MF, अंदाजित
        रीडिंग, थकबाकी) बारकाईने पाहण्यासारखे आहे — आमची <a href="/bill-review/">तज्ज्ञ बिल समीक्षा</a> ते
        तुमच्यासाठी मोफत तपासू शकते.</p>
      </section>`,
    faqsMr: [
      { q: 'UPPCL बिलावर LMV-1 म्हणजे काय?',
        a: 'LMV-1 ही उत्तर प्रदेशातील लो/मीडियम व्होल्टेज घरगुती (निवासी) टॅरिफ श्रेणी आहे. ती घरगुती जोडण्यांना लागू होते आणि तुमच्या बिलाचे स्लॅब दर व प्रति kW स्थिर आकार ठरवते. व्यावसायिक जोडण्या LMV-2 मध्ये येतात.' },
      { q: 'माझ्या UPPCL बिलावर IDF चा अर्थ काय?',
        a: 'IDF ("Inaccessible Due to Factors") म्हणजे मीटर रीडरला प्रत्यक्ष रीडिंग घेता आली नाही, म्हणून तो महिना अंदाजावर बिल झाला. खरी रीडिंग घेतल्यावर फरक समायोजित होतो — ज्यामुळे अचानक मोठे कॅच-अप बिल येऊ शकते.' },
      { q: 'वीज बिलावर मल्टिप्लाइंग फॅक्टर (MF) म्हणजे काय?',
        a: 'जिथे करंट ट्रान्सफॉर्मर वापरले जातात तिथे MF मीटरची अंतर्गत गणना प्रत्यक्ष युनिटांत रूपांतरित करतो. बिल केलेली युनिटे = (चालू रीडिंग − मागील रीडिंग) × MF. घरगुती मीटरांत MF जवळपास नेहमीच 1 असतो; चुकीचा MF तुमचे संपूर्ण बिल गुणतो.' },
      { q: 'यूपीच्या बिलांवर वीज शुल्क कसे लागते?',
        a: 'वीज शुल्क हा राज्याचा कर आहे, जो इंधन अधिभार (FPPA) जोडल्यानंतर टक्केवारीने लागतो — म्हणजे ऊर्जा आकार + स्थिर आकार + FPPA वर, यूपी टॅरिफ अनुसूचीत नमूद केल्याप्रमाणे.' },
    ],
  },

  {
    slug: 'why-did-my-electricity-bill-increase',
    published: "2025-08-15",
    title: 'Why Did My Electricity Bill Suddenly Increase?',
    metaTitle: 'Why Did My Electricity Bill Suddenly Increase? 8 Causes to Check',
    description: 'The 8 most common reasons an Indian electricity bill jumps — slab escalation, catch-up after estimated readings, FPPA revisions, seasonal AC load, arrears with LPSC, meter faults, excess-load penalties — and exactly how to check each one.',
    minutes: 7,
    intro: `A bill that doubles without warning usually has a mundane explanation — and it's rarely
      "the meter is fast". Work through these eight causes in order: they're ranked from most to
      least common, and each comes with a concrete way to check it on your own bill.`,
    sections: `
      <section class="seo-section">
        <h2>1. Seasonal appliance load (the AC effect)</h2>
        <p>A single 1.5-ton AC draws roughly 1.2–1.6 kW. Run it 8 hours a night and that's
        <strong>~300 extra units a month</strong> — often more than the rest of the house combined.
        <em>Check:</em> compare this month's units (not rupees) with the same month <strong>last
        year</strong>, not last month. Our <a href="/usage/">electricity cost calculator</a> converts your
        appliances into expected units.</p>
      </section>
      <section class="seo-section">
        <h2>2. Slab escalation — extra units cost more per unit</h2>
        <p>Indian domestic tariffs are slabbed: the price per unit steps up as monthly consumption
        rises. Crossing a slab boundary means the extra units are billed at the higher rate, so a
        30% rise in usage can produce a 45% rise in the energy charge.
        <em>Check:</em> find your slab boundaries on your DISCOM's
        <a href="/tariffs/">tariff page</a>, then see which side of them your recent months fall.</p>
      </section>
      <section class="seo-section">
        <h2>3. Catch-up after estimated readings</h2>
        <p>If earlier bills carried a status like IDF/RDF or "average", you were billed on
        estimates. When an actual reading finally happens, all under-billed units land at once —
        and because of slab escalation they land at the <em>highest</em> rates.
        <em>Check:</em> the meter-status code and reading dates on the last 3–4 bills.</p>
      </section>
      <section class="seo-section">
        <h2>4. FPPA / fuel surcharge revision</h2>
        <p>The Fuel and Power Purchase Adjustment passes changes in your DISCOM's power-purchase
        cost through to you, and it's revised periodically (monthly or quarterly depending on the
        state). A new or increased FPPA line raises the bill with zero change in your usage.
        <em>Check:</em> compare the FPPA line across two bills with similar units.</p>
      </section>
      <section class="seo-section">
        <h2>5. Arrears and late-payment surcharge (LPSC)</h2>
        <p>A missed or partial payment carries forward as arrears and accrues LPSC (typically around
        1.25–1.5% per month). The current bill then looks inflated even though current-month charges
        are normal. <em>Check:</em> the arrears line — current charges and arrears are always shown
        separately.</p>
      </section>
      <section class="seo-section">
        <h2>6. Tariff order revision</h2>
        <p>State regulators (SERCs) issue revised tariff schedules, usually effective April–June.
        Slab rates, fixed charges or duty may have changed since your last "normal" bill.
        <em>Check:</em> the tariff year printed on the bill against your DISCOM's
        <a href="/tariffs/">current schedule</a>.</p>
      </section>
      <section class="seo-section">
        <h2>7. Excess load penalty</h2>
        <p>If your recorded demand exceeds the sanctioned load, many DISCOMs bill the excess kW at a
        penal fixed-charge rate. Common after adding an AC or motor without upgrading the sanctioned
        load. <em>Check:</em> "recorded/billed demand" vs "sanctioned load" on the bill.</p>
      </section>
      <section class="seo-section">
        <h2>8. Meter fault or wrong multiplying factor</h2>
        <p>Genuinely faulty meters are the rarest cause, but a wrong MF after a meter replacement
        multiplies everything. <em>Check:</em> units = (current − previous) × MF by hand. If the
        printed units don't match, apply for a meter test (a small fee, refundable in many states
        if the meter is found faulty).</p>
      </section>
      <section class="seo-section">
        <h2>Still can't explain it?</h2>
        <p>Recalculate your bill from scratch with the
        <a href="/#calculator">free bill calculator</a> — it itemises energy, fixed, FPPA and duty
        exactly as the tariff order specifies. If the printed total still doesn't match, upload the
        bill to our free <a href="/bill-review/">expert Bill Review</a> and a human will go through
        it line by line with you.</p>
      </section>`,
    faqs: [
      { q: 'Why is my electricity bill high even though usage is the same?',
        a: 'With unchanged units, the usual culprits are a revised FPPA/fuel surcharge, a new tariff order, arrears with late-payment surcharge from a missed payment, or a catch-up adjustment after months of estimated readings. Compare the individual charge lines — not just the total — across two bills with similar units.' },
      { q: 'How do I check if my electricity meter is faulty?',
        a: 'First verify the arithmetic: billed units should equal (current reading − previous reading) × MF. Then run a self-test: note the reading, run a known load (e.g. a 1 kW heater) for exactly one hour, and confirm the meter advanced by ~1 unit. If it deviates significantly, apply to your DISCOM for an official meter test.' },
      { q: 'What is FPPA and why does it change my bill?',
        a: 'FPPA (Fuel and Power Purchase Adjustment) is a surcharge that passes changes in the DISCOM’s fuel and power-purchase costs to consumers, applied per-unit or as a percentage of energy charges depending on the state. Because it is revised periodically, your bill can rise or fall with no change in your consumption.' },
      { q: 'Can I get a wrong electricity bill corrected?',
        a: 'Yes. Raise a billing complaint with your DISCOM (keep the complaint number), and escalate to the Consumer Grievance Redressal Forum if unresolved. Estimated-reading catch-ups, wrong category, wrong MF and duplicate arrears are all correctable. Our free expert Bill Review can help you build the case.' },
    ],

    titleHi: 'मेरा बिजली बिल अचानक क्यों बढ़ गया?',
    metaTitleHi: 'बिजली बिल अचानक ज़्यादा क्यों आया? जाँचने लायक 8 कारण',
    descriptionHi: 'भारतीय बिजली बिल अचानक बढ़ने के 8 सबसे आम कारण — स्लैब एस्केलेशन, अनुमानित रीडिंग के बाद कैच-अप, FPPA संशोधन, मौसमी AC लोड, LPSC सहित बकाया, मीटर खराबी, अतिरिक्त-भार जुर्माना — और हर एक को जाँचने का सटीक तरीका।',
    introHi: `बिना चेतावनी दोगुना हुए बिल की वजह आम तौर पर साधारण होती है — और वह शायद ही कभी
      "मीटर तेज़ चल रहा है" होती है। इन आठ कारणों को क्रम से जाँचें: ये सबसे आम से सबसे दुर्लभ के क्रम में
      हैं, और हर एक के साथ अपने बिल पर उसे जाँचने का ठोस तरीका दिया गया है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. मौसमी उपकरण लोड (AC इफ़ेक्ट)</h2>
        <p>एक 1.5-टन AC लगभग 1.2–1.6 kW खींचता है। रात में 8 घंटे चलाइए तो
        <strong>~300 अतिरिक्त यूनिट प्रति माह</strong> — अक्सर बाक़ी पूरे घर से ज़्यादा।
        <em>जाँचें:</em> इस महीने की यूनिटों (रुपये नहीं) की तुलना <strong>पिछले साल</strong> के इसी महीने से
        करें, पिछले महीने से नहीं। हमारा <a href="/usage/">खपत अनुमानक</a> आपके उपकरणों को अपेक्षित
        यूनिटों में बदल देता है।</p>
      </section>
      <section class="seo-section">
        <h2>2. स्लैब एस्केलेशन — अतिरिक्त यूनिटें प्रति यूनिट महँगी पड़ती हैं</h2>
        <p>भारतीय घरेलू टैरिफ स्लैब में बँटे हैं: मासिक खपत बढ़ने के साथ प्रति यूनिट दाम बढ़ता है। स्लैब की
        सीमा पार करने पर अतिरिक्त यूनिटें ऊँची दर पर बिल होती हैं, इसलिए खपत में 30% वृद्धि ऊर्जा शुल्क में
        45% वृद्धि दे सकती है। <em>जाँचें:</em> अपने डिस्कॉम के
        <a href="/hi/tariffs/states/">टैरिफ पेज</a> पर स्लैब सीमाएँ देखें, फिर देखें कि हाल के महीने किस
        ओर पड़ते हैं।</p>
      </section>
      <section class="seo-section">
        <h2>3. अनुमानित रीडिंग के बाद कैच-अप</h2>
        <p>अगर पिछले बिलों पर IDF/RDF या "average" जैसी स्थिति थी, तो आपको अनुमान पर बिल किया गया।
        वास्तविक रीडिंग होते ही सारी कम-बिल हुई यूनिटें एक साथ आती हैं — और स्लैब एस्केलेशन के कारण
        <em>सबसे ऊँची</em> दरों पर। <em>जाँचें:</em> पिछले 3–4 बिलों के मीटर-स्थिति कोड और रीडिंग तारीख़ें।</p>
      </section>
      <section class="seo-section">
        <h2>4. FPPA / ईंधन अधिभार संशोधन</h2>
        <p>Fuel and Power Purchase Adjustment आपके डिस्कॉम की बिजली-खरीद लागत में बदलाव आप तक
        पहुँचाता है, और यह समय-समय पर (राज्य के अनुसार मासिक या त्रैमासिक) संशोधित होता है। नई या बढ़ी FPPA
        लाइन आपकी खपत में शून्य बदलाव पर भी बिल बढ़ा देती है। <em>जाँचें:</em> समान यूनिटों वाले दो बिलों की
        FPPA लाइन की तुलना करें।</p>
      </section>
      <section class="seo-section">
        <h2>5. बकाया और विलंब-भुगतान अधिभार (LPSC)</h2>
        <p>छूटा या आंशिक भुगतान बकाया बनकर आगे बढ़ता है और उस पर LPSC (आम तौर पर लगभग 1.25–1.5%
        प्रति माह) जुड़ता है। तब चालू बिल बढ़ा हुआ दिखता है जबकि चालू माह के शुल्क सामान्य हैं।
        <em>जाँचें:</em> बकाया लाइन — चालू शुल्क और बकाया हमेशा अलग-अलग दिखाए जाते हैं।</p>
      </section>
      <section class="seo-section">
        <h2>6. टैरिफ आदेश संशोधन</h2>
        <p>राज्य नियामक (SERC) संशोधित टैरिफ अनुसूचियाँ जारी करते हैं, जो आम तौर पर अप्रैल–जून से लागू होती
        हैं। आपके पिछले "सामान्य" बिल के बाद स्लैब दरें, फिक्स्ड चार्ज या शुल्क बदल सकते हैं।
        <em>जाँचें:</em> बिल पर छपा टैरिफ वर्ष बनाम आपके डिस्कॉम की
        <a href="/hi/tariffs/states/">वर्तमान अनुसूची</a>।</p>
      </section>
      <section class="seo-section">
        <h2>7. अतिरिक्त भार जुर्माना</h2>
        <p>अगर आपकी दर्ज मांग स्वीकृत भार से अधिक है, तो कई डिस्कॉम अतिरिक्त kW पर दंडात्मक फिक्स्ड-चार्ज
        दर लगाते हैं। स्वीकृत भार बढ़ाए बिना AC या मोटर जोड़ने के बाद यह आम है। <em>जाँचें:</em> बिल पर
        "recorded/billed demand" बनाम "sanctioned load"।</p>
      </section>
      <section class="seo-section">
        <h2>8. मीटर खराबी या गलत मल्टीप्लाइंग फैक्टर</h2>
        <p>वाकई खराब मीटर सबसे दुर्लभ कारण है, पर मीटर बदलने के बाद गलत MF सब कुछ गुणा कर देता है।
        <em>जाँचें:</em> यूनिटें = (वर्तमान − पिछली) × MF हाथ से निकालें। छपी यूनिटें न मिलें तो मीटर
        जाँच के लिए आवेदन करें (छोटा शुल्क, कई राज्यों में मीटर खराब निकलने पर वापसी योग्य)।</p>
      </section>
      <section class="seo-section">
        <h2>फिर भी समझ नहीं आया?</h2>
        <p><a href="/#calculator">मुफ़्त बिल कैलकुलेटर</a> से अपना बिल शुरू से दोबारा निकालें — यह ऊर्जा,
        फिक्स्ड, FPPA और शुल्क को ठीक वैसे ही मदवार दिखाता है जैसे टैरिफ आदेश कहता है। छपा कुल फिर भी न
        मिले तो बिल हमारी मुफ़्त <a href="/bill-review/">विशेषज्ञ बिल समीक्षा</a> में अपलोड करें — एक
        इंसान आपके साथ लाइन-दर-लाइन जाँच करेगा।</p>
      </section>`,
    faqsHi: [
      { q: 'खपत वही है फिर भी बिजली बिल ज़्यादा क्यों?',
        a: 'यूनिटें न बदलने पर आम कारण हैं: संशोधित FPPA/ईंधन अधिभार, नया टैरिफ आदेश, छूटे भुगतान का LPSC सहित बकाया, या महीनों की अनुमानित रीडिंग के बाद कैच-अप समायोजन। समान यूनिटों वाले दो बिलों में सिर्फ़ कुल नहीं, अलग-अलग शुल्क लाइनों की तुलना करें।' },
      { q: 'कैसे जाँचें कि बिजली मीटर खराब है?',
        a: 'पहले गणित जाँचें: बिल की गई यूनिटें = (वर्तमान रीडिंग − पिछली रीडिंग) × MF होनी चाहिए। फिर स्व-परीक्षण करें: रीडिंग नोट करें, एक ज्ञात लोड (जैसे 1 kW हीटर) ठीक एक घंटा चलाएँ, और देखें कि मीटर ~1 यूनिट आगे बढ़ा। बड़ा अंतर हो तो डिस्कॉम से आधिकारिक मीटर जाँच के लिए आवेदन करें।' },
      { q: 'FPPA क्या है और यह मेरा बिल क्यों बदलता है?',
        a: 'FPPA (Fuel and Power Purchase Adjustment) एक अधिभार है जो डिस्कॉम की ईंधन व बिजली-खरीद लागत में बदलाव उपभोक्ताओं तक पहुँचाता है — राज्य के अनुसार प्रति यूनिट या ऊर्जा शुल्क के प्रतिशत के रूप में। समय-समय पर संशोधित होने के कारण आपकी खपत बदले बिना भी बिल बढ़-घट सकता है।' },
      { q: 'क्या गलत बिजली बिल ठीक कराया जा सकता है?',
        a: 'हाँ। अपने डिस्कॉम में बिलिंग शिकायत दर्ज करें (शिकायत नंबर रखें), और समाधान न होने पर उपभोक्ता शिकायत निवारण फ़ोरम में ले जाएँ। अनुमानित-रीडिंग कैच-अप, गलत श्रेणी, गलत MF और दोहरा बकाया — सब सुधारे जा सकते हैं। हमारी मुफ़्त विशेषज्ञ बिल समीक्षा केस बनाने में मदद कर सकती है।' },
    ],

    titleMr: 'माझे वीज बिल अचानक का वाढले?',
    metaTitleMr: 'वीज बिल अचानक जास्त का आले? तपासण्यासारखी 8 कारणे',
    descriptionMr: 'भारतीय वीज बिल अचानक वाढण्याची 8 सर्वात सामान्य कारणे — स्लॅब एस्केलेशन, अंदाजित रीडिंगनंतर कॅच-अप, FPPA सुधारणा, हंगामी AC भार, LPSC सह थकबाकी, मीटर बिघाड, अतिरिक्त-भार दंड — आणि प्रत्येक तपासण्याची नेमकी पद्धत.',
    introMr: `विनाइशारा दुप्पट झालेल्या बिलामागे सहसा साधे कारण असते — आणि ते क्वचितच "मीटर वेगात चालतोय"
      असते. ही आठ कारणे क्रमाने तपासा: ती सर्वात सामान्य ते सर्वात दुर्मीळ अशा क्रमात आहेत, आणि प्रत्येकासोबत
      तुमच्या बिलावर ते तपासण्याची ठोस पद्धत दिली आहे.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. हंगामी उपकरण भार (AC इफेक्ट)</h2>
        <p>एक 1.5-टन AC सुमारे 1.2–1.6 kW ओढतो. रात्री 8 तास चालवला तर
        <strong>~300 अतिरिक्त युनिट प्रति महिना</strong> — अनेकदा उर्वरित संपूर्ण घरापेक्षा जास्त.
        <em>तपासा:</em> या महिन्याच्या युनिटांची (रुपयांची नव्हे) तुलना <strong>मागील वर्षीच्या</strong>
        याच महिन्याशी करा, मागील महिन्याशी नव्हे. आमचा <a href="/usage/">वापर अंदाजक</a> तुमची उपकरणे
        अपेक्षित युनिटांत रूपांतरित करतो.</p>
      </section>
      <section class="seo-section">
        <h2>2. स्लॅब एस्केलेशन — अतिरिक्त युनिटे प्रति युनिट महाग पडतात</h2>
        <p>भारतीय घरगुती टॅरिफ स्लॅबमध्ये विभागलेले असतात: मासिक वापर वाढला की प्रति युनिट किंमत वाढते.
        स्लॅबची सीमा ओलांडल्यास अतिरिक्त युनिटे जास्त दराने बिल होतात, म्हणून वापरात 30% वाढ ऊर्जा आकारात
        45% वाढ देऊ शकते. <em>तपासा:</em> तुमच्या डिस्कॉमच्या <a href="/mr/tariffs/states/">टॅरिफ पेज</a>
        वर स्लॅब सीमा पहा, मग अलीकडचे महिने कोणत्या बाजूला येतात ते पहा.</p>
      </section>
      <section class="seo-section">
        <h2>3. अंदाजित रीडिंगनंतर कॅच-अप</h2>
        <p>मागील बिलांवर IDF/RDF किंवा "average" सारखी स्थिती असेल, तर तुम्हाला अंदाजावर बिल केले गेले.
        प्रत्यक्ष रीडिंग होताच सर्व कमी-बिल झालेली युनिटे एकत्र येतात — आणि स्लॅब एस्केलेशनमुळे
        <em>सर्वात जास्त</em> दराने. <em>तपासा:</em> मागील 3–4 बिलांचे मीटर-स्थिती कोड आणि रीडिंग तारखा.</p>
      </section>
      <section class="seo-section">
        <h2>4. FPPA / इंधन अधिभार सुधारणा</h2>
        <p>Fuel and Power Purchase Adjustment तुमच्या डिस्कॉमच्या वीज-खरेदी खर्चातील बदल तुमच्यापर्यंत
        पोहोचवते, आणि ती वेळोवेळी (राज्यानुसार मासिक किंवा त्रैमासिक) सुधारली जाते. नवीन किंवा वाढलेली
        FPPA ओळ तुमच्या वापरात शून्य बदल असतानाही बिल वाढवते. <em>तपासा:</em> सारख्या युनिटांच्या दोन
        बिलांवरील FPPA ओळींची तुलना करा.</p>
      </section>
      <section class="seo-section">
        <h2>5. थकबाकी व विलंब-भरणा अधिभार (LPSC)</h2>
        <p>चुकलेला किंवा आंशिक भरणा थकबाकी बनून पुढे जातो आणि त्यावर LPSC (सामान्यतः सुमारे 1.25–1.5%
        प्रति महिना) जमा होते. मग चालू बिल फुगलेले दिसते जरी चालू महिन्याचे आकार सामान्य असले.
        <em>तपासा:</em> थकबाकी ओळ — चालू आकार आणि थकबाकी नेहमी वेगळे दाखवले जातात.</p>
      </section>
      <section class="seo-section">
        <h2>6. टॅरिफ आदेश सुधारणा</h2>
        <p>राज्य नियामक (SERC) सुधारित टॅरिफ अनुसूची जारी करतात, ज्या सामान्यतः एप्रिल–जूनपासून लागू होतात.
        तुमच्या मागील "सामान्य" बिलानंतर स्लॅब दर, स्थिर आकार किंवा शुल्क बदलले असू शकतात.
        <em>तपासा:</em> बिलावर छापलेले टॅरिफ वर्ष वि. तुमच्या डिस्कॉमची
        <a href="/mr/tariffs/states/">सध्याची अनुसूची</a>.</p>
      </section>
      <section class="seo-section">
        <h2>7. अतिरिक्त भार दंड</h2>
        <p>तुमची नोंदलेली मागणी मंजूर भारापेक्षा जास्त असेल, तर अनेक डिस्कॉम अतिरिक्त kW वर दंडात्मक
        स्थिर-आकार दर लावतात. मंजूर भार न वाढवता AC किंवा मोटर जोडल्यानंतर हे सामान्य आहे.
        <em>तपासा:</em> बिलावरील "recorded/billed demand" वि. "sanctioned load".</p>
      </section>
      <section class="seo-section">
        <h2>8. मीटर बिघाड किंवा चुकीचा मल्टिप्लाइंग फॅक्टर</h2>
        <p>खरोखर बिघडलेले मीटर हे सर्वात दुर्मीळ कारण आहे, पण मीटर बदलल्यानंतर चुकीचा MF सर्व काही गुणतो.
        <em>तपासा:</em> युनिटे = (चालू − मागील) × MF हाताने काढा. छापलेली युनिटे जुळत नसतील तर मीटर
        तपासणीसाठी अर्ज करा (छोटे शुल्क, अनेक राज्यांत मीटर बिघडलेले आढळल्यास परत मिळते).</p>
      </section>
      <section class="seo-section">
        <h2>तरीही समजत नाही?</h2>
        <p><a href="/#calculator">मोफत बिल कॅल्क्युलेटर</a> ने तुमचे बिल सुरुवातीपासून पुन्हा काढा — ते
        ऊर्जा, स्थिर, FPPA आणि शुल्क अगदी टॅरिफ आदेश सांगतो तसे बाबवार दाखवते. छापील एकूण तरीही जुळत नसेल
        तर बिल आमच्या मोफत <a href="/bill-review/">तज्ज्ञ बिल समीक्षा</a> मध्ये अपलोड करा — एक व्यक्ती
        तुमच्यासोबत ओळ-दर-ओळ तपासेल.</p>
      </section>`,
    faqsMr: [
      { q: 'वापर तोच आहे तरी वीज बिल जास्त का?',
        a: 'युनिटे न बदलल्यास सामान्य कारणे आहेत: सुधारित FPPA/इंधन अधिभार, नवीन टॅरिफ आदेश, चुकलेल्या भरण्याची LPSC सह थकबाकी, किंवा महिन्यांच्या अंदाजित रीडिंगनंतर कॅच-अप समायोजन. सारख्या युनिटांच्या दोन बिलांवर फक्त एकूण नव्हे, वेगवेगळ्या आकार ओळींची तुलना करा.' },
      { q: 'वीज मीटर बिघडले आहे का हे कसे तपासावे?',
        a: 'आधी गणित तपासा: बिल केलेली युनिटे = (चालू रीडिंग − मागील रीडिंग) × MF असावीत. मग स्व-चाचणी करा: रीडिंग नोंदवा, एक ज्ञात भार (उदा. 1 kW हीटर) अगदी एक तास चालवा, आणि मीटर ~1 युनिट पुढे गेला का ते पहा. मोठा फरक असल्यास डिस्कॉमकडे अधिकृत मीटर तपासणीसाठी अर्ज करा.' },
      { q: 'FPPA म्हणजे काय आणि ते माझे बिल का बदलते?',
        a: 'FPPA (Fuel and Power Purchase Adjustment) हा एक अधिभार आहे जो डिस्कॉमच्या इंधन व वीज-खरेदी खर्चातील बदल ग्राहकांपर्यंत पोहोचवतो — राज्यानुसार प्रति युनिट किंवा ऊर्जा आकाराच्या टक्केवारीने. वेळोवेळी सुधारला जात असल्याने तुमचा वापर न बदलताही बिल वाढू-घटू शकते.' },
      { q: 'चुकीचे वीज बिल दुरुस्त करून घेता येते का?',
        a: 'होय. तुमच्या डिस्कॉमकडे बिलिंग तक्रार नोंदवा (तक्रार क्रमांक ठेवा), आणि निराकरण न झाल्यास ग्राहक तक्रार निवारण मंचाकडे न्या. अंदाजित-रीडिंग कॅच-अप, चुकीची श्रेणी, चुकीचा MF आणि दुहेरी थकबाकी — सर्व दुरुस्त करता येतात. आमची मोफत तज्ज्ञ बिल समीक्षा केस तयार करण्यास मदत करू शकते.' },
    ],
  },

  {
    slug: 'tod-billing-explained',
    published: "2025-08-27",
    title: 'Time-of-Day (ToD) Electricity Billing Explained',
    metaTitle: 'Time-of-Day (ToD) Electricity Billing in India, Explained Simply',
    description: 'What Time-of-Day (ToD) electricity billing is, who it applies to in India, how peak and off-peak rates work with smart meters, what kVAh billing means, and practical ways to cut your bill by shifting load.',
    minutes: 5,
    intro: `Time-of-Day (ToD) billing prices a unit of electricity differently depending on
      <strong>when</strong> you consume it: more during evening peak hours, less (often a rebate)
      during off-peak and solar hours. It has long applied to commercial and industrial consumers,
      and with smart meters it is progressively reaching domestic consumers across India.`,
    sections: `
      <section class="seo-section">
        <h2>Why ToD exists</h2>
        <p>Electricity is expensive to supply when everyone wants it at once (evenings) and cheap
        when solar generation floods the grid (midday). ToD passes that cost signal to you: shift
        flexible loads away from the peak and both you and the grid save. Under the national
        framework, ToD tariffs are mandatory for most commercial/industrial consumers and roll out
        to domestic consumers as smart meters are installed.</p>
      </section>
      <section class="seo-section">
        <h2>How the rate structure works</h2>
        <p>Your DISCOM's tariff order splits the day into windows, each with a surcharge or rebate
        applied on top of the normal energy rate. A typical structure (exact windows and percentages
        vary by state — check your DISCOM's <a href="/tariffs/">tariff page</a>):</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Window</th><th>Typical hours</th><th>Typical pricing</th></tr></thead>
          <tbody>
            <tr><td><strong>Peak</strong></td><td>~6 pm – 10 pm (and often a morning peak)</td><td>+10% to +20% on the energy rate</td></tr>
            <tr><td><strong>Normal</strong></td><td>Daytime outside solar/peak windows</td><td>Standard energy rate</td></tr>
            <tr><td><strong>Off-peak / solar</strong></td><td>Late night, and ~9 am – 4 pm solar hours</td><td>−10% to −20% rebate</td></tr>
          </tbody>
        </table></div>
        <p>Your meter records consumption per window; the bill then shows a ToD surcharge/rebate
        line alongside the normal energy charge.</p>
      </section>
      <section class="seo-section">
        <h2>ToD vs kVAh billing — not the same thing</h2>
        <p>ToD changes the price by <em>time</em>. <strong>kVAh billing</strong> changes the
        quantity being measured: instead of kWh (real energy) you're billed on kVAh (apparent
        energy), which includes reactive power. A poor power factor makes kVAh exceed kWh, so the
        same appliances cost more. Many DISCOMs apply both to commercial/industrial connections —
        our <a href="/#calculator">calculator</a> supports both where a DISCOM uses them.</p>
      </section>
      <section class="seo-section">
        <h2>How to actually save under ToD</h2>
        <ul>
          <li><strong>Shift the shiftable:</strong> washing machine, dishwasher, water pumping,
          geyser pre-heating and EV charging into off-peak or solar hours (timers and smart plugs
          make this automatic).</li>
          <li><strong>Pre-cool before the peak:</strong> run the AC harder in the cheap solar window
          and ease it during 6–10 pm.</li>
          <li><strong>Pair with rooftop solar:</strong> daytime self-consumption already offsets the
          window where grid power is cheapest, so size the system for your evening needs — see our
          <a href="/solar/">solar savings estimator</a>.</li>
          <li><strong>Mind the batch loads:</strong> for shops and small industry, moving compressor,
          pumping or refrigeration-defrost cycles off the evening peak is usually the single biggest win.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'Does ToD billing apply to home (domestic) connections?',
        a: 'Increasingly, yes. ToD has long been mandatory for most commercial and industrial consumers; under India’s smart-metering framework it extends to domestic consumers once a smart meter is installed, with peak surcharges and solar-hour rebates defined in each state’s tariff order.' },
      { q: 'What are typical peak hours for electricity in India?',
        a: 'Evening peak is typically around 6 pm to 10 pm, and many states also define a morning peak. Solar hours (roughly 9 am to 4 pm) are increasingly treated as the cheapest window. Exact windows are set by each state’s regulator and printed in the tariff order.' },
      { q: 'What is the difference between kWh and kVAh billing?',
        a: 'kWh measures real energy consumed; kVAh measures apparent energy, which also reflects reactive power drawn by motors and poor-power-factor equipment. Under kVAh billing, a power factor below 1 inflates billable units — improving power factor (e.g. with capacitors) directly cuts the bill.' },
      { q: 'Can ToD billing reduce my bill?',
        a: 'Yes — if you shift flexible loads (EV charging, pumping, laundry, water heating) into off-peak or solar-rebate windows, the same total consumption costs less. Consumers who cannot shift any load away from evening hours may see a small increase instead.' },
    ],
    // (Hindi fields for this guide continue below)

    titleHi: 'टाइम-ऑफ़-डे (ToD) बिजली बिलिंग, आसान भाषा में',
    metaTitleHi: 'भारत में टाइम-ऑफ़-डे (ToD) बिजली बिलिंग, आसान भाषा में',
    descriptionHi: 'टाइम-ऑफ़-डे (ToD) बिजली बिलिंग क्या है, भारत में किन पर लागू होती है, स्मार्ट मीटर के साथ पीक और ऑफ़-पीक दरें कैसे काम करती हैं, kVAh बिलिंग का क्या मतलब है, और लोड खिसकाकर बिल घटाने के व्यावहारिक तरीके।',
    introHi: `टाइम-ऑफ़-डे (ToD) बिलिंग में बिजली की एक यूनिट का दाम इस पर निर्भर करता है कि आप उसे
      <strong>कब</strong> खर्च करते हैं: शाम के पीक घंटों में ज़्यादा, ऑफ़-पीक और सौर घंटों में कम (अक्सर छूट)।
      यह वाणिज्यिक व औद्योगिक उपभोक्ताओं पर लंबे समय से लागू है, और स्मार्ट मीटरों के साथ धीरे-धीरे पूरे भारत के
      घरेलू उपभोक्ताओं तक पहुँच रही है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>ToD क्यों है</h2>
        <p>जब सबको एक साथ बिजली चाहिए (शाम) तब आपूर्ति महँगी होती है, और जब सौर उत्पादन ग्रिड में भर
        जाता है (दोपहर) तब सस्ती। ToD वही लागत संकेत आप तक पहुँचाता है: लचीले लोड पीक से हटाइए तो आपकी
        और ग्रिड दोनों की बचत। राष्ट्रीय ढाँचे के तहत ToD टैरिफ अधिकांश वाणिज्यिक/औद्योगिक उपभोक्ताओं के लिए
        अनिवार्य है और स्मार्ट मीटर लगने के साथ घरेलू उपभोक्ताओं तक पहुँच रहा है।</p>
      </section>
      <section class="seo-section">
        <h2>दर संरचना कैसे काम करती है</h2>
        <p>आपके डिस्कॉम का टैरिफ आदेश दिन को खिड़कियों में बाँटता है, हर एक पर सामान्य ऊर्जा दर के ऊपर
        अधिभार या छूट लगती है। एक सामान्य संरचना (सटीक समय व प्रतिशत राज्य के अनुसार बदलते हैं — अपने
        डिस्कॉम का <a href="/hi/tariffs/states/">टैरिफ पेज</a> देखें):</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>खिड़की</th><th>सामान्य घंटे</th><th>सामान्य मूल्य</th></tr></thead>
          <tbody>
            <tr><td><strong>पीक</strong></td><td>~शाम 6 – रात 10 (और अक्सर एक सुबह का पीक)</td><td>ऊर्जा दर पर +10% से +20%</td></tr>
            <tr><td><strong>सामान्य</strong></td><td>सौर/पीक खिड़कियों के बाहर का दिन</td><td>मानक ऊर्जा दर</td></tr>
            <tr><td><strong>ऑफ़-पीक / सौर</strong></td><td>देर रात, और ~सुबह 9 – शाम 4 के सौर घंटे</td><td>−10% से −20% छूट</td></tr>
          </tbody>
        </table></div>
        <p>आपका मीटर हर खिड़की की खपत अलग दर्ज करता है; बिल में फिर सामान्य ऊर्जा शुल्क के साथ एक ToD
        अधिभार/छूट लाइन दिखती है।</p>
      </section>
      <section class="seo-section">
        <h2>ToD बनाम kVAh बिलिंग — एक ही चीज़ नहीं</h2>
        <p>ToD <em>समय</em> से दाम बदलता है। <strong>kVAh बिलिंग</strong> मापी जाने वाली मात्रा बदलती है:
        kWh (वास्तविक ऊर्जा) की जगह आपको kVAh (आभासी ऊर्जा) पर बिल किया जाता है, जिसमें रिएक्टिव पावर
        शामिल है। खराब पावर फैक्टर से kVAh, kWh से ज़्यादा हो जाता है, यानी वही उपकरण महँगे पड़ते हैं। कई
        डिस्कॉम वाणिज्यिक/औद्योगिक कनेक्शनों पर दोनों लागू करते हैं — जहाँ डिस्कॉम इन्हें इस्तेमाल करता है वहाँ
        हमारा <a href="/#calculator">कैलकुलेटर</a> दोनों सपोर्ट करता है।</p>
      </section>
      <section class="seo-section">
        <h2>ToD में असल बचत कैसे करें</h2>
        <ul>
          <li><strong>जो खिसक सकता है, खिसकाएँ:</strong> वॉशिंग मशीन, डिशवॉशर, पानी की पंपिंग, गीज़र
          प्री-हीटिंग और EV चार्जिंग को ऑफ़-पीक या सौर घंटों में (टाइमर और स्मार्ट प्लग इसे अपने-आप कर देते हैं)।</li>
          <li><strong>पीक से पहले प्री-कूल करें:</strong> सस्ती सौर खिड़की में AC ज़्यादा चलाएँ और शाम
          6–10 बजे हल्का रखें।</li>
          <li><strong>रूफटॉप सोलर के साथ जोड़ें:</strong> दिन की स्व-खपत उसी खिड़की की भरपाई करती है जहाँ
          ग्रिड बिजली सबसे सस्ती है, इसलिए सिस्टम शाम की ज़रूरतों के हिसाब से चुनें — देखें हमारा
          <a href="/solar/">सोलर बचत अनुमानक</a>।</li>
          <li><strong>बैच लोड का ध्यान रखें:</strong> दुकानों व छोटे उद्योगों के लिए कंप्रेसर, पंपिंग या
          रेफ्रिजरेशन-डीफ्रॉस्ट चक्रों को शाम के पीक से हटाना आम तौर पर सबसे बड़ी बचत है।</li>
        </ul>
      </section>`,
    faqsHi: [
      { q: 'क्या ToD बिलिंग घरेलू कनेक्शनों पर लागू होती है?',
        a: 'बढ़ते हुए, हाँ। ToD अधिकांश वाणिज्यिक व औद्योगिक उपभोक्ताओं के लिए लंबे समय से अनिवार्य है; भारत के स्मार्ट-मीटरिंग ढाँचे में स्मार्ट मीटर लगते ही यह घरेलू उपभोक्ताओं तक पहुँचती है — पीक अधिभार और सौर-घंटा छूट हर राज्य के टैरिफ आदेश में परिभाषित हैं।' },
      { q: 'भारत में बिजली के सामान्य पीक घंटे कौन-से हैं?',
        a: 'शाम का पीक आम तौर पर शाम 6 से रात 10 बजे के आसपास होता है, और कई राज्य सुबह का पीक भी तय करते हैं। सौर घंटे (लगभग सुबह 9 से शाम 4) तेज़ी से सबसे सस्ती खिड़की माने जा रहे हैं। सटीक समय हर राज्य का नियामक तय करता है और टैरिफ आदेश में छपा होता है।' },
      { q: 'kWh और kVAh बिलिंग में क्या अंतर है?',
        a: 'kWh वास्तविक ऊर्जा मापता है; kVAh आभासी ऊर्जा, जिसमें मोटरों व खराब-पावर-फैक्टर उपकरणों की रिएक्टिव पावर भी झलकती है। kVAh बिलिंग में 1 से कम पावर फैक्टर बिल योग्य यूनिटें बढ़ा देता है — पावर फैक्टर सुधारना (जैसे कैपेसिटर से) सीधे बिल घटाता है।' },
      { q: 'क्या ToD बिलिंग से मेरा बिल घट सकता है?',
        a: 'हाँ — लचीले लोड (EV चार्जिंग, पंपिंग, कपड़े धोना, पानी गर्म करना) ऑफ़-पीक या सौर-छूट खिड़कियों में खिसकाएँ तो वही कुल खपत सस्ती पड़ती है। जो उपभोक्ता शाम के घंटों से कोई लोड नहीं हटा सकते, उनका बिल थोड़ा बढ़ भी सकता है।' },
    ],

    titleMr: 'टाइम-ऑफ-डे (ToD) वीज बिलिंग, सोप्या भाषेत',
    metaTitleMr: 'भारतात टाइम-ऑफ-डे (ToD) वीज बिलिंग, सोप्या भाषेत',
    descriptionMr: 'टाइम-ऑफ-डे (ToD) वीज बिलिंग म्हणजे काय, भारतात कोणाला लागू होते, स्मार्ट मीटरसह पीक आणि ऑफ-पीक दर कसे काम करतात, kVAh बिलिंगचा अर्थ काय, आणि भार सरकवून बिल घटवण्याचे व्यावहारिक मार्ग.',
    introMr: `टाइम-ऑफ-डे (ToD) बिलिंगमध्ये विजेच्या एका युनिटची किंमत तुम्ही ती <strong>केव्हा</strong>
      वापरता यावर अवलंबून असते: संध्याकाळच्या पीक तासांत जास्त, ऑफ-पीक व सौर तासांत कमी (अनेकदा सूट). ती
      व्यावसायिक व औद्योगिक ग्राहकांवर बऱ्याच काळापासून लागू आहे, आणि स्मार्ट मीटरसह हळूहळू संपूर्ण भारतातील
      घरगुती ग्राहकांपर्यंत पोहोचत आहे.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>ToD का आहे</h2>
        <p>जेव्हा सर्वांना एकाच वेळी वीज हवी असते (संध्याकाळ) तेव्हा पुरवठा महाग असतो, आणि जेव्हा सौर
        उत्पादन ग्रिडमध्ये भरते (दुपार) तेव्हा स्वस्त. ToD तोच खर्च संकेत तुमच्यापर्यंत पोहोचवते: लवचिक भार
        पीकपासून हलवा तर तुमची आणि ग्रिड दोघांची बचत. राष्ट्रीय चौकटीनुसार ToD टॅरिफ बहुतेक
        व्यावसायिक/औद्योगिक ग्राहकांसाठी अनिवार्य आहे आणि स्मार्ट मीटर बसताच घरगुती ग्राहकांपर्यंत पोहोचत
        आहे.</p>
      </section>
      <section class="seo-section">
        <h2>दर रचना कशी काम करते</h2>
        <p>तुमच्या डिस्कॉमचा टॅरिफ आदेश दिवसाला खिडक्यांमध्ये विभागतो, प्रत्येकावर सामान्य ऊर्जा दराच्या वर
        अधिभार किंवा सूट लागते. एक सामान्य रचना (नेमक्या वेळा व टक्केवारी राज्यानुसार बदलतात — तुमच्या
        डिस्कॉमचे <a href="/mr/tariffs/states/">टॅरिफ पेज</a> पहा):</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>खिडकी</th><th>सामान्य तास</th><th>सामान्य किंमत</th></tr></thead>
          <tbody>
            <tr><td><strong>पीक</strong></td><td>~संध्या 6 – रात्री 10 (आणि अनेकदा एक सकाळचा पीक)</td><td>ऊर्जा दरावर +10% ते +20%</td></tr>
            <tr><td><strong>सामान्य</strong></td><td>सौर/पीक खिडक्यांबाहेरचा दिवस</td><td>मानक ऊर्जा दर</td></tr>
            <tr><td><strong>ऑफ-पीक / सौर</strong></td><td>रात्री उशिरा, आणि ~सकाळ 9 – संध्या 4 चे सौर तास</td><td>−10% ते −20% सूट</td></tr>
          </tbody>
        </table></div>
        <p>तुमचे मीटर प्रत्येक खिडकीचा वापर वेगळा नोंदवते; बिलात मग सामान्य ऊर्जा आकारासोबत एक ToD
        अधिभार/सूट ओळ दिसते.</p>
      </section>
      <section class="seo-section">
        <h2>ToD वि. kVAh बिलिंग — एकच गोष्ट नव्हे</h2>
        <p>ToD <em>वेळेनुसार</em> किंमत बदलते. <strong>kVAh बिलिंग</strong> मोजली जाणारी मात्रा बदलते:
        kWh (वास्तविक ऊर्जा) ऐवजी तुम्हाला kVAh (आभासी ऊर्जा) वर बिल केले जाते, ज्यात रिअॅक्टिव्ह पॉवर
        समाविष्ट असते. खराब पॉवर फॅक्टरमुळे kVAh, kWh पेक्षा जास्त होते, म्हणजे तीच उपकरणे महाग पडतात.
        अनेक डिस्कॉम व्यावसायिक/औद्योगिक जोडण्यांवर दोन्ही लावतात — जिथे डिस्कॉम ते वापरतो तिथे आमचा
        <a href="/#calculator">कॅल्क्युलेटर</a> दोन्ही सपोर्ट करतो.</p>
      </section>
      <section class="seo-section">
        <h2>ToD मध्ये खरी बचत कशी करावी</h2>
        <ul>
          <li><strong>जे सरकवता येते ते सरकवा:</strong> वॉशिंग मशीन, डिशवॉशर, पाण्याची पंपिंग, गिझर
          प्री-हीटिंग आणि EV चार्जिंग ऑफ-पीक किंवा सौर तासांत (टायमर व स्मार्ट प्लग हे आपोआप करतात).</li>
          <li><strong>पीकआधी प्री-कूल करा:</strong> स्वस्त सौर खिडकीत AC जास्त चालवा आणि संध्या 6–10
          दरम्यान हलका ठेवा.</li>
          <li><strong>रूफटॉप सोलरसह जोडा:</strong> दिवसाचा स्व-वापर त्याच खिडकीची भरपाई करतो जिथे ग्रिड
          वीज सर्वात स्वस्त आहे, म्हणून सिस्टम संध्याकाळच्या गरजांनुसार निवडा — पहा आमचा
          <a href="/solar/">सोलर बचत अंदाजक</a>.</li>
          <li><strong>बॅच भारांकडे लक्ष द्या:</strong> दुकाने व छोट्या उद्योगांसाठी कॉम्प्रेसर, पंपिंग
          किंवा रेफ्रिजरेशन-डीफ्रॉस्ट चक्रे संध्याकाळच्या पीकपासून हलवणे सहसा सर्वात मोठी बचत असते.</li>
        </ul>
      </section>`,
    faqsMr: [
      { q: 'ToD बिलिंग घरगुती जोडण्यांना लागू होते का?',
        a: 'वाढत्या प्रमाणात, होय. ToD बहुतेक व्यावसायिक व औद्योगिक ग्राहकांसाठी बऱ्याच काळापासून अनिवार्य आहे; भारताच्या स्मार्ट-मीटरिंग चौकटीत स्मार्ट मीटर बसताच ती घरगुती ग्राहकांपर्यंत पोहोचते — पीक अधिभार आणि सौर-तास सूट प्रत्येक राज्याच्या टॅरिफ आदेशात परिभाषित आहेत.' },
      { q: 'भारतात विजेचे सामान्य पीक तास कोणते आहेत?',
        a: 'संध्याकाळचा पीक सामान्यतः संध्या 6 ते रात्री 10 च्या आसपास असतो, आणि अनेक राज्ये सकाळचा पीकही ठरवतात. सौर तास (सुमारे सकाळ 9 ते संध्या 4) वेगाने सर्वात स्वस्त खिडकी मानले जात आहेत. नेमक्या वेळा प्रत्येक राज्याचा नियामक ठरवतो आणि टॅरिफ आदेशात छापलेल्या असतात.' },
      { q: 'kWh आणि kVAh बिलिंगमध्ये काय फरक आहे?',
        a: 'kWh वास्तविक ऊर्जा मोजते; kVAh आभासी ऊर्जा, ज्यात मोटर व खराब-पॉवर-फॅक्टर उपकरणांची रिअॅक्टिव्ह पॉवरही दिसते. kVAh बिलिंगमध्ये 1 पेक्षा कमी पॉवर फॅक्टर बिलयोग्य युनिटे वाढवतो — पॉवर फॅक्टर सुधारणे (उदा. कॅपॅसिटरने) थेट बिल घटवते.' },
      { q: 'ToD बिलिंगमुळे माझे बिल घटू शकते का?',
        a: 'होय — लवचिक भार (EV चार्जिंग, पंपिंग, कपडे धुणे, पाणी गरम करणे) ऑफ-पीक किंवा सौर-सूट खिडक्यांत सरकवले तर तोच एकूण वापर स्वस्त पडतो. जे ग्राहक संध्याकाळच्या तासांतून कोणताही भार हलवू शकत नाहीत, त्यांचे बिल किंचित वाढूही शकते.' },
    ],
  },

  {
    slug: 'how-fppa-fuel-surcharge-is-calculated',
    published: "2025-09-08",
    title: 'How FPPA (Fuel Surcharge) Is Calculated on Your Electricity Bill',
    metaTitle: 'FPPA / Fuel Surcharge on Electricity Bills — How It Is Calculated',
    description: 'What the FPPA / FPPCA / FPPAS / PPAC line on an Indian electricity bill is, the two ways DISCOMs calculate it (per-unit and percentage), why it changes every month, why it can be negative, and how to verify the amount yourself.',
    minutes: 6,
    intro: `FPPA (Fuel Surcharge) is a line on your electricity bill that changes every month. It covers the changing costs of coal and gas used to generate your electricity. Sometimes it's an extra charge, and sometimes you actually get a discount! It might also be called FPPCA, FAC, or PPAC depending on where you live.`,
    sections: `
      <section class="seo-section">
        <h2>1. Why is this on my bill?</h2>
        <p>Think of the fuel surcharge airlines add to a ticket when jet fuel gets costly — FPPA is
        the same idea for electricity. Your main electricity rates are fixed once a year, but the
        cost of the coal and gas used to make your power changes every month. FPPA is the small
        monthly adjustment that covers this gap — up when fuel gets costlier, and <strong>down (a
        discount!) when it gets cheaper</strong>.</p>
      </section>

      <section class="seo-section">
        <h2>2. Where to find it on your bill</h2>
        <p>Look in the charges table, just below the energy and fixed charges. The name varies by
        state — <strong>FPPA, FPPCA, FPPAS, FAC or PPAC</strong> — but it is always the same thing:</p>
        <figure class="guide-fig">
          <div class="gbill" role="img" aria-label="Sample electricity bill with the Fuel Surcharge (FPPA) line highlighted">
            <div class="gbill-head">ELECTRICITY BILL <span>450 units · 5 kW</span></div>
            <div class="gbill-row"><span>Energy Charge <small>450 units × ₹6.50</small></span><b>₹2,925.00</b></div>
            <div class="gbill-row"><span>Fixed Charge <small>5 kW × ₹120</small></span><b>₹600.00</b></div>
            <div class="gbill-row is-hl"><span>Fuel Surcharge (FPPA) <small>5% of ₹3,525</small></span><span class="gbill-tag">THIS LINE</span><b>₹176.25</b></div>
            <div class="gbill-row"><span>Electricity Duty <small>5% of ₹3,701.25</small></span><b>₹185.06</b></div>
            <div class="gbill-total"><span>Total Bill</span><span>₹3,886.31</span></div>
          </div>
          <figcaption>A sample bill. Notice the order: FPPA is added first, and electricity duty is
          then charged on the total <em>including</em> FPPA.</figcaption>
        </figure>
      </section>

      <section class="seo-section">
        <h2>3. How it is calculated — two ways</h2>
        <p>Depending on your state, your electricity company uses one of two methods:</p>
        <div class="method-cards">
          <div class="method-card">
            <h3><span class="m-badge">1</span>Per unit</h3>
            <p>A few paise added (or subtracted) for <strong>every unit you used</strong>. Common in
            Maharashtra, MP, Rajasthan and most states.</p>
            <div class="method-example"><small>Example</small>200 units × ₹0.50 = <strong>₹100</strong> extra that month</div>
          </div>
          <div class="method-card">
            <h3><span class="m-badge">2</span>Percentage</h3>
            <p>A small percentage added <strong>on top of your main charges</strong>. Used in UP
            (FPPA) and Delhi (PPAC).</p>
            <div class="method-example"><small>Example</small>₹3,525 charges × 5% = <strong>₹176.25</strong> extra that month</div>
          </div>
        </div>
      </section>

      <section class="seo-section">
        <h2>4. Three things worth knowing</h2>
        <ul>
          <li><strong>It changes every month or quarter.</strong> So don't compare this line with
          last month's — compare it with your electricity company's officially announced rate.</li>
          <li><strong>It can be negative.</strong> If power was cheap to produce, the line becomes a
          credit and your bill goes <em>down</em>. A minus sign here is good news, not an error.</li>
          <li><strong>Tax is charged on it too.</strong> As the sample bill above shows, electricity
          duty is calculated <em>after</em> FPPA is added — so a higher FPPA also nudges your duty up
          slightly.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>5. Check it yourself in 3 steps</h2>
        <ol>
          <li>Find the FPPA / FPPCA / FAC / PPAC line on your bill (see the sample above).</li>
          <li>Look up this month's official rate on your electricity company's website.</li>
          <li>Enter your units in our <a href="/#calculator">bill calculator</a> — it applies the
          right method for your state automatically and shows whether your total matches.</li>
        </ol>
        <p class="seo-note">Something doesn't add up? Upload your bill to our free
        <a href="/bill-review/">expert Bill Review</a> and we'll check the FPPA line for you.</p>
      </section>`,
    faqs: [
      { q: 'What is FPPA on an electricity bill?',
        a: 'FPPA (Fuel and Power Purchase Adjustment) is a surcharge that passes the difference between the DISCOM’s actual power-purchase cost and the cost assumed in the tariff order through to consumers. It appears as FPPA, FPPCA, FPPAS, FAC or PPAC depending on the state, and is revised monthly or quarterly.' },
      { q: 'Can FPPA be negative?',
        a: 'Yes. When the DISCOM buys power cheaper than the tariff order assumed — or when an earlier over-recovery is trued up — the adjustment becomes a credit and reduces your bill for that month.' },
      { q: 'Is FPPA charged before or after electricity duty?',
        a: 'Before. FPPA is added to the energy and fixed charges first, and electricity duty is then calculated as a percentage of that larger base — so a higher FPPA also slightly raises your duty.' },
      { q: 'Why is my FPPA different from my neighbour’s in another state?',
        a: 'Each state regulator notifies its own mechanism (per-unit or percentage), its own rates and its own revision cycle, and in multi-DISCOM states the rate can differ by DISCOM too — Delhi’s PPAC, for example, is separately approved for BRPL, BYPL and Tata Power-DDL.' },
    ],

    titleHi: 'आपके बिजली बिल पर FPPA (ईंधन अधिभार) कैसे निकाला जाता है',
    metaTitleHi: 'बिजली बिल पर FPPA / ईंधन अधिभार — यह कैसे गणना होता है',
    descriptionHi: 'भारतीय बिजली बिल पर FPPA / FPPCA / FPPAS / PPAC लाइन क्या है, डिस्कॉम इसे किन दो तरीकों (प्रति-यूनिट और प्रतिशत) से निकालते हैं, यह हर महीने क्यों बदलता है, ऋणात्मक क्यों हो सकता है, और राशि खुद कैसे जाँचें।',
    introHi: `FPPA (ईंधन अधिभार) आपके बिजली बिल की एक ऐसी लाइन है जो हर महीने बदलती है। बिजली बनाने में इस्तेमाल होने वाले कोयले और गैस की कीमतों में होने वाले बदलाव की भरपाई इसी से होती है। कभी-कभी यह एक अतिरिक्त शुल्क होता है, और कभी-कभी आपको इसमें छूट (डिस्काउंट) भी मिलती है! आपके राज्य के आधार पर इसे FPPCA, FAC या PPAC भी कहा जा सकता है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. यह मेरे बिल में क्यों है?</h2>
        <p>जैसे हवाई जहाज़ का ईंधन महँगा होने पर एयरलाइन टिकट में फ्यूल सरचार्ज जोड़ती है — FPPA
        बिजली के लिए वही चीज़ है। आपकी मुख्य बिजली दरें साल में एक बार तय होती हैं, पर आपकी बिजली
        बनाने में लगने वाले कोयले और गैस की कीमत हर महीने बदलती है। FPPA वही छोटा मासिक समायोजन है —
        ईंधन महँगा हो तो ऊपर, और <strong>सस्ता हो तो नीचे (यानी छूट!)</strong>।</p>
      </section>

      <section class="seo-section">
        <h2>2. बिल पर यह कहाँ मिलेगा</h2>
        <p>शुल्क तालिका में, ऊर्जा और फिक्स्ड चार्ज के ठीक नीचे देखें। नाम राज्य के अनुसार बदलता है —
        <strong>FPPA, FPPCA, FPPAS, FAC या PPAC</strong> — पर चीज़ हमेशा यही है:</p>
        <figure class="guide-fig">
          <div class="gbill" role="img" aria-label="नमूना बिजली बिल जिसमें ईंधन अधिभार (FPPA) लाइन हाइलाइट की गई है">
            <div class="gbill-head">बिजली बिल <span>450 यूनिट · 5 kW</span></div>
            <div class="gbill-row"><span>ऊर्जा शुल्क <small>450 यूनिट × ₹6.50</small></span><b>₹2,925.00</b></div>
            <div class="gbill-row"><span>फिक्स्ड चार्ज <small>5 kW × ₹120</small></span><b>₹600.00</b></div>
            <div class="gbill-row is-hl"><span>ईंधन अधिभार (FPPA) <small>₹3,525 का 5%</small></span><span class="gbill-tag">यही लाइन</span><b>₹176.25</b></div>
            <div class="gbill-row"><span>बिजली शुल्क (ED) <small>₹3,701.25 का 5%</small></span><b>₹185.06</b></div>
            <div class="gbill-total"><span>कुल बिल</span><span>₹3,886.31</span></div>
          </div>
          <figcaption>एक नमूना बिल। क्रम पर ध्यान दें: पहले FPPA जुड़ता है, और बिजली शुल्क फिर FPPA
          <em>समेत</em> कुल पर लगता है।</figcaption>
        </figure>
      </section>

      <section class="seo-section">
        <h2>3. इसकी गणना कैसे होती है — दो तरीके</h2>
        <p>आपके राज्य के आधार पर, बिजली कंपनी दो में से एक तरीका इस्तेमाल करती है:</p>
        <div class="method-cards">
          <div class="method-card">
            <h3><span class="m-badge">1</span>प्रति यूनिट</h3>
            <p>आपकी <strong>हर इस्तेमाल की गई यूनिट</strong> पर कुछ पैसे जुड़ते (या घटते) हैं।
            महाराष्ट्र, एमपी, राजस्थान समेत ज़्यादातर राज्यों में यही तरीका है।</p>
            <div class="method-example"><small>उदाहरण</small>200 यूनिट × ₹0.50 = उस महीने <strong>₹100</strong> अतिरिक्त</div>
          </div>
          <div class="method-card">
            <h3><span class="m-badge">2</span>प्रतिशत</h3>
            <p>आपके <strong>मुख्य शुल्कों के ऊपर</strong> एक छोटा प्रतिशत जुड़ता है। यूपी (FPPA)
            और दिल्ली (PPAC) में यही तरीका है।</p>
            <div class="method-example"><small>उदाहरण</small>₹3,525 शुल्क × 5% = उस महीने <strong>₹176.25</strong> अतिरिक्त</div>
          </div>
        </div>
      </section>

      <section class="seo-section">
        <h2>4. तीन बातें जो जाननी चाहिए</h2>
        <ul>
          <li><strong>यह हर महीने या तिमाही बदलता है।</strong> इसलिए इस लाइन की तुलना पिछले महीने से
          नहीं — अपनी बिजली कंपनी की आधिकारिक घोषित दर से करें।</li>
          <li><strong>यह ऋणात्मक (माइनस) भी हो सकता है।</strong> बिजली सस्ती बनी हो तो यह लाइन क्रेडिट
          बन जाती है और आपका बिल <em>घटता</em> है। यहाँ माइनस का निशान अच्छी खबर है, गलती नहीं।</li>
          <li><strong>इस पर टैक्स भी लगता है।</strong> जैसा ऊपर नमूना बिल दिखाता है, बिजली शुल्क FPPA
          जुड़ने के <em>बाद</em> निकलता है — इसलिए ज़्यादा FPPA आपके शुल्क को भी थोड़ा बढ़ा देता है।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>5. तीन कदमों में खुद जाँचें</h2>
        <ol>
          <li>अपने बिल पर FPPA / FPPCA / FAC / PPAC लाइन खोजें (ऊपर का नमूना देखें)।</li>
          <li>इस महीने की आधिकारिक दर अपनी बिजली कंपनी की वेबसाइट पर देखें।</li>
          <li>अपनी यूनिटें हमारे <a href="/#calculator">बिल कैलकुलेटर</a> में डालें — यह आपके राज्य का
          सही तरीका अपने आप लागू करता है और दिखाता है कि आपका कुल मिलता है या नहीं।</li>
        </ol>
        <p class="seo-note">हिसाब नहीं मिल रहा? अपना बिल हमारी मुफ़्त
        <a href="/bill-review/">विशेषज्ञ बिल समीक्षा</a> में अपलोड करें — हम FPPA लाइन आपके लिए जाँच देंगे।</p>
      </section>`,
    faqsHi: [
      { q: 'बिजली बिल पर FPPA क्या है?',
        a: 'FPPA (Fuel and Power Purchase Adjustment) एक अधिभार है जो डिस्कॉम की वास्तविक बिजली-खरीद लागत और टैरिफ आदेश में मानी गई लागत के अंतर को उपभोक्ताओं तक पहुँचाता है। राज्य के अनुसार यह FPPA, FPPCA, FPPAS, FAC या PPAC के रूप में दिखता है, और मासिक या त्रैमासिक संशोधित होता है।' },
      { q: 'क्या FPPA ऋणात्मक हो सकता है?',
        a: 'हाँ। जब डिस्कॉम टैरिफ आदेश की मानी गई लागत से सस्ती बिजली खरीदता है — या पहले की अधिक-वसूली का ट्रू-अप होता है — तो यह समायोजन क्रेडिट बन जाता है और उस महीने आपका बिल घटा देता है।' },
      { q: 'FPPA बिजली शुल्क से पहले लगता है या बाद में?',
        a: 'पहले। FPPA पहले ऊर्जा और फिक्स्ड शुल्क में जुड़ता है, और बिजली शुल्क फिर उस बड़े आधार के प्रतिशत के रूप में निकाला जाता है — इसलिए ज़्यादा FPPA आपके शुल्क को भी थोड़ा बढ़ा देता है।' },
      { q: 'दूसरे राज्य में मेरे पड़ोसी से मेरा FPPA अलग क्यों है?',
        a: 'हर राज्य नियामक अपना तरीका (प्रति-यूनिट या प्रतिशत), अपनी दरें और अपना संशोधन चक्र अधिसूचित करता है, और बहु-डिस्कॉम राज्यों में दर डिस्कॉम के अनुसार भी अलग हो सकती है — जैसे दिल्ली का PPAC BRPL, BYPL और Tata Power-DDL के लिए अलग-अलग स्वीकृत होता है।' },
    ],

    titleMr: 'तुमच्या वीज बिलावर FPPA (इंधन अधिभार) कसा मोजला जातो',
    metaTitleMr: 'वीज बिलावर FPPA / इंधन अधिभार — तो कसा मोजला जातो',
    descriptionMr: 'भारतीय वीज बिलावरील FPPA / FPPCA / FPPAS / PPAC ओळ म्हणजे काय, डिस्कॉम ती कोणत्या दोन पद्धतींनी (प्रति-युनिट आणि टक्केवारी) मोजतात, ती दर महिन्याला का बदलते, ऋण का असू शकते, आणि रक्कम स्वतः कशी तपासावी.',
    introMr: `FPPA (इंधन अधिभार) ही तुमच्या वीज बिलावरील अशी एक ओळ आहे जी दर महिन्याला बदलते. वीज तयार करण्यासाठी वापरल्या जाणाऱ्या कोळसा आणि गॅसच्या बदलत्या किमतींची भरपाई याद्वारे होते. कधी हा अतिरिक्त आकार असतो, तर कधी तुम्हाला त्यात सूट (डिस्काउंट) देखील मिळते! तुमच्या राज्यानुसार याला FPPCA, FAC किंवा PPAC असेही म्हणतात.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. हे माझ्या बिलात का आहे?</h2>
        <p>विमानाचे इंधन महाग झाल्यावर एअरलाइन तिकिटावर जसा फ्युएल सरचार्ज लावते — FPPA विजेसाठी तीच
        गोष्ट आहे. तुमचे मुख्य वीज दर वर्षातून एकदा ठरतात, पण तुमची वीज तयार करण्यासाठी लागणाऱ्या कोळसा
        व गॅसची किंमत दर महिन्याला बदलते. FPPA हेच ते छोटे मासिक समायोजन आहे — इंधन महाग झाल्यास वर,
        आणि <strong>स्वस्त झाल्यास खाली (म्हणजे सूट!)</strong>.</p>
      </section>

      <section class="seo-section">
        <h2>2. बिलावर हे कुठे मिळेल</h2>
        <p>आकार तक्त्यात, ऊर्जा व स्थिर आकाराच्या अगदी खाली पहा. नाव राज्यानुसार बदलते —
        <strong>FPPA, FPPCA, FPPAS, FAC किंवा PPAC</strong> — पण गोष्ट नेहमी हीच असते:</p>
        <figure class="guide-fig">
          <div class="gbill" role="img" aria-label="नमुना वीज बिल ज्यात इंधन अधिभार (FPPA) ओळ ठळक केली आहे">
            <div class="gbill-head">वीज बिल <span>450 युनिट · 5 kW</span></div>
            <div class="gbill-row"><span>ऊर्जा आकार <small>450 युनिट × ₹6.50</small></span><b>₹2,925.00</b></div>
            <div class="gbill-row"><span>स्थिर आकार <small>5 kW × ₹120</small></span><b>₹600.00</b></div>
            <div class="gbill-row is-hl"><span>इंधन अधिभार (FPPA) <small>₹3,525 चे 5%</small></span><span class="gbill-tag">हीच ओळ</span><b>₹176.25</b></div>
            <div class="gbill-row"><span>वीज शुल्क (ED) <small>₹3,701.25 चे 5%</small></span><b>₹185.06</b></div>
            <div class="gbill-total"><span>एकूण बिल</span><span>₹3,886.31</span></div>
          </div>
          <figcaption>एक नमुना बिल. क्रमाकडे लक्ष द्या: आधी FPPA जोडला जातो, आणि वीज शुल्क नंतर FPPA
          <em>सह</em> एकूण रकमेवर लागते.</figcaption>
        </figure>
      </section>

      <section class="seo-section">
        <h2>3. याची गणना कशी होते — दोन पद्धती</h2>
        <p>तुमच्या राज्यानुसार, वीज कंपनी दोनपैकी एक पद्धत वापरते:</p>
        <div class="method-cards">
          <div class="method-card">
            <h3><span class="m-badge">1</span>प्रति युनिट</h3>
            <p>तुमच्या <strong>प्रत्येक वापरलेल्या युनिटवर</strong> काही पैसे जोडले (किंवा वजा) होतात.
            महाराष्ट्र, एमपी, राजस्थानसह बहुतेक राज्यांत हीच पद्धत आहे.</p>
            <div class="method-example"><small>उदाहरण</small>200 युनिट × ₹0.50 = त्या महिन्यात <strong>₹100</strong> अतिरिक्त</div>
          </div>
          <div class="method-card">
            <h3><span class="m-badge">2</span>टक्केवारी</h3>
            <p>तुमच्या <strong>मुख्य आकारांवर</strong> एक छोटी टक्केवारी जोडली जाते. यूपी (FPPA) व
            दिल्ली (PPAC) मध्ये हीच पद्धत आहे.</p>
            <div class="method-example"><small>उदाहरण</small>₹3,525 आकार × 5% = त्या महिन्यात <strong>₹176.25</strong> अतिरिक्त</div>
          </div>
        </div>
      </section>

      <section class="seo-section">
        <h2>4. तीन गोष्टी ज्या जाणून घ्याव्यात</h2>
        <ul>
          <li><strong>ती दर महिन्याला किंवा तिमाहीला बदलते.</strong> म्हणून या ओळीची तुलना मागील
          महिन्याशी नको — तुमच्या वीज कंपनीच्या अधिकृत जाहीर दराशी करा.</li>
          <li><strong>ती ऋण (उणे) देखील असू शकते.</strong> वीज स्वस्त तयार झाली असेल तर ही ओळ क्रेडिट
          बनते आणि तुमचे बिल <em>कमी</em> होते. इथे उणे चिन्ह ही चांगली बातमी आहे, चूक नाही.</li>
          <li><strong>त्यावर करही लागतो.</strong> वरील नमुना बिल दाखवते तसे, वीज शुल्क FPPA
          जोडल्या<em>नंतर</em> मोजले जाते — म्हणून जास्त FPPA तुमचे शुल्कही थोडे वाढवते.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>5. तीन पायऱ्यांत स्वतः तपासा</h2>
        <ol>
          <li>तुमच्या बिलावर FPPA / FPPCA / FAC / PPAC ओळ शोधा (वरील नमुना पहा).</li>
          <li>या महिन्याचा अधिकृत दर तुमच्या वीज कंपनीच्या संकेतस्थळावर पहा.</li>
          <li>तुमची युनिटे आमच्या <a href="/#calculator">बिल कॅल्क्युलेटर</a> मध्ये टाका — ते तुमच्या
          राज्याची योग्य पद्धत आपोआप लागू करते आणि तुमची एकूण रक्कम जुळते का ते दाखवते.</li>
        </ol>
        <p class="seo-note">हिशेब जुळत नाही? तुमचे बिल आमच्या मोफत
        <a href="/bill-review/">तज्ज्ञ बिल समीक्षा</a> मध्ये अपलोड करा — आम्ही FPPA ओळ तुमच्यासाठी तपासू.</p>
      </section>`,
    faqsMr: [
      { q: 'वीज बिलावर FPPA म्हणजे काय?',
        a: 'FPPA (Fuel and Power Purchase Adjustment) हा एक अधिभार आहे जो डिस्कॉमच्या प्रत्यक्ष वीज-खरेदी खर्च आणि टॅरिफ आदेशात गृहीत धरलेल्या खर्चातील फरक ग्राहकांपर्यंत पोहोचवतो. राज्यानुसार तो FPPA, FPPCA, FPPAS, FAC किंवा PPAC असा दिसतो, आणि मासिक किंवा त्रैमासिक सुधारला जातो.' },
      { q: 'FPPA ऋण असू शकतो का?',
        a: 'होय. जेव्हा डिस्कॉम टॅरिफ आदेशात गृहीत धरल्यापेक्षा स्वस्त वीज खरेदी करतो — किंवा आधीच्या जास्त-वसुलीचे ट्रू-अप होते — तेव्हा हे समायोजन क्रेडिट बनते आणि त्या महिन्यात तुमचे बिल कमी करते.' },
      { q: 'FPPA वीज शुल्कापूर्वी लागतो की नंतर?',
        a: 'आधी. FPPA प्रथम ऊर्जा व स्थिर आकारात जोडला जातो, आणि वीज शुल्क नंतर त्या मोठ्या आधाराच्या टक्केवारीने मोजले जाते — म्हणून जास्त FPPA तुमचे शुल्कही थोडे वाढवते.' },
      { q: 'दुसऱ्या राज्यातील माझ्या शेजाऱ्यापेक्षा माझा FPPA वेगळा का आहे?',
        a: 'प्रत्येक राज्य नियामक स्वतःची पद्धत (प्रति-युनिट किंवा टक्केवारी), स्वतःचे दर आणि स्वतःचे सुधारणा चक्र अधिसूचित करतो, आणि बहु-डिस्कॉम राज्यांत दर डिस्कॉमनुसारही वेगळा असू शकतो — उदा. दिल्लीचा PPAC BRPL, BYPL व Tata Power-DDL साठी वेगळा मंजूर होतो.' },
    ],
  },

  {
    slug: 'reduce-fixed-charges-sanctioned-load',
    published: "2025-09-20",
    title: 'How to Reduce Fixed Charges by Right-Sizing Your Sanctioned Load',
    metaTitle: 'Reduce Electricity Fixed Charges: Right-Size Your Sanctioned Load',
    description: 'Fixed charges are billed per kW of sanctioned load even at zero consumption. How to check if your load is over-sanctioned, how much a reduction saves, the application process, and the excess-demand penalty risk of going too low.',
    minutes: 5,
    intro: `The fixed charge on your bill is priced per kW (or kVA) of <strong>sanctioned load</strong>
      — the capacity you contracted, not the power you actually use. If your load was sanctioned
      years ago for equipment you no longer run, you are paying every month for headroom you never
      touch. Right-sizing it is one of the few bill reductions that needs no change in behaviour.`,
    sections: `
      <section class="seo-section">
        <h2>1. Check what you're sanctioned vs what you actually draw</h2>
        <p>Your bill prints both numbers: <strong>sanctioned load</strong> (contracted kW) and, on
        most modern bills, <strong>recorded / maximum demand</strong> (the highest kW you actually
        drew). If recorded demand sits well below sanctioned load month after month — say 2 kW
        recorded against 5 kW sanctioned — you are a candidate for a reduction.</p>
      </section>
      <section class="seo-section">
        <h2>2. What a reduction is worth</h2>
        <p>Fixed-charge schedules are either flat ₹/kW/month or tiered by load band, so the saving is
        simply (kW reduced) × (rate) — or a drop to a cheaper band. Some examples of how the
        structures differ (find your DISCOM's exact schedule on its
        <a href="/tariffs/states/">tariff page</a>):</p>
        <ul>
          <li><strong>Per-kW schedules</strong> (e.g. UPPCL domestic): every kW removed saves the
          full per-kW rate, every month.</li>
          <li><strong>Banded schedules</strong> (e.g. <a href="/tariffs/delhi/brpl/">Delhi LT-I</a>,
          <a href="/tariffs/maharashtra/msedcl/">MSEDCL LT-1</a>): the saving comes from crossing
          into a lower band — moving from the "2–5 kW" band to "up to 2 kW" can halve the fixed
          charge in one step.</li>
        </ul>
        <p>Estimate it precisely: run the <a href="/#calculator">calculator</a> twice with your
        current and proposed loads and compare the fixed-charge line.</p>
      </section>
      <section class="seo-section">
        <h2>3. Don't go too low — the excess-demand penalty</h2>
        <p>This is the trade-off that makes "sanction the minimum" a bad idea. If your recorded
        demand exceeds the sanctioned load, most DISCOMs bill the excess at a <strong>penal
        rate</strong> — commonly 1.5× to 2× the normal fixed charge on the excess kW, and repeated
        breaches can trigger a forced load regularisation. Size for your realistic peak: add up the
        appliances that genuinely run together on a summer evening (AC + fridge + water heater +
        lights), not the sum of everything you own.</p>
      </section>
      <section class="seo-section">
        <h2>4. How to apply</h2>
        <ol>
          <li>Apply for "load reduction" on your DISCOM's portal or at the sub-division office —
          the same channel as a new-connection application in most states (see our
          <a href="/new-connection/">new connection hub</a> for portal links).</li>
          <li>Expect a small processing fee and, in some states, a fresh test report or inspection.</li>
          <li>The change takes effect from the next billing cycle; agreements/security deposits are
          adjusted to the new load.</li>
        </ol>
        <p>Also worth checking while you're at it: households that <em>added</em> ACs or an EV
        charger since sanction may need to go the other way — a small load <em>increase</em> costs
        less than recurring excess-demand penalties.</p>
      </section>`,
    faqs: [
      { q: 'What is sanctioned load on an electricity bill?',
        a: 'Sanctioned load is the maximum demand (in kW or kVA) your DISCOM has contracted to supply you, declared when the connection was made. Fixed charges are billed on this value every month regardless of consumption, and drawing more than it can attract an excess-demand penalty.' },
      { q: 'How much can I save by reducing my sanctioned load?',
        a: 'On per-kW schedules the saving is the per-kW fixed charge times the kW removed, every month. On banded schedules the saving comes from dropping into a lower band. Run your DISCOM’s numbers in a bill calculator with both loads to see the exact difference.' },
      { q: 'What happens if my usage exceeds my sanctioned load?',
        a: 'The excess recorded demand is typically billed at a penal fixed-charge rate (often 1.5–2× normal) for that month, and persistent breaches can lead the DISCOM to regularise your load upward compulsorily. That is why you should size to your realistic simultaneous peak, not the theoretical minimum.' },
      { q: 'How do I apply to reduce my sanctioned load?',
        a: 'Submit a load-reduction request on your DISCOM’s consumer portal or at the local sub-division office, pay the small processing fee, and complete any inspection required. The reduced load — and the lower fixed charge — applies from the next billing cycle.' },
    ],

    titleHi: 'स्वीकृत भार सही करके फिक्स्ड चार्ज कैसे घटाएँ',
    metaTitleHi: 'बिजली फिक्स्ड चार्ज घटाएँ: अपना स्वीकृत भार सही आकार दें',
    descriptionHi: 'फिक्स्ड चार्ज शून्य खपत पर भी प्रति kW स्वीकृत भार पर लगता है। कैसे जाँचें कि आपका भार ज़रूरत से ज़्यादा स्वीकृत है, कमी से कितनी बचत होती है, आवेदन प्रक्रिया, और बहुत कम रखने पर अतिरिक्त-मांग जुर्माने का जोखिम।',
    introHi: `आपके बिल पर फिक्स्ड चार्ज प्रति kW (या kVA) <strong>स्वीकृत भार</strong> पर लगता है — यानी वह
      क्षमता जो आपने अनुबंधित की, न कि जो बिजली आप वास्तव में इस्तेमाल करते हैं। अगर आपका भार सालों पहले ऐसे
      उपकरणों के लिए स्वीकृत हुआ था जो अब आप नहीं चलाते, तो आप हर महीने उस हेडरूम का भुगतान कर रहे हैं जिसे
      आप कभी छूते ही नहीं। इसे सही आकार देना उन गिनी-चुनी बिल कटौतियों में से एक है जिनके लिए व्यवहार बदलने
      की ज़रूरत नहीं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. आप जितना स्वीकृत हैं बनाम जितना वास्तव में खींचते हैं, जाँचें</h2>
        <p>आपका बिल दोनों संख्याएँ छापता है: <strong>स्वीकृत भार</strong> (अनुबंधित kW) और, अधिकांश आधुनिक
        बिलों पर, <strong>दर्ज / अधिकतम मांग</strong> (सबसे ऊँचा kW जो आपने वास्तव में खींचा)। अगर दर्ज मांग
        महीने-दर-महीने स्वीकृत भार से काफ़ी नीचे रहती है — जैसे 5 kW स्वीकृत के मुक़ाबले 2 kW दर्ज — तो आप
        कमी के उम्मीदवार हैं।</p>
      </section>
      <section class="seo-section">
        <h2>2. कमी से कितनी बचत होती है</h2>
        <p>फिक्स्ड-चार्ज अनुसूचियाँ या तो स्थिर ₹/kW/माह होती हैं या भार बैंड के अनुसार श्रेणीबद्ध, इसलिए बचत
        बस (घटाई गई kW) × (दर) है — या किसी सस्ते बैंड में गिरना। संरचनाएँ कैसे अलग होती हैं, कुछ उदाहरण
        (अपने डिस्कॉम की सटीक अनुसूची उसके <a href="/hi/tariffs/states/">टैरिफ पेज</a> पर देखें):</p>
        <ul>
          <li><strong>प्रति-kW अनुसूचियाँ</strong> (जैसे UPPCL घरेलू): हटाई गई हर kW हर महीने पूरी प्रति-kW
          दर बचाती है।</li>
          <li><strong>बैंडेड अनुसूचियाँ</strong> (जैसे <a href="/hi/tariffs/delhi/brpl/">दिल्ली LT-I</a>,
          <a href="/hi/tariffs/maharashtra/msedcl/">MSEDCL LT-1</a>): बचत किसी नीचे बैंड में जाने से आती
          है — "2–5 kW" बैंड से "2 kW तक" में जाना एक ही कदम में फिक्स्ड चार्ज आधा कर सकता है।</li>
        </ul>
        <p>इसे ठीक-ठीक आँकें: <a href="/#calculator">कैलकुलेटर</a> को अपने मौजूदा और प्रस्तावित भार के साथ
        दो बार चलाएँ और फिक्स्ड-चार्ज लाइन की तुलना करें।</p>
      </section>
      <section class="seo-section">
        <h2>3. बहुत कम न करें — अतिरिक्त-मांग जुर्माना</h2>
        <p>यही वह समझौता है जो "न्यूनतम स्वीकृत कराओ" को बुरा विचार बनाता है। अगर आपकी दर्ज मांग स्वीकृत भार
        से अधिक हो जाती है, तो अधिकांश डिस्कॉम अतिरिक्त को <strong>दंडात्मक दर</strong> पर बिल करते हैं —
        आम तौर पर अतिरिक्त kW पर सामान्य फिक्स्ड चार्ज का 1.5× से 2×, और बार-बार उल्लंघन जबरन भार
        नियमितीकरण ला सकते हैं। अपनी वास्तविक चरम के हिसाब से आकार दें: गर्मी की शाम एक साथ सचमुच चलने वाले
        उपकरण जोड़ें (AC + फ्रिज + गीज़र + लाइटें), न कि अपने पास मौजूद हर चीज़ का योग।</p>
      </section>
      <section class="seo-section">
        <h2>4. आवेदन कैसे करें</h2>
        <ol>
          <li>अपने डिस्कॉम के पोर्टल पर या उपखंड कार्यालय में "भार कमी" के लिए आवेदन करें — अधिकांश राज्यों
          में यह वही चैनल है जो नए-कनेक्शन आवेदन का है (पोर्टल लिंक के लिए हमारा
          <a href="/new-connection/">नया कनेक्शन हब</a> देखें)।</li>
          <li>एक छोटा प्रोसेसिंग शुल्क और, कुछ राज्यों में, नई जाँच रिपोर्ट या निरीक्षण की अपेक्षा करें।</li>
          <li>बदलाव अगले बिलिंग चक्र से लागू होता है; समझौते/सुरक्षा जमा नए भार के अनुसार समायोजित होते हैं।</li>
        </ol>
        <p>साथ में यह भी जाँचने लायक: जिन घरों ने स्वीकृति के बाद AC या EV चार्जर <em>जोड़े</em> हैं, उन्हें
        उलटी दिशा में जाना पड़ सकता है — एक छोटी भार <em>वृद्धि</em> बार-बार लगने वाले अतिरिक्त-मांग
        जुर्मानों से सस्ती पड़ती है।</p>
      </section>`,
    faqsHi: [
      { q: 'बिजली बिल पर स्वीकृत भार क्या है?',
        a: 'स्वीकृत भार वह अधिकतम मांग (kW या kVA में) है जिसे आपके डिस्कॉम ने आपको आपूर्ति देने का अनुबंध किया, कनेक्शन बनते समय घोषित। फिक्स्ड चार्ज खपत की परवाह किए बिना हर महीने इसी मान पर लगता है, और इससे अधिक खींचने पर अतिरिक्त-मांग जुर्माना लग सकता है।' },
      { q: 'स्वीकृत भार घटाकर मैं कितना बचा सकता हूँ?',
        a: 'प्रति-kW अनुसूचियों पर बचत प्रति-kW फिक्स्ड चार्ज गुणा हटाई गई kW होती है, हर महीने। बैंडेड अनुसूचियों पर बचत किसी नीचे बैंड में गिरने से आती है। सटीक अंतर देखने के लिए अपने डिस्कॉम की संख्याएँ बिल कैलकुलेटर में दोनों भार के साथ चलाएँ।' },
      { q: 'अगर मेरी खपत स्वीकृत भार से ज़्यादा हो जाए तो क्या होता है?',
        a: 'अतिरिक्त दर्ज मांग आम तौर पर उस महीने दंडात्मक फिक्स्ड-चार्ज दर (अक्सर सामान्य का 1.5–2×) पर बिल होती है, और लगातार उल्लंघन डिस्कॉम को आपका भार जबरन ऊपर नियमित करने पर ले जा सकते हैं। इसीलिए आपको सैद्धांतिक न्यूनतम के बजाय अपनी वास्तविक एक-साथ चरम के हिसाब से आकार देना चाहिए।' },
      { q: 'स्वीकृत भार घटाने के लिए आवेदन कैसे करूँ?',
        a: 'अपने डिस्कॉम के उपभोक्ता पोर्टल पर या स्थानीय उपखंड कार्यालय में भार-कमी अनुरोध जमा करें, छोटा प्रोसेसिंग शुल्क भरें, और आवश्यक कोई भी निरीक्षण पूरा करें। घटा हुआ भार — और कम फिक्स्ड चार्ज — अगले बिलिंग चक्र से लागू होता है।' },
    ],

    titleMr: 'मंजूर भार योग्य आकाराचा करून स्थिर आकार कसा कमी करावा',
    metaTitleMr: 'वीज स्थिर आकार कमी करा: तुमचा मंजूर भार योग्य आकाराचा करा',
    descriptionMr: 'स्थिर आकार शून्य वापरावरही प्रति kW मंजूर भारावर लागतो. तुमचा भार गरजेपेक्षा जास्त मंजूर आहे का हे कसे तपासावे, कमी केल्याने किती बचत होते, अर्ज प्रक्रिया, आणि खूप कमी ठेवल्यास अतिरिक्त-मागणी दंडाचा धोका.',
    introMr: `तुमच्या बिलावरील स्थिर आकार प्रति kW (किंवा kVA) <strong>मंजूर भारावर</strong> आकारला जातो —
      म्हणजे तुम्ही करार केलेली क्षमता, प्रत्यक्षात वापरलेली वीज नव्हे. जर तुमचा भार वर्षांपूर्वी अशा
      उपकरणांसाठी मंजूर झाला होता जी आता तुम्ही चालवत नाही, तर तुम्ही दर महिन्याला अशा हेडरूमचे पैसे भरत
      आहात ज्याला तुम्ही कधी स्पर्शही करत नाही. तो योग्य आकाराचा करणे ही अशा मोजक्या बिल-कपातींपैकी एक आहे
      जिच्यासाठी वर्तन बदलण्याची गरज नाही.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. तुम्ही किती मंजूर आहात वि. प्रत्यक्षात किती ओढता, ते तपासा</h2>
        <p>तुमचे बिल दोन्ही आकडे छापते: <strong>मंजूर भार</strong> (करार केलेले kW) आणि, बहुतेक आधुनिक
        बिलांवर, <strong>नोंदलेली / कमाल मागणी</strong> (तुम्ही प्रत्यक्षात ओढलेले सर्वोच्च kW). जर
        नोंदलेली मागणी महिन्या-महिन्याला मंजूर भारापेक्षा बरीच खाली राहत असेल — उदा. 5 kW मंजूरच्या
        तुलनेत 2 kW नोंद — तर तुम्ही कपातीसाठी योग्य उमेदवार आहात.</p>
      </section>
      <section class="seo-section">
        <h2>2. कपातीचे मूल्य किती</h2>
        <p>स्थिर-आकार अनुसूची एकतर स्थिर ₹/kW/महिना असतात किंवा भार बँडनुसार श्रेणीबद्ध, त्यामुळे बचत फक्त
        (कमी केलेले kW) × (दर) असते — किंवा स्वस्त बँडमध्ये घसरण. रचना कशा वेगळ्या असतात याची काही उदाहरणे
        (तुमच्या डिस्कॉमची नेमकी अनुसूची त्याच्या <a href="/mr/tariffs/states/">टॅरिफ पेज</a> वर पहा):</p>
        <ul>
          <li><strong>प्रति-kW अनुसूची</strong> (उदा. UPPCL घरगुती): काढलेले प्रत्येक kW दर महिन्याला
          पूर्ण प्रति-kW दर वाचवते.</li>
          <li><strong>बँडेड अनुसूची</strong> (उदा. <a href="/tariffs/delhi/brpl/">दिल्ली LT-I</a>,
          <a href="/mr/tariffs/maharashtra/msedcl/">MSEDCL LT-1</a>): बचत खालच्या बँडमध्ये जाण्यातून
          येते — "2–5 kW" बँडवरून "2 kW पर्यंत" मध्ये जाणे एका टप्प्यात स्थिर आकार निम्मा करू शकते.</li>
        </ul>
        <p>ते अचूक अंदाजा: <a href="/#calculator">कॅल्क्युलेटर</a> तुमच्या सध्याच्या व प्रस्तावित भारासह
        दोनदा चालवा आणि स्थिर-आकार ओळीची तुलना करा.</p>
      </section>
      <section class="seo-section">
        <h2>3. खूप कमी करू नका — अतिरिक्त-मागणी दंड</h2>
        <p>हीच ती तडजोड आहे जी "किमान मंजूर करा" ला वाईट कल्पना बनवते. जर तुमची नोंदलेली मागणी मंजूर
        भारापेक्षा जास्त झाली, तर बहुतेक डिस्कॉम अतिरिक्त भाग <strong>दंडात्मक दराने</strong> बिल करतात —
        सामान्यतः अतिरिक्त kW वर सामान्य स्थिर आकाराच्या 1.5× ते 2×, आणि वारंवार उल्लंघन सक्तीचे भार
        नियमितीकरण घडवू शकते. तुमच्या वास्तववादी उच्चांकाच्या हिशेबाने आकार द्या: उन्हाळ्याच्या संध्याकाळी
        खरोखर एकत्र चालणारी उपकरणे बेरीज करा (AC + फ्रिज + गिझर + दिवे), तुमच्याकडील प्रत्येक गोष्टीची
        बेरीज नव्हे.</p>
      </section>
      <section class="seo-section">
        <h2>4. अर्ज कसा करावा</h2>
        <ol>
          <li>तुमच्या डिस्कॉमच्या पोर्टलवर किंवा उपविभाग कार्यालयात "भार कपात" साठी अर्ज करा — बहुतेक
          राज्यांत हाच तो चॅनेल आहे जो नवीन-जोडणी अर्जाचा असतो (पोर्टल लिंकसाठी आमचा
          <a href="/new-connection/">नवीन जोडणी हब</a> पहा).</li>
          <li>एक छोटे प्रक्रिया शुल्क आणि, काही राज्यांत, नवीन चाचणी अहवाल किंवा तपासणीची अपेक्षा ठेवा.</li>
          <li>बदल पुढील बिलिंग चक्रापासून लागू होतो; करार/सुरक्षा ठेवी नवीन भारानुसार समायोजित होतात.</li>
        </ol>
        <p>सोबतच हेही तपासण्यासारखे: ज्या घरांनी मंजुरीनंतर AC किंवा EV चार्जर <em>जोडले</em> आहेत त्यांना
        उलट दिशेने जावे लागू शकते — एक छोटी भार <em>वाढ</em> वारंवार लागणाऱ्या अतिरिक्त-मागणी दंडांपेक्षा
        स्वस्त पडते.</p>
      </section>`,
    faqsMr: [
      { q: 'वीज बिलावर मंजूर भार म्हणजे काय?',
        a: 'मंजूर भार म्हणजे ती कमाल मागणी (kW किंवा kVA मध्ये) जी तुमच्या डिस्कॉमने तुम्हाला पुरवठा करण्याचा करार केला, जोडणी करताना घोषित केलेली. स्थिर आकार वापराची पर्वा न करता दर महिन्याला याच मूल्यावर लागतो, आणि यापेक्षा जास्त ओढल्यास अतिरिक्त-मागणी दंड लागू शकतो.' },
      { q: 'मंजूर भार कमी करून मी किती बचत करू शकतो?',
        a: 'प्रति-kW अनुसूचींवर बचत म्हणजे प्रति-kW स्थिर आकार गुणिले काढलेले kW, दर महिन्याला. बँडेड अनुसूचींवर बचत खालच्या बँडमध्ये घसरण्यातून येते. नेमका फरक पाहण्यासाठी तुमच्या डिस्कॉमचे आकडे बिल कॅल्क्युलेटरमध्ये दोन्ही भारांसह चालवा.' },
      { q: 'माझा वापर मंजूर भारापेक्षा जास्त झाला तर काय होते?',
        a: 'अतिरिक्त नोंदलेली मागणी सामान्यतः त्या महिन्यात दंडात्मक स्थिर-आकार दराने (बहुधा सामान्याच्या 1.5–2×) बिल होते, आणि सततचे उल्लंघन डिस्कॉमला तुमचा भार सक्तीने वर नियमित करण्यास प्रवृत्त करू शकते. म्हणूनच तुम्ही सैद्धांतिक किमानाऐवजी तुमच्या वास्तववादी एकाच वेळच्या उच्चांकाच्या हिशेबाने आकार द्यावा.' },
      { q: 'मंजूर भार कमी करण्यासाठी मी अर्ज कसा करू?',
        a: 'तुमच्या डिस्कॉमच्या ग्राहक पोर्टलवर किंवा स्थानिक उपविभाग कार्यालयात भार-कपात विनंती सादर करा, छोटे प्रक्रिया शुल्क भरा, आणि आवश्यक असलेली कोणतीही तपासणी पूर्ण करा. कमी केलेला भार — आणि कमी स्थिर आकार — पुढील बिलिंग चक्रापासून लागू होतो.' },
    ],
  },

  {
    slug: 'electricity-duty-explained',
    published: "2025-10-02",
    title: 'Electricity Duty on Your Bill: What It Is and How States Differ',
    metaTitle: 'Electricity Duty Explained — Why the Tax on Your Bill Varies by State',
    description: 'Electricity duty is a state tax collected through your electricity bill. How it is calculated (percentage vs paise-per-unit), why it ranges from zero to over 15% across states, which categories are exempt, and how to check yours.',
    minutes: 4,
    intro: `The "ED" or "Electricity Duty" line on your bill is not a DISCOM charge at all — it is a
      <strong>state government tax</strong> collected through the bill and passed to the state
      treasury. Because each state legislates its own duty, the same consumption can carry a very
      different tax burden depending on where you live.`,
    sections: `
      <section class="seo-section">
        <h2>How duty is levied</h2>
        <p>States use one of two bases:</p>
        <ul>
          <li><strong>Percentage of charges</strong> — duty as a % of the energy charge (and in many
          states the fixed charge and fuel surcharge too). Because FPPA is added first, a fuel
          surcharge increase also raises the duty rupees.</li>
          <li><strong>Paise per unit</strong> — a flat ₹/kWh levy independent of the rate you pay.</li>
        </ul>
        <p>The percentage varies enormously by state and by consumer category. Among the schedules
        on our tariff pages, <a href="/tariffs/maharashtra/msedcl/">Maharashtra domestic</a> carries
        one of the highest percentage duties, <a href="/tariffs/delhi/brpl/">Delhi</a> and
        <a href="/tariffs/tamil-nadu/tangedco/">Tamil Nadu</a> sit at the low single digits, and
        <a href="/tariffs/karnataka/bescom/">Karnataka</a> publishes duty-inclusive tariffs — no
        separate ED line appears on a BESCOM bill at all.</p>
      </section>
      <section class="seo-section">
        <h2>Who is exempt</h2>
        <p>Exemptions are also state policy. Common ones: agricultural pumpsets, lifeline/BPL
        domestic slabs, government water works, and some industries during promoted periods. If
        your category is exempt, the ED line should print zero — worth checking after any category
        change on your bill.</p>
      </section>
      <section class="seo-section">
        <h2>How to check yours</h2>
        <ol>
          <li>Open your state's page from the <a href="/tariffs/states/">tariff directory</a> — the
          "Additional charges" row of each category card shows the duty applied.</li>
          <li>Verify the base: recompute duty% × (energy + fixed + FPPA) — if the printed figure
          is higher, the bill may be compounding on arrears, which is worth a complaint.</li>
          <li>Use the <a href="/#calculator">calculator</a>, which applies each state's duty on the
          correct base automatically.</li>
        </ol>
      </section>`,
    faqs: [
      { q: 'What is electricity duty on my bill?',
        a: 'Electricity duty is a tax levied by your state government on electricity consumption, collected by the DISCOM through your bill and remitted to the state treasury. It is set by state law, so both the rate and the base differ from state to state.' },
      { q: 'Why is electricity duty so different between states?',
        a: 'Duty is state legislation, not a central levy. Each state chooses the base (percentage of charges vs paise per unit), the rate, and the exemptions — which is why Maharashtra’s domestic duty is in double digits while Delhi’s is 5% and Karnataka folds it into the printed tariff entirely.' },
      { q: 'Is electricity duty charged on the fuel surcharge (FPPA)?',
        a: 'In most states, yes — duty is applied after FPPA is added, i.e. on energy charge + fixed charge + FPPA. That ordering means a fuel-surcharge revision nudges your duty up too.' },
      { q: 'Are any consumers exempt from electricity duty?',
        a: 'Many states exempt agricultural connections, lifeline/BPL domestic slabs and certain government or promoted-industry categories. Exemptions are listed in each state’s duty notification; if you qualify, the ED line on your bill should be zero.' },
    ],

    titleHi: 'आपके बिल पर बिजली शुल्क: यह क्या है और राज्यों में कैसे अलग है',
    metaTitleHi: 'बिजली शुल्क समझें — आपके बिल पर यह कर राज्यवार क्यों बदलता है',
    descriptionHi: 'बिजली शुल्क एक राज्य कर है जो आपके बिजली बिल के ज़रिए वसूला जाता है। यह कैसे निकाला जाता है (प्रतिशत बनाम पैसे-प्रति-यूनिट), राज्यों में यह शून्य से 15%+ तक क्यों होता है, कौन-सी श्रेणियाँ छूट पाती हैं, और अपना कैसे जाँचें।',
    introHi: `आपके बिल पर "ED" या "बिजली शुल्क" लाइन डिस्कॉम का शुल्क है ही नहीं — यह एक
      <strong>राज्य सरकार का कर</strong> है, जो बिल के ज़रिए वसूला जाता है और राज्य कोष में जाता है। चूँकि हर
      राज्य अपना शुल्क खुद बनाता है, वही खपत आपके रहने की जगह के अनुसार बहुत अलग कर बोझ ढो सकती है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>शुल्क कैसे लगता है</h2>
        <p>राज्य दो में से एक आधार इस्तेमाल करते हैं:</p>
        <ul>
          <li><strong>शुल्कों का प्रतिशत</strong> — ऊर्जा शुल्क (और कई राज्यों में फिक्स्ड शुल्क व ईंधन
          अधिभार भी) के % के रूप में शुल्क। चूँकि FPPA पहले जुड़ता है, ईंधन अधिभार बढ़ने से शुल्क के रुपये
          भी बढ़ते हैं।</li>
          <li><strong>पैसे प्रति यूनिट</strong> — आपकी दर से स्वतंत्र एक स्थिर ₹/kWh उगाही।</li>
        </ul>
        <p>प्रतिशत राज्य और उपभोक्ता श्रेणी के अनुसार बहुत भिन्न होता है। हमारे टैरिफ पेजों की अनुसूचियों में,
        <a href="/hi/tariffs/maharashtra/msedcl/">महाराष्ट्र घरेलू</a> सबसे ऊँचे प्रतिशत शुल्कों में से एक
        ढोता है, <a href="/hi/tariffs/delhi/brpl/">दिल्ली</a> और
        <a href="/hi/tariffs/tamil-nadu/tangedco/">तमिलनाडु</a> कम एकल अंकों पर हैं, और
        <a href="/hi/tariffs/karnataka/bescom/">कर्नाटक</a> शुल्क-समावेशी टैरिफ प्रकाशित करता है — BESCOM
        बिल पर अलग ED लाइन दिखती ही नहीं।</p>
      </section>
      <section class="seo-section">
        <h2>किसे छूट है</h2>
        <p>छूट भी राज्य नीति है। आम छूटें: कृषि पंपसेट, लाइफलाइन/BPL घरेलू स्लैब, सरकारी जलकल, और कुछ उद्योग
        प्रोत्साहित अवधियों में। अगर आपकी श्रेणी छूट प्राप्त है, तो ED लाइन शून्य छपनी चाहिए — किसी भी श्रेणी
        बदलाव के बाद जाँचने लायक।</p>
      </section>
      <section class="seo-section">
        <h2>अपना कैसे जाँचें</h2>
        <ol>
          <li><a href="/hi/tariffs/states/">टैरिफ डायरेक्टरी</a> से अपने राज्य का पेज खोलें — हर श्रेणी
          कार्ड की "अतिरिक्त शुल्क" पंक्ति लागू शुल्क दिखाती है।</li>
          <li>आधार जाँचें: शुल्क% × (ऊर्जा + फिक्स्ड + FPPA) दोबारा निकालें — छपा आँकड़ा ज़्यादा हो, तो बिल
          बकाया पर कंपाउंड कर रहा हो सकता है, जो शिकायत के लायक है।</li>
          <li><a href="/#calculator">कैलकुलेटर</a> इस्तेमाल करें, जो हर राज्य का शुल्क सही आधार पर अपने-आप
          लगाता है।</li>
        </ol>
      </section>`,
    faqsHi: [
      { q: 'मेरे बिल पर बिजली शुल्क क्या है?',
        a: 'बिजली शुल्क आपकी राज्य सरकार द्वारा बिजली खपत पर लगाया गया कर है, जो डिस्कॉम आपके बिल के ज़रिए वसूलता है और राज्य कोष को देता है। यह राज्य कानून से तय होता है, इसलिए दर और आधार दोनों राज्य-दर-राज्य अलग होते हैं।' },
      { q: 'राज्यों के बीच बिजली शुल्क इतना अलग क्यों है?',
        a: 'शुल्क राज्य विधान है, केंद्रीय उगाही नहीं। हर राज्य आधार (शुल्कों का प्रतिशत बनाम पैसे प्रति यूनिट), दर और छूटें चुनता है — इसीलिए महाराष्ट्र का घरेलू शुल्क दो अंकों में है जबकि दिल्ली का 5% और कर्नाटक इसे छपे टैरिफ में पूरी तरह समेट लेता है।' },
      { q: 'क्या बिजली शुल्क ईंधन अधिभार (FPPA) पर लगता है?',
        a: 'अधिकांश राज्यों में, हाँ — शुल्क FPPA जुड़ने के बाद लगता है, यानी ऊर्जा शुल्क + फिक्स्ड शुल्क + FPPA पर। इस क्रम का मतलब है कि ईंधन-अधिभार संशोधन आपके शुल्क को भी ऊपर धकेलता है।' },
      { q: 'क्या कोई उपभोक्ता बिजली शुल्क से छूट पाते हैं?',
        a: 'कई राज्य कृषि कनेक्शन, लाइफलाइन/BPL घरेलू स्लैब और कुछ सरकारी या प्रोत्साहित-उद्योग श्रेणियों को छूट देते हैं। छूटें हर राज्य की शुल्क अधिसूचना में सूचीबद्ध होती हैं; यदि आप पात्र हैं, तो आपके बिल पर ED लाइन शून्य होनी चाहिए।' },
    ],

    titleMr: 'तुमच्या बिलावरील वीज शुल्क: ते काय आहे आणि राज्यांत कसे वेगळे असते',
    metaTitleMr: 'वीज शुल्क समजून घ्या — तुमच्या बिलावरील हा कर राज्यानुसार का बदलतो',
    descriptionMr: 'वीज शुल्क हा एक राज्य कर आहे जो तुमच्या वीज बिलामार्फत वसूल केला जातो. तो कसा मोजला जातो (टक्केवारी वि. पैसे-प्रति-युनिट), राज्यांत तो शून्यापासून 15%+ पर्यंत का असतो, कोणत्या श्रेणींना सूट आहे, आणि तुमचा कसा तपासावा.',
    introMr: `तुमच्या बिलावरील "ED" किंवा "वीज शुल्क" ओळ हा डिस्कॉमचा आकार नाहीच — हा एक
      <strong>राज्य सरकारचा कर</strong> आहे, जो बिलामार्फत वसूल केला जातो आणि राज्याच्या तिजोरीत जातो.
      प्रत्येक राज्य स्वतःचे शुल्क स्वतः ठरवत असल्याने, तोच वापर तुम्ही कुठे राहता त्यानुसार खूप वेगळा
      कर भार वाहू शकतो.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>शुल्क कसे लागते</h2>
        <p>राज्ये दोनपैकी एक आधार वापरतात:</p>
        <ul>
          <li><strong>आकारांची टक्केवारी</strong> — ऊर्जा आकाराच्या (आणि अनेक राज्यांत स्थिर आकार व
          इंधन अधिभाराच्या देखील) % म्हणून शुल्क. FPPA आधी जोडला जात असल्याने, इंधन अधिभार वाढल्यास
          शुल्काचे रुपयेही वाढतात.</li>
          <li><strong>पैसे प्रति युनिट</strong> — तुमच्या दरापासून स्वतंत्र एक स्थिर ₹/kWh आकारणी.</li>
        </ul>
        <p>टक्केवारी राज्य व ग्राहक श्रेणीनुसार खूप भिन्न असते. आमच्या टॅरिफ पेजांवरील अनुसूचींमध्ये,
        <a href="/mr/tariffs/maharashtra/msedcl/">महाराष्ट्र घरगुती</a> सर्वात जास्त टक्केवारी शुल्कांपैकी
        एक वाहते, <a href="/tariffs/delhi/brpl/">दिल्ली</a> व
        <a href="/tariffs/tamil-nadu/tangedco/">तमिळनाडू</a> कमी एकेरी अंकांवर आहेत, आणि
        <a href="/tariffs/karnataka/bescom/">कर्नाटक</a> शुल्क-समावेशक टॅरिफ प्रकाशित करते — BESCOM
        बिलावर वेगळी ED ओळ दिसतच नाही.</p>
      </section>
      <section class="seo-section">
        <h2>कोणाला सूट आहे</h2>
        <p>सूटदेखील राज्य धोरण आहे. सामान्य सूट: कृषी पंपसेट, लाइफलाइन/BPL घरगुती स्लॅब, सरकारी जलकेंद्रे,
        आणि काही उद्योग प्रोत्साहित कालावधीत. जर तुमची श्रेणी सूटप्राप्त असेल, तर ED ओळ शून्य छापली जावी —
        कोणत्याही श्रेणी बदलानंतर तपासण्यासारखे.</p>
      </section>
      <section class="seo-section">
        <h2>तुमचा कसा तपासावा</h2>
        <ol>
          <li><a href="/mr/tariffs/states/">टॅरिफ डिरेक्टरी</a> मधून तुमच्या राज्याचे पेज उघडा — प्रत्येक
          श्रेणी कार्डाची "अतिरिक्त आकार" ओळ लागू शुल्क दाखवते.</li>
          <li>आधार तपासा: शुल्क% × (ऊर्जा + स्थिर + FPPA) पुन्हा मोजा — छापील आकडा जास्त असल्यास, बिल
          थकबाकीवर चक्रवाढ करत असू शकते, जे तक्रारीस पात्र आहे.</li>
          <li><a href="/#calculator">कॅल्क्युलेटर</a> वापरा, जे प्रत्येक राज्याचे शुल्क योग्य आधारावर
          आपोआप लागू करते.</li>
        </ol>
      </section>`,
    faqsMr: [
      { q: 'माझ्या बिलावर वीज शुल्क म्हणजे काय?',
        a: 'वीज शुल्क हा तुमच्या राज्य सरकारने वीज वापरावर लावलेला कर आहे, जो डिस्कॉम तुमच्या बिलामार्फत वसूल करतो आणि राज्याच्या तिजोरीत भरतो. तो राज्य कायद्याने ठरतो, म्हणून दर आणि आधार दोन्ही राज्या-राज्यात वेगळे असतात.' },
      { q: 'राज्यांमध्ये वीज शुल्क इतके वेगळे का आहे?',
        a: 'शुल्क हे राज्याचे कायदे आहे, केंद्रीय आकारणी नव्हे. प्रत्येक राज्य आधार (आकारांची टक्केवारी वि. पैसे प्रति युनिट), दर आणि सूट निवडते — म्हणूनच महाराष्ट्राचे घरगुती शुल्क दुहेरी अंकांत आहे तर दिल्लीचे 5% आणि कर्नाटक ते छापील टॅरिफमध्ये पूर्णपणे समाविष्ट करते.' },
      { q: 'वीज शुल्क इंधन अधिभारावर (FPPA) लागते का?',
        a: 'बहुतेक राज्यांत, होय — शुल्क FPPA जोडल्यानंतर लागते, म्हणजे ऊर्जा आकार + स्थिर आकार + FPPA वर. या क्रमाचा अर्थ इंधन-अधिभार सुधारणा तुमचे शुल्कही वर ढकलते.' },
      { q: 'कोणतेही ग्राहक वीज शुल्कातून सूट मिळवतात का?',
        a: 'अनेक राज्ये कृषी जोडण्या, लाइफलाइन/BPL घरगुती स्लॅब आणि काही सरकारी किंवा प्रोत्साहित-उद्योग श्रेणींना सूट देतात. सूट प्रत्येक राज्याच्या शुल्क अधिसूचनेत सूचीबद्ध असतात; तुम्ही पात्र असल्यास, तुमच्या बिलावरील ED ओळ शून्य असावी.' },
    ],
  },

  {
    slug: 'how-to-read-bses-delhi-bill',
    published: "2025-10-14",
    states: ['Delhi'],
    title: 'How to Read Your BSES / Delhi Electricity Bill',
    metaTitle: 'How to Read Your BSES Delhi Bill — Subsidy, PPAC & Every Line',
    description: 'A line-by-line guide to Delhi electricity bills from BSES Rajdhani (BRPL), BSES Yamuna (BYPL) and Tata Power-DDL: LT-I slabs, tiered fixed charges, PPAC, 5% electricity duty, and exactly how the GNCTD subsidy makes bills zero.',
    minutes: 6,
    intro: `Delhi bills look confusing for one big reason: two households with identical usage can
      pay wildly different amounts because of the <strong>GNCTD subsidy</strong>. This guide decodes
      a domestic (LT-I) bill from <strong>BRPL</strong> (BSES Rajdhani — South &amp; West Delhi),
      <strong>BYPL</strong> (BSES Yamuna — East &amp; Central Delhi) or
      <strong>Tata Power-DDL</strong> (North &amp; North-West Delhi), all of which bill on the same
      DERC tariff schedule.`,
    sections: `
      <section class="seo-section">
        <h2>1. The subsidy — why so many Delhi bills are ₹0</h2>
        <p>The Delhi government subsidy is applied on the bill itself:</p>
        <ul>
          <li><strong>Up to 200 units/month:</strong> 100% subsidy — the bill is zero (the charges
          are printed, then reversed as a subsidy line).</li>
          <li><strong>201–400 units:</strong> 50% rebate on the first 200 units' charges.</li>
          <li><strong>Above 400 units:</strong> no subsidy — you pay the full tariff on everything.</li>
        </ul>
        <p>The subsidy is optional (consumers can opt out), and it explains the "cliff" at 201 and
        401 units: one extra unit can add hundreds of rupees. Check both scenarios in the
        <a href="/?state=Delhi#calculator">Delhi bill calculator</a>, which models the subsidy.</p>
      </section>
      <section class="seo-section">
        <h2>2. Energy charge — the LT-I slabs</h2>
        <p>Delhi domestic slabs step up at 200, 400 and 800 units, slab-wise — each rate
        applies only to the units inside its slab. The current per-unit rates for your DISCOM are on
        our tariff pages: <a href="/tariffs/delhi/brpl/">BRPL</a>,
        <a href="/tariffs/delhi/bypl/">BYPL</a>, <a href="/tariffs/delhi/tpddl/">Tata Power-DDL</a>.</p>
      </section>
      <section class="seo-section">
        <h2>3. Fixed charge — tiered by sanctioned load</h2>
        <p>Delhi's fixed charge is banded by sanctioned load (up to 2 kW / 2–5 kW / above 5 kW), so
        the band you're in matters more than the exact kW. If your recorded demand is far below your
        band, see our <a href="/guides/reduce-fixed-charges-sanctioned-load/">guide to right-sizing
        sanctioned load</a>.</p>
      </section>
      <section class="seo-section">
        <h2>4. PPAC — Delhi's fuel surcharge</h2>
        <p>The <strong>Power Purchase Adjustment Cost</strong> is Delhi's version of FPPA: a
        DERC-approved percentage applied on your energy + fixed charges, different for each DISCOM
        and revised periodically (monthly since mid-2026). It is the line that moves your bill when
        nothing else changed — our <a href="/guides/how-fppa-fuel-surcharge-is-calculated/">FPPA
        guide</a> explains the mechanism.</p>
      </section>
      <section class="seo-section">
        <h2>5. The remaining lines</h2>
        <ul>
          <li><strong>Electricity duty:</strong> 5% on the energy charges, per the Delhi schedule.</li>
          <li><strong>Pension trust surcharge / other DERC-approved surcharges:</strong> small
          percentage lines that DERC approves from time to time.</li>
          <li><strong>Arrears &amp; LPSC:</strong> unpaid past amounts plus late-payment surcharge.</li>
        </ul>
        <p>To verify the total: enter your units and load in the
        <a href="/?state=Delhi#calculator">calculator</a>, toggle the subsidy on, add the PPAC
        percentage printed on your bill, and compare line by line. A mismatch beyond a few rupees
        usually traces to the meter-status code (estimated reading) or arrears.</p>
      </section>`,
    faqs: [
      { q: 'Why is my Delhi electricity bill zero?',
        a: 'Because of the GNCTD domestic subsidy: consumers using up to 200 units a month get a 100% subsidy, so the computed charges are fully reversed on the bill. Use 201+ units and the subsidy drops to a 50% rebate on the first 200 units; above 400 units there is no subsidy at all.' },
      { q: 'What is PPAC on a BSES or Tata Power-DDL bill?',
        a: 'PPAC (Power Purchase Adjustment Cost) is Delhi’s fuel-cost surcharge — a DERC-approved percentage applied on energy plus fixed charges, separately approved for BRPL, BYPL and Tata Power-DDL and revised periodically. It is why bills change month to month at identical usage.' },
      { q: 'Are BRPL, BYPL and Tata Power-DDL tariffs different?',
        a: 'The DERC tariff schedule (slabs, fixed charges, duty) is the same across Delhi’s private DISCOMs; what differs is the service area, the PPAC percentage in force and the billing portal. Your DISCOM is determined by where you live, not by choice.' },
      { q: 'Why did one extra unit make my Delhi bill jump?',
        a: 'The subsidy has hard cut-offs at 200 and 400 units. At 201 units you lose the 100% subsidy (keeping only a 50% rebate on the first 200), and at 401 units you lose the subsidy entirely — so a single unit can add several hundred rupees. Shifting a few units of usage to the next month around the cut-off genuinely pays.' },
    ],

    titleHi: 'अपना BSES / दिल्ली बिजली बिल कैसे पढ़ें',
    metaTitleHi: 'अपना BSES दिल्ली बिल कैसे पढ़ें — सब्सिडी, PPAC व हर लाइन',
    descriptionHi: 'BSES राजधानी (BRPL), BSES यमुना (BYPL) और Tata Power-DDL के दिल्ली बिजली बिलों की लाइन-दर-लाइन गाइड: LT-I स्लैब, श्रेणीबद्ध फिक्स्ड चार्ज, PPAC, 5% बिजली शुल्क, और GNCTD सब्सिडी बिल को ठीक कैसे शून्य करती है।',
    introHi: `दिल्ली के बिल एक बड़ी वजह से उलझे लगते हैं: समान खपत वाले दो घर <strong>GNCTD सब्सिडी</strong>
      के कारण बहुत अलग राशि चुका सकते हैं। यह गाइड <strong>BRPL</strong> (BSES राजधानी — दक्षिण व पश्चिम
      दिल्ली), <strong>BYPL</strong> (BSES यमुना — पूर्व व मध्य दिल्ली) या <strong>Tata Power-DDL</strong>
      (उत्तर व उत्तर-पश्चिम दिल्ली) के घरेलू (LT-I) बिल को समझाती है, जो सभी एक ही DERC टैरिफ अनुसूची पर बिल
      होते हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. सब्सिडी — इतने दिल्ली बिल ₹0 क्यों होते हैं</h2>
        <p>दिल्ली सरकार की सब्सिडी बिल पर ही लागू होती है:</p>
        <ul>
          <li><strong>200 यूनिट/माह तक:</strong> 100% सब्सिडी — बिल शून्य (शुल्क छपते हैं, फिर सब्सिडी लाइन
          के रूप में उलट दिए जाते हैं)।</li>
          <li><strong>201–400 यूनिट:</strong> पहली 200 यूनिट के शुल्कों पर 50% छूट।</li>
          <li><strong>400 यूनिट से ऊपर:</strong> कोई सब्सिडी नहीं — हर चीज़ पर पूरा टैरिफ।</li>
        </ul>
        <p>सब्सिडी वैकल्पिक है (उपभोक्ता बाहर निकल सकते हैं), और यह 201 व 401 यूनिट पर "क्लिफ़" समझाती है:
        एक अतिरिक्त यूनिट सैकड़ों रुपये जोड़ सकती है। दोनों परिदृश्य
        <a href="/?state=Delhi#calculator">दिल्ली बिल कैलकुलेटर</a> में जाँचें, जो सब्सिडी को मॉडल करता है।</p>
      </section>
      <section class="seo-section">
        <h2>2. ऊर्जा शुल्क — LT-I स्लैब</h2>
        <p>दिल्ली के घरेलू स्लैब 200, 400 व 800 यूनिट पर, स्लैब-वार बढ़ते हैं — हर दर केवल अपने
        स्लैब के भीतर की यूनिटों पर लगती है। आपके डिस्कॉम की वर्तमान प्रति-यूनिट दरें हमारे टैरिफ पेजों पर हैं:
        <a href="/hi/tariffs/delhi/brpl/">BRPL</a>, <a href="/hi/tariffs/delhi/bypl/">BYPL</a>,
        <a href="/hi/tariffs/delhi/tpddl/">Tata Power-DDL</a>।</p>
      </section>
      <section class="seo-section">
        <h2>3. फिक्स्ड चार्ज — स्वीकृत भार के अनुसार श्रेणीबद्ध</h2>
        <p>दिल्ली का फिक्स्ड चार्ज स्वीकृत भार (2 kW तक / 2–5 kW / 5 kW से ऊपर) के अनुसार बैंडेड है, इसलिए
        आप जिस बैंड में हैं वह सटीक kW से ज़्यादा मायने रखता है। अगर आपकी दर्ज मांग आपके बैंड से काफ़ी नीचे
        है, तो देखें हमारी <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">स्वीकृत भार सही करने
        की गाइड</a>।</p>
      </section>
      <section class="seo-section">
        <h2>4. PPAC — दिल्ली का ईंधन अधिभार</h2>
        <p><strong>Power Purchase Adjustment Cost</strong> दिल्ली का FPPA संस्करण है: आपके ऊर्जा +
        फिक्स्ड शुल्क पर लगा एक DERC-स्वीकृत प्रतिशत, हर डिस्कॉम के लिए अलग और समय-समय पर संशोधित (2026 के
        मध्य से मासिक)। यह वही लाइन है जो कुछ और न बदलने पर आपका बिल हिलाती है — हमारी
        <a href="/hi/guides/how-fppa-fuel-surcharge-is-calculated/">FPPA गाइड</a> तंत्र समझाती है।</p>
      </section>
      <section class="seo-section">
        <h2>5. बाक़ी लाइनें</h2>
        <ul>
          <li><strong>बिजली शुल्क:</strong> ऊर्जा शुल्कों पर 5%, दिल्ली अनुसूची के अनुसार।</li>
          <li><strong>पेंशन ट्रस्ट अधिभार / अन्य DERC-स्वीकृत अधिभार:</strong> छोटी प्रतिशत लाइनें जिन्हें
          DERC समय-समय पर स्वीकृत करता है।</li>
          <li><strong>बकाया व LPSC:</strong> अदा न की गई पिछली राशियाँ साथ में विलंब-भुगतान अधिभार।</li>
        </ul>
        <p>कुल जाँचने के लिए: <a href="/?state=Delhi#calculator">कैलकुलेटर</a> में अपनी यूनिटें व भार डालें,
        सब्सिडी चालू करें, अपने बिल पर छपा PPAC प्रतिशत जोड़ें, और लाइन-दर-लाइन तुलना करें। कुछ रुपये से
        अधिक का बेमेल आम तौर पर मीटर-स्थिति कोड (अनुमानित रीडिंग) या बकाया तक जाता है।</p>
      </section>`,
    faqsHi: [
      { q: 'मेरा दिल्ली बिजली बिल शून्य क्यों है?',
        a: 'GNCTD घरेलू सब्सिडी के कारण: महीने में 200 यूनिट तक इस्तेमाल करने वाले उपभोक्ताओं को 100% सब्सिडी मिलती है, इसलिए निकाले गए शुल्क बिल पर पूरी तरह उलट दिए जाते हैं। 201+ यूनिट पर सब्सिडी घटकर पहली 200 यूनिट पर 50% छूट रह जाती है; 400 यूनिट से ऊपर कोई सब्सिडी नहीं।' },
      { q: 'BSES या Tata Power-DDL बिल पर PPAC क्या है?',
        a: 'PPAC (Power Purchase Adjustment Cost) दिल्ली का ईंधन-लागत अधिभार है — ऊर्जा और फिक्स्ड शुल्क पर लगा एक DERC-स्वीकृत प्रतिशत, BRPL, BYPL और Tata Power-DDL के लिए अलग-अलग स्वीकृत और समय-समय पर संशोधित। इसीलिए समान खपत पर भी बिल महीने-दर-महीने बदलते हैं।' },
      { q: 'क्या BRPL, BYPL और Tata Power-DDL के टैरिफ अलग हैं?',
        a: 'DERC टैरिफ अनुसूची (स्लैब, फिक्स्ड चार्ज, शुल्क) दिल्ली की निजी डिस्कॉम में एक समान है; जो अलग है वह सेवा क्षेत्र, लागू PPAC प्रतिशत और बिलिंग पोर्टल है। आपका डिस्कॉम आपके रहने की जगह से तय होता है, पसंद से नहीं।' },
      { q: 'एक अतिरिक्त यूनिट ने मेरा दिल्ली बिल क्यों उछाल दिया?',
        a: 'सब्सिडी में 200 और 400 यूनिट पर कठोर कट-ऑफ़ हैं। 201 यूनिट पर आप 100% सब्सिडी खो देते हैं (केवल पहली 200 पर 50% छूट रखते हुए), और 401 यूनिट पर सब्सिडी पूरी तरह चली जाती है — इसलिए एक यूनिट कई सौ रुपये जोड़ सकती है। कट-ऑफ़ के आसपास कुछ यूनिट खपत अगले महीने खिसकाना वाकई फ़ायदेमंद है।' },
    ],

    titleMr: 'तुमचे BSES / दिल्ली वीज बिल कसे वाचावे',
    metaTitleMr: 'तुमचे BSES दिल्ली बिल कसे वाचावे — अनुदान, PPAC व प्रत्येक ओळ',
    descriptionMr: 'BSES राजधानी (BRPL), BSES यमुना (BYPL) आणि Tata Power-DDL च्या दिल्ली वीज बिलांची ओळ-दर-ओळ माहिती: LT-I स्लॅब, श्रेणीबद्ध स्थिर आकार, PPAC, 5% वीज शुल्क, आणि GNCTD अनुदान बिल नेमके शून्य कसे करते.',
    introMr: `दिल्लीची बिले एका मोठ्या कारणाने गोंधळात टाकणारी वाटतात: सारखाच वापर असलेली दोन घरे
      <strong>GNCTD अनुदानामुळे</strong> खूप वेगळी रक्कम भरू शकतात. ही मार्गदर्शिका <strong>BRPL</strong>
      (BSES राजधानी — दक्षिण व पश्चिम दिल्ली), <strong>BYPL</strong> (BSES यमुना — पूर्व व मध्य दिल्ली) किंवा
      <strong>Tata Power-DDL</strong> (उत्तर व उत्तर-पश्चिम दिल्ली) च्या घरगुती (LT-I) बिलाचे स्पष्टीकरण करते,
      जी सर्व एकाच DERC टॅरिफ अनुसूचीवर बिल होतात.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. अनुदान — इतकी दिल्ली बिले ₹0 का असतात</h2>
        <p>दिल्ली सरकारचे अनुदान बिलावरच लागू होते:</p>
        <ul>
          <li><strong>200 युनिट/महिना पर्यंत:</strong> 100% अनुदान — बिल शून्य (शुल्क छापले जातात, मग अनुदान
          ओळ म्हणून उलटवले जातात).</li>
          <li><strong>201–400 युनिट:</strong> पहिल्या 200 युनिटांच्या शुल्कांवर 50% सूट.</li>
          <li><strong>400 युनिटांहून जास्त:</strong> अनुदान नाही — प्रत्येक गोष्टीवर पूर्ण टॅरिफ.</li>
        </ul>
        <p>अनुदान ऐच्छिक आहे (ग्राहक बाहेर पडू शकतात), आणि ते 201 व 401 युनिटवरील "क्लिफ" समजावते: एक
        अतिरिक्त युनिट शेकडो रुपये जोडू शकते. दोन्ही परिस्थिती <a href="/?state=Delhi#calculator">दिल्ली बिल
        कॅल्क्युलेटर</a> मध्ये तपासा, जे अनुदान मॉडेल करते.</p>
      </section>
      <section class="seo-section">
        <h2>2. ऊर्जा आकार — LT-I स्लॅब</h2>
        <p>दिल्लीचे घरगुती स्लॅब 200, 400 व 800 युनिटवर, स्लॅबनिहाय पद्धतीने वाढतात — प्रत्येक दर फक्त
        त्याच्या स्लॅबमधील युनिटांवर लागतो. तुमच्या डिस्कॉमचे सध्याचे प्रति-युनिट दर आमच्या टॅरिफ पेजांवर
        आहेत: <a href="/tariffs/delhi/brpl/">BRPL</a>, <a href="/tariffs/delhi/bypl/">BYPL</a>,
        <a href="/tariffs/delhi/tpddl/">Tata Power-DDL</a>.</p>
      </section>
      <section class="seo-section">
        <h2>3. स्थिर आकार — मंजूर भारानुसार श्रेणीबद्ध</h2>
        <p>दिल्लीचा स्थिर आकार मंजूर भारानुसार (2 kW पर्यंत / 2–5 kW / 5 kW पेक्षा जास्त) बँडेड आहे, म्हणून
        तुम्ही ज्या बँडमध्ये आहात तो नेमक्या kW पेक्षा जास्त महत्त्वाचा. तुमची नोंदलेली मागणी तुमच्या
        बँडपेक्षा बरीच कमी असेल, तर आमची <a href="/mr/guides/reduce-fixed-charges-sanctioned-load/">मंजूर भार
        योग्य करण्याची मार्गदर्शिका</a> पहा.</p>
      </section>
      <section class="seo-section">
        <h2>4. PPAC — दिल्लीचा इंधन अधिभार</h2>
        <p><strong>Power Purchase Adjustment Cost</strong> ही दिल्लीची FPPA आवृत्ती आहे: तुमच्या ऊर्जा +
        स्थिर शुल्कांवर लागू एक DERC-मंजूर टक्केवारी, प्रत्येक डिस्कॉमसाठी वेगळी आणि वेळोवेळी सुधारित (2026
        च्या मध्यापासून मासिक). हीच ती ओळ आहे जी इतर काही न बदलताही तुमचे बिल हलवते — आमची
        <a href="/mr/guides/how-fppa-fuel-surcharge-is-calculated/">FPPA मार्गदर्शिका</a> यंत्रणा समजावते.</p>
      </section>
      <section class="seo-section">
        <h2>5. उरलेल्या ओळी</h2>
        <ul>
          <li><strong>वीज शुल्क:</strong> ऊर्जा शुल्कांवर 5%, दिल्ली अनुसूचीनुसार.</li>
          <li><strong>पेन्शन ट्रस्ट अधिभार / इतर DERC-मंजूर अधिभार:</strong> छोट्या टक्केवारी ओळी ज्या
          DERC वेळोवेळी मंजूर करते.</li>
          <li><strong>थकबाकी व LPSC:</strong> न भरलेल्या मागील रकमा सोबत विलंब-भरणा अधिभार.</li>
        </ul>
        <p>एकूण तपासण्यासाठी: <a href="/?state=Delhi#calculator">कॅल्क्युलेटर</a> मध्ये तुमची युनिटे व भार
        टाका, अनुदान चालू करा, तुमच्या बिलावर छापलेली PPAC टक्केवारी जोडा, आणि ओळ-दर-ओळ तुलना करा. काही
        रुपयांहून जास्त न जुळणे सहसा मीटर-स्थिती कोड (अंदाजित रीडिंग) किंवा थकबाकीपर्यंत जाते.</p>
      </section>`,
    faqsMr: [
      { q: 'माझे दिल्ली वीज बिल शून्य का आहे?',
        a: 'GNCTD घरगुती अनुदानामुळे: महिन्याला 200 युनिटपर्यंत वापरणाऱ्या ग्राहकांना 100% अनुदान मिळते, म्हणून मोजलेले शुल्क बिलावर पूर्णपणे उलटवले जातात. 201+ युनिट वापरल्यास अनुदान घटून पहिल्या 200 युनिटवर 50% सूट राहते; 400 युनिटांहून जास्त कोणतेही अनुदान नाही.' },
      { q: 'BSES किंवा Tata Power-DDL बिलावर PPAC म्हणजे काय?',
        a: 'PPAC (Power Purchase Adjustment Cost) हा दिल्लीचा इंधन-खर्च अधिभार आहे — ऊर्जा व स्थिर शुल्कांवर लागू एक DERC-मंजूर टक्केवारी, BRPL, BYPL व Tata Power-DDL साठी वेगळी मंजूर व वेळोवेळी सुधारित. म्हणूनच सारख्या वापरावरही बिले महिन्या-महिन्याला बदलतात.' },
      { q: 'BRPL, BYPL आणि Tata Power-DDL चे टॅरिफ वेगळे आहेत का?',
        a: 'DERC टॅरिफ अनुसूची (स्लॅब, स्थिर आकार, शुल्क) दिल्लीच्या खाजगी डिस्कॉममध्ये एकसारखी आहे; जे वेगळे आहे ते सेवा क्षेत्र, लागू PPAC टक्केवारी आणि बिलिंग पोर्टल. तुमचा डिस्कॉम तुमच्या राहण्याच्या जागेवरून ठरतो, निवडीने नव्हे.' },
      { q: 'एका अतिरिक्त युनिटने माझे दिल्ली बिल का उसळले?',
        a: 'अनुदानाला 200 व 400 युनिटवर कठोर कट-ऑफ आहेत. 201 युनिटवर तुम्ही 100% अनुदान गमावता (फक्त पहिल्या 200 वर 50% सूट ठेवत), आणि 401 युनिटवर अनुदान पूर्णपणे जाते — म्हणून एक युनिट कित्येक शंभर रुपये जोडू शकते. कट-ऑफभोवतीची काही युनिटे पुढील महिन्यात सरकवणे खरोखर फायद्याचे.' },
    ],
  },

  {
    slug: 'how-to-read-msedcl-bill',
    published: "2025-10-26",
    states: ['Maharashtra'],
    title: 'How to Read Your MSEDCL (Mahavitaran) Electricity Bill',
    metaTitle: 'How to Read Your MSEDCL Bill — Slabs, FAC, Wheeling & 16% Duty',
    description: 'A line-by-line walkthrough of an MSEDCL (Mahavitaran) electricity bill: LT-1 residential slabs at 100/300/500 units, tiered fixed charges, fuel adjustment (FAC), wheeling charge, Maharashtra’s 16% electricity duty and how to verify the total.',
    minutes: 6,
    intro: `MSEDCL (Mahavitaran) serves nearly all of Maharashtra outside Mumbai city — Mumbai
      itself is split between <a href="/tariffs/maharashtra/adani_mumbai/">Adani Electricity</a>,
      <a href="/tariffs/maharashtra/best_mumbai/">BEST</a> and
      <a href="/tariffs/maharashtra/tata_power_mumbai/">Tata Power</a>. Maharashtra bills carry more
      separate charge lines than most states, and one of India's steepest electricity duties, so the
      total often surprises people who moved from elsewhere.`,
    sections: `
      <section class="seo-section">
        <h2>1. Energy charge — LT-1 slabs that climb steeply</h2>
        <p>Residential (LT-1) consumption is priced slab-wise with slab boundaries at
        <strong>100, 300 and 500 units</strong> — and the jump between the first and last slab is
        roughly threefold, one of the steepest in India. That is why a heavy-AC month hurts
        disproportionately. Current rates are on the
        <a href="/tariffs/maharashtra/msedcl/">MSEDCL tariff page</a>.</p>
      </section>
      <section class="seo-section">
        <h2>2. Fixed charge — banded by sanctioned load</h2>
        <p>MSEDCL's fixed charge is tiered by load band (up to 1 kW, 1–2 kW, 2–5 kW, 5–10 kW,
        above 10 kW), so crossing a band boundary changes the monthly amount in a step. If your
        recorded demand runs well under your band, read our
        <a href="/guides/reduce-fixed-charges-sanctioned-load/">sanctioned-load guide</a> —
        Maharashtra also bills excess demand at 1.5×, so don't over-trim.</p>
      </section>
      <section class="seo-section">
        <h2>3. The pass-through lines: FAC and wheeling</h2>
        <ul>
          <li><strong>FAC (Fuel Adjustment Charge):</strong> Maharashtra's fuel surcharge, a ₹/unit
          amount revised periodically. See
          <a href="/guides/how-fppa-fuel-surcharge-is-calculated/">how fuel surcharges are
          calculated</a>.</li>
          <li><strong>Wheeling charge:</strong> a separate ₹/unit line for using the distribution
          network — MSEDCL prints it separately from the energy charge, which is unusual and makes
          the per-unit rate look lower than the effective rate.</li>
        </ul>
      </section>
      <section class="seo-section">
        <h2>4. Electricity duty — the 16% line</h2>
        <p>Maharashtra levies one of the country's highest domestic electricity duties (16% on
        residential energy charges in the current schedule). On a large bill the ED line alone can
        exceed the fixed charge — read <a href="/guides/electricity-duty-explained/">our duty
        guide</a> for how it compares across states.</p>
      </section>
      <section class="seo-section">
        <h2>5. Verify the total in 30 seconds</h2>
        <p>Enter your units and sanctioned load in the
        <a href="/?state=Maharashtra#calculator">MSEDCL bill calculator</a> and compare each line —
        energy, fixed, duty — against the printed bill. Common causes of mismatch: an estimated
        reading (check the meter-status code), a billing period longer than 30 days pushing units
        into higher slabs, or arrears with interest.</p>
      </section>`,
    faqs: [
      { q: 'Why is the MSEDCL per-unit rate on my bill lower than what I actually pay?',
        a: 'MSEDCL prints the energy charge and the wheeling charge as separate ₹/unit lines, and then adds FAC and 16% electricity duty on top. Your effective per-unit cost is the sum of all of these — typically well above the headline slab rate.' },
      { q: 'What is the wheeling charge on a Mahavitaran bill?',
        a: 'It is the regulated fee for carrying power over the distribution network, billed per unit. Most states fold it into the energy rate; Maharashtra shows it separately, which changes the presentation but not the total.' },
      { q: 'Why is electricity duty so high in Maharashtra?',
        a: 'Electricity duty is state legislation, and Maharashtra has chosen one of the highest domestic rates in India (16% on residential energy charges in the current schedule). It is a state tax collected through the bill, not an MSEDCL charge.' },
      { q: 'Does MSEDCL serve Mumbai?',
        a: 'Mostly no. Mumbai city and suburbs are served by BEST (island city), Adani Electricity (most suburbs) and Tata Power (pockets); MSEDCL covers essentially the rest of Maharashtra, including Navi Mumbai, Thane beyond the BEST/Adani areas, Pune, Nagpur and rural Maharashtra.' },
    ],

    titleHi: 'अपना MSEDCL (महावितरण) बिजली बिल कैसे पढ़ें',
    metaTitleHi: 'अपना MSEDCL बिल कैसे पढ़ें — स्लैब, FAC, व्हीलिंग व 16% शुल्क',
    descriptionHi: 'MSEDCL (महावितरण) बिजली बिल की लाइन-दर-लाइन व्याख्या: 100/300/500 यूनिट पर LT-1 आवासीय स्लैब, श्रेणीबद्ध फिक्स्ड चार्ज, ईंधन समायोजन (FAC), व्हीलिंग शुल्क, महाराष्ट्र का 16% बिजली शुल्क और कुल कैसे जाँचें।',
    introHi: `MSEDCL (महावितरण) मुंबई को छोड़कर लगभग पूरे महाराष्ट्र को बिजली देती है — मुंबई खुद
      <a href="/hi/tariffs/maharashtra/adani_mumbai/">Adani Electricity</a>,
      <a href="/hi/tariffs/maharashtra/best_mumbai/">BEST</a> और
      <a href="/hi/tariffs/maharashtra/tata_power_mumbai/">Tata Power</a> में बँटी है। महाराष्ट्र के बिलों
      पर अधिकांश राज्यों से ज़्यादा अलग शुल्क लाइनें होती हैं, और भारत के सबसे ऊँचे बिजली शुल्कों में से एक,
      इसलिए कुल अक्सर उन लोगों को चौंका देता है जो कहीं और से आए हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. ऊर्जा शुल्क — LT-1 स्लैब जो तेज़ी से चढ़ते हैं</h2>
        <p>आवासीय (LT-1) खपत स्लैब-वार मूल्यांकित होती है, स्लैब सीमाएँ
        <strong>100, 300 व 500 यूनिट</strong> पर — और पहले व आख़िरी स्लैब के बीच का उछाल लगभग तीन गुना है,
        भारत में सबसे तीव्र में से एक। इसीलिए भारी-AC वाला महीना अनुपात से ज़्यादा चुभता है। वर्तमान दरें
        <a href="/hi/tariffs/maharashtra/msedcl/">MSEDCL टैरिफ पेज</a> पर हैं।</p>
      </section>
      <section class="seo-section">
        <h2>2. फिक्स्ड चार्ज — स्वीकृत भार के अनुसार बैंडेड</h2>
        <p>MSEDCL का फिक्स्ड चार्ज भार बैंड (1 kW तक, 1–2 kW, 2–5 kW, 5–10 kW, 10 kW से ऊपर) के अनुसार
        श्रेणीबद्ध है, इसलिए किसी बैंड सीमा को पार करना मासिक राशि एक कदम में बदल देता है। अगर आपकी दर्ज मांग
        आपके बैंड से काफ़ी नीचे चलती है, तो हमारी
        <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">स्वीकृत-भार गाइड</a> पढ़ें — महाराष्ट्र
        अतिरिक्त मांग को 1.5× पर भी बिल करता है, इसलिए ज़्यादा न छाँटें।</p>
      </section>
      <section class="seo-section">
        <h2>3. पास-थ्रू लाइनें: FAC और व्हीलिंग</h2>
        <ul>
          <li><strong>FAC (Fuel Adjustment Charge):</strong> महाराष्ट्र का ईंधन अधिभार, एक ₹/यूनिट राशि जो
          समय-समय पर संशोधित होती है। देखें
          <a href="/hi/guides/how-fppa-fuel-surcharge-is-calculated/">ईंधन अधिभार कैसे निकाले जाते हैं</a>।</li>
          <li><strong>व्हीलिंग शुल्क:</strong> वितरण नेटवर्क इस्तेमाल के लिए एक अलग ₹/यूनिट लाइन — MSEDCL इसे
          ऊर्जा शुल्क से अलग छापता है, जो असामान्य है और प्रति-यूनिट दर को प्रभावी दर से कम दिखाता है।</li>
        </ul>
      </section>
      <section class="seo-section">
        <h2>4. बिजली शुल्क — 16% वाली लाइन</h2>
        <p>महाराष्ट्र देश के सबसे ऊँचे घरेलू बिजली शुल्कों में से एक लगाता है (वर्तमान अनुसूची में आवासीय
        ऊर्जा शुल्कों पर 16%)। बड़े बिल पर अकेली ED लाइन फिक्स्ड चार्ज से भी ज़्यादा हो सकती है — राज्यों में
        तुलना के लिए <a href="/hi/guides/electricity-duty-explained/">हमारी शुल्क गाइड</a> पढ़ें।</p>
      </section>
      <section class="seo-section">
        <h2>5. कुल 30 सेकंड में जाँचें</h2>
        <p><a href="/?state=Maharashtra#calculator">MSEDCL बिल कैलकुलेटर</a> में अपनी यूनिटें व स्वीकृत भार
        डालें और हर लाइन — ऊर्जा, फिक्स्ड, शुल्क — की छपे बिल से तुलना करें। बेमेल के आम कारण: अनुमानित रीडिंग
        (मीटर-स्थिति कोड जाँचें), 30 दिन से लंबी बिलिंग अवधि जो यूनिटों को ऊँचे स्लैब में धकेलती है, या ब्याज
        सहित बकाया।</p>
      </section>`,
    faqsHi: [
      { q: 'मेरे बिल पर MSEDCL प्रति-यूनिट दर मेरे वास्तविक भुगतान से कम क्यों है?',
        a: 'MSEDCL ऊर्जा शुल्क और व्हीलिंग शुल्क को अलग ₹/यूनिट लाइनों के रूप में छापता है, और फिर उस पर FAC व 16% बिजली शुल्क जोड़ता है। आपकी प्रभावी प्रति-यूनिट लागत इन सबका योग है — आम तौर पर हेडलाइन स्लैब दर से काफ़ी ऊपर।' },
      { q: 'महावितरण बिल पर व्हीलिंग शुल्क क्या है?',
        a: 'यह वितरण नेटवर्क पर बिजली ले जाने का विनियमित शुल्क है, प्रति यूनिट बिल किया गया। अधिकांश राज्य इसे ऊर्जा दर में समेट लेते हैं; महाराष्ट्र इसे अलग दिखाता है, जो प्रस्तुति बदलता है, कुल नहीं।' },
      { q: 'महाराष्ट्र में बिजली शुल्क इतना ऊँचा क्यों है?',
        a: 'बिजली शुल्क राज्य विधान है, और महाराष्ट्र ने भारत की सबसे ऊँची घरेलू दरों में से एक चुनी है (वर्तमान अनुसूची में आवासीय ऊर्जा शुल्कों पर 16%)। यह बिल के ज़रिए वसूला गया राज्य कर है, MSEDCL शुल्क नहीं।' },
      { q: 'क्या MSEDCL मुंबई को बिजली देती है?',
        a: 'ज़्यादातर नहीं। मुंबई शहर व उपनगर BEST (द्वीप शहर), Adani Electricity (अधिकांश उपनगर) और Tata Power (कुछ इलाके) द्वारा सेवित हैं; MSEDCL मूलतः बाक़ी महाराष्ट्र को कवर करती है, जिसमें नवी मुंबई, BEST/Adani क्षेत्रों से परे ठाणे, पुणे, नागपुर और ग्रामीण महाराष्ट्र शामिल हैं।' },
    ],

    titleMr: 'तुमचे MSEDCL (महावितरण) वीज बिल कसे वाचावे',
    metaTitleMr: 'तुमचे MSEDCL बिल कसे वाचावे — स्लॅब, FAC, व्हीलिंग व 16% शुल्क',
    descriptionMr: 'MSEDCL (महावितरण) वीज बिलाची ओळ-दर-ओळ माहिती: 100/300/500 युनिटवर LT-1 निवासी स्लॅब, श्रेणीबद्ध स्थिर आकार, इंधन समायोजन (FAC), व्हीलिंग शुल्क, महाराष्ट्राचे 16% वीज शुल्क आणि एकूण कसे तपासावे.',
    introMr: `MSEDCL (महावितरण) मुंबई शहर वगळता जवळपास संपूर्ण महाराष्ट्राला वीज पुरवते — मुंबई स्वतः
      <a href="/mr/tariffs/maharashtra/adani_mumbai/">Adani Electricity</a>,
      <a href="/mr/tariffs/maharashtra/best_mumbai/">BEST</a> आणि
      <a href="/mr/tariffs/maharashtra/tata_power_mumbai/">Tata Power</a> मध्ये विभागली आहे. महाराष्ट्राच्या
      बिलांवर बहुतेक राज्यांपेक्षा जास्त वेगळ्या शुल्क ओळी असतात, आणि भारतातील सर्वात जास्त वीज शुल्कांपैकी
      एक, त्यामुळे एकूण रक्कम इतरत्रून आलेल्या लोकांना अनेकदा चकित करते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. ऊर्जा शुल्क — LT-1 स्लॅब जे झपाट्याने वाढतात</h2>
        <p>निवासी (LT-1) वापर स्लॅबनिहाय पद्धतीने आकारला जातो, स्लॅब सीमा
        <strong>100, 300 व 500 युनिट</strong> वर — आणि पहिल्या व शेवटच्या स्लॅबमधील उडी जवळपास तिप्पट आहे,
        भारतातील सर्वात तीव्रांपैकी एक. म्हणूनच जास्त-AC चा महिना प्रमाणापेक्षा जास्त झोंबतो. सध्याचे दर
        <a href="/mr/tariffs/maharashtra/msedcl/">MSEDCL टॅरिफ पेज</a> वर आहेत.</p>
      </section>
      <section class="seo-section">
        <h2>2. स्थिर आकार — मंजूर भारानुसार बँडेड</h2>
        <p>MSEDCL चा स्थिर आकार भार बँडनुसार (1 kW पर्यंत, 1–2 kW, 2–5 kW, 5–10 kW, 10 kW पेक्षा जास्त)
        श्रेणीबद्ध आहे, त्यामुळे एखादी बँड सीमा ओलांडल्यास मासिक रक्कम एका टप्प्यात बदलते. जर तुमची नोंदलेली
        मागणी तुमच्या बँडपेक्षा बरीच कमी असेल, तर आमची
        <a href="/mr/guides/reduce-fixed-charges-sanctioned-load/">मंजूर-भार मार्गदर्शिका</a> वाचा —
        महाराष्ट्र अतिरिक्त मागणी 1.5× ने बिल करतो, त्यामुळे जास्त कापू नका.</p>
      </section>
      <section class="seo-section">
        <h2>3. पास-थ्रू ओळी: FAC आणि व्हीलिंग</h2>
        <ul>
          <li><strong>FAC (Fuel Adjustment Charge):</strong> महाराष्ट्राचा इंधन अधिभार, एक ₹/युनिट रक्कम जी
          वेळोवेळी सुधारली जाते. पहा
          <a href="/mr/guides/how-fppa-fuel-surcharge-is-calculated/">इंधन अधिभार कसे मोजले जातात</a>.</li>
          <li><strong>व्हीलिंग शुल्क:</strong> वितरण नेटवर्क वापरासाठी एक वेगळी ₹/युनिट ओळ — MSEDCL ते ऊर्जा
          शुल्कापासून वेगळे छापते, जे असामान्य आहे आणि प्रति-युनिट दर प्रभावी दरापेक्षा कमी दाखवते.</li>
        </ul>
      </section>
      <section class="seo-section">
        <h2>4. वीज शुल्क — 16% ची ओळ</h2>
        <p>महाराष्ट्र देशातील सर्वात जास्त घरगुती वीज शुल्कांपैकी एक आकारतो (सध्याच्या अनुसूचीत निवासी ऊर्जा
        शुल्कांवर 16%). मोठ्या बिलावर एकटी ED ओळ स्थिर आकारापेक्षाही जास्त असू शकते — राज्यांमधील तुलनेसाठी
        <a href="/mr/guides/electricity-duty-explained/">आमची शुल्क मार्गदर्शिका</a> वाचा.</p>
      </section>
      <section class="seo-section">
        <h2>5. एकूण 30 सेकंदात तपासा</h2>
        <p><a href="/?state=Maharashtra#calculator">MSEDCL बिल कॅल्क्युलेटर</a> मध्ये तुमची युनिटे व मंजूर भार
        टाका आणि प्रत्येक ओळ — ऊर्जा, स्थिर, शुल्क — छापील बिलाशी तुलना करा. न जुळण्याची सामान्य कारणे:
        अंदाजित रीडिंग (मीटर-स्थिती कोड तपासा), 30 दिवसांपेक्षा जास्त बिलिंग कालावधी जो युनिटांना उच्च
        स्लॅबमध्ये ढकलतो, किंवा व्याजासह थकबाकी.</p>
      </section>`,
    faqsMr: [
      { q: 'माझ्या बिलावरील MSEDCL प्रति-युनिट दर माझ्या प्रत्यक्ष भरण्यापेक्षा कमी का आहे?',
        a: 'MSEDCL ऊर्जा शुल्क आणि व्हीलिंग शुल्क वेगळ्या ₹/युनिट ओळींमध्ये छापते, आणि त्यावर FAC व 16% वीज शुल्क जोडते. तुमची प्रभावी प्रति-युनिट किंमत या सर्वांची बेरीज आहे — सहसा हेडलाइन स्लॅब दरापेक्षा बरीच जास्त.' },
      { q: 'महावितरण बिलावरील व्हीलिंग शुल्क म्हणजे काय?',
        a: 'वितरण नेटवर्कवरून वीज वाहून नेण्याचे हे नियंत्रित शुल्क आहे, प्रति युनिट आकारले जाते. बहुतेक राज्ये ते ऊर्जा दरात समाविष्ट करतात; महाराष्ट्र ते वेगळे दाखवते, ज्यामुळे सादरीकरण बदलते, एकूण नाही.' },
      { q: 'महाराष्ट्रात वीज शुल्क इतके जास्त का आहे?',
        a: 'वीज शुल्क हे राज्याचे कायदे आहे, आणि महाराष्ट्राने भारतातील सर्वात जास्त घरगुती दरांपैकी एक निवडली आहे (सध्याच्या अनुसूचीत निवासी ऊर्जा शुल्कांवर 16%). हा बिलामार्फत वसूल केलेला राज्य कर आहे, MSEDCL शुल्क नाही.' },
      { q: 'MSEDCL मुंबईला वीज पुरवते का?',
        a: 'बहुतांशी नाही. मुंबई शहर व उपनगरे BEST (बेट शहर), Adani Electricity (बहुतेक उपनगरे) आणि Tata Power (काही भाग) यांच्याद्वारे सेवा दिली जातात; MSEDCL मूलतः उर्वरित महाराष्ट्र कव्हर करते, ज्यात नवी मुंबई, BEST/Adani क्षेत्रांपलीकडील ठाणे, पुणे, नागपूर आणि ग्रामीण महाराष्ट्र समाविष्ट आहे.' },
    ],

    titleTa: 'உங்கள் MSEDCL (மகாவிதரண்) மின் பில்லை எப்படிப் படிப்பது',
    metaTitleTa: 'உங்கள் MSEDCL பில்லை எப்படிப் படிப்பது — ஸ்லாப், FAC, வீலிங் & 16% வரி',
    descriptionTa: 'MSEDCL (மகாவிதரண்) மின் பில்லின் வரிக்கு வரி விளக்கம்: 100/300/500 யூனிட்டில் LT-1 குடியிருப்பு ஸ்லாப்கள், அடுக்கு நிலையான கட்டணம், எரிபொருள் சரிசெய்தல் (FAC), வீலிங் கட்டணம், மகாராஷ்டிராவின் 16% மின் வரி மற்றும் மொத்தத்தை எப்படிச் சரிபார்ப்பது.',
    introTa: `MSEDCL (மகாவிதரண்) மும்பை நகரம் தவிர கிட்டத்தட்ட முழு மகாராஷ்டிராவுக்கும் மின்சாரம் வழங்குகிறது —
      மும்பை தானே <a href="/ta/tariffs/maharashtra/adani_mumbai/">Adani Electricity</a>,
      <a href="/ta/tariffs/maharashtra/best_mumbai/">BEST</a> மற்றும்
      <a href="/ta/tariffs/maharashtra/tata_power_mumbai/">Tata Power</a> இடையே பிரிக்கப்பட்டுள்ளது. மகாராஷ்டிரா
      பில்கள் பெரும்பாலான மாநிலங்களை விட அதிகத் தனிக் கட்டண வரிகளைக் கொண்டுள்ளன, மேலும் இந்தியாவின் மிக அதிக
      மின் வரிகளில் ஒன்று, எனவே மொத்தம் பெரும்பாலும் வேறு இடங்களிலிருந்து வந்தவர்களை ஆச்சரியப்படுத்துகிறது.`,
    sectionsTa: `
      <section class="seo-section">
        <h2>1. ஆற்றல் கட்டணம் — செங்குத்தாக ஏறும் LT-1 ஸ்லாப்கள்</h2>
        <p>குடியிருப்பு (LT-1) நுகர்வு அடுக்கு வாரியாக விலை நிர்ணயிக்கப்படுகிறது, ஸ்லாப் எல்லைகள்
        <strong>100, 300 மற்றும் 500 யூனிட்டில்</strong> — முதல் மற்றும் கடைசி ஸ்லாப்பிற்கு இடையிலான தாவல்
        ஏறக்குறைய மூன்று மடங்கு, இந்தியாவில் மிகக் கடுமையானவற்றில் ஒன்று. அதனால்தான் அதிக-AC மாதம் விகிதத்திற்கு
        மீறி வலிக்கிறது. தற்போதைய கட்டணங்கள் <a href="/ta/tariffs/maharashtra/msedcl/">MSEDCL கட்டணப் பக்கத்தில்</a>
        உள்ளன.</p>
      </section>
      <section class="seo-section">
        <h2>2. நிலையான கட்டணம் — அனுமதிக்கப்பட்ட சுமைக்கு ஏற்ப பட்டையிடப்பட்டது</h2>
        <p>MSEDCL இன் நிலையான கட்டணம் சுமை பட்டைகளின்படி (1 kW வரை, 1–2 kW, 2–5 kW, 5–10 kW, 10 kW க்கு மேல்)
        அடுக்கப்படுகிறது, எனவே ஒரு பட்டை எல்லையைக் கடப்பது மாதாந்திரத் தொகையை ஒரே படியில் மாற்றுகிறது. உங்கள்
        பதிவு செய்யப்பட்ட தேவை உங்கள் பட்டையை விட மிகக் குறைவாக இருந்தால், எங்கள்
        <a href="/ta/guides/reduce-fixed-charges-sanctioned-load/">அனுமதிக்கப்பட்ட-சுமை வழிகாட்டியைப்</a>
        படியுங்கள் — மகாராஷ்டிரா கூடுதல் தேவையை 1.5× இல் பில் செய்கிறது, எனவே அதிகமாகக் குறைக்காதீர்கள்.</p>
      </section>
      <section class="seo-section">
        <h2>3. பாஸ்-த்ரூ வரிகள்: FAC மற்றும் வீலிங்</h2>
        <ul>
          <li><strong>FAC (Fuel Adjustment Charge):</strong> மகாராஷ்டிராவின் எரிபொருள் கூடுதல் கட்டணம்,
          அவ்வப்போது திருத்தப்படும் ஒரு ₹/யூனிட் தொகை. <a href="/ta/guides/how-fppa-fuel-surcharge-is-calculated/">எரிபொருள்
          கூடுதல் கட்டணங்கள் எப்படிக் கணக்கிடப்படுகின்றன</a> என்பதைப் பார்க்கவும்.</li>
          <li><strong>வீலிங் கட்டணம்:</strong> விநியோக வலையமைப்பைப் பயன்படுத்துவதற்கான தனி ₹/யூனிட் வரி —
          MSEDCL அதை ஆற்றல் கட்டணத்திலிருந்து தனியாக அச்சிடுகிறது, இது வழக்கத்திற்கு மாறானது மற்றும் ஒரு யூனிட்
          கட்டணத்தை உண்மையான கட்டணத்தை விடக் குறைவாகக் காட்டுகிறது.</li>
        </ul>
      </section>
      <section class="seo-section">
        <h2>4. மின் வரி — 16% வரி</h2>
        <p>மகாராஷ்டிரா நாட்டின் மிக அதிக வீட்டு மின் வரிகளில் ஒன்றை விதிக்கிறது (தற்போதைய அட்டவணையில்
        குடியிருப்பு ஆற்றல் கட்டணங்களில் 16%). ஒரு பெரிய பில்லில் ED வரி மட்டுமே நிலையான கட்டணத்தை விட
        அதிகமாக இருக்கலாம் — மாநிலங்களுக்கிடையே ஒப்பிடுவதற்கு <a href="/ta/guides/electricity-duty-explained/">எங்கள்
        வரி வழிகாட்டியைப்</a> படியுங்கள்.</p>
      </section>
      <section class="seo-section">
        <h2>5. 30 வினாடிகளில் மொத்தத்தைச் சரிபார்க்கவும்</h2>
        <p><a href="/?state=Maharashtra#calculator">MSEDCL பில் கால்குலேட்டரில்</a> உங்கள் யூனிட்கள் மற்றும்
        அனுமதிக்கப்பட்ட சுமையை உள்ளிட்டு ஒவ்வொரு வரியையும் — ஆற்றல், நிலையான, வரி — அச்சிடப்பட்ட பில்லுடன்
        ஒப்பிடுங்கள். பொருந்தாமைக்கான பொதுவான காரணங்கள்: மதிப்பிடப்பட்ட ரீடிங் (மீட்டர்-நிலைக் குறியீட்டைச்
        சரிபார்க்கவும்), 30 நாட்களுக்கு மேல் நீளும் பில்லிங் காலம் யூனிட்களை உயர் ஸ்லாப்பிற்குத் தள்ளுகிறது,
        அல்லது வட்டியுடன் நிலுவைத் தொகை.</p>
      </section>`,
    faqsTa: [
      { q: 'என் பில்லில் MSEDCL ஒரு யூனிட் கட்டணம் நான் உண்மையில் செலுத்துவதை விட ஏன் குறைவாக உள்ளது?',
        a: 'MSEDCL ஆற்றல் கட்டணத்தையும் வீலிங் கட்டணத்தையும் தனி ₹/யூனிட் வரிகளாக அச்சிடுகிறது, பின்னர் அதன் மேல் FAC மற்றும் 16% மின் வரியைச் சேர்க்கிறது. உங்கள் உண்மையான ஒரு யூனிட் செலவு இவை அனைத்தின் கூட்டுத்தொகை — பொதுவாகத் தலைப்பு ஸ்லாப் கட்டணத்தை விட அதிகமாக.' },
      { q: 'மகாவிதரண் பில்லில் வீலிங் கட்டணம் என்றால் என்ன?',
        a: 'இது விநியோக வலையமைப்பின் மூலம் மின்சாரத்தைக் கொண்டு செல்வதற்கான ஒழுங்குபடுத்தப்பட்ட கட்டணம், ஒரு யூனிட்டுக்குப் பில் செய்யப்படுகிறது. பெரும்பாலான மாநிலங்கள் அதை ஆற்றல் கட்டணத்தில் சேர்க்கின்றன; மகாராஷ்டிரா அதைத் தனியாகக் காட்டுகிறது, இது வழங்கலை மாற்றுகிறது, மொத்தத்தை அல்ல.' },
      { q: 'மகாராஷ்டிராவில் மின் வரி ஏன் இவ்வளவு அதிகமாக உள்ளது?',
        a: 'மின் வரி என்பது மாநிலச் சட்டம், மற்றும் மகாராஷ்டிரா இந்தியாவின் மிக அதிக வீட்டுக் கட்டணங்களில் ஒன்றைத் தேர்ந்தெடுத்துள்ளது (தற்போதைய அட்டவணையில் குடியிருப்பு ஆற்றல் கட்டணங்களில் 16%). இது பில் மூலம் வசூலிக்கப்படும் மாநில வரி, MSEDCL கட்டணம் அல்ல.' },
      { q: 'MSEDCL மும்பைக்கு மின்சாரம் வழங்குகிறதா?',
        a: 'பெரும்பாலும் இல்லை. மும்பை நகரம் மற்றும் புறநகர்ப் பகுதிகள் BEST (தீவு நகரம்), Adani Electricity (பெரும்பாலான புறநகர்கள்) மற்றும் Tata Power (சில பகுதிகள்) மூலம் சேவை செய்யப்படுகின்றன; MSEDCL அடிப்படையில் மீதமுள்ள மகாராஷ்டிராவை உள்ளடக்கியது, இதில் நவி மும்பை, BEST/Adani பகுதிகளுக்கு அப்பாற்பட்ட தானே, புனே, நாக்பூர் மற்றும் கிராமப்புற மகாராஷ்டிரா அடங்கும்.' },
    ],
  },

  {
    slug: 'how-to-read-bescom-bill',
    published: "2025-11-07",
    states: ['Karnataka'],
    title: 'How to Read Your BESCOM Electricity Bill',
    metaTitle: 'How to Read Your BESCOM Bill — Gruha Jyoti, Slabs & Fixed Charges',
    description: 'A line-by-line guide to BESCOM (Bengaluru) electricity bills: LT-1 slabs starting at 30 units, duty-inclusive tariffs, sanctioned-load fixed charges, and how the Gruha Jyoti free-electricity scheme decides whether you pay at all.',
    minutes: 5,
    intro: `BESCOM bills Bengaluru and seven surrounding districts, on the same KERC-approved
      schedule as Karnataka's other DISCOMs (MESCOM, CESC, GESCOM, HESCOM). Two things make a
      Karnataka bill read differently from other states: the tariff is
      <strong>duty-inclusive</strong> (no separate ED line), and the
      <strong>Gruha Jyoti</strong> scheme zeroes out a large share of domestic bills.`,
    sections: `
      <section class="seo-section">
        <h2>1. Gruha Jyoti — the free-units scheme</h2>
        <p>Under Gruha Jyoti, registered domestic consumers get their usage free up to an
        entitlement based on their historical average consumption (capped around 200 units). Use
        less than your entitlement and the bill prints ₹0; exceed it and you pay for the
        <em>entire</em> consumption, not just the excess — which is why one heavy month can bring a
        surprisingly full bill. The <a href="/?state=Karnataka#calculator">Karnataka calculator</a>
        models the scheme when you opt in.</p>
      </section>
      <section class="seo-section">
        <h2>2. Energy charge — slabs that start at 30 units</h2>
        <p>Karnataka's LT-1 slab ladder is unusually fine-grained at the bottom: a low first slab
        for the first 30 units, then steps at 100, 200 and 500 units (slab-wise). Current rates are
        on the <a href="/tariffs/karnataka/bescom/">BESCOM tariff page</a> — and because the
        schedule is state-wide, the same rates apply on
        <a href="/tariffs/karnataka/mescom/">MESCOM</a>, <a href="/tariffs/karnataka/cesc_karnataka/">CESC</a>,
        <a href="/tariffs/karnataka/gescom/">GESCOM</a> and <a href="/tariffs/karnataka/hescom/">HESCOM</a>.</p>
      </section>
      <section class="seo-section">
        <h2>3. Fixed charge — by phase and load</h2>
        <p>The fixed charge is banded (single-phase up to 2.5 kW, then higher bands), billed on your
        sanctioned load every month including zero-usage months. Over-sanctioned? See
        <a href="/guides/reduce-fixed-charges-sanctioned-load/">how to right-size your load</a>.</p>
      </section>
      <section class="seo-section">
        <h2>4. No electricity-duty line — it's already inside</h2>
        <p>Karnataka publishes duty-inclusive tariffs: the slab rates already contain the state's
        taxes, so unlike <a href="/guides/how-to-read-msedcl-bill/">Maharashtra</a> or Delhi there
        is no separate ED percentage at the bottom of the bill. When comparing states, remember the
        BESCOM headline rate is closer to the true effective rate than most.</p>
      </section>
      <section class="seo-section">
        <h2>5. Verify the total</h2>
        <ol>
          <li>Check units = (current − previous reading) × MF.</li>
          <li>Recompute the slab maths on the <a href="/tariffs/karnataka/bescom/">tariff page</a>,
          or just enter units + load in the <a href="/?state=Karnataka#calculator">calculator</a>.</li>
          <li>If Gruha Jyoti applied last month but not this month, the cause is almost always
          consumption above your entitlement — compare the units, not the rupees.</li>
        </ol>
      </section>`,
    faqs: [
      { q: 'Why did my BESCOM bill suddenly go from zero to full amount?',
        a: 'Gruha Jyoti gives free electricity only up to your entitlement (based on historical average use, capped around 200 units). Exceed it and the whole month’s consumption is billed at the normal slab rates — not just the units above the limit. Check your units against your entitlement printed on the bill.' },
      { q: 'Why is there no electricity duty line on my BESCOM bill?',
        a: 'Karnataka publishes duty-inclusive tariffs: the KERC slab rates already include state levies, so no separate ED percentage is added at the bottom. The headline rate is therefore closer to your true per-unit cost than in states like Maharashtra.' },
      { q: 'Do all Karnataka DISCOMs charge the same rates as BESCOM?',
        a: 'Yes — BESCOM, MESCOM, CESC, GESCOM and HESCOM all bill on the same KERC-approved state schedule. What differs is the service area and the billing portal, not the tariff.' },
      { q: 'How do I register for Gruha Jyoti?',
        a: 'Registration is through the Karnataka government’s Seva Sindhu portal with your consumer number and Aadhaar. Once registered, the entitlement (your average consumption, capped) is printed on the bill and usage up to it is free each month.' },
    ],

    titleHi: 'अपना BESCOM बिजली बिल कैसे पढ़ें',
    metaTitleHi: 'अपना BESCOM बिल कैसे पढ़ें — गृह ज्योति, स्लैब व फिक्स्ड चार्ज',
    descriptionHi: 'BESCOM (बेंगलुरु) बिजली बिलों की लाइन-दर-लाइन गाइड: 30 यूनिट से शुरू होने वाले LT-1 स्लैब, शुल्क-समावेशी टैरिफ, स्वीकृत-भार फिक्स्ड चार्ज, और गृह ज्योति मुफ़्त-बिजली योजना यह कैसे तय करती है कि आप बिल भरते भी हैं या नहीं।',
    introHi: `BESCOM बेंगलुरु और आसपास के सात ज़िलों को बिल करती है, कर्नाटक की अन्य डिस्कॉम (MESCOM, CESC,
      GESCOM, HESCOM) जैसी ही KERC-स्वीकृत अनुसूची पर। दो चीज़ें कर्नाटक बिल को अन्य राज्यों से अलग बनाती
      हैं: टैरिफ <strong>शुल्क-समावेशी</strong> है (कोई अलग ED लाइन नहीं), और <strong>गृह ज्योति</strong>
      योजना घरेलू बिलों का बड़ा हिस्सा शून्य कर देती है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. गृह ज्योति — मुफ़्त-यूनिट योजना</h2>
        <p>गृह ज्योति के तहत, पंजीकृत घरेलू उपभोक्ताओं को उनकी ऐतिहासिक औसत खपत पर आधारित पात्रता (लगभग 200
        यूनिट पर सीमित) तक खपत मुफ़्त मिलती है। पात्रता से कम इस्तेमाल करें तो बिल ₹0 छपता है; उससे ज़्यादा हो
        तो आप केवल अतिरिक्त नहीं, <em>पूरी</em> खपत का भुगतान करते हैं — इसीलिए एक भारी महीना आश्चर्यजनक रूप
        से पूरा बिल ला सकता है। <a href="/?state=Karnataka#calculator">कर्नाटक कैलकुलेटर</a> ऑप्ट-इन करने
        पर योजना को मॉडल करता है।</p>
      </section>
      <section class="seo-section">
        <h2>2. ऊर्जा शुल्क — स्लैब जो 30 यूनिट से शुरू होते हैं</h2>
        <p>कर्नाटक की LT-1 स्लैब सीढ़ी नीचे असामान्य रूप से बारीक है: पहली 30 यूनिट के लिए एक कम पहला स्लैब,
        फिर 100, 200 व 500 यूनिट पर कदम (स्लैब-वार)। वर्तमान दरें
        <a href="/hi/tariffs/karnataka/bescom/">BESCOM टैरिफ पेज</a> पर हैं — और चूँकि अनुसूची राज्यव्यापी है,
        वही दरें <a href="/hi/tariffs/karnataka/mescom/">MESCOM</a>,
        <a href="/hi/tariffs/karnataka/cesc_karnataka/">CESC</a>,
        <a href="/hi/tariffs/karnataka/gescom/">GESCOM</a> और
        <a href="/hi/tariffs/karnataka/hescom/">HESCOM</a> पर लागू होती हैं।</p>
      </section>
      <section class="seo-section">
        <h2>3. फिक्स्ड चार्ज — फेज़ और भार के अनुसार</h2>
        <p>फिक्स्ड चार्ज बैंडेड है (सिंगल-फेज़ 2.5 kW तक, फिर ऊँचे बैंड), शून्य-खपत महीनों समेत हर महीने आपके
        स्वीकृत भार पर बिल किया जाता है। ज़रूरत से ज़्यादा स्वीकृत? देखें
        <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">अपना भार सही कैसे करें</a>।</p>
      </section>
      <section class="seo-section">
        <h2>4. कोई बिजली-शुल्क लाइन नहीं — यह पहले से अंदर है</h2>
        <p>कर्नाटक शुल्क-समावेशी टैरिफ प्रकाशित करता है: स्लैब दरों में राज्य के कर पहले से शामिल हैं, इसलिए
        <a href="/hi/guides/how-to-read-msedcl-bill/">महाराष्ट्र</a> या दिल्ली के विपरीत बिल के नीचे कोई
        अलग ED प्रतिशत नहीं होता। राज्यों की तुलना करते समय याद रखें कि BESCOM हेडलाइन दर अधिकांश की तुलना में
        सच्ची प्रभावी दर के ज़्यादा क़रीब है।</p>
      </section>
      <section class="seo-section">
        <h2>5. कुल जाँचें</h2>
        <ol>
          <li>जाँचें यूनिट = (वर्तमान − पिछली रीडिंग) × MF।</li>
          <li><a href="/hi/tariffs/karnataka/bescom/">टैरिफ पेज</a> पर स्लैब गणित दोबारा निकालें, या बस
          <a href="/?state=Karnataka#calculator">कैलकुलेटर</a> में यूनिट + भार डालें।</li>
          <li>अगर गृह ज्योति पिछले महीने लागू हुई पर इस महीने नहीं, तो कारण लगभग हमेशा पात्रता से अधिक खपत है
          — रुपये नहीं, यूनिटों की तुलना करें।</li>
        </ol>
      </section>`,
    faqsHi: [
      { q: 'मेरा BESCOM बिल अचानक शून्य से पूरी राशि पर क्यों चला गया?',
        a: 'गृह ज्योति केवल आपकी पात्रता तक (ऐतिहासिक औसत उपयोग पर आधारित, लगभग 200 यूनिट पर सीमित) मुफ़्त बिजली देती है। उससे ज़्यादा हो तो पूरे महीने की खपत सामान्य स्लैब दरों पर बिल होती है — केवल सीमा से ऊपर की यूनिटें नहीं। बिल पर छपी अपनी पात्रता के मुक़ाबले अपनी यूनिटें जाँचें।' },
      { q: 'मेरे BESCOM बिल पर बिजली शुल्क लाइन क्यों नहीं है?',
        a: 'कर्नाटक शुल्क-समावेशी टैरिफ प्रकाशित करता है: KERC स्लैब दरों में राज्य उगाही पहले से शामिल है, इसलिए बिल के नीचे कोई अलग ED प्रतिशत नहीं जुड़ता। इसलिए हेडलाइन दर महाराष्ट्र जैसे राज्यों की तुलना में आपकी सच्ची प्रति-यूनिट लागत के ज़्यादा क़रीब है।' },
      { q: 'क्या सभी कर्नाटक डिस्कॉम BESCOM जैसी ही दरें लेती हैं?',
        a: 'हाँ — BESCOM, MESCOM, CESC, GESCOM और HESCOM सभी एक ही KERC-स्वीकृत राज्य अनुसूची पर बिल करती हैं। जो अलग है वह सेवा क्षेत्र और बिलिंग पोर्टल है, टैरिफ नहीं।' },
      { q: 'गृह ज्योति के लिए पंजीकरण कैसे करूँ?',
        a: 'पंजीकरण कर्नाटक सरकार के सेवा सिंधु पोर्टल के ज़रिए अपने उपभोक्ता नंबर और आधार से होता है। पंजीकरण के बाद पात्रता (आपकी औसत खपत, सीमित) बिल पर छपती है और उस तक की खपत हर महीने मुफ़्त होती है।' },
    ],

    titleMr: 'तुमचे BESCOM वीज बिल कसे वाचावे',
    metaTitleMr: 'तुमचे BESCOM बिल कसे वाचावे — गृह ज्योती, स्लॅब व स्थिर आकार',
    descriptionMr: 'BESCOM (बेंगळुरू) वीज बिलांची ओळ-दर-ओळ माहिती: 30 युनिटपासून सुरू होणारे LT-1 स्लॅब, शुल्क-समावेशक टॅरिफ, मंजूर-भार स्थिर आकार, आणि गृह ज्योती मोफत-वीज योजना तुम्ही बिल भरता की नाही हे कसे ठरवते.',
    introMr: `BESCOM बेंगळुरू व आसपासच्या सात जिल्ह्यांना बिल करते, कर्नाटकातील इतर डिस्कॉम (MESCOM, CESC,
      GESCOM, HESCOM) प्रमाणेच त्याच KERC-मंजूर अनुसूचीवर. दोन गोष्टी कर्नाटक बिलाला इतर राज्यांहून वेगळे
      बनवतात: टॅरिफ <strong>शुल्क-समावेशक</strong> आहे (वेगळी ED ओळ नाही), आणि <strong>गृह ज्योती</strong>
      योजना घरगुती बिलांचा मोठा भाग शून्य करते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. गृह ज्योती — मोफत-युनिट योजना</h2>
        <p>गृह ज्योतीअंतर्गत, नोंदणीकृत घरगुती ग्राहकांना त्यांच्या ऐतिहासिक सरासरी वापरावर आधारित
        पात्रतेपर्यंत (सुमारे 200 युनिटवर मर्यादित) वापर मोफत मिळतो. पात्रतेपेक्षा कमी वापरल्यास बिल ₹0
        छापले जाते; त्याहून जास्त झाल्यास तुम्ही फक्त अतिरिक्त नव्हे, <em>संपूर्ण</em> वापराचे पैसे भरता —
        म्हणूनच एक जास्त महिना आश्चर्यकारकरीत्या पूर्ण बिल आणू शकतो. <a href="/?state=Karnataka#calculator">कर्नाटक
        कॅल्क्युलेटर</a> ऑप्ट-इन केल्यावर योजना मॉडेल करते.</p>
      </section>
      <section class="seo-section">
        <h2>2. ऊर्जा आकार — 30 युनिटपासून सुरू होणारे स्लॅब</h2>
        <p>कर्नाटकची LT-1 स्लॅब शिडी तळाशी असामान्यपणे बारीक आहे: पहिल्या 30 युनिटांसाठी एक कमी पहिला
        स्लॅब, मग 100, 200 व 500 युनिटवर टप्पे (स्लॅबनिहाय). सध्याचे दर <a href="/tariffs/karnataka/bescom/">BESCOM
        टॅरिफ पेज</a> वर आहेत — आणि अनुसूची राज्यव्यापी असल्याने, तेच दर
        <a href="/tariffs/karnataka/mescom/">MESCOM</a>,
        <a href="/tariffs/karnataka/cesc_karnataka/">CESC</a>,
        <a href="/tariffs/karnataka/gescom/">GESCOM</a> आणि
        <a href="/tariffs/karnataka/hescom/">HESCOM</a> वर लागू होतात.</p>
      </section>
      <section class="seo-section">
        <h2>3. स्थिर आकार — फेज व भारानुसार</h2>
        <p>स्थिर आकार बँडेड आहे (सिंगल-फेज 2.5 kW पर्यंत, मग उच्च बँड), शून्य-वापर महिन्यांसह प्रत्येक
        महिन्याला तुमच्या मंजूर भारावर बिल केला जातो. गरजेपेक्षा जास्त मंजूर? पहा
        <a href="/mr/guides/reduce-fixed-charges-sanctioned-load/">तुमचा भार योग्य कसा करावा</a>.</p>
      </section>
      <section class="seo-section">
        <h2>4. वीज-शुल्क ओळ नाही — ती आधीच आत आहे</h2>
        <p>कर्नाटक शुल्क-समावेशक टॅरिफ प्रकाशित करते: स्लॅब दरांत राज्याचे कर आधीच समाविष्ट आहेत, म्हणून
        <a href="/mr/guides/how-to-read-msedcl-bill/">महाराष्ट्र</a> किंवा दिल्लीच्या उलट बिलाच्या तळाशी
        वेगळी ED टक्केवारी नसते. राज्यांची तुलना करताना लक्षात ठेवा की BESCOM ची हेडलाइन दर बहुतेकांपेक्षा
        खऱ्या प्रभावी दराच्या जास्त जवळ आहे.</p>
      </section>
      <section class="seo-section">
        <h2>5. एकूण तपासा</h2>
        <ol>
          <li>तपासा युनिट = (चालू − मागील रीडिंग) × MF.</li>
          <li><a href="/tariffs/karnataka/bescom/">टॅरिफ पेज</a> वर स्लॅब गणित पुन्हा काढा, किंवा फक्त
          <a href="/?state=Karnataka#calculator">कॅल्क्युलेटर</a> मध्ये युनिट + भार टाका.</li>
          <li>गृह ज्योती मागील महिन्यात लागू झाली पण या महिन्यात नाही, तर कारण जवळपास नेहमीच पात्रतेपेक्षा
          जास्त वापर आहे — रुपये नव्हे, युनिटांची तुलना करा.</li>
        </ol>
      </section>`,
    faqsMr: [
      { q: 'माझे BESCOM बिल अचानक शून्यावरून पूर्ण रकमेवर का गेले?',
        a: 'गृह ज्योती फक्त तुमच्या पात्रतेपर्यंत (ऐतिहासिक सरासरी वापरावर आधारित, सुमारे 200 युनिटवर मर्यादित) मोफत वीज देते. त्याहून जास्त झाल्यास संपूर्ण महिन्याचा वापर सामान्य स्लॅब दरांनी बिल होतो — फक्त मर्यादेवरील युनिटे नव्हे. बिलावर छापलेल्या तुमच्या पात्रतेशी तुमची युनिटे तपासा.' },
      { q: 'माझ्या BESCOM बिलावर वीज शुल्क ओळ का नाही?',
        a: 'कर्नाटक शुल्क-समावेशक टॅरिफ प्रकाशित करते: KERC स्लॅब दरांत राज्य आकारण्या आधीच समाविष्ट आहेत, म्हणून बिलाच्या तळाशी वेगळी ED टक्केवारी जोडली जात नाही. म्हणून हेडलाइन दर महाराष्ट्रासारख्या राज्यांपेक्षा तुमच्या खऱ्या प्रति-युनिट किमतीच्या जास्त जवळ आहे.' },
      { q: 'सर्व कर्नाटक डिस्कॉम BESCOM सारखेच दर घेतात का?',
        a: 'होय — BESCOM, MESCOM, CESC, GESCOM आणि HESCOM सर्व एकाच KERC-मंजूर राज्य अनुसूचीवर बिल करतात. जे वेगळे आहे ते सेवा क्षेत्र व बिलिंग पोर्टल, टॅरिफ नव्हे.' },
      { q: 'गृह ज्योतीसाठी नोंदणी कशी करावी?',
        a: 'नोंदणी कर्नाटक सरकारच्या सेवा सिंधू पोर्टलद्वारे तुमच्या ग्राहक क्रमांक व आधारने होते. नोंदणीनंतर पात्रता (तुमचा सरासरी वापर, मर्यादित) बिलावर छापली जाते आणि तिथपर्यंतचा वापर दर महिन्याला मोफत असतो.' },
    ],
  },

  {
    slug: 'how-to-read-tneb-tangedco-bill',
    published: "2025-11-19",
    states: ['Tamil Nadu'],
    title: 'How to Read Your TNEB / TANGEDCO Electricity Bill',
    metaTitle: 'How to Read Your TNEB (TANGEDCO) Bill — Bimonthly Slabs & Free Units',
    description: 'A line-by-line guide to Tamil Nadu (TNEB/TANGEDCO) electricity bills: why billing is bimonthly, how the first 100 free units work, the 500-unit cliff that removes concessions, slab maths to 1000+ units and how to verify the total.',
    minutes: 5,
    intro: `Tamil Nadu bills are the most misread in India for one simple reason:
      <strong>TANGEDCO bills once every two months</strong>, so every slab, every free-unit limit
      and every comparison with other states must be done on a 2-month cycle. Add the 100 free
      units and the concession cliff at 500 units, and two similar households can see very
      different totals.`,
    sections: `
      <section class="seo-section">
        <h2>1. Bimonthly billing — the #1 source of confusion</h2>
        <p>Your "monthly" consumption is actually two months of units. When comparing with friends
        in other states — or using any calculator built on monthly slabs — halve your TNEB units
        first. Our <a href="/?state=Tamil%20Nadu#calculator">Tamil Nadu calculator</a> shows a
        monthly estimate; multiply by two to sanity-check a bimonthly bill.</p>
      </section>
      <section class="seo-section">
        <h2>2. The first 100 units are free — conditionally</h2>
        <p>Every domestic consumer gets the <strong>first 100 units of each 2-month cycle free</strong>.
        The catch: the full concession structure applies only if your cycle total stays
        <strong>within 500 units</strong>. Cross 500, and the concessional slab rates fall away —
        the whole bill is computed on the regular ladder. That's the "cliff" that makes a
        510-unit cycle cost far more than a 490-unit one.</p>
      </section>
      <section class="seo-section">
        <h2>3. The slab ladder</h2>
        <p>Above the free block, slabs step at 200, 500 and 1000 units per cycle (slab-wise), with
        the top slab applying beyond 1000. Current per-unit rates are on the
        <a href="/tariffs/tamil-nadu/tangedco/">TANGEDCO tariff page</a>. The fixed charge for
        domestic connections is a modest flat amount per cycle, and electricity duty adds 5% on the
        energy charges.</p>
      </section>
      <section class="seo-section">
        <h2>4. Verify the total</h2>
        <ol>
          <li>Confirm the reading dates span ~60 days — a longer cycle silently pushes units into
          higher slabs.</li>
          <li>Check units = (current − previous) × MF.</li>
          <li>Recompute: free 100 → slab ladder on the rest → duty. Or enter <em>half</em> your
          cycle units in the <a href="/?state=Tamil%20Nadu#calculator">calculator</a> and double the
          result.</li>
          <li>A jump with unchanged habits usually means the cycle crossed 500 units — see our
          <a href="/guides/why-did-my-electricity-bill-increase/">bill-increase guide</a>.</li>
        </ol>
      </section>`,
    faqs: [
      { q: 'Why is my TNEB bill for two months?',
        a: 'TANGEDCO bills domestic consumers bimonthly — meters are read every ~60 days and all slabs and free-unit limits are defined per 2-month cycle. Halve the units before comparing with monthly-billing states.' },
      { q: 'Are the first 100 units really free in Tamil Nadu?',
        a: 'Yes — the first 100 units of every 2-month cycle are free for domestic consumers. But the wider concessional structure applies only while the cycle total stays within 500 units; beyond that, regular slab rates apply to the whole consumption.' },
      { q: 'Why did my TNEB bill jump although my usage barely changed?',
        a: 'The most common cause is crossing the 500-unit threshold for the 2-month cycle, which removes the concessional rates for the entire bill — a 20-unit increase can add a disproportionate amount. Longer reading cycles and estimated readings are the next suspects.' },
      { q: 'Does TANGEDCO charge electricity duty?',
        a: 'Yes — Tamil Nadu adds electricity duty at 5% on the energy charges, one of the lower rates among large states. It appears as a separate line after the slab charges.' },
    ],

    titleHi: 'अपना TNEB / TANGEDCO बिजली बिल कैसे पढ़ें',
    metaTitleHi: 'अपना TNEB (TANGEDCO) बिल कैसे पढ़ें — द्विमासिक स्लैब व मुफ़्त यूनिट',
    descriptionHi: 'तमिलनाडु (TNEB/TANGEDCO) बिजली बिलों की लाइन-दर-लाइन गाइड: बिलिंग द्विमासिक क्यों है, पहली 100 मुफ़्त यूनिटें कैसे काम करती हैं, 500-यूनिट क्लिफ़ जो रियायतें हटा देती है, 1000+ यूनिट तक स्लैब गणित और कुल कैसे जाँचें।',
    introHi: `तमिलनाडु के बिल भारत में सबसे ज़्यादा ग़लत पढ़े जाते हैं, एक सीधी वजह से:
      <strong>TANGEDCO हर दो महीने में एक बार बिल करती है</strong>, इसलिए हर स्लैब, हर मुफ़्त-यूनिट सीमा और
      अन्य राज्यों से हर तुलना 2-महीने के चक्र पर करनी होती है। साथ में 100 मुफ़्त यूनिटें और 500 यूनिट पर
      रियायत क्लिफ़ जोड़ें, तो दो एक-जैसे घर बहुत अलग कुल देख सकते हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. द्विमासिक बिलिंग — भ्रम का #1 स्रोत</h2>
        <p>आपकी "मासिक" खपत असल में दो महीने की यूनिटें हैं। अन्य राज्यों के दोस्तों से तुलना करते समय — या
        मासिक स्लैब पर बने किसी कैलकुलेटर का उपयोग करते समय — पहले अपनी TNEB यूनिटें आधी करें। हमारा
        <a href="/?state=Tamil%20Nadu#calculator">तमिलनाडु कैलकुलेटर</a> मासिक अनुमान दिखाता है; द्विमासिक
        बिल जाँचने के लिए दो से गुणा करें।</p>
      </section>
      <section class="seo-section">
        <h2>2. पहली 100 यूनिटें मुफ़्त हैं — सशर्त</h2>
        <p>हर घरेलू उपभोक्ता को हर 2-महीने चक्र की <strong>पहली 100 यूनिटें मुफ़्त</strong> मिलती हैं। पेच:
        पूरी रियायत संरचना केवल तभी लागू होती है जब आपका चक्र कुल <strong>500 यूनिट के भीतर</strong> रहे। 500
        पार करें, और रियायती स्लैब दरें हट जाती हैं — पूरा बिल सामान्य सीढ़ी पर निकलता है। यही "क्लिफ़" है जो
        510-यूनिट चक्र को 490-यूनिट वाले से कहीं महँगा बनाता है।</p>
      </section>
      <section class="seo-section">
        <h2>3. स्लैब सीढ़ी</h2>
        <p>मुफ़्त ब्लॉक के ऊपर, स्लैब प्रति चक्र 200, 500 व 1000 यूनिट पर कदम बढ़ाते हैं (स्लैब-वार), और शीर्ष
        स्लैब 1000 से आगे लागू होता है। वर्तमान प्रति-यूनिट दरें
        <a href="/hi/tariffs/tamil-nadu/tangedco/">TANGEDCO टैरिफ पेज</a> पर हैं। घरेलू कनेक्शनों का फिक्स्ड
        चार्ज प्रति चक्र एक मामूली स्थिर राशि है, और बिजली शुल्क ऊर्जा शुल्कों पर 5% जोड़ता है।</p>
      </section>
      <section class="seo-section">
        <h2>4. कुल जाँचें</h2>
        <ol>
          <li>पुष्टि करें कि रीडिंग तारीख़ें ~60 दिन फैली हैं — लंबा चक्र चुपचाप यूनिटों को ऊँचे स्लैब में
          धकेलता है।</li>
          <li>जाँचें यूनिट = (वर्तमान − पिछली) × MF।</li>
          <li>दोबारा निकालें: मुफ़्त 100 → बाक़ी पर स्लैब सीढ़ी → शुल्क। या
          <a href="/?state=Tamil%20Nadu#calculator">कैलकुलेटर</a> में अपने चक्र की <em>आधी</em> यूनिटें
          डालें और नतीजा दोगुना करें।</li>
          <li>आदतें न बदलने पर उछाल का मतलब आम तौर पर चक्र का 500 यूनिट पार करना है — देखें हमारी
          <a href="/hi/guides/why-did-my-electricity-bill-increase/">बिल-वृद्धि गाइड</a>।</li>
        </ol>
      </section>`,
    faqsHi: [
      { q: 'मेरा TNEB बिल दो महीने का क्यों है?',
        a: 'TANGEDCO घरेलू उपभोक्ताओं को द्विमासिक बिल करती है — मीटर हर ~60 दिन में पढ़े जाते हैं और सभी स्लैब व मुफ़्त-यूनिट सीमाएँ प्रति 2-महीने चक्र परिभाषित हैं। मासिक-बिलिंग राज्यों से तुलना से पहले यूनिटें आधी करें।' },
      { q: 'क्या तमिलनाडु में पहली 100 यूनिटें वाकई मुफ़्त हैं?',
        a: 'हाँ — घरेलू उपभोक्ताओं के लिए हर 2-महीने चक्र की पहली 100 यूनिटें मुफ़्त हैं। पर व्यापक रियायती संरचना केवल तब लागू होती है जब चक्र कुल 500 यूनिट के भीतर रहे; उससे आगे, पूरी खपत पर सामान्य स्लैब दरें लगती हैं।' },
      { q: 'मेरी खपत मुश्किल से बदली फिर भी TNEB बिल क्यों उछला?',
        a: 'सबसे आम कारण 2-महीने चक्र के लिए 500-यूनिट सीमा पार करना है, जो पूरे बिल के लिए रियायती दरें हटा देता है — 20-यूनिट वृद्धि अनुपात से ज़्यादा राशि जोड़ सकती है। लंबे रीडिंग चक्र और अनुमानित रीडिंग अगले संदिग्ध हैं।' },
      { q: 'क्या TANGEDCO बिजली शुल्क लेती है?',
        a: 'हाँ — तमिलनाडु ऊर्जा शुल्कों पर 5% बिजली शुल्क जोड़ता है, बड़े राज्यों में कम दरों में से एक। यह स्लैब शुल्कों के बाद एक अलग लाइन के रूप में दिखता है।' },
    ],

    titleMr: 'तुमचे TNEB / TANGEDCO वीज बिल कसे वाचावे',
    metaTitleMr: 'तुमचे TNEB (TANGEDCO) बिल कसे वाचावे — द्वैमासिक स्लॅब व मोफत युनिटे',
    descriptionMr: 'तमिळनाडू (TNEB/TANGEDCO) वीज बिलांची ओळ-दर-ओळ माहिती: बिलिंग द्वैमासिक का आहे, पहिल्या 100 मोफत युनिटे कशा काम करतात, 500-युनिट क्लिफ जो सवलती काढून टाकतो, 1000+ युनिटपर्यंत स्लॅब गणित आणि एकूण कसे तपासावे.',
    introMr: `तमिळनाडूची बिले भारतात सर्वात जास्त चुकीची वाचली जातात, एका साध्या कारणाने:
      <strong>TANGEDCO दर दोन महिन्यांतून एकदा बिल करते</strong>, म्हणून प्रत्येक स्लॅब, प्रत्येक मोफत-युनिट
      मर्यादा आणि इतर राज्यांशी प्रत्येक तुलना 2-महिन्यांच्या चक्रावर करावी लागते. सोबत 100 मोफत युनिटे आणि
      500 युनिटवरील सवलत क्लिफ जोडा, तर दोन सारखी घरे खूप वेगळे एकूण पाहू शकतात.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. द्वैमासिक बिलिंग — गोंधळाचे #1 स्रोत</h2>
        <p>तुमचा "मासिक" वापर प्रत्यक्षात दोन महिन्यांची युनिटे आहेत. इतर राज्यांतील मित्रांशी तुलना करताना
        — किंवा मासिक स्लॅबवर बनवलेले कोणतेही कॅल्क्युलेटर वापरताना — आधी तुमची TNEB युनिटे निम्मी करा.
        आमचे <a href="/?state=Tamil%20Nadu#calculator">तमिळनाडू कॅल्क्युलेटर</a> मासिक अंदाज दाखवते; द्वैमासिक
        बिल तपासण्यासाठी दोनने गुणा.</p>
      </section>
      <section class="seo-section">
        <h2>2. पहिल्या 100 युनिटे मोफत आहेत — सशर्त</h2>
        <p>प्रत्येक घरगुती ग्राहकाला प्रत्येक 2-महिना चक्राच्या <strong>पहिल्या 100 युनिटे मोफत</strong>
        मिळतात. मेख: संपूर्ण सवलत रचना फक्त तेव्हाच लागू होते जेव्हा तुमचे चक्र एकूण
        <strong>500 युनिटांच्या आत</strong> राहते. 500 ओलांडा, आणि सवलती स्लॅब दर नाहीसे होतात — संपूर्ण
        बिल सामान्य शिडीवर मोजले जाते. हाच तो "क्लिफ" जो 510-युनिट चक्राला 490-युनिट वाल्यापेक्षा खूप महाग
        बनवतो.</p>
      </section>
      <section class="seo-section">
        <h2>3. स्लॅब शिडी</h2>
        <p>मोफत ब्लॉकच्या वर, स्लॅब प्रति चक्र 200, 500 व 1000 युनिटवर टप्पे घेतात (स्लॅबनिहाय), आणि
        सर्वोच्च स्लॅब 1000 च्या पुढे लागू होतो. सध्याचे प्रति-युनिट दर <a href="/tariffs/tamil-nadu/tangedco/">TANGEDCO
        टॅरिफ पेज</a> वर आहेत. घरगुती जोडण्यांचा स्थिर आकार प्रति चक्र एक माफक स्थिर रक्कम आहे, आणि वीज
        शुल्क ऊर्जा शुल्कांवर 5% जोडते.</p>
      </section>
      <section class="seo-section">
        <h2>4. एकूण तपासा</h2>
        <ol>
          <li>रीडिंगच्या तारखा ~60 दिवस व्यापतात याची खात्री करा — लांब चक्र गुपचूप युनिटे उच्च स्लॅबमध्ये
          ढकलते.</li>
          <li>तपासा युनिट = (चालू − मागील) × MF.</li>
          <li>पुन्हा काढा: मोफत 100 → उरलेल्यावर स्लॅब शिडी → शुल्क. किंवा <a href="/?state=Tamil%20Nadu#calculator">कॅल्क्युलेटर</a>
          मध्ये तुमच्या चक्राची <em>निम्मी</em> युनिटे टाका आणि निकाल दुप्पट करा.</li>
          <li>सवयी न बदलता उडी म्हणजे सहसा चक्राने 500 युनिट ओलांडले — पहा आमची
          <a href="/mr/guides/why-did-my-electricity-bill-increase/">बिल-वाढ मार्गदर्शिका</a>.</li>
        </ol>
      </section>`,
    faqsMr: [
      { q: 'माझे TNEB बिल दोन महिन्यांचे का आहे?',
        a: 'TANGEDCO घरगुती ग्राहकांना द्वैमासिक बिल करते — मीटर दर ~60 दिवसांनी वाचले जातात आणि सर्व स्लॅब व मोफत-युनिट मर्यादा प्रति 2-महिना चक्र परिभाषित आहेत. मासिक-बिलिंग राज्यांशी तुलना करण्यापूर्वी युनिटे निम्मी करा.' },
      { q: 'तमिळनाडूत पहिल्या 100 युनिटे खरोखर मोफत आहेत का?',
        a: 'होय — घरगुती ग्राहकांसाठी प्रत्येक 2-महिना चक्राची पहिली 100 युनिटे मोफत आहेत. पण व्यापक सवलत रचना फक्त तेव्हाच लागू होते जेव्हा चक्र एकूण 500 युनिटांच्या आत राहते; त्यापुढे, संपूर्ण वापरावर सामान्य स्लॅब दर लागतात.' },
      { q: 'माझा वापर जेमतेम बदलला तरी TNEB बिल का उसळले?',
        a: 'सर्वात सामान्य कारण 2-महिना चक्रासाठी 500-युनिट मर्यादा ओलांडणे आहे, जे संपूर्ण बिलासाठी सवलती दर काढून टाकते — 20-युनिट वाढ प्रमाणाबाहेर रक्कम जोडू शकते. लांब रीडिंग चक्र व अंदाजित रीडिंग हे पुढील संशयित आहेत.' },
      { q: 'TANGEDCO वीज शुल्क घेते का?',
        a: 'होय — तमिळनाडू ऊर्जा शुल्कांवर 5% वीज शुल्क जोडते, मोठ्या राज्यांतील कमी दरांपैकी एक. ते स्लॅब शुल्कांनंतर एक वेगळी ओळ म्हणून दिसते.' },
    ],
  },

  {
    slug: 'solar-net-metering-savings',
    published: "2025-12-01",
    title: 'Solar Net Metering: How the Savings Actually Work',
    metaTitle: 'Solar Net Metering Savings Explained — Credits, Sizing & Payback',
    description: 'How rooftop solar net metering credits work on an Indian electricity bill, why the same system saves different amounts in different states, how slab rates change the maths, sizing rules of thumb and what drives payback time.',
    minutes: 6,
    intro: `Net metering lets your rooftop solar system run your meter both ways: units you export
      offset units you import, and you pay (roughly) for the <strong>net</strong>. But "roughly" is
      where the money hides — the same 3 kW system can pay back in 4 years in one state and 8 in
      another, because the value of an offset unit depends on <em>your</em> tariff.`,
    sections: `
      <section class="seo-section">
        <h2>How the billing works</h2>
        <p>With net metering, a bidirectional meter records import and export separately. At
        billing, export units are netted against import units; you pay the tariff on the net
        import, and surplus export typically carries forward as credit (settled at a lower rate at
        year-end). Two consequences people miss:</p>
        <ul>
          <li><strong>Fixed charges, duty and surcharges don't disappear</strong> — they apply on
          your sanctioned load and net consumption as usual.</li>
          <li><strong>Offset units are worth your top slab rate.</strong> Netting reduces the most
          expensive units first — so households deep into high slabs save the most per unit
          generated.</li>
        </ul>
      </section>
      <section class="seo-section">
        <h2>Why savings differ by state</h2>
        <p>Three levers move the economics:</p>
        <ol>
          <li><strong>Your slab ladder.</strong> Steep ladders (see
          <a href="/tariffs/maharashtra/msedcl/">Maharashtra</a>) make each offset unit worth more;
          flat or subsidised ladders (free-unit schemes in
          <a href="/tariffs/karnataka/bescom/">Karnataka</a> or
          <a href="/tariffs/tamil-nadu/tangedco/">Tamil Nadu</a>) can make small systems pointless —
          you can't save on units that were already free.</li>
          <li><strong>The state's net-metering rules.</strong> States differ on eligible system
          sizes, net metering vs net billing (exports credited at a lower feed-in rate), and
          settlement periods — check your DISCOM's current regulations before sizing.</li>
          <li><strong>Subsidy.</strong> The central rooftop scheme (PM Surya Ghar) subsidises
          residential systems up to a capped amount; state top-ups vary.</li>
        </ol>
      </section>
      <section class="seo-section">
        <h2>Sizing: match your daytime + top-slab usage</h2>
        <p>A practical rule: size the system to wipe out your <em>top-slab</em> consumption, not
        your entire bill. Each kW of rooftop solar generates roughly 4 units/day (110–130
        units/month) in most of India. Our <a href="/solar/">solar savings estimator</a> does this
        against your actual DISCOM tariff — enter your monthly units and it computes system size,
        bill-after-solar and payback from the same engine as the
        <a href="/#calculator">bill calculator</a>.</p>
      </section>
      <section class="seo-section">
        <h2>What drives payback</h2>
        <ul>
          <li><strong>Shorter payback:</strong> high top-slab rates, high daytime self-consumption,
          subsidy captured, net (not gross) metering.</li>
          <li><strong>Longer payback:</strong> heavily subsidised consumption (free-unit schemes),
          low sanctioned load limits on system size, feed-in-rate settlement of exports.</li>
        </ul>
        <p>Before signing with a vendor, run the numbers yourself on the
        <a href="/solar/">estimator</a> and against your DISCOM's
        <a href="/tariffs/states/">tariff page</a> — the vendor's "70% saving" pitch assumes the
        steepest tariff, which may not be yours.</p>
      </section>`,
    faqs: [
      { q: 'How does net metering reduce my electricity bill?',
        a: 'Exported solar units are netted against imported units, so you pay the tariff only on net consumption — and because netting removes your most expensive (top-slab) units first, each solar unit is worth your highest applicable rate, not the average.' },
      { q: 'How many units does 1 kW of rooftop solar generate?',
        a: 'Roughly 4 units per day — about 110–130 units a month across most of India, varying with location, orientation and season. A 3 kW system therefore offsets around 330–390 units a month.' },
      { q: 'Is net metering worth it if I get free electricity units?',
        a: 'Often not for small systems. If a state scheme (like Karnataka’s Gruha Jyoti or Tamil Nadu’s free-unit block) already zeroes your bill, solar can only save on consumption beyond the free entitlement — size for that excess, or skip until your usage grows.' },
      { q: 'What is the difference between net metering and net billing?',
        a: 'Under net metering, exported units offset imported units one-for-one at your retail tariff. Under net billing (gross settlement), exports are paid at a lower feed-in rate while imports cost the full tariff — same hardware, materially worse economics. Which applies depends on your state’s current regulations.' },
    ],

    titleHi: 'सोलर नेट मीटरिंग: बचत असल में कैसे काम करती है',
    metaTitleHi: 'सोलर नेट मीटरिंग बचत समझें — क्रेडिट, साइज़िंग व पेबैक',
    descriptionHi: 'भारतीय बिजली बिल पर रूफटॉप सोलर नेट मीटरिंग क्रेडिट कैसे काम करते हैं, वही सिस्टम अलग राज्यों में अलग बचत क्यों देता है, स्लैब दरें गणित कैसे बदलती हैं, साइज़िंग के नियम और पेबैक समय क्या तय करता है।',
    introHi: `नेट मीटरिंग आपके रूफटॉप सोलर सिस्टम को आपका मीटर दोनों दिशाओं में चलाने देती है: आप जो यूनिटें
      निर्यात करते हैं वे आयातित यूनिटों की भरपाई करती हैं, और आप (लगभग) <strong>शुद्ध</strong> का भुगतान
      करते हैं। पर "लगभग" वहीं है जहाँ पैसा छिपा है — वही 3 kW सिस्टम एक राज्य में 4 साल में और दूसरे में 8
      साल में पेबैक कर सकता है, क्योंकि एक ऑफ़सेट यूनिट का मूल्य <em>आपके</em> टैरिफ पर निर्भर करता है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>बिलिंग कैसे काम करती है</h2>
        <p>नेट मीटरिंग में एक द्विदिश मीटर आयात और निर्यात अलग-अलग दर्ज करता है। बिलिंग पर, निर्यात यूनिटें
        आयात यूनिटों के विरुद्ध नेट होती हैं; आप शुद्ध आयात पर टैरिफ भरते हैं, और अधिशेष निर्यात आम तौर पर
        क्रेडिट बनकर आगे बढ़ता है (साल-अंत में कम दर पर निपटाया जाता है)। दो बातें जो लोग चूक जाते हैं:</p>
        <ul>
          <li><strong>फिक्स्ड चार्ज, शुल्क और अधिभार गायब नहीं होते</strong> — वे हमेशा की तरह आपके स्वीकृत
          भार और शुद्ध खपत पर लगते हैं।</li>
          <li><strong>ऑफ़सेट यूनिटें आपकी शीर्ष स्लैब दर के बराबर मूल्य की हैं।</strong> नेटिंग सबसे पहले सबसे
          महँगी यूनिटें घटाती है — इसलिए ऊँचे स्लैब में गहरे घर प्रति उत्पन्न यूनिट सबसे ज़्यादा बचाते हैं।</li>
        </ul>
      </section>
      <section class="seo-section">
        <h2>बचत राज्यवार क्यों अलग होती है</h2>
        <p>तीन लीवर अर्थशास्त्र को हिलाते हैं:</p>
        <ol>
          <li><strong>आपकी स्लैब सीढ़ी।</strong> तीव्र सीढ़ियाँ (देखें
          <a href="/hi/tariffs/maharashtra/msedcl/">महाराष्ट्र</a>) हर ऑफ़सेट यूनिट को ज़्यादा मूल्यवान बनाती
          हैं; सपाट या सब्सिडी वाली सीढ़ियाँ (<a href="/hi/tariffs/karnataka/bescom/">कर्नाटक</a> या
          <a href="/hi/tariffs/tamil-nadu/tangedco/">तमिलनाडु</a> की मुफ़्त-यूनिट योजनाएँ) छोटे सिस्टम को
          बेकार बना सकती हैं — जो यूनिटें पहले से मुफ़्त थीं उन पर आप बचा नहीं सकते।</li>
          <li><strong>राज्य के नेट-मीटरिंग नियम।</strong> राज्य पात्र सिस्टम आकार, नेट मीटरिंग बनाम नेट
          बिलिंग (निर्यात कम फ़ीड-इन दर पर क्रेडिट), और निपटान अवधि पर अलग होते हैं — साइज़िंग से पहले अपने
          डिस्कॉम के वर्तमान विनियम जाँचें।</li>
          <li><strong>सब्सिडी।</strong> केंद्रीय रूफटॉप योजना (PM सूर्य घर) आवासीय सिस्टम को सीमित राशि तक
          सब्सिडी देती है; राज्य टॉप-अप अलग होते हैं।</li>
        </ol>
      </section>
      <section class="seo-section">
        <h2>साइज़िंग: अपनी दिन + शीर्ष-स्लैब खपत से मिलाएँ</h2>
        <p>एक व्यावहारिक नियम: सिस्टम को अपनी <em>शीर्ष-स्लैब</em> खपत मिटाने के हिसाब से आकार दें, अपने पूरे
        बिल के नहीं। भारत के अधिकांश हिस्सों में हर kW रूफटॉप सोलर लगभग 4 यूनिट/दिन (110–130 यूनिट/माह) उत्पन्न
        करता है। हमारा <a href="/solar/">सोलर बचत अनुमानक</a> यह आपके वास्तविक डिस्कॉम टैरिफ के विरुद्ध करता है
        — अपनी मासिक यूनिटें डालें और यह <a href="/#calculator">बिल कैलकुलेटर</a> वाले ही इंजन से सिस्टम आकार,
        सोलर-के-बाद बिल और पेबैक निकालता है।</p>
      </section>
      <section class="seo-section">
        <h2>पेबैक क्या तय करता है</h2>
        <ul>
          <li><strong>छोटा पेबैक:</strong> ऊँची शीर्ष-स्लैब दरें, ऊँची दिन की स्व-खपत, सब्सिडी हासिल, नेट
          (सकल नहीं) मीटरिंग।</li>
          <li><strong>लंबा पेबैक:</strong> भारी सब्सिडी वाली खपत (मुफ़्त-यूनिट योजनाएँ), सिस्टम आकार पर कम
          स्वीकृत भार सीमाएँ, निर्यात का फ़ीड-इन-दर निपटान।</li>
        </ul>
        <p>किसी विक्रेता से करार से पहले, संख्याएँ खुद <a href="/solar/">अनुमानक</a> पर और अपने डिस्कॉम के
        <a href="/hi/tariffs/states/">टैरिफ पेज</a> के विरुद्ध चलाएँ — विक्रेता का "70% बचत" दावा सबसे तीव्र
        टैरिफ मानता है, जो आपका न हो।</p>
      </section>`,
    faqsHi: [
      { q: 'नेट मीटरिंग मेरा बिजली बिल कैसे घटाती है?',
        a: 'निर्यात की गई सोलर यूनिटें आयातित यूनिटों के विरुद्ध नेट होती हैं, इसलिए आप केवल शुद्ध खपत पर टैरिफ भरते हैं — और चूँकि नेटिंग सबसे पहले आपकी सबसे महँगी (शीर्ष-स्लैब) यूनिटें हटाती है, हर सोलर यूनिट आपकी सबसे ऊँची लागू दर के बराबर मूल्य की है, औसत की नहीं।' },
      { q: '1 kW रूफटॉप सोलर कितनी यूनिटें उत्पन्न करता है?',
        a: 'लगभग 4 यूनिट प्रति दिन — भारत के अधिकांश हिस्सों में लगभग 110–130 यूनिट प्रति माह, स्थान, दिशा और मौसम के साथ बदलती हुई। इसलिए 3 kW सिस्टम प्रति माह लगभग 330–390 यूनिटें ऑफ़सेट करता है।' },
      { q: 'अगर मुझे मुफ़्त बिजली यूनिटें मिलती हैं तो क्या नेट मीटरिंग सार्थक है?',
        a: 'छोटे सिस्टम के लिए अक्सर नहीं। अगर कोई राज्य योजना (जैसे कर्नाटक की गृह ज्योति या तमिलनाडु का मुफ़्त-यूनिट ब्लॉक) पहले से आपका बिल शून्य कर देती है, तो सोलर केवल मुफ़्त पात्रता से आगे की खपत पर बचा सकता है — उस अतिरिक्त के हिसाब से आकार दें, या खपत बढ़ने तक टालें।' },
      { q: 'नेट मीटरिंग और नेट बिलिंग में क्या अंतर है?',
        a: 'नेट मीटरिंग में, निर्यात यूनिटें आपके खुदरा टैरिफ पर एक-के-बदले-एक आयात यूनिटों को ऑफ़सेट करती हैं। नेट बिलिंग (सकल निपटान) में, निर्यात कम फ़ीड-इन दर पर चुकाया जाता है जबकि आयात पर पूरा टैरिफ लगता है — वही हार्डवेयर, काफ़ी बदतर अर्थशास्त्र। कौन-सा लागू है यह आपके राज्य के वर्तमान विनियमों पर निर्भर करता है।' },
    ],

    titleMr: 'सोलर नेट मीटरिंग: बचत प्रत्यक्षात कशी काम करते',
    metaTitleMr: 'सोलर नेट मीटरिंग बचत समजून घ्या — क्रेडिट, साइझिंग व पेबॅक',
    descriptionMr: 'भारतीय वीज बिलावर रूफटॉप सोलर नेट मीटरिंग क्रेडिट कसे काम करतात, तोच सिस्टम वेगवेगळ्या राज्यांत वेगळी बचत का देतो, स्लॅब दर गणित कसे बदलतात, साइझिंगचे नियम आणि पेबॅक काळ काय ठरवते.',
    introMr: `नेट मीटरिंग तुमच्या रूफटॉप सोलर सिस्टमला तुमचे मीटर दोन्ही दिशांनी चालवू देते: तुम्ही निर्यात
      करता ती युनिटे आयात युनिटांची भरपाई करतात, आणि तुम्ही (साधारण) <strong>निव्वळ</strong> रकमेचे पैसे
      भरता. पण "साधारण" तिथेच पैसा दडलेला असतो — तोच 3 kW सिस्टम एका राज्यात 4 वर्षांत आणि दुसऱ्यात 8
      वर्षांत पेबॅक करू शकतो, कारण एका ऑफसेट युनिटचे मूल्य <em>तुमच्या</em> टॅरिफवर अवलंबून असते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>बिलिंग कशी काम करते</h2>
        <p>नेट मीटरिंगमध्ये एक द्विदिश मीटर आयात व निर्यात वेगळे नोंदवते. बिलिंगच्या वेळी, निर्यात युनिटे
        आयात युनिटांविरुद्ध निव्वळ केली जातात; तुम्ही निव्वळ आयातावर टॅरिफ भरता, आणि अतिरिक्त निर्यात
        सामान्यतः क्रेडिट बनून पुढे जाते (वर्षअखेरीस कमी दराने निकाली). लोक चुकवतात अशा दोन गोष्टी:</p>
        <ul>
          <li><strong>स्थिर आकार, शुल्क व अधिभार नाहीसे होत नाहीत</strong> — ते नेहमीप्रमाणे तुमच्या मंजूर
          भार व निव्वळ वापरावर लागतात.</li>
          <li><strong>ऑफसेट युनिटांचे मूल्य तुमच्या सर्वोच्च स्लॅब दराइतके असते.</strong> निव्वळीकरण
          सर्वात आधी सर्वात महाग युनिटे कमी करते — म्हणून उच्च स्लॅबमध्ये खोलवर असलेली घरे प्रति उत्पादित
          युनिट सर्वाधिक बचत करतात.</li>
        </ul>
      </section>
      <section class="seo-section">
        <h2>बचत राज्यानुसार का वेगळी असते</h2>
        <p>तीन घटक अर्थकारण हलवतात:</p>
        <ol>
          <li><strong>तुमची स्लॅब शिडी.</strong> तीव्र शिड्या (पहा
          <a href="/mr/tariffs/maharashtra/msedcl/">महाराष्ट्र</a>) प्रत्येक ऑफसेट युनिट अधिक मूल्यवान
          बनवतात; सपाट किंवा अनुदानित शिड्या (<a href="/tariffs/karnataka/bescom/">कर्नाटक</a> किंवा
          <a href="/tariffs/tamil-nadu/tangedco/">तमिळनाडू</a> च्या मोफत-युनिट योजना) छोट्या सिस्टमला
          निरर्थक बनवू शकतात — जी युनिटे आधीच मोफत होती त्यांवर तुम्ही बचत करू शकत नाही.</li>
          <li><strong>राज्याचे नेट-मीटरिंग नियम.</strong> राज्ये पात्र सिस्टम आकार, नेट मीटरिंग वि. नेट
          बिलिंग (निर्यात कमी फीड-इन दराने क्रेडिट), आणि निपटान कालावधीवर वेगळी असतात — साइझिंगपूर्वी
          तुमच्या डिस्कॉमचे सध्याचे नियम तपासा.</li>
          <li><strong>अनुदान.</strong> केंद्रीय रूफटॉप योजना (PM सूर्य घर) निवासी सिस्टमला मर्यादित
          रकमेपर्यंत अनुदान देते; राज्य टॉप-अप वेगळे असतात.</li>
        </ol>
      </section>
      <section class="seo-section">
        <h2>साइझिंग: तुमचा दिवस + सर्वोच्च-स्लॅब वापराशी जुळवा</h2>
        <p>एक व्यावहारिक नियम: सिस्टम तुमचा <em>सर्वोच्च-स्लॅब</em> वापर पुसण्याच्या हिशेबाने आकार द्या,
        तुमच्या संपूर्ण बिलाच्या नव्हे. भारताच्या बहुतेक भागांत प्रत्येक kW रूफटॉप सोलर सुमारे 4 युनिट/दिवस
        (110–130 युनिट/महिना) उत्पन्न करते. आमचा <a href="/solar/">सोलर बचत अंदाजक</a> हे तुमच्या प्रत्यक्ष
        डिस्कॉम टॅरिफविरुद्ध करतो — तुमची मासिक युनिटे टाका आणि तो <a href="/#calculator">बिल
        कॅल्क्युलेटर</a> वापरणाऱ्या त्याच इंजिनने सिस्टम आकार, सोलर-नंतरचे बिल आणि पेबॅक काढतो.</p>
      </section>
      <section class="seo-section">
        <h2>पेबॅक काय ठरवते</h2>
        <ul>
          <li><strong>लहान पेबॅक:</strong> उच्च सर्वोच्च-स्लॅब दर, उच्च दिवसाचा स्व-वापर, अनुदान मिळवलेले,
          नेट (सकल नव्हे) मीटरिंग.</li>
          <li><strong>मोठा पेबॅक:</strong> जास्त अनुदानित वापर (मोफत-युनिट योजना), सिस्टम आकारावर कमी मंजूर
          भार मर्यादा, निर्यातीचा फीड-इन-दर निपटान.</li>
        </ul>
        <p>एखाद्या विक्रेत्याशी करार करण्यापूर्वी, आकडे स्वतः <a href="/solar/">अंदाजक</a> वर आणि तुमच्या
        डिस्कॉमच्या <a href="/mr/tariffs/states/">टॅरिफ पेज</a> विरुद्ध चालवा — विक्रेत्याचा "70% बचत"
        दावा सर्वात तीव्र टॅरिफ गृहीत धरतो, जो तुमचा नसेल.</p>
      </section>`,
    faqsMr: [
      { q: 'नेट मीटरिंग माझे वीज बिल कसे घटवते?',
        a: 'निर्यात केलेली सोलर युनिटे आयात युनिटांविरुद्ध निव्वळ केली जातात, म्हणून तुम्ही फक्त निव्वळ वापरावर टॅरिफ भरता — आणि निव्वळीकरण सर्वात आधी तुमची सर्वात महाग (सर्वोच्च-स्लॅब) युनिटे काढत असल्याने, प्रत्येक सोलर युनिट तुमच्या सर्वात उच्च लागू दराइतके मूल्याचे असते, सरासरीचे नव्हे.' },
      { q: '1 kW रूफटॉप सोलर किती युनिटे उत्पन्न करते?',
        a: 'सुमारे 4 युनिट प्रति दिवस — भारताच्या बहुतेक भागांत सुमारे 110–130 युनिट प्रति महिना, स्थान, दिशा व हंगामानुसार बदलणारी. म्हणून 3 kW सिस्टम प्रति महिना सुमारे 330–390 युनिटे ऑफसेट करते.' },
      { q: 'मला मोफत वीज युनिटे मिळत असतील तर नेट मीटरिंग फायद्याचे आहे का?',
        a: 'छोट्या सिस्टमसाठी अनेकदा नाही. एखादी राज्य योजना (जसे कर्नाटकची गृह ज्योती किंवा तमिळनाडूचा मोफत-युनिट ब्लॉक) आधीच तुमचे बिल शून्य करत असेल, तर सोलर फक्त मोफत पात्रतेपलीकडील वापरावर बचत करू शकते — त्या अतिरिक्ताच्या हिशेबाने आकार द्या, किंवा वापर वाढेपर्यंत थांबा.' },
      { q: 'नेट मीटरिंग आणि नेट बिलिंगमध्ये काय फरक आहे?',
        a: 'नेट मीटरिंगमध्ये, निर्यात युनिटे तुमच्या किरकोळ टॅरिफवर एक-बदल्यात-एक आयात युनिटांना ऑफसेट करतात. नेट बिलिंगमध्ये (सकल निपटान), निर्यात कमी फीड-इन दराने दिले जाते तर आयातावर पूर्ण टॅरिफ लागतो — तेच हार्डवेअर, बरेच वाईट अर्थकारण. कोणते लागू आहे हे तुमच्या राज्याच्या सध्याच्या नियमांवर अवलंबून आहे.' },
    ],
  },

  {
    slug: 'uppcl-sanctioned-load-increased',
    published: "2025-12-13",
    states: ['Uttar Pradesh'],
    title: 'Why Did My Sanctioned Load Suddenly Increase? (UPPCL / UP)',
    metaTitle: 'UPPCL Increased My Sanctioned Load Automatically — Why, and How to Reduce It',
    description: 'Why UPPCL suddenly increased your sanctioned load without an application: smart meters record Maximum Demand, and the UP Supply Code lets the DISCOM revise your load to match it. What it costs you, how to check your bill, and how to apply for load reduction.',
    minutes: 5,
    intro: `If your UPPCL bill suddenly shows a higher sanctioned load — 1 kW became 2 kW, or
      2 kW became 4 kW — you are not alone, and it is usually not a mistake. Your new
      <strong>smart meter records Maximum Demand (MD)</strong>, and under the UP Electricity
      Supply Code the DISCOM can revise your sanctioned load upward to match the demand you
      actually drew — <em>without</em> you applying for it. This guide explains why it happens,
      exactly what it costs you every month, and how to get the load reduced if it was a one-off spike.`,
    sections: `
      <section class="seo-section">
        <h2>The short answer: your smart meter recorded a higher demand</h2>
        <p>Your old electromechanical meter only counted units. A <strong>smart meter also records
        Maximum Demand (MD)</strong> — the highest average power you drew in any demand window
        during the billing month. If that recorded demand repeatedly exceeds your sanctioned load,
        the UP Electricity Supply Code allows the DISCOM to treat your load as enhanced and revise
        it to the recorded demand — automatically, on the bill, with no application from you.</p>
        <p>That is why the increase feels sudden: nothing changed in your house except the meter.
        The demand was probably always there — running an inverter AC, a geyser and an iron at the
        same time can easily draw 3–4 kW for a while — but until the smart meter, nobody was
        measuring it.</p>
      </section>

      <section class="seo-section">
        <h2>What a higher sanctioned load costs you</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Effect</th><th>Why it hits your bill</th></tr></thead>
          <tbody>
            <tr><td><strong>Higher fixed charge — every month</strong></td><td>UP fixed charges are billed <strong>per kW of sanctioned load</strong>, consumption or not. Each extra kW adds the full per-kW fixed charge to every future bill. Current per-kW rates for your DISCOM are on our <a href="/tariffs/uttar-pradesh/">UP tariff pages</a>.</td></tr>
            <tr><td><strong>Loss of lifeline rates</strong></td><td>UP's lifeline (subsidised) domestic schedule applies only to connections of <strong>up to 1 kW</strong> with low consumption. If your load is revised from 1 kW to 2 kW, you drop out of the lifeline slab even if your usage never changed.</td></tr>
            <tr><td><strong>Higher schedule for commercial users</strong></td><td>Commercial (LMV-2) connections crossing <strong>4 kW</strong> move to a costlier rate schedule with a higher per-kW fixed charge and steeper energy slabs.</td></tr>
            <tr><td><strong>Additional security deposit</strong></td><td>The security deposit is linked to load and consumption, so the DISCOM may raise a one-time additional security demand after an enhancement.</td></tr>
          </tbody>
        </table></div>
        <p>To see the exact rupee impact for your connection, put your units into the
        <a href="/?state=Uttar%20Pradesh#calculator">UPPCL bill calculator</a> twice — once with the
        old load and once with the new — and compare the totals.</p>
      </section>

      <section class="seo-section">
        <h2>Check your bill: was the increase justified?</h2>
        <ol>
          <li><strong>Find the MD line.</strong> Smart-meter bills print the recorded Maximum Demand
          (often "MD" or "Max Demand", in kW) alongside the sanctioned load. Compare the two across
          your last few bills.</li>
          <li><strong>One spike or a pattern?</strong> Load revision is meant for demand that
          exceeds the sanctioned load <em>repeatedly</em> across billing months — not a single
          festival-day spike. If only one month crossed the line, you have a case for reversal at
          your sub-division office.</li>
          <li><strong>Is the MD plausible?</strong> Add up the wattage of appliances you actually
          run together. A 1.5-ton inverter AC (~1.5–2 kW) + geyser (~2 kW) alone exceeds 3 kW. If
          the printed MD is far above anything you could have drawn, ask for the meter's MD data
          before accepting the revision.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>How to get your load reduced</h2>
        <ol>
          <li><strong>Apply for load reduction</strong> at your sub-division office or through
          UPPCL's online consumer services (uppcl.org → load reduction/enhancement). It is a
          standard, free-form request — you do not need a lawyer or an agent.</li>
          <li><strong>Keep your demand inside the lower load first.</strong> Reduction is normally
          sanctioned only if your recorded MD over recent months actually stays within the load you
          are asking for — stagger heavy appliances (don't run the geyser and AC together) for a
          couple of billing cycles before applying.</li>
          <li><strong>If the enhancement itself was wrong</strong> (single spike, defective meter,
          MD data doesn't match your appliances), file a written complaint at the sub-division and
          escalate to the Consumer Grievance Redressal Forum if unresolved — keep copies of the
          bills showing the MD history.</li>
        </ol>
        <p>Not sure whether your numbers justify a complaint? Upload your bill to our free
        <a href="/bill-review/">expert Bill Review</a> and we'll check the load, MD and fixed-charge
        lines for you.</p>
      </section>

      <section class="seo-section">
        <h2>How to stop it happening again</h2>
        <ul>
          <li><strong>Know your big loads.</strong> Geyser, AC, iron, induction cooktop and pump are
          the usual culprits — any two together can cross a 2 kW sanctioned load.</li>
          <li><strong>Stagger, don't stack.</strong> MD is an average over a demand window, so
          running heavy appliances one after another instead of together keeps recorded demand
          low with zero lifestyle cost.</li>
          <li><strong>Or accept the higher load.</strong> If you genuinely use 3–4 kW routinely,
          the enhanced load is correct — an under-sanctioned connection risks penalties and is the
          wrong thing to optimise. Budget the fixed charge with the
          <a href="/?state=Uttar%20Pradesh#calculator">calculator</a> instead.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'Can UPPCL increase my sanctioned load without my permission?',
        a: 'Yes. Under the UP Electricity Supply Code, if the demand recorded by your meter repeatedly exceeds your sanctioned load, the DISCOM can revise the load upward to the recorded demand without an application from you. The revised load appears directly on your bill.' },
      { q: 'Why did my load increase after the smart meter was installed?',
        a: 'Old domestic meters only counted units; smart meters also record Maximum Demand (MD). The demand you drew was probably always above your sanctioned load — running an AC and geyser together easily exceeds 2 kW — but it was only measurable, and therefore actionable, after the smart meter arrived.' },
      { q: 'How do I reduce my sanctioned load in UP?',
        a: 'Apply for load reduction at your sub-division office or through UPPCL’s online consumer services. Reduction is normally approved only if your recorded maximum demand over recent billing months stays within the lower load — so stagger heavy appliances for a couple of cycles before applying.' },
      { q: 'Does a higher sanctioned load increase my bill even if my usage is the same?',
        a: 'Yes. UP fixed charges are billed per kW of sanctioned load every month regardless of consumption, and a load above 1 kW also disqualifies you from the subsidised lifeline slab. Same units, higher bill.' },
      { q: 'What is Maximum Demand (MD) on my electricity bill?',
        a: 'MD is the highest average power (in kW) you drew in any demand-measurement window during the billing period, recorded by the meter and reset each cycle. It reflects how many appliances you ran simultaneously, not how many units you consumed overall.' },
    ],

    titleHi: 'मेरा स्वीकृत भार अचानक क्यों बढ़ गया? (UPPCL / यूपी)',
    metaTitleHi: 'UPPCL ने स्वीकृत भार अपने आप बढ़ा दिया — क्यों, और कैसे घटाएँ',
    descriptionHi: 'UPPCL ने बिना आवेदन आपका स्वीकृत भार क्यों बढ़ाया: स्मार्ट मीटर अधिकतम मांग (MD) दर्ज करता है, और यूपी सप्लाई कोड डिस्कॉम को भार उसी के बराबर संशोधित करने देता है। इसकी मासिक लागत, बिल कैसे जाँचें, और भार घटाने का आवेदन कैसे करें।',
    introHi: `अगर आपके UPPCL बिल में स्वीकृत भार अचानक बढ़ा दिखे — 1 kW से 2 kW, या 2 kW से 4 kW —
      तो आप अकेले नहीं हैं, और यह आमतौर पर गलती नहीं है। आपका नया <strong>स्मार्ट मीटर अधिकतम मांग
      (MD) दर्ज करता है</strong>, और यूपी विद्युत आपूर्ति संहिता के तहत डिस्कॉम आपका स्वीकृत भार आपकी
      वास्तविक खींची गई मांग के बराबर <em>बिना आपके आवेदन के</em> बढ़ा सकता है। यह गाइड बताती है कि
      ऐसा क्यों होता है, इसकी हर महीने की कीमत क्या है, और एक बार की स्पाइक होने पर भार वापस कैसे घटवाएँ।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>छोटा जवाब: आपके स्मार्ट मीटर ने ऊँची मांग दर्ज की</h2>
        <p>आपका पुराना मीटर सिर्फ़ यूनिटें गिनता था। <strong>स्मार्ट मीटर अधिकतम मांग (MD) भी दर्ज
        करता है</strong> — बिलिंग माह में किसी भी डिमांड विंडो में आपके द्वारा खींची गई सबसे ऊँची औसत
        बिजली। अगर यह दर्ज मांग आपके स्वीकृत भार से बार-बार ऊपर जाती है, तो यूपी विद्युत आपूर्ति संहिता
        डिस्कॉम को आपका भार बढ़ा हुआ मानकर दर्ज मांग के बराबर संशोधित करने की अनुमति देती है — अपने आप,
        बिल पर, आपके किसी आवेदन के बिना।</p>
        <p>इसीलिए वृद्धि अचानक लगती है: आपके घर में मीटर के अलावा कुछ नहीं बदला। मांग शायद हमेशा से
        थी — इन्वर्टर AC, गीज़र और प्रेस एक साथ चलाने पर आसानी से कुछ देर के लिए 3–4 kW खिंच जाता है —
        बस स्मार्ट मीटर से पहले उसे कोई माप नहीं रहा था।</p>
      </section>

      <section class="seo-section">
        <h2>ऊँचे स्वीकृत भार की कीमत</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>असर</th><th>बिल पर क्यों पड़ता है</th></tr></thead>
          <tbody>
            <tr><td><strong>हर महीने ऊँचा फिक्स्ड चार्ज</strong></td><td>यूपी में फिक्स्ड चार्ज <strong>स्वीकृत भार के प्रति kW</strong> पर लगता है, खपत हो या न हो। हर अतिरिक्त kW हर भविष्य के बिल में पूरा प्रति-kW फिक्स्ड चार्ज जोड़ देता है। आपके डिस्कॉम की वर्तमान दरें हमारे <a href="/hi/tariffs/uttar-pradesh/">यूपी टैरिफ पेज</a> पर हैं।</td></tr>
            <tr><td><strong>लाइफलाइन दरों का नुकसान</strong></td><td>यूपी की लाइफलाइन (सब्सिडी वाली) घरेलू अनुसूची केवल <strong>1 kW तक</strong> के कम-खपत कनेक्शनों पर लागू है। भार 1 kW से 2 kW होते ही आप लाइफलाइन स्लैब से बाहर हो जाते हैं, भले ही खपत न बदली हो।</td></tr>
            <tr><td><strong>व्यावसायिक उपभोक्ताओं के लिए ऊँची अनुसूची</strong></td><td>व्यावसायिक (LMV-2) कनेक्शन <strong>4 kW</strong> पार करते ही महँगी दर अनुसूची में चले जाते हैं — ऊँचा प्रति-kW फिक्स्ड चार्ज और तीखे ऊर्जा स्लैब।</td></tr>
            <tr><td><strong>अतिरिक्त जमानत राशि</strong></td><td>सुरक्षा जमा भार और खपत से जुड़ी है, इसलिए भार बढ़ने के बाद डिस्कॉम एक बार की अतिरिक्त जमानत की मांग कर सकता है।</td></tr>
          </tbody>
        </table></div>
        <p>अपने कनेक्शन पर सटीक रुपये का असर देखने के लिए अपनी यूनिटें
        <a href="/?state=Uttar%20Pradesh#calculator">UPPCL बिल कैलकुलेटर</a> में दो बार डालें — एक बार
        पुराने भार से, एक बार नए से — और कुल की तुलना करें।</p>
      </section>

      <section class="seo-section">
        <h2>बिल जाँचें: क्या वृद्धि जायज़ थी?</h2>
        <ol>
          <li><strong>MD लाइन खोजें।</strong> स्मार्ट-मीटर बिलों पर दर्ज अधिकतम मांग ("MD" या "Max
          Demand", kW में) स्वीकृत भार के साथ छपती है। पिछले कुछ बिलों में दोनों की तुलना करें।</li>
          <li><strong>एक स्पाइक या पैटर्न?</strong> भार संशोधन उस मांग के लिए है जो स्वीकृत भार से
          <em>बार-बार</em>, कई बिलिंग महीनों में ऊपर जाए — किसी एक त्योहार के दिन की स्पाइक के लिए नहीं।
          अगर सिर्फ़ एक महीने में सीमा पार हुई, तो उपखंड कार्यालय में वापसी का मज़बूत आधार है।</li>
          <li><strong>क्या MD विश्वसनीय है?</strong> जो उपकरण आप सच में साथ चलाते हैं उनकी वाट क्षमता
          जोड़ें। 1.5 टन इन्वर्टर AC (~1.5–2 kW) + गीज़र (~2 kW) मिलकर ही 3 kW पार कर देते हैं। अगर छपा
          MD आपकी किसी भी संभावित खपत से बहुत ऊपर है, तो संशोधन मानने से पहले मीटर का MD डेटा माँगें।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>भार वापस कैसे घटवाएँ</h2>
        <ol>
          <li><strong>भार घटाने का आवेदन करें</strong> — अपने उपखंड कार्यालय में या UPPCL की ऑनलाइन
          उपभोक्ता सेवाओं (uppcl.org → load reduction/enhancement) से। यह एक सामान्य, निःशुल्क
          आवेदन है — वकील या एजेंट की ज़रूरत नहीं।</li>
          <li><strong>पहले अपनी मांग को कम भार के भीतर रखें।</strong> कमी आमतौर पर तभी मंज़ूर होती है
          जब हाल के महीनों की दर्ज MD माँगे गए भार के भीतर रहे — आवेदन से पहले दो-एक बिलिंग चक्र भारी
          उपकरण एक साथ न चलाएँ (गीज़र और AC साथ नहीं)।</li>
          <li><strong>अगर वृद्धि ही गलत थी</strong> (एक स्पाइक, खराब मीटर, MD डेटा आपके उपकरणों से मेल
          नहीं खाता), तो उपखंड में लिखित शिकायत दें और हल न होने पर उपभोक्ता शिकायत निवारण मंच तक ले
          जाएँ — MD इतिहास दिखाने वाले बिलों की प्रतियाँ रखें।</li>
        </ol>
        <p>पक्का नहीं कि आपके आँकड़े शिकायत लायक़ हैं? अपना बिल हमारी मुफ़्त
        <a href="/bill-review/">विशेषज्ञ बिल समीक्षा</a> में अपलोड करें — हम भार, MD और फिक्स्ड-चार्ज
        लाइनें आपके लिए जाँच देंगे।</p>
      </section>

      <section class="seo-section">
        <h2>दोबारा न हो, इसके लिए</h2>
        <ul>
          <li><strong>अपने बड़े लोड पहचानें।</strong> गीज़र, AC, प्रेस, इंडक्शन चूल्हा और पंप ही आम कारण
          हैं — कोई भी दो साथ चलें तो 2 kW का स्वीकृत भार पार हो सकता है।</li>
          <li><strong>एक साथ नहीं, बारी-बारी।</strong> MD एक डिमांड विंडो का औसत है, इसलिए भारी उपकरण
          एक के बाद एक चलाने से दर्ज मांग कम रहती है — जीवनशैली पर कोई असर डाले बिना।</li>
          <li><strong>या ऊँचा भार स्वीकार करें।</strong> अगर आप सच में नियमित 3–4 kW इस्तेमाल करते हैं,
          तो बढ़ा हुआ भार सही है — कम स्वीकृत भार पर चलना जुर्माने का जोखिम है और गलत बचत है। फिक्स्ड
          चार्ज का बजट <a href="/?state=Uttar%20Pradesh#calculator">कैलकुलेटर</a> से बनाएँ।</li>
        </ul>
      </section>`,
    faqsHi: [
      { q: 'क्या UPPCL मेरी अनुमति के बिना स्वीकृत भार बढ़ा सकता है?',
        a: 'हाँ। यूपी विद्युत आपूर्ति संहिता के तहत, अगर मीटर द्वारा दर्ज मांग आपके स्वीकृत भार से बार-बार ऊपर जाती है, तो डिस्कॉम बिना आपके आवेदन के भार को दर्ज मांग के बराबर बढ़ा सकता है। संशोधित भार सीधे आपके बिल पर दिखता है।' },
      { q: 'स्मार्ट मीटर लगने के बाद मेरा भार क्यों बढ़ा?',
        a: 'पुराने घरेलू मीटर सिर्फ़ यूनिटें गिनते थे; स्मार्ट मीटर अधिकतम मांग (MD) भी दर्ज करता है। आपकी मांग शायद पहले से स्वीकृत भार के ऊपर थी — AC और गीज़र साथ चलाने पर ही 2 kW पार हो जाता है — पर स्मार्ट मीटर आने के बाद ही वह मापी जा सकी।' },
      { q: 'यूपी में स्वीकृत भार कैसे घटवाएँ?',
        a: 'उपखंड कार्यालय में या UPPCL की ऑनलाइन उपभोक्ता सेवाओं से भार घटाने का आवेदन करें। कमी आमतौर पर तभी मंज़ूर होती है जब हाल के बिलिंग महीनों की दर्ज अधिकतम मांग कम भार के भीतर रहे — इसलिए आवेदन से पहले कुछ चक्र भारी उपकरण बारी-बारी चलाएँ।' },
      { q: 'क्या खपत वही रहने पर भी ऊँचा स्वीकृत भार बिल बढ़ाता है?',
        a: 'हाँ। यूपी में फिक्स्ड चार्ज हर महीने स्वीकृत भार के प्रति kW पर लगता है, खपत चाहे जो हो, और 1 kW से ऊपर का भार आपको सब्सिडी वाले लाइफलाइन स्लैब से भी बाहर कर देता है। यूनिटें वही, बिल ज़्यादा।' },
      { q: 'बिजली बिल पर अधिकतम मांग (MD) क्या है?',
        a: 'MD बिलिंग अवधि में किसी भी डिमांड-मापन विंडो में आपकी खींची गई सबसे ऊँची औसत बिजली (kW में) है, जो मीटर दर्ज करता है और हर चक्र में रीसेट होती है। यह बताती है कि आपने कितने उपकरण एक साथ चलाए, कुल कितनी यूनिटें खर्च कीं यह नहीं।' },
    ],

    titleMr: 'माझा मंजूर भार अचानक का वाढला? (UPPCL / यूपी)',
    metaTitleMr: 'UPPCL ने मंजूर भार आपोआप वाढवला — का, आणि कसा कमी करावा',
    descriptionMr: 'UPPCL ने अर्जाशिवाय तुमचा मंजूर भार का वाढवला: स्मार्ट मीटर कमाल मागणी (MD) नोंदवते, आणि यूपी पुरवठा संहिता डिस्कॉमला भार त्यानुसार सुधारू देते. त्याची मासिक किंमत, बिल कसे तपासावे, आणि भार कमी करण्यासाठी अर्ज कसा करावा.',
    introMr: `तुमच्या UPPCL बिलावर मंजूर भार अचानक जास्त दिसत असेल — 1 kW चे 2 kW, किंवा 2 kW चे 4 kW —
      तर तुम्ही एकटे नाही, आणि ती सहसा चूक नसते. तुमचे नवीन <strong>स्मार्ट मीटर कमाल मागणी (MD)
      नोंदवते</strong>, आणि यूपी वीज पुरवठा संहितेनुसार डिस्कॉम तुमचा मंजूर भार तुम्ही प्रत्यक्षात ओढलेल्या
      मागणीइतका <em>तुमच्या अर्जाशिवाय</em> वाढवू शकतो. ही मार्गदर्शिका असे का होते, त्याची दर महिन्याला
      नेमकी किंमत काय, आणि एकवेळ उसळी असल्यास भार कसा कमी करून घ्यावा हे समजावते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>छोटे उत्तर: तुमच्या स्मार्ट मीटरने जास्त मागणी नोंदवली</h2>
        <p>तुमचे जुने मीटर फक्त युनिटे मोजत होते. <strong>स्मार्ट मीटर कमाल मागणी (MD) देखील नोंदवते</strong>
        — बिलिंग महिन्यात कोणत्याही मागणी खिडकीत तुम्ही ओढलेली सर्वोच्च सरासरी वीज. ती नोंदलेली मागणी
        तुमच्या मंजूर भारापेक्षा वारंवार जास्त गेली, तर यूपी वीज पुरवठा संहिता डिस्कॉमला तुमचा भार वाढलेला
        मानून नोंदलेल्या मागणीइतका सुधारण्याची परवानगी देते — आपोआप, बिलावर, तुमच्या कोणत्याही अर्जाशिवाय.</p>
        <p>म्हणूनच वाढ अचानक वाटते: तुमच्या घरात मीटरशिवाय काहीही बदलले नाही. मागणी बहुधा नेहमीच होती —
        इन्व्हर्टर AC, गिझर आणि इस्त्री एकाच वेळी चालवल्यास सहज काही वेळ 3–4 kW ओढले जाते — पण स्मार्ट
        मीटरपूर्वी कोणी ते मोजत नव्हते.</p>
      </section>

      <section class="seo-section">
        <h2>उच्च मंजूर भाराची किंमत</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>परिणाम</th><th>बिलावर का पडतो</th></tr></thead>
          <tbody>
            <tr><td><strong>दर महिन्याला जास्त स्थिर आकार</strong></td><td>यूपीत स्थिर आकार <strong>मंजूर भाराच्या प्रति kW</strong> लागतो, वापर असो वा नसो. प्रत्येक अतिरिक्त kW प्रत्येक भविष्यातील बिलात पूर्ण प्रति-kW स्थिर आकार जोडतो. तुमच्या डिस्कॉमचे सध्याचे दर आमच्या <a href="/tariffs/uttar-pradesh/">यूपी टॅरिफ पेजांवर</a> आहेत.</td></tr>
            <tr><td><strong>लाइफलाइन दरांचे नुकसान</strong></td><td>यूपीची लाइफलाइन (अनुदानित) घरगुती अनुसूची फक्त <strong>1 kW पर्यंतच्या</strong> कमी-वापर जोडण्यांना लागू होते. भार 1 kW वरून 2 kW होताच तुम्ही लाइफलाइन स्लॅबबाहेर पडता, वापर न बदलताही.</td></tr>
            <tr><td><strong>व्यावसायिक वापरकर्त्यांसाठी उच्च अनुसूची</strong></td><td>व्यावसायिक (LMV-2) जोडण्या <strong>4 kW</strong> ओलांडताच महागड्या दर अनुसूचीत जातात — जास्त प्रति-kW स्थिर आकार व तीव्र ऊर्जा स्लॅब.</td></tr>
            <tr><td><strong>अतिरिक्त अनामत रक्कम</strong></td><td>सुरक्षा ठेव भार व वापराशी जोडलेली आहे, म्हणून भार वाढल्यानंतर डिस्कॉम एकवेळ अतिरिक्त अनामतीची मागणी करू शकतो.</td></tr>
          </tbody>
        </table></div>
        <p>तुमच्या जोडणीसाठी नेमका रुपयांतील परिणाम पाहण्यासाठी तुमची युनिटे <a href="/?state=Uttar%20Pradesh#calculator">UPPCL
        बिल कॅल्क्युलेटर</a> मध्ये दोनदा टाका — एकदा जुन्या भाराने, एकदा नव्याने — आणि एकूण तुलना करा.</p>
      </section>

      <section class="seo-section">
        <h2>बिल तपासा: वाढ न्याय्य होती का?</h2>
        <ol>
          <li><strong>MD ओळ शोधा.</strong> स्मार्ट-मीटर बिलांवर नोंदलेली कमाल मागणी (अनेकदा "MD" किंवा
          "Max Demand", kW मध्ये) मंजूर भारासोबत छापली जाते. मागील काही बिलांत दोन्हींची तुलना करा.</li>
          <li><strong>एक उसळी की नमुना?</strong> भार सुधारणा त्या मागणीसाठी आहे जी मंजूर भारापेक्षा
          <em>वारंवार</em>, अनेक बिलिंग महिन्यांत जास्त जाते — एका सणाच्या दिवसाच्या उसळीसाठी नव्हे. फक्त
          एका महिन्यात मर्यादा ओलांडली असेल, तर उपविभाग कार्यालयात उलटवण्याचा भक्कम आधार आहे.</li>
          <li><strong>MD विश्वसनीय आहे का?</strong> तुम्ही खरोखर एकत्र चालवता त्या उपकरणांचे वॅटेज बेरीज
          करा. 1.5 टन इन्व्हर्टर AC (~1.5–2 kW) + गिझर (~2 kW) मिळूनच 3 kW ओलांडतात. छापील MD तुमच्या
          कोणत्याही संभाव्य वापरापेक्षा खूप जास्त असेल, तर सुधारणा स्वीकारण्यापूर्वी मीटरचा MD डेटा मागा.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>भार कसा कमी करून घ्यावा</h2>
        <ol>
          <li><strong>भार कमी करण्यासाठी अर्ज करा</strong> — तुमच्या उपविभाग कार्यालयात किंवा UPPCL च्या
          ऑनलाइन ग्राहक सेवांद्वारे (uppcl.org → load reduction/enhancement). ही एक सामान्य, मुक्त-स्वरूप
          विनंती आहे — वकील किंवा एजंटची गरज नाही.</li>
          <li><strong>आधी तुमची मागणी कमी भाराच्या आत ठेवा.</strong> कपात सामान्यतः तेव्हाच मंजूर होते
          जेव्हा अलीकडच्या महिन्यांतील नोंदलेली MD तुम्ही मागत असलेल्या भाराच्या आत राहते — अर्जापूर्वी
          दोन-एक बिलिंग चक्रे भारी उपकरणे एकत्र चालवू नका (गिझर व AC एकत्र नको).</li>
          <li><strong>वाढ स्वतःच चुकीची असेल</strong> (एक उसळी, सदोष मीटर, MD डेटा तुमच्या उपकरणांशी जुळत
          नाही), तर उपविभागात लेखी तक्रार द्या आणि निराकरण न झाल्यास ग्राहक तक्रार निवारण मंचाकडे न्या —
          MD इतिहास दाखवणाऱ्या बिलांच्या प्रती ठेवा.</li>
        </ol>
        <p>तुमचे आकडे तक्रारीस पात्र आहेत का याची खात्री नाही? तुमचे बिल आमच्या मोफत
        <a href="/bill-review/">तज्ज्ञ बिल समीक्षा</a> मध्ये अपलोड करा — आम्ही भार, MD आणि स्थिर-आकार ओळी
        तुमच्यासाठी तपासू.</p>
      </section>

      <section class="seo-section">
        <h2>पुन्हा होऊ नये म्हणून</h2>
        <ul>
          <li><strong>तुमचे मोठे भार ओळखा.</strong> गिझर, AC, इस्त्री, इंडक्शन शेगडी आणि पंप हीच सामान्य
          कारणे — यापैकी कोणतेही दोन एकत्र चालल्यास 2 kW चा मंजूर भार ओलांडू शकतो.</li>
          <li><strong>एकत्र नव्हे, आळीपाळीने.</strong> MD ही एका मागणी खिडकीची सरासरी आहे, म्हणून भारी
          उपकरणे एकामागून एक चालवल्यास नोंदलेली मागणी कमी राहते — जीवनशैलीवर शून्य परिणामासह.</li>
          <li><strong>किंवा उच्च भार स्वीकारा.</strong> तुम्ही खरोखर नियमित 3–4 kW वापरत असाल, तर वाढलेला
          भार बरोबर आहे — कमी-मंजूर जोडणी दंडाचा धोका आहे आणि चुकीची बचत आहे. त्याऐवजी स्थिर आकाराचे
          अंदाजपत्रक <a href="/?state=Uttar%20Pradesh#calculator">कॅल्क्युलेटर</a> ने बनवा.</li>
        </ul>
      </section>`,
    faqsMr: [
      { q: 'UPPCL माझ्या परवानगीशिवाय मंजूर भार वाढवू शकतो का?',
        a: 'होय. यूपी वीज पुरवठा संहितेनुसार, मीटरने नोंदलेली मागणी तुमच्या मंजूर भारापेक्षा वारंवार जास्त गेल्यास, डिस्कॉम तुमच्या अर्जाशिवाय भार नोंदलेल्या मागणीइतका वाढवू शकतो. सुधारित भार थेट तुमच्या बिलावर दिसतो.' },
      { q: 'स्मार्ट मीटर बसल्यानंतर माझा भार का वाढला?',
        a: 'जुनी घरगुती मीटरे फक्त युनिटे मोजत; स्मार्ट मीटर कमाल मागणी (MD) देखील नोंदवते. तुम्ही ओढलेली मागणी बहुधा आधीच मंजूर भारापेक्षा जास्त होती — AC व गिझर एकत्र चालवल्यास सहज 2 kW ओलांडते — पण ती फक्त स्मार्ट मीटर आल्यावरच मोजता येऊ लागली.' },
      { q: 'यूपीत मंजूर भार कसा कमी करावा?',
        a: 'उपविभाग कार्यालयात किंवा UPPCL च्या ऑनलाइन ग्राहक सेवांद्वारे भार कमी करण्यासाठी अर्ज करा. कपात सामान्यतः तेव्हाच मंजूर होते जेव्हा अलीकडच्या बिलिंग महिन्यांतील नोंदलेली कमाल मागणी कमी भाराच्या आत राहते — म्हणून अर्जापूर्वी काही चक्रे भारी उपकरणे आळीपाळीने चालवा.' },
      { q: 'वापर तोच राहिला तरी उच्च मंजूर भार बिल वाढवतो का?',
        a: 'होय. यूपीत स्थिर आकार दर महिन्याला मंजूर भाराच्या प्रति kW लागतो, वापर कितीही असो, आणि 1 kW हून जास्त भार तुम्हाला अनुदानित लाइफलाइन स्लॅबबाहेरही काढतो. युनिटे तीच, बिल जास्त.' },
      { q: 'वीज बिलावर कमाल मागणी (MD) म्हणजे काय?',
        a: 'MD ही बिलिंग कालावधीत कोणत्याही मागणी-मापन खिडकीत तुम्ही ओढलेली सर्वोच्च सरासरी वीज (kW मध्ये) आहे, जी मीटर नोंदवते आणि प्रत्येक चक्रात रीसेट होते. ती तुम्ही किती उपकरणे एकत्र चालवली हे दर्शवते, एकूण किती युनिटे वापरली हे नव्हे.' },
    ],
  },

  {
    slug: 'smart-meter-running-fast',
    published: "2025-12-25",
    title: 'Is Your Smart Meter Running Fast? How to Test It Yourself',
    metaTitle: 'Smart Meter Running Fast? Bill Higher After Installation — How to Test It',
    description: 'Why electricity bills often jump right after a smart meter is installed, whether smart meters actually record more than old meters, a 30-minute self-test you can run at home, and the official meter-accuracy test you can demand from your DISCOM.',
    minutes: 6,
    intro: `Smart meters are <strong>not designed to overbill</strong> — but bills genuinely do jump for
      many consumers right after one is installed, and the reasons are usually mundane: the old meter
      was slow, stuck or being estimated, and the new one measures everything. This guide explains why
      the jump happens, how to test your own meter in about 30 minutes with nothing but an appliance
      you already own, and how to demand an official accuracy test if the numbers still don't add up.`,
    sections: `
      <section class="seo-section">
        <h2>Why bills jump right after a smart meter is installed</h2>
        <p>Before assuming the new meter is fast, rule out the four common causes — none of which
        involve a defective meter:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Cause</th><th>What actually happened</th></tr></thead>
          <tbody>
            <tr><td><strong>The old meter was slow or stuck</strong></td><td>Electromechanical (disc) meters lose accuracy with age and often under-record for years. The smart meter's reading is the correct one — the "increase" is consumption you were never billed for.</td></tr>
            <tr><td><strong>You were on estimated readings</strong></td><td>If the old meter was inaccessible or defective (codes like IDF/RDF on the bill), the DISCOM guessed your usage — often low. The first real readings look like a jump.</td></tr>
            <tr><td><strong>A catch-up or adjustment bill</strong></td><td>The final reading of the old meter plus the first period of the new one sometimes lands in a single bill, pushing units into higher <a href="/glossary/#telescopic-slabs">slabs</a> for that month only.</td></tr>
            <tr><td><strong>Demand is now recorded</strong></td><td>Smart meters log <a href="/glossary/#maximum-demand">maximum demand</a>, which old domestic meters never measured. That can trigger a sanctioned-load revision and higher fixed charges — see <a href="/guides/uppcl-sanctioned-load-increased/">why sanctioned load increases after a smart meter</a>.</td></tr>
          </tbody>
        </table></div>
        <p>If your bill rose but the <em>units</em> are similar to last year's same season, the cause is
        a tariff or charge change instead — work through
        <a href="/guides/why-did-my-electricity-bill-increase/">the bill-increase checklist</a>.</p>
      </section>

      <section class="seo-section">
        <h2>Can a smart meter actually run fast?</h2>
        <p>Any meter can be defective, but a smart meter is <em>less</em> likely to over-read than what
        it replaced. Smart meters are static (electronic) meters of <strong>accuracy class 1.0</strong> —
        permitted error within ±1% — while the old disc meters were typically class 2.0 (±2%) and
        drifted further with wear. There is also no mechanism for a DISCOM to "speed up" a meter
        remotely: the meter firmware is sealed and readings are logged in the meter's own memory,
        which is exactly what makes the self-test below conclusive.</p>
        <p>What a smart meter <em>does</em> do is capture consumption the old setup missed: small
        standby loads around the clock, accurate low-current measurement, and every single day metered
        instead of estimated. That is measurement completeness, not over-reading.</p>
      </section>

      <section class="seo-section">
        <h2>The 30-minute self-test</h2>
        <p>You need one appliance whose wattage you trust — a 2,000 W (2 kW) geyser or room heater is
        ideal because its draw is steady:</p>
        <ol>
          <li><strong>Switch off everything</strong> at the main board except one light so you can see.
          Note the meter reading (or the reading in your DISCOM's smart-meter app) to two decimals.</li>
          <li><strong>Run the known load for exactly 30 minutes.</strong> A 2 kW appliance for half an
          hour should consume almost exactly <strong>1.0 unit</strong> (2 kW × 0.5 h).</li>
          <li><strong>Read the meter again.</strong> Within class-1 tolerance you should see 0.98–1.02
          units. If the meter shows, say, 1.3 units for that half hour, you have real evidence of
          over-recording — proceed to the official test.</li>
        </ol>
        <p>Two refinements: run the test twice to rule out a fridge or pump cycling on somewhere, and
        remember heater elements vary a little with supply voltage — a result within ±5% of expected is
        normal for this informal method. Also check the bill's
        <a href="/glossary/#multiplying-factor">multiplying factor</a> is printed as 1 for a domestic
        single-phase meter; a wrong MF multiplies every unit.</p>
      </section>

      <section class="seo-section">
        <h2>The official route: demand a meter accuracy test</h2>
        <p>Every state's Electricity Supply Code gives you the right to have your meter tested:</p>
        <ol>
          <li><strong>Apply at your sub-division office</strong> (or the DISCOM's online consumer
          portal) for a meter accuracy test, citing your self-test result. A small testing fee applies —
          it is <strong>refunded or adjusted in your bill if the meter turns out defective</strong>.</li>
          <li><strong>Ask for a check meter.</strong> The DISCOM installs a second, tested meter in
          series with yours for a cycle or two; the readings are compared. This is the cleanest
          evidence either way.</li>
          <li><strong>Lab test.</strong> Alternatively the meter is removed in your presence, sealed,
          and bench-tested at the DISCOM's meter lab (you can ask to witness the test).</li>
        </ol>
        <p>If the meter is confirmed fast, the supply code requires the DISCOM to <strong>revise your
        bills for the affected period</strong> (typically capped at a defined number of months) and
        replace the meter free of cost.</p>
      </section>

      <section class="seo-section">
        <h2>If the DISCOM doesn't act</h2>
        <p>Escalate in order: a written complaint with your test evidence to the executive engineer →
        the DISCOM's <strong>Consumer Grievance Redressal Forum (CGRF)</strong> → the state
        <strong>Electricity Ombudsman</strong>. Keep the self-test numbers, photos of the meter display
        and every bill — cases with arithmetic win. Verify what the correct bill <em>should</em> be with
        the <a href="/#calculator">calculator</a>, and attach that breakdown to the complaint.</p>
      </section>`,
    faqs: [
      { q: 'Do smart meters record more units than old meters?',
        a: 'They record more completely, not incorrectly. Smart meters are class-1.0 static meters (±1% permitted error) replacing old disc meters that were class 2.0 and often under-read with age. The typical post-installation "increase" is consumption the old meter was missing or that estimated billing never captured.' },
      { q: 'How do I check if my smart meter is running fast?',
        a: 'Switch everything off, run a single known load — e.g. a 2 kW geyser — for exactly 30 minutes, and compare meter readings before and after. It should register very close to 1.0 unit. A significantly higher figure is evidence to demand an official accuracy test from your DISCOM.' },
      { q: 'How do I get my electricity meter officially tested?',
        a: 'Apply at your sub-division office or the DISCOM portal for a meter accuracy test under your state’s Electricity Supply Code. A small fee applies, refundable if the meter proves defective. You can also request a check meter installed in parallel for a billing cycle, or witness a lab bench test.' },
      { q: 'Will my bills be corrected if the meter is found fast?',
        a: 'Yes. If testing confirms the meter over-records beyond permitted limits, the supply code requires the DISCOM to revise bills for the affected period (usually capped at a set number of months) and replace the meter at no cost.' },
      { q: 'Can the DISCOM remotely make a smart meter read higher?',
        a: 'No. Remote commands cover reading collection, connect/disconnect and tariff-schedule updates — not calibration. The metrology firmware is sealed and type-tested, and readings are logged in the meter’s own memory, which is why a physical self-test or check meter settles the question conclusively.' },
    ],

    titleHi: 'क्या आपका स्मार्ट मीटर तेज़ चल रहा है? खुद ऐसे जाँचें',
    metaTitleHi: 'स्मार्ट मीटर तेज़ चल रहा है? लगने के बाद बिल बढ़ा — खुद जाँचने का तरीका',
    descriptionHi: 'स्मार्ट मीटर लगते ही बिजली बिल अक्सर क्यों बढ़ जाते हैं, क्या स्मार्ट मीटर पुराने मीटर से ज़्यादा दर्ज करते हैं, घर पर 30 मिनट का सेल्फ-टेस्ट, और डिस्कॉम से आधिकारिक मीटर जाँच कराने की प्रक्रिया।',
    introHi: `स्मार्ट मीटर <strong>ज़्यादा बिल बनाने के लिए नहीं बने हैं</strong> — पर कई उपभोक्ताओं के बिल
      मीटर लगते ही सचमुच बढ़ जाते हैं, और वजहें आमतौर पर सीधी-सादी होती हैं: पुराना मीटर धीमा, अटका
      या अनुमानित रीडिंग पर था, और नया सब कुछ मापता है। यह गाइड बताती है कि उछाल क्यों आता है, घर के
      किसी एक उपकरण से करीब 30 मिनट में अपना मीटर कैसे जाँचें, और आँकड़े फिर भी न मिलें तो आधिकारिक
      सटीकता जाँच कैसे माँगें।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>स्मार्ट मीटर लगते ही बिल क्यों उछलते हैं</h2>
        <p>नए मीटर को तेज़ मानने से पहले चार आम कारण खारिज करें — इनमें से किसी में मीटर खराब नहीं होता:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>कारण</th><th>असल में क्या हुआ</th></tr></thead>
          <tbody>
            <tr><td><strong>पुराना मीटर धीमा या अटका था</strong></td><td>पुराने डिस्क वाले मीटर उम्र के साथ सटीकता खोते हैं और सालों तक कम दर्ज करते रहते हैं। स्मार्ट मीटर की रीडिंग ही सही है — "बढ़ोतरी" वह खपत है जिसका बिल आपसे कभी लिया ही नहीं गया।</td></tr>
            <tr><td><strong>आप अनुमानित रीडिंग पर थे</strong></td><td>पुराना मीटर पहुँच से बाहर या खराब (बिल पर IDF/RDF जैसे कोड) था, तो डिस्कॉम खपत का अनुमान — अक्सर कम — लगाता था। पहली असली रीडिंग उछाल जैसी दिखती है।</td></tr>
            <tr><td><strong>कैच-अप या समायोजन बिल</strong></td><td>पुराने मीटर की अंतिम रीडिंग और नए की पहली अवधि कभी-कभी एक ही बिल में आ जाती है, जिससे उस महीने की यूनिटें ऊँचे <a href="/hi/glossary/#telescopic-slabs">स्लैब</a> में चली जाती हैं।</td></tr>
            <tr><td><strong>अब मांग भी दर्ज होती है</strong></td><td>स्मार्ट मीटर <a href="/hi/glossary/#maximum-demand">अधिकतम मांग</a> दर्ज करता है, जो पुराने घरेलू मीटर कभी नहीं मापते थे। इससे स्वीकृत भार संशोधन और ऊँचे फिक्स्ड चार्ज लग सकते हैं — देखें <a href="/hi/guides/uppcl-sanctioned-load-increased/">स्मार्ट मीटर के बाद स्वीकृत भार क्यों बढ़ता है</a>।</td></tr>
          </tbody>
        </table></div>
        <p>बिल बढ़ा है पर <em>यूनिटें</em> पिछले साल के इसी मौसम जैसी हैं, तो वजह टैरिफ या शुल्क बदलाव है —
        <a href="/hi/guides/why-did-my-electricity-bill-increase/">बिल-बढ़ोतरी चेकलिस्ट</a> देखें।</p>
      </section>

      <section class="seo-section">
        <h2>क्या स्मार्ट मीटर सच में तेज़ चल सकता है?</h2>
        <p>कोई भी मीटर खराब हो सकता है, पर स्मार्ट मीटर के ज़्यादा दर्ज करने की संभावना पुराने मीटर से
        <em>कम</em> है। स्मार्ट मीटर <strong>सटीकता श्रेणी 1.0</strong> के स्टैटिक (इलेक्ट्रॉनिक) मीटर हैं —
        अनुमत त्रुटि ±1% — जबकि पुराने डिस्क मीटर आमतौर पर श्रेणी 2.0 (±2%) के थे और घिसाव से और भटकते
        थे। डिस्कॉम के पास मीटर को दूर से "तेज़" करने का कोई तंत्र भी नहीं है: मीटर का फर्मवेयर सील्ड होता
        है और रीडिंग मीटर की अपनी मेमोरी में दर्ज होती है — इसीलिए नीचे दिया सेल्फ-टेस्ट निर्णायक है।</p>
        <p>स्मार्ट मीटर जो <em>करता</em> है वह है छूटी खपत पकड़ना: चौबीसों घंटे के छोटे स्टैंडबाय लोड, कम
        करंट का सटीक मापन, और हर दिन की असली रीडिंग। यह मापन की पूर्णता है, ज़्यादा दर्ज करना नहीं।</p>
      </section>

      <section class="seo-section">
        <h2>30 मिनट का सेल्फ-टेस्ट</h2>
        <p>एक ऐसा उपकरण चाहिए जिसकी वाट क्षमता पर आपको भरोसा हो — 2,000 W (2 kW) का गीज़र या हीटर
        सबसे अच्छा है क्योंकि उसका लोड स्थिर रहता है:</p>
        <ol>
          <li><strong>मेन बोर्ड से सब कुछ बंद करें</strong>, देखने के लिए बस एक बत्ती छोड़ें। मीटर (या
          डिस्कॉम के स्मार्ट-मीटर ऐप) की रीडिंग दो दशमलव तक नोट करें।</li>
          <li><strong>ज्ञात लोड ठीक 30 मिनट चलाएँ।</strong> 2 kW का उपकरण आधे घंटे में लगभग ठीक
          <strong>1.0 यूनिट</strong> खर्च करेगा (2 kW × 0.5 घंटा)।</li>
          <li><strong>मीटर दोबारा पढ़ें।</strong> श्रेणी-1 सीमा में 0.98–1.02 यूनिट दिखनी चाहिए। उस आधे घंटे
          में मीटर मान लीजिए 1.3 यूनिट दिखाए, तो ज़्यादा दर्ज करने का ठोस सबूत है — आधिकारिक जाँच की ओर
          बढ़ें।</li>
        </ol>
        <p>दो सावधानियाँ: टेस्ट दो बार करें ताकि कहीं फ्रिज या पंप का बीच में चल पड़ना खारिज हो, और याद रखें
        हीटर एलिमेंट का लोड वोल्टेज के साथ थोड़ा बदलता है — इस अनौपचारिक तरीके में अपेक्षित से ±5% के भीतर
        का नतीजा सामान्य है। बिल पर <a href="/hi/glossary/#multiplying-factor">मल्टीप्लाइंग फैक्टर</a> भी
        देखें — घरेलू सिंगल-फेज़ मीटर पर 1 छपा होना चाहिए; गलत MF हर यूनिट को गुणा कर देता है।</p>
      </section>

      <section class="seo-section">
        <h2>आधिकारिक रास्ता: मीटर सटीकता जाँच माँगें</h2>
        <p>हर राज्य की विद्युत आपूर्ति संहिता आपको मीटर जाँच का अधिकार देती है:</p>
        <ol>
          <li><strong>उपखंड कार्यालय</strong> (या डिस्कॉम के ऑनलाइन उपभोक्ता पोर्टल) पर सेल्फ-टेस्ट के नतीजे
          के साथ मीटर सटीकता जाँच का आवेदन करें। छोटा-सा जाँच शुल्क लगता है — <strong>मीटर खराब निकलने पर
          वह लौटाया या बिल में समायोजित होता है</strong>।</li>
          <li><strong>चेक मीटर माँगें।</strong> डिस्कॉम आपके मीटर के साथ शृंखला में एक दूसरा, जाँचा हुआ मीटर
          एक-दो चक्र के लिए लगाता है; रीडिंग का मिलान होता है। दोनों तरफ़ के लिए यही सबसे साफ़ सबूत है।</li>
          <li><strong>लैब जाँच।</strong> विकल्प में मीटर आपकी मौजूदगी में उतारकर, सील करके डिस्कॉम की मीटर
          लैब में बेंच-टेस्ट होता है (आप जाँच देखने की माँग कर सकते हैं)।</li>
        </ol>
        <p>मीटर तेज़ साबित हुआ तो आपूर्ति संहिता के तहत डिस्कॉम को प्रभावित अवधि के <strong>बिल संशोधित
        करने</strong> (आमतौर पर तय महीनों की सीमा तक) और मीटर मुफ़्त बदलने होंगे।</p>
      </section>

      <section class="seo-section">
        <h2>डिस्कॉम कार्रवाई न करे तो</h2>
        <p>क्रम से आगे बढ़ें: जाँच के सबूतों के साथ अधिशासी अभियंता को लिखित शिकायत → डिस्कॉम का
        <strong>उपभोक्ता शिकायत निवारण मंच (CGRF)</strong> → राज्य का <strong>विद्युत लोकपाल</strong>।
        सेल्फ-टेस्ट के आँकड़े, मीटर डिस्प्ले की फ़ोटो और हर बिल सँभालकर रखें — गणित वाले मामले जीतते हैं।
        सही बिल कितना <em>होना चाहिए</em> यह <a href="/#calculator">कैलकुलेटर</a> से निकालें और वह
        ब्रेकडाउन शिकायत के साथ लगाएँ।</p>
      </section>`,
    faqsHi: [
      { q: 'क्या स्मार्ट मीटर पुराने मीटर से ज़्यादा यूनिट दर्ज करते हैं?',
        a: 'वे ज़्यादा पूर्णता से दर्ज करते हैं, गलत नहीं। स्मार्ट मीटर श्रेणी-1.0 स्टैटिक मीटर (±1% अनुमत त्रुटि) हैं जो उन डिस्क मीटरों की जगह लगे हैं जो श्रेणी 2.0 के थे और उम्र के साथ अक्सर कम दर्ज करते थे। लगने के बाद की सामान्य "बढ़ोतरी" वह खपत है जो पुराना मीटर छोड़ रहा था या अनुमानित बिलिंग कभी पकड़ती ही नहीं थी।' },
      { q: 'कैसे जाँचूँ कि मेरा स्मार्ट मीटर तेज़ चल रहा है?',
        a: 'सब कुछ बंद करें, एक ज्ञात लोड — जैसे 2 kW गीज़र — ठीक 30 मिनट चलाएँ, और पहले-बाद की मीटर रीडिंग मिलाएँ। लगभग 1.0 यूनिट दर्ज होनी चाहिए। इससे साफ़ ज़्यादा आँकड़ा डिस्कॉम से आधिकारिक सटीकता जाँच माँगने का सबूत है।' },
      { q: 'बिजली मीटर की आधिकारिक जाँच कैसे कराएँ?',
        a: 'अपने राज्य की विद्युत आपूर्ति संहिता के तहत उपखंड कार्यालय या डिस्कॉम पोर्टल पर मीटर सटीकता जाँच का आवेदन करें। छोटा शुल्क लगता है, जो मीटर खराब निकलने पर लौटता है। एक बिलिंग चक्र के लिए समानांतर चेक मीटर भी माँग सकते हैं, या लैब बेंच-टेस्ट देख सकते हैं।' },
      { q: 'मीटर तेज़ निकला तो क्या मेरे बिल सुधरेंगे?',
        a: 'हाँ। जाँच में मीटर अनुमत सीमा से ज़्यादा दर्ज करता पाया गया, तो आपूर्ति संहिता के तहत डिस्कॉम को प्रभावित अवधि के बिल संशोधित करने (आमतौर पर तय महीनों की सीमा तक) और मीटर मुफ़्त बदलने होंगे।' },
      { q: 'क्या डिस्कॉम स्मार्ट मीटर को दूर से ज़्यादा पढ़ने वाला बना सकता है?',
        a: 'नहीं। रिमोट कमांड रीडिंग लेने, कनेक्ट/डिस्कनेक्ट और टैरिफ-अनुसूची अपडेट तक सीमित हैं — कैलिब्रेशन तक नहीं। मापन फर्मवेयर सील्ड और टाइप-टेस्टेड होता है, और रीडिंग मीटर की अपनी मेमोरी में रहती है — इसीलिए भौतिक सेल्फ-टेस्ट या चेक मीटर सवाल को निर्णायक रूप से सुलझा देता है।' },
    ],

    titleMr: 'तुमचे स्मार्ट मीटर वेगात चालते आहे का? स्वतः कसे तपासावे',
    metaTitleMr: 'स्मार्ट मीटर वेगात चालते? बसवल्यानंतर बिल जास्त — कसे तपासावे',
    descriptionMr: 'स्मार्ट मीटर बसवताच वीज बिले अनेकदा का वाढतात, स्मार्ट मीटर खरोखर जुन्या मीटरपेक्षा जास्त नोंदवतात का, घरी 30 मिनिटांची स्व-चाचणी, आणि डिस्कॉमकडून अधिकृत मीटर अचूकता चाचणी कशी मागावी.',
    introMr: `स्मार्ट मीटर <strong>जास्त बिल करण्यासाठी बनवलेले नाहीत</strong> — पण अनेक ग्राहकांची बिले मीटर
      बसवताच खरोखर वाढतात, आणि कारणे सहसा साधी असतात: जुने मीटर मंद, अडकलेले किंवा अंदाजित रीडिंगवर होते,
      आणि नवीन सर्व काही मोजते. ही मार्गदर्शिका उडी का येते, घरातील एका उपकरणाने सुमारे 30 मिनिटांत तुमचे
      मीटर कसे तपासावे, आणि आकडे तरीही जुळत नसतील तर अधिकृत अचूकता चाचणी कशी मागावी, हे समजावते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>स्मार्ट मीटर बसवताच बिले का उसळतात</h2>
        <p>नवीन मीटर वेगात आहे असे मानण्यापूर्वी चार सामान्य कारणे नाकारा — यापैकी कशातही मीटर बिघडलेले
        नसते:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>कारण</th><th>प्रत्यक्षात काय झाले</th></tr></thead>
          <tbody>
            <tr><td><strong>जुने मीटर मंद किंवा अडकलेले होते</strong></td><td>जुनी डिस्क मीटरे वयानुसार अचूकता गमावतात आणि वर्षानुवर्षे कमी नोंदवत राहतात. स्मार्ट मीटरची रीडिंगच बरोबर आहे — "वाढ" म्हणजे तुमच्याकडून कधीच बिल न घेतलेला वापर.</td></tr>
            <tr><td><strong>तुम्ही अंदाजित रीडिंगवर होता</strong></td><td>जुने मीटर पोहोचण्याबाहेर किंवा बिघडलेले (बिलावर IDF/RDF सारखे कोड) असल्यास, डिस्कॉम तुमच्या वापराचा अंदाज — अनेकदा कमी — लावत होता. पहिली खरी रीडिंग उडीसारखी दिसते.</td></tr>
            <tr><td><strong>कॅच-अप किंवा समायोजन बिल</strong></td><td>जुन्या मीटरची अंतिम रीडिंग आणि नव्याची पहिली अवधी कधीकधी एकाच बिलात येते, ज्यामुळे त्या महिन्याच्या युनिटे उच्च <a href="/mr/glossary/#telescopic-slabs">स्लॅब</a> मध्ये ढकलल्या जातात.</td></tr>
            <tr><td><strong>आता मागणीही नोंदली जाते</strong></td><td>स्मार्ट मीटर <a href="/mr/glossary/#maximum-demand">कमाल मागणी</a> नोंदवते, जी जुनी घरगुती मीटरे कधीच मोजत नव्हती. यामुळे मंजूर भार सुधारणा व उच्च स्थिर आकार लागू शकतात — पहा <a href="/mr/guides/uppcl-sanctioned-load-increased/">स्मार्ट मीटरनंतर मंजूर भार का वाढतो</a>.</td></tr>
          </tbody>
        </table></div>
        <p>बिल वाढले पण <em>युनिटे</em> मागील वर्षीच्या याच हंगामासारखी असतील, तर कारण टॅरिफ किंवा आकार बदल
        आहे — <a href="/mr/guides/why-did-my-electricity-bill-increase/">बिल-वाढ तपासणी सूची</a> पहा.</p>
      </section>

      <section class="seo-section">
        <h2>स्मार्ट मीटर खरोखर वेगात चालू शकते का?</h2>
        <p>कोणतेही मीटर बिघडू शकते, पण स्मार्ट मीटरचे जास्त नोंदवण्याची शक्यता त्याने बदललेल्यापेक्षा
        <em>कमी</em> आहे. स्मार्ट मीटर <strong>अचूकता श्रेणी 1.0</strong> ची स्टॅटिक (इलेक्ट्रॉनिक) मीटरे
        आहेत — अनुमत त्रुटी ±1% च्या आत — तर जुनी डिस्क मीटरे सामान्यतः श्रेणी 2.0 (±2%) ची होती आणि
        झिजेने आणखी भरकटत होती. डिस्कॉमकडे मीटर दुरून "वेगवान" करण्याची कोणतीही यंत्रणा नाही: मीटरचे
        फर्मवेअर सीलबंद असते आणि रीडिंग मीटरच्या स्वतःच्या मेमरीत नोंदली जाते — म्हणूनच खालील स्व-चाचणी
        निर्णायक आहे.</p>
        <p>स्मार्ट मीटर जे <em>करते</em> ते म्हणजे सुटलेला वापर पकडणे: चोवीस तास चालणारे छोटे स्टँडबाय भार,
        कमी करंटचे अचूक मापन, आणि प्रत्येक दिवसाची खरी रीडिंग (अंदाजाऐवजी). हे मापनाची पूर्णता आहे, जास्त
        नोंदवणे नव्हे.</p>
      </section>

      <section class="seo-section">
        <h2>30 मिनिटांची स्व-चाचणी</h2>
        <p>एक असे उपकरण हवे ज्याच्या वॅटेजवर तुमचा विश्वास आहे — 2,000 W (2 kW) चा गिझर किंवा रूम हीटर
        सर्वोत्तम आहे कारण त्याचा भार स्थिर असतो:</p>
        <ol>
          <li><strong>मेन बोर्डवरून सर्व काही बंद करा</strong>, दिसण्यासाठी फक्त एक दिवा ठेवा. मीटरची
          (किंवा डिस्कॉमच्या स्मार्ट-मीटर अॅपमधील) रीडिंग दोन दशांशांपर्यंत नोंदवा.</li>
          <li><strong>ज्ञात भार अगदी 30 मिनिटे चालवा.</strong> 2 kW उपकरण अर्ध्या तासात जवळपास नेमके
          <strong>1.0 युनिट</strong> वापरेल (2 kW × 0.5 तास).</li>
          <li><strong>मीटर पुन्हा वाचा.</strong> श्रेणी-1 सहनशीलतेत तुम्हाला 0.98–1.02 युनिटे दिसावीत.
          त्या अर्ध्या तासात मीटर समजा 1.3 युनिटे दाखवत असेल, तर जास्त नोंदवण्याचा ठोस पुरावा आहे —
          अधिकृत चाचणीकडे जा.</li>
        </ol>
        <p>दोन सुधारणा: कुठेतरी फ्रिज किंवा पंप मध्येच चालू होणे नाकारण्यासाठी चाचणी दोनदा करा, आणि लक्षात
        ठेवा हीटर एलिमेंटचा भार पुरवठा व्होल्टेजनुसार थोडा बदलतो — या अनौपचारिक पद्धतीत अपेक्षिताच्या ±5%
        च्या आतील निकाल सामान्य आहे. बिलावरील <a href="/mr/glossary/#multiplying-factor">मल्टिप्लाइंग
        फॅक्टर</a> घरगुती सिंगल-फेज मीटरसाठी 1 छापलेला आहे का तेही पहा; चुकीचा MF प्रत्येक युनिट गुणतो.</p>
      </section>

      <section class="seo-section">
        <h2>अधिकृत मार्ग: मीटर अचूकता चाचणी मागा</h2>
        <p>प्रत्येक राज्याची वीज पुरवठा संहिता तुम्हाला मीटर चाचणीचा अधिकार देते:</p>
        <ol>
          <li><strong>तुमच्या उपविभाग कार्यालयात</strong> (किंवा डिस्कॉमच्या ऑनलाइन ग्राहक पोर्टलवर) तुमच्या
          स्व-चाचणी निकालाचा हवाला देऊन मीटर अचूकता चाचणीसाठी अर्ज करा. छोटे चाचणी शुल्क लागते —
          <strong>मीटर बिघडलेले निघाल्यास ते परत मिळते किंवा तुमच्या बिलात समायोजित होते</strong>.</li>
          <li><strong>चेक मीटर मागा.</strong> डिस्कॉम तुमच्या मीटरसोबत मालिकेत एक दुसरे, तपासलेले मीटर
          एक-दोन चक्रांसाठी बसवते; रीडिंगची तुलना होते. दोन्ही बाजूंसाठी हाच सर्वात स्वच्छ पुरावा आहे.</li>
          <li><strong>लॅब चाचणी.</strong> पर्यायाने मीटर तुमच्या उपस्थितीत काढून, सीलबंद करून डिस्कॉमच्या
          मीटर लॅबमध्ये बेंच-टेस्ट होते (तुम्ही चाचणी पाहण्याची मागणी करू शकता).</li>
        </ol>
        <p>मीटर वेगवान असल्याचे सिद्ध झाल्यास, पुरवठा संहितेनुसार डिस्कॉमला प्रभावित कालावधीची <strong>बिले
        सुधारावी</strong> लागतात (सामान्यतः ठराविक महिन्यांच्या मर्यादेपर्यंत) आणि मीटर मोफत बदलावे
        लागते.</p>
      </section>

      <section class="seo-section">
        <h2>डिस्कॉमने कारवाई न केल्यास</h2>
        <p>क्रमाने पुढे जा: तुमच्या चाचणी पुराव्यासह कार्यकारी अभियंत्याकडे लेखी तक्रार → डिस्कॉमचे
        <strong>ग्राहक तक्रार निवारण मंच (CGRF)</strong> → राज्याचा <strong>वीज लोकपाल</strong>. स्व-चाचणीचे
        आकडे, मीटर डिस्प्लेचे फोटो आणि प्रत्येक बिल जपून ठेवा — गणित असलेली प्रकरणे जिंकतात. योग्य बिल किती
        <em>असावे</em> हे <a href="/#calculator">कॅल्क्युलेटर</a> ने काढा, आणि तो तपशील तक्रारीसोबत जोडा.</p>
      </section>`,
    faqsMr: [
      { q: 'स्मार्ट मीटर जुन्या मीटरपेक्षा जास्त युनिटे नोंदवतात का?',
        a: 'ते जास्त पूर्णतेने नोंदवतात, चुकीचे नाही. स्मार्ट मीटर श्रेणी-1.0 स्टॅटिक मीटरे (±1% अनुमत त्रुटी) आहेत जी श्रेणी 2.0 च्या व वयानुसार अनेकदा कमी नोंदवणाऱ्या डिस्क मीटरांची जागा घेतात. बसवल्यानंतरची सामान्य "वाढ" म्हणजे जुने मीटर सोडत होते किंवा अंदाजित बिलिंग कधीच पकडत नव्हती तो वापर.' },
      { q: 'माझे स्मार्ट मीटर वेगात चालते आहे का हे कसे तपासावे?',
        a: 'सर्व काही बंद करा, एक ज्ञात भार — उदा. 2 kW गिझर — अगदी 30 मिनिटे चालवा, आणि आधीची-नंतरची मीटर रीडिंग तुलना करा. जवळपास 1.0 युनिट नोंदले जावे. यापेक्षा लक्षणीय जास्त आकडा डिस्कॉमकडून अधिकृत अचूकता चाचणी मागण्याचा पुरावा आहे.' },
      { q: 'वीज मीटरची अधिकृत चाचणी कशी करावी?',
        a: 'तुमच्या राज्याच्या वीज पुरवठा संहितेनुसार उपविभाग कार्यालयात किंवा डिस्कॉम पोर्टलवर मीटर अचूकता चाचणीसाठी अर्ज करा. छोटे शुल्क लागते, जे मीटर बिघडलेले निघाल्यास परत मिळते. एका बिलिंग चक्रासाठी समांतर चेक मीटरही मागू शकता, किंवा लॅब बेंच-टेस्ट पाहू शकता.' },
      { q: 'मीटर वेगवान निघाल्यास माझी बिले सुधारली जातील का?',
        a: 'होय. चाचणीत मीटर अनुमत मर्यादेपलीकडे जास्त नोंदवत असल्याचे आढळल्यास, पुरवठा संहितेनुसार डिस्कॉमला प्रभावित कालावधीची बिले सुधारावी (सामान्यतः ठराविक महिन्यांच्या मर्यादेपर्यंत) आणि मीटर मोफत बदलावे लागते.' },
      { q: 'डिस्कॉम स्मार्ट मीटर दुरून जास्त वाचणारे बनवू शकतो का?',
        a: 'नाही. रिमोट कमांड रीडिंग घेणे, कनेक्ट/डिस्कनेक्ट आणि टॅरिफ-अनुसूची अपडेटपुरत्या मर्यादित आहेत — कॅलिब्रेशनपर्यंत नाही. मापन फर्मवेअर सीलबंद व टाइप-टेस्टेड असते, आणि रीडिंग मीटरच्या स्वतःच्या मेमरीत राहते — म्हणूनच प्रत्यक्ष स्व-चाचणी किंवा चेक मीटर हा प्रश्न निर्णायकपणे सोडवतो.' },
    ],
  },

  {
    slug: 'smart-meter-prepaid-disconnection',
    published: "2026-01-06",
    title: 'Smart Prepaid Meter: Recharge, Low Balance and Remote Disconnection',
    metaTitle: 'Smart Prepaid Meter Disconnected? Recharge, Reconnection Time & Your Rights',
    description: 'How smart prepaid electricity meters deduct balance, how to tell a remote disconnection from a power cut or fault, when DISCOMs are not allowed to disconnect you, how fast supply returns after a recharge, and how old arrears are recovered.',
    minutes: 5,
    intro: `A smart prepaid meter turns your electricity connection into a recharge-and-consume account:
      the meter deducts your balance daily, warns you when it runs low, and can <strong>disconnect the
      supply remotely</strong> when it hits zero. If your power just went off, this guide shows how to
      tell a balance disconnection apart from an ordinary outage or fault, how quickly supply returns
      after a recharge, and the protections state rules give you against unfair disconnection.`,
    sections: `
      <section class="seo-section">
        <h2>How the daily deduction works</h2>
        <p>Your recharge is not just paying for units. Each day the meter (or the DISCOM's billing
        system behind it) deducts:</p>
        <ul>
          <li><strong>Energy charge</strong> — the day's consumption priced at your slab/tariff rate,
          including <a href="/glossary/#fppa">FPPA</a> where applicable;</li>
          <li><strong>Fixed charge, pro-rated daily</strong> — your monthly
          <a href="/glossary/#fixed-charge">fixed charge</a> ÷ days in the month, deducted even on days
          you consume nothing;</li>
          <li><strong>Electricity duty</strong> and other bill levies, applied the same way as on a
          postpaid bill.</li>
        </ul>
        <p>So a balance that "drains overnight" usually isn't theft — it is the daily fixed-charge
        deduction plus always-on loads (fridge, inverter charging, routers). The DISCOM app's daily
        deduction ledger itemises this; check it before suspecting the meter, and verify the rates
        against your state's page in the <a href="/tariffs/states/">tariff directory</a>.</p>
      </section>

      <section class="seo-section">
        <h2>Was I disconnected remotely — or is it a fault?</h2>
        <p>Work down this list before calling an electrician:</p>
        <ol>
          <li><strong>Check the neighbours / your street.</strong> If they are dark too, it is an area
          outage, not your meter.</li>
          <li><strong>Look at the meter display.</strong> A remotely disconnected smart meter still has
          a live display — most show a relay/disconnect symbol, "OFF", or a specific alert code. A
          completely dead display points to a supply-side fault instead.</li>
          <li><strong>Check the app and SMS.</strong> Prepaid disconnections are preceded by low-balance
          alerts and logged in the DISCOM app with a timestamp. A disconnection entry there settles it.</li>
          <li><strong>Check your own MCB/ELCB.</strong> If the meter display is on, shows adequate
          balance and no disconnect symbol, but the house is dark, your main switch or internal wiring
          tripped — that one is for the electrician.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>When the DISCOM is not allowed to disconnect you</h2>
        <p>State supply codes and the smart-metering rules build in consumer protections. The details
        vary by state, but the common pattern:</p>
        <ul>
          <li><strong>Advance warning is mandatory</strong> — low-balance alerts by SMS/app before any
          disconnection, and a defined notice window after the balance hits zero.</li>
          <li><strong>No disconnection at unreasonable hours</strong> — most codes bar remote
          disconnection at night, and on Sundays, public holidays and days when a recharge cannot
          reasonably be made.</li>
          <li><strong>A grace period or emergency credit</strong> — many DISCOMs offer a small negative
          balance or "friendly hours" so supply continues until you can top up; the amount is recovered
          from the next recharge.</li>
        </ul>
        <p>If you were cut off with no alert, at night or on a holiday, note the timestamps from the
        app — that is a supply-code violation worth a written complaint.</p>
      </section>

      <section class="seo-section">
        <h2>Getting reconnected after a recharge</h2>
        <ol>
          <li><strong>Recharge</strong> through the DISCOM app/portal or an authorised payment channel.
          Make sure the amount covers any negative balance <em>plus</em> a positive margin — a recharge
          that only clears the deficit may not trigger reconnection.</li>
          <li><strong>Wait for the auto-reconnect command.</strong> Restoration is typically automatic
          within minutes to a few hours once the payment posts; the meter's relay clicks back in.</li>
          <li><strong>Some meters need a button press.</strong> For safety, certain models require you
          to press and hold the meter's push button after the reconnect command arrives, so supply does
          not return to an unattended house. Check the meter's sticker or the DISCOM app prompt.</li>
          <li><strong>Still off after a few hours?</strong> Log a supply complaint with the recharge
          receipt number — the reconnect command can fail if the meter has lost network connectivity,
          and a lineman visit is then required.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>Old arrears on a new prepaid meter</h2>
        <p>If you had unpaid postpaid bills when the prepaid meter was installed, the arrears do not
        vanish — they are typically recovered as a <strong>percentage deduction from every
        recharge</strong> (the split is shown in the recharge receipt) until cleared. Your effective
        balance therefore grows slower than the recharge amount. If the deducted arrear figure looks
        wrong, dispute it in writing; the recharge ledger in the app is your evidence. To sanity-check
        what a month's consumption <em>should</em> cost against what the meter deducted, use the
        <a href="/#calculator">calculator</a>.</p>
      </section>`,
    faqs: [
      { q: 'How do I know if my smart meter was disconnected for low balance?',
        a: 'The meter display stays live and shows a disconnect/relay symbol or "OFF", the DISCOM app logs a disconnection event with a timestamp, and you would have received low-balance SMS alerts beforehand. A completely dead meter display or a whole dark street indicates an outage or fault instead.' },
      { q: 'How long after recharging does electricity come back?',
        a: 'Reconnection is normally automatic within minutes to a few hours of the payment posting. Some meter models additionally require a press of the meter’s push button for safety. If supply has not returned within a few hours, complain with your recharge receipt — the reconnect command may not have reached a meter with poor network connectivity.' },
      { q: 'Can a prepaid smart meter cut my power at night or on a holiday?',
        a: 'State supply codes generally prohibit remote disconnection at night and on Sundays/public holidays, and require prior low-balance alerts. Many DISCOMs also provide emergency credit or friendly hours so supply continues until you can recharge. A disconnection that violated these windows is grounds for a complaint.' },
      { q: 'Why does my prepaid balance decrease even when I use no electricity?',
        a: 'Fixed charges are deducted daily (monthly fixed charge divided by days in the month) regardless of consumption, along with duty on applicable components — plus always-on loads like fridges and routers keep consuming. The app’s daily deduction ledger itemises exactly what was taken.' },
      { q: 'What happens to my old unpaid bills on a prepaid meter?',
        a: 'Arrears from the postpaid period are usually recovered as a fixed percentage of every recharge until cleared, shown as a split on the recharge receipt. Your usable balance grows more slowly until the arrear is paid off; if the figure looks wrong, dispute it with the recharge ledger as evidence.' },
    ],

    titleHi: 'स्मार्ट प्रीपेड मीटर: रिचार्ज, कम बैलेंस और रिमोट डिस्कनेक्शन',
    metaTitleHi: 'स्मार्ट प्रीपेड मीटर कट गया? रिचार्ज, बिजली लौटने का समय और आपके अधिकार',
    descriptionHi: 'स्मार्ट प्रीपेड बिजली मीटर बैलेंस कैसे काटता है, रिमोट डिस्कनेक्शन को बिजली कटौती या फॉल्ट से कैसे अलग पहचानें, डिस्कॉम कब आपको काट नहीं सकता, रिचार्ज के बाद बिजली कितनी जल्दी लौटती है, और पुराना बकाया कैसे वसूला जाता है।',
    introHi: `स्मार्ट प्रीपेड मीटर आपके बिजली कनेक्शन को रिचार्ज-और-खपत खाते में बदल देता है: मीटर रोज़ाना
      बैलेंस काटता है, कम होने पर चेताता है, और शून्य पर पहुँचते ही <strong>आपूर्ति दूर से काट</strong> सकता
      है। बिजली अभी-अभी गई है, तो यह गाइड बताती है कि बैलेंस कटौती को आम कटौती या फॉल्ट से कैसे अलग
      पहचानें, रिचार्ज के बाद बिजली कितनी जल्दी लौटती है, और अनुचित कटौती के विरुद्ध राज्य नियम आपको
      कौन-सी सुरक्षा देते हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>रोज़ की कटौती कैसे होती है</h2>
        <p>आपका रिचार्ज सिर्फ़ यूनिटों का भुगतान नहीं है। मीटर (या उसके पीछे डिस्कॉम की बिलिंग प्रणाली)
        हर दिन काटती है:</p>
        <ul>
          <li><strong>ऊर्जा शुल्क</strong> — दिन की खपत आपकी स्लैब/टैरिफ दर पर, जहाँ लागू हो वहाँ
          <a href="/hi/glossary/#fppa">FPPA</a> समेत;</li>
          <li><strong>फिक्स्ड चार्ज, दैनिक अनुपात में</strong> — आपका मासिक
          <a href="/hi/glossary/#fixed-charge">फिक्स्ड चार्ज</a> ÷ महीने के दिन, उन दिनों भी जब आप कुछ
          खपत नहीं करते;</li>
          <li><strong>बिजली शुल्क</strong> व अन्य बिल उगाहियाँ, पोस्टपेड बिल की ही तरह।</li>
        </ul>
        <p>तो "रात में ही घट गया" बैलेंस आमतौर पर चोरी नहीं है — यह दैनिक फिक्स्ड-चार्ज कटौती और हरदम चलते
        लोड (फ्रिज, इन्वर्टर चार्जिंग, राउटर) हैं। डिस्कॉम ऐप का दैनिक कटौती खाता इसे मदवार दिखाता है; मीटर
        पर शक करने से पहले वह देखें, और दरें <a href="/hi/tariffs/states/">टैरिफ डायरेक्टरी</a> में अपने
        राज्य के पेज से मिलाएँ।</p>
      </section>

      <section class="seo-section">
        <h2>मुझे दूर से काटा गया — या फॉल्ट है?</h2>
        <p>इलेक्ट्रीशियन बुलाने से पहले यह सूची क्रम से देखें:</p>
        <ol>
          <li><strong>पड़ोसी / अपनी गली देखें।</strong> वे भी अंधेरे में हैं, तो यह क्षेत्रीय कटौती है, आपका
          मीटर नहीं।</li>
          <li><strong>मीटर का डिस्प्ले देखें।</strong> दूर से काटे गए स्मार्ट मीटर का डिस्प्ले चालू रहता है —
          अधिकांश रिले/डिस्कनेक्ट चिह्न, "OFF" या कोई अलर्ट कोड दिखाते हैं। बिल्कुल बुझा डिस्प्ले आपूर्ति-पक्ष
          के फॉल्ट की ओर इशारा करता है।</li>
          <li><strong>ऐप और SMS देखें।</strong> प्रीपेड कटौती से पहले कम-बैलेंस अलर्ट आते हैं और डिस्कॉम ऐप
          में समय-मुहर के साथ कटौती दर्ज होती है। वहाँ की प्रविष्टि मामला साफ़ कर देती है।</li>
          <li><strong>अपना MCB/ELCB देखें।</strong> मीटर डिस्प्ले चालू है, पर्याप्त बैलेंस दिखाता है और कोई
          डिस्कनेक्ट चिह्न नहीं, फिर भी घर अंधेरे में है — तो आपका मेन स्विच या भीतरी वायरिंग ट्रिप हुई है;
          वह इलेक्ट्रीशियन का काम है।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>डिस्कॉम आपको कब नहीं काट सकता</h2>
        <p>राज्य आपूर्ति संहिताएँ और स्मार्ट-मीटरिंग नियम उपभोक्ता सुरक्षा देते हैं। ब्योरे राज्य-दर-राज्य अलग
        हैं, पर आम ढाँचा यह है:</p>
        <ul>
          <li><strong>पहले चेतावनी अनिवार्य</strong> — किसी भी कटौती से पहले SMS/ऐप से कम-बैलेंस अलर्ट, और
          बैलेंस शून्य होने के बाद एक तय नोटिस अवधि।</li>
          <li><strong>अनुचित समय पर कटौती नहीं</strong> — अधिकांश संहिताएँ रात में, रविवार, सार्वजनिक
          अवकाश और उन दिनों रिमोट कटौती रोकती हैं जब रिचार्ज करना व्यावहारिक न हो।</li>
          <li><strong>ग्रेस अवधि या आपात क्रेडिट</strong> — कई डिस्कॉम थोड़ा नेगेटिव बैलेंस या "फ्रेंडली ऑवर्स"
          देते हैं ताकि टॉप-अप तक आपूर्ति चलती रहे; राशि अगले रिचार्ज से वसूली जाती है।</li>
        </ul>
        <p>बिना अलर्ट, रात में या अवकाश पर काटा गया हो, तो ऐप की समय-मुहरें नोट करें — यह आपूर्ति-संहिता
        का उल्लंघन है और लिखित शिकायत के लायक है।</p>
      </section>

      <section class="seo-section">
        <h2>रिचार्ज के बाद बिजली वापस पाना</h2>
        <ol>
          <li><strong>रिचार्ज करें</strong> — डिस्कॉम ऐप/पोर्टल या अधिकृत भुगतान चैनल से। राशि नेगेटिव बैलेंस
          <em>और</em> कुछ पॉज़िटिव मार्जिन दोनों ढके — सिर्फ़ घाटा पाटने वाला रिचार्ज पुनर्संयोजन शुरू नहीं
          भी कर सकता।</li>
          <li><strong>ऑटो-रीकनेक्ट कमांड की प्रतीक्षा करें।</strong> भुगतान दर्ज होते ही बहाली आमतौर पर कुछ
          मिनटों से कुछ घंटों में स्वतः होती है; मीटर का रिले वापस जुड़ जाता है।</li>
          <li><strong>कुछ मीटरों में बटन दबाना पड़ता है।</strong> सुरक्षा के लिए कुछ मॉडल माँग करते हैं कि
          रीकनेक्ट कमांड आने के बाद आप मीटर का पुश बटन दबाकर रखें, ताकि खाली घर में आपूर्ति न लौटे। मीटर का
          स्टिकर या ऐप का संकेत देखें।</li>
          <li><strong>कुछ घंटों बाद भी बंद?</strong> रिचार्ज रसीद संख्या के साथ आपूर्ति शिकायत दर्ज करें —
          मीटर की नेटवर्क कनेक्टिविटी छूटी हो तो रीकनेक्ट कमांड विफल हो सकता है और लाइनमैन का दौरा ज़रूरी
          हो जाता है।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>नए प्रीपेड मीटर पर पुराना बकाया</h2>
        <p>प्रीपेड मीटर लगते समय पोस्टपेड बिल बकाया थे, तो वे मिटते नहीं — आमतौर पर <strong>हर रिचार्ज से एक
        प्रतिशत कटौती</strong> के रूप में वसूले जाते हैं (बँटवारा रिचार्ज रसीद में दिखता है) जब तक चुकता न हो
        जाएँ। इसलिए आपका उपयोगी बैलेंस रिचार्ज राशि से धीमा बढ़ता है। कटा बकाया आँकड़ा गलत लगे, तो लिखित
        आपत्ति करें; ऐप का रिचार्ज खाता आपका सबूत है। महीने की खपत की लागत कितनी <em>होनी चाहिए</em> बनाम
        मीटर ने कितना काटा, यह <a href="/#calculator">कैलकुलेटर</a> से मिलाएँ।</p>
      </section>`,
    faqsHi: [
      { q: 'कैसे पता चले कि मेरा स्मार्ट मीटर कम बैलेंस पर काटा गया है?',
        a: 'मीटर का डिस्प्ले चालू रहता है और डिस्कनेक्ट/रिले चिह्न या "OFF" दिखाता है, डिस्कॉम ऐप में समय-मुहर के साथ कटौती दर्ज होती है, और पहले कम-बैलेंस SMS अलर्ट आए होंगे। बिल्कुल बुझा डिस्प्ले या पूरी अंधेरी गली कटौती या फॉल्ट का संकेत है।' },
      { q: 'रिचार्ज के कितनी देर बाद बिजली लौटती है?',
        a: 'भुगतान दर्ज होने के कुछ मिनटों से कुछ घंटों में पुनर्संयोजन आमतौर पर स्वतः होता है। कुछ मीटर मॉडल सुरक्षा के लिए मीटर का पुश बटन दबाने की भी माँग करते हैं। कुछ घंटों में आपूर्ति न लौटे, तो रिचार्ज रसीद के साथ शिकायत करें — कमज़ोर नेटवर्क वाले मीटर तक रीकनेक्ट कमांड नहीं पहुँचा हो सकता।' },
      { q: 'क्या प्रीपेड स्मार्ट मीटर रात या अवकाश पर बिजली काट सकता है?',
        a: 'राज्य आपूर्ति संहिताएँ आमतौर पर रात और रविवार/सार्वजनिक अवकाश पर रिमोट कटौती रोकती हैं, और पहले कम-बैलेंस अलर्ट अनिवार्य करती हैं। कई डिस्कॉम आपात क्रेडिट या फ्रेंडली ऑवर्स भी देते हैं ताकि रिचार्ज तक आपूर्ति चले। इन नियमों के विरुद्ध कटौती शिकायत का आधार है।' },
      { q: 'बिजली इस्तेमाल न करने पर भी मेरा प्रीपेड बैलेंस क्यों घटता है?',
        a: 'फिक्स्ड चार्ज हर दिन कटता है (मासिक फिक्स्ड चार्ज ÷ महीने के दिन), खपत चाहे शून्य हो, साथ में लागू मदों पर शुल्क — और फ्रिज, राउटर जैसे हरदम चलते लोड खपत करते रहते हैं। ऐप का दैनिक कटौती खाता ठीक-ठीक दिखाता है कि क्या कटा।' },
      { q: 'प्रीपेड मीटर पर मेरे पुराने बकाया बिलों का क्या होगा?',
        a: 'पोस्टपेड अवधि का बकाया आमतौर पर हर रिचार्ज के एक तय प्रतिशत के रूप में वसूला जाता है जब तक चुकता न हो, जो रिचार्ज रसीद में बँटवारे के रूप में दिखता है। बकाया चुकने तक आपका उपयोगी बैलेंस धीमा बढ़ता है; आँकड़ा गलत लगे तो रिचार्ज खाते को सबूत बनाकर आपत्ति करें।' },
    ],

    titleMr: 'स्मार्ट प्रीपेड मीटर: रिचार्ज, कमी बॅलन्स आणि रिमोट डिस्कनेक्शन',
    metaTitleMr: 'स्मार्ट प्रीपेड मीटर कापला? रिचार्ज, वीज परत येण्याची वेळ आणि तुमचे हक्क',
    descriptionMr: 'स्मार्ट प्रीपेड वीज मीटर बॅलन्स कसा कापतो, रिमोट डिस्कनेक्शन वीज कपात किंवा बिघाडापासून कसे ओळखावे, डिस्कॉम तुम्हाला कधी कापू शकत नाही, रिचार्जनंतर वीज किती लवकर परत येते, आणि जुनी थकबाकी कशी वसूल होते.',
    introMr: `स्मार्ट प्रीपेड मीटर तुमच्या वीज जोडणीचे रिचार्ज-आणि-वापर खात्यात रूपांतर करते: मीटर रोज बॅलन्स
      कापते, कमी झाल्यावर सावध करते, आणि शून्यावर पोहोचताच <strong>पुरवठा दुरून कापू</strong> शकते. वीज
      आत्ताच गेली असेल, तर ही मार्गदर्शिका बॅलन्स कपात ही सामान्य कपात किंवा बिघाडापासून कशी ओळखावी,
      रिचार्जनंतर वीज किती लवकर परत येते, आणि अन्याय्य कपातीविरुद्ध राज्य नियम कोणते संरक्षण देतात, हे
      दाखवते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>रोजची कपात कशी होते</h2>
        <p>तुमचा रिचार्ज फक्त युनिटांचे पैसे नाही. दररोज मीटर (किंवा त्यामागील डिस्कॉमची बिलिंग प्रणाली)
        कापते:</p>
        <ul>
          <li><strong>ऊर्जा आकार</strong> — दिवसाचा वापर तुमच्या स्लॅब/टॅरिफ दराने, जिथे लागू तिथे
          <a href="/mr/glossary/#fppa">FPPA</a> सह;</li>
          <li><strong>स्थिर आकार, रोजच्या प्रमाणात</strong> — तुमचा मासिक
          <a href="/mr/glossary/#fixed-charge">स्थिर आकार</a> ÷ महिन्याचे दिवस, तुम्ही काहीही वापर न
          केलेल्या दिवशीही कापला जातो;</li>
          <li><strong>वीज शुल्क</strong> व इतर बिल आकारण्या, पोस्टपेड बिलाप्रमाणेच.</li>
        </ul>
        <p>तर "रात्रीतच आटलेला" बॅलन्स सहसा चोरी नसतो — तो रोजची स्थिर-आकार कपात आणि सतत चालणारे भार (फ्रिज,
        इन्व्हर्टर चार्जिंग, राउटर) असतात. डिस्कॉम अॅपचे रोजचे कपात खतावणी हे बाबवार दाखवते; मीटरवर संशय
        घेण्यापूर्वी ते पहा, आणि दर <a href="/mr/tariffs/states/">टॅरिफ डिरेक्टरी</a> मधील तुमच्या राज्याच्या
        पेजाशी जुळवा.</p>
      </section>

      <section class="seo-section">
        <h2>मला दुरून कापले गेले — की बिघाड आहे?</h2>
        <p>इलेक्ट्रिशियन बोलावण्यापूर्वी ही यादी क्रमाने पहा:</p>
        <ol>
          <li><strong>शेजारी / तुमची गल्ली पहा.</strong> तेही अंधारात असतील, तर ही क्षेत्रीय वीज कपात आहे,
          तुमचे मीटर नव्हे.</li>
          <li><strong>मीटरचा डिस्प्ले पहा.</strong> दुरून कापलेल्या स्मार्ट मीटरचा डिस्प्ले चालूच राहतो —
          बहुतेक रिले/डिस्कनेक्ट चिन्ह, "OFF" किंवा विशिष्ट अलर्ट कोड दाखवतात. पूर्णपणे बंद डिस्प्ले
          पुरवठा-बाजूच्या बिघाडाकडे इशारा करतो.</li>
          <li><strong>अॅप आणि SMS पहा.</strong> प्रीपेड कपातीपूर्वी कमी-बॅलन्स अलर्ट येतात आणि डिस्कॉम
          अॅपमध्ये वेळ-मुद्रेसह कपात नोंदली जाते. तिथली नोंद हे स्पष्ट करते.</li>
          <li><strong>तुमचा स्वतःचा MCB/ELCB पहा.</strong> मीटर डिस्प्ले चालू, पुरेसा बॅलन्स आणि कोणतेही
          डिस्कनेक्ट चिन्ह नसताना घर अंधारात असेल, तर तुमचा मेन स्विच किंवा अंतर्गत वायरिंग ट्रिप झाली —
          ते इलेक्ट्रिशियनचे काम.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>डिस्कॉम तुम्हाला कधी कापू शकत नाही</h2>
        <p>राज्य पुरवठा संहिता आणि स्मार्ट-मीटरिंग नियम ग्राहक संरक्षण देतात. तपशील राज्यानुसार बदलतात, पण
        सामान्य पद्धत:</p>
        <ul>
          <li><strong>आगाऊ सूचना अनिवार्य</strong> — कोणत्याही कपातीपूर्वी SMS/अॅपने कमी-बॅलन्स अलर्ट, आणि
          बॅलन्स शून्य झाल्यावर एक ठराविक नोटीस अवधी.</li>
          <li><strong>अवाजवी वेळी कपात नाही</strong> — बहुतेक संहिता रात्री, रविवारी, सार्वजनिक सुट्ट्या व
          ज्या दिवशी रिचार्ज करणे शक्य नाही अशा दिवशी रिमोट कपात रोखतात.</li>
          <li><strong>ग्रेस अवधी किंवा आणीबाणी क्रेडिट</strong> — अनेक डिस्कॉम थोडा ऋण बॅलन्स किंवा
          "फ्रेंडली अवर्स" देतात जेणेकरून तुम्ही टॉप-अप करेपर्यंत पुरवठा चालू राहतो; रक्कम पुढील रिचार्जमधून
          वसूल होते.</li>
        </ul>
        <p>कोणत्याही अलर्टशिवाय, रात्री किंवा सुट्टीदिवशी कापले गेले असाल, तर अॅपमधील वेळ-मुद्रा नोंदवा —
        हे पुरवठा-संहितेचे उल्लंघन असून लेखी तक्रारीस पात्र आहे.</p>
      </section>

      <section class="seo-section">
        <h2>रिचार्जनंतर पुन्हा जोडणी मिळवणे</h2>
        <ol>
          <li><strong>रिचार्ज करा</strong> — डिस्कॉम अॅप/पोर्टल किंवा अधिकृत पेमेंट माध्यमातून. रक्कम ऋण
          बॅलन्स <em>अधिक</em> काही धन मार्जिन दोन्ही भरून काढेल याची खात्री करा — फक्त तूट भरून काढणारा
          रिचार्ज पुन्हा जोडणी सुरू न करू शकतो.</li>
          <li><strong>ऑटो-रीकनेक्ट कमांडची वाट पहा.</strong> पेमेंट नोंदताच पुनर्स्थापना सामान्यतः काही
          मिनिटांत ते काही तासांत आपोआप होते; मीटरचा रिले पुन्हा जुळतो.</li>
          <li><strong>काही मीटरांना बटण दाबावे लागते.</strong> सुरक्षेसाठी काही मॉडेल्स मागतात की रीकनेक्ट
          कमांड आल्यावर तुम्ही मीटरचे पुश बटण दाबून धरा, जेणेकरून रिकाम्या घरात पुरवठा परत येऊ नये. मीटरचा
          स्टिकर किंवा अॅपचा संकेत पहा.</li>
          <li><strong>काही तासांनंतरही बंद?</strong> रिचार्ज पावती क्रमांकासह पुरवठा तक्रार नोंदवा —
          मीटरची नेटवर्क कनेक्टिव्हिटी गेली असल्यास रीकनेक्ट कमांड अयशस्वी होऊ शकतो आणि मग लाइनमनची भेट
          आवश्यक होते.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>नवीन प्रीपेड मीटरवर जुनी थकबाकी</h2>
        <p>प्रीपेड मीटर बसवताना पोस्टपेड बिले थकीत होती, तर ती नाहीशी होत नाहीत — सामान्यतः <strong>प्रत्येक
        रिचार्जमधून टक्केवारी कपात</strong> म्हणून (विभागणी रिचार्ज पावतीत दिसते) चुकते होईपर्यंत वसूल केली
        जातात. त्यामुळे तुमचा प्रभावी बॅलन्स रिचार्ज रकमेपेक्षा हळू वाढतो. कापलेली थकबाकी आकडा चुकीचा वाटत
        असेल, तर लेखी हरकत घ्या; अॅपमधील रिचार्ज खतावणी हा तुमचा पुरावा आहे. महिन्याच्या वापराची किंमत किती
        <em>असावी</em> वि. मीटरने किती कापले, हे <a href="/#calculator">कॅल्क्युलेटर</a> ने जुळवा.</p>
      </section>`,
    faqsMr: [
      { q: 'माझे स्मार्ट मीटर कमी बॅलन्समुळे कापले गेले हे कसे कळेल?',
        a: 'मीटर डिस्प्ले चालूच राहतो आणि डिस्कनेक्ट/रिले चिन्ह किंवा "OFF" दाखवतो, डिस्कॉम अॅप वेळ-मुद्रेसह कपात घटना नोंदवते, आणि आधी कमी-बॅलन्स SMS अलर्ट आले असतील. पूर्णपणे बंद मीटर डिस्प्ले किंवा संपूर्ण अंधारी गल्ली त्याऐवजी वीज कपात किंवा बिघाड दर्शवते.' },
      { q: 'रिचार्जनंतर किती वेळाने वीज परत येते?',
        a: 'पेमेंट नोंदल्यानंतर काही मिनिटांत ते काही तासांत पुन्हा जोडणी सामान्यतः आपोआप होते. काही मीटर मॉडेल्स सुरक्षेसाठी मीटरचे पुश बटण दाबण्याचीही मागणी करतात. काही तासांत पुरवठा परत न आल्यास रिचार्ज पावतीसह तक्रार करा — कमकुवत नेटवर्क असलेल्या मीटरपर्यंत रीकनेक्ट कमांड पोहोचला नसू शकतो.' },
      { q: 'प्रीपेड स्मार्ट मीटर रात्री किंवा सुट्टीदिवशी वीज कापू शकतो का?',
        a: 'राज्य पुरवठा संहिता सामान्यतः रात्री व रविवार/सार्वजनिक सुट्ट्यांना रिमोट कपात रोखतात, आणि आधी कमी-बॅलन्स अलर्ट अनिवार्य करतात. अनेक डिस्कॉम आणीबाणी क्रेडिट किंवा फ्रेंडली अवर्सही देतात जेणेकरून रिचार्जपर्यंत पुरवठा चालू राहतो. या अवधींचे उल्लंघन करणारी कपात तक्रारीचा आधार आहे.' },
      { q: 'वीज न वापरताही माझा प्रीपेड बॅलन्स का घटतो?',
        a: 'स्थिर आकार रोज कापला जातो (मासिक स्थिर आकार भागिले महिन्याचे दिवस), वापर शून्य असला तरी, लागू घटकांवरील शुल्कासह — शिवाय फ्रिज व राउटरसारखे सतत चालणारे भार वापर करत राहतात. अॅपचे रोजचे कपात खतावणी नेमके काय कापले ते बाबवार दाखवते.' },
      { q: 'प्रीपेड मीटरवर माझ्या जुन्या थकीत बिलांचे काय होते?',
        a: 'पोस्टपेड कालावधीची थकबाकी सामान्यतः प्रत्येक रिचार्जच्या ठराविक टक्केवारीने चुकते होईपर्यंत वसूल केली जाते, जी रिचार्ज पावतीत विभागणी म्हणून दिसते. थकबाकी फिटेपर्यंत तुमचा वापरण्यायोग्य बॅलन्स हळू वाढतो; आकडा चुकीचा वाटल्यास रिचार्ज खतावणी पुरावा म्हणून हरकत घ्या.' },
    ],
  },

  {
    slug: 'smart-meter-recharge-failed',
    published: "2026-01-18",
    title: 'Smart Meter Recharge Failed or Balance Not Updated? What to Do',
    metaTitle: 'Smart Meter Recharge Failed — Money Deducted but Balance Not Updated',
    description: 'Money deducted but your smart meter balance hasn’t updated? Why prepaid recharges get stuck (settlement lag, meter offline, wrong consumer number), how long refunds take, and the exact escalation path with the evidence to keep.',
    minutes: 5,
    intro: `A prepaid recharge normally reflects on the meter within minutes — so when money leaves your
      account and the balance doesn't move, it feels alarming. In almost every case the money is not
      lost: it is either <strong>still settling</strong>, <strong>waiting for the meter to come back
      online</strong>, or <strong>sitting against a wrong consumer number</strong>. This guide walks
      through the fix for each case, the refund timelines, and what evidence to keep so a complaint
      resolves fast.`,
    sections: `
      <section class="seo-section">
        <h2>First: give it 30 minutes, then check in the right place</h2>
        <p>Recharge money passes through several systems — your bank/UPI app, the payment aggregator or
        BBPS, the DISCOM's billing system, and finally the meter itself. Each hop can add delay,
        especially in the evening rush when everyone recharges at once. Before treating it as failed:</p>
        <ol>
          <li><strong>Check the payment status in the app you paid from.</strong> "Pending" means the
          money hasn't reached the DISCOM yet — most pending UPI transactions auto-resolve (success or
          auto-refund) within a few hours.</li>
          <li><strong>Check the balance in the DISCOM's own app or portal</strong>, not just the meter
          display. The billing system often credits first and pushes to the meter afterwards.</li>
          <li><strong>Check the meter display last.</strong> If the app shows the new balance but the
          meter doesn't, the meter is likely offline (weak network) — the balance syncs when it
          reconnects, and your supply is unaffected in the meantime if it was on.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>Money deducted, balance not updated — the three causes</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>What happened</th><th>How it resolves</th></tr></thead>
          <tbody>
            <tr><td><strong>Settlement lag</strong> — payment succeeded but is still travelling between the aggregator and the DISCOM</td><td>Self-resolves, usually within a few hours (occasionally up to 24–48 h on a banking holiday). Keep the transaction ID; don't recharge again immediately or you may double-pay.</td></tr>
            <tr><td><strong>Transaction actually failed</strong> — money debited, payment marked failed</td><td>Auto-refund to the paying account, typically within 3–7 working days under UPI/card chargeback rules. If it doesn't arrive, raise it with the payment app AND your bank, quoting the UTR/transaction ID.</td></tr>
            <tr><td><strong>Wrong consumer/meter number</strong> — payment succeeded, but into someone else's account</td><td>Won't self-resolve. Complain to the DISCOM in writing with the receipt; they can trace where the credit landed and transfer it. This is the slowest case — double-check the number every time.</td></tr>
          </tbody>
        </table></div>
        <p>One more possibility if the balance updated but <em>supply</em> didn't return: the
        reconnection command may not have reached the meter — see
        <a href="/guides/smart-meter-prepaid-disconnection/">getting power back after a recharge</a>.</p>
      </section>

      <section class="seo-section">
        <h2>The escalation path (and the evidence that wins)</h2>
        <ol>
          <li><strong>Save everything now:</strong> payment screenshot, transaction/UTR number, date-time,
          the consumer number you entered, and the meter's balance screen.</li>
          <li><strong>Payment app first</strong> if the app shows failed/pending — their support handles
          refunds for their own leg of the transaction.</li>
          <li><strong>DISCOM next</strong> if the payment shows success: call <strong>1912</strong> or use
          the DISCOM app/portal complaint section, quoting the UTR. Ask for a written complaint number.</li>
          <li><strong>Escalate in writing</strong> to the sub-division office if unresolved in a week,
          then the DISCOM's Consumer Grievance Redressal Forum (CGRF). Money-trail cases with a UTR
          almost always resolve at step 3.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>Avoiding a stuck recharge next time</h2>
        <ul>
          <li><strong>Recharge before the balance is critical</strong> — a stuck payment at 11 pm with
          ₹2 left is the worst case. Our <a href="/recharge-calculator/">recharge calculator</a> shows
          how many days your current balance really has.</li>
          <li><strong>Save your consumer number</strong> in the payment app rather than typing it
          each time.</li>
          <li><strong>Prefer the DISCOM's own app/portal</strong> for large recharges — one hop fewer
          than third-party channels.</li>
          <li><strong>Keep one month's bill as the recharge size</strong> so a single failure never
          becomes an emergency.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'My money was deducted but the smart meter balance is not updated. Is it lost?',
        a: 'Almost never. Either the payment is still settling (resolves within hours), it failed and will auto-refund in 3–7 working days, or it was credited to a wrong consumer number (recoverable via a written DISCOM complaint with your transaction ID). Keep the UTR number — it is the key to every resolution path.' },
      { q: 'How long does a smart meter recharge take to reflect?',
        a: 'Usually within minutes. Settlement lag can stretch it to a few hours, and if the meter itself is offline the DISCOM app shows the credit first and the meter syncs when connectivity returns. If the DISCOM app shows nothing after 24 hours, complain with the transaction ID.' },
      { q: 'I recharged the wrong consumer number. Can I get the money back?',
        a: 'Yes, but only through the DISCOM — the payment itself succeeded, so the payment app can’t reverse it. Submit a written complaint with the receipt and both numbers (yours and the one paid to); the DISCOM can trace and transfer the credit.' },
      { q: 'Should I recharge again while the first payment is pending?',
        a: 'If supply is still on, wait a few hours — pending payments usually resolve and you avoid a double credit. If you are disconnected and need power now, do the second recharge, keep both receipts, and claim the first back once its status settles.' },
    ],

    titleHi: 'स्मार्ट मीटर रिचार्ज फेल या बैलेंस अपडेट नहीं हुआ? यह करें',
    metaTitleHi: 'स्मार्ट मीटर रिचार्ज फेल — पैसे कटे पर बैलेंस नहीं बढ़ा? समाधान',
    descriptionHi: 'पैसे कट गए पर स्मार्ट मीटर का बैलेंस नहीं बढ़ा? प्रीपेड रिचार्ज कहाँ अटकता है (सेटलमेंट देरी, मीटर ऑफ़लाइन, गलत उपभोक्ता नंबर), रिफंड में कितना समय लगता है, और शिकायत का सही क्रम व ज़रूरी सबूत।',
    introHi: `प्रीपेड रिचार्ज आमतौर पर मिनटों में मीटर पर दिखता है — इसलिए खाते से पैसे कटें और बैलेंस न बढ़े
      तो घबराहट स्वाभाविक है। लगभग हर मामले में पैसा डूबा नहीं होता: वह या तो <strong>अभी सेटल हो रहा
      है</strong>, <strong>मीटर के ऑनलाइन आने की प्रतीक्षा में है</strong>, या <strong>गलत उपभोक्ता नंबर पर
      जमा हो गया है</strong>। यह गाइड तीनों स्थितियों का समाधान, रिफंड की समय-सीमा और वे सबूत बताती है
      जिनसे शिकायत जल्दी सुलझती है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>पहले 30 मिनट रुकें, फिर सही जगह देखें</h2>
        <p>रिचार्ज का पैसा कई प्रणालियों से गुज़रता है — आपका बैंक/UPI ऐप, पेमेंट एग्रीगेटर या BBPS, डिस्कॉम
        का बिलिंग सिस्टम, और अंत में मीटर। हर पड़ाव देरी जोड़ सकता है, ख़ासकर शाम की भीड़ में। फेल मानने
        से पहले:</p>
        <ol>
          <li><strong>जिस ऐप से भुगतान किया, वहाँ स्टेटस देखें।</strong> "Pending" का मतलब पैसा अभी डिस्कॉम
          तक पहुँचा नहीं — अधिकांश पेंडिंग UPI लेनदेन कुछ घंटों में खुद सुलझ जाते हैं (सफल या ऑटो-रिफंड)।</li>
          <li><strong>डिस्कॉम के अपने ऐप/पोर्टल में बैलेंस देखें</strong>, सिर्फ़ मीटर डिस्प्ले नहीं। बिलिंग
          सिस्टम अक्सर पहले क्रेडिट करता है और बाद में मीटर तक भेजता है।</li>
          <li><strong>मीटर डिस्प्ले सबसे बाद में देखें।</strong> ऐप में नया बैलेंस दिखे पर मीटर में नहीं, तो मीटर
          शायद ऑफ़लाइन है (कमज़ोर नेटवर्क) — कनेक्टिविटी लौटते ही बैलेंस सिंक हो जाता है, और तब तक चालू
          आपूर्ति पर असर नहीं पड़ता।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>पैसे कटे, बैलेंस नहीं बढ़ा — तीन कारण</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>क्या हुआ</th><th>कैसे सुलझता है</th></tr></thead>
          <tbody>
            <tr><td><strong>सेटलमेंट देरी</strong> — भुगतान सफल है पर एग्रीगेटर और डिस्कॉम के बीच रास्ते में है</td><td>खुद सुलझ जाता है, आमतौर पर कुछ घंटों में (बैंकिंग अवकाश पर कभी-कभी 24–48 घंटे)। ट्रांज़ैक्शन ID संभालें; तुरंत दोबारा रिचार्ज न करें, दोहरा भुगतान हो सकता है।</td></tr>
            <tr><td><strong>लेनदेन सचमुच फेल</strong> — पैसा कटा, भुगतान फेल दर्ज हुआ</td><td>UPI/कार्ड नियमों के तहत ऑटो-रिफंड, आमतौर पर 3–7 कार्यदिवस में उसी खाते में। न आए तो UTR/ट्रांज़ैक्शन ID के साथ पेमेंट ऐप और बैंक दोनों से शिकायत करें।</td></tr>
            <tr><td><strong>गलत उपभोक्ता/मीटर नंबर</strong> — भुगतान सफल, पर किसी और के खाते में</td><td>खुद नहीं सुलझेगा। रसीद के साथ डिस्कॉम को लिखित शिकायत करें; वे क्रेडिट का पता लगाकर स्थानांतरित कर सकते हैं। यह सबसे धीमा मामला है — नंबर हर बार दोबारा जाँचें।</td></tr>
          </tbody>
        </table></div>
        <p>बैलेंस बढ़ गया पर <em>बिजली</em> नहीं लौटी, तो रीकनेक्ट कमांड मीटर तक नहीं पहुँचा हो सकता —
        देखें <a href="/hi/guides/smart-meter-prepaid-disconnection/">रिचार्ज के बाद बिजली वापस पाना</a>।</p>
      </section>

      <section class="seo-section">
        <h2>शिकायत का क्रम (और जीतने वाले सबूत)</h2>
        <ol>
          <li><strong>अभी सब संभालें:</strong> भुगतान का स्क्रीनशॉट, ट्रांज़ैक्शन/UTR नंबर, दिनांक-समय, डाला
          गया उपभोक्ता नंबर, और मीटर की बैलेंस स्क्रीन।</li>
          <li><strong>पहले पेमेंट ऐप</strong> — ऐप में फेल/पेंडिंग दिखे तो; अपने हिस्से के रिफंड वही संभालते हैं।</li>
          <li><strong>फिर डिस्कॉम</strong> — भुगतान सफल दिखे तो: <strong>1912</strong> पर कॉल करें या डिस्कॉम
          ऐप/पोर्टल के शिकायत खंड में UTR के साथ दर्ज करें। शिकायत संख्या लिखित माँगें।</li>
          <li><strong>हफ़्ते भर में न सुलझे</strong> तो उपखंड कार्यालय को लिखित, फिर डिस्कॉम का उपभोक्ता
          शिकायत निवारण मंच (CGRF)। UTR वाले पैसों के मामले लगभग हमेशा तीसरे चरण पर सुलझ जाते हैं।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>अगली बार रिचार्ज अटकने से बचाव</h2>
        <ul>
          <li><strong>बैलेंस गंभीर होने से पहले रिचार्ज करें</strong> — रात 11 बजे ₹2 बचे हों और भुगतान अटक
          जाए, यही सबसे बुरा हाल है। <a href="/recharge-calculator/">रिचार्ज कैलकुलेटर</a> बताता है कि मौजूदा
          बैलेंस असल में कितने दिन चलेगा।</li>
          <li><strong>उपभोक्ता नंबर ऐप में सेव रखें</strong>, हर बार टाइप न करें।</li>
          <li><strong>बड़े रिचार्ज डिस्कॉम के अपने ऐप/पोर्टल से करें</strong> — तीसरे पक्ष से एक पड़ाव कम।</li>
          <li><strong>रिचार्ज राशि एक महीने के बिल जितनी रखें</strong> ताकि एक विफलता कभी आपातकाल न बने।</li>
        </ul>
      </section>`,
    faqsHi: [
      { q: 'पैसे कट गए पर स्मार्ट मीटर का बैलेंस नहीं बढ़ा — क्या पैसा डूब गया?',
        a: 'लगभग कभी नहीं। या तो भुगतान अभी सेटल हो रहा है (कुछ घंटों में सुलझता है), या फेल हुआ है और 3–7 कार्यदिवस में ऑटो-रिफंड होगा, या गलत उपभोक्ता नंबर पर जमा हुआ है (ट्रांज़ैक्शन ID के साथ डिस्कॉम को लिखित शिकायत से वापसी संभव)। UTR नंबर संभालें — हर समाधान की कुंजी वही है।' },
      { q: 'स्मार्ट मीटर रिचार्ज दिखने में कितना समय लगता है?',
        a: 'आमतौर पर मिनटों में। सेटलमेंट देरी इसे कुछ घंटों तक खींच सकती है, और मीटर ऑफ़लाइन हो तो डिस्कॉम ऐप में क्रेडिट पहले दिखता है और मीटर नेटवर्क लौटने पर सिंक होता है। 24 घंटे बाद भी ऐप में कुछ न दिखे तो ट्रांज़ैक्शन ID के साथ शिकायत करें।' },
      { q: 'गलत उपभोक्ता नंबर पर रिचार्ज कर दिया — पैसे वापस मिलेंगे?',
        a: 'हाँ, पर सिर्फ़ डिस्कॉम के ज़रिए — भुगतान सफल रहा है, इसलिए पेमेंट ऐप उसे पलट नहीं सकता। रसीद और दोनों नंबरों (आपका और जिस पर गया) के साथ लिखित शिकायत करें; डिस्कॉम क्रेडिट खोजकर स्थानांतरित कर सकता है।' },
      { q: 'पहला भुगतान पेंडिंग है — क्या दोबारा रिचार्ज करूँ?',
        a: 'आपूर्ति चालू है तो कुछ घंटे रुकें — पेंडिंग भुगतान आमतौर पर सुलझ जाते हैं और दोहरा क्रेडिट नहीं बनता। बिजली कटी है और तुरंत चाहिए, तो दूसरा रिचार्ज करें, दोनों रसीदें रखें, और पहले वाले का स्टेटस तय होते ही उसे वापस माँगें।' },
    ],

    titleMr: 'स्मार्ट मीटर रिचार्ज अयशस्वी किंवा बॅलन्स अपडेट झाला नाही? काय करावे',
    metaTitleMr: 'स्मार्ट मीटर रिचार्ज अयशस्वी — पैसे कापले पण बॅलन्स वाढला नाही? उपाय',
    descriptionMr: 'पैसे कापले पण स्मार्ट मीटरचा बॅलन्स वाढला नाही? प्रीपेड रिचार्ज कुठे अडकतो (सेटलमेंट विलंब, मीटर ऑफलाइन, चुकीचा ग्राहक क्रमांक), परतावा किती वेळ घेतो, आणि तक्रारीचा नेमका क्रम व जपून ठेवायचे पुरावे.',
    introMr: `प्रीपेड रिचार्ज सामान्यतः मिनिटांत मीटरवर दिसतो — म्हणून खात्यातून पैसे कापले जाऊन बॅलन्स न
      हलल्यास घबराट स्वाभाविक आहे. जवळपास प्रत्येक बाबतीत पैसा बुडत नाही: तो एकतर <strong>अजून सेटल होत
      आहे</strong>, <strong>मीटर ऑनलाइन येण्याची वाट पाहत आहे</strong>, किंवा <strong>चुकीच्या ग्राहक
      क्रमांकावर जमा झाला आहे</strong>. ही मार्गदर्शिका तिन्ही स्थितींचा उपाय, परताव्याच्या मुदती आणि तक्रार
      लवकर सुटण्यासाठी कोणते पुरावे ठेवावेत हे सांगते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>आधी: 30 मिनिटे थांबा, मग योग्य ठिकाणी पहा</h2>
        <p>रिचार्जचा पैसा अनेक प्रणालींतून जातो — तुमचे बँक/UPI अॅप, पेमेंट अ‍ॅग्रीगेटर किंवा BBPS,
        डिस्कॉमची बिलिंग प्रणाली, आणि शेवटी मीटर. प्रत्येक टप्पा विलंब जोडू शकतो, विशेषतः संध्याकाळच्या
        गर्दीत जेव्हा सगळे एकाच वेळी रिचार्ज करतात. अयशस्वी मानण्यापूर्वी:</p>
        <ol>
          <li><strong>ज्या अॅपवरून पैसे भरले तिथे स्थिती पहा.</strong> "Pending" म्हणजे पैसा अजून
          डिस्कॉमपर्यंत पोहोचला नाही — बहुतेक पेंडिंग UPI व्यवहार काही तासांत आपोआप सुटतात (यशस्वी किंवा
          ऑटो-परतावा).</li>
          <li><strong>डिस्कॉमच्या स्वतःच्या अॅप/पोर्टलमध्ये बॅलन्स पहा</strong>, फक्त मीटर डिस्प्ले नव्हे.
          बिलिंग प्रणाली अनेकदा आधी क्रेडिट करते आणि नंतर मीटरपर्यंत पाठवते.</li>
          <li><strong>मीटर डिस्प्ले सर्वात शेवटी पहा.</strong> अॅपमध्ये नवा बॅलन्स दिसतो पण मीटरमध्ये नाही,
          तर मीटर बहुधा ऑफलाइन आहे (कमकुवत नेटवर्क) — कनेक्टिव्हिटी परत आल्यावर बॅलन्स सिंक होतो, आणि तोवर
          चालू पुरवठ्यावर परिणाम होत नाही.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>पैसे कापले, बॅलन्स वाढला नाही — तीन कारणे</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>काय झाले</th><th>कसे सुटते</th></tr></thead>
          <tbody>
            <tr><td><strong>सेटलमेंट विलंब</strong> — पेमेंट यशस्वी पण अ‍ॅग्रीगेटर व डिस्कॉमदरम्यान वाटेत आहे</td><td>स्वतः सुटते, सामान्यतः काही तासांत (बँकिंग सुट्टीला कधीकधी 24–48 तास). ट्रान्झॅक्शन ID जपा; लगेच पुन्हा रिचार्ज करू नका, नाहीतर दुहेरी भरणा होऊ शकतो.</td></tr>
            <tr><td><strong>व्यवहार खरोखर अयशस्वी</strong> — पैसे कापले, पेमेंट अयशस्वी नोंदले</td><td>UPI/कार्ड नियमांनुसार ऑटो-परतावा, सामान्यतः 3–7 कामकाजी दिवसांत त्याच खात्यात. न आल्यास UTR/ट्रान्झॅक्शन ID सह पेमेंट अॅप आणि बँक दोन्हींकडे तक्रार करा.</td></tr>
            <tr><td><strong>चुकीचा ग्राहक/मीटर क्रमांक</strong> — पेमेंट यशस्वी, पण दुसऱ्याच्या खात्यात</td><td>स्वतः सुटणार नाही. पावतीसह डिस्कॉमकडे लेखी तक्रार करा; ते क्रेडिट कुठे गेले ते शोधून हस्तांतरित करू शकतात. हे सर्वात संथ प्रकरण आहे — क्रमांक प्रत्येक वेळी पुन्हा तपासा.</td></tr>
          </tbody>
        </table></div>
        <p>बॅलन्स वाढला पण <em>वीज</em> परत आली नाही, तर रीकनेक्ट कमांड मीटरपर्यंत पोहोचला नसू शकतो — पहा
        <a href="/mr/guides/smart-meter-prepaid-disconnection/">रिचार्जनंतर वीज परत मिळवणे</a>.</p>
      </section>

      <section class="seo-section">
        <h2>तक्रारीचा क्रम (आणि जिंकवणारे पुरावे)</h2>
        <ol>
          <li><strong>आत्ताच सर्व जपा:</strong> पेमेंट स्क्रीनशॉट, ट्रान्झॅक्शन/UTR क्रमांक, दिनांक-वेळ,
          टाकलेला ग्राहक क्रमांक, आणि मीटरचा बॅलन्स स्क्रीन.</li>
          <li><strong>आधी पेमेंट अॅप</strong> — अॅपमध्ये अयशस्वी/पेंडिंग दिसत असल्यास; त्यांच्या
          हिश्श्याचे परतावे तेच हाताळतात.</li>
          <li><strong>मग डिस्कॉम</strong> — पेमेंट यशस्वी दिसत असल्यास: <strong>1912</strong> वर कॉल करा
          किंवा डिस्कॉम अॅप/पोर्टलच्या तक्रार विभागात UTR सह नोंदवा. तक्रार क्रमांक लेखी मागा.</li>
          <li><strong>आठवड्यात न सुटल्यास</strong> उपविभाग कार्यालयाला लेखी, मग डिस्कॉमचे ग्राहक तक्रार
          निवारण मंच (CGRF). UTR असलेली पैसे-मागोवा प्रकरणे जवळपास नेहमी तिसऱ्या टप्प्यावर सुटतात.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>पुढच्या वेळी रिचार्ज अडकणे टाळणे</h2>
        <ul>
          <li><strong>बॅलन्स गंभीर होण्यापूर्वी रिचार्ज करा</strong> — रात्री 11 वाजता ₹2 शिल्लक असताना
          अडकलेला भरणा हे सर्वात वाईट प्रकरण. आमचे <a href="/recharge-calculator/">रिचार्ज कॅल्क्युलेटर</a>
          तुमचा सध्याचा बॅलन्स खरोखर किती दिवस पुरेल ते दाखवते.</li>
          <li><strong>तुमचा ग्राहक क्रमांक पेमेंट अॅपमध्ये सेव्ह ठेवा</strong>, प्रत्येक वेळी टाइप करू
          नका.</li>
          <li><strong>मोठ्या रिचार्जसाठी डिस्कॉमचे स्वतःचे अॅप/पोर्टल वापरा</strong> — तृतीय-पक्ष माध्यमांपेक्षा
          एक टप्पा कमी.</li>
          <li><strong>रिचार्ज रक्कम एका महिन्याच्या बिलाइतकी ठेवा</strong> जेणेकरून एक अपयश कधीही आणीबाणी
          बनू नये.</li>
        </ul>
      </section>`,
    faqsMr: [
      { q: 'माझे पैसे कापले पण स्मार्ट मीटरचा बॅलन्स वाढला नाही — पैसा बुडाला का?',
        a: 'जवळपास कधीच नाही. एकतर पेमेंट अजून सेटल होत आहे (काही तासांत सुटते), किंवा ते अयशस्वी झाले आणि 3–7 कामकाजी दिवसांत ऑटो-परतावा होईल, किंवा चुकीच्या ग्राहक क्रमांकावर जमा झाले (ट्रान्झॅक्शन ID सह डिस्कॉमकडे लेखी तक्रारीने परत मिळू शकते). UTR क्रमांक जपा — प्रत्येक उपायाची किल्ली तोच आहे.' },
      { q: 'स्मार्ट मीटर रिचार्ज दिसायला किती वेळ लागतो?',
        a: 'सामान्यतः मिनिटांत. सेटलमेंट विलंब तो काही तासांपर्यंत ताणू शकतो, आणि मीटर ऑफलाइन असल्यास डिस्कॉम अॅप आधी क्रेडिट दाखवते व मीटर कनेक्टिव्हिटी परत आल्यावर सिंक होते. 24 तासांनंतरही अॅपमध्ये काही न दिसल्यास ट्रान्झॅक्शन ID सह तक्रार करा.' },
      { q: 'चुकीच्या ग्राहक क्रमांकावर रिचार्ज केला — पैसे परत मिळतील का?',
        a: 'होय, पण फक्त डिस्कॉममार्फत — पेमेंट स्वतः यशस्वी झाले, म्हणून पेमेंट अॅप ते उलटवू शकत नाही. पावती व दोन्ही क्रमांक (तुमचा आणि ज्यावर गेला) सह लेखी तक्रार करा; डिस्कॉम क्रेडिट शोधून हस्तांतरित करू शकतो.' },
      { q: 'पहिला भरणा पेंडिंग आहे — पुन्हा रिचार्ज करू का?',
        a: 'पुरवठा चालू असेल तर काही तास थांबा — पेंडिंग भरणे सहसा सुटतात आणि दुहेरी क्रेडिट होत नाही. वीज कापली असून लगेच हवी असेल, तर दुसरा रिचार्ज करा, दोन्ही पावत्या ठेवा, आणि पहिल्याची स्थिती निश्चित होताच तो परत मागा.' },
    ],
  },

  {
    slug: 'smart-meter-balance-check',
    published: "2026-01-30",
    title: 'How to Check Your Smart Meter Balance (Display, App, SMS)',
    metaTitle: 'Smart Meter Balance Check — Meter Display, DISCOM App & Daily Deductions',
    description: 'Three ways to check a prepaid smart meter balance — the meter’s push-button display, the DISCOM app/portal, and SMS alerts — plus how to read the daily deduction ledger so you know exactly where the balance goes.',
    minutes: 4,
    intro: `A prepaid smart meter shows its balance in three places: <strong>on the meter itself</strong>,
      in the <strong>DISCOM's app or portal</strong>, and through <strong>SMS alerts</strong>. Each has a
      different use — the display is instant, the app has the full deduction history, and SMS works
      without a smartphone. This guide covers all three, and shows how to read the daily deduction
      ledger so a falling balance never surprises you.`,
    sections: `
      <section class="seo-section">
        <h2>1. On the meter display (works without internet)</h2>
        <p>Every smart meter has a <strong>push button</strong> that cycles the display through its
        screens — press it repeatedly and watch the labels. The exact order varies by make, but you will
        typically see: current balance (₹), cumulative units (kWh), instantaneous load (kW), and
        voltage. The balance screen usually shows a ₹ symbol or a "BAL"/"CR" label; a negative figure
        means you are consuming on credit and a disconnection may be queued.</p>
        <p>Note that the meter's balance can lag the DISCOM's system by a sync cycle — if you just
        recharged, the app updates first and the meter follows when it next connects.</p>
      </section>

      <section class="seo-section">
        <h2>2. In the DISCOM app or portal (the full picture)</h2>
        <p>The DISCOM's own app or consumer portal is the authoritative place: log in with your
        consumer/account number to see the live balance, recharge history and — most usefully — the
        <strong>daily deduction ledger</strong>. In Uttar Pradesh that is
        <a href="https://uppclonline.com" target="_blank" rel="noopener">uppclonline.com</a> or the
        UPPCL consumer app; in Bihar the <strong>Bihar Bijli Smart Meter</strong> app. For other
        states, use the app or portal named on your recharge receipt — our
        <a href="/smart-meter-recharge/">DISCOM-wise recharge pages</a> link each official portal.</p>
      </section>

      <section class="seo-section">
        <h2>3. SMS alerts (no smartphone needed)</h2>
        <p>DISCOMs send low-balance alerts to the mobile number registered against your connection —
        typically at one or two thresholds before disconnection, and a confirmation after each recharge.
        If you are not getting them, your registered number is likely outdated: update it via the DISCOM
        app, portal or sub-division office. For anyone who can't use an app, these alerts are the main
        safety net, so fixing the number is worth the trip.</p>
      </section>

      <section class="seo-section">
        <h2>Reading the daily deduction ledger</h2>
        <p>Each day's deduction is not just "units × rate". It bundles:</p>
        <ul>
          <li><strong>Energy charge</strong> — that day's units priced at your
          <a href="/glossary/#telescopic-slabs">slab rates</a>;</li>
          <li><strong>Fixed charge</strong> — the monthly <a href="/glossary/#fixed-charge">fixed
          charge</a> divided across the days of the month, deducted even at zero consumption;</li>
          <li><strong>FPPA and duty</strong> — the <a href="/glossary/#fppa">fuel surcharge</a> and
          <a href="/glossary/#electricity-duty">electricity duty</a> on applicable heads;</li>
          <li><strong>Arrears instalment</strong> — if old postpaid dues are being recovered, a slice
          per recharge or per day.</li>
        </ul>
        <p>This is why the balance falls a little even on a day the house was locked. To see what your
        normal daily burn <em>should</em> be — and how long the current balance will last — use the
        <a href="/recharge-calculator/">smart meter recharge calculator</a>, which prices your usage on
        your DISCOM's real tariff.</p>
      </section>`,
    faqs: [
      { q: 'How do I check the balance on the smart meter itself?',
        a: 'Press the meter’s push button to cycle through its display screens — one shows the prepaid balance in ₹ (often labelled BAL or CR), alongside screens for cumulative kWh, load and voltage. It works without internet, though it can lag the DISCOM app by one sync cycle right after a recharge.' },
      { q: 'Why did my balance decrease when I used no electricity?',
        a: 'The daily deduction includes a share of the monthly fixed charge (deducted even at zero units), FPPA and duty, and any arrears instalment — plus always-on loads like a fridge or router if the supply was on. The app’s daily deduction ledger itemises exactly what was taken.' },
      { q: 'The app balance and the meter balance are different — which is correct?',
        a: 'The DISCOM’s billing system (the app/portal figure) is authoritative; the meter syncs to it when it next connects. A gap right after a recharge is normal. If they stay different for more than a day, the meter may have lost network — raise it with the DISCOM.' },
      { q: 'How do I get low-balance SMS alerts?',
        a: 'Alerts go to the mobile number registered against your connection. If you don’t receive them, update your number through the DISCOM app, portal or sub-division office — DISCOMs are required to warn you before any balance disconnection.' },
    ],

    titleHi: 'स्मार्ट मीटर का बैलेंस कैसे देखें (डिस्प्ले, ऐप, SMS)',
    metaTitleHi: 'स्मार्ट मीटर बैलेंस चेक — मीटर डिस्प्ले, डिस्कॉम ऐप और दैनिक कटौती',
    descriptionHi: 'प्रीपेड स्मार्ट मीटर का बैलेंस देखने के तीन तरीके — मीटर का पुश-बटन डिस्प्ले, डिस्कॉम ऐप/पोर्टल और SMS अलर्ट — और दैनिक कटौती खाता पढ़ने का तरीका, ताकि पता रहे बैलेंस कहाँ जा रहा है।',
    introHi: `प्रीपेड स्मार्ट मीटर का बैलेंस तीन जगह दिखता है: <strong>मीटर पर ही</strong>, <strong>डिस्कॉम के
      ऐप या पोर्टल में</strong>, और <strong>SMS अलर्ट</strong> से। तीनों का अलग उपयोग है — डिस्प्ले तुरंत
      दिखाता है, ऐप में पूरी कटौती का इतिहास रहता है, और SMS बिना स्मार्टफोन के काम करता है। यह गाइड
      तीनों तरीके और दैनिक कटौती खाता पढ़ना सिखाती है, ताकि घटता बैलेंस कभी चौंकाए नहीं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. मीटर के डिस्प्ले पर (बिना इंटरनेट)</h2>
        <p>हर स्मार्ट मीटर में एक <strong>पुश बटन</strong> होता है जो डिस्प्ले की स्क्रीनें बदलता है — उसे
        बार-बार दबाएँ और लेबल देखें। क्रम कंपनी के अनुसार अलग है, पर आमतौर पर दिखेगा: मौजूदा बैलेंस (₹),
        कुल यूनिट (kWh), तात्कालिक लोड (kW) और वोल्टेज। बैलेंस स्क्रीन पर ₹ चिह्न या "BAL"/"CR" लेबल
        होता है; ऋणात्मक आँकड़े का मतलब है आप उधार पर खपत कर रहे हैं और कटौती कतार में हो सकती है।</p>
        <p>ध्यान रहे — मीटर का बैलेंस डिस्कॉम सिस्टम से एक सिंक-चक्र पीछे हो सकता है: अभी-अभी रिचार्ज किया
        हो तो पहले ऐप अपडेट होता है, मीटर अगली बार जुड़ने पर।</p>
      </section>

      <section class="seo-section">
        <h2>2. डिस्कॉम ऐप या पोर्टल में (पूरी तस्वीर)</h2>
        <p>डिस्कॉम का अपना ऐप/उपभोक्ता पोर्टल ही प्रामाणिक जगह है: उपभोक्ता/खाता नंबर से लॉगिन कर लाइव
        बैलेंस, रिचार्ज इतिहास और — सबसे उपयोगी — <strong>दैनिक कटौती खाता</strong> देखें। उत्तर प्रदेश में
        <a href="https://uppclonline.com" target="_blank" rel="noopener">uppclonline.com</a> या UPPCL
        उपभोक्ता ऐप; बिहार में <strong>Bihar Bijli Smart Meter</strong> ऐप। बाक़ी राज्यों में रिचार्ज रसीद
        पर लिखा ऐप/पोर्टल इस्तेमाल करें — हमारे <a href="/hi/smart-meter-recharge/">डिस्कॉम-वार रिचार्ज
        पेज</a> हर आधिकारिक पोर्टल से जोड़ते हैं।</p>
      </section>

      <section class="seo-section">
        <h2>3. SMS अलर्ट (स्मार्टफोन ज़रूरी नहीं)</h2>
        <p>डिस्कॉम कम-बैलेंस अलर्ट कनेक्शन पर पंजीकृत मोबाइल नंबर पर भेजते हैं — आमतौर पर कटौती से पहले
        एक-दो सीमाओं पर, और हर रिचार्ज की पुष्टि। अलर्ट नहीं आ रहे, तो पंजीकृत नंबर शायद पुराना है: डिस्कॉम
        ऐप, पोर्टल या उपखंड कार्यालय से अपडेट कराएँ। जो ऐप नहीं चला सकते, उनके लिए यही अलर्ट मुख्य
        सुरक्षा-जाल हैं — नंबर ठीक कराना चक्कर के लायक है।</p>
      </section>

      <section class="seo-section">
        <h2>दैनिक कटौती खाता पढ़ना</h2>
        <p>हर दिन की कटौती सिर्फ़ "यूनिट × दर" नहीं होती। उसमें शामिल है:</p>
        <ul>
          <li><strong>ऊर्जा शुल्क</strong> — उस दिन की यूनिटें आपके <a href="/hi/glossary/#telescopic-slabs">स्लैब
          दरों</a> पर;</li>
          <li><strong>फिक्स्ड चार्ज</strong> — मासिक <a href="/hi/glossary/#fixed-charge">फिक्स्ड चार्ज</a>
          महीने के दिनों में बँटा, शून्य खपत पर भी कटता है;</li>
          <li><strong>FPPA और शुल्क</strong> — लागू मदों पर <a href="/hi/glossary/#fppa">ईंधन अधिभार</a> और
          <a href="/hi/glossary/#electricity-duty">बिजली शुल्क</a>;</li>
          <li><strong>बकाया किस्त</strong> — पुराने पोस्टपेड बकाया वसूले जा रहे हों तो प्रति रिचार्ज/प्रति दिन
          एक हिस्सा।</li>
        </ul>
        <p>इसीलिए घर बंद रहने वाले दिन भी बैलेंस थोड़ा घटता है। आपका सामान्य दैनिक ख़र्च कितना <em>होना
        चाहिए</em> — और मौजूदा बैलेंस कितने दिन चलेगा — यह <a href="/recharge-calculator/">स्मार्ट मीटर
        रिचार्ज कैलकुलेटर</a> से देखें, जो आपकी खपत को आपके डिस्कॉम की असली टैरिफ दरों पर आँकता है।</p>
      </section>`,
    faqsHi: [
      { q: 'मीटर पर ही बैलेंस कैसे देखें?',
        a: 'मीटर का पुश बटन दबाकर डिस्प्ले की स्क्रीनें बदलें — एक स्क्रीन ₹ में प्रीपेड बैलेंस दिखाती है (अक्सर BAL या CR लेबल), साथ में कुल kWh, लोड और वोल्टेज की स्क्रीनें। इंटरनेट नहीं चाहिए, पर रिचार्ज के तुरंत बाद यह डिस्कॉम ऐप से एक सिंक-चक्र पीछे हो सकता है।' },
      { q: 'बिजली इस्तेमाल न करने पर भी बैलेंस क्यों घटा?',
        a: 'दैनिक कटौती में मासिक फिक्स्ड चार्ज का हिस्सा (शून्य यूनिट पर भी), FPPA व शुल्क और बकाया किस्त शामिल हैं — और आपूर्ति चालू रही हो तो फ्रिज, राउटर जैसे हरदम चलते लोड भी। ऐप का दैनिक कटौती खाता मदवार दिखाता है कि क्या कटा।' },
      { q: 'ऐप और मीटर का बैलेंस अलग-अलग है — सही कौन?',
        a: 'डिस्कॉम का बिलिंग सिस्टम (ऐप/पोर्टल वाला आँकड़ा) प्रामाणिक है; मीटर अगली बार जुड़ने पर उससे सिंक होता है। रिचार्ज के तुरंत बाद का अंतर सामान्य है। एक दिन से ज़्यादा अंतर बना रहे तो मीटर का नेटवर्क छूटा हो सकता है — डिस्कॉम को बताएँ।' },
      { q: 'कम-बैलेंस SMS अलर्ट कैसे मिलेंगे?',
        a: 'अलर्ट कनेक्शन पर पंजीकृत मोबाइल नंबर पर जाते हैं। नहीं मिल रहे तो डिस्कॉम ऐप, पोर्टल या उपखंड कार्यालय से नंबर अपडेट कराएँ — बैलेंस कटौती से पहले चेतावनी देना डिस्कॉम के लिए अनिवार्य है।' },
    ],

    titleMr: 'तुमच्या स्मार्ट मीटरचा बॅलन्स कसा तपासावा (डिस्प्ले, अॅप, SMS)',
    metaTitleMr: 'स्मार्ट मीटर बॅलन्स तपासणी — मीटर डिस्प्ले, डिस्कॉम अॅप व रोजची कपात',
    descriptionMr: 'प्रीपेड स्मार्ट मीटरचा बॅलन्स तपासण्याचे तीन मार्ग — मीटरचा पुश-बटण डिस्प्ले, डिस्कॉम अॅप/पोर्टल आणि SMS अलर्ट — आणि रोजचे कपात खतावणी कसे वाचावे, जेणेकरून बॅलन्स कुठे जातो हे नेमके कळेल.',
    introMr: `प्रीपेड स्मार्ट मीटर आपला बॅलन्स तीन ठिकाणी दाखवतो: <strong>मीटरवरच</strong>, <strong>डिस्कॉमच्या
      अॅप किंवा पोर्टलमध्ये</strong>, आणि <strong>SMS अलर्ट</strong> द्वारे. प्रत्येकाचा वेगळा उपयोग आहे —
      डिस्प्ले तत्काळ आहे, अॅपमध्ये संपूर्ण कपातीचा इतिहास आहे, आणि SMS स्मार्टफोनशिवाय काम करते. ही
      मार्गदर्शिका तिन्ही मार्ग आणि रोजचे कपात खतावणी वाचणे समजावते, जेणेकरून घटता बॅलन्स कधीही चकित करू
      नये.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. मीटर डिस्प्लेवर (इंटरनेटशिवाय चालते)</h2>
        <p>प्रत्येक स्मार्ट मीटरला एक <strong>पुश बटण</strong> असते जे डिस्प्लेच्या स्क्रीन बदलत जाते —
        ते वारंवार दाबा आणि लेबल पहा. नेमका क्रम कंपनीनुसार बदलतो, पण सामान्यतः दिसेल: सध्याचा बॅलन्स (₹),
        एकत्रित युनिटे (kWh), तात्कालिक भार (kW), आणि व्होल्टेज. बॅलन्स स्क्रीनवर सहसा ₹ चिन्ह किंवा
        "BAL"/"CR" लेबल असते; ऋणात्मक आकडा म्हणजे तुम्ही उधारीवर वापर करत आहात आणि कपात रांगेत असू शकते.</p>
        <p>लक्षात ठेवा — मीटरचा बॅलन्स डिस्कॉमच्या प्रणालीहून एक सिंक-चक्र मागे असू शकतो: नुकताच रिचार्ज केला
        असेल तर आधी अॅप अपडेट होते आणि मीटर पुढच्या वेळी जोडल्यावर.</p>
      </section>

      <section class="seo-section">
        <h2>2. डिस्कॉम अॅप किंवा पोर्टलमध्ये (संपूर्ण चित्र)</h2>
        <p>डिस्कॉमचे स्वतःचे अॅप किंवा ग्राहक पोर्टल हेच अधिकृत ठिकाण आहे: तुमच्या ग्राहक/खाते क्रमांकाने
        लॉगिन करून थेट बॅलन्स, रिचार्ज इतिहास आणि — सर्वात उपयुक्त — <strong>रोजचे कपात खतावणी</strong> पहा.
        उत्तर प्रदेशात ते <a href="https://uppclonline.com" target="_blank" rel="noopener">uppclonline.com</a>
        किंवा UPPCL ग्राहक अॅप; बिहारमध्ये <strong>Bihar Bijli Smart Meter</strong> अॅप. इतर राज्यांसाठी,
        तुमच्या रिचार्ज पावतीवर नमूद अॅप किंवा पोर्टल वापरा — आमची <a href="/mr/smart-meter-recharge/">डिस्कॉम-निहाय
        रिचार्ज पेज</a> प्रत्येक अधिकृत पोर्टलशी जोडतात.</p>
      </section>

      <section class="seo-section">
        <h2>3. SMS अलर्ट (स्मार्टफोन आवश्यक नाही)</h2>
        <p>डिस्कॉम कमी-बॅलन्स अलर्ट तुमच्या जोडणीवर नोंदणीकृत मोबाइल क्रमांकावर पाठवतात — सामान्यतः कपातीपूर्वी
        एक-दोन उंबरठ्यांवर, आणि प्रत्येक रिचार्जनंतर पुष्टी. ते मिळत नसतील, तर तुमचा नोंदणीकृत क्रमांक बहुधा
        जुना आहे: डिस्कॉम अॅप, पोर्टल किंवा उपविभाग कार्यालयातून तो अपडेट करा. जे अॅप वापरू शकत नाहीत,
        त्यांच्यासाठी हेच अलर्ट मुख्य सुरक्षा-जाळे आहेत, म्हणून क्रमांक दुरुस्त करणे फेऱ्याच्या लायकीचे आहे.</p>
      </section>

      <section class="seo-section">
        <h2>रोजचे कपात खतावणी वाचणे</h2>
        <p>प्रत्येक दिवसाची कपात फक्त "युनिटे × दर" नसते. त्यात समाविष्ट असते:</p>
        <ul>
          <li><strong>ऊर्जा आकार</strong> — त्या दिवसाची युनिटे तुमच्या
          <a href="/mr/glossary/#telescopic-slabs">स्लॅब दरांनी</a>;</li>
          <li><strong>स्थिर आकार</strong> — मासिक <a href="/mr/glossary/#fixed-charge">स्थिर आकार</a>
          महिन्याच्या दिवसांत विभागलेला, शून्य वापरावरही कापला जातो;</li>
          <li><strong>FPPA आणि शुल्क</strong> — लागू घटकांवरील <a href="/mr/glossary/#fppa">इंधन अधिभार</a>
          आणि <a href="/mr/glossary/#electricity-duty">वीज शुल्क</a>;</li>
          <li><strong>थकबाकी हप्ता</strong> — जुनी पोस्टपेड देणी वसूल होत असल्यास, प्रति रिचार्ज किंवा प्रति
          दिवस एक भाग.</li>
        </ul>
        <p>म्हणूनच घर बंद असलेल्या दिवशीही बॅलन्स थोडा घटतो. तुमचा सामान्य रोजचा खर्च किती <em>असावा</em> —
        आणि सध्याचा बॅलन्स किती दिवस पुरेल — हे <a href="/recharge-calculator/">स्मार्ट मीटर रिचार्ज
        कॅल्क्युलेटर</a> ने पहा, जे तुमचा वापर तुमच्या डिस्कॉमच्या खऱ्या टॅरिफ दरांनी आकारते.</p>
      </section>`,
    faqsMr: [
      { q: 'मीटरवरच बॅलन्स कसा पहावा?',
        a: 'मीटरचे पुश बटण दाबून डिस्प्लेच्या स्क्रीन बदला — एक स्क्रीन ₹ मध्ये प्रीपेड बॅलन्स दाखवते (अनेकदा BAL किंवा CR लेबल), सोबत एकत्रित kWh, भार व व्होल्टेजच्या स्क्रीन. इंटरनेट लागत नाही, पण रिचार्जच्या लगेच नंतर हे डिस्कॉम अॅपहून एक सिंक-चक्र मागे असू शकते.' },
      { q: 'वीज न वापरताही बॅलन्स का घटला?',
        a: 'रोजच्या कपातीत मासिक स्थिर आकाराचा भाग (शून्य युनिटवरही), FPPA व शुल्क आणि थकबाकी हप्ता समाविष्ट असतात — शिवाय पुरवठा चालू असल्यास फ्रिज किंवा राउटरसारखे सतत चालणारे भार. अॅपचे रोजचे कपात खतावणी नेमके काय कापले ते बाबवार दाखवते.' },
      { q: 'अॅपचा बॅलन्स आणि मीटरचा बॅलन्स वेगळे आहेत — कोणता बरोबर?',
        a: 'डिस्कॉमची बिलिंग प्रणाली (अॅप/पोर्टलवरील आकडा) अधिकृत आहे; मीटर पुढच्या वेळी जोडल्यावर त्याच्याशी सिंक होते. रिचार्जच्या लगेच नंतरचा फरक सामान्य आहे. एक दिवसाहून जास्त फरक राहिल्यास मीटरचे नेटवर्क गेले असू शकते — डिस्कॉमला कळवा.' },
      { q: 'कमी-बॅलन्स SMS अलर्ट कसे मिळतील?',
        a: 'अलर्ट तुमच्या जोडणीवर नोंदणीकृत मोबाइल क्रमांकावर जातात. मिळत नसतील तर डिस्कॉम अॅप, पोर्टल किंवा उपविभाग कार्यालयातून क्रमांक अपडेट करा — कोणत्याही बॅलन्स कपातीपूर्वी सावध करणे डिस्कॉमसाठी अनिवार्य आहे.' },
    ],
  },

  {
    slug: 'prepaid-vs-postpaid-smart-meter',
    published: "2026-02-11",
    title: 'Prepaid vs Postpaid Smart Meter: Which Is Better for You?',
    metaTitle: 'Prepaid vs Postpaid Smart Meter — Cost, Rebates, Deposit & Which to Choose',
    description: 'Prepaid and postpaid smart meters charge the same tariff rates — the differences are rebates, security deposit, late fees and cash-flow. A plain comparison of both modes, who each suits, and whether you can switch.',
    minutes: 5,
    intro: `The same smart meter can run in <strong>prepaid</strong> (recharge first, consume after) or
      <strong>postpaid</strong> (consume first, bill later) mode — and the energy rates are identical,
      set by the same tariff order. What actually differs is cash-flow, the security deposit, late-payment
      exposure and small rebates. This guide compares the two honestly, so you can decide — where your
      DISCOM gives a choice — which mode suits your household.`,
    sections: `
      <section class="seo-section">
        <h2>Same tariff, different payment direction</h2>
        <p>A common fear is that prepaid meters charge more per unit. They don't: the slab rates, fixed
        charges, <a href="/glossary/#fppa">FPPA</a> and duty come from the same tariff order either way —
        verify yours on your <a href="/tariffs/states/">state's tariff page</a>. In prepaid mode the same
        monthly bill is simply deducted from your balance day by day instead of arriving as one demand at
        the month's end. Over a year, the energy cost is the same to the rupee — before the adjustments
        below.</p>
      </section>

      <section class="seo-section">
        <h2>Where the real differences are</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th></th><th>Prepaid</th><th>Postpaid</th></tr></thead>
          <tbody>
            <tr><td><strong>Rebate</strong></td><td>Several states' tariff orders give a small rebate on prepaid consumption (commonly in the 1–2% range) — check your state's order.</td><td>Usually none (some DISCOMs give small rebates for on-time or digital payment).</td></tr>
            <tr><td><strong>Security deposit</strong></td><td>Not required — your balance IS the security. Existing deposits are typically adjusted or refunded on conversion.</td><td>Required, roughly 1–2 months of consumption, revised periodically.</td></tr>
            <tr><td><strong>Late payment surcharge</strong></td><td>Can't arise — there is no due date.</td><td>LPSC (often 1.25–1.5%/month) on any delayed bill.</td></tr>
            <tr><td><strong>Credit period</strong></td><td>None — you fund consumption in advance.</td><td>You use power ~30–45 days before paying — a real interest-free float.</td></tr>
            <tr><td><strong>Disconnection risk</strong></td><td>Automatic at negative balance (with alerts and protected hours) — see <a href="/guides/smart-meter-prepaid-disconnection/">the disconnection rules</a>.</td><td>Only after formal notice for unpaid bills.</td></tr>
            <tr><td><strong>Spending visibility</strong></td><td>Daily — the deduction ledger shows every day's cost.</td><td>Monthly, after the fact.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>Who each mode suits</h2>
        <p><strong>Prepaid works well</strong> for households that want spending control (the daily
        ledger makes waste visible), tenants and landlords (no disputed final bills — the balance simply
        transfers or empties), second homes that sit empty, and anyone who has been stung by LPSC on
        forgotten due dates. The deposit refund on conversion is a genuine one-time gain.</p>
        <p><strong>Postpaid suits</strong> households that value the ~month of float, prefer one payment
        over recharge-watching, or live where connectivity makes recharges unreliable. If someone in the
        house depends on powered medical equipment, postpaid's formal-notice disconnection process is
        also the safer default — raise this with your DISCOM before any conversion.</p>
        <p>Sizing your recharges right removes most prepaid friction: the
        <a href="/recharge-calculator/">recharge calculator</a> shows the ideal monthly amount for your
        DISCOM and usage.</p>
      </section>

      <section class="seo-section">
        <h2>Can you choose or switch?</h2>
        <p>Under the national smart-metering push (RDSS), most DISCOMs are installing meters
        <strong>prepaid-first for domestic consumers</strong>, and in several states prepaid is the
        default for new domestic connections. Where both modes are offered, you can apply at the
        sub-division office or portal to switch; the meter itself doesn't change — only the billing mode.
        If you are converted to prepaid, check that your old security deposit (with interest, where the
        supply code provides it) is adjusted into your recharge balance — it is your money.</p>
      </section>`,
    faqs: [
      { q: 'Is electricity cheaper on a prepaid smart meter?',
        a: 'The tariff rates are identical — same slabs, fixed charges, FPPA and duty. Prepaid can work out slightly cheaper in practice: several states’ tariff orders give a small prepaid rebate (commonly 1–2%), you can never incur late-payment surcharge, and no security deposit is locked up.' },
      { q: 'Do I get my security deposit back if I move to prepaid?',
        a: 'Yes — prepaid connections don’t need a security deposit, so the existing deposit is adjusted into your balance or refunded on conversion, with interest where the state’s supply code provides it. Check the adjustment actually appears; it is a common miss.' },
      { q: 'Which is better for tenants and landlords?',
        a: 'Prepaid, usually. There is no end-of-tenancy disputed bill: consumption stops when the balance isn’t topped up, and the meter’s ledger shows exactly who consumed what and when. Landlords avoid inheriting arrears; tenants avoid paying someone else’s dues.' },
      { q: 'Can I refuse a prepaid smart meter?',
        a: 'The meter installation itself is a licensed activity you generally can’t refuse, but the billing MODE varies by state — some run smart meters in postpaid mode, and some offer a choice. Ask your DISCOM in writing what modes it offers; where prepaid is the notified default for your category, conversion requests are decided per the state’s supply code.' },
    ],

    titleHi: 'प्रीपेड बनाम पोस्टपेड स्मार्ट मीटर: आपके लिए कौन बेहतर?',
    metaTitleHi: 'प्रीपेड बनाम पोस्टपेड स्मार्ट मीटर — लागत, छूट, जमानत और सही चुनाव',
    descriptionHi: 'प्रीपेड और पोस्टपेड स्मार्ट मीटर की टैरिफ दरें एक ही होती हैं — फ़र्क़ छूट, जमानत राशि, विलंब शुल्क और नकदी-प्रवाह का है। दोनों मोड की सीधी तुलना, किसे कौन-सा सूट करता है, और क्या बदलना संभव है।',
    introHi: `एक ही स्मार्ट मीटर <strong>प्रीपेड</strong> (पहले रिचार्ज, फिर खपत) या <strong>पोस्टपेड</strong>
      (पहले खपत, बाद में बिल) मोड में चल सकता है — और ऊर्जा दरें दोनों में एक जैसी हैं, एक ही टैरिफ आदेश
      से। असली फ़र्क़ नकदी-प्रवाह, जमानत राशि, विलंब-भुगतान जोखिम और छोटी छूटों का है। यह गाइड दोनों की
      ईमानदार तुलना करती है, ताकि — जहाँ डिस्कॉम विकल्प देता है — आप अपने घर के लिए सही मोड चुन सकें।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>टैरिफ वही, भुगतान की दिशा अलग</h2>
        <p>आम डर यह है कि प्रीपेड मीटर प्रति यूनिट ज़्यादा वसूलता है। ऐसा नहीं है: स्लैब दरें, फिक्स्ड चार्ज,
        <a href="/hi/glossary/#fppa">FPPA</a> और शुल्क दोनों मोड में एक ही टैरिफ आदेश से आते हैं — अपनी दरें
        <a href="/hi/tariffs/states/">राज्य के टैरिफ पेज</a> पर मिलाएँ। प्रीपेड में वही मासिक बिल महीने के अंत
        की एक माँग की जगह दिन-प्रतिदिन बैलेंस से कटता है। साल भर में ऊर्जा लागत रुपये-रुपये बराबर है —
        नीचे दिए समायोजनों से पहले।</p>
      </section>

      <section class="seo-section">
        <h2>असली अंतर कहाँ हैं</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th></th><th>प्रीपेड</th><th>पोस्टपेड</th></tr></thead>
          <tbody>
            <tr><td><strong>छूट</strong></td><td>कई राज्यों के टैरिफ आदेश प्रीपेड खपत पर छोटी छूट देते हैं (आमतौर पर 1–2% के दायरे में) — अपने राज्य का आदेश देखें।</td><td>आमतौर पर नहीं (कुछ डिस्कॉम समय पर/डिजिटल भुगतान पर छोटी छूट देते हैं)।</td></tr>
            <tr><td><strong>जमानत राशि</strong></td><td>ज़रूरी नहीं — आपका बैलेंस ही जमानत है। मौजूदा जमा रूपांतरण पर समायोजित या वापस होती है।</td><td>ज़रूरी, लगभग 1–2 महीने की खपत जितनी, समय-समय पर संशोधित।</td></tr>
            <tr><td><strong>विलंब भुगतान अधिभार</strong></td><td>बन ही नहीं सकता — कोई नियत तिथि नहीं।</td><td>देर से भरे बिल पर LPSC (अक्सर 1.25–1.5%/माह)।</td></tr>
            <tr><td><strong>क्रेडिट अवधि</strong></td><td>नहीं — खपत का पैसा पहले देना होता है।</td><td>भुगतान से ~30–45 दिन पहले बिजली इस्तेमाल — असली ब्याज-मुक्त सुविधा।</td></tr>
            <tr><td><strong>कटौती जोखिम</strong></td><td>ऋणात्मक बैलेंस पर स्वतः (अलर्ट और संरक्षित घंटों के साथ) — देखें <a href="/hi/guides/smart-meter-prepaid-disconnection/">कटौती के नियम</a>।</td><td>सिर्फ़ अवैतनिक बिलों पर औपचारिक नोटिस के बाद।</td></tr>
            <tr><td><strong>ख़र्च की दृश्यता</strong></td><td>दैनिक — कटौती खाता हर दिन की लागत दिखाता है।</td><td>मासिक, खपत के बाद।</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>किसे कौन-सा मोड सूट करता है</h2>
        <p><strong>प्रीपेड उनके लिए अच्छा है</strong> जो ख़र्च पर नियंत्रण चाहते हैं (दैनिक खाता फ़िज़ूलख़र्ची
        दिखा देता है), किरायेदार-मकान मालिक (अंतिम बिल का विवाद नहीं — बैलेंस बस स्थानांतरित होता है या
        ख़त्म), खाली पड़े दूसरे घर, और वे जो भूली नियत तिथियों पर LPSC झेल चुके हैं। रूपांतरण पर जमा की
        वापसी एक असली एकमुश्त लाभ है।</p>
        <p><strong>पोस्टपेड उन्हें सूट करता है</strong> जिन्हें महीने भर की मोहलत चाहिए, रिचार्ज-निगरानी की जगह
        एक भुगतान पसंद है, या जहाँ नेटवर्क रिचार्ज को अविश्वसनीय बनाता है। घर में कोई बिजली से चलने वाले
        चिकित्सा उपकरण पर निर्भर हो, तो पोस्टपेड की औपचारिक-नोटिस कटौती प्रक्रिया ज़्यादा सुरक्षित है —
        रूपांतरण से पहले डिस्कॉम को यह बताएँ।</p>
        <p>रिचार्ज सही आकार का हो तो प्रीपेड की ज़्यादातर झंझट मिट जाती है:
        <a href="/recharge-calculator/">रिचार्ज कैलकुलेटर</a> आपके डिस्कॉम और खपत के लिए आदर्श मासिक राशि
        दिखाता है।</p>
      </section>

      <section class="seo-section">
        <h2>क्या चुनना या बदलना संभव है?</h2>
        <p>राष्ट्रीय स्मार्ट-मीटरिंग अभियान (RDSS) के तहत अधिकांश डिस्कॉम घरेलू उपभोक्ताओं के लिए मीटर
        <strong>प्रीपेड-प्रथम</strong> लगा रहे हैं, और कई राज्यों में नए घरेलू कनेक्शनों के लिए प्रीपेड ही
        डिफ़ॉल्ट है। जहाँ दोनों मोड मिलते हैं, उपखंड कार्यालय या पोर्टल पर आवेदन से बदलाव हो सकता है; मीटर
        वही रहता है — सिर्फ़ बिलिंग मोड बदलता है। प्रीपेड में बदले गए हों, तो देखें कि पुरानी जमानत राशि
        (जहाँ आपूर्ति संहिता ब्याज देती है, ब्याज सहित) आपके रिचार्ज बैलेंस में समायोजित हुई — वह आपका
        पैसा है।</p>
      </section>`,
    faqsHi: [
      { q: 'क्या प्रीपेड स्मार्ट मीटर पर बिजली सस्ती है?',
        a: 'टैरिफ दरें एक जैसी हैं — वही स्लैब, फिक्स्ड चार्ज, FPPA और शुल्क। व्यवहार में प्रीपेड थोड़ा सस्ता पड़ सकता है: कई राज्यों के टैरिफ आदेश छोटी प्रीपेड छूट (आमतौर पर 1–2%) देते हैं, विलंब अधिभार कभी नहीं लगता, और जमानत राशि फँसी नहीं रहती।' },
      { q: 'प्रीपेड में जाने पर क्या जमानत राशि वापस मिलती है?',
        a: 'हाँ — प्रीपेड कनेक्शन को जमानत नहीं चाहिए, इसलिए मौजूदा जमा रूपांतरण पर बैलेंस में समायोजित या वापस होती है, और जहाँ राज्य की आपूर्ति संहिता ब्याज देती है, ब्याज सहित। समायोजन सचमुच दिखा या नहीं, यह जाँचें — यह अक्सर छूट जाता है।' },
      { q: 'किरायेदार-मकान मालिक के लिए कौन बेहतर?',
        a: 'आमतौर पर प्रीपेड। किरायेदारी ख़त्म होने पर विवादित बिल नहीं बनता: बैलेंस टॉप-अप न हो तो खपत रुक जाती है, और मीटर का खाता दिखाता है कि किसने कब कितना खर्च किया। मकान मालिक को बकाया विरासत में नहीं मिलता; किरायेदार को दूसरे का बकाया नहीं भरना पड़ता।' },
      { q: 'क्या मैं प्रीपेड स्मार्ट मीटर लेने से मना कर सकता हूँ?',
        a: 'मीटर लगना लाइसेंसी गतिविधि है जिससे आमतौर पर मना नहीं किया जा सकता, पर बिलिंग मोड राज्य-दर-राज्य अलग है — कुछ जगह स्मार्ट मीटर पोस्टपेड मोड में चलते हैं, कुछ विकल्प देते हैं। डिस्कॉम से लिखित पूछें कि कौन-से मोड उपलब्ध हैं; जहाँ आपकी श्रेणी के लिए प्रीपेड अधिसूचित डिफ़ॉल्ट है, वहाँ रूपांतरण आवेदन राज्य की आपूर्ति संहिता के अनुसार तय होते हैं।' },
    ],

    titleMr: 'प्रीपेड वि. पोस्टपेड स्मार्ट मीटर: तुमच्यासाठी कोणते चांगले?',
    metaTitleMr: 'प्रीपेड वि. पोस्टपेड स्मार्ट मीटर — खर्च, सूट, अनामत रक्कम व योग्य निवड',
    descriptionMr: 'प्रीपेड आणि पोस्टपेड स्मार्ट मीटरचे टॅरिफ दर एकसारखेच असतात — फरक सूट, अनामत रक्कम, विलंब शुल्क आणि रोख-प्रवाहाचा आहे. दोन्ही मोडची सरळ तुलना, कोणाला कोणते सूट करते, आणि बदलणे शक्य आहे का.',
    introMr: `तेच स्मार्ट मीटर <strong>प्रीपेड</strong> (आधी रिचार्ज, नंतर वापर) किंवा <strong>पोस्टपेड</strong>
      (आधी वापर, नंतर बिल) मोडमध्ये चालू शकते — आणि ऊर्जा दर दोन्हीत एकसारखेच, त्याच टॅरिफ आदेशाने ठरलेले.
      खरा फरक रोख-प्रवाह, अनामत रक्कम, विलंब-भरणा धोका आणि छोट्या सुटींचा आहे. ही मार्गदर्शिका दोन्हीची
      प्रामाणिक तुलना करते, जेणेकरून — जिथे डिस्कॉम पर्याय देतो — तुम्ही तुमच्या घरासाठी योग्य मोड निवडू
      शकता.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>टॅरिफ तोच, भरण्याची दिशा वेगळी</h2>
        <p>एक सामान्य भीती अशी की प्रीपेड मीटर प्रति युनिट जास्त आकारतो. तसे नाही: स्लॅब दर, स्थिर आकार,
        <a href="/mr/glossary/#fppa">FPPA</a> आणि शुल्क दोन्ही मोडमध्ये त्याच टॅरिफ आदेशातून येतात — तुमचे
        दर <a href="/mr/tariffs/states/">राज्याच्या टॅरिफ पेज</a> वर जुळवा. प्रीपेड मोडमध्ये तेच मासिक बिल
        महिन्याअखेरीस एका मागणीऐवजी दिवसागणिक बॅलन्समधून कापले जाते. वर्षभरात ऊर्जा खर्च रुपया-रुपया सारखाच
        आहे — खालील समायोजनांआधी.</p>
      </section>

      <section class="seo-section">
        <h2>खरे फरक कुठे आहेत</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th></th><th>प्रीपेड</th><th>पोस्टपेड</th></tr></thead>
          <tbody>
            <tr><td><strong>सूट</strong></td><td>अनेक राज्यांचे टॅरिफ आदेश प्रीपेड वापरावर छोटी सूट देतात (सामान्यतः 1–2% च्या दरम्यान) — तुमच्या राज्याचा आदेश पहा.</td><td>सहसा नाही (काही डिस्कॉम वेळेवर/डिजिटल भरण्यावर छोटी सूट देतात).</td></tr>
            <tr><td><strong>अनामत रक्कम</strong></td><td>आवश्यक नाही — तुमचा बॅलन्सच अनामत आहे. सध्याच्या ठेवी रूपांतरणावर सामान्यतः समायोजित किंवा परत होतात.</td><td>आवश्यक, साधारण 1–2 महिन्यांच्या वापराइतकी, वेळोवेळी सुधारित.</td></tr>
            <tr><td><strong>विलंब भरणा अधिभार</strong></td><td>उद्भवूच शकत नाही — कोणतीही देय तारीख नाही.</td><td>कोणत्याही उशिरा बिलावर LPSC (अनेकदा 1.25–1.5%/महिना).</td></tr>
            <tr><td><strong>क्रेडिट अवधी</strong></td><td>नाही — वापराचे पैसे आधी द्यावे लागतात.</td><td>भरण्याआधी ~30–45 दिवस वीज वापर — खरी व्याजमुक्त सवलत.</td></tr>
            <tr><td><strong>कपात धोका</strong></td><td>ऋण बॅलन्सवर आपोआप (अलर्ट व संरक्षित तासांसह) — पहा <a href="/mr/guides/smart-meter-prepaid-disconnection/">कपातीचे नियम</a>.</td><td>फक्त थकीत बिलांसाठी औपचारिक नोटीसनंतर.</td></tr>
            <tr><td><strong>खर्चाची दृश्यता</strong></td><td>रोज — कपात खतावणी प्रत्येक दिवसाचा खर्च दाखवते.</td><td>मासिक, वापरानंतर.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>कोणाला कोणता मोड सूट करतो</h2>
        <p><strong>प्रीपेड चांगले आहे</strong> त्या घरांसाठी ज्यांना खर्चावर नियंत्रण हवे (रोजचे खतावणी उधळपट्टी
        दृश्यमान करते), भाडेकरू व घरमालक (वादग्रस्त अंतिम बिल नाही — बॅलन्स फक्त हस्तांतरित होतो किंवा संपतो),
        रिकामी पडलेली दुसरी घरे, आणि ज्यांना विसरलेल्या देय तारखांवर LPSC चा फटका बसला आहे त्यांच्यासाठी.
        रूपांतरणावर अनामत परतावा हा खरा एकवेळ लाभ आहे.</p>
        <p><strong>पोस्टपेड सूट करते</strong> त्या घरांना ज्यांना ~महिनाभराची सवलत मोलाची वाटते, रिचार्ज-निगराणीऐवजी
        एक भरणा आवडतो, किंवा जिथे नेटवर्कमुळे रिचार्ज अविश्वसनीय होते. घरातील कोणी वीजेवर चालणाऱ्या वैद्यकीय
        उपकरणावर अवलंबून असेल, तर पोस्टपेडची औपचारिक-नोटीस कपात प्रक्रिया अधिक सुरक्षित पर्याय आहे — कोणत्याही
        रूपांतरणापूर्वी हे डिस्कॉमला सांगा.</p>
        <p>रिचार्ज योग्य आकाराचे केल्यास प्रीपेडची बहुतेक कटकट मिटते:
        <a href="/recharge-calculator/">रिचार्ज कॅल्क्युलेटर</a> तुमच्या डिस्कॉम व वापरासाठी आदर्श मासिक रक्कम
        दाखवते.</p>
      </section>

      <section class="seo-section">
        <h2>निवडणे किंवा बदलणे शक्य आहे का?</h2>
        <p>राष्ट्रीय स्मार्ट-मीटरिंग मोहिमेअंतर्गत (RDSS) बहुतेक डिस्कॉम घरगुती ग्राहकांसाठी मीटर
        <strong>प्रीपेड-प्रथम</strong> बसवत आहेत, आणि अनेक राज्यांत नव्या घरगुती जोडण्यांसाठी प्रीपेडच डीफॉल्ट
        आहे. जिथे दोन्ही मोड मिळतात, तिथे उपविभाग कार्यालयात किंवा पोर्टलवर अर्ज करून बदल करता येतो; मीटर तेच
        राहते — फक्त बिलिंग मोड बदलतो. प्रीपेडमध्ये बदलले असल्यास, तुमची जुनी अनामत रक्कम (जिथे पुरवठा संहिता
        व्याज देते तिथे व्याजासह) तुमच्या रिचार्ज बॅलन्समध्ये समायोजित झाली का ते पहा — तो तुमचा पैसा आहे.</p>
      </section>`,
    faqsMr: [
      { q: 'प्रीपेड स्मार्ट मीटरवर वीज स्वस्त आहे का?',
        a: 'टॅरिफ दर एकसारखेच आहेत — तेच स्लॅब, स्थिर आकार, FPPA आणि शुल्क. व्यवहारात प्रीपेड थोडे स्वस्त पडू शकते: अनेक राज्यांचे टॅरिफ आदेश छोटी प्रीपेड सूट (सामान्यतः 1–2%) देतात, विलंब अधिभार कधीच लागत नाही, आणि अनामत रक्कम अडकून राहत नाही.' },
      { q: 'प्रीपेडमध्ये गेल्यास माझी अनामत रक्कम परत मिळते का?',
        a: 'होय — प्रीपेड जोडण्यांना अनामत लागत नाही, म्हणून सध्याची ठेव रूपांतरणावर बॅलन्समध्ये समायोजित किंवा परत होते, आणि जिथे राज्याची पुरवठा संहिता व्याज देते तिथे व्याजासह. समायोजन खरोखर दिसते का ते तपासा; ते अनेकदा सुटते.' },
      { q: 'भाडेकरू व घरमालकांसाठी कोणते चांगले?',
        a: 'सहसा प्रीपेड. भाडेकरार संपल्यावर वादग्रस्त बिल नसते: बॅलन्स टॉप-अप न झाल्यास वापर थांबतो, आणि मीटरचे खतावणी कोणी कधी किती वापरले ते नेमके दाखवते. घरमालकांना थकबाकी वारशाने मिळत नाही; भाडेकरूंना दुसऱ्याची देणी भरावी लागत नाहीत.' },
      { q: 'मी प्रीपेड स्मार्ट मीटर नाकारू शकतो का?',
        a: 'मीटर बसवणे ही परवानाधारक क्रिया आहे जी सहसा नाकारता येत नाही, पण बिलिंग मोड राज्यानुसार बदलतो — काही ठिकाणी स्मार्ट मीटर पोस्टपेड मोडमध्ये चालतात, काही पर्याय देतात. डिस्कॉमला लेखी विचारा की कोणते मोड उपलब्ध आहेत; जिथे तुमच्या श्रेणीसाठी प्रीपेड अधिसूचित डीफॉल्ट आहे, तिथे रूपांतरण अर्ज राज्याच्या पुरवठा संहितेनुसार ठरतात.' },
    ],
  },

  {
    slug: 'msedcl-fppa-charges-explained',
    published: "2026-02-23",
    states: ['Maharashtra'],
    title: 'How to Calculate MSEDCL FPPCA (Fuel Adjustment) Charges',
    metaTitle: 'MSEDCL FPPCA / FAC Charges — How the Fuel Adjustment Is Calculated',
    description: 'What the FPPCA (Fuel and Power Purchase Cost Adjustment) line on an MSEDCL bill means, how the monthly ₹/unit rate is set, how to recalculate the charge from your own units, and what to check when it suddenly jumps.',
    minutes: 6,
    intro: `The <strong>FPPCA</strong> line on an MSEDCL bill is the Fuel and Power Purchase Cost
      Adjustment — a monthly ₹-per-unit surcharge (positive or negative) that passes changes in
      MSEDCL's actual power-purchase cost on to consumers. To verify it, multiply the FPPCA rate
      printed on your bill by your billed units for the month:
      <strong>FPPCA charge = FPPCA rate (₹/unit) × units consumed</strong>. This guide explains
      where that rate comes from, why it changes every month, and how to check the line yourself.`,
    sections: `
      <section class="seo-section">
        <h2>What FPPCA is — and why it exists</h2>
        <p>MSEDCL's base energy rates are fixed for the year by MERC (the Maharashtra Electricity
        Regulatory Commission) in the tariff order. But the price MSEDCL actually pays for power —
        coal costs, gas prices, market purchases during shortfalls — moves every month. Rather than
        reopen the tariff each time, the regulator allows an automatic pass-through:</p>
        <ul>
          <li>When actual power-purchase cost runs <strong>above</strong> what the tariff assumed,
          FPPCA is <strong>positive</strong> and is added to your bill.</li>
          <li>When it runs <strong>below</strong> the assumption (cheaper coal, good hydro months),
          FPPCA turns <strong>negative</strong> and appears as a credit.</li>
        </ul>
        <p>Older MSEDCL bills called this line <strong>FAC</strong> (Fuel Adjustment Charge). FPPCA
        is the same mechanism under the current MERC framework — a monthly, formula-driven
        adjustment computed on units consumed.</p>
      </section>

      <section class="seo-section">
        <h2>How the monthly ₹/unit rate is set</h2>
        <p>Each month MSEDCL computes the gap between the power-purchase cost <em>approved</em> in
        the tariff and the cost it <em>actually incurred</em> (typically with a two-month lag, so a
        summer cost spike shows up on bills a couple of months later). That gap, divided across the
        units sold, gives a per-unit adjustment. Two things matter for your bill:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Property</th><th>What it means for you</th></tr></thead>
          <tbody>
            <tr><td><strong>It varies by category and slab</strong></td><td>MSEDCL publishes the
            month's FPPCA as a schedule of ₹/unit rates — residential slabs, commercial, industrial
            and agricultural connections each get their own rate. Your bill applies the rate for
            <em>your</em> category and consumption slab.</td></tr>
            <tr><td><strong>It changes every month</strong></td><td>Comparing this month's FPPCA to
            last month's explains many "why did my bill increase?" cases on otherwise identical
            usage. The rate itself is printed on the bill next to the FPPCA line.</td></tr>
          </tbody>
        </table></div>
        <p>Because the rate is revised monthly, never assume last month's figure — always read the
        rate off the current bill or MSEDCL's published FPPCA schedule for the billing month.</p>
      </section>

      <section class="seo-section">
        <h2>Recalculating the FPPCA line yourself</h2>
        <p>The check takes under a minute:</p>
        <ol>
          <li>Find your <strong>billed units</strong> for the month (the meter block shows current −
          previous reading × MF).</li>
          <li>Find the <strong>FPPCA rate</strong> printed on the bill (₹/unit, sometimes shown in
          paise — 65 paise = ₹0.65).</li>
          <li>Multiply: <strong>units × rate</strong>. The result should match the FPPCA amount to
          within a paisa of rounding.</li>
        </ol>
        <p>For slab-rated categories, MSEDCL applies the slab-wise FPPCA to the units falling in
        each slab — the same way energy charges are slabbed. Our
        <a href="/?state=Maharashtra#calculator">Maharashtra bill calculator</a> applies the
        surcharge with the same per-unit logic: enter your units and the FPPCA rate from your bill,
        and compare the full total. Current MSEDCL base rates are on the
        <a href="/tariffs/maharashtra/">Maharashtra tariff pages</a>.</p>
        <p>One ordering rule worth knowing: <strong>electricity duty is calculated after FPPCA is
        added</strong>. So a higher FPPCA month also nudges the duty line up — both lines move
        together, which is normal, not a double-charge.</p>
      </section>

      <section class="seo-section">
        <h2>When the FPPCA line looks wrong</h2>
        <ul>
          <li><strong>The multiplication doesn't match.</strong> Check whether the rate is printed
          in paise but you multiplied in rupees, and whether the bill period spans two months (units
          may be split across two different monthly rates).</li>
          <li><strong>The rate looks unusually high.</strong> Compare it against MSEDCL's published
          FPPCA schedule for that month and your category. A commercial rate applied to a
          residential connection is a category error worth disputing.</li>
          <li><strong>FPPCA appeared on an estimated bill.</strong> If the month was billed on an
          estimated reading, the FPPCA rides on estimated units too — it self-corrects when a real
          reading is taken, together with the energy charge.</li>
        </ul>
        <p>If the numbers still refuse to reconcile, upload the bill to our free
        <a href="/bill-review/">expert bill review</a> — FPPCA application errors are one of the
        most common things reviewers find.</p>
      </section>`,
    faqs: [
      { q: 'What is FPPCA on an MSEDCL electricity bill?',
        a: 'FPPCA (Fuel and Power Purchase Cost Adjustment) is a monthly ₹-per-unit surcharge that passes changes in MSEDCL\'s actual power-purchase cost on to consumers. It replaces the older FAC line, is set per category and slab each month, and can be positive (charge) or negative (credit).' },
      { q: 'How do I calculate the FPPCA charge on my MSEDCL bill?',
        a: 'Multiply your billed units for the month by the FPPCA rate printed on the bill (mind paise vs rupees). For slab-rated categories the rate applies slab-wise, the same way energy charges are slabbed. The product should match the FPPCA line to rounding.' },
      { q: 'Why does MSEDCL FPPCA change every month?',
        a: 'The adjustment tracks the monthly gap between the power-purchase cost approved in the MERC tariff and what MSEDCL actually paid, usually with about a two-month lag. Coal and market-power price movements therefore show up on bills a couple of months later.' },
      { q: 'Can FPPCA be negative on an MSEDCL bill?',
        a: 'Yes. In months where actual power-purchase cost runs below the level assumed in the tariff, the adjustment is negative and appears as a per-unit credit that reduces your bill.' },
      { q: 'Is electricity duty charged on FPPCA in Maharashtra?',
        a: 'Yes — electricity duty is computed after FPPCA is added, so the duty base includes the fuel adjustment. A higher-FPPCA month raises the duty line proportionally; that is the prescribed ordering, not a double charge.' },
    ],

    titleMr: 'MSEDCL FPPCA (इंधन समायोजन) आकार कसा मोजावा',
    metaTitleMr: 'MSEDCL FPPCA / FAC आकार — इंधन समायोजन कसे मोजले जाते',
    descriptionMr: 'MSEDCL बिलावरील FPPCA (इंधन व वीज खरेदी खर्च समायोजन) ओळ म्हणजे काय, मासिक ₹/युनिट दर कसा ठरतो, तुमच्या स्वतःच्या युनिटांवरून आकार कसा पुन्हा मोजावा, आणि तो अचानक उसळल्यास काय तपासावे.',
    introMr: `MSEDCL बिलावरील <strong>FPPCA</strong> ओळ म्हणजे इंधन व वीज खरेदी खर्च समायोजन (Fuel and Power
      Purchase Cost Adjustment) — एक मासिक ₹-प्रति-युनिट अधिभार (धन किंवा ऋण) जो MSEDCL च्या प्रत्यक्ष
      वीज-खरेदी खर्चातील बदल ग्राहकांपर्यंत पोहोचवतो. तो पडताळण्यासाठी, बिलावर छापलेला FPPCA दर त्या
      महिन्याच्या बिल केलेल्या युनिटांनी गुणा: <strong>FPPCA आकार = FPPCA दर (₹/युनिट) × वापरलेली
      युनिटे</strong>. ही मार्गदर्शिका तो दर कुठून येतो, तो दर महिन्याला का बदलतो, आणि ती ओळ स्वतः कशी
      तपासावी हे समजावते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>FPPCA काय आहे — आणि तो का असतो</h2>
        <p>MSEDCL चे मूळ ऊर्जा दर वर्षासाठी MERC (महाराष्ट्र वीज नियामक आयोग) टॅरिफ आदेशात निश्चित करते.
        पण MSEDCL प्रत्यक्षात विजेसाठी जी किंमत मोजते — कोळसा खर्च, गॅस किमती, तुटवड्याच्या वेळी बाजार
        खरेदी — ती दर महिन्याला बदलते. प्रत्येक वेळी टॅरिफ पुन्हा उघडण्याऐवजी, नियामक एक आपोआप पास-थ्रू
        परवानगी देतो:</p>
        <ul>
          <li>प्रत्यक्ष वीज-खरेदी खर्च टॅरिफने गृहीत धरलेल्यापेक्षा <strong>जास्त</strong> गेल्यास, FPPCA
          <strong>धन</strong> असतो आणि तुमच्या बिलात जोडला जातो.</li>
          <li>तो गृहीतकापेक्षा <strong>कमी</strong> गेल्यास (स्वस्त कोळसा, चांगले जलविद्युत महिने), FPPCA
          <strong>ऋण</strong> होतो आणि क्रेडिट म्हणून दिसतो.</li>
        </ul>
        <p>जुन्या MSEDCL बिलांवर या ओळीला <strong>FAC</strong> (इंधन समायोजन आकार) म्हणत. सध्याच्या MERC
        चौकटीत FPPCA हीच यंत्रणा आहे — वापरलेल्या युनिटांवर मोजलेले एक मासिक, सूत्र-चालित समायोजन.</p>
      </section>

      <section class="seo-section">
        <h2>मासिक ₹/युनिट दर कसा ठरतो</h2>
        <p>दर महिन्याला MSEDCL टॅरिफमध्ये <em>मंजूर</em> वीज-खरेदी खर्च आणि प्रत्यक्षात <em>झालेला</em>
        खर्च यांच्यातील तफावत मोजते (सामान्यतः दोन महिन्यांच्या विलंबाने, म्हणून उन्हाळ्यातील खर्च वाढ काही
        महिन्यांनी बिलांवर दिसते). ती तफावत, विकलेल्या युनिटांत विभागून, प्रति-युनिट समायोजन देते. तुमच्या
        बिलासाठी दोन गोष्टी महत्त्वाच्या:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>गुणधर्म</th><th>तुमच्यासाठी त्याचा अर्थ</th></tr></thead>
          <tbody>
            <tr><td><strong>तो श्रेणी व स्लॅबनुसार बदलतो</strong></td><td>MSEDCL महिन्याचा FPPCA ₹/युनिट दरांच्या अनुसूचीच्या रूपात प्रकाशित करते — निवासी स्लॅब, व्यावसायिक, औद्योगिक व कृषी जोडण्या प्रत्येकाला स्वतःचा दर मिळतो. तुमचे बिल <em>तुमच्या</em> श्रेणी व वापर स्लॅबचा दर लावते.</td></tr>
            <tr><td><strong>तो दर महिन्याला बदलतो</strong></td><td>या महिन्याच्या FPPCA ची मागील महिन्याशी तुलना अन्यथा सारख्याच वापरावर अनेक "बिल का वाढले?" प्रकरणे समजावते. दर स्वतः बिलावर FPPCA ओळीशेजारी छापलेला असतो.</td></tr>
          </tbody>
        </table></div>
        <p>दर मासिक सुधारला जात असल्याने, कधीही मागील महिन्याचा आकडा गृहीत धरू नका — नेहमी चालू बिलावरून
        किंवा बिलिंग महिन्यासाठी MSEDCL च्या प्रकाशित FPPCA अनुसूचीवरून दर वाचा.</p>
      </section>

      <section class="seo-section">
        <h2>FPPCA ओळ स्वतः पुन्हा मोजणे</h2>
        <p>ही तपासणी एका मिनिटापेक्षा कमी वेळात होते:</p>
        <ol>
          <li>महिन्याची तुमची <strong>बिल केलेली युनिटे</strong> शोधा (मीटर भाग चालू − मागील रीडिंग × MF
          दाखवतो).</li>
          <li>बिलावर छापलेला <strong>FPPCA दर</strong> शोधा (₹/युनिट, कधीकधी पैशांत — 65 पैसे = ₹0.65).</li>
          <li>गुणा: <strong>युनिटे × दर</strong>. निकाल FPPCA रकमेशी गोलाईच्या एका पैशापर्यंत जुळावा.</li>
        </ol>
        <p>स्लॅब-दराच्या श्रेणींसाठी, MSEDCL प्रत्येक स्लॅबमधील युनिटांना स्लॅब-निहाय FPPCA लावते — जसे
        ऊर्जा आकार स्लॅबमध्ये असतात. आमचे <a href="/?state=Maharashtra#calculator">महाराष्ट्र बिल
        कॅल्क्युलेटर</a> हा अधिभार त्याच प्रति-युनिट तर्काने लावते: तुमची युनिटे व बिलावरील FPPCA दर टाका,
        आणि संपूर्ण एकूण तुलना करा. सध्याचे MSEDCL मूळ दर <a href="/mr/tariffs/maharashtra/">महाराष्ट्र
        टॅरिफ पेजांवर</a> आहेत.</p>
        <p>एक क्रम नियम जाणून घेण्यासारखा: <strong>वीज शुल्क FPPCA जोडल्यानंतर मोजले जाते</strong>. म्हणून
        जास्त FPPCA असलेला महिना शुल्क ओळही वर ढकलतो — दोन्ही ओळी एकत्र हलतात, जे सामान्य आहे,
        दुहेरी-आकार नव्हे.</p>
      </section>

      <section class="seo-section">
        <h2>FPPCA ओळ चुकीची वाटल्यास</h2>
        <ul>
          <li><strong>गुणाकार जुळत नाही.</strong> दर पैशांत छापलेला असून तुम्ही रुपयांत गुणला का, आणि बिल
          कालावधी दोन महिने व्यापतो का (युनिटे दोन वेगळ्या मासिक दरांत विभागली असू शकतात) ते तपासा.</li>
          <li><strong>दर असामान्यपणे जास्त वाटतो.</strong> तो त्या महिन्याच्या व तुमच्या श्रेणीच्या MSEDCL
          प्रकाशित FPPCA अनुसूचीशी तुलना करा. निवासी जोडणीला लावलेला व्यावसायिक दर ही श्रेणी चूक असून
          विवादास पात्र आहे.</li>
          <li><strong>अंदाजित बिलावर FPPCA आला.</strong> महिना अंदाजित रीडिंगवर बिल झाला असेल, तर FPPCA
          अंदाजित युनिटांवरही चढतो — खरी रीडिंग घेतल्यावर तो ऊर्जा आकारासह स्वतः दुरुस्त होतो.</li>
        </ul>
        <p>आकडे तरीही जुळण्यास नकार देत असतील, तर बिल आमच्या मोफत <a href="/bill-review/">तज्ज्ञ बिल
        समीक्षा</a> मध्ये अपलोड करा — FPPCA लावण्यातील चुका समीक्षक शोधतात त्या सर्वात सामान्य गोष्टींपैकी
        एक आहेत.</p>
      </section>`,
    faqsMr: [
      { q: 'MSEDCL वीज बिलावर FPPCA म्हणजे काय?',
        a: 'FPPCA (इंधन व वीज खरेदी खर्च समायोजन) हा एक मासिक ₹-प्रति-युनिट अधिभार आहे जो MSEDCL च्या प्रत्यक्ष वीज-खरेदी खर्चातील बदल ग्राहकांपर्यंत पोहोचवतो. तो जुन्या FAC ओळीची जागा घेतो, दर महिन्याला श्रेणी व स्लॅबनुसार ठरतो, आणि धन (आकार) किंवा ऋण (क्रेडिट) असू शकतो.' },
      { q: 'माझ्या MSEDCL बिलावरील FPPCA आकार कसा मोजावा?',
        a: 'महिन्याची तुमची बिल केलेली युनिटे बिलावर छापलेल्या FPPCA दराने गुणा (पैसे वि. रुपये लक्षात ठेवा). स्लॅब-दराच्या श्रेणींसाठी दर स्लॅब-निहाय लागतो, जसे ऊर्जा आकार स्लॅबमध्ये असतात. गुणाकार FPPCA ओळीशी गोलाईपर्यंत जुळावा.' },
      { q: 'MSEDCL FPPCA दर महिन्याला का बदलतो?',
        a: 'हे समायोजन MERC टॅरिफमध्ये मंजूर वीज-खरेदी खर्च आणि MSEDCL ने प्रत्यक्षात दिलेल्या रकमेतील मासिक तफावतीचा मागोवा घेते, सामान्यतः सुमारे दोन महिन्यांच्या विलंबाने. म्हणून कोळसा व बाजार-वीज किमतीतील हालचाली काही महिन्यांनी बिलांवर दिसतात.' },
      { q: 'MSEDCL बिलावर FPPCA ऋण असू शकतो का?',
        a: 'होय. ज्या महिन्यांत प्रत्यक्ष वीज-खरेदी खर्च टॅरिफमध्ये गृहीत धरलेल्या पातळीपेक्षा कमी असतो, त्या महिन्यांत समायोजन ऋण असते आणि तुमचे बिल कमी करणाऱ्या प्रति-युनिट क्रेडिटच्या रूपात दिसते.' },
      { q: 'महाराष्ट्रात FPPCA वर वीज शुल्क लागते का?',
        a: 'होय — वीज शुल्क FPPCA जोडल्यानंतर मोजले जाते, म्हणून शुल्क आधारात इंधन समायोजन समाविष्ट असते. जास्त-FPPCA असलेला महिना शुल्क ओळ प्रमाणात वाढवतो; तो विहित क्रम आहे, दुहेरी आकार नव्हे.' },
    ],
  },

  {
    slug: 'uppcl-smart-meter-readings-explained',
    published: "2026-03-07",
    states: ['Uttar Pradesh'],
    title: 'Understanding UPPCL Smart Meter Readings',
    metaTitle: 'UPPCL Smart Meter Readings Explained — Display Codes, Billing Period, Balance',
    description: 'How UPPCL smart meters record and report readings: what the display cycles through, how the billing period differs from ordinary meters, where the daily readings go, how prepaid balance is deducted, and how to verify billed units yourself.',
    minutes: 6,
    intro: `A UPPCL smart meter records your consumption every 15–30 minutes and reports it over the
      mobile network, so nobody visits to take a reading. Your billed units come from the remotely
      collected data: for smart-meter (MRI) consumers the billing period runs from the
      <strong>first to the last day of the previous month</strong>, unlike ordinary meters which are
      billed reading-date to reading-date. This guide decodes the meter's display, the reading data
      behind your bill, and the checks that catch billing errors early.`,
    sections: `
      <section class="seo-section">
        <h2>What the meter display cycles through</h2>
        <p>The LCD auto-cycles through a fixed sequence (a button press steps through it faster).
        The screens that matter:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Display</th><th>What it shows</th></tr></thead>
          <tbody>
            <tr><td><strong>kWh (cumulative)</strong></td><td>The lifetime units counter — the same
            number a human reader would note. Billed units for any period = closing kWh − opening
            kWh.</td></tr>
            <tr><td><strong>kW / MD</strong></td><td>Present load, and the maximum demand recorded
            this cycle. If MD keeps landing above your sanctioned load, expect a load-regularisation
            notice — see our <a href="/guides/uppcl-sanctioned-load-increased/">sanctioned-load
            guide</a>.</td></tr>
            <tr><td><strong>Balance (prepaid)</strong></td><td>Remaining rupee balance on prepaid
            connections. The meter deducts charges from it daily rather than monthly.</td></tr>
            <tr><td><strong>Relay / status</strong></td><td>Whether supply is connected, and error
            codes (tamper, cover-open, comms failure). A comms-failure meter is billed on stored
            data once the connection recovers — not estimated.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>How the billing period differs from an ordinary meter</h2>
        <p>This is the single most misunderstood thing about UPPCL smart-meter bills, and it is
        printed in the bill's own notes: for ordinary consumers the billing period runs from the
        previous reading date to the current reading date, but for <strong>smart meter / MRI
        consumers it is the first day to the last day of the previous month</strong> — a clean
        calendar month.</p>
        <ul>
          <li>Your first smart-meter bill after installation can therefore cover an odd-length
          period while the cycle aligns to calendar months — a one-time artefact, not an error.</li>
          <li>Because every period is ~30 days, slab proration disputes ("my bill period was 45 days
          and pushed me into higher slabs") largely disappear after the switch.</li>
          <li>The bill's <strong>Net Billed Units</strong> line is the calendar month's import minus
          any solar export — the number to verify against the meter's kWh counter.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>Where to see your readings — and how to verify billed units</h2>
        <ol>
          <li><strong>On the meter:</strong> note the cumulative kWh on the last day of the month
          (or any two dates). The difference is your consumption between those dates — no MF
          arithmetic on ordinary domestic smart meters (MF = 1).</li>
          <li><strong>On the app/portal:</strong> UPPCL's consumer app and portal expose daily and
          even interval-level consumption from the same remote reads that produce the bill. If the
          app's month total and your bill's Net Billed Units differ materially, raise it — they come
          from one data source and should match.</li>
          <li><strong>Against the bill:</strong> multiply nothing, assume nothing: compare the
          bill's Net Billed Units to your own two-reading subtraction, then feed the units into our
          <a href="/?state=Uttar%20Pradesh#calculator">UPPCL bill calculator</a> — it applies the
          same slab, fixed-charge, FPPA and duty logic as the tariff order, verified to the paisa
          against real UPPCL bills.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>Prepaid mode: how the daily deduction works</h2>
        <p>On prepaid connections the meter converts each day's consumption to rupees and deducts it
        from your balance daily, along with a daily slice of the fixed charge. Practical
        implications:</p>
        <ul>
          <li>A "fast-draining" balance usually means a genuinely heavy-usage week — check the daily
          kWh trend in the app before suspecting the meter. Our
          <a href="/guides/smart-meter-running-fast/">smart-meter-running-fast guide</a> shows a
          structured way to test it.</li>
          <li>Balance low/exhausted triggers SMS warnings and, after the grace window, remote
          disconnection — timings and reconnection steps are in our
          <a href="/guides/smart-meter-prepaid-disconnection/">prepaid disconnection guide</a>.</li>
          <li>Recharges apply to the meter remotely; if one fails or doesn't reflect, the
          <a href="/guides/smart-meter-recharge-failed/">recharge-failed guide</a> covers the fix
          sequence.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'How is a UPPCL smart meter read for billing?',
        a: 'The meter records consumption every 15–30 minutes and reports it over the mobile network. Billed units for the month are computed from the remotely collected data — no meter reader visits, and the billing period is the first to last day of the previous calendar month.' },
      { q: 'Why does my UPPCL smart meter bill period differ from my old bills?',
        a: 'Ordinary meters are billed from reading date to reading date; smart-meter (MRI) consumers are billed on clean calendar months — the first to the last day of the previous month. The first bill after installation may cover an odd-length period while the cycle aligns.' },
      { q: 'How do I check my smart meter reading matches my UPPCL bill?',
        a: 'Note the cumulative kWh display at the start and end of the month — the difference is your consumption (MF is 1 on domestic smart meters). Compare it with the bill\'s Net Billed Units and with the daily data in the UPPCL app; all three come from the same counter and should agree.' },
      { q: 'What does Net Billed Units mean on a UPPCL smart meter bill?',
        a: 'It is the calendar month\'s imported units minus any solar export units — the figure on which energy charges, FPPA and duty are computed. Verify it against the meter\'s kWh counter difference for the month.' },
    ],

    titleHi: 'UPPCL स्मार्ट मीटर रीडिंग को समझें',
    metaTitleHi: 'UPPCL स्मार्ट मीटर रीडिंग की पूरी जानकारी — डिस्प्ले कोड, बिलिंग अवधि, बैलेंस',
    descriptionHi: 'UPPCL स्मार्ट मीटर रीडिंग कैसे दर्ज और रिपोर्ट करता है: डिस्प्ले पर क्या-क्या दिखता है, बिलिंग अवधि साधारण मीटर से कैसे अलग है, दैनिक रीडिंग कहाँ देखें, प्रीपेड बैलेंस कैसे कटता है, और बिल की यूनिटें खुद कैसे सत्यापित करें।',
    introHi: `UPPCL का स्मार्ट मीटर आपकी खपत हर 15–30 मिनट में दर्ज करता है और मोबाइल नेटवर्क से भेजता है,
      इसलिए रीडिंग लेने कोई नहीं आता। आपकी बिल की यूनिटें इसी रिमोट डेटा से बनती हैं: स्मार्ट मीटर (MRI)
      उपभोक्ताओं की बिलिंग अवधि <strong>पिछले महीने की पहली से आख़िरी तारीख़</strong> होती है, जबकि साधारण
      मीटर रीडिंग-तारीख़ से रीडिंग-तारीख़ तक बिल होते हैं। यह गाइड मीटर का डिस्प्ले, बिल के पीछे का रीडिंग
      डेटा और वे जाँचें समझाती है जो बिलिंग गलतियाँ जल्दी पकड़ लेती हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>मीटर डिस्प्ले पर क्या-क्या दिखता है</h2>
        <p>LCD एक तय क्रम में स्क्रीनें बदलता रहता है (बटन दबाकर तेज़ी से आगे बढ़ा सकते हैं)। काम की
        स्क्रीनें ये हैं:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>डिस्प्ले</th><th>क्या दिखाता है</th></tr></thead>
          <tbody>
            <tr><td><strong>kWh (संचयी)</strong></td><td>यूनिटों का लाइफ़टाइम काउंटर — वही संख्या जो
            मीटर रीडर नोट करता। किसी भी अवधि की बिल यूनिटें = अंतिम kWh − प्रारंभिक kWh।</td></tr>
            <tr><td><strong>kW / MD</strong></td><td>वर्तमान लोड, और इस चक्र की अधिकतम मांग। MD बार-बार
            स्वीकृत भार से ऊपर जाए तो लोड-नियमितीकरण नोटिस आ सकता है — हमारी
            <a href="/hi/guides/uppcl-sanctioned-load-increased/">स्वीकृत भार गाइड</a> देखें।</td></tr>
            <tr><td><strong>बैलेंस (प्रीपेड)</strong></td><td>प्रीपेड कनेक्शन पर बचा हुआ रुपया बैलेंस।
            मीटर शुल्क मासिक नहीं, रोज़ाना काटता है।</td></tr>
            <tr><td><strong>रिले / स्थिति</strong></td><td>आपूर्ति जुड़ी है या नहीं, और त्रुटि कोड (छेड़छाड़,
            कवर-ओपन, संचार विफलता)। संचार टूटे मीटर का बिल कनेक्शन लौटते ही संग्रहीत डेटा से बनता है —
            अनुमान से नहीं।</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>बिलिंग अवधि साधारण मीटर से कैसे अलग है</h2>
        <p>UPPCL स्मार्ट-मीटर बिलों की सबसे ग़लत समझी जाने वाली बात यही है, और यह बिल के नोट्स में ही छपी
        होती है: साधारण उपभोक्ताओं की बिलिंग अवधि पिछली रीडिंग-तारीख़ से वर्तमान रीडिंग-तारीख़ तक चलती है,
        जबकि <strong>स्मार्ट मीटर / MRI उपभोक्ताओं की अवधि पिछले महीने की पहली से आख़िरी तारीख़</strong> —
        यानी साफ़ कैलेंडर महीना — होती है।</p>
        <ul>
          <li>इंस्टॉलेशन के बाद पहला स्मार्ट-मीटर बिल अजीब लंबाई की अवधि का हो सकता है, जब तक चक्र कैलेंडर
          महीनों से नहीं जुड़ जाता — यह एक बार की बात है, गलती नहीं।</li>
          <li>हर अवधि ~30 दिन की होने से "मेरी अवधि 45 दिन थी और ऊँचे स्लैब में चली गई" जैसे विवाद लगभग
          ख़त्म हो जाते हैं।</li>
          <li>बिल की <strong>Net Billed Units</strong> लाइन = कैलेंडर महीने का आयात − सोलर निर्यात (यदि
          हो) — यही संख्या मीटर के kWh काउंटर से मिलानी है।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>रीडिंग कहाँ देखें — और बिल की यूनिटें कैसे सत्यापित करें</h2>
        <ol>
          <li><strong>मीटर पर:</strong> महीने की आख़िरी तारीख़ (या किन्हीं दो तारीख़ों) पर संचयी kWh नोट
          करें। दोनों का अंतर ही उस बीच की खपत है — घरेलू स्मार्ट मीटरों पर कोई MF गणित नहीं (MF = 1)।</li>
          <li><strong>ऐप/पोर्टल पर:</strong> UPPCL का उपभोक्ता ऐप और पोर्टल वही रिमोट रीडिंग-डेटा दैनिक
          स्तर तक दिखाते हैं जिससे बिल बनता है। ऐप का मासिक योग और बिल की Net Billed Units काफ़ी अलग हों
          तो शिकायत करें — दोनों एक ही स्रोत से आते हैं।</li>
          <li><strong>बिल से:</strong> बिल की Net Billed Units की तुलना अपनी दो-रीडिंग घटाव से करें, फिर
          यूनिटें हमारे <a href="/?state=Uttar%20Pradesh#calculator">UPPCL बिल कैलकुलेटर</a> में डालें —
          यह टैरिफ आदेश जैसा ही स्लैब, फिक्स्ड-चार्ज, FPPA और शुल्क तर्क लगाता है, और असली UPPCL बिलों से
          पैसे-पैसे तक सत्यापित है।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>प्रीपेड मोड: दैनिक कटौती कैसे होती है</h2>
        <p>प्रीपेड कनेक्शन पर मीटर हर दिन की खपत को रुपयों में बदलकर बैलेंस से काटता है, साथ में फिक्स्ड
        चार्ज का दैनिक हिस्सा भी। व्यावहारिक बातें:</p>
        <ul>
          <li>"तेज़ी से घटता" बैलेंस अक्सर सचमुच भारी-खपत वाला हफ़्ता होता है — मीटर पर शक करने से पहले ऐप
          में दैनिक kWh का रुझान देखें। संरचित जाँच हमारी
          <a href="/hi/guides/smart-meter-running-fast/">स्मार्ट-मीटर-तेज़-चलने की गाइड</a> में है।</li>
          <li>बैलेंस कम/ख़त्म होने पर SMS चेतावनियाँ आती हैं और ग्रेस अवधि के बाद रिमोट डिस्कनेक्शन —
          समय और पुनर्संयोजन के चरण हमारी
          <a href="/hi/guides/smart-meter-prepaid-disconnection/">प्रीपेड डिस्कनेक्शन गाइड</a> में हैं।</li>
          <li>रिचार्ज मीटर पर रिमोट तरीक़े से लगते हैं; कोई रिचार्ज फेल हो या दिखे नहीं, तो
          <a href="/hi/guides/smart-meter-recharge-failed/">रिचार्ज-विफल गाइड</a> में समाधान-क्रम है।</li>
        </ul>
      </section>`,
    faqsHi: [
      { q: 'बिलिंग के लिए UPPCL स्मार्ट मीटर की रीडिंग कैसे ली जाती है?',
        a: 'मीटर हर 15–30 मिनट में खपत दर्ज करता है और मोबाइल नेटवर्क से भेजता है। महीने की बिल यूनिटें इसी रिमोट डेटा से बनती हैं — कोई मीटर रीडर नहीं आता, और बिलिंग अवधि पिछले कैलेंडर महीने की पहली से आख़िरी तारीख़ होती है।' },
      { q: 'मेरे UPPCL स्मार्ट मीटर बिल की अवधि पुराने बिलों से अलग क्यों है?',
        a: 'साधारण मीटर रीडिंग-तारीख़ से रीडिंग-तारीख़ तक बिल होते हैं; स्मार्ट मीटर (MRI) उपभोक्ता साफ़ कैलेंडर महीनों पर — पिछले महीने की पहली से आख़िरी तारीख़ तक। इंस्टॉलेशन के बाद पहला बिल चक्र जुड़ने तक अजीब लंबाई का हो सकता है।' },
      { q: 'कैसे जाँचें कि स्मार्ट मीटर की रीडिंग बिल से मेल खाती है?',
        a: 'महीने की शुरुआत और अंत में संचयी kWh डिस्प्ले नोट करें — अंतर ही आपकी खपत है (घरेलू स्मार्ट मीटरों पर MF = 1)। इसे बिल की Net Billed Units और UPPCL ऐप के दैनिक डेटा से मिलाएँ; तीनों एक ही काउंटर से आते हैं और मेल खाने चाहिए।' },
      { q: 'UPPCL स्मार्ट मीटर बिल पर Net Billed Units का क्या मतलब है?',
        a: 'यह कैलेंडर महीने की आयातित यूनिटें घटा सोलर निर्यात यूनिटें (यदि हों) है — इसी पर ऊर्जा शुल्क, FPPA और बिजली शुल्क की गणना होती है। इसे महीने भर के kWh काउंटर के अंतर से सत्यापित करें।' },
    ],

    titleMr: 'UPPCL स्मार्ट मीटर रीडिंग समजून घ्या',
    metaTitleMr: 'UPPCL स्मार्ट मीटर रीडिंग समजावली — डिस्प्ले कोड, बिलिंग अवधी, बॅलन्स',
    descriptionMr: 'UPPCL स्मार्ट मीटर रीडिंग कशी नोंदवते व कळवते: डिस्प्लेवर काय दिसते, बिलिंग अवधी साध्या मीटरहून कशी वेगळी आहे, रोजची रीडिंग कुठे पहावी, प्रीपेड बॅलन्स कसा कापला जातो, आणि बिलाची युनिटे स्वतः कशी पडताळावी.',
    introMr: `UPPCL चे स्मार्ट मीटर तुमचा वापर दर 15–30 मिनिटांनी नोंदवते आणि मोबाइल नेटवर्कवरून कळवते, म्हणून
      रीडिंग घ्यायला कोणी येत नाही. तुमच्या बिलाची युनिटे याच रिमोट डेटामधून बनतात: स्मार्ट मीटर (MRI)
      ग्राहकांची बिलिंग अवधी <strong>मागील महिन्याच्या पहिल्या ते शेवटच्या दिवसापर्यंत</strong> चालते, तर
      साधी मीटरे रीडिंग-तारीख ते रीडिंग-तारीख अशी बिल होतात. ही मार्गदर्शिका मीटरचा डिस्प्ले, बिलामागील रीडिंग
      डेटा आणि बिलिंग चुका लवकर पकडणाऱ्या तपासण्या समजावते.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>मीटर डिस्प्लेवर काय दिसते</h2>
        <p>LCD एका ठराविक क्रमाने स्क्रीन बदलत राहते (बटण दाबून वेगाने पुढे जाता येते). महत्त्वाच्या
        स्क्रीन:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>डिस्प्ले</th><th>काय दाखवते</th></tr></thead>
          <tbody>
            <tr><td><strong>kWh (एकत्रित)</strong></td><td>युनिटांचा आयुष्यभराचा काउंटर — तीच संख्या जी मीटर रीडर नोंदवेल. कोणत्याही अवधीची बिल युनिटे = अंतिम kWh − प्रारंभिक kWh.</td></tr>
            <tr><td><strong>kW / MD</strong></td><td>सध्याचा भार, आणि या चक्राची कमाल मागणी. MD वारंवार तुमच्या मंजूर भारापेक्षा जास्त जात असेल तर भार-नियमितीकरण नोटीस येऊ शकते — पहा आमची <a href="/mr/guides/uppcl-sanctioned-load-increased/">मंजूर भार मार्गदर्शिका</a>.</td></tr>
            <tr><td><strong>बॅलन्स (प्रीपेड)</strong></td><td>प्रीपेड जोडण्यांवरील उरलेला रुपया बॅलन्स. मीटर शुल्क मासिक नव्हे, रोज कापते.</td></tr>
            <tr><td><strong>रिले / स्थिती</strong></td><td>पुरवठा जोडलेला आहे की नाही, आणि त्रुटी कोड (छेडछाड, कव्हर-ओपन, संचार अपयश). संचार तुटलेल्या मीटरचे बिल जोडणी परत आल्यावर साठवलेल्या डेटावरून बनते — अंदाजाने नव्हे.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>बिलिंग अवधी साध्या मीटरहून कशी वेगळी आहे</h2>
        <p>UPPCL स्मार्ट-मीटर बिलांविषयी सर्वात जास्त गैरसमज असलेली गोष्ट हीच आहे, आणि ती बिलाच्या स्वतःच्या
        टिपांत छापलेली असते: साध्या ग्राहकांची बिलिंग अवधी मागील रीडिंग-तारीख ते चालू रीडिंग-तारीख चालते,
        पण <strong>स्मार्ट मीटर / MRI ग्राहकांची ती मागील महिन्याचा पहिला ते शेवटचा दिवस</strong> — म्हणजे
        स्वच्छ कॅलेंडर महिना — असते.</p>
        <ul>
          <li>बसवल्यानंतरचे तुमचे पहिले स्मार्ट-मीटर बिल म्हणूनच विचित्र लांबीच्या अवधीचे असू शकते, जोवर
          चक्र कॅलेंडर महिन्यांशी जुळते — ही एकवेळची गोष्ट आहे, चूक नाही.</li>
          <li>प्रत्येक अवधी ~30 दिवसांची असल्याने "माझी अवधी 45 दिवस होती आणि उच्च स्लॅबमध्ये ढकलले"
          सारखे स्लॅब प्रोरेशन वाद बदलानंतर बहुतांशी नाहीसे होतात.</li>
          <li>बिलाची <strong>Net Billed Units</strong> ओळ = कॅलेंडर महिन्याचा आयात − सोलर निर्यात
          (असल्यास) — हीच संख्या मीटरच्या kWh काउंटरशी पडताळायची.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>तुमची रीडिंग कुठे पहावी — आणि बिल युनिटे कशी पडताळावी</h2>
        <ol>
          <li><strong>मीटरवर:</strong> महिन्याच्या शेवटच्या दिवशी (किंवा कोणत्याही दोन तारखांना) एकत्रित
          kWh नोंदवा. दोहोंतील फरकच त्या तारखांमधील तुमचा वापर आहे — घरगुती स्मार्ट मीटरांवर कोणतेही MF
          गणित नाही (MF = 1).</li>
          <li><strong>अॅप/पोर्टलवर:</strong> UPPCL चे ग्राहक अॅप व पोर्टल तेच रिमोट रीडिंग-डेटा रोजच्या व
          अगदी अंतराल-पातळीच्या वापरापर्यंत दाखवतात जो बिल तयार करतो. अॅपचा मासिक एकूण व बिलाची Net Billed
          Units लक्षणीय वेगळी असतील तर तक्रार करा — दोन्ही एकाच स्रोतातून येतात आणि जुळायला हवीत.</li>
          <li><strong>बिलाशी:</strong> काहीही गुणू नका, काहीही गृहीत धरू नका: बिलाची Net Billed Units
          तुमच्या स्वतःच्या दोन-रीडिंग वजाबाकीशी तुलना करा, मग युनिटे आमच्या <a href="/?state=Uttar%20Pradesh#calculator">UPPCL
          बिल कॅल्क्युलेटर</a> मध्ये टाका — ते टॅरिफ आदेशाप्रमाणेच स्लॅब, स्थिर-आकार, FPPA आणि शुल्क तर्क
          लावते, खऱ्या UPPCL बिलांशी पैशापैशापर्यंत पडताळलेले.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>प्रीपेड मोड: रोजची कपात कशी होते</h2>
        <p>प्रीपेड जोडण्यांवर मीटर प्रत्येक दिवसाचा वापर रुपयांत रूपांतरित करून रोज बॅलन्समधून कापते, सोबत
        स्थिर आकाराचा रोजचा भागही. व्यावहारिक बाबी:</p>
        <ul>
          <li>"वेगाने आटणारा" बॅलन्स सहसा खरोखर भारी-वापराचा आठवडा असतो — मीटरवर संशय घेण्यापूर्वी अॅपमधील
          रोजचा kWh कल पहा. संरचित तपासणी आमच्या <a href="/mr/guides/smart-meter-running-fast/">स्मार्ट-मीटर-वेगात-चालणे
          मार्गदर्शिकेत</a> आहे.</li>
          <li>बॅलन्स कमी/संपल्यास SMS इशारे येतात आणि ग्रेस अवधीनंतर रिमोट डिस्कनेक्शन — वेळा व पुनर्जोडणीचे
          टप्पे आमच्या <a href="/mr/guides/smart-meter-prepaid-disconnection/">प्रीपेड डिस्कनेक्शन
          मार्गदर्शिकेत</a> आहेत.</li>
          <li>रिचार्ज मीटरवर दुरून लागतात; एखादा अयशस्वी झाला किंवा दिसला नाही, तर
          <a href="/mr/guides/smart-meter-recharge-failed/">रिचार्ज-अयशस्वी मार्गदर्शिकेत</a> उपाय-क्रम आहे.</li>
        </ul>
      </section>`,
    faqsMr: [
      { q: 'बिलिंगसाठी UPPCL स्मार्ट मीटरची रीडिंग कशी घेतली जाते?',
        a: 'मीटर दर 15–30 मिनिटांनी वापर नोंदवते आणि मोबाइल नेटवर्कवरून कळवते. महिन्याची बिल युनिटे याच रिमोट डेटामधून बनतात — कोणी मीटर रीडर येत नाही, आणि बिलिंग अवधी मागील कॅलेंडर महिन्याचा पहिला ते शेवटचा दिवस असते.' },
      { q: 'माझ्या UPPCL स्मार्ट मीटर बिलाची अवधी जुन्या बिलांहून वेगळी का आहे?',
        a: 'साधी मीटरे रीडिंग-तारीख ते रीडिंग-तारीख बिल होतात; स्मार्ट मीटर (MRI) ग्राहक स्वच्छ कॅलेंडर महिन्यांवर — मागील महिन्याचा पहिला ते शेवटचा दिवस. बसवल्यानंतरचे पहिले बिल चक्र जुळेपर्यंत विचित्र लांबीचे असू शकते.' },
      { q: 'स्मार्ट मीटरची रीडिंग बिलाशी जुळते का हे कसे तपासावे?',
        a: 'महिन्याच्या सुरुवातीला व शेवटी एकत्रित kWh डिस्प्ले नोंदवा — फरकच तुमचा वापर आहे (घरगुती स्मार्ट मीटरांवर MF = 1). तो बिलाच्या Net Billed Units व UPPCL अॅपमधील रोजच्या डेटाशी जुळवा; तिन्ही एकाच काउंटरमधून येतात आणि जुळायला हवेत.' },
      { q: 'UPPCL स्मार्ट मीटर बिलावर Net Billed Units म्हणजे काय?',
        a: 'ती कॅलेंडर महिन्याची आयात केलेली युनिटे वजा सोलर निर्यात युनिटे (असल्यास) आहे — याच्यावरच ऊर्जा शुल्क, FPPA आणि वीज शुल्क मोजले जाते. ती महिनाभराच्या kWh काउंटर फरकाशी पडताळा.' },
    ],
  },

  {
    slug: 'what-is-a-unit-of-electricity',
    published: "2026-03-19",
    title: 'What Is a Unit of Electricity? kWh Explained with Appliance Math',
    metaTitle: 'What Is a Unit of Electricity (kWh)? — Appliance Consumption Math Explained',
    description: 'One unit of electricity = 1 kilowatt-hour (kWh): a 1,000-watt appliance running for one hour. How your meter counts units, how to estimate any appliance\'s monthly consumption, and why "units" drive every line of your bill.',
    minutes: 5,
    intro: `One <strong>unit</strong> of electricity is one <strong>kilowatt-hour (kWh)</strong> —
      the energy a 1,000-watt appliance consumes in one hour. A 500 W appliance takes two hours to
      use a unit; a 2,000 W geyser uses a unit in 30 minutes. Every charge on your electricity bill
      is ultimately driven by how many of these units your meter counted, so appliance-level unit
      math is the fastest way to understand — and predict — your bill.`,
    sections: `
      <section class="seo-section">
        <h2>The formula, and worked examples</h2>
        <p><strong>Units (kWh) = power rating (watts) × hours used ÷ 1,000.</strong></p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Appliance</th><th>Typical rating</th><th>Daily use</th><th>Units/month (≈)</th></tr></thead>
          <tbody>
            <tr><td>Ceiling fan</td><td>75 W</td><td>12 h</td><td>27</td></tr>
            <tr><td>LED TV (43")</td><td>80 W</td><td>5 h</td><td>12</td></tr>
            <tr><td>Refrigerator (250 L)</td><td>~150 W compressor, cycling</td><td>24 h plugged</td><td>30–45</td></tr>
            <tr><td>1.5-ton inverter AC</td><td>1,200–1,800 W varying</td><td>8 h</td><td>250–350</td></tr>
            <tr><td>Geyser (storage)</td><td>2,000 W</td><td>45 min</td><td>45</td></tr>
            <tr><td>Washing machine</td><td>500 W (no heater)</td><td>1 h × 15 days</td><td>7–8</td></tr>
          </tbody>
        </table></div>
        <p>Two habits make these estimates accurate: use the <em>actual</em> nameplate wattage (on a
        sticker near the plug or in the manual), and remember that thermostat-driven appliances
        (fridge, AC, geyser) cycle on and off — their effective consumption is well below rating ×
        hours, which is why the AC and fridge rows above are ranges. To model a whole home, our
        <a href="/usage/">usage estimator</a> does this appliance-by-appliance.</p>
      </section>

      <section class="seo-section">
        <h2>How your meter counts units</h2>
        <ul>
          <li>The meter accumulates kWh continuously on a lifetime counter — it never resets. Your
          billed consumption is simply <strong>current reading − previous reading</strong>.</li>
          <li>Where a current transformer steps the load down for the meter (large connections), the
          difference is multiplied by an <strong>MF</strong> (multiplying factor). Domestic meters
          almost always have MF = 1.</li>
          <li>Some commercial and industrial supplies are billed in <strong>kVAh</strong> (apparent
          energy) instead of kWh — kVAh = kWh ÷ power factor, so a poor power factor directly
          inflates billed units. See our <a href="/guides/tod-billing-explained/">TOD and kVAh
          billing guide</a>.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>Why units matter more than anything else on the bill</h2>
        <p>Almost every line of an Indian electricity bill scales with units:</p>
        <ol>
          <li><strong>Energy charge</strong> — units priced through your state's slab schedule.
          Because slabs step up, unit #350 can cost nearly twice what unit #50 costs. Slab rates for
          every DISCOM are on our <a href="/tariffs/">tariff pages</a>.</li>
          <li><strong>Fuel surcharge (FPPA/FPPCA)</strong> — levied per unit or as a percentage of
          the energy charge, either way tracking units.</li>
          <li><strong>Electricity duty</strong> — a percentage on top of the above, so it inherits
          the unit-driven total.</li>
        </ol>
        <p>Only the fixed charge (₹ per kW of sanctioned load) ignores units. That's why the same
        50-unit reduction saves more in a high-slab month than a low one — and why estimating units
        appliance-by-appliance, then checking them in the
        <a href="/#calculator">bill calculator</a>, predicts your bill within a few percent.</p>
      </section>`,
    faqs: [
      { q: 'How much is 1 unit of electricity?',
        a: 'One unit equals one kilowatt-hour (kWh): a 1,000-watt appliance running for one hour. Its price depends on your state, category and consumption slab — the same unit can cost a few rupees in a low slab and roughly double that in a high slab.' },
      { q: 'How do I calculate units consumed by an appliance?',
        a: 'Units = watts × hours ÷ 1,000. A 75 W fan running 12 hours a day uses 0.9 units daily, about 27 a month. For thermostat-driven appliances like ACs, fridges and geysers, effective consumption is lower than rating × hours because the compressor or element cycles on and off.' },
      { q: 'How many units does a 1.5-ton AC use per day?',
        a: 'A 1.5-ton inverter AC typically consumes roughly 1 to 1.5 units per hour depending on the set temperature, insulation and outside heat — around 8 to 12 units for an 8-hour night. Older non-inverter units run higher.' },
      { q: 'What is the difference between kWh and kVAh on a bill?',
        a: 'kWh measures active energy actually converted into work; kVAh measures apparent energy, which equals kWh divided by power factor. Some commercial and industrial tariffs bill on kVAh, so a poor power factor directly increases billed units.' },
    ],

    titleMr: 'विजेचे एक युनिट म्हणजे काय? उपकरण गणितासह kWh समजून घ्या',
    metaTitleMr: 'विजेचे एक युनिट (kWh) म्हणजे काय? — उपकरण वापर गणित समजावले',
    descriptionMr: 'विजेचे एक युनिट = 1 किलोवॅट-तास (kWh): 1,000-वॅटचे उपकरण एक तास चालणे. तुमचे मीटर युनिटे कशी मोजते, कोणत्याही उपकरणाचा मासिक वापर कसा अंदाजावा, आणि "युनिटे" तुमच्या बिलाची प्रत्येक ओळ का चालवतात.',
    introMr: `विजेचे एक <strong>युनिट</strong> म्हणजे एक <strong>किलोवॅट-तास (kWh)</strong> — 1,000-वॅटचे
      उपकरण एका तासात वापरणारी ऊर्जा. 500 W उपकरणाला एक युनिट वापरायला दोन तास लागतात; 2,000 W गिझर 30
      मिनिटांत एक युनिट वापरतो. तुमच्या वीज बिलावरील प्रत्येक आकार शेवटी तुमच्या मीटरने किती युनिटे मोजली
      यावर चालतो, म्हणून उपकरण-स्तरावरील युनिट गणित हा तुमचे बिल समजण्याचा — आणि अंदाजण्याचा — सर्वात जलद
      मार्ग आहे.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>सूत्र, आणि सोडवलेली उदाहरणे</h2>
        <p><strong>युनिटे (kWh) = पॉवर रेटिंग (वॅट) × वापरलेले तास ÷ 1,000.</strong></p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>उपकरण</th><th>सामान्य रेटिंग</th><th>दैनिक वापर</th><th>युनिट/महिना (≈)</th></tr></thead>
          <tbody>
            <tr><td>सीलिंग फॅन</td><td>75 W</td><td>12 तास</td><td>27</td></tr>
            <tr><td>LED टीव्ही (43")</td><td>80 W</td><td>5 तास</td><td>12</td></tr>
            <tr><td>रेफ्रिजरेटर (250 L)</td><td>~150 W कॉम्प्रेसर, चक्राकार</td><td>24 तास प्लग-इन</td><td>30–45</td></tr>
            <tr><td>1.5-टन इन्व्हर्टर AC</td><td>1,200–1,800 W बदलते</td><td>8 तास</td><td>250–350</td></tr>
            <tr><td>गिझर (स्टोरेज)</td><td>2,000 W</td><td>45 मि</td><td>45</td></tr>
            <tr><td>वॉशिंग मशीन</td><td>500 W (हीटरशिवाय)</td><td>1 तास × 15 दिवस</td><td>7–8</td></tr>
          </tbody>
        </table></div>
        <p>दोन सवयी हे अंदाज अचूक करतात: <em>प्रत्यक्ष</em> नेमप्लेट वॅटेज वापरा (प्लगजवळील स्टिकरवर किंवा
        पुस्तिकेत), आणि लक्षात ठेवा की थर्मोस्टॅट-चालित उपकरणे (फ्रिज, AC, गिझर) चालू-बंद होत राहतात —
        त्यांचा प्रभावी वापर रेटिंग × तास पेक्षा बराच कमी असतो, म्हणूनच वरील AC व फ्रिज ओळी श्रेणी आहेत.
        संपूर्ण घर मॉडेल करण्यासाठी, आमचा <a href="/usage/">वापर अंदाजक</a> हे उपकरण-दर-उपकरण करतो.</p>
      </section>

      <section class="seo-section">
        <h2>तुमचे मीटर युनिटे कशी मोजते</h2>
        <ul>
          <li>मीटर kWh सतत आयुष्यभराच्या काउंटरवर जमा करते — ते कधीही रीसेट होत नाही. तुमचा बिल केलेला
          वापर म्हणजे फक्त <strong>चालू रीडिंग − मागील रीडिंग</strong>.</li>
          <li>जिथे करंट ट्रान्सफॉर्मर मीटरसाठी भार खाली आणतो (मोठ्या जोडण्या), तिथे फरक <strong>MF</strong>
          (मल्टिप्लाइंग फॅक्टर) ने गुणला जातो. घरगुती मीटरचा MF जवळपास नेहमीच 1 असतो.</li>
          <li>काही व्यावसायिक व औद्योगिक पुरवठे kWh ऐवजी <strong>kVAh</strong> (आभासी ऊर्जा) मध्ये बिल
          होतात — kVAh = kWh ÷ पॉवर फॅक्टर, म्हणून खराब पॉवर फॅक्टर थेट बिल केलेली युनिटे वाढवतो. पहा आमचे
          <a href="/mr/guides/tod-billing-explained/">ToD व kVAh बिलिंग मार्गदर्शक</a>.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>बिलावर युनिटे इतर कशाहीपेक्षा जास्त का महत्त्वाची</h2>
        <p>भारतीय वीज बिलाची जवळपास प्रत्येक ओळ युनिटांसह वाढते:</p>
        <ol>
          <li><strong>ऊर्जा आकार</strong> — तुमच्या राज्याच्या स्लॅब अनुसूचीनुसार युनिटांची किंमत. स्लॅब
          वर चढत असल्याने, युनिट #350 ची किंमत युनिट #50 च्या जवळपास दुप्पट असू शकते. प्रत्येक डिस्कॉमचे
          स्लॅब दर आमच्या <a href="/mr/tariffs/states/">टॅरिफ पेजांवर</a> आहेत.</li>
          <li><strong>इंधन अधिभार (FPPA/FPPCA)</strong> — प्रति युनिट किंवा ऊर्जा आकाराच्या टक्केवारीने
          आकारला जातो, दोन्ही प्रकारे युनिटांचा मागोवा घेत.</li>
          <li><strong>वीज शुल्क</strong> — वरील गोष्टींवर एक टक्केवारी, म्हणून तो युनिट-चालित एकूण रक्कम
          वारसाहक्काने घेतो.</li>
        </ol>
        <p>फक्त स्थिर आकार (मंजूर भाराच्या प्रति kW ₹) युनिटांकडे दुर्लक्ष करतो. म्हणूनच तीच 50-युनिट कपात
        कमी-स्लॅब महिन्यापेक्षा उच्च-स्लॅब महिन्यात जास्त बचत करते — आणि म्हणूनच युनिटे उपकरण-दर-उपकरण
        अंदाजून, मग <a href="/#calculator">बिल कॅल्क्युलेटर</a> मध्ये तपासणे, तुमचे बिल काही टक्क्यांच्या
        आत अंदाजते.</p>
      </section>`,
    faqsMr: [
      { q: 'विजेचे 1 युनिट किती असते?',
        a: 'एक युनिट म्हणजे एक किलोवॅट-तास (kWh): 1,000-वॅटचे उपकरण एक तास चालणे. त्याची किंमत तुमचे राज्य, श्रेणी व वापर स्लॅबवर अवलंबून असते — तेच युनिट कमी स्लॅबमध्ये काही रुपये आणि उच्च स्लॅबमध्ये जवळपास दुप्पट किंमतीचे असू शकते.' },
      { q: 'उपकरणाने वापरलेली युनिटे कशी मोजावी?',
        a: 'युनिटे = वॅट × तास ÷ 1,000. दिवसाला 12 तास चालणारा 75 W पंखा रोज 0.9 युनिटे, महिन्याला सुमारे 27 वापरतो. AC, फ्रिज व गिझरसारख्या थर्मोस्टॅट-चालित उपकरणांसाठी, प्रभावी वापर रेटिंग × तास पेक्षा कमी असतो कारण कॉम्प्रेसर किंवा एलिमेंट चालू-बंद होत राहतो.' },
      { q: '1.5-टन AC दिवसाला किती युनिटे वापरतो?',
        a: '1.5-टन इन्व्हर्टर AC सेट तापमान, इन्सुलेशन व बाहेरील उष्णतेनुसार साधारण 1 ते 1.5 युनिटे प्रति तास वापरतो — 8-तासांच्या रात्रीसाठी सुमारे 8 ते 12 युनिटे. जुनी नॉन-इन्व्हर्टर युनिटे जास्त चालतात.' },
      { q: 'बिलावर kWh आणि kVAh मध्ये काय फरक आहे?',
        a: 'kWh प्रत्यक्षात कामात रूपांतरित झालेली सक्रिय ऊर्जा मोजते; kVAh आभासी ऊर्जा मोजते, जी kWh भागिले पॉवर फॅक्टर इतकी असते. काही व्यावसायिक व औद्योगिक टॅरिफ kVAh वर बिल करतात, म्हणून खराब पॉवर फॅक्टर थेट बिल केलेली युनिटे वाढवतो.' },
    ],
  },

  {
    slug: 'power-factor-kvah-billing-explained',
    published: "2026-03-31",
    title: 'Power Factor, kVAh Billing and PF Penalty Explained',
    metaTitle: 'Power Factor & kVAh Billing Explained — Penalties, Incentives, and Who Pays Them',
    description: 'What power factor is, why DISCOMs care about it, how kVAh billing makes a poor PF cost you money automatically, when PF penalties and incentives apply, and how capacitors fix a low power factor.',
    minutes: 6,
    intro: `<strong>Power factor (PF)</strong> is the fraction of the electricity you draw that does
      useful work: PF = kW ÷ kVA, ranging from 0 to 1. Motors, welders and old ballasts draw
      "reactive" current that loads the network without doing work, dragging PF down. DISCOMs
      recover that burden two ways — an explicit <strong>PF penalty</strong> on kWh tariffs, or
      <strong>kVAh billing</strong>, where energy is metered as kWh ÷ PF so a poor power factor
      inflates your billed units automatically. Households are almost never affected; commercial and
      industrial connections routinely are.`,
    sections: `
      <section class="seo-section">
        <h2>Power factor in plain terms</h2>
        <p>Think of a mug of beer: the liquid is <strong>kW</strong> (real power that does work),
        the foam is <strong>kVAR</strong> (reactive power that fills the mug without quenching
        thirst), and the whole mug is <strong>kVA</strong> (apparent power the network must carry).
        PF is liquid ÷ mug:</p>
        <ul>
          <li><strong>PF = 1.0</strong> — purely resistive load (heaters, incandescent bulbs). All
          current does work.</li>
          <li><strong>PF ≈ 0.8</strong> — typical uncorrected motor-heavy load. The network carries
          25% more current than the useful power requires.</li>
          <li><strong>Low PF hurts the grid</strong>, not the appliance: cables, transformers and
          generators are sized by kVA, so reactive current wastes their capacity and increases
          losses. That's why regulators let DISCOMs charge for it.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>The two billing mechanisms — penalty vs kVAh</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th></th><th>PF penalty / incentive (kWh tariffs)</th><th>kVAh billing</th></tr></thead>
          <tbody>
            <tr><td><strong>How it works</strong></td><td>Energy is billed in kWh; a separate
            surcharge applies if average monthly PF falls below the threshold in the tariff order,
            and some states pay an incentive above a higher threshold.</td><td>Energy is metered and
            billed in kVAh = kWh ÷ PF. No separate penalty line — a PF of 0.9 silently bills ~11%
            more units than the work you used.</td></tr>
            <tr><td><strong>Where you see it</strong></td><td>A "PF surcharge/penalty" or "PF
            incentive" line on the bill.</td><td>The units line itself says kVAh; demand is billed
            in kVA. Many HT and large-LT commercial tariffs have moved this way.</td></tr>
            <tr><td><strong>Who is affected</strong></td><td colspan="2">Commercial and industrial
            connections with motors, compressors, welding sets or large HVAC. Domestic supplies are
            billed flat kWh with no PF term in almost every state.</td></tr>
          </tbody>
        </table></div>
        <p>Which regime applies to you is stated in your tariff schedule — check your category on
        our <a href="/tariffs/">state tariff pages</a>, and if your bill shows kVAh units or a kVA
        maximum demand, use the kVA-based option in the
        <a href="/#calculator">bill calculator</a> to reproduce it.</p>
      </section>

      <section class="seo-section">
        <h2>Reading PF off your bill — and the arithmetic check</h2>
        <ol>
          <li>Find the <strong>PF</strong> field (bills print the month's average PF, computed from
          kWh and kVAh registers).</li>
          <li>On kVAh billing: check <strong>kVAh ≈ kWh ÷ PF</strong>. If the bill shows kWh 9,000,
          PF 0.9, the kVAh line should read ~10,000. A mismatch means a register or data-entry
          error.</li>
          <li>On kWh billing with a penalty line: confirm the month's PF is actually below the
          threshold in your tariff order before the penalty percentage is applied — reviewers
          regularly find penalties applied at compliant PF.</li>
        </ol>
        <p>If the lines refuse to reconcile, our free <a href="/bill-review/">expert bill
        review</a> can audit the bill against your tariff schedule.</p>
      </section>

      <section class="seo-section">
        <h2>Fixing a low power factor</h2>
        <ul>
          <li><strong>Capacitor banks</strong> — the standard fix. Capacitors supply the reactive
          current locally so the grid doesn't have to; automatic PF-correction (APFC) panels switch
          capacitor steps to track the load and hold PF near unity.</li>
          <li><strong>Payback is fast</strong> where kVAh billing applies: raising PF from 0.85 to
          0.99 cuts billed units by ~14% for the same real consumption, and demand billed in kVA
          falls with it.</li>
          <li><strong>Size to the load</strong> — over-correction (leading PF) is also penalised in
          several tariff orders. An electrician sizes the bank from your motor loads and the PF
          history printed on past bills.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'What is a good power factor for an electricity connection?',
        a: 'As close to 1.0 (unity) as practical. Most tariff orders treat roughly 0.9 and above as compliant; incentives, where offered, typically start above 0.95. Below the threshold, kWh tariffs add a PF surcharge, and kVAh tariffs inflate billed units automatically.' },
      { q: 'Does power factor affect home electricity bills in India?',
        a: 'Practically no. Domestic tariffs bill flat kWh with no PF term in almost every state, and household PF is decent anyway with modern electronics. PF penalties and kVAh billing target commercial and industrial connections with significant motor loads.' },
      { q: 'What is kVAh billing?',
        a: 'Under kVAh billing the meter records apparent energy — kWh ÷ power factor — and the tariff prices those units. A PF of 0.9 means about 11% more billed units for the same real consumption, which is why kVAh tariffs need no separate PF penalty line.' },
      { q: 'How do capacitor banks improve power factor?',
        a: 'Inductive loads like motors draw reactive current from the grid. Capacitors supply that reactive current locally, so the grid only carries the useful component — raising PF toward unity, cutting kVAh units and kVA demand. APFC panels switch capacitor steps automatically as the load varies.' },
    ],

    titleMr: 'पॉवर फॅक्टर, kVAh बिलिंग आणि PF दंड समजावले',
    metaTitleMr: 'पॉवर फॅक्टर व kVAh बिलिंग समजावले — दंड, प्रोत्साहन, आणि ते कोण भरतो',
    descriptionMr: 'पॉवर फॅक्टर म्हणजे काय, डिस्कॉमला त्याची काळजी का असते, kVAh बिलिंग खराब PF ला आपोआप महाग कसे बनवते, PF दंड व प्रोत्साहन कधी लागू होतात, आणि कॅपॅसिटर कमी पॉवर फॅक्टर कसा दुरुस्त करतात.',
    introMr: `<strong>पॉवर फॅक्टर (PF)</strong> म्हणजे तुम्ही ओढता त्या विजेपैकी जो अंश उपयुक्त काम करतो तो:
      PF = kW ÷ kVA, 0 ते 1 पर्यंत. मोटर, वेल्डर आणि जुने बॅलास्ट "रिअॅक्टिव्ह" करंट ओढतात जो काम न करता
      नेटवर्कवर भार टाकतो, PF खाली खेचतो. डिस्कॉम तो भार दोन प्रकारे वसूल करतात — kWh टॅरिफवर स्पष्ट
      <strong>PF दंड</strong>, किंवा <strong>kVAh बिलिंग</strong>, जिथे ऊर्जा kWh ÷ PF अशी मोजली जाते
      त्यामुळे खराब पॉवर फॅक्टर तुमची बिल केलेली युनिटे आपोआप वाढवतो. घरांना जवळपास कधीच परिणाम होत नाही;
      व्यावसायिक व औद्योगिक जोडण्यांना नित्य होतो.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>पॉवर फॅक्टर सोप्या शब्दांत</h2>
        <p>बिअरच्या मगचा विचार करा: द्रव म्हणजे <strong>kW</strong> (काम करणारी खरी पॉवर), फेस म्हणजे
        <strong>kVAR</strong> (तहान न भागवता मग भरणारी रिअॅक्टिव्ह पॉवर), आणि संपूर्ण मग म्हणजे
        <strong>kVA</strong> (नेटवर्कला वाहून न्यावी लागणारी आभासी पॉवर). PF म्हणजे द्रव ÷ मग:</p>
        <ul>
          <li><strong>PF = 1.0</strong> — पूर्णतः रोधक भार (हीटर, इन्कॅन्डेसंट बल्ब). सर्व करंट काम
          करतो.</li>
          <li><strong>PF ≈ 0.8</strong> — सामान्य असुधारित मोटर-प्रधान भार. नेटवर्क उपयुक्त पॉवरला
          लागणाऱ्यापेक्षा 25% जास्त करंट वाहतो.</li>
          <li><strong>कमी PF ग्रिडला त्रास देतो</strong>, उपकरणाला नाही: केबल, ट्रान्सफॉर्मर व जनरेटर kVA
          नुसार आकाराचे असतात, म्हणून रिअॅक्टिव्ह करंट त्यांची क्षमता वाया घालवतो आणि हानी वाढवतो.
          म्हणूनच नियामक डिस्कॉमना त्यासाठी आकारणी करू देतात.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>दोन बिलिंग यंत्रणा — दंड वि. kVAh</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th></th><th>PF दंड / प्रोत्साहन (kWh टॅरिफ)</th><th>kVAh बिलिंग</th></tr></thead>
          <tbody>
            <tr><td><strong>कसे काम करते</strong></td><td>ऊर्जा kWh मध्ये बिल होते; सरासरी मासिक PF
            टॅरिफ आदेशातील उंबरठ्याखाली गेल्यास वेगळा अधिभार लागतो, आणि काही राज्ये उच्च उंबरठ्याच्या वर
            प्रोत्साहन देतात.</td><td>ऊर्जा kVAh = kWh ÷ PF मध्ये मोजली व बिल होते. वेगळी दंड ओळ नाही —
            0.9 चा PF तुम्ही वापरलेल्या कामापेक्षा ~11% जास्त युनिटे गुपचूप बिल करतो.</td></tr>
            <tr><td><strong>ते कुठे दिसते</strong></td><td>बिलावर "PF अधिभार/दंड" किंवा "PF प्रोत्साहन"
            ओळ.</td><td>युनिट ओळ स्वतःच kVAh म्हणते; मागणी kVA मध्ये बिल होते. अनेक HT व मोठे-LT व्यावसायिक
            टॅरिफ याकडे वळले आहेत.</td></tr>
            <tr><td><strong>कोणाला परिणाम होतो</strong></td><td colspan="2">मोटर, कॉम्प्रेसर, वेल्डिंग
            सेट किंवा मोठ्या HVAC असलेल्या व्यावसायिक व औद्योगिक जोडण्या. घरगुती पुरवठे जवळपास प्रत्येक
            राज्यात कोणत्याही PF घटकाशिवाय सपाट kWh बिल होतात.</td></tr>
          </tbody>
        </table></div>
        <p>तुम्हाला कोणती पद्धत लागू आहे हे तुमच्या टॅरिफ अनुसूचीत नमूद असते — आमच्या
        <a href="/mr/tariffs/states/">राज्य टॅरिफ पेजांवर</a> तुमची श्रेणी तपासा, आणि तुमचे बिल kVAh
        युनिटे किंवा kVA कमाल मागणी दाखवत असेल, तर ते पुन्हा तयार करण्यासाठी <a href="/#calculator">बिल
        कॅल्क्युलेटर</a> मध्ये kVA-आधारित पर्याय वापरा.</p>
      </section>

      <section class="seo-section">
        <h2>बिलावरून PF वाचणे — आणि अंकगणित तपासणी</h2>
        <ol>
          <li><strong>PF</strong> क्षेत्र शोधा (बिले महिन्याचा सरासरी PF छापतात, kWh व kVAh रजिस्टरमधून
          मोजलेला).</li>
          <li>kVAh बिलिंगवर: <strong>kVAh ≈ kWh ÷ PF</strong> तपासा. बिल kWh 9,000, PF 0.9 दाखवत असेल,
          तर kVAh ओळ ~10,000 वाचली पाहिजे. न जुळणे म्हणजे रजिस्टर किंवा डेटा-एंट्री चूक.</li>
          <li>दंड ओळ असलेल्या kWh बिलिंगवर: दंड टक्केवारी लागू होण्यापूर्वी महिन्याचा PF खरोखर तुमच्या
          टॅरिफ आदेशातील उंबरठ्याखाली आहे का याची खात्री करा — समीक्षक नियमितपणे अनुपालक PF वर लावलेले दंड
          शोधतात.</li>
        </ol>
        <p>ओळी जुळण्यास नकार देत असतील, तर आमची मोफत <a href="/bill-review/">तज्ज्ञ बिल समीक्षा</a>
        तुमच्या टॅरिफ अनुसूचीविरुद्ध बिलाचे ऑडिट करू शकते.</p>
      </section>

      <section class="seo-section">
        <h2>कमी पॉवर फॅक्टर दुरुस्त करणे</h2>
        <ul>
          <li><strong>कॅपॅसिटर बँक</strong> — प्रमाणित उपाय. कॅपॅसिटर रिअॅक्टिव्ह करंट स्थानिक पातळीवर
          पुरवतात म्हणजे ग्रिडला तो पुरवावा लागत नाही; स्वयंचलित PF-सुधारणा (APFC) पॅनेल भारानुसार कॅपॅसिटर
          टप्पे स्विच करून PF जवळपास एकवर धरतात.</li>
          <li><strong>पेबॅक जलद आहे</strong> जिथे kVAh बिलिंग लागू होते: PF 0.85 वरून 0.99 वर नेल्यास त्याच
          खऱ्या वापरासाठी बिल केलेली युनिटे ~14% कमी होतात, आणि kVA मध्ये बिल होणारी मागणीही त्यासोबत
          घटते.</li>
          <li><strong>भाराला अनुसरून आकार द्या</strong> — अति-सुधारणा (लीडिंग PF) देखील अनेक टॅरिफ आदेशांत
          दंडनीय आहे. इलेक्ट्रिशियन तुमच्या मोटर भारांवरून व मागील बिलांवर छापलेल्या PF इतिहासावरून बँकेचा
          आकार ठरवतो.</li>
        </ul>
      </section>`,
    faqsMr: [
      { q: 'वीज जोडणीसाठी चांगला पॉवर फॅक्टर कोणता?',
        a: 'व्यवहार्य तितका 1.0 (एकक) च्या जवळ. बहुतेक टॅरिफ आदेश साधारण 0.9 व त्यावरील अनुपालक मानतात; प्रोत्साहन, जिथे दिले जाते, सहसा 0.95 च्या वर सुरू होते. उंबरठ्याखाली, kWh टॅरिफ PF अधिभार जोडतात, आणि kVAh टॅरिफ बिल केलेली युनिटे आपोआप वाढवतात.' },
      { q: 'भारतात पॉवर फॅक्टरचा घरगुती वीज बिलांवर परिणाम होतो का?',
        a: 'व्यवहारात नाही. घरगुती टॅरिफ जवळपास प्रत्येक राज्यात कोणत्याही PF घटकाशिवाय सपाट kWh बिल करतात, आणि आधुनिक इलेक्ट्रॉनिक्समुळे घरगुती PF तसाही ठीक असतो. PF दंड व kVAh बिलिंग लक्षणीय मोटर भार असलेल्या व्यावसायिक व औद्योगिक जोडण्यांना लक्ष्य करतात.' },
      { q: 'kVAh बिलिंग म्हणजे काय?',
        a: 'kVAh बिलिंगमध्ये मीटर आभासी ऊर्जा नोंदवते — kWh ÷ पॉवर फॅक्टर — आणि टॅरिफ त्या युनिटांची किंमत ठरवतो. 0.9 चा PF म्हणजे त्याच खऱ्या वापरासाठी सुमारे 11% जास्त बिल केलेली युनिटे, म्हणूनच kVAh टॅरिफना वेगळी PF दंड ओळ लागत नाही.' },
      { q: 'कॅपॅसिटर बँक पॉवर फॅक्टर कसा सुधारतात?',
        a: 'मोटरसारखे प्रेरक भार ग्रिडमधून रिअॅक्टिव्ह करंट ओढतात. कॅपॅसिटर तो रिअॅक्टिव्ह करंट स्थानिक पातळीवर पुरवतात, म्हणून ग्रिड फक्त उपयुक्त घटक वाहतो — PF एककाकडे नेत, kVAh युनिटे व kVA मागणी कमी करत. APFC पॅनेल भार बदलताच कॅपॅसिटर टप्पे आपोआप स्विच करतात.' },
    ],
  },
  {
    slug: 'uppcl-new-connection-jhatpat',
    published: "2026-04-12",
    states: ['Uttar Pradesh'],
    title: 'How to Get a New UPPCL Electricity Connection (Jhatpat Portal)',
    metaTitle: 'UPPCL New Connection Online — Jhatpat Portal: Documents, Fees, Timeline',
    description: 'Step-by-step guide to a new UPPCL electricity connection through the Jhatpat portal: who can apply online, the exact document checklist, registration fee, estimate and security deposit, statutory timelines under the Rights of Consumers Rules, and what to do when the application stalls.',
    minutes: 8,
    intro: `A new domestic electricity connection in Uttar Pradesh no longer needs a trip to the
      sub-division office. UPPCL's <strong>Jhatpat portal</strong>
      (<a href="https://jhatpatportal.uppcl.org/" rel="nofollow noopener" target="_blank">jhatpatportal.uppcl.org</a>)
      takes the application, documents, fees and even the cost estimate online for domestic (LMV-1)
      and commercial (LMV-2) connections. This guide walks through the whole flow — what to keep
      ready, what it costs, how long UPPCL is legally allowed to take, and how to push back when
      nothing happens.`,
    sections: `
      <section class="seo-section">
        <h2>1. What the Jhatpat portal is — and when to use it</h2>
        <p><em>Jhatpat</em> ("instantly") is UPPCL's online new-connection scheme, launched in 2019
        so that small consumers never have to chase a lineman or a babu for a form. It covers all five
        UP DISCOMs — MVVNL, PVVNL, DVVNL, PuVVNL and KESCO — from a single portal.</p>
        <ul>
          <li><strong>Fully online flow:</strong> domestic <strong>LMV-1</strong> and commercial
          <strong>LMV-2</strong> applications for small loads (the scheme was designed around
          connections up to 25 kW). Registration, document upload, fee payment and estimate payment
          all happen on the portal.</li>
          <li><strong>Higher loads</strong> still apply through the same portal, but expect a site
          inspection and a manually prepared estimate before sanction.</li>
          <li><strong>Not for:</strong> reconnections, name changes, load changes on an existing
          connection — those go through the UPPCL consumer portal
          (<a href="https://uppclonline.com/" rel="nofollow noopener" target="_blank">uppclonline.com</a>),
          not Jhatpat. If you want a <em>higher</em> load on an existing connection, read our
          <a href="/guides/uppcl-sanctioned-load-increased/">sanctioned-load guide</a> instead.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>2. Documents — keep these scanned before you start</h2>
        <p>The portal rejects nothing as often as a blurry ownership proof. One passport-size photo
        and two documents do most of the work:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar (used for OTP verification on the portal), voter ID, passport, driving licence or PAN.</td></tr>
            <tr><td><strong>Address / premises proof</strong></td><td>Registry or sale deed, house-tax receipt, or rent agreement for tenants. The connection is issued for the <em>premises</em>, so this decides whose name goes on the bill.</td></tr>
            <tr><td><strong>Photograph</strong></td><td>One passport-size photo of the applicant (JPEG upload).</td></tr>
            <tr><td><strong>BPL card</strong></td><td>Only if applying under the BPL category — it changes the registration fee and the default 1 kW load.</td></tr>
          </tbody>
        </table></div>
        <p><strong>Tenants can apply.</strong> Supply is a statutory right of the occupier under
        Section 43 of the Electricity Act, 2003 — a rent agreement plus an indemnity/no-objection
        undertaking is the usual paper trail when the landlord will not sign.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step</h2>
        <ol>
          <li><strong>Register</strong> on
          <a href="https://jhatpatportal.uppcl.org/" rel="nofollow noopener" target="_blank">jhatpatportal.uppcl.org</a>
          with your mobile number (OTP-verified) and choose urban or rural supply.</li>
          <li><strong>Fill the application:</strong> district → DISCOM → sub-division are picked
          from dropdowns, then category (LMV-1 domestic / LMV-2 commercial) and the load you want.
          Ask for the load you realistically need — fixed charges are billed per sanctioned kW every
          month, so an oversized connection costs you forever. Our
          <a href="/guides/reduce-fixed-charges-sanctioned-load/">fixed-charges guide</a> shows how
          to size it.</li>
          <li><strong>Upload documents</strong> and pay the <strong>registration fee</strong> online —
          ₹10 for BPL applicants, ₹100 for others (verify the amount shown at the payment step;
          it is set by the Cost Data Book in force).</li>
          <li><strong>Estimate generation.</strong> For small loads near an existing line the portal
          generates the estimate automatically from UPPCL's Cost Data Book; larger or far-from-line
          premises get a junior engineer's site visit first. The estimate bundles line charges,
          meter cost and <strong>security deposit</strong> (a per-kW amount that stays with UPPCL
          against your future bills).</li>
          <li><strong>Pay the estimate online.</strong> This is the point the clock starts for
          meter installation.</li>
          <li><strong>Meter installation and energisation.</strong> The meter serial number and your
          new 10/12-digit account number arrive by SMS. First bill follows in the next billing cycle.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs — the three separate amounts</h2>
        <p>People quote wildly different "connection cost" figures because three different amounts
        get mixed up. Keep them separate:</p>
        <ol>
          <li><strong>Registration fee</strong> — the small application charge (₹10 BPL / ₹100
          others) paid when you submit.</li>
          <li><strong>Estimate / line charges</strong> — the real cost, set by load, phase and the
          distance from the nearest pole, per the Cost Data Book. A 1–2 kW domestic connection next
          to an existing line typically lands in the low thousands of rupees; extra poles or cable
          raise it.</li>
          <li><strong>Security deposit</strong> — refundable-with-interest per-kW deposit collected
          inside the estimate. It appears back on your side only at permanent disconnection, adjusted
          against dues.</li>
        </ol>
        <p>We deliberately don't print rupee tables here — the Cost Data Book is revised, and a
        stale number is worse than none. The portal shows your exact estimate before you pay
        anything beyond the registration fee.</p>
      </section>

      <section class="seo-section">
        <h2>5. How long UPPCL can legally take</h2>
        <p>Two clocks apply, and the stricter one wins:</p>
        <ul>
          <li>The central <strong>Electricity (Rights of Consumers) Rules, 2020</strong> cap new
          connections at <strong>7 days in metropolitan areas, 15 days in other municipal areas and
          30 days in rural areas</strong> after a complete application.</li>
          <li>The Jhatpat scheme's own service promise for small loads is a working connection
          within about <strong>10 days</strong> of estimate payment.</li>
        </ul>
        <p>Miss the deadline and the UP supply code entitles you to compensation — but in practice
        the useful lever is the complaint chain in the next section.</p>
      </section>

      <section class="seo-section">
        <h2>6. Application stuck? The escalation ladder</h2>
        <ol>
          <li><strong>Track first:</strong> the Jhatpat portal login shows the application stage
          (document verification → estimate → payment → installation), so you know <em>where</em>
          it is stuck.</li>
          <li><strong>1912</strong> — UPPCL's 24×7 helpline; quote the application number and ask
          for a complaint number.</li>
          <li><strong>The sub-division JE/SDO</strong> named on the portal for your area — most
          stalls are a pending site visit that one phone call unsticks.</li>
          <li><strong>CGRF</strong> (Consumer Grievance Redressal Forum) of your DISCOM, then the
          <strong>Electricity Ombudsman</strong>, both free — the statutory route when the deadline
          in section 5 has lapsed.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. After the meter arrives — check your first bill</h2>
        <p>New connections are where category and load errors are born. On the first bill, verify
        the tariff category (LMV-1 for a home), the sanctioned load you applied for, and the meter
        number. Then put your units into our
        <a href="/?state=Uttar%20Pradesh#calculator">UPPCL bill calculator</a> — it implements the
        current slab, fixed-charge, FPPA and duty logic, verified against real UPPCL bills — and
        compare. Our <a href="/guides/how-to-read-uppcl-bill/">UPPCL bill-reading guide</a> decodes
        every line, and <a href="/bill-review/">Bill Review</a> can check a suspicious first bill
        for free.</p>
      </section>`,
    faqs: [
      { q: 'What is the Jhatpat connection scheme of UPPCL?',
        a: 'Jhatpat is UPPCL’s online new-connection scheme (jhatpatportal.uppcl.org) covering all five UP DISCOMs. Domestic LMV-1 and commercial LMV-2 applicants register, upload documents, pay the registration fee and the system-generated estimate online, with small loads promised a working connection in about 10 days.' },
      { q: 'What documents are required for a new UPPCL connection?',
        a: 'Identity proof (Aadhaar is used for portal OTP verification), premises proof (registry, house-tax receipt or rent agreement for tenants), one passport-size photograph, and the BPL card if applying under the BPL category.' },
      { q: 'What is the UPPCL new connection registration fee?',
        a: 'The registration fee is nominal — ₹10 for BPL applicants and ₹100 for others. The real cost is the estimate (line charges, meter and security deposit) generated from UPPCL’s Cost Data Book after the application, which the portal shows before you pay.' },
      { q: 'How many days does a new UPPCL connection take?',
        a: 'Under the Electricity (Rights of Consumers) Rules, 2020, a complete application must be energised within 7 days in metropolitan areas, 15 days in other municipal areas and 30 days in rural areas. The Jhatpat scheme itself promises roughly 10 days for small loads after estimate payment.' },
      { q: 'Can a tenant get an electricity connection in UP without the landlord?',
        a: 'Yes. Section 43 of the Electricity Act, 2003 gives the occupier of a premises the right to supply. A rent agreement plus an indemnity/no-objection undertaking is the usual documentation when the owner will not sign the application.' },
    ],

    titleHi: 'UPPCL में नया बिजली कनेक्शन कैसे लें — Jhatpat पोर्टल गाइड',
    metaTitleHi: 'UPPCL नया कनेक्शन ऑनलाइन — Jhatpat पोर्टल: दस्तावेज़, फीस, समयसीमा',
    descriptionHi: 'Jhatpat पोर्टल से UPPCL का नया बिजली कनेक्शन लेने की स्टेप-बाय-स्टेप गाइड: ऑनलाइन आवेदन कौन कर सकता है, दस्तावेज़ों की पूरी सूची, रजिस्ट्रेशन फीस, एस्टीमेट और सिक्योरिटी डिपॉज़िट, उपभोक्ता अधिकार नियमों के तहत कानूनी समयसीमा, और आवेदन अटकने पर क्या करें।',
    introHi: `उत्तर प्रदेश में नए घरेलू बिजली कनेक्शन के लिए अब उपखंड कार्यालय के चक्कर लगाने की ज़रूरत
      नहीं है। UPPCL का <strong>Jhatpat पोर्टल</strong>
      (<a href="https://jhatpatportal.uppcl.org/" rel="nofollow noopener" target="_blank">jhatpatportal.uppcl.org</a>)
      घरेलू (LMV-1) और वाणिज्यिक (LMV-2) कनेक्शनों के लिए आवेदन, दस्तावेज़, फीस और लागत का एस्टीमेट —
      सब कुछ ऑनलाइन कर देता है। यह गाइड पूरी प्रक्रिया समझाती है — क्या तैयार रखें, कितना खर्च आएगा,
      UPPCL को कानूनन कितने दिन मिलते हैं, और कुछ न हो तो दबाव कैसे बनाएँ।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. Jhatpat पोर्टल क्या है — और कब इस्तेमाल करें</h2>
        <p><em>झटपट</em> UPPCL की ऑनलाइन नई-कनेक्शन योजना है, जो 2019 में शुरू हुई ताकि छोटे उपभोक्ताओं
        को फॉर्म के लिए किसी लाइनमैन या बाबू के पीछे न भागना पड़े। यह एक ही पोर्टल से यूपी की पाँचों
        DISCOM — MVVNL, PVVNL, DVVNL, PuVVNL और KESCO — को कवर करती है।</p>
        <ul>
          <li><strong>पूरी तरह ऑनलाइन:</strong> घरेलू <strong>LMV-1</strong> और वाणिज्यिक
          <strong>LMV-2</strong> के छोटे भार के आवेदन (योजना 25 kW तक के कनेक्शनों के लिए बनाई गई थी)।
          रजिस्ट्रेशन, दस्तावेज़ अपलोड, फीस और एस्टीमेट भुगतान — सब पोर्टल पर।</li>
          <li><strong>बड़े भार</strong> भी इसी पोर्टल से आवेदन करते हैं, पर मंज़ूरी से पहले साइट निरीक्षण
          और मैन्युअल एस्टीमेट की उम्मीद रखें।</li>
          <li><strong>इनके लिए नहीं:</strong> रीकनेक्शन, नाम परिवर्तन, मौजूदा कनेक्शन का लोड बदलना —
          ये UPPCL उपभोक्ता पोर्टल
          (<a href="https://uppclonline.com/" rel="nofollow noopener" target="_blank">uppclonline.com</a>)
          से होते हैं, Jhatpat से नहीं। मौजूदा कनेक्शन का भार <em>बढ़ाना</em> हो तो हमारी
          <a href="/hi/guides/uppcl-sanctioned-load-increased/">स्वीकृत भार गाइड</a> पढ़ें।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़ — शुरू करने से पहले ये स्कैन कर रखें</h2>
        <p>पोर्टल पर सबसे ज़्यादा आवेदन धुंधले स्वामित्व प्रमाण की वजह से अटकते हैं। एक पासपोर्ट-साइज़
        फोटो और दो दस्तावेज़ों से ज़्यादातर काम हो जाता है:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार (पोर्टल पर OTP सत्यापन के लिए), वोटर ID, पासपोर्ट, ड्राइविंग लाइसेंस या PAN।</td></tr>
            <tr><td><strong>पता / परिसर प्रमाण</strong></td><td>रजिस्ट्री या सेल डीड, हाउस-टैक्स रसीद, किरायेदारों के लिए रेंट एग्रीमेंट। कनेक्शन <em>परिसर</em> के लिए जारी होता है, इसी से तय होता है कि बिल किसके नाम आएगा।</td></tr>
            <tr><td><strong>फोटो</strong></td><td>आवेदक की एक पासपोर्ट-साइज़ फोटो (JPEG अपलोड)।</td></tr>
            <tr><td><strong>BPL कार्ड</strong></td><td>केवल BPL श्रेणी में आवेदन करने पर — इससे रजिस्ट्रेशन फीस और डिफ़ॉल्ट 1 kW भार बदलता है।</td></tr>
          </tbody>
        </table></div>
        <p><strong>किरायेदार भी आवेदन कर सकते हैं।</strong> विद्युत अधिनियम, 2003 की धारा 43 के तहत
        बिजली आपूर्ति परिसर में रहने वाले (occupier) का वैधानिक अधिकार है — मकान मालिक साइन न करे तो
        रेंट एग्रीमेंट के साथ क्षतिपूर्ति/अनापत्ति शपथपत्र सामान्य तरीका है।</p>
      </section>

      <section class="seo-section">
        <h2>3. आवेदन, स्टेप-बाय-स्टेप</h2>
        <ol>
          <li><strong>रजिस्टर करें:</strong>
          <a href="https://jhatpatportal.uppcl.org/" rel="nofollow noopener" target="_blank">jhatpatportal.uppcl.org</a>
          पर मोबाइल नंबर (OTP सत्यापित) से, और शहरी या ग्रामीण आपूर्ति चुनें।</li>
          <li><strong>आवेदन भरें:</strong> ज़िला → DISCOM → उपखंड ड्रॉपडाउन से चुने जाते हैं, फिर श्रेणी
          (LMV-1 घरेलू / LMV-2 वाणिज्यिक) और मनचाहा भार। उतना ही भार माँगें जितनी वाकई ज़रूरत है —
          फिक्स्ड चार्ज हर महीने प्रति स्वीकृत kW लगता है, इसलिए ज़रूरत से बड़ा कनेक्शन हमेशा महँगा
          पड़ता है। सही आकार चुनने के लिए हमारी
          <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">फिक्स्ड चार्ज गाइड</a> देखें।</li>
          <li><strong>दस्तावेज़ अपलोड करें</strong> और <strong>रजिस्ट्रेशन फीस</strong> ऑनलाइन भरें —
          BPL आवेदकों के लिए ₹10, बाकी के लिए ₹100 (भुगतान स्टेप पर दिख रही राशि ही मान्य है; यह लागू
          Cost Data Book से तय होती है)।</li>
          <li><strong>एस्टीमेट बनना।</strong> मौजूदा लाइन के पास छोटे भार के लिए पोर्टल Cost Data Book
          से अपने आप एस्टीमेट बना देता है; बड़े या लाइन से दूर परिसरों में पहले अवर अभियंता (JE) का
          साइट विज़िट होता है। एस्टीमेट में लाइन शुल्क, मीटर लागत और <strong>सिक्योरिटी डिपॉज़िट</strong>
          (प्रति-kW राशि जो आपके भविष्य के बिलों की ज़मानत के तौर पर UPPCL के पास रहती है) शामिल होते हैं।</li>
          <li><strong>एस्टीमेट ऑनलाइन भरें।</strong> मीटर लगाने की घड़ी यहीं से शुरू होती है।</li>
          <li><strong>मीटर लगना और सप्लाई चालू होना।</strong> मीटर सीरियल नंबर और आपका नया 10/12 अंकों
          का खाता नंबर SMS से मिलता है। पहला बिल अगले बिलिंग चक्र में आता है।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना — तीन अलग-अलग राशियाँ</h2>
        <p>"कनेक्शन का खर्च" के आँकड़े इसलिए इतने अलग-अलग सुनाई देते हैं क्योंकि तीन अलग राशियाँ
        आपस में मिला दी जाती हैं। इन्हें अलग रखें:</p>
        <ol>
          <li><strong>रजिस्ट्रेशन फीस</strong> — आवेदन जमा करते समय दी जाने वाली छोटी राशि
          (BPL ₹10 / अन्य ₹100)।</li>
          <li><strong>एस्टीमेट / लाइन शुल्क</strong> — असली लागत, जो भार, फेज़ और नज़दीकी पोल से दूरी
          पर Cost Data Book के हिसाब से तय होती है। मौजूदा लाइन के पास 1–2 kW का घरेलू कनेक्शन आम तौर
          पर कुछ हज़ार रुपये में हो जाता है; अतिरिक्त पोल या केबल से लागत बढ़ती है।</li>
          <li><strong>सिक्योरिटी डिपॉज़िट</strong> — एस्टीमेट के भीतर वसूली जाने वाली प्रति-kW वापसी-योग्य
          (ब्याज सहित) राशि। यह स्थायी विच्छेदन पर ही, बकाया समायोजित करके, वापस मिलती है।</li>
        </ol>
        <p>हम यहाँ जानबूझकर रुपये की तालिकाएँ नहीं छापते — Cost Data Book संशोधित होती रहती है, और
        पुराना आँकड़ा न होने से बुरा है। रजिस्ट्रेशन फीस के अलावा कुछ भी भरने से पहले पोर्टल आपका सटीक
        एस्टीमेट दिखा देता है।</p>
      </section>

      <section class="seo-section">
        <h2>5. UPPCL कानूनन कितने दिन ले सकता है</h2>
        <p>दो घड़ियाँ चलती हैं, और सख़्त वाली जीतती है:</p>
        <ul>
          <li>केंद्रीय <strong>विद्युत (उपभोक्ता अधिकार) नियम, 2020</strong> के अनुसार पूर्ण आवेदन पर
          कनेक्शन <strong>महानगरों में 7 दिन, अन्य नगरीय क्षेत्रों में 15 दिन और ग्रामीण क्षेत्रों में
          30 दिन</strong> के भीतर देना अनिवार्य है।</li>
          <li>छोटे भार के लिए Jhatpat योजना का अपना सेवा-वादा एस्टीमेट भुगतान के बाद लगभग
          <strong>10 दिन</strong> में चालू कनेक्शन है।</li>
        </ul>
        <p>समयसीमा चूकने पर यूपी सप्लाई कोड मुआवज़े का हक़ देता है — पर व्यवहार में काम अगले सेक्शन
        की शिकायत-सीढ़ी से बनता है।</p>
      </section>

      <section class="seo-section">
        <h2>6. आवेदन अटक गया? शिकायत की सीढ़ी</h2>
        <ol>
          <li><strong>पहले ट्रैक करें:</strong> Jhatpat पोर्टल लॉगिन आवेदन का चरण दिखाता है
          (दस्तावेज़ सत्यापन → एस्टीमेट → भुगतान → इंस्टॉलेशन), जिससे पता चलता है कि वह <em>कहाँ</em>
          अटका है।</li>
          <li><strong>1912</strong> — UPPCL की 24×7 हेल्पलाइन; आवेदन नंबर बताकर शिकायत नंबर ज़रूर लें।</li>
          <li><strong>उपखंड के JE/SDO</strong> — पोर्टल पर आपके क्षेत्र के लिए नामित; ज़्यादातर रुकावटें
          लंबित साइट विज़िट की होती हैं जो एक फोन से खुल जाती हैं।</li>
          <li><strong>CGRF</strong> (उपभोक्ता शिकायत निवारण मंच), फिर <strong>विद्युत लोकपाल</strong> —
          दोनों निःशुल्क; सेक्शन 5 की समयसीमा बीत जाने पर यही वैधानिक रास्ता है।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. मीटर लग जाए तो — पहला बिल जाँचें</h2>
        <p>श्रेणी और भार की गलतियाँ नए कनेक्शन पर ही जन्म लेती हैं। पहले बिल पर टैरिफ श्रेणी (घर के लिए
        LMV-1), आवेदन वाला स्वीकृत भार और मीटर नंबर जाँचें। फिर अपनी यूनिटें हमारे
        <a href="/?state=Uttar%20Pradesh#calculator">UPPCL बिल कैलकुलेटर</a> में डालें — यह मौजूदा
        स्लैब, फिक्स्ड चार्ज, FPPA और ड्यूटी का वही गणित लगाता है और असली UPPCL बिलों से सत्यापित है —
        और मिलान करें। हर लाइन समझने के लिए
        <a href="/hi/guides/how-to-read-uppcl-bill/">UPPCL बिल पढ़ने की गाइड</a> देखें, और संदिग्ध पहले
        बिल की <a href="/bill-review/">Bill Review</a> से निःशुल्क जाँच कराएँ।</p>
      </section>`,
    faqsHi: [
      { q: 'UPPCL की Jhatpat कनेक्शन योजना क्या है?',
        a: 'Jhatpat UPPCL की ऑनलाइन नई-कनेक्शन योजना है (jhatpatportal.uppcl.org), जो यूपी की पाँचों DISCOM को कवर करती है। घरेलू LMV-1 और वाणिज्यिक LMV-2 आवेदक रजिस्ट्रेशन, दस्तावेज़ अपलोड, फीस और सिस्टम से बने एस्टीमेट का भुगतान ऑनलाइन करते हैं; छोटे भार पर लगभग 10 दिन में चालू कनेक्शन का वादा है।' },
      { q: 'UPPCL नए कनेक्शन के लिए कौन से दस्तावेज़ चाहिए?',
        a: 'पहचान प्रमाण (पोर्टल OTP सत्यापन के लिए आधार), परिसर प्रमाण (रजिस्ट्री, हाउस-टैक्स रसीद या किरायेदारों के लिए रेंट एग्रीमेंट), एक पासपोर्ट-साइज़ फोटो, और BPL श्रेणी में आवेदन करने पर BPL कार्ड।' },
      { q: 'UPPCL नए कनेक्शन की रजिस्ट्रेशन फीस कितनी है?',
        a: 'रजिस्ट्रेशन फीस नाममात्र है — BPL आवेदकों के लिए ₹10 और अन्य के लिए ₹100। असली लागत एस्टीमेट है (लाइन शुल्क, मीटर और सिक्योरिटी डिपॉज़िट), जो आवेदन के बाद UPPCL की Cost Data Book से बनता है और भुगतान से पहले पोर्टल पर दिखता है।' },
      { q: 'UPPCL का नया कनेक्शन कितने दिन में मिलता है?',
        a: 'विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत पूर्ण आवेदन पर कनेक्शन महानगरों में 7 दिन, अन्य नगरीय क्षेत्रों में 15 दिन और ग्रामीण क्षेत्रों में 30 दिन के भीतर देना अनिवार्य है। Jhatpat योजना खुद छोटे भार पर एस्टीमेट भुगतान के बाद लगभग 10 दिन का वादा करती है।' },
      { q: 'क्या यूपी में किरायेदार मकान मालिक के बिना बिजली कनेक्शन ले सकता है?',
        a: 'हाँ। विद्युत अधिनियम, 2003 की धारा 43 परिसर में रहने वाले (occupier) को आपूर्ति का अधिकार देती है। मालिक आवेदन पर साइन न करे तो रेंट एग्रीमेंट के साथ क्षतिपूर्ति/अनापत्ति शपथपत्र सामान्य दस्तावेज़ है।' },
    ],
  },
  {
    slug: 'msedcl-new-connection-online',
    published: "2026-04-24",
    states: ['Maharashtra'],
    title: 'How to Get a New MSEDCL (Mahavitaran) Electricity Connection Online',
    metaTitle: 'MSEDCL New Connection Online — WSS Portal: Documents, Charges, Timeline',
    description: 'Step-by-step guide to a new MSEDCL/Mahavitaran electricity connection through the WSS portal: the document checklist (including 7/12 extract for agricultural), application flow, firm quotation and security deposit, statutory timelines, and the escalation ladder when it stalls.',
    minutes: 8,
    intro: `Mahavitaran (MSEDCL) serves nearly all of Maharashtra outside Mumbai city, and a new
      connection no longer needs the A-1 form queue at the section office. The
      <strong>Web Self Service (WSS) portal</strong>
      (<a href="https://wss.mahadiscom.in/wss/" rel="nofollow noopener" target="_blank">wss.mahadiscom.in</a>)
      takes the application, document upload, payments and status tracking online for residential,
      commercial, industrial and agricultural connections. This guide walks the whole flow — what
      to scan first, the three payments involved, how long MSEDCL legally has, and whom to push
      when nothing moves.`,
    sections: `
      <section class="seo-section">
        <h2>1. Two ways to apply — portal or A-1 form</h2>
        <ul>
          <li><strong>Online (recommended):</strong> the WSS portal's
          <em>New Connection Request</em> flow works without even creating an account first — you
          get a <strong>Service Request ID</strong> on submission, which later tracks everything.
          Payments and document upload are online end-to-end.</li>
          <li><strong>Offline:</strong> the traditional <strong>A-1 application form</strong> at
          your MSEDCL section office still works and follows the same fee schedule and timelines.
          Use it only where the premises has no papers a portal upload can carry.</li>
        </ul>
        <p>Note the boundary: Mumbai city proper is served by BEST, Adani Electricity and Tata
        Power — not MSEDCL. Check who serves your address on our
        <a href="/tariffs/maharashtra/">Maharashtra tariff pages</a> before applying.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents — scan these before you start</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, driving licence or PAN.</td></tr>
            <tr><td><strong>Premises / ownership proof</strong></td><td>Sale deed or Index-II, property card, latest property-tax receipt — or a registered rent agreement plus the owner's NOC for tenants.</td></tr>
            <tr><td><strong>Photograph</strong></td><td>One passport-size photo of the applicant.</td></tr>
            <tr><td><strong>Agricultural connections</strong></td><td>The <strong>7/12 extract</strong> (satbara utara) of the land, plus caste/scheme certificates where a subsidised scheme applies.</td></tr>
            <tr><td><strong>Nearest consumer number</strong></td><td>Not a document, but the WSS form asks for the consumer number of the <em>nearest existing MSEDCL connection</em> — a neighbour's bill locates your premises on the network instantly. Keep one handy.</td></tr>
          </tbody>
        </table></div>
        <p><strong>Tenants can apply.</strong> Section 43 of the Electricity Act, 2003 makes supply
        the occupier's right; a registered rent agreement with an indemnity undertaking is the
        standard route when the owner won't co-sign.</p>
      </section>

      <section class="seo-section">
        <h2>3. The WSS application, step by step</h2>
        <ol>
          <li><strong>Open the New Connection Request</strong> on
          <a href="https://wss.mahadiscom.in/wss/" rel="nofollow noopener" target="_blank">wss.mahadiscom.in</a>
          and pick your consumer category (residential / commercial / industrial / agricultural)
          and supply type.</li>
          <li><strong>Fill the application:</strong> applicant details, full address with landmark,
          the nearest consumer number, and the <strong>requested load in kW</strong>. Ask for what
          you actually need — fixed charges are billed on sanctioned load every month, and our
          <a href="/guides/reduce-fixed-charges-sanctioned-load/">fixed-charges guide</a> shows how
          to size it.</li>
          <li><strong>Verify mobile by OTP, upload documents, pay the application fee</strong>
          online. You receive the Service Request ID — save it.</li>
          <li><strong>Site inspection.</strong> An MSEDCL engineer checks feasibility — whether the
          existing line can serve you or an extension is needed.</li>
          <li><strong>Firm quotation (demand note).</strong> MSEDCL issues the payable estimate:
          service connection charges, security deposit and meter-related charges per the MERC
          Schedule of Charges. Pay it online against the Service Request ID.</li>
          <li><strong>Meter installation and energisation.</strong> Your 12-digit consumer number
          arrives with the first bill in the next cycle.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs — three separate payments</h2>
        <ol>
          <li><strong>Application / processing fee</strong> — small, paid at submission, varies by
          category and load.</li>
          <li><strong>Firm quotation</strong> — the real cost: service connection charges set by
          MERC's Schedule of Charges, higher where poles or cable must be added. Normal-charges
          connections near an existing line are typically a few thousand rupees for a small
          residential load.</li>
          <li><strong>Security deposit</strong> — roughly sized to your expected billing (MERC's
          supply code frames it around average consumption for the billing cycle), refundable with
          interest at permanent disconnection.</li>
        </ol>
        <p>We deliberately don't print rupee tables — MERC revises the Schedule of Charges, and the
        firm quotation the portal shows for <em>your</em> premises is the only number that matters.
        Nothing beyond the application fee is payable before you see it.</p>
      </section>

      <section class="seo-section">
        <h2>5. How long MSEDCL can legally take</h2>
        <ul>
          <li>The central <strong>Electricity (Rights of Consumers) Rules, 2020</strong> cap new
          connections at <strong>7 days in metropolitan areas</strong> (Pune, Nagpur, and the
          Mumbai-region municipal belt MSEDCL serves), <strong>15 days in other municipal areas
          and 30 days in rural areas</strong> once the application is complete and paid.</li>
          <li>Where a <strong>line extension</strong> is genuinely required, MERC's Standards of
          Performance regulations allow longer, published timelines — but the clock and the
          compensation for missing it are both defined there, not open-ended.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. Application stuck? The escalation ladder</h2>
        <ol>
          <li><strong>Track online:</strong> the WSS portal shows your Service Request status
          (inspection → quotation → payment → installation), so you know where it sits.</li>
          <li><strong>1912 / 1800-233-3435 / 1800-212-3435</strong> — Mahavitaran's 24×7 helplines;
          quote the Service Request ID and take a complaint number.</li>
          <li><strong>The section/sub-division office</strong> named on your quotation — pending
          site visits and material availability are the usual stalls.</li>
          <li><strong>IGRC → CGRF → Electricity Ombudsman</strong> — MSEDCL's Internal Grievance
          Redressal Cell first, then the Consumer Grievance Redressal Forum, then the Ombudsman
          (Mumbai/Nagpur benches). All free, and the Standards-of-Performance compensation applies
          once statutory timelines lapse.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. After the meter — check your first bill</h2>
        <p>New connections are where wrong categories and loads are born. On the first bill,
        verify the tariff category (LT-1 residential for a home), the sanctioned load you applied
        for, and the meter number. Then put your units into our
        <a href="/?state=Maharashtra#calculator">MSEDCL bill calculator</a> — it implements the
        current slab, wheeling, fixed-charge and FAC logic, verified against real Mahavitaran
        bills — and compare. Our <a href="/guides/how-to-read-msedcl-bill/">MSEDCL bill-reading
        guide</a> decodes every line, the
        <a href="/guides/msedcl-fppa-charges-explained/">FAC/FPPA guide</a> explains the fuel
        surcharge, and <a href="/bill-review/">Bill Review</a> can check a suspicious first bill
        for free.</p>
      </section>`,
    faqs: [
      { q: 'How do I apply for a new MSEDCL connection online?',
        a: 'Use the New Connection Request flow on Mahavitaran’s WSS portal (wss.mahadiscom.in): pick the category, enter the address and requested load in kW, verify your mobile by OTP, upload identity and ownership documents, and pay the application fee. You get a Service Request ID to track everything, pay the firm quotation when issued, and the meter follows.' },
      { q: 'What documents are needed for a Mahavitaran new connection?',
        a: 'Identity proof (Aadhaar, voter ID, passport, driving licence or PAN), premises proof (sale deed/Index-II, property card or property-tax receipt; registered rent agreement plus owner NOC for tenants), and one photograph. Agricultural applicants also need the land’s 7/12 extract.' },
      { q: 'How much does a new MSEDCL connection cost?',
        a: 'Three payments: a small application fee at submission, the firm quotation (service connection charges per MERC’s Schedule of Charges — typically a few thousand rupees for a small residential load near an existing line, more if poles or cable are needed), and a refundable security deposit sized to expected consumption.' },
      { q: 'How many days does MSEDCL take to give a new connection?',
        a: 'Under the Electricity (Rights of Consumers) Rules, 2020: 7 days in metropolitan areas, 15 days in other municipal areas and 30 days in rural areas after a complete, paid application. Where a line extension is required, MERC’s Standards of Performance set longer but still fixed timelines with compensation for default.' },
      { q: 'What is the nearest consumer number asked in the MSEDCL application?',
        a: 'The WSS form asks for the consumer number of the nearest existing MSEDCL connection — usually a neighbour’s. It locates your premises on the distribution network so the feasibility check and estimate are faster and more accurate.' },
    ],

    titleHi: 'MSEDCL (Mahavitaran) में नया बिजली कनेक्शन ऑनलाइन कैसे लें',
    metaTitleHi: 'MSEDCL नया कनेक्शन ऑनलाइन — WSS पोर्टल: दस्तावेज़, शुल्क, समयसीमा',
    descriptionHi: 'WSS पोर्टल से नया MSEDCL/Mahavitaran बिजली कनेक्शन लेने की स्टेप-बाय-स्टेप गाइड: दस्तावेज़ सूची (कृषि के लिए 7/12 उतारा सहित), आवेदन प्रक्रिया, फर्म कोटेशन और सिक्योरिटी डिपॉज़िट, कानूनी समयसीमा, और अटकने पर शिकायत की सीढ़ी।',
    introHi: `मुंबई शहर को छोड़कर लगभग पूरे महाराष्ट्र में बिजली Mahavitaran (MSEDCL) देती है, और नए
      कनेक्शन के लिए अब सेक्शन ऑफिस में A-1 फॉर्म की लाइन ज़रूरी नहीं। <strong>Web Self Service (WSS)
      पोर्टल</strong>
      (<a href="https://wss.mahadiscom.in/wss/" rel="nofollow noopener" target="_blank">wss.mahadiscom.in</a>)
      घरेलू, वाणिज्यिक, औद्योगिक और कृषि कनेक्शनों के लिए आवेदन, दस्तावेज़ अपलोड, भुगतान और स्टेटस
      ट्रैकिंग ऑनलाइन कर देता है। यह गाइड पूरी प्रक्रिया समझाती है — पहले क्या स्कैन करें, कौन से तीन
      भुगतान होते हैं, MSEDCL के पास कानूनन कितने दिन हैं, और कुछ न चले तो किस पर दबाव डालें।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. आवेदन के दो रास्ते — पोर्टल या A-1 फॉर्म</h2>
        <ul>
          <li><strong>ऑनलाइन (बेहतर):</strong> WSS पोर्टल का <em>New Connection Request</em> फ्लो बिना
          खाता बनाए भी चलता है — जमा करते ही <strong>Service Request ID</strong> मिलती है, जिससे आगे
          सब कुछ ट्रैक होता है। भुगतान और दस्तावेज़ अपलोड शुरू से अंत तक ऑनलाइन हैं।</li>
          <li><strong>ऑफलाइन:</strong> सेक्शन ऑफिस में पारंपरिक <strong>A-1 आवेदन फॉर्म</strong> अब भी
          चलता है और उसी शुल्क-सूची व समयसीमा का पालन करता है।</li>
        </ul>
        <p>सीमा ध्यान रखें: मुंबई शहर में BEST, Adani Electricity और Tata Power सप्लाई करती हैं —
        MSEDCL नहीं। आवेदन से पहले हमारे
        <a href="/hi/tariffs/maharashtra/">महाराष्ट्र टैरिफ पेज</a> पर देखें कि आपका पता कौन सर्व
        करता है।</p>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़ — शुरू करने से पहले स्कैन कर रखें</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार, वोटर ID, पासपोर्ट, ड्राइविंग लाइसेंस या PAN।</td></tr>
            <tr><td><strong>परिसर / स्वामित्व प्रमाण</strong></td><td>सेल डीड या Index-II, प्रॉपर्टी कार्ड, ताज़ा प्रॉपर्टी-टैक्स रसीद — किरायेदारों के लिए रजिस्टर्ड रेंट एग्रीमेंट और मालिक की NOC।</td></tr>
            <tr><td><strong>फोटो</strong></td><td>आवेदक की एक पासपोर्ट-साइज़ फोटो।</td></tr>
            <tr><td><strong>कृषि कनेक्शन</strong></td><td>ज़मीन का <strong>7/12 उतारा</strong> (सातबारा), और सब्सिडी योजना लागू होने पर जाति/योजना प्रमाणपत्र।</td></tr>
            <tr><td><strong>नज़दीकी उपभोक्ता नंबर</strong></td><td>दस्तावेज़ नहीं, पर WSS फॉर्म <em>सबसे नज़दीकी मौजूदा MSEDCL कनेक्शन</em> का उपभोक्ता नंबर माँगता है — पड़ोसी के बिल से आपका परिसर नेटवर्क पर तुरंत मिल जाता है। एक तैयार रखें।</td></tr>
          </tbody>
        </table></div>
        <p><strong>किरायेदार भी आवेदन कर सकते हैं।</strong> विद्युत अधिनियम, 2003 की धारा 43 आपूर्ति को
        परिसर में रहने वाले का अधिकार बनाती है; मालिक साथ साइन न करे तो रजिस्टर्ड रेंट एग्रीमेंट और
        क्षतिपूर्ति शपथपत्र सामान्य रास्ता है।</p>
      </section>

      <section class="seo-section">
        <h2>3. WSS आवेदन, स्टेप-बाय-स्टेप</h2>
        <ol>
          <li><strong>New Connection Request खोलें:</strong>
          <a href="https://wss.mahadiscom.in/wss/" rel="nofollow noopener" target="_blank">wss.mahadiscom.in</a>
          पर, और उपभोक्ता श्रेणी (घरेलू / वाणिज्यिक / औद्योगिक / कृषि) व सप्लाई प्रकार चुनें।</li>
          <li><strong>आवेदन भरें:</strong> आवेदक विवरण, लैंडमार्क सहित पूरा पता, नज़दीकी उपभोक्ता नंबर,
          और <strong>माँगा गया भार kW में</strong>। उतना ही माँगें जितनी वाकई ज़रूरत है — फिक्स्ड चार्ज हर
          महीने स्वीकृत भार पर लगता है; आकार तय करने के लिए हमारी
          <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">फिक्स्ड चार्ज गाइड</a> देखें।</li>
          <li><strong>OTP से मोबाइल सत्यापित करें, दस्तावेज़ अपलोड करें, आवेदन शुल्क</strong> ऑनलाइन भरें।
          Service Request ID मिलती है — सँभालकर रखें।</li>
          <li><strong>साइट निरीक्षण।</strong> MSEDCL इंजीनियर व्यवहार्यता देखता है — मौजूदा लाइन से काम
          चलेगा या विस्तार लगेगा।</li>
          <li><strong>फर्म कोटेशन (डिमांड नोट)।</strong> MERC की शुल्क अनुसूची के अनुसार सर्विस कनेक्शन
          शुल्क, सिक्योरिटी डिपॉज़िट और मीटर शुल्क का देय एस्टीमेट जारी होता है। Service Request ID पर
          ऑनलाइन भरें।</li>
          <li><strong>मीटर लगना और सप्लाई चालू।</strong> 12 अंकों का उपभोक्ता नंबर अगले चक्र के पहले बिल
          के साथ आता है।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना — तीन अलग भुगतान</h2>
        <ol>
          <li><strong>आवेदन / प्रोसेसिंग शुल्क</strong> — छोटा, जमा करते समय; श्रेणी और भार से बदलता है।</li>
          <li><strong>फर्म कोटेशन</strong> — असली लागत: MERC की शुल्क अनुसूची के सर्विस कनेक्शन शुल्क,
          पोल या केबल जुड़ने पर ज़्यादा। मौजूदा लाइन के पास छोटे घरेलू भार का सामान्य-शुल्क कनेक्शन आम
          तौर पर कुछ हज़ार रुपये में हो जाता है।</li>
          <li><strong>सिक्योरिटी डिपॉज़िट</strong> — मोटे तौर पर आपकी अपेक्षित बिलिंग के हिसाब से (MERC
          सप्लाई कोड इसे बिलिंग चक्र की औसत खपत के आसपास रखता है), स्थायी विच्छेदन पर ब्याज सहित
          वापसी-योग्य।</li>
        </ol>
        <p>हम जानबूझकर रुपये की तालिकाएँ नहीं छापते — MERC शुल्क अनुसूची संशोधित करता रहता है, और
        <em>आपके</em> परिसर के लिए पोर्टल पर दिखा फर्म कोटेशन ही एकमात्र मायने रखने वाला आँकड़ा है।
        आवेदन शुल्क के अलावा कुछ भी उसे देखे बिना देय नहीं है।</p>
      </section>

      <section class="seo-section">
        <h2>5. MSEDCL कानूनन कितने दिन ले सकता है</h2>
        <ul>
          <li>केंद्रीय <strong>विद्युत (उपभोक्ता अधिकार) नियम, 2020</strong>: पूर्ण व भुगतान हो चुके आवेदन
          पर <strong>महानगरों में 7 दिन</strong> (पुणे, नागपुर और MSEDCL द्वारा सर्व किया जाने वाला
          मुंबई-क्षेत्र का नगरीय इलाका), <strong>अन्य नगरीय क्षेत्रों में 15 दिन और ग्रामीण क्षेत्रों में
          30 दिन</strong>।</li>
          <li>जहाँ वाकई <strong>लाइन विस्तार</strong> लगे, वहाँ MERC के Standards of Performance नियम
          लंबी पर प्रकाशित समयसीमाएँ देते हैं — घड़ी और चूक का मुआवज़ा दोनों वहीं तय हैं, खुले नहीं।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. आवेदन अटक गया? शिकायत की सीढ़ी</h2>
        <ol>
          <li><strong>पहले ऑनलाइन ट्रैक करें:</strong> WSS पोर्टल Service Request का चरण दिखाता है
          (निरीक्षण → कोटेशन → भुगतान → इंस्टॉलेशन)।</li>
          <li><strong>1912 / 1800-233-3435 / 1800-212-3435</strong> — Mahavitaran की 24×7 हेल्पलाइनें;
          Service Request ID बताकर शिकायत नंबर लें।</li>
          <li><strong>कोटेशन पर लिखा सेक्शन/उपखंड कार्यालय</strong> — लंबित साइट विज़िट और सामग्री की
          कमी ही आम रुकावटें हैं।</li>
          <li><strong>IGRC → CGRF → विद्युत लोकपाल</strong> — पहले MSEDCL की आंतरिक शिकायत निवारण
          इकाई, फिर उपभोक्ता शिकायत निवारण मंच, फिर लोकपाल (मुंबई/नागपुर)। सब निःशुल्क, और वैधानिक
          समयसीमा बीतने पर Standards-of-Performance मुआवज़ा लागू होता है।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. मीटर लगने के बाद — पहला बिल जाँचें</h2>
        <p>गलत श्रेणी और भार नए कनेक्शन पर ही जन्म लेते हैं। पहले बिल पर टैरिफ श्रेणी (घर के लिए LT-1
        घरेलू), आवेदन वाला स्वीकृत भार और मीटर नंबर जाँचें। फिर अपनी यूनिटें हमारे
        <a href="/?state=Maharashtra#calculator">MSEDCL बिल कैलकुलेटर</a> में डालें — यह मौजूदा स्लैब,
        व्हीलिंग, फिक्स्ड चार्ज और FAC का वही गणित लगाता है और असली Mahavitaran बिलों से सत्यापित है —
        और मिलान करें। हर लाइन के लिए
        <a href="/hi/guides/how-to-read-msedcl-bill/">MSEDCL बिल पढ़ने की गाइड</a> देखें, ईंधन अधिभार के
        लिए <a href="/hi/guides/msedcl-fppa-charges-explained/">FAC/FPPA गाइड</a>, और संदिग्ध पहले बिल
        की <a href="/bill-review/">Bill Review</a> से निःशुल्क जाँच कराएँ।</p>
      </section>`,
    faqsHi: [
      { q: 'MSEDCL का नया कनेक्शन ऑनलाइन कैसे लें?',
        a: 'Mahavitaran के WSS पोर्टल (wss.mahadiscom.in) पर New Connection Request खोलें: श्रेणी चुनें, पता और माँगा गया भार kW में भरें, OTP से मोबाइल सत्यापित करें, पहचान व स्वामित्व दस्तावेज़ अपलोड करें और आवेदन शुल्क भरें। ट्रैकिंग के लिए Service Request ID मिलती है; फर्म कोटेशन जारी होने पर भरें, फिर मीटर लगता है।' },
      { q: 'Mahavitaran नए कनेक्शन के लिए कौन से दस्तावेज़ चाहिए?',
        a: 'पहचान प्रमाण (आधार, वोटर ID, पासपोर्ट, ड्राइविंग लाइसेंस या PAN), परिसर प्रमाण (सेल डीड/Index-II, प्रॉपर्टी कार्ड या प्रॉपर्टी-टैक्स रसीद; किरायेदारों के लिए रजिस्टर्ड रेंट एग्रीमेंट और मालिक की NOC), और एक फोटो। कृषि आवेदकों को ज़मीन का 7/12 उतारा भी चाहिए।' },
      { q: 'MSEDCL नए कनेक्शन का खर्च कितना है?',
        a: 'तीन भुगतान: जमा करते समय छोटा आवेदन शुल्क, फर्म कोटेशन (MERC शुल्क अनुसूची के सर्विस कनेक्शन शुल्क — मौजूदा लाइन के पास छोटे घरेलू भार पर आम तौर पर कुछ हज़ार रुपये, पोल/केबल जुड़ने पर ज़्यादा), और अपेक्षित खपत के हिसाब से वापसी-योग्य सिक्योरिटी डिपॉज़िट।' },
      { q: 'MSEDCL नया कनेक्शन कितने दिन में देता है?',
        a: 'विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत पूर्ण व भुगतान हो चुके आवेदन पर महानगरों में 7 दिन, अन्य नगरीय क्षेत्रों में 15 दिन और ग्रामीण क्षेत्रों में 30 दिन। लाइन विस्तार लगने पर MERC के Standards of Performance लंबी पर तय समयसीमाएँ और चूक पर मुआवज़ा देते हैं।' },
      { q: 'MSEDCL आवेदन में नज़दीकी उपभोक्ता नंबर क्यों माँगा जाता है?',
        a: 'WSS फॉर्म सबसे नज़दीकी मौजूदा MSEDCL कनेक्शन का उपभोक्ता नंबर माँगता है — आम तौर पर पड़ोसी का। इससे आपका परिसर वितरण नेटवर्क पर तुरंत मिल जाता है और व्यवहार्यता जाँच व एस्टीमेट तेज़ और सटीक बनते हैं।' },
    ],

    titleMr: 'MSEDCL (महावितरण) मध्ये नवीन वीज जोडणी ऑनलाइन कशी घ्यावी',
    metaTitleMr: 'MSEDCL नवीन जोडणी ऑनलाइन — WSS पोर्टल: कागदपत्रे, शुल्क, कालमर्यादा',
    descriptionMr: 'WSS पोर्टलवरून नवीन MSEDCL/महावितरण वीज जोडणी घेण्याची स्टेप-बाय-स्टेप मार्गदर्शिका: कागदपत्रांची यादी (शेतीसाठी 7/12 उताऱ्यासह), अर्ज प्रक्रिया, फर्म कोटेशन आणि सुरक्षा ठेव, कायदेशीर कालमर्यादा, आणि अर्ज रखडल्यास तक्रारीची शिडी।',
    introMr: `मुंबई शहर वगळता जवळपास संपूर्ण महाराष्ट्राला महावितरण (MSEDCL) वीज पुरवते, आणि नवीन
      जोडणीसाठी आता सेक्शन ऑफिसमधील A-1 फॉर्मची रांग गरजेची नाही. <strong>Web Self Service (WSS)
      पोर्टल</strong>
      (<a href="https://wss.mahadiscom.in/wss/" rel="nofollow noopener" target="_blank">wss.mahadiscom.in</a>)
      घरगुती, व्यावसायिक, औद्योगिक आणि कृषी जोडण्यांसाठी अर्ज, कागदपत्र अपलोड, भरणा आणि स्थिती
      ट्रॅकिंग ऑनलाइन करते. ही मार्गदर्शिका संपूर्ण प्रक्रिया समजावते — आधी काय स्कॅन करावे, कोणते तीन
      भरणे होतात, MSEDCL ला कायद्याने किती दिवस मिळतात, आणि काहीच हलले नाही तर कोणावर दबाव आणावा.`,
    sectionsMr: `
      <section class="seo-section">
        <h2>1. अर्जाचे दोन मार्ग — पोर्टल किंवा A-1 फॉर्म</h2>
        <ul>
          <li><strong>ऑनलाइन (शिफारसीय):</strong> WSS पोर्टलचा <em>New Connection Request</em> फ्लो
          आधी खाते न बनवताही चालतो — सबमिट करताच <strong>Service Request ID</strong> मिळतो, ज्याने
          पुढचे सर्व ट्रॅक होते. भरणा आणि कागदपत्र अपलोड सुरुवातीपासून शेवटपर्यंत ऑनलाइन.</li>
          <li><strong>ऑफलाइन:</strong> सेक्शन ऑफिसमधील पारंपरिक <strong>A-1 अर्ज</strong> अजूनही चालतो
          आणि त्याच शुल्क-सूची व कालमर्यादांचे पालन करतो.</li>
        </ul>
        <p>सीमा लक्षात ठेवा: मुंबई शहरात BEST, Adani Electricity आणि Tata Power वीज पुरवतात —
        MSEDCL नाही. अर्जापूर्वी आमच्या
        <a href="/mr/tariffs/maharashtra/">महाराष्ट्र टॅरिफ पानांवर</a> तुमचा पत्ता कोण सर्व्ह करते
        ते पाहा.</p>
      </section>

      <section class="seo-section">
        <h2>2. कागदपत्रे — सुरुवात करण्यापूर्वी स्कॅन करून ठेवा</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>गरज</th><th>मान्य कागदपत्रे</th></tr></thead>
          <tbody>
            <tr><td><strong>ओळखीचा पुरावा</strong></td><td>आधार, मतदार ओळखपत्र, पासपोर्ट, ड्रायव्हिंग लायसन्स किंवा PAN.</td></tr>
            <tr><td><strong>जागा / मालकीचा पुरावा</strong></td><td>खरेदीखत किंवा Index-II, प्रॉपर्टी कार्ड, ताजी मालमत्ता-कर पावती — भाडेकरूंसाठी नोंदणीकृत भाडेकरार आणि मालकाची NOC.</td></tr>
            <tr><td><strong>छायाचित्र</strong></td><td>अर्जदाराचा एक पासपोर्ट-साइझ फोटो.</td></tr>
            <tr><td><strong>कृषी जोडणी</strong></td><td>जमिनीचा <strong>7/12 उतारा</strong> (सातबारा), आणि अनुदान योजना लागू असल्यास जात/योजना प्रमाणपत्रे.</td></tr>
            <tr><td><strong>जवळचा ग्राहक क्रमांक</strong></td><td>कागदपत्र नाही, पण WSS फॉर्म <em>सर्वात जवळच्या विद्यमान MSEDCL जोडणीचा</em> ग्राहक क्रमांक विचारतो — शेजाऱ्याच्या बिलाने तुमची जागा नेटवर्कवर लगेच सापडते. एक तयार ठेवा.</td></tr>
          </tbody>
        </table></div>
        <p><strong>भाडेकरूही अर्ज करू शकतात.</strong> विद्युत कायदा, 2003 चे कलम 43 वीजपुरवठा हा
        जागेत राहणाऱ्याचा (occupier) हक्क बनवते; मालक सही करत नसेल तर नोंदणीकृत भाडेकरार आणि
        क्षतिपूर्ती प्रतिज्ञापत्र हा नेहमीचा मार्ग आहे.</p>
      </section>

      <section class="seo-section">
        <h2>3. WSS अर्ज, स्टेप-बाय-स्टेप</h2>
        <ol>
          <li><strong>New Connection Request उघडा:</strong>
          <a href="https://wss.mahadiscom.in/wss/" rel="nofollow noopener" target="_blank">wss.mahadiscom.in</a>
          वर, आणि ग्राहक वर्ग (घरगुती / व्यावसायिक / औद्योगिक / कृषी) व पुरवठा प्रकार निवडा.</li>
          <li><strong>अर्ज भरा:</strong> अर्जदाराचे तपशील, लँडमार्कसह पूर्ण पत्ता, जवळचा ग्राहक क्रमांक,
          आणि <strong>मागितलेला भार kW मध्ये</strong>. खरोखर गरज आहे तेवढाच मागा — स्थिर आकार दर महिन्याला
          मंजूर भारावर लागतो; आकार ठरवण्यासाठी आमची
          <a href="/mr/guides/reduce-fixed-charges-sanctioned-load/">स्थिर आकार मार्गदर्शिका</a> पाहा.</li>
          <li><strong>OTP ने मोबाइल पडताळा, कागदपत्रे अपलोड करा, अर्ज शुल्क</strong> ऑनलाइन भरा.
          Service Request ID मिळतो — जपून ठेवा.</li>
          <li><strong>जागेची पाहणी.</strong> MSEDCL अभियंता व्यवहार्यता तपासतो — विद्यमान लाइनने काम
          होईल की विस्तार लागेल.</li>
          <li><strong>फर्म कोटेशन (डिमांड नोट).</strong> MERC च्या शुल्क अनुसूचीनुसार सर्व्हिस कनेक्शन
          शुल्क, सुरक्षा ठेव आणि मीटर शुल्काचा देय अंदाज जारी होतो. Service Request ID वर ऑनलाइन भरा.</li>
          <li><strong>मीटर बसणे आणि वीजपुरवठा सुरू.</strong> 12 अंकी ग्राहक क्रमांक पुढील चक्राच्या
          पहिल्या बिलासोबत येतो.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च किती — तीन वेगळे भरणे</h2>
        <ol>
          <li><strong>अर्ज / प्रक्रिया शुल्क</strong> — लहान, सबमिट करताना; वर्ग आणि भारानुसार बदलते.</li>
          <li><strong>फर्म कोटेशन</strong> — खरी किंमत: MERC च्या शुल्क अनुसूचीतील सर्व्हिस कनेक्शन शुल्क,
          खांब किंवा केबल जोडावी लागल्यास जास्त. विद्यमान लाइनजवळ लहान घरगुती भाराची सामान्य-शुल्क जोडणी
          साधारण काही हजार रुपयांत होते.</li>
          <li><strong>सुरक्षा ठेव</strong> — साधारण तुमच्या अपेक्षित बिलिंगच्या प्रमाणात (MERC चा पुरवठा
          संहिता तिला बिलिंग चक्राच्या सरासरी वापराभोवती ठेवतो), कायम खंडित करतेवेळी व्याजासह परत.</li>
        </ol>
        <p>आम्ही मुद्दाम रुपयांची कोष्टके छापत नाही — MERC शुल्क अनुसूची सुधारत राहते, आणि
        <em>तुमच्या</em> जागेसाठी पोर्टलवर दिसणारे फर्म कोटेशन हाच एकमेव महत्त्वाचा आकडा. अर्ज
        शुल्काशिवाय ते न पाहता काहीही देय नाही.</p>
      </section>

      <section class="seo-section">
        <h2>5. MSEDCL कायद्याने किती दिवस घेऊ शकते</h2>
        <ul>
          <li>केंद्रीय <strong>विद्युत (ग्राहक हक्क) नियम, 2020</strong>: पूर्ण व भरणा झालेल्या अर्जावर
          <strong>महानगरांत 7 दिवस</strong> (पुणे, नागपूर आणि MSEDCL सर्व्ह करत असलेला मुंबई-क्षेत्रातील
          नागरी पट्टा), <strong>इतर नगरपालिका क्षेत्रांत 15 दिवस आणि ग्रामीण भागांत 30 दिवस</strong>.</li>
          <li>जिथे खरोखर <strong>लाइन विस्तार</strong> लागतो, तिथे MERC चे Standards of Performance
          नियम अधिक पण प्रकाशित कालमर्यादा देतात — घड्याळ आणि चुकल्यास भरपाई दोन्ही तिथेच ठरलेली,
          खुली नाही.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. अर्ज रखडला? तक्रारीची शिडी</h2>
        <ol>
          <li><strong>आधी ऑनलाइन ट्रॅक करा:</strong> WSS पोर्टल Service Request चा टप्पा दाखवते
          (पाहणी → कोटेशन → भरणा → इंस्टॉलेशन).</li>
          <li><strong>1912 / 1800-233-3435 / 1800-212-3435</strong> — महावितरणच्या 24×7 हेल्पलाइन;
          Service Request ID सांगून तक्रार क्रमांक घ्या.</li>
          <li><strong>कोटेशनवर लिहिलेले सेक्शन/उपविभाग कार्यालय</strong> — प्रलंबित पाहणी आणि साहित्याची
          कमतरता याच नेहमीच्या अडचणी.</li>
          <li><strong>IGRC → CGRF → विद्युत लोकपाल</strong> — आधी MSEDCL ची अंतर्गत तक्रार निवारण
          यंत्रणा, मग ग्राहक तक्रार निवारण मंच, मग लोकपाल (मुंबई/नागपूर). सर्व मोफत, आणि वैधानिक
          कालमर्यादा उलटल्यावर Standards-of-Performance भरपाई लागू होते.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. मीटर बसल्यावर — पहिले बिल तपासा</h2>
        <p>चुकीचा वर्ग आणि भार नव्या जोडणीवरच जन्म घेतात. पहिल्या बिलावर टॅरिफ वर्ग (घरासाठी LT-1
        घरगुती), अर्जातील मंजूर भार आणि मीटर क्रमांक तपासा. मग तुमची युनिटे आमच्या
        <a href="/?state=Maharashtra#calculator">MSEDCL बिल कॅल्क्युलेटर</a> मध्ये टाका — तो सध्याचे
        स्लॅब, व्हीलिंग, स्थिर आकार आणि FAC चे तेच गणित करतो आणि खऱ्या महावितरण बिलांशी पडताळलेला
        आहे — आणि तुलना करा. प्रत्येक ओळीसाठी
        <a href="/mr/guides/how-to-read-msedcl-bill/">MSEDCL बिल वाचण्याची मार्गदर्शिका</a> पाहा,
        इंधन अधिभारासाठी <a href="/mr/guides/msedcl-fppa-charges-explained/">FAC/FPPA मार्गदर्शिका</a>,
        आणि संशयास्पद पहिल्या बिलाची <a href="/bill-review/">Bill Review</a> कडून मोफत तपासणी करा.</p>
      </section>`,
    faqsMr: [
      { q: 'MSEDCL ची नवीन जोडणी ऑनलाइन कशी घ्यावी?',
        a: 'महावितरणच्या WSS पोर्टलवर (wss.mahadiscom.in) New Connection Request उघडा: वर्ग निवडा, पत्ता आणि मागितलेला भार kW मध्ये भरा, OTP ने मोबाइल पडताळा, ओळख व मालकीची कागदपत्रे अपलोड करा आणि अर्ज शुल्क भरा. ट्रॅकिंगसाठी Service Request ID मिळतो; फर्म कोटेशन जारी झाल्यावर भरा, मग मीटर बसते.' },
      { q: 'महावितरण नवीन जोडणीसाठी कोणती कागदपत्रे लागतात?',
        a: 'ओळखीचा पुरावा (आधार, मतदार ओळखपत्र, पासपोर्ट, ड्रायव्हिंग लायसन्स किंवा PAN), जागेचा पुरावा (खरेदीखत/Index-II, प्रॉपर्टी कार्ड किंवा मालमत्ता-कर पावती; भाडेकरूंसाठी नोंदणीकृत भाडेकरार आणि मालकाची NOC), आणि एक फोटो. कृषी अर्जदारांना जमिनीचा 7/12 उताराही लागतो.' },
      { q: 'MSEDCL नवीन जोडणीचा खर्च किती?',
        a: 'तीन भरणे: सबमिट करताना लहान अर्ज शुल्क, फर्म कोटेशन (MERC शुल्क अनुसूचीतील सर्व्हिस कनेक्शन शुल्क — विद्यमान लाइनजवळ लहान घरगुती भारासाठी साधारण काही हजार रुपये, खांब/केबल लागल्यास जास्त), आणि अपेक्षित वापराच्या प्रमाणात परत मिळणारी सुरक्षा ठेव.' },
      { q: 'MSEDCL नवीन जोडणी किती दिवसांत देते?',
        a: 'विद्युत (ग्राहक हक्क) नियम, 2020 नुसार पूर्ण व भरणा झालेल्या अर्जावर महानगरांत 7 दिवस, इतर नगरपालिका क्षेत्रांत 15 दिवस आणि ग्रामीण भागांत 30 दिवस. लाइन विस्तार लागल्यास MERC चे Standards of Performance अधिक पण ठरलेल्या कालमर्यादा आणि चुकल्यास भरपाई देतात.' },
      { q: 'MSEDCL अर्जात जवळचा ग्राहक क्रमांक का विचारला जातो?',
        a: 'WSS फॉर्म सर्वात जवळच्या विद्यमान MSEDCL जोडणीचा ग्राहक क्रमांक विचारतो — सहसा शेजाऱ्याचा. त्याने तुमची जागा वितरण नेटवर्कवर लगेच सापडते आणि व्यवहार्यता तपासणी व अंदाज वेगवान आणि अचूक होतात.' },
    ],
  },
  {
    slug: 'bses-delhi-new-connection',
    published: "2026-05-06",
    states: ['Delhi'],
    title: 'How to Get a New BSES Electricity Connection in Delhi (BRPL / BYPL)',
    metaTitle: 'BSES New Connection Online — Delhi: Documents, Charges, 7-Day Timeline',
    description: 'Step-by-step guide to a new BSES electricity connection in Delhi: BRPL vs BYPL areas, the online application on bsesdelhi.com, the DERC document checklist (tenants included), demand note and security deposit, the 7-day metro timeline, and what to do when it stalls.',
    minutes: 7,
    intro: `Delhi's new-connection process is among the fastest in India on paper — the capital counts
      as a metropolitan area, so a completed application must be energised in days, not weeks. This
      guide covers the two BSES DISCOMs — <strong>BRPL</strong> (BSES Rajdhani, south and west Delhi)
      and <strong>BYPL</strong> (BSES Yamuna, central and east Delhi) — from the online application on
      <a href="https://www.bsesdelhi.com/" rel="nofollow noopener" target="_blank">bsesdelhi.com</a>
      through the demand note, meter installation and the first-bill checks that catch expensive
      category mistakes early.`,
    sections: `
      <section class="seo-section">
        <h2>1. First, confirm BSES actually serves you</h2>
        <p>Delhi is split three ways: <strong>BRPL</strong> covers south and west Delhi (Alaknanda
        to Dwarka), <strong>BYPL</strong> covers central and east Delhi (Chandni Chowk to Mayur
        Vihar), and <strong>Tata Power DDL</strong> serves north and north-west Delhi. The NDMC area
        (Lutyens' Delhi) has its own supply. A neighbour's bill settles it instantly — or check our
        <a href="/tariffs/delhi/">Delhi tariff pages</a> for the DISCOM-wise split. The
        bsesdelhi.com portal makes you pick BRPL or BYPL at the start, and an application to the
        wrong company is simply rejected days later.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents — the DERC checklist</h2>
        <p>BSES follows the Delhi Electricity Regulatory Commission (DERC) Supply Code, which keeps
        the list short:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, PAN, driving licence, or any government photo ID.</td></tr>
            <tr><td><strong>Ownership / occupancy proof</strong></td><td>Registered sale deed, conveyance deed, property-tax receipt, or possession letter. Tenants: registered rent agreement plus an indemnity bond — ownership of the premises is <em>not</em> required for a connection.</td></tr>
            <tr><td><strong>Photograph</strong></td><td>One passport-size photo (captured digitally at a Seva Kendra if you apply offline).</td></tr>
          </tbody>
        </table></div>
        <p>Two Delhi-specific notes: a connection does <strong>not</strong> confer ownership rights
        on the premises (the application form says so explicitly, which is why landlords' fears
        about tenant connections are misplaced), and unauthorised-colony premises are eligible
        under their own DERC-notified terms.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step</h2>
        <ol>
          <li><strong>Apply online:</strong> on
          <a href="https://www.bsesdelhi.com/" rel="nofollow noopener" target="_blank">bsesdelhi.com</a>,
          pick your DISCOM (BRPL/BYPL) → <em>New Connection</em>, register with your mobile number,
          fill the form, choose category (domestic/non-domestic) and the load you need, and upload
          documents. The same request can be raised on the <strong>BSES mobile app</strong> or the
          24×7 call centre <strong>19123</strong>.</li>
          <li><strong>Size the load honestly.</strong> Delhi's domestic fixed charges are billed per
          kW of sanctioned load, and the subsidy slabs make over-declaring doubly wasteful. Our
          <a href="/guides/reduce-fixed-charges-sanctioned-load/">fixed-charges guide</a> shows how
          to estimate from your appliances.</li>
          <li><strong>Site inspection.</strong> A BSES team verifies the premises and feasibility;
          for standard urban connections near the network this is quick.</li>
          <li><strong>Demand note.</strong> BSES issues the payable amount — service-line and
          development (SLD) charges per DERC's schedule plus the <strong>security deposit</strong>
          (Advance Consumption Deposit), which scales with load and category. Pay it online.</li>
          <li><strong>Meter installation.</strong> The connection is energised within
          <strong>7 working days of demand-note payment</strong> for standard cases; your CA
          (contract account) number arrives by SMS.</li>
          <li><strong>Offline fallback:</strong> the <strong>Seva Kendra / connection desk</strong>
          at divisional offices fills the same online form for you, capturing photo and signature
          on the spot — useful when documents need explaining.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs</h2>
        <ol>
          <li><strong>Application/processing charges</strong> — nominal, per DERC's schedule of
          miscellaneous charges.</li>
          <li><strong>SLD charges</strong> — the normative service-line-cum-development charge for
          LT connections, a per-kW amount set by DERC rather than a made-up estimate, which keeps
          small-connection costs predictable.</li>
          <li><strong>Security deposit (ACD)</strong> — sized to expected consumption for the
          billing cycle, refundable with interest and revised annually against your actual usage.</li>
        </ol>
        <p>As always we skip rupee tables — DERC revises the schedules, and the demand note the
        portal generates for <em>your</em> load is the number that matters. Nothing beyond the
        processing fee is payable before you see it.</p>
      </section>

      <section class="seo-section">
        <h2>5. The timeline Delhi is entitled to</h2>
        <ul>
          <li>All of Delhi is a <strong>metropolitan area</strong> under the Electricity (Rights of
          Consumers) Rules, 2020 — a complete application must be energised within
          <strong>7 days</strong>.</li>
          <li>DERC's own Supply Code and performance standards mirror this, with compensation per
          day of default where the delay is the DISCOM's.</li>
          <li>Where network extension is genuinely needed, the published DERC timelines apply
          instead — longer, but fixed and compensable, not open-ended.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. Application stuck? The escalation ladder</h2>
        <ol>
          <li><strong>Track online</strong> — the portal/app shows the request stage against your
          application number.</li>
          <li><strong>19123</strong> — the BSES 24×7 helpline (BRPL and BYPL both); always take a
          complaint number.</li>
          <li><strong>The division's Seva Kendra</strong> — face-to-face resolution for document
          disputes, which cause most Delhi rejections.</li>
          <li><strong>CGRF</strong> — each BSES DISCOM has a Consumer Grievance Redressal Forum,
          then the <strong>Delhi Electricity Ombudsman</strong>. Free, and the DERC compensation
          schedule applies once the 7-day clock has lapsed.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. After the meter — check your first bill</h2>
        <p>Verify three things on the first bill: the tariff category (domestic, not the costlier
        non-domestic), the sanctioned load you applied for, and that the <strong>Delhi subsidy</strong>
        is applied if you're eligible — up to 200 units free and 201–400 half-rate (capped), which
        makes a wrongly categorised first bill very visible. Then put your units into our
        <a href="/?state=Delhi#calculator">Delhi bill calculator</a>, which models the slabs, fixed
        charges, PPAC and the subsidy, and compare. Our
        <a href="/guides/how-to-read-bses-delhi-bill/">BSES bill-reading guide</a> decodes every
        line, and <a href="/bill-review/">Bill Review</a> checks a suspicious first bill for free.</p>
      </section>`,
    faqs: [
      { q: 'How do I apply for a new BSES connection in Delhi?',
        a: 'On bsesdelhi.com pick your DISCOM (BRPL for south/west Delhi, BYPL for central/east), open New Connection, register with your mobile number, fill the form with category and load, and upload identity and ownership/occupancy documents. The same request works via the BSES app or the 24×7 helpline 19123, and Seva Kendras handle it in person.' },
      { q: 'What documents are needed for a BSES new connection?',
        a: 'One government photo ID (Aadhaar, voter ID, passport, PAN or driving licence), ownership or occupancy proof (sale deed, property-tax receipt, possession letter — or registered rent agreement plus indemnity bond for tenants), and a passport-size photo. A connection does not confer ownership rights on the premises.' },
      { q: 'Can a tenant get a BSES connection without the landlord?',
        a: 'Yes. Supply is the occupier’s right under Section 43 of the Electricity Act, 2003, and DERC’s rules accept a registered rent agreement with an indemnity bond. The connection explicitly creates no ownership rights, so a landlord’s NOC is helpful but not a legal precondition.' },
      { q: 'How many days does a new BSES connection take?',
        a: 'Delhi is a metropolitan area under the Electricity (Rights of Consumers) Rules, 2020, so a complete application must be energised within 7 days; BSES commits to 7 working days from demand-note payment for standard cases. Network-extension cases follow DERC’s published longer timelines with compensation for default.' },
      { q: 'What are SLD charges in a BSES demand note?',
        a: 'Service-Line-cum-Development charges — the normative per-kW amount DERC lets the DISCOM collect toward the service line and network development for new LT connections. They appear in the demand note alongside the refundable security deposit (Advance Consumption Deposit).' },
    ],

    titleHi: 'दिल्ली में नया BSES बिजली कनेक्शन कैसे लें (BRPL / BYPL)',
    metaTitleHi: 'BSES नया कनेक्शन ऑनलाइन — दिल्ली: दस्तावेज़, शुल्क, 7-दिन समयसीमा',
    descriptionHi: 'दिल्ली में नया BSES बिजली कनेक्शन लेने की स्टेप-बाय-स्टेप गाइड: BRPL बनाम BYPL क्षेत्र, bsesdelhi.com पर ऑनलाइन आवेदन, DERC दस्तावेज़ सूची (किरायेदार सहित), डिमांड नोट और सिक्योरिटी डिपॉज़िट, 7-दिन की मेट्रो समयसीमा, और अटकने पर क्या करें।',
    introHi: `कागज़ पर दिल्ली की नई-कनेक्शन प्रक्रिया भारत में सबसे तेज़ में से है — राजधानी महानगर
      क्षेत्र गिनी जाती है, इसलिए पूर्ण आवेदन हफ़्तों में नहीं, दिनों में चालू होना अनिवार्य है। यह गाइड
      BSES की दोनों DISCOM — <strong>BRPL</strong> (BSES राजधानी, दक्षिणी और पश्चिमी दिल्ली) और
      <strong>BYPL</strong> (BSES यमुना, मध्य और पूर्वी दिल्ली) — को कवर करती है:
      <a href="https://www.bsesdelhi.com/" rel="nofollow noopener" target="_blank">bsesdelhi.com</a>
      पर ऑनलाइन आवेदन से लेकर डिमांड नोट, मीटर इंस्टॉलेशन और पहले बिल की उन जाँचों तक जो महँगी
      श्रेणी-गलतियाँ शुरू में ही पकड़ लेती हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. पहले पक्का करें कि BSES ही आपको सप्लाई देती है</h2>
        <p>दिल्ली तीन हिस्सों में बँटी है: <strong>BRPL</strong> दक्षिणी और पश्चिमी दिल्ली (अलकनंदा से
        द्वारका), <strong>BYPL</strong> मध्य और पूर्वी दिल्ली (चांदनी चौक से मयूर विहार), और
        <strong>Tata Power DDL</strong> उत्तरी व उत्तर-पश्चिमी दिल्ली। NDMC क्षेत्र (लुटियंस दिल्ली) की
        अपनी सप्लाई है। पड़ोसी का बिल तुरंत बता देता है — या हमारे
        <a href="/hi/tariffs/delhi/">दिल्ली टैरिफ पेज</a> पर DISCOM-वार बँटवारा देखें। bsesdelhi.com
        पोर्टल शुरू में ही BRPL या BYPL चुनवाता है, और गलत कंपनी को गया आवेदन कुछ दिनों बाद बस
        अस्वीकार हो जाता है।</p>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़ — DERC की सूची</h2>
        <p>BSES दिल्ली विद्युत नियामक आयोग (DERC) के सप्लाई कोड का पालन करती है, जो सूची छोटी
        रखता है:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार, वोटर ID, पासपोर्ट, PAN, ड्राइविंग लाइसेंस, या कोई भी सरकारी फोटो ID।</td></tr>
            <tr><td><strong>स्वामित्व / अधिभोग प्रमाण</strong></td><td>रजिस्टर्ड सेल डीड, कन्वेयंस डीड, प्रॉपर्टी-टैक्स रसीद, या पज़ेशन लेटर। किरायेदार: रजिस्टर्ड रेंट एग्रीमेंट और क्षतिपूर्ति बॉन्ड — कनेक्शन के लिए परिसर का मालिक होना <em>ज़रूरी नहीं</em> है।</td></tr>
            <tr><td><strong>फोटो</strong></td><td>एक पासपोर्ट-साइज़ फोटो (ऑफलाइन आवेदन पर सेवा केंद्र में डिजिटल खींची जाती है)।</td></tr>
          </tbody>
        </table></div>
        <p>दिल्ली की दो खास बातें: कनेक्शन से परिसर पर <strong>मालिकाना हक़ नहीं</strong> बनता (आवेदन
        फॉर्म खुद यह लिखता है — इसीलिए किरायेदार के कनेक्शन को लेकर मकान मालिकों का डर बेवजह है),
        और अनधिकृत कॉलोनियों के परिसर DERC-अधिसूचित अपनी शर्तों पर पात्र हैं।</p>
      </section>

      <section class="seo-section">
        <h2>3. आवेदन, स्टेप-बाय-स्टेप</h2>
        <ol>
          <li><strong>ऑनलाइन आवेदन:</strong>
          <a href="https://www.bsesdelhi.com/" rel="nofollow noopener" target="_blank">bsesdelhi.com</a>
          पर अपनी DISCOM (BRPL/BYPL) → <em>New Connection</em> चुनें, मोबाइल नंबर से रजिस्टर करें,
          फॉर्म भरें, श्रेणी (घरेलू/गैर-घरेलू) और ज़रूरी भार चुनें, दस्तावेज़ अपलोड करें। यही अनुरोध
          <strong>BSES मोबाइल ऐप</strong> या 24×7 कॉल सेंटर <strong>19123</strong> से भी हो जाता है।</li>
          <li><strong>भार ईमानदारी से तय करें।</strong> दिल्ली के घरेलू फिक्स्ड चार्ज प्रति स्वीकृत kW
          लगते हैं, और सब्सिडी स्लैब की वजह से ज़्यादा भार घोषित करना दोहरा नुकसान है। उपकरणों से
          अनुमान लगाने के लिए हमारी
          <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">फिक्स्ड चार्ज गाइड</a> देखें।</li>
          <li><strong>साइट निरीक्षण।</strong> BSES टीम परिसर और व्यवहार्यता जाँचती है; नेटवर्क के पास
          के सामान्य शहरी कनेक्शनों में यह जल्दी होता है।</li>
          <li><strong>डिमांड नोट।</strong> BSES देय राशि जारी करती है — DERC की अनुसूची के अनुसार
          सर्विस-लाइन व डेवलपमेंट (SLD) शुल्क और <strong>सिक्योरिटी डिपॉज़िट</strong> (Advance
          Consumption Deposit), जो भार और श्रेणी से बढ़ता है। ऑनलाइन भरें।</li>
          <li><strong>मीटर इंस्टॉलेशन।</strong> सामान्य मामलों में डिमांड नोट भुगतान के
          <strong>7 कार्यदिवसों</strong> के भीतर कनेक्शन चालू; आपका CA (contract account) नंबर SMS
          से आता है।</li>
          <li><strong>ऑफलाइन विकल्प:</strong> मंडल कार्यालयों का <strong>सेवा केंद्र / कनेक्शन डेस्क</strong>
          वही ऑनलाइन फॉर्म आपके लिए भरता है, फोटो और हस्ताक्षर वहीं लेकर — दस्तावेज़ों पर सफ़ाई देनी
          हो तो उपयोगी।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना</h2>
        <ol>
          <li><strong>आवेदन/प्रोसेसिंग शुल्क</strong> — नाममात्र, DERC की विविध शुल्क अनुसूची से।</li>
          <li><strong>SLD शुल्क</strong> — LT कनेक्शनों के लिए DERC का तय प्रति-kW मानक सर्विस-लाइन-व-
          डेवलपमेंट शुल्क — मनगढ़ंत एस्टीमेट नहीं, इसीलिए छोटे कनेक्शन की लागत अनुमान योग्य रहती है।</li>
          <li><strong>सिक्योरिटी डिपॉज़िट (ACD)</strong> — बिलिंग चक्र की अपेक्षित खपत के अनुसार,
          ब्याज सहित वापसी-योग्य, और आपकी असल खपत के हिसाब से सालाना संशोधित।</li>
        </ol>
        <p>हम हमेशा की तरह रुपये की तालिकाएँ छोड़ रहे हैं — DERC अनुसूचियाँ संशोधित करता है, और
        <em>आपके</em> भार के लिए पोर्टल पर बना डिमांड नोट ही असल आँकड़ा है। प्रोसेसिंग फीस के अलावा
        उसे देखे बिना कुछ देय नहीं।</p>
      </section>

      <section class="seo-section">
        <h2>5. दिल्ली की हक़दारी वाली समयसीमा</h2>
        <ul>
          <li>विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत पूरी दिल्ली <strong>महानगर क्षेत्र</strong> है —
          पूर्ण आवेदन <strong>7 दिनों</strong> में चालू होना अनिवार्य।</li>
          <li>DERC का सप्लाई कोड और परफ़ॉर्मेंस मानक भी यही दोहराते हैं, और DISCOM की देरी पर
          प्रतिदिन मुआवज़ा तय है।</li>
          <li>जहाँ वाकई नेटवर्क विस्तार लगे, वहाँ DERC की प्रकाशित समयसीमाएँ लागू होती हैं — लंबी, पर
          तय और मुआवज़ा-योग्य, खुली नहीं।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. आवेदन अटक गया? शिकायत की सीढ़ी</h2>
        <ol>
          <li><strong>ऑनलाइन ट्रैक करें</strong> — पोर्टल/ऐप आवेदन नंबर पर अनुरोध का चरण दिखाता है।</li>
          <li><strong>19123</strong> — BSES की 24×7 हेल्पलाइन (BRPL और BYPL दोनों); शिकायत नंबर ज़रूर लें।</li>
          <li><strong>मंडल का सेवा केंद्र</strong> — दस्तावेज़ विवादों का आमने-सामने समाधान; दिल्ली में
          ज़्यादातर अस्वीकृतियाँ इन्हीं से होती हैं।</li>
          <li><strong>CGRF</strong> — हर BSES DISCOM का उपभोक्ता शिकायत निवारण मंच, फिर
          <strong>दिल्ली विद्युत लोकपाल</strong>। निःशुल्क, और 7-दिन की घड़ी बीतते ही DERC की मुआवज़ा
          अनुसूची लागू।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. मीटर लगने के बाद — पहला बिल जाँचें</h2>
        <p>पहले बिल पर तीन चीज़ें जाँचें: टैरिफ श्रेणी (घरेलू, महँगी गैर-घरेलू नहीं), आवेदन वाला स्वीकृत
        भार, और पात्र होने पर <strong>दिल्ली सब्सिडी</strong> लगी है या नहीं — 200 यूनिट तक मुफ़्त और
        201–400 आधी दर (कैप सहित), इसलिए गलत श्रेणी वाला पहला बिल साफ़ दिख जाता है। फिर अपनी
        यूनिटें हमारे <a href="/?state=Delhi#calculator">दिल्ली बिल कैलकुलेटर</a> में डालें — यह स्लैब,
        फिक्स्ड चार्ज, PPAC और सब्सिडी का गणित लगाता है — और मिलान करें। हर लाइन के लिए
        <a href="/hi/guides/how-to-read-bses-delhi-bill/">BSES बिल पढ़ने की गाइड</a> देखें, और संदिग्ध
        पहले बिल की <a href="/bill-review/">Bill Review</a> से निःशुल्क जाँच कराएँ।</p>
      </section>`,
    faqsHi: [
      { q: 'दिल्ली में नया BSES कनेक्शन कैसे लें?',
        a: 'bsesdelhi.com पर अपनी DISCOM चुनें (दक्षिण/पश्चिम दिल्ली के लिए BRPL, मध्य/पूर्व के लिए BYPL), New Connection खोलें, मोबाइल नंबर से रजिस्टर करें, श्रेणी व भार के साथ फॉर्म भरें और पहचान व स्वामित्व/अधिभोग दस्तावेज़ अपलोड करें। यही अनुरोध BSES ऐप या 24×7 हेल्पलाइन 19123 से भी होता है, और सेवा केंद्र इसे आमने-सामने कर देते हैं।' },
      { q: 'BSES नए कनेक्शन के लिए कौन से दस्तावेज़ चाहिए?',
        a: 'एक सरकारी फोटो ID (आधार, वोटर ID, पासपोर्ट, PAN या ड्राइविंग लाइसेंस), स्वामित्व या अधिभोग प्रमाण (सेल डीड, प्रॉपर्टी-टैक्स रसीद, पज़ेशन लेटर — किरायेदारों के लिए रजिस्टर्ड रेंट एग्रीमेंट और क्षतिपूर्ति बॉन्ड), और एक पासपोर्ट-साइज़ फोटो। कनेक्शन से परिसर पर मालिकाना हक़ नहीं बनता।' },
      { q: 'क्या किरायेदार मकान मालिक के बिना BSES कनेक्शन ले सकता है?',
        a: 'हाँ। विद्युत अधिनियम, 2003 की धारा 43 के तहत आपूर्ति परिसर में रहने वाले का अधिकार है, और DERC के नियम रजिस्टर्ड रेंट एग्रीमेंट व क्षतिपूर्ति बॉन्ड स्वीकार करते हैं। कनेक्शन से कोई मालिकाना हक़ नहीं बनता, इसलिए मकान मालिक की NOC मददगार है पर कानूनी शर्त नहीं।' },
      { q: 'BSES नया कनेक्शन कितने दिनों में मिलता है?',
        a: 'विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत दिल्ली महानगर क्षेत्र है, इसलिए पूर्ण आवेदन 7 दिनों में चालू होना अनिवार्य है; सामान्य मामलों में BSES डिमांड नोट भुगतान से 7 कार्यदिवसों का वादा करती है। नेटवर्क-विस्तार मामलों में DERC की प्रकाशित लंबी समयसीमाएँ और चूक पर मुआवज़ा लागू है।' },
      { q: 'BSES डिमांड नोट में SLD शुल्क क्या है?',
        a: 'Service-Line-cum-Development शुल्क — नए LT कनेक्शनों की सर्विस लाइन व नेटवर्क विकास के लिए DERC का तय प्रति-kW मानक शुल्क। यह डिमांड नोट में वापसी-योग्य सिक्योरिटी डिपॉज़िट (Advance Consumption Deposit) के साथ दिखता है।' },
    ],
  },
  {
    slug: 'tata-power-ddl-new-connection',
    published: "2026-05-18",
    states: ['Delhi'],
    title: 'How to Get a New Tata Power DDL Connection (North Delhi)',
    metaTitle: 'Tata Power DDL New Connection Online — Documents, Charges in First Bill',
    description: 'Step-by-step guide to a new Tata Power DDL electricity connection in north and north-west Delhi: the two-document online application, field inspection, why the demand-note charges arrive in your first bill, the 7-day metro timeline, and the escalation path when it stalls.',
    minutes: 7,
    intro: `Tata Power Delhi Distribution (TPDDL) serves north and north-west Delhi — Rohini,
      Pitampura, Model Town, Civil Lines, Narela and around — and runs one of the leanest
      new-connection flows in the country: <strong>two documents, an online form, and the connection
      charges billed in your first electricity bill</strong> rather than as an upfront demand-note
      payment. This guide walks the flow on
      <a href="https://www.tatapower-ddl.com/" rel="nofollow noopener" target="_blank">tatapower-ddl.com</a>,
      what the charges are, the 7-day clock Delhi is entitled to, and the first-bill checks that
      matter more here than anywhere — because that first bill also carries the connection charges.`,
    sections: `
      <section class="seo-section">
        <h2>1. Confirm TPDDL serves your address</h2>
        <p>Delhi is split three ways: <strong>Tata Power DDL</strong> covers north and north-west
        Delhi, while <strong>BRPL</strong> takes south/west and <strong>BYPL</strong> central/east —
        we cover those in the <a href="/guides/bses-delhi-new-connection/">BSES new-connection
        guide</a>. A neighbour's bill settles it instantly, or check the DISCOM split on our
        <a href="/tariffs/delhi/">Delhi tariff pages</a>. The tariff itself is the same
        DERC-approved schedule across all three, subsidy included — the difference is process,
        and TPDDL's is the most automated.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents — deliberately just two</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, PAN, driving licence, or any government photo ID.</td></tr>
            <tr><td><strong>Ownership / occupancy proof</strong></td><td>Registered sale deed, property-tax receipt, possession letter — or a registered rent agreement plus indemnity bond for tenants. As across Delhi, the connection confers no ownership rights on the premises.</td></tr>
          </tbody>
        </table></div>
        <p>That two-document list is a deliberate Ease-of-Doing-Business commitment, and the portal
        flags any deficit document against your application number rather than silently rejecting —
        watch for the SMS asking you to re-upload.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step</h2>
        <ol>
          <li><strong>Apply online</strong> at
          <a href="https://www.tatapower-ddl.com/" rel="nofollow noopener" target="_blank">tatapower-ddl.com</a>
          → <em>Apply New Connection</em>: pick domestic or non-domestic, fill the premises details
          and requested load, and upload the two documents. The <strong>19124</strong> helpline
          (or 1800-208-9124 from outside Delhi) and customer care centres take the same request.</li>
          <li><strong>Size the load honestly</strong> — fixed charges are billed per sanctioned kW
          monthly. Our <a href="/guides/reduce-fixed-charges-sanctioned-load/">fixed-charges
          guide</a> shows how to estimate from appliances.</li>
          <li><strong>Field inspection.</strong> A TPDDL team verifies the premises; for standard
          urban connections near the network this is the only physical step.</li>
          <li><strong>Meter installation and energisation.</strong> No upfront demand-note payment
          for standard cases — the connection is energised first.</li>
          <li><strong>Charges arrive in the first bill.</strong> The service-line/development
          charges and security deposit that other DISCOMs collect before connecting appear as
          line items in your first electricity bill instead. Budget for a first bill that is
          noticeably larger than a normal month.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs — same DERC schedule, different timing</h2>
        <ol>
          <li><strong>SLD charges</strong> — the DERC-set normative per-kW service-line-cum-
          development charge, identical in principle to the BSES demand note; TPDDL just defers
          it to the first bill.</li>
          <li><strong>Security deposit (ACD)</strong> — sized to expected billing-cycle consumption,
          refundable with interest, revised annually against actual usage.</li>
          <li><strong>Meter and miscellaneous charges</strong> — per DERC's schedule of charges.</li>
        </ol>
        <p>No rupee tables here as usual — DERC revises the schedules, and the amounts printed on
        your first bill are itemised and checkable against the DERC schedule in force.</p>
      </section>

      <section class="seo-section">
        <h2>5. The timeline north Delhi is entitled to</h2>
        <ul>
          <li>All of Delhi is <strong>metropolitan</strong> under the Electricity (Rights of
          Consumers) Rules, 2020 — a complete application must be energised within
          <strong>7 days</strong>.</li>
          <li>TPDDL's own EODB commitments for standard urban connections run on the same clock,
          and DERC's performance standards attach per-day compensation to DISCOM-caused delay.</li>
          <li>Genuine network-extension cases follow DERC's published longer-but-fixed timelines.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. Application stuck? The escalation ladder</h2>
        <ol>
          <li><strong>Track online</strong> against your application number — deficit-document
          flags are the most common silent stall; clear them first.</li>
          <li><strong>19124 / 1800-208-9124</strong> — TPDDL's 24×7 helpline, or
          tpddl@tatapower-ddl.com; always take a complaint number.</li>
          <li><strong>The district customer care centre</strong> for document disputes.</li>
          <li><strong>CGRF → Delhi Electricity Ombudsman</strong> — free, statutory, and the DERC
          compensation schedule applies once the 7-day clock lapses.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. The first bill matters double here</h2>
        <p>Because TPDDL bills the connection charges in the first bill, check it more carefully
        than usual: the tariff category (domestic, not non-domestic), the sanctioned load you
        applied for, the <strong>Delhi subsidy</strong> if eligible (up to 200 units free,
        201–400 half-rate, capped), and that the one-time SLD/deposit line items match what the
        application quoted. Separate the one-time charges, then put your units into our
        <a href="/?state=Delhi#calculator">Delhi bill calculator</a> — it models the slabs, fixed
        charges, PPAC and subsidy — and the recurring part should match. Our
        <a href="/guides/how-to-read-bses-delhi-bill/">Delhi bill-reading guide</a> decodes the
        line items (the DERC bill format is shared across DISCOMs), and
        <a href="/bill-review/">Bill Review</a> checks a suspicious first bill for free.</p>
      </section>`,
    faqs: [
      { q: 'How do I apply for a new Tata Power DDL connection?',
        a: 'Apply online at tatapower-ddl.com → Apply New Connection: choose domestic or non-domestic, enter premises details and requested load, and upload just two documents — a government photo ID and ownership/occupancy proof. The 19124 helpline and customer care centres take the same request, and field inspection follows before energisation.' },
      { q: 'Does Tata Power DDL take a demand note payment before connecting?',
        a: 'For standard cases, no — TPDDL energises the connection first and raises the demand-note charges (SLD charges, security deposit, meter charges per the DERC schedule) as line items in your first electricity bill. Expect that first bill to be noticeably larger than a normal month.' },
      { q: 'Which areas of Delhi does Tata Power DDL cover?',
        a: 'North and north-west Delhi — including Rohini, Pitampura, Shalimar Bagh, Model Town, Civil Lines, Azadpur, Badli and Narela. South and west Delhi are BRPL and central/east are BYPL; the tariff schedule and subsidy are the same DERC-approved ones across all three.' },
      { q: 'How many days does a Tata Power DDL new connection take?',
        a: 'Delhi is a metropolitan area under the Electricity (Rights of Consumers) Rules, 2020, so a complete application must be energised within 7 days. DERC’s performance standards attach per-day compensation to DISCOM-caused delay; genuine network-extension cases follow published longer timelines.' },
      { q: 'What documents does Tata Power DDL need for a new connection?',
        a: 'Two: a government photo ID (Aadhaar, voter ID, passport, PAN or driving licence) and ownership or occupancy proof (sale deed, property-tax receipt, possession letter — or registered rent agreement plus indemnity bond for tenants). Deficit documents are flagged by SMS against your application number for re-upload.' },
    ],

    titleHi: 'Tata Power DDL में नया बिजली कनेक्शन कैसे लें (उत्तरी दिल्ली)',
    metaTitleHi: 'Tata Power DDL नया कनेक्शन ऑनलाइन — दस्तावेज़, शुल्क पहले बिल में',
    descriptionHi: 'उत्तरी और उत्तर-पश्चिमी दिल्ली में नया Tata Power DDL बिजली कनेक्शन लेने की स्टेप-बाय-स्टेप गाइड: दो-दस्तावेज़ ऑनलाइन आवेदन, फील्ड निरीक्षण, डिमांड-नोट शुल्क पहले बिल में क्यों आते हैं, 7-दिन की मेट्रो समयसीमा, और अटकने पर शिकायत का रास्ता।',
    introHi: `Tata Power Delhi Distribution (TPDDL) उत्तरी और उत्तर-पश्चिमी दिल्ली — रोहिणी, पीतमपुरा,
      मॉडल टाउन, सिविल लाइंस, नरेला वगैरह — को सप्लाई देती है और देश की सबसे सरल नई-कनेक्शन
      प्रक्रियाओं में से एक चलाती है: <strong>दो दस्तावेज़, एक ऑनलाइन फॉर्म, और कनेक्शन शुल्क अग्रिम
      डिमांड-नोट के बजाय आपके पहले बिजली बिल में</strong>। यह गाइड
      <a href="https://www.tatapower-ddl.com/" rel="nofollow noopener" target="_blank">tatapower-ddl.com</a>
      का पूरा फ्लो समझाती है — शुल्क क्या हैं, दिल्ली की 7-दिन की हक़दारी, और पहले बिल की वे जाँचें
      जो यहाँ सबसे ज़्यादा मायने रखती हैं — क्योंकि उसी पहले बिल में कनेक्शन शुल्क भी आते हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. पक्का करें कि TPDDL ही आपका पता सर्व करती है</h2>
        <p>दिल्ली तीन हिस्सों में बँटी है: <strong>Tata Power DDL</strong> उत्तरी और उत्तर-पश्चिमी दिल्ली,
        जबकि <strong>BRPL</strong> दक्षिण/पश्चिम और <strong>BYPL</strong> मध्य/पूर्व — उन्हें हमने
        <a href="/hi/guides/bses-delhi-new-connection/">BSES नई-कनेक्शन गाइड</a> में कवर किया है।
        पड़ोसी का बिल तुरंत बता देता है, या हमारे
        <a href="/hi/tariffs/delhi/">दिल्ली टैरिफ पेज</a> पर DISCOM-वार बँटवारा देखें। टैरिफ तीनों में
        वही DERC-अनुमोदित अनुसूची है, सब्सिडी समेत — फ़र्क़ प्रक्रिया का है, और TPDDL की सबसे
        स्वचालित है।</p>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़ — जानबूझकर सिर्फ़ दो</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार, वोटर ID, पासपोर्ट, PAN, ड्राइविंग लाइसेंस, या कोई भी सरकारी फोटो ID।</td></tr>
            <tr><td><strong>स्वामित्व / अधिभोग प्रमाण</strong></td><td>रजिस्टर्ड सेल डीड, प्रॉपर्टी-टैक्स रसीद, पज़ेशन लेटर — किरायेदारों के लिए रजिस्टर्ड रेंट एग्रीमेंट और क्षतिपूर्ति बॉन्ड। पूरी दिल्ली की तरह, कनेक्शन से परिसर पर मालिकाना हक़ नहीं बनता।</td></tr>
          </tbody>
        </table></div>
        <p>दो-दस्तावेज़ की यह सूची एक सोची-समझी Ease-of-Doing-Business प्रतिबद्धता है, और पोर्टल कमी
        वाला दस्तावेज़ चुपचाप अस्वीकार करने के बजाय आवेदन नंबर पर फ्लैग करता है — दोबारा अपलोड करने
        का SMS देखते रहें।</p>
      </section>

      <section class="seo-section">
        <h2>3. आवेदन, स्टेप-बाय-स्टेप</h2>
        <ol>
          <li><strong>ऑनलाइन आवेदन:</strong>
          <a href="https://www.tatapower-ddl.com/" rel="nofollow noopener" target="_blank">tatapower-ddl.com</a>
          → <em>Apply New Connection</em>: घरेलू या गैर-घरेलू चुनें, परिसर विवरण और माँगा गया भार भरें,
          दो दस्तावेज़ अपलोड करें। <strong>19124</strong> हेल्पलाइन (दिल्ली के बाहर से 1800-208-9124)
          और कस्टमर केयर सेंटर भी यही अनुरोध लेते हैं।</li>
          <li><strong>भार ईमानदारी से तय करें</strong> — फिक्स्ड चार्ज हर महीने प्रति स्वीकृत kW लगता
          है। उपकरणों से अनुमान के लिए हमारी
          <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">फिक्स्ड चार्ज गाइड</a> देखें।</li>
          <li><strong>फील्ड निरीक्षण।</strong> TPDDL टीम परिसर जाँचती है; नेटवर्क के पास के सामान्य शहरी
          कनेक्शनों में यही एकमात्र भौतिक चरण है।</li>
          <li><strong>मीटर लगना और सप्लाई चालू।</strong> सामान्य मामलों में कोई अग्रिम डिमांड-नोट भुगतान
          नहीं — पहले कनेक्शन चालू होता है।</li>
          <li><strong>शुल्क पहले बिल में आते हैं।</strong> जो सर्विस-लाइन/डेवलपमेंट शुल्क और सिक्योरिटी
          डिपॉज़िट बाकी DISCOM कनेक्शन से पहले वसूलती हैं, वे यहाँ आपके पहले बिजली बिल में लाइन
          आइटम बनकर आते हैं। पहला बिल सामान्य महीने से खासा बड़ा आने का बजट रखें।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना — वही DERC अनुसूची, समय अलग</h2>
        <ol>
          <li><strong>SLD शुल्क</strong> — DERC का तय प्रति-kW मानक सर्विस-लाइन-व-डेवलपमेंट शुल्क,
          सिद्धांत में BSES के डिमांड नोट जैसा ही; TPDDL बस इसे पहले बिल तक टाल देती है।</li>
          <li><strong>सिक्योरिटी डिपॉज़िट (ACD)</strong> — बिलिंग चक्र की अपेक्षित खपत के अनुसार, ब्याज
          सहित वापसी-योग्य, असल खपत पर सालाना संशोधित।</li>
          <li><strong>मीटर व विविध शुल्क</strong> — DERC की शुल्क अनुसूची से।</li>
        </ol>
        <p>हमेशा की तरह रुपये की तालिकाएँ नहीं — DERC अनुसूचियाँ संशोधित करता है, और आपके पहले बिल
        पर छपी राशियाँ मदवार होती हैं और लागू DERC अनुसूची से मिलाई जा सकती हैं।</p>
      </section>

      <section class="seo-section">
        <h2>5. उत्तरी दिल्ली की हक़दारी वाली समयसीमा</h2>
        <ul>
          <li>विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत पूरी दिल्ली <strong>महानगर</strong> है — पूर्ण
          आवेदन <strong>7 दिनों</strong> में चालू होना अनिवार्य।</li>
          <li>सामान्य शहरी कनेक्शनों के लिए TPDDL की अपनी EODB प्रतिबद्धताएँ इसी घड़ी पर चलती हैं,
          और DERC के परफ़ॉर्मेंस मानक DISCOM की देरी पर प्रतिदिन मुआवज़ा जोड़ते हैं।</li>
          <li>वाकई नेटवर्क-विस्तार वाले मामले DERC की प्रकाशित लंबी-पर-तय समयसीमाओं पर चलते हैं।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. आवेदन अटक गया? शिकायत की सीढ़ी</h2>
        <ol>
          <li><strong>आवेदन नंबर पर ऑनलाइन ट्रैक करें</strong> — कमी वाले दस्तावेज़ का फ्लैग सबसे आम
          चुपचाप रुकावट है; पहले उसे साफ़ करें।</li>
          <li><strong>19124 / 1800-208-9124</strong> — TPDDL की 24×7 हेल्पलाइन, या
          tpddl@tatapower-ddl.com; शिकायत नंबर ज़रूर लें।</li>
          <li><strong>ज़िले का कस्टमर केयर सेंटर</strong> — दस्तावेज़ विवादों के लिए।</li>
          <li><strong>CGRF → दिल्ली विद्युत लोकपाल</strong> — निःशुल्क, वैधानिक, और 7-दिन की घड़ी बीतते
          ही DERC की मुआवज़ा अनुसूची लागू।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. पहला बिल यहाँ दोगुना मायने रखता है</h2>
        <p>चूँकि TPDDL कनेक्शन शुल्क पहले बिल में लगाती है, उसे सामान्य से ज़्यादा ध्यान से जाँचें: टैरिफ
        श्रेणी (घरेलू, गैर-घरेलू नहीं), आवेदन वाला स्वीकृत भार, पात्र होने पर <strong>दिल्ली सब्सिडी</strong>
        (200 यूनिट तक मुफ़्त, 201–400 आधी दर, कैप सहित), और यह कि एकमुश्त SLD/डिपॉज़िट लाइनें
        आवेदन के समय बताई राशियों से मिलती हैं। एकमुश्त शुल्क अलग करें, फिर अपनी यूनिटें हमारे
        <a href="/?state=Delhi#calculator">दिल्ली बिल कैलकुलेटर</a> में डालें — यह स्लैब, फिक्स्ड चार्ज,
        PPAC और सब्सिडी का गणित लगाता है — और आवर्ती हिस्सा मिलना चाहिए। लाइन आइटम समझने के लिए
        <a href="/hi/guides/how-to-read-bses-delhi-bill/">दिल्ली बिल पढ़ने की गाइड</a> देखें (DERC का
        बिल फ़ॉर्मैट तीनों DISCOM में साझा है), और संदिग्ध पहले बिल की
        <a href="/bill-review/">Bill Review</a> से निःशुल्क जाँच कराएँ।</p>
      </section>`,
    faqsHi: [
      { q: 'Tata Power DDL का नया कनेक्शन कैसे लें?',
        a: 'tatapower-ddl.com → Apply New Connection पर ऑनलाइन आवेदन करें: घरेलू या गैर-घरेलू चुनें, परिसर विवरण और माँगा गया भार भरें, और सिर्फ़ दो दस्तावेज़ अपलोड करें — सरकारी फोटो ID और स्वामित्व/अधिभोग प्रमाण। 19124 हेल्पलाइन और कस्टमर केयर सेंटर भी यही अनुरोध लेते हैं; फील्ड निरीक्षण के बाद कनेक्शन चालू होता है।' },
      { q: 'क्या Tata Power DDL कनेक्शन से पहले डिमांड नोट का भुगतान लेती है?',
        a: 'सामान्य मामलों में नहीं — TPDDL पहले कनेक्शन चालू करती है और डिमांड-नोट शुल्क (DERC अनुसूची के SLD शुल्क, सिक्योरिटी डिपॉज़िट, मीटर शुल्क) आपके पहले बिजली बिल में लाइन आइटम बनकर आते हैं। पहला बिल सामान्य महीने से खासा बड़ा आने की उम्मीद रखें।' },
      { q: 'Tata Power DDL दिल्ली के कौन से इलाक़े कवर करती है?',
        a: 'उत्तरी और उत्तर-पश्चिमी दिल्ली — रोहिणी, पीतमपुरा, शालीमार बाग, मॉडल टाउन, सिविल लाइंस, आज़ादपुर, बादली और नरेला समेत। दक्षिण/पश्चिम दिल्ली BRPL और मध्य/पूर्व BYPL के पास हैं; टैरिफ अनुसूची और सब्सिडी तीनों में वही DERC-अनुमोदित हैं।' },
      { q: 'Tata Power DDL नया कनेक्शन कितने दिनों में देती है?',
        a: 'विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत दिल्ली महानगर क्षेत्र है, इसलिए पूर्ण आवेदन 7 दिनों में चालू होना अनिवार्य है। DERC के परफ़ॉर्मेंस मानक DISCOM की देरी पर प्रतिदिन मुआवज़ा जोड़ते हैं; वाकई नेटवर्क-विस्तार वाले मामले प्रकाशित लंबी समयसीमाओं पर चलते हैं।' },
      { q: 'Tata Power DDL नए कनेक्शन के लिए कौन से दस्तावेज़ चाहिए?',
        a: 'दो: सरकारी फोटो ID (आधार, वोटर ID, पासपोर्ट, PAN या ड्राइविंग लाइसेंस) और स्वामित्व या अधिभोग प्रमाण (सेल डीड, प्रॉपर्टी-टैक्स रसीद, पज़ेशन लेटर — किरायेदारों के लिए रजिस्टर्ड रेंट एग्रीमेंट और क्षतिपूर्ति बॉन्ड)। कमी वाले दस्तावेज़ आवेदन नंबर पर SMS से फ्लैग होते हैं।' },
    ],
  },
  {
    slug: 'tneb-tangedco-new-connection',
    published: "2026-05-30",
    states: ['Tamil Nadu'],
    title: 'How to Get a New TNEB (TANGEDCO) Electricity Connection Online',
    metaTitle: 'TNEB New Connection Online — TANGEDCO/TNPDCL: Documents, Deposits, Timeline',
    description: 'Step-by-step guide to a new TNEB electricity connection in Tamil Nadu: the TANGEDCO/TNPDCL online application, the document checklist (Form 5 consent and Form 6 indemnity for non-owners), deposits and TNERC charges, statutory timelines, and the Minnagam escalation route.',
    minutes: 8,
    intro: `Everyone in Tamil Nadu still says "EB connection", and the flow is now genuinely online:
      the new service connection portal
      (<a href="https://app1.tangedco.org/nsconline/" rel="nofollow noopener" target="_blank">app1.tangedco.org/nsconline</a>)
      takes the application, documents and payments end-to-end. One naming note up front — the
      distribution business of <strong>TANGEDCO</strong> (successor of the old TNEB) has been
      restructured as <strong>TNPDCL</strong> (Tamil Nadu Power Distribution Corporation,
      <a href="https://www.tnpdcl.org/" rel="nofollow noopener" target="_blank">tnpdcl.org</a>) —
      same offices, same section engineers, new letterhead. This guide walks the application,
      the deposits, the legal timelines and what to do when it sits still.`,
    sections: `
      <section class="seo-section">
        <h2>1. One DISCOM, whatever you call it</h2>
        <p>Unlike Delhi or Maharashtra, Tamil Nadu has a single distribution utility statewide —
        TNEB in old parlance, TANGEDCO on most portals, TNPDCL after the restructuring. Your local
        contact point is the <strong>section office</strong> (every locality has one, headed by an
        Assistant Engineer), and every online application still routes to it for inspection and
        energisation. Current LT tariffs, slabs and subsidy are on our
        <a href="/tariffs/tamil-nadu/tangedco/">TANGEDCO tariff page</a>.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents — owners have it easy, non-owners use Form 5/6</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, PAN or driving licence.</td></tr>
            <tr><td><strong>Ownership proof</strong></td><td>Sale deed, patta, property-tax receipt, or a court order establishing legal possession.</td></tr>
            <tr><td><strong>Non-owners (tenants, disputes)</strong></td><td>The owner's <strong>consent letter (Form 5)</strong> — or, when the owner won't sign, an <strong>indemnity bond (Form 6)</strong> with occupancy proof. The TNERC Supply Code makes Form 6 a right, not a favour.</td></tr>
            <tr><td><strong>Building completion certificate</strong></td><td>Required from the local authority for larger/newer buildings; ordinary small residences are generally exempt under the notified norms.</td></tr>
          </tbody>
        </table></div>
        <p>The Form 5/Form 6 pair is the detail most applicants miss: supply is the occupier's
        right under Section 43 of the Electricity Act, 2003, and Tamil Nadu operationalised it
        with a standard indemnity format instead of leaving tenants to argue at the counter.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step</h2>
        <ol>
          <li><strong>Apply online</strong> at the
          <a href="https://app1.tangedco.org/nsconline/" rel="nofollow noopener" target="_blank">new
          service connection portal</a> (also reachable via tnpdcl.org → Online Services): pick LT
          domestic (or the category you need), fill the premises details and load, and upload the
          documents. You receive an <strong>Application Reference Number</strong> — everything
          hangs off it.</li>
          <li><strong>Pay the registration/application charges online.</strong> The payment portal
          (<a href="https://tnebnet.org/awp/login" rel="nofollow noopener" target="_blank">tnebnet.org/awp</a>)
          logs you in with the <em>application reference number as username and your mobile number
          as password</em> — an odd convention worth knowing before you assume the login is
          broken.</li>
          <li><strong>Section office inspection.</strong> The AE's team verifies the premises,
          wiring-readiness and feasibility.</li>
          <li><strong>Demand for deposits and charges.</strong> Development and service-connection
          charges plus the <strong>security deposit</strong> (current-consumption deposit) are
          raised per the TNERC schedule — pay online against the same reference number.</li>
          <li><strong>Meter installation and energisation.</strong> Your consumer number arrives —
          and note TN's quirk: billing is <strong>bi-monthly</strong>, so the first bill covers
          roughly two months.</li>
          <li><strong>Offline fallback:</strong> the section office accepts the same application on
          paper, and authorised agents/e-sevai centres can file it for you.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs</h2>
        <ol>
          <li><strong>Registration/application fee</strong> — nominal, paid at submission.</li>
          <li><strong>Development + service connection charges</strong> — per-kW amounts from the
          TNERC Schedule of Miscellaneous Charges; a small domestic connection near the network
          typically lands in the low thousands of rupees, more where the line must be extended.</li>
          <li><strong>Security deposit (CC deposit)</strong> — sized to expected consumption
          (bi-monthly billing makes it roughly two months' worth), refundable with interest,
          trued-up annually.</li>
        </ol>
        <p>We skip rupee tables as always — TNERC revises the schedule, and the demand raised
        against your application reference number is the number that matters. Nothing beyond the
        registration fee is payable before you see it.</p>
      </section>

      <section class="seo-section">
        <h2>5. How long TANGEDCO can legally take</h2>
        <ul>
          <li>The central <strong>Electricity (Rights of Consumers) Rules, 2020</strong> cap new
          connections at <strong>7 days in metropolitan areas</strong> (Chennai),
          <strong>15 days in other municipal areas and 30 days in rural areas</strong> after a
          complete, paid application.</li>
          <li>TNERC's Distribution Standards of Performance set the state's own service levels and
          per-default compensation where extension work is genuinely required.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. Application stuck? The escalation ladder</h2>
        <ol>
          <li><strong>Track online</strong> with the application reference number on the portal.</li>
          <li><strong>Minnagam</strong> — TANGEDCO/TNPDCL's centralised consumer care:
          <strong>1912</strong> (or 94987-94987 by phone/WhatsApp). Quote the reference number and
          take a complaint number.</li>
          <li><strong>The section AE, then the sub-division AEE</strong> — most stalls are a
          pending inspection or a materials gap that one visit resolves.</li>
          <li><strong>CGRF → TNERC Electricity Ombudsman</strong> — the free statutory route once
          timelines lapse, with Standards-of-Performance compensation.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. After the meter — check your first (bi-monthly) bill</h2>
        <p>Check the tariff category (LT I-A domestic for a home), the sanctioned load, and that
        the <strong>free-units subsidy</strong> (100 free units per bi-monthly cycle for domestic
        consumers, per the state scheme) has been applied. Remember the bill covers ~two months
        before concluding it's too high. Then put the units into our
        <a href="/?state=Tamil%20Nadu#calculator">TNEB bill calculator</a> — it implements the
        current TNERC slabs and subsidy — and compare. Our
        <a href="/guides/how-to-read-tneb-tangedco-bill/">TNEB bill-reading guide</a> decodes every
        line, and <a href="/bill-review/">Bill Review</a> checks a suspicious first bill for
        free.</p>
      </section>`,
    faqs: [
      { q: 'How do I apply for a new TNEB connection online?',
        a: 'Use TANGEDCO/TNPDCL’s new service connection portal (app1.tangedco.org/nsconline, also via tnpdcl.org → Online Services): choose the category, enter premises details and load, upload documents and pay the registration fee. You get an Application Reference Number; the section office inspects, you pay the demanded deposits online, and the meter follows.' },
      { q: 'What documents are needed for a TNEB new connection?',
        a: 'Identity proof (Aadhaar, voter ID, passport, PAN or driving licence) and ownership proof (sale deed, patta or property-tax receipt). Non-owners use the owner’s consent letter (Form 5) or an indemnity bond (Form 6) with occupancy proof. Larger/newer buildings also need a completion certificate.' },
      { q: 'Can a tenant get a TNEB connection without the owner’s signature?',
        a: 'Yes — Tamil Nadu’s supply code provides Form 6, a standard indemnity bond a tenant files with occupancy proof when the owner won’t sign Form 5 consent. Supply is the occupier’s statutory right under Section 43 of the Electricity Act, 2003.' },
      { q: 'How do I log in to pay TNEB new connection charges?',
        a: 'On the payment portal (tnebnet.org/awp), the username is your Application Reference Number and the password is the mobile number you registered — an unusual convention that catches many applicants. All demands raised against the application are payable there.' },
      { q: 'How many days does a new TNEB connection take?',
        a: 'Under the Electricity (Rights of Consumers) Rules, 2020: 7 days in Chennai (metropolitan), 15 days in other municipal areas and 30 days in rural areas after a complete, paid application. TNERC’s Standards of Performance add compensation where TANGEDCO defaults, with longer published timelines only for genuine line-extension work.' },
    ],

    titleHi: 'TNEB (TANGEDCO) में नया बिजली कनेक्शन ऑनलाइन कैसे लें',
    metaTitleHi: 'TNEB नया कनेक्शन ऑनलाइन — TANGEDCO/TNPDCL: दस्तावेज़, डिपॉज़िट, समयसीमा',
    descriptionHi: 'तमिलनाडु में नया TNEB बिजली कनेक्शन लेने की स्टेप-बाय-स्टेप गाइड: TANGEDCO/TNPDCL ऑनलाइन आवेदन, दस्तावेज़ सूची (गैर-मालिकों के लिए Form 5 सहमति और Form 6 क्षतिपूर्ति), TNERC शुल्क और डिपॉज़िट, कानूनी समयसीमा, और Minnagam शिकायत मार्ग।',
    introHi: `तमिलनाडु में आज भी सब "EB कनेक्शन" ही कहते हैं, और प्रक्रिया अब सचमुच ऑनलाइन है: नया
      सर्विस कनेक्शन पोर्टल
      (<a href="https://app1.tangedco.org/nsconline/" rel="nofollow noopener" target="_blank">app1.tangedco.org/nsconline</a>)
      आवेदन, दस्तावेज़ और भुगतान शुरू से अंत तक सँभालता है। एक नाम की बात पहले — पुराने TNEB की
      उत्तराधिकारी <strong>TANGEDCO</strong> का वितरण कारोबार अब <strong>TNPDCL</strong> (Tamil Nadu
      Power Distribution Corporation,
      <a href="https://www.tnpdcl.org/" rel="nofollow noopener" target="_blank">tnpdcl.org</a>) के रूप
      में पुनर्गठित है — दफ़्तर वही, सेक्शन इंजीनियर वही, लेटरहेड नया। यह गाइड आवेदन, डिपॉज़िट,
      कानूनी समयसीमाएँ और अटकने पर क्या करें, सब समझाती है।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. एक ही DISCOM, नाम चाहे जो लें</h2>
        <p>दिल्ली या महाराष्ट्र से उलट, तमिलनाडु में पूरे राज्य की एक ही वितरण कंपनी है — पुरानी भाषा
        में TNEB, ज़्यादातर पोर्टलों पर TANGEDCO, पुनर्गठन के बाद TNPDCL। आपका स्थानीय संपर्क
        <strong>सेक्शन ऑफिस</strong> है (हर इलाक़े में एक, सहायक अभियंता के अधीन), और हर ऑनलाइन
        आवेदन निरीक्षण व सप्लाई चालू करने के लिए वहीं पहुँचता है। मौजूदा LT टैरिफ, स्लैब और सब्सिडी
        हमारे <a href="/hi/tariffs/tamil-nadu/tangedco/">TANGEDCO टैरिफ पेज</a> पर हैं।</p>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़ — मालिकों के लिए आसान, गैर-मालिक Form 5/6 इस्तेमाल करें</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार, वोटर ID, पासपोर्ट, PAN या ड्राइविंग लाइसेंस।</td></tr>
            <tr><td><strong>स्वामित्व प्रमाण</strong></td><td>सेल डीड, पट्टा, प्रॉपर्टी-टैक्स रसीद, या वैध कब्ज़ा साबित करता कोर्ट आदेश।</td></tr>
            <tr><td><strong>गैर-मालिक (किरायेदार, विवाद)</strong></td><td>मालिक का <strong>सहमति पत्र (Form 5)</strong> — या मालिक साइन न करे तो अधिभोग प्रमाण के साथ <strong>क्षतिपूर्ति बॉन्ड (Form 6)</strong>। TNERC सप्लाई कोड Form 6 को एहसान नहीं, अधिकार बनाता है।</td></tr>
            <tr><td><strong>बिल्डिंग कम्प्लीशन सर्टिफ़िकेट</strong></td><td>बड़ी/नई इमारतों के लिए स्थानीय निकाय से ज़रूरी; सामान्य छोटे घर अधिसूचित मानदंडों में आम तौर पर छूट पाते हैं।</td></tr>
          </tbody>
        </table></div>
        <p>Form 5/Form 6 की जोड़ी ही वह बारीकी है जो ज़्यादातर आवेदक चूक जाते हैं: विद्युत अधिनियम,
        2003 की धारा 43 के तहत आपूर्ति परिसर में रहने वाले का अधिकार है, और तमिलनाडु ने किरायेदारों
        को काउंटर पर बहस के लिए छोड़ने के बजाय मानक क्षतिपूर्ति फ़ॉर्मैट से इसे लागू किया है।</p>
      </section>

      <section class="seo-section">
        <h2>3. आवेदन, स्टेप-बाय-स्टेप</h2>
        <ol>
          <li><strong>ऑनलाइन आवेदन:</strong>
          <a href="https://app1.tangedco.org/nsconline/" rel="nofollow noopener" target="_blank">नए
          सर्विस कनेक्शन पोर्टल</a> पर (tnpdcl.org → Online Services से भी): LT घरेलू (या ज़रूरी श्रेणी)
          चुनें, परिसर विवरण और भार भरें, दस्तावेज़ अपलोड करें। <strong>Application Reference
          Number</strong> मिलता है — आगे सब कुछ उसी पर टिका है।</li>
          <li><strong>रजिस्ट्रेशन/आवेदन शुल्क ऑनलाइन भरें।</strong> भुगतान पोर्टल
          (<a href="https://tnebnet.org/awp/login" rel="nofollow noopener" target="_blank">tnebnet.org/awp</a>)
          में <em>यूज़रनेम आवेदन संदर्भ संख्या और पासवर्ड आपका मोबाइल नंबर</em> होता है — लॉगिन टूटा
          मानने से पहले यह अजीब परंपरा जान लें।</li>
          <li><strong>सेक्शन ऑफिस निरीक्षण।</strong> AE की टीम परिसर, वायरिंग-तैयारी और व्यवहार्यता
          जाँचती है।</li>
          <li><strong>डिपॉज़िट और शुल्क की माँग।</strong> TNERC अनुसूची के अनुसार डेवलपमेंट व सर्विस
          कनेक्शन शुल्क और <strong>सिक्योरिटी डिपॉज़िट</strong> (current-consumption deposit) — उसी
          संदर्भ संख्या पर ऑनलाइन भरें।</li>
          <li><strong>मीटर लगना और सप्लाई चालू।</strong> उपभोक्ता नंबर मिलता है — और TN की खासियत
          याद रखें: बिलिंग <strong>द्विमासिक</strong> है, पहला बिल क़रीब दो महीने का होगा।</li>
          <li><strong>ऑफलाइन विकल्प:</strong> सेक्शन ऑफिस काग़ज़ पर वही आवेदन लेता है, और अधिकृत
          एजेंट/ई-सेवई केंद्र आपकी ओर से दाख़िल कर सकते हैं।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना</h2>
        <ol>
          <li><strong>रजिस्ट्रेशन/आवेदन शुल्क</strong> — नाममात्र, जमा करते समय।</li>
          <li><strong>डेवलपमेंट + सर्विस कनेक्शन शुल्क</strong> — TNERC विविध शुल्क अनुसूची की प्रति-kW
          राशियाँ; नेटवर्क के पास छोटा घरेलू कनेक्शन आम तौर पर कुछ हज़ार रुपये में, लाइन बढ़ानी पड़े
          तो ज़्यादा।</li>
          <li><strong>सिक्योरिटी डिपॉज़िट (CC deposit)</strong> — अपेक्षित खपत के अनुसार (द्विमासिक
          बिलिंग से क़रीब दो महीने जितना), ब्याज सहित वापसी-योग्य, सालाना समायोजित।</li>
        </ol>
        <p>हमेशा की तरह रुपये की तालिकाएँ नहीं — TNERC अनुसूची संशोधित करता है, और आपकी आवेदन
        संदर्भ संख्या पर उठी माँग ही असल आँकड़ा है। रजिस्ट्रेशन फीस के अलावा उसे देखे बिना कुछ देय
        नहीं।</p>
      </section>

      <section class="seo-section">
        <h2>5. TANGEDCO कानूनन कितने दिन ले सकती है</h2>
        <ul>
          <li>केंद्रीय <strong>विद्युत (उपभोक्ता अधिकार) नियम, 2020</strong>: पूर्ण व भुगतान हो चुके आवेदन
          पर <strong>महानगर में 7 दिन</strong> (चेन्नई), <strong>अन्य नगरीय क्षेत्रों में 15 दिन और
          ग्रामीण क्षेत्रों में 30 दिन</strong>।</li>
          <li>TNERC के Distribution Standards of Performance राज्य के अपने सेवा-स्तर और चूक पर
          मुआवज़ा तय करते हैं, जहाँ विस्तार कार्य वाकई ज़रूरी हो।</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. आवेदन अटक गया? शिकायत की सीढ़ी</h2>
        <ol>
          <li><strong>पोर्टल पर</strong> आवेदन संदर्भ संख्या से ट्रैक करें।</li>
          <li><strong>Minnagam</strong> — TANGEDCO/TNPDCL की केंद्रीकृत उपभोक्ता सेवा:
          <strong>1912</strong> (या फोन/WhatsApp पर 94987-94987)। संदर्भ संख्या बताकर शिकायत नंबर लें।</li>
          <li><strong>सेक्शन AE, फिर उपखंड AEE</strong> — ज़्यादातर रुकावटें लंबित निरीक्षण या सामग्री की
          कमी होती हैं जो एक मुलाक़ात से सुलझ जाती हैं।</li>
          <li><strong>CGRF → TNERC विद्युत लोकपाल</strong> — समयसीमा बीतने पर निःशुल्क वैधानिक रास्ता,
          Standards-of-Performance मुआवज़े के साथ।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. मीटर लगने के बाद — पहला (द्विमासिक) बिल जाँचें</h2>
        <p>टैरिफ श्रेणी (घर के लिए LT I-A घरेलू), स्वीकृत भार, और <strong>मुफ़्त-यूनिट सब्सिडी</strong>
        (राज्य योजना के तहत घरेलू उपभोक्ताओं को प्रति द्विमासिक चक्र 100 मुफ़्त यूनिट) लगी है या नहीं —
        ये तीनों जाँचें। बिल ज़्यादा लगे तो पहले याद रखें कि वह क़रीब दो महीने का है। फिर यूनिटें हमारे
        <a href="/?state=Tamil%20Nadu#calculator">TNEB बिल कैलकुलेटर</a> में डालें — यह मौजूदा TNERC
        स्लैब और सब्सिडी का गणित लगाता है — और मिलान करें। हर लाइन के लिए
        <a href="/hi/guides/how-to-read-tneb-tangedco-bill/">TNEB बिल पढ़ने की गाइड</a> देखें, और
        संदिग्ध पहले बिल की <a href="/bill-review/">Bill Review</a> से निःशुल्क जाँच कराएँ।</p>
      </section>`,
    faqsHi: [
      { q: 'TNEB का नया कनेक्शन ऑनलाइन कैसे लें?',
        a: 'TANGEDCO/TNPDCL के नए सर्विस कनेक्शन पोर्टल (app1.tangedco.org/nsconline, tnpdcl.org → Online Services से भी) पर श्रेणी चुनें, परिसर विवरण व भार भरें, दस्तावेज़ अपलोड करें और रजिस्ट्रेशन शुल्क भरें। Application Reference Number मिलती है; सेक्शन ऑफिस निरीक्षण करता है, माँगे गए डिपॉज़िट ऑनलाइन भरें, फिर मीटर लगता है।' },
      { q: 'TNEB नए कनेक्शन के लिए कौन से दस्तावेज़ चाहिए?',
        a: 'पहचान प्रमाण (आधार, वोटर ID, पासपोर्ट, PAN या ड्राइविंग लाइसेंस) और स्वामित्व प्रमाण (सेल डीड, पट्टा या प्रॉपर्टी-टैक्स रसीद)। गैर-मालिक मालिक का सहमति पत्र (Form 5) या अधिभोग प्रमाण के साथ क्षतिपूर्ति बॉन्ड (Form 6) दें। बड़ी/नई इमारतों को कम्प्लीशन सर्टिफ़िकेट भी चाहिए।' },
      { q: 'क्या किरायेदार मालिक के हस्ताक्षर के बिना TNEB कनेक्शन ले सकता है?',
        a: 'हाँ — तमिलनाडु का सप्लाई कोड Form 6 देता है: मालिक Form 5 सहमति पर साइन न करे तो किरायेदार अधिभोग प्रमाण के साथ मानक क्षतिपूर्ति बॉन्ड दाख़िल करता है। विद्युत अधिनियम, 2003 की धारा 43 के तहत आपूर्ति रहने वाले का वैधानिक अधिकार है।' },
      { q: 'TNEB नए कनेक्शन के शुल्क भरने के लिए लॉगिन कैसे करें?',
        a: 'भुगतान पोर्टल (tnebnet.org/awp) पर यूज़रनेम आपकी Application Reference Number और पासवर्ड रजिस्टर किया मोबाइल नंबर है — यह असामान्य परंपरा कई आवेदकों को उलझाती है। आवेदन पर उठी सभी माँगें वहीं देय हैं।' },
      { q: 'TNEB नया कनेक्शन कितने दिनों में मिलता है?',
        a: 'विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत पूर्ण व भुगतान हो चुके आवेदन पर चेन्नई (महानगर) में 7 दिन, अन्य नगरीय क्षेत्रों में 15 दिन और ग्रामीण क्षेत्रों में 30 दिन। TNERC के Standards of Performance चूक पर मुआवज़ा जोड़ते हैं; लंबी प्रकाशित समयसीमाएँ सिर्फ़ वास्तविक लाइन-विस्तार पर लागू हैं।' },
    ],

    titleTa: 'TNEB (TANGEDCO) புதிய மின் இணைப்பு ஆன்லைனில் பெறுவது எப்படி',
    metaTitleTa: 'TNEB புதிய இணைப்பு ஆன்லைன் — TANGEDCO/TNPDCL: ஆவணங்கள், வைப்புத்தொகை, காலக்கெடு',
    descriptionTa: 'தமிழ்நாட்டில் புதிய TNEB மின் இணைப்பு பெறும் படிப்படியான வழிகாட்டி: TANGEDCO/TNPDCL ஆன்லைன் விண்ணப்பம், ஆவணப் பட்டியல் (உரிமையாளர் அல்லாதவர்களுக்கு படிவம் 5 சம்மதம் மற்றும் படிவம் 6 உத்தரவாதம்), TNERC கட்டணங்கள் மற்றும் வைப்புத்தொகை, சட்டப்படியான காலக்கெடுகள், Minnagam புகார் வழி.',
    introTa: `தமிழ்நாட்டில் இன்றும் எல்லோரும் "EB கனெக்ஷன்" என்றே சொல்கிறார்கள், இப்போது செயல்முறை
      உண்மையிலேயே ஆன்லைன்: புதிய மின் இணைப்பு போர்டல்
      (<a href="https://app1.tangedco.org/nsconline/" rel="nofollow noopener" target="_blank">app1.tangedco.org/nsconline</a>)
      விண்ணப்பம், ஆவணங்கள், கட்டணங்கள் அனைத்தையும் முழுமையாக ஆன்லைனில் கையாள்கிறது. முதலில் ஒரு
      பெயர்க் குறிப்பு — பழைய TNEB-இன் வாரிசான <strong>TANGEDCO</strong>-வின் மின் விநியோகப் பிரிவு
      இப்போது <strong>TNPDCL</strong> (Tamil Nadu Power Distribution Corporation,
      <a href="https://www.tnpdcl.org/" rel="nofollow noopener" target="_blank">tnpdcl.org</a>) என
      மறுசீரமைக்கப்பட்டுள்ளது — அலுவலகங்கள் அதே, செக்ஷன் பொறியாளர்கள் அதே, லெட்டர்ஹெட் மட்டும் புதியது.
      விண்ணப்பம், வைப்புத்தொகை, சட்டப்படியான காலக்கெடுகள், நகராமல் நின்றால் என்ன செய்வது — எல்லாம்
      இந்த வழிகாட்டியில்.`,
    sectionsTa: `
      <section class="seo-section">
        <h2>1. எந்தப் பெயரில் அழைத்தாலும் ஒரே நிறுவனம்</h2>
        <p>டெல்லி அல்லது மகாராஷ்டிரா போலல்லாமல், தமிழ்நாடு முழுவதற்கும் ஒரே மின் விநியோக நிறுவனம் —
        பழைய வழக்கில் TNEB, பெரும்பாலான போர்டல்களில் TANGEDCO, மறுசீரமைப்புக்குப் பின் TNPDCL.
        உங்கள் உள்ளூர் தொடர்பு <strong>செக்ஷன் அலுவலகம்</strong> (ஒவ்வொரு பகுதிக்கும் ஒன்று, உதவிப்
        பொறியாளர் தலைமையில்), ஒவ்வொரு ஆன்லைன் விண்ணப்பமும் ஆய்வுக்கும் மின் இணைப்புக்கும் அங்கேயே
        செல்கிறது. தற்போதைய LT கட்டணங்கள், அடுக்குகள், மானியம் — எல்லாம் எங்கள்
        <a href="/ta/tariffs/tamil-nadu/tangedco/">TANGEDCO கட்டணப் பக்கத்தில்</a>.</p>
      </section>

      <section class="seo-section">
        <h2>2. ஆவணங்கள் — உரிமையாளர்களுக்கு எளிது, மற்றவர்களுக்கு படிவம் 5/6</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>தேவை</th><th>ஏற்கப்படும் ஆவணங்கள்</th></tr></thead>
          <tbody>
            <tr><td><strong>அடையாளச் சான்று</strong></td><td>ஆதார், வாக்காளர் அட்டை, பாஸ்போர்ட், PAN அல்லது ஓட்டுநர் உரிமம்.</td></tr>
            <tr><td><strong>உரிமைச் சான்று</strong></td><td>கிரயப் பத்திரம், பட்டா, சொத்து வரி ரசீது, அல்லது சட்டப்படியான உடைமையை நிறுவும் நீதிமன்ற ஆணை.</td></tr>
            <tr><td><strong>உரிமையாளர் அல்லாதவர்கள் (குடியிருப்பாளர்கள், தகராறுகள்)</strong></td><td>உரிமையாளரின் <strong>சம்மதக் கடிதம் (படிவம் 5)</strong> — அல்லது உரிமையாளர் கையொப்பமிட மறுத்தால், குடியிருப்புச் சான்றுடன் <strong>உத்தரவாதப் பத்திரம் (படிவம் 6)</strong>. TNERC விநியோகக் கோட் படிவம் 6-ஐ உதவியாக அல்ல, உரிமையாக்குகிறது.</td></tr>
            <tr><td><strong>கட்டிட முடிவுச் சான்றிதழ்</strong></td><td>பெரிய/புதிய கட்டிடங்களுக்கு உள்ளாட்சி அமைப்பிடமிருந்து தேவை; சாதாரண சிறிய வீடுகளுக்கு அறிவிக்கப்பட்ட விதிமுறைகளில் பொதுவாக விலக்கு.</td></tr>
          </tbody>
        </table></div>
        <p>படிவம் 5/படிவம் 6 ஜோடிதான் பெரும்பாலான விண்ணப்பதாரர்கள் தவறவிடும் நுணுக்கம்: மின்சாரச்
        சட்டம், 2003-இன் பிரிவு 43-இன் கீழ் மின்சாரம் என்பது குடியிருப்பவரின் உரிமை; குடியிருப்பாளர்களை
        கவுண்டரில் வாதாட விடாமல், தமிழ்நாடு அதை நிலையான உத்தரவாத வடிவத்தில் நடைமுறைப்படுத்தியுள்ளது.</p>
      </section>

      <section class="seo-section">
        <h2>3. விண்ணப்பம், படிப்படியாக</h2>
        <ol>
          <li><strong>ஆன்லைனில் விண்ணப்பியுங்கள்:</strong>
          <a href="https://app1.tangedco.org/nsconline/" rel="nofollow noopener" target="_blank">புதிய
          மின் இணைப்பு போர்டலில்</a> (tnpdcl.org → Online Services வழியாகவும்): LT குடியிருப்பு (அல்லது
          தேவையான வகை) தேர்ந்தெடுத்து, இட விவரங்களும் மின்சுமையும் நிரப்பி, ஆவணங்களைப் பதிவேற்றுங்கள்.
          <strong>Application Reference Number</strong> கிடைக்கும் — இனி எல்லாம் அதன் மீதுதான்.</li>
          <li><strong>பதிவு/விண்ணப்பக் கட்டணத்தை ஆன்லைனில் செலுத்துங்கள்.</strong> கட்டண போர்டலில்
          (<a href="https://tnebnet.org/awp/login" rel="nofollow noopener" target="_blank">tnebnet.org/awp</a>)
          <em>பயனர்பெயர் = விண்ணப்ப எண், கடவுச்சொல் = பதிவு செய்த மொபைல் எண்</em> — லாகின்
          உடைந்துவிட்டதாக நினைக்கும் முன் இந்த வித்தியாசமான வழக்கத்தை அறிந்து கொள்ளுங்கள்.</li>
          <li><strong>செக்ஷன் அலுவலக ஆய்வு.</strong> AE குழு இடம், வயரிங்-தயார்நிலை, சாத்தியத்தை
          சரிபார்க்கிறது.</li>
          <li><strong>வைப்புத்தொகை மற்றும் கட்டணக் கோரிக்கை.</strong> TNERC அட்டவணைப்படி மேம்பாடு
          மற்றும் இணைப்புக் கட்டணங்களும் <strong>பாதுகாப்பு வைப்புத்தொகையும்</strong> (current-consumption
          deposit) கோரப்படும் — அதே விண்ணப்ப எண்ணில் ஆன்லைனில் செலுத்துங்கள்.</li>
          <li><strong>மீட்டர் பொருத்தி மின் இணைப்பு.</strong> நுகர்வோர் எண் வரும் — தமிழ்நாட்டின்
          தனித்தன்மையை நினைவில் கொள்ளுங்கள்: பில்லிங் <strong>இருமாதத்திற்கு ஒருமுறை</strong>, முதல் பில்
          சுமார் இரண்டு மாதங்களுக்கானது.</li>
          <li><strong>ஆஃப்லைன் மாற்று:</strong> செக்ஷன் அலுவலகம் அதே விண்ணப்பத்தை காகிதத்திலும்
          ஏற்கிறது; அங்கீகரிக்கப்பட்ட முகவர்கள்/இ-சேவை மையங்களும் தாக்கல் செய்யலாம்.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. செலவு எவ்வளவு</h2>
        <ol>
          <li><strong>பதிவு/விண்ணப்பக் கட்டணம்</strong> — சிறியது, சமர்ப்பிக்கும்போது.</li>
          <li><strong>மேம்பாடு + இணைப்புக் கட்டணங்கள்</strong> — TNERC இதர கட்டண அட்டவணையின்
          kW-ஒன்றுக்கான தொகைகள்; நெட்வொர்க்கிற்கு அருகிலுள்ள சிறிய குடியிருப்பு இணைப்பு பொதுவாக சில
          ஆயிரம் ரூபாய்க்குள்; லைன் நீட்டிக்க வேண்டியிருந்தால் அதிகம்.</li>
          <li><strong>பாதுகாப்பு வைப்புத்தொகை (CC deposit)</strong> — எதிர்பார்க்கப்படும் நுகர்வுக்கு ஏற்ப
          (இருமாத பில்லிங்கால் சுமார் இரண்டு மாத அளவு), வட்டியுடன் திரும்பக் கிடைக்கும், ஆண்டுதோறும்
          சரிசெய்யப்படும்.</li>
        </ol>
        <p>வழக்கம்போல ரூபாய் அட்டவணைகள் இல்லை — TNERC அட்டவணையைத் திருத்திக்கொண்டே இருக்கும்;
        உங்கள் விண்ணப்ப எண்ணின் மீது எழுப்பப்படும் கோரிக்கைதான் உண்மையான எண். பதிவுக் கட்டணம் தவிர
        அதைப் பார்க்காமல் எதுவும் செலுத்தத் தேவையில்லை.</p>
      </section>

      <section class="seo-section">
        <h2>5. TANGEDCO சட்டப்படி எத்தனை நாள் எடுக்கலாம்</h2>
        <ul>
          <li>மத்திய <strong>மின்சார (நுகர்வோர் உரிமைகள்) விதிகள், 2020</strong>: முழுமையான, கட்டணம்
          செலுத்திய விண்ணப்பத்திற்கு <strong>பெருநகரங்களில் 7 நாட்கள்</strong> (சென்னை),
          <strong>மற்ற நகராட்சி பகுதிகளில் 15 நாட்கள், கிராமப்புறங்களில் 30 நாட்கள்</strong>.</li>
          <li>உண்மையிலேயே லைன் நீட்டிப்பு தேவைப்படும் இடங்களில், TNERC-இன் Distribution Standards of
          Performance மாநிலத்தின் சொந்த சேவை நிலைகளையும் தவறினால் இழப்பீட்டையும் வரையறுக்கிறது.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>6. விண்ணப்பம் நகரவில்லையா? புகார் ஏணி</h2>
        <ol>
          <li><strong>போர்டலில்</strong> விண்ணப்ப எண்ணுடன் நிலையைக் கண்காணியுங்கள்.</li>
          <li><strong>Minnagam</strong> — TANGEDCO/TNPDCL-இன் மையப்படுத்தப்பட்ட நுகர்வோர் சேவை:
          <strong>1912</strong> (அல்லது தொலைபேசி/WhatsApp-இல் 94987-94987). விண்ணப்ப எண் சொல்லி
          புகார் எண் வாங்குங்கள்.</li>
          <li><strong>செக்ஷன் AE, பிறகு உட்பிரிவு AEE</strong> — பெரும்பாலான தேக்கங்கள் நிலுவை ஆய்வு
          அல்லது பொருள் பற்றாக்குறை; ஒரு சந்திப்பில் தீரும்.</li>
          <li><strong>CGRF → TNERC மின்சார குறைதீர்ப்பாளர் (Ombudsman)</strong> — காலக்கெடு முடிந்ததும்
          இலவச சட்டப்படியான வழி, Standards-of-Performance இழப்பீட்டுடன்.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>7. மீட்டர் வந்த பிறகு — முதல் (இருமாத) பில்லைச் சரிபாருங்கள்</h2>
        <p>கட்டண வகை (வீட்டுக்கு LT I-A குடியிருப்பு), அனுமதிக்கப்பட்ட மின்சுமை, மற்றும்
        <strong>இலவச யூனிட் மானியம்</strong> (மாநிலத் திட்டப்படி குடியிருப்பு நுகர்வோருக்கு இருமாத
        சுழற்சிக்கு 100 இலவச யூனிட்கள்) பொருந்தியுள்ளதா — இம்மூன்றையும் சரிபாருங்கள். பில் அதிகம்
        என்று முடிவு செய்யும் முன் அது சுமார் இரண்டு மாதங்களுக்கானது என்பதை நினைவில் கொள்ளுங்கள்.
        பிறகு யூனிட்களை எங்கள்
        <a href="/?state=Tamil%20Nadu#calculator">TNEB பில் கால்குலேட்டரில்</a> போடுங்கள் — அது
        தற்போதைய TNERC அடுக்குகளையும் மானியத்தையும் கணக்கிடுகிறது — ஒப்பிடுங்கள். ஒவ்வொரு வரியையும்
        புரிந்துகொள்ள <a href="/guides/how-to-read-tneb-tangedco-bill/">TNEB பில் படிக்கும்
        வழிகாட்டியைப்</a> பாருங்கள்; சந்தேகமான முதல் பில்லை
        <a href="/bill-review/">Bill Review</a> இலவசமாகச் சரிபார்க்கும்.</p>
      </section>`,
    faqsTa: [
      { q: 'TNEB புதிய இணைப்புக்கு ஆன்லைனில் எப்படி விண்ணப்பிப்பது?',
        a: 'TANGEDCO/TNPDCL-இன் புதிய மின் இணைப்பு போர்டலில் (app1.tangedco.org/nsconline, tnpdcl.org → Online Services வழியாகவும்) வகையைத் தேர்ந்தெடுத்து, இட விவரங்களும் மின்சுமையும் நிரப்பி, ஆவணங்களைப் பதிவேற்றி பதிவுக் கட்டணம் செலுத்துங்கள். Application Reference Number கிடைக்கும்; செக்ஷன் அலுவலகம் ஆய்வு செய்யும், கோரப்படும் வைப்புத்தொகையை ஆன்லைனில் செலுத்தியதும் மீட்டர் பொருத்தப்படும்.' },
      { q: 'TNEB புதிய இணைப்புக்கு என்ன ஆவணங்கள் தேவை?',
        a: 'அடையாளச் சான்று (ஆதார், வாக்காளர் அட்டை, பாஸ்போர்ட், PAN அல்லது ஓட்டுநர் உரிமம்) மற்றும் உரிமைச் சான்று (கிரயப் பத்திரம், பட்டா அல்லது சொத்து வரி ரசீது). உரிமையாளர் அல்லாதவர்கள் உரிமையாளரின் சம்மதக் கடிதம் (படிவம் 5) அல்லது குடியிருப்புச் சான்றுடன் உத்தரவாதப் பத்திரம் (படிவம் 6) தரலாம். பெரிய/புதிய கட்டிடங்களுக்கு முடிவுச் சான்றிதழும் தேவை.' },
      { q: 'உரிமையாளர் கையொப்பம் இல்லாமல் குடியிருப்பாளர் TNEB இணைப்பு பெற முடியுமா?',
        a: 'முடியும் — தமிழ்நாட்டின் விநியோகக் கோட் படிவம் 6-ஐ வழங்குகிறது: உரிமையாளர் படிவம் 5 சம்மதத்தில் கையொப்பமிட மறுத்தால், குடியிருப்பாளர் குடியிருப்புச் சான்றுடன் நிலையான உத்தரவாதப் பத்திரத்தைத் தாக்கல் செய்யலாம். மின்சாரச் சட்டம், 2003-இன் பிரிவு 43-இன் கீழ் மின்சாரம் குடியிருப்பவரின் சட்டப்படியான உரிமை.' },
      { q: 'TNEB புதிய இணைப்புக் கட்டணங்களைச் செலுத்த லாகின் எப்படி?',
        a: 'கட்டண போர்டலில் (tnebnet.org/awp) பயனர்பெயர் உங்கள் Application Reference Number, கடவுச்சொல் பதிவு செய்த மொபைல் எண் — பல விண்ணப்பதாரர்களைக் குழப்பும் அசாதாரண வழக்கம் இது. விண்ணப்பத்தின் மீதான எல்லாக் கோரிக்கைகளும் அங்கேயே செலுத்தலாம்.' },
      { q: 'TNEB புதிய இணைப்பு எத்தனை நாட்களில் கிடைக்கும்?',
        a: 'மின்சார (நுகர்வோர் உரிமைகள்) விதிகள், 2020-இன் கீழ் முழுமையான, கட்டணம் செலுத்திய விண்ணப்பத்திற்கு சென்னையில் (பெருநகரம்) 7 நாட்கள், மற்ற நகராட்சி பகுதிகளில் 15 நாட்கள், கிராமப்புறங்களில் 30 நாட்கள். TNERC-இன் Standards of Performance தவறினால் இழப்பீடு சேர்க்கிறது; நீண்ட வெளியிடப்பட்ட காலக்கெடுகள் உண்மையான லைன்-நீட்டிப்பு வேலைகளுக்கு மட்டுமே.' },
    ],
  },

  {
    slug: 'ev-home-vs-public-charging-cost',
    published: "2026-06-11",
    title: 'What Charging an EV Really Costs in India: Home Socket vs Public Fast Charger',
    metaTitle: 'EV Charging Cost in India — Home vs Public DC, Per-km Maths & Petrol/Diesel Comparison',
    description: 'The real cost of charging an electric car or scooter in India: the formula with charging losses, a per-EV cost table (Nexon, Tiago, Ather, Atto 3…), why home charging beats public DC 3× over, a monthly petrol-vs-diesel-vs-EV showdown, and how ToD night rates and solar cut it further.',
    minutes: 8,
    intro: `Charging an EV at home costs a fraction of what petrol does — but the number on EV
      brochures is usually wrong in both directions. It ignores <strong>charging losses</strong>
      (you pay for more units than the battery holds) and assumes a flat tariff, when home
      charging actually lands on your <strong>top domestic slab</strong>. This guide walks the
      honest maths for home 15A charging, wallbox charging and public DC fast charging — and
      shows exactly where each rupee goes.`,
    sections: `
      <section class="seo-section">
        <h2>The formula — with the part brochures skip</h2>
        <p>Cost of a full charge = <strong>battery size (kWh) × your per-unit rate × ~1.1</strong>.
        That last factor is charging loss: AC chargers waste roughly 8–12% as heat between the wall
        socket and the battery, and your meter bills the wall side. A 40 kWh car battery therefore
        draws about 44 units from the meter, not 40.</p>
        <p>Cost per km follows directly: full-charge cost ÷ <em>real-world</em> range. Use the
        range you actually get, not the ARAI figure — owners typically see 15–25% less. Our
        <a href="/ev/">EV charging cost calculator</a> does all of this with editable real-world
        presets for common EVs and scooters.</p>
      </section>

      <section class="seo-section">
        <h2>What popular EVs actually cost to charge</h2>
        <p>Here is a full home charge for common Indian EVs, costed honestly — battery drawn from
        the meter (with ~10% charging loss) at a ₹7/unit slab, and per-km against a
        <em>conservative real-world</em> range rather than the ARAI claim:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>EV</th><th>Battery</th><th>Full charge @ ₹7/unit</th><th>Real range</th><th>Cost / km</th></tr></thead>
          <tbody>
            <tr><td><strong>Ather 450X</strong> (scooter)</td><td>3.7 kWh</td><td>₹28</td><td>~105 km</td><td><strong>₹0.27</strong></td></tr>
            <tr><td><strong>TVS iQube</strong> (scooter)</td><td>3.4 kWh</td><td>₹26</td><td>~90 km</td><td><strong>₹0.29</strong></td></tr>
            <tr><td><strong>Tata Tiago EV</strong></td><td>24 kWh</td><td>₹185</td><td>~190 km</td><td><strong>₹0.97</strong></td></tr>
            <tr><td><strong>Tata Nexon EV</strong></td><td>40.5 kWh</td><td>₹312</td><td>~320 km</td><td><strong>₹0.97</strong></td></tr>
            <tr><td><strong>MG ZS EV</strong></td><td>50.3 kWh</td><td>₹387</td><td>~370 km</td><td><strong>₹1.05</strong></td></tr>
            <tr><td><strong>BYD Atto 3</strong></td><td>60.5 kWh</td><td>₹466</td><td>~420 km</td><td><strong>₹1.11</strong></td></tr>
          </tbody>
        </table></div>
        <p>Two things the showroom won't stress: bigger batteries don't cost more <em>per km</em>
        (energy is energy), and your real figure moves with your slab rate — swap ₹7 for your own
        top-slab rate in the <a href="/ev/">calculator</a> to see it.</p>
      </section>

      <section class="seo-section">
        <h2>Home charging: billed at your top slab, not the average</h2>
        <p>Home EV charging goes through your ordinary domestic meter, so the units are priced by
        your DISCOM's slab ladder — and because they add <em>on top of</em> your household
        consumption, they land in the highest slab you touch. A household already in the top slab
        pays the top-slab rate for every EV unit, which can differ noticeably from the "average
        rate" the showroom quoted. Find your ladder on our
        <a href="/tariffs/states/">state tariff pages</a>.</p>
        <p>Hardware matters less than people think: a regular 15A socket (~3.3 kW) fills a big car
        battery overnight (10–14 hours) and a scooter in 1–2 hours. A 7.2 kW AC wallbox roughly
        halves car charging time, but usually requires a <strong>sanctioned-load increase</strong>
        from your DISCOM — drawing a wallbox on a 2 kW sanctioned load invites excess-demand
        penalties. See our guide to
        <a href="/guides/reduce-fixed-charges-sanctioned-load/">sanctioned load and fixed charges</a>.</p>
        <p>One habit worth building: for daily use most owners charge to about <strong>80%</strong>,
        not 100% — it protects long-term battery health and a full charge is rarely needed for a
        day's driving. That also means a typical top-up costs less than the full-charge figures
        above; the <a href="/ev/">calculator's charge-level slider</a> shows the cost and time for
        any level.</p>
      </section>

      <section class="seo-section">
        <h2>Public charging: convenience priced at 2–3× home rates</h2>
        <p>Public networks (Tata Power EZ Charge, Statiq, Zeon, Jio-bp and others) pay commercial
        tariffs, add their margin and GST, and typically land between <strong>₹15 and ₹25 per
        unit</strong> — AC posts at the lower end, DC fast chargers at the upper end. The
        electricity is identical; you are paying for speed and location.</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Where you charge</th><th>Typical rate</th><th>Time for a car (0→80–100%)</th></tr></thead>
          <tbody>
            <tr><td><strong>Home 15A socket (3.3 kW)</strong></td><td>Your domestic slab rate</td><td>10–14 hours (overnight)</td></tr>
            <tr><td><strong>Home wallbox (7.2 kW)</strong></td><td>Your domestic slab rate</td><td>5–6 hours</td></tr>
            <tr><td><strong>Public AC post</strong></td><td>~₹8–15/unit</td><td>4–8 hours</td></tr>
            <tr><td><strong>Public DC fast (25–150 kW)</strong></td><td>~₹18–25/unit + GST</td><td>30–60 minutes to 80%</td></tr>
          </tbody>
        </table></div>
        <p>The practical rule: <strong>home for daily charging, DC only on highways.</strong>
        Routine DC fast charging both triples your per-km cost and ages the battery faster.</p>
      </section>

      <section class="seo-section">
        <h2>EV vs petrol vs diesel: the monthly bill</h2>
        <p>Per-km numbers are abstract; the monthly bill isn't. Here is the same mid-size car
        driven <strong>1,000 km a month</strong>, as petrol, diesel, and an EV charged two ways:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Fuel</th><th>Assumptions</th><th>Cost / km</th><th>Per month</th></tr></thead>
          <tbody>
            <tr><td><strong>Petrol car</strong></td><td>15 km/l @ ₹105/l</td><td>₹7.00</td><td>₹7,000</td></tr>
            <tr><td><strong>Diesel car</strong></td><td>18 km/l @ ₹90/l</td><td>₹5.00</td><td>₹5,000</td></tr>
            <tr><td><strong>EV — home charging</strong></td><td>₹7/unit slab, real range</td><td>₹0.97</td><td><strong>₹970</strong></td></tr>
            <tr><td><strong>EV — public DC only</strong></td><td>₹20/unit fast charger</td><td>₹2.78</td><td>₹2,780</td></tr>
          </tbody>
        </table></div>
        <p>Charged at home, the EV saves roughly <strong>₹6,000 a month over petrol — about
        ₹72,000 a year</strong>. Even if you only ever used public DC fast chargers, you'd still
        beat petrol by more than half. Run <em>your</em> vehicle, km and tariff through the
        <a href="/ev/">EV calculator</a> — it prints your monthly savings, the petrol equivalent,
        and a home-vs-public-vs-petrol bar chart side by side.</p>
      </section>

      <section class="seo-section">
        <h2>Four ways to cut the cost further</h2>
        <ol>
          <li><strong>Charge at night on a ToD meter.</strong> Several states give off-peak
          Time-of-Day rebates in the late-night window. A charger timer moves virtually all EV
          units into the discount. How ToD windows work:
          <a href="/guides/tod-billing-explained/">ToD billing explained</a>.</li>
          <li><strong>Check for a dedicated EV tariff.</strong> Some states publish a separate
          LT EV-charging category cheaper than the top domestic slab — worth a separate meter if
          you drive a lot.</li>
          <li><strong>Pair with rooftop solar.</strong> Daytime charging on your own generation
          brings marginal fuel cost near zero; see
          <a href="/guides/solar-net-metering-savings/">how net-metering savings work</a> and the
          <a href="/solar/">solar sizing estimator</a>.</li>
          <li><strong>Keep your sanctioned load honest.</strong> If you add a wallbox, regularise
          the load first — the penalty maths otherwise eats the fuel savings.</li>
        </ol>
      </section>`,
    faqs: [
      { q: 'How much does it cost to charge an electric car at home in India?',
        a: 'Battery size × your domestic per-unit rate × about 1.1 for charging losses. A 40 kWh battery at a ₹7/unit slab rate costs roughly ₹310 for a full charge — but the exact figure depends on your DISCOM’s slab ladder, since EV units land on top of household usage.' },
      { q: 'Why is public DC fast charging so much more expensive than home charging?',
        a: 'Operators pay commercial tariffs, then add equipment, land and margin plus GST, landing at roughly ₹18–25 per unit against a domestic slab rate. You are buying speed: 30–60 minutes to 80% instead of an overnight charge.' },
      { q: 'Do I need to increase my sanctioned load for EV charging?',
        a: 'Not for a 15A socket (3.3 kW) in most homes. A 7.2 kW wallbox usually does need a sanctioned-load increase from your DISCOM — without it, the extra draw can trigger excess-demand penalties that undo the fuel savings.' },
      { q: 'Is an EV cheaper per km than petrol in India?',
        a: 'Substantially. Home-charged EVs typically run at ₹1–1.5 per km for cars and under 30 paise for scooters, versus ₹7–9 per km for a comparable petrol car — an 80–90% reduction. Even on public DC charging the EV usually stays 50%+ cheaper.' },
      { q: 'How much can an EV save per month compared to petrol?',
        a: 'For a mid-size car driven 1,000 km a month, home charging costs about ₹970 versus roughly ₹7,000 for petrol — a saving of around ₹6,000 a month, or ₹72,000 a year. A diesel car at about ₹5,000 a month still costs 5× more to run than the home-charged EV. Your exact saving depends on your slab rate and how far you drive.' },
    ],
  },

  {
    slug: 'pm-surya-ghar-solar-subsidy',
    published: "2026-06-23",
    title: 'PM Surya Ghar Explained: The Rooftop Solar Subsidy, Rupee by Rupee',
    metaTitle: 'PM Surya Ghar Muft Bijli Yojana — Subsidy Slabs, Eligibility & How to Apply',
    description: 'How the PM Surya Ghar Muft Bijli Yojana rooftop solar subsidy actually works: ₹30,000/kW slabs up to the ₹78,000 cap, who qualifies, the national-portal application flow, state top-ups, and the payback maths after subsidy.',
    minutes: 7,
    intro: `PM Surya Ghar Muft Bijli Yojana is the central government's residential rooftop solar
      scheme: it pays a direct subsidy into your bank account for installing grid-connected solar,
      with the pitch of running your home on (near) free electricity. The subsidy is real and
      substantial — <strong>up to ₹78,000</strong> — but how much <em>you</em> get depends on
      system size, and the economics depend on your tariff. Here is the scheme rupee by rupee.`,
    sections: `
      <section class="seo-section">
        <h2>The subsidy slabs — what you actually receive</h2>
        <p>The central subsidy for residential consumers is tiered by system capacity:</p>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>System size</th><th>Central subsidy</th><th>Running total</th></tr></thead>
          <tbody>
            <tr><td><strong>1st kW</strong></td><td>₹30,000</td><td>₹30,000</td></tr>
            <tr><td><strong>2nd kW</strong></td><td>₹30,000</td><td>₹60,000</td></tr>
            <tr><td><strong>3rd kW</strong></td><td>₹18,000</td><td><strong>₹78,000 (cap)</strong></td></tr>
            <tr><td><strong>4 kW and above</strong></td><td>Nothing further</td><td>₹78,000</td></tr>
          </tbody>
        </table></div>
        <p>Two implications follow. First, the subsidy covers a much larger <em>share</em> of a
        small system — on typical turnkey prices it can be close to half the cost of a 2 kW
        install, but a much smaller fraction of a 5 kW one. Second, the sweet spot for most
        households is <strong>2–3 kW</strong>, which also happens to match the consumption of a
        typical urban home. Some states add their own top-up on top of the central amount — our
        <a href="/solar/">solar calculator</a> carries the verified ones and computes your net
        cost after both.</p>
      </section>

      <section class="seo-section">
        <h2>Who qualifies</h2>
        <ul>
          <li>You own a residential connection in your name (the subsidy is per household, paid
          against your electricity connection).</li>
          <li>You have roof rights and shadow-free area — roughly <strong>100 sq ft per kW</strong>.</li>
          <li>The system is grid-connected through your DISCOM (net metering / net billing per
          your state's rules) and installed by a vendor empanelled on the national portal.</li>
          <li>Panels must meet the scheme's domestic-content requirements — the empanelled vendor
          handles this, but it is why quotes for "scheme" systems can differ from open-market ones.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>How to apply — the actual flow</h2>
        <ol>
          <li><strong>Register on pmsuryaghar.gov.in</strong> with your state, DISCOM, consumer
          number and mobile.</li>
          <li><strong>Apply for the rooftop system</strong> — the portal routes a feasibility
          request to your DISCOM against your sanctioned load.</li>
          <li><strong>Choose an empanelled vendor</strong> after feasibility approval and get the
          system installed.</li>
          <li><strong>Net meter installation and inspection</strong> by the DISCOM follows
          commissioning.</li>
          <li><strong>Submit bank details</strong> on the portal; the subsidy is credited directly
          to your account, typically within weeks of commissioning approval.</li>
        </ol>
        <p>Nothing in this flow requires an agent or a fee to a middleman — the portal, the DISCOM
        and the vendor are the only three parties.</p>
      </section>

      <section class="seo-section">
        <h2>The payback maths after subsidy</h2>
        <p>What the subsidy really buys you is a shorter payback. The value of every solar unit is
        the tariff you would otherwise have paid — and because netting removes your most expensive
        slab units first, households deep in high slabs recover the net cost fastest, often in
        3–5 years. Two honest caveats:</p>
        <ul>
          <li><strong>Free-unit states change the picture.</strong> If a state scheme already
          zeroes your bill at your consumption level, solar can only save on usage beyond the free
          block — run the numbers before signing. Details in
          <a href="/guides/solar-net-metering-savings/">our net-metering guide</a>.</li>
          <li><strong>Fixed charges and duty stay.</strong> "Muft bijli" refers to energy charges
          offset by generation; the fixed charge on your sanctioned load and duties still bill as
          usual.</li>
        </ul>
        <p>The <a href="/solar/">solar savings calculator</a> sizes a system from your monthly
        units and roof area, applies the central + state subsidy, and prints net cost, monthly
        saving and payback year against your own DISCOM's rates.</p>
      </section>

      <section class="seo-section">
        <h2>Mistakes that cost people money</h2>
        <ol>
          <li><strong>Oversizing past the cap.</strong> Every kW beyond 3 is unsubsidised — size to
          your top-slab consumption, not your roof's maximum.</li>
          <li><strong>Ignoring your state's settlement rules.</strong> Net metering vs net billing
          changes the value of exported units materially.</li>
          <li><strong>Paying "processing fees" to agents.</strong> The portal flow is direct;
          there is no official agent channel.</li>
          <li><strong>Believing the vendor's savings slide.</strong> It usually assumes the
          steepest tariff in the country. Check against your own slab ladder on our
          <a href="/tariffs/states/">tariff pages</a>.</li>
        </ol>
      </section>`,
    faqs: [
      { q: 'How much subsidy does PM Surya Ghar give for rooftop solar?',
        a: '₹30,000 per kW for the first 2 kW and ₹18,000 for the third kW, capping at ₹78,000 for systems of 3 kW and above. Some states add their own top-up over the central amount.' },
      { q: 'Is electricity really free under PM Surya Ghar?',
        a: 'The scheme’s pitch of ~300 free units a month corresponds to what a 3 kW system generates. Your energy charges can fall to near zero if generation covers consumption, but fixed charges, duty and any net-billing settlement still apply.' },
      { q: 'How do I apply for the PM Surya Ghar subsidy?',
        a: 'Register on pmsuryaghar.gov.in with your DISCOM and consumer number, get feasibility approval, install through an empanelled vendor, complete the DISCOM net-meter inspection, and submit bank details — the subsidy is credited directly to your account. No agent or fee is required.' },
      { q: 'What system size gives the best value under the scheme?',
        a: '2–3 kW for most homes: the subsidy covers its largest share of cost there, the cap lands at exactly 3 kW, and that size matches typical urban consumption. Beyond 3 kW every additional kW is fully self-funded.' },
    ],
  },
  {
    slug: 'bescom-new-connection-online',
    published: "2026-07-20",
    states: ['Karnataka'],
    title: 'How to Get a New BESCOM Electricity Connection Online (Bengaluru)',
    metaTitle: 'BESCOM New Connection Online — Portal, Documents, Charges, Timeline',
    description: 'Step-by-step guide to a new BESCOM electricity connection in Bengaluru and surrounding districts: which portal actually takes the application (bescom.co.in, not just Seva Sindhu), the document checklist including the wiring test report, deposits and charges, statutory timelines, and how to chase a stalled application.',
    minutes: 8,
    intro: `A new domestic connection in BESCOM territory — Bengaluru and seven surrounding
      districts — is applied for online, but the right portal depends on where the premises is.
      Most applicants use BESCOM's own LT services portal at
      <a href="https://www.bescom.co.in/bescom/auth/forms" rel="nofollow noopener" target="_blank">bescom.co.in</a>;
      Karnataka's <a href="https://sevasindhu.karnataka.gov.in/" rel="nofollow noopener" target="_blank">Seva Sindhu</a>
      portal also carries the service. This guide covers who applies where, the document list
      (including the wiring-contractor test report that surprises most first-time applicants),
      what you pay, and the legally enforceable timelines.`,
    sections: `
      <section class="seo-section">
        <h2>1. Which portal — bescom.co.in, ieasybill or Seva Sindhu?</h2>
        <p>BESCOM splits its online services by area, and its own site links two different
        application portals:</p>
        <ul>
          <li><strong>RAPDRP (urban) areas</strong> — Bengaluru city plus towns such as Ramanagara,
          Kanakapura, Kolar, Chikkaballapura, Doddaballapura, KGF, Tumakuru, Davanagere and
          Chitradurga — apply on
          <a href="https://www.bescom.co.in/bescom/auth/forms" rel="nofollow noopener" target="_blank">bescom.co.in/bescom/auth/forms</a>.</li>
          <li><strong>Non-RAPDRP (rural) areas</strong> use BESCOM's ieasybill portal
          (linked from the same
          <a href="https://bescom.karnataka.gov.in/info-3/Apply+Online+for+LT+New+Connection+and+Other+Services/en" rel="nofollow noopener" target="_blank">Apply Online page</a>
          on bescom.karnataka.gov.in), which handles new connections, tariff changes and name
          transfers for rural sub-divisions.</li>
          <li><strong>Seva Sindhu</strong> (<a href="https://sevasindhu.karnataka.gov.in/" rel="nofollow noopener" target="_blank">sevasindhu.karnataka.gov.in</a>)
          is Karnataka's umbrella service portal and also accepts BESCOM new-connection
          applications — useful if you already have a DigiLocker-linked Seva Sindhu login. The
          application lands with the same sub-division either way.</li>
        </ul>
        <p>Domestic supply in Bengaluru is billed under LT-2a. Current slab rates and fixed
        charges are on our <a href="/tariffs/karnataka/bescom/">BESCOM tariff page</a> — worth a
        look before you choose the sanctioned load, since the fixed charge is per kW per month.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents — the wiring test report is the one people miss</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, PAN or driving licence.</td></tr>
            <tr><td><strong>Ownership / occupancy proof</strong></td><td>Sale deed, khata certificate/extract, property-tax paid receipt, or allotment letter. Tenants: rent agreement plus the owner's no-objection letter.</td></tr>
            <tr><td><strong>Wiring test report</strong></td><td>Issued by a <strong>licensed electrical contractor</strong> after wiring the premises — BESCOM will not energise without it. Keep the contractor's licence number handy; it goes into the form.</td></tr>
            <tr><td><strong>Photograph</strong></td><td>One passport-size photo of the applicant.</td></tr>
          </tbody>
        </table></div>
        <p><strong>Tenants can apply in their own name.</strong> Supply is the occupier's right
        under Section 43 of the Electricity Act, 2003 — the connection attaches to the premises,
        and a rent agreement with the owner's NOC (or an indemnity bond where the owner will not
        sign) is the standard paper trail.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step</h2>
        <ol>
          <li><strong>Register</strong> on the portal for your area (mobile-OTP login), pick
          <em>New Connection</em>, and select the supply category — LT-2a for a home.</li>
          <li><strong>Fill premises and load details.</strong> Ask for the load you actually need —
          1–3 kW covers most flats; every sanctioned kW adds to the monthly fixed charge. Our
          <a href="/guides/reduce-fixed-charges-sanctioned-load/">fixed-charges guide</a> shows how
          to size it.</li>
          <li><strong>Upload documents</strong> (PDF/JPEG) including the wiring test report, and pay
          the application/registration fee online.</li>
          <li><strong>Site inspection.</strong> A BESCOM engineer verifies the wiring, the load and
          the distance from the nearest pole — typically within 3–5 working days in Bengaluru.</li>
          <li><strong>Pay the demand note.</strong> After inspection BESCOM issues a note covering
          the security deposit, meter cost and any service-line charges. Pay it online; this
          payment starts the energisation clock.</li>
          <li><strong>Meter installation.</strong> New BESCOM connections now get smart meters by
          default. Your 10-digit account ID / RR number arrives by SMS; the first bill follows in
          the next cycle. Learn to decode it with our
          <a href="/guides/how-to-read-bescom-bill/">BESCOM bill guide</a>.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs</h2>
        <p>Three separate amounts, often confused with each other:</p>
        <ul>
          <li><strong>Application fee</strong> — a small registration amount paid at submission.</li>
          <li><strong>Security deposit (MSD/ISD)</strong> — roughly two months' expected
          consumption, held against your future bills and refundable when the connection is
          surrendered. Scales with sanctioned load.</li>
          <li><strong>Service-line and meter charges</strong> — fixed by BESCOM's schedule of
          charges; small if the premises is within a service-drop of an existing pole, higher when
          a line extension is needed (the inspection decides this).</li>
        </ul>
        <p>The exact figures print on the demand note — pay only what it shows, through the portal.
        No lineman or middleman fee is ever payable; estimate your future bills with the
        <a href="/">bill calculator</a> before choosing the load.</p>
      </section>

      <section class="seo-section">
        <h2>5. Timelines — and what to do when nothing moves</h2>
        <p>Under the Electricity (Rights of Consumers) Rules, 2020, a complete paid application
        must be energised within <strong>7 days in metropolitan areas</strong> (Bengaluru), 15 days
        in other municipal areas and 30 days in rural areas — line-extension cases follow the
        KERC Standards of Performance instead. BESCOM services are also covered by Karnataka's
        Sakala guarantee, which stamps a due date on the acknowledgement.</p>
        <ul>
          <li><strong>Stalled application?</strong> Quote the application number at BESCOM's 1912
          helpline, or escalate to the sub-division AEE — the portal dashboard names the officer.</li>
          <li><strong>Still stuck?</strong> A written complaint to the Consumer Grievance Redressal
          Forum (CGRF) citing the Rules usually unblocks it; compensation for delay is payable
          under KERC's SoP regulations.</li>
          <li><strong>Gruha Jyothi:</strong> once the connection is live, register it on Seva
          Sindhu for the scheme's free-units benefit — it is not automatic for new RR numbers.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'Which website do I use for a new BESCOM connection?',
        a: 'BESCOM’s own LT portal at bescom.co.in/bescom/auth/forms for Bengaluru and other RAPDRP towns, the ieasybill portal (linked from bescom.karnataka.gov.in) for rural areas, or Seva Sindhu — all reach the same sub-division. Avoid third-party "agents"; there is no official fee outside the portal.' },
      { q: 'What documents does BESCOM need for a new connection?',
        a: 'Identity proof (Aadhaar/voter ID/PAN), ownership or occupancy proof (sale deed, khata, tax receipt — or rent agreement plus owner NOC for tenants), a passport photo, and a wiring test report from a licensed electrical contractor.' },
      { q: 'How long does a new BESCOM connection take?',
        a: 'The Rights of Consumers Rules, 2020 require energisation within 7 days in Bengaluru (metropolitan), 15 days in other municipal areas and 30 days rural, once the application is complete and paid. Inspection typically happens within 3–5 working days.' },
      { q: 'How much does a new BESCOM connection cost?',
        a: 'An application fee at submission, plus a demand note after inspection covering the security deposit (about two months’ expected billing, refundable), meter cost and service-line charges. Exact amounts depend on load and distance from the network — pay only what the demand note shows.' },
      { q: 'Can a tenant get a BESCOM connection without the owner?',
        a: 'Yes. Supply is the occupier’s statutory right under Section 43 of the Electricity Act, 2003. A rent agreement with the owner’s no-objection letter is standard; where the owner refuses to sign, an indemnity bond generally suffices.' },
    ],
  },
  {
    slug: 'kseb-new-connection-online',
    published: "2026-07-20",
    states: ['Kerala'],
    title: 'How to Get a New KSEB Electricity Connection Online (WSS Portal)',
    metaTitle: 'KSEB New Connection Online — WSS Portal: ₹50 Fee, Documents, 2-Day Package Connection',
    description: 'Step-by-step guide to a new KSEB electricity connection through the Web Self Service portal (wss.kseb.in): the ₹50 LT application fee, exact document checklist, the two-working-day "package connection" for small loads, tenant NOC rules, deposits, and statutory timelines.',
    minutes: 7,
    intro: `Kerala has one electricity distributor for the whole state, so every new domestic
      connection goes through KSEB — and almost all of it happens on one site: the
      <strong>Web Self Service (WSS) portal</strong> at
      <a href="https://wss.kseb.in/selfservices/" rel="nofollow noopener" target="_blank">wss.kseb.in</a>.
      The LT application fee is a flat ₹50, and small connections that need nothing more than a
      weather-proof service drop qualify for KSEB's <em>package connection</em> — energised in as
      little as two working days. Here is the whole flow: documents, fees, the one paper step that
      remains, and what to do if it stalls.`,
    sections: `
      <section class="seo-section">
        <h2>1. The WSS portal — one login for the whole state</h2>
        <p>KSEB's WSS portal handles new LT service connections end to end: application, document
        upload, the ₹50 fee, status tracking and later your bills for the same consumer number.
        Register with a mobile number and email, choose <em>New Connection</em>, and pick your
        electrical section (the office that serves the premises — the portal narrows this by
        district).</p>
        <ul>
          <li><strong>Domestic (LT-1) applications</strong> are fully online; the same portal also
          takes non-domestic and, via a separate flow, HT applications.</li>
          <li><strong>Existing-connection changes</strong> — ownership transfer, load change, tariff
          change — are separate WSS services, not the new-connection form.</li>
          <li>Slab rates and fixed charges for what you will pay once live are on our
          <a href="/tariffs/kerala/kseb/">KSEB tariff page</a>.</li>
        </ul>
      </section>

      <section class="seo-section">
        <h2>2. Documents — and the tenant NOC rule</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, driving licence, ration card, PAN, or a photo ID certificate from the village panchayat / municipality.</td></tr>
            <tr><td><strong>Ownership / occupancy proof</strong></td><td>Ownership certificate, attested title deed, land tax receipt (within the last year), possession certificate, or the building's occupancy certificate.</td></tr>
            <tr><td><strong>Tenants</strong></td><td>Any occupancy proof <strong>plus a no-objection certificate from the owner</strong> — KSEB asks for the NOC explicitly.</td></tr>
            <tr><td><strong>New buildings</strong></td><td>Approved building permit works as proof while the occupancy certificate is pending.</td></tr>
          </tbody>
        </table></div>
        <p>Scan everything before you start — the portal takes PDF/JPEG uploads, and the original
        documents are shown once, at the site inspection.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step</h2>
        <ol>
          <li><strong>Apply on WSS</strong> — fill the premises details, connected load and tariff
          (LT-1 domestic), upload documents, and pay the <strong>₹50 application fee</strong>
          online.</li>
          <li><strong>Print, sign, photograph.</strong> KSEB still wants one physical artefact: the
          system-generated application form, printed, signed and with a photo affixed. Hand it over
          at the site inspection along with the originals.</li>
          <li><strong>Site inspection.</strong> The section's overseer checks the wiring, the
          service-drop distance and the load. Any line-extension cost is worked out here and
          communicated by SMS/email.</li>
          <li><strong>Pay the demand</strong> — security deposit plus any service-connection
          charges, payable online on WSS.</li>
          <li><strong>Energisation.</strong> For a <em>package connection</em> — broadly, a small LT
          supply needing only a weather-proof service wire of up to ~35 m from the post —
          KSEB's own promise is <strong>about two working days</strong> when no earlier
          application is pending in the queue for that category. Your 13-digit consumer number
          arrives by SMS.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs</h2>
        <ul>
          <li><strong>₹50 application fee</strong> for any LT new connection — the only amount due
          at submission.</li>
          <li><strong>Security deposit</strong> — set from the connected load and expected
          consumption, held against future bills, refundable with interest on surrender.</li>
          <li><strong>Service-connection charges</strong> — nil to modest when the premises is
          within a standard service drop; a costed estimate when poles or line extension are
          needed, decided at inspection.</li>
        </ul>
        <p>Nothing is payable in cash to field staff. Estimate the monthly bill for your planned
        load and usage with the <a href="/">bill calculator</a> — Kerala's telescopic slabs make
        the first connection size decision worth five minutes' thought.</p>
      </section>

      <section class="seo-section">
        <h2>5. Timelines and escalation</h2>
        <p>Beyond the two-day package promise, the Electricity (Rights of Consumers) Rules, 2020
        back-stop every case: energisation within 7 days in metropolitan areas, 15 days in other
        municipal areas and 30 days in rural areas once the paid application is complete —
        line-extension cases follow KSERC's Standards of Performance.</p>
        <ul>
          <li><strong>Track it:</strong> the WSS dashboard shows the application stage; the portal
          also publishes the pending-applications queue per section, so you can see exactly where
          you stand.</li>
          <li><strong>Stalled?</strong> Call 1912 with the application number, then the section's
          Assistant Engineer. The next step is a written complaint to KSEB's CGRF citing the 2020
          Rules — delay compensation is payable under the KSERC SoP.</li>
          <li>Once live, decode your first bill with our reading guides and check the slab math on
          the <a href="/tariffs/kerala/kseb/">KSEB tariff page</a>.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'Where do I apply for a new KSEB connection online?',
        a: 'On KSEB’s Web Self Service portal at wss.kseb.in — register, choose New Connection, upload documents and pay the ₹50 LT application fee. The same login later shows your bills and application status.' },
      { q: 'What is a KSEB package connection?',
        a: 'A fast-track for small LT connections that need only a weather-proof service wire (roughly up to 35 m from the post): KSEB’s own promise is energisation in about two working days when no earlier application is pending in that category.' },
      { q: 'What documents do I need for a KSEB new connection?',
        a: 'Identity proof (Aadhaar, voter ID, passport, ration card, PAN), plus ownership or occupancy proof — title deed, ownership certificate, recent land tax receipt or occupancy certificate. Tenants additionally need a no-objection certificate from the owner.' },
      { q: 'How much does a new KSEB connection cost?',
        a: '₹50 application fee at submission; then a security deposit based on load and expected use (refundable), and service-connection charges that are small unless poles or a line extension are required — the inspection fixes the exact figure.' },
      { q: 'My KSEB application is stuck — what do I do?',
        a: 'Check the stage on the WSS dashboard and the published pending queue for your section, call 1912 with the application number, then the section AE. A written CGRF complaint citing the Rights of Consumers Rules, 2020 (7/15/30-day limits) is the formal remedy.' },
    ],
  },
  {
    slug: 'haryana-new-connection-dhbvn-uhbvn',
    published: "2026-07-20",
    states: ['Haryana'],
    title: 'How to Get a New Electricity Connection in Haryana (DHBVN / UHBVN eConnection)',
    metaTitle: 'DHBVN & UHBVN New Connection Online — eConnection Portal, Documents, 7-Day Payment Rule',
    description: 'Step-by-step guide to a new DHBVN or UHBVN electricity connection in Haryana through the dedicated eConnection portals: which DISCOM serves your district, the document checklist, the ₹20 processing fee, the 7-day payment deadline that cancels applications, and statutory timelines.',
    minutes: 7,
    intro: `Haryana's two DISCOMs take new-connection applications on dedicated
      <strong>eConnection portals</strong> — <a href="https://econnection.dhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.dhbvn.org.in</a>
      for South Haryana and
      <a href="https://econnection.uhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.uhbvn.org.in</a>
      for the north — not the general Antyodaya Saral portal, which handles other government
      services. The flow is simple, but one rule catches applicants out: <strong>charges must be
      paid within 7 days of applying or the application is cancelled</strong>. Here is the whole
      process — which portal is yours, documents, fees and the timelines you can enforce.`,
    sections: `
      <section class="seo-section">
        <h2>1. DHBVN or UHBVN — which portal is yours?</h2>
        <ul>
          <li><strong>DHBVN (Dakshin Haryana Bijli Vitran Nigam)</strong> serves South Haryana —
          Gurugram, Faridabad, Hisar, Rewari, Narnaul, Bhiwani, Sirsa, Fatehabad, Jind, Palwal and
          nearby districts. Apply on
          <a href="https://econnection.dhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.dhbvn.org.in</a>.</li>
          <li><strong>UHBVN (Uttar Haryana Bijli Vitran Nigam)</strong> serves the north —
          Panchkula, Ambala, Kurukshetra, Karnal, Panipat, Sonipat, Rohtak, Yamunanagar, Kaithal
          and around. Apply on
          <a href="https://econnection.uhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.uhbvn.org.in</a>.</li>
        </ul>
        <p>Both portals work the same way; both DISCOMs answer on the common 1912 helpline. Slab
        rates and monthly fixed charges for domestic supply are on our
        <a href="/tariffs/haryana/dhbvn/">DHBVN</a> and
        <a href="/tariffs/haryana/uhbvn/">UHBVN</a> tariff pages.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, PAN or driving licence.</td></tr>
            <tr><td><strong>Ownership / occupancy proof</strong></td><td>Registry / sale deed, allotment letter, house-tax receipt, or a rent/lease deed for tenants (with the owner's consent letter).</td></tr>
            <tr><td><strong>Load details</strong></td><td>The form asks for connected-load appliances — a simple list; the portal totals the kW for you.</td></tr>
            <tr><td><strong>Photograph</strong></td><td>One passport-size photo of the applicant.</td></tr>
          </tbody>
        </table></div>
        <p><strong>Tenants can apply:</strong> supply is the occupier's right under Section 43 of
        the Electricity Act, 2003 — rent deed plus the owner's consent (or an indemnity bond) is
        the accepted trail in both DISCOMs.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step — mind the 7-day rule</h2>
        <ol>
          <li><strong>Register</strong> on your DISCOM's eConnection portal with mobile OTP, then
          choose the connection type — Domestic, Non-domestic/Commercial, Agriculture or
          Industrial.</li>
          <li><strong>Fill the form:</strong> district → sub-division, premises address, sanctioned
          load requested and the appliance list. Ask only for the load you need — the monthly fixed
          charge is per sanctioned kW (see our
          <a href="/guides/reduce-fixed-charges-sanctioned-load/">load-sizing guide</a>).</li>
          <li><strong>Upload documents and pay.</strong> The processing fee is nominal (₹20 on
          DHBVN's schedule) and the portal shows a charges calculator for the rest.
          <strong>Pay whatever the portal demands within 7 days of applying — the application is
          auto-cancelled otherwise.</strong></li>
          <li><strong>Site inspection</strong> by the sub-division's JE to verify load and distance
          from the network; any service-line estimate is raised after this visit and is also
          payable online.</li>
          <li><strong>Meter installation and energisation.</strong> Haryana is rolling out smart
          meters, so new urban connections generally get one. The account number arrives by SMS;
          the first bill follows in the next cycle.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs</h2>
        <ul>
          <li><strong>Processing fee</strong> — nominal, paid at submission (₹20 for a DHBVN
          domestic application).</li>
          <li><strong>Security deposit (ACD)</strong> — held against future bills, scaled to load
          and category, refundable on surrender.</li>
          <li><strong>Service connection charges</strong> — fixed per the sales circulars for a
          standard service drop; a costed estimate when line extension is needed.</li>
        </ul>
        <p>Every amount is shown and paid on the portal — nothing is payable in cash to field
        staff. Project your bills for the load you plan to take with the
        <a href="/">bill calculator</a>.</p>
      </section>

      <section class="seo-section">
        <h2>5. Timelines and escalation</h2>
        <p>The Electricity (Rights of Consumers) Rules, 2020 require energisation within
        <strong>7 days in metropolitan areas, 15 days in other municipal areas and 30 days in
        rural areas</strong> after a complete, paid application; line-extension cases follow the
        HERC Standards of Performance, which also prescribe delay compensation.</p>
        <ul>
          <li><strong>Track</strong> the application on the same eConnection portal (status,
          payments, inspection remarks).</li>
          <li><strong>Stalled?</strong> Call 1912 with the application number; escalate to the
          sub-division SDO — the portal names the office. DHBVN also takes complaints at
          dhcomplaints@dhbvn.org.in.</li>
          <li><strong>Formal remedy:</strong> a written complaint to the DISCOM's CGRF citing the
          2020 Rules and the HERC SoP.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'Which portal do I use for a new electricity connection in Haryana?',
        a: 'The DISCOM eConnection portals — econnection.dhbvn.org.in for South Haryana (Gurugram, Faridabad, Hisar…) and econnection.uhbvn.org.in for the north (Panchkula, Karnal, Panipat…). Electricity connections are not applied for on the Antyodaya Saral portal.' },
      { q: 'What is the 7-day payment rule on DHBVN/UHBVN applications?',
        a: 'Charges demanded at application must be paid within 7 days of the application date, or the portal cancels the application automatically. Pay online on the same portal and keep the receipt in your account.' },
      { q: 'What documents are needed for a DHBVN or UHBVN new connection?',
        a: 'Identity proof (Aadhaar/voter ID/PAN), ownership proof (registry, allotment letter or house-tax receipt — or rent deed plus owner consent for tenants), a passport photo, and the appliance/load list the form asks for.' },
      { q: 'How long does a new Haryana connection take?',
        a: 'Under the Rights of Consumers Rules, 2020: 7 days in metropolitan areas, 15 days in municipal areas, 30 days rural, once the application is complete and paid. In practice expect roughly 1–2 weeks where no line extension is needed.' },
      { q: 'Whom do I contact if the application is stuck?',
        a: 'Call 1912 with the application number, then the sub-division SDO named on the portal. DHBVN also answers at dhcomplaints@dhbvn.org.in; the formal route is the CGRF, citing the 2020 Rules and HERC Standards of Performance.' },
    ],
    titleHi: 'हरियाणा में नया बिजली कनेक्शन कैसे लें (DHBVN / UHBVN eConnection)',
    metaTitleHi: 'DHBVN और UHBVN नया कनेक्शन ऑनलाइन — eConnection पोर्टल, दस्तावेज़, 7-दिन भुगतान नियम',
    descriptionHi: 'हरियाणा में DHBVN या UHBVN के नए बिजली कनेक्शन की स्टेप-बाय-स्टेप गाइड: आपके ज़िले की DISCOM कौन-सी है, eConnection पोर्टल, दस्तावेज़ चेकलिस्ट, ₹20 प्रोसेसिंग फीस, 7 दिन में भुगतान न करने पर आवेदन रद्द होने का नियम, और वैधानिक समय-सीमाएँ।',
    introHi: `हरियाणा की दोनों DISCOM नए कनेक्शन के आवेदन अपने-अपने
      <strong>eConnection पोर्टल</strong> पर लेती हैं —
      दक्षिण हरियाणा के लिए <a href="https://econnection.dhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.dhbvn.org.in</a>
      और उत्तर के लिए <a href="https://econnection.uhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.uhbvn.org.in</a> —
      अंत्योदय सरल पोर्टल पर नहीं, वह बाकी सरकारी सेवाओं के लिए है। प्रक्रिया सीधी है, बस एक नियम
      ध्यान रखें: <strong>आवेदन के 7 दिन के भीतर शुल्क न भरा तो आवेदन रद्द</strong>। यहाँ पूरा
      तरीका है — आपका पोर्टल कौन-सा है, दस्तावेज़, फीस और वे समय-सीमाएँ जो आप कानूनन लागू करा सकते हैं।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. DHBVN या UHBVN — आपका पोर्टल कौन-सा?</h2>
        <ul>
          <li><strong>DHBVN (दक्षिण हरियाणा बिजली वितरण निगम)</strong> — गुरुग्राम, फ़रीदाबाद,
          हिसार, रेवाड़ी, नारनौल, भिवानी, सिरसा, फ़तेहाबाद, जींद, पलवल और आस-पास के ज़िले। आवेदन
          <a href="https://econnection.dhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.dhbvn.org.in</a> पर।</li>
          <li><strong>UHBVN (उत्तर हरियाणा बिजली वितरण निगम)</strong> — पंचकूला, अंबाला,
          कुरुक्षेत्र, करनाल, पानीपत, सोनीपत, रोहतक, यमुनानगर, कैथल आदि। आवेदन
          <a href="https://econnection.uhbvn.org.in/" rel="nofollow noopener" target="_blank">econnection.uhbvn.org.in</a> पर।</li>
        </ul>
        <p>दोनों पोर्टल एक जैसे चलते हैं; हेल्पलाइन दोनों की 1912 है। घरेलू स्लैब दरें और मासिक
        फिक्स्ड चार्ज हमारी <a href="/hi/tariffs/haryana/dhbvn/">DHBVN</a> और
        <a href="/hi/tariffs/haryana/uhbvn/">UHBVN</a> टैरिफ पेजों पर हैं।</p>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार, वोटर ID, पासपोर्ट, PAN या ड्राइविंग लाइसेंस।</td></tr>
            <tr><td><strong>स्वामित्व / कब्ज़ा प्रमाण</strong></td><td>रजिस्ट्री / सेल डीड, अलॉटमेंट लेटर, हाउस-टैक्स रसीद, या किरायेदारों के लिए रेंट/लीज़ डीड (मालिक की सहमति के साथ)।</td></tr>
            <tr><td><strong>लोड विवरण</strong></td><td>फॉर्म में उपकरणों की सूची भरनी होती है — पोर्टल कुल kW खुद जोड़ देता है।</td></tr>
            <tr><td><strong>फोटो</strong></td><td>आवेदक की एक पासपोर्ट-साइज़ फोटो।</td></tr>
          </tbody>
        </table></div>
        <p><strong>किरायेदार भी आवेदन कर सकते हैं:</strong> विद्युत अधिनियम, 2003 की धारा 43 के
        तहत बिजली परिसर में रहने वाले का अधिकार है — रेंट डीड और मालिक की सहमति (या क्षतिपूर्ति
        बॉन्ड) दोनों निगमों में मान्य तरीका है।</p>
      </section>

      <section class="seo-section">
        <h2>3. आवेदन, स्टेप-बाय-स्टेप — 7 दिन का नियम याद रखें</h2>
        <ol>
          <li><strong>रजिस्टर करें</strong> अपनी DISCOM के eConnection पोर्टल पर (मोबाइल OTP), फिर
          कनेक्शन का प्रकार चुनें — घरेलू, गैर-घरेलू/वाणिज्यिक, कृषि या औद्योगिक।</li>
          <li><strong>फॉर्म भरें:</strong> ज़िला → उपखंड, परिसर का पता, माँगा गया स्वीकृत भार और
          उपकरण सूची। उतना ही भार माँगें जितनी ज़रूरत है — फिक्स्ड चार्ज हर महीने प्रति स्वीकृत kW
          लगता है (हमारी <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">लोड गाइड</a> देखें)।</li>
          <li><strong>दस्तावेज़ अपलोड कर भुगतान करें।</strong> प्रोसेसिंग फीस मामूली है (DHBVN में
          घरेलू के लिए ₹20) और बाकी राशि पोर्टल का कैलकुलेटर दिखा देता है।
          <strong>पोर्टल जो भी माँगे, आवेदन के 7 दिन के भीतर भरें — वरना आवेदन अपने आप रद्द।</strong></li>
          <li><strong>साइट निरीक्षण</strong> — उपखंड का JE लोड और नेटवर्क से दूरी जाँचता है; लाइन
          बढ़ानी हो तो एस्टीमेट इसी के बाद बनता है, भुगतान ऑनलाइन।</li>
          <li><strong>मीटर लगना और सप्लाई चालू।</strong> हरियाणा में स्मार्ट मीटर लग रहे हैं, नए शहरी
          कनेक्शनों पर प्रायः यही मिलेगा। खाता नंबर SMS से आता है; पहला बिल अगले चक्र में।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना</h2>
        <ul>
          <li><strong>प्रोसेसिंग फीस</strong> — आवेदन पर मामूली राशि (DHBVN घरेलू: ₹20)।</li>
          <li><strong>सिक्योरिटी डिपॉज़िट (ACD)</strong> — भार और श्रेणी के हिसाब से; भविष्य के बिलों
          की ज़मानत, कनेक्शन छोड़ने पर वापसी योग्य।</li>
          <li><strong>सर्विस कनेक्शन शुल्क</strong> — सामान्य सर्विस ड्रॉप के लिए सर्कुलर-निर्धारित;
          लाइन बढ़ानी हो तो एस्टीमेट के अनुसार।</li>
        </ul>
        <p>हर राशि पोर्टल पर दिखती और वहीं भरी जाती है — फ़ील्ड स्टाफ़ को नकद कुछ नहीं देना।
        अपने भार के हिसाब से बिल का अनुमान <a href="/">बिल कैलकुलेटर</a> से लगाएँ।</p>
      </section>

      <section class="seo-section">
        <h2>5. समय-सीमाएँ और शिकायत</h2>
        <p>विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत पूर्ण और भुगतान-सहित आवेदन पर कनेक्शन
        <strong>महानगरों में 7 दिन, अन्य नगरीय क्षेत्रों में 15 दिन और ग्रामीण क्षेत्रों में 30 दिन</strong>
        में चालू होना चाहिए; लाइन-विस्तार के मामले HERC के Standards of Performance से चलते हैं,
        जिनमें देरी पर मुआवज़ा भी तय है।</p>
        <ul>
          <li><strong>ट्रैकिंग:</strong> उसी eConnection पोर्टल पर स्थिति, भुगतान और निरीक्षण
          टिप्पणियाँ दिखती हैं।</li>
          <li><strong>अटक गया?</strong> आवेदन नंबर के साथ 1912 पर कॉल करें; फिर पोर्टल पर दिख रहे
          उपखंड SDO से। DHBVN में dhcomplaints@dhbvn.org.in पर भी शिकायत होती है।</li>
          <li><strong>औपचारिक रास्ता:</strong> 2020 नियमों और HERC SoP का हवाला देते हुए CGRF में
          लिखित शिकायत।</li>
        </ul>
      </section>`,
    faqsHi: [
      { q: 'हरियाणा में नए बिजली कनेक्शन के लिए कौन-सा पोर्टल है?',
        a: 'DISCOM के eConnection पोर्टल — दक्षिण हरियाणा (गुरुग्राम, फ़रीदाबाद, हिसार…) के लिए econnection.dhbvn.org.in और उत्तर (पंचकूला, करनाल, पानीपत…) के लिए econnection.uhbvn.org.in। बिजली कनेक्शन अंत्योदय सरल पोर्टल से नहीं होते।' },
      { q: 'DHBVN/UHBVN आवेदन का 7-दिन भुगतान नियम क्या है?',
        a: 'आवेदन पर माँगा गया शुल्क आवेदन की तारीख से 7 दिन के भीतर न भरने पर पोर्टल आवेदन अपने आप रद्द कर देता है। भुगतान उसी पोर्टल पर ऑनलाइन करें और रसीद खाते में सँभालें।' },
      { q: 'नए कनेक्शन के लिए कौन-से दस्तावेज़ चाहिए?',
        a: 'पहचान प्रमाण (आधार/वोटर ID/PAN), स्वामित्व प्रमाण (रजिस्ट्री, अलॉटमेंट लेटर या हाउस-टैक्स रसीद — किरायेदारों के लिए रेंट डीड + मालिक की सहमति), पासपोर्ट फोटो, और फॉर्म में माँगी गई उपकरण/लोड सूची।' },
      { q: 'हरियाणा में नया कनेक्शन कितने दिन में मिलता है?',
        a: 'उपभोक्ता अधिकार नियम, 2020 के अनुसार: महानगरों में 7 दिन, नगरीय क्षेत्रों में 15 दिन, ग्रामीण में 30 दिन — पूर्ण, भुगतान-सहित आवेदन के बाद। लाइन-विस्तार न हो तो व्यवहार में 1–2 हफ़्ते सामान्य हैं।' },
      { q: 'आवेदन अटक जाए तो किससे संपर्क करें?',
        a: 'आवेदन नंबर के साथ 1912 पर, फिर पोर्टल पर दिख रहे उपखंड SDO से। DHBVN में dhcomplaints@dhbvn.org.in भी है; औपचारिक रास्ता CGRF है — 2020 नियमों और HERC SoP का हवाला दें।' },
    ],
  },
  {
    slug: 'wbsedcl-new-connection-online',
    published: "2026-07-20",
    states: ['West Bengal'],
    title: 'How to Get a New WBSEDCL Electricity Connection Online (West Bengal)',
    metaTitle: 'WBSEDCL New Connection Online — Instant Quotation, Documents, Vidyut Sahayogi App',
    description: 'Step-by-step guide to a new WBSEDCL electricity connection: applying on wbsedcl.in or the Vidyut Sahayogi app, the instant provisional quotation and 10-digit application number, documents, security deposit, inspection timelines, and what to do when it stalls. Kolkata city readers: CESC is a separate utility.',
    minutes: 7,
    intro: `WBSEDCL serves nearly all of West Bengal outside Kolkata city (Kolkata proper is
      <a href="/tariffs/west-bengal/cesc_kolkata/">CESC territory</a> — a different company with
      its own process). A new WBSEDCL domestic connection is applied for on
      <a href="https://www.wbsedcl.in/" rel="nofollow noopener" target="_blank">wbsedcl.in</a> or
      the <strong>Vidyut Sahayogi</strong> mobile app, and the portal's best feature is speed at
      the first step: the moment you submit, it generates an <strong>instant provisional
      quotation</strong> and a 10-digit application number. Here is the full flow — documents,
      the quotation, inspection timelines and escalation.`,
    sections: `
      <section class="seo-section">
        <h2>1. Where to apply — and the CESC exception</h2>
        <ul>
          <li><strong>WBSEDCL web portal:</strong> <em>Online Application → New Connection</em> on
          <a href="https://www.wbsedcl.in/" rel="nofollow noopener" target="_blank">wbsedcl.in</a> —
          the LT domestic flow covers houses, flats and small shops.</li>
          <li><strong>Vidyut Sahayogi app</strong> (Android/iOS) — the same application, quotation
          and payment flow on a phone.</li>
          <li><strong>Kolkata city:</strong> premises inside the CESC licence area (roughly the
          KMC core) apply to CESC, not WBSEDCL — check whose bill your neighbours receive if in
          doubt.</li>
        </ul>
        <p>Domestic slab rates and the fixed charge you will pay once live are on our
        <a href="/tariffs/west-bengal/wbsedcl/">WBSEDCL tariff page</a>.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, driving licence, PAN or any government photo ID.</td></tr>
            <tr><td><strong>Ownership / occupancy proof</strong></td><td>Sale deed, lease or rent deed, panchayat/municipal tax receipt, or a government document evidencing occupancy — WBSEDCL's list is deliberately broad.</td></tr>
            <tr><td><strong>Photograph</strong></td><td>One passport-size photo of the applicant.</td></tr>
            <tr><td><strong>Tenants</strong></td><td>Rent deed or rent receipt works as occupancy proof; the owner's no-objection letter smooths the inspection.</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step</h2>
        <ol>
          <li><strong>Fill the online form</strong> — district → supply office, premises details,
          load and phase (single-phase covers most homes). Ask only for the load you need; the
          fixed charge scales with it (our
          <a href="/guides/reduce-fixed-charges-sanctioned-load/">load-sizing guide</a> helps).</li>
          <li><strong>Instant provisional quotation.</strong> On submission the system immediately
          generates the quotation for service-connection charges plus security deposit, tied to a
          <strong>10-digit application number</strong>. Download it — everything else quotes this
          number.</li>
          <li><strong>Pay the quotation</strong> online (net-banking/UPI/card on the portal or app)
          or at the local Customer Care Centre.</li>
          <li><strong>Site inspection.</strong> A WBSEDCL representative inspects within about
          <strong>3–7 days of payment</strong> (urban faster, rural allowed longer) to confirm
          technical feasibility and that the premises wiring is ready.</li>
          <li><strong>Energisation.</strong> After formalities WBSEDCL's charter promises execution
          of the service-connection work within about <strong>7 days</strong>; the consumer ID
          arrives by SMS and the first bill follows in the next cycle.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs</h2>
        <ul>
          <li><strong>Service-connection charges</strong> — printed on the instant quotation; small
          for a premises within a standard service drop of the line.</li>
          <li><strong>Security deposit</strong> — calculated from the contractual load and tariff,
          shown on the same quotation; held against future bills and refundable on surrender. An
          existing consumer shifting premises can ask for the old deposit to be adjusted.</li>
          <li><strong>Line extension</strong> — where poles or line are needed, a revised estimate
          follows the inspection instead of the flat quotation.</li>
        </ul>
        <p>Pay only through the portal, app or Customer Care Centre — never in cash to field
        staff. Estimate the monthly bill for your planned load with the
        <a href="/">bill calculator</a>.</p>
      </section>

      <section class="seo-section">
        <h2>5. Timelines and escalation</h2>
        <p>West Bengal's Right to Public Services Act puts a 7-day clock on the approval stage,
        and the Electricity (Rights of Consumers) Rules, 2020 back-stop energisation: 7 days
        metropolitan, 15 days municipal, 30 days rural after a complete paid application —
        line-extension cases follow WBERC's Standards of Performance.</p>
        <ul>
          <li><strong>Track</strong> with the 10-digit application number on the portal or the
          Vidyut Sahayogi app.</li>
          <li><strong>Stalled?</strong> Call 19121 (WBSEDCL's helpline) with the number, then the
          Station Manager of the supply office named on your quotation.</li>
          <li><strong>Formal remedy:</strong> written complaint to WBSEDCL's grievance cell and the
          CGRF, citing the 2020 Rules and the WBERC SoP.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'Where do I apply for a new WBSEDCL connection?',
        a: 'On wbsedcl.in (Online Application → New Connection) or the Vidyut Sahayogi mobile app. Premises inside Kolkata city are served by CESC, a separate company, and apply there instead.' },
      { q: 'What is the WBSEDCL instant provisional quotation?',
        a: 'The system generates the quotation for service-connection charges plus security deposit the moment you submit the application, with a 10-digit application number. Pay it online or at a Customer Care Centre to move to inspection.' },
      { q: 'What documents does WBSEDCL need?',
        a: 'Any government photo ID (Aadhaar, voter ID, passport, PAN), ownership or occupancy proof (sale/lease/rent deed, municipal tax receipt), and a passport-size photo. Tenants can use a rent deed or rent receipt.' },
      { q: 'How long does a new WBSEDCL connection take?',
        a: 'Inspection is due within about 3–7 days of paying the quotation, and the charter promises the connection work within about 7 days after formalities. The 2020 Rights of Consumers Rules cap the whole thing at 7/15/30 days (metro/municipal/rural).' },
      { q: 'The application is stuck — whom do I contact?',
        a: 'Call 19121 with your 10-digit application number, then the Station Manager of your supply office. The formal route is WBSEDCL’s grievance cell and the CGRF, citing the 2020 Rules and WBERC Standards of Performance.' },
    ],
    titleHi: 'WBSEDCL का नया बिजली कनेक्शन ऑनलाइन कैसे लें (पश्चिम बंगाल)',
    metaTitleHi: 'WBSEDCL नया कनेक्शन ऑनलाइन — तुरंत कोटेशन, दस्तावेज़, विद्युत सहयोगी ऐप',
    descriptionHi: 'WBSEDCL के नए बिजली कनेक्शन की स्टेप-बाय-स्टेप गाइड: wbsedcl.in या विद्युत सहयोगी ऐप से आवेदन, तुरंत मिलने वाला प्रोविज़नल कोटेशन और 10-अंकों का आवेदन नंबर, दस्तावेज़, सिक्योरिटी डिपॉज़िट, निरीक्षण की समय-सीमाएँ और शिकायत का तरीका। कोलकाता शहर में CESC अलग कंपनी है।',
    introHi: `कोलकाता शहर को छोड़कर लगभग पूरे पश्चिम बंगाल में बिजली WBSEDCL देती है (कोलकाता
      <a href="/hi/tariffs/west-bengal/cesc_kolkata/">CESC का क्षेत्र</a> है — अलग कंपनी, अलग
      प्रक्रिया)। WBSEDCL का नया घरेलू कनेक्शन
      <a href="https://www.wbsedcl.in/" rel="nofollow noopener" target="_blank">wbsedcl.in</a> या
      <strong>विद्युत सहयोगी</strong> मोबाइल ऐप से लिया जाता है, और इस पोर्टल की सबसे अच्छी बात
      पहला कदम है: सबमिट करते ही <strong>तुरंत प्रोविज़नल कोटेशन</strong> और 10 अंकों का आवेदन
      नंबर मिल जाता है। यहाँ पूरी प्रक्रिया है — दस्तावेज़, कोटेशन, निरीक्षण की समय-सीमाएँ और
      शिकायत का रास्ता।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. आवेदन कहाँ करें — और कोलकाता का अपवाद</h2>
        <ul>
          <li><strong>WBSEDCL वेब पोर्टल:</strong>
          <a href="https://www.wbsedcl.in/" rel="nofollow noopener" target="_blank">wbsedcl.in</a> पर
          <em>Online Application → New Connection</em> — LT घरेलू फ़्लो में मकान, फ़्लैट और छोटी
          दुकानें आती हैं।</li>
          <li><strong>विद्युत सहयोगी ऐप</strong> (Android/iOS) — वही आवेदन, कोटेशन और भुगतान फोन
          पर।</li>
          <li><strong>कोलकाता शहर:</strong> CESC लाइसेंस क्षेत्र (मोटे तौर पर KMC का कोर) के परिसर
          WBSEDCL नहीं, CESC में आवेदन करते हैं — शक हो तो देखें पड़ोसियों का बिल किसका आता है।</li>
        </ul>
        <p>घरेलू स्लैब दरें और फिक्स्ड चार्ज हमारी
        <a href="/hi/tariffs/west-bengal/wbsedcl/">WBSEDCL टैरिफ पेज</a> पर हैं।</p>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार, वोटर ID, पासपोर्ट, ड्राइविंग लाइसेंस, PAN या कोई सरकारी फोटो ID।</td></tr>
            <tr><td><strong>स्वामित्व / कब्ज़ा प्रमाण</strong></td><td>सेल डीड, लीज़ या रेंट डीड, पंचायत/नगरपालिका टैक्स रसीद, या कब्ज़ा दर्शाने वाला सरकारी दस्तावेज़ — WBSEDCL की सूची जान-बूझकर व्यापक है।</td></tr>
            <tr><td><strong>फोटो</strong></td><td>आवेदक की एक पासपोर्ट-साइज़ फोटो।</td></tr>
            <tr><td><strong>किरायेदार</strong></td><td>रेंट डीड या किराया रसीद कब्ज़ा-प्रमाण का काम करती है; मालिक का अनापत्ति पत्र निरीक्षण आसान कर देता है।</td></tr>
          </tbody>
        </table></div>
      </section>

      <section class="seo-section">
        <h2>3. आवेदन, स्टेप-बाय-स्टेप</h2>
        <ol>
          <li><strong>ऑनलाइन फॉर्म भरें</strong> — ज़िला → सप्लाई ऑफ़िस, परिसर विवरण, भार और फेज़
          (ज़्यादातर घरों के लिए सिंगल-फेज़)। उतना ही भार माँगें जितनी ज़रूरत है — फिक्स्ड चार्ज उसी से
          बढ़ता है (हमारी <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">लोड गाइड</a> देखें)।</li>
          <li><strong>तुरंत प्रोविज़नल कोटेशन।</strong> सबमिट करते ही सिस्टम सर्विस-कनेक्शन शुल्क +
          सिक्योरिटी डिपॉज़िट का कोटेशन बना देता है, साथ में <strong>10 अंकों का आवेदन नंबर</strong>।
          इसे डाउनलोड कर लें — आगे सब कुछ इसी नंबर से चलता है।</li>
          <li><strong>कोटेशन भरें</strong> — पोर्टल/ऐप पर नेट-बैंकिंग/UPI/कार्ड से, या नज़दीकी
          कस्टमर केयर सेंटर पर।</li>
          <li><strong>साइट निरीक्षण।</strong> भुगतान के लगभग <strong>3–7 दिन</strong> में (शहरी जल्दी,
          ग्रामीण में थोड़ा अधिक) WBSEDCL का प्रतिनिधि तकनीकी व्यवहार्यता और वायरिंग की तैयारी
          जाँचता है।</li>
          <li><strong>सप्लाई चालू।</strong> औपचारिकताओं के बाद चार्टर लगभग <strong>7 दिन</strong> में
          कनेक्शन का काम पूरा करने का वादा करता है; कंज़्यूमर ID SMS से आती है और पहला बिल अगले
          चक्र में।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना</h2>
        <ul>
          <li><strong>सर्विस-कनेक्शन शुल्क</strong> — तुरंत मिले कोटेशन पर छपा होता है; लाइन के पास के
          परिसर के लिए छोटा।</li>
          <li><strong>सिक्योरिटी डिपॉज़िट</strong> — अनुबंधित भार और टैरिफ से तय, उसी कोटेशन पर;
          भविष्य के बिलों की ज़मानत, कनेक्शन छोड़ने पर वापसी योग्य। पुराने उपभोक्ता परिसर बदलें तो
          पुराना डिपॉज़िट समायोजित कराने को कह सकते हैं।</li>
          <li><strong>लाइन विस्तार</strong> — पोल या लाइन की ज़रूरत हो तो निरीक्षण के बाद संशोधित
          एस्टीमेट आता है।</li>
        </ul>
        <p>भुगतान केवल पोर्टल, ऐप या कस्टमर केयर सेंटर से — फ़ील्ड स्टाफ़ को नकद कभी नहीं। अपने भार
        के हिसाब से बिल का अनुमान <a href="/">बिल कैलकुलेटर</a> से लगाएँ।</p>
      </section>

      <section class="seo-section">
        <h2>5. समय-सीमाएँ और शिकायत</h2>
        <p>पश्चिम बंगाल का Right to Public Services अधिनियम मंज़ूरी पर 7 दिन की घड़ी लगाता है, और
        विद्युत (उपभोक्ता अधिकार) नियम, 2020 पूरे काम की सीमा तय करते हैं: पूर्ण, भुगतान-सहित आवेदन
        पर महानगर में 7, नगरीय क्षेत्र में 15 और ग्रामीण में 30 दिन — लाइन-विस्तार के मामले WBERC के
        Standards of Performance से।</p>
        <ul>
          <li><strong>ट्रैकिंग:</strong> 10 अंकों के आवेदन नंबर से पोर्टल या विद्युत सहयोगी ऐप पर।</li>
          <li><strong>अटक गया?</strong> आवेदन नंबर के साथ 19121 (WBSEDCL हेल्पलाइन) पर, फिर कोटेशन
          पर लिखे सप्लाई ऑफ़िस के स्टेशन मैनेजर से।</li>
          <li><strong>औपचारिक रास्ता:</strong> 2020 नियमों और WBERC SoP का हवाला देते हुए WBSEDCL
          ग्रीवांस सेल और CGRF में लिखित शिकायत।</li>
        </ul>
      </section>`,
    faqsHi: [
      { q: 'WBSEDCL का नया कनेक्शन कहाँ से लें?',
        a: 'wbsedcl.in पर (Online Application → New Connection) या विद्युत सहयोगी मोबाइल ऐप से। कोलकाता शहर के परिसर CESC (अलग कंपनी) के हैं — वहाँ आवेदन CESC में होता है।' },
      { q: 'WBSEDCL का तुरंत प्रोविज़नल कोटेशन क्या है?',
        a: 'आवेदन सबमिट करते ही सिस्टम सर्विस-कनेक्शन शुल्क + सिक्योरिटी डिपॉज़िट का कोटेशन और 10 अंकों का आवेदन नंबर बना देता है। इसे ऑनलाइन या कस्टमर केयर सेंटर पर भरते ही निरीक्षण का चरण शुरू होता है।' },
      { q: 'WBSEDCL को कौन-से दस्तावेज़ चाहिए?',
        a: 'कोई सरकारी फोटो ID (आधार, वोटर ID, पासपोर्ट, PAN), स्वामित्व/कब्ज़ा प्रमाण (सेल/लीज़/रेंट डीड, नगरपालिका टैक्स रसीद) और एक पासपोर्ट-साइज़ फोटो। किरायेदार रेंट डीड या किराया रसीद दे सकते हैं।' },
      { q: 'WBSEDCL का नया कनेक्शन कितने दिन में मिलता है?',
        a: 'कोटेशन भरने के लगभग 3–7 दिन में निरीक्षण, और औपचारिकताओं के बाद लगभग 7 दिन में कनेक्शन का काम — चार्टर का वादा। 2020 उपभोक्ता अधिकार नियम पूरी प्रक्रिया 7/15/30 दिन (महानगर/नगरीय/ग्रामीण) में बाँधते हैं।' },
      { q: 'आवेदन अटक जाए तो किससे संपर्क करें?',
        a: '10 अंकों के आवेदन नंबर के साथ 19121 पर कॉल करें, फिर अपने सप्लाई ऑफ़िस के स्टेशन मैनेजर से। औपचारिक रास्ता WBSEDCL ग्रीवांस सेल और CGRF है — 2020 नियमों और WBERC SoP का हवाला दें।' },
    ],
  },
  {
    slug: 'pspcl-new-connection-online',
    published: "2026-07-20",
    states: ['Punjab'],
    title: 'How to Get a New PSPCL Electricity Connection Online (Punjab)',
    metaTitle: 'PSPCL New Connection Online — NSC Portal, A&A Form, Documents, 30-Day Rule',
    description: 'Step-by-step guide to a new PSPCL electricity connection in Punjab: applying on the online NSC portal via pspcl.in, the A&A (Application & Agreement) form, documents, processing fee, ACD and meter security, the 30-day auto-cancellation rule, demand notice download, and statutory timelines.',
    minutes: 7,
    intro: `Punjab has a single DISCOM — PSPCL — and since 2021 every new-connection application
      is registered online, through the <strong>New Service Connection (NSC) flow</strong> reached
      from <a href="https://www.pspcl.in/" rel="nofollow noopener" target="_blank">pspcl.in</a> →
      <em>New Connection</em>. The portal is genuinely self-service — it shows your application,
      payment and document timelines, and even the phone number of the XEN handling your file —
      but it also enforces a hard deadline: <strong>upload the A&amp;A form and pay within 30
      days, or the application cancels itself</strong>. Here is the whole flow.`,
    sections: `
      <section class="seo-section">
        <h2>1. The NSC portal — and what the A&amp;A form is</h2>
        <p>From <a href="https://www.pspcl.in/" rel="nofollow noopener" target="_blank">pspcl.in</a>,
        <em>New Connection</em> opens the online NSC application (hosted on PSPCL's connections
        portal). Register with mobile OTP, and note two PSPCL-specific things:</p>
        <ul>
          <li><strong>The A&amp;A form</strong> — Application &amp; Agreement — is the signed
          contract between you and PSPCL. The portal generates it; you print, sign and upload it
          back. An application without the A&amp;A form is not complete.</li>
          <li><strong>Everything is tracked in your login:</strong> application status, charges,
          payment history, a <em>Document Timeline</em> (where the demand notice appears for
          download) and the <em>XEN contact details</em> for your division.</li>
        </ul>
        <p>Domestic supply is billed under DS; current slab rates and fixed charges — and
        Punjab's 300-unit free-power subsidy for domestic consumers — are on our
        <a href="/tariffs/punjab/pspcl/">PSPCL tariff page</a>.</p>
      </section>

      <section class="seo-section">
        <h2>2. Documents</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>Requirement</th><th>Accepted documents</th></tr></thead>
          <tbody>
            <tr><td><strong>Identity proof</strong></td><td>Aadhaar, voter ID, passport, driving licence, ration card, PAN or any government photo ID.</td></tr>
            <tr><td><strong>Ownership / occupancy proof</strong></td><td>Registry, fard (revenue record), allotment letter, sale deed, rent or lease deed.</td></tr>
            <tr><td><strong>A&amp;A form</strong></td><td>Portal-generated; print, sign and upload (PDF/JPG).</td></tr>
            <tr><td><strong>Photograph</strong></td><td>One passport-size photo of the applicant.</td></tr>
          </tbody>
        </table></div>
        <p><strong>Tenants:</strong> a rent or lease deed is accepted as occupancy proof — supply
        is the occupier's right under Section 43 of the Electricity Act, 2003; an indemnity bond
        covers the case where the owner will not sign.</p>
      </section>

      <section class="seo-section">
        <h2>3. The application, step by step — mind the 30-day rule</h2>
        <ol>
          <li><strong>Register and fill the NSC form:</strong> district → division → sub-division,
          category (DS for a home), and the load you need. Fixed charges scale per kW, so size it
          honestly — our <a href="/guides/reduce-fixed-charges-sanctioned-load/">load guide</a>
          shows the trade-off.</li>
          <li><strong>Upload documents</strong> (PDF/JPG) and pay the <strong>processing fee</strong>
          online.</li>
          <li><strong>Download, sign and re-upload the A&amp;A form.</strong>
          <strong>Both the A&amp;A upload and the security payment must happen within 30 days of
          applying — the portal cancels the application after that.</strong></li>
          <li><strong>Demand notice.</strong> PSPCL raises the charges — ACD (advance consumption
          deposit), meter security and any service-line cost per the Schedule of General Charges —
          and the notice lands in your <em>Document Timeline</em> for download. Pay online.</li>
          <li><strong>Inspection and meter.</strong> The sub-division verifies the premises wiring
          and installs the meter; your account number arrives by SMS and the first bill follows in
          the next cycle.</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. What it costs</h2>
        <ul>
          <li><strong>Processing fee</strong> — small, paid at application.</li>
          <li><strong>ACD (advance consumption deposit)</strong> — roughly ₹1,000–₹3,000 for typical
          domestic loads, held against your future bills and refundable on surrender.</li>
          <li><strong>Meter security</strong> — a separate deposit for the meter itself, per the
          Schedule of General Charges.</li>
          <li><strong>Service-line charges</strong> — nil to modest within a standard service drop;
          a costed estimate when line extension is needed.</li>
        </ul>
        <p>Every rupee is demanded and paid through the portal — no cash to field staff. Remember
        Punjab's domestic subsidy (zero bill up to 300 units for eligible households) applies only
        after the connection is in your name; project the post-subsidy bill with the
        <a href="/">bill calculator</a>.</p>
      </section>

      <section class="seo-section">
        <h2>5. Timelines and escalation</h2>
        <p>The Electricity (Rights of Consumers) Rules, 2020 require energisation within
        <strong>7 days in metropolitan areas, 15 days in other municipal areas and 30 days in
        rural areas</strong> once the paid, complete application (A&amp;A included) is in;
        line-extension cases follow PSERC's Standards of Performance, which prescribe
        compensation for delay.</p>
        <ul>
          <li><strong>Track:</strong> the NSC login shows every stage; the XEN's name and number
          for your division are right there — use them.</li>
          <li><strong>Stalled?</strong> Call 1912 with the application number, then the XEN. PSPCL's
          single-window cell also answers at sws.pspcl@gmail.com.</li>
          <li><strong>Formal remedy:</strong> written complaint to the CGRF (Forum for Redressal of
          Grievances of Consumers), citing the 2020 Rules and PSERC SoP.</li>
        </ul>
      </section>`,
    faqs: [
      { q: 'Where do I apply for a new PSPCL connection?',
        a: 'Online, from pspcl.in → New Connection, which opens PSPCL’s NSC (New Service Connection) portal. Online registration has been mandatory since 2021 — no office visit is needed to apply.' },
      { q: 'What is the PSPCL A&A form?',
        a: 'The Application & Agreement form — the signed supply contract. The portal generates it; you print, sign and upload it back. The application is incomplete without it, and A&A plus security payment must be done within 30 days or the application auto-cancels.' },
      { q: 'What does a new PSPCL connection cost?',
        a: 'A small processing fee at application, then ACD (advance consumption deposit, roughly ₹1,000–₹3,000 for typical domestic loads), meter security, and service-line charges per the Schedule of General Charges. The demand notice in your Document Timeline shows the exact figures.' },
      { q: 'How long does a new PSPCL connection take?',
        a: 'The Rights of Consumers Rules, 2020 require 7 days in metropolitan areas, 15 in municipal, 30 in rural once the complete paid application is in. The NSC portal shows each stage, and the XEN contact for your division if it stalls.' },
      { q: 'Does Punjab’s 300-unit free power apply to a new connection?',
        a: 'Yes, once the connection is live and in the eligible household’s name — the subsidy attaches to the domestic account, not the application. Bills up to 300 units/billing cycle are zeroed for eligible consumers; above that, normal DS slabs apply.' },
    ],
    titleHi: 'पंजाब में नया PSPCL बिजली कनेक्शन ऑनलाइन कैसे लें',
    metaTitleHi: 'PSPCL नया कनेक्शन ऑनलाइन — NSC पोर्टल, A&A फॉर्म, दस्तावेज़, 30-दिन नियम',
    descriptionHi: 'पंजाब में नए PSPCL बिजली कनेक्शन की स्टेप-बाय-स्टेप गाइड: pspcl.in से NSC पोर्टल पर आवेदन, A&A (Application & Agreement) फॉर्म, दस्तावेज़, प्रोसेसिंग फीस, ACD और मीटर सिक्योरिटी, 30 दिन में काम पूरा न करने पर आवेदन रद्द होने का नियम, डिमांड नोटिस डाउनलोड और वैधानिक समय-सीमाएँ।',
    introHi: `पंजाब में एक ही DISCOM है — PSPCL — और 2021 से हर नए कनेक्शन का आवेदन ऑनलाइन ही
      दर्ज होता है, <a href="https://www.pspcl.in/" rel="nofollow noopener" target="_blank">pspcl.in</a> →
      <em>New Connection</em> से खुलने वाले <strong>NSC (New Service Connection) फ़्लो</strong> पर।
      पोर्टल सचमुच सेल्फ़-सर्विस है — आवेदन, भुगतान और दस्तावेज़ों की टाइमलाइन, यहाँ तक कि आपकी
      फ़ाइल देख रहे XEN का फ़ोन नंबर भी दिखाता है — पर एक सख़्त समय-सीमा भी लगाता है:
      <strong>A&amp;A फॉर्म अपलोड और भुगतान 30 दिन के भीतर, वरना आवेदन अपने आप रद्द</strong>।
      पूरी प्रक्रिया यह रही।`,
    sectionsHi: `
      <section class="seo-section">
        <h2>1. NSC पोर्टल — और A&amp;A फॉर्म क्या है</h2>
        <p><a href="https://www.pspcl.in/" rel="nofollow noopener" target="_blank">pspcl.in</a> से
        <em>New Connection</em> पर ऑनलाइन NSC आवेदन खुलता है (PSPCL के कनेक्शन पोर्टल पर)। मोबाइल
        OTP से रजिस्टर करें, और PSPCL की दो ख़ास बातें नोट करें:</p>
        <ul>
          <li><strong>A&amp;A फॉर्म</strong> — Application &amp; Agreement — आपके और PSPCL के बीच
          हस्ताक्षरित अनुबंध है। पोर्टल इसे बनाता है; आप प्रिंट कर, साइन कर वापस अपलोड करते हैं।
          A&amp;A के बिना आवेदन अधूरा है।</li>
          <li><strong>सब कुछ आपके लॉगिन में:</strong> आवेदन की स्थिति, शुल्क, भुगतान इतिहास,
          <em>Document Timeline</em> (जहाँ डिमांड नोटिस डाउनलोड के लिए आता है) और आपके डिवीज़न के
          <em>XEN का संपर्क</em>।</li>
        </ul>
        <p>घरेलू सप्लाई DS श्रेणी में बिल होती है; मौजूदा स्लैब दरें, फिक्स्ड चार्ज — और पंजाब की
        300 यूनिट मुफ़्त बिजली सब्सिडी — हमारी
        <a href="/hi/tariffs/punjab/pspcl/">PSPCL टैरिफ पेज</a> पर हैं।</p>
      </section>

      <section class="seo-section">
        <h2>2. दस्तावेज़</h2>
        <div class="comparison-table-wrapper"><table class="comparison-table">
          <thead><tr><th>ज़रूरत</th><th>मान्य दस्तावेज़</th></tr></thead>
          <tbody>
            <tr><td><strong>पहचान प्रमाण</strong></td><td>आधार, वोटर ID, पासपोर्ट, ड्राइविंग लाइसेंस, राशन कार्ड, PAN या कोई सरकारी फोटो ID।</td></tr>
            <tr><td><strong>स्वामित्व / कब्ज़ा प्रमाण</strong></td><td>रजिस्ट्री, फ़र्द (राजस्व रिकॉर्ड), अलॉटमेंट लेटर, सेल डीड, रेंट या लीज़ डीड।</td></tr>
            <tr><td><strong>A&amp;A फॉर्म</strong></td><td>पोर्टल से बनता है; प्रिंट, साइन और अपलोड (PDF/JPG)।</td></tr>
            <tr><td><strong>फोटो</strong></td><td>आवेदक की एक पासपोर्ट-साइज़ फोटो।</td></tr>
          </tbody>
        </table></div>
        <p><strong>किरायेदार:</strong> रेंट या लीज़ डीड कब्ज़ा-प्रमाण के तौर पर मान्य है — विद्युत
        अधिनियम, 2003 की धारा 43 के तहत बिजली परिसर में रहने वाले का अधिकार है; मालिक साइन न करे
        तो क्षतिपूर्ति बॉन्ड से काम चलता है।</p>
      </section>

      <section class="seo-section">
        <h2>3. आवेदन, स्टेप-बाय-स्टेप — 30 दिन का नियम याद रखें</h2>
        <ol>
          <li><strong>रजिस्टर कर NSC फॉर्म भरें:</strong> ज़िला → डिवीज़न → उपखंड, श्रेणी (घर के लिए
          DS) और ज़रूरत का भार। फिक्स्ड चार्ज प्रति kW बढ़ता है, इसलिए भार ईमानदारी से चुनें — हमारी
          <a href="/hi/guides/reduce-fixed-charges-sanctioned-load/">लोड गाइड</a> देखें।</li>
          <li><strong>दस्तावेज़ अपलोड करें</strong> (PDF/JPG) और <strong>प्रोसेसिंग फीस</strong>
          ऑनलाइन भरें।</li>
          <li><strong>A&amp;A फॉर्म डाउनलोड, साइन और वापस अपलोड करें।</strong>
          <strong>A&amp;A अपलोड और सिक्योरिटी भुगतान दोनों आवेदन के 30 दिन के भीतर — वरना पोर्टल
          आवेदन रद्द कर देता है।</strong></li>
          <li><strong>डिमांड नोटिस।</strong> PSPCL शुल्क तय करता है — ACD (एडवांस कंज़म्प्शन
          डिपॉज़िट), मीटर सिक्योरिटी और Schedule of General Charges के अनुसार सर्विस-लाइन लागत —
          और नोटिस आपकी <em>Document Timeline</em> में डाउनलोड के लिए आ जाता है। भुगतान ऑनलाइन।</li>
          <li><strong>निरीक्षण और मीटर।</strong> उपखंड परिसर की वायरिंग जाँचकर मीटर लगाता है; खाता
          नंबर SMS से आता है और पहला बिल अगले चक्र में।</li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>4. खर्च कितना</h2>
        <ul>
          <li><strong>प्रोसेसिंग फीस</strong> — आवेदन पर छोटी राशि।</li>
          <li><strong>ACD (एडवांस कंज़म्प्शन डिपॉज़िट)</strong> — सामान्य घरेलू भार पर लगभग
          ₹1,000–₹3,000; भविष्य के बिलों की ज़मानत, कनेक्शन छोड़ने पर वापसी योग्य।</li>
          <li><strong>मीटर सिक्योरिटी</strong> — मीटर के लिए अलग डिपॉज़िट, Schedule of General
          Charges के अनुसार।</li>
          <li><strong>सर्विस-लाइन शुल्क</strong> — सामान्य सर्विस ड्रॉप में नगण्य; लाइन बढ़ानी हो तो
          एस्टीमेट के अनुसार।</li>
        </ul>
        <p>हर रुपया पोर्टल से माँगा और भरा जाता है — फ़ील्ड स्टाफ़ को नकद नहीं। याद रखें, पंजाब की
        घरेलू सब्सिडी (पात्र परिवारों को 300 यूनिट तक शून्य बिल) कनेक्शन आपके नाम होने के बाद ही
        लागू होती है; सब्सिडी के बाद का बिल <a href="/">बिल कैलकुलेटर</a> से आँकें।</p>
      </section>

      <section class="seo-section">
        <h2>5. समय-सीमाएँ और शिकायत</h2>
        <p>विद्युत (उपभोक्ता अधिकार) नियम, 2020 के तहत पूर्ण, भुगतान-सहित (A&amp;A समेत) आवेदन पर
        कनेक्शन <strong>महानगरों में 7 दिन, अन्य नगरीय क्षेत्रों में 15 दिन और ग्रामीण में 30 दिन</strong>
        में चालू होना चाहिए; लाइन-विस्तार के मामले PSERC के Standards of Performance से चलते हैं,
        जिनमें देरी पर मुआवज़ा तय है।</p>
        <ul>
          <li><strong>ट्रैकिंग:</strong> NSC लॉगिन हर चरण दिखाता है; आपके डिवीज़न के XEN का नाम-नंबर
          वहीं है — इस्तेमाल करें।</li>
          <li><strong>अटक गया?</strong> आवेदन नंबर के साथ 1912 पर, फिर XEN से। PSPCL का सिंगल-विंडो
          सेल sws.pspcl@gmail.com पर भी जवाब देता है।</li>
          <li><strong>औपचारिक रास्ता:</strong> 2020 नियमों और PSERC SoP का हवाला देते हुए CGRF में
          लिखित शिकायत।</li>
        </ul>
      </section>`,
    faqsHi: [
      { q: 'नए PSPCL कनेक्शन का आवेदन कहाँ होता है?',
        a: 'ऑनलाइन — pspcl.in → New Connection से PSPCL का NSC (New Service Connection) पोर्टल खुलता है। 2021 से ऑनलाइन पंजीकरण अनिवार्य है; आवेदन के लिए दफ़्तर जाने की ज़रूरत नहीं।' },
      { q: 'PSPCL का A&A फॉर्म क्या है?',
        a: 'Application & Agreement फॉर्म — हस्ताक्षरित सप्लाई अनुबंध। पोर्टल इसे बनाता है; आप प्रिंट, साइन कर वापस अपलोड करते हैं। इसके बिना आवेदन अधूरा है, और A&A + सिक्योरिटी भुगतान 30 दिन में न हो तो आवेदन अपने आप रद्द।' },
      { q: 'नए PSPCL कनेक्शन का खर्च कितना है?',
        a: 'आवेदन पर छोटी प्रोसेसिंग फीस, फिर ACD (सामान्य घरेलू भार पर लगभग ₹1,000–₹3,000), मीटर सिक्योरिटी और Schedule of General Charges के अनुसार सर्विस-लाइन शुल्क। सटीक राशि Document Timeline में आए डिमांड नोटिस पर होती है।' },
      { q: 'नया PSPCL कनेक्शन कितने दिन में मिलता है?',
        a: 'उपभोक्ता अधिकार नियम, 2020: पूर्ण भुगतान-सहित आवेदन पर महानगर में 7, नगरीय में 15, ग्रामीण में 30 दिन। NSC पोर्टल हर चरण दिखाता है, और अटकने पर आपके डिवीज़न के XEN का संपर्क भी।' },
      { q: 'क्या पंजाब की 300 यूनिट मुफ़्त बिजली नए कनेक्शन पर मिलती है?',
        a: 'हाँ, कनेक्शन चालू होकर पात्र परिवार के नाम होते ही — सब्सिडी घरेलू खाते से जुड़ती है, आवेदन से नहीं। पात्र उपभोक्ताओं के 300 यूनिट/चक्र तक के बिल शून्य होते हैं; उससे ऊपर सामान्य DS स्लैब लगते हैं।' },
    ],
  },
];

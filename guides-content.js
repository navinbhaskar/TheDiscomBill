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
  },

  {
    slug: 'why-did-my-electricity-bill-increase',
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
        year</strong>, not last month. Our <a href="/usage/">usage estimator</a> converts your
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
  },

  {
    slug: 'tod-billing-explained',
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
  },

  {
    slug: 'how-fppa-fuel-surcharge-is-calculated',
    title: 'How FPPA (Fuel Surcharge) Is Calculated on Your Electricity Bill',
    metaTitle: 'FPPA / Fuel Surcharge on Electricity Bills — How It Is Calculated',
    description: 'What the FPPA / FPPCA / FPPAS / PPAC line on an Indian electricity bill is, the two ways DISCOMs calculate it (per-unit and percentage), why it changes every month, why it can be negative, and how to verify the amount yourself.',
    minutes: 6,
    intro: `FPPA — the Fuel and Power Purchase Adjustment, also printed as FPPCA, FPPAS, FAC or
      (in Delhi) PPAC — recovers the difference between what your DISCOM <em>actually</em> paid for
      power and what the tariff order <em>assumed</em> it would pay. It is the one line on your bill
      that changes even when your consumption and the tariff don't, and it can be a charge
      <em>or a credit</em>.`,
    sections: `
      <section class="seo-section">
        <h2>Why this line exists</h2>
        <p>Your energy rate is fixed once a year in the tariff order, but the DISCOM's cost of buying
        power moves every month with coal, gas and market prices. Regulators let DISCOMs pass that
        difference through automatically — without waiting a year — via the fuel adjustment
        surcharge. It is trued up annually, so over-recovery in one period comes back as a credit
        later.</p>
      </section>
      <section class="seo-section">
        <h2>Method 1 — per-unit (₹/unit)</h2>
        <p>The traditional method prices the gap directly:</p>
        <p><strong>FPPA per unit = APPC − BPPC</strong>, and your surcharge =
        that rate × units consumed.</p>
        <ul>
          <li><strong>APPC</strong> — actual weighted-average power purchase cost per unit for the
          month (actual cost ÷ actual units purchased from approved sources).</li>
          <li><strong>BPPC</strong> — the base cost per unit approved in the tariff order for that
          month.</li>
        </ul>
        <p>If the DISCOM bought power cheaper than approved, APPC &lt; BPPC and the line turns
        negative — a rebate on every unit.</p>
      </section>
      <section class="seo-section">
        <h2>Method 2 — percentage of the bill</h2>
        <p>Several states now levy it as a percentage instead. Uttar Pradesh's framework (UPERC MYT
        Regulations, 2025) is a clear example:</p>
        <ul>
          <li>The surcharge is a <strong>percentage of energy charge + fixed/demand charge</strong>,
          uniform across consumer categories.</li>
          <li>It runs with a <strong>3-month lag</strong>: this month's percentage recovers the cost
          gap from three months ago.</li>
          <li>It is <strong>capped per billing cycle</strong> (10% in UP); anything above the cap
          carries forward — which is why a capped month is often followed by a credit month.</li>
        </ul>
        <p>Delhi's <strong>PPAC</strong> works the same way — a percentage on energy + fixed charges,
        revised by DERC and different for each DISCOM (BRPL, BYPL, Tata Power-DDL).</p>
      </section>
      <section class="seo-section">
        <h2>Where it sits in the bill maths</h2>
        <p>Order matters: FPPA is added to your energy + fixed charges <em>before</em> electricity
        duty is applied, so the duty percentage compounds on top of the surcharge. Our
        <a href="/#calculator">bill calculator</a> applies exactly this ordering, and can auto-fill
        the notified FPPA rate for supported states and billing months.</p>
      </section>
      <section class="seo-section">
        <h2>How to verify the FPPA on your bill</h2>
        <ol>
          <li>Find the line — FPPA / FPPCA / FPPAS / FAC / PPAC, printed either as ₹/unit or %.</li>
          <li>Check your DISCOM's notice board or website for the notified rate for your
          <em>billing month</em> (not the payment month).</li>
          <li>Recompute: units × rate (per-unit method) or rate% × (energy + fixed) (percentage
          method).</li>
          <li>Cross-check the whole bill in the <a href="/#calculator">calculator</a> — enter the
          FPPA from your bill and compare totals line by line.</li>
        </ol>
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
  },

  {
    slug: 'reduce-fixed-charges-sanctioned-load',
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
  },

  {
    slug: 'electricity-duty-explained',
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
  },

  {
    slug: 'how-to-read-bses-delhi-bill',
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
        <p>Delhi domestic slabs step up at 200, 400 and 800 units, telescopically — each rate
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
  },

  {
    slug: 'how-to-read-msedcl-bill',
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
        <p>Residential (LT-1) consumption is priced telescopically with slab boundaries at
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
  },

  {
    slug: 'how-to-read-bescom-bill',
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
        for the first 30 units, then steps at 100, 200 and 500 units (telescopic). Current rates are
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
  },

  {
    slug: 'how-to-read-tneb-tangedco-bill',
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
        <p>Above the free block, slabs step at 200, 500 and 1000 units per cycle (telescopic), with
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
  },

  {
    slug: 'solar-net-metering-savings',
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
  },
];

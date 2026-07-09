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
        <p>दिल्ली के घरेलू स्लैब 200, 400 व 800 यूनिट पर, टेलीस्कोपिक रूप से बढ़ते हैं — हर दर केवल अपने
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
        <p>आवासीय (LT-1) खपत टेलीस्कोपिक रूप से मूल्यांकित होती है, स्लैब सीमाएँ
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
        फिर 100, 200 व 500 यूनिट पर कदम (टेलीस्कोपिक)। वर्तमान दरें
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
        <p>मुफ़्त ब्लॉक के ऊपर, स्लैब प्रति चक्र 200, 500 व 1000 यूनिट पर कदम बढ़ाते हैं (टेलीस्कोपिक), और शीर्ष
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
  },

  {
    slug: 'uppcl-sanctioned-load-increased',
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
  },
];

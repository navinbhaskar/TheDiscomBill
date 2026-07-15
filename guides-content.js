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
        <p>निवासी (LT-1) वापर टेलिस्कोपिक पद्धतीने आकारला जातो, स्लॅब सीमा
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
        <p>குடியிருப்பு (LT-1) நுகர்வு டெலஸ்கோபிக் முறையில் விலை நிர்ணயிக்கப்படுகிறது, ஸ்லாப் எல்லைகள்
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

  {
    slug: 'smart-meter-running-fast',
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
  },

  {
    slug: 'smart-meter-prepaid-disconnection',
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
  },

  {
    slug: 'smart-meter-recharge-failed',
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
  },

  {
    slug: 'smart-meter-balance-check',
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
  },

  {
    slug: 'prepaid-vs-postpaid-smart-meter',
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
  },

  {
    slug: 'msedcl-fppa-charges-explained',
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
  },

  {
    slug: 'uppcl-smart-meter-readings-explained',
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
  },

  {
    slug: 'what-is-a-unit-of-electricity',
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
  },

  {
    slug: 'power-factor-kvah-billing-explained',
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
  },
];

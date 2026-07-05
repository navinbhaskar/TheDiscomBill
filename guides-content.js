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
//     (tariffs, guides, glossary) and at the English page otherwise.

export const GUIDES = [
  {
    slug: 'how-to-read-uppcl-bill',
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
];

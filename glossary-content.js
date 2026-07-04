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
//
// Never hard-code a specific tariff rate that drifts yearly — describe the structure and link
// to /tariffs/ or the calculator, which ARE regenerated from live data.

export const GLOSSARY = [
  {
    term: 'Connected Load',
    slug: 'connected-load',
    aka: ['Contract Demand'],
    short: 'The total load of all the appliances and equipment wired to your connection, declared in kW — the basis on which a supply connection is sanctioned.',
    body: `<p>Connected load is the sum of the wattage of everything that can draw power on your
      premises. You declare it when applying for a connection, and the DISCOM sanctions a
      <a href="/glossary/#sanctioned-load">sanctioned load</a> against it. For low-tension (LT)
      domestic and small commercial consumers, fixed charges are usually billed per kW of
      sanctioned load. High-tension (HT) and large consumers instead contract a
      <strong>contract demand</strong> in kVA and are billed on
      <a href="/glossary/#maximum-demand">maximum demand</a>.</p>`,
  },
  {
    term: 'Electricity Duty',
    slug: 'electricity-duty',
    abbr: 'ED',
    short: 'A tax levied by the state government on electricity consumption — collected through your bill but paid to the state treasury, not the DISCOM.',
    body: `<p>Electricity duty is a <strong>state tax</strong>, not a DISCOM charge. It is added to
      your bill as either paise per unit or a percentage of the energy charge, and the rate is set
      by your state government — so it varies from state to state and by consumer category. Because
      it is a government levy, it is typically calculated on the energy charge (and sometimes the
      fuel surcharge) but not on itself. Some categories, such as agriculture or lifeline domestic
      slabs, are partly or fully exempt.</p>`,
  },
  {
    term: 'Fixed Charge (Demand Charge)',
    slug: 'fixed-charge',
    aka: ['Demand Charge', 'Fixed Cost'],
    short: 'A standing monthly charge billed on your sanctioned load or demand (per kW / kVA, or a flat amount) regardless of how many units you consume.',
    body: `<p>The fixed charge recovers the cost of keeping capacity available for you — wires,
      transformers and the sanctioned <a href="/glossary/#connected-load">load</a> reserved for your
      connection. It is billed <strong>even in a zero-consumption month</strong>. Common structures
      are a flat amount, a rate per kW of <a href="/glossary/#sanctioned-load">sanctioned load</a>, or
      (for larger consumers) a rate per kVA of <a href="/glossary/#maximum-demand">maximum demand</a>.
      For HT consumers this "demand charge" is often the single largest line on the bill.</p>`,
  },
  {
    term: 'FPPA (Fuel & Power Purchase Adjustment)',
    slug: 'fppa',
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
  },
  {
    term: 'kVAh (Kilovolt-Ampere-Hour)',
    slug: 'kvah',
    abbr: 'kVAh',
    short: 'A unit of apparent energy equal to kWh divided by the power factor; on kVAh billing you pay for apparent energy, so a poor power factor directly raises the bill.',
    body: `<p>Ordinary meters record <strong>kWh</strong> (real energy). Many commercial and industrial
      connections are instead billed on <strong>kVAh</strong> — apparent energy, which is
      <code>kWh &divide; power factor</code>. Because a low <a href="/glossary/#power-factor">power
      factor</a> makes kVAh larger than kWh, kVAh billing automatically charges you more when your
      power factor is poor, replacing the separate power-factor penalty. Improving power factor (for
      example with capacitors) brings kVAh close to kWh and lowers the bill. Pick the kVAh basis in
      the calculator if your meter and tariff use apparent energy.</p>`,
  },
  {
    term: 'LPSC (Late Payment Surcharge)',
    slug: 'lpsc',
    abbr: 'LPSC',
    aka: ['Late Payment Surcharge', 'DPC', 'Delayed Payment Charge'],
    short: 'A surcharge added for each month a bill stays unpaid past its due date, usually a fixed percentage of the outstanding amount.',
    body: `<p>If you miss the due date, the DISCOM adds a Late Payment Surcharge — typically a
      percentage (often around 1.25–2% per month) of the unpaid amount. In a multi-month arrears
      situation it compounds on the running balance, so a small overdue amount can grow noticeably.
      Paying by the due date avoids it entirely. Our calculator can add LPSC and
      <a href="/glossary/#fppa">arrears</a> to estimate a realistic total payable.</p>`,
  },
  {
    term: 'Maximum Demand (Billed Demand)',
    slug: 'maximum-demand',
    aka: ['Billed Demand', 'Recorded Demand', 'MD'],
    short: 'The highest average load (in kW or kVA) drawn over a short interval during the billing period, used as the basis for the demand charge on larger connections.',
    body: `<p>Demand meters record the peak load your connection pulls, averaged over a rolling window
      (commonly 15 or 30 minutes). The highest such value in the month is your maximum demand. The
      <strong>billed demand</strong> is usually the higher of your recorded demand and a contracted
      minimum (often a percentage of <a href="/glossary/#connected-load">contract demand</a>), and the
      <a href="/glossary/#fixed-charge">demand charge</a> is levied on it. Drawing more than your
      contracted demand can trigger an <strong>excess-demand penalty</strong> at a multiple of the
      normal rate.</p>`,
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
  },
  {
    term: 'Multiplying Factor (MF)',
    slug: 'multiplying-factor',
    abbr: 'MF',
    short: 'The number by which the raw difference between two meter readings is multiplied to get the actual units consumed, used where current/voltage transformers scale the meter down.',
    body: `<p>On connections metered through a current transformer (CT) or potential transformer (PT),
      the meter sees only a scaled-down fraction of the real current or voltage. The multiplying
      factor converts the meter's raw reading back to actual consumption:
      <code>units = (present reading &minus; previous reading) &times; MF</code>. For almost all
      direct-metered domestic connections <strong>MF = 1</strong>, so the subtraction alone is your
      usage. On CT-metered commercial or HT connections MF can be 1, and a wrong MF is a serious
      billing error worth checking on your bill.</p>`,
  },
  {
    term: 'Net Metering',
    slug: 'net-metering',
    short: 'A rooftop-solar billing arrangement where you are charged only on net import — units imported from the grid minus units exported to it — with any surplus banked as a credit.',
    body: `<p>With net metering, your solar system feeds surplus generation back into the grid and a
      bidirectional meter tracks both directions. You pay energy charges on
      <code>net import = imported &minus; exported &minus; banked credit</code>. If you export more
      than you import in a month, the surplus is <strong>banked</strong> as a unit credit carried to
      the next month (usually settled annually). <a href="/glossary/#fixed-charge">Fixed and demand
      charges</a> still apply on your sanctioned load regardless of solar. Estimate your savings with
      the <a href="/solar/">rooftop solar calculator</a>.</p>`,
  },
  {
    term: 'Power Factor',
    slug: 'power-factor',
    abbr: 'PF',
    short: 'The ratio of real power (kW) to apparent power (kVA) drawn by a load; a value below 1 means wasted capacity, and low power factor attracts penalties or higher kVAh billing.',
    body: `<p>Power factor measures how effectively your load turns supplied power into useful work.
      A purely resistive load (heater, incandescent lamp) has a PF near 1; motors, pumps and
      transformers pull it lower. A low power factor means the DISCOM must supply more apparent power
      (kVA) for the same real work, so tariffs discourage it — either through a
      <strong>power-factor penalty/incentive</strong> or by billing on
      <a href="/glossary/#kvah">kVAh</a>, which rises automatically as PF falls. Capacitor banks are
      the usual fix.</p>`,
  },
  {
    term: 'Sanctioned Load',
    slug: 'sanctioned-load',
    aka: ['Contracted Load', 'Sanctioned Demand'],
    short: 'The maximum load, in kW or kVA, that the DISCOM has formally contracted to supply to your connection — the basis for fixed charges and the ceiling you should stay under.',
    body: `<p>When your connection is approved, the DISCOM sanctions a load based on your declared
      <a href="/glossary/#connected-load">connected load</a>. This sanctioned figure is what
      <a href="/glossary/#fixed-charge">fixed charges</a> and the <a href="/glossary/#mmc">minimum
      charge</a> are calculated on. Regularly drawing more than your sanctioned load can attract an
      excess-demand penalty and, over time, a demand for load enhancement. It appears on your bill as
      "Sanctioned Load" or "Contract Demand" and is entered as the load in our calculator.</p>`,
  },
  {
    term: 'Telescopic Slabs',
    slug: 'telescopic-slabs',
    aka: ['Telescopic Tariff', 'Slab-wise Rates'],
    short: 'A slab-rate structure where each per-unit rate applies only to the units that fall within its own slab band, so higher rates never apply to your entire consumption.',
    body: `<p>Most Indian domestic tariffs are telescopic. If the slabs are 0–100, 101–300 and 300+
      units, a consumer using 250 units pays the first-slab rate on the first 100 units and the
      second-slab rate only on the next 150 — not the higher rate on all 250. This is the opposite of
      a <strong>non-telescopic</strong> (or "slab-benefit lost") tariff, where crossing a threshold
      applies the higher rate to <em>every</em> unit, creating a cliff. Knowing which one your DISCOM
      uses explains why a bill can jump sharply near a slab boundary. Our
      <a href="/#calculator">calculator</a> applies each DISCOM's slabs exactly as published.</p>`,
  },
  {
    term: 'Time-of-Day Tariff (ToD / ToU)',
    slug: 'tod-tariff',
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
  },
];

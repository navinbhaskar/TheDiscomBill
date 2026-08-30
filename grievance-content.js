// grievance-content.js — where a consumer complains, per state.
//
// Rendered onto every /tariffs/<state>/ page by stateGrievanceHtml() in generate-seo.js,
// in all four languages. The point of the block is that a reader who has just looked at
// the slab rates and thinks the bill is wrong currently has nowhere to go from that page.
//
// PROVENANCE RULES — read before adding anything here.
//
//   1. Every link must be an official government or licensee domain. The DISCOM complaint
//      entry points are NOT listed here at all: they come from the `website` field that the
//      per-state tariff modules already carry and that the build verifies, so there is one
//      copy of each DISCOM URL in the repo rather than two that can disagree.
//
//   2. `url` is the regulator's own site. For most states it is simply the origin of the
//      `sourceUrl` the tariff module already cites for that state's order — i.e. it is
//      already-verified data, restated as a homepage. Where the tariff module cites the
//      LICENSEE (Sikkim cites powersikkim.in, Nagaland cites the state IPR department) that
//      origin is NOT the regulator, so `url` is deliberately left null.
//
//   3. Nothing in here is a phone number, an email address, a postal address or a named
//      officer. Those rot within a year, and a wrong number sends a consumer with a real
//      grievance to a dead line — worse than sending them to the regulator's own site and
//      letting them find the current one. The single exception is 1912, the national power
//      helpline, which is a short code rather than a per-state number.
//
//   4. `cgrfUrl` / `ombudsmanUrl` are the direct forum pages. Fill one in only when you have
//      OPENED the page and confirmed it is the current CGRF/Ombudsman page for that state.
//      The renderer falls back to the regulator link whenever a slot is empty, so partial
//      coverage is fine and an unverified guess is not.
//
//      Checked 30 August 2026: 13 of 34 states carry at least one direct link. The rest are
//      still null, and each for a stated reason rather than for want of looking:
//        - No consumer-facing forum page exists. KERC, GERC, RERC and APERC publish the
//          CGRF/Ombudsman *regulations* and past orders as PDFs but have no page a consumer
//          can be sent to. A 2016 regulation PDF is a worse destination than the homepage.
//        - The site is HTTP-only or refused inspection, so the URL could not be confirmed
//          from here: Haryana (herc.gov.in refuses 443), Kerala (cgrf.kseb.in did not
//          resolve), Madhya Pradesh (mperc.in returns 403), Jharkhand (the Ombudsman is at
//          http://ombudsman.jserc.org/, which would also be an insecure link from an HTTPS
//          page). Each of these very likely works for a consumer in India — that is exactly
//          why they are left null rather than filled from a search-result snippet.
//      Anyone with access can open one of those and fill the slot; nothing else needs to
//      change for it to render.
//
// Joint commissions serve several states each: JERC-UTS covers Goa and most UTs, and the
// J&K/Ladakh JERC covers both of those. Their rows repeat the same commission on purpose.

/** State -> the electricity regulator whose CGRF and Ombudsman regulations apply there. */
export const REGULATORS = {
  'Andhra Pradesh': { short: 'APERC', name: 'Andhra Pradesh Electricity Regulatory Commission', url: 'https://aperc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Arunachal Pradesh': { short: 'APSERC', name: 'Arunachal Pradesh State Electricity Regulatory Commission', url: 'https://apserc.nic.in', cgrfUrl: null, ombudsmanUrl: null },
  'Assam': { short: 'AERC', name: 'Assam Electricity Regulatory Commission', url: 'https://aerc.gov.in', cgrfUrl: null, ombudsmanUrl: 'https://aerc.gov.in/information/page-ombudsman' },
  'Bihar': { short: 'BERC', name: 'Bihar Electricity Regulatory Commission', url: 'https://berc.co.in', cgrfUrl: null, ombudsmanUrl: 'https://berc.co.in/ombudsman-cgrf/ombudsman' },
  'Chandigarh': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: 'https://jercuts.gov.in/ombudsman-details/' },
  'Chhattisgarh': { short: 'CSERC', name: 'Chhattisgarh State Electricity Regulatory Commission', url: 'https://cserc.gov.in', cgrfUrl: 'https://cserc.gov.in/Welcome/CGRF_Application', ombudsmanUrl: 'https://cserc.gov.in/Welcome/consumer_affairs/1' },
  'Dadra & Nagar Haveli and Daman & Diu': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: 'https://jercuts.gov.in/ombudsman-details/' },
  'Delhi': { short: 'DERC', name: 'Delhi Electricity Regulatory Commission', url: 'https://www.derc.gov.in', cgrfUrl: 'https://www.derc.gov.in/consumers-corner/consumer-grievances-redressal-forum', ombudsmanUrl: 'https://www.derc.gov.in/consumers-corner/contact-list-oo-electricity-ombudsman' },
  'Goa': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: 'https://jercuts.gov.in/ombudsman-details/' },
  'Gujarat': { short: 'GERC', name: 'Gujarat Electricity Regulatory Commission', url: 'https://gercin.org', cgrfUrl: null, ombudsmanUrl: null },
  'Haryana': { short: 'HERC', name: 'Haryana Electricity Regulatory Commission', url: 'https://herc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Himachal Pradesh': { short: 'HPERC', name: 'Himachal Pradesh Electricity Regulatory Commission', url: 'https://hperc.org', cgrfUrl: null, ombudsmanUrl: null },
  'Jammu & Kashmir': { short: 'JERC-J&K/Ladakh', name: 'Joint Electricity Regulatory Commission for the UTs of Jammu & Kashmir and Ladakh', url: 'https://jercjkl.jk.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Jharkhand': { short: 'JSERC', name: 'Jharkhand State Electricity Regulatory Commission', url: 'https://jserc.org', cgrfUrl: null, ombudsmanUrl: null },
  'Karnataka': { short: 'KERC', name: 'Karnataka Electricity Regulatory Commission', url: 'https://kerc.karnataka.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Kerala': { short: 'KSERC', name: 'Kerala State Electricity Regulatory Commission', url: 'https://erckerala.org', cgrfUrl: null, ombudsmanUrl: null },
  'Ladakh': { short: 'JERC-J&K/Ladakh', name: 'Joint Electricity Regulatory Commission for the UTs of Jammu & Kashmir and Ladakh', url: 'https://jercjkl.jk.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Madhya Pradesh': { short: 'MPERC', name: 'Madhya Pradesh Electricity Regulatory Commission', url: 'https://mperc.in', cgrfUrl: null, ombudsmanUrl: null },
  'Maharashtra': { short: 'MERC', name: 'Maharashtra Electricity Regulatory Commission', url: 'https://merc.gov.in', cgrfUrl: 'https://merc.gov.in/consumer-grievance-redressal-forums-cgrf/', ombudsmanUrl: 'https://merc.gov.in/electricity-ombudsman/' },
  'Manipur': { short: null, name: 'Manipur State Electricity Regulatory Commission', url: 'https://mnerc.mn.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Meghalaya': { short: 'MSERC', name: 'Meghalaya State Electricity Regulatory Commission', url: 'https://mserc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  // Mizoram's commission also abbreviates to MSERC; the site uses mzerc, so no short form here.
  'Mizoram': { short: null, name: 'Mizoram State Electricity Regulatory Commission', url: 'https://mzerc.mizoram.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  // The tariff module cites the state IPR department, not a commission site — see rule 2.
  'Nagaland': { short: null, name: 'Nagaland Electricity Regulatory Commission', url: null, cgrfUrl: null, ombudsmanUrl: null },
  'Odisha': { short: 'OERC', name: 'Odisha Electricity Regulatory Commission', url: 'https://www.orierc.org', cgrfUrl: 'https://www.orierc.org/GRF', ombudsmanUrl: 'https://www.orierc.org/OMBUDS/ombudsmanofc.aspx' },
  'Puducherry': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: 'https://jercuts.gov.in/ombudsman-details/' },
  'Punjab': { short: 'PSERC', name: 'Punjab State Electricity Regulatory Commission', url: 'https://pserc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Rajasthan': { short: 'RERC', name: 'Rajasthan Electricity Regulatory Commission', url: 'https://rerc.rajasthan.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  // As Nagaland: the cited source is the licensee's own portal, not the commission.
  'Sikkim': { short: 'SSERC', name: 'Sikkim State Electricity Regulatory Commission', url: null, cgrfUrl: null, ombudsmanUrl: null },
  'Tamil Nadu': { short: 'TNERC', name: 'Tamil Nadu Electricity Regulatory Commission', url: 'https://www.tnerc.tn.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Telangana': { short: 'TGERC', name: 'Telangana State Electricity Regulatory Commission', url: 'https://www.tgerc.telangana.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Tripura': { short: 'TERC', name: 'Tripura Electricity Regulatory Commission', url: 'https://terc.tripura.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Uttar Pradesh': { short: 'UPERC', name: 'Uttar Pradesh Electricity Regulatory Commission', url: 'https://www.uperc.org', cgrfUrl: 'https://cgrf.uppcl.org/', ombudsmanUrl: null },
  'Uttarakhand': { short: 'UERC', name: 'Uttarakhand Electricity Regulatory Commission', url: 'https://uerc.uk.gov.in', cgrfUrl: 'https://uerc.uk.gov.in/consumer-grievance-redressal-forum/', ombudsmanUrl: 'https://uerc.uk.gov.in/consumer-grievance-redressal-forum/' },
  'West Bengal': { short: 'WBERC', name: 'West Bengal Electricity Regulatory Commission', url: 'https://wberc.gov.in', cgrfUrl: null, ombudsmanUrl: 'https://www.wberc.gov.in/about-ombudsman' },
};

/** The regulator row for a state, or null. Display name prefers the abbreviation. */
export function regulatorFor(state) {
  const r = REGULATORS[state];
  if (!r) return null;
  return { ...r, label: r.short || r.name };
}

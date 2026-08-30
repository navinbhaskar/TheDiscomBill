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
//   4. `cgrfUrl` / `ombudsmanUrl` are the slots for the direct forum pages. They are null
//      everywhere today ON PURPOSE. Fill one in only when you have opened the page and
//      confirmed it is the current CGRF/Ombudsman page for that state; the renderer falls
//      back to the regulator link whenever a slot is empty, so partial coverage is fine and
//      an unverified guess is not.
//
// Joint commissions serve several states each: JERC-UTS covers Goa and most UTs, and the
// J&K/Ladakh JERC covers both of those. Their rows repeat the same commission on purpose.

/** State -> the electricity regulator whose CGRF and Ombudsman regulations apply there. */
export const REGULATORS = {
  'Andhra Pradesh': { short: 'APERC', name: 'Andhra Pradesh Electricity Regulatory Commission', url: 'https://aperc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Arunachal Pradesh': { short: 'APSERC', name: 'Arunachal Pradesh State Electricity Regulatory Commission', url: 'https://apserc.nic.in', cgrfUrl: null, ombudsmanUrl: null },
  'Assam': { short: 'AERC', name: 'Assam Electricity Regulatory Commission', url: 'https://aerc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Bihar': { short: 'BERC', name: 'Bihar Electricity Regulatory Commission', url: 'https://berc.co.in', cgrfUrl: null, ombudsmanUrl: null },
  'Chandigarh': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Chhattisgarh': { short: 'CSERC', name: 'Chhattisgarh State Electricity Regulatory Commission', url: 'https://cserc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Dadra & Nagar Haveli and Daman & Diu': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Delhi': { short: 'DERC', name: 'Delhi Electricity Regulatory Commission', url: 'https://www.derc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Goa': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Gujarat': { short: 'GERC', name: 'Gujarat Electricity Regulatory Commission', url: 'https://gercin.org', cgrfUrl: null, ombudsmanUrl: null },
  'Haryana': { short: 'HERC', name: 'Haryana Electricity Regulatory Commission', url: 'https://herc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Himachal Pradesh': { short: 'HPERC', name: 'Himachal Pradesh Electricity Regulatory Commission', url: 'https://hperc.org', cgrfUrl: null, ombudsmanUrl: null },
  'Jammu & Kashmir': { short: 'JERC-J&K/Ladakh', name: 'Joint Electricity Regulatory Commission for the UTs of Jammu & Kashmir and Ladakh', url: 'https://jercjkl.jk.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Jharkhand': { short: 'JSERC', name: 'Jharkhand State Electricity Regulatory Commission', url: 'https://jserc.org', cgrfUrl: null, ombudsmanUrl: null },
  'Karnataka': { short: 'KERC', name: 'Karnataka Electricity Regulatory Commission', url: 'https://kerc.karnataka.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Kerala': { short: 'KSERC', name: 'Kerala State Electricity Regulatory Commission', url: 'https://erckerala.org', cgrfUrl: null, ombudsmanUrl: null },
  'Ladakh': { short: 'JERC-J&K/Ladakh', name: 'Joint Electricity Regulatory Commission for the UTs of Jammu & Kashmir and Ladakh', url: 'https://jercjkl.jk.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Madhya Pradesh': { short: 'MPERC', name: 'Madhya Pradesh Electricity Regulatory Commission', url: 'https://mperc.in', cgrfUrl: null, ombudsmanUrl: null },
  'Maharashtra': { short: 'MERC', name: 'Maharashtra Electricity Regulatory Commission', url: 'https://merc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Manipur': { short: null, name: 'Manipur State Electricity Regulatory Commission', url: 'https://mnerc.mn.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Meghalaya': { short: 'MSERC', name: 'Meghalaya State Electricity Regulatory Commission', url: 'https://mserc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  // Mizoram's commission also abbreviates to MSERC; the site uses mzerc, so no short form here.
  'Mizoram': { short: null, name: 'Mizoram State Electricity Regulatory Commission', url: 'https://mzerc.mizoram.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  // The tariff module cites the state IPR department, not a commission site — see rule 2.
  'Nagaland': { short: null, name: 'Nagaland Electricity Regulatory Commission', url: null, cgrfUrl: null, ombudsmanUrl: null },
  'Odisha': { short: 'OERC', name: 'Odisha Electricity Regulatory Commission', url: 'https://www.orierc.org', cgrfUrl: null, ombudsmanUrl: null },
  'Puducherry': { short: 'JERC-UTS', name: 'Joint Electricity Regulatory Commission for Goa and Union Territories', url: 'https://jercuts.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Punjab': { short: 'PSERC', name: 'Punjab State Electricity Regulatory Commission', url: 'https://pserc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Rajasthan': { short: 'RERC', name: 'Rajasthan Electricity Regulatory Commission', url: 'https://rerc.rajasthan.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  // As Nagaland: the cited source is the licensee's own portal, not the commission.
  'Sikkim': { short: 'SSERC', name: 'Sikkim State Electricity Regulatory Commission', url: null, cgrfUrl: null, ombudsmanUrl: null },
  'Tamil Nadu': { short: 'TNERC', name: 'Tamil Nadu Electricity Regulatory Commission', url: 'https://www.tnerc.tn.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Telangana': { short: 'TGERC', name: 'Telangana State Electricity Regulatory Commission', url: 'https://www.tgerc.telangana.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Tripura': { short: 'TERC', name: 'Tripura Electricity Regulatory Commission', url: 'https://terc.tripura.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'Uttar Pradesh': { short: 'UPERC', name: 'Uttar Pradesh Electricity Regulatory Commission', url: 'https://www.uperc.org', cgrfUrl: null, ombudsmanUrl: null },
  'Uttarakhand': { short: 'UERC', name: 'Uttarakhand Electricity Regulatory Commission', url: 'https://uerc.uk.gov.in', cgrfUrl: null, ombudsmanUrl: null },
  'West Bengal': { short: 'WBERC', name: 'West Bengal Electricity Regulatory Commission', url: 'https://wberc.gov.in', cgrfUrl: null, ombudsmanUrl: null },
};

/** The regulator row for a state, or null. Display name prefers the abbreviation. */
export function regulatorFor(state) {
  const r = REGULATORS[state];
  if (!r) return null;
  return { ...r, label: r.short || r.name };
}

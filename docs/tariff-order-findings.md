# Tariff order findings — web reconnaissance, 19 August 2026

> ## ⚠️ RESOLVED — superseded 2 September 2026
>
> **Every finding below has been acted on. Do not read the "On TDB" column as current.**
>
> This file is a dated snapshot of what the web said on 19 August, kept because its *sources*
> and its reasoning about proposed-vs-in-force are still useful. Its premise — "the six red
> states ... all show FY 2024-25" — is no longer true. The red tier is empty:
> `npm run tariff:fresh:check` reports **all 66 DISCOMs carry a recorded basis**.
>
> | State | Said here (19 Aug) | Actually on TDB now |
> |---|---|---|
> | Arunachal Pradesh | 2024-25 | **2026-27** — APSERC Petition TP-10 of 2025 (verified 28-08-2026) |
> | Manipur | 2024-25 | **2026-27** — MnERC MSPDCL order dt. 14-05-2026, eff. 01-05-2026 |
> | Dadra & Nagar Haveli and Daman & Diu | 2024-25 | **2026-27** — JERC Petition 145/2025 (verified 28-08-2026) |
> | Ladakh | 2024-25 | **2026-27** — JERC Order No. 05 of 2026 for LPDD (verified 28-08-2026) |
> | Mizoram | 2024-25 | **2026-27** — MZERC P&ED subsidised tariff schedule (verified 28-08-2026) |
> | Nagaland | 2024-25 | **2025-26** — NERC MYT order dt. 28-03-2025 (verified 28-08-2026) |
>
> Nagaland is deliberately still on 2025-26, and that is the section below being *right*: its
> FY 2026-27 order was only a petition, proposed to take effect 1 October 2026. Proposed is
> not law. Re-check it after that date.
>
> `docs/tariff-freshness.md` is generated and is the current picture. This file is history.

Hand-maintained companion to the generated `tariff-freshness.md`. This records **whether a
newer order exists**, with sources. It deliberately contains **no rates**.

> **No rate in this file, and no rate found during this research, has been written into the
> tariff data.** Establishing that an order exists is a different job from transcribing its
> slab tables, and only the second one changes what the calculator tells a consumer. The
> primary documents were not retrievable with the tools available (see "Why no rates were
> loaded" below), and the only rate figures that surfaced came from competitor sites and
> news summaries — never an acceptable source for this engine.

## The six red states

*(As assessed on 19 August 2026. All six have since been resolved — see the banner above.)*

All six carry no recorded basis in the tariff data and show FY 2024-25.

| State | On TDB | What was found | Source |
|---|---|---|---|
| **Arunachal Pradesh** | 2024-25 | APSERC tariff order **dated 31-03-2026, effective 1 Apr 2026**. Existing tariff structure **retained** for FY 2026-27 (no hike); adds a green tariff and EV charging rates. | [Order PDF (>10MB)](https://power.arunachal.gov.in/uploads/orders/2026%2003%2031%20Tariff%20Order%2031-03-2026_compressed_compressed.pdf) · [APSERC orders](https://apserc.nic.in/tariff_order_for_licencees.html) |
| **Manipur** | 2024-25 | An **"MSPDCL Tariff Order for FY 2026-27"** is published on the utility's own site. We are two years behind. | [MSPDCL tariff orders](https://mspdcl.in/reports/tariff) |
| **Dadra & Nagar Haveli and Daman & Diu** | 2024-25 | JERC tariff order for DNHDDPCL exists; the utility's tariff-orders page was **last updated 8 May 2026**. | [DNHDDPCL tariff orders](https://dnhddpcl.in/tariff-orders) · [JERC order PDF](https://swp.dddgov.in/assets/department/electricity/DDM-2996-JERC_Tariff_Order_%E2%80%93_DNHDDPCL.pdf) |
| **Nagaland** | 2024-25 | ⚠️ **In force is the MYT Tariff Order dated 28-03-2025.** The FY 2026-27 petition was only *filed*: objections closed 14 Aug 2026 and it proposes effect from **1 Oct 2026**. Not yet law. | [NERC petition report](https://morungexpress.com/nagaland-power-dept-files-arr-and-tariff-petition-for-fy-2026-27) |
| **Ladakh** | 2024-25 | ⚠️ LPDD has **petitioned** for FY 2026-27 (+5% except agriculture, with a solar-hours ToD proposal). Still in public consultation — **final order pending**. | [LPDD](https://lpdd.ladakh.gov.in/) · [JERC J&K/Ladakh](https://cdnbbsr.s3waas.gov.in/s395192c98732387165bf8e396c0f2dad2/uploads/2025/04/202504182075644073.pdf) |
| **Mizoram** | 2024-25 | ❌ **No accessible current order.** The JERC Mizoram tariff-orders page lists nothing newer than **FY 2018-19**. Needs a direct request to the P&E Department. | [JERC Mizoram](https://jerc.mizoram.gov.in/page/tariff-orders) |

## The trap worth naming

**Two of the six have proposed tariffs sitting in public consultation right now** — Nagaland
(effective 1 Oct 2026 if approved) and Ladakh (+5%, order pending). A naive "fetch the latest
tariff and update" would have loaded *proposed* rates as though they were in force, on a site
whose entire value is that its numbers match a real bill. Proposed is not law. Neither has
been touched.

Nagaland's proposed 1 October effective date is a second instance of the pattern already
noted for Rajasthan: the Indian tariff year is not uniformly April–March.

## Amber state spot-check

| State | On TDB | Finding |
|---|---|---|
| **Tamil Nadu** | 2025-26 (TNERC T.O. No.6 of 2025) | TNERC runs a **multi-year framework with inflation-indexed annual revisions capped at 6%**. The FY 2026 revision (+3.16%) took effect **1 Jul 2025** — which is exactly what our recorded basis says. Whether a further revision landed on 1 Jul 2026 is **unconfirmed**: tnerc.tn.gov.in failed to fetch (malformed HTTP header). Re-check directly. |

## Why no rates were loaded

1. **Primary PDFs were not retrievable.** Arunachal's order exceeds the 10MB fetch limit; the
   MSPDCL order PDF returned 404; TNERC's orders page returns a malformed HTTP header.
2. **The regulator sites for the smallest states are not maintained.** JERC Mizoram stops at
   FY 2018-19.
3. **The only rates that surfaced came from secondary sources** — competitor bill calculators
   and trade-press summaries — and even those were hedged ("appears to follow the standard
   April 1st implementation date"). A rate is only as good as the order it came from.

## Next step — DONE

*Completed by 28 August 2026.* Each order was read directly and transcribed with `sourceUrl`,
`orderDate` and `ratesAsOf` recorded, and all six rows left the red tier. The one genuinely
open item is Tamil Nadu's FY 2026-27 inflation revision, which the amber spot-check above
flagged as unconfirmed and which is still not published on the TNERC index.

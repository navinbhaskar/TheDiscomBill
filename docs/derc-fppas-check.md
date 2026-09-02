# Monthly DERC FPPAS check — runbook

DERC issues a **monthly** FPPAS order for the three Delhi DISCOMs. This file is the procedure
for picking up each new one. It is written for whoever (or whatever) runs the check on the 11th.

Data lives in [`js/tariffs/fppa.js`](../js/tariffs/fppa.js), `FPPA_BY_DISCOM` → `brpl`, `bypl`,
`tpddl`. Read the comment at the top of the Delhi block first; it is the source of truth and
this file is the how-to.

## The trap — read it twice

**DERC names each order by the month whose power-purchase cost it settles, not the month it is
billed in.** The order dated **10.08.2026** fixes the FPPAS *"for June 2026"*, and DERC
publishes it as `PPAC_Order - June.pdf`.

Read by filename, every one of these is **two months out of date**. This is exactly how TPDDL
came to be billed at a superseded 12.21% for three weeks.

Always open the PDF and read the literal `(Date of Order: DD/MM/YYYY)` line and the
`for the month of X` phrase. Never infer either from a filename or a link label.

## Where to look

1. **DERC canonical** — `https://www.derc.gov.in/sites/default/files/PPAC_Order%20-%20<Month>.pdf`
   where `<Month>` is the **settled** month (two behind the order date). `curl -sk` it.
   HTTP 500 with a ~50KB body means it does not exist yet.
2. **BRPL listing** — https://www.bsesdelhi.com/web/brpl/fuel-power-purchase-adjustment-charges
   `curl -sk` and grep for `href="[^"]*\.pdf"`. Titles carry the real order date.
3. **TPDDL listing** — https://www.tatapower-ddl.com/regulations-and-compliances/tariff-related/derc-orders-and-letters-on-ppac

Read PDFs with `pdftotext -layout`. If poppler is absent, `pip install pdfminer.six` and use
`pdf2txt.py`. Do not read an order through a search-engine summary.

## What to extract

From para 1(a): the **total FPPAS permitted to be recovered** for each of BRPL, BYPL, TPDDL —
the "10% cap + additional X%" total, not the additional part and not the DISCOM's *claimed*
figure (orders quote all three; the claim is much higher and is not what consumers pay).

From para 1(b)/(c): the **validity clause, which is not the same every month.**
- 10.06.2026 and 10.07.2026: *"month to month basis till further Order"*
- 10.08.2026: *"recoverable ... for a period of one month from the date of this Order"*

The window in `fppa.js` is the period the rate is **recoverable**, because that is what a bill
date gets matched against. Derive it from this clause, not from the calendar month.

## Rules

- **Never leave a gap.** Close the previous entry's `to` at the day before the new one's `from`.
  A date matching no window resolves to `null`, and the calculator then bills **0%** with no
  warning. Keep a trailing open-ended entry (no `to`) carrying the newest rate forward, labelled
  as a carry-forward, so a late order degrades to a stale rate rather than a silent zero.
- Entries are matched **top-to-bottom**, so newest first.
- Every new entry needs `sourceUrl` + `verifiedOn` — `tests/site.test.mjs` enforces it.
- Cross-check the PDF from two hosts and compare `sha256` where possible.

## Verify

```
npm run seo && npm test
```

19 groups, 0 failures. Then confirm the new rate appears on `/tariffs/delhi/<discom>/` and the
superseded one has moved into the history table.

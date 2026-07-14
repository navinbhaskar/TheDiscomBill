# TheDiscomBill backend (Supabase)

Three server-side pieces, all on the existing free-tier Supabase project. The website
stays client-first: every one of these degrades gracefully — if Supabase is down or
unconfigured, the site works exactly as before.

| Piece | What it does | Needs deploy? |
|---|---|---|
| `fppa_rates` table | Monthly FPPA/PPAC rates updated from the dashboard, no redeploy | SQL paste only |
| `ocr` Edge Function | Opt-in cloud OCR (OCR.space) behind explicit user consent | yes + secret |
| `calc` Edge Function | Public bill-calculation API (same engine as the site) | yes (`npm run api:bundle`) |

---

## 1. Remote FPPA rates (`fppa_rates`)

**Setup (once):** dashboard → SQL Editor → paste [`rates.sql`](rates.sql) → Run.

**Adding a month (e.g. UPPCL Aug 2026 FPPAS):** dashboard → Table Editor → `fppa_rates`
→ Insert row:

| column | value |
|---|---|
| scope | `state` |
| key | `Uttar Pradesh` |
| from_date | `2026-08-01` |
| to_date | `2026-08-31` |
| mode | `percent` |
| rate | `2.5` (negative = consumer credit) |
| label | `Aug 2026 FPPAS` |
| source | `UPPCL monthly FPPAS notice (UPERC MYT Reg. 2025)` |

For a per-DISCOM rate (e.g. Delhi PPAC): scope `discom`, key = the discom id (`brpl`,
`bypl`, `tpddl`). Remote rows **override** a hardcoded entry with the same start date, so
corrections work too.

How it reaches the site: `js/rates.js` fetches the table anonymously at page load
(cached in localStorage 6 h, offline-safe) and merges rows into `js/tariffs/fppa.js`'s
in-memory tables. The hardcoded values remain the fallback — periodically fold
long-standing rows back into `fppa.js` in a normal commit so offline users get them too.

## 2. Cloud OCR (`ocr` function)

Opt-in only: the site's default OCR stays fully in-browser. The button
"Try cloud scan (more accurate)" appears on the OCR review screen for signed-in users,
shows a consent notice naming OCR.space, and uploads **only after the user agrees**.
The function passes the image through in memory — nothing is stored.

**Deploy (once, from the repo root — needs the [Supabase CLI](https://supabase.com/docs/guides/cli) logged in to the project):**

```sh
supabase secrets set OCR_API_KEY=<free key from https://ocr.space/ocrapi>
supabase functions deploy ocr
```

JWT verification stays ON (default), so only signed-in users can spend the OCR quota.
Free tier limits: 25,000 requests/month, 1 MB/file (the client auto-downscales big photos;
oversized PDFs get a "use a screenshot" message).

## 3. Public calc API (`calc` function)

The same pure engine the browser runs (`js/engine.js` + tariff data), exposed as HTTP for
a future mobile app or third parties. The website itself never calls it.

Supabase's bundler can't import from arbitrary domains, so the engine is **vendored at
deploy time** instead of imported from the live site: `npm run api:bundle` copies
`js/engine.js`, `js/utils.js`, and `js/tariffs/` into `functions/calc/vendor/`
(git-ignored) and esbuild-flattens the function into a single `bundle.ts`. `js/` stays the
one source of truth — never edit `vendor/`.

**Deploy:**

```sh
npm run api:bundle
# then paste functions/calc/bundle.ts into the dashboard's function editor (name: calc)
# or with the CLI:
supabase functions deploy calc
```

Redeploy after big engine/tariff changes so the API snapshot catches up with the site.

**Auth:** JWT verification is **ON**, so every call must send the project's **anon key**
(already public — it ships in the site's JS) as a Bearer token. This still counts as a
public API: the anon key is not a secret, it just scopes calls to this project so the
free-tier invocation cap can't be burned by anonymous internet traffic. To make it fully
keyless, toggle **Verify JWT → OFF** in the function's dashboard settings (or deploy with
`--no-verify-jwt`).

**Use:**

```
GET  https://<project-ref>.supabase.co/functions/v1/calc
     Authorization: Bearer <anon-key>
     apikey: <anon-key>
     → { usage, docs, discoms: [ { discomId, state, categories: [...] } ] }

POST https://<project-ref>.supabase.co/functions/v1/calc
     Authorization: Bearer <anon-key>
     apikey: <anon-key>
     Content-Type: application/json

     { "discomId": "mvvnl", "categoryId": "domestic", "supplyTypeId": "17",
       "units": 54, "connectedLoadKw": 1,
       "billingPeriodDays": 110, "billingDate": "2026-05-14",
       "facRate": -1.52, "facMode": "percent" }

     → full engine result: slabBreakdown, fixedCharge, facAmount, extraCharges,
       currentNet, totalPayable, tariff metadata (verified badge, period label…)
```

Errors: `400` bad/missing params, `404` unknown discom/category, `405` wrong method,
`401` missing/invalid anon key (while JWT verification is on).
All responses are JSON with CORS `*`.

Note: Supabase Edge Functions have no built-in rate limiting — free-tier invocation
caps (500K/month) are the backstop. If the endpoint gets popular, add a limiter before
publicising it.

// supabase/functions/calc/index.ts — public bill-calculation API.
//
// Exposes the SAME pure engine the website runs in the browser. Supabase's bundler
// can't import from arbitrary domains, so `npm run api:bundle` copies js/ into
// vendor/ (git-ignored) and flattens everything into bundle.ts for deploying.
// Redeploy after big engine/tariff changes so the API snapshot matches the site.
// The site itself never calls this: it exists for mobile apps / third parties.
//
// DEPLOY: npm run api:bundle, then paste bundle.ts into the dashboard's function
// editor (name: calc, JWT verification OFF — it's a public endpoint), or with the
// CLI: supabase functions deploy calc --no-verify-jwt
//
// GET  /functions/v1/calc            → API usage + the DISCOM/category catalogue
// POST /functions/v1/calc            → calculate a bill
//   body: JSON with the calculateBill params, e.g.
//     { "discomId": "mvvnl", "categoryId": "domestic", "supplyTypeId": "17",
//       "units": 54, "connectedLoadKw": 1, "billingPeriodDays": 110,
//       "billingDate": "2026-05-14", "facRate": -1.52, "facMode": "percent" }
//   response: the engine's full result object (line items, totals, tariff metadata)

// @ts-nocheck — the engine is plain browser JS; no type info.
import { calculateBill } from "./vendor/engine.js";
import { TARIFF_DB } from "./vendor/tariffs/registry.js";

// CORS stays open on purpose: third-party clients are the point of this endpoint. What is
// NOT open-ended is how fast any one caller may hit it — see the limiter below.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json", ...extra },
  });

// ── Abuse controls ───────────────────────────────────────────────────────────
// Three independent limits, cheapest check first:
//
//   1. Body size. A JSON body big enough to matter is not a bill calculation.
//   2. Rate limit per client IP, fixed window.
//   3. Optional API-key gate. If the CALC_API_KEYS env var is set to a comma-separated
//      list, a matching `x-api-key` header becomes mandatory and the endpoint is closed
//      to everyone else. Leave it unset and the endpoint stays open, as it is today.
//      This is the switch to flip if the thing gets abused — no code change, no redeploy
//      of logic, just an env var.
//
// The rate limiter is IN-MEMORY and therefore PER INSTANCE. Edge functions are ephemeral
// and run in several regions, so a determined caller spread across regions gets more than
// MAX_PER_WINDOW. That is understood and accepted: this is a speed bump against runaway
// scripts and accidental loops, not a billing control. A real quota needs Postgres or
// Upstash keyed centrally, which is a bigger change and needs a service-role key.
const MAX_BODY_BYTES = 16 * 1024;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;

const hits = new Map<string, { n: number; resetAt: number }>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || "unknown";
}

// Returns null when allowed, or the seconds to wait when over the limit.
function rateLimited(ip: string): number | null {
  const now = Date.now();
  const e = hits.get(ip);
  if (!e || now >= e.resetAt) {
    hits.set(ip, { n: 1, resetAt: now + WINDOW_MS });
    // Opportunistic sweep so the map cannot grow without bound on a long-lived instance.
    if (hits.size > 5000) for (const [k, v] of hits) if (now >= v.resetAt) hits.delete(k);
    return null;
  }
  if (e.n >= MAX_PER_WINDOW) return Math.max(1, Math.ceil((e.resetAt - now) / 1000));
  e.n++;
  return null;
}

// Unset → open endpoint (current behaviour). Set → key required.
function keyRejected(req: Request): boolean {
  const raw = Deno.env.get("CALC_API_KEYS");
  if (!raw) return false;
  const allowed = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!allowed.length) return false;
  const given = req.headers.get("x-api-key") || "";
  return !allowed.includes(given);
}

// GET catalogue: enough for a client to build valid requests without scraping the site.
function catalogue() {
  const discoms = [];
  for (const [state, list] of Object.entries(TARIFF_DB)) {
    for (const d of list) {
      discoms.push({
        discomId: d.id,
        name: d.name,
        state,
        tariffYear: d.tariffYear || null,
        categories: (d.categories || []).map((c) => ({
          categoryId: c.id,
          name: c.name,
          supplyTypes: (c.supplyTypes || []).map((s) => ({ supplyTypeId: s.id, name: s.name })),
        })),
      });
    }
  }
  return {
    api: "TheDiscomBill calc API",
    usage: "POST this endpoint with JSON { discomId, categoryId, supplyTypeId?, units, connectedLoadKw, ... } — same parameters as the site's calculator engine.",
    docs: "https://github.com/navinbhaskar/TheDiscomBill/blob/main/supabase/API.md",
    discoms,
  };
}

// The catalogue walks the whole tariff DB and never changes between deploys — build the
// JSON once per instance rather than on every GET.
let catalogueJson: string | null = null;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  if (keyRejected(req)) {
    return json(401, { error: "An API key is required. Send it as the x-api-key header." });
  }

  const wait = rateLimited(clientIp(req));
  if (wait !== null) {
    return json(429, {
      error: `Rate limit exceeded — max ${MAX_PER_WINDOW} requests per minute. Retry in ${wait}s.`,
    }, { "Retry-After": String(wait) });
  }

  if (req.method === "GET") {
    catalogueJson ??= JSON.stringify(catalogue());
    return new Response(catalogueJson, {
      headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": "public, max-age=3600" },
    });
  }
  if (req.method !== "POST") return json(405, { error: "GET (catalogue) or POST (calculate) only" });

  // Reject oversized bodies before spending anything on parsing them.
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BODY_BYTES) {
    return json(413, { error: `Body too large — the limit is ${MAX_BODY_BYTES} bytes.` });
  }

  let params: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) {   // no/lying content-length
      return json(413, { error: `Body too large — the limit is ${MAX_BODY_BYTES} bytes.` });
    }
    params = JSON.parse(raw);
  } catch {
    return json(400, { error: "Expected a JSON body." });
  }

  if (!params || typeof params !== "object") return json(400, { error: "Expected a JSON object." });
  if (!params.discomId || !params.categoryId) {
    return json(400, { error: "discomId and categoryId are required. GET this endpoint for the catalogue." });
  }
  const units = +(params.units ?? NaN);
  const load = +(params.connectedLoadKw ?? NaN);
  if (!(units >= 0) || units > 10_000_000) return json(400, { error: "units must be a number ≥ 0." });
  if (!(load > 0) || load > 1_000_000) return json(400, { error: "connectedLoadKw must be a number > 0." });

  try {
    const result = calculateBill({ ...params, units, connectedLoadKw: load });
    if (result && result.error) return json(404, { error: result.message });
    return json(200, result);
  } catch (e) {
    return json(500, { error: "Calculation failed: " + (e instanceof Error ? e.message : String(e)) });
  }
});

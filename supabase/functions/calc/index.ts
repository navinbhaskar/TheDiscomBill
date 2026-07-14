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

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method === "GET") return json(200, catalogue());
  if (req.method !== "POST") return json(405, { error: "GET (catalogue) or POST (calculate) only" });

  let params: Record<string, unknown>;
  try {
    params = await req.json();
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

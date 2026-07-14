// supabase/functions/ocr/index.ts — opt-in cloud OCR passthrough.
//
// The site's default OCR is 100% client-side (Tesseract in the browser). This function
// backs the OPT-IN "cloud scan" button: it forwards the user's bill image to OCR.space
// and returns the recognized text. The provider API key lives ONLY here (Supabase
// secret), never in client code.
//
// Privacy: the image is passed through in memory and NEVER stored — no Supabase Storage,
// no database row, no logging of image data. The client shows an explicit consent notice
// before calling this. Auth: Supabase verifies the caller's JWT before this code runs
// (verify_jwt is on by default), so only signed-in users can use the quota.
//
// DEPLOY (one time, from the repo root — needs the Supabase CLI, logged in):
//   supabase secrets set OCR_API_KEY=<your free key from https://ocr.space/ocrapi>
//   supabase functions deploy ocr
//
// Request:  POST { image: "data:<mime>;base64,...", filetype?: "PDF" | "JPG" | "PNG" }
// Response: 200 { text: string }  |  4xx/5xx { error: string }

const CORS = {
  "Access-Control-Allow-Origin": "*", // JWT check is the real gate; CORS just unblocks the browser
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

// OCR.space free tier caps files at 1 MB; base64 inflates ~4/3, plus data: prefix headroom.
const MAX_BODY_CHARS = 1_500_000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "POST only" });

  const apiKey = Deno.env.get("OCR_API_KEY");
  if (!apiKey) return json(503, { error: "Cloud OCR is not configured on the server." });

  let body: { image?: string; filetype?: string };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Expected a JSON body." });
  }

  const image = body.image || "";
  if (!/^data:(image\/(png|jpe?g|webp)|application\/pdf);base64,/.test(image)) {
    return json(400, { error: "image must be a base64 data URL (PNG/JPEG/WebP/PDF)." });
  }
  if (image.length > MAX_BODY_CHARS) {
    return json(413, { error: "File too large for cloud OCR (1 MB limit) — try a screenshot of the bill instead." });
  }

  const form = new FormData();
  form.set("base64Image", image);
  form.set("apikey", apiKey);
  form.set("OCREngine", "2");        // engine 2 reads number-heavy documents better
  form.set("scale", "true");
  form.set("detectOrientation", "true");
  form.set("isOverlayRequired", "false");
  const ft = (body.filetype || "").toUpperCase();
  if (["PDF", "PNG", "JPG", "WEBP"].includes(ft)) form.set("filetype", ft);

  try {
    const res = await fetch("https://api.ocr.space/parse/image", { method: "POST", body: form });
    if (!res.ok) return json(502, { error: `OCR provider error (HTTP ${res.status}).` });
    const data = await res.json();
    if (data.IsErroredOnProcessing) {
      const msg = Array.isArray(data.ErrorMessage) ? data.ErrorMessage.join("; ") : String(data.ErrorMessage || "processing failed");
      return json(422, { error: `OCR provider could not read the file: ${msg}` });
    }
    const text = (data.ParsedResults || [])
      .map((r: { ParsedText?: string }) => r.ParsedText || "")
      .join("\n")
      .trim();
    if (!text) return json(422, { error: "OCR provider returned no text for this file." });
    return json(200, { text });
  } catch {
    return json(502, { error: "Could not reach the OCR provider — try again." });
  }
});

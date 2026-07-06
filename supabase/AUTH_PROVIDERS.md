# Enabling Google & Phone sign-in

The frontend for both is **already built** (`js/support-common.js` → the auth card).
The only thing left is turning the providers on in the Supabase dashboard. As of the
last check the project has `email: true`, `google: false`, `phone: false`.

Project ref: **`rmdxtcfhlvimvxjflvfb`**
OAuth callback URL (needed below): **`https://rmdxtcfhlvimvxjflvfb.supabase.co/auth/v1/callback`**

New Google/phone users get a `profiles` row automatically via the `handle_new_user`
trigger in `schema.sql` — no extra SQL needed.

---

## 1. Google sign-in

**a) Create the OAuth client (Google Cloud Console)**
1. https://console.cloud.google.com → create/select a project.
2. **APIs & Services → OAuth consent screen** → External → fill app name, support email,
   your domain (`thediscombill.com`). Add your email as a test user (or publish the app).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application.**
4. Under **Authorized redirect URIs** add exactly:
   `https://rmdxtcfhlvimvxjflvfb.supabase.co/auth/v1/callback`
5. Save — copy the **Client ID** and **Client Secret**.

**b) Enable in Supabase**
1. Dashboard → **Authentication → Providers → Google** → toggle **Enabled**.
2. Paste the **Client ID** and **Client Secret** → **Save**.

**c) Set the redirect allow-list** (so OAuth returns to your site, not just localhost)
1. Dashboard → **Authentication → URL Configuration**.
2. **Site URL:** `https://www.thediscombill.com`
3. **Redirect URLs:** add `https://www.thediscombill.com/**` (and
   `http://localhost:3456/**` for local testing).

The code requests `redirectTo: location.href`, so the user returns to the page they
started on (e.g. `/login/?next=/bill-review/`).

---

## 2. Phone (SMS OTP) sign-in

Phone OTP needs a third-party SMS gateway. Supabase natively supports **Twilio,
Twilio Verify, MessageBird, Vonage, and Textlocal**. **Each SMS costs money** — for
India, Twilio or MSG91/Textlocal are the usual choices; expect DLT-template
registration (TRAI rule) for Indian numbers, which the provider walks you through.

**a) Get SMS provider credentials** (example: Twilio)
1. Create a Twilio account, buy/verify a sender number (or set up a Messaging Service).
2. Copy the **Account SID** and **Auth Token**.
3. For India: complete DLT sender-ID + template registration in the Twilio console.

**b) Enable in Supabase**
1. Dashboard → **Authentication → Providers → Phone** → toggle **Enabled**.
2. Choose **Twilio** (or your provider) and paste the SID / Auth Token / sender.
3. (Optional) Customise the OTP SMS template and set the code length (the frontend
   accepts 4–8 digit codes) and expiry.

**c) Guard against SMS-pumping fraud** (recommended)
- Turn on **CAPTCHA protection** (Auth → Settings) so bots can't drain your SMS credit.
- Keep the per-hour OTP rate limit at its default or lower.

---

## Verifying it worked

Re-run the public settings check — both should flip to `true`:

```
curl -s https://rmdxtcfhlvimvxjflvfb.supabase.co/auth/v1/settings \
  -H "apikey: <anon key from js/supabase-config.js>" | jq '.external | {google, phone}'
```

Then open `/login/`: "Continue with Google" should complete a real redirect, and
"Use phone number instead" → **Send code** should deliver an SMS.

## Known minor gap (optional fix)

For **phone** signups the name typed on first sign-in is saved to `user_metadata`
*after* the `profiles` row is created, so `profiles.full_name` stays blank for phone
users (the account works; only the displayed name is empty). Google users are fine
(the name arrives in metadata at creation). If this matters, add an UPDATE-side
trigger or backfill `profiles.full_name` from `auth.users.raw_user_meta_data`.

// supabase-config.js — connection settings for the Bill Review backend.
//
// SETUP (one time):
//   1. Create a free project at https://supabase.com (any name, region: Mumbai).
//   2. In the project: SQL Editor → paste supabase/schema.sql → Run.
//   3. Project Settings → API → copy the "Project URL" and the "anon public" key
//      into the two constants below.
//   4. Authentication → Providers → Email: leave enabled (default).
//
// The anon key is safe to ship in client code — all access is enforced by the
// Row Level Security policies created in schema.sql.

export const SUPABASE_URL = 'https://rmdxtcfhlvimvxjflvfb.supabase.co';       // bare project URL — no /rest/v1/ suffix (the client adds its own paths)
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZHh0Y2ZobHZpbXZ4amZsdmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDgyMzgsImV4cCI6MjA5ODU4NDIzOH0.8qGVHKgmUAfJI-tJP05RY6HMVMmCFlzoS_xnQBWx64g';

export const isConfigured = () =>
  SUPABASE_URL.startsWith('https://') && !/YOUR_/.test(SUPABASE_ANON_KEY);

// Cheap signed-in check for header UI on every page: supabase-js persists the
// session in localStorage under sb-<project-ref>-auth-token, so we can detect
// "probably signed in" without downloading the SDK. The real pages still
// validate the session properly via getSupabase().
export function hasStoredSession() {
  if (!isConfigured()) return false;
  try {
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
    return !!localStorage.getItem(`sb-${ref}-auth-token`);
  } catch (e) { return false; }
}

// The supabase-js client is loaded from a CDN only when actually needed, so the
// rest of the site keeps working offline and pays no cost for this feature.
let _client = null;
export async function getSupabase() {
  if (!isConfigured()) return null;
  if (!_client) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _client;
}

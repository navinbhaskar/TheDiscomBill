// login.js — dedicated sign-in page (/login/).
// Renders the shared auth card; once a session exists (fresh sign-in OR an
// already-signed-in visitor landing here) it bounces to ?next=<path>, defaulting
// to the consumer portal.

import { initAuth } from './support-common.js';

const mount = document.getElementById('loginMain');
if (mount) init();

// Only same-site paths are honoured, so a crafted link can't bounce users to
// another domain after login.
function nextUrl() {
  const raw = new URLSearchParams(location.search).get('next') || '/bill-review/';
  return (raw.startsWith('/') && !raw.startsWith('//')) ? raw : '/bill-review/';
}

async function init() {
  await initAuth({
    mount,
    signupHint: 'We only use your email to sign you in and notify you about your case.',
    onSignedIn: () => location.replace(nextUrl())
  });
}

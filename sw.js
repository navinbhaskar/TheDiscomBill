// sw.js — Service Worker (network-first, cache fallback)
// Update this version string when deploying new code to bust the cache.
const CACHE = 'discombill-20260716-131';

const CORE = [
  './', './index.html', './compare/', './compare/index.html',
  './usage/', './usage/index.html',
  './solar/', './solar/index.html',
  './tariffs/', './tariffs/index.html',
  './services/', './services/index.html',
  './bill-review/', './bill-review/index.html',
  './login/', './login/index.html',
  './my-bills/', './my-bills/index.html',
  './new-connection/', './new-connection/index.html',
  './complaint/', './complaint/index.html',
  './glossary/', './glossary/index.html',
  './methodology/', './methodology/index.html',
  './recharge-calculator/', './recharge-calculator/index.html',
  // Styles
  './css/styles.min.css',
  // Application JS
  './js/utils.js', './js/engine.js', './js/i18n.js',
  './js/ui.js', './js/datepicker.js', './js/renderer.js', './js/main.js', './js/compare.js',
  './js/estimators.js', './js/tariff-explorer.js', './js/bill-check.js',
  './js/portal-page.js', './js/new-connection.js', './js/complaint.js', './js/services.js', './js/solar.js',
  './js/recharge-calculator.js',
  // Bill Review portal — bill-review.js statically imports these two, so they
  // must be cached together or the page fails to parse offline.
  './js/bill-review.js', './js/support-common.js', './js/supabase-config.js', './js/login.js', './js/my-bills.js',
  // Vendored libraries — lenis.mjs is a STATIC import of main.js, so if it is missing from
  // the cache offline the whole entry point fails to parse (and the state list never loads).
  './js/vendor/lenis.mjs',
  // Tariff registry + FPPA
  './js/tariffs/registry.js', './js/tariffs/fppa.js', './js/tariffs/subsidy.js',
  // Per-state tariff data
  './js/tariffs/andhra-pradesh.js', './js/tariffs/arunachal-pradesh.js',
  './js/tariffs/assam.js', './js/tariffs/bihar.js', './js/tariffs/chandigarh.js',
  './js/tariffs/chhattisgarh.js', './js/tariffs/dadra-and-nagar-haveli-and-daman-and-diu.js',
  './js/tariffs/delhi.js', './js/tariffs/goa.js', './js/tariffs/gujarat.js',
  './js/tariffs/haryana.js', './js/tariffs/himachal-pradesh.js',
  './js/tariffs/jammu-and-kashmir.js', './js/tariffs/jharkhand.js',
  './js/tariffs/karnataka.js', './js/tariffs/kerala.js', './js/tariffs/ladakh.js',
  './js/tariffs/madhya-pradesh.js', './js/tariffs/maharashtra.js',
  './js/tariffs/manipur.js', './js/tariffs/meghalaya.js', './js/tariffs/mizoram.js',
  './js/tariffs/nagaland.js', './js/tariffs/odisha.js', './js/tariffs/puducherry.js',
  './js/tariffs/punjab.js', './js/tariffs/rajasthan.js', './js/tariffs/sikkim.js',
  './js/tariffs/tamil-nadu.js', './js/tariffs/telangana.js', './js/tariffs/tripura.js',
  './js/tariffs/uttar-pradesh.js', './js/tariffs/uttarakhand.js',
  './js/tariffs/west-bengal.js',
  // Assets
  './manifest.webmanifest', './icon.svg', './icon-maskable.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE))
      .catch(() => {})     // best-effort precache; fetch handler fills gaps
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => {
        if (r) return r;
        // Only fall back to the app shell for navigations. Never hand HTML back for a
        // missing script/style/module request — that would make the browser try to parse
        // index.html as JS and abort the module (e.g. the state list failing to load).
        if (e.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      }))
  );
});

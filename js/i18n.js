// js/i18n.js — lightweight i18n layer. Elements carrying a data-i18n="key" attribute have their
// text replaced from the active language's dictionary. English is the source/fallback; Hindi is
// provided for the core page chrome. Add more keys + mark more elements to extend coverage (the
// generated bill is still English-only for now). Persists the choice in localStorage.

const STRINGS = {
  en: {
    'nav.calculator': 'Calculator',
    'nav.about': 'About',
    'hero.badge': 'Free · All DISCOMs · No Login Required',
    'hero.title': 'Electricity Bill Calculator for Every DISCOM in India',
    'hero.sub': 'Get an instant provisional bill with slab-wise breakdown for any state electricity utility.',
    'calc.title': 'Bill Calculator',
    'label.state': 'State / Union Territory',
    'label.discom': 'Electricity Utility (DISCOM)',
    'label.category': 'Consumer Category',
    'btn.calculate': '⚡ Calculate Provisional Bill',
    'btn.sample': 'Try a sample bill',
    'btn.compare': '⚖ Compare DISCOMs',
    'about.title': 'About TheDiscomBill',
  },
  hi: {
    'nav.calculator': 'कैलकुलेटर',
    'nav.about': 'परिचय',
    'hero.badge': 'निःशुल्क · सभी डिस्कॉम · बिना लॉगिन',
    'hero.title': 'भारत के हर डिस्कॉम के लिए बिजली बिल कैलकुलेटर',
    'hero.sub': 'किसी भी राज्य की बिजली कंपनी के लिए स्लैब-वार विवरण के साथ तुरंत अनुमानित बिल पाएं।',
    'calc.title': 'बिल कैलकुलेटर',
    'label.state': 'राज्य / केंद्र शासित प्रदेश',
    'label.discom': 'बिजली कंपनी (डिस्कॉम)',
    'label.category': 'उपभोक्ता श्रेणी',
    'btn.calculate': '⚡ अनुमानित बिल गणना करें',
    'btn.sample': 'नमूना बिल देखें',
    'btn.compare': '⚖ डिस्कॉम की तुलना करें',
    'about.title': 'TheDiscomBill के बारे में',
  },
};

export function applyLang(lang) {
  const dict = STRINGS[lang] || STRINGS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  document.documentElement.lang = (lang === 'hi') ? 'hi' : 'en';
  try { localStorage.setItem('lang', lang); } catch (e) {}
}

export function initI18n() {
  let lang = 'en';
  try { lang = localStorage.getItem('lang') || 'en'; } catch (e) {}
  if (!STRINGS[lang]) lang = 'en';
  const sel = document.getElementById('langSelect');
  if (sel) {
    sel.value = lang;
    sel.addEventListener('change', () => applyLang(sel.value));
  }
  applyLang(lang);
}

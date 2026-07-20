import fs from 'fs';
import path from 'path';
import { generateSeo } from './generate-seo.js';

// Pre-render the programmatic SEO landing pages (state / DISCOM / directory) and refresh
// sitemap.xml + robots.txt into the source tree BEFORE copying, so the recursive copy of
// tariffs/ picks them up and the sitemap is always current on every deploy.
generateSeo();

const dist = 'dist';
if (!fs.existsSync(dist)) fs.mkdirSync(dist);

const assets = [
  'css', 'js',
  // Route pages (each is its own folder with an index.html) — must be copied or
  // the Quick Links destinations 404 in production. tariffs/ also contains the
  // generated per-state and per-DISCOM landing pages (copied recursively).
  'compare', 'electricity-cost-calculator', 'solar-calculator', 'tariffs', 'guides', 'glossary', 'methodology', 'services', 'bill-check', 'bill-review', 'expert', 'admin', 'login', 'my-bills', 'new-connection', 'complaint',
  // Hindi pre-rendered variants of tariffs/guides/glossary (generated into hi/ by generate-seo.js)
  'hi',
  'index.html', 'editor.html',
  'sw.js', 'manifest.webmanifest',
  'icon.svg', 'icon-maskable.svg',
  'icon-192.png', 'icon-512.png',
  'og-image.jpg',   // 1200×630 social share card (og:image / twitter:image)
  // SEO / hosting files — previously omitted, so they never reached production.
  'sitemap.xml', 'robots.txt', 'llms.txt', 'CNAME'
];

function copyRecursiveSync(src, dest) {
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

assets.forEach(asset => {
  if (fs.existsSync(asset)) {
    copyRecursiveSync(asset, path.join(dist, asset));
    console.log(`Copied ${asset} to ${dist}/`);
  }
});

console.log('Build complete. Assets are in the dist/ folder.');

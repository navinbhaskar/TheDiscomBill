import fs from 'fs';
import path from 'path';

const dist = 'dist';
if (!fs.existsSync(dist)) fs.mkdirSync(dist);

const assets = [
  'css', 'js',
  'index.html', 'editor.html',
  'sw.js', 'manifest.webmanifest',
  'icon.svg', 'icon-maskable.svg',
  'icon-192.png', 'icon-512.png'
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

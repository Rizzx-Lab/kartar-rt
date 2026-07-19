/**
 * Script untuk generate icon PWA AE
 * Jalankan: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Pastikan folder icons ada
const iconsDir = path.join(__dirname);
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icon PNG menggunakan canvas sederhana
// Karena Node.js standard tidak punya canvas, kita buat SVG dulu lalu konversi

function generateSVG(size) {
  const fontSize = size * 0.38;
  const cornerRadius = size * 0.15;
  const padding = size * 0.08;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#D4A84B"/>
      <stop offset="100%" style="stop-color:#B8922A"/>
    </linearGradient>
  </defs>
  <rect x="${padding}" y="${padding}" width="${size - padding * 2}" height="${size - padding * 2}" rx="${cornerRadius}" ry="${cornerRadius}" fill="url(#goldGrad)"/>
  <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="${fontSize}px" fill="#111D4A">AE</text>
</svg>`;
}

// Generate SVG files
const svg192 = generateSVG(192);
const svg512 = generateSVG(512);

fs.writeFileSync(path.join(iconsDir, 'icon-192.svg'), svg192);
fs.writeFileSync(path.join(iconsDir, 'icon-512.svg'), svg512);

console.log('✅ SVG icons created!');

// Konversi ke PNG menggunakan sharp (kalau ada)
// Atau buat file HTML yang auto-download PNG

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Generating PNG Icons...</title>
  <style>
    body { font-family: Arial; text-align: center; padding: 50px; background: #f5f5f5; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <h2>Generating icons...</h2>
  <p>Mohon tunggu sebentar...</p>

  <canvas id="c192" class="hidden"></canvas>
  <canvas id="c512" class="hidden"></canvas>

  <script>
    function createIcon(size) {
      const canvas = document.getElementById('c' + size);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, '#D4A84B');
      grad.addColorStop(1, '#B8922A');

      // Rounded rect
      const r = size * 0.15;
      const p = size * 0.08;
      ctx.beginPath();
      ctx.moveTo(p + r, p);
      ctx.lineTo(size - p - r, p);
      ctx.quadraticCurveTo(size - p, p, size - p, p + r);
      ctx.lineTo(size - p, size - p - r);
      ctx.quadraticCurveTo(size - p, size - p, size - p - r, size - p);
      ctx.lineTo(p + r, size - p);
      ctx.quadraticCurveTo(p, size - p, p, size - p - r);
      ctx.lineTo(p, p + r);
      ctx.quadraticCurveTo(p, p, p + r, p);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // Text AE
      ctx.fillStyle = '#111D4A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + (size * 0.38) + 'px Arial';
      ctx.fillText('AE', size / 2, size / 2 + size * 0.02);
    }

    function download(size) {
      const canvas = document.getElementById('c' + size);
      const link = document.createElement('a');
      link.download = 'icon-' + size + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    }

    createIcon(192);
    createIcon(512);

    setTimeout(() => {
      download(192);
      setTimeout(() => download(512), 500);
    }, 500);
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(iconsDir, 'auto-download.html'), htmlContent);

console.log('📥 Buka file auto-download.html di browser untuk download PNG icons');
console.log('   Atau buka icon-192.svg dan icon-512.svg langsung');

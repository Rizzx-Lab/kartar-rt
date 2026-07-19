// Script untuk generate PWA icons dari logo.png
// Run: node scripts/generate-icons.js

const fs = require('fs');
const path = require('path');

// Cek apakah sharp tersedia
try {
  const sharp = require('sharp');

  const logoPath = path.join(__dirname, '../public/images/logo.png');
  const iconsDir = path.join(__dirname, '../public/icons');

  // Buat folder icons kalau belum ada
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate icons
  async function generateIcons() {
    console.log('🎨 Generating PWA icons...');

    // Icon 192x192
    await sharp(logoPath)
      .resize(192, 192)
      .png()
      .toFile(path.join(iconsDir, 'icon-192.png'));
    console.log('✅ Created icon-192.png');

    // Icon 512x512
    await sharp(logoPath)
      .resize(512, 512)
      .png()
      .toFile(path.join(iconsDir, 'icon-512.png'));
    console.log('✅ Created icon-512.png');

    console.log('🎉 All icons generated!');
  }

  generateIcons().catch(console.error);

} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.log('❌ Sharp belum terinstall. Installing...');
    console.log('Run: npm install sharp');
    console.log('');
    console.log('Alternatif lain:');
    console.log('1. Buka https://realfavicongenerator.net/');
    console.log('2. Upload public/images/logo.png');
    console.log('3. Download dan extract ke public/icons/');
  } else {
    console.error(e);
  }
}

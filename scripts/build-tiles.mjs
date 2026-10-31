// Découpe une grande image en pyramide de tuiles {z}/{x}/{y}.png pour Leaflet (CRS.Simple).
// Usage : npm run tiles -- <image> [dossier-sortie=public/map-tiles] [format=png|webp]
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const TILE = 256;
const [input, outDir = 'public/map-tiles', format = 'png'] = process.argv.slice(2);

if (!input) {
  console.error('Usage : npm run tiles -- <image> [dossier-sortie] [png|webp]');
  process.exit(1);
}

const { width, height } = await sharp(input, { limitInputPixels: false }).metadata();
const maxZoom = Math.max(0, Math.ceil(Math.log2(Math.max(width, height) / TILE)));
let count = 0;

for (let z = maxZoom; z >= 0; z--) {
  const scale = 2 ** (z - maxZoom);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const level = await sharp(input, { limitInputPixels: false }).resize(w, h).png().toBuffer();

  for (let x = 0; x * TILE < w; x++) {
    await mkdir(join(outDir, String(z), String(x)), { recursive: true });
    for (let y = 0; y * TILE < h; y++) {
      const tw = Math.min(TILE, w - x * TILE);
      const th = Math.min(TILE, h - y * TILE);
      await sharp(level)
        .extract({ left: x * TILE, top: y * TILE, width: tw, height: th })
        .extend({ right: TILE - tw, bottom: TILE - th, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toFormat(format, { quality: 85 })
        .toFile(join(outDir, String(z), String(x), `${y}.${format}`));
      count++;
    }
  }
  console.log(`zoom ${z} : ${w}×${h}`);
}

console.log(`\n${count} tuiles générées dans ${outDir}`);
console.log('À reporter dans src/app/data/map-config.ts :');
console.log(`  tileUrl: 'map-tiles/{z}/{x}/{y}.${format}', width: ${width}, height: ${height}, maxNativeZoom: ${maxZoom},`);
console.log('  puis ajuster cell (taille d’une case en px) et origin (pixel du coin haut-gauche de [0,0]).');

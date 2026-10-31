// Calcule le masque des cases « terre » d'une carte du monde (mer grise et fond beige exclus).
// Usage : npm run land-mask -- <image> <largeurCase> <hauteurCase> <origineX> <origineY> [sortie=src/app/data/land.mask.ts]
import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

const [input, cw, ch, ox, oy, out = 'src/app/data/land.mask.ts'] = process.argv.slice(2);
if (!input || !oy) {
  console.error('Usage : npm run land-mask -- <image> <largeurCase> <hauteurCase> <origineX> <origineY> [sortie]');
  process.exit(1);
}

/** Part minimale de pixels « terre » pour qu'une case soit praticable. */
const THRESHOLD = 0.35;
const cell = { w: +cw, h: +ch };
const origin = { x: +ox, y: +oy };

const { data, info } = await sharp(input, { limitInputPixels: false }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

function isSea(p) {
  const i = p * channels, r = data[i], g = data[i + 1], b = data[i + 2];
  return Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r > 95 && r < 160;
}

function isBackground(p) {
  const i = p * channels;
  return Math.abs(data[i] - 232) < 10 && Math.abs(data[i + 1] - 219) < 10 && Math.abs(data[i + 2] - 200) < 10;
}

// Fond extérieur = pixels beiges reliés au bord de l'image
// (certaines îles ont la même teinte que le fond, mais sont entourées de mer).
const outside = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let head = 0, tail = 0;
const visit = (p) => {
  if (!outside[p] && isBackground(p)) {
    outside[p] = 1;
    queue[tail++] = p;
  }
};
for (let x = 0; x < width; x++) visit(x), visit((height - 1) * width + x);
for (let y = 0; y < height; y++) visit(y * width), visit(y * width + width - 1);
while (head < tail) {
  const p = queue[head++], x = p % width;
  if (x > 0) visit(p - 1);
  if (x < width - 1) visit(p + 1);
  if (p >= width) visit(p - width);
  if (p < width * (height - 1)) visit(p + width);
}

const isLand = (p) => !outside[p] && !isSea(p);

const bounds = {
  minX: -Math.floor(origin.x / cell.w),
  maxX: Math.floor((width - origin.x) / cell.w) - 1,
  minY: -Math.floor(origin.y / cell.h),
  maxY: Math.floor((height - origin.y) / cell.h) - 1,
};

const rows = [];
for (let y = bounds.minY; y <= bounds.maxY; y++) {
  let row = '';
  for (let x = bounds.minX; x <= bounds.maxX; x++) {
    const px = origin.x + x * cell.w;
    const py = origin.y + y * cell.h;
    let land = 0, total = 0;
    for (let sy = py; sy < py + cell.h; sy += 3) {
      for (let sx = px; sx < px + cell.w; sx += 3) {
        total++;
        if (isLand(sy * width + sx)) land++;
      }
    }
    row += land / total >= THRESHOLD ? '#' : '.';
  }
  rows.push(row);
}

const ts = `// Généré par scripts/build-land-mask.mjs — ne pas modifier à la main.
/** Coordonnées couvertes par l'image de la carte du monde. */
export const LAND_BOUNDS = ${JSON.stringify(bounds).replace(/"/g, '').replace(/,/g, ', ').replace(/:/g, ': ').replace('{', '{ ').replace(/}$/, ' }')};

/** Une ligne par y (de minY à maxY), un caractère par x : \`#\` terre, \`.\` mer. */
export const LAND_MASK: string[] = [
${rows.map((r) => `  '${r}',`).join('\n')}
];
`;
await writeFile(out, ts);
console.log(`${rows.join('').split('#').length - 1} cases de terre — bornes ${JSON.stringify(bounds)} → ${out}`);

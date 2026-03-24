import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';

const sizes = [20, 29, 40, 58, 60, 76, 80, 87, 120, 152, 167, 180, 1024];

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#1e1040';
  ctx.fillRect(0, 0, size, size);

  const gradient = ctx.createLinearGradient(size*0.25, size*0.33, size*0.75, size*0.67);
  gradient.addColorStop(0, '#EC4899');
  gradient.addColorStop(0.5, '#A855F7');
  gradient.addColorStop(1, '#06B6D4');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = size * 0.088;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const s = size / 1024;
  ctx.beginPath();
  ctx.moveTo(256*s, 341*s);
  ctx.bezierCurveTo(256*s, 341*s, 341*s, 256*s, 426*s, 341*s);
  ctx.bezierCurveTo(512*s, 426*s, 512*s, 597*s, 597*s, 682*s);
  ctx.bezierCurveTo(682*s, 768*s, 768*s, 682*s, 768*s, 682*s);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

const dir = '/Users/souf/Downloads/files/ios/App/App/Assets.xcassets/AppIcon.appiconset';
mkdirSync(dir, { recursive: true });

const contents = { images: [], info: { author: "xcode", version: 1 } };

for (const size of sizes) {
  const filename = `icon-${size}.png`;
  writeFileSync(`${dir}/${filename}`, generateIcon(size));

  if (size === 1024) {
    contents.images.push({ filename, idiom: "ios-marketing", scale: "1x", size: "1024x1024" });
  }
}

// Toutes les tailles requises iOS
const required = [
  { size: 20, scale: 2, idiom: "iphone" }, { size: 20, scale: 3, idiom: "iphone" },
  { size: 29, scale: 2, idiom: "iphone" }, { size: 29, scale: 3, idiom: "iphone" },
  { size: 40, scale: 2, idiom: "iphone" }, { size: 40, scale: 3, idiom: "iphone" },
  { size: 60, scale: 2, idiom: "iphone" }, { size: 60, scale: 3, idiom: "iphone" },
  { size: 20, scale: 1, idiom: "ipad" },   { size: 20, scale: 2, idiom: "ipad" },
  { size: 29, scale: 1, idiom: "ipad" },   { size: 29, scale: 2, idiom: "ipad" },
  { size: 40, scale: 1, idiom: "ipad" },   { size: 40, scale: 2, idiom: "ipad" },
  { size: 76, scale: 1, idiom: "ipad" },   { size: 76, scale: 2, idiom: "ipad" },
  { size: 83.5, scale: 2, idiom: "ipad" },
];

for (const { size, scale, idiom } of required) {
  const px = Math.round(size * scale);
  const filename = `icon-${px}.png`;
  if (!sizes.includes(px)) {
    writeFileSync(`${dir}/${filename}`, generateIcon(px));
  }
  contents.images.push({
    filename,
    idiom,
    scale: `${scale}x`,
    size: `${size}x${size}`
  });
}

writeFileSync(`${dir}/Contents.json`, JSON.stringify(contents, null, 2));
console.log('✅ Toutes les icônes générées dans Xcode');

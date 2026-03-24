import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const size = 2732;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#1e1040';
ctx.fillRect(0, 0, size, size);

const gradient = ctx.createLinearGradient(size*0.25, size*0.25, size*0.75, size*0.75);
gradient.addColorStop(0, '#EC4899');
gradient.addColorStop(0.5, '#A855F7');
gradient.addColorStop(1, '#06B6D4');

ctx.strokeStyle = gradient;
ctx.lineWidth = size * 0.055;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// SVG viewBox 0 0 60 60 — on scale directement par size/60
const s = size / 60;
ctx.beginPath();
ctx.moveTo(15*s, 20*s);
ctx.bezierCurveTo(15*s, 20*s, 20*s, 15*s, 25*s, 20*s);
ctx.bezierCurveTo(30*s, 25*s, 30*s, 35*s, 35*s, 40*s);
ctx.bezierCurveTo(40*s, 45*s, 45*s, 40*s, 45*s, 40*s);
ctx.stroke();

writeFileSync('/Users/souf/Downloads/files/splash.png', canvas.toBuffer('image/png'));
console.log('✅ Splash centré');

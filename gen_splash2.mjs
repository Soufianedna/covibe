import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const size = 2732;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#1e1040';
ctx.fillRect(0, 0, size, size);

const gradient = ctx.createLinearGradient(size*0.2, size*0.3, size*0.8, size*0.7);
gradient.addColorStop(0, '#EC4899');
gradient.addColorStop(0.5, '#A855F7');
gradient.addColorStop(1, '#06B6D4');

ctx.strokeStyle = gradient;
ctx.lineWidth = size * 0.06;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

const margin = size * 0.15;
const w = size - margin * 2;
const h = size * 0.5;
const top = (size - h) / 2;

const p = (x, y) => [margin + (x - 15) / 30 * w, top + (y - 15) / 30 * h];

ctx.beginPath();
ctx.moveTo(...p(15, 20));
ctx.bezierCurveTo(...p(15, 20), ...p(20, 15), ...p(25, 20));
ctx.bezierCurveTo(...p(30, 25), ...p(30, 35), ...p(35, 40));
ctx.bezierCurveTo(...p(40, 45), ...p(45, 40), ...p(45, 40));
ctx.stroke();

writeFileSync('/Users/souf/Downloads/files/splash.png', canvas.toBuffer('image/png'));
console.log('✅ Splash centré généré');

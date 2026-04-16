import { createCanvas, registerFont } from 'canvas';
registerFont('/tmp/Pacifico.ttf', { family: 'Pacifico' });
import { writeFileSync } from 'fs';

const size = 2732;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#1e1040';
ctx.fillRect(0, 0, size, size);

const gradient = ctx.createLinearGradient(size*0.2, size*0.2, size*0.8, size*0.8);
gradient.addColorStop(0, '#EC4899');
gradient.addColorStop(0.5, '#A855F7');
gradient.addColorStop(1, '#06B6D4');

ctx.strokeStyle = gradient;
ctx.lineWidth = size * 0.065;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

const s = size / 60;
const scale = 1.4;

ctx.save();
ctx.translate(size / 2, size / 2 - size * 0.12);
ctx.scale(scale, scale);
ctx.translate(-30 * s, -30 * s);

ctx.beginPath();
ctx.moveTo(15*s, 20*s);
ctx.bezierCurveTo(15*s, 20*s, 20*s, 15*s, 25*s, 20*s);
ctx.bezierCurveTo(30*s, 25*s, 30*s, 35*s, 35*s, 40*s);
ctx.bezierCurveTo(40*s, 45*s, 45*s, 40*s, 45*s, 40*s);
ctx.stroke();
ctx.restore();

const textGradient = ctx.createLinearGradient(size*0.2, 0, size*0.8, 0);
textGradient.addColorStop(0, '#EC4899');
textGradient.addColorStop(0.5, '#A855F7');
textGradient.addColorStop(1, '#06B6D4');

ctx.fillStyle = textGradient;
ctx.font = `${size * 0.14}px Pacifico`;
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Covibe', size / 2, size * 0.91);

writeFileSync('/Users/souf/Downloads/files/splash.png', canvas.toBuffer('image/png'));
console.log('✅ Splash généré');

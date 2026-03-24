import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const size = 2732;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Fond violet foncé
ctx.fillStyle = '#1e1040';
ctx.fillRect(0, 0, size, size);

// Vague centrée
const gradient = ctx.createLinearGradient(size*0.25, size*0.4, size*0.75, size*0.6);
gradient.addColorStop(0, '#EC4899');
gradient.addColorStop(0.5, '#A855F7');
gradient.addColorStop(1, '#06B6D4');

ctx.strokeStyle = gradient;
ctx.lineWidth = size * 0.055;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

const s = size / 1024;
const offset = size * 0.08;
ctx.beginPath();
ctx.moveTo(256*s - offset, 341*s + offset*0.5);
ctx.bezierCurveTo(256*s - offset, 341*s + offset*0.5, 341*s - offset, 256*s + offset*0.5, 426*s - offset, 341*s + offset*0.5);
ctx.bezierCurveTo(512*s - offset, 426*s + offset*0.5, 512*s - offset, 597*s + offset*0.5, 597*s - offset, 682*s + offset*0.5);
ctx.bezierCurveTo(682*s - offset, 768*s + offset*0.5, 768*s - offset, 682*s + offset*0.5, 768*s - offset, 682*s + offset*0.5);
ctx.stroke();

writeFileSync('/Users/souf/Downloads/files/splash.png', canvas.toBuffer('image/png'));
console.log('✅ Splash généré');

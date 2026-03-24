import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

const size = 1024;
const canvas = createCanvas(size, size);
const ctx = canvas.getContext('2d');

// Fond violet foncé
ctx.fillStyle = '#1e1040';
ctx.fillRect(0, 0, size, size);

// Gradient vague
const gradient = ctx.createLinearGradient(256, 341, 768, 682);
gradient.addColorStop(0, '#EC4899');
gradient.addColorStop(0.5, '#A855F7');
gradient.addColorStop(1, '#06B6D4');

ctx.strokeStyle = gradient;
ctx.lineWidth = 90;
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Path exact du Logo.jsx (M15 20 C15 20 20 15 25 20 C30 25 30 35 35 40 C40 45 45 40 45 40) scalé x17
ctx.beginPath();
ctx.moveTo(256, 341);
ctx.bezierCurveTo(256, 341, 341, 256, 426, 341);
ctx.bezierCurveTo(512, 426, 512, 597, 597, 682);
ctx.bezierCurveTo(682, 768, 768, 682, 768, 682);
ctx.stroke();

writeFileSync('/Users/souf/Downloads/files/covibe-icon-1024.png', canvas.toBuffer('image/png'));
console.log('✅ Icône générée');

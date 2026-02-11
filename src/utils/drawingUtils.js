import { HAND_CONNECTIONS } from '@mediapipe/hands';

export const drawCanvasManual = (ctx, landmarks, width, height) => {
  // 1. Gambar Garis (Tulang)
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)'; // Warna Cyan Neon
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [start, end] of HAND_CONNECTIONS) {
    const p1 = landmarks[start];
    const p2 = landmarks[end];
    
    // Konversi koordinat normalisasi (0-1) ke piksel canvas
    const x1 = p1.x * width;
    const y1 = p1.y * height;
    const x2 = p2.x * width;
    const y2 = p2.y * height;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // 2. Gambar Titik (Sendi)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0ea5e9'; // Biru laut
  ctx.lineWidth = 1;

  for (const point of landmarks) {
    const x = point.x * width;
    const y = point.y * height;

    ctx.beginPath();
    ctx.arc(x, y, 3, 0, 2 * Math.PI); // Radius 3px
    ctx.fill();
    ctx.stroke();
  }
};
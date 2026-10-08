/**
 * Procedural Wooden Pottery Wheelhead Texture Generator
 * Creates authentic warm teak / dark oak wood grain with radial lathe rings
 */
export function createWoodTexture(): {
  colorTexture: HTMLCanvasElement;
  roughnessTexture: HTMLCanvasElement;
} {
  const width = 1024;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const rCanvas = document.createElement('canvas');
  rCanvas.width = width;
  rCanvas.height = height;
  const rCtx = rCanvas.getContext('2d')!;

  // Warm rich wood base (teak / walnut)
  const cx = width / 2;
  const cy = height / 2;

  // Radial wood gradient with concentric tree rings & lathe grooves
  ctx.fillStyle = '#533722';
  ctx.fillRect(0, 0, width, height);

  // Concentric wood rings
  ctx.save();
  for (let r = 10; r < width * 0.7; r += 3) {
    const ringWobble = Math.sin(r * 0.15) * 2;
    const alpha = 0.08 + Math.sin(r * 0.3) * 0.05;
    ctx.strokeStyle = r % 6 === 0 ? `rgba(40, 24, 14, ${alpha})` : `rgba(110, 75, 45, ${alpha})`;
    ctx.lineWidth = 2 + ringWobble;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Linear wood grain streaks across the planks
  for (let y = 0; y < height; y += 4) {
    const alpha = 0.03 + (Math.sin(y * 0.05) + 1) * 0.02;
    ctx.fillStyle = `rgba(32, 18, 10, ${alpha})`;
    ctx.fillRect(0, y, width, 2);
  }

  // Concentric potter's lathe guide grooves
  [180, 280, 380, 460].forEach((radius) => {
    ctx.strokeStyle = 'rgba(25, 14, 8, 0.45)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(140, 95, 60, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 2, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();

  // Roughness map: matte wooden surface with slight variation
  rCtx.fillStyle = '#b09580';
  rCtx.fillRect(0, 0, width, height);
  const rImg = rCtx.getImageData(0, 0, width, height);
  const rData = rImg.data;
  for (let i = 0; i < rData.length; i += 4) {
    const noise = (Math.random() - 0.5) * 30;
    const val = Math.min(255, Math.max(100, 180 + noise));
    rData[i] = val;
    rData[i + 1] = val;
    rData[i + 2] = val;
  }
  rCtx.putImageData(rImg, 0, 0);

  return { colorTexture: canvas, roughnessTexture: rCanvas };
}

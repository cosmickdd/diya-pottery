/**
 * Photorealistic Mitti Soil & Terracotta Texture Generator
 * Captures authentic wet riverbed clay (चिकनी मिट्टी) and fired terracotta (पक्की मिट्टी)
 * Inspired by high-fidelity tactile pottery in "Let's Create! Pottery 2":
 * - Natural wet soil grey-brown / taupe tone with subtle earthen warmth
 * - Fine concentric throwing striations from potter's fingers
 * - Natural porous slip micro-grain and sand grit
 * - Soft diffuse scattering and matte finish
 */

export class MittiTextureGenerator {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public normalCanvas: HTMLCanvasElement;
  public normalCtx: CanvasRenderingContext2D;

  public roughnessCanvas: HTMLCanvasElement;
  public roughnessCtx: CanvasRenderingContext2D;

  public width: number = 2048;
  public height: number = 2048;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    this.normalCanvas = document.createElement('canvas');
    this.normalCanvas.width = this.width;
    this.normalCanvas.height = this.height;
    this.normalCtx = this.normalCanvas.getContext('2d', { willReadFrequently: true })!;

    this.roughnessCanvas = document.createElement('canvas');
    this.roughnessCanvas.width = this.width;
    this.roughnessCanvas.height = this.height;
    this.roughnessCtx = this.roughnessCanvas.getContext('2d', { willReadFrequently: true })!;

    this.generateRawMitti();
  }

  /**
   * Generates authentic wet raw mitti (grey-brown / khaki riverbed soil)
   */
  public generateRawMitti() {
    const { ctx, width, height } = this;

    // 1. Natural Wet Grey-Brown Riverbed Soil (Chikni Mitti)
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#857766');    // Inner basin floor
    grad.addColorStop(0.25, '#998b7a');  // Inner wall
    grad.addColorStop(0.50, '#a89a89');  // Rim top highlight
    grad.addColorStop(0.75, '#968877');  // Outer voluptuous belly
    grad.addColorStop(1.0, '#7d7060');   // Foot base
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle natural color variegation
    ctx.fillStyle = 'rgba(150, 134, 115, 0.35)';
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 20 + Math.random() * 80;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Delicate concentric finger throwing striations (potter's touch lines)
    for (let y = 0; y < height; y += 4) {
      const alpha = 0.05 + Math.sin(y * 0.12) * 0.035;
      ctx.fillStyle = y % 8 === 0 ? `rgba(60, 52, 43, ${alpha})` : `rgba(205, 195, 180, ${alpha})`;
      ctx.fillRect(0, y, width, 2);
    }

    this.buildNormalAndRoughness(0.72);
  }

  /**
   * Generates rich fired terracotta earthenware (Pakki Mitti)
   */
  public generateFiredTerracotta() {
    const { ctx, width, height } = this;

    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#ad522d');    // Deep warm burnt terracotta basin
    grad.addColorStop(0.30, '#be6239');  // Warm terracotta inner wall
    grad.addColorStop(0.52, '#d4764b');  // Golden rim warmth
    grad.addColorStop(0.78, '#b85c34');  // Outer belly
    grad.addColorStop(1.0, '#9e4624');   // Kiln-darkened foot
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Warm earthen specks
    ctx.fillStyle = 'rgba(235, 155, 110, 0.2)';
    for (let i = 0; i < 300; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = 15 + Math.random() * 50;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let y = 0; y < height; y += 4) {
      const alpha = 0.04 + Math.sin(y * 0.14) * 0.03;
      ctx.fillStyle = y % 8 === 0 ? `rgba(90, 35, 15, ${alpha})` : `rgba(245, 185, 150, ${alpha})`;
      ctx.fillRect(0, y, width, 2);
    }

    this.buildNormalAndRoughness(0.64);
  }

  private buildNormalAndRoughness(baseRoughness: number) {
    const { ctx, normalCtx, roughnessCtx, width, height } = this;

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const nImg = normalCtx.createImageData(width, height);
    const nData = nImg.data;

    const rImg = roughnessCtx.createImageData(width, height);
    const rData = rImg.data;

    const rBaseInt = Math.round(baseRoughness * 255);

    for (let i = 0; i < data.length; i += 4) {
      // Mineral clay sand grain
      const grain = (Math.random() - 0.5) * 8;
      data[i] = Math.min(255, Math.max(0, data[i] + grain));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.9));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.8));

      // Normal map with horizontal throwing groove perturbance
      const yCoord = Math.floor((i / 4) / width);
      const groove = Math.sin(yCoord * 0.25) * 4;
      const nx = 128 + Math.round((Math.random() - 0.5) * 8);
      const ny = 128 + Math.round(groove + (Math.random() - 0.5) * 8);
      nData[i] = nx;
      nData[i + 1] = ny;
      nData[i + 2] = 255;
      nData[i + 3] = 255;

      // Roughness map (matte porous earthenware)
      const rVal = Math.min(255, Math.max(120, rBaseInt + Math.round((Math.random() - 0.5) * 16)));
      rData[i] = rVal;
      rData[i + 1] = rVal;
      rData[i + 2] = rVal;
      rData[i + 3] = 255;
    }

    ctx.putImageData(imgData, 0, 0);
    normalCtx.putImageData(nImg, 0, 0);
    roughnessCtx.putImageData(rImg, 0, 0);
  }
}

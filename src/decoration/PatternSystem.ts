/**
 * Pattern and Texture Generation System for the Reference Diya
 * Maps cleanly onto (U, V) parametric coordinates:
 * - V in [0, 0.28]: Inner Basin (Lotus Mandala)
 * - V in [0.28, 0.46]: Inner wall
 * - V in [0.46, 0.54]: Rounded rim (Gold rim & red dots)
 * - V in [0.54, 0.82]: Outer wall & belly (Front chevron crest, medallion, curved side bands)
 * - V in [0.82, 1.0]: Base / foot
 *
 * U in [0, 1] maps around azimuth:
 * - U = 0.25 corresponds to front (+Z)
 */

export class TexturePainter {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public bumpCanvas: HTMLCanvasElement;
  public bumpCtx: CanvasRenderingContext2D;
  public width: number = 2048;
  public height: number = 2048;

  // History for undo / redo
  private historyStack: ImageData[] = [];
  private historyIndex: number = -1;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Failed to get 2D context for canvas');
    this.ctx = ctx;

    this.bumpCanvas = document.createElement('canvas');
    this.bumpCanvas.width = this.width;
    this.bumpCanvas.height = this.height;
    const bCtx = this.bumpCanvas.getContext('2d', { willReadFrequently: true });
    if (!bCtx) throw new Error('Failed to get 2D context for bump canvas');
    this.bumpCtx = bCtx;

    this.resetToBaseClay('#b85434'); // Warm raw mitti terracotta
  }

  public saveSnapshot() {
    if (this.historyStack.length > 10) {
      this.historyStack.shift();
      this.historyIndex--;
    }
    const data = this.ctx.getImageData(0, 0, this.width, this.height);
    this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    this.historyStack.push(data);
    this.historyIndex++;
  }

  public undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.ctx.putImageData(this.historyStack[this.historyIndex], 0, 0);
      return true;
    }
    return false;
  }

  public redo(): boolean {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      this.ctx.putImageData(this.historyStack[this.historyIndex], 0, 0);
      return true;
    }
    return false;
  }

  /**
   * Resets texture to organic raw terracotta with subtle grain
   */
  public resetToBaseClay(baseColor: string = '#b85434') {
    const { ctx, bumpCtx, width, height } = this;

    // Fill base terracotta
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, width, height);

    // Subtle organic clay grain & potter hand marks
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Bump canvas starts mid-gray
    bumpCtx.fillStyle = '#808080';
    bumpCtx.fillRect(0, 0, width, height);
    const bData = bumpCtx.getImageData(0, 0, width, height);
    const bPixels = bData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 12;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.8));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));

      const bVal = Math.min(255, Math.max(0, 128 + noise * 2));
      bPixels[i] = bVal;
      bPixels[i + 1] = bVal;
      bPixels[i + 2] = bVal;
    }

    ctx.putImageData(imgData, 0, 0);
    bumpCtx.putImageData(bData, 0, 0);
    this.saveSnapshot();
  }

  /**
   * Applies the complete authoritative reference decoration from diya.png:
   * 1. Glazed Temple Red & Terracotta dual tone
   * 2. Outer golden rim with circular red insets
   * 3. Front chevron crest with golden borders and medallion
   * 4. Inner basin radial Lotus Mandala with multi-tiered gold & crimson petals
   * 5. Sweeping curved golden bands along the front sides
   */
  public applyReferenceDecoration() {
    this.saveSnapshot();
    const { ctx, width, height } = this;

    // 1. Base glaze: Rich deep Indian temple red on outer body & inner basin
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#5a1309'); // Dark center basin
    gradient.addColorStop(0.25, '#9e2213'); // Vibrant crimson floor
    gradient.addColorStop(0.46, '#7e1b0e'); // Inner wall
    gradient.addColorStop(0.48, '#e6a827'); // Rim transition
    gradient.addColorStop(0.54, '#f3be3a'); // Top rim gold base
    gradient.addColorStop(0.58, '#8c1c0e'); // Outer wall top
    gradient.addColorStop(0.75, '#b02715'); // Outer belly red
    gradient.addColorStop(1.0, '#4a0e06'); // Lower foot
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 2. INNER BASIN LOTUS MANDALA (V in 0..0.28)
    this.drawInnerLotusMandala();

    // 3. OUTER RIM (V in 0.46..0.54)
    this.drawRimPattern();

    // 4. FRONT CHEVRON CREST, MEDALLION, AND SIDE BANDS (U ~ 0.25, V in 0.54..0.85)
    this.drawFrontOrnamentation();

    // Update bump map corresponding to gold embossing
    this.updateBumpFromTexture();
  }

  /**
   * Draws the radial Lotus Mandala in the inner basin
   * In UV space, V represents radial distance from center (0 = center, 0.28 = outer rim of basin)
   */
  private drawInnerLotusMandala() {
    const { ctx, width, height } = this;
    const basinVEnd = height * 0.28;

    // Dark stippled center around wick (V in 0..0.06)
    const centerGrad = ctx.createLinearGradient(0, 0, 0, height * 0.08);
    centerGrad.addColorStop(0, '#1c0804');
    centerGrad.addColorStop(0.5, '#42140a');
    centerGrad.addColorStop(1, '#822010');
    ctx.fillStyle = centerGrad;
    ctx.fillRect(0, 0, width, height * 0.08);

    // Fine radial stipple / sunburst lines around center
    ctx.save();
    ctx.strokeStyle = '#d48a28';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < width; x += 4) {
      const lineLen = (height * 0.04) + Math.sin(x * 0.1) * 15;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, lineLen);
      ctx.stroke();
    }
    ctx.restore();

    // Inner gold ring border (V ~ 0.08)
    ctx.fillStyle = '#f5c842';
    ctx.fillRect(0, height * 0.076, width, height * 0.012);

    // TIER 1: Inner sharp pointed lotus petals (16 petals around circumference)
    const petalsTier1 = 16;
    const petalW1 = width / petalsTier1;
    const vStart1 = height * 0.088;
    const vEnd1 = height * 0.18;

    for (let p = 0; p < petalsTier1; p++) {
      const x0 = p * petalW1;
      const xMid = x0 + petalW1 * 0.5;
      const x1 = x0 + petalW1;

      // Outer gold petal contour
      ctx.fillStyle = '#f5be34';
      ctx.beginPath();
      ctx.moveTo(x0, vStart1);
      ctx.quadraticCurveTo(x0 + petalW1 * 0.1, (vStart1 + vEnd1) * 0.5, xMid, vEnd1);
      ctx.quadraticCurveTo(x1 - petalW1 * 0.1, (vStart1 + vEnd1) * 0.5, x1, vStart1);
      ctx.closePath();
      ctx.fill();

      // Inner crimson core of petal
      ctx.fillStyle = '#aa1f12';
      ctx.beginPath();
      ctx.moveTo(x0 + petalW1 * 0.2, vStart1);
      ctx.quadraticCurveTo(x0 + petalW1 * 0.25, (vStart1 + vEnd1) * 0.5, xMid, vEnd1 - height * 0.02);
      ctx.quadraticCurveTo(x1 - petalW1 * 0.25, (vStart1 + vEnd1) * 0.5, x1 - petalW1 * 0.2, vStart1);
      ctx.closePath();
      ctx.fill();

      // Fine golden vein in petal center
      ctx.strokeStyle = '#ffd86b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xMid, vStart1);
      ctx.lineTo(xMid, vEnd1 - height * 0.02);
      ctx.stroke();
    }

    // TIER 2: Outer wide radiating lotus petals (offset by half petal width)
    const petalsTier2 = 16;
    const petalW2 = width / petalsTier2;
    const vStart2 = height * 0.15;
    const vEnd2 = basinVEnd;

    for (let p = 0; p < petalsTier2; p++) {
      const x0 = p * petalW2 + petalW2 * 0.5;
      const xMid = x0 + petalW2 * 0.5;
      const x1 = x0 + petalW2;

      ctx.fillStyle = '#f3a826';
      ctx.beginPath();
      ctx.moveTo(x0 % width, vStart2);
      ctx.quadraticCurveTo((x0 + petalW2 * 0.1) % width, (vStart2 + vEnd2) * 0.55, xMid % width, vEnd2);
      ctx.quadraticCurveTo((x1 - petalW2 * 0.1) % width, (vStart2 + vEnd2) * 0.55, x1 % width, vStart2);
      ctx.closePath();
      ctx.fill();

      // Outline in gold highlight
      ctx.strokeStyle = '#ffe48a';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Subtle crimson inner flame
      ctx.fillStyle = '#b72212';
      ctx.beginPath();
      ctx.moveTo((x0 + petalW2 * 0.25) % width, vStart2);
      ctx.quadraticCurveTo((x0 + petalW2 * 0.3) % width, (vStart2 + vEnd2) * 0.5, xMid % width, vEnd2 - height * 0.03);
      ctx.quadraticCurveTo((x1 - petalW2 * 0.3) % width, (vStart2 + vEnd2) * 0.5, (x1 - petalW2 * 0.25) % width, vStart2);
      ctx.closePath();
      ctx.fill();
    }
  }

  /**
   * Draws the outer rounded rim pattern:
   * Thick golden band with repeating circular red dot insets
   */
  private drawRimPattern() {
    const { ctx, width, height } = this;
    const rimVStart = height * 0.46;
    const rimVEnd = height * 0.54;
    const rimHeight = rimVEnd - rimVStart;

    // Solid rich gold band across the rim
    const rimGrad = ctx.createLinearGradient(0, rimVStart, 0, rimVEnd);
    rimGrad.addColorStop(0, '#e59e22');
    rimGrad.addColorStop(0.5, '#ffd24d');
    rimGrad.addColorStop(1, '#cb8512');
    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, rimVStart, width, rimHeight);

    // Outer and inner thin dark borders
    ctx.fillStyle = '#6b1308';
    ctx.fillRect(0, rimVStart, width, 4);
    ctx.fillRect(0, rimVEnd - 4, width, 4);

    // Repeating circular red dots along the center of the rim band
    const numDots = 48;
    const dotSpacing = width / numDots;
    const dotCenterY = rimVStart + rimHeight * 0.5;
    const dotRadius = rimHeight * 0.22;

    for (let d = 0; d < numDots; d++) {
      const dotX = d * dotSpacing + dotSpacing * 0.5;

      // Red inner circle
      ctx.fillStyle = '#a01a0e';
      ctx.beginPath();
      ctx.arc(dotX, dotCenterY, dotRadius, 0, Math.PI * 2);
      ctx.fill();

      // Dark red outline
      ctx.strokeStyle = '#5a0c05';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tiny golden center pip
      ctx.fillStyle = '#ffe894';
      ctx.beginPath();
      ctx.arc(dotX, dotCenterY, dotRadius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draws the front chevron crest, central medallion, and curved side bands
   * Front center (+Z) is at U = 0.25
   */
  private drawFrontOrnamentation() {
    const { ctx, width, height } = this;
    const frontU = 0.25;
    const centerX = width * frontU;
    const crestTopV = height * 0.53;
    const crestPeakV = height * 0.62;
    const crestBottomV = height * 0.84;
    const crestWidth = width * 0.22; // Covers ~80 degrees across front

    ctx.save();

    // 1. DOWNWARD CHEVRON CREST (Pointed triangle apex pointing downward)
    ctx.beginPath();
    ctx.moveTo(centerX - crestWidth * 0.5, crestTopV);
    ctx.lineTo(centerX + crestWidth * 0.5, crestTopV);
    ctx.lineTo(centerX, crestPeakV);
    ctx.closePath();

    // Crimson fill with gold border
    ctx.fillStyle = '#9e1c0e';
    ctx.fill();

    ctx.strokeStyle = '#f3be3a';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Inner gold chevron line
    ctx.strokeStyle = '#ffd86b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX - crestWidth * 0.4, crestTopV + 8);
    ctx.lineTo(centerX + crestWidth * 0.4, crestTopV + 8);
    ctx.lineTo(centerX, crestPeakV - 6);
    ctx.closePath();
    ctx.stroke();

    // 2. CENTRAL FRONT MEDALLION (V in 0.66..0.82)
    const medallionCenterY = (crestPeakV + crestBottomV) * 0.5;
    const medallionRadius = (crestBottomV - crestPeakV) * 0.38;

    // Radiating petals around the medallion
    const numMedallionPetals = 12;
    for (let i = 0; i < numMedallionPetals; i++) {
      const angle = (i / numMedallionPetals) * Math.PI * 2;
      const px = centerX + Math.cos(angle) * medallionRadius * 1.5;
      const py = medallionCenterY + Math.sin(angle) * medallionRadius * 1.5;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(angle + Math.PI / 2);

      // Gold petal
      ctx.fillStyle = '#f5be34';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 36, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a0d05';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Fine concentric leaf lines inside petal
      ctx.strokeStyle = '#7c1809';
      ctx.lineWidth = 1.5;
      for (let r = 8; r <= 24; r += 7) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Outer golden concentric ring
    ctx.fillStyle = '#f5be34';
    ctx.beginPath();
    ctx.arc(centerX, medallionCenterY, medallionRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5c1007';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Middle deep red ring
    ctx.fillStyle = '#9e1c0e';
    ctx.beginPath();
    ctx.arc(centerX, medallionCenterY, medallionRadius * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Inner glowing golden/amber core
    const coreGrad = ctx.createRadialGradient(
      centerX, medallionCenterY, 2,
      centerX, medallionCenterY, medallionRadius * 0.45
    );
    coreGrad.addColorStop(0, '#fff4b8');
    coreGrad.addColorStop(0.4, '#f5be34');
    coreGrad.addColorStop(1, '#c46a0e');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(centerX, medallionCenterY, medallionRadius * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Center golden pip ring
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, medallionCenterY, medallionRadius * 0.18, 0, Math.PI * 2);
    ctx.stroke();

    // 3. SWEEPING CURVED GOLDEN BANDS FLANKING THE CREST
    // Left sweeping bands (flowing towards U = 0.1)
    // Right sweeping bands (flowing towards U = 0.4)
    this.drawSweepingBand(centerX - crestWidth * 0.5, crestPeakV, -width * 0.18, 60);
    this.drawSweepingBand(centerX + crestWidth * 0.5, crestPeakV, width * 0.18, 60);

    ctx.restore();
  }

  private drawSweepingBand(startX: number, startY: number, deltaX: number, bandHeight: number) {
    const { ctx } = this;
    ctx.save();

    for (let b = 0; b < 3; b++) {
      const yOffset = b * (bandHeight * 0.35);
      const grad = ctx.createLinearGradient(startX, startY + yOffset, startX + deltaX, startY + yOffset + 50);
      grad.addColorStop(0, '#f5be34');
      grad.addColorStop(0.5, '#ffd86b');
      grad.addColorStop(1, '#c27912');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 12 - b * 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY + yOffset);
      ctx.quadraticCurveTo(
        startX + deltaX * 0.4, startY + yOffset + 40,
        startX + deltaX, startY + yOffset + 25
      );
      ctx.stroke();

      // Dark edge border
      ctx.strokeStyle = '#5a0d05';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Updates bump canvas to provide raised specular relief for gold details
   */
  private updateBumpFromTexture() {
    const { ctx, bumpCtx, width, height } = this;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    const bImg = bumpCtx.getImageData(0, 0, width, height);
    const bData = bImg.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Gold colors have high R, high G, low B (e.g. R>200, G>160, B<100)
      const isGold = r > 180 && g > 130 && b < 120;
      let elevation = 128;
      if (isGold) {
        elevation = 210; // Raised gold embossing
      } else if (r > 120 && g < 50) {
        elevation = 145; // Subtle glaze height
      }

      bData[i] = elevation;
      bData[i + 1] = elevation;
      bData[i + 2] = elevation;
    }

    bumpCtx.putImageData(bImg, 0, 0);
  }

  /**
   * Paints a dab/stroke onto the canvas at UV coordinates (u, v)
   */
  public paintAtUV(
    u: number,
    v: number,
    color: string,
    brushSize: number = 30,
    opacity: number = 1.0,
    symmetry: boolean = true
  ) {
    const { width, height } = this;
    const x = ((u % 1 + 1) % 1) * width;
    const y = Math.max(0, Math.min(1, v)) * height;

    this.drawBrushDab(x, y, color, brushSize, opacity);

    // Bilateral symmetry around front (u = 0.25):
    // symU = 0.5 - u (since front is 0.25)
    if (symmetry) {
      let symU = 0.5 - u;
      symU = (symU % 1 + 1) % 1;
      const symX = symU * width;
      this.drawBrushDab(symX, y, color, brushSize, opacity);
    }
  }

  private drawBrushDab(x: number, y: number, color: string, size: number, opacity: number) {
    const { ctx } = this;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;

    // Soft feathered brush
    const rad = ctx.createRadialGradient(x, y, 0, x, y, size);
    rad.addColorStop(0, color);
    rad.addColorStop(0.7, color);
    rad.addColorStop(1, 'transparent');
    ctx.fillStyle = rad;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Places a motif stamp (e.g. Lotus, Bead Dot, Sun) at UV (u, v)
   */
  public stampAtUV(
    u: number,
    v: number,
    stampType: 'lotus' | 'dot' | 'mandala',
    color: string = '#ffd24d',
    size: number = 40,
    symmetry: boolean = true
  ) {
    this.saveSnapshot();
    const { width, height } = this;
    const x = ((u % 1 + 1) % 1) * width;
    const y = Math.max(0, Math.min(1, v)) * height;

    this.drawStamp(x, y, stampType, color, size);

    if (symmetry) {
      let symU = 0.5 - u;
      symU = (symU % 1 + 1) % 1;
      const symX = symU * width;
      this.drawStamp(symX, y, stampType, color, size);
    }
  }

  private drawStamp(x: number, y: number, stampType: string, color: string, size: number) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);

    if (stampType === 'dot') {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a0d05';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-size * 0.15, -size * 0.15, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (stampType === 'lotus') {
      ctx.fillStyle = color;
      for (let p = 0; p < 8; p++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.3, size * 0.5, 0, size);
        ctx.quadraticCurveTo(-size * 0.3, size * 0.5, 0, 0);
        ctx.fill();
      }
      ctx.fillStyle = '#a01a0e';
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Mandala sun
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#e59e22';
      ctx.lineWidth = 3;
      for (let r = 0; r < 12; r++) {
        ctx.rotate((Math.PI * 2) / 12);
        ctx.beginPath();
        ctx.moveTo(0, size * 0.4);
        ctx.lineTo(0, size * 0.8);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

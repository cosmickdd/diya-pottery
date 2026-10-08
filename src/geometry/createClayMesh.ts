import * as THREE from 'three';
import type { ShapeSubStep, ThreeStepStageId } from '../types/pottery';

export const RADIAL_SEGMENTS = 96;
export const PROFILE_SEGMENTS = 64;

export interface ClayMeshTopology {
  geometry: THREE.BufferGeometry;
  basePositions: Float32Array;
  profileSegments: number;
  radialSegments: number;
}

/**
 * Computes profile (radius r, height y) along the clay cross-section.
 * Follows the authentic physical steps of wheel-throwing traditional pottery:
 *  1. lump: Centered moist mound of clay on the wheelhead
 *  2. opened: Potter's thumbs press down into the center, opening the inner core
 *  3. raised: Potter pulls the clay upward, raising the walls into a deep cup
 *  4. flared: Outward curve of the bowl and rolling of the thick rounded rim
 *  5. wide_crest / diya: Artisan pinching of the front wick spout (चोंच) & downward chevron apron
 */
export function getClayProfile(
  t: number,
  phi: number,
  _stage: ThreeStepStageId,
  subStep: ShapeSubStep | 'opened' | 'raised' | 'flared'
): { r: number; y: number } {
  const sinPhi = Math.sin(phi);
  const frontWeight = Math.max(0, sinPhi);
  const frontCrestIntensity = Math.pow(frontWeight, 3.6);

  // 1. RAW MITTI LUMP: Moist organic mound centered on wheelhead
  if (subStep === 'lump') {
    if (t < 0.25) {
      const p = t / 0.25;
      const r = (0.03 + 0.30 * Math.sin(p * Math.PI * 0.5)) * 0.88;
      const y = 0.77 - 0.08 * (p * p);
      return { r, y };
    } else if (t < 0.55) {
      const p = (t - 0.25) / 0.30;
      const r = (0.33 + 0.22 * Math.sin(p * Math.PI * 0.5)) * 0.88;
      const y = 0.69 - 0.25 * p;
      return { r, y };
    } else {
      const p = (t - 0.55) / 0.45;
      const r = (0.55 + 0.12 * Math.sin(p * Math.PI * 0.5)) * 0.88;
      const y = 0.44 * (1 - p);
      return { r, y: Math.max(0.012, y) };
    }
  }

  // 2. OPENED CORE: Thumbs sink into the center, creating the deep well
  if (subStep === 'opened') {
    if (t < 0.25) {
      const p = t / 0.25;
      const r = 0.02 + 0.30 * p;
      const y = 0.22 + 0.08 * (p * p);
      return { r, y };
    } else if (t < 0.50) {
      const p = (t - 0.25) / 0.25;
      const r = 0.32 + 0.24 * Math.sin(p * Math.PI * 0.5);
      const y = 0.30 + 0.32 * p;
      return { r, y };
    } else if (t < 0.60) {
      const p = (t - 0.50) / 0.10;
      const r = 0.56 + 0.06 * p;
      const y = 0.62 + Math.sin(p * Math.PI) * 0.02;
      return { r, y };
    } else {
      const p = (t - 0.60) / 0.40;
      const r = 0.62 - 0.14 * p;
      const y = 0.62 * (1 - p);
      return { r, y: Math.max(0.012, y) };
    }
  }

  // 3. RAISED CYLINDER / BASIN: Walls pulled tall with uniform thickness
  if (subStep === 'raised' || subStep === 'basin') {
    if (t < 0.26) {
      const p = t / 0.26;
      const r = 0.02 + 0.36 * p;
      const y = 0.19 + 0.10 * (p * p);
      return { r, y };
    } else if (t < 0.50) {
      const p = (t - 0.26) / 0.24;
      const r = 0.38 + 0.22 * Math.sin(p * Math.PI * 0.5);
      const y = 0.29 + 0.41 * p;
      return { r, y };
    } else if (t < 0.58) {
      const p = (t - 0.50) / 0.08;
      const r = 0.60 + 0.08 * p;
      const y = 0.70 + Math.sin(p * Math.PI) * 0.03;
      return { r, y };
    } else {
      const p = (t - 0.58) / 0.42;
      const r = 0.68 - 0.22 * p;
      const y = 0.70 * (1 - p);
      return { r, y: Math.max(0.012, y) };
    }
  }

  // 4. FLARED BOWL & ROUNDED RIM: Symmetrical circular diya bowl before pinching spout
  if (subStep === 'flared') {
    const baseScale = 0.74;
    if (t < 0.28) {
      const p = t / 0.28;
      const r = (0.02 + 0.50 * p) * baseScale;
      const y = 0.18 + 0.12 * Math.pow(p, 1.7);
      return { r, y };
    } else if (t < 0.48) {
      const p = (t - 0.28) / 0.20;
      const r = (0.52 + 0.34 * Math.sin(p * Math.PI * 0.5)) * baseScale;
      const y = 0.30 + 0.40 * Math.sin(p * Math.PI * 0.5);
      return { r, y };
    } else if (t < 0.56) {
      const p = (t - 0.48) / 0.08;
      const rimArc = Math.sin(p * Math.PI);
      const r = (0.86 + 0.10 * p + rimArc * 0.05) * baseScale;
      const y = 0.70 + rimArc * 0.05;
      return { r, y };
    } else if (t < 0.84) {
      const p = (t - 0.56) / 0.28;
      const bellySwell = Math.sin(p * Math.PI * 0.8) * 0.10;
      const r = (0.96 - 0.48 * Math.pow(p, 1.2) + bellySwell) * baseScale;
      const y = 0.70 - 0.60 * p;
      return { r, y: Math.max(0.015, y) };
    } else {
      const p = (t - 0.84) / 0.16;
      const r = (0.48 - 0.10 * p) * baseScale * 0.85;
      const y = 0.10 * (1 - p);
      return { r, y: Math.max(0.012, y) };
    }
  }

  // 5. AUTHENTIC HANDCRAFTED DIYA (Pinched spout, front chevron crest, and flared apron)
  const cos2 = Math.cos(phi) * Math.cos(phi);
  const sin2 = Math.sin(phi) * Math.sin(phi);
  const ovalFactor = Math.sqrt(1.08 * cos2 + 0.94 * sin2);

  const baseScale = ovalFactor * 0.76;
  const rimDip = frontCrestIntensity * 0.14;       // Downward V-notch at front rim
  const frontSpout = frontCrestIntensity * 0.14;   // Subtle front spout projection

  if (t < 0.28) {
    // A. DEEP INNER OIL BASIN FLOOR (floor at y = 0.18)
    const p = t / 0.28;
    const centerBoss = p < 0.30 ? 0.025 * (1 - p / 0.30) : 0;
    const r = (0.02 + 0.52 * p) * baseScale;
    const y = 0.18 + 0.12 * Math.pow(p, 1.7) + centerBoss;
    return { r, y };
  } else if (t < 0.48) {
    // B. DEEP INNER WALL (curves up steeply to rolled rim lip)
    const p = (t - 0.28) / 0.20;
    const r = (0.54 + 0.34 * Math.sin(p * Math.PI * 0.5)) * baseScale;
    const y = 0.30 + 0.40 * Math.sin(p * Math.PI * 0.5) - rimDip * p;
    return { r, y };
  } else if (t < 0.56) {
    // C. THICK ROLLED ROUNDED RIM (doughnut lip bead)
    const p = (t - 0.48) / 0.08;
    const rimArc = Math.sin(p * Math.PI);
    const r = (0.88 + 0.10 * p + rimArc * 0.05) * baseScale + frontSpout;
    const y = 0.70 + rimArc * 0.05 - rimDip;
    return { r, y };
  } else if (t < 0.84) {
    // D. VOLUPTUOUS BULBOUS OUTER BELLY (curving out gracefully)
    const p = (t - 0.56) / 0.28;
    const frontShieldApron = frontCrestIntensity * Math.sin((1 - p) * Math.PI * 0.5) * 0.20;
    const bellySwell = Math.sin(p * Math.PI * 0.8) * 0.12;
    const r = (0.98 - 0.50 * Math.pow(p, 1.2) + bellySwell) * baseScale + frontShieldApron;
    const y = (0.70 - 0.60 * p) - rimDip * (1 - p);
    return { r, y: Math.max(0.015, y) };
  } else {
    // E. STURDY ROUNDED BASE FOOT RESTING ON TURNTABLE
    const p = (t - 0.84) / 0.16;
    const r = (0.48 - 0.10 * p) * baseScale * 0.85;
    const y = 0.10 * (1 - p);
    return { r, y: Math.max(0.012, y) };
  }
}

export function createClayGeometry(
  stage: ThreeStepStageId = 'stage_01_shape',
  subStep: ShapeSubStep = 'lump',
  radialSegs: number = RADIAL_SEGMENTS,
  profileSegs: number = PROFILE_SEGMENTS
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const numVerts = (profileSegs + 1) * (radialSegs + 1);
  const positions = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);
  const indices: number[] = [];

  let vertIdx = 0;
  for (let i = 0; i <= profileSegs; i++) {
    const t = i / profileSegs;
    for (let j = 0; j <= radialSegs; j++) {
      const phi = (j / radialSegs) * Math.PI * 2;
      const { r, y } = getClayProfile(t, phi, stage, subStep);

      positions[vertIdx * 3] = r * Math.cos(phi);
      positions[vertIdx * 3 + 1] = y;
      positions[vertIdx * 3 + 2] = r * Math.sin(phi);

      uvs[vertIdx * 2] = j / radialSegs;
      uvs[vertIdx * 2 + 1] = t;

      vertIdx++;
    }
  }

  for (let i = 0; i < profileSegs; i++) {
    for (let j = 0; j < radialSegs; j++) {
      const a = i * (radialSegs + 1) + j;
      const b = (i + 1) * (radialSegs + 1) + j;
      const c = (i + 1) * (radialSegs + 1) + (j + 1);
      const d = i * (radialSegs + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  return geom;
}

export function getTargetPositions(
  stage: ThreeStepStageId,
  subStep: ShapeSubStep | 'opened' | 'raised' | 'flared',
  radialSegs: number = RADIAL_SEGMENTS,
  profileSegs: number = PROFILE_SEGMENTS
): Float32Array {
  const numVerts = (profileSegs + 1) * (radialSegs + 1);
  const positions = new Float32Array(numVerts * 3);

  let vertIdx = 0;
  for (let i = 0; i <= profileSegs; i++) {
    const t = i / profileSegs;
    for (let j = 0; j <= radialSegs; j++) {
      const phi = (j / radialSegs) * Math.PI * 2;
      const { r, y } = getClayProfile(t, phi, stage, subStep);

      positions[vertIdx * 3] = r * Math.cos(phi);
      positions[vertIdx * 3 + 1] = y;
      positions[vertIdx * 3 + 2] = r * Math.sin(phi);
      vertIdx++;
    }
  }

  return positions;
}

// 5 precomputed reference poses for authentic continuous pottery wheel throwing
let cachedLump: Float32Array | null = null;
let cachedOpened: Float32Array | null = null;
let cachedRaised: Float32Array | null = null;
let cachedFlared: Float32Array | null = null;
let cachedDiya: Float32Array | null = null;

function getCachedPoses() {
  if (!cachedLump) {
    cachedLump = getTargetPositions('stage_01_shape', 'lump');
    cachedOpened = getTargetPositions('stage_01_shape', 'opened');
    cachedRaised = getTargetPositions('stage_01_shape', 'raised');
    cachedFlared = getTargetPositions('stage_01_shape', 'flared');
    cachedDiya = getTargetPositions('stage_01_shape', 'wide_crest');
  }
  return {
    lump: cachedLump,
    opened: cachedOpened!,
    raised: cachedRaised!,
    flared: cachedFlared!,
    diya: cachedDiya!,
  };
}

/**
 * Computes positions at any continuous progress value in [0, 1] through the 5 authentic pottery stages:
 *  0.00 -> 0.25: Opening the core with potter's thumbs
 *  0.25 -> 0.55: Pulling clay up, raising walls into deep cylinder
 *  0.55 -> 0.80: Opening the voluptuous bowl & rolling the rim
 *  0.80 -> 1.00: Artisan pinching the front oil wick spout & downward chevron crest
 * 
 * Also supports tactile touch squish: subtle organic give and micro-ripple while user touches
 */
export function getContinuousClayPositions(
  progress: number,
  outPositions: Float32Array,
  isTouching: boolean = false,
  touchTime: number = 0
): void {
  const { lump, opened, raised, flared, diya } = getCachedPoses();
  const p = Math.max(0, Math.min(1, progress));

  let fromArr: Float32Array;
  let toArr: Float32Array;
  let segT: number;

  if (p < 0.25) {
    fromArr = lump;
    toArr = opened;
    segT = p / 0.25;
  } else if (p < 0.55) {
    fromArr = opened;
    toArr = raised;
    segT = (p - 0.25) / 0.30;
  } else if (p < 0.80) {
    fromArr = raised;
    toArr = flared;
    segT = (p - 0.55) / 0.25;
  } else {
    fromArr = flared;
    toArr = diya;
    segT = (p - 0.80) / 0.20;
  }

  // Smooth cubic ease for natural clay viscosity
  const ease = segT * segT * (3 - 2 * segT);

  for (let i = 0; i < outPositions.length; i++) {
    outPositions[i] = fromArr[i] + (toArr[i] - fromArr[i]) * ease;
  }

  // Tactile touch feedback: subtle soft clay pliability squish while user holds/touches
  if (isTouching && p < 1.0) {
    const squishIntensity = 0.009 * (1 - p * 0.4);
    const waveFreq = 8.0;
    const wavePhase = touchTime * 0.008;

    for (let i = 0; i < outPositions.length; i += 3) {
      const y = outPositions[i + 1];
      if (y > 0.25 && y < 0.72) {
        // Subtle organic radial breathing/squish along pliable wall
        const ripple = Math.sin(y * waveFreq + wavePhase) * squishIntensity;
        outPositions[i] += outPositions[i] * ripple;
        outPositions[i + 2] += outPositions[i + 2] * ripple;
      }
    }
  }
}

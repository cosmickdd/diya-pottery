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
 * Perfectly proportioned for mobile screens:
 *  - Fits comfortably within camera view without overflowing
 *  - Deep hemispherical bowl (height 0.72, max width 1.56, NOT a plate!)
 *  - Front downward chevron crest & apron matching diya.png
 *  - NO string/wick, NO flame
 */
export function getClayProfile(
  t: number,
  phi: number,
  stage: ThreeStepStageId,
  subStep: ShapeSubStep
): { r: number; y: number } {
  const sinPhi = Math.sin(phi);
  const frontWeight = Math.max(0, sinPhi);
  const frontCrestIntensity = Math.pow(frontWeight, 3.6);

  // 1. STAGE 1: SUB-STEPS ON THE POTTERY WHEEL
  if (stage === 'stage_01_shape') {
    if (subStep === 'lump') {
      // RAW MITTI LUMP: Organic rounded mound of moist clay centered on wheel
      const organicNoise = Math.sin(phi * 4) * 0.02 + Math.cos(phi * 3) * 0.015;
      if (t < 0.35) {
        const p = t / 0.35;
        const r = (0.04 + 0.38 * Math.sin(p * Math.PI * 0.5) + organicNoise) * 0.88;
        const y = 0.78 - 0.18 * (p * p);
        return { r, y };
      } else {
        const p = (t - 0.35) / 0.65;
        const r = (0.42 + 0.16 * Math.sin(p * Math.PI * 0.5) + organicNoise * (1 - p)) * 0.88;
        const y = 0.60 * (1 - p);
        return { r, y: Math.max(0.012, y) };
      }
    } else if (subStep === 'basin') {
      // HOLLOWED BASIN: Deep cylindrical cup with thick walls
      if (t < 0.28) {
        const p = t / 0.28;
        const r = 0.02 + 0.35 * p;
        const y = 0.20 + 0.10 * (p * p);
        return { r, y };
      } else if (t < 0.50) {
        const p = (t - 0.28) / 0.22;
        const r = 0.37 + 0.18 * Math.sin(p * Math.PI * 0.5);
        const y = 0.30 + 0.42 * p;
        return { r, y };
      } else if (t < 0.58) {
        const p = (t - 0.50) / 0.08;
        const r = 0.55 + 0.09 * p;
        const y = 0.72 + Math.sin(p * Math.PI) * 0.03;
        return { r, y };
      } else {
        const p = (t - 0.58) / 0.42;
        const r = 0.64 - 0.18 * p;
        const y = 0.72 * (1 - p);
        return { r, y: Math.max(0.012, y) };
      }
    }
  }

  // 2. COMPLETE AUTHENTIC DIYA GEOMETRY (Matching diya.png):
  // Voluptuous, deep hemispherical cup/bowl (height 0.72, max width 1.56)
  // With thick rolled rounded rim and signature downward V-chevron notch & front apron

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
  subStep: ShapeSubStep,
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

// Precomputed reference poses for ultra-fast continuous interpolation
let cachedLump: Float32Array | null = null;
let cachedBasin: Float32Array | null = null;
let cachedDiya: Float32Array | null = null;

function getCachedPoses() {
  if (!cachedLump) {
    cachedLump = getTargetPositions('stage_01_shape', 'lump');
    cachedBasin = getTargetPositions('stage_01_shape', 'basin');
    cachedDiya = getTargetPositions('stage_01_shape', 'wide_crest');
  }
  return { lump: cachedLump, basin: cachedBasin!, diya: cachedDiya! };
}

/**
 * Computes positions at any continuous progress value in [0, 1].
 * 0.0 = Raw Lump
 * 0.5 = Hollowed Basin
 * 1.0 = Complete Handcrafted Diya
 */
export function getContinuousClayPositions(progress: number, outPositions: Float32Array): void {
  const { lump, basin, diya } = getCachedPoses();
  const p = Math.max(0, Math.min(1, progress));

  if (p <= 0.5) {
    const t = p / 0.5;
    const ease = t * t * (3 - 2 * t);
    for (let i = 0; i < outPositions.length; i++) {
      outPositions[i] = lump[i] + (basin[i] - lump[i]) * ease;
    }
  } else {
    const t = (p - 0.5) / 0.5;
    const ease = t * t * (3 - 2 * t);
    for (let i = 0; i < outPositions.length; i++) {
      outPositions[i] = basin[i] + (diya[i] - basin[i]) * ease;
    }
  }
}

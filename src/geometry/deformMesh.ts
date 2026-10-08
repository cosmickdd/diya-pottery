import * as THREE from 'three';
import type { BrushSettings } from '../types/pottery';
import { smoothVertexNeighborhood } from './smoothing';
import { getSymmetricVertexIndex } from './symmetry';
import { RADIAL_SEGMENTS, PROFILE_SEGMENTS } from './createClayMesh';

export interface DeformationParams {
  geometry: THREE.BufferGeometry;
  intersectionPoint: THREE.Vector3;
  intersectionNormal: THREE.Vector3;
  dragVector?: THREE.Vector3;
  settings: BrushSettings;
}

export function applyBrushDeformation({
  geometry,
  intersectionPoint,
  intersectionNormal,
  dragVector,
  settings,
}: DeformationParams): void {
  const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = posAttr.array as Float32Array;
  const vertexCount = posAttr.count;

  const { type, radius, strength, symmetry } = settings;
  const radiusSq = radius * radius;

  // Track modified vertices for symmetry and smoothing
  const affectedIndices = new Set<number>();

  for (let i = 0; i < vertexCount; i++) {
    const idx = i * 3;
    const vx = positions[idx];
    const vy = positions[idx + 1];
    const vz = positions[idx + 2];

    const dx = vx - intersectionPoint.x;
    const dy = vy - intersectionPoint.y;
    const dz = vz - intersectionPoint.z;
    const distSq = dx * dx + dy * dy + dz * dz;

    if (distSq < radiusSq) {
      const dist = Math.sqrt(distSq);
      // Smoothstep falloff: 3p^2 - 2p^3
      const p = 1.0 - dist / radius;
      const falloff = p * p * (3.0 - 2.0 * p) * strength;

      applySingleVertexDeformation(positions, i, {
        type,
        falloff,
        normal: intersectionNormal,
        dragVector,
        hitPoint: intersectionPoint,
      });

      affectedIndices.add(i);

      if (symmetry) {
        const symIdx = getSymmetricVertexIndex(i, RADIAL_SEGMENTS);
        if (symIdx !== i) {
          applySingleVertexDeformation(positions, symIdx, {
            type,
            falloff,
            normal: new THREE.Vector3(-intersectionNormal.x, intersectionNormal.y, intersectionNormal.z),
            dragVector: dragVector ? new THREE.Vector3(-dragVector.x, dragVector.y, dragVector.z) : undefined,
            hitPoint: new THREE.Vector3(-intersectionPoint.x, intersectionPoint.y, intersectionPoint.z),
          });
          affectedIndices.add(symIdx);
        }
      }
    }
  }

  // If smoothing was requested, smooth the affected vertices
  if (type === 'smooth') {
    affectedIndices.forEach((idx) => {
      smoothVertexNeighborhood(positions, idx, strength * 0.4, RADIAL_SEGMENTS, PROFILE_SEGMENTS);
    });
  }

  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

interface VertexDeformContext {
  type: BrushSettings['type'];
  falloff: number;
  normal: THREE.Vector3;
  dragVector?: THREE.Vector3;
  hitPoint: THREE.Vector3;
}

function applySingleVertexDeformation(
  positions: Float32Array,
  vertIndex: number,
  ctx: VertexDeformContext
) {
  const rowSize = RADIAL_SEGMENTS + 1;
  const ring = Math.floor(vertIndex / rowSize);

  // Preserve base ring anchored to the wheel
  if (ring >= PROFILE_SEGMENTS) return;

  const idx = vertIndex * 3;
  const vx = positions[idx];
  const vy = positions[idx + 1];
  const vz = positions[idx + 2];

  const { type, falloff, normal, dragVector } = ctx;

  switch (type) {
    case 'push': {
      // Push inward along normal or downward in central floor
      if (vy < 0.5 && ring < 25) {
        // Floor depression
        positions[idx + 1] = Math.max(0.04, vy - falloff * 0.12);
      } else {
        positions[idx] -= normal.x * falloff * 0.08;
        positions[idx + 1] = Math.max(0.04, vy - normal.y * falloff * 0.08);
        positions[idx + 2] -= normal.z * falloff * 0.08;
      }
      break;
    }

    case 'pull': {
      // Pull outward along normal or follow drag direction
      if (dragVector && dragVector.lengthSq() > 0.0001) {
        positions[idx] += dragVector.x * falloff * 0.15;
        positions[idx + 1] = Math.max(0.04, vy + dragVector.y * falloff * 0.15);
        positions[idx + 2] += dragVector.z * falloff * 0.15;
      } else {
        positions[idx] += normal.x * falloff * 0.08;
        positions[idx + 1] = Math.max(0.04, vy + normal.y * falloff * 0.08);
        positions[idx + 2] += normal.z * falloff * 0.08;
      }
      break;
    }

    case 'inflate': {
      // Push outward horizontally from Y-axis
      const currentRadius = Math.sqrt(vx * vx + vz * vz);
      if (currentRadius > 0.05) {
        const nx = vx / currentRadius;
        const nz = vz / currentRadius;
        positions[idx] += nx * falloff * 0.08;
        positions[idx + 2] += nz * falloff * 0.08;
      }
      break;
    }

    case 'flatten': {
      // Compress towards hit height or plane
      const targetY = ctx.hitPoint.y;
      positions[idx + 1] = vy + (targetY - vy) * falloff * 0.3;
      break;
    }

    case 'rim': {
      // Rim curling: if on upper rings, round outwards and downward
      if (ring >= 28 && ring <= 40) {
        const r = Math.sqrt(vx * vx + vz * vz);
        if (r > 0.1) {
          positions[idx] += (vx / r) * falloff * 0.04;
          positions[idx + 2] += (vz / r) * falloff * 0.04;
        }
        positions[idx + 1] = Math.max(0.04, vy - falloff * 0.03);
      }
      break;
    }

    case 'front': {
      // Front pull: pull forward (+Z) and downward (-Y) specifically for the crest
      if (vz > 0.3) {
        positions[idx + 1] = Math.max(0.04, vy - falloff * 0.1);
        positions[idx + 2] += falloff * 0.12;
      }
      break;
    }

    case 'smooth': {
      // Handled via neighborhood smoothing
      break;
    }
  }
}

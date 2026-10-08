import { RADIAL_SEGMENTS, PROFILE_SEGMENTS } from './createClayMesh';

/**
 * Applies Laplacian smoothing around a vertex index or across a selected region
 */
export function smoothVertexNeighborhood(
  positions: Float32Array,
  vertIndex: number,
  factor: number = 0.25,
  radialSegs: number = RADIAL_SEGMENTS,
  profileSegs: number = PROFILE_SEGMENTS
): void {
  const rowSize = radialSegs + 1;
  const ring = Math.floor(vertIndex / rowSize);
  const sector = vertIndex % rowSize;

  // Don't modify bottom wheel contact ring (ring === profileSegs)
  if (ring >= profileSegs) return;

  const idx = vertIndex * 3;
  const curX = positions[idx];
  const curY = positions[idx + 1];
  const curZ = positions[idx + 2];

  let sumX = 0;
  let sumY = 0;
  let sumZ = 0;
  let count = 0;

  // Neighbors: left and right (wrap sector around circumference)
  const leftSector = sector === 0 ? radialSegs - 1 : sector - 1;
  const rightSector = sector >= radialSegs ? 1 : sector + 1;

  const leftIdx = (ring * rowSize + leftSector) * 3;
  const rightIdx = (ring * rowSize + rightSector) * 3;

  sumX += positions[leftIdx] + positions[rightIdx];
  sumY += positions[leftIdx + 1] + positions[rightIdx + 1];
  sumZ += positions[leftIdx + 2] + positions[rightIdx + 2];
  count += 2;

  // Neighbor: up (inner / lower ring)
  if (ring > 0) {
    const upIdx = ((ring - 1) * rowSize + sector) * 3;
    sumX += positions[upIdx];
    sumY += positions[upIdx + 1];
    sumZ += positions[upIdx + 2];
    count++;
  }

  // Neighbor: down (outer / higher ring)
  if (ring < profileSegs) {
    const downIdx = ((ring + 1) * rowSize + sector) * 3;
    sumX += positions[downIdx];
    sumY += positions[downIdx + 1];
    sumZ += positions[downIdx + 2];
    count++;
  }

  const avgX = sumX / count;
  const avgY = sumY / count;
  const avgZ = sumZ / count;

  positions[idx] = curX + (avgX - curX) * factor;
  positions[idx + 1] = Math.max(0.01, curY + (avgY - curY) * factor);
  positions[idx + 2] = curZ + (avgZ - curZ) * factor;
}

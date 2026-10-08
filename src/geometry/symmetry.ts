import { RADIAL_SEGMENTS } from './createClayMesh';

/**
 * Finds the symmetric vertex index across the X=0 plane for bilateral symmetry
 */
export function getSymmetricVertexIndex(
  vertIndex: number,
  radialSegs: number = RADIAL_SEGMENTS
): number {
  const rowSize = radialSegs + 1;
  const i = Math.floor(vertIndex / rowSize); // ring index
  const j = vertIndex % rowSize; // radial sector

  const phi = (j / radialSegs) * Math.PI * 2;
  // Symmetry across X=0 plane (reflection x -> -x):
  // phi' = pi - phi (modulo 2pi)
  let symPhi = Math.PI - phi;
  while (symPhi < 0) symPhi += Math.PI * 2;
  while (symPhi >= Math.PI * 2) symPhi -= Math.PI * 2;

  const symJ = Math.round((symPhi / (Math.PI * 2)) * radialSegs);
  return i * rowSize + Math.min(radialSegs, Math.max(0, symJ));
}

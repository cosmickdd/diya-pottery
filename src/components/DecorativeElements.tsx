import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

interface DecorativeElementsProps {
  visible?: boolean;
}

/**
 * Real 3D Golden Bead Studs from the authoritative reference diya.png:
 * - Arranged in a continuous necklace along the lower rim bevel
 * - Arranged along the sweeping decorative bands on both sides of the front medallion
 */
export function DecorativeElements({ visible = true }: DecorativeElementsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Compute bead instance transforms
  const { count, matrices } = useMemo(() => {
    const beadTransforms: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    const ellipseX = 1.22 * 1.48;
    const ellipseZ = 0.92 * 1.48;

    // 1. RIM LOWER BEVEL BEADS (36 beads orbiting the rim)
    const rimBeadCount = 36;
    for (let i = 0; i < rimBeadCount; i++) {
      const phi = (i / rimBeadCount) * Math.PI * 2;
      const frontWeight = Math.max(0, Math.sin(phi));
      const frontCrest = Math.pow(frontWeight, 3.5);

      // Skip the front center where the pointed crest drops down
      if (Math.abs(phi - Math.PI * 0.5) < 0.28) {
        continue;
      }

      const r = (1.78 - frontCrest * 0.1) * Math.sqrt(
        (ellipseX * Math.cos(phi)) ** 2 + (ellipseZ * Math.sin(phi)) ** 2
      ) / 1.48;

      const x = r * Math.cos(phi);
      const z = r * Math.sin(phi);
      const y = 0.74 - frontCrest * 0.12;

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(0.045);
      dummy.updateMatrix();
      beadTransforms.push(dummy.matrix.clone());
    }

    // 2. FRONT SWEEPING BAND BEADS (5 beads on left curve, 5 on right curve)
    const bandBeadCount = 5;
    for (let side = -1; side <= 1; side += 2) {
      for (let j = 0; j < bandBeadCount; j++) {
        const t = (j + 1) / (bandBeadCount + 1);
        const phi = Math.PI * 0.5 + side * (0.35 + t * 0.42);
        const r = 1.76 * Math.sqrt(
          (ellipseX * Math.cos(phi)) ** 2 + (ellipseZ * Math.sin(phi)) ** 2
        ) / 1.48;

        const x = r * Math.cos(phi);
        const z = r * Math.sin(phi);
        const y = 0.52 - t * 0.22;

        dummy.position.set(x, y, z);
        dummy.scale.setScalar(0.048 - j * 0.003); // Tapers slightly
        dummy.updateMatrix();
        beadTransforms.push(dummy.matrix.clone());
      }
    }

    return { count: beadTransforms.length, matrices: beadTransforms };
  }, []);

  useEffect(() => {
    if (!meshRef.current) return;
    matrices.forEach((mat, idx) => {
      meshRef.current!.setMatrixAt(idx, mat);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  const { geometry, material } = useMemo(() => {
    const geom = new THREE.SphereGeometry(1, 16, 16);
    const mat = new THREE.MeshStandardMaterial({
      color: '#f5c03a',
      metalness: 0.92,
      roughness: 0.22,
    });
    return { geometry: geom, material: mat };
  }, []);

  if (!visible) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, count]}
      castShadow
      receiveShadow
    />
  );
}

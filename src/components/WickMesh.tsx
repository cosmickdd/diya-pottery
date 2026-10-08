import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface WickMeshProps {
  position?: [number, number, number];
  visible?: boolean;
  isLit?: boolean;
}

/**
 * Authentic hand-twisted cotton diya wick with optional sacred Jyoti flame
 */
export function WickMesh({
  position = [0, 0.22, 0],
  visible = true,
  isLit = false,
}: WickMeshProps) {
  const flameRef = useRef<THREE.Mesh>(null);
  const flameLightRef = useRef<THREE.PointLight>(null);

  const { geometry, material } = useMemo(() => {
    // 3D curved path for organic handmade twisted wick
    const curvePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.015, 0.08, 0.01),
      new THREE.Vector3(0.025, 0.16, -0.01),
      new THREE.Vector3(0.01, 0.24, -0.015),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const geom = new THREE.TubeGeometry(curve, 36, 0.038, 16, false);

    // Raw unbleached cotton to charred black tip
    const pos = geom.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const t = Math.max(0, Math.min(1, y / 0.24));

      if (t < 0.6) {
        colors[i * 3] = 0.94;
        colors[i * 3 + 1] = 0.91;
        colors[i * 3 + 2] = 0.85;
      } else {
        const charP = (t - 0.6) / 0.4;
        const cVal = 0.94 * (1 - charP) + 0.12 * charP;
        colors[i * 3] = cVal;
        colors[i * 3 + 1] = cVal * 0.96;
        colors[i * 3 + 2] = cVal * 0.92;
      }
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.05,
    });

    return { geometry: geom, material: mat };
  }, []);

  useFrame(({ clock }) => {
    if (isLit && flameRef.current) {
      const t = clock.getElapsedTime() * 8;
      const flicker = 1 + Math.sin(t) * 0.08 + Math.cos(t * 2.3) * 0.05;
      flameRef.current.scale.set(flicker, flicker * 1.05, flicker);

      if (flameLightRef.current) {
        flameLightRef.current.intensity = 1.6 + Math.sin(t * 1.5) * 0.25;
      }
    }
  });

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Twisted cotton wick body */}
      <mesh
        geometry={geometry}
        material={material}
        castShadow
        receiveShadow
      />

      {/* Splayed cotton base resting in oil reservoir */}
      <mesh position={[0.005, 0.015, 0]}>
        <cylinderGeometry args={[0.05, 0.09, 0.03, 20]} />
        <meshStandardMaterial color="#421a10" roughness={0.7} />
      </mesh>

      {/* Sacred Flame (Diya Jyoti) when lit */}
      {isLit && (
        <group position={[0.01, 0.27, -0.015]}>
          <mesh ref={flameRef}>
            <coneGeometry args={[0.055, 0.18, 16]} />
            <meshBasicMaterial color="#ffbe33" transparent opacity={0.92} />
          </mesh>
          <pointLight
            ref={flameLightRef}
            color="#ff9922"
            intensity={1.6}
            distance={3.5}
            decay={2}
          />
        </group>
      )}
    </group>
  );
}

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreeStepStageId } from '../types/pottery';

interface PotteryAtmosphereProps {
  stage: ThreeStepStageId;
}

/**
 * Atmosphere matching "Let's Create! Pottery 2":
 * - Shape / Reveal: Soft lush bokeh green studio with gentle floating dust motes
 * - Fire: Dark fiery crimson kiln chamber with rising molten ember sparks
 */
export function PotteryAtmosphere({ stage }: PotteryAtmosphereProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const isFire = stage === 'stage_02_fire';

  const { positions, speeds, count } = useMemo(() => {
    const particleCount = 70;
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6;
      pos[i * 3 + 1] = Math.random() * 4.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      spd[i] = 0.5 + Math.random() * 1.5;
    }
    return { positions: pos, speeds: spd, count: particleCount };
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;

      for (let i = 0; i < count; i++) {
        if (isFire) {
          // Embers rise rapidly upwards
          arr[i * 3 + 1] += speeds[i] * delta * 1.8;
          arr[i * 3] += Math.sin(arr[i * 3 + 1] * 2) * 0.008;
          if (arr[i * 3 + 1] > 4.5) {
            arr[i * 3 + 1] = 0;
            arr[i * 3] = (Math.random() - 0.5) * 4;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 4;
          }
        } else {
          // Gentle dust motes drifting lazily
          arr[i * 3 + 1] += Math.sin(arr[i * 3] * 3) * 0.002;
          arr[i * 3] += Math.cos(arr[i * 3 + 1] * 2) * 0.0015;
        }
      }
      pos.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={isFire ? 0.08 : 0.05}
          color={isFire ? '#ffaa33' : '#d4df9e'}
          transparent
          opacity={isFire ? 0.85 : 0.45}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Fiery glowing kiln pedestal ring during Firing step */}
      {isFire && (
        <group position={[0, -0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.65, 1.95, 48]} />
            <meshBasicMaterial color="#ff5500" transparent opacity={0.65} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#ff4400" intensity={3.5} distance={5} position={[0, 0.5, 0]} />
        </group>
      )}
    </group>
  );
}

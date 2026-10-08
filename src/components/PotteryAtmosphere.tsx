import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreeStepStageId } from '../types/pottery';

interface PotteryAtmosphereProps {
  stage: ThreeStepStageId;
}

/**
 * Atmospheric particle systems:
 * - Shape: Warm sunbeam dust motes drifting lazily through the artisan studio
 * - Fire: Rapid fiery embers and heat sparks swirling upwards from the kiln
 * - Reveal: Shimmering golden celebratory sparkle dust dancing in the festive light
 */
export function PotteryAtmosphere({ stage }: PotteryAtmosphereProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const isFire = stage === 'stage_02_fire';
  const isReveal = stage === 'stage_03_reveal';

  const { positions, speeds, count } = useMemo(() => {
    const particleCount = 90;
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6.5;
      pos[i * 3 + 1] = Math.random() * 4.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6.5;
      spd[i] = 0.4 + Math.random() * 1.6;
    }
    return { positions: pos, speeds: spd, count: particleCount };
  }, []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;

      for (let i = 0; i < count; i++) {
        if (isFire) {
          // Embers rise rapidly upwards in the hot draft
          arr[i * 3 + 1] += speeds[i] * delta * 2.2;
          arr[i * 3] += Math.sin(arr[i * 3 + 1] * 2.5) * 0.012;
          if (arr[i * 3 + 1] > 4.8) {
            arr[i * 3 + 1] = 0;
            arr[i * 3] = (Math.random() - 0.5) * 3.5;
            arr[i * 3 + 2] = (Math.random() - 0.5) * 3.5;
          }
        } else if (isReveal) {
          // Celebratory golden dust drifting upwards with gentle sine sway
          arr[i * 3 + 1] += speeds[i] * delta * 0.45;
          arr[i * 3] += Math.sin(arr[i * 3 + 1] * 1.8) * 0.003;
          if (arr[i * 3 + 1] > 4.8) {
            arr[i * 3 + 1] = 0.1;
          }
        } else {
          // Studio sunlit dust motes drifting lazily
          arr[i * 3 + 1] += Math.sin(arr[i * 3] * 2.5 + arr[i * 3 + 2]) * 0.002;
          arr[i * 3] += Math.cos(arr[i * 3 + 1] * 1.8) * 0.0018;
          arr[i * 3 + 2] += Math.sin(arr[i * 3 + 1] * 2.0) * 0.0015;
        }
      }
      pos.needsUpdate = true;
    }
  });

  const particleColor = isFire ? '#ffaa33' : isReveal ? '#ffdf78' : '#f0d9b5';
  const particleSize = isFire ? 0.075 : isReveal ? 0.06 : 0.045;
  const particleOpacity = isFire ? 0.88 : isReveal ? 0.75 : 0.5;

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
          size={particleSize}
          color={particleColor}
          transparent
          opacity={particleOpacity}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Fiery glowing kiln pedestal ring during Firing step */}
      {isFire && (
        <group position={[0, -0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 1.95, 48]} />
            <meshBasicMaterial color="#ff5500" transparent opacity={0.7} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#ff4400" intensity={4.2} distance={5.5} position={[0, 0.4, 0]} />
        </group>
      )}
    </group>
  );
}

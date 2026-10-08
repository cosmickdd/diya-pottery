import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ThreeStepStageId } from '../types/pottery';

interface GesturePointsProps {
  stage: ThreeStepStageId;
  shapeProgress: number;
  isTouching: boolean;
  onStartTouch: () => void;
  onEndTouch: () => void;
  visible?: boolean;
}

export function GesturePoints({
  stage,
  shapeProgress,
  isTouching,
  onStartTouch,
  onEndTouch,
  visible = true,
}: GesturePointsProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRingRef.current) {
      const s = 1 + (Math.sin(t * 4.5) * 0.5 + 0.5) * 0.45;
      outerRingRef.current.scale.set(s, s, s);
      const mat = outerRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.8 - (s - 1) * 1.2;
    }
    if (coreRef.current) {
      const p = 0.92 + Math.sin(t * 7) * 0.12;
      coreRef.current.scale.set(p, p, p);
    }
  });

  // HIDE WHEN:
  // 1. Not in shape stage
  // 2. User is currently touching
  // 3. Diya shape is complete (shapeProgress >= 0.95) - no badge or ring appears in the end
  if (!visible || stage !== 'stage_01_shape' || isTouching || shapeProgress >= 0.95) {
    return null;
  }

  // Beacon position & label based on current shape progress (strictly on the clay surface)
  let pos: [number, number, number] = [0, 0.65, 0.04];
  let label = 'Hold to Hollow Basin';

  if (shapeProgress < 0.45) {
    // 1. Directly on top-center of raw clay mound, sinking into basin as hollowed
    const p = shapeProgress / 0.45;
    pos = [0, 0.65 - p * 0.25, 0.04];
    label = 'Hold to Hollow Basin';
  } else if (shapeProgress < 0.85) {
    // 2. Directly on curved outer side wall / belly of the clay bowl
    pos = [0.52, 0.52, 0.20];
    label = 'Hold to Curve Bowl & Belly';
  } else {
    // 3. Directly on the front chevron crest / pinch notch of the Diya
    pos = [0, 0.54, 0.74];
    label = 'Hold to Pinch Front Crest';
  }

  return (
    <group
      position={pos}
      onPointerDown={(e) => {
        e.stopPropagation();
        onStartTouch();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onEndTouch();
      }}
      onPointerCancel={(e) => {
        e.stopPropagation();
        onEndTouch();
      }}
    >
      {/* Outer pulsating wave ring resting directly on clay */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.09, 0.13, 32]} />
        <meshBasicMaterial
          color="#ffd666"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Center beacon sphere resting directly on clay */}
      <mesh ref={coreRef} position={[0, 0.015, 0]}>
        <sphereGeometry args={[0.042, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffd24d"
          emissiveIntensity={2.2}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Floating gesture badge hovering closely above the touch point on the clay */}
      <Html position={[0, 0.09, 0]} center distanceFactor={5.5}>
        <div className="hotspot-badge">
          <div className="hotspot-pulse-dot" />
          <span>{label}</span>
        </div>
      </Html>

      {/* Invisible hit proxy sphere */}
      <mesh visible={false}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}

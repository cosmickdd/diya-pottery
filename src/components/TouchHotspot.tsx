import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface TouchHotspotProps {
  position: [number, number, number];
  label: string;
  onTouch: () => void;
  visible?: boolean;
}

export function TouchHotspot({ position, label, onTouch, visible = true }: TouchHotspotProps) {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRingRef.current) {
      const s = 1 + (Math.sin(t * 4) * 0.5 + 0.5) * 0.45;
      outerRingRef.current.scale.set(s, s, s);
      const mat = outerRingRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.7 - (s - 1) * 0.9;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 1.5;
    }
    if (coreRef.current) {
      const p = 0.9 + Math.sin(t * 6) * 0.15;
      coreRef.current.scale.set(p, p, p);
    }
  });

  if (!visible) return null;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onTouch();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onTouch();
      }}
    >
      {/* Outer pulsating wave ring */}
      <mesh ref={outerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.28, 32]} />
        <meshBasicMaterial
          color="#ffd666"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inner rotating dashed ring */}
      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.16, 32]} />
        <meshBasicMaterial
          color="#f5be34"
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bright glowing golden center pip */}
      <mesh ref={coreRef} position={[0, 0.02, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffd24d"
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Floating 3D Text Label */}
      <Html position={[0, 0.28, 0]} center distanceFactor={6}>
        <div
          className="hotspot-badge"
          onClick={(e) => {
            e.stopPropagation();
            onTouch();
          }}
        >
          <div className="hotspot-pulse-dot" />
          <span>{label}</span>
        </div>
      </Html>
    </group>
  );
}

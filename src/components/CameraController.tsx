import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import type { ThreeStepStageId } from '../types/pottery';

interface CameraControllerProps {
  stage: ThreeStepStageId;
  isAutoOrbiting: boolean;
}

export function CameraController({
  stage,
  isAutoOrbiting,
}: CameraControllerProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();

  const isReveal = stage === 'stage_03_reveal';

  // Setup initial camera framing with generous margins for mobile portrait
  useEffect(() => {
    camera.position.set(0, 1.45, 4.25);
    camera.lookAt(0, 0.30, 0);
  }, [camera]);

  // Handle device orientation for subtle immersive tilt on mobile
  useEffect(() => {
    let initialBeta: number | null = null;
    let initialGamma: number | null = null;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null || !controlsRef.current) return;
      if (initialBeta === null || initialGamma === null) {
        initialBeta = e.beta;
        initialGamma = e.gamma;
        return;
      }
      const deltaBeta = Math.max(-15, Math.min(15, e.beta - initialBeta));
      const deltaGamma = Math.max(-15, Math.min(15, e.gamma - initialGamma));
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, (deltaGamma / 15) * 0.3, 0.05);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.45 + (deltaBeta / 15) * 0.2, 0.05);
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [camera]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoOrbiting;
      controlsRef.current.autoRotateSpeed = 1.0;
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={false} // Strictly disable zoom
      enablePan={false}  // Strictly disable pan to keep diya centered
      enableRotate={isReveal} // Only allow manual rotate in Reveal stage so touch sculpts clay in Step 1
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={0.35} // Allows viewing into the deep basin
      maxPolarAngle={Math.PI / 2 - 0.06} // Stops at turntable disk plane
      target={[0, 0.30, 0]}
    />
  );
}

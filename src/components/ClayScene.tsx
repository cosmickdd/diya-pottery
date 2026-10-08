import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreeStepStageId } from '../types/pottery';
import { ClayObject } from './ClayObject';
import { PotteryWheelDisk, PotteryWheelBase, DisplayPedestalDisk } from './PotteryWheel';
import { GesturePoints } from './GesturePoints';
import { Lighting } from './Lighting';
import { CameraController } from './CameraController';
import { PotteryAtmosphere } from './PotteryAtmosphere';
import { MittiTextureGenerator } from '../materials/MittiTextureGenerator';

interface ClaySceneProps {
  stage: ThreeStepStageId;
  shapeProgress: number;
  isTouching: boolean;
  isWheelSpinning: boolean;
  wheelSpeed: number;
  textureGen: MittiTextureGenerator;
  isAutoOrbiting: boolean;
  onStartTouch: () => void;
  onEndTouch: () => void;
}

export function ClayScene({
  stage,
  shapeProgress,
  isTouching,
  isWheelSpinning,
  wheelSpeed,
  textureGen,
  isAutoOrbiting,
  onStartTouch,
  onEndTouch,
}: ClaySceneProps) {
  const rotatingAssemblyRef = useRef<THREE.Group>(null);

  const revealSpinRef = useRef<{
    isSpinning: boolean;
    startAngle: number;
    targetAngle: number;
    startTime: number;
    duration: number;
  }>({
    isSpinning: false,
    startAngle: 0,
    targetAngle: 0,
    startTime: 0,
    duration: 2400,
  });

  // When transitioning to Reveal: circle once and stop at front-facing position
  useEffect(() => {
    if (stage === 'stage_03_reveal' && rotatingAssemblyRef.current) {
      const currentY = rotatingAssemblyRef.current.rotation.y;
      const twoPi = Math.PI * 2;
      const normalizedCurrent = ((currentY % twoPi) + twoPi) % twoPi;
      const remainingToZero = (twoPi - normalizedCurrent) % twoPi;
      // Rotate 1 full circle (360°) plus remaining to front-facing position (rotation.y = 0 mod 2*PI)
      const targetAngle = currentY + twoPi + remainingToZero;

      revealSpinRef.current = {
        isSpinning: true,
        startAngle: currentY,
        targetAngle: targetAngle,
        startTime: performance.now(),
        duration: 2400, // 2.4s smooth celebratory showcase spin
      };
    } else {
      revealSpinRef.current.isSpinning = false;
    }
  }, [stage]);

  // Wheelhead and clay rotation loop
  useFrame((_, delta) => {
    if (!rotatingAssemblyRef.current) return;

    if (stage === 'stage_01_shape' || stage === 'stage_02_fire') {
      if (isWheelSpinning) {
        const speed = stage === 'stage_02_fire' ? wheelSpeed * 1.5 : wheelSpeed;
        rotatingAssemblyRef.current.rotation.y += speed * delta;
      }
    } else if (stage === 'stage_03_reveal') {
      if (revealSpinRef.current.isSpinning) {
        const elapsed = performance.now() - revealSpinRef.current.startTime;
        const progress = Math.min(1, elapsed / revealSpinRef.current.duration);

        // Smooth cubic ease-out deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRot =
          revealSpinRef.current.startAngle +
          (revealSpinRef.current.targetAngle - revealSpinRef.current.startAngle) * easeOut;

        rotatingAssemblyRef.current.rotation.y = currentRot;

        if (progress >= 1) {
          // Finished circling once: stops at the exact front-facing showcase position
          rotatingAssemblyRef.current.rotation.y = revealSpinRef.current.targetAngle;
          revealSpinRef.current.isSpinning = false;
        }
      }
    }
  });

  return (
    <>
      <Lighting stage={stage} />

      <CameraController
        stage={stage}
        isAutoOrbiting={isAutoOrbiting}
      />

      {/* Atmospheric particles & kiln embers */}
      <PotteryAtmosphere stage={stage} />

      {/* ROTATING ASSEMBLY: Disk + Clay */}
      <group
        ref={rotatingAssemblyRef}
        onPointerDown={(e) => {
          if (stage === 'stage_01_shape') {
            e.stopPropagation();
            onStartTouch();
          }
        }}
        onPointerUp={(e) => {
          if (stage === 'stage_01_shape') {
            e.stopPropagation();
            onEndTouch();
          }
        }}
        onPointerCancel={(e) => {
          if (stage === 'stage_01_shape') {
            e.stopPropagation();
            onEndTouch();
          }
        }}
      >
        {/* Wooden Turntable Disk: ONLY in Shape stage! Removed in Fire & Reveal */}
        {stage === 'stage_01_shape' && <PotteryWheelDisk />}

        {/* Clean Ceramic Pedestal: In Reveal stage */}
        {stage === 'stage_03_reveal' && <DisplayPedestalDisk />}

        {/* Pure Mitti Clay Mesh (touchable directly) */}
        <ClayObject
          stage={stage}
          shapeProgress={shapeProgress}
          isTouching={isTouching}
          textureGen={textureGen}
          onStartTouch={onStartTouch}
          onEndTouch={onEndTouch}
        />

        {/* Interactive Gesture Beacons on clay (HIDES while user is touching) */}
        <GesturePoints
          stage={stage}
          shapeProgress={shapeProgress}
          isTouching={isTouching}
          onStartTouch={onStartTouch}
          onEndTouch={onEndTouch}
        />
      </group>

      {/* Stationary Wooden Pedestal Base: ONLY in Shape stage! */}
      {stage === 'stage_01_shape' && <PotteryWheelBase />}

      {/* Ground Shadow Receiver */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.45, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </>
  );
}

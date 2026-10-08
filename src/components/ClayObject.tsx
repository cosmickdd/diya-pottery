import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  createClayGeometry,
  getContinuousClayPositions,
} from '../geometry/createClayMesh';
import { MittiTextureGenerator } from '../materials/MittiTextureGenerator';
import { soundEffects } from '../audio/SoundEffects';
import type { ThreeStepStageId } from '../types/pottery';

interface ClayObjectProps {
  stage: ThreeStepStageId;
  shapeProgress: number;
  isTouching: boolean;
  textureGen: MittiTextureGenerator;
  onStartTouch?: () => void;
  onEndTouch?: () => void;
}

export function ClayObject({
  stage,
  shapeProgress,
  isTouching,
  textureGen,
  onStartTouch,
  onEndTouch,
}: ClayObjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const lastSoundTick = useRef(0);

  // Initial geometry
  const initialGeometry = useMemo(() => {
    return createClayGeometry('stage_01_shape', 'lump');
  }, []);

  // Textures from MittiTextureGenerator
  const { colorTexture, normalTexture, roughnessTexture } = useMemo(() => {
    const cTex = new THREE.CanvasTexture(textureGen.canvas);
    cTex.wrapS = THREE.RepeatWrapping;
    cTex.wrapT = THREE.ClampToEdgeWrapping;
    cTex.generateMipmaps = true;

    const nTex = new THREE.CanvasTexture(textureGen.normalCanvas);
    nTex.wrapS = THREE.RepeatWrapping;
    nTex.wrapT = THREE.ClampToEdgeWrapping;
    nTex.generateMipmaps = true;

    const rTex = new THREE.CanvasTexture(textureGen.roughnessCanvas);
    rTex.wrapS = THREE.RepeatWrapping;
    rTex.wrapT = THREE.ClampToEdgeWrapping;
    rTex.generateMipmaps = true;

    return {
      colorTexture: cTex,
      normalTexture: nTex,
      roughnessTexture: rTex,
    };
  }, [textureGen]);

  // Update texture canvas when stage changes
  useEffect(() => {
    if (stage === 'stage_02_fire' || stage === 'stage_03_reveal') {
      textureGen.generateFiredTerracotta();
    } else {
      textureGen.generateRawMitti();
    }
    colorTexture.needsUpdate = true;
    normalTexture.needsUpdate = true;
    roughnessTexture.needsUpdate = true;
  }, [stage, textureGen, colorTexture, normalTexture, roughnessTexture]);

  const isShape = stage === 'stage_01_shape';

  // Update clay mesh shape continuously based on exact shapeProgress
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    const currentP = isShape ? shapeProgress : 1.0;
    const timeMs = clock.getElapsedTime() * 1000;
    getContinuousClayPositions(currentP, positions, isTouching, timeMs);

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();

    // Play wet clay sculpting audio while user is touching continuously
    if (isTouching && isShape && currentP < 1.0) {
      const now = Date.now();
      if (now - lastSoundTick.current > 150) {
        soundEffects.playClaySquish(0.34);
        lastSoundTick.current = now;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={initialGeometry}
      castShadow
      receiveShadow
      onPointerDown={(e) => {
        if (stage === 'stage_01_shape') {
          e.stopPropagation();
          onStartTouch?.();
        }
      }}
      onPointerUp={(e) => {
        if (stage === 'stage_01_shape') {
          e.stopPropagation();
          onEndTouch?.();
        }
      }}
      onPointerLeave={() => {
        if (isTouching) {
          onEndTouch?.();
        }
      }}
    >
      <meshStandardMaterial
        ref={materialRef}
        map={colorTexture}
        color="#ffffff"
        normalMap={normalTexture}
        normalScale={isShape ? new THREE.Vector2(0.85, 0.85) : new THREE.Vector2(0.70, 0.70)}
        roughnessMap={roughnessTexture}
        roughness={isShape ? 0.44 : 0.72}
        metalness={isShape ? 0.04 : 0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

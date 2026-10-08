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

  // Update clay mesh shape continuously based on exact shapeProgress
  useFrame(() => {
    if (!meshRef.current) return;
    const posAttr = meshRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;

    const currentP = stage === 'stage_01_shape' ? shapeProgress : 1.0;
    getContinuousClayPositions(currentP, positions);

    posAttr.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();

    // Play wet clay sculpting audio while user is touching continuously
    if (isTouching && stage === 'stage_01_shape' && currentP < 1.0) {
      const now = Date.now();
      if (now - lastSoundTick.current > 160) {
        soundEffects.playClaySquish(0.32);
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
        normalScale={new THREE.Vector2(0.65, 0.65)}
        roughnessMap={roughnessTexture}
        roughness={0.72}
        metalness={0.0}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

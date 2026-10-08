import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ThreeStepStageId } from '../types/pottery';
import { createWoodTexture } from '../materials/WoodTextureGenerator';

interface StudioBackdropProps {
  stage: ThreeStepStageId;
}

/**
 * Photorealistic 3D Artisan Pottery Studio Environment:
 * - Rich aged teakwood potter's workbench with clay slip splatters
 * - Curved studio cyclorama infinity backdrop wall
 * - Traditional Indian pottery workshop props (earthen water bowl, wooden rib tool, sponge)
 * - Fiery glowing kiln chamber interior in Fire stage
 * - Magical floating golden bokeh lanterns/diyas in Reveal stage
 */
export function StudioBackdrop({ stage }: StudioBackdropProps) {
  const bokehGroupRef = useRef<THREE.Group>(null);
  const kilnGlowRef = useRef<THREE.PointLight>(null);

  const isShape = stage === 'stage_01_shape';
  const isFire = stage === 'stage_02_fire';
  const isReveal = stage === 'stage_03_reveal';

  // Workbench wood textures
  const { tableWoodTex, tableRoughTex } = useMemo(() => {
    const { colorTexture, roughnessTexture } = createWoodTexture();
    const cTex = new THREE.CanvasTexture(colorTexture);
    cTex.wrapS = THREE.RepeatWrapping;
    cTex.wrapT = THREE.RepeatWrapping;
    cTex.repeat.set(3, 3);
    cTex.generateMipmaps = true;

    const rTex = new THREE.CanvasTexture(roughnessTexture);
    rTex.wrapS = THREE.RepeatWrapping;
    rTex.wrapT = THREE.RepeatWrapping;
    rTex.repeat.set(3, 3);
    rTex.generateMipmaps = true;

    return { tableWoodTex: cTex, tableRoughTex: rTex };
  }, []);

  // Studio Cyclorama curved wall texture
  const cycloramaTex = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Soft warm earthen studio wall gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    grad.addColorStop(0, '#2e241b');
    grad.addColorStop(0.4, '#423326');
    grad.addColorStop(0.7, '#2b2118');
    grad.addColorStop(1.0, '#19130d');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Warm radial spotlight beam on backdrop
    const rad = ctx.createRadialGradient(512, 450, 50, 512, 450, 500);
    rad.addColorStop(0, 'rgba(230, 185, 130, 0.16)');
    rad.addColorStop(0.6, 'rgba(180, 130, 80, 0.08)');
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, 1024, 1024);

    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    return tex;
  }, []);

  // Festive floating golden bokeh lights for Reveal stage
  const bokehOrbs = useMemo(() => {
    const orbs = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const radius = 2.5 + Math.random() * 2.8;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius - 0.5;
      const y = 0.4 + Math.random() * 2.8;
      const size = 0.05 + Math.random() * 0.11;
      const pulseSpeed = 1.2 + Math.random() * 1.8;
      const pulsePhase = Math.random() * Math.PI * 2;
      orbs.push({ x, y, z, size, pulseSpeed, pulsePhase });
    }
    return orbs;
  }, []);

  // Frame animations for bokeh orbs and kiln flame flicker
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (isReveal && bokehGroupRef.current) {
      bokehGroupRef.current.children.forEach((child, idx) => {
        const orb = bokehOrbs[idx];
        if (orb) {
          const wobbleY = Math.sin(t * orb.pulseSpeed + orb.pulsePhase) * 0.08;
          child.position.y = orb.y + wobbleY;
          const scale = 1 + Math.sin(t * (orb.pulseSpeed * 1.3) + orb.pulsePhase) * 0.15;
          child.scale.setScalar(scale);
        }
      });
    }

    if (isFire && kilnGlowRef.current) {
      kilnGlowRef.current.intensity = 3.8 + Math.sin(t * 12) * 0.6 + Math.cos(t * 7.5) * 0.4;
    }
  });

  return (
    <group>
      {/* 1. ARTISAN WOODEN WORKBENCH TABLE SURFACE (underneath wheel) */}
      <group position={[0, -0.42, 0]}>
        {/* Main Timber Table Top Planks */}
        <mesh receiveShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[4.2, 4.3, 0.14, 64]} />
          <meshStandardMaterial
            map={tableWoodTex}
            roughnessMap={tableRoughTex}
            roughness={0.78}
            metalness={0.03}
          />
        </mesh>

        {/* Workbench Bevel Edge Trim */}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[4.32, 4.32, 0.06, 64]} />
          <meshStandardMaterial color="#24150b" roughness={0.85} metalness={0.02} />
        </mesh>

        {/* Realistic Wet Clay Slip Splatters on workbench around spinning wheel */}
        {isShape && (
          <group position={[0, 0.071, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            {/* Fine concentric slip spray ring */}
            <mesh>
              <ringGeometry args={[1.38, 2.1, 48]} />
              <meshStandardMaterial
                color="#6e5e4d"
                transparent
                opacity={0.35}
                roughness={0.38}
                metalness={0.02}
                depthWrite={false}
              />
            </mesh>
            {/* Occasional slip droplets */}
            {[
              [1.65, 0.4, 0.035],
              [-1.75, 0.6, 0.04],
              [1.4, -0.8, 0.028],
              [-1.5, -0.7, 0.032],
              [0.3, 1.8, 0.042],
            ].map(([dx, dy, size], i) => (
              <mesh key={i} position={[dx, dy, 0.001]}>
                <circleGeometry args={[size, 16]} />
                <meshStandardMaterial
                  color="#635342"
                  transparent
                  opacity={0.55}
                  roughness={0.32}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* 2. CURVED 3D STUDIO CYCLORAMA WALL (Creates depth & authentic workshop backdrop) */}
      <mesh position={[0, 1.6, -2.6]} rotation={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[7.2, 7.5, 7.8, 48, 1, true, -Math.PI * 0.65, Math.PI * 1.3]} />
        <meshStandardMaterial
          map={cycloramaTex}
          roughness={0.92}
          metalness={0.0}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 3. TRADITIONAL INDIAN POTTERY WORKSHOP PROPS (Visible in Shape stage) */}
      {isShape && (
        <group>
          {/* A. Earthen Water Bowl (कुंडी / जलपात्र - used by potters to wet hands) */}
          <group position={[-1.72, -0.36, 0.35]}>
            {/* Terracotta Bowl Body */}
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.34, 0.22, 0.22, 28]} />
              <meshStandardMaterial
                color="#8c4324"
                roughness={0.68}
                metalness={0.02}
              />
            </mesh>
            {/* Water Surface Inside Bowl */}
            <mesh position={[0, 0.075, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.31, 24]} />
              <meshStandardMaterial
                color="#4e5c54"
                roughness={0.08}
                metalness={0.15}
                transparent
                opacity={0.88}
              />
            </mesh>
          </group>

          {/* B. Wooden Shaping Rib Tool (शिल्प उपकरण - wooden profile tool) */}
          <group position={[1.68, -0.34, 0.45]} rotation={[0, -0.4, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.12, 0.02, 0.42]} />
              <meshStandardMaterial color="#3d2716" roughness={0.7} metalness={0.05} />
            </mesh>
          </group>

          {/* C. Moist Potter's Sponge */}
          <group position={[-1.48, -0.34, -0.35]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color="#c2944b" roughness={0.95} metalness={0.0} />
            </mesh>
          </group>
        </group>
      )}

      {/* 4. SACRED KILN FURNACE GLOW (In Fire stage) */}
      {isFire && (
        <group>
          <pointLight
            ref={kilnGlowRef}
            position={[0, 0.4, 0]}
            color="#ff4800"
            intensity={4.2}
            distance={5.5}
            decay={2}
          />
          {/* Refractory Kiln Interior Halo */}
          <mesh position={[0, 1.2, -1.2]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[3.2, 3.4, 3.8, 36, 1, true]} />
            <meshStandardMaterial
              color="#3a0c04"
              emissive="#8a1804"
              emissiveIntensity={0.65}
              roughness={0.92}
              side={THREE.BackSide}
            />
          </mesh>
        </group>
      )}

      {/* 5. FESTIVE GOLDEN BOKEH ORBS (In Reveal stage: Diwali/Celebratory atmosphere) */}
      {isReveal && (
        <group ref={bokehGroupRef}>
          {bokehOrbs.map((orb, idx) => (
            <mesh key={idx} position={[orb.x, orb.y, orb.z]}>
              <sphereGeometry args={[orb.size, 16, 16]} />
              <meshBasicMaterial
                color={idx % 3 === 0 ? '#ffb336' : idx % 3 === 1 ? '#ffcc55' : '#ff9422'}
                transparent
                opacity={0.72}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

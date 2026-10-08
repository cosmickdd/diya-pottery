import { useMemo } from 'react';
import * as THREE from 'three';
import { createWoodTexture } from '../materials/WoodTextureGenerator';

export function PotteryWheelDisk() {
  const { woodColorTex, woodRoughTex } = useMemo(() => {
    const { colorTexture, roughnessTexture } = createWoodTexture();

    const cTex = new THREE.CanvasTexture(colorTexture);
    cTex.generateMipmaps = true;

    const rTex = new THREE.CanvasTexture(roughnessTexture);
    rTex.generateMipmaps = true;

    return { woodColorTex: cTex, woodRoughTex: rTex };
  }, []);

  return (
    <group position={[0, -0.035, 0]}>
      {/* Main Handcrafted Wooden Turntable Disk Plate */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.32, 1.34, 0.075, 64]} />
        <meshStandardMaterial
          map={woodColorTex}
          roughnessMap={woodRoughTex}
          roughness={0.65}
          metalness={0.04}
        />
      </mesh>

      {/* Lathe-carved concentric guide circles on the wooden surface */}
      {[0.55, 0.90, 1.18].map((radius, idx) => (
        <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.038, 0]}>
          <ringGeometry args={[radius - 0.008, radius + 0.008, 64]} />
          <meshStandardMaterial
            color="#2d1c10"
            roughness={0.9}
            metalness={0.03}
          />
        </mesh>
      ))}

      {/* Wooden Bevel Lip Trim */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[1.35, 1.35, 0.04, 64]} />
        <meshStandardMaterial
          color="#3d2616"
          roughness={0.72}
          metalness={0.06}
        />
      </mesh>

      {/* Subtle aged brass rim band beneath the wooden plate */}
      <mesh position={[0, -0.045, 0]}>
        <cylinderGeometry args={[1.33, 1.33, 0.02, 64]} />
        <meshStandardMaterial
          color="#8a6932"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

export function PotteryWheelBase() {
  return (
    <group position={[0, -0.035, 0]}>
      {/* Heavy Turned Wooden Pedestal Base */}
      <mesh position={[0, -0.18, 0]} receiveShadow>
        <cylinderGeometry args={[1.05, 1.25, 0.25, 48]} />
        <meshStandardMaterial
          color="#291a11"
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Cast Iron Floor Mounting Ring */}
      <mesh position={[0, -0.34, 0]} receiveShadow>
        <cylinderGeometry args={[1.40, 1.52, 0.08, 48]} />
        <meshStandardMaterial
          color="#161311"
          roughness={0.92}
          metalness={0.25}
        />
      </mesh>
    </group>
  );
}

/**
 * Clean ceramic display turntable disc for Reveal stage (Pottery 2 style)
 */
export function DisplayPedestalDisk() {
  return (
    <group position={[0, -0.025, 0]}>
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[1.24, 1.27, 0.055, 64]} />
        <meshStandardMaterial
          color="#f4eee4"
          roughness={0.35}
          metalness={0.02}
        />
      </mesh>
      {/* Subtle gold trim ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.029, 0]}>
        <ringGeometry args={[1.14, 1.165, 64]} />
        <meshStandardMaterial
          color="#e0b252"
          roughness={0.25}
          metalness={0.7}
        />
      </mesh>
      {/* Under-shadow disc */}
      <mesh position={[0, -0.032, 0]}>
        <cylinderGeometry args={[1.27, 1.27, 0.018, 64]} />
        <meshStandardMaterial color="#c2b8aa" roughness={0.6} />
      </mesh>
    </group>
  );
}

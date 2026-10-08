import type { ThreeStepStageId } from '../types/pottery';

interface LightingProps {
  stage: ThreeStepStageId;
}

export function Lighting({ stage }: LightingProps) {
  const isFire = stage === 'stage_02_fire';
  const isReveal = stage === 'stage_03_reveal';

  if (isFire) {
    // Kiln Firing Lighting: Dramatic fiery ember glow & molten thermal radiation
    return (
      <>
        <ambientLight intensity={0.35} color="#701402" />
        <directionalLight
          position={[2.5, 4.5, 3.0]}
          intensity={1.4}
          color="#ff7722"
          castShadow
        />
        <pointLight
          position={[0, 0.4, 0]}
          intensity={4.5}
          distance={4.5}
          color="#ff4400"
        />
        <pointLight
          position={[0, 2.5, 0]}
          intensity={2.8}
          distance={5.5}
          color="#ff9900"
        />
      </>
    );
  }

  if (isReveal) {
    // Stage 03 Divine Reveal: Celebratory warm golden showcase lighting with divine halo
    return (
      <>
        <ambientLight intensity={0.82} color="#fbf4e6" />

        {/* Masterpiece key spotlight from upper front */}
        <directionalLight
          position={[1.5, 5.2, 3.6]}
          intensity={2.6}
          color="#fff2de"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.5}
          shadow-camera-far={12}
          shadow-camera-left={-2.5}
          shadow-camera-right={2.5}
          shadow-camera-top={2.5}
          shadow-camera-bottom={-2.5}
          shadow-bias={-0.0003}
        />

        {/* Golden halo back-rim lights */}
        <directionalLight
          position={[-2.8, 4.0, -2.5]}
          intensity={1.4}
          color="#ffd27d"
        />
        <directionalLight
          position={[2.8, 4.0, -2.5]}
          intensity={1.4}
          color="#ffc86b"
        />

        {/* Soft warm fill to highlight intricate crest & medallion */}
        <directionalLight
          position={[0, 1.4, 3.6]}
          intensity={1.2}
          color="#fff3e0"
        />

        {/* Basin floor illumination to display inner lotus medallion */}
        <pointLight
          position={[0, 1.6, 0]}
          intensity={1.5}
          distance={4.0}
          color="#ffeedb"
        />
      </>
    );
  }

  // Pure Studio Daylight for Shaping (Stage 01: Artisan Pottery Workshop)
  return (
    <>
      <ambientLight intensity={0.78} color="#fbf6ee" />

      {/* Main sunlit key light from workshop window */}
      <directionalLight
        position={[3.2, 5.4, 3.4]}
        intensity={2.3}
        color="#fff7eb"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={2.5}
        shadow-camera-bottom={-2.5}
        shadow-bias={-0.0003}
      />

      {/* Warm terracotta workshop ambient bounce fill */}
      <directionalLight
        position={[-3.2, 2.5, -2.2]}
        intensity={0.9}
        color="#e6d4c0"
      />

      {/* High back catch-light: makes the wet clay edge and rolled lip glisten! */}
      <directionalLight
        position={[0, 5.8, -2.4]}
        intensity={1.45}
        color="#fff2df"
      />

      {/* Eye-level soft front fill */}
      <directionalLight
        position={[0, 1.4, 3.6]}
        intensity={1.05}
        color="#fff2de"
      />

      {/* Warm point light above deep cavity to illuminate hollowed inner basin */}
      <pointLight
        position={[0, 1.8, 0]}
        intensity={1.4}
        distance={4.5}
        color="#ffeedb"
      />
    </>
  );
}

import type { ThreeStepStageId } from '../types/pottery';

interface LightingProps {
  stage: ThreeStepStageId;
}

export function Lighting({ stage }: LightingProps) {
  const isFire = stage === 'stage_02_fire';
  const isReveal = stage === 'stage_03_reveal';

  if (isFire) {
    // Kiln Firing Lighting: Dramatic fiery ember glow (matching Pottery 2 screenshot 4)
    return (
      <>
        <ambientLight intensity={0.4} color="#881a05" />
        <directionalLight
          position={[2.5, 4.5, 3.0]}
          intensity={1.2}
          color="#ff7722"
          castShadow
        />
        <pointLight
          position={[0, 0.4, 0]}
          intensity={4.0}
          distance={4}
          color="#ff4400"
        />
        <pointLight
          position={[0, 2.5, 0]}
          intensity={2.5}
          distance={5}
          color="#ff9900"
        />
      </>
    );
  }

  // Pure Studio Daylight for Shaping & Reveal
  return (
    <>
      <ambientLight intensity={0.75} color="#fbf7ee" />

      {/* Main key light with soft shadows */}
      <directionalLight
        position={[3.0, 5.0, 3.5]}
        intensity={isReveal ? 2.2 : 1.9}
        color="#fff4e2"
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

      {/* Warm soft fill from opposite side */}
      <directionalLight
        position={[-3.0, 2.8, -2.5]}
        intensity={0.85}
        color="#e4d2bf"
      />

      {/* Top rim catchlight to highlight the thick rolled rim */}
      <directionalLight
        position={[0, 5.5, -1.0]}
        intensity={1.1}
        color="#fff3de"
      />

      {/* Eye-level front fill to illuminate front chevron crest and deep basin */}
      <directionalLight
        position={[0, 1.6, 3.5]}
        intensity={1.0}
        color="#fff0da"
      />

      {/* Warm point light above the deep cavity to clearly light the inner basin floor */}
      <pointLight
        position={[0, 1.8, 0]}
        intensity={1.3}
        distance={4.5}
        color="#ffeedb"
      />
    </>
  );
}

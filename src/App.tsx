import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import type { ThreeStepStageId } from './types/pottery';
import { MittiTextureGenerator } from './materials/MittiTextureGenerator';
import { soundEffects } from './audio/SoundEffects';
import { ClayScene } from './components/ClayScene';
import { MobileTopBar } from './ui/MobileTopBar';
import { MobileBottomBar } from './ui/MobileBottomBar';
import { FinishScreen } from './ui/FinishScreen';
import { ReferenceModal } from './ui/ReferenceModal';
import './App.css';

export function App() {
  const [stage, setStage] = useState<ThreeStepStageId>('stage_01_shape');
  const [shapeProgress, setShapeProgress] = useState<number>(0.0);
  const [isTouching, setIsTouching] = useState<boolean>(false);
  const [isWheelSpinning, setIsWheelSpinning] = useState<boolean>(true);
  const [wheelSpeed] = useState<number>(0.75);
  const [isAutoOrbiting, setIsAutoOrbiting] = useState<boolean>(false);
  const [isRefModalOpen, setIsRefModalOpen] = useState<boolean>(false);

  const textureGen = useMemo(() => new MittiTextureGenerator(), []);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const touchAnimationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Continuous tactile shaping loop:
  // When user is touching continuously, clay transforms smoothly.
  // When user releases, it stops at the EXACT point!
  useEffect(() => {
    if (isTouching && stage === 'stage_01_shape' && shapeProgress < 1.0) {
      lastTimeRef.current = performance.now();

      const loop = (time: number) => {
        if (!lastTimeRef.current) lastTimeRef.current = time;
        const deltaSec = Math.min(0.1, (time - lastTimeRef.current) / 1000);
        lastTimeRef.current = time;

        setShapeProgress((prev) => {
          // Smooth continuous transformation speed (~3.6s to shape fully if held continuously)
          const next = Math.min(1.0, prev + deltaSec * 0.28);
          if (next >= 1.0) {
            setIsTouching(false);
            soundEffects.playChime();
          }
          return next;
        });

        touchAnimationRef.current = requestAnimationFrame(loop);
      };

      touchAnimationRef.current = requestAnimationFrame(loop);
    } else {
      if (touchAnimationRef.current) {
        cancelAnimationFrame(touchAnimationRef.current);
        touchAnimationRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (touchAnimationRef.current) {
        cancelAnimationFrame(touchAnimationRef.current);
      }
    };
  }, [isTouching, stage, shapeProgress]);

  const handleStartTouch = useCallback(() => {
    if (stage === 'stage_01_shape') {
      setIsTouching(true);
      soundEffects.playClaySquish(0.4);
    }
  }, [stage]);

  const handleEndTouch = useCallback(() => {
    setIsTouching(false);
  }, []);

  // Ensure touching always stops when pointer/finger is lifted anywhere
  useEffect(() => {
    const handleGlobalPointerUp = () => {
      setIsTouching(false);
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('touchend', handleGlobalPointerUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('touchend', handleGlobalPointerUp);
    };
  }, []);

  // Primary navigation via the tick (✓) button
  const handleAdvanceStage = useCallback(() => {
    if (stage === 'stage_01_shape') {
      setShapeProgress(1.0); // Ensure complete diya shape
      setStage('stage_02_fire');
      soundEffects.playChime();
    } else if (stage === 'stage_02_fire') {
      setStage('stage_03_reveal');
      setIsWheelSpinning(false);
      setIsAutoOrbiting(false); // Diya should not rotate automatically
      soundEffects.playChime();
    }
  }, [stage]);

  const handlePrev = useCallback(() => {
    if (stage === 'stage_03_reveal') {
      setStage('stage_02_fire');
      setIsWheelSpinning(true);
      setIsAutoOrbiting(false);
    } else if (stage === 'stage_02_fire') {
      setStage('stage_01_shape');
      setShapeProgress(1.0);
    } else if (stage === 'stage_01_shape') {
      setShapeProgress((prev) => Math.max(0, prev - 0.45));
    }
    soundEffects.playClayGlide();
  }, [stage]);

  const handleSelectStage = useCallback((selectedStage: ThreeStepStageId) => {
    setStage(selectedStage);
    if (selectedStage === 'stage_01_shape') {
      setIsWheelSpinning(true);
      setIsAutoOrbiting(false);
    } else if (selectedStage === 'stage_02_fire') {
      setShapeProgress(1.0);
      setIsWheelSpinning(true);
      setIsAutoOrbiting(false);
    } else {
      setShapeProgress(1.0);
      setIsWheelSpinning(false);
      setIsAutoOrbiting(false); // Diya should not rotate automatically
    }
    soundEffects.playChime();
  }, []);

  const handleReset = useCallback(() => {
    setStage('stage_01_shape');
    setShapeProgress(0.0);
    setIsTouching(false);
    setIsWheelSpinning(true);
    setIsAutoOrbiting(false);
    textureGen.generateRawMitti();
    soundEffects.playChime();
  }, [textureGen]);

  const handleSaveDiya = useCallback(() => {
    if (!canvasContainerRef.current) return;
    const canvas = canvasContainerRef.current.querySelector('canvas');
    if (!canvas) return;

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'handcrafted-mitti-diya.png';
      link.href = dataUrl;
      link.click();
    } catch {
      alert('Unable to capture image in this browser context.');
    }
  }, []);

  return (
    <div className={`app-viewport ${stage === 'stage_02_fire' ? 'theme-kiln' : 'theme-studio'}`}>
      {/* 3-Step Upper Bar: 1 SHAPE, 2 FIRE, 3 REVEAL */}
      <MobileTopBar
        stage={stage}
        shapeProgress={shapeProgress}
        onSelectStage={handleSelectStage}
        onPrev={handlePrev}
        onNext={handleAdvanceStage}
        onOpenReference={() => setIsRefModalOpen(true)}
        onReset={handleReset}
      />

      {/* 3D WebGL Canvas: Camera locked at perfect framing with zero accidental zoom */}
      <div className="three-canvas-container" ref={canvasContainerRef}>
        <Canvas
          shadows
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          camera={{
            position: [0, 1.35, 3.85],
            fov: 44,
            near: 0.1,
            far: 25,
          }}
        >
          <ClayScene
            stage={stage}
            shapeProgress={shapeProgress}
            isTouching={isTouching}
            isWheelSpinning={isWheelSpinning}
            wheelSpeed={wheelSpeed}
            textureGen={textureGen}
            isAutoOrbiting={isAutoOrbiting}
            onStartTouch={handleStartTouch}
            onEndTouch={handleEndTouch}
          />
        </Canvas>
      </div>

      {/* Mobile Bottom Controls & Kiln HUD */}
      <MobileBottomBar
        stage={stage}
        shapeProgress={shapeProgress}
        isTouching={isTouching}
        isWheelSpinning={isWheelSpinning}
        onToggleWheel={() => setIsWheelSpinning((prev) => !prev)}
        onStartTouch={handleStartTouch}
        onEndTouch={handleEndTouch}
        onAdvanceStage={handleAdvanceStage}
      />

      {/* Stage 03 Divine Reveal Modal */}
      {stage === 'stage_03_reveal' && (
        <FinishScreen
          onSaveDiya={handleSaveDiya}
          isAutoOrbiting={isAutoOrbiting}
          onToggleAutoOrbit={() => setIsAutoOrbiting((prev) => !prev)}
          onOpenReference={() => setIsRefModalOpen(true)}
          onRestart={handleReset}
        />
      )}

      {/* Reference Modal */}
      <ReferenceModal
        isOpen={isRefModalOpen}
        onClose={() => setIsRefModalOpen(false)}
      />
    </div>
  );
}

export default App;

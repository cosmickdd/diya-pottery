import { useEffect, useState } from 'react';
import { Pause, Play, Flame } from 'lucide-react';
import type { ThreeStepStageId } from '../types/pottery';

interface MobileBottomBarProps {
  stage: ThreeStepStageId;
  shapeProgress: number;
  isTouching: boolean;
  isWheelSpinning: boolean;
  onToggleWheel: () => void;
  onStartTouch: () => void;
  onEndTouch: () => void;
  onAdvanceStage: () => void;
}

export function MobileBottomBar({
  stage,
  isWheelSpinning,
  onToggleWheel,
  onAdvanceStage,
}: MobileBottomBarProps) {
  const [fireProgress, setFireProgress] = useState(0);

  // Firing progress animation (Pottery 2 style) - Exactly 5.0 seconds as requested
  useEffect(() => {
    if (stage === 'stage_02_fire') {
      setFireProgress(0);
      const startTime = Date.now();
      const duration = 5000; // Exactly 5 seconds

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(100, Math.round((elapsed / duration) * 100));
        setFireProgress(p);

        if (p >= 100) {
          clearInterval(interval);
          // Automatically continue to the final page (Reveal) when the 5-second timer ends
          setTimeout(() => {
            onAdvanceStage();
          }, 350);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [stage, onAdvanceStage]);

  if (stage === 'stage_03_reveal') return null;

  if (stage === 'stage_02_fire') {
    return (
      <div className="kiln-firing-overlay">
        {/* Top-center circular countdown progress ring with flame icon */}
        <div className="fire-progress-ring-container">
          <svg className="fire-ring-svg" viewBox="0 0 100 100">
            <circle
              className="fire-ring-bg"
              cx="50"
              cy="50"
              r="42"
            />
            <circle
              className="fire-ring-bar"
              cx="50"
              cy="50"
              r="42"
              style={{
                strokeDashoffset: `${264 - (264 * fireProgress) / 100}`,
              }}
            />
          </svg>
          <div className="fire-ring-icon-center">
            <Flame size={24} className="fire-flame-icon pulsing" />
          </div>
        </div>

        <div className="kiln-status-card">
          <div className="kiln-temp-badge">
            {fireProgress < 100 ? `${Math.round(200 + fireProgress * 8.2)}°C • Terracotta Firing` : '1020°C • Firing Complete!'}
          </div>
          <div className="kiln-caption">
            {fireProgress < 100
              ? 'Baking raw mitti into durable sacred earthenware (5s)...'
              : 'Firing finished! Entering Diya Reveal...'}
          </div>
        </div>
      </div>
    );
  }

  // Step 1: SHAPE Bottom Bar - Only compact wheel toggle button for mobile
  return (
    <div className="mobile-bottom-controls">
      <button
        onClick={onToggleWheel}
        className="wheel-toggle-btn"
        title={isWheelSpinning ? 'Pause Pottery Wheel' : 'Spin Pottery Wheel'}
      >
        {isWheelSpinning ? <Pause size={14} /> : <Play size={14} />}
        <span>{isWheelSpinning ? 'Pause Wheel' : 'Spin Wheel'}</span>
      </button>
    </div>
  );
}

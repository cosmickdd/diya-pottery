import { ChevronLeft, Check, Image, RotateCcw } from 'lucide-react';
import type { ThreeStepStageId } from '../types/pottery';

interface MobileTopBarProps {
  stage: ThreeStepStageId;
  shapeProgress: number;
  onSelectStage: (stage: ThreeStepStageId) => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenReference: () => void;
  onReset: () => void;
}

const THREE_STEPS: { id: ThreeStepStageId; num: number; label: string; hindi: string }[] = [
  { id: 'stage_01_shape', num: 1, label: 'SHAPE', hindi: 'आकार' },
  { id: 'stage_02_fire', num: 2, label: 'FIRE', hindi: 'अग्नि' },
  { id: 'stage_03_reveal', num: 3, label: 'REVEAL', hindi: 'दर्शन' },
];

export function MobileTopBar({
  stage,
  shapeProgress,
  onSelectStage,
  onPrev,
  onNext,
  onOpenReference,
  onReset,
}: MobileTopBarProps) {
  const currentStepNum = stage === 'stage_01_shape' ? 1 : stage === 'stage_02_fire' ? 2 : 3;

  return (
    <div className="mobile-top-bar-container">
      {/* Upper Navigation Bar */}
      <div className="pottery-header">
        <button
          onClick={onPrev}
          className="header-circle-btn"
          title="Previous Step"
          disabled={currentStepNum === 1 && shapeProgress <= 0}
        >
          <ChevronLeft size={18} />
        </button>

        {/* 3-Step Pill Stepper (SHAPE, FIRE, REVEAL) */}
        <div className="three-step-pill">
          {THREE_STEPS.map((s) => {
            const isActive = s.id === stage;
            const isDone = s.num < currentStepNum;
            return (
              <button
                key={s.id}
                onClick={() => onSelectStage(s.id)}
                className={`step-segment ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              >
                <span className="step-seg-num">{s.num}</span>
                <span className="step-seg-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="header-right-group">
          <button
            onClick={onOpenReference}
            className="header-circle-btn"
            title="View Reference Diya"
          >
            <Image size={16} />
          </button>

          {stage !== 'stage_03_reveal' ? (
            <button
              onClick={onNext}
              className={`header-circle-btn primary ${stage === 'stage_01_shape' && shapeProgress >= 0.95 ? 'pulsing-attention' : ''}`}
              title="Proceed to Next Step"
            >
              <Check size={18} />
            </button>
          ) : (
            <button
              onClick={onReset}
              className="header-circle-btn"
              title="Craft Another"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

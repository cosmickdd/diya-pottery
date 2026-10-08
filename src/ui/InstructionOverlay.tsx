import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import type { PotteryStageId } from '../types/pottery';
import { STAGES, getStageIndex } from '../stages/stageDefinitions';

interface InstructionOverlayProps {
  stage: PotteryStageId;
  onNextStage: () => void;
  onPrevStage: () => void;
  onOpenReference: () => void;
}

export function InstructionOverlay({
  stage,
  onNextStage,
  onPrevStage,
  onOpenReference,
}: InstructionOverlayProps) {
  const currentIndex = getStageIndex(stage);
  const info = STAGES[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STAGES.length - 1;

  return (
    <div className="instruction-card">
      <div className="instruction-header">
        <div className="stage-badge">
          <span>STEP 0{info.stepNumber}</span>
          <span className="hindi-badge">{info.hindiTitle}</span>
        </div>
        <button
          onClick={onOpenReference}
          className="ref-peek-btn"
          title="View Reference Diya"
        >
          <img src="/diya.png" alt="Reference Diya" className="ref-thumb" />
          <span>Reference</span>
        </button>
      </div>

      <h2 className="stage-heading">{info.title}</h2>
      <p className="stage-instruction">{info.instruction}</p>
      <div className="hotspot-guide-pill">
        <span className="pulsing-beacon-dot" />
        <span>{info.beaconLabel}</span>
      </div>

      <div className="instruction-actions">
        {!isFirst && (
          <button
            onClick={onPrevStage}
            className="btn-secondary"
            title="Previous Step"
          >
            <ChevronLeft size={15} />
            <span>Prev</span>
          </button>
        )}

        {!isLast ? (
          <button
            onClick={onNextStage}
            className="btn-primary"
            title="Proceed to next step"
          >
            <span>Touch to Shape</span>
            <ChevronRight size={15} />
          </button>
        ) : (
          <div className="reveal-badge">
            <Sparkles size={16} className="sparkle-icon" />
            <span>Handcrafted Clay Diya</span>
          </div>
        )}
      </div>
    </div>
  );
}

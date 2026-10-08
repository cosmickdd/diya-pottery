import type { PotteryStageId } from '../types/pottery';
import { STAGES, getStageIndex } from '../stages/stageDefinitions';

interface ProgressIndicatorProps {
  currentStage: PotteryStageId;
  onSelectStage: (stage: PotteryStageId) => void;
}

export function ProgressIndicator({ currentStage, onSelectStage }: ProgressIndicatorProps) {
  const currentIndex = getStageIndex(currentStage);

  return (
    <nav aria-label="Pottery Stages" className="stage-nav-container">
      <div className="stage-nav-track">
        {STAGES.map((s, idx) => {
          const isActive = s.id === currentStage;
          const isCompleted = idx < currentIndex;

          return (
            <button
              key={s.id}
              onClick={() => onSelectStage(s.id)}
              className={`stage-pill-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              title={`${s.stepNumber}. ${s.title}`}
            >
              <span className="stage-num">{idx + 1}</span>
              <span className="stage-title-text">{s.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

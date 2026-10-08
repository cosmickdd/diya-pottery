import { Download, Rotate3d, Image, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface FinishScreenProps {
  onSaveDiya: () => void;
  isAutoOrbiting: boolean;
  onToggleAutoOrbit: () => void;
  onOpenReference: () => void;
  onRestart: () => void;
}

/**
 * Minimal floating controls for Step 3: REVEAL
 * Pure unobstructed 3D view with NO modal card!
 */
export function FinishScreen({
  onSaveDiya,
  isAutoOrbiting,
  onToggleAutoOrbit,
  onOpenReference,
  onRestart,
}: FinishScreenProps) {
  const handleSaveWithCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 },
      colors: ['#f5be34', '#ffd86b', '#c46944', '#ffffff', '#e09842'],
    });

    onSaveDiya();
  };

  return (
    <div className="reveal-floating-controls">
      <button
        onClick={handleSaveWithCelebration}
        className="reveal-action-pill primary"
        title="Download high-resolution image"
      >
        <Download size={18} />
        <span>Save Diya</span>
      </button>

      <button
        onClick={onToggleAutoOrbit}
        className={`reveal-circle-btn ${isAutoOrbiting ? 'active' : ''}`}
        title={isAutoOrbiting ? 'Pause 360°' : '360° View'}
      >
        <Rotate3d size={18} />
      </button>

      <button
        onClick={onOpenReference}
        className="reveal-circle-btn"
        title="View Reference Image"
      >
        <Image size={18} />
      </button>

      <button
        onClick={onRestart}
        className="reveal-circle-btn"
        title="Craft Another Diya"
      >
        <RefreshCw size={17} />
      </button>
    </div>
  );
}

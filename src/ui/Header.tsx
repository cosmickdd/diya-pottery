import { Volume2, VolumeX, Sparkles, Image, RotateCcw } from 'lucide-react';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenReference: () => void;
  onResetToRawClay: () => void;
}

export function Header({
  soundEnabled,
  onToggleSound,
  onOpenReference,
  onResetToRawClay,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="brand-group">
        <Sparkles size={20} className="brand-icon" />
        <div>
          <h1 className="brand-title">Mitti Se Diya</h1>
          <span className="brand-sub">मिट्टी से दीया • Sacred 3D Pottery</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          onClick={onOpenReference}
          className="header-icon-btn"
          title="Authoritative Visual Reference"
        >
          <Image size={18} />
          <span className="header-btn-text">Reference</span>
        </button>

        <button
          onClick={onToggleSound}
          className="header-icon-btn"
          title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={() => {
            if (window.confirm('Reset back to raw mitti clay? Any unsaved edits will be cleared.')) {
              onResetToRawClay();
            }
          }}
          className="header-icon-btn"
          title="Reset to raw clay"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </header>
  );
}

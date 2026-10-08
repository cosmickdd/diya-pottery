import {
  Undo2,
  Redo2,
  Pause,
  Play,
  Spline,
  Hand,
  Sparkles,
  Layers,
  CircleDot,
  Compass,
} from 'lucide-react';
import type { BrushSettings, BrushType } from '../types/pottery';

interface ToolBarProps {
  settings: BrushSettings;
  onUpdateSettings: (newSettings: Partial<BrushSettings>) => void;
  isWheelSpinning: boolean;
  onToggleWheel: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const BRUSHES: { type: BrushType; label: string; hindi: string; icon: typeof Hand }[] = [
  { type: 'push', label: 'Push', hindi: 'दबाव', icon: Hand },
  { type: 'pull', label: 'Pull', hindi: 'खींचें', icon: Spline },
  { type: 'smooth', label: 'Smooth', hindi: 'चिकना', icon: Sparkles },
  { type: 'rim', label: 'Rim Round', hindi: 'किनारा', icon: CircleDot },
  { type: 'front', label: 'Pull Front', hindi: 'अग्रभाग', icon: Compass },
  { type: 'inflate', label: 'Inflate', hindi: 'उभार', icon: Layers },
];

export function ToolBar({
  settings,
  onUpdateSettings,
  isWheelSpinning,
  onToggleWheel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: ToolBarProps) {
  return (
    <div className="toolbar-glass">
      {/* Brush selector buttons */}
      <div className="brush-row">
        {BRUSHES.map((b) => {
          const Icon = b.icon;
          const isActive = settings.type === b.type;
          return (
            <button
              key={b.type}
              onClick={() => onUpdateSettings({ type: b.type })}
              className={`brush-btn ${isActive ? 'active' : ''}`}
              title={`${b.label} (${b.hindi})`}
            >
              <Icon size={18} />
              <span className="btn-label">{b.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sliders & toggles */}
      <div className="controls-row">
        {/* Brush Size slider */}
        <div className="slider-control">
          <label htmlFor="brush-size-input">Size</label>
          <input
            id="brush-size-input"
            type="range"
            min="0.1"
            max="0.85"
            step="0.05"
            value={settings.radius}
            onChange={(e) => onUpdateSettings({ radius: parseFloat(e.target.value) })}
          />
        </div>

        {/* Brush Strength slider */}
        <div className="slider-control">
          <label htmlFor="brush-strength-input">Force</label>
          <input
            id="brush-strength-input"
            type="range"
            min="0.15"
            max="1.0"
            step="0.05"
            value={settings.strength}
            onChange={(e) => onUpdateSettings({ strength: parseFloat(e.target.value) })}
          />
        </div>

        {/* Symmetry toggle */}
        <button
          onClick={() => onUpdateSettings({ symmetry: !settings.symmetry })}
          className={`toggle-btn ${settings.symmetry ? 'active' : ''}`}
          title="Bilateral Symmetry"
        >
          <span>Symmetry: {settings.symmetry ? 'ON' : 'OFF'}</span>
        </button>

        {/* Wheel toggle */}
        <button
          onClick={onToggleWheel}
          className={`toggle-btn ${isWheelSpinning ? 'active' : ''}`}
          title="Pause or spin the pottery wheel"
        >
          {isWheelSpinning ? <Pause size={14} /> : <Play size={14} />}
          <span>Wheel</span>
        </button>

        {/* Undo / Redo */}
        <div className="undo-redo-group">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="icon-action-btn"
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="icon-action-btn"
            title="Redo"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

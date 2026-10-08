import {
  Paintbrush,
  Sparkles,
  Flower2,
  CircleDot,
  RotateCcw,
  Undo2,
  Redo2,
  Gem,
} from 'lucide-react';
import type { DecorateSettings } from '../types/pottery';

interface DecorateBarProps {
  settings: DecorateSettings;
  onUpdateSettings: (newSettings: Partial<DecorateSettings>) => void;
  onApplyReferenceDecoration: () => void;
  onResetDecoration: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const PALETTE = [
  { name: 'Radiant Gold', color: '#f5be34' },
  { name: 'Temple Crimson', color: '#9e1c0e' },
  { name: 'Raw Terracotta', color: '#b85434' },
  { name: 'Saffron Amber', color: '#ff9900' },
  { name: 'Sacred White', color: '#ffffff' },
  { name: 'Turquoise Patina', color: '#1ab394' },
];

export function DecorateBar({
  settings,
  onUpdateSettings,
  onApplyReferenceDecoration,
  onResetDecoration,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: DecorateBarProps) {
  return (
    <div className="toolbar-glass">
      {/* Primary actions: Reference Preset & 3D Beads */}
      <div className="preset-row">
        <button
          onClick={onApplyReferenceDecoration}
          className="btn-accent-preset"
          title="Applies the full ornate pattern from the reference image"
        >
          <Sparkles size={16} />
          <span>Apply Reference Diya Pattern</span>
        </button>

        <button
          onClick={() => onUpdateSettings({ enableBeads: !settings.enableBeads })}
          className={`toggle-btn ${settings.enableBeads ? 'active' : ''}`}
          title="Toggle 3D golden spherical bead studs along rim and front"
        >
          <Gem size={15} />
          <span>3D Golden Beads: {settings.enableBeads ? 'ON' : 'OFF'}</span>
        </button>

        <button
          onClick={onResetDecoration}
          className="btn-secondary"
          title="Reset to raw clay"
        >
          <RotateCcw size={14} />
          <span>Clear Paint</span>
        </button>
      </div>

      {/* Brush tools and Color swatches */}
      <div className="controls-row">
        {/* Tool selector */}
        <div className="tools-subgroup">
          <button
            onClick={() => onUpdateSettings({ tool: 'paint' })}
            className={`brush-btn ${settings.tool === 'paint' ? 'active' : ''}`}
            title="Freehand Paint Brush"
          >
            <Paintbrush size={16} />
            <span className="btn-label">Brush</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ tool: 'stamp_lotus' })}
            className={`brush-btn ${settings.tool === 'stamp_lotus' ? 'active' : ''}`}
            title="Stamp Lotus Petal"
          >
            <Flower2 size={16} />
            <span className="btn-label">Lotus</span>
          </button>

          <button
            onClick={() => onUpdateSettings({ tool: 'stamp_dot' })}
            className={`brush-btn ${settings.tool === 'stamp_dot' ? 'active' : ''}`}
            title="Stamp Bead Dot"
          >
            <CircleDot size={16} />
            <span className="btn-label">Dot</span>
          </button>
        </div>

        {/* Color Palette */}
        <div className="palette-row">
          {PALETTE.map((c) => (
            <button
              key={c.color}
              onClick={() => onUpdateSettings({ color: c.color })}
              className={`color-swatch ${settings.color === c.color ? 'selected' : ''}`}
              style={{ backgroundColor: c.color }}
              title={c.name}
            />
          ))}
        </div>

        {/* Brush Size */}
        <div className="slider-control">
          <label htmlFor="dec-size-input">Size</label>
          <input
            id="dec-size-input"
            type="range"
            min="10"
            max="80"
            step="5"
            value={settings.brushSize}
            onChange={(e) => onUpdateSettings({ brushSize: parseInt(e.target.value, 10) })}
          />
        </div>

        {/* Undo / Redo */}
        <div className="undo-redo-group">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="icon-action-btn"
            title="Undo Paint"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="icon-action-btn"
            title="Redo Paint"
          >
            <Redo2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

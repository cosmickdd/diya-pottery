import { X, Check } from 'lucide-react';

interface ReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferenceModal({ isOpen, onClose }: ReferenceModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="reference-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Authoritative Visual Reference</h3>
            <p className="modal-subtitle">Traditional Indian Ornate Diya</p>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Close">
            <X size={20} />
          </button>
        </div>

        <div className="reference-image-wrapper">
          <img
            src="/diya.png"
            alt="Reference Diya"
            className="reference-full-img"
          />
        </div>

        <div className="reference-features-list">
          <div className="feature-item">
            <Check size={16} className="feature-check" />
            <span><strong>Form:</strong> Wide, shallow, horizontally elongated elliptical silhouette.</span>
          </div>
          <div className="feature-item">
            <Check size={16} className="feature-check" />
            <span><strong>Front Body:</strong> Downward chevron crest, concentric medallion & lotus flame petals.</span>
          </div>
          <div className="feature-item">
            <Check size={16} className="feature-check" />
            <span><strong>Inner Basin:</strong> Radiant multi-tiered Lotus Mandala with dark stippled center & wick.</span>
          </div>
          <div className="feature-item">
            <Check size={16} className="feature-check" />
            <span><strong>Rim & Ornaments:</strong> Thick rounded golden rim with red dots & 3D bead studs.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

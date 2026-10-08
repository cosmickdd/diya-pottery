export type ThreeStepStageId =
  | 'stage_01_shape'     // 1. Shape from raw mitti via gesture points on spinning wheel
  | 'stage_02_fire'      // 2. Kiln firing with heat, embers & terracotta transformation (Pottery 2 style)
  | 'stage_03_reveal';   // 3. Final sacred presentation with lit flame & 360 inspection

// Backward compatibility alias
export type PotteryStageId = ThreeStepStageId | string;

export type ShapeSubStep =
  | 'lump'       // Raw clay mound on wooden wheel
  | 'basin'      // Hollowed deep reservoir
  | 'wide_crest'; // Complete voluptuous diya with front chevron crest & wick spout

export interface ThreeStepStageInfo {
  id: ThreeStepStageId;
  stepNumber: number;
  title: string;
  hindiTitle: string;
  subtitle: string;
}

export interface GesturePoint {
  id: string;
  position: [number, number, number];
  label: string;
  action: () => void;
}

// Backward compatibility types for legacy components
export interface PotteryStageInfo {
  id: string;
  stepNumber: number;
  title: string;
  hindiTitle: string;
  instruction: string;
  beaconLabel: string;
  beaconPosition: [number, number, number];
}
export type BrushType = 'push' | 'pull' | 'smooth' | 'flatten' | 'inflate' | 'rim' | 'front';
export interface BrushSettings {
  type: BrushType;
  radius: number;
  strength: number;
  symmetry: boolean;
}
export interface DecorateSettings {
  tool: string;
  color: string;
  brushSize: number;
  opacity: number;
  enableBeads: boolean;
}

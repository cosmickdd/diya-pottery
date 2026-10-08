import type { PotteryStageId, PotteryStageInfo } from '../types/pottery';

export const STAGES: PotteryStageInfo[] = [
  {
    id: 'stage_01_lump',
    stepNumber: 1,
    title: 'Raw Mitti Lump',
    hindiTitle: 'कच्ची मिट्टी का पिंड',
    instruction: 'A soft, organic mound of wet greyish-brown mitti sits on the wooden wheel. Touch the center to begin.',
    beaconLabel: 'Touch Center to Hollow',
    beaconPosition: [0, 0.88, 0],
  },
  {
    id: 'stage_02_basin',
    stepNumber: 2,
    title: 'Hollow Oil Basin',
    hindiTitle: 'पात्र को गहरा करें',
    instruction: 'The thumbs hollow out the sacred oil basin. Touch the rim to expand the clay into the wide diya body.',
    beaconLabel: 'Touch Rim to Expand',
    beaconPosition: [1.32, 0.62, 0],
  },
  {
    id: 'stage_03_wide_bowl',
    stepNumber: 3,
    title: 'Wide Diya Silhouette',
    hindiTitle: 'विशाल दीया रूप',
    instruction: 'The clay expands into the wide, low-profile elliptical diya bowl. Touch the front rim to shape the iconic crest.',
    beaconLabel: 'Touch Front to Shape Crest',
    beaconPosition: [0, 0.72, 1.55],
  },
  {
    id: 'stage_04_front_crest',
    stepNumber: 4,
    title: 'Ornamental Front Crest',
    hindiTitle: 'अग्रभाग शिखर',
    instruction: 'The front rim pulls downward into the chevron crest and shield contour from the reference. Touch center to place the wick.',
    beaconLabel: 'Touch Center to Seat Wick',
    beaconPosition: [0, 0.16, 0],
  },
  {
    id: 'stage_05_wick_finish',
    stepNumber: 5,
    title: 'Sacred Wick & Polish',
    hindiTitle: 'पवित्र बाती व पूर्णता',
    instruction: 'The surface is sponge-smoothed to leather-hard perfection and the sacred cotton wick is seated in the reservoir.',
    beaconLabel: 'Touch to Reveal Creation',
    beaconPosition: [0, 0.8, 0],
  },
  {
    id: 'stage_06_reveal',
    stepNumber: 6,
    title: 'Divine Reveal',
    hindiTitle: 'दिव्य दर्शन',
    instruction: 'Your authentic handcrafted clay Diya is complete. Rotate freely, inspect every angle, and save a high-res portrait.',
    beaconLabel: 'Handcrafted Complete',
    beaconPosition: [0, 0, 0],
  },
];

export function getStageIndex(id: PotteryStageId): number {
  return STAGES.findIndex((s) => s.id === id);
}

export function getStageByIndex(index: number): PotteryStageInfo {
  return STAGES[Math.max(0, Math.min(STAGES.length - 1, index))];
}

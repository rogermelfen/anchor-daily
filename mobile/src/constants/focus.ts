// ============================================
// Anchor Daily - Focus Area Constants
// ============================================
import { FocusArea } from '../types';

export const FOCUS_LABELS: Record<FocusArea, string> = {
  stress: 'Stress & Anxiety',
  decisions: 'Difficult Decisions',
  relationships: 'Relationships & Conflict',
};

export const FOCUS_VERSES: Record<FocusArea, string> = {
  stress: '"Cast all your anxiety on him." — 1 Pet. 5:7',
  decisions: '"Trust in the Lord with all your heart." — Prov. 3:5',
  relationships: '"Bear with each other and forgive." — Col. 3:13',
};

export const FOCUS_ICONS: Record<FocusArea, string> = {
  stress: 'leaf-outline',
  decisions: 'compass-outline',
  relationships: 'heart-outline',
};

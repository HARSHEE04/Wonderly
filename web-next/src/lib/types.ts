// Mirrors src/core/types/visual.ts (backend contract) and lib/data/models.dart
// (Flutter's client-side shapes). Field names match the backend exactly so
// this frontend can be swapped in without touching src/** or computer_vision/**.

export type IngredientType = 'color' | 'shape' | 'texture' | 'line' | 'pattern' | 'semanticObject';
export type ChallengeType = 'character' | 'poster' | 'architecture' | 'abstract' | 'pattern' | 'composition';

export interface BaseVisualFeature {
  id: string;
  confidence?: number;
  label?: string;
}

export interface ColorFeature extends BaseVisualFeature {
  hex?: string;
  name?: string;
}
export interface ShapeFeature extends BaseVisualFeature {
  contourId?: string;
}
export interface TextureFeature extends BaseVisualFeature {
  assetId?: string;
}
export interface LineFeature extends BaseVisualFeature {
  orientation?: 'vertical' | 'horizontal' | 'diagonal' | 'other';
}
export interface PatternFeature extends BaseVisualFeature {
  patternType?: string;
}
export interface ObjectFeature extends BaseVisualFeature {
  objectType?: string;
}

export interface SceneAnalysis {
  colors: ColorFeature[];
  shapes: ShapeFeature[];
  textures: TextureFeature[];
  lines: LineFeature[];
  patterns: PatternFeature[];
  semanticObjects?: ObjectFeature[];
}

export interface ChallengeDecision {
  challengeTemplateId: string;
  challengeType: ChallengeType;
  difficulty: number;
  matchedIngredients: { type: string; featureId: string }[];
  requiredIngredientTypes: string[];
  reasonCodes: string[];
}

export type LearningElementCategory = 'shape' | 'color' | 'line' | 'texture' | 'pattern';

export interface LearningElement {
  category: string;
  name: string;
  description: string;
  artisticUse: string;
  effect: string;
  howToUse: string;
  activity: string;
}

export interface LearningContent {
  summary: string;
  elements: LearningElement[];
}

export interface LearnSessionResult {
  sessionId: string;
  decision?: Record<string, unknown> | null;
  learningContent: LearningContent;
}

export interface CreativeChallenge {
  instanceId?: string;
  title: string;
  instructions: string;
  difficulty: number;
  challengeType: string;
  inspiredByConcept?: string;
  templateId?: string;
  reasonCodes?: string[];
}

export function creativeChallengeFromInstance(json: Record<string, unknown>): CreativeChallenge {
  return {
    instanceId: json.id as string,
    title: json.title as string,
    instructions: json.instructions as string,
    difficulty: Number(json.difficulty),
    challengeType: json.challengeType as string,
    templateId: json.templateId as string,
    reasonCodes: (json.reasonCodes as string[] | undefined) ?? undefined,
  };
}

/** One saved piece in the user's Library — mirrors lib/data/models.dart's LibraryEntry. */
export interface LibraryEntry {
  id: string;
  challengeTitle: string;
  origin: 'Create' | 'Learn';
  conceptTitle?: string;
  photoTint: string;
  photoGlyph: string;
  date: string;
  /** Data URL (base64) of the user's uploaded photo, if any. */
  photoDataUrl?: string;
  remoteId?: string;
}

export interface VisionAnalysisResult {
  sceneAnalysis: Record<string, unknown>;
  decision?: Record<string, unknown> | null;
}

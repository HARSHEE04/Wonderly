export type IngredientType =
  | 'color'
  | 'shape'
  | 'texture'
  | 'line'
  | 'pattern'
  | 'semanticObject';

export type ChallengeType =
  | 'character'
  | 'poster'
  | 'architecture'
  | 'abstract'
  | 'pattern'
  | 'composition';

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

export interface ChallengeTemplate {
  id: string;
  type: ChallengeType;
  name: string;
  requiredIngredientTypes: IngredientType[];
  optionalIngredientTypes?: IngredientType[];
  concepts?: string[];
  difficulty: number;
  enabled: boolean;
}

export interface ChallengeDecision {
  challengeTemplateId: string;
  challengeType: ChallengeType;
  difficulty: number;
  matchedIngredients: {
    type: string;
    featureId: string;
  }[];
  requiredIngredientTypes: string[];
  reasonCodes: string[];
  personalizationContext?: {
    underusedConcepts?: string[];
    recentChallengeTypes?: string[];
  };
}

export interface LearningConceptProgress {
  concept: string;
  timesSeen: number;
  timesPracticed: number;
  lastSeenAt?: Date | string | null;
  lastPracticedAt?: Date | string | null;
}

export interface LearningProgressRecord {
  userId: string;
  concepts: LearningConceptProgress[];
  updatedAt: Date | string;
}

export interface LearningResource {
  concept: string;
  title: string;
  url: string;
  source: string;
  summary?: string;
  retrievedAt?: Date | string;
  verified?: boolean;
}

export type CreativeSourceMode = 'standalone' | 'learning';

export interface CreativeLearningContext {
  focusConcept: string;
  learningInsight: string;
  learningEvidence?: string[];
}

export interface CreativeGenerationContext {
  sessionId: string;
  sourceMode: CreativeSourceMode;
  challengeDecision: ChallengeDecision;
  selectedSceneFeatures: SceneAnalysis;
  personalization?: {
    underusedConcepts: string[];
    recentChallengeTypes: string[];
  };
  learningContext?: CreativeLearningContext;
}

export interface ChallengeInstance {
  generationSource?: 'openai' | 'fallback';
  reasonCodes?: string[];
  id: string;
  userId: string;
  sessionId: string;
  templateId: string;
  challengeType: ChallengeType;
  difficulty: number;
  sourceMode: CreativeSourceMode;
  title: string;
  instructions: string;
  focusConcepts: string[];
  usedSceneFeatures: ChallengeDecision['matchedIngredients'];
  whyThisFitsScene: string[];
  learningContext?: CreativeLearningContext;
  createdAt: Date | string;
  updatedAt: Date | string;
}

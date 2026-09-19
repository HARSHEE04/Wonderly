import type {
  ChallengeDecision,
  ChallengeTemplate,
  ChallengeType,
  IngredientType,
  SceneAnalysis
} from '../core/types/visual.js';

export type SceneRecord = SceneAnalysis;

export type ChallengeHistoryEntry = {
  challengeType: ChallengeType;
  completedAt?: Date | string;
};

export type UserHistorySummary = {
  challengeTypes: Partial<Record<ChallengeType, number>>;
  conceptExposure?: Record<string, number>;
};

export const defaultChallengeTemplates: ChallengeTemplate[] = [
  {
    id: 'tpl-character',
    type: 'character',
    name: 'Character Challenge',
    requiredIngredientTypes: ['shape', 'color', 'texture'],
    optionalIngredientTypes: ['semanticObject', 'line'],
    concepts: ['shape', 'color', 'texture', 'composition'],
    difficulty: 3,
    enabled: true
  },
  {
    id: 'tpl-poster',
    type: 'poster',
    name: 'Poster Challenge',
    requiredIngredientTypes: ['color', 'pattern'],
    optionalIngredientTypes: ['shape', 'line'],
    concepts: ['color', 'pattern', 'contrast'],
    difficulty: 2,
    enabled: true
  },
  {
    id: 'tpl-architecture',
    type: 'architecture',
    name: 'Architecture Challenge',
    requiredIngredientTypes: ['shape', 'line', 'texture'],
    optionalIngredientTypes: ['semanticObject', 'color'],
    concepts: ['perspective', 'line', 'shape', 'composition'],
    difficulty: 3,
    enabled: true
  },
  {
    id: 'tpl-abstract',
    type: 'abstract',
    name: 'Abstract Challenge',
    requiredIngredientTypes: ['color'],
    optionalIngredientTypes: ['line', 'texture', 'shape'],
    concepts: ['color', 'contrast', 'composition'],
    difficulty: 2,
    enabled: true
  },
  {
    id: 'tpl-pattern',
    type: 'pattern',
    name: 'Pattern Challenge',
    requiredIngredientTypes: ['pattern'],
    optionalIngredientTypes: ['shape', 'line'],
    concepts: ['repetition', 'pattern', 'symmetry'],
    difficulty: 2,
    enabled: true
  },
  {
    id: 'tpl-composition',
    type: 'composition',
    name: 'Composition Challenge',
    requiredIngredientTypes: ['line'],
    optionalIngredientTypes: ['shape', 'color', 'texture'],
    concepts: ['composition', 'perspective', 'symmetry'],
    difficulty: 2,
    enabled: true
  }
];

const ingredientTypeToProperty: Record<IngredientType, keyof SceneAnalysis> = {
  color: 'colors',
  shape: 'shapes',
  texture: 'textures',
  line: 'lines',
  pattern: 'patterns',
  semanticObject: 'semanticObjects'
};

const defaultConceptExposure: Record<string, number> = {
  color: 0,
  shape: 0,
  texture: 0,
  line: 0,
  pattern: 0,
  perspective: 0,
  symmetry: 0,
  repetition: 0,
  composition: 0,
  contrast: 0
};

const challengeTypeWeights: Record<ChallengeType, number> = {
  character: 1.2,
  poster: 1.1,
  architecture: 1.15,
  abstract: 1,
  pattern: 1.05,
  composition: 1.08
};

export function validateSceneAnalysis(scene: unknown): asserts scene is SceneAnalysis {
  if (!scene || typeof scene !== 'object') {
    throw new Error('Scene analysis must be an object');
  }

  const candidate = scene as Record<string, unknown>;
  const requiredCollections = ['colors', 'shapes', 'textures', 'lines', 'patterns'];

  for (const key of requiredCollections) {
    if (!Array.isArray(candidate[key])) {
      throw new Error(`Invalid scene analysis: ${key} must be an array`);
    }
  }

  if (candidate.semanticObjects !== undefined && !Array.isArray(candidate.semanticObjects)) {
    throw new Error('Invalid scene analysis: semanticObjects must be an array');
  }
}

export function getEligibleChallenges(scene: SceneAnalysis, templates: ChallengeTemplate[]) {
  validateSceneAnalysis(scene);

  const eligible: Array<{ template: ChallengeTemplate; matchedIngredients: string[]; missingIngredients: string[] }> = [];
  const rejected: Array<{ template: ChallengeTemplate; reason: string; missingIngredients: string[] }> = [];

  for (const template of templates.filter((item) => item.enabled)) {
    const required: IngredientType[] = template.requiredIngredientTypes;
    const matchedIngredients: string[] = [];
    const missingIngredients: string[] = [];

    for (const ingredient of required) {
      const property = ingredientTypeToProperty[ingredient];
      const group = scene[property] ?? [];

      if (group.length > 0) {
        matchedIngredients.push(ingredient);
      } else {
        missingIngredients.push(ingredient);
      }
    }

    if (missingIngredients.length === 0) {
      eligible.push({ template, matchedIngredients, missingIngredients });
    } else {
      rejected.push({
        template,
        reason: `Missing required ingredients: ${missingIngredients.join(', ')}`,
        missingIngredients
      });
    }
  }

  return { eligible: eligible.map((entry) => entry.template), rejected };
}

export function getUnderusedConcepts(conceptExposure: Record<string, number>): string[] {
  const allConcepts = Object.keys({ ...defaultConceptExposure, ...conceptExposure });
  const lowThreshold = 1;

  return allConcepts
    .filter((concept) => (conceptExposure[concept] ?? 0) <= lowThreshold)
    .sort((a, b) => (conceptExposure[a] ?? 0) - (conceptExposure[b] ?? 0));
}

export function summarizeExposure(conceptExposure: Record<string, number>) {
  return { ...defaultConceptExposure, ...conceptExposure };
}

export function buildPersonalizationContext(history: UserHistorySummary) {
  const recentChallengeTypes = Object.entries(history.challengeTypes)
    .filter(([, count]) => (count ?? 0) > 0)
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .map(([name]) => name)
    .slice(0, 5);

  const underusedConcepts = getUnderusedConcepts(history.conceptExposure ?? defaultConceptExposure);

  return {
    underusedConcepts,
    recentChallengeTypes
  };
}

export function scoreChallenge(
  template: ChallengeTemplate,
  scene: SceneAnalysis,
  history: UserHistorySummary = { challengeTypes: {}, conceptExposure: {} }
) {
  validateSceneAnalysis(scene);

  const requiredMatches = template.requiredIngredientTypes.filter((ingredient) => {
    const group = scene[ingredientTypeToProperty[ingredient]] ?? [];
    return group.length > 0;
  }).length;

  const optionalMatches = (template.optionalIngredientTypes ?? []).filter((ingredient) => {
    const group = scene[ingredientTypeToProperty[ingredient as IngredientType]] ?? [];
    return group.length > 0;
  }).length;

  const visibleIngredientCount = ['colors', 'shapes', 'textures', 'lines', 'patterns', 'semanticObjects'].reduce((count, key) => {
    const value = scene[key as keyof SceneAnalysis];
    return count + (Array.isArray(value) && value.length > 0 ? 1 : 0);
  }, 0);

  const structuralCoverage = template.requiredIngredientTypes.length;
  const ingredientSupportRatio = requiredMatches / Math.max(structuralCoverage, 1);
  const sceneFitRatio = requiredMatches / Math.max(visibleIngredientCount, 1);
  const optionalSupportRatio = optionalMatches / Math.max((template.optionalIngredientTypes ?? []).length, 1);

  const recentPenalty = (history.challengeTypes?.[template.type] ?? 0) * 12;
  const conceptBoost = (template.concepts ?? []).reduce((total, concept) => {
    const exposure = history.conceptExposure?.[concept] ?? 0;
    return total + (exposure === 0 ? 1.5 : 0.15 * Math.max(0, 3 - exposure));
  }, 0);

  const noveltyBonus = challengeTypeWeights[template.type] ?? 1;
  const difficultyFit = 1 - Math.abs((template.difficulty ?? 2) - 2.5) * 0.2;
  const specificityBonus = Math.max(0, (requiredMatches - 1) * 12);

  const score =
    sceneFitRatio * 55 +
    ingredientSupportRatio * 25 +
    optionalSupportRatio * 12 +
    conceptBoost * 8 +
    noveltyBonus * 8 +
    difficultyFit * 18 +
    specificityBonus -
    recentPenalty;

  return {
    templateId: template.id,
    score,
    breakdown: {
      sceneFitRatio,
      ingredientSupportRatio,
      optionalSupportRatio,
      conceptBoost,
      noveltyBonus,
      difficultyFit,
      specificityBonus,
      recentPenalty
    }
  };
}

export function recommendChallenge(
  scene: SceneAnalysis,
  templates: ChallengeTemplate[] = defaultChallengeTemplates,
  history: UserHistorySummary = { challengeTypes: {}, conceptExposure: {} }
) {
  validateSceneAnalysis(scene);

  const { eligible } = getEligibleChallenges(scene, templates);

  const scored = eligible
    .map((template) => ({
      template,
      ...scoreChallenge(template, scene, history)
    }))
    .sort((a, b) => b.score - a.score);

  const recommended = scored[0]?.template ?? null;
  const recommendation = recommended
    ? {
        challengeTemplateId: recommended.id,
        challengeType: recommended.type,
        difficulty: recommended.difficulty,
        matchedIngredients: (recommended.requiredIngredientTypes ?? []).flatMap((ingredient) => {
          const group = scene[ingredientTypeToProperty[ingredient]] ?? [];
          return group.slice(0, 1).map((feature) => ({
            type: ingredient,
            featureId: feature.id
          }));
        }),
        requiredIngredientTypes: recommended.requiredIngredientTypes,
        reasonCodes: [
          `eligible_for_${recommended.type}`,
          `scene_matches_${recommended.requiredIngredientTypes.join('_')}`
        ],
        personalizationContext: buildPersonalizationContext(history)
      }
    : null;

  return {
    eligibleChallenges: eligible,
    recommendedChallenge: recommended,
    decision: recommendation,
    scoredChallenges: scored.map(({ template, score, breakdown }) => ({
      templateId: template.id,
      type: template.type,
      score,
      breakdown
    }))
  };
}

export function buildGeminiContext(sessionId: string, scene: SceneAnalysis, decision: ChallengeDecision) {
  return {
    sessionId,
    challengeDecision: decision,
    selectedSceneFeatures: scene,
    personalization: decision.personalizationContext ?? {
      underusedConcepts: [],
      recentChallengeTypes: []
    }
  };
}

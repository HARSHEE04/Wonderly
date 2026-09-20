import { describe, expect, it } from 'vitest';
import { buildCreativeGenerationContext, buildPersonalizationContext, defaultChallengeTemplates, getEligibleChallenges, getUnderusedConcepts, recommendChallenge, summarizeExposure } from './engine.js';
const characterScene = {
    colors: [{ id: 'color-1', name: 'forest green', hex: '#527A49' }],
    shapes: [{ id: 'shape-1', label: 'circle' }],
    textures: [{ id: 'texture-1', label: 'concrete' }],
    lines: [{ id: 'line-1', orientation: 'vertical' }],
    patterns: []
};
const weakScene = {
    colors: [{ id: 'color-1', name: 'blue', hex: '#0000FF' }],
    shapes: [],
    textures: [],
    lines: [],
    patterns: []
};
describe('product engine', () => {
    it('marks character as eligible when color + shape + texture are present', () => {
        const result = getEligibleChallenges(characterScene, defaultChallengeTemplates);
        expect(result.eligible.some((challenge) => challenge.type === 'character')).toBe(true);
        expect(result.rejected.some((challenge) => challenge.template.type === 'character')).toBe(false);
    });
    it('rejects character when essential ingredients are missing', () => {
        const result = getEligibleChallenges(weakScene, defaultChallengeTemplates);
        expect(result.eligible.some((challenge) => challenge.type === 'character')).toBe(false);
        expect(result.rejected.some((challenge) => challenge.template.type === 'character')).toBe(true);
    });
    it('ranks multiple eligible challenges and prefers the best fit', () => {
        const result = recommendChallenge(characterScene, defaultChallengeTemplates, { challengeTypes: {}, conceptExposure: {} });
        expect(result.recommendedChallenge.type).toBe('character');
        expect(result.eligibleChallenges.length).toBeGreaterThan(1);
    });
    it('avoids repetition by favoring newer challenge types', () => {
        const history = {
            challengeTypes: {
                character: 5,
                architecture: 1,
                poster: 0,
                abstract: 0,
                pattern: 0,
                composition: 0
            },
            conceptExposure: {
                color: 5,
                shape: 3,
                texture: 2,
                perspective: 0,
                symmetry: 0,
                repetition: 0,
                composition: 0,
                contrast: 0
            }
        };
        const result = recommendChallenge(characterScene, defaultChallengeTemplates, history);
        expect(result.recommendedChallenge.type).toBe('architecture');
    });
    it('identifies underused concepts for personalization', () => {
        const exposure = {
            color: 5,
            shape: 4,
            texture: 3,
            perspective: 0,
            symmetry: 1,
            repetition: 0,
            composition: 0,
            contrast: 1
        };
        const underused = getUnderusedConcepts(exposure);
        expect(underused).toContain('perspective');
        expect(underused).toContain('repetition');
    });
    it('builds personalization context from user exposure', () => {
        const context = buildPersonalizationContext({
            challengeTypes: {
                character: 3,
                architecture: 1,
                poster: 0,
                abstract: 0,
                pattern: 0,
                composition: 0
            },
            conceptExposure: {
                color: 2,
                shape: 1,
                texture: 1,
                perspective: 0,
                symmetry: 0,
                repetition: 0,
                composition: 0,
                contrast: 1
            }
        });
        expect(context.underusedConcepts.length).toBeGreaterThan(0);
        expect(context.recentChallengeTypes.length).toBeGreaterThan(0);
    });
    it('builds a provider-neutral creative generation context without learning context', () => {
        const recommendation = recommendChallenge(characterScene);
        const decision = recommendation.decision;
        if (!decision) {
            throw new Error('Expected a deterministic challenge decision');
        }
        const context = buildCreativeGenerationContext('session-123', characterScene, decision);
        expect(context.sessionId).toBe('session-123');
        expect(context.sourceMode).toBe('standalone');
        expect(context.selectedSceneFeatures).toEqual(characterScene);
        expect(context.challengeDecision).toEqual(decision);
        expect(context.personalization).toEqual(decision.personalizationContext);
        expect(context.learningContext).toBeUndefined();
    });
    it('summarizes progress exposure counts', () => {
        const summary = summarizeExposure({
            color: 2,
            shape: 1,
            texture: 0,
            perspective: 3,
            symmetry: 2,
            repetition: 1,
            composition: 1,
            contrast: 0
        });
        expect(summary.color).toBe(2);
        expect(summary.perspective).toBe(3);
    });
    it('rejects malformed scenes consistently', () => {
        const invalidScene = {
            colors: 'not-an-array',
            shapes: [],
            textures: [],
            lines: [],
            patterns: []
        };
        expect(() => getEligibleChallenges(invalidScene, defaultChallengeTemplates)).toThrow();
    });
});

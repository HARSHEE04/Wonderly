import { describe, expect, it } from 'vitest';
import { getLearningProgress, markConceptsSeen, markConceptsPracticed, getConceptExposure } from './learningProgressService.js';
import { scoreChallenge, defaultChallengeTemplates } from '../product/engine.js';
import { mockScenes } from '../data/mockScenes.js';
describe('learningProgressService', () => {
    it('returns a valid empty/default progress record for a brand new user', async () => {
        const progress = await getLearningProgress('lp-new-user');
        expect(progress.userId).toBe('lp-new-user');
        expect(progress.concepts).toEqual([]);
    });
    it('marks concepts as seen without marking them practiced', async () => {
        const userId = 'lp-seen-user';
        await markConceptsSeen(userId, ['symmetry', 'composition']);
        const progress = await getLearningProgress(userId);
        const symmetry = progress.concepts.find((c) => c.concept === 'symmetry');
        const composition = progress.concepts.find((c) => c.concept === 'composition');
        expect(symmetry?.timesSeen).toBe(1);
        expect(symmetry?.timesPracticed).toBe(0);
        expect(composition?.timesSeen).toBe(1);
        expect(composition?.timesPracticed).toBe(0);
    });
    it('increments timesPracticed independently once a concept is actually practiced', async () => {
        const userId = 'lp-practiced-user';
        await markConceptsSeen(userId, ['perspective']);
        await markConceptsPracticed(userId, ['perspective']);
        const progress = await getLearningProgress(userId);
        const perspective = progress.concepts.find((c) => c.concept === 'perspective');
        expect(perspective?.timesSeen).toBe(1);
        expect(perspective?.timesPracticed).toBe(1);
    });
    it('updates all concepts in a multi-concept challenge correctly', async () => {
        const userId = 'lp-multi-user';
        await markConceptsSeen(userId, ['color', 'shape', 'texture']);
        await markConceptsPracticed(userId, ['color', 'shape', 'texture']);
        const progress = await getLearningProgress(userId);
        for (const concept of ['color', 'shape', 'texture']) {
            const entry = progress.concepts.find((c) => c.concept === concept);
            expect(entry?.timesSeen).toBe(1);
            expect(entry?.timesPracticed).toBe(1);
        }
    });
    it('persists accumulated state across repeated calls', async () => {
        const userId = 'lp-persist-user';
        await markConceptsSeen(userId, ['pattern']);
        await markConceptsSeen(userId, ['pattern']);
        await markConceptsPracticed(userId, ['pattern']);
        const progress = await getLearningProgress(userId);
        const pattern = progress.concepts.find((c) => c.concept === 'pattern');
        expect(pattern?.timesSeen).toBe(2);
        expect(pattern?.timesPracticed).toBe(1);
    });
    it('feeds concept exposure into challenge scoring so underused concepts get a boost', async () => {
        const userId = 'lp-personalization-user';
        // Heavily practiced concept vs. a concept the user has never practiced.
        await markConceptsPracticed(userId, ['composition', 'composition', 'composition'].slice(0, 1));
        for (let i = 0; i < 5; i += 1) {
            await markConceptsPracticed(userId, ['composition']);
        }
        const exposure = await getConceptExposure(userId);
        expect(exposure.composition).toBeGreaterThan(0);
        expect(exposure.perspective ?? 0).toBe(0);
        const architectureTemplate = defaultChallengeTemplates.find((t) => t.type === 'architecture');
        const compositionTemplate = defaultChallengeTemplates.find((t) => t.type === 'composition');
        const historyWithExposure = { challengeTypes: {}, conceptExposure: exposure };
        const historyWithoutExposure = { challengeTypes: {}, conceptExposure: {} };
        const scoreCompositionWithExposure = scoreChallenge(compositionTemplate, mockScenes.architectureFriendly, historyWithExposure);
        const scoreCompositionWithoutExposure = scoreChallenge(compositionTemplate, mockScenes.architectureFriendly, historyWithoutExposure);
        // A heavily-practiced concept should receive a smaller concept boost than
        // an unpracticed one, all else equal.
        expect(scoreCompositionWithExposure.breakdown.conceptBoost).toBeLessThan(scoreCompositionWithoutExposure.breakdown.conceptBoost);
        // Scene compatibility must still matter: architecture stays scoreable on
        // an architecture-friendly scene regardless of concept exposure.
        const scoreArchitecture = scoreChallenge(architectureTemplate, mockScenes.architectureFriendly, historyWithExposure);
        expect(scoreArchitecture.score).toBeGreaterThan(0);
    });
});

import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from './server.js';
import { mockScenes } from './data/mockScenes.js';
describe('backend API', () => {
    it('returns healthy status', async () => {
        const response = await request(app).get('/api/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });
    it('runs the full session lifecycle: create -> scene -> recommend -> complete', async () => {
        const createResponse = await request(app).post('/api/sessions').send({ userId: 'test-user-1', mode: 'creative' });
        expect(createResponse.status).toBe(201);
        const sessionId = createResponse.body.data.id;
        expect(sessionId).toBeTruthy();
        const scene = { ...mockScenes.characterFriendly, semanticObjects: [] };
        const sceneResponse = await request(app)
            .post(`/api/sessions/${sessionId}/scene-analysis`)
            .send(scene);
        expect(sceneResponse.status).toBe(200);
        const decision = sceneResponse.body.data.recommendation.decision;
        expect(decision.challengeType).toBe('character');
        const attachedSessionResponse = await request(app).get(`/api/sessions/${sessionId}`);
        expect(attachedSessionResponse.status).toBe(200);
        expect(attachedSessionResponse.body.data.sceneAnalysis.semanticObjects).toEqual([]);
        expect(attachedSessionResponse.body.data.selectedChallengeTemplateId).toBe(decision.challengeTemplateId);
        expect(attachedSessionResponse.body.data.challengeDecision).toEqual(decision);
        const challengeResponse = await request(app)
            .post(`/api/sessions/${sessionId}/challenge-instance`)
            .send({
            title: 'Build Rhythm From Vertical Lines',
            instructions: 'Repeat the scene lines and use its dominant color.'
        });
        expect(challengeResponse.status).toBe(201);
        const challengeInstance = challengeResponse.body.data;
        expect(challengeInstance.sessionId).toBe(sessionId);
        expect(challengeInstance.templateId).toBe(decision.challengeTemplateId);
        expect(challengeInstance.title).toBe('Build Rhythm From Vertical Lines');
        expect(challengeInstance.instructions).toBe('Repeat the scene lines and use its dominant color.');
        expect(challengeInstance.usedSceneFeatures).toEqual(decision.matchedIngredients);
        const storedChallengeResponse = await request(app).get(`/api/sessions/${sessionId}/challenge-instance`);
        expect(storedChallengeResponse.status).toBe(200);
        expect(storedChallengeResponse.body.data.id).toBe(challengeInstance.id);
        expect(storedChallengeResponse.body.data.title).toBe(challengeInstance.title);
        const completeResponse = await request(app)
            .post(`/api/sessions/${sessionId}/complete`)
            .send({ userId: 'test-user-1', artworkMetadata: { title: 'My Test Art' } });
        expect(completeResponse.status).toBe(200);
        expect(completeResponse.body.data.status).toBe('completed');
        expect(completeResponse.body.data.result.completion.templateId).toBe(decision.challengeTemplateId);
        expect(completeResponse.body.data.result.completion.templateId).not.toBe('unknown');
        expect(completeResponse.body.data.result.completion.challengeInstanceId).toBe(challengeInstance.id);
        expect(completeResponse.body.data.result.artwork.challengeInstanceId).toBe(challengeInstance.id);
        const progressResponse = await request(app).get('/api/users/test-user-1/progress');
        expect(progressResponse.status).toBe(200);
        expect(progressResponse.body.data.completedChallengeCount).toBe(1);
        const artworksResponse = await request(app).get('/api/users/test-user-1/artworks');
        expect(artworksResponse.status).toBe(200);
        expect(artworksResponse.body.data.length).toBe(1);
    });
    it('rejects malformed scene analysis payloads with a validation error', async () => {
        const createResponse = await request(app).post('/api/sessions').send({ userId: 'test-user-2' });
        const sessionId = createResponse.body.data.id;
        const response = await request(app)
            .post(`/api/sessions/${sessionId}/scene-analysis`)
            .send({ colors: 'not-an-array' });
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
    });
    it('returns insufficient_features for a scene lacking enough ingredients', async () => {
        const emptyScene = { colors: [], shapes: [], textures: [], lines: [], patterns: [] };
        const response = await request(app).post('/api/challenges/recommend').send({ sceneAnalysis: emptyScene });
        expect(response.status).toBe(200);
        expect(response.body.data.status).toBe('insufficient_features');
    });
    it('records learning sessions as learning-sourced challenge instances', async () => {
        const createResponse = await request(app).post('/api/sessions').send({ userId: 'test-learning-source', mode: 'learning' });
        const sessionId = createResponse.body.data.id;
        await request(app).post(`/api/sessions/${sessionId}/scene-analysis`).send(mockScenes.characterFriendly);
        const challengeResponse = await request(app)
            .post(`/api/sessions/${sessionId}/challenge-instance`)
            .send({ title: 'Practice Symmetry', instructions: 'Use the scene to practice symmetry.' });
        expect(challengeResponse.status).toBe(201);
        expect(challengeResponse.body.data.sourceMode).toBe('learning');
    });
    it('stores artwork metadata directly through the artworks endpoint', async () => {
        const createResponse = await request(app).post('/api/sessions').send({ userId: 'test-user-3' });
        const sessionId = createResponse.body.data.id;
        const response = await request(app).post('/api/artworks').send({
            userId: 'test-user-3',
            sessionId,
            challengeTemplateId: 'tpl-character',
            metadata: { title: 'Standalone Artwork' }
        });
        expect(response.status).toBe(201);
        expect(response.body.data.metadata.title).toBe('Standalone Artwork');
        const artworksResponse = await request(app).get('/api/users/test-user-3/artworks');
        expect(artworksResponse.body.data.length).toBe(1);
    });
    it('falls back gracefully when requesting learning resources without Firecrawl credentials', async () => {
        const response = await request(app).get('/api/learning/resources').query({ concept: 'symmetry' });
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
    });
    it('records learning progress through the session lifecycle and exposes it via the progress endpoint', async () => {
        const userId = 'test-user-learning';
        const createResponse = await request(app).post('/api/sessions').send({ userId, mode: 'creative' });
        const sessionId = createResponse.body.data.id;
        // Selecting a challenge should mark its concepts as "seen" but not "practiced".
        const sceneResponse = await request(app)
            .post(`/api/sessions/${sessionId}/scene-analysis`)
            .send(mockScenes.characterFriendly);
        expect(sceneResponse.status).toBe(200);
        const challengeType = sceneResponse.body.data.recommendation.decision.challengeType;
        expect(challengeType).toBe('character');
        let progressResponse = await request(app).get(`/api/users/${userId}/progress`);
        let colorProgress = progressResponse.body.data.learning.concepts.find((c) => c.concept === 'color');
        expect(colorProgress?.timesSeen).toBe(1);
        expect(colorProgress?.timesPracticed).toBe(0);
        // Retrying scene-analysis for the same session must not double-count "seen".
        await request(app).post(`/api/sessions/${sessionId}/scene-analysis`).send(mockScenes.characterFriendly);
        progressResponse = await request(app).get(`/api/users/${userId}/progress`);
        colorProgress = progressResponse.body.data.learning.concepts.find((c) => c.concept === 'color');
        expect(colorProgress?.timesSeen).toBe(1);
        // Completing the session should mark its concepts as "practiced".
        const completeResponse = await request(app)
            .post(`/api/sessions/${sessionId}/complete`)
            .send({ userId });
        expect(completeResponse.status).toBe(200);
        progressResponse = await request(app).get(`/api/users/${userId}/progress`);
        colorProgress = progressResponse.body.data.learning.concepts.find((c) => c.concept === 'color');
        expect(colorProgress?.timesSeen).toBe(1);
        expect(colorProgress?.timesPracticed).toBe(1);
        expect(progressResponse.body.data.learning.underusedConcepts).toBeDefined();
        // Completing the same session a second time must be rejected and must not
        // double-increment timesPracticed.
        const secondCompleteResponse = await request(app)
            .post(`/api/sessions/${sessionId}/complete`)
            .send({ userId });
        expect(secondCompleteResponse.status).toBe(409);
        progressResponse = await request(app).get(`/api/users/${userId}/progress`);
        colorProgress = progressResponse.body.data.learning.concepts.find((c) => c.concept === 'color');
        expect(colorProgress?.timesPracticed).toBe(1);
    });
});

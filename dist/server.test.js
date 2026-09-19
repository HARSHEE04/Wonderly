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
        const sceneResponse = await request(app)
            .post(`/api/sessions/${sessionId}/scene-analysis`)
            .send(mockScenes.characterFriendly);
        expect(sceneResponse.status).toBe(200);
        expect(sceneResponse.body.data.recommendation.decision.challengeType).toBe('character');
        const completeResponse = await request(app)
            .post(`/api/sessions/${sessionId}/complete`)
            .send({ userId: 'test-user-1', artworkMetadata: { title: 'My Test Art' } });
        expect(completeResponse.status).toBe(200);
        expect(completeResponse.body.data.status).toBe('completed');
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

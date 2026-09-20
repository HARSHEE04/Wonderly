import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import { env } from '../config/env.js';

const { parse } = vi.hoisted(() => ({ parse: vi.fn() }));
vi.mock('openai', () => ({ default: class { responses = { parse }; } }));
vi.mock('../config/env.js', () => ({ env: { openaiApiKey: '', openaiModel: 'test-model', corsOrigin: '*', firecrawlApiKey: '' } }));

const scene = {
  colors: [{ id: 'green', hex: '#245030' }], shapes: [{ id: 'circle', label: 'circle' }],
  textures: [], lines: [], patterns: [], semanticObjects: []
};

async function sessionFor(userId: string, mode = 'creative') {
  const created = await request(app).post('/api/sessions').send({ userId, mode });
  const sessionId = created.body.data.id;
  const attached = await request(app).post(`/api/sessions/${sessionId}/scene-analysis`).send(scene);
  expect(attached.status).toBe(200);
  return { sessionId, decision: attached.body.data.recommendation.decision };
}

describe('Creative generation', () => {
  beforeEach(() => { parse.mockReset(); env.openaiApiKey = ''; });

  it('persists fallback before returning, reuses it, lists history newest-first, and links completion', async () => {
    const { sessionId, decision } = await sessionFor('creative-history');
    const generated = await request(app).post(`/api/sessions/${sessionId}/creative-challenge`).send({});
    expect(generated.status).toBe(200);
    const instance = generated.body.data;
    expect(instance).toMatchObject({ generationSource: 'fallback', templateId: decision.challengeTemplateId, sourceMode: 'standalone' });
    expect(instance.instructions).toContain('#245030');
    expect(instance.instructions).toContain('circle');
    expect(instance.usedSceneFeatures).toHaveLength(2);
    const stored = await request(app).get(`/api/sessions/${sessionId}/challenge-instance`);
    expect(stored.body.data).toEqual(instance);
    env.openaiApiKey = 'test-key';
    const retry = await request(app).post(`/api/sessions/${sessionId}/creative-challenge`).send({});
    expect(retry.body.data).toEqual(instance);
    expect(parse).not.toHaveBeenCalled();
    env.openaiApiKey = '';
    const second = await sessionFor('creative-history');
    const newest = await request(app).post(`/api/sessions/${second.sessionId}/creative-challenge`).send({});
    const history = await request(app).get('/api/users/creative-history/challenge-instances');
    expect(history.body.data.map((item: { id: string }) => item.id)).toEqual([newest.body.data.id, instance.id]);
    expect((await request(app).get('/api/users/another-user/challenge-instances')).body.data).toEqual([]);
    const completed = await request(app).post(`/api/sessions/${sessionId}/complete`).send({ artworkMetadata: { title: instance.title } });
    expect(completed.body.data.result.completion.challengeInstanceId).toBe(instance.id);
    expect(completed.body.data.result.artwork.challengeInstanceId).toBe(instance.id);
  });

  it('saves validated model copy while retaining the deterministic decision', async () => {
    env.openaiApiKey = 'test-key';
    const { sessionId, decision } = await sessionFor('creative-openai');
    const copy = {
      title: 'Circles in Green', instructions: 'Build an abstract study from circles using the supplied green.',
      usedSceneFeatures: [{ type: 'color', featureId: 'green' }, { type: 'shape', featureId: 'circle' }],
      whyThisFitsScene: ['Uses the supplied circle and green.']
    };
    parse.mockResolvedValue({ output_parsed: copy });
    const generated = await request(app).post(`/api/sessions/${sessionId}/creative-challenge`).send({ challengeType: 'poster' });
    expect(generated.status).toBe(200);
    expect(generated.body.data).toMatchObject({ ...copy, generationSource: 'openai', challengeType: decision.challengeType, difficulty: decision.difficulty });
    const stored = await request(app).get(`/api/sessions/${sessionId}/challenge-instance`);
    expect(stored.body.data).toEqual(generated.body.data);
    const context = JSON.parse(parse.mock.calls[0][0].input);
    expect(context.selectedSceneFeatures.semanticObjects).toEqual([]);
    expect(context.challengeDecision).toEqual(decision);
    await request(app).post(`/api/sessions/${sessionId}/creative-challenge`).send({});
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it('generates and persists a learning-context challenge from the same session scene', async () => {
    env.openaiApiKey = 'test-key';
    const { sessionId, decision } = await sessionFor('learning-creative', 'learning');
    const learningContext = {
      focusConcept: 'color contrast',
      learningInsight: 'Contrasting colors create separation and emphasis.',
      learningEvidence: ['Place the supplied green beside a lighter color.', 'Make one focal area stand out.']
    };
    const copy = {
      title: 'Contrast the Circle',
      instructions: 'Practice color contrast by making the supplied circle stand out against green.',
      usedSceneFeatures: [{ type: 'color', featureId: 'green' }, { type: 'shape', featureId: 'circle' }],
      whyThisFitsScene: ['Uses the supplied green and circle to practice contrast.']
    };
    parse.mockResolvedValue({ output_parsed: copy });

    const generated = await request(app)
      .post(`/api/sessions/${sessionId}/creative-challenge`)
      .send({ learningContext });

    expect(generated.status).toBe(200);
    expect(generated.body.data).toMatchObject({
      ...copy,
      sourceMode: 'learning',
      learningContext,
      focusConcepts: ['color contrast'],
      templateId: decision.challengeTemplateId
    });
    const context = JSON.parse(parse.mock.calls[0][0].input);
    expect(context).toMatchObject({ sourceMode: 'learning', learningContext });
    expect(context.selectedSceneFeatures).toEqual(scene);
    const history = await request(app).get('/api/users/learning-creative/challenge-instances');
    expect(history.body.data[0]).toEqual(generated.body.data);
    await request(app).post(`/api/sessions/${sessionId}/creative-challenge`).send({ learningContext });
    expect(parse).toHaveBeenCalledTimes(1);
  });

  it.each(['request failure', 'invalid output'])('persists fallback after %s', async (failure) => {
    env.openaiApiKey = 'test-key';
    const { sessionId } = await sessionFor(`creative-${failure}`);
    if (failure === 'request failure') parse.mockRejectedValue(new Error('timeout'));
    else parse.mockResolvedValue({ output_parsed: { title: 'Made up', instructions: 'Draw a bottle.', usedSceneFeatures: [{ type: 'semanticObject', featureId: 'invented' }], whyThisFitsScene: ['A bottle.'] } });
    const response = await request(app).post(`/api/sessions/${sessionId}/creative-challenge`).send({});
    expect(response.status).toBe(200);
    expect(response.body.data.generationSource).toBe('fallback');
    expect(response.body.data.instructions).not.toContain('bottle');
  });
});

import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { isMongoConnected } from './database/mongo.js';
import { ApiError, normalizeError } from './core/errors.js';
import { challengeInstanceCreateSchema, creativeChallengeRequestSchema, sceneAnalysisSchema } from './api/validation/schemas.js';
import {
  createSession,
  createChallengeInstance,
  getSession,
  getChallengeInstance,
  recommendForScene,
  getUserProgress,
  getArtworksForUser,
  completeSession,
  getMockScene,
  updateSessionScene,
  addArtwork
} from './services/sessionService.js';
import { learningResourceService } from './services/learningResourceService.js';
import { generateLearningContent } from './services/learningContentService.js';
import { validateSceneAnalysis } from './product/engine.js';
import { getOrGenerateCreativeChallenge } from './services/creativeChallengeService.js';
import { getChallengeInstancesForUserRecord } from './database/repository.js';

const app = express();
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongo: isMongoConnected() ? 'connected' : 'disconnected'
  });
});

app.post('/api/sessions', async (req, res) => {
  try {
    const { userId, mode = 'creative' } = req.body ?? {};
    if (!userId || typeof userId !== 'string') {
      throw new ApiError('userId is required', 400);
    }

    const session = await createSession(userId, mode);
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.get('/api/sessions/:sessionId', async (req, res) => {
  try {
    const session = await getSession(req.params.sessionId);
    if (!session) {
      throw new ApiError('Session not found', 404);
    }
    res.json({ success: true, data: session });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.post('/api/sessions/:sessionId/scene-analysis', async (req, res) => {
  try {
    const scene = req.body;
    const parsed = sceneAnalysisSchema.parse(scene);
    validateSceneAnalysis(parsed);

    const session = await updateSessionScene(req.params.sessionId, parsed);
    const recommendation = await recommendForScene(parsed, session.userId, session.id);

    res.json({ success: true, data: { sessionId: session.id, recommendation } });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.post('/api/sessions/:sessionId/challenge-instance', async (req, res) => {
  try {
    const input = challengeInstanceCreateSchema.parse(req.body);
    const instance = await createChallengeInstance(req.params.sessionId, input.title, input.instructions);
    res.status(201).json({ success: true, data: instance });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.post('/api/sessions/:sessionId/creative-challenge', async (req, res) => {
  try {
    const input = creativeChallengeRequestSchema.parse(req.body ?? {});
    const instance = await getOrGenerateCreativeChallenge(req.params.sessionId, input.learningContext);
    res.json({ success: true, data: instance });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.get('/api/users/:userId/challenge-instances', async (req, res) => {
  try {
    res.json({ success: true, data: await getChallengeInstancesForUserRecord(req.params.userId) });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.get('/api/sessions/:sessionId/challenge-instance', async (req, res) => {
  try {
    const instance = await getChallengeInstance(req.params.sessionId);
    if (!instance) {
      throw new ApiError('Challenge instance not found', 404);
    }
    res.json({ success: true, data: instance });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.post('/api/challenges/recommend', async (req, res) => {
  try {
    const parsed = sceneAnalysisSchema.parse(req.body.sceneAnalysis ?? req.body);
    validateSceneAnalysis(parsed);
    const result = await recommendForScene(parsed, req.body.userId);
    res.json({ success: true, data: result });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.post('/api/sessions/:sessionId/complete', async (req, res) => {
  try {
    const session = await getSession(req.params.sessionId);
    if (!session) {
      throw new ApiError('Session not found', 404);
    }

    const result = await completeSession(
      req.params.sessionId,
      req.body.userId ?? session.userId,
      req.body.challengeType,
      req.body.artworkMetadata ?? req.body.metadata
    );
    res.json({ success: true, data: { sessionId: req.params.sessionId, status: 'completed', result } });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const progress = await getUserProgress(req.params.userId);
    res.json({ success: true, data: progress });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.post('/api/artworks', async (req, res) => {
  try {
    const { userId, sessionId, challengeTemplateId, metadata } = req.body ?? {};
    if (!userId || !sessionId || !challengeTemplateId) {
      throw new ApiError('userId, sessionId, and challengeTemplateId are required', 400);
    }

    const artwork = await addArtwork(metadata ?? {}, userId, sessionId, challengeTemplateId);
    res.status(201).json({ success: true, data: artwork });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.get('/api/users/:userId/artworks', async (req, res) => {
  try {
    res.json({ success: true, data: await getArtworksForUser(req.params.userId) });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.get('/api/learning/resources', async (req, res) => {
  try {
    const concept = typeof req.query.concept === 'string' ? req.query.concept : '';
    if (!concept) {
      throw new ApiError('concept query parameter is required', 400);
    }

    const resources = await learningResourceService.getResourcesForConcept(concept);
    res.json({ success: true, data: resources });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.get('/api/mock-scenes/:sceneName', (req, res) => {
  res.json({ success: true, data: getMockScene(req.params.sceneName) });
});

app.post('/api/learning/content', async (req, res) => {
  try {
    const sessionId = typeof req.body?.sessionId === 'string' ? req.body.sessionId : undefined;
    const session = sessionId ? await getSession(sessionId) : undefined;
    if (sessionId && !session?.sceneAnalysis) {
      throw new ApiError('Learning session scene not found', 404);
    }
    const parsed = sceneAnalysisSchema.parse(session?.sceneAnalysis ?? req.body.sceneAnalysis ?? req.body);
    validateSceneAnalysis(parsed);
    const content = await generateLearningContent(parsed);
    res.json({ success: true, data: content });
  } catch (error) {
    const normalized = normalizeError(error);
    res.status(normalized.statusCode).json({ success: false, error: normalized });
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response) => {
  const normalized = normalizeError(error);
  res.status(normalized.statusCode).json({ success: false, error: normalized });
});

export default app;


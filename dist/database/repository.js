import { randomUUID } from 'node:crypto';
import { isMongoConnected } from './mongo.js';
import { UserModel, CreativeSessionModel, ChallengeInstanceModel, ChallengeCompletionModel, ArtworkModel, LearningResourceModel, LearningProgressModel } from './models.js';
import { ApiError } from '../core/errors.js';
const memorySessions = new Map();
const memoryChallengeInstances = new Map();
const memoryCompletions = [];
const memoryArtworks = [];
const memoryLearningResources = new Map();
const memoryUsers = new Map();
const memoryLearningProgress = new Map();
function useMongo() {
    return isMongoConnected();
}
function toSessionRecord(doc) {
    return {
        id: doc._id.toString(),
        userId: doc.userId,
        mode: doc.mode,
        sceneAnalysis: doc.sceneAnalysis ?? undefined,
        selectedChallengeTemplateId: doc.selectedChallengeTemplateId ?? undefined,
        challengeDecision: doc.challengeDecision ?? undefined,
        status: doc.status,
        startedAt: doc.startedAt,
        completedAt: doc.completedAt ?? null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    };
}
function toChallengeInstance(doc) {
    return {
        generationSource: doc.generationSource ?? undefined,
        reasonCodes: doc.reasonCodes ?? [],
        id: doc._id.toString(),
        userId: doc.userId,
        sessionId: doc.sessionId,
        templateId: doc.templateId,
        challengeType: doc.challengeType,
        difficulty: doc.difficulty,
        sourceMode: doc.sourceMode,
        title: doc.title,
        instructions: doc.instructions,
        focusConcepts: doc.focusConcepts ?? [],
        usedSceneFeatures: doc.usedSceneFeatures ?? [],
        whyThisFitsScene: doc.whyThisFitsScene ?? [],
        learningContext: doc.learningContext ?? undefined,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    };
}
export async function ensureUser(userId, displayName) {
    if (useMongo()) {
        try {
            await UserModel.findOneAndUpdate({ externalId: userId }, { $setOnInsert: { externalId: userId, displayName: displayName ?? userId } }, { upsert: true, new: true });
            return;
        }
        catch (error) {
            console.warn('Mongo user upsert failed, falling back to in-memory user store:', error);
        }
    }
    if (!memoryUsers.has(userId)) {
        memoryUsers.set(userId, { id: userId, displayName: displayName ?? userId });
    }
}
export async function createSessionRecord(userId, mode) {
    await ensureUser(userId);
    const now = new Date();
    if (useMongo()) {
        try {
            const doc = await CreativeSessionModel.create({ userId, mode, status: 'created', startedAt: now });
            return toSessionRecord(doc);
        }
        catch (error) {
            console.warn('Mongo session create failed, falling back to in-memory session store:', error);
        }
    }
    const session = {
        id: randomUUID(),
        userId,
        mode,
        status: 'created',
        startedAt: now,
        createdAt: now,
        updatedAt: now
    };
    memorySessions.set(session.id, session);
    return session;
}
export async function getSessionRecord(sessionId) {
    if (useMongo()) {
        try {
            const doc = await CreativeSessionModel.findById(sessionId);
            if (doc) {
                return toSessionRecord(doc);
            }
            return undefined;
        }
        catch (error) {
            console.warn('Mongo session lookup failed, checking in-memory store:', error);
        }
    }
    return memorySessions.get(sessionId);
}
export async function updateSessionSceneRecord(sessionId, scene) {
    if (useMongo()) {
        try {
            const doc = await CreativeSessionModel.findByIdAndUpdate(sessionId, { sceneAnalysis: scene, status: 'scene_received', updatedAt: new Date() }, { new: true });
            if (doc) {
                return toSessionRecord(doc);
            }
            throw new ApiError('Session not found', 404);
        }
        catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            console.warn('Mongo scene update failed, falling back to in-memory session store:', error);
        }
    }
    const session = memorySessions.get(sessionId);
    if (!session) {
        throw new ApiError('Session not found', 404);
    }
    session.sceneAnalysis = scene;
    session.status = 'scene_received';
    session.updatedAt = new Date();
    return session;
}
export async function updateSessionDecisionRecord(sessionId, templateId, decision) {
    if (useMongo()) {
        try {
            const updated = await CreativeSessionModel.findByIdAndUpdate(sessionId, {
                selectedChallengeTemplateId: templateId,
                challengeDecision: decision,
                status: 'challenge_selected',
                updatedAt: new Date()
            });
            if (updated) {
                return;
            }
        }
        catch (error) {
            console.warn('Mongo decision update failed, falling back to in-memory session store:', error);
        }
    }
    const session = memorySessions.get(sessionId);
    if (session) {
        session.selectedChallengeTemplateId = templateId;
        session.challengeDecision = decision;
        session.status = 'challenge_selected';
        session.updatedAt = new Date();
    }
}
export async function createChallengeInstanceRecord(input) {
    if (useMongo()) {
        try {
            const doc = await ChallengeInstanceModel.findOneAndUpdate({ sessionId: input.sessionId }, { $setOnInsert: input }, { upsert: true, new: true, setDefaultsOnInsert: true });
            return toChallengeInstance(doc);
        }
        catch (error) {
            console.warn('Mongo challenge instance upsert failed, falling back to in-memory store:', error);
        }
    }
    const existing = memoryChallengeInstances.get(input.sessionId);
    if (existing) {
        return existing;
    }
    const now = new Date();
    const instance = {
        id: randomUUID(),
        ...input,
        createdAt: now,
        updatedAt: now
    };
    memoryChallengeInstances.set(input.sessionId, instance);
    return instance;
}
export async function getChallengeInstanceBySessionRecord(sessionId) {
    if (useMongo()) {
        try {
            const doc = await ChallengeInstanceModel.findOne({ sessionId });
            return doc ? toChallengeInstance(doc) : memoryChallengeInstances.get(sessionId);
        }
        catch (error) {
            console.warn('Mongo challenge instance lookup failed, checking in-memory store:', error);
        }
    }
    return memoryChallengeInstances.get(sessionId);
}
export async function getChallengeInstancesForUserRecord(userId) {
    const instances = new Map();
    for (const instance of memoryChallengeInstances.values()) {
        if (instance.userId === userId)
            instances.set(instance.sessionId, instance);
    }
    if (useMongo()) {
        try {
            const docs = await ChallengeInstanceModel.find({ userId }).sort({ createdAt: -1 }).lean();
            for (const doc of docs) {
                const instance = toChallengeInstance(doc);
                instances.set(instance.sessionId, instance);
            }
        }
        catch {
            console.warn('Mongo challenge history unavailable; returning in-memory history.');
        }
    }
    return [...instances.values()].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
export async function completeSessionRecord(sessionId) {
    const now = new Date();
    if (useMongo()) {
        try {
            const updated = await CreativeSessionModel.findByIdAndUpdate(sessionId, {
                status: 'completed',
                completedAt: now,
                updatedAt: now
            });
            if (updated) {
                return;
            }
        }
        catch (error) {
            console.warn('Mongo session completion failed, falling back to in-memory session store:', error);
        }
    }
    const session = memorySessions.get(sessionId);
    if (session) {
        session.status = 'completed';
        session.completedAt = now;
        session.updatedAt = now;
    }
}
export async function recordChallengeCompletion(record) {
    const completion = { ...record, completedAt: record.completedAt ?? new Date() };
    if (useMongo()) {
        try {
            await ChallengeCompletionModel.create(completion);
            return completion;
        }
        catch (error) {
            console.warn('Mongo completion insert failed, falling back to in-memory completion store:', error);
        }
    }
    memoryCompletions.push(completion);
    return completion;
}
export async function getCompletionsForUser(userId) {
    if (useMongo()) {
        try {
            const docs = await ChallengeCompletionModel.find({ userId }).sort({ completedAt: 1 }).lean();
            return docs.map((doc) => ({
                userId: doc.userId,
                sessionId: doc.sessionId,
                challengeInstanceId: doc.challengeInstanceId ?? undefined,
                templateId: doc.templateId,
                challengeType: doc.challengeType,
                concepts: doc.concepts ?? [],
                completedAt: doc.completedAt
            }));
        }
        catch (error) {
            console.warn('Mongo completions lookup failed, falling back to in-memory completion store:', error);
        }
    }
    return memoryCompletions.filter((item) => item.userId === userId);
}
export async function createArtworkRecord(input) {
    if (useMongo()) {
        try {
            const doc = await ArtworkModel.create({ ...input, createdAt: new Date() });
            return {
                id: doc._id.toString(),
                userId: doc.userId,
                sessionId: doc.sessionId,
                challengeInstanceId: doc.challengeInstanceId ?? undefined,
                challengeTemplateId: doc.challengeTemplateId,
                title: doc.title,
                assetUrl: doc.assetUrl,
                thumbnailUrl: doc.thumbnailUrl,
                metadata: doc.metadata,
                createdAt: doc.createdAt
            };
        }
        catch (error) {
            console.warn('Mongo artwork insert failed, falling back to in-memory artwork store:', error);
        }
    }
    const record = { id: randomUUID(), createdAt: new Date(), ...input };
    memoryArtworks.push(record);
    return record;
}
export async function getArtworksForUserRecord(userId) {
    if (useMongo()) {
        try {
            const docs = await ArtworkModel.find({ userId }).sort({ createdAt: -1 }).lean();
            return docs.map((doc) => ({
                id: doc._id.toString(),
                userId: doc.userId,
                sessionId: doc.sessionId,
                challengeInstanceId: doc.challengeInstanceId ?? undefined,
                challengeTemplateId: doc.challengeTemplateId,
                title: doc.title,
                assetUrl: doc.assetUrl,
                thumbnailUrl: doc.thumbnailUrl,
                metadata: doc.metadata,
                createdAt: doc.createdAt
            }));
        }
        catch (error) {
            console.warn('Mongo artwork lookup failed, falling back to in-memory artwork store:', error);
        }
    }
    return memoryArtworks.filter((item) => item.userId === userId);
}
export async function getCachedLearningResources(concept) {
    const key = concept.toLowerCase();
    if (useMongo()) {
        try {
            const docs = await LearningResourceModel.find({ concept: key }).lean();
            return docs.map((doc) => ({
                concept: doc.concept,
                title: doc.title,
                url: doc.url,
                source: doc.source,
                summary: doc.summary,
                retrievedAt: doc.retrievedAt,
                verified: doc.verified
            }));
        }
        catch (error) {
            console.warn('Mongo learning resource cache lookup failed, checking in-memory cache:', error);
        }
    }
    return memoryLearningResources.get(key) ?? [];
}
export async function cacheLearningResources(concept, resources) {
    if (resources.length === 0) {
        return;
    }
    const key = concept.toLowerCase();
    if (useMongo()) {
        try {
            await LearningResourceModel.bulkWrite(resources.map((resource) => ({
                updateOne: {
                    filter: { concept: key, url: resource.url },
                    update: { $set: { ...resource, concept: key, retrievedAt: new Date() } },
                    upsert: true
                }
            })));
            return;
        }
        catch (error) {
            console.warn('Mongo learning resource cache write failed, falling back to in-memory cache:', error);
        }
    }
    memoryLearningResources.set(key, resources);
}
/**
 * Learning Progress persistence.
 *
 * Each user has a single LearningProgress document containing one subdocument
 * per concept. "Seen" and "practiced" counters are incremented independently
 * so callers (sessionService) control exactly when each transition happens.
 * Atomic per-concept increments are used when Mongo is connected: try to
 * increment an existing array element first, and only fall back to pushing a
 * brand-new concept entry (with upsert on the parent doc) when no matching
 * element exists yet.
 */
function toLearningProgressRecord(doc) {
    return {
        userId: doc.userId,
        concepts: (doc.concepts ?? []).map((entry) => ({
            concept: entry.concept,
            timesSeen: entry.timesSeen ?? 0,
            timesPracticed: entry.timesPracticed ?? 0,
            lastSeenAt: entry.lastSeenAt ?? null,
            lastPracticedAt: entry.lastPracticedAt ?? null
        })),
        updatedAt: doc.updatedAt
    };
}
function emptyLearningProgressRecord(userId) {
    return { userId, concepts: [], updatedAt: new Date() };
}
export async function getLearningProgressRecord(userId) {
    if (useMongo()) {
        try {
            const doc = await LearningProgressModel.findOne({ userId });
            return doc ? toLearningProgressRecord(doc) : emptyLearningProgressRecord(userId);
        }
        catch (error) {
            console.warn('Mongo learning progress lookup failed, checking in-memory store:', error);
        }
    }
    return memoryLearningProgress.get(userId) ?? emptyLearningProgressRecord(userId);
}
async function incrementConceptCounter(userId, concepts, counterField, timestampField) {
    const uniqueConcepts = Array.from(new Set(concepts)).filter(Boolean);
    if (uniqueConcepts.length === 0) {
        return;
    }
    const now = new Date();
    if (useMongo()) {
        try {
            for (const concept of uniqueConcepts) {
                const matched = await LearningProgressModel.updateOne({ userId, 'concepts.concept': concept }, {
                    $inc: { [`concepts.$.${counterField}`]: 1 },
                    $set: { [`concepts.$.${timestampField}`]: now, updatedAt: now }
                });
                if (!matched.matchedCount) {
                    await LearningProgressModel.updateOne({ userId }, {
                        $push: {
                            concepts: {
                                concept,
                                timesSeen: counterField === 'timesSeen' ? 1 : 0,
                                timesPracticed: counterField === 'timesPracticed' ? 1 : 0,
                                lastSeenAt: counterField === 'timesSeen' ? now : null,
                                lastPracticedAt: counterField === 'timesPracticed' ? now : null
                            }
                        },
                        $set: { updatedAt: now }
                    }, { upsert: true });
                }
            }
            return;
        }
        catch (error) {
            console.warn(`Mongo learning progress ${counterField} update failed, falling back to in-memory store:`, error);
        }
    }
    const record = memoryLearningProgress.get(userId) ?? emptyLearningProgressRecord(userId);
    for (const concept of uniqueConcepts) {
        let entry = record.concepts.find((item) => item.concept === concept);
        if (!entry) {
            entry = { concept, timesSeen: 0, timesPracticed: 0, lastSeenAt: null, lastPracticedAt: null };
            record.concepts.push(entry);
        }
        entry[counterField] += 1;
        entry[timestampField] = now;
    }
    record.updatedAt = now;
    memoryLearningProgress.set(userId, record);
}
export async function markConceptsSeenRecord(userId, concepts) {
    await incrementConceptCounter(userId, concepts, 'timesSeen', 'lastSeenAt');
}
export async function markConceptsPracticedRecord(userId, concepts) {
    await incrementConceptCounter(userId, concepts, 'timesPracticed', 'lastPracticedAt');
}

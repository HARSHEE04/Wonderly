import { buildGeminiContext, buildPersonalizationContext, defaultChallengeTemplates, recommendChallenge, summarizeExposure } from '../product/engine.js';
import { ApiError } from '../core/errors.js';
import { mockScenes } from '../data/mockScenes.js';
import { createSessionRecord, getSessionRecord, updateSessionSceneRecord, updateSessionDecisionRecord, completeSessionRecord, recordChallengeCompletion, getCompletionsForUser, createArtworkRecord, getArtworksForUserRecord } from '../database/repository.js';
import { getLearningProgress, markConceptsSeen, markConceptsPracticed } from './learningProgressService.js';
export async function createSession(userId, mode = 'creative') {
    return createSessionRecord(userId, mode);
}
export async function getSession(sessionId) {
    return getSessionRecord(sessionId);
}
export async function updateSessionScene(sessionId, scene) {
    return updateSessionSceneRecord(sessionId, scene);
}
function buildConceptExposureFromCompletions(completions) {
    const exposure = {};
    for (const completion of completions) {
        for (const concept of completion.concepts ?? []) {
            exposure[concept] = (exposure[concept] ?? 0) + 1;
        }
    }
    return summarizeExposure(exposure);
}
async function buildHistoryForUser(userId) {
    if (!userId) {
        return { challengeTypes: {}, conceptExposure: {} };
    }
    const completions = await getCompletionsForUser(userId);
    const challengeTypes = completions.reduce((acc, item) => {
        acc[item.challengeType] = (acc[item.challengeType] ?? 0) + 1;
        return acc;
    }, {});
    // LearningProgress is the dedicated concept-level tracker (seen/practiced),
    // and becomes the primary source of concept exposure once it has data.
    // Fall back to reconstructing exposure from ChallengeCompletion records for
    // users who completed challenges before LearningProgress existed.
    const learningProgress = await getLearningProgress(userId);
    const conceptExposure = learningProgress.concepts.length > 0
        ? Object.fromEntries(learningProgress.concepts.map((entry) => [entry.concept, entry.timesPracticed]))
        : buildConceptExposureFromCompletions(completions);
    return {
        challengeTypes,
        conceptExposure: summarizeExposure(conceptExposure)
    };
}
export async function recommendForScene(scene, userId, sessionId, historyOverride) {
    const history = historyOverride ?? (await buildHistoryForUser(userId));
    const recommendation = recommendChallenge(scene, defaultChallengeTemplates, history);
    const decision = recommendation.decision;
    if (!decision) {
        return {
            status: 'insufficient_features',
            missingIngredientTypes: [],
            suggestion: 'scan_more'
        };
    }
    if (sessionId) {
        // Idempotency: only mark concepts "seen" the first time a decision is
        // attached to this session. Retrying scene-analysis/recommend for a
        // session that already has a selected challenge must not inflate
        // timesSeen counts.
        const existingSession = await getSessionRecord(sessionId);
        const alreadyHasDecision = Boolean(existingSession?.selectedChallengeTemplateId);
        await updateSessionDecisionRecord(sessionId, decision.challengeTemplateId, decision);
        if (!alreadyHasDecision && userId) {
            const template = defaultChallengeTemplates.find((item) => item.id === decision.challengeTemplateId);
            if (template?.concepts?.length) {
                await markConceptsSeen(userId, template.concepts);
            }
        }
    }
    return {
        decision,
        eligibleChallenges: recommendation.eligibleChallenges,
        recommendation: decision,
        context: buildGeminiContext(sessionId ?? 'session-id', scene, decision),
        personalization: buildPersonalizationContext(history)
    };
}
export async function completeSession(sessionId, userId, challengeType, metadata) {
    const session = await getSessionRecord(sessionId);
    if (!session) {
        throw new ApiError('Session not found', 404);
    }
    // Idempotency: completing an already-completed session must not
    // double-record a ChallengeCompletion or double-increment timesPracticed.
    if (session.status === 'completed') {
        throw new ApiError('Session already completed', 409);
    }
    await completeSessionRecord(sessionId);
    const templateId = session.selectedChallengeTemplateId ?? 'unknown';
    const template = defaultChallengeTemplates.find((item) => item.id === templateId);
    const type = challengeType ?? session.challengeDecision?.challengeType ?? 'unknown';
    const concepts = template?.concepts ?? [];
    const completion = await recordChallengeCompletion({
        userId,
        sessionId,
        templateId,
        challengeType: type,
        concepts
    });
    if (concepts.length > 0) {
        await markConceptsPracticed(userId, concepts);
    }
    let artwork;
    if (metadata) {
        artwork = await createArtworkRecord({
            userId,
            sessionId,
            challengeTemplateId: templateId,
            title: metadata.title,
            assetUrl: metadata.assetUrl,
            thumbnailUrl: metadata.thumbnailUrl,
            metadata
        });
    }
    return { completion, artwork };
}
export async function getUserProgress(userId) {
    const completions = await getCompletionsForUser(userId);
    const challengeTypes = completions.reduce((acc, item) => {
        acc[item.challengeType] = (acc[item.challengeType] ?? 0) + 1;
        return acc;
    }, {});
    const learningProgress = await getLearningProgress(userId);
    const conceptExposure = summarizeExposure(learningProgress.concepts.length > 0
        ? Object.fromEntries(learningProgress.concepts.map((entry) => [entry.concept, entry.timesPracticed]))
        : buildConceptExposureFromCompletions(completions));
    const underusedConcepts = buildPersonalizationContext({ challengeTypes, conceptExposure }).underusedConcepts;
    return {
        completedChallengeCount: completions.length,
        challengeTypeDistribution: challengeTypes,
        recentChallenges: completions.slice(-5),
        conceptExposure,
        underusedConcepts,
        learning: {
            concepts: learningProgress.concepts,
            underusedConcepts
        }
    };
}
export async function getArtworksForUser(userId) {
    return getArtworksForUserRecord(userId);
}
export async function addArtwork(metadata, userId, sessionId, challengeTemplateId) {
    return createArtworkRecord({
        userId,
        sessionId,
        challengeTemplateId,
        title: metadata.title,
        assetUrl: metadata.assetUrl,
        thumbnailUrl: metadata.thumbnailUrl,
        metadata
    });
}
export function getMockScene(name) {
    return mockScenes[name] ?? mockScenes.characterFriendly;
}

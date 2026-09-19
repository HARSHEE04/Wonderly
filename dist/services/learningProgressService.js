import { getLearningProgressRecord, markConceptsSeenRecord, markConceptsPracticedRecord } from '../database/repository.js';
import { getUnderusedConcepts } from '../product/engine.js';
/**
 * Learning Progress owns concept-level learning state, distinct from
 * ChallengeCompletion (which is a history log of completed challenges).
 *
 * Seen vs practiced semantics:
 * - "seen"      -> a concept was meaningfully introduced/selected for the user
 *                  (a challenge exposing that concept became the session's
 *                  selected challenge).
 * - "practiced" -> the user actually completed the challenge/activity tied to
 *                  that concept.
 */
export async function getLearningProgress(userId) {
    return getLearningProgressRecord(userId);
}
export async function markConceptsSeen(userId, concepts) {
    if (!concepts.length) {
        return;
    }
    await markConceptsSeenRecord(userId, concepts);
}
export async function markConceptsPracticed(userId, concepts) {
    if (!concepts.length) {
        return;
    }
    await markConceptsPracticedRecord(userId, concepts);
}
export async function getConceptExposure(userId) {
    const progress = await getLearningProgressRecord(userId);
    return Object.fromEntries(progress.concepts.map((entry) => [entry.concept, entry.timesPracticed]));
}
export async function getUnderusedConceptsForUser(userId) {
    const exposure = await getConceptExposure(userId);
    return getUnderusedConcepts(exposure);
}

import { addArtwork, getArtworksForUser } from './sessionService.js';
export function createArtworkRecord(userId, sessionId, challengeTemplateId, metadata) {
    return addArtwork(metadata, userId, sessionId, challengeTemplateId);
}
export function listArtworksForUser(userId) {
    return getArtworksForUser(userId);
}

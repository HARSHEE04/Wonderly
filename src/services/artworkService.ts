import { addArtwork, getArtworksForUser } from './sessionService.js';

export function createArtworkRecord(userId: string, sessionId: string, challengeTemplateId: string, metadata: Record<string, unknown>) {
  return addArtwork(metadata, userId, sessionId, challengeTemplateId);
}

export function listArtworksForUser(userId: string) {
  return getArtworksForUser(userId);
}

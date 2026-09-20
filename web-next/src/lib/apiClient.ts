// Thin client for the existing Node/Express backend (src/server.ts).
// Same endpoints, same request/response shapes as lib/services/api_client.dart —
// only the transport (fetch vs. package:http) and language changed.

import type { CreativeChallenge, LearningContent } from './types';
import { creativeChallengeFromInstance } from './types';

export const demoUserId = 'demo-user';

export class ApiException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiException';
  }
}

/**
 * Matches ApiClient.baseUrl in lib/services/api_client.dart: an explicit
 * NEXT_PUBLIC_API_URL override (needed when frontend/backend are on
 * different origins, e.g. a tunnel), else the page's own host on port 4000.
 */
export function apiBaseUrl(): string {
  const override = process.env.NEXT_PUBLIC_API_URL;
  if (override) return override;
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:4000`;
  }
  return 'http://localhost:4000';
}

async function unwrap(res: Response): Promise<Record<string, unknown>> {
  const decoded = (await res.json()) as Record<string, unknown>;
  if (!res.ok || decoded.success === false) {
    const err = decoded.error as { message?: string } | undefined;
    throw new ApiException(err?.message ?? `Request failed (${res.status})`);
  }
  return decoded;
}

async function post(path: string, body: unknown, timeoutMs = 8000): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${apiBaseUrl()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const decoded = await unwrap(res);
    return (decoded.data as Record<string, unknown>) ?? {};
  } finally {
    clearTimeout(timer);
  }
}

async function getList(path: string): Promise<Record<string, unknown>[]> {
  const res = await fetch(`${apiBaseUrl()}${path}`);
  const decoded = await unwrap(res);
  return (decoded.data as Record<string, unknown>[]) ?? [];
}

export async function createSession(userId: string, mode: string): Promise<string> {
  const data = await post('/api/sessions', { userId, mode });
  return data.id as string;
}

export async function postSceneAnalysis(
  sessionId: string,
  scene: unknown
): Promise<Record<string, unknown> | null> {
  const data = await post(`/api/sessions/${sessionId}/scene-analysis`, scene);
  const recommendation = data.recommendation as Record<string, unknown> | undefined;
  return (recommendation?.decision as Record<string, unknown> | undefined) ?? null;
}

export async function generateCreativeChallenge(
  sessionId: string,
  learningContext?: Record<string, unknown>
): Promise<CreativeChallenge> {
  const data = await post(
    `/api/sessions/${sessionId}/creative-challenge`,
    learningContext ? { learningContext } : {},
    30000
  );
  return creativeChallengeFromInstance(data);
}

export async function generateLearningContent(sessionId: string): Promise<LearningContent> {
  const data = await post('/api/learning/content', { sessionId }, 30000);
  return data as unknown as LearningContent;
}

export async function completeSession(
  sessionId: string,
  userId: string,
  challengeType?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await post(`/api/sessions/${sessionId}/complete`, {
    userId,
    ...(challengeType ? { challengeType } : {}),
    ...(metadata ? { artworkMetadata: metadata } : {}),
  });
}

export async function getArtworks(userId: string): Promise<Record<string, unknown>[]> {
  return getList(`/api/users/${userId}/artworks`);
}

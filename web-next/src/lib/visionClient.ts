// Mirrors lib/services/vision_client.dart exactly: same endpoint, same
// header, same response-shape validation. Talks directly to the Python
// vision_service.py (port 8001) — unchanged by this migration.

import type { VisionAnalysisResult } from './types';
import { ApiException } from './apiClient';

/**
 * An explicit override (NEXT_PUBLIC_VISION_URL), e.g. for a tunnel where the
 * vision service isn't reachable on the page's own host. Otherwise, use the
 * page's own hostname on port 8001 — this is what makes the app work from a
 * phone on the same network without any rebuild (matches Uri.base.host in
 * the Dart VisionClient).
 */
export function visionBaseUrl(): string {
  const override = process.env.NEXT_PUBLIC_VISION_URL;
  if (override) return override;
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8001`;
  }
  return 'http://localhost:8001';
}

export async function analyzeImage(imageBytes: Blob, sessionId: string): Promise<VisionAnalysisResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  let res: Response;
  try {
    res = await fetch(`${visionBaseUrl()}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Session-Id': sessionId,
      },
      body: imageBytes,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const decoded = (await res.json()) as Record<string, unknown>;
  if (res.status !== 200 || decoded.success !== true) {
    throw new ApiException((decoded.error as string) ?? `Vision service failed (HTTP ${res.status})`);
  }

  const sceneAnalysis = decoded.sceneAnalysis as Record<string, unknown> | undefined;
  const backendResponse = decoded.backendResponse as Record<string, unknown> | undefined;

  if (!sceneAnalysis || !backendResponse || backendResponse.success !== true) {
    throw new ApiException('The Vision service did not return a complete analysis.');
  }

  const backendData = backendResponse.data as Record<string, unknown> | undefined;
  const recommendation = backendData?.recommendation as Record<string, unknown> | undefined;
  const decision = (recommendation?.decision as Record<string, unknown> | undefined) ?? null;

  return { sceneAnalysis, decision };
}

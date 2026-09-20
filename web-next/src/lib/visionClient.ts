// Talks to the Python vision_service.py (port 8001) when available. If that
// service fails during a live demo, falls back to lightweight browser-side
// color sampling and submits the generated scene to the normal backend.

import type { SceneAnalysis, VisionAnalysisResult } from './types';
import { ApiException, postSceneAnalysis } from './apiClient';

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
  try {
    return await analyzeWithVisionService(imageBytes, sessionId);
  } catch (error) {
    console.warn('Vision service failed; using browser-side image analysis fallback.', error);
  }

  const sceneAnalysis = await buildLocalSceneAnalysis(imageBytes);
  try {
    const decision = await postSceneAnalysis(sessionId, sceneAnalysis);
    return { sceneAnalysis: sceneAnalysis as unknown as Record<string, unknown>, decision };
  } catch (error) {
    console.error('Local image analysis succeeded, but backend submission failed.', error);
    const message = error instanceof ApiException && error.message
      ? error.message
      : 'Please make sure the backend is running and try again.';
    throw new ApiException(`Image was analyzed locally, but submission failed. ${message}`);
  }
}

async function analyzeWithVisionService(imageBytes: Blob, sessionId: string): Promise<VisionAnalysisResult> {
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

type SampledColor = {
  r: number;
  g: number;
  b: number;
  hex: string;
  name: string;
  confidence: number;
};

type ColorBucket = {
  r: number;
  g: number;
  b: number;
  weight: number;
  count: number;
};

const FALLBACK_COLORS: SampledColor[] = [
  { r: 47, g: 111, b: 115, hex: '#2f6f73', name: 'soft teal', confidence: 0.76 },
  { r: 242, g: 193, b: 95, hex: '#f2c15f', name: 'warm yellow', confidence: 0.7 },
  { r: 216, g: 106, b: 101, hex: '#d86a65', name: 'soft red', confidence: 0.64 },
];

async function buildLocalSceneAnalysis(imageBytes: Blob): Promise<SceneAnalysis> {
  try {
    const sample = await sampleImage(imageBytes);
    const colors = sample.colors.length ? sample.colors : FALLBACK_COLORS;
    const orientation = sample.width > sample.height * 1.12
      ? 'horizontal'
      : sample.height > sample.width * 1.12
        ? 'vertical'
        : 'other';
    const shapeLabel = orientation === 'horizontal'
      ? 'wide rectangle'
      : orientation === 'vertical'
        ? 'tall rectangle'
        : 'balanced square';

    return {
      colors: colors.slice(0, 4).map((color, index) => ({
        id: `color-${index + 1}`,
        hex: color.hex,
        name: color.name,
        label: color.name,
        confidence: color.confidence,
      })),
      shapes: [
        { id: 'shape-frame', label: shapeLabel, confidence: 0.72, contourId: 'local-frame' },
        { id: 'shape-area', label: 'organic area', confidence: 0.55, contourId: 'local-area' },
      ],
      textures: [
        { id: 'texture-surface', label: sample.contrast > 42 ? 'mixed texture' : 'smooth texture', confidence: 0.58 },
      ],
      lines: [
        {
          id: 'line-main',
          label: `${orientation === 'other' ? 'balanced' : orientation} lines`,
          orientation,
          confidence: 0.62,
        },
      ],
      patterns: [
        {
          id: 'pattern-color-rhythm',
          label: colors.length > 2 ? 'color rhythm' : 'simple repetition',
          patternType: colors.length > 2 ? 'color rhythm' : 'repetition',
          confidence: 0.5,
        },
      ],
      semanticObjects: [],
    };
  } catch (error) {
    console.warn('Browser-side image analysis failed; using stable fallback scene.', error);
    return {
      colors: FALLBACK_COLORS.map((color, index) => ({
        id: `color-${index + 1}`,
        hex: color.hex,
        name: color.name,
        label: color.name,
        confidence: color.confidence,
      })),
      shapes: [{ id: 'shape-1', label: 'rounded shape', confidence: 0.65, contourId: 'fallback-shape' }],
      textures: [{ id: 'texture-1', label: 'soft texture', confidence: 0.55 }],
      lines: [{ id: 'line-1', label: 'curved lines', orientation: 'other', confidence: 0.55 }],
      patterns: [{ id: 'pattern-1', label: 'gentle repetition', patternType: 'repetition', confidence: 0.52 }],
      semanticObjects: [],
    };
  }
}

async function sampleImage(imageBytes: Blob): Promise<{ colors: SampledColor[]; width: number; height: number; contrast: number }> {
  const loaded = await loadImage(imageBytes);
  try {
    const maxSide = 96;
    const scale = Math.min(1, maxSide / Math.max(loaded.width, loaded.height));
    const width = Math.max(1, Math.round(loaded.width * scale));
    const height = Math.max(1, Math.round(loaded.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      throw new Error('Canvas is unavailable');
    }
    ctx.drawImage(loaded.image, 0, 0, width, height);
    const pixels = ctx.getImageData(0, 0, width, height).data;
    const buckets = new Map<string, ColorBucket>();
    let totalWeight = 0;
    let contrastTotal = 0;
    let contrastCount = 0;

    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3];
      if (alpha < 180) continue;

      const r = pixels[index];
      const g = pixels[index + 1];
      const b = pixels[index + 2];
      const { s, l } = rgbToHsl(r, g, b);
      if (l > 97 && s < 10) continue;

      const luminance = (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
      contrastTotal += Math.abs(luminance - 128);
      contrastCount += 1;

      const weight = 1 + Math.min(s / 65, 1.4) + (l > 12 && l < 92 ? 0.35 : 0);
      totalWeight += weight;
      const key = `${quantize(r)}-${quantize(g)}-${quantize(b)}`;
      const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, weight: 0, count: 0 };
      bucket.r += r * weight;
      bucket.g += g * weight;
      bucket.b += b * weight;
      bucket.weight += weight;
      bucket.count += 1;
      buckets.set(key, bucket);
    }

    const sorted = [...buckets.values()]
      .filter((bucket) => bucket.weight > 0)
      .map((bucket) => {
        const r = Math.round(bucket.r / bucket.weight);
        const g = Math.round(bucket.g / bucket.weight);
        const b = Math.round(bucket.b / bucket.weight);
        return {
          r,
          g,
          b,
          hex: toHex(r, g, b),
          name: nameColor(r, g, b),
          confidence: Math.max(0.35, Math.min(0.94, bucket.weight / Math.max(totalWeight, 1))),
          score: bucket.weight,
        };
      })
      .sort((a, b) => b.score - a.score);

    const colors: SampledColor[] = [];
    for (const color of sorted) {
      if (colors.every((existing) => colorDistance(existing, color) > 42)) {
        colors.push({
          r: color.r,
          g: color.g,
          b: color.b,
          hex: color.hex,
          name: color.name,
          confidence: Number(color.confidence.toFixed(2)),
        });
      }
      if (colors.length >= 4) break;
    }

    return {
      colors,
      width: loaded.width,
      height: loaded.height,
      contrast: contrastCount ? contrastTotal / contrastCount : 0,
    };
  } finally {
    loaded.cleanup();
  }
}

async function loadImage(blob: Blob): Promise<{
  image: HTMLImageElement | ImageBitmap;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(blob);
    return {
      image: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  }

  const url = URL.createObjectURL(blob);
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load uploaded image'));
    img.src = url;
  });

  return {
    image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    cleanup: () => URL.revokeObjectURL(url),
  };
}

function quantize(value: number) {
  return Math.max(0, Math.min(255, Math.round(value / 32) * 32));
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function colorDistance(a: Pick<SampledColor, 'r' | 'g' | 'b'>, b: Pick<SampledColor, 'r' | 'g' | 'b'>) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h = 0;

  if (max === red) {
    h = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    h = (blue - red) / delta + 2;
  } else {
    h = (red - green) / delta + 4;
  }

  return { h: h * 60, s: s * 100, l: l * 100 };
}

function nameColor(r: number, g: number, b: number) {
  const { h, s, l } = rgbToHsl(r, g, b);
  if (s < 10) {
    if (l < 24) return 'charcoal';
    if (l > 82) return 'light gray';
    return 'soft gray';
  }
  if (l > 90 && h >= 35 && h <= 70) return 'cream';

  const base =
    h < 15 || h >= 345 ? 'red'
      : h < 35 ? 'orange'
        : h < 55 ? 'yellow'
          : h < 85 ? 'yellow green'
            : h < 155 ? 'green'
              : h < 190 ? 'teal'
                : h < 250 ? 'blue'
                  : h < 285 ? 'violet'
                    : h < 330 ? 'pink'
                      : 'red';
  const tone = l < 28 ? 'deep' : l > 78 ? 'pale' : s < 35 ? 'soft' : 'bright';
  return `${tone} ${base}`;
}

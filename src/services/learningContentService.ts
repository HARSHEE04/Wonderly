import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../core/errors.js';
import type { SceneAnalysis, LearningContent, LearningElementCategory } from '../core/types/visual.js';

const learningElementSchema = z.object({
  category: z.enum(['shape', 'color', 'line', 'texture', 'pattern']),
  name: z.string(),
  description: z.string(),
  artisticUse: z.string(),
  effect: z.string(),
  howToUse: z.string(),
  activity: z.string()
});

const learningContentSchema = z.object({
  summary: z.string(),
  elements: z.array(learningElementSchema).max(5)
});

export const LEARNING_CONTENT_SYSTEM_PROMPT = `You are an art education assistant helping students understand visual elements discovered in their surroundings.

A computer vision system has already detected visual elements in the student's environment and supplies them to you as structured data, grouped by category (shapes, colors, lines, textures, patterns). You do not perform detection yourself, and you must never claim to have personally seen or detected anything in the image.

Do NOT write one entry per individual detected item. Instead, for each category that has at least one detected item, synthesize a single "major theme" that captures what's dominant or most interesting about that whole category (e.g. one theme for all detected colors together, one theme for all detected shapes together), even if several distinct items were detected within it. Pick out only the most notable, teachable theme per category — skip minor or repetitive items rather than cataloguing everything. Return at most one element per category that has detected items, and never more than five elements total.

For each category's theme, provide:
1. A short name for the theme (not a list of every raw item).
2. A brief explanation of what it is / why it stood out.
3. How artists commonly use it.
4. What visual or compositional effect it can create.
5. A practical suggestion for how the student could incorporate it into their own artwork.
6. One short, concrete creative activity or exercise using it.

Only reference items explicitly supplied to you. Do not invent shapes, colors, lines, textures, or patterns that were not provided.

Keep the writing concise, friendly, educational, and actionable. Use accessible art terminology and explain concepts clearly for a beginner. The overall response should be short enough to read in under a minute.

Use the summary field to briefly describe, in one or two sentences, how the major themes across categories could interact in a single composition.`;

interface NormalizedElement {
  category: LearningElementCategory;
  label: string;
}

function normalizeScene(scene: SceneAnalysis): NormalizedElement[] {
  const seen = new Set<string>();
  const elements: NormalizedElement[] = [];

  const push = (category: LearningElementCategory, label: string | undefined) => {
    const clean = label?.trim();
    if (!clean) {
      return;
    }
    const key = `${category}:${clean.toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    elements.push({ category, label: clean });
  };

  for (const shape of scene.shapes ?? []) {
    push('shape', shape.label);
  }
  for (const color of scene.colors ?? []) {
    push('color', color.name ?? color.hex);
  }
  for (const line of scene.lines ?? []) {
    push('line', line.label ?? line.orientation);
  }
  for (const texture of scene.textures ?? []) {
    push('texture', texture.label);
  }
  for (const pattern of scene.patterns ?? []) {
    push('pattern', pattern.label ?? pattern.patternType);
  }

  return elements;
}

function buildUserPrompt(elements: NormalizedElement[]): string {
  const grouped = elements.reduce<Record<string, string[]>>((acc, element) => {
    const key = `${element.category}s`;
    acc[key] = acc[key] ?? [];
    acc[key].push(element.label);
    return acc;
  }, {});

  return `Detected visual elements (grouped by category, as JSON):\n${JSON.stringify(grouped, null, 2)}`;
}

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.openaiApiKey) {
    throw new ApiError('Learning content generation is not configured', 503);
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}

/**
 * Turns OpenCV-detected visual elements into structured, student-facing art education content.
 * OpenCV/vision detection is out of scope here; this only consumes its output.
 */
export async function generateLearningContent(scene: SceneAnalysis): Promise<LearningContent> {
  const normalized = normalizeScene(scene);

  if (normalized.length === 0) {
    throw new ApiError('No detected visual elements to generate learning content for', 400);
  }

  const openai = getClient();

  let response;
  try {
    response = await openai.responses.parse({
      model: env.learningOpenaiModel,
      input: [
        { role: 'system', content: LEARNING_CONTENT_SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(normalized) }
      ],
      text: { format: zodTextFormat(learningContentSchema, 'learning_content') }
    });
  } catch {
    throw new ApiError('Failed to generate learning content', 502);
  }

  const parsed = response.output_parsed;
  if (!parsed) {
    throw new ApiError('Failed to generate learning content', 502);
  }

  return parsed;
}

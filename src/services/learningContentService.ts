import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../core/errors.js';
import type {
  SceneAnalysis,
  LearningContent,
  LearningElement,
  LearningElementCategory
} from '../core/types/visual.js';

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

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) {
    return labels[0] ?? '';
  }
  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }
  return `${labels.slice(0, -1).join(', ')}, and ${labels.at(-1)}`;
}

function fallbackElement(category: LearningElementCategory, labels: string[]): LearningElement {
  const subject = joinLabels(labels);
  const categoryCopy: Record<LearningElementCategory, Omit<LearningElement, 'category' | 'name'>> = {
    color: {
      description: `The scene includes ${subject}. Together, these colors create a palette worth studying.`,
      artisticUse: 'Artists build palettes to guide mood, contrast, and the viewer’s attention.',
      effect: 'Color contrast can make a focal point stand out while related colors help a composition feel connected.',
      howToUse: `Make a small palette from ${subject}, then choose one color as the focal point and soften the others.`,
      activity: `Create three small color studies using ${subject}: one balanced, one high-contrast, and one quiet.`
    },
    shape: {
      description: `The scene includes ${subject}. These shapes give the composition its visual structure.`,
      artisticUse: 'Artists use shape to simplify subjects, organize space, and lead the eye through an image.',
      effect: 'Repeating or contrasting shapes can make artwork feel rhythmic, stable, playful, or tense.',
      howToUse: `Build your drawing from ${subject} before adding smaller details.`,
      activity: `Draw a simple object using only ${subject}, then change the scale and overlap of each shape.`
    },
    line: {
      description: `The scene includes ${subject} lines. Their direction helps describe movement and structure.`,
      artisticUse: 'Artists use line direction to describe edges, movement, energy, and depth.',
      effect: 'Vertical lines can feel steady, while diagonal lines often add motion or tension.',
      howToUse: `Use ${subject} lines to divide your page into areas and guide the viewer toward the subject.`,
      activity: `Fill a page with ${subject} lines, varying their length, spacing, and pressure.`
    },
    texture: {
      description: `The scene includes ${subject} texture. Texture describes how a surface appears or feels.`,
      artisticUse: 'Artists use texture to make surfaces feel believable and to add contrast between materials.',
      effect: 'A textured area can become a tactile focal point, especially beside a smooth or open area.',
      howToUse: `Suggest ${subject} with repeated marks instead of outlining every detail.`,
      activity: `Create two swatches inspired by ${subject}: one dense and one light, then use them in a small drawing.`
    },
    pattern: {
      description: `The scene includes ${subject} patterning. Patterns are created when visual elements repeat.`,
      artisticUse: 'Artists use pattern to decorate surfaces, create rhythm, and connect separate areas of a composition.',
      effect: 'Repetition creates rhythm; changing one repeated element creates emphasis and keeps the eye moving.',
      howToUse: `Repeat ${subject} across part of your artwork, then interrupt it once to create a focal point.`,
      activity: `Design a small repeating pattern inspired by ${subject}, then place it inside an object or border.`
    }
  };

  const copy = categoryCopy[category];
  const nameByCategory: Record<LearningElementCategory, string> = {
    color: `Palette: ${subject}`,
    shape: `Shape language: ${subject}`,
    line: `Line direction: ${subject}`,
    texture: `Surface texture: ${subject}`,
    pattern: `Pattern and repetition: ${subject}`
  };

  return { category, ...copy, name: nameByCategory[category] };
}

function generateFallbackLearningContent(elements: NormalizedElement[]): LearningContent {
  const grouped = elements.reduce<Partial<Record<LearningElementCategory, string[]>>>((acc, element) => {
    acc[element.category] = [...(acc[element.category] ?? []), element.label];
    return acc;
  }, {});

  const categories = (['color', 'shape', 'line', 'texture', 'pattern'] as LearningElementCategory[])
    .filter((category) => grouped[category]?.length)
    .map((category) => fallbackElement(category, grouped[category] ?? []));

  const themes = categories.map((element) => element.name.toLowerCase()).join(', ');
  return {
    summary: `Your scene offers a study in ${themes}. Try combining these themes in one small composition, letting one element lead and the others support it.`,
    elements: categories
  };
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

  // Keep Learn mode usable for local demos and judging environments where no
  // server-side OpenAI key is available. A configured key upgrades this to
  // model-generated, structured teaching content.
  if (!env.openaiApiKey) {
    return generateFallbackLearningContent(normalized);
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

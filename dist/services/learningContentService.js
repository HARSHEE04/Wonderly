import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../core/errors.js';
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
    elements: z.array(learningElementSchema)
});
export const LEARNING_CONTENT_SYSTEM_PROMPT = `You are an art education assistant helping students understand visual elements discovered in their surroundings.

A computer vision system has already detected visual elements in the student's environment and supplies them to you as structured data. You do not perform detection yourself, and you must never claim to have personally seen or detected anything in the image.

For each detected element you are given, provide:
1. A brief explanation of what it is.
2. How artists commonly use it.
3. What visual or compositional effect it can create.
4. A practical suggestion for how the student could incorporate it into their own artwork.
5. One short, concrete creative activity or exercise using it.

Detected elements fall into these categories: shapes, colors, lines, textures, and patterns.

Only discuss elements explicitly supplied to you. Do not invent additional shapes, colors, lines, textures, or patterns that were not provided, and do not duplicate an element that appears more than once.

Keep the writing concise, friendly, educational, and actionable. Use accessible art terminology and explain concepts clearly for a beginner.

If multiple detected elements naturally work well together, use the summary to briefly describe how they could interact in a single composition.`;
function normalizeScene(scene) {
    const seen = new Set();
    const elements = [];
    const push = (category, label) => {
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
function buildUserPrompt(elements) {
    const grouped = elements.reduce((acc, element) => {
        const key = `${element.category}s`;
        acc[key] = acc[key] ?? [];
        acc[key].push(element.label);
        return acc;
    }, {});
    return `Detected visual elements (grouped by category, as JSON):\n${JSON.stringify(grouped, null, 2)}`;
}
let client = null;
function getClient() {
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
export async function generateLearningContent(scene) {
    const normalized = normalizeScene(scene);
    if (normalized.length === 0) {
        throw new ApiError('No detected visual elements to generate learning content for', 400);
    }
    const openai = getClient();
    let response;
    try {
        response = await openai.responses.parse({
            model: env.openaiModel,
            input: [
                { role: 'system', content: LEARNING_CONTENT_SYSTEM_PROMPT },
                { role: 'user', content: buildUserPrompt(normalized) }
            ],
            text: { format: zodTextFormat(learningContentSchema, 'learning_content') }
        });
    }
    catch {
        throw new ApiError('Failed to generate learning content', 502);
    }
    const parsed = response.output_parsed;
    if (!parsed) {
        throw new ApiError('Failed to generate learning content', 502);
    }
    return parsed;
}

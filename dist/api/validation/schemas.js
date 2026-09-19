import { z } from 'zod';
const colorFeatureSchema = z.object({
    id: z.string(),
    confidence: z.number().optional(),
    label: z.string().optional(),
    hex: z.string().optional(),
    name: z.string().optional()
});
const shapeFeatureSchema = z.object({
    id: z.string(),
    confidence: z.number().optional(),
    label: z.string().optional(),
    contourId: z.string().optional()
});
const textureFeatureSchema = z.object({
    id: z.string(),
    confidence: z.number().optional(),
    label: z.string().optional(),
    assetId: z.string().optional()
});
const lineFeatureSchema = z.object({
    id: z.string(),
    confidence: z.number().optional(),
    label: z.string().optional(),
    orientation: z.enum(['vertical', 'horizontal', 'diagonal', 'other']).optional()
});
const patternFeatureSchema = z.object({
    id: z.string(),
    confidence: z.number().optional(),
    label: z.string().optional(),
    patternType: z.string().optional()
});
const objectFeatureSchema = z.object({
    id: z.string(),
    confidence: z.number().optional(),
    label: z.string().optional(),
    objectType: z.string().optional()
});
export const sceneAnalysisSchema = z.object({
    colors: z.array(colorFeatureSchema),
    shapes: z.array(shapeFeatureSchema),
    textures: z.array(textureFeatureSchema),
    lines: z.array(lineFeatureSchema),
    patterns: z.array(patternFeatureSchema),
    semanticObjects: z.array(objectFeatureSchema).optional()
});
export const sessionCreateSchema = z.object({
    userId: z.string().min(1),
    mode: z.enum(['creative', 'learning']).default('creative')
});
export const completeSessionSchema = z.object({
    userId: z.string().min(1),
    challengeType: z.string().optional(),
    artworkMetadata: z.record(z.any()).optional()
});
export const learningResourceQuerySchema = z.object({
    concept: z.string().min(1)
});

import { describe, expect, it, vi, beforeEach } from 'vitest';
const parseMock = vi.fn();
vi.mock('openai', () => ({
    default: vi.fn().mockImplementation(() => ({
        responses: { parse: parseMock }
    }))
}));
const { generateLearningContent } = await import('./learningContentService.js');
const { mockScenes } = await import('../data/mockScenes.js');
const { env } = await import('../config/env.js');
describe('learningContentService', () => {
    beforeEach(() => {
        parseMock.mockReset();
        env.openaiApiKey = 'test-key';
    });
    it('throws without calling OpenAI when the scene has no detected elements', async () => {
        const emptyScene = { colors: [], shapes: [], textures: [], lines: [], patterns: [] };
        await expect(generateLearningContent(emptyScene)).rejects.toThrow('No detected visual elements');
        expect(parseMock).not.toHaveBeenCalled();
    });
    it('throws a configuration error when OPENAI_API_KEY is missing', async () => {
        env.openaiApiKey = '';
        await expect(generateLearningContent(mockScenes.learningModeDemo)).rejects.toThrow('not configured');
        expect(parseMock).not.toHaveBeenCalled();
    });
    it('returns validated structured content for a populated scene', async () => {
        const fakeContent = {
            summary: 'These elements can combine into a bold, geometric composition.',
            elements: [
                {
                    category: 'shape',
                    name: 'circle',
                    description: 'A circle is a closed curve with no corners.',
                    artisticUse: 'Artists use circles to draw the eye and suggest unity or motion.',
                    effect: 'Creates a soft, harmonious focal point.',
                    howToUse: 'Try using a circular frame around your main subject.',
                    activity: 'Sketch three overlapping circles of different sizes.'
                }
            ]
        };
        parseMock.mockResolvedValue({ output_parsed: fakeContent });
        const result = await generateLearningContent(mockScenes.learningModeDemo);
        expect(result).toEqual(fakeContent);
        expect(parseMock).toHaveBeenCalledTimes(1);
    });
    it('wraps OpenAI request failures in a controlled error', async () => {
        parseMock.mockRejectedValue(new Error('network fail'));
        await expect(generateLearningContent(mockScenes.learningModeDemo)).rejects.toThrow('Failed to generate learning content');
    });
    it('wraps a missing/malformed structured response in a controlled error', async () => {
        parseMock.mockResolvedValue({ output_parsed: null });
        await expect(generateLearningContent(mockScenes.learningModeDemo)).rejects.toThrow('Failed to generate learning content');
    });
});

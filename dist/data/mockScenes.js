export const mockScenes = {
    characterFriendly: {
        colors: [{ id: 'color-1', name: 'forest green', hex: '#527A49' }],
        shapes: [{ id: 'shape-1', label: 'circle' }],
        textures: [{ id: 'texture-1', label: 'concrete' }],
        lines: [{ id: 'line-1', orientation: 'vertical' }],
        patterns: [],
        semanticObjects: [{ id: 'object-1', label: 'plant pot' }]
    },
    architectureFriendly: {
        colors: [{ id: 'color-2', name: 'sand', hex: '#D9C7A3' }],
        shapes: [{ id: 'shape-2', label: 'rectangle' }],
        textures: [{ id: 'texture-2', label: 'stone' }],
        lines: [{ id: 'line-2', orientation: 'vertical' }],
        patterns: [{ id: 'pattern-1', patternType: 'grid' }],
        semanticObjects: [{ id: 'object-2', label: 'pillar' }]
    },
    patternHeavy: {
        colors: [{ id: 'color-3', name: 'teal', hex: '#5CC8C8' }],
        shapes: [{ id: 'shape-3', label: 'triangle' }],
        textures: [{ id: 'texture-3', label: 'woven' }],
        lines: [{ id: 'line-3', orientation: 'diagonal' }],
        patterns: [{ id: 'pattern-2', patternType: 'zigzag' }, { id: 'pattern-3', patternType: 'stripe' }],
        semanticObjects: [{ id: 'object-3', label: 'wall panel' }]
    },
    insufficient: {
        colors: [{ id: 'color-4', name: 'blue', hex: '#0000FF' }],
        shapes: [],
        textures: [],
        lines: [],
        patterns: []
    },
    // Mock fixture for exercising Learning Mode's OpenAI generation independent of the real OpenCV pipeline.
    learningModeDemo: {
        colors: [
            { id: 'lm-color-1', name: 'burnt orange', hex: '#E67E45' },
            { id: 'lm-color-2', name: 'slate blue', hex: '#527CA3' }
        ],
        shapes: [
            { id: 'lm-shape-1', label: 'circle' },
            { id: 'lm-shape-2', label: 'rectangle' }
        ],
        textures: [{ id: 'lm-texture-1', label: 'rough / high edge density' }],
        lines: [
            { id: 'lm-line-1', orientation: 'vertical' },
            { id: 'lm-line-2', orientation: 'diagonal' }
        ],
        patterns: [{ id: 'lm-pattern-1', patternType: 'repetition' }]
    }
};

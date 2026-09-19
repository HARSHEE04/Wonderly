import { defaultChallengeTemplates } from '../product/engine.js';
export const seedChallengeTemplates = defaultChallengeTemplates;
export const demoResources = [
    {
        concept: 'symmetry',
        title: 'Symmetry in Art: A Beginner Guide',
        url: 'https://www.tate.org.uk/art/student-resource/starting-out/symmetry',
        source: 'Tate',
        summary: 'An overview of symmetry and balance in visual art.',
        verified: true
    },
    {
        concept: 'composition',
        title: 'Composition in Art',
        url: 'https://www.tate.org.uk/art/student-resource/starting-out/composition',
        source: 'Tate',
        summary: 'An introduction to composition and layout principles for visual work.',
        verified: true
    },
    {
        concept: 'perspective',
        title: 'Perspective in Drawing',
        url: 'https://www.khanacademy.org/humanities/art-architecture/artist-work/figure-drawing/v/perspective',
        source: 'Khan Academy',
        summary: 'A practical explanation of perspective in drawing and composition.',
        verified: true
    }
];
export function seedDemoUser() {
    return {
        id: 'demo-user',
        displayName: 'Demo Artist',
        preferences: {
            mode: 'creative'
        }
    };
}
export const demoLearningProgress = {
    userId: 'demo-user',
    concepts: [
        { concept: 'color', timesSeen: 5, timesPracticed: 4 },
        { concept: 'shape', timesSeen: 4, timesPracticed: 3 },
        { concept: 'perspective', timesSeen: 1, timesPracticed: 0 }
    ]
};

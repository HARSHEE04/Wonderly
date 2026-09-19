import { generateLearningContent } from '../services/learningContentService.js';
import { mockScenes } from '../data/mockScenes.js';
import { env } from '../config/env.js';

/**
 * Manual smoke test for the OpenAI Learning Mode integration: calls the real
 * OpenAI API (via generateLearningContent) with a mock scene, bypassing HTTP.
 * Usage: npm run test:learning [-- <mockSceneName>]  (defaults to learningModeDemo)
 */
async function main() {
  if (!env.openaiApiKey) {
    console.error('OPENAI_API_KEY is not set in .env — add it before running this script.');
    process.exit(1);
  }

  const sceneName = process.argv[2] ?? 'learningModeDemo';
  const scene = mockScenes[sceneName];
  if (!scene) {
    console.error(`Unknown mock scene "${sceneName}". Available: ${Object.keys(mockScenes).join(', ')}`);
    process.exit(1);
  }

  console.log(`Generating learning content for mock scene "${sceneName}"...`);
  const content = await generateLearningContent(scene);
  console.log(JSON.stringify(content, null, 2));
  console.log(`\nOK: received summary + ${content.elements.length} element(s).`);
}

main().catch((error) => {
  console.error('Failed to generate learning content:', error instanceof Error ? error.message : error);
  process.exit(1);
});

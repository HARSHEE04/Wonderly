import { demoResources } from '../data/seed.js';
import { env } from '../config/env.js';
import type { LearningResource } from '../core/types/visual.js';
import { getCachedLearningResources, cacheLearningResources } from '../database/repository.js';

export interface LearningResourceProvider {
  getResourcesForConcept(concept: string): Promise<LearningResource[]>;
}

export class MockLearningResourceProvider implements LearningResourceProvider {
  async getResourcesForConcept(concept: string): Promise<LearningResource[]> {
    const resources = demoResources.filter((resource) => resource.concept.toLowerCase() === concept.toLowerCase());
    return resources.length > 0 ? resources : demoResources.slice(0, 2).map((resource) => ({ ...resource, concept }));
  }
}

export class FirecrawlLearningResourceProvider implements LearningResourceProvider {
  async getResourcesForConcept(concept: string): Promise<LearningResource[]> {
    if (!env.firecrawlApiKey) {
      return [];
    }

    try {
      const response = await fetch('https://api.firecrawl.dev/v1/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.firecrawlApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `${concept} art learning resource`,
          pageOptions: { limit: 3 }
        })
      });

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as { data?: Array<{ title?: string; url?: string; source?: string; summary?: string }> };
      return (payload.data ?? []).map((item, index) => ({
        concept,
        title: item.title ?? `Resource ${index + 1}`,
        url: item.url ?? 'https://example.com',
        source: item.source ?? 'Firecrawl',
        summary: item.summary ?? 'Search result from Firecrawl',
        verified: false,
        retrievedAt: new Date()
      }));
    } catch {
      return [];
    }
  }
}

export class LearningResourceService {
  constructor(private readonly provider: LearningResourceProvider = new MockLearningResourceProvider()) {}

  async getResourcesForConcept(concept: string): Promise<LearningResource[]> {
    const cached = await getCachedLearningResources(concept);
    if (cached.length > 0) {
      return cached;
    }

    const resources = await this.provider.getResourcesForConcept(concept);
    const finalResources =
      resources.length > 0
        ? resources
        : demoResources
            .filter((resource) => resource.concept.toLowerCase() === concept.toLowerCase())
            .concat(demoResources.filter((resource) => resource.concept.toLowerCase() !== concept.toLowerCase()).slice(0, 1));

    await cacheLearningResources(concept, finalResources);
    return finalResources;
  }
}

export const learningResourceService = new LearningResourceService(
  env.firecrawlApiKey ? new FirecrawlLearningResourceProvider() : new MockLearningResourceProvider()
);

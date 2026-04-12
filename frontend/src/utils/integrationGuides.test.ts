import { describe, expect, it } from 'vitest';
import {
  findBestTemplateForRecipe,
  getIntegrationGuide,
} from './integrationGuides';
import type { Template } from '@/types';

const templates: Template[] = [
  {
    _id: 'template-academic',
    name: 'Academic Trust',
    description: 'A clean academic layout.',
    thumbnail: 'https://example.com/academic.png',
    category: 'academic',
    htmlContent: '<div>Academic</div>',
    styles: '.academic {}',
    fields: [],
    isPublic: true,
    createdBy: 'user-1',
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
  },
  {
    _id: 'template-corporate',
    name: 'Corporate Edge',
    description: 'A modern professional layout.',
    thumbnail: 'https://example.com/corporate.png',
    category: 'corporate',
    htmlContent: '<div>Corporate</div>',
    styles: '.corporate {}',
    fields: [],
    isPublic: true,
    createdBy: 'user-1',
    createdAt: '2026-04-05T10:00:00.000Z',
    updatedAt: '2026-04-05T10:00:00.000Z',
  },
];

describe('integrationGuides', () => {
  it('exposes the new Canvas course completion playbook', () => {
    const guide = getIntegrationGuide('canvas');

    expect(
      guide.recipes.some((recipe) => recipe.id === 'canvas-course-completion')
    ).toBe(true);
    expect(guide.qaChecks.length).toBeGreaterThan(0);
  });

  it('matches recipes with the best template from the workspace library', () => {
    const guide = getIntegrationGuide('canvas');
    const recipe = guide.recipes.find(
      (item) => item.id === 'canvas-course-completion'
    );

    expect(recipe).toBeDefined();
    expect(findBestTemplateForRecipe(recipe!, templates)?._id).toBe(
      'template-academic'
    );
  });
});

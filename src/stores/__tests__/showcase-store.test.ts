import { describe, it, expect, beforeEach } from 'vitest';
import { useShowcaseStore } from '../showcase-store';

describe('useShowcaseStore state management', () => {
  beforeEach(() => {
    // State is persisted, let's read the default state
  });

  it('should initialize with seed showcases', () => {
    const state = useShowcaseStore.getState();
    expect(state.showcases.length).toBeGreaterThanOrEqual(3);
    const aiShow = state.showcases.find(s => s.id === 'show-ai-researcher');
    expect(aiShow).toBeDefined();
    expect(aiShow?.author).toBe('evelyn_carter');
    expect(aiShow?.technologies).toContain('PyTorch');
  });

  it('should increment showcase views', () => {
    const store = useShowcaseStore.getState();
    const targetId = 'show-minimal-engineer';
    const initialViews = store.showcases.find(s => s.id === targetId)?.views || 0;

    store.viewShowcase(targetId);
    const state = useShowcaseStore.getState();
    const updated = state.showcases.find(s => s.id === targetId);
    expect(updated?.views).toBe(initialViews + 1);
  });

  it('should toggle showcase likes', () => {
    const store = useShowcaseStore.getState();
    const targetId = 'show-webgl-creative';
    const initialLikes = store.showcases.find(s => s.id === targetId)?.likes || 0;

    // Like
    store.likeShowcase(targetId);
    let state = useShowcaseStore.getState();
    let updated = state.showcases.find(s => s.id === targetId);
    expect(updated?.likes).toBe(initialLikes + 1);
    expect(updated?.isLiked).toBe(true);

    // Unlike
    store.likeShowcase(targetId);
    state = useShowcaseStore.getState();
    updated = state.showcases.find(s => s.id === targetId);
    expect(updated?.likes).toBe(initialLikes);
    expect(updated?.isLiked).toBe(false);
  });

  it('should publish a custom showcase', () => {
    const store = useShowcaseStore.getState();
    store.addShowcase({
      name: 'Custom System Kernels',
      description: 'Stunning kernel developer workspace setup',
      author: 'systems_fan',
      category: 'terminal',
      technologies: ['Rust', 'Go', 'Linux'],
      theme: 'terminal',
      config: {
        name: 'Dr. Systems',
        role: 'Systems Programmer',
        about: 'Low level coder',
        skills: 'Rust, Assembly',
        projects: 'micro-kernel',
        socials: '@systems',
        avatarUrl: '',
        template: 'minimal',
        githubStats: { enabled: false, username: '', theme: '', hideBorder: false, showIcons: false, compactMode: false, layout: 'default', cardOrder: [], cardConfigs: { stats: { enabled: false }, languages: { enabled: false }, streak: { enabled: false } } },
        techStack: { enabled: false, style: 'flat', iconOnly: false, groupByCategory: false, hideEmptyCategories: false, selectedIds: [] },
        socialLinks: { enabled: false, style: 'flat', iconOnly: false, platforms: {}, order: [] }
      }
    });

    const state = useShowcaseStore.getState();
    const published = state.showcases.find(s => s.author === 'systems_fan');
    expect(published).toBeDefined();
    expect(published?.name).toBe('Custom System Kernels');
    expect(published?.isCustom).toBe(true);
  });

  it('should support importing showcases list from JSON', () => {
    const store = useShowcaseStore.getState();
    const validJson = JSON.stringify({
      id: 'show-imported-test-1',
      name: 'Neural Cloud Portfolio',
      description: 'Fully responsive AI profile',
      author: 'ai_guru',
      category: 'ai',
      technologies: ['Jupyter', 'FastAPI'],
      theme: 'gradient',
      config: {
        name: 'Guru AI',
        role: 'AI Developer',
        about: 'AI engineer',
        skills: 'Jupyter, PyTorch',
        projects: 'Neural Cloud',
        socials: '@guru',
        avatarUrl: '',
        template: 'portfolio',
        githubStats: { enabled: false, username: '', theme: '', hideBorder: false, showIcons: false, compactMode: false, layout: 'default', cardOrder: [], cardConfigs: { stats: { enabled: false }, languages: { enabled: false }, streak: { enabled: false } } },
        techStack: { enabled: false, style: 'flat', iconOnly: false, groupByCategory: false, hideEmptyCategories: false, selectedIds: [] },
        socialLinks: { enabled: false, style: 'flat', iconOnly: false, platforms: {}, order: [] }
      }
    });

    const res = store.importShowcases(validJson);
    expect(res.success).toBe(true);

    const state = useShowcaseStore.getState();
    const imported = state.showcases.find(s => s.id === 'show-imported-test-1');
    expect(imported).toBeDefined();
    expect(imported?.author).toBe('ai_guru');
  });

  it('should fail validation for incorrect category during import', () => {
    const store = useShowcaseStore.getState();
    const invalidJson = JSON.stringify({
      name: 'Invalid Tech Portfolio',
      category: 'non-existent-category',
      config: {}
    });

    const res = store.importShowcases(invalidJson);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Invalid category');
  });
});

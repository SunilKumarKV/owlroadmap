import { describe, it, expect } from 'vitest';
import { SOCIAL_PLATFORM_REGISTRY, SOCIAL_CATEGORIES } from '../social-registry';

describe('social-registry utilities', () => {
  it('should contain all required categories', () => {
    expect(SOCIAL_CATEGORIES).toContain('Professional');
    expect(SOCIAL_CATEGORIES).toContain('Social');
    expect(SOCIAL_CATEGORIES).toContain('Development');
    expect(SOCIAL_CATEGORIES).toContain('Contact');
  });

  it('should contain all essential social platforms', () => {
    const ids = SOCIAL_PLATFORM_REGISTRY.map((p) => p.id);
    expect(ids).toContain('linkedin');
    expect(ids).toContain('github');
    expect(ids).toContain('x');
    expect(ids).toContain('stackoverflow');
    expect(ids).toContain('email');
    expect(ids).toContain('buymeacoffee');
  });

  it('should have valid configurations for all registered platforms', () => {
    SOCIAL_PLATFORM_REGISTRY.forEach((platform) => {
      expect(platform.id).toBeDefined();
      expect(platform.name).toBeDefined();
      expect(platform.category).toBeDefined();
      expect(platform.color).toMatch(/^[A-Fa-f0-9]{6}$/); // hex color check
      expect(platform.logo).toBeDefined();
      expect(platform.logoColor).toBeDefined();
      expect(platform.placeholder).toBeDefined();
      expect(platform.urlTemplate).toBeDefined();
    });
  });
});

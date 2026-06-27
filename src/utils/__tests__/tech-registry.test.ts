import { describe, it, expect } from 'vitest';
import { TECHNOLOGY_REGISTRY, CATEGORIES } from '../tech-registry';

describe('tech-registry utilities', () => {
  it('should contain all required categories', () => {
    expect(CATEGORIES).toContain('Languages');
    expect(CATEGORIES).toContain('Frontend');
    expect(CATEGORIES).toContain('Backend');
    expect(CATEGORIES).toContain('Database');
    expect(CATEGORIES).toContain('DevOps & Cloud');
    expect(CATEGORIES).toContain('Tools');
  });

  it('should contain all essential technologies', () => {
    const ids = TECHNOLOGY_REGISTRY.map((t) => t.id);
    expect(ids).toContain('javascript');
    expect(ids).toContain('react');
    expect(ids).toContain('nodejs');
    expect(ids).toContain('postgresql');
    expect(ids).toContain('docker');
    expect(ids).toContain('git');
  });

  it('should have valid format parameters for all technologies', () => {
    TECHNOLOGY_REGISTRY.forEach((tech) => {
      expect(tech.id).toBeDefined();
      expect(tech.name).toBeDefined();
      expect(tech.category).toBeDefined();
      expect(tech.color).toMatch(/^[A-Fa-f0-9]{6}$/); // hex code format check
      expect(tech.logo).toBeDefined();
      expect(tech.logoColor).toBeDefined();
    });
  });
});

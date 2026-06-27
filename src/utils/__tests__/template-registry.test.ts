import { describe, it, expect } from 'vitest';
import { TEMPLATE_MARKETPLACE, TemplateCategory } from '../template-registry';

describe('TEMPLATE_MARKETPLACE registry tests', () => {
  it('should contain exactly 9 templates', () => {
    expect(TEMPLATE_MARKETPLACE.length).toBe(9);
  });

  it('should map each template to its correct category', () => {
    const expectedCategories: TemplateCategory[] = [
      'minimal',
      'modern',
      'open-source',
      'full-stack',
      'frontend',
      'ai',
      'terminal',
      'gprm',
      'anime'
    ];

    expectedCategories.forEach((cat) => {
      const template = TEMPLATE_MARKETPLACE.find((tpl) => tpl.category === cat);
      expect(template).toBeDefined();
      expect(template?.category).toBe(cat);
    });
  });

  it('should contain valid configurations for all sections', () => {
    TEMPLATE_MARKETPLACE.forEach((tpl) => {
      expect(tpl.id).toBeDefined();
      expect(tpl.name).toBeDefined();
      expect(tpl.description).toBeDefined();
      expect(tpl.sections).toBeInstanceOf(Array);
      expect(tpl.config).toBeDefined();
      expect(tpl.config.header).toBeDefined();
      expect(tpl.config.githubStats).toBeDefined();
      expect(tpl.config.techStack).toBeDefined();
      expect(tpl.config.socialLinks).toBeDefined();
      expect(tpl.config.achievements).toBeDefined();
    });
  });

  it('should set appropriate themes for specific categories', () => {
    const terminalTpl = TEMPLATE_MARKETPLACE.find((tpl) => tpl.category === 'terminal');
    expect(terminalTpl?.theme).toBe('terminal');

    const minimalistTpl = TEMPLATE_MARKETPLACE.find((tpl) => tpl.category === 'minimal');
    expect(minimalistTpl?.theme).toBe('minimal');
  });
});

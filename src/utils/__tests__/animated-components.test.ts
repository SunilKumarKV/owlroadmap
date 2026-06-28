import { describe, it, expect } from 'vitest';
import { generateAnimatedComponentsMarkdown } from '../markdown';
import { AnimatedComponentsConfig } from '@/stores/readme-store';

describe('generateAnimatedComponentsMarkdown helper', () => {
  it('should return empty string when configuration is disabled', () => {
    const config: AnimatedComponentsConfig = {
      enabled: false,
      components: [
        {
          id: 'typing-svg',
          type: 'typing',
          enabled: true,
          title: 'Typing SVG',
          config: { lines: ['Hello'] }
        }
      ]
    };
    expect(generateAnimatedComponentsMarkdown(config, 'test-user')).toBe('');
  });

  it('should generate typing SVG source parameters correctly', () => {
    const config: AnimatedComponentsConfig = {
      enabled: true,
      components: [
        {
          id: 'typing-svg',
          type: 'typing',
          enabled: true,
          title: 'Typing SVG',
          config: {
            lines: ['Hi', 'Developer'],
            speed: 12,
            delay: 500,
            color: 'ffffff'
          }
        }
      ]
    };
    const markdown = generateAnimatedComponentsMarkdown(config, 'test-user');
    expect(markdown).toContain('readme-typing-svg.demolab.com');
    expect(markdown).toContain('speed=12');
    expect(markdown).toContain('color=ffffff');
    expect(markdown).toContain('Hi');
  });

  it('should generate inline divider path details correctly', () => {
    const config: AnimatedComponentsConfig = {
      enabled: true,
      components: [
        {
          id: 'neon-divider',
          type: 'divider',
          enabled: true,
          title: 'Divider',
          config: {
            style: 'waves',
            color1: '#000',
            color2: '#fff'
          }
        }
      ]
    };
    const markdown = generateAnimatedComponentsMarkdown(config, 'test-user');
    expect(markdown).toContain('<svg width="100%" height="20"');
    expect(markdown).toContain('stop-color="#000"');
    expect(markdown).toContain('stop-color="#fff"');
  });
});

import { describe, it, expect } from 'vitest';
import { analyzeReadmeMarkdown } from '../readme-analyzer';

describe('readme-analyzer utilities', () => {
  it('should score an empty README low', () => {
    const analysis = analyzeReadmeMarkdown('');
    expect(analysis.overallScore).toBeLessThan(40);
    expect(analysis.missingSections).toContain('Profile Header');
    expect(analysis.missingSections).toContain('About Me');
    expect(analysis.missingSections).toContain('Social Links');
    expect(analysis.missingSections).toContain('Tech Stack');
    expect(analysis.missingSections).toContain('Featured Projects');
    expect(analysis.missingSections).toContain('GitHub Stats');
  });

  it('should score a complete profile README high', () => {
    const markdown = `# Sunil Kumar
Welcome to my profile! I am a Full Stack Developer.

## About Me
I enjoy building scalable frontend apps. Based in India.

## Tech Stack
![React](https://img.shields.io/badge/React-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)

## Projects
- [owlroadmap](https://github.com/SunilKumarKV/owlroadmap) - Visually build interactive roadmap charts.

## Stats
![GitHub Stats](https://github-readme-stats.vercel.app/api?username=SunilKumarKV&theme=dark)
![Streak Card](https://github-readme-streak-stats.herokuapp.com/?user=SunilKumarKV)

## Connect
[![LinkedIn Badge](https://img.shields.io/badge/LinkedIn-blue?logo=linkedin)](https://linkedin.com/in/sunilkumar)
[![X Badge](https://img.shields.io/badge/Twitter-black?logo=x)](https://x.com/sunilkumar)
`;

    const analysis = analyzeReadmeMarkdown(markdown);
    expect(analysis.overallScore).toBeGreaterThan(70);
    expect(analysis.categories.completeness.score).toBe(100);
    expect(analysis.categories.branding.score).toBe(100); // role, multiple socials, portfolio link (github-readme-stats doesn't count, but github.com/SunilKumarKV/owlroadmap might or connect badges)
  });

  it('should detect spacing and header hierarchy errors', () => {
    const markdown = `# Title
# Another Title
## Heading
### Heading 3
##`; // empty header and multiple H1s

    const analysis = analyzeReadmeMarkdown(markdown);
    expect(analysis.categories.readability.items.find((i) => i.name === 'Single Main Title (H1)')?.passed).toBe(false);
    expect(analysis.categories.readability.items.find((i) => i.name === 'No Empty Headings')?.passed).toBe(false);
    expect(analysis.categories.readability.score).toBeLessThan(80);
  });

  it('should check accessibility alt-texts and link names', () => {
    const markdown = `# Name
![](https://some-image-url.com)
[click here](https://linkedin.com)
`;
    const analysis = analyzeReadmeMarkdown(markdown);
    expect(analysis.categories.accessibility.items.find((i) => i.name === 'Descriptive Image Alt Text')?.passed).toBe(false);
    expect(analysis.categories.accessibility.items.find((i) => i.name === 'Descriptive Link Labels')?.passed).toBe(false);
    expect(analysis.categories.accessibility.score).toBeLessThan(80);
  });

  it('should detect heading hierarchy sequence skips', () => {
    const markdown = `# Title
### Heading Level 3 (Skipped H2)
`;
    const analysis = analyzeReadmeMarkdown(markdown);
    expect(analysis.categories.accessibility.items.find((i) => i.name === 'Logical Heading Order')?.passed).toBe(false);
  });
});

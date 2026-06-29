import { describe, it, expect } from 'vitest';
import { parseReadmeMarkdown } from '../readme-importer';

describe('parseReadmeMarkdown parser tests', () => {
  it('should parse minimal headers, name, and alignment correctly', () => {
    const rawMarkdown = `
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=tokyonight&height=120&section=header&text=My%20Header" alt="Banner" />
</p>

# Hi 👋, I'm Jane Doe (she/her)
### Frontend Architect based in London, UK

This is my introduction bio paragraph.
    `;

    const result = parseReadmeMarkdown(rawMarkdown);
    expect(result.detectedSections).toContain('header');
    expect(result.data.header.name).toBe('Jane Doe');
    expect(result.data.header.pronouns).toBe('she/her');
    expect(result.data.header.title).toBe('Frontend Architect');
    expect(result.data.header.location).toBe('London, UK');
    expect(result.data.header.bannerType).toBe('capsule');
    expect(result.data.header.bannerTheme).toBe('tokyonight');
    expect(result.data.header.bannerText).toBe('My Header');
    expect(result.data.header.alignment).toBe('center');
  });

  it('should parse typing SVGs correctly', () => {
    const rawMarkdown = `
<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com/?lines=Building%20React%20Apps;Open%20Source%20Contributor&color=e2e8f0&center=true&speed=150&pause=2000" alt="Typing SVG" />
</p>
    `;

    const result = parseReadmeMarkdown(rawMarkdown);
    expect(result.detectedSections).toContain('header');
    expect(result.data.header.typingEnabled).toBe(true);
    expect(result.data.header.typingLines).toEqual(['Building React Apps', 'Open Source Contributor']);
    expect(result.data.header.typingColor).toBe('e2e8f0');
    expect(result.data.header.typingCenter).toBe(true);
    expect(result.data.header.typingSpeed).toBe(150);
    expect(result.data.header.typingDelay).toBe(2000);
  });

  it('should parse social links and tech stack badges correctly', () => {
    const rawMarkdown = `
## 🔗 Social Links & Contact

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/janedoe)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://twitter.com/janedoe)

## 💻 Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
    `;

    const result = parseReadmeMarkdown(rawMarkdown);
    expect(result.detectedSections).toContain('socials');
    expect(result.detectedSections).toContain('techStack');
    
    expect(result.data.socialLinks.platforms.linkedin.value).toBe('janedoe');
    expect(result.data.socialLinks.platforms.x.value).toBe('janedoe');
    expect(result.data.socialLinks.style).toBe('flat-square');

    expect(result.data.techStack.selectedIds).toContain('react');
    expect(result.data.techStack.selectedIds).toContain('typescript');
    expect(result.data.techStack.style).toBe('for-the-badge');
  });

  it('should parse stats cards, streak, and achievements correctly', () => {
    const rawMarkdown = `
### 📊 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=janedoe&theme=tokyonight&show_icons=true" alt="GitHub Stats" />
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=janedoe&theme=tokyonight" alt="GitHub Streak" />
</p>

### 🏆 GitHub Trophies

[![GitHub Trophies](https://github-profile-trophy.vercel.app/?username=janedoe&theme=flat)](https://github.com/ryo-ma/github-profile-trophy)
    `;

    const result = parseReadmeMarkdown(rawMarkdown);
    expect(result.detectedSections).toContain('stats');
    expect(result.detectedSections).toContain('achievements');
    expect(result.data.githubStats.username).toBe('janedoe');
    expect(result.data.githubStats.theme).toBe('tokyonight');
    expect(result.data.githubStats.showIcons).toBe(true);
    expect(result.data.achievements.username).toBe('janedoe');
    expect(result.data.achievements.widgets.trophy.enabled).toBe(true);
    expect(result.data.achievements.widgets.trophy.theme).toBe('flat');
  });

  it('should handle malformed or custom section markdown safely as custom fallback', () => {
    const rawMarkdown = `
Some custom markdown that has no known sections
### Custom Headline
Some description of weird stuff.
    `;

    const result = parseReadmeMarkdown(rawMarkdown);
    expect(result.detectedSections).toContain('custom');
    expect(result.data.customMarkdown.enabled).toBe(true);
    expect(result.data.customMarkdown.content).toContain('Some custom markdown');
  });
});

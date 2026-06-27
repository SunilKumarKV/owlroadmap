import { describe, it, expect } from 'vitest';
import { generateReadmeMarkdown, generateRoadmapMarkdown, combineMarkdown, READMEData, generateGithubStatsMarkdown, generateTechStackMarkdown } from '../markdown';

describe('markdown utilities', () => {
  describe('generateReadmeMarkdown', () => {
    const baseData: READMEData = {
      name: 'Alice Developer',
      role: 'Frontend Engineer',
      about: 'I design user interfaces.',
      skills: 'React, TypeScript, CSS',
      projects: '1. OwlRoadmap\n2. Portfolio',
      socials: 'GitHub: @alice',
    };

    it('should generate minimal template markdown by default', () => {
      const markdown = generateReadmeMarkdown({ ...baseData, template: 'minimal' });
      expect(markdown).toContain('# Alice Developer');
      expect(markdown).toContain('## Frontend Engineer');
      expect(markdown).toContain('I design user interfaces.');
      expect(markdown).toContain('### Skills\nReact, TypeScript, CSS');
      expect(markdown).toContain('### Projects\n1. OwlRoadmap\n2. Portfolio');
      expect(markdown).toContain('### Socials\nGitHub: @alice');
    });

    it('should generate professional template markdown', () => {
      const markdown = generateReadmeMarkdown({ ...baseData, template: 'professional' });
      expect(markdown).toContain('# Alice Developer');
      expect(markdown).toContain('### *Frontend Engineer*');
      expect(markdown).toContain('### 🎯 About Me\nI design user interfaces.');
      expect(markdown).toContain('### 🛠️ Skills\nReact, TypeScript, CSS');
    });

    it('should generate developer template markdown', () => {
      const markdown = generateReadmeMarkdown({ ...baseData, template: 'developer' });
      expect(markdown).toContain('# 💻 Alice Developer');
      expect(markdown).toContain('> Frontend Engineer');
      expect(markdown).toContain('### 🚀 Tech Stack & Skills\nReact, TypeScript, CSS');
      expect(markdown).toContain('### 🌟 Profile\nI design user interfaces.');
    });

    it('should generate open-source template markdown', () => {
      const markdown = generateReadmeMarkdown({ ...baseData, template: 'open-source' });
      expect(markdown).toContain('# 🤝 Alice Developer | Open Source');
      expect(markdown).toContain('**Frontend Engineer**');
      expect(markdown).toContain('### 📦 Open Source Contributions & Repositories\n1. OwlRoadmap\n2. Portfolio');
      expect(markdown).toContain('### 🌟 About Me\nI design user interfaces.');
    });

    it('should generate portfolio template markdown', () => {
      const markdown = generateReadmeMarkdown({ ...baseData, template: 'portfolio' });
      expect(markdown).toContain('# ✨ Alice Developer - Portfolio');
      expect(markdown).toContain('*Frontend Engineer*');
      expect(markdown).toContain('### 🎨 About & Skills\nI design user interfaces.\n\nReact, TypeScript, CSS');
    });

    it('should render avatar and stats if provided', () => {
      const data: READMEData = {
        name: 'Bob',
        avatarUrl: 'https://example.com/bob.png',
        followers: 12,
        following: 15,
        publicRepos: 8,
      };

      const markdown = generateReadmeMarkdown(data);
      expect(markdown).toContain('<img src="https://example.com/bob.png"');
      expect(markdown).toContain('👥 <b>Followers:</b> 12 | 👥 <b>Following:</b> 15 | 📦 <b>Repos:</b> 8');
    });
  });

  describe('generateRoadmapMarkdown', () => {
    it('should generate roadmap markdown list from steps', () => {
      const data = {
        title: 'React Roadmap',
        steps: ['HTML & CSS', 'JavaScript Basics', 'React Core', 'State Management'],
      };
      const markdown = generateRoadmapMarkdown(data);
      expect(markdown).toBe('# React Roadmap\n\n1. HTML & CSS\n2. JavaScript Basics\n3. React Core\n4. State Management');
    });

    it('should filter out empty or whitespace steps', () => {
      const data = {
        title: 'Clean Roadmap',
        steps: ['Step A', '  ', '', 'Step B'],
      };
      const markdown = generateRoadmapMarkdown(data);
      expect(markdown).toBe('# Clean Roadmap\n\n1. Step A\n2. Step B');
    });

    it('should handle empty steps list', () => {
      const data = {
        title: 'Empty Roadmap',
        steps: [],
      };
      const markdown = generateRoadmapMarkdown(data);
      expect(markdown).toBe('# Empty Roadmap');
    });
  });

  describe('combineMarkdown', () => {
    it('should combine readme and roadmap markdown with proper spacing', () => {
      const readme = '# Alice';
      const roadmap = '# My Path';
      expect(combineMarkdown(readme, roadmap)).toBe('# Alice\n\n# My Path');
    });

    it('should return only readme if roadmap is empty', () => {
      expect(combineMarkdown('# Alice', '')).toBe('# Alice');
    });

    it('should return only roadmap if readme is empty', () => {
      expect(combineMarkdown('', '# My Path')).toBe('# My Path');
    });
  });

  describe('generateGithubStatsMarkdown', () => {
    it('should return empty string if stats are disabled or username is missing', () => {
      expect(generateGithubStatsMarkdown(null as any)).toBe('');
      expect(generateGithubStatsMarkdown({ enabled: false } as any)).toBe('');
      expect(generateGithubStatsMarkdown({ enabled: true, username: '' } as any)).toBe('');
    });

    it('should generate stats card markdown with correct options', () => {
      const stats = {
        enabled: true,
        username: 'tester',
        theme: 'radical',
        hideBorder: true,
        showIcons: false,
        compactMode: true,
        layout: 'compact' as any,
        cardOrder: ['stats', 'languages', 'streak'] as any,
        cardConfigs: {
          stats: { enabled: true },
          languages: { enabled: true },
          streak: { enabled: false },
        },
      };

      const result = generateGithubStatsMarkdown(stats);
      expect(result).toContain('### 📊 GitHub Stats');
      expect(result).toContain('<p align="center">');
      // Stats card image source check
      expect(result).toContain('https://github-readme-stats.vercel.app/api?username=tester&theme=radical&hide_border=true&layout=compact');
      // Top Langs card image source check
      expect(result).toContain('https://github-readme-stats.vercel.app/api/top-langs/?username=tester&theme=radical&hide_border=true&layout=compact');
      // Streak stats card should be excluded
      expect(result).not.toContain('github-readme-streak-stats.herokuapp.com');
    });

    it('should append stats markdown inside generateReadmeMarkdown if enabled', () => {
      const readmeData = {
        name: 'Jane',
        template: 'minimal' as any,
        githubStats: {
          enabled: true,
          username: 'janedev',
          theme: 'default',
          hideBorder: false,
          showIcons: true,
          compactMode: false,
          layout: 'default' as any,
          cardOrder: ['stats'] as any,
          cardConfigs: {
            stats: { enabled: true },
            languages: { enabled: false },
            streak: { enabled: false },
          },
        },
      };

      const markdown = generateReadmeMarkdown(readmeData);
      expect(markdown).toContain('# Jane');
      expect(markdown).toContain('### 📊 GitHub Stats');
      expect(markdown).toContain('https://github-readme-stats.vercel.app/api?username=janedev&show_icons=true');
    });
  });

  describe('generateTechStackMarkdown', () => {
    it('should return empty string if techStack is disabled or empty', () => {
      expect(generateTechStackMarkdown(undefined)).toBe('');
      expect(generateTechStackMarkdown({ enabled: false } as any)).toBe('');
      expect(generateTechStackMarkdown({ enabled: true, selectedIds: [] } as any)).toBe('');
    });

    it('should generate badges in flat-list format when groupByCategory is false', () => {
      const config = {
        enabled: true,
        style: 'for-the-badge' as any,
        iconOnly: false,
        groupByCategory: false,
        hideEmptyCategories: false,
        selectedIds: ['javascript', 'react'],
      };
      const result = generateTechStackMarkdown(config);
      expect(result).toContain('## 💻 Tech Stack');
      expect(result).toContain('![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)');
      expect(result).toContain('![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)');
    });

    it('should group badges by categories and support iconOnly mode', () => {
      const config = {
        enabled: true,
        style: 'flat-square' as any,
        iconOnly: true,
        groupByCategory: true,
        hideEmptyCategories: true,
        selectedIds: ['javascript', 'react'],
      };
      const result = generateTechStackMarkdown(config);
      expect(result).toContain('## 💻 Tech Stack');
      expect(result).toContain('### Languages');
      expect(result).toContain('### Frontend');
      // in iconOnly mode, label parameter in url is empty: /badge/-COLOR
      expect(result).toContain('![JavaScript](https://img.shields.io/badge/-F7DF1E?style=flat-square&logo=javascript&logoColor=black)');
      expect(result).toContain('![React](https://img.shields.io/badge/-20232A?style=flat-square&logo=react&logoColor=61DAFB)');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { generateReadmeMarkdown, generateRoadmapMarkdown, combineMarkdown, READMEData, generateGithubStatsMarkdown, generateTechStackMarkdown, generateSocialLinksMarkdown, generateAchievementsMarkdown, generateHeaderMarkdown, generateSupportMarkdown, generateQuotesMarkdown, generateStandaloneVisitorMarkdown, generateFeaturedProjectsMarkdown } from '../markdown';

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

    it('should utilize custom header when enabled', () => {
      const data: READMEData = {
        ...baseData,
        header: {
          enabled: true,
          name: 'Sunil Kumar',
          title: 'Full Stack Developer',
          alignment: 'center',
          badges: { openToWork: true, freelance: false, learning: '', building: '' },
          visitorPlacement: 'hidden',
        } as any,
      };
      const markdown = generateReadmeMarkdown(data);
      expect(markdown).toContain('<h1 align="center">Hi 👋, I\'m Sunil Kumar</h1>');
      expect(markdown).toContain('<h3 align="center">Full Stack Developer</h3>');
      expect(markdown).toContain('### Skills\nReact, TypeScript, CSS');
      // Should not contain default name title or bio markdown
      expect(markdown).not.toContain('# Alice Developer');
      expect(markdown).not.toContain('Frontend Engineer');
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

  describe('generateSocialLinksMarkdown', () => {
    it('should return empty string if socialLinks is disabled or empty', () => {
      expect(generateSocialLinksMarkdown(undefined)).toBe('');
      expect(generateSocialLinksMarkdown({ enabled: false } as any)).toBe('');
      expect(generateSocialLinksMarkdown({ enabled: true, platforms: {} } as any)).toBe('');
    });

    it('should generate badges in correct ordering and support iconOnly mode', () => {
      const config = {
        enabled: true,
        style: 'flat-square' as any,
        iconOnly: true,
        platforms: {
          linkedin: { enabled: true, value: 'alice-dev' },
          github: { enabled: true, value: 'alice' },
          x: { enabled: false, value: '' },
        },
        order: ['github', 'linkedin'],
      };
      const result = generateSocialLinksMarkdown(config);
      expect(result).toContain('## 🔗 Social Links & Contact');
      // order check: github first, linkedin second
      expect(result).toMatch(/\[!\[GitHub\].*\[!\[LinkedIn\].*/);
      expect(result).toContain('[![GitHub](https://img.shields.io/badge/-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/alice)');
      expect(result).toContain('[![LinkedIn](https://img.shields.io/badge/-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/alice-dev)');
    });

    it('should generate standard badges when iconOnly is false', () => {
      const config = {
        enabled: true,
        style: 'for-the-badge' as any,
        iconOnly: false,
        platforms: {
          linkedin: { enabled: true, value: 'alice-dev' },
        },
        order: ['linkedin'],
      };
      const result = generateSocialLinksMarkdown(config);
      expect(result).toContain('[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/alice-dev)');
    });
  });

  describe('generateAchievementsMarkdown', () => {
    it('should return empty string if achievements is disabled or empty', () => {
      expect(generateAchievementsMarkdown(undefined)).toBe('');
      expect(generateAchievementsMarkdown({ enabled: false } as any)).toBe('');
      expect(generateAchievementsMarkdown({ enabled: true, username: '' } as any)).toBe('');
    });

    it('should generate trophy and activity graph with correct parameters and order', () => {
      const config = {
        enabled: true,
        username: 'alice',
        widgets: {
          trophy: { enabled: true, theme: ' radical', rows: 2, columns: 5, noFrame: true, noBg: true },
          visitor: { enabled: false },
          snake: { enabled: false },
          graph: { enabled: true, theme: 'tokyonight', hideBorder: true },
        },
        order: ['graph', 'trophy'] as any,
      };
      const result = generateAchievementsMarkdown(config);
      expect(result).toContain('## 🏆 GitHub Achievements');
      // order check: graph first, trophy second
      expect(result.indexOf('Activity Graph')).toBeLessThan(result.indexOf('GitHub Trophies'));
      expect(result).toContain('https://github-readme-activity-graph.vercel.app/graph?username=alice&theme=tokyonight&hide_border=true');
      expect(result).toContain('https://github-profile-trophy.vercel.app/?username=alice&theme= radical&no-frame=true&no-bg=true&row=2&column=5');
    });
  });

  describe('generateHeaderMarkdown', () => {
    it('should return empty string if header is disabled', () => {
      expect(generateHeaderMarkdown(undefined)).toBe('');
      expect(generateHeaderMarkdown({ enabled: false } as any)).toBe('');
    });

    it('should generate header html elements with correct alignment and values', () => {
      const config = {
        enabled: true,
        name: 'Sunil Kumar',
        pronouns: 'he/him',
        location: 'India',
        title: 'Architect',
        intro: 'Hello world',
        alignment: 'center' as any,
        bannerType: 'capsule' as any,
        bannerTheme: 'dracula',
        bannerText: 'Welcome',
        typingEnabled: true,
        typingLines: ['Line A', 'Line B'],
        typingSpeed: 180,
        typingDelay: 900,
        typingColor: 'FFAA00',
        typingCenter: true,
        badges: {
          openToWork: true,
          freelance: true,
          learning: 'Rust',
          building: 'Next.js',
        },
        visitorPlacement: 'top' as any,
      };

      const result = generateHeaderMarkdown(config, 'sunilkumar');
      expect(result).toContain('<p align="center">');
      expect(result).toContain('https://capsule-render.vercel.app/api?type=waving&color=dracula&height=120&section=header&text=Welcome&fontSize=30');
      expect(result).toContain('<h1 align="center">Hi 👋, I\'m Sunil Kumar (he/him)</h1>');
      expect(result).toContain('<h3 align="center">Architect based in India</h3>');
      expect(result).toContain('<p align="center">Hello world</p>');
      expect(result).toContain('https://readme-typing-svg.herokuapp.com/?lines=Line%20A;Line%20B&color=FFAA00&center=true&width=450&height=30&speed=180&pause=900');
      expect(result).toContain('Open%20to%20Work');
      expect(result).toContain('Freelance');
      expect(result).toContain('Learning');
      expect(result).toContain('Building');
      expect(result).toContain('komarev.com/ghpvc/?username=sunilkumar');
    });
  });

  describe('generateSupportMarkdown', () => {
    it('should generate support buttons for buy me a coffee and kofi', () => {
      const config = {
        enabled: true,
        buyMeACoffeeUsername: 'alice',
        kofiUsername: 'bob',
        style: 'flat-square' as any,
      };
      const result = generateSupportMarkdown(config);
      expect(result).toContain('## 💖 Support Me');
      expect(result).toContain('https://buymeacoffee.com/alice');
      expect(result).toContain('https://ko-fi.com/bob');
      expect(result).toContain('style=flat-square');
    });
  });

  describe('generateQuotesMarkdown', () => {
    it('should generate programming quotes badge', () => {
      const config = {
        enabled: true,
        theme: 'dracula',
        quoteType: 'programming' as any,
      };
      const result = generateQuotesMarkdown(config);
      expect(result).toContain('## 💬 Quote');
      expect(result).toContain('https://github-readme-quotes.vercel.app/api?theme=dracula&type=programming');
    });
  });

  describe('generateStandaloneVisitorMarkdown', () => {
    it('should generate standalone visitor counter', () => {
      const config = {
        enabled: true,
        username: 'alice',
        color: 'blue',
        style: 'plastic',
      };
      const result = generateStandaloneVisitorMarkdown(config);
      expect(result).toContain('## 👀 Profile Views');
      expect(result).toContain('https://komarev.com/ghpvc/?username=alice&color=blue&style=plastic');
    });
  });

  describe('generateReadmeMarkdown with Section Manager Ordering', () => {
    it('should compile sections in custom order and skip disabled ones', () => {
      const data: READMEData = {
        name: 'Alice',
        about: 'I build software.',
        customMarkdown: { enabled: true, content: '### Special Note\nSome text.' },
        support: { enabled: true, buyMeACoffeeUsername: 'alice', kofiUsername: '', style: 'flat' as any },
        sections: {
          order: ['custom', 'about', 'support', 'header'],
          sections: {
            custom: { id: 'custom', name: 'Custom Markdown', enabled: true, collapsed: false },
            about: { id: 'about', name: 'About Me', enabled: true, collapsed: false },
            support: { id: 'support', name: 'Support', enabled: true, collapsed: false },
            header: { id: 'header', name: 'Header', enabled: false, collapsed: false },
            socials: { id: 'socials', name: 'Socials', enabled: false, collapsed: false },
            techStack: { id: 'techStack', name: 'Tech Stack', enabled: false, collapsed: false },
            stats: { id: 'stats', name: 'Stats', enabled: false, collapsed: false },
            achievements: { id: 'achievements', name: 'Achievements', enabled: false, collapsed: false },
            projects: { id: 'projects', name: 'Projects', enabled: false, collapsed: false },
            quotes: { id: 'quotes', name: 'Quotes', enabled: false, collapsed: false },
            visitor: { id: 'visitor', name: 'Visitor', enabled: false, collapsed: false },
            animatedComponents: { id: 'animatedComponents', name: 'Animated Components', enabled: false, collapsed: false },
          },
        },
      };

      const result = generateReadmeMarkdown(data);
      // 'custom' first, then 'about', then 'support', 'header' is disabled so omitted
      expect(result).toContain('### Special Note\nSome text.');
      expect(result).toContain('I build software.');
      expect(result).toContain('## 💖 Support Me');

      const customIndex = result.indexOf('### Special Note');
      const aboutIndex = result.indexOf('I build software.');
      const supportIndex = result.indexOf('## 💖 Support Me');

      expect(customIndex).toBeLessThan(aboutIndex);
      expect(aboutIndex).toBeLessThan(supportIndex);
    });
  });

  describe('generateFeaturedProjectsMarkdown', () => {
    const sampleProjects = [
      {
        id: 'gh-alpha',
        source: 'github' as const,
        repoName: 'alpha',
        description: 'Alpha project',
        language: 'TypeScript',
        stars: 120,
        forks: 30,
        topics: ['react', 'nextjs'],
        repoUrl: 'https://github.com/user/alpha',
        updatedAt: '2024-05-01T00:00:00Z',
      },
      {
        id: 'gh-beta',
        source: 'github' as const,
        repoName: 'beta',
        description: 'Beta project',
        language: 'Python',
        stars: 50,
        forks: 10,
        topics: ['ml'],
        repoUrl: 'https://github.com/user/beta',
        updatedAt: '2023-01-01T00:00:00Z',
      },
    ];

    it('should return empty string when disabled or empty', () => {
      expect(generateFeaturedProjectsMarkdown(undefined)).toBe('');
      expect(generateFeaturedProjectsMarkdown({ enabled: false } as any)).toBe('');
      expect(generateFeaturedProjectsMarkdown({ enabled: true, projects: [] } as any)).toBe('');
    });

    it('should generate minimal card style (bullet list)', () => {
      const result = generateFeaturedProjectsMarkdown({
        enabled: true,
        projects: sampleProjects,
        cardStyle: 'minimal',
        layout: '1-col',
        sortMode: 'manual',
        badgeStyle: 'flat',
        showStars: true,
        showForks: false,
        showLanguage: false,
        showTopics: false,
      });
      expect(result).toContain('## 📂 Featured Projects');
      expect(result).toContain('[**alpha**](https://github.com/user/alpha)');
      expect(result).toContain('Alpha project');
      expect(result).toContain('⭐ 120');
      // beta is second in manual order
      const alphaIdx = result.indexOf('alpha');
      const betaIdx = result.indexOf('beta');
      expect(alphaIdx).toBeLessThan(betaIdx);
    });

    it('should generate compact table card style', () => {
      const result = generateFeaturedProjectsMarkdown({
        enabled: true,
        projects: sampleProjects,
        cardStyle: 'compact',
        layout: '1-col',
        sortMode: 'manual',
        badgeStyle: 'flat-square',
        showStars: true,
        showForks: true,
        showLanguage: true,
        showTopics: false,
      });
      expect(result).toContain('| Project | Description | Language | Stars | Forks |');
      expect(result).toContain('[alpha]');
      expect(result).toContain('TypeScript');
      expect(result).toContain('⭐ 120');
      expect(result).toContain('🍴 30');
    });

    it('should sort by stars descending', () => {
      const result = generateFeaturedProjectsMarkdown({
        enabled: true,
        projects: sampleProjects,
        cardStyle: 'minimal',
        layout: '1-col',
        sortMode: 'stars',
        badgeStyle: 'flat',
        showStars: false,
        showForks: false,
        showLanguage: false,
        showTopics: false,
      });
      // alpha (120 stars) should appear before beta (50 stars)
      const alphaIdx = result.indexOf('alpha');
      const betaIdx = result.indexOf('beta');
      expect(alphaIdx).toBeLessThan(betaIdx);
    });

    it('should sort by recently updated', () => {
      const recentFirst = [
        { ...sampleProjects[1], updatedAt: '2025-12-01T00:00:00Z', id: 'beta-recent' }, // recent
        { ...sampleProjects[0], updatedAt: '2022-01-01T00:00:00Z', id: 'alpha-old' },  // old
      ];
      const result = generateFeaturedProjectsMarkdown({
        enabled: true,
        projects: recentFirst,
        cardStyle: 'minimal',
        layout: '1-col',
        sortMode: 'updated',
        badgeStyle: 'flat',
        showStars: false,
        showForks: false,
        showLanguage: false,
        showTopics: false,
      });
      // beta (2025) should appear before alpha (2022)
      const betaIdx = result.indexOf('beta');
      const alphaIdx = result.indexOf('alpha');
      expect(betaIdx).toBeLessThan(alphaIdx);
    });

    it('should generate modern card style with badges and topics', () => {
      const result = generateFeaturedProjectsMarkdown({
        enabled: true,
        projects: [sampleProjects[0]],
        cardStyle: 'modern',
        layout: '1-col',
        sortMode: 'manual',
        badgeStyle: 'flat-square',
        showStars: true,
        showForks: true,
        showLanguage: true,
        showTopics: true,
      });
      expect(result).toContain('#### [alpha](https://github.com/user/alpha)');
      expect(result).toContain('Alpha project');
      expect(result).toContain('TypeScript');
      expect(result).toContain('react');
      expect(result).toContain('nextjs');
    });

    it('should generate gprm card style with img tags for github repos', () => {
      const result = generateFeaturedProjectsMarkdown({
        enabled: true,
        projects: [sampleProjects[0]],
        cardStyle: 'gprm',
        layout: '2-col',
        sortMode: 'manual',
        badgeStyle: 'flat',
        showStars: false,
        showForks: false,
        showLanguage: false,
        showTopics: false,
      });
      expect(result).toContain('<a href="https://github.com/user/alpha">');
      expect(result).toContain('github-readme-stats.vercel.app/api/pin/?username=user&repo=alpha');
    });

    it('should include manual project with technologies and demo link', () => {
      const manualProject = {
        id: 'manual-1',
        source: 'manual' as const,
        title: 'My Portfolio',
        description: 'A portfolio site',
        repoUrl: 'https://github.com/user/portfolio',
        demoUrl: 'https://portfolio.example.com',
        language: 'React',
        technologies: ['React', 'Tailwind'],
      };
      const result = generateFeaturedProjectsMarkdown({
        enabled: true,
        projects: [manualProject],
        cardStyle: 'modern',
        layout: '1-col',
        sortMode: 'manual',
        badgeStyle: 'flat-square',
        showStars: false,
        showForks: false,
        showLanguage: true,
        showTopics: false,
      });
      expect(result).toContain('[My Portfolio]');
      expect(result).toContain('A portfolio site');
      expect(result).toContain('**Stack:** React, Tailwind');
      expect(result).toContain('🔗 Demo');
      expect(result).toContain('📦 Repo');
    });
  });
});

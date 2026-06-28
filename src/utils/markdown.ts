import { READMEStyleTemplate, GitHubStatsConfig, TechStackConfig, SocialLinksConfig, AchievementsConfig, HeaderConfig, SectionOrderConfig, SupportConfig, QuotesConfig, CustomMarkdownConfig, StandaloneVisitorConfig, AnimatedComponentsConfig } from '@/stores/readme-store';
import { FeaturedProjectsConfig } from '@/types/featured-projects';
import { TECHNOLOGY_REGISTRY, CATEGORIES, Technology } from './tech-registry';
import { SOCIAL_PLATFORM_REGISTRY, SocialPlatform } from './social-registry';

export interface READMEData {
  name?: string;
  role?: string;
  about?: string;
  skills?: string;
  projects?: string;
  socials?: string;
  avatarUrl?: string;
  followers?: number;
  following?: number;
  publicRepos?: number;
  template?: READMEStyleTemplate;
  githubStats?: GitHubStatsConfig;
  techStack?: TechStackConfig;
  socialLinks?: SocialLinksConfig;
  achievements?: AchievementsConfig;
  header?: HeaderConfig;
  sections?: SectionOrderConfig;
  support?: SupportConfig;
  quotes?: QuotesConfig;
  customMarkdown?: CustomMarkdownConfig;
  standaloneVisitor?: StandaloneVisitorConfig;
  featuredProjects?: FeaturedProjectsConfig;
  animatedComponents?: AnimatedComponentsConfig;
}

export interface RoadmapData {
  title?: string;
  steps?: string[];
}

export function generateGithubStatsMarkdown(stats?: GitHubStatsConfig): string {
  if (!stats || !stats.enabled || !stats.username) return '';
  const { username, theme, hideBorder, showIcons, compactMode, layout, cardOrder, cardConfigs } = stats;
  
  const themeParam = theme && theme !== 'default' ? `&theme=${theme}` : '';
  const borderParam = hideBorder ? '&hide_border=true' : '';
  const iconsParam = showIcons ? '&show_icons=true' : '';
  
  const statsMarkdownBlocks: string[] = [];
  cardOrder.forEach((cardId) => {
    if (cardConfigs[cardId]?.enabled) {
      if (cardId === 'stats') {
        const layoutParam = layout === 'compact' ? '&layout=compact' : '';
        statsMarkdownBlocks.push(
          `<img src="https://github-readme-stats.vercel.app/api?username=${username}${themeParam}${borderParam}${iconsParam}${layoutParam}" alt="GitHub Stats" />`
        );
      } else if (cardId === 'languages') {
        const compactParam = compactMode ? '&layout=compact' : '';
        statsMarkdownBlocks.push(
          `<img src="https://github-readme-stats.vercel.app/api/top-langs/?username=${username}${themeParam}${borderParam}${compactParam}" alt="Top Languages" />`
        );
      } else if (cardId === 'streak') {
        statsMarkdownBlocks.push(
          `<img src="https://github-readme-streak-stats.herokuapp.com/?user=${username}${themeParam}${borderParam}" alt="GitHub Streak" />`
        );
      }
    }
  });
  
  if (statsMarkdownBlocks.length === 0) return '';
  
  return [
    '### 📊 GitHub Stats',
    '<p align="center">',
    statsMarkdownBlocks.map((block) => `  ${block}`).join('\n  &nbsp;&nbsp;\n'),
    '</p>',
  ].join('\n');
}

export function generateReadmeMarkdown(data: READMEData): string {
  // If dynamic section ordering is enabled, generate sections in order
  if (data.sections && data.sections.order && data.sections.order.length > 0) {
    const { order, sections } = data.sections;
    const blocks: string[] = [];

    for (const sectionId of order) {
      const sectionConfig = sections[sectionId];
      // Skip if explicitly disabled
      if (sectionConfig && !sectionConfig.enabled) continue;

      let sectionMarkdown = '';
      switch (sectionId) {
        case 'header':
          if (data.header && data.header.enabled) {
            sectionMarkdown = generateHeaderMarkdown(data.header, data.githubStats?.username || '');
          } else {
            const avatarMarkdown = data.avatarUrl
              ? `<p align="center">\n  <img src="${data.avatarUrl}" alt="Avatar" width="120" height="120" style="border-radius: 50%;" />\n</p>`
              : '';
            const statsMarkdown = (data.followers !== undefined && data.following !== undefined && data.publicRepos !== undefined)
              ? `<p align="center">\n  👥 <b>Followers:</b> ${data.followers} | 👥 <b>Following:</b> ${data.following} | 📦 <b>Repos:</b> ${data.publicRepos}\n</p>`
              : '';
            sectionMarkdown = [
              avatarMarkdown,
              data.name ? `# ${data.name}` : '',
              data.role ? `## ${data.role}` : '',
              statsMarkdown,
            ].filter(Boolean).join('\n\n');
          }
          break;

        case 'about':
          sectionMarkdown = [
            data.about ? data.about : '',
            data.skills ? `### Skills\n${data.skills}` : '',
          ].filter(Boolean).join('\n\n');
          break;

        case 'socials':
          if (data.socialLinks && data.socialLinks.enabled) {
            sectionMarkdown = generateSocialLinksMarkdown(data.socialLinks);
          } else {
            sectionMarkdown = data.socials ? `### Socials\n${data.socials}` : '';
          }
          break;

        case 'techStack':
          sectionMarkdown = generateTechStackMarkdown(data.techStack);
          break;

        case 'stats':
          sectionMarkdown = generateGithubStatsMarkdown(data.githubStats);
          break;

        case 'achievements':
          sectionMarkdown = generateAchievementsMarkdown(data.achievements);
          break;

        case 'projects':
          if (data.featuredProjects && data.featuredProjects.enabled && data.featuredProjects.projects.length > 0) {
            sectionMarkdown = generateFeaturedProjectsMarkdown(data.featuredProjects);
          } else {
            sectionMarkdown = data.projects ? `### Projects\n${data.projects}` : '';
          }
          break;

        case 'support':
          sectionMarkdown = generateSupportMarkdown(data.support);
          break;

        case 'quotes':
          sectionMarkdown = generateQuotesMarkdown(data.quotes);
          break;

        case 'visitor':
          sectionMarkdown = generateStandaloneVisitorMarkdown(data.standaloneVisitor, data.githubStats?.username);
          break;

        case 'custom':
          if (data.customMarkdown && data.customMarkdown.enabled) {
            sectionMarkdown = data.customMarkdown.content;
          }
          break;

        case 'animatedComponents':
          if (data.animatedComponents && data.animatedComponents.enabled) {
            sectionMarkdown = generateAnimatedComponentsMarkdown(data.animatedComponents, data.githubStats?.username || '');
          }
          break;
      }

      if (sectionMarkdown && sectionMarkdown.trim()) {
        blocks.push(sectionMarkdown.trim());
      }
    }

    return blocks.join('\n\n');
  }

  // Fallback to legacy hardcoded template generation
  const template = data.template || 'minimal';

  const avatarMarkdown = data.avatarUrl
    ? `<p align="center">\n  <img src="${data.avatarUrl}" alt="Avatar" width="120" height="120" style="border-radius: 50%;" />\n</p>`
    : '';

  const statsMarkdown = (data.followers !== undefined && data.following !== undefined && data.publicRepos !== undefined)
    ? `<p align="center">\n  👥 <b>Followers:</b> ${data.followers} | 👥 <b>Following:</b> ${data.following} | 📦 <b>Repos:</b> ${data.publicRepos}\n</p>`
    : '';

  const headerMarkdown = generateHeaderMarkdown(data.header, data.githubStats?.username || '');
  let body = '';

  if (headerMarkdown) {
    body = [
      headerMarkdown,
      data.skills ? `### Skills\n${data.skills}` : '',
      data.projects ? `### Projects\n${data.projects}` : '',
    ].filter(Boolean).join('\n\n');
  } else {
    switch (template) {
      case 'professional':
        body = [
          avatarMarkdown,
          data.name ? `# ${data.name}` : '',
          data.role ? `### *${data.role}*` : '',
          statsMarkdown,
          '---',
          data.about ? `### 🎯 About Me\n${data.about}` : '',
          data.skills ? `### 🛠️ Skills\n${data.skills}` : '',
          data.projects ? `### 📂 Featured Projects\n${data.projects}` : '',
          data.socials ? `### 🌐 Socials & Contact\n${data.socials}` : '',
        ].filter(Boolean).join('\n\n');
        break;

      case 'developer':
        body = [
          avatarMarkdown,
          data.name ? `# 💻 ${data.name}` : '',
          data.role ? `> ${data.role}` : '',
          statsMarkdown,
          '---',
          data.skills ? `### 🚀 Tech Stack & Skills\n${data.skills}` : '',
          data.about ? `### 🌟 Profile\n${data.about}` : '',
          data.projects ? `### 📂 Projects & Codebases\n${data.projects}` : '',
          data.socials ? `### 📨 Connect with Me\n${data.socials}` : '',
        ].filter(Boolean).join('\n\n');
        break;

      case 'open-source':
        body = [
          avatarMarkdown,
          data.name ? `# 🤝 ${data.name} | Open Source` : '',
          data.role ? `**${data.role}**` : '',
          statsMarkdown,
          '---',
          data.projects ? `### 📦 Open Source Contributions & Repositories\n${data.projects}` : '',
          data.about ? `### 🌟 About Me\n${data.about}` : '',
          data.skills ? `### 🛠️ Core Skills\n${data.skills}` : '',
          data.socials ? `### 💬 Collaboration & Get in touch\n${data.socials}` : '',
        ].filter(Boolean).join('\n\n');
        break;

      case 'portfolio':
        body = [
          avatarMarkdown,
          data.name ? `# ✨ ${data.name} - Portfolio` : '',
          data.role ? `*${data.role}*` : '',
          statsMarkdown,
          '---',
          data.projects ? `### 🌐 Featured Work\n${data.projects}` : '',
          data.about || data.skills ? `### 🎨 About & Skills\n${[data.about, data.skills].filter(Boolean).join('\n\n')}` : '',
          data.socials ? `### 🔗 Links & Contact\n${data.socials}` : '',
        ].filter(Boolean).join('\n\n');
        break;

      case 'minimal':
      default:
        body = [
          avatarMarkdown,
          data.name ? `# ${data.name}` : '',
          data.role ? `## ${data.role}` : '',
          statsMarkdown,
          data.about ? data.about : '',
          data.skills ? `### Skills\n${data.skills}` : '',
          data.projects ? `### Projects\n${data.projects}` : '',
          data.socials ? `### Socials\n${data.socials}` : '',
        ].filter(Boolean).join('\n\n');
        break;
    }
  }

  let output = body;
  const githubStatsMarkdown = generateGithubStatsMarkdown(data.githubStats);
  if (githubStatsMarkdown) {
    output = [output, githubStatsMarkdown].filter(Boolean).join('\n\n');
  }

  const techStackMarkdown = generateTechStackMarkdown(data.techStack);
  if (techStackMarkdown) {
    output = [output, techStackMarkdown].filter(Boolean).join('\n\n');
  }

  const socialLinksMarkdown = generateSocialLinksMarkdown(data.socialLinks);
  if (socialLinksMarkdown) {
    output = [output, socialLinksMarkdown].filter(Boolean).join('\n\n');
  }

  const achievementsMarkdown = generateAchievementsMarkdown(data.achievements);
  if (achievementsMarkdown) {
    output = [output, achievementsMarkdown].filter(Boolean).join('\n\n');
  }

  return output;
}

export function generateSupportMarkdown(config?: SupportConfig): string {
  if (!config || !config.enabled) return '';
  const style = config.style || 'for-the-badge';
  const badges: string[] = [];

  if (config.buyMeACoffeeUsername) {
    const user = config.buyMeACoffeeUsername.trim();
    if (user) {
      badges.push(`[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-FFDD00?style=${style}&logo=buy-me-a-coffee&logoColor=black)](https://buymeacoffee.com/${user})`);
    }
  }
  if (config.kofiUsername) {
    const user = config.kofiUsername.trim();
    if (user) {
      badges.push(`[![Ko-fi](https://img.shields.io/badge/Ko--fi-F16061?style=${style}&logo=ko-fi&logoColor=white)](https://ko-fi.com/${user})`);
    }
  }

  if (badges.length === 0) return '';
  return `## 💖 Support Me\n\n${badges.join(' &nbsp;&nbsp; ')}`;
}

export function generateQuotesMarkdown(config?: QuotesConfig): string {
  if (!config || !config.enabled) return '';
  const theme = config.theme || 'radical';
  const type = config.quoteType || 'programming';
  return `## 💬 Quote\n\n![Quote](https://github-readme-quotes.vercel.app/api?theme=${theme}&type=${type})`;
}

export function generateStandaloneVisitorMarkdown(config?: StandaloneVisitorConfig, username?: string): string {
  if (!config || !config.enabled) return '';
  const user = (config.username || username || '').trim();
  if (!user) return '';
  const color = config.color || 'green';
  const style = config.style || 'flat';
  const visitorUrl = `https://komarev.com/ghpvc/?username=${user}&color=${color}&style=${style}`;
  return `## 👀 Profile Views\n\n![Visitor Counter](${visitorUrl})`;
}

export function generateAchievementsMarkdown(config?: AchievementsConfig): string {
  if (!config || !config.enabled || !config.username) return '';

  const user = config.username.trim();
  if (!user) return '';

  const { widgets, order = ['trophy', 'visitor', 'graph', 'snake'] } = config;
  const renderedWidgets: string[] = [];

  for (const widgetId of order) {
    const wConfig = widgets[widgetId];
    if (!wConfig || !wConfig.enabled) continue;

    if (widgetId === 'trophy') {
      const trophyTheme = wConfig.theme || 'flat';
      const trophyRows = wConfig.rows || 1;
      const trophyColumns = wConfig.columns || 6;
      const trophyUrl = `https://github-profile-trophy.vercel.app/?username=${user}&theme=${trophyTheme}${wConfig.noFrame ? '&no-frame=true' : ''}${wConfig.noBg ? '&no-bg=true' : ''}${trophyRows ? `&row=${trophyRows}` : ''}${trophyColumns ? `&column=${trophyColumns}` : ''}`;
      renderedWidgets.push(`### 🏆 GitHub Trophies\n\n[![GitHub Trophies](${trophyUrl})](https://github.com/ryo-ma/github-profile-trophy)`);
    } else if (widgetId === 'visitor') {
      const visitorColor = wConfig.color || '0078d7';
      const visitorStyle = wConfig.style || 'flat';
      const visitorUrl = `https://komarev.com/ghpvc/?username=${user}&color=${visitorColor}&style=${visitorStyle}`;
      renderedWidgets.push(`### 👀 Profile Views\n\n![Profile Views](${visitorUrl})`);
    } else if (widgetId === 'snake') {
      const snakeUrl = `https://raw.githubusercontent.com/${user}/${user}/output/github-contribution-grid-snake.svg`;
      renderedWidgets.push(`### 🐍 Contribution Snake\n\n![Contribution Snake](${snakeUrl})`);
    } else if (widgetId === 'graph') {
      const graphTheme = wConfig.theme || 'github';
      const graphUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${user}&theme=${graphTheme}${wConfig.hideBorder ? '&hide_border=true' : ''}`;
      renderedWidgets.push(`### 📈 Activity Graph\n\n[![Activity Graph](${graphUrl})](https://github.com/Ashutosh00710/github-readme-activity-graph)`);
    }
  }

  if (renderedWidgets.length === 0) return '';

  return `## 🏆 GitHub Achievements\n\n${renderedWidgets.join('\n\n')}`;
}

export function generateSocialLinksMarkdown(config?: SocialLinksConfig): string {
  if (!config || !config.enabled || !config.platforms) return '';

  const { style, iconOnly, platforms, order = [] } = config;
  const badgesList: string[] = [];

  for (const platformId of order) {
    const platform = SOCIAL_PLATFORM_REGISTRY.find((p) => p.id === platformId);
    const platformConfig = platforms[platformId];
    if (!platform || !platformConfig || !platformConfig.enabled || !platformConfig.value.trim()) {
      continue;
    }

    const val = platformConfig.value.trim();
    let targetUrl = val;
    if (!val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('mailto:')) {
      targetUrl = platform.urlTemplate.replace('{value}', val);
    }

    const label = iconOnly ? '' : encodeURIComponent(platform.name);
    const badgeImageUrl = `https://img.shields.io/badge/${label}-${platform.color}?style=${style}&logo=${platform.logo}&logoColor=${platform.logoColor}`;

    badgesList.push(`[![${platform.name}](${badgeImageUrl})](${targetUrl})`);
  }

  if (badgesList.length === 0) return '';
  return `## 🔗 Social Links & Contact\n\n${badgesList.join(' ')}`;
}

export function generateTechStackMarkdown(config?: TechStackConfig): string {
  if (!config || !config.enabled || !config.selectedIds || config.selectedIds.length === 0) return '';

  const { selectedIds, style, iconOnly, groupByCategory, hideEmptyCategories } = config;

  // Resolve selected technologies in their exact ordering
  const selectedTechs = selectedIds
    .map((id) => TECHNOLOGY_REGISTRY.find((t) => t.id === id))
    .filter((t): t is Technology => !!t);

  if (selectedTechs.length === 0) return '';

  const buildBadgeMarkdown = (tech: Technology): string => {
    const label = iconOnly ? '' : encodeURIComponent(tech.name);
    return `![${tech.name}](https://img.shields.io/badge/${label}-${tech.color}?style=${style}&logo=${tech.logo}&logoColor=${tech.logoColor})`;
  };

  if (groupByCategory) {
    const categoriesList = CATEGORIES.map((category) => {
      const categoryTechs = selectedTechs.filter((t) => t.category === category);
      if (categoryTechs.length === 0) {
        return hideEmptyCategories ? '' : `### ${category}\n\n*(None selected)*`;
      }
      const badges = categoryTechs.map(buildBadgeMarkdown).join(' ');
      return `### ${category}\n\n${badges}`;
    }).filter(Boolean);

    if (categoriesList.length === 0) return '';

    return [`## 💻 Tech Stack`, ...categoriesList].join('\n\n');
  } else {
    const badges = selectedTechs.map(buildBadgeMarkdown).join(' ');
    return `## 💻 Tech Stack\n\n${badges}`;
  }
  return '';
}

export function generateRoadmapMarkdown(data: RoadmapData): string {
  const steps = data.steps || [];
  const validSteps = steps.filter((step) => step.trim() !== '');
  return [
    data.title ? `# ${data.title}` : '',
    validSteps.length ? validSteps.map((step, index) => `${index + 1}. ${step}`).join('\n') : '',
  ].filter(Boolean).join('\n\n');
}

export function combineMarkdown(readme: string, roadmap: string): string {
  return [readme, roadmap].filter(Boolean).join('\n\n');
}

export function generateHeaderMarkdown(config?: HeaderConfig, username?: string): string {
  if (!config || !config.enabled) return '';

  const align = config.alignment || 'center';
  const alignAttr = align === 'left' ? 'left' : align === 'right' ? 'right' : 'center';
  const lines: string[] = [];

  // 1. Animated Wave Banner
  if (config.bannerType && config.bannerType !== 'none') {
    const bannerText = encodeURIComponent(config.bannerText || '');
    const bannerTheme = config.bannerTheme || 'gradient';
    let bannerUrl = '';
    
    if (config.bannerType === 'capsule') {
      bannerUrl = `https://capsule-render.vercel.app/api?type=waving&color=${bannerTheme}&height=120&section=header${bannerText ? `&text=${bannerText}` : ''}&fontSize=30`;
    } else if (config.bannerType === 'wave') {
      bannerUrl = `https://capsule-render.vercel.app/api?type=soft&color=${bannerTheme}&height=100&section=header${bannerText ? `&text=${bannerText}` : ''}`;
    } else if (config.bannerType === 'gradient') {
      bannerUrl = `https://capsule-render.vercel.app/api?type=rect&color=${bannerTheme}&height=120&section=header${bannerText ? `&text=${bannerText}` : ''}&fontSize=30`;
    }

    if (bannerUrl) {
      lines.push(`<p align="${alignAttr}">\n  <img src="${bannerUrl}" alt="Banner" />\n</p>\n`);
    }
  }

  // Helper for aligned wrap
  const addAlignedElement = (tag: string, content: string) => {
    lines.push(`<${tag} align="${alignAttr}">${content}</${tag}>\n`);
  };

  // 2. Visitor Counter Top
  if (config.visitorPlacement === 'top' && username) {
    const user = username.trim();
    if (user) {
      const visitorUrl = `https://komarev.com/ghpvc/?username=${user}&color=green&style=flat`;
      lines.push(`<p align="${alignAttr}">\n  <img src="${visitorUrl}" alt="Visitor Counter" />\n</p>\n`);
    }
  }

  // 3. Name Section
  if (config.name) {
    let nameText = `Hi 👋, I'm ${config.name}`;
    if (config.pronouns) {
      nameText += ` (${config.pronouns})`;
    }
    addAlignedElement('h1', nameText);
  }

  // 4. Professional Title & Location
  if (config.title || config.location) {
    let subText = config.title || '';
    if (config.location) {
      subText += subText ? ` based in ${config.location}` : `Based in ${config.location}`;
    }
    if (subText) {
      addAlignedElement('h3', subText);
    }
  }

  // 5. Short Introduction
  if (config.intro) {
    addAlignedElement('p', config.intro);
  }

  // 6. Typing SVG
  if (config.typingEnabled && config.typingLines && config.typingLines.length > 0) {
    const activeLines = config.typingLines.filter(Boolean);
    if (activeLines.length > 0) {
      const encodedLines = activeLines.map(l => encodeURIComponent(l)).join(';');
      const speed = config.typingSpeed || 200;
      const delay = config.typingDelay || 1000;
      const color = config.typingColor || '36BCF7';
      const typingCenter = config.typingCenter !== false;
      const typingUrl = `https://readme-typing-svg.herokuapp.com/?lines=${encodedLines}&color=${color}&center=${typingCenter}&width=450&height=30&speed=${speed}&pause=${delay}`;

      lines.push(`<p align="${alignAttr}">\n  <img src="${typingUrl}" alt="Typing SVG" />\n</p>\n`);
    }
  }

  // 7. Badges
  const badgeLines: string[] = [];
  if (config.badges.openToWork) {
    badgeLines.push(`[![Open To Work](https://img.shields.io/badge/Open%20to%20Work-blue?style=flat-square)](https://github.com)`);
  }
  if (config.badges.freelance) {
    badgeLines.push(`[![Freelance](https://img.shields.io/badge/Freelance-Available-green?style=flat-square)](https://github.com)`);
  }
  if (config.badges.learning) {
    const val = config.badges.learning.trim();
    if (val) {
      badgeLines.push(`[![Learning](https://img.shields.io/badge/Learning-${encodeURIComponent(val)}-orange?style=flat-square)](https://github.com)`);
    }
  }
  if (config.badges.building) {
    const val = config.badges.building.trim();
    if (val) {
      badgeLines.push(`[![Building](https://img.shields.io/badge/Building-${encodeURIComponent(val)}-purple?style=flat-square)](https://github.com)`);
    }
  }

  if (badgeLines.length > 0) {
    lines.push(`<p align="${alignAttr}">\n  ${badgeLines.join('\n  ')}\n</p>\n`);
  }

  // 8. Visitor Counter Bottom
  if (config.visitorPlacement === 'bottom' && username) {
    const user = username.trim();
    if (user) {
      const visitorUrl = `https://komarev.com/ghpvc/?username=${user}&color=green&style=flat`;
      lines.push(`<p align="${alignAttr}">\n  <img src="${visitorUrl}" alt="Visitor Counter" />\n</p>\n`);
    }
  }

  return lines.join('\n');
}

/**
 * Generates markdown for the Featured Projects section.
 * Supports multiple card styles, layouts, and optional badges.
 */
export function generateFeaturedProjectsMarkdown(config?: FeaturedProjectsConfig): string {
  if (!config || !config.enabled || !config.projects || config.projects.length === 0) return '';

  const { projects, cardStyle, layout, sortMode, badgeStyle, showStars, showForks, showLanguage, showTopics } = config;

  // Sort projects
  let sorted = [...projects];
  if (sortMode === 'stars') {
    sorted = sorted.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
  } else if (sortMode === 'updated') {
    sorted = sorted.sort((a, b) => {
      const aDate = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bDate = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bDate - aDate;
    });
  }
  // 'manual' keeps original insertion order

  const lines: string[] = [];
  lines.push('## 📂 Featured Projects');
  lines.push('');

  if (cardStyle === 'grid' || layout === 'grid') {
    // GitHub-readme-stats pinned card style: grid of repo cards
    const cards = sorted.map((p) => {
      const url = p.repoUrl || p.demoUrl || '#';
      const displayName = p.title || p.repoName || 'Project';
      const desc = p.description || '';
      const badges: string[] = [];
      if (showLanguage && p.language) {
        badges.push(`![${p.language}](https://img.shields.io/badge/${encodeURIComponent(p.language)}-blue?style=${badgeStyle})`);
      }
      if (showStars && p.stars !== undefined) {
        badges.push(`![Stars](https://img.shields.io/badge/⭐%20Stars-${p.stars}-yellow?style=${badgeStyle})`);
      }
      if (showForks && p.forks !== undefined) {
        badges.push(`![Forks](https://img.shields.io/badge/🍴%20Forks-${p.forks}-orange?style=${badgeStyle})`);
      }
      const badgeRow = badges.length > 0 ? `\n${badges.join(' ')}` : '';
      return `### [${displayName}](${url})\n${desc}${badgeRow}`;
    });
    lines.push(cards.join('\n\n'));
  } else if (cardStyle === 'gprm') {
    // GPRM-style pinned repo cards via github-readme-stats
    const cards = sorted
      .filter((p) => p.repoName && p.repoUrl)
      .map((p) => {
        // Extract "owner/repo" from URL
        const match = p.repoUrl!.match(/github\.com\/([^/]+\/[^/]+)/);
        const slug = match ? match[1] : p.repoName;
        return `<a href="${p.repoUrl}">\n  <img align="center" src="https://github-readme-stats.vercel.app/api/pin/?username=${slug?.split('/')[0]}&repo=${slug?.split('/')[1]}&theme=default" />\n</a>`;
      });

    if (layout === '2-col') {
      // Pair cards side-by-side in table rows
      const pairs: string[] = [];
      for (let i = 0; i < cards.length; i += 2) {
        const row = cards.slice(i, i + 2);
        pairs.push(row.join('\n'));
      }
      lines.push('<p align="center">');
      lines.push(pairs.join('\n\n'));
      lines.push('</p>');
    } else {
      lines.push('<p align="center">');
      lines.push(cards.join('\n\n'));
      lines.push('</p>');
    }
  } else if (cardStyle === 'compact') {
    // Compact table format
    const rows = sorted.map((p) => {
      const url = p.repoUrl || p.demoUrl || '#';
      const name = p.title || p.repoName || 'Project';
      const desc = p.description || '-';
      const lang = p.language || '-';
      const stars = p.stars !== undefined ? `⭐ ${p.stars}` : '-';
      const forks = p.forks !== undefined ? `🍴 ${p.forks}` : '-';
      return `| [${name}](${url}) | ${desc} | ${lang} | ${stars} | ${forks} |`;
    });
    lines.push('| Project | Description | Language | Stars | Forks |');
    lines.push('|---------|-------------|----------|-------|-------|');
    lines.push(...rows);
  } else if (cardStyle === 'minimal') {
    // Minimal: just bullet list with links
    const items = sorted.map((p) => {
      const url = p.repoUrl || p.demoUrl || '#';
      const name = p.title || p.repoName || 'Project';
      const desc = p.description ? ` — ${p.description}` : '';
      const stars = showStars && p.stars !== undefined ? ` ⭐ ${p.stars}` : '';
      return `- [**${name}**](${url})${desc}${stars}`;
    });
    lines.push(...items);
  } else {
    // modern (default): rich card blocks with badges
    const cards = sorted.map((p) => {
      const url = p.repoUrl || p.demoUrl || '#';
      const name = p.title || p.repoName || 'Project';
      const desc = p.description || '';
      const parts: string[] = [];

      parts.push(`#### [${name}](${url})`);
      if (desc) parts.push(`> ${desc}`);

      const badges: string[] = [];
      if (showLanguage && p.language) {
        badges.push(`![${p.language}](https://img.shields.io/badge/-${encodeURIComponent(p.language)}-blue?style=${badgeStyle})`);
      }
      if (showStars && p.stars !== undefined) {
        badges.push(`![Stars](https://img.shields.io/badge/⭐%20${p.stars}-Stars-yellow?style=${badgeStyle})`);
      }
      if (showForks && p.forks !== undefined) {
        badges.push(`![Forks](https://img.shields.io/badge/🍴%20${p.forks}-Forks-orange?style=${badgeStyle})`);
      }
      if (showTopics && p.topics && p.topics.length > 0) {
        p.topics.slice(0, 4).forEach((topic) => {
          badges.push(`![${topic}](https://img.shields.io/badge/-${encodeURIComponent(topic)}-lightgrey?style=${badgeStyle})`);
        });
      }
      if (badges.length > 0) parts.push(badges.join(' '));
      if (p.demoUrl && p.repoUrl) {
        parts.push(`[🔗 Demo](${p.demoUrl}) · [📦 Repo](${p.repoUrl})`);
      }
      if (p.technologies && p.technologies.length > 0) {
        parts.push(`**Stack:** ${p.technologies.join(', ')}`);
      }
      return parts.join('\n');
    });

    if (layout === '2-col') {
      // Two-column layout using HTML table
      const tableRows: string[] = [];
      for (let i = 0; i < cards.length; i += 2) {
        const left = cards[i];
        const right = cards[i + 1] || '';
        tableRows.push(`<td valign="top" width="50%">\n\n${left}\n\n</td>\n<td valign="top" width="50%">\n\n${right}\n\n</td>`);
      }
      lines.push('<table><tr>');
      lines.push(tableRows.join('</tr>\n<tr>'));
      lines.push('</tr></table>');
    } else {
      lines.push(cards.join('\n\n'));
    }
  }

  return lines.join('\n');
}

export function generateAnimatedComponentsMarkdown(config: AnimatedComponentsConfig, username: string): string {
  if (!config || !config.enabled) return '';

  const blocks: string[] = [];

  config.components.forEach((comp) => {
    if (!comp.enabled) return;

    let compMarkdown = '';

    switch (comp.type) {
      case 'typing': {
        const { lines, speed, delay, color, cursor } = comp.config;
        if (lines && lines.length > 0) {
          const linesParam = lines.map((l: string) => encodeURIComponent(l)).join(';');
          const speedParam = speed ? `&speed=${speed}` : '';
          const delayParam = delay ? `&pause=${delay}` : '';
          const colorParam = color ? `&color=${color.replace('#','')}` : '';
          const cursorParam = cursor === 'pipe' ? '' : `&vCenter=true&multiline=true`;
          
          compMarkdown = `<p align="center">\n  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&width=435${speedParam}${delayParam}${colorParam}${cursorParam}&lines=${linesParam}" alt="Typing SVG" />\n</p>`;
        }
        break;
      }
      case 'waveHeader': {
        const { theme, height, text, animation } = comp.config;
        const colorVal = theme === 'auto' ? 'auto' : theme.replace('#','');
        const textParam = text ? `&text=${encodeURIComponent(text)}` : '';
        compMarkdown = `<p align="center">\n  <img src="https://capsule-render.vercel.app/api?type=${animation || 'wave'}&color=${colorVal}&height=${height || 120}&section=header${textParam}&fontSize=30" alt="Wave Header" />\n</p>`;
        break;
      }
      case 'divider': {
        const { style, color1, color2 } = comp.config;
        const c1 = color1 || '#0078d7';
        const c2 = color2 || '#36BCF7';
        
        if (style === 'waves') {
          compMarkdown = `<p align="center">\n  <svg width="100%" height="20" viewBox="0 0 1200 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <path d="M0 10 Q 75 0, 150 10 T 300 10 T 450 10 T 600 10 T 750 10 T 900 10 T 1050 10 T 1200 10" stroke="url(#divider_grad)" stroke-width="3" fill="none" />\n    <defs>\n      <linearGradient id="divider_grad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">\n        <stop stop-color="${c1}" />\n        <stop offset="1" stop-color="${c2}" />\n      </linearGradient>\n    </defs>\n  </svg>\n</p>`;
        } else if (style === 'dots') {
          compMarkdown = `<p align="center">\n  <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <circle cx="20" cy="10" r="4" fill="${c1}" />\n    <circle cx="40" cy="10" r="5" fill="${c2}" />\n    <circle cx="60" cy="10" r="6" fill="${c1}" />\n    <circle cx="80" cy="10" r="5" fill="${c2}" />\n    <circle cx="100" cy="10" r="4" fill="${c1}" />\n  </svg>\n</p>`;
        } else {
          // gradient line
          compMarkdown = `<p align="center">\n  <svg width="100%" height="10" viewBox="0 0 1200 10" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <line x1="0" y1="5" x2="1200" y2="5" stroke="url(#line_grad)" stroke-width="4" />\n    <defs>\n      <linearGradient id="line_grad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">\n        <stop stop-color="${c1}" />\n        <stop offset="1" stop-color="${c2}" />\n      </linearGradient>\n    </defs>\n  </svg>\n</p>`;
        }
        break;
      }
      case 'snake': {
        const user = username || 'github-username';
        compMarkdown = `<p align="center">\n  <img src="https://raw.githubusercontent.com/${user}/${user}/output/github-contribution-grid-snake.svg" alt="GitHub Contribution Snake" />\n</p>`;
        break;
      }
      case 'decorative': {
        const { type, color } = comp.config;
        const col = color || '#eab308';
        if (type === 'stars') {
          compMarkdown = `<p align="center">\n  <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">\n    <polygon points="10,1 4,19 19,7 1,7 16,19" fill="${col}" />\n    <polygon points="30,3 25,17 37,8 23,8 35,17" fill="${col}" opacity="0.6" />\n    <polygon points="50,1 44,19 59,7 41,7 56,19" fill="${col}" />\n  </svg>\n</p>`;
        }
        break;
      }
      case 'badge': {
        const { label, color } = comp.config;
        const col = (color || '#10b981').replace('#','');
        compMarkdown = `<p align="center">\n  <a href="#">\n    <img src="https://img.shields.io/badge/Status-${encodeURIComponent(label || 'Open to Work')}-${col}?style=for-the-badge" alt="Status Badge" />\n  </a>\n</p>`;
        break;
      }
      case 'footer': {
        const { text, theme } = comp.config;
        const colorVal = theme === 'auto' ? 'auto' : theme.replace('#','');
        const textParam = text ? `&text=${encodeURIComponent(text)}` : '';
        compMarkdown = `<p align="center">\n  <img src="https://capsule-render.vercel.app/api?type=waving&color=${colorVal}&height=100&section=footer${textParam}&fontSize=20" alt="Footer Wave" />\n</p>`;
        break;
      }
    }

    if (compMarkdown) {
      blocks.push(compMarkdown);
    }
  });

  return blocks.join('\n\n');
}

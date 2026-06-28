import { READMEStyleTemplate, GitHubStatsConfig, TechStackConfig, SocialLinksConfig } from '@/stores/readme-store';
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
  const template = data.template || 'minimal';

  const avatarMarkdown = data.avatarUrl
    ? `<p align="center">\n  <img src="${data.avatarUrl}" alt="Avatar" width="120" height="120" style="border-radius: 50%;" />\n</p>`
    : '';

  const statsMarkdown = (data.followers !== undefined && data.following !== undefined && data.publicRepos !== undefined)
    ? `<p align="center">\n  👥 <b>Followers:</b> ${data.followers} | 👥 <b>Following:</b> ${data.following} | 📦 <b>Repos:</b> ${data.publicRepos}\n</p>`
    : '';

  let body = '';
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

  return output;
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

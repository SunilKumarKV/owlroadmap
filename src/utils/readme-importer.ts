import { SectionId } from '@/stores/readme-store';
import { TECHNOLOGY_REGISTRY } from '@/utils/tech-registry';
import { SOCIAL_PLATFORM_REGISTRY } from '@/utils/social-registry';

export interface ParsedReadmeResult {
  detectedSections: SectionId[];
  data: {
    name: string;
    role: string;
    about: string;
    header: {
      enabled: boolean;
      name: string;
      title: string;
      intro: string;
      pronouns: string;
      location: string;
      alignment: 'left' | 'center' | 'right';
      bannerType: 'none' | 'capsule' | 'wave' | 'gradient';
      bannerTheme: string;
      bannerText: string;
      typingEnabled: boolean;
      typingLines: string[];
      typingSpeed: number;
      typingDelay: number;
      typingColor: string;
      typingCenter: boolean;
      badges: {
        openToWork: boolean;
        freelance: boolean;
        learning: string;
        building: string;
      };
      visitorPlacement: 'top' | 'bottom' | 'hidden';
    };
    githubStats: {
      enabled: boolean;
      username: string;
      theme: string;
      hideBorder: boolean;
      showIcons: boolean;
      compactMode: boolean;
      layout: 'default' | 'compact' | 'languages';
    };
    techStack: {
      enabled: boolean;
      style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
      iconOnly: boolean;
      groupByCategory: boolean;
      selectedIds: string[];
    };
    socialLinks: {
      enabled: boolean;
      style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
      iconOnly: boolean;
      platforms: Record<string, { enabled: boolean; value: string }>;
    };
    achievements: {
      enabled: boolean;
      username: string;
      widgets: Record<string, { enabled: boolean; theme?: string; color?: string; style?: string; hideBorder?: boolean; noFrame?: boolean; noBg?: boolean }>;
    };
    quotes: {
      enabled: boolean;
      theme: string;
      quoteType: 'programming' | 'general' | 'anime';
    };
    customMarkdown: {
      enabled: boolean;
      content: string;
    };
  };
}

export function parseReadmeMarkdown(markdown: string): ParsedReadmeResult {
  const detectedSections: SectionId[] = [];
  const normalized = markdown.replace(/\r/g, '');

  // Default structure
  const result: ParsedReadmeResult = {
    detectedSections,
    data: {
      name: '',
      role: '',
      about: '',
      header: {
        enabled: false,
        name: '',
        title: '',
        intro: '',
        pronouns: '',
        location: '',
        alignment: 'center',
        bannerType: 'none',
        bannerTheme: 'default',
        bannerText: '',
        typingEnabled: false,
        typingLines: [],
        typingSpeed: 200,
        typingDelay: 1000,
        typingColor: '36BCF7',
        typingCenter: true,
        badges: { openToWork: false, freelance: false, learning: '', building: '' },
        visitorPlacement: 'hidden',
      },
      githubStats: {
        enabled: false,
        username: '',
        theme: 'default',
        hideBorder: false,
        showIcons: true,
        compactMode: false,
        layout: 'default',
      },
      techStack: {
        enabled: false,
        style: 'flat-square',
        iconOnly: false,
        groupByCategory: true,
        selectedIds: [],
      },
      socialLinks: {
        enabled: false,
        style: 'flat-square',
        iconOnly: false,
        platforms: {},
      },
      achievements: {
        enabled: false,
        username: '',
        widgets: {
          trophy: { enabled: false, theme: 'flat' },
          visitor: { enabled: false, color: 'green', style: 'flat' },
          snake: { enabled: false },
          graph: { enabled: false, theme: 'github' },
        },
      },
      quotes: {
        enabled: false,
        theme: 'default',
        quoteType: 'programming',
      },
      customMarkdown: {
        enabled: false,
        content: '',
      },
    },
  };

  // Helper flags to see if we matched main header greetings/banners
  let greetingMatched = false;
  let bannerMatched = false;
  let typingMatched = false;

  // 1. Detect Capsule Render / Banner Banners
  const bannerRegex = /https:\/\/capsule-render\.vercel\.app\/api\?type=([a-z]+)&color=([a-zA-Z0-9#_]+)&height=\d+&section=header(?:&text=([^&"'\s\)]+))?/i;
  const bannerMatch = normalized.match(bannerRegex);
  if (bannerMatch) {
    bannerMatched = true;
    const type = bannerMatch[1];
    result.data.header.bannerType = type === 'waving' ? 'capsule' : type === 'soft' ? 'wave' : 'gradient';
    result.data.header.bannerTheme = bannerMatch[2];
    if (bannerMatch[3]) {
      result.data.header.bannerText = decodeURIComponent(bannerMatch[3]);
    }
  }

  // 2. Detect Alignment
  if (normalized.includes('align="center"') || normalized.includes('align=\'center\'')) {
    result.data.header.alignment = 'center';
  } else if (normalized.includes('align="right"') || normalized.includes('align=\'right\'')) {
    result.data.header.alignment = 'right';
  } else {
    result.data.header.alignment = 'left';
  }

  // 3. Detect Name Section & Title & Subtitle from HTML Tag or Markdown Headings
  const greetingRegex = /(?:Hi 👋, I'm|Hello, I'm|I am|I'm)\s+([^<\n\r]+)/i;
  const greetingMatch = normalized.match(greetingRegex);
  if (greetingMatch) {
    greetingMatched = true;
    let rawName = greetingMatch[1].trim().replace(/^#+\s+/, '');
    
    // Extract pronouns from name e.g. "John (he/him)"
    const pronounsRegex = /\(([^)]+)\)/;
    const pronounsMatch = rawName.match(pronounsRegex);
    if (pronounsMatch) {
      result.data.header.pronouns = pronounsMatch[1];
      rawName = rawName.replace(pronounsRegex, '').trim();
    }
    
    result.data.header.name = rawName;
    result.data.name = rawName;
  }

  // 4. Detect Professional Title and Location
  const locationRegex = /(?:based in|Based in)\s+([^<\n\r]+)/i;
  const locationMatch = normalized.match(locationRegex);
  if (locationMatch) {
    result.data.header.location = locationMatch[1].trim();
  }

  // Title match matching both HTML <h3 align="center">Title based in Loc</h3> and Markdown ### Title based in Loc
  const titleRegex = /(?:###|<h3[^>]*>)\s*([^<\n\r]+?)(?:<\/h3>|$)/im;
  const titleMatch = normalized.match(titleRegex);
  if (titleMatch) {
    let titleContent = titleMatch[1].trim();
    if (result.data.header.location) {
      titleContent = titleContent.replace(new RegExp(`\\s*(?:based in|Based in)\\s*${result.data.header.location}`, 'i'), '');
    }
    result.data.header.title = titleContent;
    result.data.role = titleContent;
  }

  // 5. Detect Introduction Paragraph
  const pRegex = /<p[^>]*align=["']center["'][^>]*>([\s\S]*?)<\/p>/gi;
  let pMatch;
  while ((pMatch = pRegex.exec(normalized)) !== null) {
    const text = pMatch[1].trim();
    if (
      text &&
      !text.includes('img') &&
      !text.includes('href') &&
      !text.includes('capsule-render') &&
      text.length > 5
    ) {
      result.data.header.intro = text;
      result.data.about = text;
      break;
    }
  }

  // 6. Detect Typing SVG Hero banner
  const typingRegex = /https:\/\/readme-typing-svg\.herokuapp\.com\/\?lines=([^&]+)(?:&color=([a-zA-Z0-9#_]+))?(?:&center=([a-z]+))?(?:&speed=(\d+))?(?:&pause=(\d+))?/i;
  const typingMatch = normalized.match(typingRegex);
  if (typingMatch) {
    typingMatched = true;
    result.data.header.typingEnabled = true;
    result.data.header.typingLines = typingMatch[1].split(';').map((l) => decodeURIComponent(l));
    if (typingMatch[2]) result.data.header.typingColor = typingMatch[2];
    if (typingMatch[3]) result.data.header.typingCenter = typingMatch[3] === 'true';
    if (typingMatch[4]) result.data.header.typingSpeed = parseInt(typingMatch[4], 10);
    if (typingMatch[5]) result.data.header.typingDelay = parseInt(typingMatch[5], 10);
  }

  // If greeting, typing banner, or capsule render banner is matched, we confirm the header section exists!
  if (greetingMatched || bannerMatched || typingMatched) {
    result.data.header.enabled = true;
    detectedSections.push('header');
  }

  // 7. Header Badges
  if (normalized.includes('Open%20to%20Work')) result.data.header.badges.openToWork = true;
  if (normalized.includes('Freelance-Available')) result.data.header.badges.freelance = true;
  
  const learningBadgeRegex = /Learning-([^-\s?&"'\)]+)/i;
  const learningMatch = normalized.match(learningBadgeRegex);
  if (learningMatch) {
    result.data.header.badges.learning = decodeURIComponent(learningMatch[1]);
  }

  const buildingBadgeRegex = /Building-([^-\s?&"'\)]+)/i;
  const buildingMatch = normalized.match(buildingBadgeRegex);
  if (buildingMatch) {
    result.data.header.badges.building = decodeURIComponent(buildingMatch[1]);
  }

  // 8. Social badges detection
  const badgesSearchRegex = /\[!\[([^\]]*)\]\(([^)]+)\)\]\(([^)]+)\)/g;
  let badgeMatch;
  while ((badgeMatch = badgesSearchRegex.exec(normalized)) !== null) {
    const altText = badgeMatch[1].toLowerCase().trim();
    const imageUrl = badgeMatch[2];
    const targetUrl = badgeMatch[3];

    // Find in Social Registry
    const foundPlatform = SOCIAL_PLATFORM_REGISTRY.find(
      (p) => {
        const id = p.id;
        const name = p.name.toLowerCase();
        const logo = p.logo.toLowerCase();
        return (
          altText === id ||
          altText === logo ||
          name.includes(altText) ||
          altText.includes(id) ||
          imageUrl.toLowerCase().includes(`logo=${logo}`) ||
          imageUrl.toLowerCase().includes(`logo=${id}`) ||
          (id === 'x' && (altText === 'twitter' || imageUrl.toLowerCase().includes('logo=twitter')))
        );
      }
    );

    if (foundPlatform) {
      result.data.socialLinks.enabled = true;
      let val = targetUrl;
      // Convert URL back to username/handle if possible
      if (foundPlatform.urlTemplate.includes('{value}')) {
        const prefix = foundPlatform.urlTemplate.split('{value}')[0];
        if (targetUrl.startsWith(prefix)) {
          val = targetUrl.replace(prefix, '');
        } else if (foundPlatform.id === 'x' && targetUrl.startsWith('https://twitter.com/')) {
          val = targetUrl.replace('https://twitter.com/', '');
        }
      }
      result.data.socialLinks.platforms[foundPlatform.id] = {
        enabled: true,
        value: val,
      };

      // Detect Shields style from image url
      const styleMatch = imageUrl.match(/style=([a-z-]+)/);
      if (styleMatch) {
        result.data.socialLinks.style = styleMatch[1] as any;
      }
      if (!detectedSections.includes('socials')) detectedSections.push('socials');
    }

    // Find in Tech Stack badges
    const foundTech = TECHNOLOGY_REGISTRY.find(
      (t) => {
        const name = t.name.toLowerCase();
        const logo = t.logo.toLowerCase();
        return (
          altText === t.id ||
          altText === logo ||
          name.includes(altText) ||
          altText.includes(t.id) ||
          imageUrl.toLowerCase().includes(`logo=${logo}`) ||
          imageUrl.toLowerCase().includes(`logo=${t.id}`)
        );
      }
    );
    if (foundTech) {
      result.data.techStack.enabled = true;
      if (!result.data.techStack.selectedIds.includes(foundTech.id)) {
        result.data.techStack.selectedIds.push(foundTech.id);
      }
      const styleMatch = imageUrl.match(/style=([a-z-]+)/);
      if (styleMatch) {
        result.data.techStack.style = styleMatch[1] as any;
      }
      if (!detectedSections.includes('techStack')) detectedSections.push('techStack');
    }
  }

  // Fallback scan for standalone images (not wrapped in links)
  const imageSearchRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  while ((badgeMatch = imageSearchRegex.exec(normalized)) !== null) {
    const altText = badgeMatch[1].toLowerCase().trim();
    const imageUrl = badgeMatch[2];

    const foundTech = TECHNOLOGY_REGISTRY.find(
      (t) => {
        const name = t.name.toLowerCase();
        const logo = t.logo.toLowerCase();
        return (
          altText === t.id ||
          altText === logo ||
          name.includes(altText) ||
          altText.includes(t.id) ||
          imageUrl.toLowerCase().includes(`logo=${logo}`) ||
          imageUrl.toLowerCase().includes(`logo=${t.id}`)
        );
      }
    );
    if (foundTech) {
      result.data.techStack.enabled = true;
      if (!result.data.techStack.selectedIds.includes(foundTech.id)) {
        result.data.techStack.selectedIds.push(foundTech.id);
      }
      const styleMatch = imageUrl.match(/style=([a-z-]+)/);
      if (styleMatch) {
        result.data.techStack.style = styleMatch[1] as any;
      }
      if (!detectedSections.includes('techStack')) detectedSections.push('techStack');
    }
  }

  // 9. GitHub Stats / Streak cards
  const statsRegex = /github-readme-stats\.vercel\.app\/api(?:\/top-langs\/)?\?username=([^&"'\s\)]+)(?:&theme=([a-zA-Z0-9#_-]+))?/gi;
  let statsMatch;
  while ((statsMatch = statsRegex.exec(normalized)) !== null) {
    result.data.githubStats.enabled = true;
    result.data.githubStats.username = statsMatch[1];
    if (statsMatch[2]) result.data.githubStats.theme = statsMatch[2];
    if (normalized.includes('layout=compact')) result.data.githubStats.layout = 'compact';
    if (normalized.includes('top-langs')) result.data.githubStats.layout = 'languages';
    if (normalized.includes('hide_border=true')) result.data.githubStats.hideBorder = true;
    if (normalized.includes('show_icons=true')) result.data.githubStats.showIcons = true;
    if (!detectedSections.includes('stats')) detectedSections.push('stats');
  }

  const streakRegex = /github-readme-streak-stats\.herokuapp\.com\/\?user=([^&"'\s\)]+)/i;
  const streakMatch = normalized.match(streakRegex);
  if (streakMatch) {
    result.data.githubStats.enabled = true;
    result.data.githubStats.username = streakMatch[1];
    if (!detectedSections.includes('stats')) detectedSections.push('stats');
  }

  // 10. Achievements / Trophies / Activity graph
  const trophyRegex = /github-profile-trophy\.vercel\.app\/\?username=([^&"'\s\)]+)(?:&theme=([a-zA-Z0-9#_-]+))?/i;
  const trophyMatch = normalized.match(trophyRegex);
  if (trophyMatch) {
    result.data.achievements.enabled = true;
    result.data.achievements.username = trophyMatch[1];
    result.data.achievements.widgets.trophy.enabled = true;
    if (trophyMatch[2]) result.data.achievements.widgets.trophy.theme = trophyMatch[2];
    if (!detectedSections.includes('achievements')) detectedSections.push('achievements');
  }

  const visitorRegex = /komarev\.com\/ghpvc\/\?username=([^&"'\s\)]+)(?:&color=([a-zA-Z0-9#_-]+))?/i;
  const visitorMatch = normalized.match(visitorRegex);
  if (visitorMatch) {
    result.data.achievements.enabled = true;
    result.data.achievements.username = visitorMatch[1];
    result.data.achievements.widgets.visitor.enabled = true;
    if (visitorMatch[2]) result.data.achievements.widgets.visitor.color = visitorMatch[2];
    if (!detectedSections.includes('achievements')) detectedSections.push('achievements');
  }

  const graphRegex = /github-readme-activity-graph\.vercel\.app\/graph\?username=([^&"'\s\)]+)(?:&theme=([a-zA-Z0-9#_-]+))?/i;
  const graphMatch = normalized.match(graphRegex);
  if (graphMatch) {
    result.data.achievements.enabled = true;
    result.data.achievements.username = graphMatch[1];
    result.data.achievements.widgets.graph.enabled = true;
    if (graphMatch[2]) result.data.achievements.widgets.graph.theme = graphMatch[2];
    if (!detectedSections.includes('achievements')) detectedSections.push('achievements');
  }

  const snakeMatch = normalized.match(/raw\.githubusercontent\.com\/([^\/]+)\/[^\/]+\/output\/github-contribution-grid-snake\.svg/i);
  if (snakeMatch) {
    result.data.achievements.enabled = true;
    result.data.achievements.username = snakeMatch[1];
    result.data.achievements.widgets.snake.enabled = true;
    if (!detectedSections.includes('achievements')) detectedSections.push('achievements');
  }

  // 11. Support / Buy Me Coffee
  const buymeacoffeeRegex = /buymeacoffee\.com\/([^&"'\s\)]+)/i;
  const bmacMatch = normalized.match(buymeacoffeeRegex);
  if (bmacMatch) {
    result.data.socialLinks.enabled = true;
    result.data.socialLinks.platforms.buymeacoffee = { enabled: true, value: bmacMatch[1] };
    if (!detectedSections.includes('socials')) detectedSections.push('socials');
  }

  const kofiRegex = /ko-fi\.com\/([^&"'\s\)]+)/i;
  const kofiMatch = normalized.match(kofiRegex);
  if (kofiMatch) {
    result.data.socialLinks.enabled = true;
    result.data.socialLinks.platforms.kofi = { enabled: true, value: kofiMatch[1] };
    if (!detectedSections.includes('socials')) detectedSections.push('socials');
  }

  // 12. Quotes card
  if (normalized.includes('github-readme-quotes')) {
    result.data.quotes.enabled = true;
    if (!detectedSections.includes('quotes')) detectedSections.push('quotes');
  }

  // 13. Detect About me Markdown description blocks (if not captured in intro)
  const aboutMeHeaderRegex = /(?:## About Me|## Who I am|## Bio)([\s\S]*?)(?:## |### |<p |$)/i;
  const aboutMatch = normalized.match(aboutMeHeaderRegex);
  if (aboutMatch) {
    result.data.about = aboutMatch[1].trim();
    if (!detectedSections.includes('about')) detectedSections.push('about');
  }

  // Fallback: If no standard sections detected, we parse as custom content
  if (detectedSections.length === 0) {
    result.data.customMarkdown.enabled = true;
    result.data.customMarkdown.content = markdown;
    detectedSections.push('custom');
  }

  return result;
}

export interface QualityCategoryItem {
  name: string;
  passed: boolean;
  severity: 'info' | 'warning' | 'error';
  suggestion?: string;
}

export interface QualityCategoryScore {
  score: number; // 0 to 100
  name: string;
  items: QualityCategoryItem[];
}

export interface ReadmeAnalysisResult {
  overallScore: number;
  categories: {
    completeness: QualityCategoryScore;
    readability: QualityCategoryScore;
    branding: QualityCategoryScore;
    githubPresence: QualityCategoryScore;
    accessibility: QualityCategoryScore;
  };
  missingSections: string[];
  suggestions: string[];
  recommendedTemplates: string[];
}

/**
 * Analyzes raw Markdown content and returns quality scores, checklists, and template recommendations.
 */
export function analyzeReadmeMarkdown(markdown: string): ReadmeAnalysisResult {
  const content = markdown || '';

  // 1. COMPLETENESS SCANNER
  const hasHeader = /^(#\s|[^\n]+greeting|hello|welcome|hi\s👋)/i.test(content) || content.includes('readme-typing-svg') || content.includes('capsule-render');
  const hasAbout = /##?\s+(about|intro|who\s+i\s+am|background|biography)/i.test(content);
  const hasSocials = /(linkedin\.com|twitter\.com|x\.com|instagram\.com|youtube\.com|discord\.gg|twitch\.tv|github\.com\/[a-zA-Z0-9-]+\/?\?tab=)/i.test(content) || content.includes('social');
  const hasTechStack = /##?\s+(tech|skills|languages|tools|stack)/i.test(content) || /img\.shields\.io\/badge\/.*logo=/i.test(content) || content.includes('skills');
  const hasProjects = /##?\s+(project|portfolio|repository|showcase|work)/i.test(content);
  const hasStats = /github-readme-stats/i.test(content) || /github-readme-streak-stats/i.test(content);

  const completenessItems: QualityCategoryItem[] = [
    {
      name: 'Profile Header & Hero Banner',
      passed: hasHeader,
      severity: 'warning',
      suggestion: 'Add a welcoming title, wave header, or typing text overlay.',
    },
    {
      name: 'About Me Section',
      passed: hasAbout,
      severity: 'warning',
      suggestion: 'Add an "About Me" section to introduce your professional background.',
    },
    {
      name: 'Social Links',
      passed: hasSocials,
      severity: 'info',
      suggestion: 'Connect your professional socials (LinkedIn, X, Dev.to) with badges.',
    },
    {
      name: 'Technology Stack',
      passed: hasTechStack,
      severity: 'warning',
      suggestion: 'Add badges highlighting your core languages and frontend/backend tools.',
    },
    {
      name: 'Featured Projects',
      passed: hasProjects,
      severity: 'warning',
      suggestion: 'List or pin your top open-source projects or repositories.',
    },
    {
      name: 'GitHub Contribution Stats',
      passed: hasStats,
      severity: 'info',
      suggestion: 'Add dynamic contribution stats or languages cards.',
    },
  ];

  const completenessScore = Math.round(
    (completenessItems.filter((i) => i.passed).length / completenessItems.length) * 100
  );

  // 2. READABILITY AUDITOR
  // heading count (H1s)
  const h1Matches = content.match(/^#\s+[^\n]+/gm) || [];
  const h1Count = h1Matches.length;
  const hasCorrectH1Count = h1Count === 1;

  // empty headings check (e.g. ## \n or ###\n)
  const emptyHeadings = content.match(/^##+\s*$/gm) || [];
  const hasNoEmptyHeadings = emptyHeadings.length === 0;

  // check if spacing has double newlines before headers
  // we count headings that do NOT have a blank line preceding them (excluding the very first line)
  const lines = content.split('\n');
  let headerSpacingErrors = 0;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].startsWith('#') && lines[i - 1].trim() !== '') {
      headerSpacingErrors++;
    }
  }
  const hasGoodHeaderSpacing = headerSpacingErrors === 0;

  // broken markdown link syntaxes (e.g. []() or empty href="")
  const brokenLinks = content.match(/\[\]\([^)]*\)|\[[^\]]*\]\(\s*\)/g) || [];
  const hasNoBrokenLinks = brokenLinks.length === 0;

  const readabilityItems: QualityCategoryItem[] = [
    {
      name: 'Single Main Title (H1)',
      passed: hasCorrectH1Count,
      severity: 'warning',
      suggestion: h1Count === 0 ? 'Add a single main heading (# Your Name).' : 'Ensure you only have exactly one main heading (#) to keep structure clean.',
    },
    {
      name: 'No Empty Headings',
      passed: hasNoEmptyHeadings,
      severity: 'error',
      suggestion: 'Remove headings that do not contain any title text.',
    },
    {
      name: 'Consistent Section Spacing',
      passed: hasGoodHeaderSpacing,
      severity: 'info',
      suggestion: 'Ensure there is a blank line before every heading line to improve visual spacing.',
    },
    {
      name: 'No Broken Links',
      passed: hasNoBrokenLinks,
      severity: 'error',
      suggestion: 'Fix empty link brackets []() or parentheses that lack URLs.',
    },
  ];

  let readabilityScore = 100;
  if (!hasCorrectH1Count) readabilityScore -= h1Count === 0 ? 30 : 15;
  if (!hasNoEmptyHeadings) readabilityScore -= 20;
  if (!hasGoodHeaderSpacing) readabilityScore -= Math.min(20, headerSpacingErrors * 5);
  if (!hasNoBrokenLinks) readabilityScore -= Math.min(30, brokenLinks.length * 10);
  readabilityScore = Math.max(0, readabilityScore);

  // 3. DEVELOPER BRANDING
  // professional role keywords
  const hasProRole = /(software|frontend|backend|full\s*stack|mobile|web|devops|cloud|security|data|ai|ml|engineer|developer|designer|architect|programmer|student|researcher)/i.test(content);

  // count distinct social badge links (e.g. linkedin, twitter, x, instagram, discord)
  const socialBadgeCount = (content.match(/linkedin\.com|twitter\.com|x\.com|instagram\.com|discord\.gg|dev\.to|medium\.com/gi) || []).length;
  const hasMultiSocial = socialBadgeCount >= 2;

  // personal portfolio link (not github.com, raw.github, shields.io, vercel.app, heroku, nextjs, medium, etc.)
  const links = content.match(/https?:\/\/[^\s)]+/g) || [];
  const hasPortfolioLink = links.some((link) => {
    return !/github\.com|githubusercontent\.com|shields\.io|vercel\.app|herokuapp\.com|readme-typing-svg|capsule-render|ko-fi\.com|buymeacoffee\.com|wakatime\.com/i.test(link);
  });

  const brandingItems: QualityCategoryItem[] = [
    {
      name: 'Professional Title',
      passed: hasProRole,
      severity: 'warning',
      suggestion: 'Add your developer role (e.g., Software Engineer, Full Stack Developer) in the introduction.',
    },
    {
      name: 'Multi-platform Presence',
      passed: hasMultiSocial,
      severity: 'info',
      suggestion: 'Include at least two professional or social contact badges (e.g. LinkedIn, X).',
    },
    {
      name: 'Personal/Portfolio Website',
      passed: hasPortfolioLink,
      severity: 'warning',
      suggestion: 'Add a link to your personal portfolio or custom landing page.',
    },
  ];

  let brandingScore = 0;
  if (hasProRole) brandingScore += 30;
  if (hasMultiSocial) brandingScore += 35;
  else if (socialBadgeCount === 1) brandingScore += 15;
  if (hasPortfolioLink) brandingScore += 35;

  // 4. GITHUB PRESENCE
  const hasStatsCard = /github-readme-stats.*layout=/i.test(content) || /github-readme-stats\b/i.test(content);
  const hasStreakCard = /github-readme-streak-stats/i.test(content);
  const hasTrophyCard = /github-profile-trophy/i.test(content);
  const hasActivityGraph = /activity-graph/i.test(content) || hasProjects;

  const githubItems: QualityCategoryItem[] = [
    {
      name: 'GitHub Stats Card',
      passed: hasStatsCard,
      severity: 'info',
      suggestion: 'Embed a GitHub profile statistics widget.',
    },
    {
      name: 'GitHub Streak Tracker',
      passed: hasStreakCard,
      severity: 'info',
      suggestion: 'Add a contribution streak card to showcase consistency.',
    },
    {
      name: 'Profile Trophy Badges',
      passed: hasTrophyCard,
      severity: 'info',
      suggestion: 'Incorporate GitHub achievements trophies.',
    },
    {
      name: 'Projects Showcase or Activity Graph',
      passed: hasActivityGraph,
      severity: 'warning',
      suggestion: 'Showcase repositories or include a github activity graph.',
    },
  ];

  let githubScore = 0;
  if (hasStatsCard) githubScore += 25;
  if (hasStreakCard) githubScore += 25;
  if (hasTrophyCard) githubScore += 25;
  if (hasActivityGraph) githubScore += 25;

  // 5. ACCESSIBILITY (A11Y)
  // Check image alt tags
  // Matches markdown images `![alt](url)` and HTML `<img ...>`
  const markdownImages = content.match(/!\[([^\]]*)\]\(([^)]*)\)/g) || [];
  const emptyMarkdownAlts = markdownImages.filter((img) => img.startsWith('![]('));
  const htmlImages = content.match(/<img\s+[^>]*>/gi) || [];
  const emptyHtmlAlts = htmlImages.filter((img) => !/alt\s*=\s*["'][^"']+["']/i.test(img));

  const totalImagesCount = markdownImages.length + htmlImages.length;
  const totalEmptyAlts = emptyMarkdownAlts.length + emptyHtmlAlts.length;
  const hasAllImageAlts = totalEmptyAlts === 0;

  // Generic link labels (avoid "click here", "link", "here", "read more")
  const linkLabelMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
  const genericLinkLabels = linkLabelMatches.filter((match) => {
    const label = (match.match(/\[([^\]]+)\]/) || [])[1] || '';
    return /^(click\s*here|link|here|read\s*more|website|url)$/i.test(label.trim());
  });
  const hasNoGenericLinks = genericLinkLabels.length === 0;

  // Heading order check (H1 -> H2 -> H3 etc)
  // We extract all headings and their depth levels
  const headingLevels = (content.match(/^#+/gm) || []).map((h) => h.length);
  let headingSequenceSkips = 0;
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      headingSequenceSkips++;
    }
  }
  const hasPerfectHeadingOrder = headingSequenceSkips === 0;

  const a11yItems: QualityCategoryItem[] = [
    {
      name: 'Descriptive Image Alt Text',
      passed: hasAllImageAlts,
      severity: 'error',
      suggestion: totalEmptyAlts > 0 ? `Fill in descriptive alt text for ${totalEmptyAlts} images (currently empty).` : 'Provide alt labels for all badges and graphics.',
    },
    {
      name: 'Descriptive Link Labels',
      passed: hasNoGenericLinks,
      severity: 'warning',
      suggestion: 'Avoid vague link labels like "click here" or "link". Use descriptive text.',
    },
    {
      name: 'Logical Heading Order',
      passed: hasPerfectHeadingOrder,
      severity: 'warning',
      suggestion: 'Avoid skipping heading hierarchy levels (e.g. from H1 directly to H3).',
    },
  ];

  let a11yScore = 100;
  if (!hasAllImageAlts) a11yScore -= Math.min(40, totalEmptyAlts * 20);
  if (!hasNoGenericLinks) a11yScore -= Math.min(30, genericLinkLabels.length * 15);
  if (!hasPerfectHeadingOrder) a11yScore -= Math.min(30, headingSequenceSkips * 15);
  a11yScore = Math.max(0, a11yScore);

  // COMBINE SCORES
  const overallScore = Math.round(
    (completenessScore + readabilityScore + brandingScore + githubScore + a11yScore) / 5
  );

  // MISSING SECTIONS
  const missingSections: string[] = [];
  if (!hasHeader) missingSections.push('Profile Header');
  if (!hasAbout) missingSections.push('About Me');
  if (!hasSocials) missingSections.push('Social Links');
  if (!hasTechStack) missingSections.push('Tech Stack');
  if (!hasProjects) missingSections.push('Featured Projects');
  if (!hasStats) missingSections.push('GitHub Stats');

  // ACTIONABLE RECOMMENDATIONS
  const suggestions: string[] = [];
  [
    ...completenessItems,
    ...readabilityItems,
    ...brandingItems,
    ...githubItems,
    ...a11yItems,
  ].forEach((item) => {
    if (!item.passed && item.suggestion) {
      suggestions.push(item.suggestion);
    }
  });

  // RECOMMENDED TEMPLATES BASE ON STRENGTHS
  const recommendedTemplates: string[] = [];
  if (!hasStats && !hasProjects) {
    recommendedTemplates.push('Minimal');
  }
  if (hasSocials && hasTechStack && !hasStats) {
    recommendedTemplates.push('Portfolio');
  }
  if (hasStats || hasTrophyCard) {
    recommendedTemplates.push('Open Source');
  }
  if (hasTechStack && hasProjects) {
    recommendedTemplates.push('Developer');
  }
  if (recommendedTemplates.length === 0) {
    recommendedTemplates.push('Professional');
  }

  return {
    overallScore,
    categories: {
      completeness: { score: completenessScore, name: 'Completeness', items: completenessItems },
      readability: { score: readabilityScore, name: 'Readability', items: readabilityItems },
      branding: { score: brandingScore, name: 'Developer Branding', items: brandingItems },
      githubPresence: { score: githubScore, name: 'GitHub Presence', items: githubItems },
      accessibility: { score: a11yScore, name: 'Accessibility', items: a11yItems },
    },
    missingSections,
    suggestions,
    recommendedTemplates,
  };
}

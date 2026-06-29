import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FeaturedProjectsConfig, DEFAULT_FEATURED_PROJECTS } from '@/types/featured-projects';
export type { FeaturedProject, FeaturedProjectsConfig, ProjectCardStyle, ProjectLayout, ProjectSortMode } from '@/types/featured-projects';
export { DEFAULT_FEATURED_PROJECTS } from '@/types/featured-projects';

export type READMEStyleTemplate = 'minimal' | 'professional' | 'developer' | 'open-source' | 'portfolio';

export interface ExportHistoryItem {
  id: string;
  timestamp: string;
  format: string;
  projectName: string;
}

export interface RepoAnalysisResult {
  languages: { name: string; count: number }[];
  topStarred: { name: string; stars: number; description: string; url: string }[];
  topActive: { name: string; lastUpdated: string; description: string; url: string }[];
  suggestedSkills: string[];
  suggestedTechStack: string[];
  suggestedReadmeSections: { title: string; content: string }[];
  totalStars: number;
  totalForks: number;
}

export interface AISuggestions {
  readme: {
    aboutMe: string;
    introduction: string;
    skills: string;
    projects: string;
  } | null;
  roadmap: {
    nextTopics: string[];
    technologies: string[];
    roadmapSteps: string[];
  } | null;
  profile: {
    improvedBio: string;
    portfolioDescription: string;
    githubImprovements: string[];
  } | null;
}

export interface GitHubStatsConfig {
  enabled: boolean;
  username: string;
  theme: string;
  hideBorder: boolean;
  showIcons: boolean;
  compactMode: boolean;
  layout: 'default' | 'compact';
  cardOrder: ('stats' | 'languages' | 'streak')[];
  cardConfigs: Record<'stats' | 'languages' | 'streak', { enabled: boolean }>;
}

export const DEFAULT_GITHUB_STATS: GitHubStatsConfig = {
  enabled: false,
  username: '',
  theme: 'default',
  hideBorder: false,
  showIcons: true,
  compactMode: false,
  layout: 'default',
  cardOrder: ['stats', 'languages', 'streak'],
  cardConfigs: {
    stats: { enabled: true },
    languages: { enabled: true },
    streak: { enabled: true },
  },
};

export interface TechStackConfig {
  enabled: boolean;
  style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  iconOnly: boolean;
  groupByCategory: boolean;
  hideEmptyCategories: boolean;
  selectedIds: string[];
}

export const DEFAULT_TECH_STACK: TechStackConfig = {
  enabled: false,
  style: 'for-the-badge',
  iconOnly: false,
  groupByCategory: true,
  hideEmptyCategories: false,
  selectedIds: [],
};

export interface SocialPlatformConfig {
  enabled: boolean;
  value: string;
}

export interface SocialLinksConfig {
  enabled: boolean;
  style: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  iconOnly: boolean;
  platforms: Record<string, SocialPlatformConfig>;
  order: string[];
}

export const DEFAULT_SOCIAL_LINKS: SocialLinksConfig = {
  enabled: false,
  style: 'for-the-badge',
  iconOnly: false,
  platforms: {},
  order: [
    'linkedin', 'portfolio', 'github', 'gitlab',
    'x', 'instagram', 'youtube', 'twitch', 'discord',
    'stackoverflow', 'devto', 'hashnode', 'medium',
    'email', 'gmail', 'buymeacoffee', 'kofi'
  ],
};

export interface AchievementWidgetConfig {
  enabled: boolean;
  theme?: string;
  color?: string;
  style?: string;
  hideBorder?: boolean;
  noFrame?: boolean;
  noBg?: boolean;
  rows?: number;
  columns?: number;
}

export interface AchievementsConfig {
  enabled: boolean;
  username: string;
  widgets: Record<'trophy' | 'visitor' | 'snake' | 'graph', AchievementWidgetConfig>;
  order: ('trophy' | 'visitor' | 'snake' | 'graph')[];
}

export const DEFAULT_ACHIEVEMENTS: AchievementsConfig = {
  enabled: false,
  username: '',
  widgets: {
    trophy: { enabled: true, theme: 'flat', noFrame: false, noBg: false, rows: 1, columns: 6 },
    visitor: { enabled: true, color: '0078d7', style: 'flat' },
    snake: { enabled: true },
    graph: { enabled: true, theme: 'github', hideBorder: false },
  },
  order: ['trophy', 'visitor', 'graph', 'snake'],
};

export interface HeaderConfig {
  enabled: boolean;
  name: string;
  pronouns: string;
  location: string;
  title: string;
  intro: string;
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
}

export const DEFAULT_HEADER: HeaderConfig = {
  enabled: false,
  name: '',
  pronouns: '',
  location: '',
  title: '',
  intro: '',
  alignment: 'center',
  bannerType: 'none',
  bannerTheme: 'gradient',
  bannerText: '',
  typingEnabled: false,
  typingLines: [],
  typingSpeed: 200,
  typingDelay: 1000,
  typingColor: '36BCF7',
  typingCenter: true,
  badges: {
    openToWork: false,
    freelance: false,
    learning: '',
    building: '',
  },
  visitorPlacement: 'hidden',
};

export type SectionId =
  | 'header'
  | 'about'
  | 'socials'
  | 'techStack'
  | 'stats'
  | 'achievements'
  | 'projects'
  | 'support'
  | 'quotes'
  | 'visitor'
  | 'custom';

export interface SectionConfig {
  id: SectionId;
  name: string;
  enabled: boolean;
  collapsed: boolean;
}

export interface SectionOrderConfig {
  sections: Record<SectionId, SectionConfig>;
  order: SectionId[];
}

export interface SupportConfig {
  enabled: boolean;
  buyMeACoffeeUsername: string;
  kofiUsername: string;
  style: 'flat' | 'flat-square' | 'for-the-badge';
}

export interface QuotesConfig {
  enabled: boolean;
  theme: string;
  quoteType: 'programming' | 'funny' | 'motivational';
}

export interface CustomMarkdownConfig {
  enabled: boolean;
  content: string;
}

export interface StandaloneVisitorConfig {
  enabled: boolean;
  username: string;
  color: string;
  style: string;
}

export const DEFAULT_SECTIONS: SectionOrderConfig = {
  order: [
    'header',
    'about',
    'socials',
    'techStack',
    'stats',
    'achievements',
    'projects',
    'support',
    'quotes',
    'visitor',
    'custom',
  ],
  sections: {
    header: { id: 'header', name: 'Profile Header', enabled: true, collapsed: false },
    about: { id: 'about', name: 'About Me', enabled: true, collapsed: false },
    socials: { id: 'socials', name: 'Social Links', enabled: true, collapsed: false },
    techStack: { id: 'techStack', name: 'Tech Stack', enabled: true, collapsed: false },
    stats: { id: 'stats', name: 'GitHub Stats', enabled: true, collapsed: false },
    achievements: { id: 'achievements', name: 'Achievements', enabled: true, collapsed: false },
    projects: { id: 'projects', name: 'Featured Projects', enabled: true, collapsed: false },
    support: { id: 'support', name: 'Support Me', enabled: false, collapsed: false },
    quotes: { id: 'quotes', name: 'Quotes', enabled: false, collapsed: false },
    visitor: { id: 'visitor', name: 'Visitor Counter', enabled: false, collapsed: false },
    custom: { id: 'custom', name: 'Custom Markdown', enabled: false, collapsed: false },
  },
};

export const DEFAULT_SUPPORT: SupportConfig = {
  enabled: false,
  buyMeACoffeeUsername: '',
  kofiUsername: '',
  style: 'for-the-badge',
};

export const DEFAULT_QUOTES: QuotesConfig = {
  enabled: false,
  theme: 'radical',
  quoteType: 'programming',
};

export const DEFAULT_CUSTOM_MARKDOWN: CustomMarkdownConfig = {
  enabled: false,
  content: '',
};

export const DEFAULT_STANDALONE_VISITOR: StandaloneVisitorConfig = {
  enabled: false,
  username: '',
  color: 'green',
  style: 'flat',
};

export const PRESETS: Record<string, SectionId[]> = {
  minimal: ['header', 'about', 'socials'],
  modern: ['header', 'about', 'techStack', 'stats', 'achievements', 'socials'],
  developer: ['header', 'about', 'techStack', 'projects', 'stats', 'visitor'],
  'open-source': ['header', 'about', 'projects', 'techStack', 'achievements'],
  'gprm-style': ['header', 'about', 'socials', 'techStack', 'stats', 'achievements', 'visitor'],
};

export type READMEField =
  | 'name'
  | 'role'
  | 'about'
  | 'skills'
  | 'projects'
  | 'socials'
  | 'avatarUrl'
  | 'followers'
  | 'following'
  | 'publicRepos'
  | 'template'
  | 'readmeExportsCount'
  | 'templatesUsedCount'
  | 'githubStats'
  | 'techStack'
  | 'socialLinks'
  | 'achievements'
  | 'header'
  | 'sections'
  | 'support'
  | 'quotes'
  | 'customMarkdown'
  | 'standaloneVisitor'
  | 'featuredProjects';

interface READMEState {
  name: string;
  role: string;
  about: string;
  skills: string;
  projects: string;
  socials: string;
  avatarUrl: string;
  followers: number | undefined;
  following: number | undefined;
  publicRepos: number | undefined;
  template: READMEStyleTemplate;
  readmeExportsCount: number;
  templatesUsedCount: number;
  exportHistory: ExportHistoryItem[];
  repoAnalysis: RepoAnalysisResult | null;
  aiSuggestions: AISuggestions | null;
  aiGenerationsCount: number;
  githubStats: GitHubStatsConfig;
  techStack: TechStackConfig;
  socialLinks: SocialLinksConfig;
  achievements: AchievementsConfig;
  header: HeaderConfig;
  sections: SectionOrderConfig;
  support: SupportConfig;
  quotes: QuotesConfig;
  customMarkdown: CustomMarkdownConfig;
  standaloneVisitor: StandaloneVisitorConfig;
  featuredProjects: FeaturedProjectsConfig;
  setField: (field: READMEField, value: any) => void;
  setName: (value: string) => void;
  setRole: (value: string) => void;
  setAbout: (value: string) => void;
  setSkills: (value: string) => void;
  setProjects: (value: string) => void;
  setSocials: (value: string) => void;
  setAvatarUrl: (value: string) => void;
  setFollowers: (value: number | undefined) => void;
  setFollowing: (value: number | undefined) => void;
  setPublicRepos: (value: number | undefined) => void;
  setTemplate: (value: READMEStyleTemplate) => void;
  incrementReadmeExports: () => void;
  incrementTemplatesUsed: () => void;
  incrementAiGenerations: () => void;
  addExportHistoryItem: (format: string, projectName: string) => void;
  setRepoAnalysis: (analysis: RepoAnalysisResult | null) => void;
  setAiSuggestions: (suggestions: AISuggestions | null) => void;
  setGithubStats: (stats: Partial<GitHubStatsConfig>) => void;
  setTechStack: (stack: Partial<TechStackConfig>) => void;
  setSocialLinks: (links: Partial<SocialLinksConfig>) => void;
  setAchievements: (achievements: Partial<AchievementsConfig>) => void;
  setHeader: (header: Partial<HeaderConfig>) => void;
  setSections: (sections: Partial<SectionOrderConfig>) => void;
  setSupport: (support: Partial<SupportConfig>) => void;
  setQuotes: (quotes: Partial<QuotesConfig>) => void;
  setCustomMarkdown: (custom: Partial<CustomMarkdownConfig>) => void;
  setStandaloneVisitor: (visitor: Partial<StandaloneVisitorConfig>) => void;
  setFeaturedProjects: (projects: Partial<FeaturedProjectsConfig>) => void;
  applyPreset: (presetName: string) => void;
  applyTemplate: (template: any) => void;
  importReadmeData: (importedData: any, selectedSectionIds: SectionId[]) => void;
  reset: () => void;
}

const useREADMEStore = create<READMEState>()(
  persist(
    (set) => ({
      name: '',
      role: '',
      about: '',
      skills: '',
      projects: '',
      socials: '',
      avatarUrl: '',
      followers: undefined,
      following: undefined,
      publicRepos: undefined,
      template: 'minimal',
      readmeExportsCount: 0,
      templatesUsedCount: 0,
      exportHistory: [],
      repoAnalysis: null,
      aiSuggestions: null,
      aiGenerationsCount: 0,
      githubStats: { ...DEFAULT_GITHUB_STATS },
      techStack: { ...DEFAULT_TECH_STACK },
      socialLinks: { ...DEFAULT_SOCIAL_LINKS },
      achievements: { ...DEFAULT_ACHIEVEMENTS },
      header: { ...DEFAULT_HEADER },
      sections: { ...DEFAULT_SECTIONS },
      support: { ...DEFAULT_SUPPORT },
      quotes: { ...DEFAULT_QUOTES },
      customMarkdown: { ...DEFAULT_CUSTOM_MARKDOWN },
      standaloneVisitor: { ...DEFAULT_STANDALONE_VISITOR },
      featuredProjects: { ...DEFAULT_FEATURED_PROJECTS },
      setField: (field, value) => set({ [field]: value } as Partial<READMEState>),
      setName: (value) => set({ name: value }),
      setRole: (value) => set({ role: value }),
      setAbout: (value) => set({ about: value }),
      setSkills: (value) => set({ skills: value }),
      setProjects: (value) => set({ projects: value }),
      setSocials: (value) => set({ socials: value }),
      setAvatarUrl: (value) => set({ avatarUrl: value }),
      setFollowers: (value) => set({ followers: value }),
      setFollowing: (value) => set({ following: value }),
      setPublicRepos: (value) => set({ publicRepos: value }),
      setTemplate: (value) => {
        set((state) => ({
          template: value,
          templatesUsedCount: state.templatesUsedCount + 1,
        }));
      },
      incrementReadmeExports: () => set((state) => ({ readmeExportsCount: state.readmeExportsCount + 1 })),
      incrementTemplatesUsed: () => set((state) => ({ templatesUsedCount: state.templatesUsedCount + 1 })),
      incrementAiGenerations: () => set((state) => ({ aiGenerationsCount: state.aiGenerationsCount + 1 })),
      addExportHistoryItem: (format, projectName) =>
        set((state) => ({
          exportHistory: [
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toISOString(),
              format,
              projectName: projectName || 'Untitled Project',
            },
            ...(state.exportHistory || []),
          ].slice(0, 50),
        })),
      setRepoAnalysis: (analysis) => set({ repoAnalysis: analysis }),
      setAiSuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
      setGithubStats: (stats) =>
        set((state) => ({
          githubStats: {
            ...state.githubStats,
            ...stats,
          },
        })),
      setTechStack: (stack) =>
        set((state) => ({
          techStack: {
            ...state.techStack,
            ...stack,
          },
        })),
      setSocialLinks: (links) =>
        set((state) => ({
          socialLinks: {
            ...state.socialLinks,
            ...links,
          },
        })),
      setAchievements: (achievements) =>
        set((state) => ({
          achievements: {
            ...state.achievements,
            ...achievements,
          },
        })),
      setHeader: (header) =>
        set((state) => ({
          header: {
            ...state.header,
            ...header,
          },
        })),
      setSections: (sections) =>
        set((state) => ({
          sections: {
            ...state.sections,
            ...sections,
          },
        })),
      setSupport: (support) =>
        set((state) => ({
          support: {
            ...state.support,
            ...support,
          },
        })),
      setQuotes: (quotes) =>
        set((state) => ({
          quotes: {
            ...state.quotes,
            ...quotes,
          },
        })),
      setCustomMarkdown: (custom) =>
        set((state) => ({
          customMarkdown: {
            ...state.customMarkdown,
            ...custom,
          },
        })),
      setStandaloneVisitor: (visitor) =>
        set((state) => ({
          standaloneVisitor: {
            ...state.standaloneVisitor,
            ...visitor,
          },
        })),
      setFeaturedProjects: (projects) =>
        set((state) => ({
          featuredProjects: {
            ...state.featuredProjects,
            ...projects,
          },
        })),
      applyPreset: (presetName) =>
        set((state) => {
          const activeIds = PRESETS[presetName] || PRESETS.minimal;
          const updatedSections = { ...state.sections.sections };

          Object.keys(updatedSections).forEach((key) => {
            const sectionId = key as SectionId;
            updatedSections[sectionId] = {
              ...updatedSections[sectionId],
              enabled: activeIds.includes(sectionId),
            };
          });

          // Order active ids first, then inactive ones
          const newOrder = [
            ...activeIds,
            ...state.sections.order.filter((id) => !activeIds.includes(id)),
          ];

          return {
            sections: {
              sections: updatedSections,
              order: newOrder,
            },
          };
        }),
      applyTemplate: (template) =>
        set((state) => {
          const activeIds = template.sections || ['header', 'about', 'socials'];
          const updatedSections = { ...state.sections.sections };

          Object.keys(updatedSections).forEach((key) => {
            const sectionId = key as SectionId;
            updatedSections[sectionId] = {
              ...updatedSections[sectionId],
              enabled: activeIds.includes(sectionId),
            };
          });

          const newOrder = [
            ...activeIds,
            ...state.sections.order.filter((id) => !activeIds.includes(id)),
          ];

          return {
            sections: {
              sections: updatedSections,
              order: newOrder,
            },
            name: template.config.header.name || state.name,
            role: template.config.header.title || state.role,
            about: template.config.header.intro || state.about,
            header: {
              ...state.header,
              ...template.config.header,
              enabled: template.config.header.enabled,
            },
            githubStats: {
              ...state.githubStats,
              ...template.config.githubStats,
              enabled: template.config.githubStats.enabled,
            },
            techStack: {
              ...state.techStack,
              ...template.config.techStack,
              enabled: template.config.techStack.enabled,
            },
            socialLinks: {
              ...state.socialLinks,
              ...template.config.socialLinks,
              enabled: template.config.socialLinks.enabled,
            },
            achievements: {
              ...state.achievements,
              ...template.config.achievements,
              enabled: template.config.achievements.enabled,
            },
            quotes: {
              ...state.quotes,
              ...template.config.quotes,
              enabled: template.config.quotes?.enabled || false,
            },
          };
        }),
      importReadmeData: (importedData, selectedSectionIds) =>
        set((state) => {
          const updatedSections = { ...state.sections.sections };
          const activeIds = [...selectedSectionIds];

          // Enable/disable sections based on selection
          Object.keys(updatedSections).forEach((key) => {
            const sectionId = key as SectionId;
            updatedSections[sectionId] = {
              ...updatedSections[sectionId],
              enabled: activeIds.includes(sectionId),
            };
          });

          // Order selected ones first
          const newOrder = [
            ...activeIds,
            ...state.sections.order.filter((id) => !activeIds.includes(id)),
          ];

          const updates: any = {
            sections: {
              sections: updatedSections,
              order: newOrder,
            },
          };

          if (selectedSectionIds.includes('header')) {
            updates.name = importedData.name || state.name;
            updates.role = importedData.role || state.role;
            updates.about = importedData.about || state.about;
            updates.header = {
              ...state.header,
              ...importedData.header,
              enabled: true,
            };
          }

          if (selectedSectionIds.includes('about')) {
            updates.about = importedData.about || state.about;
          }

          if (selectedSectionIds.includes('socials')) {
            // Convert imported platforms format { enabled: true, value: '' } to matches
            const mergedPlatforms = { ...state.socialLinks.platforms };
            Object.keys(importedData.socialLinks.platforms).forEach((key) => {
              mergedPlatforms[key] = {
                enabled: true,
                value: importedData.socialLinks.platforms[key].value,
              };
            });
            updates.socialLinks = {
              ...state.socialLinks,
              ...importedData.socialLinks,
              platforms: mergedPlatforms,
              enabled: true,
            };
          }

          if (selectedSectionIds.includes('techStack')) {
            updates.techStack = {
              ...state.techStack,
              ...importedData.techStack,
              enabled: true,
            };
          }

          if (selectedSectionIds.includes('stats')) {
            updates.githubStats = {
              ...state.githubStats,
              ...importedData.githubStats,
              enabled: true,
            };
          }

          if (selectedSectionIds.includes('achievements')) {
            updates.achievements = {
              ...state.achievements,
              ...importedData.achievements,
              enabled: true,
            };
          }

          if (selectedSectionIds.includes('quotes')) {
            updates.quotes = {
              ...state.quotes,
              ...importedData.quotes,
              enabled: true,
            };
          }

          if (selectedSectionIds.includes('custom')) {
            updates.customMarkdown = {
              ...state.customMarkdown,
              ...importedData.customMarkdown,
              enabled: true,
            };
          }

          return updates;
        }),
      reset: () =>
        set({
          name: '',
          role: '',
          about: '',
          skills: '',
          projects: '',
          socials: '',
          avatarUrl: '',
          followers: undefined,
          following: undefined,
          publicRepos: undefined,
          template: 'minimal',
          readmeExportsCount: 0,
          templatesUsedCount: 0,
          exportHistory: [],
          repoAnalysis: null,
          aiSuggestions: null,
          aiGenerationsCount: 0,
          githubStats: { ...DEFAULT_GITHUB_STATS },
          techStack: { ...DEFAULT_TECH_STACK },
          socialLinks: { ...DEFAULT_SOCIAL_LINKS },
          achievements: { ...DEFAULT_ACHIEVEMENTS },
          header: { ...DEFAULT_HEADER },
          sections: { ...DEFAULT_SECTIONS },
          support: { ...DEFAULT_SUPPORT },
          quotes: { ...DEFAULT_QUOTES },
          customMarkdown: { ...DEFAULT_CUSTOM_MARKDOWN },
          standaloneVisitor: { ...DEFAULT_STANDALONE_VISITOR },
          featuredProjects: { ...DEFAULT_FEATURED_PROJECTS },
        }),
    }),
    { name: 'readme-store' }
  )
);

export default useREADMEStore;
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  | 'socialLinks';

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
        }),
    }),
    { name: 'readme-store' }
  )
);

export default useREADMEStore;
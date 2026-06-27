import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import useReadmeStore, { GitHubStatsConfig, TechStackConfig } from './readme-store';
import useRoadmapStore from './roadmap-store';
import useThemeStore from './theme-store';

export interface Workspace {
  id: string;
  name: string;
  type: 'readme' | 'roadmap' | 'combined';
  updatedAt: string;
  readmeData: {
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
    template: 'minimal' | 'professional' | 'developer' | 'open-source' | 'portfolio';
    repoAnalysis: any;
    aiSuggestions: any;
    aiGenerationsCount: number;
    githubStats: GitHubStatsConfig;
    techStack: TechStackConfig;
  };
  roadmapData: {
    title: string;
    steps: string[];
    template: string;
  };
  theme: 'minimal' | 'dark' | 'gradient' | 'terminal';
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  createWorkspace: (name: string, type: 'readme' | 'roadmap' | 'combined') => string;
  deleteWorkspace: (id: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  duplicateWorkspace: (id: string) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  updateActiveWorkspaceData: () => void;
  loadWorkspace: (id: string) => void;
  migrateLegacyData: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,

      createWorkspace: (name, type) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newWorkspace: Workspace = {
          id,
          name,
          type,
          updatedAt: new Date().toISOString(),
          readmeData: {
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
            repoAnalysis: null,
            aiSuggestions: null,
            aiGenerationsCount: 0,
            githubStats: {
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
            },
            techStack: {
              enabled: false,
              style: 'for-the-badge',
              iconOnly: false,
              groupByCategory: true,
              hideEmptyCategories: false,
              selectedIds: [],
            },
          },
          roadmapData: {
            title: '',
            steps: [],
            template: '',
          },
          theme: 'minimal',
        };

        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
          activeWorkspaceId: id,
        }));

        // Load it immediately into active stores
        get().loadWorkspace(id);
        return id;
      },

      deleteWorkspace: (id) => {
        const { workspaces, activeWorkspaceId } = get();
        const updated = workspaces.filter((w) => w.id !== id);
        set({ workspaces: updated });

        if (activeWorkspaceId === id) {
          if (updated.length > 0) {
            get().loadWorkspace(updated[0].id);
          } else {
            set({ activeWorkspaceId: null });
            useReadmeStore.getState().reset();
            useRoadmapStore.getState().reset();
            useThemeStore.setState({ theme: 'minimal' });
          }
        }
      },

      renameWorkspace: (id, name) => {
        set((state) => ({
          workspaces: state.workspaces.map((w) =>
            w.id === id ? { ...w, name, updatedAt: new Date().toISOString() } : w
          ),
        }));
      },

      duplicateWorkspace: (id) => {
        const { workspaces } = get();
        const source = workspaces.find((w) => w.id === id);
        if (!source) return;

        const newId = Math.random().toString(36).substring(2, 9);
        const copy: Workspace = {
          ...JSON.parse(JSON.stringify(source)),
          id: newId,
          name: `${source.name} (Copy)`,
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          workspaces: [...state.workspaces, copy],
        }));
      },

      setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),

      updateActiveWorkspaceData: () => {
        const { activeWorkspaceId, workspaces } = get();
        if (!activeWorkspaceId) return;

        const readme = useReadmeStore.getState();
        const roadmap = useRoadmapStore.getState();
        const theme = useThemeStore.getState().theme;

        const updatedWorkspaces = workspaces.map((w) => {
          if (w.id !== activeWorkspaceId) return w;
          return {
            ...w,
            updatedAt: new Date().toISOString(),
            readmeData: {
              name: readme.name,
              role: readme.role,
              about: readme.about,
              skills: readme.skills,
              projects: readme.projects,
              socials: readme.socials,
              avatarUrl: readme.avatarUrl,
              followers: readme.followers,
              following: readme.following,
              publicRepos: readme.publicRepos,
              template: readme.template,
              repoAnalysis: readme.repoAnalysis,
              aiSuggestions: readme.aiSuggestions,
              aiGenerationsCount: readme.aiGenerationsCount,
              githubStats: readme.githubStats,
              techStack: readme.techStack,
            },
            roadmapData: {
              title: roadmap.title,
              steps: roadmap.steps,
              template: roadmap.template,
            },
            theme,
          };
        });

        set({ workspaces: updatedWorkspaces });
      },

      loadWorkspace: (id) => {
        const { workspaces } = get();
        const workspace = workspaces.find((w) => w.id === id);
        if (!workspace) return;

        set({ activeWorkspaceId: id });

        useReadmeStore.setState({
          name: workspace.readmeData.name,
          role: workspace.readmeData.role,
          about: workspace.readmeData.about,
          skills: workspace.readmeData.skills,
          projects: workspace.readmeData.projects,
          socials: workspace.readmeData.socials,
          avatarUrl: workspace.readmeData.avatarUrl,
          followers: workspace.readmeData.followers,
          following: workspace.readmeData.following,
          publicRepos: workspace.readmeData.publicRepos,
          template: workspace.readmeData.template as any,
          repoAnalysis: workspace.readmeData.repoAnalysis,
          aiSuggestions: workspace.readmeData.aiSuggestions,
          aiGenerationsCount: workspace.readmeData.aiGenerationsCount || 0,
          githubStats: workspace.readmeData.githubStats || {
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
          },
          techStack: workspace.readmeData.techStack || {
            enabled: false,
            style: 'for-the-badge',
            iconOnly: false,
            groupByCategory: true,
            hideEmptyCategories: false,
            selectedIds: [],
          },
        });

        useRoadmapStore.setState({
          title: workspace.roadmapData.title,
          steps: workspace.roadmapData.steps,
          template: workspace.roadmapData.template,
        });

        useThemeStore.setState({
          theme: workspace.theme,
        });
      },

      migrateLegacyData: () => {
        const { workspaces } = get();
        if (workspaces.length > 0) return;

        const readme = useReadmeStore.getState();
        const roadmap = useRoadmapStore.getState();
        const theme = useThemeStore.getState().theme;

        const hasData = readme.name || readme.about || roadmap.title || roadmap.steps.length > 0;
        if (!hasData) return;

        const id = 'default-workspace';
        const legacyWorkspace: Workspace = {
          id,
          name: 'Default Workspace',
          type: 'combined',
          updatedAt: new Date().toISOString(),
          readmeData: {
            name: readme.name,
            role: readme.role,
            about: readme.about,
            skills: readme.skills,
            projects: readme.projects,
            socials: readme.socials,
            avatarUrl: readme.avatarUrl,
            followers: readme.followers,
            following: readme.following,
            publicRepos: readme.publicRepos,
            template: readme.template,
            repoAnalysis: readme.repoAnalysis,
            aiSuggestions: readme.aiSuggestions,
            aiGenerationsCount: readme.aiGenerationsCount,
            githubStats: readme.githubStats,
            techStack: readme.techStack,
          },
          roadmapData: {
            title: roadmap.title,
            steps: roadmap.steps,
            template: roadmap.template,
          },
          theme,
        };

        set({
          workspaces: [legacyWorkspace],
          activeWorkspaceId: id,
        });
      },
    }),
    { name: 'workspace-store' }
  )
);

// Helper for debouncing writes to localStorage / state updates
function debounce(fn: (...args: any[]) => void, delay: number) {
  let timeoutId: any;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const debouncedSave = debounce(() => {
  useWorkspaceStore.getState().updateActiveWorkspaceData();
}, 500);

if (typeof window !== 'undefined') {
  const save = () => {
    const activeId = useWorkspaceStore.getState().activeWorkspaceId;
    if (activeId) {
      debouncedSave();
    }
  };

  useReadmeStore.subscribe(save);
  useRoadmapStore.subscribe(save);
  useThemeStore.subscribe(save);
}

export default useWorkspaceStore;

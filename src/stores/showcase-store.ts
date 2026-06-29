import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { READMEStyleTemplate, GitHubStatsConfig, TechStackConfig, SocialLinksConfig } from './readme-store';

export type ShowcaseCategory =
  | 'minimal'
  | 'modern'
  | 'open-source'
  | 'frontend'
  | 'full-stack'
  | 'ai'
  | 'anime'
  | 'terminal'
  | 'gprm';

export interface Showcase {
  id: string;
  name: string;
  description: string;
  author: string;
  category: ShowcaseCategory;
  technologies: string[];
  likes: number;
  views: number;
  theme: 'minimal' | 'dark' | 'gradient' | 'terminal';
  config: {
    name: string;
    role: string;
    about: string;
    skills: string;
    projects: string;
    socials: string;
    avatarUrl: string;
    followers?: number;
    following?: number;
    publicRepos?: number;
    template: READMEStyleTemplate;
    githubStats: GitHubStatsConfig;
    techStack: TechStackConfig;
    socialLinks: SocialLinksConfig;
  };
  createdAt: string;
  isCustom?: boolean;
  isLiked?: boolean;
}

interface ShowcaseStore {
  showcases: Showcase[];
  addShowcase: (showcase: Omit<Showcase, 'id' | 'likes' | 'views' | 'createdAt' | 'isCustom'>) => void;
  deleteShowcase: (id: string) => void;
  likeShowcase: (id: string) => void;
  viewShowcase: (id: string) => void;
  importShowcases: (jsonContent: string) => { success: boolean; error?: string };
}

// ── Seed Showcase Profiles ──────────────────────────────────────────────────
const SEED_SHOWCASES: Showcase[] = [
  {
    id: 'show-ai-researcher',
    name: 'Neural Labs Profile',
    description: 'A deep-tech showcase layout for AI researchers featuring PyTorch setups and dark visual aesthetics.',
    author: 'evelyn_carter',
    category: 'ai',
    technologies: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI', 'HuggingFace'],
    likes: 245,
    views: 890,
    theme: 'dark',
    createdAt: '2026-06-20T10:00:00Z',
    config: {
      name: 'Dr. Evelyn Carter',
      role: 'Principal AI Researcher',
      about: 'Building large language models and cognitive agents at the intersection of reasoning and control.',
      skills: 'Python, PyTorch, JAX, HuggingFace, FastAPI, Docker, Kubernetes',
      projects: '🚀 **Cognitive-OS**: Reasoning loop framework for agent autonomy.\n📊 **LLM-Reasoning**: Fine-tuning setups for logical alignment.',
      socials: 'GitHub: @evelyn_carter | LinkedIn: /in/evelyn-carter',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      followers: 1240,
      following: 180,
      publicRepos: 45,
      template: 'professional',
      githubStats: {
        enabled: true,
        username: 'evelyn_carter',
        theme: 'tokyonight',
        hideBorder: false,
        showIcons: true,
        compactMode: true,
        layout: 'compact',
        cardOrder: ['stats', 'languages'],
        cardConfigs: { stats: { enabled: true }, languages: { enabled: true }, streak: { enabled: false } }
      },
      techStack: {
        enabled: true,
        style: 'flat-square',
        iconOnly: false,
        groupByCategory: true,
        hideEmptyCategories: false,
        selectedIds: ['python', 'docker']
      },
      socialLinks: {
        enabled: true,
        style: 'for-the-badge',
        iconOnly: true,
        platforms: {},
        order: ['github', 'linkedin']
      }
    }
  },
  {
    id: 'show-webgl-creative',
    name: 'Neon Interactive Studio',
    description: 'Designed for front-end developers focusing on visual excellence, Three.js, and neon elements.',
    author: 'visual_wizard',
    category: 'gprm',
    technologies: ['React', 'TypeScript', 'Three.js', 'WebGL', 'TailwindCSS'],
    likes: 189,
    views: 654,
    theme: 'gradient',
    createdAt: '2026-06-22T08:30:00Z',
    config: {
      name: 'Leon Vance',
      role: 'Creative Web Developer',
      about: 'Translating WebGL canvas structures into high-impact interactive portfolio layouts.',
      skills: 'React, TypeScript, Next.js, Three.js, WebGL, TailwindCSS, GLSL',
      projects: '✨ **Fluid-Canvas**: Dynamic GPU fluid solver running on HTML5 canvas.\n🎮 **Tiny-Universe**: 3D gravity orbits visualizer.',
      socials: 'GitHub: @visual_wizard | Twitter: @leon_vance',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      followers: 820,
      following: 340,
      publicRepos: 29,
      template: 'portfolio',
      githubStats: {
        enabled: true,
        username: 'visual_wizard',
        theme: 'radical',
        hideBorder: true,
        showIcons: true,
        compactMode: false,
        layout: 'default',
        cardOrder: ['stats', 'streak'],
        cardConfigs: { stats: { enabled: true }, languages: { enabled: false }, streak: { enabled: true } }
      },
      techStack: {
        enabled: true,
        style: 'for-the-badge',
        iconOnly: true,
        groupByCategory: false,
        hideEmptyCategories: false,
        selectedIds: ['react', 'typescript', 'tailwindcss']
      },
      socialLinks: {
        enabled: true,
        style: 'flat-square',
        iconOnly: false,
        platforms: {},
        order: ['github', 'x']
      }
    }
  },
  {
    id: 'show-minimal-engineer',
    name: 'Minimal Systems Profile',
    description: 'Clean design using typography. Excellent layout alignment for kernel and infrastructure engineers.',
    author: 'kernel_coder',
    category: 'minimal',
    technologies: ['Rust', 'Go', 'C++', 'Linux', 'WebAssembly'],
    likes: 312,
    views: 1204,
    theme: 'minimal',
    createdAt: '2026-06-18T14:20:00Z',
    config: {
      name: 'Alex Sterling',
      role: 'Systems Architect',
      about: 'Crafting slim operating frameworks and microsecond-latency APIs.',
      skills: 'Rust, Go, C/C++, Linux, eBPF, WebAssembly, Assembly',
      projects: '⚙️ **AeroFS**: Microsecond-latency filesystem helper.\n🦀 **BpfFilter**: High performance packet filter script.',
      socials: 'GitHub: @kernel_coder | Email: alex@sterling.dev',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      followers: 2450,
      following: 95,
      publicRepos: 78,
      template: 'minimal',
      githubStats: {
        enabled: false,
        username: 'kernel_coder',
        theme: 'default',
        hideBorder: false,
        showIcons: true,
        compactMode: false,
        layout: 'default',
        cardOrder: [],
        cardConfigs: { stats: { enabled: false }, languages: { enabled: false }, streak: { enabled: false } }
      },
      techStack: {
        enabled: false,
        style: 'flat',
        iconOnly: false,
        groupByCategory: true,
        hideEmptyCategories: false,
        selectedIds: []
      },
      socialLinks: {
        enabled: true,
        style: 'flat',
        iconOnly: false,
        platforms: {},
        order: ['github', 'email']
      }
    }
  }
];

export const useShowcaseStore = create<ShowcaseStore>()(
  persist(
    (set, get) => ({
      showcases: SEED_SHOWCASES,

      addShowcase: (showcaseData) => {
        const newShowcase: Showcase = {
          ...showcaseData,
          id: `show-${Math.random().toString(36).substring(2, 9)}`,
          likes: 0,
          views: 0,
          createdAt: new Date().toISOString(),
          isCustom: true,
        };
        set((state) => ({
          showcases: [newShowcase, ...state.showcases],
        }));
      },

      deleteShowcase: (id) => {
        set((state) => ({
          showcases: state.showcases.filter((show) => show.id !== id || !show.isCustom),
        }));
      },

      likeShowcase: (id) => {
        set((state) => ({
          showcases: state.showcases.map((show) => {
            if (show.id !== id) return show;
            const isLiked = !show.isLiked;
            return {
              ...show,
              isLiked,
              likes: isLiked ? show.likes + 1 : Math.max(0, show.likes - 1),
            };
          }),
        }));
      },

      viewShowcase: (id) => {
        set((state) => ({
          showcases: state.showcases.map((show) => {
            if (show.id !== id) return show;
            return {
              ...show,
              views: show.views + 1,
            };
          }),
        }));
      },

      importShowcases: (jsonContent) => {
        try {
          const parsed = JSON.parse(jsonContent);
          const list = Array.isArray(parsed) ? parsed : [parsed];

          const importedShowcases: Showcase[] = [];

          for (const item of list) {
            if (!item.name || !item.category || !item.config) {
              return { success: false, error: 'Invalid schema. Missing name, category, or config.' };
            }

            const allowedCategories: ShowcaseCategory[] = [
              'minimal', 'modern', 'open-source', 'frontend', 'full-stack', 'ai', 'anime', 'terminal', 'gprm'
            ];
            if (!allowedCategories.includes(item.category)) {
              return { success: false, error: `Invalid category: ${item.category}` };
            }

            importedShowcases.push({
              id: item.id || `show-${Math.random().toString(36).substring(2, 9)}`,
              name: item.name,
              description: item.description || 'Imported Showcase',
              author: item.author || 'Anonymous',
              category: item.category,
              technologies: Array.isArray(item.technologies) ? item.technologies : [],
              likes: item.likes || 0,
              views: item.views || 0,
              theme: item.theme || 'minimal',
              config: item.config,
              createdAt: item.createdAt || new Date().toISOString(),
              isCustom: true,
            });
          }

          set((state) => {
            const importedIds = importedShowcases.map((s) => s.id);
            const filtered = state.showcases.filter((s) => !importedIds.includes(s.id));
            return {
              showcases: [...importedShowcases, ...filtered],
            };
          });

          return { success: true };
        } catch (e: any) {
          return { success: false, error: e.message || 'JSON parsing failed' };
        }
      },
    }),
    {
      name: 'readme-showcase-store',
    }
  )
);

import { SectionId } from '@/stores/readme-store';

export type TemplateCategory =
  | 'minimal'
  | 'modern'
  | 'open-source'
  | 'full-stack'
  | 'frontend'
  | 'ai'
  | 'terminal'
  | 'gprm'
  | 'anime';

export interface MarketplaceTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  imageUrl: string; // Absolute path to generated images or placeholders
  sections: SectionId[];
  theme: 'minimal' | 'dark' | 'gradient' | 'terminal';
  config: {
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
      platforms: Record<string, string>;
    };
    achievements: {
      enabled: boolean;
      widgets: {
        trophy: { enabled: boolean; theme: string; noFrame: boolean; noBg: boolean };
        visitor: { enabled: boolean; color: string; style: string };
        snake: { enabled: boolean };
        graph: { enabled: boolean; theme: string; hideBorder: boolean };
      };
    };
    quotes: {
      enabled: boolean;
      theme: string;
      quoteType: 'programming' | 'general' | 'anime';
    };
  };
}

export const TEMPLATE_MARKETPLACE: MarketplaceTemplate[] = [
  {
    id: 'tpl-minimal',
    name: 'Minimalist Clean Profile',
    category: 'minimal',
    description: 'A clean, typography-focused layout with only essential sections.',
    imageUrl: '/placeholder-minimal.png',
    sections: ['header', 'about', 'socials'],
    theme: 'minimal',
    config: {
      header: {
        enabled: true,
        name: 'John Doe',
        title: 'Software Architect',
        intro: 'Pragmatic programmer crafting clean code and robust microservices.',
        pronouns: 'he/him',
        location: 'San Francisco, CA',
        alignment: 'left',
        bannerType: 'none',
        bannerTheme: 'default',
        bannerText: '',
        typingEnabled: false,
        typingLines: [],
        typingSpeed: 200,
        typingDelay: 1000,
        typingColor: '36BCF7',
        typingCenter: false,
        badges: { openToWork: true, freelance: false, learning: '', building: '' },
        visitorPlacement: 'hidden',
      },
      githubStats: { enabled: false, theme: 'default', hideBorder: false, showIcons: true, compactMode: false, layout: 'default' },
      techStack: { enabled: false, style: 'flat', iconOnly: false, groupByCategory: true, selectedIds: [] },
      socialLinks: { enabled: true, style: 'flat', iconOnly: false, platforms: { linkedin: 'https://linkedin.com/in/johndoe', github: 'https://github.com/johndoe' } },
      achievements: {
        enabled: false,
        widgets: {
          trophy: { enabled: false, theme: 'flat', noFrame: true, noBg: true },
          visitor: { enabled: false, color: 'green', style: 'flat' },
          snake: { enabled: false },
          graph: { enabled: false, theme: 'github', hideBorder: true }
        }
      },
      quotes: { enabled: false, theme: 'default', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-modern',
    name: 'Modern Executive Workspace',
    category: 'modern',
    description: 'High impact developer layout featuring rich statistics cards and project views.',
    imageUrl: '/placeholder-modern.png',
    sections: ['header', 'about', 'techStack', 'stats', 'projects', 'socials'],
    theme: 'dark',
    config: {
      header: {
        enabled: true,
        name: 'Alex Rivera',
        title: 'Full Stack Engineer',
        intro: 'Translating complex requirements into beautiful, interactive web user experiences.',
        pronouns: 'they/them',
        location: 'New York, NY',
        alignment: 'center',
        bannerType: 'gradient',
        bannerTheme: 'tokyonight',
        bannerText: 'Welcome to my GitHub Workspace',
        typingEnabled: true,
        typingLines: ['React & Next.js Specialist', 'UI/UX Enthusiast', 'Open Source Contributor'],
        typingSpeed: 150,
        typingDelay: 800,
        typingColor: 'a855f7',
        typingCenter: true,
        badges: { openToWork: false, freelance: true, learning: 'Three.js', building: 'OwlRoadmap' },
        visitorPlacement: 'bottom',
      },
      githubStats: { enabled: true, theme: 'tokyonight', hideBorder: false, showIcons: true, compactMode: false, layout: 'default' },
      techStack: { enabled: true, style: 'flat-square', iconOnly: false, groupByCategory: true, selectedIds: ['javascript', 'typescript', 'react', 'nextjs', 'tailwind', 'nodejs'] },
      socialLinks: { enabled: true, style: 'flat-square', iconOnly: true, platforms: { linkedin: 'https://linkedin.com', github: 'https://github.com', x: 'https://x.com' } },
      achievements: {
        enabled: false,
        widgets: {
          trophy: { enabled: true, theme: 'tokyonight', noFrame: false, noBg: false },
          visitor: { enabled: true, color: 'a855f7', style: 'flat' },
          snake: { enabled: false },
          graph: { enabled: true, theme: 'tokyonight', hideBorder: false }
        }
      },
      quotes: { enabled: false, theme: 'default', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-open-source',
    name: 'Open Source Community Champion',
    category: 'open-source',
    description: 'Designed for maintainers and active contributors with graph metrics and trophies.',
    imageUrl: '/placeholder-opensource.png',
    sections: ['header', 'about', 'achievements', 'techStack', 'projects'],
    theme: 'gradient',
    config: {
      header: {
        enabled: true,
        name: 'Sarah Chen',
        title: 'Open Source Maintainer',
        intro: 'Building the future of open web technologies, one pull request at a time.',
        pronouns: 'she/her',
        location: 'Vancouver, BC',
        alignment: 'center',
        bannerType: 'wave',
        bannerTheme: 'ocean',
        bannerText: 'SARAH CHEN // OPEN SOURCE',
        typingEnabled: false,
        typingLines: [],
        typingSpeed: 200,
        typingDelay: 1000,
        typingColor: '3b82f6',
        typingCenter: true,
        badges: { openToWork: false, freelance: false, learning: 'Rust FFI', building: 'WebAssembly UI' },
        visitorPlacement: 'top',
      },
      githubStats: { enabled: true, theme: 'radical', hideBorder: true, showIcons: true, compactMode: true, layout: 'compact' },
      techStack: { enabled: true, style: 'for-the-badge', iconOnly: true, groupByCategory: false, selectedIds: ['typescript', 'rust', 'go', 'docker', 'git', 'github'] },
      socialLinks: { enabled: true, style: 'for-the-badge', iconOnly: false, platforms: { github: 'https://github.com' } },
      achievements: {
        enabled: true,
        widgets: {
          trophy: { enabled: true, theme: 'radical', noFrame: false, noBg: false },
          visitor: { enabled: true, color: '3b82f6', style: 'for-the-badge' },
          snake: { enabled: true },
          graph: { enabled: true, theme: 'github', hideBorder: false }
        }
      },
      quotes: { enabled: false, theme: 'default', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-fullstack',
    name: 'Full Stack Master Layout',
    category: 'full-stack',
    description: 'A comprehensive layout covering frontend, backend, databases, and deployment stacks.',
    imageUrl: '/placeholder-fullstack.png',
    sections: ['header', 'about', 'techStack', 'projects', 'support', 'visitor'],
    theme: 'dark',
    config: {
      header: {
        enabled: true,
        name: 'Marcus Vance',
        title: 'Senior Full Stack Developer',
        intro: 'Crafting production-ready cloud architectures and pixel-perfect applications.',
        pronouns: 'he/him',
        location: 'Austin, TX',
        alignment: 'left',
        bannerType: 'gradient',
        bannerTheme: 'dracula',
        bannerText: 'Marcus Vance // Full Stack',
        typingEnabled: true,
        typingLines: ['Node.js & Go Backend Microservices', 'React & Vue Frontend Engineering', 'Docker & Kubernetes DevOps'],
        typingSpeed: 100,
        typingDelay: 1200,
        typingColor: '50fa7b',
        typingCenter: false,
        badges: { openToWork: true, freelance: true, learning: 'Kubernetes Operator', building: 'SaaS Architecture' },
        visitorPlacement: 'bottom',
      },
      githubStats: { enabled: true, theme: 'dracula', hideBorder: false, showIcons: true, compactMode: false, layout: 'default' },
      techStack: { enabled: true, style: 'flat-square', iconOnly: false, groupByCategory: true, selectedIds: ['typescript', 'python', 'go', 'react', 'nodejs', 'fastapi', 'postgresql', 'mongodb', 'docker', 'aws'] },
      socialLinks: { enabled: true, style: 'flat-square', iconOnly: true, platforms: { linkedin: 'https://linkedin.com', github: 'https://github.com', stackoverflow: 'https://stackoverflow.com' } },
      achievements: {
        enabled: false,
        widgets: {
          trophy: { enabled: false, theme: 'flat', noFrame: false, noBg: false },
          visitor: { enabled: true, color: '50fa7b', style: 'flat-square' },
          snake: { enabled: false },
          graph: { enabled: false, theme: 'github', hideBorder: false }
        }
      },
      quotes: { enabled: false, theme: 'default', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-frontend',
    name: 'Frontend Creative Showcase',
    category: 'frontend',
    description: 'Visually rich portfolio focused on styling, interactive tools, and layout aesthetics.',
    imageUrl: '/placeholder-frontend.png',
    sections: ['header', 'about', 'techStack', 'projects', 'socials'],
    theme: 'gradient',
    config: {
      header: {
        enabled: true,
        name: 'Elena Rostova',
        title: 'Creative Frontend Developer',
        intro: 'Obsessed with color palettes, animations, layout architecture, and user joy.',
        pronouns: 'she/her',
        location: 'Paris, France',
        alignment: 'center',
        bannerType: 'capsule',
        bannerTheme: 'tokyonight',
        bannerText: 'Elena // Design & Code',
        typingEnabled: true,
        typingLines: ['Obsessed with CSS animations', 'WebGL, Canvas & Three.js specialist', 'Figma to React workflow wizard'],
        typingSpeed: 140,
        typingDelay: 700,
        typingColor: 'f43f5e',
        typingCenter: true,
        badges: { openToWork: false, freelance: true, learning: 'WebGPU', building: 'Creative Portfolio' },
        visitorPlacement: 'bottom',
      },
      githubStats: { enabled: true, theme: 'tokyonight', hideBorder: false, showIcons: true, compactMode: false, layout: 'languages' },
      techStack: { enabled: true, style: 'for-the-badge', iconOnly: false, groupByCategory: true, selectedIds: ['javascript', 'typescript', 'react', 'vue', 'tailwind', 'figma', 'postman'] },
      socialLinks: { enabled: true, style: 'for-the-badge', iconOnly: true, platforms: { linkedin: 'https://linkedin.com', github: 'https://github.com', devto: 'https://dev.to' } },
      achievements: {
        enabled: false,
        widgets: {
          trophy: { enabled: false, theme: 'flat', noFrame: false, noBg: false },
          visitor: { enabled: true, color: 'f43f5e', style: 'for-the-badge' },
          snake: { enabled: false },
          graph: { enabled: false, theme: 'github', hideBorder: false }
        }
      },
      quotes: { enabled: false, theme: 'default', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-ai',
    name: 'AI & Machine Learning Architect',
    category: 'ai',
    description: 'Highlighted AI stacks, python models, and deep learning research frameworks.',
    imageUrl: '/placeholder-ai.png',
    sections: ['header', 'about', 'techStack', 'projects', 'quotes'],
    theme: 'dark',
    config: {
      header: {
        enabled: true,
        name: 'Dr. Aaron Patel',
        title: 'Machine Learning Scientist',
        intro: 'Training LLMs, fine-tuning diffusion models, and writing optimized CUDA kernels.',
        pronouns: 'he/him',
        location: 'London, UK',
        alignment: 'left',
        bannerType: 'gradient',
        bannerTheme: 'radical',
        bannerText: 'DR. AARON PATEL // AI RESEARCH',
        typingEnabled: true,
        typingLines: ['Large Language Models (LLMs)', 'PyTorch & TensorFlow Pipelines', 'Deep Reinforcement Learning'],
        typingSpeed: 110,
        typingDelay: 900,
        typingColor: '3b82f6',
        typingCenter: false,
        badges: { openToWork: false, freelance: false, learning: 'Triton DSL', building: 'Agentic Workflows' },
        visitorPlacement: 'hidden',
      },
      githubStats: { enabled: true, theme: 'radical', hideBorder: false, showIcons: true, compactMode: false, layout: 'default' },
      techStack: { enabled: true, style: 'flat-square', iconOnly: false, groupByCategory: true, selectedIds: ['python', 'cpp', 'postgresql', 'docker', 'aws', 'git'] },
      socialLinks: { enabled: true, style: 'flat-square', iconOnly: true, platforms: { github: 'https://github.com', linkedin: 'https://linkedin.com' } },
      achievements: {
        enabled: false,
        widgets: {
          trophy: { enabled: false, theme: 'flat', noFrame: false, noBg: false },
          visitor: { enabled: false, color: 'blue', style: 'flat' },
          snake: { enabled: false },
          graph: { enabled: false, theme: 'github', hideBorder: false }
        }
      },
      quotes: { enabled: true, theme: 'radical', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-terminal',
    name: 'Retro Terminal Console',
    category: 'terminal',
    description: 'Monospaced shell syntax style with customized plastic badges and neon themes.',
    imageUrl: '/placeholder-terminal.png',
    sections: ['header', 'about', 'techStack', 'stats', 'visitor'],
    theme: 'terminal',
    config: {
      header: {
        enabled: true,
        name: 'root@developer:~$',
        title: './run_compiler.sh --all',
        intro: 'systemctl start developer-session.service // System initialization successful.',
        pronouns: 'it/its',
        location: '127.0.0.1',
        alignment: 'left',
        bannerType: 'none',
        bannerTheme: 'default',
        bannerText: '',
        typingEnabled: true,
        typingLines: ['Initializing bash console...', 'Executing python suggested_ai.py', 'Ready.'],
        typingSpeed: 100,
        typingDelay: 1500,
        typingColor: '39ff14',
        typingCenter: false,
        badges: { openToWork: false, freelance: false, learning: 'Assembly', building: 'OS Kernel' },
        visitorPlacement: 'bottom',
      },
      githubStats: { enabled: true, theme: 'tokyonight', hideBorder: false, showIcons: true, compactMode: false, layout: 'default' },
      techStack: { enabled: true, style: 'plastic', iconOnly: true, groupByCategory: false, selectedIds: ['python', 'go', 'git', 'github'] },
      socialLinks: { enabled: true, style: 'plastic', iconOnly: false, platforms: { github: 'https://github.com' } },
      achievements: {
        enabled: false,
        widgets: {
          trophy: { enabled: false, theme: 'flat', noFrame: false, noBg: false },
          visitor: { enabled: true, color: '39ff14', style: 'plastic' },
          snake: { enabled: false },
          graph: { enabled: false, theme: 'github', hideBorder: false }
        }
      },
      quotes: { enabled: false, theme: 'default', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-gprm',
    name: 'GPRM Classic Template',
    category: 'gprm',
    description: 'Visual copy of the classic GPRM layout featuring rich shields badges and header options.',
    imageUrl: '/placeholder-gprm.png',
    sections: ['header', 'about', 'socials', 'techStack', 'stats', 'achievements', 'visitor'],
    theme: 'dark',
    config: {
      header: {
        enabled: true,
        name: 'GPRM User',
        title: 'Open Source Developer',
        intro: 'A visual profile template styled similarly to the classic GitHub Profile README Generator.',
        pronouns: '',
        location: 'Internet',
        alignment: 'center',
        bannerType: 'capsule',
        bannerTheme: 'gradient',
        bannerText: 'GPRM PROFILE README',
        typingEnabled: true,
        typingLines: ['Visual README layouts', 'Shields.io badges', 'GitHub statistics cards'],
        typingSpeed: 120,
        typingDelay: 1000,
        typingColor: '0078d7',
        typingCenter: true,
        badges: { openToWork: true, freelance: false, learning: '', building: '' },
        visitorPlacement: 'bottom',
      },
      githubStats: { enabled: true, theme: 'default', hideBorder: false, showIcons: true, compactMode: false, layout: 'default' },
      techStack: { enabled: true, style: 'for-the-badge', iconOnly: false, groupByCategory: true, selectedIds: ['javascript', 'typescript', 'react', 'nodejs', 'git', 'github'] },
      socialLinks: { enabled: true, style: 'for-the-badge', iconOnly: false, platforms: { github: 'https://github.com', linkedin: 'https://linkedin.com' } },
      achievements: {
        enabled: true,
        widgets: {
          trophy: { enabled: true, theme: 'flat', noFrame: false, noBg: false },
          visitor: { enabled: true, color: '0078d7', style: 'for-the-badge' },
          snake: { enabled: false },
          graph: { enabled: true, theme: 'github', hideBorder: false }
        }
      },
      quotes: { enabled: false, theme: 'default', quoteType: 'programming' }
    }
  },
  {
    id: 'tpl-anime',
    name: 'Colorful Anime Aesthetic',
    category: 'anime',
    description: 'Vibrant neon overlays, playful emojis, capsule layouts, and interactive panels.',
    imageUrl: '/placeholder-anime.png',
    sections: ['header', 'about', 'quotes', 'socials', 'techStack'],
    theme: 'gradient',
    config: {
      header: {
        enabled: true,
        name: 'Sakura Developer 🌸',
        title: 'Kawaii Tech Creator',
        intro: 'Building colorful frontend pipelines and exploring cyber aesthetics! 💫',
        pronouns: 'she/they',
        location: 'Neo-Tokyo',
        alignment: 'center',
        bannerType: 'capsule',
        bannerTheme: 'tokyonight',
        bannerText: '✨ CYBERPUNK SAKURA ✨',
        typingEnabled: true,
        typingLines: ['Coding under the cherry blossoms 🌸', 'Designing colorful kawaii user interfaces 🎨', 'Playing cozy indie games 🎮'],
        typingSpeed: 180,
        typingDelay: 900,
        typingColor: 'ff007f',
        typingCenter: true,
        badges: { openToWork: false, freelance: true, learning: 'Three.js Shaders', building: 'Anime Registry UI' },
        visitorPlacement: 'bottom',
      },
      githubStats: { enabled: false, theme: 'dracula', hideBorder: false, showIcons: true, compactMode: false, layout: 'default' },
      techStack: { enabled: true, style: 'flat-square', iconOnly: false, groupByCategory: false, selectedIds: ['typescript', 'react', 'tailwind', 'figma'] },
      socialLinks: { enabled: true, style: 'flat-square', iconOnly: true, platforms: { github: 'https://github.com', discord: 'https://discord.com' } },
      achievements: {
        enabled: false,
        widgets: {
          trophy: { enabled: false, theme: 'flat', noFrame: false, noBg: false },
          visitor: { enabled: false, color: 'ff007f', style: 'flat' },
          snake: { enabled: false },
          graph: { enabled: false, theme: 'github', hideBorder: false }
        }
      },
      quotes: { enabled: true, theme: 'tokyonight', quoteType: 'anime' }
    }
  }
];

export interface ReadmeSuggestions {
  aboutMe: string;
  introduction: string;
  skills: string;
  projects: string;
}

export interface RoadmapSuggestions {
  nextTopics: string[];
  technologies: string[];
  roadmapSteps: string[];
}

export interface ProfileSuggestions {
  improvedBio: string;
  portfolioDescription: string;
  githubImprovements: string[];
}

export interface ImproveSuggestions {
  alternatives: string[];
}

export interface AIService {
  generateReadmeSuggestions(profileData: any, repoData: any): Promise<ReadmeSuggestions>;
  generateRoadmapSuggestions(roadmapTitle: string, currentSteps: string[]): Promise<RoadmapSuggestions>;
  generateProfileSuggestions(profileData: any, repoData: any): Promise<ProfileSuggestions>;
  improveText(text: string, tone: string, type: string): Promise<ImproveSuggestions>;
}

/**
 * Local AI Assistant implementation.
 * Uses rules and repository statistics to dynamically synthesize suggestions.
 */
export class DynamicLocalAIService implements AIService {
  async generateReadmeSuggestions(profileData: any, repoData: any): Promise<ReadmeSuggestions> {
    const name = profileData.name || 'Developer';
    const role = profileData.role || 'Software Engineer';
    const primaryLang = repoData?.languages?.[0]?.name || 'TypeScript/JavaScript';
    const secondaryLang = repoData?.languages?.[1]?.name || 'CSS/HTML';
    const featuredRepo = repoData?.topStarred?.[0]?.name || 'my-project';

    return {
      introduction: `👋 Hi, I'm **${name}**, a passionate **${role}** dedicated to building maintainable, high-quality codebases.`,
      aboutMe: `🚀 I focus on engineering web tools and application backends. Most of my projects utilize **${primaryLang}** as my core stack, occasionally writing **${secondaryLang}** interfaces. I'm actively developing open-source projects like \`${featuredRepo}\`.`,
      skills: `${primaryLang}, ${secondaryLang}, React, Next.js, Node.js, REST APIs, Git, Docker, UI/UX Design`,
      projects: `### Featured Projects\n\n1. **${featuredRepo}**\n   - A modern developer tool designed to optimize workspace performance.\n   - Tech stack: ${primaryLang}, React.\n   - Key features: Highly responsive layouts, custom themes.`,
    };
  }

  async generateRoadmapSuggestions(roadmapTitle: string, currentSteps: string[]): Promise<RoadmapSuggestions> {
    const titleLower = (roadmapTitle || '').toLowerCase();

    let nextTopics = ['Advanced Software Architectures', 'Design Patterns & Principles', 'Scalability & Load Balancing'];
    let technologies = ['Docker', 'Kubernetes', 'GitHub Actions', 'TypeScript'];
    let roadmapSteps = ['Learn Core Language Fundamentals', 'Build real-world application pipelines', 'Establish testing and automated deployment'];

    if (titleLower.includes('frontend') || titleLower.includes('react')) {
      nextTopics = ['State Management (Zustand / Redux)', 'Server-Side Rendering (Next.js)', 'Web Vitals & Performance Optimization', 'Advanced Testing (Cypress / Playwright)'];
      technologies = ['Next.js', 'Tailwind CSS', 'TypeScript', 'Zustand', 'React Query'];
      roadmapSteps = ['Master functional React components and Hooks', 'Build server-rendered websites using Next.js App Router', 'Integrate complex client-side caching', 'Deploy optimized builds on edge networks'];
    } else if (titleLower.includes('backend') || titleLower.includes('node')) {
      nextTopics = ['SQL Query Indexing and Optimization', 'Microservices Architecture & API Gateways', 'Event-Driven Architectures (Kafka / RabbitMQ)', 'Secure Token-based Authentications'];
      technologies = ['Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL'];
      roadmapSteps = ['Create secure RESTful backends using Express', 'Design optimized relational database schemas', 'Configure Redis caching to mitigate server load', 'Containerize web apps via docker environments'];
    } else if (titleLower.includes('devops')) {
      nextTopics = ['Infrastructure as Code (Terraform)', 'Container Scheduling & Orchestration', 'Log aggregation & Dashboarding', 'CI/CD pipeline automation'];
      technologies = ['Terraform', 'Kubernetes', 'GitHub Actions', 'AWS', 'Docker', 'Prometheus'];
      roadmapSteps = ['Establish automated deployment workflows', 'Manage infrastructure via declarative Terraform manifests', 'Set up high-availability container scheduling', 'Configure log monitoring and alerts'];
    }

    return { nextTopics, technologies, roadmapSteps };
  }

  async generateProfileSuggestions(profileData: any, repoData: any): Promise<ProfileSuggestions> {
    const role = profileData.role || 'Software Developer';
    const primaryLang = repoData?.languages?.[0]?.name || 'TypeScript';
    const followers = profileData.followers || 0;
    const reposCount = repoData?.languages?.length || 0;

    const githubImprovements = [];
    if (!profileData.bio) {
      githubImprovements.push('Add a short tagline/bio outlining your technical specialization.');
    }
    if (reposCount < 3) {
      githubImprovements.push('Publish additional repositories showing practical applications.');
    }
    if (followers < 5) {
      githubImprovements.push('Share projects on developer platforms to grow network connections.');
    }
    if (githubImprovements.length === 0) {
      githubImprovements.push('Pin your top starred repositories and configure a profile README.');
    }

    return {
      improvedBio: `🚀 ${role} | Building open-source tools with ${primaryLang} | Eager to learn and collaborate.`,
      portfolioDescription: `Hello! I am a ${role} focused on writing clean, accessible, and scalable code. Take a look at my starred repositories to explore my projects.`,
      githubImprovements,
    };
  }

  async improveText(text: string, tone: string, type: string): Promise<ImproveSuggestions> {
    const cleaned = text ? text.trim() : '';
    const base = cleaned || `Developer building modern software solutions.`;

    let alternatives: string[] = [];
    if (tone === 'More professional') {
      alternatives = [
        `Experienced software engineer focused on designing clean, maintainable, and robust systems.`,
        `Professional developer specializing in building optimized applications and scalable technical solutions.`,
        `Technical lead dedicated to engineering high-performance software with modern development practices.`,
      ];
    } else if (tone === 'More concise') {
      alternatives = [
        `Software engineer building clean and efficient web applications.`,
        `Developer focused on performance, modular design, and robust code.`,
        `Full-stack developer engineering modern technical web solutions.`,
      ];
    } else if (tone === 'More technical') {
      alternatives = [
        `Full-stack engineer optimizing database schema performance, latency profiling, and microservice architectures.`,
        `Software architect building modular components, CI/CD automated deployments, and reactive state nodes.`,
        `Technical developer implementing secure APIs, type-safe structures, and high-performance algorithms.`,
      ];
    } else if (tone === 'More beginner-friendly') {
      alternatives = [
        `Friendly coder who loves building websites and helping people learn tech skills.`,
        `Web designer creating simple, beautiful, and easy-to-use software applications.`,
        `Software enthusiast making coding simple and accessible for everyone.`,
      ];
    } else if (tone === 'Open-source focused') {
      alternatives = [
        `Open-source contributor building collaborative tools and sharing code with the global community.`,
        `Active open-source developer maintaining packages, reviewing PRs, and fostering documentation.`,
        `FOSS advocate engineering developer utilities and modular public code repositories.`,
      ];
    } else if (tone === 'Job-seeking focused') {
      alternatives = [
        `Results-driven software developer with hands-on experience, seeking engineering roles to deliver business value.`,
        `Passionate engineer looking to join a high-performing product team to scale technical systems.`,
        `Active candidate specializing in typescript systems engineering, looking for developer opportunities.`,
      ];
    } else { // Portfolio focused / fallback
      alternatives = [
        `Check out my featured portfolio showcase highlighting engineering designs.`,
        `Portfolio project showcase highlighting responsive layouts and scalable architectures.`,
        `Curated workspace repository demonstrating code architecture, test coverage, and documentation.`,
      ];
    }

    // Adapt slightly to type
    alternatives = alternatives.map(alt => {
      if (type === 'title') {
        return alt.substring(0, 50);
      }
      return alt;
    });

    return { alternatives };
  }
}

/**
 * Secure Server-Routed AI Service.
 * Proxies queries to /api/ai to protect the Gemini API Key.
 * Falls back to DynamicLocalAIService if the server has no key or fails.
 */
export class SecureAPIAIService implements AIService {
  private localService = new DynamicLocalAIService();

  private async callSecureAPI(action: string, payload: any): Promise<any> {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.useLocalFallback) {
        throw new Error('FALLBACK_TRIGGERED');
      }
      throw new Error(data.error || 'Failed secure API call');
    }

    const result = await res.json();
    if (result.data) {
      return result.data;
    }

    if (result.useLocalFallback) {
      throw new Error('FALLBACK_TRIGGERED');
    }

    throw new Error(result.error || 'Invalid API response format');
  }

  async generateReadmeSuggestions(profileData: any, repoData: any): Promise<ReadmeSuggestions> {
    try {
      return await this.callSecureAPI('readme', { profileData, repoData });
    } catch (err: any) {
      console.warn('Secure AI README suggestion call failed. Falling back to local analyzer.', err);
      return this.localService.generateReadmeSuggestions(profileData, repoData);
    }
  }

  async generateRoadmapSuggestions(roadmapTitle: string, currentSteps: string[]): Promise<RoadmapSuggestions> {
    try {
      return await this.callSecureAPI('roadmap', { roadmapTitle, currentSteps });
    } catch (err: any) {
      console.warn('Secure AI Roadmap suggestion call failed. Falling back to local analyzer.', err);
      return this.localService.generateRoadmapSuggestions(roadmapTitle, currentSteps);
    }
  }

  async generateProfileSuggestions(profileData: any, repoData: any): Promise<ProfileSuggestions> {
    try {
      return await this.callSecureAPI('profile', { profileData, repoData });
    } catch (err: any) {
      console.warn('Secure AI Profile suggestion call failed. Falling back to local analyzer.', err);
      return this.localService.generateProfileSuggestions(profileData, repoData);
    }
  }

  async improveText(text: string, tone: string, type: string): Promise<ImproveSuggestions> {
    try {
      return await this.callSecureAPI('improve', { text, tone, type });
    } catch (err: any) {
      console.warn('Secure AI rewrite suggestion call failed. Falling back to local analyzer.', err);
      return this.localService.improveText(text, tone, type);
    }
  }
}

/**
 * Service factory that returns the secure API proxy service.
 */
export function getAIService(): AIService {
  return new SecureAPIAIService();
}

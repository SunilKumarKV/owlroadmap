export interface Technology {
  id: string;
  name: string;
  category: 'Languages' | 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Tools';
  color: string; // hex color without #
  logo: string; // shields.io logo query value
  logoColor: string; // color name or hex
}

export const TECHNOLOGY_REGISTRY: Technology[] = [
  // 1. Languages
  { id: 'javascript', name: 'JavaScript', category: 'Languages', color: 'F7DF1E', logo: 'javascript', logoColor: 'black' },
  { id: 'typescript', name: 'TypeScript', category: 'Languages', color: '3178C6', logo: 'typescript', logoColor: 'white' },
  { id: 'python', name: 'Python', category: 'Languages', color: '3776AB', logo: 'python', logoColor: 'white' },
  { id: 'java', name: 'Java', category: 'Languages', color: '007396', logo: 'openjdk', logoColor: 'white' },
  { id: 'cpp', name: 'C++', category: 'Languages', color: '00599C', logo: 'c%2B%2B', logoColor: 'white' },
  { id: 'go', name: 'Go', category: 'Languages', color: '00ADD8', logo: 'go', logoColor: 'white' },
  { id: 'rust', name: 'Rust', category: 'Languages', color: '000000', logo: 'rust', logoColor: 'white' },

  // 2. Frontend
  { id: 'react', name: 'React', category: 'Frontend', color: '20232A', logo: 'react', logoColor: '61DAFB' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', color: '000000', logo: 'nextdotjs', logoColor: 'white' },
  { id: 'vue', name: 'Vue.js', category: 'Frontend', color: '35495E', logo: 'vuedotjs', logoColor: '4FC08D' },
  { id: 'angular', name: 'Angular', category: 'Frontend', color: 'DD0031', logo: 'angular', logoColor: 'white' },
  { id: 'tailwindcss', name: 'Tailwind CSS', category: 'Frontend', color: '0F172A', logo: 'tailwindcss', logoColor: '38B2AC' },
  { id: 'redux', name: 'Redux', category: 'Frontend', color: '764ABC', logo: 'redux', logoColor: 'white' },

  // 3. Backend
  { id: 'nodejs', name: 'Node.js', category: 'Backend', color: '339933', logo: 'nodedotjs', logoColor: 'white' },
  { id: 'express', name: 'Express', category: 'Backend', color: '000000', logo: 'express', logoColor: 'white' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', color: '009688', logo: 'fastapi', logoColor: 'white' },
  { id: 'django', name: 'Django', category: 'Backend', color: '092E20', logo: 'django', logoColor: 'white' },
  { id: 'springboot', name: 'Spring Boot', category: 'Backend', color: '6DB33F', logo: 'springboot', logoColor: 'white' },

  // 4. Database
  { id: 'postgresql', name: 'PostgreSQL', category: 'Database', color: '4169E1', logo: 'postgresql', logoColor: 'white' },
  { id: 'mysql', name: 'MySQL', category: 'Database', color: '4479A1', logo: 'mysql', logoColor: 'white' },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', color: '47A248', logo: 'mongodb', logoColor: 'white' },
  { id: 'redis', name: 'Redis', category: 'Database', color: 'DC382D', logo: 'redis', logoColor: 'white' },

  // 5. DevOps & Cloud
  { id: 'docker', name: 'Docker', category: 'DevOps & Cloud', color: '2496ED', logo: 'docker', logoColor: 'white' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps & Cloud', color: '326CE5', logo: 'kubernetes', logoColor: 'white' },
  { id: 'aws', name: 'AWS', category: 'DevOps & Cloud', color: '232F3E', logo: 'amazonwebservices', logoColor: 'white' },
  { id: 'vercel', name: 'Vercel', category: 'DevOps & Cloud', color: '000000', logo: 'vercel', logoColor: 'white' },
  { id: 'netlify', name: 'Netlify', category: 'DevOps & Cloud', color: '00C896', logo: 'netlify', logoColor: 'white' },

  // 6. Tools
  { id: 'git', name: 'Git', category: 'Tools', color: 'F05032', logo: 'git', logoColor: 'white' },
  { id: 'github', name: 'GitHub', category: 'Tools', color: '181717', logo: 'github', logoColor: 'white' },
  { id: 'vscode', name: 'VS Code', category: 'Tools', color: '007ACC', logo: 'visualstudiocode', logoColor: 'white' },
  { id: 'figma', name: 'Figma', category: 'Tools', color: 'F24E1E', logo: 'figma', logoColor: 'white' },
  { id: 'postman', name: 'Postman', category: 'Tools', color: 'FF6C37', logo: 'postman', logoColor: 'white' },
];

export const CATEGORIES = [
  'Languages',
  'Frontend',
  'Backend',
  'Database',
  'DevOps & Cloud',
  'Tools',
] as const;

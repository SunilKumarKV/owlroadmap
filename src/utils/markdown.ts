export interface READMEData {
  name?: string;
  role?: string;
  about?: string;
  skills?: string;
  projects?: string;
  socials?: string;
}

export interface RoadmapData {
  title?: string;
  steps?: string[];
}

export function generateReadmeMarkdown(data: READMEData): string {
  return [
    data.name ? `# ${data.name}` : '',
    data.role ? `## ${data.role}` : '',
    data.about ? data.about : '',
    data.skills ? `### Skills\n${data.skills}` : '',
    data.projects ? `### Projects\n${data.projects}` : '',
    data.socials ? `### Socials\n${data.socials}` : '',
  ].filter(Boolean).join('\n\n');
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

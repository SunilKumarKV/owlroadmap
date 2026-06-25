"use client";

import Button from '@/components/Button';
import Textarea from '@/components/Textarea';
import useReadmeStore from '@/stores/readme-store';
import useRoadmapStore from '@/stores/roadmap-store';

const PreviewPage = () => {
  const readmeMarkdown = useReadmeStore((state) => [
    state.name ? `# ${state.name}` : '',
    state.role ? `## ${state.role}` : '',
    state.about ? state.about : '',
    state.skills ? `### Skills\n${state.skills}` : '',
    state.projects ? `### Projects\n${state.projects}` : '',
    state.socials ? `### Socials\n${state.socials}` : '',
  ].filter(Boolean).join('\n\n'));
  const roadmapMarkdown = useRoadmapStore((state) => [
    state.title ? `# ${state.title}` : '',
    state.steps.length ? state.steps.map((step, index) => `${index + 1}. ${step}`).join('\n') : '',
  ].filter(Boolean).join('\n\n'));

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Live Preview</h1>
      <Textarea
        value={`${readmeMarkdown}\n\n${roadmapMarkdown}`.trim()}
        onChange={() => {}}
        placeholder="Enter your markdown here"
        rows={20}
        readOnly
      />
      <div className="flex space-x-4 mt-8">
        <Button onClick={() => alert('Copy README.md')} variant="secondary">Copy Markdown</Button>
        <Button onClick={() => alert('Download README.md')} variant="primary">Download Markdown</Button>
      </div>
    </div>
  );
};

export default PreviewPage;

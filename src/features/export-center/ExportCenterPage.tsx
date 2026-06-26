"use client";

import { useState } from 'react';
import Button from '@/components/Button';
import Textarea from '@/components/Textarea';
import useReadmeStore from '@/stores/readme-store';
import useRoadmapStore from '@/stores/roadmap-store';
import { generateReadmeMarkdown, generateRoadmapMarkdown, combineMarkdown } from '@/utils/markdown';

const ExportCenterPage = () => {
  const [copied, setCopied] = useState(false);

  const readmeMarkdown = useReadmeStore((state) => generateReadmeMarkdown(state));
  const roadmapMarkdown = useRoadmapStore((state) => generateRoadmapMarkdown(state));
  const combinedMarkdown = combineMarkdown(readmeMarkdown, roadmapMarkdown);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(combinedMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleDownloadReadme = () => {
    const blob = new Blob([readmeMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadRoadmap = () => {
    const blob = new Blob([roadmapMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roadmap.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Export Center</h1>
      <div className="w-full max-w-4xl">
        <Textarea
          value={combinedMarkdown}
          onChange={() => {}}
          placeholder="No markdown generated yet. Fill in some details in the builders first!"
          rows={20}
          readOnly
        />
      </div>
      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <Button href="/readme-builder" variant="secondary">Edit README</Button>
        <Button href="/roadmap-builder" variant="secondary">Edit Roadmap</Button>
        <Button onClick={handleCopy} variant={copied ? 'secondary' : 'primary'}>
          {copied ? 'Copied!' : 'Copy Combined'}
        </Button>
        <Button onClick={handleDownloadReadme} variant="primary">Download README.md</Button>
        <Button onClick={handleDownloadRoadmap} variant="primary">Download roadmap.md</Button>
      </div>
    </div>
  );
};

export default ExportCenterPage;
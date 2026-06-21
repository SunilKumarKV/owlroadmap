"use client";

import React from 'react';
import { Button, Textarea } from '@/components';
import { useReadmeStore, useRoadmapStore } from '@/store';

const PreviewPage: React.FC = () => {
  const readmeMarkdown = useReadmeStore.getState().markdown;
  const roadmapMarkdown = useRoadmapStore.getState().markdown;
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Live Preview</h1>
      <Textarea
        value={readmeMarkdown + roadmapMarkdown}
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

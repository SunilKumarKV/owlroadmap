"use client";

import { useState } from 'react';
import Button from '@/components/Button';
import Textarea from '@/components/Textarea';

const ExportCenterPage = () => {
  const [markdown, setMarkdown] = useState('');

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Export Markdown</h1>
      <Textarea
        value={markdown}
        onChange={(e) => setMarkdown(e.target.value)}
        placeholder="Enter your markdown here"
        rows={20}
      />
      <div className="flex space-x-4 mt-8">
        <Button onClick={() => alert('Copy README.md')} variant="secondary">Copy Markdown</Button>
        <Button onClick={() => alert('Download README.md')} variant="primary">Download Markdown</Button>
      </div>
    </div>
  );
};

export default ExportCenterPage;
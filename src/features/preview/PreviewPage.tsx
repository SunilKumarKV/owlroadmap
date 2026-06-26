"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Button from '@/components/Button';
import Textarea from '@/components/Textarea';
import useReadmeStore from '@/stores/readme-store';
import useRoadmapStore from '@/stores/roadmap-store';
import useThemeStore from '@/stores/theme-store';
import { generateReadmeMarkdown, generateRoadmapMarkdown, combineMarkdown } from '@/utils/markdown';
import '@uiw/react-md-editor/markdown-editor.css';

// Dynamically import the Markdown preview component to disable SSR
const MDMarkdown = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
);

const PreviewPage = () => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'markdown'>('split');

  const readmeMarkdown = useReadmeStore((state) => generateReadmeMarkdown(state));
  const roadmapMarkdown = useRoadmapStore((state) => generateRoadmapMarkdown(state));
  const initialMarkdown = combineMarkdown(readmeMarkdown, roadmapMarkdown);

  const [markdown, setMarkdown] = useState('');
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    setMarkdown(initialMarkdown);
  }, [initialMarkdown]);

  // Adjust view mode responsively on mount and window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setViewMode((prev) => (prev === 'split' ? 'preview' : prev));
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy markdown:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README_ROADMAP.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const colorMode = (theme === 'dark' || theme === 'gradient' || theme === 'terminal') ? 'dark' : 'light';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-100 dark:bg-[#1e1e1e] transition-colors duration-300">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Live Preview</h1>

      {/* Tabs Selector Bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 w-full max-w-7xl mb-6">
        <button
          onClick={() => setViewMode('preview')}
          className={`flex-1 lg:flex-initial lg:px-8 py-3 font-semibold text-center border-b-2 transition-colors duration-200 cursor-pointer ${
            viewMode === 'preview'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Preview
        </button>
        <button
          onClick={() => setViewMode('markdown')}
          className={`flex-1 lg:flex-initial lg:px-8 py-3 font-semibold text-center border-b-2 transition-colors duration-200 cursor-pointer ${
            viewMode === 'markdown'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Markdown
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`hidden lg:block lg:px-8 py-3 font-semibold text-center border-b-2 transition-colors duration-200 cursor-pointer ${
            viewMode === 'split'
              ? 'border-blue-500 text-blue-500'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          Split View
        </button>
      </div>

      {/* Panels Layout Container */}
      <div
        className={`grid gap-8 w-full max-w-7xl flex-1 px-2 ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {/* Editor Panel (Left) */}
        {(viewMode === 'split' || viewMode === 'markdown') && (
          <div className="flex flex-col h-[550px]">
            <h2 className="text-xl font-bold mb-2 hidden lg:block text-black dark:text-white">Edit Markdown</h2>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="flex-1 font-mono text-sm h-full resize-none shadow-inner"
              placeholder="Type or edit your markdown here..."
            />
          </div>
        )}

        {/* Live Preview Panel (Right) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex flex-col h-[550px]">
            <h2 className="text-xl font-bold mb-2 hidden lg:block text-black dark:text-white">Live Preview</h2>
            <div className="flex-1 p-6 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#121212] overflow-auto shadow-sm transition-all duration-300">
              <div data-color-mode={colorMode} className="theme-preview-container">
                <MDMarkdown source={markdown} style={{ background: 'transparent', color: 'inherit' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <Button href="/theme" variant="secondary">Theme Studio</Button>
        <Button href="/readme-builder" variant="secondary">Edit README</Button>
        <Button href="/roadmap-builder" variant="secondary">Edit Roadmap</Button>
        <Button onClick={handleCopy} variant={copied ? 'secondary' : 'primary'}>
          {copied ? 'Copied!' : 'Copy Markdown'}
        </Button>
        <Button onClick={handleDownload} variant="primary">Download Markdown</Button>
      </div>
    </div>
  );
};

export default PreviewPage;

'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Heart,
  Eye,
  Download,
  Upload,
  BookOpen,
  Sparkles,
  Copy,
  Plus,
  Trash2,
  Share2,
  ExternalLink,
  FileDown,
  ArrowLeft,
  Check,
  ChevronDown
} from 'lucide-react';
import { useShowcaseStore, Showcase, ShowcaseCategory } from '@/stores/showcase-store';
import useReadmeStore from '@/stores/readme-store';
import { generateReadmeMarkdown } from '@/utils/markdown';
import Button from '@/components/Button';
import Input from '@/components/Input';

const MDMarkdown = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  { ssr: false }
) as any;

const CATEGORIES: { id: ShowcaseCategory | 'all'; label: string }[] = [
  { id: 'all', label: '🌟 All' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'modern', label: 'Modern' },
  { id: 'open-source', label: 'Open Source' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'full-stack', label: 'Full Stack' },
  { id: 'ai', label: 'AI Engineer' },
  { id: 'anime', label: 'Anime' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'gprm', label: 'GPRM Style' },
];

const ShowcaseGalleryPage = () => {
  const router = useRouter();
  const {
    showcases,
    likeShowcase,
    viewShowcase,
    importShowcases,
    deleteShowcase,
    addShowcase,
  } = useShowcaseStore();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShowcaseCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'liked' | 'newest'>('popular');
  const [previewingShowcase, setPreviewingShowcase] = useState<Showcase | null>(null);
  const [modalTab, setModalTab] = useState<'visual' | 'code' | 'info'>('visual');
  const [copied, setCopied] = useState(false);

  // New Custom Showcase Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    author: '',
    category: 'minimal' as ShowcaseCategory,
    technologiesInput: '',
    theme: 'dark' as 'minimal' | 'dark' | 'gradient' | 'terminal',
  });

  // Fetch compiled markdown of the showcase configuration being previewed
  const [compiledMarkdown, setCompiledMarkdown] = useState('');

  useEffect(() => {
    if (previewingShowcase) {
      // Increment views count when opening showcase details
      viewShowcase(previewingShowcase.id);
      
      // Compile configuration into real README markdown code
      try {
        const md = generateReadmeMarkdown(previewingShowcase.config);
        setCompiledMarkdown(md);
      } catch (err) {
        console.error('Failed to compile readme markdown', err);
        setCompiledMarkdown('# ' + previewingShowcase.name + '\nFailed to load layout rendering.');
      }
    } else {
      setCompiledMarkdown('');
      setModalTab('visual');
    }
  }, [previewingShowcase]);

  // Filters & Sorting
  const filteredShowcases = showcases
    .filter((show) => {
      const matchesSearch =
        show.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        show.technologies.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || show.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'liked') {
        return b.likes - a.likes;
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // default: 'popular' = likes + views score
      return (b.likes + b.views) - (a.likes + a.views);
    });

  // Duplicate layout to editor configuration
  const handleDuplicateToEditor = (show: Showcase) => {
    useReadmeStore.setState({
      name: show.config.name,
      role: show.config.role,
      about: show.config.about,
      skills: show.config.skills,
      projects: show.config.projects,
      socials: show.config.socials,
      avatarUrl: show.config.avatarUrl,
      followers: show.config.followers,
      following: show.config.following,
      publicRepos: show.config.publicRepos,
      template: show.config.template,
      githubStats: show.config.githubStats,
      techStack: show.config.techStack,
      socialLinks: show.config.socialLinks,
    });
    setPreviewingShowcase(null);
    router.push('/readme-builder');
  };

  // Export specific template JSON file
  const handleExportShowcaseFile = (show: Showcase) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(show, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `showcase-${show.name.toLowerCase().replace(/\s+/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Showcase list from JSON
  const handleImportShowcaseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importShowcases(content);
      if (res.success) {
        alert('Showcase templates imported successfully!');
      } else {
        alert(`Import error: ${res.error}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Copy raw Markdown code block to clipboard
  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(compiledMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Publish current builder profile as a Showcase card
  const handlePublishCustomShowcase = () => {
    const readmeState = useReadmeStore.getState();
    const config = {
      name: readmeState.name,
      role: readmeState.role,
      about: readmeState.about,
      skills: readmeState.skills,
      projects: readmeState.projects,
      socials: readmeState.socials,
      avatarUrl: readmeState.avatarUrl,
      followers: readmeState.followers,
      following: readmeState.following,
      publicRepos: readmeState.publicRepos,
      template: readmeState.template,
      githubStats: readmeState.githubStats,
      techStack: readmeState.techStack,
      socialLinks: readmeState.socialLinks,
    };

    addShowcase({
      name: createForm.name || 'Custom Showcase Portfolio',
      description: createForm.description || 'Stunning custom workspace layout created on OwlRoadmap',
      author: createForm.author || 'dev_master',
      category: createForm.category,
      technologies: createForm.technologiesInput ? createForm.technologiesInput.split(',').map(t => t.trim()).filter(Boolean) : [],
      theme: createForm.theme,
      config,
    });

    setCreateForm({
      name: '',
      description: '',
      author: '',
      category: 'minimal',
      technologiesInput: '',
      theme: 'dark',
    });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* ── Top Header Bar ── */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-[#0d0d11]/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 transition cursor-pointer">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🦉</span>
              <h1 className="text-md font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                OwlRoadmap Showcase
              </h1>
            </div>
            <p className="text-4xs font-semibold text-gray-450 dark:text-gray-500 uppercase tracking-widest mt-0.5">
              Readme Showcase Gallery
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 select-none">
          <label className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#121215] text-xs font-bold text-gray-650 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer flex items-center gap-1.5">
            <FileDown className="h-4 w-4 text-blue-500" />
            Import Showcase JSON
            <input type="file" accept=".json" onChange={handleImportShowcaseFile} className="hidden" />
          </label>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            className="text-xs py-1.5 flex items-center gap-1 font-bold"
          >
            <Plus className="h-4 w-4" /> Share My Workspace
          </Button>
        </div>
      </header>

      {/* ── Hero Banner ── */}
      <section className="relative px-6 py-12 text-center overflow-hidden border-b border-gray-200 dark:border-gray-850 bg-gradient-to-b from-blue-500/5 to-transparent">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Sparkles className="h-3.5 w-3.5" /> Design Inspiration Hub
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
            Discover Beautiful Profile READMEs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Browse through curated community workspaces, copy markdown snippets, inspect layouts, and duplicate templates directly into your active builder session in one click.
          </p>
        </div>
      </section>

      {/* ── Main Gallery Filters & Grid ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-6">
        
        {/* Filters controls row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#101014] p-4 rounded-xl border border-gray-200 dark:border-gray-800/80 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, technology, or developer username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-gray-200 dark:bg-[#16161b] dark:border-gray-700 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-2 select-none justify-end">
            <span className="text-3xs uppercase font-extrabold tracking-wider text-gray-400">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:bg-[#16161b] dark:border-gray-700 focus:outline-none cursor-pointer font-medium"
            >
              <option value="popular">Popularity Score</option>
              <option value="liked">Most Liked</option>
              <option value="newest">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Categories selector row */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 text-xs font-bold rounded-full cursor-pointer transition flex-shrink-0 duration-150 ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'bg-white hover:bg-gray-100 border border-gray-200 dark:bg-[#101014] dark:border-gray-850 dark:hover:bg-[#1a1a22] text-gray-500 dark:text-gray-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Showcase Grid */}
        {filteredShowcases.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#101014] border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <p className="text-sm text-gray-400">No showcase templates match your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShowcases.map((show) => {
              const isLiked = show.isLiked;
              return (
                <div
                  key={show.id}
                  className="group flex flex-col bg-white dark:bg-[#101014] hover:bg-gray-50/50 dark:hover:bg-[#15151b] border border-gray-200 dark:border-gray-850 rounded-2xl shadow-xs transition duration-300 overflow-hidden text-left"
                >
                  
                  {/* Category Banner styling */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />

                  {/* Card Content */}
                  <div className="p-6 flex flex-col flex-1">
                    
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-3 select-none">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/10">
                        {show.category}
                      </span>
                      {show.isCustom && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          Custom Workspace
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition duration-150">
                      {show.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed mt-1 mb-4 flex-1">
                      {show.description}
                    </p>

                    {/* Developer info */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono mb-4">
                      <span>By:</span>
                      <span className="font-semibold text-blue-500 hover:underline">@{show.author}</span>
                    </div>

                    {/* Technologies list */}
                    {show.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {show.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-medium px-2 py-0.5 bg-gray-100 dark:bg-[#1b1b22] text-gray-600 dark:text-gray-400 rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Popularity Metrics and actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-850 mt-auto select-none">
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <button
                          onClick={() => likeShowcase(show.id)}
                          className={`flex items-center gap-1 cursor-pointer transition ${isLiked ? 'text-red-500 font-bold hover:scale-105' : 'hover:text-red-500'}`}
                          title="Like Showcase"
                        >
                          👍 {show.likes}
                        </button>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> {show.views}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPreviewingShowcase(show)}
                          className="px-2.5 py-1 text-2xs font-extrabold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                        >
                          Preview
                        </button>
                        
                        <button
                          onClick={() => handleDuplicateToEditor(show)}
                          className="p-1 text-2xs font-semibold rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-300 transition cursor-pointer"
                          title="Duplicate into editor workspace"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => handleExportShowcaseFile(show)}
                          className="p-1 rounded-md bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-400 hover:text-gray-650 transition cursor-pointer"
                          title="Export Showcase JSON"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </button>

                        {show.isCustom && (
                          <button
                            onClick={() => {
                              if (confirm('Delete this custom showcase?')) {
                                deleteShowcase(show.id);
                              }
                            }}
                            className="p-1 rounded-md hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition cursor-pointer"
                            title="Delete custom showcase"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Detailed Inspiration Preview Modal Overlay (Escape Key Supported) ── */}
      {previewingShowcase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-[#121215] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-w-3xl w-full h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {previewingShowcase.category}
                </span>
                <span className="text-xs text-gray-400 font-mono">@{previewingShowcase.author}</span>
              </div>
              <button
                onClick={() => setPreviewingShowcase(null)}
                className="text-gray-400 hover:text-gray-600 transition font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Tab Controls */}
            <div className="flex border-b border-gray-100 dark:border-gray-850 px-6 bg-gray-50/30 dark:bg-[#15151b]/40 flex-shrink-0 select-none">
              {[
                { id: 'visual', label: '👁️ Live Visual Preview' },
                { id: 'code', label: '📄 Markdown Source Code' },
                { id: 'info', label: '⚙️ Layout Specs' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id as any)}
                  className={`px-4 py-3 text-xs font-bold border-b-2 cursor-pointer transition ${
                    modalTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-450 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content Frame */}
            <div className="flex-1 overflow-y-auto p-6 custom-editor-scrollbar text-xs">
              
              {modalTab === 'visual' && (
                <div data-color-mode={previewingShowcase.theme === 'minimal' ? 'light' : 'dark'} className="theme-preview-container p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-gray-200 dark:border-gray-800">
                  <MDMarkdown source={compiledMarkdown} style={{ background: 'transparent', color: 'inherit' }} />
                </div>
              )}

              {modalTab === 'code' && (
                <div className="relative font-mono text-[11px] h-full flex flex-col">
                  <div className="absolute right-3 top-3 z-10 select-none">
                    <button
                      onClick={handleCopyMarkdown}
                      className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shadow-md"
                    >
                      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={compiledMarkdown}
                    className="w-full flex-1 p-4 bg-gray-900 text-green-400 rounded-xl border border-gray-850 font-mono text-xs focus:outline-none resize-none leading-relaxed select-all custom-editor-scrollbar"
                  />
                </div>
              )}

              {modalTab === 'info' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{previewingShowcase.name}</h3>
                    <p className="text-gray-400 mt-1 leading-relaxed">{previewingShowcase.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-850 pt-4">
                    <div>
                      <span className="font-semibold text-gray-500 dark:text-gray-400 block mb-1">Theme Style:</span>
                      <span className="inline-block capitalize px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
                        🎨 {previewingShowcase.theme} Styling
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-gray-500 dark:text-gray-400 block mb-1">Author Credit:</span>
                      <span className="font-bold text-blue-500">@{previewingShowcase.author}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-850 pt-4">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 block">Technology Stack:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {previewingShowcase.technologies.map((tech) => (
                        <span key={tech} className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-300 font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-850 pt-4">
                    <span className="font-semibold text-gray-500 dark:text-gray-400 block">Layout Template Style:</span>
                    <span className="inline-block capitalize px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-550 dark:text-amber-400 font-bold border border-amber-500/20">
                      📝 {previewingShowcase.config.template} Layout
                    </span>
                  </div>

                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 flex-shrink-0 select-none">
              <button
                onClick={() => setPreviewingShowcase(null)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDuplicateToEditor(previewingShowcase)}
                className="px-4 py-2 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Duplicate into Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Publish Custom Showcase Modal Overlay ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-[#121215] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-550">Share Active Workspace</span>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-650 transition font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              <p className="text-gray-400 dark:text-gray-500 leading-relaxed mb-1">
                Publish your current README configurations to the inspiration showcase gallery.
              </p>

              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Showcase Name</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Neon Cyberpunk Developer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author Name</label>
                <Input
                  value={createForm.author}
                  onChange={(e) => setCreateForm({ ...createForm, author: e.target.value })}
                  placeholder="e.g. vance_dev"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Describe your design choices, colors, or widget setups..."
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:bg-[#16161b] dark:text-white dark:border-gray-700 focus:outline-none resize-none"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-2xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as ShowcaseCategory })}
                  className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:bg-[#16161b] dark:text-white dark:border-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="minimal">Minimal</option>
                  <option value="modern">Modern</option>
                  <option value="open-source">Open Source</option>
                  <option value="frontend">Frontend</option>
                  <option value="full-stack">Full Stack</option>
                  <option value="ai">AI Engineer</option>
                  <option value="anime">Anime</option>
                  <option value="terminal">Terminal</option>
                  <option value="gprm">GPRM Style</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-2xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Theme Colors</label>
                  <select
                    value={createForm.theme}
                    onChange={(e) => setCreateForm({ ...createForm, theme: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded border border-gray-350 dark:bg-[#16161b] dark:text-white dark:border-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="minimal">Light Minimal</option>
                    <option value="dark">Dark Theme</option>
                    <option value="gradient">Gradient Colors</option>
                    <option value="terminal">Terminal Green</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-2xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tech Tags (comma separated)</label>
                  <Input
                    value={createForm.technologiesInput}
                    onChange={(e) => setCreateForm({ ...createForm, technologiesInput: e.target.value })}
                    placeholder="react, rust, ebpf"
                  />
                </div>
              </div>

            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/5 border-t border-gray-100 dark:border-gray-850 flex items-center justify-end gap-3 select-none">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishCustomShowcase}
                disabled={!createForm.name || !createForm.author}
                className="px-4 py-2 rounded-lg text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publish Showcase
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ShowcaseGalleryPage;

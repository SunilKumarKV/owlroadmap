"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Reorder } from 'framer-motion';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useReadmeStore, { READMEStyleTemplate, GitHubStatsConfig, TechStackConfig, SocialLinksConfig, SectionId, FeaturedProjectsConfig, FeaturedProject } from '@/stores/readme-store';
import { TECHNOLOGY_REGISTRY, CATEGORIES, Technology } from '@/utils/tech-registry';
import { SOCIAL_PLATFORM_REGISTRY, SOCIAL_CATEGORIES, SocialPlatform } from '@/utils/social-registry';
import { fetchGithubProfile, fetchGithubRepos } from '@/utils/github-api';

const READMEBuilderPage = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    name,
    role,
    about,
    skills,
    projects,
    socials,
    template,
    githubStats,
    techStack,
    socialLinks,
    achievements,
    header,
    sections,
    support,
    quotes,
    customMarkdown,
    standaloneVisitor,
    setName,
    setRole,
    setAbout,
    setSkills,
    setProjects,
    setSocials,
    setAvatarUrl,
    setFollowers,
    setFollowing,
    setPublicRepos,
    setTemplate,
    setGithubStats,
    setTechStack,
    setSocialLinks,
    setAchievements,
    setHeader,
    setSections,
    setSupport,
    setQuotes,
    setCustomMarkdown,
    setStandaloneVisitor,
    featuredProjects,
    setFeaturedProjects,
    applyPreset,
    reset,
  } = useReadmeStore();

  // ── Featured Projects local state ─────────────────────────────────────────
  const [repoSearchQuery, setRepoSearchQuery] = useState('');
  const [reposLoading, setReposLoading] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);
  const [fetchedRepos, setFetchedRepos] = useState<FeaturedProject[]>([]);
  const [repoUsername, setRepoUsername] = useState('');
  const [editingProject, setEditingProject] = useState<FeaturedProject | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualDraft, setManualDraft] = useState<Partial<FeaturedProject>>({
    source: 'manual',
    title: '',
    description: '',
    repoUrl: '',
    demoUrl: '',
    language: '',
    technologies: [],
  });
  const [manualTechInput, setManualTechInput] = useState('');

  const [techSearch, setTechSearch] = useState('');
  const [activeTechCategory, setActiveTechCategory] = useState<'All' | 'Languages' | 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Tools'>('All');
  const [socialSearch, setSocialSearch] = useState('');

  useEffect(() => {
    if (!username) return;

    const fetchGitHubData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch user profile info
        const profile = await fetchGithubProfile(username);

        // Fetch repositories
        const repos = await fetchGithubRepos(username);

        // Generate profile content
        setName(profile.name || profile.login || '');

        let inferredRole = '';
        if (profile.company) {
          inferredRole = profile.company.startsWith('@')
            ? `Developer at ${profile.company.substring(1)}`
            : `Developer at ${profile.company}`;
        } else {
          inferredRole = 'Software Developer';
        }
        setRole(inferredRole);

        const bioParts = [];
        if (profile.bio) bioParts.push(profile.bio);
        if (profile.location) bioParts.push(`📍 Based in ${profile.location}`);
        setAbout(bioParts.join('\n\n'));

        // Populate avatar and GitHub statistics
        setAvatarUrl(profile.avatar_url);
        setFollowers(profile.followers);
        setFollowing(profile.following);
        setPublicRepos(profile.public_repos);

        // Autofill username for stats if empty
        const currentStats = useReadmeStore.getState().githubStats;
        if (!currentStats.username && username) {
          setGithubStats({ username });
        }

        // Identify top repositories sorted by stars
        const topRepos = repos
          .filter((repo) => !repo.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 5);

        // Format repository list for projects
        const projectList = topRepos
          .map((repo) => `- [${repo.name}](${repo.html_url})${repo.description ? ` - ${repo.description}` : ''} (⭐ ${repo.stargazers_count})`)
          .join('\n');
        setProjects(projectList);

        // Generate social links
        const socialList = [
          `- GitHub: [${profile.login}](${profile.html_url})`,
          profile.blog ? `- Website: [${profile.blog.replace(/https?:\/\//, '')}](${profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`})` : '',
          profile.twitter_username ? `- Twitter: [@${profile.twitter_username}](https://twitter.com/${profile.twitter_username})` : '',
        ]
          .filter(Boolean)
          .join('\n');
        setSocials(socialList);
        setAchievements({ username });
        setHeader({ name: profile.name || profile.login });

      } catch (err: any) {
        console.error(err);
        setError(err.message || 'An error occurred while fetching GitHub data.');
      } finally {
        setLoading(false);
      }
    };

    fetchGitHubData();
  }, [
    username,
    setName,
    setRole,
    setAbout,
    setProjects,
    setSocials,
    setAvatarUrl,
    setFollowers,
    setFollowing,
    setPublicRepos,
    setGithubStats,
    setTechStack,
    setSocialLinks,
    setAchievements,
    setHeader,
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-100 dark:bg-[#16161a] transition-colors duration-200">
      <div className="w-full max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-black dark:text-white tracking-tight sm:text-5xl">
            Create Your GitHub README
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Visually assemble, customize, and order your profile sections in real time
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mb-6 mx-auto" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Global Template Selector */}
        <div className="w-full max-w-lg mx-auto mb-8 p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
          <label htmlFor="readme-template-select" className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Default Style Template</label>
          <select
            id="readme-template-select"
            value={template}
            onChange={(e) => setTemplate(e.target.value as READMEStyleTemplate)}
            className="w-full px-4 py-2.5 rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
          >
            <option value="minimal">Minimal</option>
            <option value="professional">Professional</option>
            <option value="developer">Developer</option>
            <option value="open-source">Open Source</option>
            <option value="portfolio">Portfolio</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Section Manager Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4 lg:sticky lg:top-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                  🗂️ Section Manager
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Drag sections to reorder, toggle visibility, and collapse settings panels.
                </p>
              </div>

              {/* Layout Presets */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-2xs uppercase tracking-wider font-bold text-gray-400">
                  Apply Preset Layout
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('minimal')}
                    className="px-2.5 py-1 text-2xs font-semibold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer capitalize"
                  >
                    Minimal
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('modern')}
                    className="px-2.5 py-1 text-2xs font-semibold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer capitalize"
                  >
                    Modern
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('developer')}
                    className="px-2.5 py-1 text-2xs font-semibold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer capitalize"
                  >
                    Developer
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('open-source')}
                    className="px-2.5 py-1 text-2xs font-semibold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer capitalize"
                  >
                    Open Source
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('gprm-style')}
                    className="px-2.5 py-1 text-2xs font-semibold rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer capitalize"
                  >
                    GPRM Style
                  </button>
                </div>
              </div>

              {/* Drag-and-Drop Reorder Group */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Reorder.Group
                  axis="y"
                  values={sections.order}
                  onReorder={(newOrder) => setSections({ order: newOrder })}
                  className="space-y-2"
                >
                  {sections.order.map((sectionId) => {
                    const sectionConfig = sections.sections[sectionId];
                    if (!sectionConfig) return null;

                    const handleToggle = () => {
                      setSections({
                        sections: {
                          ...sections.sections,
                          [sectionId]: { ...sectionConfig, enabled: !sectionConfig.enabled },
                        },
                      });
                    };

                    const handleCollapse = () => {
                      setSections({
                        sections: {
                          ...sections.sections,
                          [sectionId]: { ...sectionConfig, collapsed: !sectionConfig.collapsed },
                        },
                      });
                    };

                    const moveSection = (dir: 'up' | 'down') => {
                      const idx = sections.order.indexOf(sectionId);
                      if (dir === 'up' && idx === 0) return;
                      if (dir === 'down' && idx === sections.order.length - 1) return;
                      const newOrder = [...sections.order];
                      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
                      const temp = newOrder[idx];
                      newOrder[idx] = newOrder[swapIdx];
                      newOrder[swapIdx] = temp;
                      setSections({ order: newOrder });
                    };

                    return (
                      <Reorder.Item
                        key={sectionId}
                        value={sectionId}
                        className={`flex items-center justify-between p-3 rounded-md border transition duration-150 cursor-grab active:cursor-grabbing select-none ${
                          sectionConfig.enabled
                            ? 'border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-950/5'
                            : 'border-gray-100 dark:border-gray-800 opacity-60 bg-gray-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 cursor-grab">⋮⋮</span>
                          <input
                            type="checkbox"
                            checked={sectionConfig.enabled}
                            onChange={handleToggle}
                            className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                            aria-label={`Toggle ${sectionConfig.name}`}
                          />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {sectionConfig.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveSection('up')}
                            disabled={sections.order.indexOf(sectionId) === 0}
                            className="p-1 text-2xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-20 cursor-pointer"
                            aria-label={`Move ${sectionConfig.name} up`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSection('down')}
                            disabled={sections.order.indexOf(sectionId) === sections.order.length - 1}
                            className="p-1 text-2xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 disabled:opacity-20 cursor-pointer"
                            aria-label={`Move ${sectionConfig.name} down`}
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={handleCollapse}
                            className="p-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
                            aria-label={sectionConfig.collapsed ? `Expand ${sectionConfig.name}` : `Collapse ${sectionConfig.name}`}
                          >
                            {sectionConfig.collapsed ? '▶' : '▼'}
                          </button>
                        </div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>
            </div>
          </div>

          {/* Right Column: Section Forms */}
          <div className="lg:col-span-2 space-y-6">
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              {sections.order.map((sectionId) => {
                const sectionConfig = sections.sections[sectionId];
                if (!sectionConfig) return null;

                // Expand banner if collapsed
                if (sectionConfig.collapsed) {
                  return (
                    <div
                      key={sectionId}
                      className="p-4 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {sectionConfig.name} Configuration Panel
                        </span>
                        {!sectionConfig.enabled && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-gray-100 dark:bg-gray-800 text-gray-400">
                            Disabled
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSections({
                            sections: {
                              ...sections.sections,
                              [sectionId]: { ...sectionConfig, collapsed: false },
                            },
                          });
                        }}
                        className="text-xs font-semibold text-blue-500 hover:text-blue-600 cursor-pointer"
                      >
                        Expand Form
                      </button>
                    </div>
                  );
                }

                // Render specific section form block
                switch (sectionId) {
                  case 'header':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            👤 Profile Header Config
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={header.enabled}
                              onChange={(e) => setHeader({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {/* Traditional name & role details inside header card */}
                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="readme-name" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Name</label>
                              <Input
                                id="readme-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                loading={loading}
                                disabled={loading}
                              />
                            </div>
                            <div>
                              <label htmlFor="readme-role" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Role / Designation</label>
                              <Input
                                id="readme-role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="Your Role"
                                loading={loading}
                                disabled={loading}
                              />
                            </div>
                          </div>
                        </div>

                        {header.enabled && (
                          <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800 transition-all duration-300">
                            {/* Basic Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="header-name-input" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Header Display Name (Overrides Name)</label>
                                <Input
                                  id="header-name-input"
                                  value={header.name}
                                  onChange={(e) => setHeader({ name: e.target.value })}
                                  placeholder="e.g. Sunil Kumar"
                                />
                              </div>
                              <div>
                                <label htmlFor="header-pronouns-input" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Pronouns</label>
                                <Input
                                  id="header-pronouns-input"
                                  value={header.pronouns}
                                  onChange={(e) => setHeader({ pronouns: e.target.value })}
                                  placeholder="e.g. he/him"
                                />
                              </div>
                              <div>
                                <label htmlFor="header-title-input" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Header Display Title (Overrides Role)</label>
                                <Input
                                  id="header-title-input"
                                  value={header.title}
                                  onChange={(e) => setHeader({ title: e.target.value })}
                                  placeholder="e.g. Frontend Developer"
                                />
                              </div>
                              <div>
                                <label htmlFor="header-location-input" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Location</label>
                                <Input
                                  id="header-location-input"
                                  value={header.location}
                                  onChange={(e) => setHeader({ location: e.target.value })}
                                  placeholder="e.g. India"
                                />
                              </div>
                            </div>

                            {/* Short Intro */}
                            <div>
                              <label htmlFor="header-intro-input" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Short Introduction</label>
                              <Input
                                id="header-intro-input"
                                value={header.intro}
                                onChange={(e) => setHeader({ intro: e.target.value })}
                                placeholder="e.g. Passionate developer building web applications."
                              />
                            </div>

                            {/* Alignment Selector */}
                            <div>
                              <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Alignment</span>
                              <div className="flex gap-2">
                                {(['left', 'center', 'right'] as const).map((align) => (
                                  <button
                                    key={align}
                                    type="button"
                                    onClick={() => setHeader({ alignment: align })}
                                    className={`px-3 py-1.5 rounded text-xs capitalize transition font-medium cursor-pointer ${
                                      header.alignment === align
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {align}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Banner Configuration */}
                            <div className="p-4 rounded border border-gray-100 dark:border-gray-800 space-y-3">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Banner Config</span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Banner Type</label>
                                  <select
                                    value={header.bannerType || 'none'}
                                    onChange={(e) => setHeader({ bannerType: e.target.value as any })}
                                    className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                  >
                                    <option value="none">None</option>
                                    <option value="capsule">Capsule Render (Waving)</option>
                                    <option value="wave">Wave Header</option>
                                    <option value="gradient">Gradient Banner</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Banner Text</label>
                                  <input
                                    type="text"
                                    placeholder="Welcome..."
                                    value={header.bannerText || ''}
                                    onChange={(e) => setHeader({ bannerText: e.target.value })}
                                    className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                  />
                                </div>
                                <div>
                                  <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Banner Theme/Color</label>
                                  <select
                                    value={header.bannerTheme || 'gradient'}
                                    onChange={(e) => setHeader({ bannerTheme: e.target.value })}
                                    className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                  >
                                    <option value="gradient">Gradient</option>
                                    <option value="radical">Radical</option>
                                    <option value="dracula">Dracula</option>
                                    <option value="github">GitHub</option>
                                    <option value="ocean">Ocean</option>
                                    <option value="sunset">Sunset</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* Typing SVG config */}
                            <div className="p-4 rounded border border-gray-100 dark:border-gray-800 space-y-4">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Typing SVG Settings</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={header.typingEnabled}
                                    onChange={(e) => setHeader({ typingEnabled: e.target.checked })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                              </div>

                              {header.typingEnabled && (
                                <div className="space-y-3 transition-all duration-255">
                                  {/* List of lines */}
                                  <div className="space-y-2">
                                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400">Text Lines</label>
                                    {(header.typingLines || []).map((line, idx) => (
                                      <div key={idx} className="flex gap-2 items-center">
                                        <input
                                          type="text"
                                          value={line}
                                          onChange={(e) => {
                                            const newLines = [...(header.typingLines || [])];
                                            newLines[idx] = e.target.value;
                                            setHeader({ typingLines: newLines });
                                          }}
                                          className="flex-1 text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                          placeholder={`Line ${idx + 1}`}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newLines = (header.typingLines || []).filter((_, i) => i !== idx);
                                            setHeader({ typingLines: newLines });
                                          }}
                                          className="text-red-500 text-xs font-semibold p-1.5 hover:bg-red-500/10 rounded cursor-pointer"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHeader({ typingLines: [...(header.typingLines || []), ''] });
                                      }}
                                      className="text-blue-500 text-xs font-semibold hover:underline cursor-pointer"
                                    >
                                      + Add Line
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                    <div>
                                      <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Speed</label>
                                      <input
                                        type="number"
                                        value={header.typingSpeed || 200}
                                        onChange={(e) => setHeader({ typingSpeed: parseInt(e.target.value) || 200 })}
                                        className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Delay</label>
                                      <input
                                        type="number"
                                        value={header.typingDelay || 1000}
                                        onChange={(e) => setHeader({ typingDelay: parseInt(e.target.value) || 1000 })}
                                        className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Hex Color</label>
                                      <input
                                        type="text"
                                        value={header.typingColor || '36BCF7'}
                                        onChange={(e) => setHeader({ typingColor: e.target.value })}
                                        className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                      />
                                    </div>
                                    <div className="flex items-center pt-4">
                                      <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={header.typingCenter !== false}
                                          onChange={(e) => setHeader({ typingCenter: e.target.checked })}
                                          className="rounded border-gray-300 dark:bg-gray-800"
                                        />
                                        <span>Center Text</span>
                                      </label>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status Badges */}
                            <div className="p-4 rounded border border-gray-100 dark:border-gray-800 space-y-4">
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">Status Badges Under Header</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-wrap gap-4 items-center">
                                  <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={header.badges.openToWork}
                                      onChange={(e) => setHeader({
                                        badges: {
                                          ...header.badges,
                                          openToWork: e.target.checked,
                                        }
                                      })}
                                      className="rounded border-gray-300 dark:bg-gray-800"
                                    />
                                    <span>Open to Work Badge</span>
                                  </label>

                                  <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={header.badges.freelance}
                                      onChange={(e) => setHeader({
                                        badges: {
                                          ...header.badges,
                                          freelance: e.target.checked,
                                        }
                                      })}
                                      className="rounded border-gray-300 dark:bg-gray-800"
                                    />
                                    <span>Freelance Badge</span>
                                  </label>
                                </div>

                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Learning Status</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. Next.js, Rust..."
                                      value={header.badges.learning || ''}
                                      onChange={(e) => setHeader({
                                        badges: {
                                          ...header.badges,
                                          learning: e.target.value,
                                        }
                                      })}
                                      className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Building Status</label>
                                    <input
                                      type="text"
                                      placeholder="e.g. SaaS project, Compiler..."
                                      value={header.badges.building || ''}
                                      onChange={(e) => setHeader({
                                        badges: {
                                          ...header.badges,
                                          building: e.target.value,
                                        }
                                      })}
                                      className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Visitor Placement & Views placement */}
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400 font-medium">Visitor Counter Placement</label>
                              <select
                                value={header.visitorPlacement || 'hidden'}
                                onChange={(e) => setHeader({ visitorPlacement: e.target.value as any })}
                                className="w-full md:w-64 text-xs p-2 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500"
                              >
                                <option value="hidden">Hidden</option>
                                <option value="top">Top (Prepend before Name)</option>
                                <option value="bottom">Bottom (Append after Badges)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  case 'about':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          📝 About Me & Skills Config
                        </h3>
                        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div>
                            <label htmlFor="readme-about" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">About Me / Bio</label>
                            <Textarea
                              id="readme-about"
                              value={about}
                              onChange={(e) => setAbout(e.target.value)}
                              placeholder="About You"
                              rows={4}
                              loading={loading}
                              disabled={loading}
                            />
                          </div>
                          <div>
                            <label htmlFor="readme-skills" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Skills (Legacy Text Block)</label>
                            <Textarea
                              id="readme-skills"
                              value={skills}
                              onChange={(e) => setSkills(e.target.value)}
                              placeholder="Skills (comma-separated or list)"
                              rows={3}
                              loading={loading}
                              disabled={loading}
                            />
                          </div>
                        </div>
                      </div>
                    );

                  case 'socials':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            🔗 Social Links & Contact Builder
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={socialLinks.enabled}
                              onChange={(e) => setSocialLinks({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {socialLinks.enabled ? (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 transition-all duration-300">
                            {/* Badge Styling & Modifiers */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="social-style-select" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Badge Style</label>
                                <select
                                  id="social-style-select"
                                  value={socialLinks.style}
                                  onChange={(e) => setSocialLinks({ style: e.target.value as any })}
                                  className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
                                >
                                  <option value="flat">Flat</option>
                                  <option value="flat-square">Flat Square</option>
                                  <option value="plastic">Plastic</option>
                                  <option value="for-the-badge">For the Badge</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-4 pt-4">
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={socialLinks.iconOnly}
                                    onChange={(e) => setSocialLinks({ iconOnly: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                  />
                                  <span>Icon Only Mode</span>
                                </label>
                              </div>
                            </div>

                            {/* Search Bar */}
                            <div className="w-full md:w-64">
                              <Input
                                id="social-search-input"
                                value={socialSearch}
                                onChange={(e) => setSocialSearch(e.target.value)}
                                placeholder="Search platforms..."
                              />
                            </div>

                            {/* Platform Groups List */}
                            <div className="space-y-6">
                              {SOCIAL_CATEGORIES.map((category) => {
                                const categoryPlatforms = SOCIAL_PLATFORM_REGISTRY.filter(
                                  (p) => p.category === category && p.name.toLowerCase().includes(socialSearch.toLowerCase())
                                );

                                if (categoryPlatforms.length === 0) return null;

                                return (
                                  <div key={category} className="space-y-2">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{category}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      {categoryPlatforms.map((platform) => {
                                        const config = socialLinks.platforms[platform.id] || { enabled: false, value: '' };
                                        const label = socialLinks.iconOnly ? '' : encodeURIComponent(platform.name);
                                        const badgeUrl = `https://img.shields.io/badge/${label}-${platform.color}?style=${socialLinks.style}&logo=${platform.logo}&logoColor=${platform.logoColor}`;

                                        const handleToggle = () => {
                                          setSocialLinks({
                                            platforms: {
                                              ...socialLinks.platforms,
                                              [platform.id]: {
                                                ...config,
                                                enabled: !config.enabled,
                                              },
                                            },
                                          });
                                        };

                                        const handleValueChange = (val: string) => {
                                          setSocialLinks({
                                            platforms: {
                                              ...socialLinks.platforms,
                                              [platform.id]: {
                                                ...config,
                                                value: val,
                                              },
                                            },
                                          });
                                        };

                                        return (
                                          <div
                                            key={platform.id}
                                            className={`p-4 rounded-md border transition duration-150 space-y-3 ${
                                              config.enabled
                                                ? 'border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-950/5'
                                                : 'border-gray-200 dark:border-gray-800'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <input
                                                  type="checkbox"
                                                  checked={config.enabled}
                                                  onChange={handleToggle}
                                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                                                  aria-label={`Toggle ${platform.name}`}
                                                />
                                                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{platform.name}</span>
                                              </div>
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img
                                                src={badgeUrl}
                                                alt={platform.name}
                                                className="max-h-[20px] object-contain"
                                                loading="lazy"
                                              />
                                            </div>

                                            {config.enabled && (
                                              <div>
                                                <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Username / ID</label>
                                                <Input
                                                  value={config.value}
                                                  onChange={(e) => handleValueChange(e.target.value)}
                                                  placeholder={platform.placeholder}
                                                />
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <label htmlFor="readme-socials" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Socials & Links (Fallback Text Block)</label>
                            <Textarea
                              id="readme-socials"
                              value={socials}
                              onChange={(e) => setSocials(e.target.value)}
                              placeholder="Social Links (comma-separated or list)"
                              rows={3}
                              loading={loading}
                              disabled={loading}
                            />
                          </div>
                        )}
                      </div>
                    );

                  case 'techStack':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            🛠️ Tech Stack Builder
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={techStack.enabled}
                              onChange={(e) => setTechStack({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {techStack.enabled && (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 transition-all duration-300">
                            {/* Badges styling modifiers */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label htmlFor="tech-style-select" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Badge Style</label>
                                <select
                                  id="tech-style-select"
                                  value={techStack.style}
                                  onChange={(e) => setTechStack({ style: e.target.value as any })}
                                  className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
                                >
                                  <option value="flat">Flat</option>
                                  <option value="flat-square">Flat Square</option>
                                  <option value="plastic">Plastic</option>
                                  <option value="for-the-badge">For the Badge</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-4 pt-4">
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={techStack.iconOnly}
                                    onChange={(e) => setTechStack({ iconOnly: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                  />
                                  <span>Icon Only Mode</span>
                                </label>
                              </div>

                              <div className="flex items-center gap-4 pt-4">
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={techStack.groupByCategory}
                                    onChange={(e) => setTechStack({ groupByCategory: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                  />
                                  <span>Group by Category</span>
                                </label>
                              </div>
                            </div>

                            {/* Search / Categories Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                              <div className="w-full sm:w-64">
                                <Input
                                  id="tech-search-input"
                                  value={techSearch}
                                  onChange={(e) => setTechSearch(e.target.value)}
                                  placeholder="Search technologies..."
                                />
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {['All', ...CATEGORIES].map((category) => (
                                  <button
                                    key={category}
                                    type="button"
                                    onClick={() => setActiveTechCategory(category as any)}
                                    className={`px-2.5 py-1 text-2xs font-semibold rounded cursor-pointer transition ${
                                      activeTechCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-150 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {category}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Search Result Grid */}
                            <div>
                              <span className="block text-2xs uppercase tracking-wider font-bold text-gray-400 mb-2">Available Badges</span>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[220px] overflow-y-auto p-2 bg-gray-50 dark:bg-black/20 rounded border border-gray-100 dark:border-gray-900">
                                {TECHNOLOGY_REGISTRY.filter((tech) => {
                                  const matchesSearch = tech.name.toLowerCase().includes(techSearch.toLowerCase());
                                  const matchesCategory = activeTechCategory === 'All' || tech.category === activeTechCategory;
                                  return matchesSearch && matchesCategory;
                                }).map((tech) => {
                                  const isSelected = techStack.selectedIds.includes(tech.id);
                                  const handleSelect = () => {
                                    if (isSelected) {
                                      setTechStack({
                                        selectedIds: techStack.selectedIds.filter((id) => id !== tech.id),
                                      });
                                    } else {
                                      setTechStack({
                                        selectedIds: [...techStack.selectedIds, tech.id],
                                      });
                                    }
                                  };

                                  return (
                                    <button
                                      key={tech.id}
                                      type="button"
                                      onClick={handleSelect}
                                      className={`flex items-center gap-2 p-2 rounded text-left border text-xs font-semibold transition cursor-pointer ${
                                        isSelected
                                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900 text-blue-700 dark:text-blue-400'
                                          : 'bg-white border-gray-250 hover:bg-gray-50 dark:bg-[#1a1a1e] dark:border-gray-800 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                                      }`}
                                    >
                                      <span>{isSelected ? '✓' : '+'}</span>
                                      <span>{tech.name}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Ordered Selection Panel */}
                            {techStack.selectedIds.length > 0 && (
                              <div>
                                <span className="block text-2xs uppercase tracking-wider font-bold text-gray-400 mb-2">Selected Badges Ordering</span>
                                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                                  {techStack.selectedIds.map((techId, index) => {
                                    const tech = TECHNOLOGY_REGISTRY.find((t) => t.id === techId);
                                    if (!tech) return null;
                                    const label = techStack.iconOnly ? '' : encodeURIComponent(tech.name);
                                    const badgeUrl = `https://img.shields.io/badge/${label}-${tech.color}?style=${techStack.style}&logo=${tech.logo}&logoColor=${tech.logoColor}`;

                                    const moveTech = (dir: 'up' | 'down') => {
                                      const idx = techStack.selectedIds.indexOf(techId);
                                      if (dir === 'up' && idx === 0) return;
                                      if (dir === 'down' && idx === techStack.selectedIds.length - 1) return;
                                      const newOrder = [...techStack.selectedIds];
                                      const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
                                      const temp = newOrder[idx];
                                      newOrder[idx] = newOrder[swapIdx];
                                      newOrder[swapIdx] = temp;
                                      setTechStack({ selectedIds: newOrder });
                                    };

                                    return (
                                      <div
                                        key={techId}
                                        className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                                      >
                                        <div className="flex items-center gap-4">
                                          <span className="text-xs font-semibold text-gray-400 w-4">#{index + 1}</span>
                                          {/* eslint-disable-next-line @next/next/no-img-element */}
                                          <img
                                            src={badgeUrl}
                                            alt={tech.name}
                                            className="max-h-[28px] object-contain"
                                            loading="lazy"
                                          />
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => moveTech('up')}
                                            disabled={index === 0}
                                            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                            aria-label={`Move ${tech.name} up`}
                                          >
                                            ▲
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => moveTech('down')}
                                            disabled={index === techStack.selectedIds.length - 1}
                                            className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                            aria-label={`Move ${tech.name} down`}
                                          >
                                            ▼
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setTechStack({
                                                selectedIds: techStack.selectedIds.filter((id) => id !== techId),
                                              });
                                            }}
                                            className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer ml-1"
                                            aria-label={`Remove ${tech.name}`}
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );

                  case 'stats':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            📊 GitHub Stats Builder
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={githubStats.enabled}
                              onChange={(e) => setGithubStats({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {githubStats.enabled && (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 transition-all duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="stats-username" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">GitHub Username</label>
                                <Input
                                  id="stats-username"
                                  value={githubStats.username}
                                  onChange={(e) => setGithubStats({ username: e.target.value })}
                                  placeholder="Username"
                                />
                              </div>
                              <div>
                                <label htmlFor="stats-theme-select" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Card Theme</label>
                                <select
                                  id="stats-theme-select"
                                  value={githubStats.theme}
                                  onChange={(e) => setGithubStats({ theme: e.target.value })}
                                  className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
                                >
                                  <option value="default">Default</option>
                                  <option value="radical">Radical</option>
                                  <option value="tokyonight">Tokyo Night</option>
                                  <option value="onedark">One Dark</option>
                                  <option value="dracula">Dracula</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={githubStats.showIcons}
                                    onChange={(e) => setGithubStats({ showIcons: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                  />
                                  <span>Show Icons</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={githubStats.hideBorder}
                                    onChange={(e) => setGithubStats({ hideBorder: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                                  />
                                  <span>Hide Border</span>
                                </label>
                              </div>

                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={githubStats.cardConfigs.stats.enabled}
                                    onChange={(e) => setGithubStats({
                                      cardConfigs: {
                                        ...githubStats.cardConfigs,
                                        stats: { ...githubStats.cardConfigs.stats, enabled: e.target.checked }
                                      }
                                    })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                  />
                                  <span>Stats Card</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={githubStats.cardConfigs.languages.enabled}
                                    onChange={(e) => setGithubStats({
                                      cardConfigs: {
                                        ...githubStats.cardConfigs,
                                        languages: { ...githubStats.cardConfigs.languages, enabled: e.target.checked }
                                      }
                                    })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                  />
                                  <span>Languages Card</span>
                                </label>
                                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={githubStats.cardConfigs.streak.enabled}
                                    onChange={(e) => setGithubStats({
                                      cardConfigs: {
                                        ...githubStats.cardConfigs,
                                        streak: { ...githubStats.cardConfigs.streak, enabled: e.target.checked }
                                      }
                                    })}
                                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                  />
                                  <span>Streak Card</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  case 'achievements':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            🏆 GitHub Achievements Builder
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={achievements.enabled}
                              onChange={(e) => setAchievements({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {achievements.enabled && (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4 transition-all duration-300">
                            <div>
                              <label htmlFor="achievements-username" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">GitHub Username</label>
                              <Input
                                id="achievements-username"
                                value={achievements.username}
                                onChange={(e) => setAchievements({ username: e.target.value })}
                                placeholder="Username"
                              />
                            </div>

                            {/* Widgets Settings mapping */}
                            <div className="space-y-3 pt-2">
                              <span className="block text-2xs uppercase tracking-wider font-bold text-gray-400">Trophy & Counter Widgets</span>
                              <div className="space-y-3">
                                {achievements.order.map((widgetId, index) => {
                                  const widgetConfig = achievements.widgets[widgetId];
                                  if (!widgetConfig) return null;

                                  const widgetNames: Record<string, string> = {
                                    trophy: 'GitHub Profile Trophies',
                                    visitor: 'Komarev Profile Visitors',
                                    graph: 'Activity Graph',
                                    snake: 'Contribution Snake Game',
                                  };
                                  const widgetName = widgetNames[widgetId] || widgetId;

                                  const handleWidgetToggle = () => {
                                    setAchievements({
                                      widgets: {
                                        ...achievements.widgets,
                                        [widgetId]: {
                                          ...widgetConfig,
                                          enabled: !widgetConfig.enabled,
                                        },
                                      },
                                    });
                                  };

                                  const updateWidgetProperty = (prop: string, val: any) => {
                                    setAchievements({
                                      widgets: {
                                        ...achievements.widgets,
                                        [widgetId]: {
                                          ...widgetConfig,
                                          [prop]: val,
                                        },
                                      },
                                    });
                                  };

                                  const moveWidget = (dir: 'up' | 'down') => {
                                    const idx = achievements.order.indexOf(widgetId);
                                    if (dir === 'up' && idx === 0) return;
                                    if (dir === 'down' && idx === achievements.order.length - 1) return;
                                    const newOrder = [...achievements.order];
                                    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
                                    const temp = newOrder[idx];
                                    newOrder[idx] = newOrder[swapIdx];
                                    newOrder[swapIdx] = temp;
                                    setAchievements({ order: newOrder });
                                  };

                                  // Preview generation
                                  const userVal = achievements.username.trim() || 'username';
                                  let previewUrl = '';
                                  if (widgetId === 'trophy') {
                                    previewUrl = `https://github-profile-trophy.vercel.app/?username=${userVal}&theme=${widgetConfig.theme || 'flat'}`;
                                  } else if (widgetId === 'visitor') {
                                    previewUrl = `https://komarev.com/ghpvc/?username=${userVal}&color=${widgetConfig.color || '0078d7'}&style=${widgetConfig.style || 'flat'}`;
                                  } else if (widgetId === 'graph') {
                                    previewUrl = `https://github-readme-activity-graph.vercel.app/graph?username=${userVal}&theme=${widgetConfig.theme || 'github'}&hide_border=${widgetConfig.hideBorder || false}`;
                                  }

                                  return (
                                    <div
                                      key={widgetId}
                                      className={`p-4 rounded-md border transition duration-150 space-y-3 ${
                                        widgetConfig.enabled
                                          ? 'border-blue-200 dark:border-blue-900 bg-blue-50/10 dark:bg-blue-950/5'
                                          : 'border-gray-200 dark:border-gray-800'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={widgetConfig.enabled}
                                            onChange={handleWidgetToggle}
                                            className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                                            aria-label={`Toggle ${widgetName}`}
                                          />
                                          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{widgetName}</span>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => moveWidget('up')}
                                            disabled={index === 0}
                                            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                            aria-label={`Move ${widgetName} up`}
                                          >
                                            ▲
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => moveWidget('down')}
                                            disabled={index === achievements.order.length - 1}
                                            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                                            aria-label={`Move ${widgetName} down`}
                                          >
                                            ▼
                                          </button>
                                        </div>
                                      </div>

                                      {widgetConfig.enabled && (
                                        <div className="space-y-3">
                                          {widgetId === 'trophy' && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                              <div>
                                                <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Theme</label>
                                                <select
                                                  value={widgetConfig.theme || 'flat'}
                                                  onChange={(e) => updateWidgetProperty('theme', e.target.value)}
                                                  className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                                >
                                                  <option value="flat">Flat</option>
                                                  <option value="juicyfresh">Juicy Fresh</option>
                                                  <option value="radical">Radical</option>
                                                  <option value="dracula">Dracula</option>
                                                </select>
                                              </div>
                                            </div>
                                          )}

                                          {widgetId === 'visitor' && (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                              <div>
                                                <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Style</label>
                                                <select
                                                  value={widgetConfig.style || 'flat'}
                                                  onChange={(e) => updateWidgetProperty('style', e.target.value)}
                                                  className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                                >
                                                  <option value="flat">Flat</option>
                                                  <option value="flat-square">Flat Square</option>
                                                  <option value="plastic">Plastic</option>
                                                  <option value="for-the-badge">For the Badge</option>
                                                </select>
                                              </div>
                                              <div>
                                                <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Hex Color</label>
                                                <input
                                                  type="text"
                                                  placeholder="0078d7"
                                                  value={widgetConfig.color || ''}
                                                  onChange={(e) => updateWidgetProperty('color', e.target.value)}
                                                  className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                                />
                                              </div>
                                            </div>
                                          )}

                                          {widgetId === 'graph' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                              <div>
                                                <label className="block text-2xs uppercase tracking-wider text-gray-400 font-bold mb-0.5">Theme</label>
                                                <select
                                                  value={widgetConfig.theme || 'github'}
                                                  onChange={(e) => updateWidgetProperty('theme', e.target.value)}
                                                  className="w-full text-xs p-1.5 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                                                >
                                                  <option value="github">GitHub</option>
                                                  <option value="radical">Radical</option>
                                                  <option value="dracula">Dracula</option>
                                                  <option value="tokyonight">Tokyo Night</option>
                                                </select>
                                              </div>
                                              <div className="flex items-center pt-4">
                                                <label className="flex items-center gap-1 text-2xs text-gray-600 dark:text-gray-400 cursor-pointer">
                                                  <input
                                                    type="checkbox"
                                                    checked={!!widgetConfig.hideBorder}
                                                    onChange={(e) => updateWidgetProperty('hideBorder', e.target.checked)}
                                                    className="rounded border-gray-300 dark:bg-gray-800"
                                                  />
                                                  <span>Hide Border</span>
                                                </label>
                                              </div>
                                            </div>
                                          )}

                                          {widgetId === 'snake' && (
                                            <span className="block text-2xs text-gray-400 italic">
                                              * Requires generating snake SVG via GitHub Action workflow. Future-ready configuration.
                                            </span>
                                          )}

                                          {/* Preview container */}
                                          {previewUrl && (
                                            <div className="pt-2 flex justify-center bg-white dark:bg-black/30 p-3 rounded border border-gray-105 dark:border-gray-900 overflow-auto">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img
                                                src={previewUrl}
                                                alt={`${widgetName} Preview`}
                                                className="max-h-[160px] object-contain"
                                                loading="lazy"
                                                onError={(e) => {
                                                  (e.target as HTMLElement).style.display = 'none';
                                                }}
                                              />
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  case 'projects':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            📂 Featured Projects Config
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={featuredProjects.enabled}
                              onChange={(e) => setFeaturedProjects({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {/* Fallback plain-text mode when builder disabled */}
                        {!featuredProjects.enabled && (
                          <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-400 dark:text-gray-500">Enable the builder above for rich project cards. Or use plain text below.</p>
                            <div>
                              <label htmlFor="readme-projects" className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Projects / Repositories List</label>
                              <Textarea
                                id="readme-projects"
                                value={projects}
                                onChange={(e) => setProjects(e.target.value)}
                                placeholder="Projects (comma-separated or list)"
                                rows={4}
                                loading={loading}
                                disabled={loading}
                              />
                            </div>
                          </div>
                        )}

                        {/* Featured Projects Builder */}
                        {featuredProjects.enabled && (
                          <div className="space-y-6 pt-4 border-t border-gray-100 dark:border-gray-800">

                            {/* ── Display Options ─────────────────────── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Card Style</label>
                                <select
                                  value={featuredProjects.cardStyle}
                                  onChange={(e) => setFeaturedProjects({ cardStyle: e.target.value as any })}
                                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 transition"
                                >
                                  <option value="minimal">Minimal</option>
                                  <option value="modern">Modern</option>
                                  <option value="compact">Compact Table</option>
                                  <option value="grid">Grid</option>
                                  <option value="gprm">GPRM Style</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Layout</label>
                                <select
                                  value={featuredProjects.layout}
                                  onChange={(e) => setFeaturedProjects({ layout: e.target.value as any })}
                                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 transition"
                                >
                                  <option value="1-col">1 Column</option>
                                  <option value="2-col">2 Columns</option>
                                  <option value="grid">Grid</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Sort By</label>
                                <select
                                  value={featuredProjects.sortMode}
                                  onChange={(e) => setFeaturedProjects({ sortMode: e.target.value as any })}
                                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 transition"
                                >
                                  <option value="manual">Manual Order</option>
                                  <option value="stars">Most Stars</option>
                                  <option value="updated">Recently Updated</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Badge Style</label>
                                <select
                                  value={featuredProjects.badgeStyle}
                                  onChange={(e) => setFeaturedProjects({ badgeStyle: e.target.value as any })}
                                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 transition"
                                >
                                  <option value="flat">Flat</option>
                                  <option value="flat-square">Flat Square</option>
                                  <option value="for-the-badge">For the Badge</option>
                                  <option value="plastic">Plastic</option>
                                </select>
                              </div>
                            </div>

                            {/* ── Show / Hide Toggles ─────────────────── */}
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={featuredProjects.showStars}
                                  onChange={(e) => setFeaturedProjects({ showStars: e.target.checked })}
                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                />
                                <span>⭐ Stars</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={featuredProjects.showForks}
                                  onChange={(e) => setFeaturedProjects({ showForks: e.target.checked })}
                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                />
                                <span>🍴 Forks</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={featuredProjects.showLanguage}
                                  onChange={(e) => setFeaturedProjects({ showLanguage: e.target.checked })}
                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                />
                                <span>🔵 Language</span>
                              </label>
                              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={featuredProjects.showTopics}
                                  onChange={(e) => setFeaturedProjects({ showTopics: e.target.checked })}
                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800"
                                />
                                <span># Topics</span>
                              </label>
                            </div>

                            {/* ── GitHub Repository Fetcher ─────────────────── */}
                            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-800">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Import from GitHub</h4>
                              <div className="flex gap-2">
                                <Input
                                  value={repoUsername}
                                  onChange={(e) => setRepoUsername(e.target.value)}
                                  placeholder="GitHub username…"
                                />
                                <button
                                  type="button"
                                  disabled={reposLoading || !repoUsername.trim()}
                                  aria-label="Fetch GitHub repositories"
                                  onClick={async () => {
                                    setReposLoading(true);
                                    setReposError(null);
                                    try {
                                      const repos = await fetchGithubRepos(repoUsername.trim());
                                      const mapped: FeaturedProject[] = repos
                                        .filter((r) => !r.fork)
                                        .map((r) => ({
                                          id: `gh-${r.name}`,
                                          source: 'github' as const,
                                          repoName: r.name,
                                          description: r.description || '',
                                          language: r.language || '',
                                          stars: r.stargazers_count,
                                          forks: r.forks_count,
                                          topics: r.topics || [],
                                          repoUrl: r.html_url,
                                          updatedAt: r.updated_at || r.pushed_at || '',
                                        }));
                                      setFetchedRepos(mapped);
                                    } catch (err: any) {
                                      setReposError(err.message || 'Failed to fetch repositories.');
                                    } finally {
                                      setReposLoading(false);
                                    }
                                  }}
                                  className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                >
                                  {reposLoading ? 'Loading…' : 'Fetch Repos'}
                                </button>
                              </div>

                              {reposError && (
                                <p className="text-xs text-red-500">{reposError}</p>
                              )}

                              {/* Search + Repo List */}
                              {fetchedRepos.length > 0 && (
                                <div className="space-y-2">
                                  <Input
                                    value={repoSearchQuery}
                                    onChange={(e) => setRepoSearchQuery(e.target.value)}
                                    placeholder="Search repositories…"
                                  />
                                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                                    {fetchedRepos
                                      .filter((r) =>
                                        (r.repoName || '').toLowerCase().includes(repoSearchQuery.toLowerCase()) ||
                                        (r.description || '').toLowerCase().includes(repoSearchQuery.toLowerCase())
                                      )
                                      .map((repo) => {
                                        const alreadyAdded = featuredProjects.projects.some((p) => p.id === repo.id);
                                        return (
                                          <div
                                            key={repo.id}
                                            className="flex items-center justify-between p-2.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                                          >
                                            <div className="flex-1 min-w-0">
                                              <span className="font-semibold text-gray-800 dark:text-gray-200 truncate block">{repo.repoName}</span>
                                              {repo.description && (
                                                <span className="text-gray-400 dark:text-gray-500 truncate block">{repo.description}</span>
                                              )}
                                              <span className="text-gray-300 dark:text-gray-600">
                                                {repo.language && `${repo.language} · `}⭐ {repo.stars} · 🍴 {repo.forks}
                                              </span>
                                            </div>
                                            <button
                                              type="button"
                                              aria-label={alreadyAdded ? `Remove ${repo.repoName}` : `Add ${repo.repoName}`}
                                              onClick={() => {
                                                if (alreadyAdded) {
                                                  setFeaturedProjects({
                                                    projects: featuredProjects.projects.filter((p) => p.id !== repo.id),
                                                  });
                                                } else {
                                                  setFeaturedProjects({
                                                    projects: [...featuredProjects.projects, repo],
                                                  });
                                                }
                                              }}
                                              className={`ml-3 px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                                                alreadyAdded
                                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200'
                                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-200'
                                              }`}
                                            >
                                              {alreadyAdded ? '✕ Remove' : '+ Add'}
                                            </button>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* ── Manual Project Entry ─────────────────────── */}
                            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200 dark:border-gray-800">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Add Custom Project</h4>
                                <button
                                  type="button"
                                  aria-label="Toggle manual project form"
                                  onClick={() => setShowManualForm(!showManualForm)}
                                  className="text-xs font-semibold text-blue-500 hover:text-blue-600 cursor-pointer"
                                >
                                  {showManualForm ? '▲ Hide Form' : '▼ Show Form'}
                                </button>
                              </div>

                              {showManualForm && (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Title *</label>
                                      <Input
                                        value={manualDraft.title || ''}
                                        onChange={(e) => setManualDraft({ ...manualDraft, title: e.target.value })}
                                        placeholder="Project name"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Language / Primary Tech</label>
                                      <Input
                                        value={manualDraft.language || ''}
                                        onChange={(e) => setManualDraft({ ...manualDraft, language: e.target.value })}
                                        placeholder="TypeScript"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">GitHub Repo URL</label>
                                      <Input
                                        value={manualDraft.repoUrl || ''}
                                        onChange={(e) => setManualDraft({ ...manualDraft, repoUrl: e.target.value })}
                                        placeholder="https://github.com/user/repo"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Live Demo URL</label>
                                      <Input
                                        value={manualDraft.demoUrl || ''}
                                        onChange={(e) => setManualDraft({ ...manualDraft, demoUrl: e.target.value })}
                                        placeholder="https://myproject.vercel.app"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Description</label>
                                    <Textarea
                                      value={manualDraft.description || ''}
                                      onChange={(e) => setManualDraft({ ...manualDraft, description: e.target.value })}
                                      placeholder="Short project description…"
                                      rows={2}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Technologies (comma-separated)</label>
                                    <Input
                                      value={manualTechInput}
                                      onChange={(e) => setManualTechInput(e.target.value)}
                                      placeholder="React, Node.js, PostgreSQL"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    disabled={!manualDraft.title?.trim()}
                                    aria-label="Add manual project to list"
                                    onClick={() => {
                                      if (!manualDraft.title?.trim()) return;
                                      const newProject: FeaturedProject = {
                                        id: `manual-${Date.now()}`,
                                        source: 'manual',
                                        title: manualDraft.title,
                                        description: manualDraft.description || '',
                                        repoUrl: manualDraft.repoUrl || '',
                                        demoUrl: manualDraft.demoUrl || '',
                                        language: manualDraft.language || '',
                                        technologies: manualTechInput
                                          ? manualTechInput.split(',').map((t) => t.trim()).filter(Boolean)
                                          : [],
                                      };
                                      setFeaturedProjects({
                                        projects: [...featuredProjects.projects, newProject],
                                      });
                                      setManualDraft({ source: 'manual', title: '', description: '', repoUrl: '', demoUrl: '', language: '', technologies: [] });
                                      setManualTechInput('');
                                      setShowManualForm(false);
                                    }}
                                    className="w-full py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md transition disabled:opacity-50 cursor-pointer"
                                  >
                                    + Add Custom Project
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* ── Current Projects List ──────────────────── */}
                            {featuredProjects.projects.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                  Selected Projects ({featuredProjects.projects.length})
                                </h4>
                                {featuredProjects.projects.map((project, idx) => (
                                  <div
                                    key={project.id}
                                    className="flex items-center justify-between p-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <span className="text-gray-400 cursor-move select-none">⋮⋮</span>
                                      <div className="min-w-0">
                                        <span className="font-semibold text-gray-800 dark:text-gray-200 block truncate">
                                          {project.title || project.repoName}
                                        </span>
                                        <span className="text-gray-400 dark:text-gray-500 block truncate">
                                          {project.source === 'github' ? '🐙 GitHub' : '✏️ Manual'}
                                          {project.language ? ` · ${project.language}` : ''}
                                          {project.stars !== undefined ? ` · ⭐ ${project.stars}` : ''}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex gap-1 items-center ml-2">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        aria-label={`Move ${project.title || project.repoName} up`}
                                        onClick={() => {
                                          const newProjects = [...featuredProjects.projects];
                                          [newProjects[idx - 1], newProjects[idx]] = [newProjects[idx], newProjects[idx - 1]];
                                          setFeaturedProjects({ projects: newProjects });
                                        }}
                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-20 cursor-pointer"
                                      >▲</button>
                                      <button
                                        type="button"
                                        disabled={idx === featuredProjects.projects.length - 1}
                                        aria-label={`Move ${project.title || project.repoName} down`}
                                        onClick={() => {
                                          const newProjects = [...featuredProjects.projects];
                                          [newProjects[idx + 1], newProjects[idx]] = [newProjects[idx], newProjects[idx + 1]];
                                          setFeaturedProjects({ projects: newProjects });
                                        }}
                                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 disabled:opacity-20 cursor-pointer"
                                      >▼</button>
                                      <button
                                        type="button"
                                        aria-label={`Remove ${project.title || project.repoName}`}
                                        onClick={() =>
                                          setFeaturedProjects({
                                            projects: featuredProjects.projects.filter((p) => p.id !== project.id),
                                          })
                                        }
                                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 cursor-pointer ml-1"
                                      >✕</button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    );

                  case 'support':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            💖 Support Me Config
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={support.enabled}
                              onChange={(e) => setSupport({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {support.enabled && (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Buy Me a Coffee Username</label>
                                <Input
                                  value={support.buyMeACoffeeUsername || ''}
                                  onChange={(e) => setSupport({ buyMeACoffeeUsername: e.target.value })}
                                  placeholder="username"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Ko-fi Username</label>
                                <Input
                                  value={support.kofiUsername || ''}
                                  onChange={(e) => setSupport({ kofiUsername: e.target.value })}
                                  placeholder="username"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Badge Style</label>
                              <select
                                value={support.style}
                                onChange={(e) => setSupport({ style: e.target.value as any })}
                                className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
                              >
                                <option value="flat">Flat</option>
                                <option value="flat-square">Flat Square</option>
                                <option value="for-the-badge">For the Badge</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  case 'quotes':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            💬 Quotes Config
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={quotes.enabled}
                              onChange={(e) => setQuotes({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {quotes.enabled && (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Theme</label>
                                <select
                                  value={quotes.theme}
                                  onChange={(e) => setQuotes({ theme: e.target.value })}
                                  className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
                                >
                                  <option value="radical">Radical</option>
                                  <option value="dracula">Dracula</option>
                                  <option value="github">GitHub</option>
                                  <option value="tokyonight">Tokyo Night</option>
                                  <option value="default">Default</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Quote Type</label>
                                <select
                                  value={quotes.quoteType}
                                  onChange={(e) => setQuotes({ quoteType: e.target.value as any })}
                                  className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
                                >
                                  <option value="programming">Programming</option>
                                  <option value="funny">Funny</option>
                                  <option value="motivational">Motivational</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  case 'visitor':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            👀 Standalone Visitor Counter
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={standaloneVisitor.enabled}
                              onChange={(e) => setStandaloneVisitor({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {standaloneVisitor.enabled && (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">GitHub Username</label>
                                <Input
                                  value={standaloneVisitor.username || ''}
                                  onChange={(e) => setStandaloneVisitor({ username: e.target.value })}
                                  placeholder={githubStats.username || 'username'}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Badge Style</label>
                                <select
                                  value={standaloneVisitor.style}
                                  onChange={(e) => setStandaloneVisitor({ style: e.target.value })}
                                  className="w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
                                >
                                  <option value="flat">Flat</option>
                                  <option value="flat-square">Flat Square</option>
                                  <option value="plastic">Plastic</option>
                                  <option value="for-the-badge">For the Badge</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Hex Color / Color Name</label>
                                <Input
                                  value={standaloneVisitor.color}
                                  onChange={(e) => setStandaloneVisitor({ color: e.target.value })}
                                  placeholder="green"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  case 'custom':
                    return (
                      <div key={sectionId} className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                            ✍️ Custom Markdown Config
                          </h3>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customMarkdown.enabled}
                              onChange={(e) => setCustomMarkdown({ enabled: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        {customMarkdown.enabled && (
                          <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-400">Custom Markdown Content</label>
                              <Textarea
                                value={customMarkdown.content}
                                onChange={(e) => setCustomMarkdown({ content: e.target.value })}
                                placeholder="Type any custom markdown or HTML tags here..."
                                rows={5}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );

                  default:
                    return null;
                }
              })}
            </form>

            {/* Sticky Actions Footer */}
            <div className="flex flex-wrap gap-4 mt-8 justify-center p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
              <Button href="/theme" variant="secondary">Theme Studio</Button>
              <Button href="/roadmap-builder" variant="secondary">Create Roadmap</Button>
              <Button href="/preview" variant="primary">Preview Markdown</Button>
              <Button onClick={reset} variant="secondary">Clear</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default READMEBuilderPage;

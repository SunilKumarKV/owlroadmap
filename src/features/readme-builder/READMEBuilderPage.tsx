"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useReadmeStore, { READMEStyleTemplate, GitHubStatsConfig, TechStackConfig } from '@/stores/readme-store';
import { TECHNOLOGY_REGISTRY, CATEGORIES, Technology } from '@/utils/tech-registry';
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
    reset,
  } = useReadmeStore();

  const [techSearch, setTechSearch] = useState('');
  const [activeTechCategory, setActiveTechCategory] = useState<'All' | 'Languages' | 'Frontend' | 'Backend' | 'Database' | 'DevOps & Cloud' | 'Tools'>('All');

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
  ]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 bg-gray-100 dark:bg-[#1e1e1e]">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-8">Create Your GitHub README</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Template Selector */}
      <div className="w-full max-w-lg mb-6">
        <label htmlFor="readme-template-select" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 font-semibold">README Style Template</label>
        <select
          id="readme-template-select"
          value={template}
          onChange={(e) => setTemplate(e.target.value as READMEStyleTemplate)}
          className="w-full px-4 py-2 rounded-md border border-gray-300 dark:bg-[#1e1e1e] dark:text-white dark:border-gray-600 focus:border-blue-500 focus:ring-2 ring-blue-500 transition duration-200"
        >
          <option value="minimal">Minimal</option>
          <option value="professional">Professional</option>
          <option value="developer">Developer</option>
          <option value="open-source">Open Source</option>
          <option value="portfolio">Portfolio</option>
        </select>
      </div>

      <form className="space-y-4 w-full max-w-lg">
        <div>
          <label htmlFor="readme-name" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name</label>
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
          <label htmlFor="readme-role" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Role / Designation</label>
          <Input
            id="readme-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Your Role"
            loading={loading}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="readme-about" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">About Me / Bio</label>
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
          <label htmlFor="readme-skills" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Skills</label>
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
        <div>
          <label htmlFor="readme-projects" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Projects / Repositories</label>
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
        <div>
          <label htmlFor="readme-socials" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Social Links</label>
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

        {/* GitHub Stats Card Section */}
        <div className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
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
                    <option value="neon">Neon</option>
                    <option value="synthwave">Synthwave</option>
                    <option value="dracula">Dracula</option>
                    <option value="merko">Merko</option>
                  </select>
                </div>
              </div>

              {/* Formatting modifiers */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
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
                <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={githubStats.compactMode}
                    onChange={(e) => setGithubStats({ compactMode: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                  />
                  <span>Compact Langs</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-700 dark:text-gray-300">Stats Layout:</span>
                  <select
                    value={githubStats.layout}
                    onChange={(e) => setGithubStats({ layout: e.target.value as any })}
                    className="text-xs px-2 py-1 rounded border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                  >
                    <option value="default">Default</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
              </div>

              {/* Cards Management */}
              <div className="space-y-3 pt-2">
                <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 font-bold">Manage & Reorder Cards</span>
                {githubStats.cardOrder.map((cardId, index) => {
                  const cardConfig = githubStats.cardConfigs[cardId];
                  const label = cardId === 'stats' ? 'General Stats' : cardId === 'languages' ? 'Top Languages' : 'Streak Stats';
                  
                  // Construct preview link if username is set
                  const themeParam = githubStats.theme !== 'default' ? `&theme=${githubStats.theme}` : '';
                  const borderParam = githubStats.hideBorder ? '&hide_border=true' : '';
                  const iconsParam = githubStats.showIcons ? '&show_icons=true' : '';
                  
                  let previewUrl = '';
                  if (githubStats.username) {
                    if (cardId === 'stats') {
                      const layoutParam = githubStats.layout === 'compact' ? '&layout=compact' : '';
                      previewUrl = `https://github-readme-stats.vercel.app/api?username=${githubStats.username}${themeParam}${borderParam}${iconsParam}${layoutParam}`;
                    } else if (cardId === 'languages') {
                      const compactParam = githubStats.compactMode ? '&layout=compact' : '';
                      previewUrl = `https://github-readme-stats.vercel.app/api/top-langs/?username=${githubStats.username}${themeParam}${borderParam}${compactParam}`;
                    } else if (cardId === 'streak') {
                      previewUrl = `https://github-readme-streak-stats.herokuapp.com/?user=${githubStats.username}${themeParam}${borderParam}`;
                    }
                  }

                  const handleToggle = () => {
                    const newConfigs = { ...githubStats.cardConfigs };
                    newConfigs[cardId] = { ...newConfigs[cardId], enabled: !cardConfig.enabled };
                    setGithubStats({ cardConfigs: newConfigs });
                  };

                  const moveCard = (dir: 'up' | 'down') => {
                    const idx = githubStats.cardOrder.indexOf(cardId);
                    if (dir === 'up' && idx === 0) return;
                    if (dir === 'down' && idx === githubStats.cardOrder.length - 1) return;
                    const newOrder = [...githubStats.cardOrder];
                    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
                    const temp = newOrder[idx];
                    newOrder[idx] = newOrder[targetIdx];
                    newOrder[targetIdx] = temp;
                    setGithubStats({ cardOrder: newOrder });
                  };

                  return (
                    <div key={cardId} className="flex flex-col p-3 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`card-toggle-${cardId}`}
                            checked={cardConfig.enabled}
                            onChange={handleToggle}
                            className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 cursor-pointer"
                          />
                          <label htmlFor={`card-toggle-${cardId}`} className="text-sm font-semibold text-gray-800 dark:text-gray-200 cursor-pointer">{label}</label>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveCard('up')}
                            disabled={index === 0}
                            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            aria-label={`Move ${label} up`}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moveCard('down')}
                            disabled={index === githubStats.cardOrder.length - 1}
                            className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            aria-label={`Move ${label} down`}
                          >
                            ▼
                          </button>
                        </div>
                      </div>

                      {cardConfig.enabled && previewUrl && (
                        <div className="pt-2 flex justify-center bg-white dark:bg-black/30 p-2 rounded border border-gray-100 dark:border-gray-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt={`${label} Preview`}
                            className="max-h-[140px] object-contain"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Tech Stack Builder Section */}
        <div className="p-6 bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm space-y-4">
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
              {/* Badge Styling Customizer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={techStack.iconOnly}
                      onChange={(e) => setTechStack({ iconOnly: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                    <span>Icon Only Mode</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={techStack.groupByCategory}
                      onChange={(e) => setTechStack({ groupByCategory: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                    <span>Group by Category</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={techStack.hideEmptyCategories}
                      onChange={(e) => setTechStack({ hideEmptyCategories: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    />
                    <span>Hide Empty Categories</span>
                  </label>
                </div>
              </div>

              {/* Tabs Bar & Search */}
              <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                  <div className="flex flex-wrap gap-1 border-b border-gray-100 dark:border-gray-800/60 pb-1">
                    {(['All', ...CATEGORIES] as const).map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setActiveTechCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md transition duration-150 cursor-pointer ${
                          activeTechCategory === cat
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="w-full md:w-64">
                    <Input
                      id="tech-search-input"
                      value={techSearch}
                      onChange={(e) => setTechSearch(e.target.value)}
                      placeholder="Search technologies..."
                    />
                  </div>
                </div>

                {/* Badges Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[220px] overflow-auto p-2 bg-gray-50 dark:bg-gray-900/40 rounded-md border border-gray-100 dark:border-gray-900">
                  {(() => {
                    const filtered = TECHNOLOGY_REGISTRY.filter((tech) => {
                      const matchesCategory = activeTechCategory === 'All' || tech.category === activeTechCategory;
                      const matchesSearch = tech.name.toLowerCase().includes(techSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    });

                    if (filtered.length === 0) {
                      return <span className="col-span-full text-center text-xs text-gray-400 py-4">No technologies match your filters</span>;
                    }

                    return filtered.map((tech) => {
                      const isSelected = techStack.selectedIds.includes(tech.id);
                      return (
                        <button
                          type="button"
                          key={tech.id}
                          onClick={() => {
                            const selectedIds = isSelected
                              ? techStack.selectedIds.filter((id) => id !== tech.id)
                              : [...techStack.selectedIds, tech.id];
                            setTechStack({ selectedIds });
                          }}
                          className={`flex items-center justify-between p-2 rounded border text-xs transition duration-150 cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {/* Visual small dot representing tech color */}
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: `#${tech.color}` }}
                            />
                            {tech.name}
                          </span>
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Reordering & Previews List */}
              {techStack.selectedIds.length > 0 && (
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 font-bold">Manage & Order Selected Technologies</span>
                  <div className="space-y-2 max-h-[300px] overflow-auto pr-1">
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
      </form>
      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <Button href="/theme" variant="secondary">Theme Studio</Button>
        <Button href="/roadmap-builder" variant="secondary">Create Roadmap</Button>
        <Button href="/preview" variant="primary">Preview Markdown</Button>
        <Button onClick={reset} variant="secondary">Clear</Button>
      </div>
    </div>
  );
};

export default READMEBuilderPage;

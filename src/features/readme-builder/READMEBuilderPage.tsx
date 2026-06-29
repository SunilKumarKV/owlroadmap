"use client";

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Reorder } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Search, Eye, Code, Edit, GripVertical, Maximize2, Minimize2, Copy, Download, RefreshCw, 
  ChevronLeft, ChevronRight, Layout, Moon, Sun, PanelLeftClose, PanelLeft, PanelRightClose, 
  PanelRight, FolderPlus, ArrowLeftRight
} from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Textarea from '@/components/Textarea';
import useReadmeStore, { READMEStyleTemplate, GitHubStatsConfig, TechStackConfig, SocialLinksConfig, SectionId, FeaturedProjectsConfig, FeaturedProject } from '@/stores/readme-store';
import useWorkspaceStore from '@/stores/workspace-store';
import usePanelStore from '@/stores/panel-store';
import useThemeStore from '@/stores/theme-store';
import { TECHNOLOGY_REGISTRY, CATEGORIES, Technology } from '@/utils/tech-registry';
import { SOCIAL_PLATFORM_REGISTRY, SOCIAL_CATEGORIES, SocialPlatform } from '@/utils/social-registry';
import { fetchGithubProfile, fetchGithubRepos } from '@/utils/github-api';
import { generateReadmeMarkdown } from '@/utils/markdown';
import { TEMPLATE_MARKETPLACE, TemplateCategory } from '@/utils/template-registry';
import { parseReadmeMarkdown } from '@/utils/readme-importer';

// Dynamically import the Markdown preview component to disable SSR
const MDMarkdown = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default.Markdown),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-100 dark:bg-gray-800/40 rounded-md h-[400px] flex items-center justify-center text-xs text-gray-400">
        Loading markdown preview...
      </div>
    ),
  }
);


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
    applyTemplate,
    importReadmeData,
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

  // ── Multi-Panel workspace state & selectors ────────────────────────────────
  const {
    builderCollapsed,
    previewCollapsed,
    markdownCollapsed,
    builderSize,
    previewSize,
    markdownSize,
    fullscreenPanel,
    mobileViewMode,
    setBuilderCollapsed,
    setPreviewCollapsed,
    setMarkdownCollapsed,
    setSizes,
    setFullscreenPanel,
    setMobileViewMode,
    resetLayout,
  } = usePanelStore();

  const {
    workspaces,
    activeWorkspaceId,
    createWorkspace,
    setActiveWorkspaceId,
  } = useWorkspaceStore();

  const { theme, setTheme } = useThemeStore();

  // Search input for filtering README section builders
  const [sectionsSearchQuery, setSectionsSearchQuery] = useState('');

  // ── Template Marketplace States ────────────────────────────────────────────
  const [activeBuilderTab, setActiveBuilderTab] = useState<'editor' | 'marketplace'>('editor');
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [selectedMarketplaceCategory, setSelectedMarketplaceCategory] = useState<string>('all');
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
  const [recentlyUsedTemplates, setRecentlyUsedTemplates] = useState<string[]>([]);
  const [previewingTemplate, setPreviewingTemplate] = useState<any | null>(null);

  // ── README Import Wizard States ────────────────────────────────────────────
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMethod, setImportMethod] = useState<'username' | 'repoUrl' | 'rawUrl' | 'paste' | 'upload'>('username');
  const [importUsernameInput, setImportUsernameInput] = useState('');
  const [importRepoUrlInput, setImportRepoUrlInput] = useState('');
  const [importRawUrlInput, setImportRawUrlInput] = useState('');
  const [importPasteMarkdown, setImportPasteMarkdown] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'fetching' | 'parsing' | 'summary' | 'success' | 'error'>('idle');
  const [importStatusMessage, setImportStatusMessage] = useState('');
  const [parsedImportResult, setParsedImportResult] = useState<any | null>(null);
  const [selectedImportSections, setSelectedImportSections] = useState<SectionId[]>([]);
  const [conflictResolution, setConflictResolution] = useState<'new' | 'overwrite' | 'merge'>('new');


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = localStorage.getItem('owlroadmap-fav-templates');
      if (favs) setFavoriteTemplates(JSON.parse(favs));
      
      const recents = localStorage.getItem('owlroadmap-recent-templates');
      if (recents) setRecentlyUsedTemplates(JSON.parse(recents));
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewingTemplate(null);
        setIsImportModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [recentlyUsedTemplates]);

  const toggleFavorite = (id: string) => {
    const updated = favoriteTemplates.includes(id)
      ? favoriteTemplates.filter((fid) => fid !== id)
      : [...favoriteTemplates, id];
    setFavoriteTemplates(updated);
    localStorage.setItem('owlroadmap-fav-templates', JSON.stringify(updated));
  };

  const applyMarketplaceTemplate = (tpl: any) => {
    applyTemplate(tpl);
    const updatedRecents = [tpl.id, ...recentlyUsedTemplates.filter((id) => id !== tpl.id)].slice(0, 4);
    setRecentlyUsedTemplates(updatedRecents);
    localStorage.setItem('owlroadmap-recent-templates', JSON.stringify(updatedRecents));
  };

  const duplicateTemplateToWorkspace = (tpl: any) => {
    const name = prompt(`Enter name for duplicated template workspace:`, `${tpl.name} Workspace`);
    if (name && name.trim()) {
      const wsId = createWorkspace(name.trim(), 'readme');
      // Load workspace immediately
      setActiveWorkspaceId(wsId);
      // Apply template properties to store
      applyTemplate(tpl);
      alert(`Duplicated template to new workspace "${name.trim()}" successfully!`);
    }
  };

  const handleExportConfig = () => {
    const state = useReadmeStore.getState();
    const configData = {
      name: state.name,
      role: state.role,
      about: state.about,
      skills: state.skills,
      projects: state.projects,
      socials: state.socials,
      avatarUrl: state.avatarUrl,
      template: state.template,
      githubStats: state.githubStats,
      techStack: state.techStack,
      socialLinks: state.socialLinks,
      achievements: state.achievements,
      header: state.header,
      sections: state.sections,
      support: state.support,
      quotes: state.quotes,
      customMarkdown: state.customMarkdown,
      standaloneVisitor: state.standaloneVisitor,
      featuredProjects: state.featuredProjects,
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owlroadmap-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.sections || !parsed.sections.sections) {
          alert('Invalid config file format.');
          return;
        }
        useReadmeStore.setState({
          ...parsed,
        });
        alert('Configuration imported successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to parse config file.');
      }
    };
    reader.readAsText(file);
  };

  const executeImportReadme = async (markdownText: string) => {
    try {
      setImportStatus('parsing');
      setImportStatusMessage('Parsing layout structures...');
      
      const parsed = parseReadmeMarkdown(markdownText);
      setParsedImportResult(parsed);
      setSelectedImportSections(parsed.detectedSections);
      
      setImportStatus('summary');
    } catch (err: any) {
      setImportStatus('error');
      setImportStatusMessage(err.message || 'Failed to parse Markdown content.');
    }
  };

  const handleFetchReadme = async () => {
    setImportStatus('fetching');
    setImportStatusMessage('Fetching README content from GitHub...');
    try {
      let markdownText = '';
      if (importMethod === 'username') {
        const username = importUsernameInput.trim();
        if (!username) throw new Error('Please enter a GitHub username.');
        
        // Try fetching via GitHub Raw Usercontent (faster & avoids API limits)
        const rawRes = await fetch(`https://raw.githubusercontent.com/${username}/${username}/main/README.md`);
        if (rawRes.ok) {
          markdownText = await rawRes.text();
        } else {
          // Try master branch
          const masterRes = await fetch(`https://raw.githubusercontent.com/${username}/${username}/master/README.md`);
          if (masterRes.ok) {
            markdownText = await masterRes.text();
          } else {
            // Fallback to API
            const apiRes = await fetch(`https://api.github.com/repos/${username}/${username}/contents/README.md`, {
              headers: { Accept: 'application/vnd.github.v3.raw' }
            });
            if (!apiRes.ok) throw new Error(`Could not find profile README for user "${username}".`);
            markdownText = await apiRes.text();
          }
        }
      } else if (importMethod === 'repoUrl') {
        const urlStr = importRepoUrlInput.trim();
        if (!urlStr) throw new Error('Please enter a GitHub repository URL.');
        
        // Match e.g. https://github.com/owner/repo
        const match = urlStr.match(/github\.com\/([^\/]+)\/([^\/]+)/i);
        if (!match) throw new Error('Invalid GitHub repository URL format.');
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, '');

        const apiRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/README.md`, {
          headers: { Accept: 'application/vnd.github.v3.raw' }
        });
        if (!apiRes.ok) {
          // Fallback to direct raw download on main/master branches
          const rawMain = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`);
          if (rawMain.ok) {
            markdownText = await rawMain.text();
          } else {
            const rawMaster = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`);
            if (rawMaster.ok) {
              markdownText = await rawMaster.text();
            } else {
              throw new Error(`Failed to locate README.md file in repository "${owner}/${repo}".`);
            }
          }
        } else {
          markdownText = await apiRes.text();
        }
      } else if (importMethod === 'rawUrl') {
        const urlStr = importRawUrlInput.trim();
        if (!urlStr) throw new Error('Please enter a raw URL.');
        const res = await fetch(urlStr);
        if (!res.ok) throw new Error('Failed to fetch content from the specified URL.');
        markdownText = await res.text();
      } else if (importMethod === 'paste') {
        markdownText = importPasteMarkdown;
        if (!markdownText.trim()) throw new Error('Please paste your Markdown content.');
      }
      
      await executeImportReadme(markdownText);
    } catch (err: any) {
      setImportStatus('error');
      setImportStatusMessage(err.message || 'An error occurred during fetch.');
    }
  };

  const handleFileUploadImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('fetching');
    setImportStatusMessage('Reading file content...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await executeImportReadme(text);
      } catch (err: any) {
        setImportStatus('error');
        setImportStatusMessage('Failed to read upload file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResolveImport = () => {
    if (!parsedImportResult) return;

    if (conflictResolution === 'new') {
      const workspaceName = prompt('Enter a name for the imported workspace:', 'Imported GitHub Profile');
      if (workspaceName && workspaceName.trim()) {
        const wsId = createWorkspace(workspaceName.trim(), 'readme');
        setActiveWorkspaceId(wsId);
        importReadmeData(parsedImportResult.data, selectedImportSections);
        setIsImportModalOpen(false);
        setImportStatus('idle');
        alert(`Successfully imported README into new workspace "${workspaceName.trim()}"!`);
      }
    } else if (conflictResolution === 'overwrite') {
      if (confirm('Are you sure you want to overwrite your active workspace? All unselected sections will be disabled.')) {
        importReadmeData(parsedImportResult.data, selectedImportSections);
        setIsImportModalOpen(false);
        setImportStatus('idle');
        alert('Active workspace overwritten with imported README sections successfully!');
      }
    } else if (conflictResolution === 'merge') {
      importReadmeData(parsedImportResult.data, selectedImportSections);
      setIsImportModalOpen(false);
      setImportStatus('idle');
      alert('Selected README sections merged into active workspace successfully!');
    }
  };


  // Reactive and editable markdown source state
  const readmeState = useReadmeStore();
  const [localMarkdown, setLocalMarkdown] = useState('');
  const prevMarkdownTextRef = useRef('');

  useEffect(() => {
    const generated = generateReadmeMarkdown(readmeState);
    if (generated !== prevMarkdownTextRef.current) {
      setLocalMarkdown(generated);
      prevMarkdownTextRef.current = generated;
    }
  }, [readmeState]);

  // Synchronized scrolling logic
  const editorScrollRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingEditor = useRef(false);
  const isScrollingPreview = useRef(false);

  const handleEditorScroll = () => {
    if (isScrollingPreview.current) return;
    isScrollingEditor.current = true;
    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;
    if (editor && preview) {
      const editorScrollable = editor.scrollHeight - editor.clientHeight;
      if (editorScrollable > 0) {
        const percentage = editor.scrollTop / editorScrollable;
        const previewScrollable = preview.scrollHeight - preview.clientHeight;
        preview.scrollTop = percentage * previewScrollable;
      }
    }
    setTimeout(() => {
      isScrollingEditor.current = false;
    }, 50);
  };

  const handlePreviewScroll = () => {
    if (isScrollingEditor.current) return;
    isScrollingPreview.current = true;
    const editor = editorScrollRef.current;
    const preview = previewScrollRef.current;
    if (editor && preview) {
      const previewScrollable = preview.scrollHeight - preview.clientHeight;
      if (previewScrollable > 0) {
        const percentage = preview.scrollTop / previewScrollable;
        const editorScrollable = editor.scrollHeight - editor.clientHeight;
        editor.scrollTop = percentage * editorScrollable;
      }
    }
    setTimeout(() => {
      isScrollingPreview.current = false;
    }, 50);
  };

  // Copy & Download helpers
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      useReadmeStore.getState().incrementReadmeExports();
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([localMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    useReadmeStore.getState().incrementReadmeExports();
  };

  // Resizing mouse/pointer drag handler
  const startResizing = (e: React.PointerEvent<HTMLDivElement>, handle: 'left' | 'right') => {
    e.preventDefault();
    const startX = e.clientX;
    const startBuilderSize = builderSize;
    const startPreviewSize = previewSize;
    const startMarkdownSize = markdownSize;
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const containerWidth = container.getBoundingClientRect().width;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPct = (deltaX / containerWidth) * 100;

      if (handle === 'left') {
        const newBuilder = Math.max(15, Math.min(60, startBuilderSize + deltaPct));
        const newPreview = Math.max(15, startPreviewSize - (newBuilder - startBuilderSize));
        setSizes(newBuilder, newPreview, startMarkdownSize);
      } else {
        const newPreview = Math.max(15, Math.min(60, startPreviewSize + deltaPct));
        const newMarkdown = Math.max(15, startMarkdownSize - (newPreview - startPreviewSize));
        setSizes(startBuilderSize, newPreview, newMarkdown);
      }
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Helper to compute display widths based on sizes, collapsed, and fullscreen settings
  const getPanelWidths = () => {
    if (fullscreenPanel) {
      return {
        builder: fullscreenPanel === 'builder' ? '100%' : '0%',
        preview: fullscreenPanel === 'preview' ? '100%' : '0%',
        markdown: fullscreenPanel === 'markdown' ? '100%' : '0%',
      };
    }

    let sum = 0;
    if (!builderCollapsed) sum += builderSize;
    if (!previewCollapsed) sum += previewSize;
    if (!markdownCollapsed) sum += markdownSize;

    if (sum === 0) {
      const visibleCount = [!builderCollapsed, !previewCollapsed, !markdownCollapsed].filter(Boolean).length;
      const defaultVal = visibleCount > 0 ? 100 / visibleCount : 33.3;
      return {
        builder: !builderCollapsed ? `${defaultVal}%` : '0%',
        preview: !previewCollapsed ? `${defaultVal}%` : '0%',
        markdown: !markdownCollapsed ? `${defaultVal}%` : '0%',
      };
    }

    return {
      builder: !builderCollapsed ? `${(builderSize / sum) * 100}%` : '0%',
      preview: !previewCollapsed ? `${(previewSize / sum) * 100}%` : '0%',
      markdown: !markdownCollapsed ? `${(markdownSize / sum) * 100}%` : '0%',
    };
  };

  const panelWidths = getPanelWidths();

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

  const renderSectionConfigForm = (sectionId: SectionId) => {
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
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-50 dark:bg-[#0c0c0e] text-black dark:text-white transition-colors duration-200 overflow-hidden">
      
      {/* ── Global Toolbar / Header ── */}
      <header className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 z-50 flex-shrink-0 gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-lg font-black tracking-tight text-blue-600 dark:text-blue-400 flex items-center gap-1.5 select-none">
            🦉 OwlRoadmap <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/35 text-blue-700 dark:text-blue-300">v1.1.0</span>
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
          {workspaces.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Workspace:</span>
              <select
                value={activeWorkspaceId || ''}
                onChange={(e) => {
                  if (e.target.value === 'new-workspace-trigger') {
                    const name = prompt('Enter workspace name:');
                    if (name && name.trim()) {
                      createWorkspace(name.trim(), 'readme');
                    }
                  } else {
                    setActiveWorkspaceId(e.target.value);
                  }
                }}
                className="px-2 py-1 text-xs rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
                <option value="new-workspace-trigger">+ Create New...</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Template:</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as READMEStyleTemplate)}
              className="px-2 py-1 text-xs rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="minimal">Minimal</option>
              <option value="professional">Professional</option>
              <option value="developer">Developer</option>
              <option value="open-source">Open Source</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Theme:</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="px-2 py-1 text-xs rounded border border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus:border-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="minimal">Minimal Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="gradient">Gradient Theme</option>
              <option value="terminal">Terminal Theme</option>
            </select>
          </div>

          <button
            onClick={resetLayout}
            className="p-1 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer transition text-xs"
            title="Reset panel layouts to defaults"
          >
            <Layout className="h-3.5 w-3.5" />
            <span className="hidden md:inline font-semibold">Reset View</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="p-1 rounded hover:bg-gray-150 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 flex items-center gap-1 cursor-pointer transition text-xs"
            title="Import an existing GitHub Profile README"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            <span className="hidden md:inline font-semibold">Import README</span>
          </button>

          <Button href="/dashboard" variant="secondary" className="!py-1 !px-2.5 !text-xs">
            Dashboard
          </Button>
        </div>
      </header>

      {/* ── Mobile View Tabs Header (visible below lg screen) ── */}
      <div className="lg:hidden flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212] z-40 flex-shrink-0">
        <button
          onClick={() => setMobileViewMode('builder')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            mobileViewMode === 'builder'
              ? 'border-blue-500 text-blue-500 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          ✏️ Section Builder
        </button>
        <button
          onClick={() => setMobileViewMode('preview')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            mobileViewMode === 'preview'
              ? 'border-blue-500 text-blue-500 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          👁️ Live Preview
        </button>
        <button
          onClick={() => setMobileViewMode('markdown')}
          className={`flex-1 py-2.5 text-center text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            mobileViewMode === 'markdown'
              ? 'border-blue-500 text-blue-500 bg-blue-500/5'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          📝 Markdown Output
        </button>
      </div>

      {/* ── Main Workspace Body ── */}
      <div className="flex flex-1 overflow-hidden relative w-full">
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow-md z-50 text-xs flex items-center gap-2">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold hover:text-red-900 cursor-pointer">✕</button>
          </div>
        )}

        {/* Desktop Split Panels */}
        <div className="hidden lg:flex flex-1 w-full h-full overflow-hidden select-none">
          
          {/* 1. Panel: Section Builder */}
          {builderCollapsed && !fullscreenPanel ? (
            <div
              onClick={() => setBuilderCollapsed(false)}
              className="w-9 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/40 flex flex-col items-center py-4 cursor-pointer select-none gap-2 flex-shrink-0 transition"
              title="Expand Section Builder"
            >
              <PanelLeft className="h-4 w-4 text-gray-400" />
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-4 [writing-mode:vertical-lr] rotate-180">Section Builder</span>
            </div>
          ) : (
            (fullscreenPanel === null || fullscreenPanel === 'builder') && (
              <div
                style={{ width: panelWidths.builder }}
                className="flex flex-col h-full bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0"
              >
                {/* Panel Header Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex-shrink-0 items-center justify-between px-2">
                  <div className="flex flex-1">
                    <button
                      onClick={() => setActiveBuilderTab('editor')}
                      className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 cursor-pointer transition ${
                        activeBuilderTab === 'editor'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5'
                          : 'border-transparent text-gray-400'
                      }`}
                    >
                      ✏️ Edit Sections
                    </button>
                    <button
                      onClick={() => setActiveBuilderTab('marketplace')}
                      className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider border-b-2 cursor-pointer transition ${
                        activeBuilderTab === 'marketplace'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5'
                          : 'border-transparent text-gray-400'
                      }`}
                    >
                      🛍️ Marketplace ({TEMPLATE_MARKETPLACE.length})
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setFullscreenPanel(fullscreenPanel === 'builder' ? null : 'builder')}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      title={fullscreenPanel === 'builder' ? "Minimize Panel" : "Maximize Panel"}
                    >
                      {fullscreenPanel === 'builder' ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setBuilderCollapsed(true)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      title="Collapse Panel"
                    >
                      <PanelLeftClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Panel Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-editor-scrollbar">
                  {activeBuilderTab === 'editor' ? (
                    <>
                  
                  {/* Section list (Section Manager) */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/25 border border-gray-200/80 dark:border-gray-800/80 rounded-lg space-y-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-2xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">Section Manager</h4>
                      <div className="relative flex-1 max-w-44">
                        <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Filter sections..."
                          value={sectionsSearchQuery}
                          onChange={(e) => setSectionsSearchQuery(e.target.value)}
                          className="pl-7 pr-2 py-1 w-full text-[11px] rounded border border-gray-200 dark:bg-[#1e1e1e] dark:border-gray-700 focus:border-blue-500 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Layout Presets</span>
                      <div className="flex flex-wrap gap-1">
                        {['minimal', 'modern', 'developer', 'open-source', 'gprm-style'].map((pres) => (
                          <button
                            key={pres}
                            type="button"
                            onClick={() => applyPreset(pres)}
                            className="px-2 py-0.5 text-[10px] font-semibold rounded bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-755 text-gray-600 dark:text-gray-300 transition capitalize cursor-pointer"
                          >
                            {pres.replace('-style', '').replace('gprm', 'GPRM')}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reorder sections */}
                    <Reorder.Group
                      axis="y"
                      values={sections.order}
                      onReorder={(newOrder) => setSections({ order: newOrder })}
                      className="space-y-1"
                    >
                      {sections.order
                        .filter(id => {
                          const config = sections.sections[id];
                          return !sectionsSearchQuery || (config && config.name.toLowerCase().includes(sectionsSearchQuery.toLowerCase()));
                        })
                        .map((sectionId) => {
                          const sectionConfig = sections.sections[sectionId];
                          if (!sectionConfig) return null;

                          return (
                            <Reorder.Item
                              key={sectionId}
                              value={sectionId}
                              className={`flex items-center justify-between p-2 rounded border text-xs select-none transition cursor-grab active:cursor-grabbing ${
                                sectionConfig.enabled
                                  ? 'border-blue-100 dark:border-blue-900 bg-blue-500/5'
                                  : 'border-gray-200 dark:border-gray-800 opacity-60 bg-gray-55/20'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 font-bold">⋮⋮</span>
                                <input
                                  type="checkbox"
                                  checked={sectionConfig.enabled}
                                  onChange={() => setSections({
                                    sections: {
                                      ...sections.sections,
                                      [sectionId]: { ...sectionConfig, enabled: !sectionConfig.enabled }
                                    }
                                  })}
                                  className="rounded text-blue-600 focus:ring-blue-500 dark:bg-gray-850 cursor-pointer"
                                />
                                <span className="font-semibold text-gray-750 dark:text-gray-200">{sectionConfig.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSections({
                                  sections: {
                                    ...sections.sections,
                                    [sectionId]: { ...sectionConfig, collapsed: !sectionConfig.collapsed }
                                  }
                                })}
                                className="text-[10px] text-blue-500 hover:text-blue-600 font-semibold cursor-pointer"
                              >
                                {sectionConfig.collapsed ? 'Expand' : 'Collapse'}
                              </button>
                            </Reorder.Item>
                          );
                        })}
                    </Reorder.Group>
                  </div>

                  {/* Section forms lists */}
                  <div className="space-y-4">
                    {sections.order.map((sectionId) => {
                      const sectionConfig = sections.sections[sectionId];
                      if (!sectionConfig) return null;

                      // Search filter matching
                      if (sectionsSearchQuery && !sectionConfig.name.toLowerCase().includes(sectionsSearchQuery.toLowerCase())) {
                        return null;
                      }

                      // Render collapsed panel placeholder
                      if (sectionConfig.collapsed) {
                        return (
                          <div
                            key={sectionId}
                            className="p-3 bg-gray-50/50 dark:bg-[#151518] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-700 dark:text-gray-300">{sectionConfig.name} Configuration Panel</span>
                              {!sectionConfig.enabled && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-gray-150 dark:bg-gray-800 text-gray-400 uppercase tracking-wide">Disabled</span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSections({
                                sections: {
                                  ...sections.sections,
                                  [sectionId]: { ...sectionConfig, collapsed: false }
                                }
                              })}
                              className="text-2xs text-blue-500 hover:text-blue-650 font-bold cursor-pointer"
                            >
                              Expand Panel
                            </button>
                          </div>
                        );
                      }

                      // Render builder forms
                      return (
                        <div key={sectionId} className="relative">
                          {renderSectionConfigForm(sectionId)}
                        </div>
                      );
                    })}
                  </div>
                    </>
                  ) : (
                    /* Marketplace Gallery */
                    <div className="space-y-4">
                      
                      {/* Search & Category Filter */}
                      <div className="space-y-2 select-none">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search templates..."
                            value={marketplaceSearch}
                            onChange={(e) => setMarketplaceSearch(e.target.value)}
                            className="pl-8 pr-4 py-1.5 w-full text-xs rounded border border-gray-205 dark:bg-[#1e1e1e] dark:border-gray-700 focus:border-blue-500 focus:outline-none transition"
                          />
                        </div>
                        
                        {/* Categories scroll row */}
                        <div className="flex gap-1 overflow-x-auto pb-1.5 custom-editor-scrollbar">
                          {['all', 'minimal', 'modern', 'open-source', 'full-stack', 'frontend', 'ai', 'terminal', 'gprm', 'anime'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedMarketplaceCategory(cat)}
                              className={`px-2.5 py-1 text-[10px] font-bold rounded-full cursor-pointer transition flex-shrink-0 ${
                                selectedMarketplaceCategory === cat
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              {cat === 'all' ? '🌟 All' : cat.toUpperCase().replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Config Save / Load */}
                      <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/20 text-2xs select-none">
                        <span className="font-semibold text-gray-500 dark:text-gray-400">Layout Settings:</span>
                        <div className="flex items-center gap-2">
                          <label className="px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold cursor-pointer transition">
                            📥 Import JSON
                            <input type="file" accept=".json" onChange={handleImportConfig} className="hidden" />
                          </label>
                          <button
                            onClick={handleExportConfig}
                            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-650 dark:text-gray-300 font-bold transition cursor-pointer"
                          >
                            📤 Export Active
                          </button>
                        </div>
                      </div>

                      {/* Template Gallery Cards */}
                      <div className="grid grid-cols-1 gap-4">
                        {TEMPLATE_MARKETPLACE.filter((tpl) => {
                          const matchesCat = selectedMarketplaceCategory === 'all' || tpl.category === selectedMarketplaceCategory;
                          const matchesQuery = tpl.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                                               tpl.description.toLowerCase().includes(marketplaceSearch.toLowerCase());
                          return matchesCat && matchesQuery;
                        }).map((tpl) => {
                          const isFav = favoriteTemplates.includes(tpl.id);
                          const isRecent = recentlyUsedTemplates.includes(tpl.id);

                          return (
                            <div
                              key={tpl.id}
                              className="group p-4 bg-gray-50/40 dark:bg-[#151518] hover:bg-gray-50/70 dark:hover:bg-[#1c1c20] border border-gray-250 dark:border-gray-800 rounded-xl transition duration-200 flex flex-col justify-between"
                            >
                              {/* Layout Mockup representation using dynamic SVG or CSS shapes */}
                              <div className="w-full h-24 bg-white dark:bg-[#0c0c0e] rounded-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center relative overflow-hidden mb-3 select-none">
                                {tpl.id === 'tpl-minimal' && (
                                  <div className="w-full px-4 text-left space-y-1.5 opacity-60">
                                    <div className="w-12 h-2.5 bg-gray-300 dark:bg-gray-700 rounded" />
                                    <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-800 rounded" />
                                    <div className="w-16 h-1 bg-gray-150 dark:bg-gray-900 rounded" />
                                  </div>
                                )}
                                {tpl.id === 'tpl-modern' && (
                                  <div className="w-full flex flex-col items-center space-y-1.5 opacity-60">
                                    <div className="w-24 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
                                    <div className="w-16 h-1.5 bg-gray-300 dark:bg-gray-700 rounded" />
                                    <div className="flex gap-1">
                                      <div className="w-5 h-2 bg-purple-500/35 rounded-full" />
                                      <div className="w-5 h-2 bg-blue-500/35 rounded-full" />
                                    </div>
                                  </div>
                                )}
                                {tpl.id === 'tpl-open-source' && (
                                  <div className="w-full flex flex-col items-center space-y-2 opacity-60 px-4">
                                    <div className="flex gap-1.5 w-full justify-center">
                                      <div className="w-8 h-2 bg-blue-400 dark:bg-blue-600 rounded" />
                                      <div className="w-8 h-2 bg-green-400 dark:bg-green-600 rounded" />
                                    </div>
                                    <div className="w-full h-8 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-850 flex gap-0.5 p-1 items-end">
                                      {[2,4,6,3,5,2,7,4,3,6,8,5,2,4,7,3].map((h, i) => (
                                        <div key={i} style={{ height: `${h * 10}%` }} className="flex-1 bg-green-500 dark:bg-green-600 rounded-sm" />
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {tpl.id === 'tpl-fullstack' && (
                                  <div className="w-full px-4 text-left space-y-2 opacity-60">
                                    <div className="w-16 h-2 bg-green-500 dark:bg-green-600 rounded" />
                                    <div className="grid grid-cols-2 gap-1.5">
                                      <div className="h-6 bg-gray-100 dark:bg-gray-850 rounded border border-gray-200 dark:border-gray-800" />
                                      <div className="h-6 bg-gray-100 dark:bg-gray-855 rounded border border-gray-200 dark:border-gray-800" />
                                    </div>
                                  </div>
                                )}
                                {tpl.id === 'tpl-frontend' && (
                                  <div className="w-full flex flex-col items-center space-y-1.5 opacity-60">
                                    <div className="w-10 h-10 rounded-full border border-pink-500 flex items-center justify-center text-xs">🎨</div>
                                    <div className="w-20 h-1.5 bg-gray-300 dark:bg-gray-700 rounded" />
                                  </div>
                                )}
                                {tpl.id === 'tpl-ai' && (
                                  <div className="w-full px-4 text-left space-y-1 opacity-60 font-mono text-[8px] text-blue-500">
                                    <div>import torch.nn as nn</div>
                                    <div>model = TransformerModel()</div>
                                    <div className="w-20 h-2 bg-blue-500/20 rounded mt-1" />
                                  </div>
                                )}
                                {tpl.id === 'tpl-terminal' && (
                                  <div className="w-full h-full bg-black p-3 font-mono text-[9px] text-[#39ff14] text-left space-y-1.5 opacity-80">
                                    <div>$ systemctl start developer</div>
                                    <div className="animate-pulse">_</div>
                                  </div>
                                )}
                                {tpl.id === 'tpl-gprm' && (
                                  <div className="w-full flex flex-col items-center space-y-1.5 opacity-60">
                                    <div className="w-24 h-2 bg-blue-600 dark:bg-blue-800 rounded" />
                                    <div className="flex gap-2">
                                      <div className="w-8 h-8 bg-gray-150 dark:bg-gray-850 rounded border border-gray-200 dark:border-gray-800" />
                                      <div className="w-8 h-8 bg-gray-150 dark:bg-gray-850 rounded border border-gray-200 dark:border-gray-800" />
                                    </div>
                                  </div>
                                )}
                                {tpl.id === 'tpl-anime' && (
                                  <div className="w-full h-full bg-gradient-to-tr from-pink-500/10 to-purple-500/15 flex flex-col items-center justify-center space-y-1.5 opacity-80">
                                    <div className="text-sm">🌸✨</div>
                                    <div className="w-20 h-2 bg-pink-400 dark:bg-pink-600 rounded" />
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                  {tpl.category}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {isRecent && (
                                    <span className="text-[8px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                                      Recent
                                    </span>
                                  )}
                                  <button
                                    onClick={() => toggleFavorite(tpl.id)}
                                    className="text-xs transition cursor-pointer"
                                    title="Add to Favorites"
                                  >
                                    {isFav ? '❤️' : '🖤'}
                                  </button>
                                </div>
                              </div>

                              <div className="mb-3">
                                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-0.5">{tpl.name}</h4>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">{tpl.description}</p>
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 select-none pt-2 border-t border-gray-100 dark:border-gray-850/60 mt-auto">
                                <button
                                  onClick={() => applyMarketplaceTemplate(tpl)}
                                  className="px-2 py-1 text-2xs font-extrabold rounded bg-blue-600 hover:bg-blue-700 text-white transition text-center cursor-pointer"
                                >
                                  Apply
                                </button>
                                <button
                                  onClick={() => setPreviewingTemplate(tpl)}
                                  className="px-2 py-1 text-2xs font-bold rounded bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition text-center cursor-pointer"
                                >
                                  Preview
                                </button>
                                <button
                                  onClick={() => duplicateTemplateToWorkspace(tpl)}
                                  className="px-2 py-1 text-2xs font-bold rounded bg-gray-100 hover:bg-gray-200 dark:bg-[#1a1a20] dark:hover:bg-[#25252c] text-gray-500 dark:text-gray-450 hover:text-gray-600 transition text-center cursor-pointer"
                                  title="Duplicate template settings to a new workspace"
                                >
                                  Dup
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}
                </div>
              </div>
            )
          )}

          {/* Separator 1 */}
          {!builderCollapsed && !previewCollapsed && !fullscreenPanel && (
            <div
              onPointerDown={(e) => startResizing(e, 'left')}
              className="w-1.5 bg-transparent hover:bg-blue-500/25 transition cursor-col-resize h-full flex-shrink-0 z-30 flex items-center justify-center"
            >
              <div className="w-[2px] h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          )}

          {/* 2. Panel: Live Preview */}
          {previewCollapsed && !fullscreenPanel ? (
            <div
              onClick={() => setPreviewCollapsed(false)}
              className="w-9 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/40 flex flex-col items-center py-4 cursor-pointer select-none gap-2 flex-shrink-0 transition"
              title="Expand Live Preview"
            >
              <Eye className="h-4 w-4 text-gray-400" />
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-4 [writing-mode:vertical-lr] rotate-180">Live Preview</span>
            </div>
          ) : (
            (fullscreenPanel === null || fullscreenPanel === 'preview') && (
              <div
                style={{ width: panelWidths.preview }}
                className="flex flex-col h-full bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 overflow-hidden flex-shrink-0"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex-shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 select-none">
                    👁️ Live Preview
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setFullscreenPanel(fullscreenPanel === 'preview' ? null : 'preview')}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      title={fullscreenPanel === 'preview' ? "Minimize Panel" : "Maximize Panel"}
                    >
                      {fullscreenPanel === 'preview' ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setPreviewCollapsed(true)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      title="Collapse Panel"
                    >
                      <PanelLeftClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Markdown preview renderer */}
                <div
                  ref={previewScrollRef}
                  onScroll={handlePreviewScroll}
                  className="flex-1 overflow-y-auto p-8 bg-white dark:bg-[#101012] custom-editor-scrollbar"
                >
                  <div data-color-mode={theme === 'minimal' ? 'light' : 'dark'} className="theme-preview-container">
                    <MDMarkdown source={localMarkdown} style={{ background: 'transparent', color: 'inherit' }} />
                  </div>
                </div>
              </div>
            )
          )}

          {/* Separator 2 */}
          {!previewCollapsed && !markdownCollapsed && !fullscreenPanel && (
            <div
              onPointerDown={(e) => startResizing(e, 'right')}
              className="w-1.5 bg-transparent hover:bg-blue-500/25 transition cursor-col-resize h-full flex-shrink-0 z-30 flex items-center justify-center"
            >
              <div className="w-[2px] h-10 bg-gray-300 dark:bg-gray-700 rounded-full" />
            </div>
          )}

          {/* 3. Panel: Raw Markdown Output */}
          {markdownCollapsed && !fullscreenPanel ? (
            <div
              onClick={() => setMarkdownCollapsed(false)}
              className="w-9 bg-white dark:bg-[#121212] hover:bg-gray-100 dark:hover:bg-gray-800/40 flex flex-col items-center py-4 cursor-pointer select-none gap-2 flex-shrink-0 transition"
              title="Expand Raw Markdown"
            >
              <Code className="h-4 w-4 text-gray-400" />
              <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mt-4 [writing-mode:vertical-lr] rotate-180">Raw Markdown</span>
            </div>
          ) : (
            (fullscreenPanel === null || fullscreenPanel === 'markdown') && (
              <div
                style={{ width: panelWidths.markdown }}
                className="flex flex-col h-full bg-white dark:bg-[#121212] overflow-hidden flex-shrink-0"
              >
                {/* Panel Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex-shrink-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 select-none">
                    📝 Raw Markdown
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-extrabold rounded bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-extrabold rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                    <button
                      onClick={() => setFullscreenPanel(fullscreenPanel === 'markdown' ? null : 'markdown')}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      title={fullscreenPanel === 'markdown' ? "Minimize Panel" : "Maximize Panel"}
                    >
                      {fullscreenPanel === 'markdown' ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => setMarkdownCollapsed(true)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-850 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      title="Collapse Panel"
                    >
                      <PanelRightClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="flex-1 bg-gray-950 p-4 relative h-full">
                  <textarea
                    ref={editorScrollRef}
                    onScroll={handleEditorScroll}
                    value={localMarkdown}
                    onChange={(e) => setLocalMarkdown(e.target.value)}
                    placeholder="Type or tweak generated markdown here..."
                    className="w-full h-full font-mono text-xs text-slate-300 bg-transparent resize-none border-none outline-none focus:ring-0 leading-relaxed custom-editor-scrollbar overflow-y-auto raw-markdown-editor"
                  />
                </div>
              </div>
            )
          )}

        </div>

        {/* ── Mobile Layout Columns (visible below lg screen) ── */}
        <div className="lg:hidden flex-1 w-full h-full overflow-hidden flex flex-col">
          {mobileViewMode === 'builder' && (
            <div className="flex-1 overflow-y-auto bg-white dark:bg-[#121212] flex flex-col h-full">
              
              {/* Tab Header inside mobile builder tab */}
              <div className="flex border-b border-gray-150 dark:border-gray-800 bg-gray-50/20 dark:bg-gray-900/5 flex-shrink-0">
                <button
                  onClick={() => setActiveBuilderTab('editor')}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 cursor-pointer transition ${
                    activeBuilderTab === 'editor'
                      ? 'border-blue-500 text-blue-500 bg-blue-500/5'
                      : 'border-transparent text-gray-405'
                  }`}
                >
                  ✏️ Section Editor
                </button>
                <button
                  onClick={() => setActiveBuilderTab('marketplace')}
                  className={`flex-1 py-2 text-xs font-bold border-b-2 cursor-pointer transition ${
                    activeBuilderTab === 'marketplace'
                      ? 'border-blue-500 text-blue-500 bg-blue-500/5'
                      : 'border-transparent text-gray-405'
                  }`}
                >
                  🛍️ Marketplace ({TEMPLATE_MARKETPLACE.length})
                </button>
              </div>

              {/* Render contents based on Mobile tab */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-editor-scrollbar">
                {activeBuilderTab === 'editor' ? (
                  <>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Section Manager</h4>
                      <Reorder.Group
                        axis="y"
                        values={sections.order}
                        onReorder={(newOrder) => setSections({ order: newOrder })}
                        className="space-y-1"
                      >
                        {sections.order.map((sectionId) => {
                          const sectionConfig = sections.sections[sectionId];
                          if (!sectionConfig) return null;
                          return (
                            <div
                              key={sectionId}
                              className={`flex items-center justify-between p-2 rounded border text-xs select-none ${
                                sectionConfig.enabled ? 'border-blue-200 dark:border-blue-900 bg-blue-500/5' : 'border-gray-200 dark:border-gray-800 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={sectionConfig.enabled}
                                  onChange={() => setSections({
                                    sections: { ...sections.sections, [sectionId]: { ...sectionConfig, enabled: !sectionConfig.enabled } }
                                  })}
                                  className="rounded text-blue-600 cursor-pointer"
                                />
                                <span>{sectionConfig.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </Reorder.Group>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      {sections.order.map((sectionId) => {
                        const sectionConfig = sections.sections[sectionId];
                        if (!sectionConfig || !sectionConfig.enabled) return null;
                        return (
                          <div key={sectionId}>
                            {renderSectionConfigForm(sectionId)}
                          </div>
                        );
                      })}
                    </form>
                  </>
                ) : (
                  /* Mobile Marketplace view */
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search templates..."
                        value={marketplaceSearch}
                        onChange={(e) => setMarketplaceSearch(e.target.value)}
                        className="pl-8 pr-4 py-1.5 w-full text-xs rounded border border-gray-205 dark:bg-[#1e1e1e] dark:border-gray-700 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {TEMPLATE_MARKETPLACE.filter((tpl) =>
                        tpl.name.toLowerCase().includes(marketplaceSearch.toLowerCase()) ||
                        tpl.description.toLowerCase().includes(marketplaceSearch.toLowerCase())
                      ).map((tpl) => (
                        <div key={tpl.id} className="p-4 bg-gray-50/50 dark:bg-[#151518] border border-gray-200 dark:border-gray-800 rounded-xl space-y-3">
                          <div>
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                              {tpl.category}
                            </span>
                            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">{tpl.name}</h4>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">{tpl.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => applyMarketplaceTemplate(tpl)}
                              className="flex-1 py-1.5 text-xs font-bold rounded bg-blue-600 text-white cursor-pointer"
                            >
                              Apply
                            </button>
                            <button
                              onClick={() => setPreviewingTemplate(tpl)}
                              className="flex-1 py-1.5 text-xs font-bold rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-pointer"
                            >
                              Preview
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {mobileViewMode === 'preview' && (
            <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-[#101012] custom-editor-scrollbar">
              <div data-color-mode={theme === 'minimal' ? 'light' : 'dark'} className="theme-preview-container">
                <MDMarkdown source={localMarkdown} style={{ background: 'transparent', color: 'inherit' }} />
              </div>
            </div>
          )}

          {mobileViewMode === 'markdown' && (
            <div className="flex-1 flex flex-col bg-gray-950 overflow-hidden relative">
              <div className="flex items-center justify-end gap-2 p-2 border-b border-gray-800 bg-gray-900/50 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-xs font-bold rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1 text-xs font-bold rounded bg-gray-850 hover:bg-gray-800 text-gray-300 cursor-pointer"
                >
                  Download
                </button>
              </div>
              <div className="flex-1 p-4 overflow-hidden relative h-full">
                <textarea
                  value={localMarkdown}
                  onChange={(e) => setLocalMarkdown(e.target.value)}
                  className="w-full h-full font-mono text-xs text-slate-300 bg-transparent resize-none border-none outline-none focus:ring-0 leading-relaxed custom-editor-scrollbar overflow-y-auto raw-markdown-editor"
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Detailed Preview Modal Overlay (Escape Key Supported) ── */}
      {previewingTemplate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-[#121212] border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Template Details</span>
              <button
                onClick={() => setPreviewingTemplate(null)}
                className="text-gray-400 hover:text-gray-600 transition font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>
            {/* Modal Content */}
            <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-editor-scrollbar text-xs">
              <div className="space-y-1">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  {previewingTemplate.category}
                </span>
                <h3 className="text-base font-bold text-black dark:text-white mt-1.5">{previewingTemplate.name}</h3>
                <p className="text-gray-400 dark:text-gray-550 leading-relaxed mt-0.5">{previewingTemplate.description}</p>
              </div>

              <div className="space-y-2 border-t border-gray-100 dark:border-gray-850 pt-4">
                <span className="font-semibold text-gray-500 dark:text-gray-450 block">Layout Configuration:</span>
                <div className="flex flex-wrap gap-1.5">
                  {previewingTemplate.sections.map((id: SectionId) => (
                    <span key={id} className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-650 dark:text-gray-300 font-medium">
                      📂 {id}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 dark:border-gray-850 pt-4">
                <span className="font-semibold text-gray-500 dark:text-gray-450 block">Theme Styling:</span>
                <span className="inline-block capitalize px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
                  🎨 {previewingTemplate.theme} Theme
                </span>
              </div>
            </div>
            {/* Footer actions */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 select-none">
              <button
                onClick={() => setPreviewingTemplate(null)}
                className="px-4 py-2 rounded text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  applyMarketplaceTemplate(previewingTemplate);
                  setPreviewingTemplate(null);
                }}
                className="px-4 py-2 rounded text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                Apply Template
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── README Import Wizard Modal ── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-[#121212] border border-gray-205 dark:border-gray-800 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 flex-shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Import Existing README</span>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus('idle');
                }}
                className="text-gray-400 hover:text-gray-600 transition font-bold cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-editor-scrollbar flex-1 text-xs space-y-4">
              {importStatus === 'idle' || importStatus === 'fetching' || importStatus === 'parsing' || importStatus === 'error' ? (
                <div className="space-y-4">
                  {/* Step 1: Input source selector tabs */}
                  <div className="flex border-b border-gray-150 dark:border-gray-800 flex-shrink-0 select-none">
                    {(['username', 'repoUrl', 'rawUrl', 'paste', 'upload'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setImportMethod(method)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border-b-2 cursor-pointer transition ${
                          importMethod === method
                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {method === 'username' && '👤 Username'}
                        {method === 'repoUrl' && '📦 Repo URL'}
                        {method === 'rawUrl' && '🔗 Raw URL'}
                        {method === 'paste' && '📝 Paste MD'}
                        {method === 'upload' && '📤 Upload'}
                      </button>
                    ))}
                  </div>

                  {/* Input Form Fields */}
                  <div className="space-y-3 pt-2">
                    {importMethod === 'username' && (
                      <div className="space-y-1.5">
                        <label className="font-semibold text-gray-550 block">GitHub Username</label>
                        <input
                          type="text"
                          placeholder="e.g. octocat"
                          value={importUsernameInput}
                          onChange={(e) => setImportUsernameInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded border border-gray-200 dark:bg-[#1e1e1e] dark:border-gray-700 focus:border-blue-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-400">Fetches the README from your personal profile repository (e.g. username/username).</p>
                      </div>
                    )}

                    {importMethod === 'repoUrl' && (
                      <div className="space-y-1.5">
                        <label className="font-semibold text-gray-550 block">GitHub Repository URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://github.com/octocat/hello-world"
                          value={importRepoUrlInput}
                          onChange={(e) => setImportRepoUrlInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded border border-gray-200 dark:bg-[#1e1e1e] dark:border-gray-700 focus:border-blue-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-400">Fetches the README.md file directly from the repository's root directory.</p>
                      </div>
                    )}

                    {importMethod === 'rawUrl' && (
                      <div className="space-y-1.5">
                        <label className="font-semibold text-gray-550 block">Raw Markdown URL</label>
                        <input
                          type="text"
                          placeholder="e.g. https://raw.githubusercontent.com/..."
                          value={importRawUrlInput}
                          onChange={(e) => setImportRawUrlInput(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded border border-gray-200 dark:bg-[#1e1e1e] dark:border-gray-700 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    )}

                    {importMethod === 'paste' && (
                      <div className="space-y-1.5">
                        <label className="font-semibold text-gray-550 block">Paste Markdown</label>
                        <textarea
                          placeholder="Paste raw markdown content here..."
                          value={importPasteMarkdown}
                          onChange={(e) => setImportPasteMarkdown(e.target.value)}
                          className="w-full h-44 px-3 py-2 text-xs rounded border border-gray-200 dark:bg-[#1e1e1e] dark:border-gray-700 focus:border-blue-500 focus:outline-none font-mono resize-none custom-editor-scrollbar"
                        />
                      </div>
                    )}

                    {importMethod === 'upload' && (
                      <div className="space-y-2 select-none">
                        <label className="font-semibold text-gray-550 block">Upload README.md File</label>
                        <label className="h-32 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg flex flex-col items-center justify-center gap-2 bg-gray-50/20 hover:bg-gray-55/35 cursor-pointer transition">
                          <span className="text-xl">📂</span>
                          <span className="text-2xs font-bold text-gray-400">Click or drop README.md file here</span>
                          <input type="file" accept=".md" onChange={handleFileUploadImport} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Status Indicator */}
                  {(importStatus === 'fetching' || importStatus === 'parsing') && (
                    <div className="flex items-center gap-3 p-3 rounded bg-blue-500/5 text-blue-600 dark:text-blue-400 font-semibold select-none border border-blue-500/10">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-blue-500" />
                      <span>{importStatusMessage}</span>
                    </div>
                  )}

                  {importStatus === 'error' && (
                    <div className="p-3 rounded bg-red-500/5 text-red-600 dark:text-red-400 font-semibold border border-red-500/10">
                      ⚠️ {importStatusMessage}
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Summary Checkboxes & Conflict Selection */
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">Section Detection Summary</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">We scanned the markdown layout and identified these sections. Select which ones you want to import:</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 select-none">
                    {parsedImportResult?.detectedSections.map((sectionId: SectionId) => {
                      const isSelected = selectedImportSections.includes(sectionId);
                      return (
                        <label
                          key={sectionId}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition ${
                            isSelected
                              ? 'border-blue-200 dark:border-blue-900 bg-blue-500/5 text-blue-600 dark:text-blue-450 font-bold'
                              : 'border-gray-200 dark:border-gray-800 text-gray-550'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              const updated = isSelected
                                ? selectedImportSections.filter((id) => id !== sectionId)
                                : [...selectedImportSections, sectionId];
                              setSelectedImportSections(updated);
                            }}
                            className="rounded text-blue-600 cursor-pointer focus:ring-0"
                          />
                          <span className="capitalize">{sectionId.replace(/([A-Z])/g, ' $1')}</span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 dark:border-gray-850 pt-4 space-y-3">
                    <div>
                      <h4 className="text-2xs font-extrabold uppercase tracking-wider text-gray-400">Conflict Resolution</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">How should we apply these sections to your workspace layout?</p>
                    </div>

                    <div className="space-y-2 select-none">
                      <label className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer bg-gray-50/10 hover:bg-gray-50/30">
                        <input
                          type="radio"
                          name="conflict"
                          value="new"
                          checked={conflictResolution === 'new'}
                          onChange={() => setConflictResolution('new')}
                          className="mt-0.5 text-blue-600 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-gray-700 dark:text-gray-300 block">✨ (Recommended) Create new workspace</span>
                          <span className="text-[10px] text-gray-400">Imports into a clean workspace, keeping your active workspace completely safe.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer bg-gray-50/10 hover:bg-gray-55/30">
                        <input
                          type="radio"
                          name="conflict"
                          value="merge"
                          checked={conflictResolution === 'merge'}
                          onChange={() => setConflictResolution('merge')}
                          className="mt-0.5 text-blue-600 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-gray-700 dark:text-gray-300 block">⚡ Merge into active workspace</span>
                          <span className="text-[10px] text-gray-400">Updates settings for selected sections, leaving other sections untouched.</span>
                        </div>
                      </label>

                      <label className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-200 dark:border-gray-800 cursor-pointer bg-gray-50/10 hover:bg-gray-55/30">
                        <input
                          type="radio"
                          name="conflict"
                          value="overwrite"
                          checked={conflictResolution === 'overwrite'}
                          onChange={() => setConflictResolution('overwrite')}
                          className="mt-0.5 text-blue-600 cursor-pointer"
                        />
                        <div>
                          <span className="font-bold text-gray-700 dark:text-gray-300 block">⚠️ Overwrite active workspace</span>
                          <span className="text-[10px] text-gray-400">Replaces layout. Unselected sections will be disabled.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3 flex-shrink-0 select-none">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportStatus('idle');
                }}
                className="px-4 py-2 rounded text-xs font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                Cancel
              </button>

              {importStatus !== 'summary' ? (
                <button
                  onClick={handleFetchReadme}
                  disabled={importStatus === 'fetching' || importStatus === 'parsing'}
                  className="px-4 py-2 rounded text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleResolveImport}
                  disabled={selectedImportSections.length === 0}
                  className="px-4 py-2 rounded text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer disabled:opacity-50"
                >
                  Import Selected Sections
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default READMEBuilderPage;

import { describe, it, expect, beforeEach } from 'vitest';
import useWorkspaceStore from '../workspace-store';
import useReadmeStore from '../readme-store';
import useRoadmapStore from '../roadmap-store';
import useThemeStore from '../theme-store';

describe('useWorkspaceStore', () => {
  beforeEach(() => {
    // Reset all related stores
    useReadmeStore.getState().reset();
    useRoadmapStore.getState().reset();
    useThemeStore.setState({ theme: 'minimal', templatesUsedCount: 0 });
    
    // Clear workspaces
    useWorkspaceStore.setState({
      workspaces: [],
      activeWorkspaceId: null,
    });
  });

  it('should initialize with empty workspaces', () => {
    const state = useWorkspaceStore.getState();
    expect(state.workspaces).toEqual([]);
    expect(state.activeWorkspaceId).toBeNull();
  });

  it('should create workspace and set active workspace', () => {
    const store = useWorkspaceStore.getState();
    const id = store.createWorkspace('Test Workspace', 'readme');

    const state = useWorkspaceStore.getState();
    expect(state.workspaces.length).toBe(1);
    expect(state.workspaces[0].id).toBe(id);
    expect(state.workspaces[0].name).toBe('Test Workspace');
    expect(state.workspaces[0].type).toBe('readme');
    expect(state.activeWorkspaceId).toBe(id);
  });

  it('should rename a workspace', () => {
    const store = useWorkspaceStore.getState();
    const id = store.createWorkspace('Old Name', 'readme');
    
    store.renameWorkspace(id, 'New Name');

    const updated = useWorkspaceStore.getState();
    expect(updated.workspaces[0].name).toBe('New Name');
  });

  it('should duplicate a workspace', () => {
    const store = useWorkspaceStore.getState();
    const id = store.createWorkspace('Original', 'combined');
    
    store.duplicateWorkspace(id);

    const state = useWorkspaceStore.getState();
    expect(state.workspaces.length).toBe(2);
    expect(state.workspaces[1].name).toBe('Original (Copy)');
    expect(state.workspaces[1].id).not.toBe(id);
  });

  it('should delete a workspace', () => {
    const store = useWorkspaceStore.getState();
    const id1 = store.createWorkspace('WS 1', 'readme');
    const id2 = store.createWorkspace('WS 2', 'roadmap');

    expect(useWorkspaceStore.getState().activeWorkspaceId).toBe(id2);

    store.deleteWorkspace(id2);

    const state = useWorkspaceStore.getState();
    expect(state.workspaces.length).toBe(1);
    expect(state.workspaces[0].id).toBe(id1);
    expect(state.activeWorkspaceId).toBe(id1);
  });

  it('should update active workspace data from current store states', () => {
    const store = useWorkspaceStore.getState();
    const id = store.createWorkspace('Combined WS', 'combined');

    useReadmeStore.getState().setName('Jane Doe');
    useReadmeStore.getState().setRole('Manager');
    useRoadmapStore.getState().setField('title', 'Product Manager Path');
    useThemeStore.setState({ theme: 'dark' });

    store.updateActiveWorkspaceData();

    const state = useWorkspaceStore.getState();
    const active = state.workspaces.find((w) => w.id === id);
    expect(active?.readmeData.name).toBe('Jane Doe');
    expect(active?.readmeData.role).toBe('Manager');
    expect(active?.roadmapData.title).toBe('Product Manager Path');
    expect(active?.theme).toBe('dark');
  });

  it('should load a workspace state into readme/roadmap/theme stores', () => {
    const store = useWorkspaceStore.getState();
    const id = store.createWorkspace('Test WS', 'combined');

    useWorkspaceStore.setState({
      workspaces: [
        {
          id,
          name: 'Test WS',
          type: 'combined',
          updatedAt: new Date().toISOString(),
          readmeData: {
            name: 'External Name',
            role: 'Dev',
            about: 'Test about',
            skills: 'HTML',
            projects: 'MyProj',
            socials: 'GitHub',
            avatarUrl: 'https://pic',
            followers: 10,
            following: 5,
            publicRepos: 2,
            template: 'developer',
            repoAnalysis: null,
            aiSuggestions: null,
            aiGenerationsCount: 1,
            githubStats: {
              enabled: true,
              username: 'octocat',
              theme: 'radical',
              hideBorder: false,
              showIcons: true,
              compactMode: false,
              layout: 'default',
              cardOrder: ['stats', 'languages', 'streak'],
              cardConfigs: {
                stats: { enabled: true },
                languages: { enabled: true },
                streak: { enabled: true },
              },
            },
            techStack: {
              enabled: true,
              style: 'for-the-badge',
              iconOnly: false,
              groupByCategory: true,
              hideEmptyCategories: false,
              selectedIds: ['react', 'typescript'],
            },
          },
          roadmapData: {
            title: 'Custom Path',
            steps: ['Step A', 'Step B'],
            template: 'custom-template',
          },
          theme: 'terminal',
        }
      ],
      activeWorkspaceId: id,
    });

    store.loadWorkspace(id);

    expect(useReadmeStore.getState().name).toBe('External Name');
    expect(useReadmeStore.getState().role).toBe('Dev');
    expect(useReadmeStore.getState().template).toBe('developer');
    expect(useRoadmapStore.getState().title).toBe('Custom Path');
    expect(useRoadmapStore.getState().steps).toEqual(['Step A', 'Step B']);
    expect(useThemeStore.getState().theme).toBe('terminal');
  });

  it('should migrate legacy data when workspaces list is empty', () => {
    useReadmeStore.getState().setName('Legacy User');
    useRoadmapStore.getState().setField('title', 'Legacy Roadmap');
    useThemeStore.setState({ theme: 'gradient' });

    const store = useWorkspaceStore.getState();
    store.migrateLegacyData();

    const state = useWorkspaceStore.getState();
    expect(state.workspaces.length).toBe(1);
    expect(state.workspaces[0].id).toBe('default-workspace');
    expect(state.workspaces[0].name).toBe('Default Workspace');
    expect(state.workspaces[0].readmeData.name).toBe('Legacy User');
    expect(state.workspaces[0].roadmapData.title).toBe('Legacy Roadmap');
    expect(state.workspaces[0].theme).toBe('gradient');
    expect(state.activeWorkspaceId).toBe('default-workspace');
  });
});

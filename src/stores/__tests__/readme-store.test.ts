import { describe, it, expect, beforeEach } from 'vitest';
import useREADMEStore from '../readme-store';

describe('useREADMEStore', () => {
  beforeEach(() => {
    useREADMEStore.getState().reset();
  });

  it('should initialize with default values', () => {
    const state = useREADMEStore.getState();
    expect(state.name).toBe('');
    expect(state.role).toBe('');
    expect(state.about).toBe('');
    expect(state.template).toBe('minimal');
    expect(state.readmeExportsCount).toBe(0);
    expect(state.templatesUsedCount).toBe(0);
    expect(state.exportHistory).toEqual([]);
    expect(state.repoAnalysis).toBeNull();
    expect(state.aiSuggestions).toBeNull();
    expect(state.aiGenerationsCount).toBe(0);
  });

  it('should update fields correctly using setters', () => {
    const store = useREADMEStore.getState();
    
    store.setName('John Doe');
    store.setRole('Full Stack Engineer');
    store.setAbout('Hello world');
    store.setFollowers(100);
    store.setFollowing(50);
    store.setPublicRepos(10);
    store.setAvatarUrl('https://example.com/avatar.png');

    const updated = useREADMEStore.getState();
    expect(updated.name).toBe('John Doe');
    expect(updated.role).toBe('Full Stack Engineer');
    expect(updated.about).toBe('Hello world');
    expect(updated.followers).toBe(100);
    expect(updated.following).toBe(50);
    expect(updated.publicRepos).toBe(10);
    expect(updated.avatarUrl).toBe('https://example.com/avatar.png');
  });

  it('should set field dynamically via setField', () => {
    const store = useREADMEStore.getState();
    store.setField('name', 'Dynamic Name');
    store.setField('role', 'Dynamic Role');
    
    const updated = useREADMEStore.getState();
    expect(updated.name).toBe('Dynamic Name');
    expect(updated.role).toBe('Dynamic Role');
  });

  it('should update template and increment templatesUsedCount', () => {
    const store = useREADMEStore.getState();
    store.setTemplate('developer');

    const updated = useREADMEStore.getState();
    expect(updated.template).toBe('developer');
    expect(updated.templatesUsedCount).toBe(1);
  });

  it('should increment readme exports', () => {
    const store = useREADMEStore.getState();
    store.incrementReadmeExports();
    expect(useREADMEStore.getState().readmeExportsCount).toBe(1);
  });

  it('should increment templates used', () => {
    const store = useREADMEStore.getState();
    store.incrementTemplatesUsed();
    expect(useREADMEStore.getState().templatesUsedCount).toBe(1);
  });

  it('should increment ai generations count', () => {
    const store = useREADMEStore.getState();
    store.incrementAiGenerations();
    expect(useREADMEStore.getState().aiGenerationsCount).toBe(1);
  });

  it('should add export history items correctly', () => {
    const store = useREADMEStore.getState();
    store.addExportHistoryItem('pdf', 'My Awesome Project');

    const history = useREADMEStore.getState().exportHistory;
    expect(history.length).toBe(1);
    expect(history[0].format).toBe('pdf');
    expect(history[0].projectName).toBe('My Awesome Project');
    expect(history[0].id).toBeDefined();
    expect(history[0].timestamp).toBeDefined();
  });

  it('should support repoAnalysis and aiSuggestions states', () => {
    const store = useREADMEStore.getState();
    const mockAnalysis = {
      languages: [{ name: 'TS', count: 10 }],
      topStarred: [],
      topActive: [],
      suggestedSkills: ['Testing'],
      suggestedTechStack: [],
      suggestedReadmeSections: [],
      totalStars: 100,
      totalForks: 10,
    };
    store.setRepoAnalysis(mockAnalysis);
    expect(useREADMEStore.getState().repoAnalysis).toEqual(mockAnalysis);

    const mockSuggestions = {
      readme: { aboutMe: 'Bio', introduction: 'Intro', skills: 'Sk', projects: 'Proj' },
      roadmap: null,
      profile: null,
    };
    store.setAiSuggestions(mockSuggestions);
    expect(useREADMEStore.getState().aiSuggestions).toEqual(mockSuggestions);
  });

  it('should initialize and modify githubStats config correctly', () => {
    const store = useREADMEStore.getState();
    expect(store.githubStats.enabled).toBe(false);
    expect(store.githubStats.theme).toBe('default');

    store.setGithubStats({ enabled: true, theme: 'radical', username: 'tester' });
    const updated = useREADMEStore.getState().githubStats;
    expect(updated.enabled).toBe(true);
    expect(updated.theme).toBe('radical');
    expect(updated.username).toBe('tester');
    expect(updated.hideBorder).toBe(false); // check other properties remain intact
  });

  it('should support updating techStack configuration', () => {
    const store = useREADMEStore.getState();
    expect(store.techStack.enabled).toBe(false);
    expect(store.techStack.selectedIds).toEqual([]);

    store.setTechStack({
      enabled: true,
      selectedIds: ['javascript', 'react'],
      style: 'plastic',
    });

    const updated = useREADMEStore.getState();
    expect(updated.techStack.enabled).toBe(true);
    expect(updated.techStack.selectedIds).toEqual(['javascript', 'react']);
    expect(updated.techStack.style).toBe('plastic');
  });

  it('should support updating socialLinks configuration', () => {
    const store = useREADMEStore.getState();
    expect(store.socialLinks.enabled).toBe(false);
    expect(store.socialLinks.platforms).toEqual({});

    store.setSocialLinks({
      enabled: true,
      platforms: {
        linkedin: { enabled: true, value: 'john-doe' },
      },
      style: 'flat-square',
    });

    const updated = useREADMEStore.getState();
    expect(updated.socialLinks.enabled).toBe(true);
    expect(updated.socialLinks.platforms.linkedin).toEqual({ enabled: true, value: 'john-doe' });
    expect(updated.socialLinks.style).toBe('flat-square');
  });

  it('should reset state to initial values', () => {
    const store = useREADMEStore.getState();
    store.setName('John');
    store.setTemplate('developer');
    store.incrementReadmeExports();
    store.setTechStack({ enabled: true, selectedIds: ['javascript'] });
    store.setSocialLinks({ enabled: true, platforms: { github: { enabled: true, value: 'john' } } });

    store.reset();

    const resetState = useREADMEStore.getState();
    expect(resetState.name).toBe('');
    expect(resetState.template).toBe('minimal');
    expect(resetState.readmeExportsCount).toBe(0);
    expect(resetState.techStack.enabled).toBe(false);
    expect(resetState.techStack.selectedIds).toEqual([]);
    expect(resetState.socialLinks.enabled).toBe(false);
    expect(resetState.socialLinks.platforms).toEqual({});
  });
});

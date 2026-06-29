import { describe, it, expect, beforeEach } from 'vitest';
import { useHistoryStore, computeConfigDiff } from '../history-store';

describe('history-store', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory();
  });

  const mockConfig1 = {
    name: 'Jane Doe',
    role: 'Backend Architect',
    about: 'I design APIs',
    skills: 'Golang, Rust',
    projects: 'Project Alpha',
    socials: 'github.com/jane',
    avatarUrl: 'https://avatar.url/1',
    template: 'minimal' as const,
    githubStats: { enabled: false, username: '' },
    techStack: { enabled: false, technologies: [] },
    socialLinks: { enabled: false, platforms: [] },
  };

  const mockConfig2 = {
    name: 'Jane Doe Smith',
    role: 'Principal Backend Architect',
    about: 'I design databases and APIs',
    skills: 'Golang, Rust, C++',
    projects: 'Project Alpha, Beta',
    socials: 'github.com/jane, twitter.com/jane',
    avatarUrl: 'https://avatar.url/2',
    template: 'developer' as const,
    githubStats: { enabled: true, username: 'janesmith' },
    techStack: { enabled: true, technologies: ['go', 'rust'] },
    socialLinks: { enabled: true, platforms: ['github'] },
  };

  describe('computeConfigDiff', () => {
    it('should list all major configuration differences correctly', () => {
      const diffs = computeConfigDiff(mockConfig1, mockConfig2);

      expect(diffs).toContain('Modified Name');
      expect(diffs).toContain('Modified Title/Role');
      expect(diffs).toContain('Updated About section');
      expect(diffs).toContain('Modified Skills text');
      expect(diffs).toContain('Updated Projects list');
      expect(diffs).toContain('Modified Social contacts text');
      expect(diffs).toContain('Changed template to developer');
      expect(diffs).toContain('Enabled GitHub Stats');
      expect(diffs).toContain('Enabled Tech Badges');
      expect(diffs).toContain('Enabled Social Badges');
    });

    it('should return initial creation when old config is null', () => {
      const diffs = computeConfigDiff(null, mockConfig1);
      expect(diffs).toContain('Initial workspace creation');
    });
  });

  describe('Snapshots Management', () => {
    it('should create and delete snapshots correctly', () => {
      const store = useHistoryStore.getState();
      expect(store.snapshots.length).toBe(0);

      store.createSnapshot('Manual backup', 'Saved before import', 'manual', mockConfig1);

      const updatedStore = useHistoryStore.getState();
      expect(updatedStore.snapshots.length).toBe(1);
      expect(updatedStore.snapshots[0].title).toBe('Manual backup');
      expect(updatedStore.snapshots[0].source).toBe('manual');
      expect(updatedStore.snapshots[0].config.name).toBe('Jane Doe');

      // Delete snapshot
      const id = updatedStore.snapshots[0].id;
      updatedStore.deleteSnapshot(id);

      const finalStore = useHistoryStore.getState();
      expect(finalStore.snapshots.length).toBe(0);
    });

    it('should export and import snapshots correctly via JSON', () => {
      const store = useHistoryStore.getState();
      const mockSnapshotItem = {
        id: 'test-id',
        title: 'Imported Snapshot',
        description: 'Successfully imported from JSON config',
        timestamp: new Date().toISOString(),
        source: 'manual' as const,
        config: mockConfig1,
        changes: ['Initial creation'],
      };

      const result = store.importSnapshots(JSON.stringify(mockSnapshotItem));
      expect(result.success).toBe(true);

      const updatedStore = useHistoryStore.getState();
      expect(updatedStore.snapshots.length).toBe(1);
      expect(updatedStore.snapshots[0].title).toBe('Imported Snapshot');
      expect(updatedStore.snapshots[0].config.name).toBe('Jane Doe');
    });
  });

  describe('Undo/Redo Stack', () => {
    it('should perform undo and redo transitions correctly', () => {
      const store = useHistoryStore.getState();

      store.pushUndo(mockConfig1);
      expect(useHistoryStore.getState().past.length).toBe(1);

      // Perform undo
      const prevConfig = store.undo(mockConfig2);
      expect(prevConfig).toEqual(mockConfig1);
      expect(useHistoryStore.getState().past.length).toBe(0);
      expect(useHistoryStore.getState().future.length).toBe(1);
      expect(useHistoryStore.getState().future[0]).toEqual(mockConfig2);

      // Perform redo
      const nextConfig = store.redo(mockConfig1);
      expect(nextConfig).toEqual(mockConfig2);
      expect(useHistoryStore.getState().past.length).toBe(1);
      expect(useHistoryStore.getState().future.length).toBe(0);
    });
  });
});

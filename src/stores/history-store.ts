import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { READMEStyleTemplate, GitHubStatsConfig, TechStackConfig, SocialLinksConfig } from './readme-store';

export interface Snapshot {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  source: 'ai' | 'import' | 'template' | 'manual' | 'auto';
  config: {
    name: string;
    role: string;
    about: string;
    skills: string;
    projects: string;
    socials: string;
    avatarUrl: string;
    followers?: number;
    following?: number;
    publicRepos?: number;
    template: READMEStyleTemplate;
    githubStats: any;
    techStack: any;
    socialLinks: any;
  };
  changes: string[];
}

interface HistoryState {
  snapshots: Snapshot[];
  past: any[]; // Stack for undo
  future: any[]; // Stack for redo
  
  // Snapshots Management
  createSnapshot: (title: string, description: string, source: Snapshot['source'], config: Snapshot['config']) => void;
  deleteSnapshot: (id: string) => void;
  clearHistory: () => void;
  importSnapshots: (jsonContent: string) => { success: boolean; error?: string };

  // Undo/Redo Management
  pushUndo: (config: any) => void;
  undo: (currentConfig: any) => any | null;
  redo: (currentConfig: any) => any | null;
}

// Compute differences summary between two snapshots
export function computeConfigDiff(oldCfg: any, newCfg: any): string[] {
  if (!oldCfg) return ['Initial workspace creation'];
  const diffs: string[] = [];

  if (oldCfg.name !== newCfg.name) diffs.push('Modified Name');
  if (oldCfg.role !== newCfg.role) diffs.push('Modified Title/Role');
  if (oldCfg.about !== newCfg.about) diffs.push('Updated About section');
  if (oldCfg.skills !== newCfg.skills) diffs.push('Modified Skills text');
  if (oldCfg.projects !== newCfg.projects) diffs.push('Updated Projects list');
  if (oldCfg.socials !== newCfg.socials) diffs.push('Modified Social contacts text');
  if (oldCfg.template !== newCfg.template) diffs.push(`Changed template to ${newCfg.template}`);
  
  if (oldCfg.githubStats?.enabled !== newCfg.githubStats?.enabled) {
    diffs.push(newCfg.githubStats?.enabled ? 'Enabled GitHub Stats' : 'Disabled GitHub Stats');
  } else if (oldCfg.githubStats?.username !== newCfg.githubStats?.username) {
    diffs.push('Changed GitHub Stats Username');
  }

  if (oldCfg.techStack?.enabled !== newCfg.techStack?.enabled) {
    diffs.push(newCfg.techStack?.enabled ? 'Enabled Tech Badges' : 'Disabled Tech Badges');
  }

  if (oldCfg.socialLinks?.enabled !== newCfg.socialLinks?.enabled) {
    diffs.push(newCfg.socialLinks?.enabled ? 'Enabled Social Badges' : 'Disabled Social Badges');
  }

  return diffs.length > 0 ? diffs : ['Minor styling tweaks'];
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      snapshots: [],
      past: [],
      future: [],

      createSnapshot: (title, description, source, config) => {
        const snapshots = get().snapshots;
        const lastSnapshot = snapshots[0];
        const changes = computeConfigDiff(lastSnapshot?.config, config);

        const newSnapshot: Snapshot = {
          id: `snap-${Math.random().toString(36).substring(2, 9)}`,
          title: title || `${source.toUpperCase()} Snapshot`,
          description: description || 'Automatic version save point',
          timestamp: new Date().toISOString(),
          source,
          config,
          changes,
        };

        set((state) => ({
          snapshots: [newSnapshot, ...state.snapshots].slice(0, 100), // Cap history at 100 versions
        }));
      },

      deleteSnapshot: (id) => {
        set((state) => ({
          snapshots: state.snapshots.filter((snap) => snap.id !== id),
        }));
      },

      clearHistory: () => {
        set({ snapshots: [], past: [], future: [] });
      },

      importSnapshots: (jsonContent) => {
        try {
          const parsed = JSON.parse(jsonContent);
          const list = Array.isArray(parsed) ? parsed : [parsed];

          const importedSnapshots: Snapshot[] = [];

          for (const item of list) {
            if (!item.title || !item.source || !item.config) {
              return { success: false, error: 'Invalid schema. Missing title, source, or config.' };
            }
            importedSnapshots.push({
              id: item.id || `snap-${Math.random().toString(36).substring(2, 9)}`,
              title: item.title,
              description: item.description || 'Imported version save',
              timestamp: item.timestamp || new Date().toISOString(),
              source: item.source,
              config: item.config,
              changes: Array.isArray(item.changes) ? item.changes : ['Imported snapshot'],
            });
          }

          set((state) => {
            const importedIds = importedSnapshots.map((s) => s.id);
            const filtered = state.snapshots.filter((s) => !importedIds.includes(s.id));
            return {
              snapshots: [...importedSnapshots, ...filtered],
            };
          });

          return { success: true };
        } catch (e: any) {
          return { success: false, error: e.message || 'JSON parsing failed' };
        }
      },

      pushUndo: (config) => {
        set((state) => {
          // Prevent adjacent identical duplicates in undo stack
          const lastPast = state.past[state.past.length - 1];
          if (lastPast && JSON.stringify(lastPast) === JSON.stringify(config)) {
            return state;
          }
          return {
            past: [...state.past, config].slice(-30), // Max 30 undo levels
            future: [], // Reset redo on new action
          };
        });
      },

      undo: (currentConfig) => {
        const past = get().past;
        if (past.length === 0) return null;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        set((state) => ({
          past: newPast,
          future: [currentConfig, ...state.future].slice(0, 30),
        }));

        return previous;
      },

      redo: (currentConfig) => {
        const future = get().future;
        if (future.length === 0) return null;

        const next = future[0];
        const newFuture = future.slice(1);

        set((state) => ({
          past: [...state.past, currentConfig].slice(-30),
          future: newFuture,
        }));

        return next;
      },
    }),
    {
      name: 'readme-history-store',
      partialize: (state) => ({
        snapshots: state.snapshots,
      }),
    }
  )
);

/**
 * Featured Projects configuration types and defaults for the README Builder.
 * Extends the existing readme-store with rich project showcase capabilities.
 */

export type ProjectCardStyle = 'minimal' | 'modern' | 'compact' | 'grid' | 'gprm';
export type ProjectLayout = '1-col' | '2-col' | 'grid';
export type ProjectSortMode = 'stars' | 'updated' | 'manual';

/** A project entry from GitHub repositories or manually created */
export interface FeaturedProject {
  id: string;
  /** Source of this project: from GitHub API or manually entered */
  source: 'github' | 'manual';
  // GitHub-sourced fields
  repoName?: string;
  description?: string;
  language?: string;
  stars?: number;
  forks?: number;
  topics?: string[];
  repoUrl?: string;
  updatedAt?: string;
  // Manual override / extra fields
  title?: string;
  demoUrl?: string;
  technologies?: string[];
  pinned?: boolean;
}

export interface FeaturedProjectsConfig {
  enabled: boolean;
  /** Projects selected / added by the user */
  projects: FeaturedProject[];
  /** Visual card style */
  cardStyle: ProjectCardStyle;
  /** Column layout */
  layout: ProjectLayout;
  /** How projects are ordered */
  sortMode: ProjectSortMode;
  /** Badge style for language / stats badges */
  badgeStyle: 'flat' | 'flat-square' | 'for-the-badge' | 'plastic';
  /** Show stars count badge */
  showStars: boolean;
  /** Show forks count badge */
  showForks: boolean;
  /** Show language badge */
  showLanguage: boolean;
  /** Show topics as badges */
  showTopics: boolean;
}

export const DEFAULT_FEATURED_PROJECTS: FeaturedProjectsConfig = {
  enabled: false,
  projects: [],
  cardStyle: 'modern',
  layout: '2-col',
  sortMode: 'manual',
  badgeStyle: 'flat-square',
  showStars: true,
  showForks: true,
  showLanguage: true,
  showTopics: true,
};

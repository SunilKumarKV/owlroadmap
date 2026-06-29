# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-06-28
### Added
- **README Showcase Gallery**: Responsive community showcases grid gallery page under `/gallery` with search, categorization, live preview tabs, and one-click duplication tools mapping preset configurations directly into the active editor.
- **Version History & Snapshots**: Integrated client-side version control engine featuring undo/redo stacks, Ctrl+Z/Ctrl+Y hotkey triggers, custom manual snap points, relative timeline lists, granular section-by-section restores, and side-by-side markdown comparison diff.

## [1.0.0] - Planned
### Added
- **GitHub OAuth Authentication**: Transition from simple public fetching to official GitHub sign-ins for private repository sync and higher API limits.
- **Relational Cloud Sync**: Integration with PostgreSQL/Firestore to support user accounts and cross-device workspace syncing.
- **Visual Roadmap Canvas**: Switch list-based roadmap editing to a visual grid canvas featuring node drag-and-drop capabilities.
- **Static Shared Previews**: Pre-rendered public share paths with rich Open Graph headers for search engine optimization.

## [0.5.0] - 2026-06-26
### Added
- **SaaS Landing Page**: Created a responsive marketing page with interactive tabs, features showcases, animations, and W3C details accordion.
- **Secure Server AI Proxy**: Added a server-side route `/api/ai` to proxy queries securely and protect the Gemini API Key.
- **Zustand Workspace Hub**: Implemented auto-saving, renaming, duplication, and session restoration for multiple projects.
- **SVG Analytics Console**: Built interactive language donut, exports bar, and scheduling area charts.
- **Export Studio**: Created JSZip packaging, PDF printouts, and clipboard history logs.
- **W3C Semantic a11y**: Add htmlFor-id binding, ARIA layout tab list roles, and RadioGroup group navigation.
- **Next.js SEO Generators**: Added layout metadata tags, `sitemap.ts`, and `robots.ts`.

### Changed
- **Folder Structure**: Relocated `RoadmapBuilderPage.tsx` from the misaligned `readme-builder` directory to its dedicated `roadmap-builder` directory.

### Removed
- **Dead Code**: Deleted unused layout code `HomePage.tsx` under `src/features/home/`.

---

## [0.1.0] - 2026-06-12
### Added
- **Scaffold**: Next.js React 19 codebase with Tailwind CSS configs.
- **GitHub Sync**: Fetched user profiles, star counts, and language logs from GitHub public API.
- **README builder**: Basic fields editor mapping template styles.
- **Roadmap builder**: List editor prefilling Frontend/Backend steps.
- **Preview console**: RAW Markdown viewer.

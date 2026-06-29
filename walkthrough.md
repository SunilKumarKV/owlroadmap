# Walkthrough — Existing README Import

We have successfully implemented the **Existing README Import** feature for the README Builder in OwlRoadmap v1.1.0. This feature allows users to reverse-parse their existing GitHub Profile or repository READMEs and continue editing them visually within the application.

---

## File Changes & Architecture

### [`src/utils/readme-importer.ts`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/utils/readme-importer.ts)
- **[NEW]** Layout parser and section detector service. Runs detailed regular expression scans on a raw Markdown string to identify header alignments, greetings, capsule render banners, typing SVGs, Shields.io badges, stats cards, and trophies.
- Safely extracts configurations, usernames, styles, colors, and layout presets.
- Unmatched sections are preserved as a Custom Markdown block.

### [`src/utils/__tests__/readme-importer.test.ts`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/utils/__tests__/readme-importer.test.ts)
- **[NEW]** Comprehensive test suite verifying parser outputs for greetings, typing lines, stats themes, social media icons, and fallback blocks.

### [`src/stores/readme-store.ts`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/stores/readme-store.ts)
- Implemented `importReadmeData(config, selectedSections)` store action. Maps parsed settings directly into active Zustand config states for selected checkboxes.

### [`src/stores/__tests__/readme-store.test.ts`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/stores/__tests__/readme-store.test.ts)
- Verified correct mapping of name, subtitle, tech badges, and enabling/disabling sections during imports.

### [`src/features/readme-builder/READMEBuilderPage.tsx`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/features/readme-builder/READMEBuilderPage.tsx)
- Integrated the `Import README` action button in the workspace toolbar.
- Built the multi-step **Import Wizard Dialog**:
  - **Step 1: Input Source Selector**: Tabs for Username, Repo URL, Raw Markdown URL, Pasting, and Drag-and-Drop files.
  - **Step 2: Section Summary**: Scans layout structures and lets users select which parsed elements (Header, Tech Stack, stats) to keep.
  - **Step 3: Conflict Resolution**: Allows importing into a new workspace (recommended), merging, or overwriting.

---

## Technical Details

### 1. Robust Section Parser
- **Header**: Matches Greetings (`Hi 👋, I'm...`), pronouns `(he/him)`, location (`based in...`), capsule render URLs (`type=waving`), typing SVG URLs (`lines=...`), and status badges.
- **Socials & Tech Badges**: Matches badge images by logo and alt text aliases (e.g. mapping `Twitter` badge to `'x'` registry ID). Extracts user profiles and target links.
- **Stats & Streak**: Scans `github-readme-stats` and streak URLs to capture username, theme, and layout configurations.
- **Achievements**: Detects `github-profile-trophy`, activity graph, visitor counters, and snake widgets.

### 2. Conflict Handling
- **Create New Workspace**: Prompts user for a workspace name, creates a new workspace, and loads settings there, keeping active configs safe.
- **Merge**: Updates properties for imported sections, keeping other sections unchanged.
- **Overwrite**: Loads imported sections and disables unselected ones.

---

## Verification & Metrics

- **Unit Tests**: All 111 tests passed successfully (`pnpm test`).
- **TypeScript**: Compiled cleanly with 0 type errors (`pnpm tsc --noEmit`).
- **Production Build**: Bundled NextJS routes successfully (`pnpm build`).

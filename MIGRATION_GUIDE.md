# Migration Guide: OwlRoadmap v0.5.0 to v1.1.0

This guide provides instructions for migrating your local environment, configurations, and templates from OwlRoadmap v0.5.0/v1.0.0-planned drafts to the v1.1.0 release.

---

## 💾 Local Storage Schema Update

In v1.1.0, the layout configurations are managed locally in client-side storage. 
- **Zustand Persistence**: Active profile builders continue using `readme-store` persistence.
- **New History Storage Key**: Version History is persisted under the key `readme-history-store` in localStorage. If you experience schema mismatches or missing fields on old profiles, you can click **"Clear All"** at the bottom of the Version Timeline panel to re-initialize your local database schema cleanly.

---

## 🛠️ Workspace Modifications

### 1. Folder Structure Changes
If you had custom pages or references under `/src/features/readme-builder/RoadmapBuilderPage.tsx`, please note:
- All roadmap visual code has been moved to `/src/features/roadmap-builder/RoadmapBuilderPage.tsx`.
- The routes have been split into:
  - `/readme-builder` for profile README files.
  - `/roadmap-builder` for learning roadmaps.

### 2. Version Control Integrations
When writing custom input wrappers, please attach the focus event trigger `onFocus={handleUndoCapture}` to support automatic state tracking in the Undo/Redo stack.

---

## 🚀 Running the Migration Verification
To make sure your workspace configuration and dependencies are fully upgraded, run:
```bash
# Clean install updated dependencies
pnpm install

# Run static type check
pnpm tsc --noEmit

# Run unit tests validation
pnpm test

# Build production bundle
pnpm run build
```
If you encounter any issues, please submit an issue on the repository or query the community discussions!

# Walkthrough — Multi-Panel Live Editor Workspace

We have successfully implemented the **Multi-Panel Live Editor Workspace** for the README Builder in OwlRoadmap v1.1.0. This workspace transforms the README building experience into a professional, responsive, and resizable layout similar to GPRM.

---

## File Changes & Architecture

### [`src/stores/panel-store.ts`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/stores/panel-store.ts)
- **[NEW]** Zustand store that persists resizable layout percentages (`builderSize`, `previewSize`, `markdownSize`), panel collapses (`builderCollapsed`, `previewCollapsed`, `markdownCollapsed`), fullscreen panels, and mobile view settings using `localStorage`.

### [`src/stores/__tests__/panel-store.test.ts`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/stores/__tests__/panel-store.test.ts)
- **[NEW]** Unit tests checking initialization, collapsing, resizing, and fullscreen actions.

### [`src/app/globals.css`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/app/globals.css)
- Added custom styles for resizable drag columns (`cursor-col-resize`), custom editor scrollbars (`custom-editor-scrollbar`), and theme overrides for the raw output textarea (`raw-markdown-editor`) supporting **Minimal**, **Dark**, **Gradient**, and **Terminal** themes.

### [`src/features/readme-builder/READMEBuilderPage.tsx`](file:///Users/sunilkumarkv/Desktop/Projects/owlroadmap/src/features/readme-builder/READMEBuilderPage.tsx)
- Replaced the two-column grid layout with a three-panel workspace.
- Integrated `renderSectionConfigForm` helper to prevent duplication of section config card inputs.
- Implemented drag handlers utilizing `PointerEvents` to compute relative percentage widths and persist them.
- Implemented **Search sections** filter input to query and search config panels.
- Implemented **Scroll synchronization** with scroll guards between the monospaced editor and HTML preview.
- Integrated **Workspace Selector** to create and load workspaces on-the-fly.

---

## Premium Editor Features

### 1. Three-Panel Layout (Desktop)
- **Panel 1: Section Builder**: Left-most column with sections search bar, presets, reorder handle group, and form config cards.
- **Panel 2: Live Preview**: Center column rendering compiled markdown with image assets, shields.io badges, and stats cards instantly.
- **Panel 3: Raw Markdown**: Right-most column showing monospaced markdown with copy/download options.

### 2. Panel Resizing & Collapsing
- Users can drag splitter bars to resize.
- Clicking collapse buttons folds columns into elegant vertical strips showing names vertically. Hovering or clicking expands them back, distributing space proportionally.
- Full-screen button to expand any column to 100% viewport space.

### 3. Scroll Sync & Edit Sync
- Scrolling raw markdown shifts preview scroll position to line up.
- Edits inside raw code block immediately refresh preview and visual editor state, and vice versa.

### 4. Responsive Layout Manager
- Below `lg` viewport: tabs header bar switches between `Section Builder`, `Live Preview`, and `Raw Markdown` panels full-height.

---

## Verification & Metrics

- **Unit Tests**: `pnpm test` successfully passed all 100 tests.
- **TypeScript**: `pnpm tsc --noEmit` compiled clean with 0 errors.
- **NextJS Build**: `pnpm build` successfully optimized and compiled routes for production.

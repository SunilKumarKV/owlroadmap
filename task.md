# Multi-Panel Live Editor & Template Marketplace Checklist

## UI & Layout Setup
- [x] Add resizable container styling to `globals.css`
- [x] Import `usePanelStore`, `generateReadmeMarkdown`, and Lucide icons in `READMEBuilderPage.tsx`
- [x] Create the outer workspace scaffolding with global header bar (workspace select, theme select, reset layout)

## Panel 1: Section Builder & Template Marketplace
- [x] Implement Search Sections input field
- [x] Clean up and embed the Section Manager reorderable list and presets inside Section Builder
- [x] Embed the scrollable forms container
- [x] Create the **Template Marketplace** tab switcher in Panel 1
- [x] Implement template registry (`template-registry.ts`) covering 9 styled layout categories (Minimal, Modern, Open Source, Full Stack, Frontend, AI, Terminal, GPRM, Anime)
- [x] Add Template search bar and category scroll filters
- [x] Implement visual mini layout card previews with distinct dynamic CSS structures
- [x] Add favorite templates support with heart toggles, persisted to local storage
- [x] Track applied templates in recently used list, persisted to local storage
- [x] Build the duplication action to clone template configurations to a new workspace dynamically
- [x] Add JSON configuration Import & Export utility triggers

## Panel 2: Live Preview
- [x] Set up the dynamic `@uiw/react-md-editor` Markdown preview renderer
- [x] Hook up image tags, badges, and stats card rendering
- [x] Implement fullscreen/toggle controls for the preview panel
- [x] Build the detailed preview modal overlay displaying active sections, descriptions, and applied styles with escape-key exit handlers

## Panel 3: Markdown Output
- [x] Build the monospaced raw markdown code area
- [x] Hook up Copy and Download buttons in the header
- [x] Implement auto-scroll synchronization between the markdown code area and the live preview

## Panel Resizing & Persistence
- [x] Implement drag separator bars utilizing PointerEvents
- [x] Persist panel configurations and collapsed states in `usePanelStore`
- [x] Build the mobile tab selectors supporting both the section editors and template gallery switchers responsive on smaller viewports

## Verification & Testing
- [x] Verify that all unit tests pass successfully (105 tests passing)
- [x] Verify type correctness with typescript compiler (`pnpm tsc --noEmit` returns 0 errors)
- [x] Run build test to confirm production build success

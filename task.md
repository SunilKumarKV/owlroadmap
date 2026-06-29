# Multi-Panel Live Editor Checklist

## UI & Layout Setup
- [x] Add resizable container styling to `globals.css`
- [x] Import `usePanelStore`, `generateReadmeMarkdown`, and Lucide icons in `READMEBuilderPage.tsx`
- [x] Create the outer workspace scaffolding with global header bar (workspace select, theme select, reset layout)

## Panel 1: Section Builder
- [x] Implement Search Sections input field (filters both Section Manager list and form configuration cards)
- [x] Clean up and embed the Section Manager reorderable list and presets inside Section Builder
- [x] Embed the scrollable forms container (collapsible panels)

## Panel 2: Live Preview
- [x] Set up the dynamic `@uiw/react-md-editor` Markdown preview renderer
- [x] Hook up image tags, badges, and stats card rendering
- [x] Implement fullscreen/toggle controls for the preview panel

## Panel 3: Markdown Output
- [x] Build the monospaced raw markdown code area
- [x] Hook up Copy and Download buttons in the header
- [x] Implement auto-scroll synchronization between the markdown code area and the live preview

## Panel Resizing & Persistence
- [x] Implement drag separator bars utilizing PointerEvents
- [x] Persist panel configurations and collapsed states in `usePanelStore`
- [x] Build the mobile tab selectors for responsive design on smaller screens

## Verification & Testing
- [x] Verify that all unit tests pass successfully
- [x] Verify type correctness with typescript compiler
- [x] Run build test to confirm production build success

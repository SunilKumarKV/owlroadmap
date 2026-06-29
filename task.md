# README Import Implementation Checklist

## Parser & Detector Architecture
- [x] Create `readme-importer.ts` with layout parser, badge resolver, and section detector
- [x] Implement robust regular expressions for extracting banners, header details, and typing lines
- [x] Implement Shields.io badge matcher for mapping social links and tech stack logos
- [x] Implement streak, trophy, and activity graph parser
- [x] Implement fallback to capture unmatched content as Custom Markdown sections
- [x] Handle malformed or incomplete markdown inputs safely

## State & Store Sync
- [x] Extend `READMEState` interface in `readme-store.ts` to add the `importReadmeData` action
- [x] Implement `importReadmeData` mapper inside the store that populates active config sections

## UI Wizard & Workflow
- [x] Implement Import Wizard Modal overlay in `READMEBuilderPage.tsx`
- [x] Build Step 1: Input source selector tabs (GitHub Username, Repo URL, Pasting text, Upload file)
- [x] Build Step 2: Parsing loader animation and checkbox selector listing detected layout elements
- [x] Build Step 3: Conflict warning dialog with resolution modes (create workspace, merge, overwrite)
- [x] Add Escape key close and backdrop closing listener

## Verification & Testing
- [x] Add unit tests in `readme-importer.test.ts`
- [x] Verify test suite passes
- [x] Run typescript compiler and production build checks

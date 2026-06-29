# Release Notes: OwlRoadmap v1.1.0 (June 2026)

We are thrilled to announce the release of **OwlRoadmap v1.1.0**! This milestone version introduces a beautiful community showcase gallery for profile README inspiration and a robust version control snapshots system that lets developers manage workspace versions easily.

---

## 🚀 Key Features

### 1. README Showcase Gallery
Browse, search, inspect, and clone beautiful profile README designs!
- **Grid Gallery View**: Under `/gallery`, explore responsive profile cards showing developer info, tech tags, and theme preview styles.
- **Inspiration Overlay Modal**: Click any card to preview compiled markdown templates live, inspect raw Markdown code, or check layout statistics.
- **Instant Duplication**: Click **"Duplicate into Editor"** to instantly clone any template configurations directly into your active workspace session.

### 2. Client-Side Version History & Snapshots
Never lose your work! Track historical edits, compare changes, and restore specific fields.
- **Undo / Redo Stack**: Multiple undo/redo levels managed automatically, including full support for standard **Ctrl+Z** / **Ctrl+Y** shortcuts in all textareas/inputs.
- **Automatic Snapshots**: Automatically saves current configurations on major state modifications (style template switches and GitHub profile imports).
- **Manual Backups**: Create custom snapshots with titles and descriptions.
- **Side-by-Side Diff Modal**: Compare any snapshot version with active editor state using visual, code diff, or modified fields summary logs.
- **Granular Restores**: Load full configs or choose to overwrite only selected sections (e.g. name/role, skills list, tech badges, etc.).

---

## 🛠️ Performance & Stability Improvements
- **TypeScript Strict Safety**: All `any` types removed from version history models and stores. Full compiler type-safety achieved.
- **Next.js Production Readiness**: The application bundle compiles successfully with static prerendering optimizing load speeds.
- **Test Coverage**: Complete vitest test coverage with **87 passing tests** guaranteeing store stability and correctness.

---

## 📦 What's Next?
In v1.2.0, we plan to release **GitHub OAuth sign-in integration** and **relational cloud syncing** with PostgreSQL/Firestore to support user accounts!

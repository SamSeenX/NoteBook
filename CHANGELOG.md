# CHANGELOG.md

All notable changes to the Notes PWA will be documented here.

## [1.3.4] - 2026-11-20
### Added
- Configured `Escape` key inside the search bar to immediately collapse the sidebar panel, blur the input, and clear active search queries

## [1.3.3] - 2026-11-20
### Added
- Implemented `Ctrl+K` and `Cmd+K` keyboard shortcut to toggle open the sidebar and focus the search field with instant selection
- Added `Escape` key handling to clear and blur the search input cleanly
- Positioned note format controls (`Plain | MD | HTML`) directly beside the Zen focus mode button in the workspace toolbar

### Fixed
- Configured sidebar to be collapsed by default on initial visits
- Persisted sidebar open and closed state in `localStorage` across page reloads

## [1.3.2] - 2026-11-20
### Fixed
- Fixed page shifting by restructuring the application into independent full-height columns (sidebar and workspace)
- Anchored the sidebar toggle button at the top-left of the workspace header for stable, persistent navigation
- Added fluid CSS easing to the writing canvas to eliminate layout snap when toggling the sidebar

## [1.3.1] - 2026-11-20
### Fixed
- Relocated Edit, Split, and Preview controls directly into the workspace toolbar right above the editor and preview pane
- Fixed segmented view button click event routing so switching views works instantaneously
- Fixed sidebar hamburger button on desktop screens by implementing smooth margin collapse transitions alongside mobile drawer toggles
- Extracted tags bar rendering into modular `tags-bar.js` helper maintaining strict sub-200 line file boundaries

## [1.3.0] - 2026-11-20
### Added
- Editorial font trio integration: Inter (Sans), Newsreader (Serif), and JetBrains Mono (Code) with 1-click live font cycling
- Symmetrical segmented header controls for View Mode (Edit | Split | Preview) and Note Format (Plain | MD | HTML)
- Interactive checklists allowing live checkbox ticking directly inside the rendered preview pane
- Visual PDF Page Break dividers with centered badges and native multipage print pagination
- Export dropdown popover with direct exports for PDF, Markdown (.md), HTML (.html), and Plain Text (.txt)
- Enhanced sidebar cards with format micro-badges (MD, HTML, TXT), 2-line clamped summaries, relative time labels, and hover actions
- Refined indigo and slate color palette for elevated light and dark modes

## [1.2.0] - 2026-11-20
### Added
- Complete UI/UX redesign with craft-style borderless document canvas
- Unified segmented pill control for View Mode (Edit, Split, Preview)
- Refined sidebar note cards with left active accent indicators and subtle tag badges
- Warm and balanced color palette for both light and dark themes
- Live pulsing auto-save indicator dot in the status bar
- Constrained 740px reading line measure for optimal reading comfort

## [1.1.0] - 2026-11-20
### Added
- Inline `#tags` parsing and horizontal filter pill bar in sidebar
- Soft-delete Trash workflow with single-note restore, permanent deletion, and empty trash
- Zen focus mode with fullscreen distraction-free column (`Cmd/Ctrl + Shift + F`)
- Drag and drop import for `.md`, `.txt`, and `.markdown` files
- Web App Manifest quick capture shortcut (`/?action=new`)
- Editor typography font switch between Sans-serif and Monospace
- Estimated reading time counter alongside live word and character metrics
- Editor keyboard shortcuts (`Cmd/Ctrl + B`, `I`, `K`)

## [1.0.0] - 2026-11-20
### Added
- Core modular Vanilla ES6 architecture on Vite targeting ES2022
- IndexedDB offline persistence and localStorage UI syncing
- Sidebar with multi-note management, search, and sorting options
- Note pinning support for quick access
- Plain text and Markdown editing with WYSIWYG syntax injection toolbar
- Live markdown rendered preview pane
- Multipage PDF export engine using native `@media print`
- 1-click JSON backup export and restore utility
- PWA manifest, service worker offline caching, and mobile responsive drawer

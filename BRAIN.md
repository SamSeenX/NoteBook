# BRAIN.md - Architecture, Decisions & Memory Record

## 1. Project Philosophy
- **Name**: Notes PWA
- **Mission**: Fast, resilient, offline-first notes application with markdown rendering, live preview, WYSIWYG formatting shortcuts, and native multipage PDF export.
- **Paradigm**: Modern Vanilla JavaScript (ES6+ modules), zero UI dependencies, zero runtime frameworks, strict sub-200-line modular design.

## 2. Storage Architecture
- **Tier 1 (localStorage)**: UI preferences, active note ID, theme, sidebar toggle state, editor font preference (sans/serif/mono), editor layout mode (edit, preview, split).
- **Tier 2 (IndexedDB)**: Complete note records including id, title, description, body, mode (simple vs markdown vs html), pinned status, trashed status, createdAt, and updatedAt timestamps.
- **Persistence Request**: Proactively invokes `navigator.storage.persist()` on initial boot.
- **Data Portability**: Full JSON export and JSON import with validation and merge safety.
- **Drag & Drop**: Native window drop listener for instant `.md` and `.txt` file ingestion.

## 3. UI/UX Architecture & Column Alignment
- **Independent Full-Height Columns**: Sidebar and workspace are decoupled full-height columns, eliminating window-wide header shifts.
- **Sidebar State Persistence**: Sidebar defaults to collapsed and stores user toggle preference in `localStorage.notes_sidebar_open`.
- **Keyboard-Centric Navigation**: `Ctrl+K` / `Cmd+K` automatically expands the sidebar and focuses the search input with instant query selection, while `Escape` inside search collapses the sidebar panel.
- **Unified Toolbar Controls**: Format switches (`Plain | MD | HTML`) sit directly beside the Zen mode button and View Mode controls inside the workspace toolbar.
- **Persistent Edge Sidebar Toggle**: The hamburger sidebar toggle is locked at the top-left edge of the app window (`left: 12px; top: 9px`) across both collapsed and expanded states, allowing 1-click repeated toggling without mouse movement.
- **Text Case Converter**: Integrated toolbar "aA" dropdown supporting 8 case formats with automatic selection or word-under-cursor targeting.
- **Fluid Canvas Stabilization**: Smooth CSS transition easing (`transition: max-width, padding`) prevents jumping when toggling between side-by-side and expanded writing views.
- **Curated Font Trio**: Integrated `Inter` (UI), `Newsreader` (Editorial Serif), and `JetBrains Mono` (Code) with live 1-click cycling.
- **Indigo & Slate Harmony**: Modern indigo brand accents (`#4f46e5` / `#6366f1`) paired with slate surfaces, subtle card borders, and dark canvas (`#0e1015`).
- **Interactive Checklists**: Real-time toggling of markdown task checkboxes directly within the rendered preview pane.
- **Visual PDF Page Breaks**: Dashed print divider with a centered uppercase badge indicating exact page breaks for vector multipage PDF generation.
- **Tri-Theme Architecture**: Decoupled design styles (`data-style="studio" | "folio" | "mac1984"`) from color modes (`data-theme="light" | "dark"`), giving Studio, Folio, and Mac 1984 dedicated, scoped light and dark presentations.
- **Modular Stylesheets**: Extracted theme-specific tokens into `themes/folio.css` and `themes/mac1984.css` guaranteeing zero file exceeds the strict 200-line limit.
- **Compact Chrome Density**: Compacted header height (46px) and toolbar (40px) with matching 30px icon buttons, eliminating oversized button bloat.
- **Unified Sidebar Action Row**: Consolidated search, custom sort popover, and "+ New" button into a single 30px row, leaving the brand header uncluttered and eliminating the separate browser select row.

## 4. Roadmap
- [x] Architecture planning and scoping
- [x] Core event bus and IndexedDB storage engine
- [x] Sidebar list with search, sorting, and pin states
- [x] Editor with WYSIWYG syntax formatting toolbar
- [x] Markdown and HTML live preview engine
- [x] Multipage PDF export engine
- [x] JSON backup and restore modal
- [x] Inline `#tags` filter bar
- [x] Trash soft-delete and restore protection
- [x] Zen focus mode
- [x] Drag and drop `.md`/`.txt` file import
- [x] Font typography toggle (sans / serif / mono)
- [x] Interactive markdown checklists in preview
- [x] Visual PDF page break dividers
- [x] Column layout restructuring eliminating page shifts

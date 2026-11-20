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

## 3. Editorial UI/UX & Design System
- **Curated Font Trio**: Integrated `Inter` (UI), `Newsreader` (Editorial Serif), and `JetBrains Mono` (Code) with live 1-click cycling.
- **Indigo & Slate Harmony**: Modern indigo brand accents (`#4f46e5` / `#6366f1`) paired with slate surfaces, subtle card borders, and dark canvas (`#0e1015`).
- **Segmented Header Controls**: Symmetrical segmented pills for View Modes (`Edit | Split | Preview`) and Note Formats (`Plain | MD | HTML`).
- **Interactive Checklists**: Real-time toggling of markdown task checkboxes directly within the rendered preview pane.
- **Visual PDF Page Breaks**: Dashed print divider with a centered uppercase badge indicating exact page breaks for vector multipage PDF generation.
- **Card Hierarchy**: Distinctive format badges (MD in indigo, HTML in amber, TXT in slate), 2-line clamped summaries, relative time labels, and hover action buttons.

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
- [x] Editorial UI/UX redesign surpassing standalone templates

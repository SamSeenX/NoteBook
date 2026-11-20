# BRAIN.md - Architecture, Decisions & Memory Record

## 1. Project Philosophy
- **Name**: Notes PWA
- **Mission**: Fast, resilient, offline-first notes application with markdown rendering, live preview, WYSIWYG formatting shortcuts, and native multipage PDF export.
- **Paradigm**: Modern Vanilla JavaScript (ES6+ modules), zero UI dependencies, zero runtime frameworks, strict sub-200-line modular design.

## 2. Storage Architecture
- **Tier 1 (localStorage)**: UI preferences, active note ID, theme, sidebar toggle state, editor font preference (sans/mono), editor layout mode (edit, preview, split).
- **Tier 2 (IndexedDB)**: Complete note records including id, title, description, body, mode (simple vs markdown), pinned status, trashed status, createdAt, and updatedAt timestamps.
- **Persistence Request**: Proactively invokes `navigator.storage.persist()` on initial boot.
- **Data Portability**: Full JSON export and JSON import with validation and merge safety.
- **Drag & Drop**: Native window drop listener for instant `.md` and `.txt` file ingestion.

## 3. Communication & State Flow
- **Central EventBus**: Decoupled pub/sub across components (`note:selected`, `note:updated`, `note:create`, `note:trash`, `note:restore`, `note:destroy`, `toast:show`, `modal:confirm`).
- **Reactive Store**: Single source of truth for active note cache, query filters, tag filters, trash view toggle, sort order, font mode, zen focus state, and preview mode.

## 4. Organization & Editor Enhancements
- **Inline `#tags`**: Dynamic regex extraction without rigid database schemas, auto-populating a horizontal filter bar in the sidebar.
- **Trash Recovery**: Two-stage deletion lifecycle protecting against accidental data loss with one-click restore or empty trash.
- **Zen Focus Mode**: Instant distraction-free writing environment centered with comfortable reading line lengths and quick exit shortcuts (`Escape` or `Cmd/Ctrl + Shift + F`).
- **Multipage PDF Export**: Zero-dependency CSS Paged Media (`@page`, `break-inside: avoid`, `@media print`).

## 5. Roadmap
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
- [x] Font typography toggle (sans / mono)
- [x] PWA manifest shortcuts for quick capture

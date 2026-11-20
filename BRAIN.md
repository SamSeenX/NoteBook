# BRAIN.md - Architecture, Decisions & Memory Record

## 1. Project Philosophy
- **Name**: Notes PWA
- **Mission**: Fast, resilient, offline-first notes application with markdown rendering, live preview, WYSIWYG formatting shortcuts, and native multipage PDF export.
- **Paradigm**: Modern Vanilla JavaScript (ES6+ modules), zero UI dependencies, zero runtime frameworks, strict sub-200-line modular design.

## 2. Storage Architecture
- **Tier 1 (localStorage)**: UI preferences, active note ID, theme, sidebar toggle state, editor layout mode (edit, preview, split).
- **Tier 2 (IndexedDB)**: Complete note records including id, title, description, body, mode (simple vs markdown), pinned status, createdAt, and updatedAt timestamps.
- **Persistence Request**: Proactively invokes `navigator.storage.persist()` on initial boot.
- **Data Portability**: Full JSON export and JSON import with validation and merge safety.

## 3. Communication & State Flow
- **Central EventBus**: Decoupled pub/sub across components (`note:selected`, `note:updated`, `note:created`, `note:deleted`, `toast:show`, `modal:confirm`).
- **Reactive Store**: Single source of truth for active note cache, query filters, sort order, and active preview mode.

## 4. Multipage PDF Export Strategy
- Employs zero-dependency CSS Paged Media (`@page`, `break-inside: avoid`, `@media print`).
- Renders clean printable documents with full pagination, stripping all UI chrome and toolbar controls during printing.

## 5. Roadmap
- [x] Architecture planning and scoping
- [ ] Core event bus and IndexedDB storage engine
- [ ] Sidebar list with search, sorting, and pin states
- [ ] Editor with WYSIWYG syntax formatting toolbar
- [ ] Markdown and HTML live preview engine
- [ ] Multipage PDF export engine
- [ ] JSON backup and restore modal
- [ ] PWA manifest, service worker, and offline cache

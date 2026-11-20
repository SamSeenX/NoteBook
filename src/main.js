import './styles/main.css';
import { store } from './core/store.js';
import { eventBus } from './core/event-bus.js';
import { setupErrorBoundary } from './core/error-boundary.js';
import { idb } from './utils/idb.js';
import { exportAllNotesAsJSON, importNotesFromJSON } from './utils/backup.js';
import { exportNoteToPDF } from './utils/pdf.js';

import { ToastComponent } from './components/toast/toast.js';
import { ModalComponent } from './components/modal/modal.js';
import { SidebarComponent } from './components/sidebar/sidebar.js';
import { ToolbarComponent } from './components/toolbar/toolbar.js';
import { EditorComponent } from './components/editor/editor.js';
import { PreviewComponent } from './components/preview/preview.js';

async function bootstrap() {
  setupErrorBoundary();

  // Request storage persistence
  if (navigator.storage && navigator.storage.persist) {
    navigator.storage.persist().catch(() => {});
  }

  // Register PWA service worker
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').catch((err) => console.log('SW registration error:', err));
  }

  // Initialize UI components
  new ToastComponent(document.getElementById('toast-root'));
  new ModalComponent(document.getElementById('modal-root'));
  new SidebarComponent(document.getElementById('sidebar'), document.getElementById('sidebar-backdrop'));
  new ToolbarComponent(document.getElementById('toolbar'));
  new EditorComponent(document.getElementById('editor-wrapper'));
  new PreviewComponent(document.getElementById('preview-wrapper'));

  // Load notes from IndexedDB
  let notes = await idb.getAll();

  if (!notes || notes.length === 0) {
    const welcomeNote = {
      id: 'welcome-note',
      title: 'Welcome to Notes PWA',
      description: 'A quick guide to formatting, previewing, and PDF printing',
      content: `# Welcome to Notes PWA\n\nA minimalist, offline-first note-taking app with real-time preview and multipage PDF export.\n\n## Quick Features\n- **Live Markdown**: Headings, **bold**, *italic*, lists, and code blocks.\n- **WYSIWYG Toolbar**: Use the top bar to format selected text quickly.\n- **Multipage PDF Export**: Click the printer icon to generate a clean PDF document.\n- **Search & Sort**: Filter notes instantly by title or content.\n- **Backup & Restore**: Use the cloud icons in the top bar to export or restore JSON backups.\n\n> "Simplicity is the ultimate sophistication."`,
      mode: 'markdown',
      isPinned: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await idb.put(welcomeNote);
    notes = [welcomeNote];
  }

  // Set initial store state
  const lastActiveId = localStorage.getItem('notes_active_id');
  const initialActiveId = notes.some((n) => n.id === lastActiveId) ? lastActiveId : notes[0]?.id || null;
  const initialTheme = store.getState().theme;
  document.documentElement.setAttribute('data-theme', initialTheme);

  const initialView = store.getState().viewMode;
  document.body.setAttribute('data-view', initialView);

  store.setState({ notes, activeNoteId: initialActiveId });

  // Event handlers
  eventBus.on('note:select', ({ id }) => {
    store.setState({ activeNoteId: id });
    localStorage.setItem('notes_active_id', id);
  });

  eventBus.on('note:create', async () => {
    const newNote = {
      id: 'note_' + Date.now(),
      title: 'Untitled Note',
      description: '',
      content: '',
      mode: 'markdown',
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await idb.put(newNote);
    const currentNotes = [newNote, ...store.getState().notes];
    store.setState({ notes: currentNotes, activeNoteId: newNote.id });
    localStorage.setItem('notes_active_id', newNote.id);
    eventBus.emit('toast:show', { message: 'New note created.', type: 'info' });
  });

  eventBus.on('note:delete', async ({ id }) => {
    await idb.delete(id);
    const updatedNotes = store.getState().notes.filter((n) => n.id !== id);
    const nextActive = updatedNotes[0]?.id || null;
    store.setState({ notes: updatedNotes, activeNoteId: nextActive });
    if (nextActive) localStorage.setItem('notes_active_id', nextActive);
    else localStorage.removeItem('notes_active_id');
    eventBus.emit('toast:show', { message: 'Note deleted.', type: 'info' });
  });

  eventBus.on('notes:reloaded', async () => {
    const refreshed = await idb.getAll();
    store.setState({ notes: refreshed, activeNoteId: refreshed[0]?.id || null });
  });

  // Global header actions
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    store.setState({ isSidebarOpen: !store.getState().isSidebarOpen });
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    const currentTheme = store.getState().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    store.setState({ theme: nextTheme });
  });

  document.getElementById('export-backup-btn').addEventListener('click', () => {
    exportAllNotesAsJSON();
  });

  document.getElementById('import-backup-input').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await importNotesFromJSON(file);
      e.target.value = '';
    }
  });

  // Global hotkeys
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      const active = store.getActiveNote();
      if (active) exportNoteToPDF(active);
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      eventBus.emit('note:create');
    }
  });
}

document.addEventListener('DOMContentLoaded', bootstrap);

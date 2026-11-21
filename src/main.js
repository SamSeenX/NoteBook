import './styles/main.css';
import { store } from './core/store.js';
import { eventBus } from './core/event-bus.js';
import { setupErrorBoundary } from './core/error-boundary.js';
import { idb } from './utils/idb.js';
import { exportAllNotesAsJSON, importNotesFromJSON } from './utils/backup.js';
import { setupDragAndDrop } from './utils/file-drop.js';
import { setupKeyboardShortcuts } from './utils/shortcuts.js';

import { ToastComponent } from './components/toast/toast.js';
import { ModalComponent } from './components/modal/modal.js';
import { SidebarComponent } from './components/sidebar/sidebar.js';
import { ToolbarComponent } from './components/toolbar/toolbar.js';
import { EditorComponent } from './components/editor/editor.js';
import { PreviewComponent } from './components/preview/preview.js';

async function bootstrap() {
  setupErrorBoundary();
  document.documentElement.setAttribute('data-style', store.getState().themeStyle);
  if (navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  new ToastComponent(document.getElementById('toast-root'));
  new ModalComponent(document.getElementById('modal-root'));
  new SidebarComponent(document.getElementById('sidebar'), document.getElementById('sidebar-backdrop'));
  new ToolbarComponent(document.getElementById('toolbar'));
  new EditorComponent(document.getElementById('editor-wrapper'));
  new PreviewComponent(document.getElementById('preview-wrapper'));

  let notes = await idb.getAll();
  if (!notes || notes.length === 0) {
    const welcome = {
      id: 'welcome-note',
      title: 'Welcome to Notes PWA',
      description: 'Quick guide with #features, #markdown, and #shortcuts',
      content: `# Welcome to Notes PWA\n\nA minimalist, offline-first notes app with real-time preview and multipage PDF export.\n\n## #Features\n- **Inline Tags**: Type #ideas or #work anywhere to filter your notes.\n- **Focus Mode**: Press Ctrl+Shift+F or click Zen to hide all toolbars.\n- **Trash Protection**: Safely restore notes or empty trash whenever needed.\n- **Drag & Drop**: Drop .md or .txt files directly onto the window.\n- **Multipage PDF**: Click the printer icon to print or save crisp vector PDFs.\n\n> "Simplicity is the ultimate sophistication."`,
      mode: 'markdown',
      isPinned: true,
      trashed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await idb.put(welcome);
    notes = [welcome];
  }

  const lastActive = localStorage.getItem('notes_active_id');
  const initialActive = notes.find((n) => n.id === lastActive && !n.trashed)?.id || notes.find((n) => !n.trashed)?.id || null;
  document.documentElement.setAttribute('data-theme', store.getState().theme);
  document.documentElement.setAttribute('data-font', store.getState().editorFont);
  document.body.setAttribute('data-view', store.getState().viewMode);
  store.setState({ notes, activeNoteId: initialActive });

  // PWA Quick capture check
  if (new URLSearchParams(window.location.search).get('action') === 'new') {
    eventBus.emit('note:create');
    window.history.replaceState({}, '', '/');
  }

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
      trashed: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await idb.put(newNote);
    store.setState({ notes: [newNote, ...store.getState().notes], activeNoteId: newNote.id, showTrash: false });
    localStorage.setItem('notes_active_id', newNote.id);
    document.getElementById('note-title')?.focus();
  });

  eventBus.on('note:trash', async ({ id }) => {
    const state = store.getState();
    const note = state.notes.find((n) => n.id === id);
    if (!note) return;
    const updated = { ...note, trashed: true, updatedAt: Date.now() };
    await idb.put(updated);
    const updatedNotes = state.notes.map((n) => (n.id === id ? updated : n));
    const nextActive = updatedNotes.find((n) => !n.trashed)?.id || null;
    store.setState({ notes: updatedNotes, activeNoteId: nextActive });
    eventBus.emit('toast:show', { message: 'Moved to Trash.', type: 'info' });
  });

  eventBus.on('note:restore', async ({ id }) => {
    const state = store.getState();
    const note = state.notes.find((n) => n.id === id);
    if (!note) return;
    const updated = { ...note, trashed: false, updatedAt: Date.now() };
    await idb.put(updated);
    const updatedNotes = state.notes.map((n) => (n.id === id ? updated : n));
    store.setState({ notes: updatedNotes, activeNoteId: updated.id });
    eventBus.emit('toast:show', { message: 'Note restored.', type: 'success' });
  });

  eventBus.on('note:destroy', async ({ id }) => {
    await idb.delete(id);
    const updatedNotes = store.getState().notes.filter((n) => n.id !== id);
    store.setState({ notes: updatedNotes, activeNoteId: updatedNotes.find((n) => n.trashed)?.id || null });
    eventBus.emit('toast:show', { message: 'Permanently deleted.', type: 'info' });
  });

  // Empty trash action
  document.getElementById('empty-trash-btn')?.addEventListener('click', () => {
    eventBus.emit('modal:confirm', {
      title: 'Empty Trash',
      message: 'All notes in Trash will be permanently deleted.',
      confirmText: 'Empty Trash',
      isDanger: true,
      onConfirm: async () => {
        const remaining = store.getState().notes.filter((n) => !n.trashed);
        const trashed = store.getState().notes.filter((n) => n.trashed);
        await Promise.all(trashed.map((n) => idb.delete(n.id)));
        store.setState({ notes: remaining, activeNoteId: remaining[0]?.id || null });
        eventBus.emit('toast:show', { message: 'Trash emptied.', type: 'info' });
      }
    });
  });

  // Global header actions
  document.getElementById('sidebar-toggle').addEventListener('click', () => {
    store.setState({ isSidebarOpen: !store.getState().isSidebarOpen });
  });

  document.getElementById('theme-toggle').addEventListener('click', () => {
    store.setState({ theme: store.getState().theme === 'dark' ? 'light' : 'dark' });
  });

  const styleBtn = document.getElementById('btn-style-menu');
  const styleDropdown = document.getElementById('style-dropdown');
  styleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    styleDropdown?.classList.toggle('is-open');
  });

  styleDropdown?.addEventListener('click', (e) => {
    const item = e.target.closest('[data-style-choice]');
    if (!item) return;
    store.setState({ themeStyle: item.dataset.styleChoice });
    styleDropdown.classList.remove('is-open');
  });

  document.addEventListener('click', (e) => {
    if (styleDropdown && !styleDropdown.contains(e.target) && !e.target.closest('#btn-style-menu')) {
      styleDropdown.classList.remove('is-open');
    }
  });

  document.getElementById('exit-zen-btn').addEventListener('click', () => {
    store.setState({ zenMode: false });
  });

  document.getElementById('export-backup-btn').addEventListener('click', exportAllNotesAsJSON);
  document.getElementById('import-backup-input').addEventListener('change', async (e) => {
    if (e.target.files?.[0]) {
      await importNotesFromJSON(e.target.files[0]);
      e.target.value = '';
    }
  });

  setupDragAndDrop();
  setupKeyboardShortcuts();
}

document.addEventListener('DOMContentLoaded', bootstrap);

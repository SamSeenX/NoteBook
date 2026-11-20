import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { exportNoteToPDF } from '../../utils/pdf.js';

export class ToolbarComponent {
  constructor(toolbarElement) {
    this.toolbar = toolbarElement;
    this.bindEvents();
    this.syncState();
  }

  bindEvents() {
    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cmd]');
      if (!btn) return;

      const cmd = btn.dataset.cmd;
      this.handleCommand(cmd);
    });

    store.subscribe((state, changedKeys) => {
      if (changedKeys.includes('viewMode') || changedKeys.includes('activeNoteId') || changedKeys.includes('notes')) {
        this.syncState();
      }
    });
  }

  handleCommand(cmd) {
    const note = store.getActiveNote();

    if (cmd === 'view-edit' || cmd === 'view-preview' || cmd === 'view-split') {
      const mode = cmd.replace('view-', '');
      store.setState({ viewMode: mode });
      document.body.setAttribute('data-view', mode);
      return;
    }

    if (cmd === 'toggle-mode') {
      if (!note) return;
      const nextMode = note.mode === 'markdown' ? 'simple' : 'markdown';
      eventBus.emit('note:mode:change', { mode: nextMode });
      return;
    }

    if (cmd === 'export-pdf') {
      if (!note) {
        eventBus.emit('toast:show', { message: 'No note selected to export.', type: 'info' });
        return;
      }
      exportNoteToPDF(note);
      return;
    }

    if (cmd === 'delete-note') {
      if (!note) return;
      eventBus.emit('modal:confirm', {
        title: 'Delete Note',
        message: `Are you sure you want to delete "${note.title || 'Untitled Note'}"? This action cannot be undone.`,
        confirmText: 'Delete',
        isDanger: true,
        onConfirm: () => eventBus.emit('note:delete', { id: note.id })
      });
      return;
    }

    // Formatting insertion commands
    eventBus.emit('editor:format', { format: cmd });
  }

  syncState() {
    const note = store.getActiveNote();
    const { viewMode } = store.getState();

    // Update active view buttons
    this.toolbar.querySelectorAll('[data-cmd^="view-"]').forEach((btn) => {
      const mode = btn.dataset.cmd.replace('view-', '');
      btn.classList.toggle('is-active', mode === viewMode);
    });

    // Update mode badge
    const modeBtn = this.toolbar.querySelector('[data-cmd="toggle-mode"]');
    if (modeBtn && note) {
      modeBtn.textContent = note.mode === 'markdown' ? 'MD' : 'TXT';
      modeBtn.title = `Current: ${note.mode === 'markdown' ? 'Markdown' : 'Plain Text'}. Click to toggle.`;
    }
  }
}

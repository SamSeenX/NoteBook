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
      this.handleCommand(btn.dataset.cmd);
    });

    store.subscribe((state, changedKeys) => {
      if (
        changedKeys.includes('viewMode') ||
        changedKeys.includes('activeNoteId') ||
        changedKeys.includes('notes') ||
        changedKeys.includes('editorFont') ||
        changedKeys.includes('zenMode')
      ) {
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

    if (cmd === 'toggle-zen') {
      store.setState({ zenMode: !store.getState().zenMode });
      return;
    }

    if (cmd === 'toggle-font') {
      const current = store.getState().editorFont;
      const nextFont = current === 'mono' ? 'sans' : 'mono';
      store.setState({ editorFont: nextFont });
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
        title: 'Move Note to Trash',
        message: `Move "${note.title || 'Untitled Note'}" to trash? You can restore it later.`,
        confirmText: 'Move to Trash',
        isDanger: true,
        onConfirm: () => eventBus.emit('note:trash', { id: note.id })
      });
      return;
    }

    // Formatting insertion commands
    eventBus.emit('editor:format', { format: cmd });
  }

  syncState() {
    const note = store.getActiveNote();
    const { viewMode, editorFont, zenMode } = store.getState();

    // Update active view buttons
    this.toolbar.querySelectorAll('[data-cmd^="view-"]').forEach((btn) => {
      const mode = btn.dataset.cmd.replace('view-', '');
      btn.classList.toggle('is-active', mode === viewMode);
    });

    // Update font toggle button
    const fontBtn = this.toolbar.querySelector('[data-cmd="toggle-font"]');
    if (fontBtn) {
      fontBtn.textContent = editorFont === 'mono' ? 'Mono' : 'Sans';
      fontBtn.title = `Editor Font: ${editorFont === 'mono' ? 'Monospace' : 'Sans-Serif'}`;
    }

    // Update zen button
    const zenBtn = this.toolbar.querySelector('[data-cmd="toggle-zen"]');
    if (zenBtn) zenBtn.classList.toggle('is-active', zenMode);

    // Update mode badge
    const modeBtn = this.toolbar.querySelector('[data-cmd="toggle-mode"]');
    if (modeBtn && note) {
      modeBtn.textContent = note.mode === 'markdown' ? 'MD' : 'TXT';
      modeBtn.title = `Current: ${note.mode === 'markdown' ? 'Markdown' : 'Plain Text'}. Click to toggle.`;
    }
  }
}

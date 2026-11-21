import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { transformSelectionCase } from '../../utils/case-converters.js';
import { setupExportMenu } from '../../utils/export-menu.js';

export class ToolbarComponent {
  constructor(toolbarElement) {
    this.toolbar = toolbarElement;
    this.dropdown = document.querySelector('#export-dropdown');
    this.caseDropdown = document.querySelector('#case-dropdown');
    this.fontCycleBtn = document.querySelector('#btn-font-cycle');
    this.bindEvents();
    this.syncState();
  }

  bindEvents() {
    this.toolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cmd]');
      if (!btn) return;
      this.handleCommand(btn.dataset.cmd);
    });

    if (this.fontCycleBtn) {
      this.fontCycleBtn.addEventListener('click', () => {
        const fonts = ['sans', 'serif', 'mono'];
        const current = store.getState().editorFont || 'sans';
        const next = fonts[(fonts.indexOf(current) + 1) % fonts.length];
        store.setState({ editorFont: next });
      });
    }

    // Format buttons in header
    document.querySelectorAll('[data-format]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const note = store.getActiveNote();
        if (!note || note.trashed) return;
        eventBus.emit('note:mode:change', { mode: btn.dataset.format });
      });
    });

    // Export dropdown toggle
    document.querySelector('#btn-export-menu')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dropdown?.classList.toggle('is-open');
    });

    // Case transform dropdown toggle
    document.querySelector('#btn-case-menu')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.caseDropdown?.classList.toggle('is-open');
    });

    this.caseDropdown?.addEventListener('click', (e) => {
      const item = e.target.closest('[data-case]');
      if (!item) return;
      transformSelectionCase(item.dataset.case);
      this.caseDropdown.classList.remove('is-open');
    });

    document.addEventListener('click', (e) => {
      if (this.dropdown && !this.dropdown.contains(e.target) && !e.target.closest('#btn-export-menu')) {
        this.dropdown.classList.remove('is-open');
      }
      if (this.caseDropdown && !this.caseDropdown.contains(e.target) && !e.target.closest('#btn-case-menu')) {
        this.caseDropdown.classList.remove('is-open');
      }
    });

    setupExportMenu(this.dropdown);

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
    if (cmd === 'pagebreak') {
      eventBus.emit('editor:format', { format: 'pagebreak' });
      return;
    }
    eventBus.emit('editor:format', { format: cmd });
  }

  syncState() {
    const note = store.getActiveNote();
    const { viewMode, editorFont } = store.getState();

    // Segmented buttons
    this.toolbar.querySelectorAll('[data-cmd^="view-"]').forEach((btn) => {
      const mode = btn.dataset.cmd.replace('view-', '');
      btn.classList.toggle('is-active', mode === viewMode);
    });

    // Font cycle label
    if (this.fontCycleBtn) {
      const labels = { sans: 'Aa', serif: 'Sr', mono: 'Mo' };
      this.fontCycleBtn.textContent = labels[editorFont] || 'Aa';
      this.fontCycleBtn.title = `Font: ${editorFont} (Click to switch)`;
    }

    // Header format buttons
    if (note) {
      document.querySelectorAll('[data-format]').forEach((btn) => {
        const active = (note.mode === 'html' && btn.dataset.format === 'html') ||
                       (note.mode === 'simple' && btn.dataset.format === 'plain') ||
                       (note.mode === 'markdown' && btn.dataset.format === 'markdown');
        btn.classList.toggle('is-active', active);
      });
    }
  }
}

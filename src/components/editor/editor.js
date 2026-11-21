import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { idb } from '../../utils/idb.js';
import { escapeHTML } from '../../utils/sanitize.js';
import { applyEditorFormat } from '../../utils/formatters.js';

export class EditorComponent {
  constructor(container) {
    this.container = container;
    this.titleInput = container.querySelector('#note-title');
    this.descInput = container.querySelector('#note-desc');
    this.folderSelect = container.querySelector('#note-folder-select');
    this.bodyTextarea = container.querySelector('#note-body');
    this.saveStatus = document.querySelector('#save-status');
    this.statusDot = document.querySelector('#status-dot');
    this.wordCountEl = document.querySelector('#word-count');
    this.charCountEl = document.querySelector('#char-count');
    this.readingTimeEl = document.querySelector('#reading-time');

    this.debounceTimer = null;
    this.bindEvents();
  }

  bindEvents() {
    const handleInput = () => {
      this.updateCounters();
      this.setSaveStatus('Saving...');
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.saveCurrentNote(), 400);
    };

    this.titleInput.addEventListener('input', handleInput);
    this.descInput.addEventListener('input', handleInput);
    this.bodyTextarea.addEventListener('input', handleInput);

    if (this.folderSelect) {
      this.folderSelect.addEventListener('change', async (e) => {
        const note = store.getActiveNote();
        if (!note) return;
        const updated = { ...note, folder: e.target.value || null, updatedAt: Date.now() };
        await idb.put(updated);
        const { notes } = store.getState();
        store.setState({ notes: notes.map((n) => (n.id === updated.id ? updated : n)) });
      });
    }

    this.bodyTextarea.addEventListener('keydown', (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key === 'b') {
        e.preventDefault();
        this.applyFormat('bold');
      } else if (isCmdOrCtrl && e.key === 'i') {
        e.preventDefault();
        this.applyFormat('italic');
      } else if (isCmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        this.applyFormat('link');
      }
    });

    eventBus.on('editor:format', ({ format }) => this.applyFormat(format));
    eventBus.on('note:mode:change', ({ mode }) => {
      const note = store.getActiveNote();
      if (!note) return;
      note.mode = mode;
      this.saveCurrentNote();
    });

    store.subscribe((state, changedKeys) => {
      if (changedKeys.includes('activeNoteId') || changedKeys.includes('notes')) {
        this.loadActiveNote();
      }
    });
  }

  loadActiveNote() {
    const note = store.getActiveNote();
    this.updateFolderSelect(note);
    if (!note) {
      this.titleInput.value = '';
      this.descInput.value = '';
      this.bodyTextarea.value = '';
      this.titleInput.disabled = true;
      this.descInput.disabled = true;
      this.bodyTextarea.disabled = true;
      this.updateCounters();
      this.setSaveStatus('No note selected');
      return;
    }

    this.titleInput.disabled = false;
    this.descInput.disabled = false;
    this.bodyTextarea.disabled = false;

    if (this.titleInput.value !== (note.title || '')) this.titleInput.value = note.title || '';
    if (this.descInput.value !== (note.description || '')) this.descInput.value = note.description || '';
    if (this.bodyTextarea.value !== (note.content || '')) this.bodyTextarea.value = note.content || '';

    this.updateCounters();
    this.setSaveStatus('Saved');
  }

  async saveCurrentNote() {
    const note = store.getActiveNote();
    if (!note) return;

    const updated = {
      ...note,
      title: this.titleInput.value.trim() || 'Untitled Note',
      description: this.descInput.value.trim(),
      content: this.bodyTextarea.value,
      updatedAt: Date.now()
    };

    await idb.put(updated);
    const { notes } = store.getState();
    const updatedNotes = notes.map((n) => (n.id === updated.id ? updated : n));
    store.setState({ notes: updatedNotes });
    this.setSaveStatus('Saved');
    eventBus.emit('preview:update', updated);
  }

  updateCounters() {
    const text = this.bodyTextarea.value.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const readMin = Math.max(1, Math.ceil(words / 200));

    if (this.wordCountEl) this.wordCountEl.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
    if (this.charCountEl) this.charCountEl.textContent = `${chars} chars`;
    if (this.readingTimeEl) this.readingTimeEl.textContent = `${readMin} min read`;
  }

  setSaveStatus(msg) {
    if (this.saveStatus) this.saveStatus.textContent = msg;
    if (this.statusDot) this.statusDot.classList.toggle('is-saving', msg.includes('...'));
  }

  applyFormat(format) {
    applyEditorFormat(this.bodyTextarea, format);
    this.saveCurrentNote();
  }

  updateFolderSelect(note) {
    if (!this.folderSelect) return;
    const { folders = [] } = store.getState();
    const current = note ? (note.folder || '') : '';
    this.folderSelect.disabled = !note;
    this.folderSelect.innerHTML = `<option value="">📁 No Folder</option>${folders.map((f) => `<option value="${escapeHTML(f)}" ${f === current ? 'selected' : ''}>📁 ${escapeHTML(f)}</option>`).join('')}`;
    this.folderSelect.value = current;
  }
}

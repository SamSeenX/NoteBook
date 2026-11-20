import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { idb } from '../../utils/idb.js';

export class EditorComponent {
  constructor(container) {
    this.container = container;
    this.titleInput = container.querySelector('#note-title');
    this.descInput = container.querySelector('#note-desc');
    this.bodyTextarea = container.querySelector('#note-body');
    this.saveStatus = document.querySelector('#save-status');
    this.wordCountEl = document.querySelector('#word-count');
    this.charCountEl = document.querySelector('#char-count');

    this.debounceTimer = null;
    this.bindEvents();
  }

  bindEvents() {
    const handleInput = () => {
      this.updateCounters();
      this.setSaveStatus('Saving...');
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.saveCurrentNote(), 600);
    };

    this.titleInput.addEventListener('input', handleInput);
    this.descInput.addEventListener('input', handleInput);
    this.bodyTextarea.addEventListener('input', handleInput);

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

    // Only update value if different to prevent cursor jumps
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
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;

    if (this.wordCountEl) this.wordCountEl.textContent = `${words} words`;
    if (this.charCountEl) this.charCountEl.textContent = `${chars} chars`;
  }

  setSaveStatus(msg) {
    if (this.saveStatus) this.saveStatus.textContent = msg;
  }

  applyFormat(format) {
    const el = this.bodyTextarea;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);
    let replacement = '';
    let cursorOffset = 0;

    switch (format) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        cursorOffset = selected ? replacement.length : 2;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        cursorOffset = selected ? replacement.length : 1;
        break;
      case 'h1':
        replacement = `\n# ${selected || 'Heading 1'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Heading 2'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'list':
        replacement = `\n- ${selected || 'List item'}`;
        cursorOffset = replacement.length;
        break;
      case 'ordered-list':
        replacement = `\n1. ${selected || 'List item'}`;
        cursorOffset = replacement.length;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Quote'}\n`;
        cursorOffset = replacement.length;
        break;
      case 'code':
        replacement = selected.includes('\n') ? `\n\`\`\`\n${selected}\n\`\`\`\n` : `\`${selected || 'code'}\``;
        cursorOffset = replacement.length;
        break;
      default:
        return;
    }

    el.setRangeText(replacement, start, end, 'select');
    el.selectionStart = start + cursorOffset;
    el.selectionEnd = start + cursorOffset;
    el.focus();
    this.saveCurrentNote();
  }
}

import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { parseMarkdown } from '../../utils/markdown.js';
import { escapeHTML } from '../../utils/sanitize.js';

export class PreviewComponent {
  constructor(container) {
    this.container = container;
    this.contentEl = container.querySelector('#preview-content');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    eventBus.on('preview:update', (note) => {
      this.renderNote(note);
    });

    store.subscribe((state, changedKeys) => {
      if (changedKeys.includes('activeNoteId') || changedKeys.includes('notes')) {
        this.render();
      }
    });
  }

  render() {
    const note = store.getActiveNote();
    this.renderNote(note);
  }

  renderNote(note) {
    if (!note) {
      this.contentEl.innerHTML = `
        <div class="empty-state">
          <p>Select or create a note to preview</p>
        </div>
      `;
      return;
    }

    if (note.mode === 'simple') {
      this.contentEl.innerHTML = `<pre style="white-space: pre-wrap; font-family: var(--font-sans);">${escapeHTML(note.content || 'Empty note')}</pre>`;
    } else {
      const parsed = parseMarkdown(note.content || '');
      this.contentEl.innerHTML = parsed || '<p style="color: var(--text-muted); font-style: italic;">No content to preview</p>';
    }
  }
}

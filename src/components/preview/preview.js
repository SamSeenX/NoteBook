import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { idb } from '../../utils/idb.js';
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

    // Interactive Checklist Listener
    this.contentEl.addEventListener('change', async (e) => {
      if (e.target && e.target.type === 'checkbox') {
        const note = store.getActiveNote();
        if (!note || note.trashed) return;

        const allCheckboxes = Array.from(this.contentEl.querySelectorAll('input[type="checkbox"]'));
        const index = allCheckboxes.indexOf(e.target);
        if (index === -1) return;

        let matchCount = 0;
        note.content = note.content.replace(/^(\s*[-*+]\s+\[)([ xX])(\])/gm, (full, p1, p2, p3) => {
          if (matchCount++ === index) {
            return `${p1}${e.target.checked ? 'x' : ' '}${p3}`;
          }
          return full;
        });

        note.updatedAt = Date.now();
        await idb.put(note);
        const { notes } = store.getState();
        const updatedNotes = notes.map((n) => (n.id === note.id ? note : n));
        store.setState({ notes: updatedNotes });
        const editorTextarea = document.querySelector('#note-body');
        if (editorTextarea) editorTextarea.value = note.content;
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

    if (note.mode === 'html') {
      this.contentEl.innerHTML = note.content || '<p style="color:var(--text-muted); font-style:italic;">Empty HTML document</p>';
    } else if (note.mode === 'simple') {
      this.contentEl.innerHTML = `<pre style="white-space:pre-wrap; font-family:var(--font-editor);">${escapeHTML(note.content || 'Empty note')}</pre>`;
    } else {
      const parsed = parseMarkdown(note.content || '');
      this.contentEl.innerHTML = parsed || '<p style="color:var(--text-muted); font-style:italic;">No content to preview</p>';
    }
  }
}

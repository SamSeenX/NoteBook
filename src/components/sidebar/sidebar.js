import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { idb } from '../../utils/idb.js';
import { renderNoteItem } from './note-item.js';

export class SidebarComponent {
  constructor(asideElement, backdropElement) {
    this.aside = asideElement;
    this.backdrop = backdropElement;
    this.listContainer = asideElement.querySelector('#notes-list');
    this.searchInput = asideElement.querySelector('#search-input');
    this.sortSelect = asideElement.querySelector('#sort-select');
    this.newNoteBtn = asideElement.querySelector('#new-note-btn');

    this.bindEvents();
    this.render();
  }

  bindEvents() {
    this.searchInput.addEventListener('input', (e) => {
      store.setState({ searchQuery: e.target.value });
    });

    this.sortSelect.addEventListener('change', (e) => {
      store.setState({ sortBy: e.target.value });
    });

    if (this.newNoteBtn) {
      this.newNoteBtn.addEventListener('click', () => {
        eventBus.emit('note:create');
      });
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => {
        store.setState({ isSidebarOpen: false });
      });
    }

    // Event delegation for list items
    this.listContainer.addEventListener('click', async (e) => {
      const pinBtn = e.target.closest('[data-action="pin"]');
      if (pinBtn) {
        e.stopPropagation();
        const noteId = pinBtn.dataset.id;
        await this.togglePin(noteId);
        return;
      }

      const itemCard = e.target.closest('.note-item');
      if (itemCard) {
        const noteId = itemCard.dataset.id;
        eventBus.emit('note:select', { id: noteId });
        if (window.innerWidth <= 768) {
          store.setState({ isSidebarOpen: false });
        }
      }
    });

    // Store state subscriber
    store.subscribe((state, changedKeys) => {
      if (
        changedKeys.includes('notes') ||
        changedKeys.includes('activeNoteId') ||
        changedKeys.includes('searchQuery') ||
        changedKeys.includes('sortBy')
      ) {
        this.render();
      }

      if (changedKeys.includes('isSidebarOpen')) {
        this.updateSidebarVisibility(state.isSidebarOpen);
      }
    });
  }

  async togglePin(id) {
    const state = store.getState();
    const note = state.notes.find((n) => n.id === id);
    if (!note) return;

    const updatedNote = { ...note, isPinned: !note.isPinned, updatedAt: Date.now() };
    await idb.put(updatedNote);

    const updatedNotes = state.notes.map((n) => (n.id === id ? updatedNote : n));
    store.setState({ notes: updatedNotes });
  }

  updateSidebarVisibility(isOpen) {
    if (isOpen) {
      this.aside.classList.add('is-open');
      if (this.backdrop) this.backdrop.classList.add('is-active');
    } else {
      this.aside.classList.remove('is-open');
      if (this.backdrop) this.backdrop.classList.remove('is-active');
    }
  }

  render() {
    const filtered = store.getFilteredNotes();
    const { activeNoteId } = store.getState();

    if (filtered.length === 0) {
      this.listContainer.innerHTML = `
        <div class="empty-state">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <p style="font-size: 0.9rem;">No notes found</p>
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = filtered
      .map((note) => renderNoteItem(note, note.id === activeNoteId))
      .join('');
  }
}

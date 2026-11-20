import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { idb } from '../../utils/idb.js';
import { renderNoteItem } from './note-item.js';
import { renderTagsBar } from './tags-bar.js';

export class SidebarComponent {
  constructor(asideElement, backdropElement) {
    this.aside = asideElement;
    this.backdrop = backdropElement;
    this.listContainer = asideElement.querySelector('#notes-list');
    this.searchInput = asideElement.querySelector('#search-input');
    this.sortSelect = asideElement.querySelector('#sort-select');
    this.newNoteBtn = asideElement.querySelector('#new-note-btn');
    this.tagsBar = asideElement.querySelector('#tags-bar');
    this.trashToggleBtn = asideElement.querySelector('#trash-toggle-btn');
    this.trashBanner = asideElement.querySelector('#trash-banner');

    this.bindEvents();
    this.updateSidebarVisibility(store.getState().isSidebarOpen);
    this.render();
  }

  bindEvents() {
    this.searchInput.addEventListener('input', (e) => {
      store.setState({ searchQuery: e.target.value });
    });

    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (this.searchInput.value) {
          this.searchInput.value = '';
        }
        this.searchInput.blur();
        store.setState({ searchQuery: '', isSidebarOpen: false });
      }
    });

    this.sortSelect.addEventListener('change', (e) => {
      store.setState({ sortBy: e.target.value });
    });

    if (this.newNoteBtn) {
      this.newNoteBtn.addEventListener('click', () => {
        if (store.getState().showTrash) store.setState({ showTrash: false });
        eventBus.emit('note:create');
      });
    }

    if (this.trashToggleBtn) {
      this.trashToggleBtn.addEventListener('click', () => {
        store.setState({ showTrash: !store.getState().showTrash, activeTag: null });
      });
    }

    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => {
        store.setState({ isSidebarOpen: false });
      });
    }

    this.tagsBar.addEventListener('click', (e) => {
      const pill = e.target.closest('[data-tag]');
      if (!pill) return;
      const tag = pill.dataset.tag;
      const current = store.getState().activeTag;
      store.setState({ activeTag: current === tag ? null : tag });
    });

    this.listContainer.addEventListener('click', async (e) => {
      const pinBtn = e.target.closest('[data-action="pin"]');
      if (pinBtn) {
        e.stopPropagation();
        await this.togglePin(pinBtn.dataset.id);
        return;
      }

      const restoreBtn = e.target.closest('[data-action="restore"]');
      if (restoreBtn) {
        e.stopPropagation();
        eventBus.emit('note:restore', { id: restoreBtn.dataset.id });
        return;
      }

      const destroyBtn = e.target.closest('[data-action="destroy"]');
      if (destroyBtn) {
        e.stopPropagation();
        eventBus.emit('modal:confirm', {
          title: 'Permanently Delete Note',
          message: 'This note will be permanently erased. This action cannot be undone.',
          confirmText: 'Delete Forever',
          isDanger: true,
          onConfirm: () => eventBus.emit('note:destroy', { id: destroyBtn.dataset.id })
        });
        return;
      }

      const itemCard = e.target.closest('.note-item');
      if (itemCard) {
        eventBus.emit('note:select', { id: itemCard.dataset.id });
        if (window.innerWidth <= 768) store.setState({ isSidebarOpen: false });
      }
    });

    store.subscribe((state, changedKeys) => {
      if (
        changedKeys.includes('notes') ||
        changedKeys.includes('activeNoteId') ||
        changedKeys.includes('searchQuery') ||
        changedKeys.includes('sortBy') ||
        changedKeys.includes('activeTag') ||
        changedKeys.includes('showTrash')
      ) {
        this.render();
      }

      if (changedKeys.includes('isSidebarOpen')) {
        this.updateSidebarVisibility(state.isSidebarOpen);
      }
    });

    window.addEventListener('resize', () => {
      this.updateSidebarVisibility(store.getState().isSidebarOpen);
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
    if (window.innerWidth <= 768) {
      this.aside.classList.toggle('is-open', isOpen);
      this.aside.classList.remove('is-collapsed');
      if (this.backdrop) this.backdrop.classList.toggle('is-active', isOpen);
    } else {
      this.aside.classList.remove('is-open');
      this.aside.classList.toggle('is-collapsed', !isOpen);
      if (this.backdrop) this.backdrop.classList.remove('is-active');
    }
  }

  render() {
    renderTagsBar(this.tagsBar);
    const { showTrash, activeNoteId } = store.getState();
    const filtered = store.getFilteredNotes();

    if (this.trashBanner) {
      this.trashBanner.style.display = showTrash ? 'flex' : 'none';
    }
    if (this.trashToggleBtn) {
      this.trashToggleBtn.classList.toggle('is-active', showTrash);
    }

    if (filtered.length === 0) {
      this.listContainer.innerHTML = `
        <div class="empty-state">
          <p style="font-size: 0.9rem;">${showTrash ? 'Trash is empty' : 'No notes found'}</p>
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = filtered
      .map((note) => renderNoteItem(note, note.id === activeNoteId, showTrash))
      .join('');
  }
}

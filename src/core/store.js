import { eventBus } from './event-bus.js';
import { extractTags } from '../utils/tags.js';

class Store {
  constructor() {
    this.state = {
      notes: [],
      activeNoteId: null,
      searchQuery: '',
      activeTag: null,
      showTrash: false,
      zenMode: false,
      sortBy: localStorage.getItem('notes_sort_by') || 'updated_desc',
      viewMode: localStorage.getItem('notes_view_mode') || 'split',
      editorFont: localStorage.getItem('notes_font') || 'sans',
      theme: localStorage.getItem('notes_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
      isSidebarOpen: localStorage.getItem('notes_sidebar_open') === 'true'
    };
    this.listeners = new Set();
  }

  getState() {
    return { ...this.state };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changedKeys = []) {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState, changedKeys);
      } catch (err) {
        console.error('Store listener error:', err);
      }
    });
  }

  setState(partial) {
    const changedKeys = Object.keys(partial);
    this.state = { ...this.state, ...partial };

    if (partial.sortBy !== undefined) {
      localStorage.setItem('notes_sort_by', partial.sortBy);
    }
    if (partial.viewMode !== undefined) {
      localStorage.setItem('notes_view_mode', partial.viewMode);
    }
    if (partial.editorFont !== undefined) {
      localStorage.setItem('notes_font', partial.editorFont);
      document.documentElement.setAttribute('data-font', partial.editorFont);
    }
    if (partial.theme !== undefined) {
      localStorage.setItem('notes_theme', partial.theme);
      document.documentElement.setAttribute('data-theme', partial.theme);
    }
    if (partial.zenMode !== undefined) {
      document.body.classList.toggle('zen-mode', partial.zenMode);
    }
    if (partial.isSidebarOpen !== undefined) {
      localStorage.setItem('notes_sidebar_open', String(partial.isSidebarOpen));
    }

    this.notify(changedKeys);
  }

  getActiveNote() {
    if (!this.state.activeNoteId) return null;
    return this.state.notes.find((n) => n.id === this.state.activeNoteId) || null;
  }

  getFilteredNotes() {
    const { notes, searchQuery, sortBy, activeTag, showTrash } = this.state;

    // Filter by active vs trashed
    let filtered = notes.filter((n) => (showTrash ? Boolean(n.trashed) : !n.trashed));

    // Filter by tag if selected
    if (!showTrash && activeTag) {
      filtered = filtered.filter((n) => extractTags(n.content).includes(activeTag));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(q)) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          (n.content && n.content.toLowerCase().includes(q))
      );
    }

    filtered.sort((a, b) => {
      if (!showTrash) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }

      switch (sortBy) {
        case 'updated_asc':
          return (a.updatedAt || 0) - (b.updatedAt || 0);
        case 'created_desc':
          return (b.createdAt || 0) - (a.createdAt || 0);
        case 'title_asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'title_desc':
          return (b.title || '').localeCompare(a.title || '');
        case 'updated_desc':
        default:
          return (b.updatedAt || 0) - (a.updatedAt || 0);
      }
    });

    return filtered;
  }
}

export const store = new Store();

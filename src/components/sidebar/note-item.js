import { escapeHTML } from '../../utils/sanitize.js';

export function renderNoteItem(note, isActive) {
  const dateFormatted = new Date(note.updatedAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  const activeClass = isActive ? 'is-active' : '';
  const pinnedClass = note.isPinned ? 'is-pinned' : '';

  return `
    <div class="note-item ${activeClass} ${pinnedClass}" data-id="${note.id}" role="button" tabindex="0">
      <div class="note-item-header">
        <span class="note-item-title">${escapeHTML(note.title || 'Untitled Note')}</span>
        <div class="note-item-actions">
          <button class="icon-btn-sm btn-pin" data-action="pin" data-id="${note.id}" title="${note.isPinned ? 'Unpin note' : 'Pin note'}" aria-label="Pin note">
            <svg class="pin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="17" x2="12" y2="22"></line>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.89A2 2 0 0 1 15 10.77V6h1a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h1v4.77a2 2 0 0 1-1.11 1.79l-1.78.89A2 2 0 0 0 5 15.24Z"></path>
            </svg>
          </button>
        </div>
      </div>
      ${note.description ? `<p class="note-item-desc">${escapeHTML(note.description)}</p>` : ''}
      <div class="note-item-footer">
        <span>${dateFormatted}</span>
        <span class="badge">${escapeHTML(note.mode === 'markdown' ? 'MD' : 'TXT')}</span>
      </div>
    </div>
  `;
}

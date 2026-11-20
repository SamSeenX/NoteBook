import { escapeHTML } from '../../utils/sanitize.js';
import { extractTags } from '../../utils/tags.js';

export function renderNoteItem(note, isActive, isTrashMode = false) {
  const dateFormatted = new Date(note.updatedAt || Date.now()).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  });

  const activeClass = isActive ? 'is-active' : '';
  const pinnedClass = note.isPinned ? 'is-pinned' : '';
  const tags = extractTags(note.content || '').slice(0, 3);

  if (isTrashMode) {
    return `
      <div class="note-item ${activeClass}" data-id="${note.id}" role="button" tabindex="0">
        <div class="note-item-header">
          <span class="note-item-title">${escapeHTML(note.title || 'Untitled Note')}</span>
          <div class="note-item-actions">
            <button class="icon-btn-sm" data-action="restore" data-id="${note.id}" title="Restore Note" aria-label="Restore Note">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
            <button class="icon-btn-sm" data-action="destroy" data-id="${note.id}" title="Delete Permanently" aria-label="Delete Permanently" style="color: var(--danger-color);">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        ${note.description ? `<p class="note-item-desc">${escapeHTML(note.description)}</p>` : ''}
        <div class="note-item-footer">
          <span>Deleted</span>
          <span class="badge" style="color: var(--danger-color);">Trash</span>
        </div>
      </div>
    `;
  }

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
        <div style="display:flex; align-items:center; gap:4px; overflow:hidden;">
          <span>${dateFormatted}</span>
          ${tags.map((t) => `<span class="badge" style="font-size:0.7rem; padding:1px 5px;">#${escapeHTML(t)}</span>`).join('')}
        </div>
        <span class="badge">${escapeHTML(note.mode === 'markdown' ? 'MD' : 'TXT')}</span>
      </div>
    </div>
  `;
}

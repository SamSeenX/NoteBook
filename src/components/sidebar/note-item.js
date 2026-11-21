import { escapeHTML } from '../../utils/sanitize.js';
import { extractTags } from '../../utils/tags.js';
import { formatRelativeTime } from '../../utils/relative-time.js';

export function renderNoteItem(note, isActive, isTrashMode = false) {
  const timeFormatted = formatRelativeTime(note.updatedAt || Date.now());
  const activeClass = isActive ? 'is-active' : '';
  const tags = extractTags(note.content || '').slice(0, 2);

  const formatKey = (note.mode === 'html' ? 'html' : (note.mode === 'simple' ? 'plain' : 'md'));
  const formatLabel = formatKey === 'html' ? 'HTML' : (formatKey === 'plain' ? 'TXT' : 'MD');

  if (isTrashMode) {
    return `
      <div class="note-item ${activeClass}" data-id="${note.id}" role="button" tabindex="0">
        <div class="note-item-header">
          <span class="note-item-title">${escapeHTML(note.title || 'Untitled Note')}</span>
          <div class="note-item-actions">
            <button class="icon-btn-sm" data-action="restore" data-id="${note.id}" title="Restore Note" aria-label="Restore Note">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
            </button>
            <button class="icon-btn-sm" data-action="destroy" data-id="${note.id}" title="Delete Forever" aria-label="Delete Forever" style="color: var(--danger-color);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
        ${note.description ? `<p class="note-item-desc">${escapeHTML(note.description)}</p>` : ''}
        <div class="note-item-footer">
          <span>In Trash</span>
          <span class="format-badge" style="color:var(--danger-color); background:var(--danger-subtle);">Trash</span>
        </div>
      </div>
    `;
  }

  return `
    <div class="note-item ${activeClass}" data-id="${note.id}" role="button" tabindex="0">
      <div class="note-item-header">
        <div class="note-item-title-row">
          ${note.isPinned ? `
            <svg class="pin-icon" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="color:var(--accent-color); flex-shrink:0;">
              <path d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75h9z"/>
            </svg>
          ` : ''}
          <span class="note-item-title">${escapeHTML(note.title || 'Untitled Note')}</span>
        </div>
        <span class="format-badge format-badge-${formatKey}">${formatLabel}</span>
      </div>
      ${note.description ? `<p class="note-item-desc">${escapeHTML(note.description)}</p>` : ''}
      <div class="note-item-footer">
        <div style="display:flex; align-items:center; gap:5px; overflow:hidden;">
          <span>${timeFormatted}</span>
          ${note.folder ? `<span style="color:var(--accent-color); font-size:0.68rem;">📁 ${escapeHTML(note.folder)}</span>` : ''}
          ${tags.map((t) => `<span style="color:var(--text-muted);">#${escapeHTML(t)}</span>`).join('')}
        </div>
        <div class="note-item-actions">
          <button class="icon-btn-sm" data-action="pin" data-id="${note.id}" title="${note.isPinned ? 'Unpin' : 'Pin'}" aria-label="Pin">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="${note.isPinned ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M17.59 3.32c1.1.13 1.91 1.08 1.91 2.19V21L12 17.25 4.5 21V5.5c0-1.1.8-2.05 1.9-2.18A48.5 48.5 0 0 1 12 3c1.9 0 3.76.11 5.59.32z"/>
            </svg>
          </button>
          <button class="icon-btn-sm" data-action="trash" data-id="${note.id}" title="Trash" aria-label="Trash">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

import { store } from '../../core/store.js';
import { getAllUniqueTags } from '../../utils/tags.js';
import { escapeHTML } from '../../utils/sanitize.js';

export function renderTagsBar(tagsBarEl) {
  const { notes, activeTag, showTrash } = store.getState();
  if (showTrash) {
    tagsBarEl.style.display = 'none';
    return;
  }
  const tags = getAllUniqueTags(notes);
  if (tags.length === 0) {
    tagsBarEl.style.display = 'none';
    return;
  }
  tagsBarEl.style.display = 'flex';
  tagsBarEl.innerHTML = `
    <div class="tags-scroll">
      <button class="tag-pill ${!activeTag ? 'is-active' : ''}" data-tag="">All</button>
      ${tags.map((t) => `
        <button class="tag-pill ${activeTag === t.tag ? 'is-active' : ''}" data-tag="${escapeHTML(t.tag)}">
          #${escapeHTML(t.tag)} <span class="tag-pill-count">${t.count}</span>
        </button>
      `).join('')}
    </div>
    <button id="btn-tag-cloud" class="tag-cloud-btn" title="View all tags cloud" aria-label="Tag Cloud">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
        <line x1="7" y1="7" x2="7.01" y2="7"></line>
      </svg>
    </button>
  `;
}

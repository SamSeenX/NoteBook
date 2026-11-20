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
    <button class="tag-pill ${!activeTag ? 'is-active' : ''}" data-tag="">All</button>
    ${tags.map((t) => `
      <button class="tag-pill ${activeTag === t.tag ? 'is-active' : ''}" data-tag="${escapeHTML(t.tag)}">
        #${escapeHTML(t.tag)} <span class="tag-pill-count">${t.count}</span>
      </button>
    `).join('')}
  `;
}

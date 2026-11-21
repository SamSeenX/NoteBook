import { store } from '../../core/store.js';
import { eventBus } from '../../core/event-bus.js';
import { escapeHTML } from '../../utils/sanitize.js';

export function renderFoldersBar(container) {
  if (!container) return;

  const state = store.getState();
  const { notes, folders = [], activeFolder } = state;
  const activeNotes = notes.filter((n) => !n.trashed);

  const totalCount = activeNotes.length;
  const counts = {};
  folders.forEach((f) => { counts[f] = 0; });
  let uncategorizedCount = 0;

  activeNotes.forEach((n) => {
    if (n.folder && counts[n.folder] !== undefined) {
      counts[n.folder]++;
    } else {
      uncategorizedCount++;
    }
  });

  const isAllActive = activeFolder === null;

  container.innerHTML = `
    <button class="folder-chip ${isAllActive ? 'is-active' : ''}" data-folder="all">
      <span>📁 All</span><span class="folder-count">${totalCount}</span>
    </button>
    ${folders.map((f) => `
      <button class="folder-chip ${activeFolder === f ? 'is-active' : ''}" data-folder="${escapeHTML(f)}">
        <span>${escapeHTML(f)}</span><span class="folder-count">${counts[f] || 0}</span>
      </button>
    `).join('')}
    ${uncategorizedCount > 0 ? `
      <button class="folder-chip ${activeFolder === 'Uncategorized' ? 'is-active' : ''}" data-folder="Uncategorized">
        <span>Other</span><span class="folder-count">${uncategorizedCount}</span>
      </button>
    ` : ''}
    <button class="btn-add-folder" id="btn-add-folder" title="New Folder" aria-label="New Folder">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  `;

  container.onclick = (e) => {
    const chip = e.target.closest('[data-folder]');
    if (chip) {
      const folder = chip.dataset.folder;
      store.setState({ activeFolder: folder === 'all' ? null : (activeFolder === folder ? null : folder) });
      return;
    }

    const addBtn = e.target.closest('#btn-add-folder');
    if (addBtn) {
      const name = window.prompt('Enter new folder name:');
      if (name && name.trim()) {
        const trimmed = name.trim();
        const currentFolders = store.getState().folders || [];
        if (!currentFolders.includes(trimmed)) {
          const next = [...currentFolders, trimmed];
          store.setState({ folders: next, activeFolder: trimmed });
          eventBus.emit('toast:show', { message: `Folder "${trimmed}" created.`, type: 'info' });
        }
      }
    }
  };
}

import { store } from '../../core/store.js';

export function setupSortMenu(asideElement) {
  const btn = asideElement.querySelector('#btn-sort-menu');
  const dropdown = asideElement.querySelector('#sort-dropdown');
  if (!btn || !dropdown) return;

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('is-open');
  });

  dropdown.addEventListener('click', (e) => {
    const item = e.target.closest('[data-sort]');
    if (!item) return;
    store.setState({ sortBy: item.dataset.sort });
    dropdown.classList.remove('is-open');
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
      dropdown.classList.remove('is-open');
    }
  });

  store.subscribe((state, changedKeys) => {
    if (changedKeys.includes('sortBy')) {
      dropdown.querySelectorAll('[data-sort]').forEach((item) => {
        item.classList.toggle('is-active', item.dataset.sort === state.sortBy);
      });
    }
  });

  dropdown.querySelectorAll('[data-sort]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.sort === store.getState().sortBy);
  });
}

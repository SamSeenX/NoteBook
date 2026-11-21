import { store } from '../core/store.js';
import { eventBus } from '../core/event-bus.js';
import { exportNoteToPDF } from './pdf.js';

export function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const isCmd = e.metaKey || e.ctrlKey;
    const tag = document.activeElement?.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

    if (isCmd && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      store.setState({ zenMode: !store.getState().zenMode });
    } else if (isCmd && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (!store.getState().isSidebarOpen) store.setState({ isSidebarOpen: true });
      setTimeout(() => {
        const input = document.getElementById('search-input');
        if (input) { input.focus(); input.select(); }
      }, 50);
    } else if (isCmd && (e.key === '\\' || e.key === '|' || e.code === 'Backslash')) {
      e.preventDefault();
      e.stopPropagation();
      store.setState({ isSidebarOpen: !store.getState().isSidebarOpen });
    } else if (isCmd && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      const active = store.getActiveNote();
      if (active) exportNoteToPDF(active);
    } else if ((isCmd && e.key.toLowerCase() === 'n') || (e.altKey && e.key.toLowerCase() === 'n')) {
      e.preventDefault();
      e.stopPropagation();
      eventBus.emit('note:create');
    } else if ((isCmd && e.key === '/') || (!isCmd && e.key === '?' && !isInput)) {
      e.preventDefault();
      eventBus.emit('modal:help');
    } else if (e.key === 'Escape' && store.getState().zenMode) {
      store.setState({ zenMode: false });
    }
  }, { capture: true });
}

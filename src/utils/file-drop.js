import { idb } from './idb.js';
import { store } from '../core/store.js';
import { eventBus } from '../core/event-bus.js';

export function setupDragAndDrop() {
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    for (const file of files) {
      if (
        file.name.endsWith('.md') ||
        file.name.endsWith('.txt') ||
        file.name.endsWith('.markdown')
      ) {
        const text = await file.text();
        const imported = {
          id: 'note_' + Date.now() + Math.random(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          description: `Imported from ${file.name}`,
          content: text,
          mode: 'markdown',
          isPinned: false,
          trashed: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await idb.put(imported);
        store.setState({
          notes: [imported, ...store.getState().notes],
          activeNoteId: imported.id
        });
        eventBus.emit('toast:show', {
          message: `Imported "${imported.title}"`,
          type: 'success'
        });
      }
    }
  });
}

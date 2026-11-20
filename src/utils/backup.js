import { idb } from './idb.js';
import { eventBus } from '../core/event-bus.js';

export async function exportAllNotesAsJSON() {
  const notes = await idb.getAll();
  const data = {
    app: 'Notes PWA',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    notes
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `notes-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  eventBus.emit('toast:show', {
    message: `Exported ${notes.length} notes successfully.`,
    type: 'success'
  });
}

export async function importNotesFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const importedNotes = Array.isArray(parsed) ? parsed : parsed.notes;

        if (!Array.isArray(importedNotes)) {
          throw new Error('Invalid JSON structure: missing notes array');
        }

        // Validate and normalize notes
        const sanitizedNotes = importedNotes.map((n) => ({
          id: n.id || String(Date.now() + Math.random()),
          title: n.title || 'Imported Note',
          description: n.description || '',
          content: n.content || '',
          mode: n.mode || 'markdown',
          isPinned: Boolean(n.isPinned),
          createdAt: n.createdAt || Date.now(),
          updatedAt: n.updatedAt || Date.now()
        }));

        await idb.bulkPut(sanitizedNotes);
        eventBus.emit('toast:show', {
          message: `Imported ${sanitizedNotes.length} notes.`,
          type: 'success'
        });
        eventBus.emit('notes:reloaded');
        resolve(sanitizedNotes);
      } catch (err) {
        eventBus.emit('toast:show', {
          message: 'Failed to import backup file. Invalid format.',
          type: 'danger'
        });
        reject(err);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

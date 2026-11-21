import { store } from '../core/store.js';
import { eventBus } from '../core/event-bus.js';
import { exportNoteToPDF } from './pdf.js';

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function setupExportMenu(dropdownElement) {
  document.querySelector('#action-export-pdf')?.addEventListener('click', () => {
    dropdownElement?.classList.remove('is-open');
    const note = store.getActiveNote();
    if (note) exportNoteToPDF(note);
  });

  document.querySelector('#action-export-md')?.addEventListener('click', () => {
    dropdownElement?.classList.remove('is-open');
    const note = store.getActiveNote();
    if (!note) return;
    downloadFile(`${note.title || 'note'}.md`, `# ${note.title}\n\n${note.content || ''}`, 'text/markdown');
    eventBus.emit('toast:show', { message: 'Exported .md file', type: 'success' });
  });

  document.querySelector('#action-export-html')?.addEventListener('click', () => {
    dropdownElement?.classList.remove('is-open');
    const note = store.getActiveNote();
    if (!note) return;
    downloadFile(`${note.title || 'note'}.html`, `<!DOCTYPE html><html><body><h1>${note.title}</h1>${note.content}</body></html>`, 'text/html');
    eventBus.emit('toast:show', { message: 'Exported .html file', type: 'success' });
  });

  document.querySelector('#action-export-txt')?.addEventListener('click', () => {
    dropdownElement?.classList.remove('is-open');
    const note = store.getActiveNote();
    if (!note) return;
    downloadFile(`${note.title || 'note'}.txt`, `${note.title}\n\n${note.content || ''}`, 'text/plain');
    eventBus.emit('toast:show', { message: 'Exported .txt file', type: 'success' });
  });

  document.querySelector('#action-copy')?.addEventListener('click', async () => {
    dropdownElement?.classList.remove('is-open');
    const note = store.getActiveNote();
    if (!note) return;
    await navigator.clipboard.writeText(note.content || '');
    eventBus.emit('toast:show', { message: 'Copied note content to clipboard', type: 'success' });
  });
}

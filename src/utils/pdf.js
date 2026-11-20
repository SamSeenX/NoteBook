import { parseMarkdown } from './markdown.js';
import { escapeHTML } from './sanitize.js';

export function exportNoteToPDF(note) {
  if (!note) return;

  // Set document title temporarily to determine default PDF filename
  const originalTitle = document.title;
  const safeFilename = (note.title || 'Untitled Note').trim().replace(/[/\\?%*:|"<>]/g, '-');
  document.title = safeFilename;

  // Build or update print header in DOM
  let printHeader = document.getElementById('print-document-header');
  if (!printHeader) {
    printHeader = document.createElement('div');
    printHeader.id = 'print-document-header';
    printHeader.className = 'print-header';
    const previewWrapper = document.getElementById('preview-wrapper');
    if (previewWrapper) {
      previewWrapper.prepend(printHeader);
    }
  }

  const updatedDateStr = new Date(note.updatedAt || Date.now()).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  printHeader.innerHTML = `
    <h1 class="print-title">${escapeHTML(note.title || 'Untitled Note')}</h1>
    ${note.description ? `<p class="print-desc">${escapeHTML(note.description)}</p>` : ''}
    <p class="print-meta">Last Updated: ${escapeHTML(updatedDateStr)}</p>
  `;

  // Trigger browser native print dialog
  window.print();

  // Restore document title after print dialog closes
  setTimeout(() => {
    document.title = originalTitle;
  }, 1000);
}

import { eventBus } from '../core/event-bus.js';

export function toCase(text, caseType) {
  if (!text) return '';
  switch (caseType) {
    case 'upper':
      return text.toUpperCase();
    case 'lower':
      return text.toLowerCase();
    case 'title':
      return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
    case 'camel': {
      const words = text.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g) || [text];
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join('');
    }
    case 'pascal': {
      const words = text.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g) || [text];
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
    }
    case 'snake': {
      const words = text.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g) || [text];
      return words.map((w) => w.toLowerCase()).join('_');
    }
    case 'kebab': {
      const words = text.match(/[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g) || [text];
      return words.map((w) => w.toLowerCase()).join('-');
    }
    default:
      return text;
  }
}

export function transformSelectionCase(caseType) {
  const textarea = document.querySelector('#note-body');
  if (!textarea) return;

  let start = textarea.selectionStart;
  let end = textarea.selectionEnd;
  const value = textarea.value;

  if (start === end) {
    // Expand to word boundaries under cursor
    while (start > 0 && /\w/.test(value[start - 1])) start--;
    while (end < value.length && /\w/.test(value[end])) end++;
  }

  if (start === end) {
    eventBus.emit('toast:show', { message: 'Select text to change case', type: 'info' });
    return;
  }

  const selectedText = value.slice(start, end);
  const converted = toCase(selectedText, caseType);

  textarea.setRangeText(converted, start, end, 'select');
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}

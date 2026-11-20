export function applyEditorFormat(textarea, format) {
  const el = textarea;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = el.value.substring(start, end);
  let replacement = '';
  let cursorOffset = 0;

  switch (format) {
    case 'bold':
      replacement = `**${selected || 'bold text'}**`;
      cursorOffset = selected ? replacement.length : 2;
      break;
    case 'italic':
      replacement = `*${selected || 'italic text'}*`;
      cursorOffset = selected ? replacement.length : 1;
      break;
    case 'link':
      replacement = `[${selected || 'link text'}](https://)`;
      cursorOffset = selected ? replacement.length - 1 : 1;
      break;
    case 'h1':
      replacement = `\n# ${selected || 'Heading 1'}\n`;
      cursorOffset = replacement.length;
      break;
    case 'h2':
      replacement = `\n## ${selected || 'Heading 2'}\n`;
      cursorOffset = replacement.length;
      break;
    case 'h3':
      replacement = `\n### ${selected || 'Heading 3'}\n`;
      cursorOffset = replacement.length;
      break;
    case 'task':
      replacement = `\n- [ ] ${selected || 'Task item'}`;
      cursorOffset = replacement.length;
      break;
    case 'list':
      replacement = `\n- ${selected || 'List item'}`;
      cursorOffset = replacement.length;
      break;
    case 'ordered-list':
      replacement = `\n1. ${selected || 'List item'}`;
      cursorOffset = replacement.length;
      break;
    case 'quote':
      replacement = `\n> ${selected || 'Quote'}\n`;
      cursorOffset = replacement.length;
      break;
    case 'code':
      replacement = selected.includes('\n') ? `\n\`\`\`\n${selected}\n\`\`\`\n` : `\`${selected || 'code'}\``;
      cursorOffset = replacement.length;
      break;
    case 'pagebreak':
      replacement = `\n\n<div class="pdf-page-break"></div>\n\n`;
      cursorOffset = replacement.length;
      break;
    default:
      return;
  }

  el.setRangeText(replacement, start, end, 'select');
  el.selectionStart = start + cursorOffset;
  el.selectionEnd = start + cursorOffset;
  el.focus();
}

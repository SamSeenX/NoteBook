import { escapeHTML, sanitizeHTML } from './sanitize.js';

export function parseMarkdown(text) {
  if (!text) return '';

  let html = text.replace(/\r\n/g, '\n');

  // Page break shorthand
  html = html.replace(/^---pagebreak---$/gim, '<div class="pdf-page-break"></div>');

  // Protect code blocks
  const codeBlocks = [];
  html = html.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
    codeBlocks.push(
      `<pre><code class="language-${escapeHTML(lang)}">${escapeHTML(code.trim())}</code></pre>`
    );
    return placeholder;
  });

  // Protect inline code
  const inlineCodes = [];
  html = html.replace(/`([^`\n]+)`/g, (_, code) => {
    const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
    inlineCodes.push(`<code>${escapeHTML(code)}</code>`);
    return placeholder;
  });

  // Protect pagebreak divs
  const pageBreaks = [];
  html = html.replace(/<div class="pdf-page-break"><\/div>/g, () => {
    const placeholder = `__PAGE_BREAK_${pageBreaks.length}__`;
    pageBreaks.push('<div class="pdf-page-break"></div>');
    return placeholder;
  });

  // Escape raw HTML before markdown processing
  html = escapeHTML(html);

  // Restore protected blocks
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`__CODE_BLOCK_${idx}__`, block);
  });
  inlineCodes.forEach((code, idx) => {
    html = html.replace(`__INLINE_CODE_${idx}__`, code);
  });
  pageBreaks.forEach((pb, idx) => {
    html = html.replace(`__PAGE_BREAK_${idx}__`, pb);
  });

  // Checklists (- [ ] or - [x])
  html = html.replace(/^-\s+\[ \]\s+(.+)$/gm, '<ul class="task-list"><li><input type="checkbox" data-task-idx> $1</li></ul>');
  html = html.replace(/^-\s+\[[xX]\]\s+(.+)$/gm, '<ul class="task-list"><li><input type="checkbox" checked data-task-idx> $1</li></ul>');
  html = html.replace(/<\/ul>\n<ul class="task-list">/g, '');

  // Headers (# H1 to ###### H6)
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Blockquotes
  html = html.replace(/^\>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules
  html = html.replace(/^(?:---|\*\*\*|___)\s*$/gm, '<hr>');

  // Bold & Italic & Strikethrough
  html = html.replace(/\*\*\*([^*]+)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  // Unordered & Ordered lists
  html = html.replace(/^[\*\-]\s+(.+)$/gm, '<ul><li>$1</li></ul>');
  html = html.replace(/<\/ul>\n<ul>/g, '');

  html = html.replace(/^\d+\.\s+(.+)$/gm, '<ol><li>$1</li></ol>');
  html = html.replace(/<\/ol>\n<ol>/g, '');

  // Paragraphs
  const blocks = html.split(/\n{2,}/);
  const formattedBlocks = blocks.map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(?:h[1-6]|pre|blockquote|ul|ol|hr|div)/i.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
  });

  return sanitizeHTML(formattedBlocks.join('\n'));
}

export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeHTML(dirty) {
  if (!dirty) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, 'text/html');

  const allowedTags = new Set([
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'BR', 'HR',
    'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'CODE', 'PRE',
    'BLOCKQUOTE', 'UL', 'OL', 'LI', 'A', 'TABLE', 'THEAD', 'TBODY',
    'TR', 'TH', 'TD', 'SPAN', 'DIV'
  ]);

  const allowedAttrs = new Set(['href', 'title', 'target', 'rel', 'class']);

  function clean(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.has(child.tagName)) {
          const textNode = doc.createTextNode(child.textContent || '');
          node.replaceChild(textNode, child);
        } else {
          // Remove unauthorized attributes
          Array.from(child.attributes).forEach((attr) => {
            if (!allowedAttrs.has(attr.name.toLowerCase())) {
              child.removeAttribute(attr.name);
            }
          });

          // Enforce safe links
          if (child.tagName === 'A') {
            const href = child.getAttribute('href') || '';
            if (href.startsWith('javascript:') || href.startsWith('data:')) {
              child.removeAttribute('href');
            } else {
              child.setAttribute('target', '_blank');
              child.setAttribute('rel', 'noopener noreferrer');
            }
          }
          clean(child);
        }
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

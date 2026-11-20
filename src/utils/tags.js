const TAG_REGEX = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;

export function extractTags(content) {
  if (!content) return [];
  const tags = new Set();
  let match;
  while ((match = TAG_REGEX.exec(content)) !== null) {
    tags.add(match[1].toLowerCase());
  }
  return Array.from(tags);
}

export function getAllUniqueTags(notes = []) {
  const counts = new Map();
  notes.forEach((note) => {
    if (note.trashed) return;
    const tags = extractTags(note.content);
    tags.forEach((tag) => {
      counts.set(tag, (counts.get(tag) || 0) + 1);
    });
  });

  return Array.from(counts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

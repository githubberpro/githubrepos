// md.js — a tiny, safe Markdown-to-HTML renderer for Ida's replies.
// Supports headings, bold, italics, inline code, blockquotes, bullet lists,
// and paragraphs. Escapes HTML first so model/user text can't inject markup.

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function renderMarkdown(text) {
  const lines = String(text || '').split('\n');
  const html = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (let raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) {
      closeList();
      continue;
    }
    let m;
    if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
      closeList();
      const level = Math.min(m[1].length + 2, 6); // ## -> h4 visually
      html.push(`<h${level}>${inline(m[2])}</h${level}>`);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      closeList();
      html.push(`<blockquote>${inline(m[1])}</blockquote>`);
    } else if ((m = line.match(/^[-*]\s+(.*)$/))) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(m[1])}</li>`);
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return html.join('\n');
}

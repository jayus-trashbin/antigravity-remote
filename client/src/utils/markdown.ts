import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';

// Configurar marked com syntax highlighting
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Renderer customizado para blocos de código com copy button
const renderer = new marked.Renderer();

renderer.code = ({ text, lang }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const highlighted = hljs.highlight(text, { language }).value;
  const escapedLang = language.replace(/"/g, '&quot;');
  return `
    <div class="code-block">
      <div class="code-block-header">
        <span class="code-lang">${escapedLang}</span>
        <button class="copy-btn" data-code="${encodeURIComponent(text)}">Copiar</button>
      </div>
      <pre><code class="hljs language-${escapedLang}">${highlighted}</code></pre>
    </div>
  `;
};

renderer.codespan = ({ text }) => `<code class="inline-code">${text}</code>`;

marked.use({ renderer });

export function renderMarkdown(content: string): string {
  const raw = marked.parse(content) as string;
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'div', 'span', 'button',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['class', 'href', 'target', 'data-code'],
  });
}

// Handler global de click para o botão "Copiar" dos code blocks
export function initCopyHandlers(container: HTMLElement): void {
  container.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.copy-btn');
    if (!btn) return;
    const code = decodeURIComponent(btn.getAttribute('data-code') || '');
    navigator.clipboard.writeText(code).then(() => {
      btn.textContent = 'Copiado!';
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
    });
  });
}

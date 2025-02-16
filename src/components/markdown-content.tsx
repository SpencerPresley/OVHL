'use client';

import { marked } from 'marked';
import type { Renderer, Tokens } from 'marked';
import { useMemo } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github-dark.css';

// Register the languages we want to use
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('plaintext', bash);

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const processedContent = useMemo(() => {
    const renderer = new marked.Renderer();

    // Only configure code block rendering with syntax highlighting
    renderer.code = function ({ text, lang }: Tokens.Code) {
      const language = hljs.getLanguage(lang || '') ? lang : 'plaintext';
      const highlightedCode = language ? hljs.highlight(text, { language }).value : text;
      return `<pre><code class="hljs language-${language}">${highlightedCode}</code></pre>`;
    };

    // Configure marked
    marked.setOptions({
      renderer,
      breaks: true,
      gfm: true,
      pedantic: false,
      async: false,
    });

    // Parse the markdown
    const html = marked.parse(content) as string;

    // Sanitize the HTML
    return DOMPurify.sanitize(html, {
      ADD_TAGS: [
        'iframe',
        'pre',
        'code',
        'p',
        'div',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'strong',
        'em',
        'b',
        'i',
        'del',
        'blockquote',
        'ul',
        'ol',
        'li',
        'hr',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'br',
        'a',
        'img',
      ],
      ADD_ATTR: [
        'class',
        'target',
        'rel',
        'href',
        'src',
        'alt',
        'title',
        'width',
        'height',
        'style',
      ],
      FORBID_TAGS: ['script'],
      FORBID_ATTR: ['onerror', 'onload'],
    });
  }, [content]);

  return (
    <div
      className="markdown-content whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}

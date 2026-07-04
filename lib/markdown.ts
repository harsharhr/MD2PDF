import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

// Markdown-it configured for document-quality output: GFM-ish, autolinks,
// typographic quotes, and syntax-highlighted fenced code.
const md: MarkdownIt = new MarkdownIt({
  html: false, // don't trust raw HTML from uploaded files
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch {
        /* fall through */
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>";
  },
});

export function renderMarkdown(source: string): string {
  return md.render(source);
}

// Print-oriented stylesheet. Deliberately conservative: serif-free, generous
// line-height, page-break rules, and a light syntax theme that reads on paper.
const PRINT_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 11.5pt;
    line-height: 1.6;
    color: #1a1a19;
    margin: 0;
  }
  .doc { max-width: 100%; }
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.25;
    margin: 1.6em 0 0.6em;
    font-weight: 650;
    color: #111;
    page-break-after: avoid;
  }
  h1 { font-size: 1.9em; margin-top: 0; border-bottom: 1px solid #e6e6e2; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; border-bottom: 1px solid #eee; padding-bottom: 0.25em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1.05em; }
  p, ul, ol, blockquote, table, pre { margin: 0 0 0.85em; }
  ul, ol { padding-left: 1.5em; }
  li { margin: 0.2em 0; }
  a { color: #c2185b; text-decoration: none; }
  code {
    font-family: "SFMono-Regular", "Consolas", "Liberation Mono", monospace;
    font-size: 0.88em;
    background: #f3f3f1;
    padding: 0.15em 0.4em;
    border-radius: 4px;
  }
  pre {
    background: #f7f7f5;
    border: 1px solid #ececE8;
    border-radius: 6px;
    padding: 12px 14px;
    overflow-x: auto;
    page-break-inside: avoid;
  }
  pre code { background: none; padding: 0; font-size: 0.85em; line-height: 1.5; }
  blockquote {
    border-left: 3px solid #d9d9d4;
    margin-left: 0;
    padding: 0.2em 0 0.2em 1em;
    color: #55554f;
  }
  table { border-collapse: collapse; width: 100%; font-size: 0.95em; page-break-inside: avoid; }
  th, td { border: 1px solid #e0e0db; padding: 6px 10px; text-align: left; }
  th { background: #f5f5f4; font-weight: 600; }
  img { max-width: 100%; }
  hr { border: none; border-top: 1px solid #e6e6e2; margin: 1.6em 0; }
  /* highlight.js — a restrained light theme */
  .hljs { display: block; }
  .hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
  .hljs-keyword, .hljs-selector-tag, .hljs-built_in { color: #c2185b; }
  .hljs-string, .hljs-attr { color: #157347; }
  .hljs-number, .hljs-literal { color: #005cc5; }
  .hljs-title, .hljs-function, .hljs-section { color: #6f42c1; }
  .hljs-type, .hljs-class .hljs-title { color: #b31d28; }
  .hljs-tag, .hljs-name { color: #22863a; }
`;

// Wrap rendered markdown in a complete, self-contained HTML document that
// Puppeteer can load and print. `title` is used for the document metadata.
export function buildHtmlDocument(bodyHtml: string, title: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>${PRINT_CSS}</style>
</head>
<body><div class="doc">${bodyHtml}</div></body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

import showdown from 'showdown';

const converter = new showdown.Converter({
  tables: true,
  strikethrough: true,
  tasklists: true,
  emoji: true,
  underline: true,
  openLinksInNewWindow: true,
  simplifiedAutoLink: true,
  excludeTrailingPunctuationFromURLs: true,
  ghCodeBlocks: true,
  ghCompatibleHeaderId: true,
  headerLevelStart: 1,
  parseImgDimensions: true,
});

converter.setFlavor('github');
converter.setOption('underline', true);
converter.setOption('literalMidWordUnderscores', false);

export interface TocItem {
  level: string;
  id: string;
  text: string;
}

export interface EditorChange {
  value: string;
  html: string;
  toc: TocItem[];
}

export function makeHtml(markdown: string): string {
  if (!markdown) return '';

  // Articles may be authored as HTML instead of Markdown. Markdown treats
  // indented HTML blocks as code, so preserve block markup when the content
  // is pure HTML. If real markdown syntax is present (images, links,
  // headings, lists, code, quotes), convert it so those features render.
  const hasHtmlBlock = /<(?:h[1-6]|p|ul|ol|li|blockquote|pre|table|section|article)\b/i.test(markdown);
  const hasMarkdownSyntax =
    /(^|\n)[ \t]{0,3}(?:#{1,6}[ \t]|[-*+][ \t]|\d+[.)][ \t]|```|>|~)/m.test(markdown) ||
    /!\[[^\]]*\]\([^)]*\)/.test(markdown) ||
    /\[[^\]]+\]\([^)]*\)/.test(markdown);

  if (hasHtmlBlock) {
    console.log('[makeHtml] html block detected', { hasMarkdownSyntax, rawPassthrough: !hasMarkdownSyntax });
  }

  if (hasHtmlBlock && !hasMarkdownSyntax) {
    return markdown.trim();
  }

  return converter.makeHtml(markdown);
}

export function makeToc(html: string): TocItem[] {
  if (!html) return [];
  const headingRegex = /<h([1-6])\s+(?:[^>]*?\s+)?id="([^"]*)"[^>]*>([\s\S]*?)<\/h[1-6]>/gi;
  const tocs: TocItem[] = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    tocs.push({
      level: match[1],
      id: match[2],
      text: match[3].replace(/<[^>]*>/g, ''),
    });
  }
  return tocs;
}

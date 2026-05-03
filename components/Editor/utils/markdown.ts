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

export interface TocItem {
  level: string;
  id: string;
  text: string;
}

export function makeHtml(markdown: string): string {
  if (!markdown) return '';
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

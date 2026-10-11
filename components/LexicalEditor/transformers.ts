import {
  $createParagraphNode,
  type LexicalNode,
} from 'lexical';
import {
  $convertFromMarkdownString,
  type ElementTransformer,
  type MultilineElementTransformer,
  TRANSFORMERS,
  type Transformer,
} from '@lexical/markdown';
import {
  $createTableNodeWithDimensions,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table';
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from '@lexical/react/LexicalHorizontalRuleNode';
import { $createImageNode, $isImageNode, ImageNode } from './nodes/ImageNode';

const TABLE_ROW_REG_EXP = /^\s*\|(.+)\|\s*$/;
const TABLE_DIVIDER_REG_EXP = /^\s*\|(\s*:?-+:?\s*\|)+\s*$/;

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function fillTableRow(rowNode: LexicalNode | null, cells: string[]): void {
  if (!rowNode || !$isTableRowNode(rowNode)) return;
  const cellNodes = rowNode.getChildren();
  for (let i = 0; i < cellNodes.length; i++) {
    const cell = cellNodes[i];
    if (!$isTableCellNode(cell)) continue;
    const text = cells[i] ?? '';
    cell.clear();
    if (text) {
      $convertFromMarkdownString(text, TRANSFORMERS, cell);
    }
    if (cell.getChildrenSize() === 0) {
      cell.append($createParagraphNode());
    }
  }
}

function $importTable(
  lines: string[],
  startLineIndex: number,
): { node: TableNode; lastLineIndex: number } | null {
  const headerLine = lines[startLineIndex];
  if (!TABLE_ROW_REG_EXP.test(headerLine)) return null;

  const dividerLine = lines[startLineIndex + 1];
  if (!dividerLine || !TABLE_DIVIDER_REG_EXP.test(dividerLine)) return null;

  const headerCells = splitTableRow(headerLine);
  const bodyRows: string[][] = [];
  let i = startLineIndex + 2;
  while (i < lines.length && TABLE_ROW_REG_EXP.test(lines[i])) {
    bodyRows.push(splitTableRow(lines[i]));
    i++;
  }

  const tableNode = $createTableNodeWithDimensions(
    1 + bodyRows.length,
    headerCells.length,
    true,
  );
  fillTableRow(tableNode.getChildAtIndex(0), headerCells);
  for (let r = 0; r < bodyRows.length; r++) {
    fillTableRow(tableNode.getChildAtIndex(r + 1), bodyRows[r]);
  }

  return { node: tableNode, lastLineIndex: i - 1 };
}

const TABLE: MultilineElementTransformer = {
  dependencies: [TableNode, TableRowNode, TableCellNode],
  regExpStart: TABLE_ROW_REG_EXP,
  handleImportAfterStartMatch: ({ lines, rootNode, startLineIndex }) => {
    const result = $importTable(lines, startLineIndex);
    if (!result) return null;
    rootNode.append(result.node);
    return [true, result.lastLineIndex];
  },
  replace: () => {
    return false;
  },
  export: (node, traverseChildren) => {
    if (!$isTableNode(node)) return null;
    const rows: string[][] = [];
    for (const row of node.getChildren()) {
      if (!$isTableRowNode(row)) continue;
      const cells: string[] = [];
      for (const cell of row.getChildren()) {
        if (!$isTableCellNode(cell)) continue;
        cells.push(traverseChildren(cell).replace(/\n+/g, ' ').trim());
      }
      rows.push(cells);
    }
    if (rows.length === 0) return null;

    const columnCount = Math.max(...rows.map((row) => row.length));
    const pad = (row: string[]) => [
      ...row,
      ...Array(Math.max(0, columnCount - row.length)).fill(''),
    ];

    const lines = [`| ${pad(rows[0]).join(' | ')} |`];
    lines.push(`| ${Array(columnCount).fill('---').join(' | ')} |`);
    for (let i = 1; i < rows.length; i++) {
      lines.push(`| ${pad(rows[i]).join(' | ')} |`);
    }
    return lines.join('\n');
  },
  type: 'multiline-element',
};

const HORIZONTAL_RULE: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node) => ($isHorizontalRuleNode(node) ? '---' : null),
  regExp: /^\s*([-*_])\s*(?:\1\s*){2,}$/,
  replace: (parentNode) => {
    parentNode.replace($createHorizontalRuleNode());
  },
  type: 'element',
};

const IMAGE: ElementTransformer = {
  dependencies: [ImageNode],
  export: (node) =>
    $isImageNode(node) ? `![${node.getAltText()}](${node.getSrc()})` : null,
  regExp: /^\s*!\[([^\]]*)\]\(([^)\s]+)\)\s*$/,
  replace: (parentNode, _children, match) => {
    const [, altText, src] = match;
    parentNode.replace($createImageNode(src, altText));
  },
  type: 'element',
};

export const EDITOR_TRANSFORMERS: Array<Transformer> = [
  ...TRANSFORMERS,
  TABLE,
  HORIZONTAL_RULE,
  IMAGE,
];

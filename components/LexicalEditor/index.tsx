'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode, AutoLinkNode, $toggleLink } from '@lexical/link';
import { $getSelection, $isRangeSelection, $createParagraphNode, UNDO_COMMAND, REDO_COMMAND, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND, INDENT_CONTENT_COMMAND, OUTDENT_CONTENT_COMMAND } from 'lexical';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType, $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import { makeHtml, makeToc, type TocItem, type EditorChange } from '@/components/Editor/utils/markdown';
import { fileProvider } from '@/lib/providers/file';
import { useImageUpload } from '@/hooks/useImageUpload';
import styles from './LexicalEditor.module.css';

const STORAGE_KEY = 'lexical_editor_cache';

const EDITOR_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  LinkNode,
  AutoLinkNode,
];

function MarkdownInitializer({ text }: { text: string }) {
  const [editor] = useLexicalComposerContext();
  const initialized = useRef(false);

  useEffect(() => {
    if (!text || initialized.current) return;
    initialized.current = true;
    editor.update(() => {
      $convertFromMarkdownString(text, TRANSFORMERS);
    });
  }, [editor, text]);

  return null;
}

function ToolbarPlugin({
  onImageUpload,
  onVideoUpload,
}: {
  onImageUpload: () => void;
  onVideoUpload: () => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [fontSize, setFontSize] = useState('16');
  const [fontFamily, setFontFamily] = useState('Roboto');

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setIsBold(false);
          setIsItalic(false);
          setIsUnderline(false);
          setIsStrikethrough(false);
          return false;
        }
        setIsBold(selection.hasFormat('bold'));
        setIsItalic(selection.hasFormat('italic'));
        setIsUnderline(selection.hasFormat('underline'));
        setIsStrikethrough(selection.hasFormat('strikethrough'));
        const currentSize = $getSelectionStyleValueForProperty(selection, 'font-size', '16');
        setFontSize(currentSize.replace('px', ''));
        const currentFont = $getSelectionStyleValueForProperty(selection, 'font-family', 'Roboto');
        setFontFamily(currentFont.replace(/['"]/g, '').split(',')[0].trim());
        return false;
      },
      1,
    );
  }, [editor]);

  const toggleBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);

  const toggleItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  }, [editor]);

  const toggleUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  }, [editor]);

  const toggleStrikethrough = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
  }, [editor]);

  const toggleHeading = useCallback((level: number) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const topLevelElement = anchorNode.getTopLevelElement();
        if (topLevelElement) {
          const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
          topLevelElement.replace($createHeadingNode(tag), true);
        }
      }
    });
  }, [editor]);

  const toggleParagraph = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const toggleUnorderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const removeList = useCallback(() => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  }, [editor]);

  const toggleQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
  }, [editor]);

  const indentMore = useCallback(() => {
    editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  const indentLess = useCallback(() => {
    editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
  }, [editor]);

  const setAlignment = useCallback((align: string) => {
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) {
        $patchStyleText(sel, { 'text-align': align });
      }
    });
  }, [editor]);

  return (
    <div className={styles.toolbar}>
      <button
        className={`${styles.toolbarBtn} ${isBold ? styles.toolbarBtnActive : ''}`}
        onClick={toggleBold}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        className={`${styles.toolbarBtn} ${isItalic ? styles.toolbarBtnActive : ''}`}
        onClick={toggleItalic}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        className={`${styles.toolbarBtn} ${isUnderline ? styles.toolbarBtnActive : ''}`}
        onClick={toggleUnderline}
        title="Underline"
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </button>
      <button
        className={`${styles.toolbarBtn} ${isStrikethrough ? styles.toolbarBtnActive : ''}`}
        onClick={toggleStrikethrough}
        title="Strikethrough"
      >
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </button>

      <div className={styles.toolbarDivider} />

      <select
        className={styles.toolbarSelect}
        value=""
        onChange={(e) => {
          const v = e.target.value;
          if (v === 'p') toggleParagraph();
          else if (v) toggleHeading(parseInt(v));
          e.target.value = '';
        }}
        title="Heading"
      >
        <option value="" disabled>Style</option>
        <option value="p">Paragraph</option>
        {[1, 2, 3, 4, 5, 6].map((l) => (
          <option key={l} value={l}>H{l}</option>
        ))}
      </select>

      <select
        className={styles.toolbarSelect}
        value={fontSize}
        onChange={(e) => {
          const v = e.target.value;
          setFontSize(v);
          editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) {
              $patchStyleText(sel, { 'font-size': v + 'px' });
            }
          });
        }}
        title="Font Size"
      >
        <option value="10">10px</option>
        <option value="12">12px</option>
        <option value="13">13px</option>
        <option value="14">14px</option>
        <option value="15">15px</option>
        <option value="16">16px</option>
        <option value="18">18px</option>
        <option value="20">20px</option>
        <option value="22">22px</option>
        <option value="24">24px</option>
      </select>

      <select
        className={styles.toolbarSelect}
        value={fontFamily}
        onChange={(e) => {
          const v = e.target.value;
          setFontFamily(v);
          editor.update(() => {
            const sel = $getSelection();
            if ($isRangeSelection(sel)) {
              $patchStyleText(sel, { 'font-family': v });
            }
          });
        }}
        title="Font Family"
      >
        <option value="Roboto">Roboto</option>
        <option value="Inter">Inter</option>
        <option value="Poppins">Poppins</option>
        <option value="Geist Mono">Geist Mono</option>
        <option value="Consolas">Consolas</option>
        <option value="Courier New">Courier New</option>
        <option value="monospace">monospace</option>
      </select>

      <div className={styles.toolbarDivider} />

      <button
        className={styles.toolbarBtn}
        onClick={toggleOrderedList}
        title="Numbered List"
      >
        1.
      </button>
      <button
        className={styles.toolbarBtn}
        onClick={toggleUnorderedList}
        title="Bulleted List"
      >
        •–
      </button>
      <button
        className={styles.toolbarBtn}
        onClick={toggleQuote}
        title="Blockquote"
      >
        ❝
      </button>
      <button
        className={styles.toolbarBtn}
        onClick={indentMore}
        title="Indent More"
      >
        →|
      </button>
      <button
        className={styles.toolbarBtn}
        onClick={indentLess}
        title="Indent Less"
      >
        |←
      </button>
      <select
        className={styles.toolbarSelect}
        value=""
        onChange={(e) => { const v = e.target.value; if (v) setAlignment(v); e.target.value = ''; }}
        title="Alignment"
      >
        <option value="" disabled>Align</option>
        <option value="left">≡ Left</option>
        <option value="center">≡ Center</option>
        <option value="right">≡ Right</option>
      </select>

      <div className={styles.toolbarDivider} />

      <button
        className={styles.toolbarBtn}
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            const text = selection.getTextContent().trim();
            if (text) {
              const url = prompt('Enter URL:', 'https://');
              if (url) $toggleLink(url);
            } else {
              const url = prompt('Enter URL:', 'https://');
              if (url) $toggleLink(url);
            }
          });
        }}
        title="Insert Link"
      >
        🔗
      </button>
      <button className={styles.toolbarBtn} onClick={onImageUpload} title="Insert Image">
        🖼️
      </button>
      <button className={styles.toolbarBtn} onClick={onVideoUpload} title="Insert Video">
        🎬
      </button>

      <div className={styles.toolbarDivider} />

      <button
        className={styles.toolbarBtn}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        title="Undo"
      >
        ↩
      </button>
      <button
        className={styles.toolbarBtn}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        title="Redo"
      >
        ↪
      </button>
    </div>
  );
}

function EditorContentSurface() {
  const [editor] = useLexicalComposerContext();
  return (
    <div className={styles.editorWrapper} style={{ position: 'relative' }}>
      <RichTextPlugin
        contentEditable={<ContentEditable className={styles.editorInput} />}
        placeholder={<div style={{ padding: '12px 16px', color: '#9ca3af', position: 'absolute' }}>Start writing...</div>}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
    </div>
  );
}

function MarkdownEmitter({
  onChange,
}: {
  onChange: (markdown: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef('');

  const handleChange = useCallback(() => {
    editor.read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS);
      if (markdown !== lastEmittedRef.current) {
        lastEmittedRef.current = markdown;
        onChangeRef.current(markdown);
      }
    });
  }, [editor]);

  return <OnChangePlugin onChange={handleChange} />;
}

export default function LexicalEditor({
  defaultValue: defaultValueProp = '',
  onChange,
  onSave,
  showToc = true,
}: {
  defaultValue?: string;
  onChange?: (change: EditorChange) => void;
  onSave?: (value: string) => void;
  showToc?: boolean;
}) {
  const [defaultValue] = useState(() => {
    if (defaultValueProp) return defaultValueProp;
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });
  const [markdown, setMarkdown] = useState(defaultValue);
  const [html, setHtml] = useState('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const emitRef = useRef(onChange);
  emitRef.current = onChange;
  const { uploadState, uploadFile, reset: resetUpload } = useImageUpload();

  useEffect(() => {
    const h = makeHtml(markdown);
    setHtml(h);
    setToc(makeToc(h));
  }, [markdown]);

  const handleMarkdownChange = useCallback((md: string) => {
    setMarkdown(md);
    const h = makeHtml(md);
    const t = makeToc(h);
    emitRef.current?.({ value: md, html: h, toc: t });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      try {
        localStorage.setItem(STORAGE_KEY, markdown);
      } catch {}
      onSave?.(markdown);
    }
  }, [markdown, onSave]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounterRef.current = 0;
    const files = e.dataTransfer.files;
    if (!files.length) return;
    const imageFile = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!imageFile) return;
    const url = await uploadFile(imageFile);
    if (url) {
      setMarkdown((prev) => `${prev}\n![${imageFile.name}](${url})\n`);
    }
  }, [uploadFile]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUploadClick = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleVideoUploadClick = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      setMarkdown((prev) => `${prev}\n![${file.name}](${url})\n`);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [uploadFile]);

  const handleVideoFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await fileProvider.uploadFile(file, 0);
      setMarkdown((prev) => `${prev}\n<video src="${result.url}" controls></video>\n`);
    } catch {}
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, []);

  const isUploading = uploadState.status === 'validating' || uploadState.status === 'requesting_url' || uploadState.status === 'uploading';

  const initialConfig = useMemo(() => ({
    namespace: 'MobileEditor',
    nodes: EDITOR_NODES,
    theme: {},
    onError: (error: Error) => {
      console.error('[LexicalEditor]', error);
    },
  }), []);

  return (
    <div
      className={`${styles.container} ${isDragOver ? styles.dragOver : ''}`}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageFileChange}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        style={{ display: 'none' }}
        onChange={handleVideoFileChange}
      />

      <LexicalComposer initialConfig={initialConfig}>
        <MarkdownInitializer text={defaultValue} />
        <ToolbarPlugin
          onImageUpload={handleImageUploadClick}
          onVideoUpload={handleVideoUploadClick}
        />
        <MarkdownEmitter onChange={handleMarkdownChange} />
        <div className={styles.panes}>
          <div className={styles.editorPane}>
            <EditorContentSurface />
          </div>
        <div
          className={styles.previewPane}
          ref={previewRef}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {showToc && (
          <div className={styles.tocPanel}>
            <div className={styles.tocTitle}>Table of Contents</div>
            {toc.length === 0 ? (
              <div className={styles.emptyState}>No headings yet</div>
            ) : (
              toc.map((item, i) => (
                <button
                  key={i}
                  className={styles.tocItem}
                  data-level={item.level}
                  onClick={() => {
                    const el = previewRef.current?.querySelector(`#${CSS.escape(item.id)}`);
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {item.text}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      </LexicalComposer>

      {(isDragOver || isUploading) && (
        <div className={styles.uploadOverlay}>
          {isDragOver && (
            <div className={styles.uploadOverlayContent}>
              <div className={styles.uploadIcon}>🖼️</div>
              <div className={styles.uploadText}>Drop image here</div>
              <div className={styles.uploadHint}>JPEG, PNG, WebP &middot; Max 5MB</div>
            </div>
          )}
          {isUploading && !isDragOver && (
            <div className={styles.uploadOverlayContent}>
              <div className={styles.uploadIcon}>
                {uploadState.status === 'validating' && '🔍'}
                {uploadState.status === 'requesting_url' && '🔗'}
                {uploadState.status === 'uploading' && '📤'}
              </div>
              <div className={styles.uploadText}>
                {uploadState.status === 'validating' && 'Validating...'}
                {uploadState.status === 'requesting_url' && 'Requesting upload URL...'}
                {uploadState.status === 'uploading' && 'Uploading...'}
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${uploadState.progress}%` }} />
              </div>
              <div className={styles.progressPercent}>{uploadState.progress}%</div>
            </div>
          )}
          {uploadState.previewUrl && isUploading && (
            <div className={styles.uploadPreview}>
              <img src={uploadState.previewUrl} alt="Preview" />
            </div>
          )}
        </div>
      )}
      {uploadState.status === 'error' && (
        <div className={styles.uploadError}>
          <span>⚠️ {uploadState.error}</span>
          <button className={styles.uploadErrorDismiss} onClick={resetUpload}>✕</button>
        </div>
      )}
    </div>
  );
}

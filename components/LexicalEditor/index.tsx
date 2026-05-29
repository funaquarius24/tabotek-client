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
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode, AutoLinkNode, $toggleLink } from '@lexical/link';
import { $getSelection, $isRangeSelection, $createParagraphNode, UNDO_COMMAND, REDO_COMMAND, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import { $createHeadingNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import { makeHtml, makeToc, type TocItem } from '@/components/Editor/utils/markdown';
import { fileProvider } from '@/lib/providers/file';
import { useImageUpload } from '@/hooks/useImageUpload';
import type { EditorChange } from '@/components/Editor';
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
        const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
        $setBlocksType(selection, () => $createHeadingNode(tag));
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

function LexicalEditorSurface({
  defaultValue,
  onChange,
  onImageUpload,
  onVideoUpload,
}: {
  defaultValue: string;
  onChange: (markdown: string) => void;
  onImageUpload: () => void;
  onVideoUpload: () => void;
}) {
  const initialConfig = useMemo(() => ({
    namespace: 'MobileEditor',
    nodes: EDITOR_NODES,
    theme: {},
    onError: (error: Error) => {
      console.error('[LexicalEditor]', error);
    },
  }), []);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <MarkdownInitializer text={defaultValue} />
      <ToolbarPlugin
        onImageUpload={onImageUpload}
        onVideoUpload={onVideoUpload}
      />
      <div className={styles.editorWrapper} style={{ position: 'relative' }}>
        <RichTextPlugin
          contentEditable={<ContentEditable className={styles.editorInput} />}
          placeholder={<div style={{ padding: '12px 16px', color: '#9ca3af', position: 'absolute' }}>Start writing...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </div>
      <MarkdownEmitter onChange={onChange} />
    </LexicalComposer>
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
  defaultValue = '',
  onChange,
  onSave,
  showToc = true,
}: {
  defaultValue?: string;
  onChange?: (change: EditorChange) => void;
  onSave?: (value: string) => void;
  showToc?: boolean;
}) {
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

      <LexicalEditorSurface
        defaultValue={defaultValue}
        onChange={handleMarkdownChange}
        onImageUpload={handleImageUploadClick}
        onVideoUpload={handleVideoUploadClick}
      />

      <div className={styles.panes}>
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

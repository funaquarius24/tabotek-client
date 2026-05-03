'use client';

import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { editor } from 'monaco-editor';
import { makeHtml, makeToc, TocItem } from './utils/markdown';
import { fileProvider } from '@/lib/providers/file';
import { useImageUpload } from '@/hooks/useImageUpload';
import styles from './Editor.module.css';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

export interface EditorChange {
  value: string;
  html: string;
  toc: TocItem[];
}

interface EditorProps {
  defaultValue?: string;
  onChange?: (change: EditorChange) => void;
  onSave?: (value: string) => void;
  showToc?: boolean;
}

const STORAGE_KEY = 'editor_cache';

const FONT_FAMILIES = ['Geist Mono', 'Consolas', 'Courier New', 'monospace'];
const FONT_SIZES = [10, 12, 13, 14, 15, 16, 18, 20, 22, 24];

export default function Editor({ defaultValue: _defaultValue = '', onChange, onSave, showToc = true }: EditorProps) {
  const [value, setValue] = useState(_defaultValue);
  const [html, setHtml] = useState('');
  const [toc, setToc] = useState<TocItem[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState('Geist Mono');
  const [fontSize, setFontSize] = useState(14);
  const [isDragOver, setIsDragOver] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const isUpdatingScroll = useRef(false);
  const menuBarRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragCounterRef = useRef(0);
  const emitRef = useRef(onChange);
  const { uploadState, uploadFile, reset: resetUpload } = useImageUpload();
  emitRef.current = onChange;

  useEffect(() => {
    const h = makeHtml(value);
    setHtml(h);
    setToc(makeToc(h));
  }, [value]);

  useEffect(() => {
    if (!activeMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeMenu]);

  const emitChange = useCallback((v: string) => {
    const h = makeHtml(v);
    const t = makeToc(h);
    setHtml(h);
    setToc(t);
    emitRef.current?.({ value: v, html: h, toc: t });
  }, []);

  const handleEditorContentChange = useCallback((val: string | undefined) => {
    const v = val ?? '';
    setValue(v);
    emitChange(v);
  }, [emitChange]);

  const triggerEditorAction = useCallback((action: string) => {
    editorRef.current?.trigger('keyboard', action, null);
  }, []);

  const replaceSelectedText = useCallback((before: string, after = '') => {
    const ed = editorRef.current;
    if (!ed) return;
    const sel = ed.getSelection();
    if (!sel) return;
    const model = ed.getModel();
    if (!model) return;
    const text = model.getValueInRange(sel);
    const newText = sel.isEmpty() ? before : `${before}${text}${after}`;
    ed.executeEdits('format', [{ range: sel, text: newText, forceMoveMarkers: true }]);
    ed.focus();
  }, []);

  const wrapSelection = useCallback((wrapper: string) => {
    replaceSelectedText(wrapper, wrapper);
  }, [replaceSelectedText]);

  const toggleFormat = useCallback((wrapper: string) => {
    const ed = editorRef.current;
    if (!ed) return;
    const sel = ed.getSelection();
    if (!sel) return;
    const model = ed.getModel();
    if (!model) return;
    const text = model.getValueInRange(sel);
    if (text.startsWith(wrapper) && text.endsWith(wrapper)) {
      ed.executeEdits('format', [{ range: sel, text: text.slice(wrapper.length, -wrapper.length), forceMoveMarkers: true }]);
    } else {
      ed.executeEdits('format', [{ range: sel, text: `${wrapper}${text}${wrapper}`, forceMoveMarkers: true }]);
    }
    ed.focus();
  }, []);

  const toggleHeading = useCallback((level: number) => {
    const ed = editorRef.current;
    if (!ed) return;
    const sel = ed.getSelection();
    if (!sel) return;
    const model = ed.getModel();
    if (!model) return;
    const cursorLine = sel.startLineNumber;
    const lineContent = model.getLineContent(cursorLine);
    const lineLen = lineContent.length;
    const prefix = '#'.repeat(level) + ' ';
    const range = { startLineNumber: cursorLine, startColumn: 1, endLineNumber: cursorLine, endColumn: lineLen + 1 };
    if (lineContent.startsWith(prefix)) {
      model.applyEdits([{ range, text: lineContent.slice(prefix.length), forceMoveMarkers: true }]);
    } else if (/^#{1,6}\s/.test(lineContent)) {
      model.applyEdits([{ range, text: lineContent.replace(/^#{1,6}\s/, prefix), forceMoveMarkers: true }]);
    } else {
      model.applyEdits([{ range, text: `${prefix}${lineContent}`, forceMoveMarkers: true }]);
    }
    ed.focus();
  }, []);

  const insertAtCursor = useCallback((before: string, after = '') => {
    replaceSelectedText(before, after);
  }, [replaceSelectedText]);

  const uploadAndInsertImage = useCallback(async (file: File) => {
    const url = await uploadFile(file);
    if (url) {
      insertAtCursor(`![${file.name}](${url})`);
    }
  }, [uploadFile, insertAtCursor]);

  const uploadAndInsertVideo = useCallback(async (file: File) => {
    try {
      const result = await fileProvider.uploadFile(file, 0);
      insertAtCursor(`\n<video src="${result.url}" controls></video>\n`);
    } catch {
      // silent
    }
  }, [insertAtCursor]);

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageItem = Array.from(items).find(item => item.type.startsWith('image/'));
    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    const url = await uploadFile(file);
    if (!url) return;

    const ed = editorRef.current;
    if (!ed) return;
    const sel = ed.getSelection();
    if (!sel) return;
    const pos = sel.getStartPosition();

    const text = `![${file.name}](${url})`;
    ed.executeEdits('paste-image', [{
      range: {
        startLineNumber: pos.lineNumber,
        startColumn: pos.column,
        endLineNumber: pos.lineNumber,
        endColumn: pos.column,
      },
      text,
      forceMoveMarkers: true,
    }]);
    ed.focus();
  }, [uploadFile]);

  const handleEditorMount = useCallback((editorInstance: editor.IStandaloneCodeEditor) => {
    editorRef.current = editorInstance;

    const domNode = editorInstance.getDomNode();
    if (domNode) {
      domNode.addEventListener('paste', handlePaste);
    }

    editorInstance.onDidScrollChange((e) => {
      if (isUpdatingScroll.current) return;
      const model = editorInstance.getModel();
      if (!model || !previewRef.current) return;
      const lineCount = model.getLineCount();
      const scrollFraction = lineCount > 0 ? e.scrollTop / (e.scrollHeight - e.scrollHeight * 0.1) : 0;
      if (previewRef.current) {
        const preview = previewRef.current;
        preview.scrollTop = scrollFraction * (preview.scrollHeight - preview.clientHeight);
      }
    });
  }, [handlePaste]);

  const handlePreviewScroll = useCallback(() => {
    if (!editorRef.current || !previewRef.current) return;
    isUpdatingScroll.current = true;
    const preview = previewRef.current;
    const model = editorRef.current.getModel();
    if (!model) return;
    const scrollFraction = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
    const editorHeight = editorRef.current.getScrollHeight();
    editorRef.current.setScrollPosition({
      scrollTop: scrollFraction * (editorHeight - editorHeight * 0.1),
    });
    requestAnimationFrame(() => {
      isUpdatingScroll.current = false;
    });
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      try {
        localStorage.setItem(STORAGE_KEY, value);
      } catch {}
      onSave?.(value);
    }
  }, [value, onSave]);

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

    const imageFile = Array.from(files).find(f => f.type.startsWith('image/'));
    if (!imageFile) return;

    await uploadAndInsertImage(imageFile);
  }, [uploadAndInsertImage]);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUploadClick = useCallback(() => {
    imageInputRef.current?.click();
    closeMenu();
  }, []);

  const handleVideoUploadClick = useCallback(() => {
    videoInputRef.current?.click();
    closeMenu();
  }, []);

  const handleImageFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAndInsertImage(file);
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  }, [uploadAndInsertImage]);

  const handleVideoFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAndInsertVideo(file);
    }
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  }, [uploadAndInsertVideo]);

  const closeMenu = useCallback(() => setActiveMenu(null), []);

  const menus = useMemo(() => ({
    File: [
      { label: 'Save', shortcut: 'Ctrl+S', onClick: () => { onSave?.(value); closeMenu(); } },
    ],
    Edit: [
      { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => { triggerEditorAction('undo'); closeMenu(); } },
      { label: 'Redo', shortcut: 'Ctrl+Shift+Z', onClick: () => { triggerEditorAction('redo'); closeMenu(); } },
    ],
    View: [
      { label: 'Toggle Line Numbers', onClick: () => { closeMenu(); } },
    ],
    Insert: [
      { label: 'Emoji', onClick: () => { insertAtCursor('😊'); closeMenu(); } },
      { label: 'Image (Upload)', onClick: handleImageUploadClick },
      { label: 'Image (URL)', onClick: () => { const url = prompt('Enter image URL:'); if (url) insertAtCursor(`![image](${url})`); closeMenu(); } },
      { label: 'Video (Upload)', onClick: handleVideoUploadClick },
      { label: 'Video (URL)', onClick: () => { const url = prompt('Enter video URL:'); if (url) insertAtCursor(`\n<video src="${url}" controls></video>\n`); closeMenu(); } },
      { label: 'Iframe', onClick: () => { const url = prompt('Enter iframe URL:'); if (url) insertAtCursor(`\n<iframe src="${url}" width="100%" height="400"></iframe>\n`); closeMenu(); } },
      { label: 'Code Block', onClick: () => { insertAtCursor('```\n', '\n```'); closeMenu(); } },
      { label: 'File Library', onClick: () => { const url = prompt('Enter file URL:'); if (url) insertAtCursor(`![file](${url})`); closeMenu(); } },
      { label: 'Magnified Image', onClick: () => { const url = prompt('Enter image URL for magnified view:'); if (url) insertAtCursor(`![magnified](${url} "magnifiable")`); closeMenu(); } },
    ],
    Format: [
      { label: 'Bold', shortcut: 'Ctrl+B', onClick: () => { toggleFormat('**'); closeMenu(); } },
      { label: 'Italic', shortcut: 'Ctrl+I', onClick: () => { toggleFormat('*'); closeMenu(); } },
      { label: 'Underline', shortcut: 'Ctrl+U', onClick: () => { toggleFormat('++'); closeMenu(); } },
      { label: 'Strikethrough', shortcut: 'Alt+S', onClick: () => { toggleFormat('~~'); closeMenu(); } },
      { type: 'divider' as const },
      { label: 'Heading 1', onClick: () => { toggleHeading(1); closeMenu(); } },
      { label: 'Heading 2', onClick: () => { toggleHeading(2); closeMenu(); } },
      { label: 'Heading 3', onClick: () => { toggleHeading(3); closeMenu(); } },
      { label: 'Heading 4', onClick: () => { toggleHeading(4); closeMenu(); } },
      { label: 'Heading 5', onClick: () => { toggleHeading(5); closeMenu(); } },
      { label: 'Heading 6', onClick: () => { toggleHeading(6); closeMenu(); } },
    ],
    Tools: [
      { label: 'Settings', onClick: () => { closeMenu(); } },
    ],
  }), [value, onSave, triggerEditorAction, insertAtCursor, toggleFormat, toggleHeading, closeMenu, handleImageUploadClick, handleVideoUploadClick]);

  const isUploading = uploadState.status === 'validating' || uploadState.status === 'requesting_url' || uploadState.status === 'uploading';

  return (
    <div
      className={`${styles.container} ${isDragOver ? styles.dragOver : ''}`}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={styles.menuBar} ref={menuBarRef}>
        {(Object.keys(menus) as (keyof typeof menus)[]).map((key) => (
          <div key={key} className={styles.menuItemWrapper}>
            <button
              className={`${styles.menuItem} ${activeMenu === key ? styles.menuItemActive : ''}`}
              onClick={() => setActiveMenu(activeMenu === key ? null : key)}
            >
              {key}
            </button>
            {activeMenu === key && (
              <div className={styles.menuDropdown}>
                {(menus[key] as any[]).map((item: any, i: number) => {
                  if (item.type === 'divider') return <div key={i} className={styles.menuDivider} />;
                  return (
                    <button key={i} className={styles.menuDropdownItem} onClick={item.onClick}>
                      <span>{item.label}</span>
                      {item.shortcut && <span className={styles.menuShortcut}>{item.shortcut}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

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

      <div className={styles.formatBar}>
        <button className={styles.formatBtn} title="Undo (Ctrl+Z)" onClick={() => triggerEditorAction('undo')}>
          ↩
        </button>
        <button className={styles.formatBtn} title="Redo (Ctrl+Shift+Z)" onClick={() => triggerEditorAction('redo')}>
          ↪
        </button>

        <div className={styles.formatDivider} />

        <select
          className={styles.formatSelect}
          value=""
          onChange={(e) => { const v = parseInt(e.target.value); if (v) toggleHeading(v); e.target.value = ''; }}
          title="Heading"
        >
          <option value="" disabled>Heading</option>
          {[1, 2, 3, 4, 5, 6].map(l => (
            <option key={l} value={l}>H{l}</option>
          ))}
        </select>

        <select
          className={styles.formatSelect}
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          title="Font Family"
        >
          {FONT_FAMILIES.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          className={styles.formatSelect}
          value={fontSize}
          onChange={(e) => setFontSize(parseInt(e.target.value))}
          title="Font Size"
        >
          {FONT_SIZES.map(s => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        <div className={styles.formatDivider} />

        <button className={styles.formatBtn} title="Insert Image" onClick={handleImageUploadClick}>
          🖼️
        </button>

        <div className={styles.formatDivider} />

        <button className={styles.formatBtn} title="Bold (Ctrl+B)" onClick={() => toggleFormat('**')}>
          <strong>B</strong>
        </button>
        <button className={styles.formatBtn} title="Italic (Ctrl+I)" onClick={() => toggleFormat('*')}>
          <em>I</em>
        </button>
        <button className={styles.formatBtn} title="Underline (Ctrl+U)" onClick={() => toggleFormat('++')}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button className={styles.formatBtn} title="Strikethrough" onClick={() => toggleFormat('~~')}>
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </button>
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
      <div className={styles.panes}>
        <div className={styles.editorPane}>
          <MonacoEditor
            theme="vs"
            language="markdown"
            value={value}
            onChange={handleEditorContentChange}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              fontSize,
              fontFamily,
              tabSize: 2,
              automaticLayout: true,
            }}
          />
        </div>
        <div
          className={styles.previewPane}
          ref={previewRef}
          onScroll={handlePreviewScroll}
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
    </div>
  );
}

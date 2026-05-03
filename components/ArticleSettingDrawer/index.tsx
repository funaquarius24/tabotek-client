'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useCategories } from '@/hooks/useCategories';
import FileSelectDrawer from '@/components/FileSelectDrawer';
import styles from './ArticleSettingDrawer.module.css';

export interface ArticleAttributes {
  summary: string;
  password: string;
  allowComments: boolean;
  isRecommended: boolean;
  categoryId: string;
  tags: string[];
  coverImage: string;
}

interface ArticleSettingDrawerProps {
  open: boolean;
  onClose: () => void;
  initialValues?: Partial<ArticleAttributes>;
  onChange: (attrs: Partial<ArticleAttributes>) => void;
}

export default function ArticleSettingDrawer({ open, onClose, initialValues, onChange }: ArticleSettingDrawerProps) {
  const { data: categoriesData } = useCategories();
  const categories = categoriesData?.categories ?? [];

  const [summary, setSummary] = useState(initialValues?.summary ?? '');
  const [password, setPassword] = useState(initialValues?.password ?? '');
  const [allowComments, setAllowComments] = useState(initialValues?.allowComments ?? true);
  const [isRecommended, setIsRecommended] = useState(initialValues?.isRecommended ?? false);
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? '');
  const [fileDrawerOpen, setFileDrawerOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValues) {
      if (initialValues.summary !== undefined) setSummary(initialValues.summary);
      if (initialValues.password !== undefined) setPassword(initialValues.password);
      if (initialValues.allowComments !== undefined) setAllowComments(initialValues.allowComments);
      if (initialValues.isRecommended !== undefined) setIsRecommended(initialValues.isRecommended);
      if (initialValues.categoryId !== undefined) setCategoryId(initialValues.categoryId);
      if (initialValues.tags !== undefined) setTags(initialValues.tags);
      if (initialValues.coverImage !== undefined) setCoverImage(initialValues.coverImage);
    }
  }, [initialValues]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [summary]);

  const handleConfirm = useCallback(() => {
    onChange({
      summary,
      password,
      allowComments,
      isRecommended,
      categoryId,
      tags,
      coverImage,
    });
    onClose();
  }, [summary, password, allowComments, isRecommended, categoryId, tags, coverImage, onChange, onClose]);

  const handleAddTag = useCallback((value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  }, [tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  if (!open) return null;

  return (
    <>
      <div
        className={`${styles.overlay} ${open ? styles.overlayOpen : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>Article Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label}>Summary</label>
            <textarea
              ref={textareaRef}
              className={styles.textarea}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Brief description of the article..."
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password Protection</label>
            <input
              className={styles.input}
              type="text"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave empty for no password"
            />
          </div>

          <div className={styles.toggleGroup}>
            <span className={styles.toggleGroupLabel}>Enable Comments</span>
            <button
              className={`${styles.toggle} ${allowComments ? styles.toggleActive : ''}`}
              onClick={() => setAllowComments(!allowComments)}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          <div className={styles.toggleGroup}>
            <span className={styles.toggleGroupLabel}>Recommend on Homepage</span>
            <button
              className={`${styles.toggle} ${isRecommended ? styles.toggleActive : ''}`}
              onClick={() => setIsRecommended(!isRecommended)}
            >
              <span className={styles.toggleKnob} />
            </button>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagsContainer}>
              {tags.map(tag => (
                <span key={tag} className={styles.tag}>
                  {tag}
                  <button
                    className={styles.tagRemove}
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className={styles.tagSelect}
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                  if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
                    handleRemoveTag(tags[tags.length - 1]);
                  }
                }}
                placeholder={tags.length === 0 ? 'Type and press Enter to add tags...' : ''}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Cover Image</label>
            <input
              className={styles.input}
              type="text"
              value={coverImage}
              onChange={e => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            {coverImage && (
              <div className={styles.coverPreview}>
                <img
                  src={coverImage}
                  alt="Cover preview"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <div className={styles.coverActions}>
              <button
                className={styles.fileBtn}
                onClick={() => setFileDrawerOpen(true)}
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>

        <FileSelectDrawer
          open={fileDrawerOpen}
          onClose={() => setFileDrawerOpen(false)}
          onSelect={(url) => setCoverImage(url)}
          filterType="image"
        />

        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
            Cancel
          </button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </>
  );
}

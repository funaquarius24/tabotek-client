'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/components/providers/AuthProvider';
import { useCreateArticle, useUpdateArticle, useDeleteArticle, useArticle } from '@/hooks/useArticles';
import { useWarningOnExit } from '@/hooks/useWarningOnExit';
import Editor from '@/components/Editor';
import type { EditorChange } from '@/components/Editor';
import ArticleSettingDrawer from '@/components/ArticleSettingDrawer';
import type { ArticleAttributes } from '@/components/ArticleSettingDrawer';
import type { TocItem } from '@/components/Editor/utils/markdown';
import styles from './ArticleEditor.module.css';

interface ArticleEditorProps {
  canPublish?: boolean;
  userRole?: string;
}

interface ArticleDraft {
  id: string | null;
  title: string;
  content: string;
  html: string;
  toc: TocItem[];
  summary: string;
  password: string;
  allowComments: boolean;
  isRecommended: boolean;
  categoryId: string;
  tags: string[];
  coverImage: string;
}

export default function ArticleEditor({ canPublish = false, userRole }: ArticleEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const { user } = useAuth();
  const { addToast } = useToast();

  const { data: existingArticle } = useArticle(editId ?? '');

  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const [draft, setDraft] = useState<ArticleDraft>({
    id: editId ?? null,
    title: '',
    content: '',
    html: '',
    toc: [],
    summary: '',
    password: '',
    allowComments: true,
    isRecommended: false,
    categoryId: '',
    tags: [],
    coverImage: '',
  });

  const [editorKey, setEditorKey] = useState(editId || 'new');

  useEffect(() => {
    if (existingArticle && editId && editId !== editorKey) {
      setEditorKey(editId);
      setDraft({
        id: existingArticle._id,
        title: existingArticle.title,
        content: existingArticle.content,
        html: '',
        toc: [],
        summary: existingArticle.excerpt || '',
        password: '',
        allowComments: true,
        isRecommended: false,
        categoryId: existingArticle.categoryId || '',
        tags: existingArticle.tags || [],
        coverImage: existingArticle.featuredImage || '',
      });
    }
  }, [existingArticle, editId, editorKey]);

  const [hasSaved, setHasSaved] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasUnsaved = !hasSaved && (!!draft.title || !!draft.content);
  useWarningOnExit(hasUnsaved);

  const handleEditorChange = useCallback((change: EditorChange) => {
    setDraft(prev => ({ ...prev, content: change.value, html: change.html, toc: change.toc }));
    setHasSaved(false);
  }, []);

  const saveOrPublish = useCallback(async (status: 'draft' | 'published') => {
    if (saving) return;

    if (status === 'published' && !canPublish) {
      addToast('You need author privileges to publish. Save as draft instead.', 'warning');
      return;
    }

    try {
      if (!draft.title.trim()) {
        addToast('Title is required', 'warning');
        return;
      }
      if (!draft.content.trim()) {
        addToast('Content is required', 'warning');
        return;
      }

      setSaving(true);

      const authorId = (user as any)?._id ?? (user as any)?.id ?? '';
      const data = {
        title: draft.title,
        content: draft.content,
        excerpt: draft.summary || draft.content.slice(0, 200),
        status,
        categoryId: draft.categoryId,
        tags: draft.tags,
        featuredImage: draft.coverImage,
        authorId,
        slug: draft.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        readTime: Math.max(1, Math.ceil(draft.content.split(/\s+/).length / 200)),
        publishedAt: status === 'published' ? new Date().toISOString() : '',
        seo: {
          title: draft.title,
          description: draft.summary || draft.content.slice(0, 160),
          keywords: draft.tags,
        },
      };

      let response;
      if (draft.id) {
        response = await updateArticle.mutateAsync({ slug: draft.id, data });
      } else {
        response = await createArticle.mutateAsync(data);
      }

      const newId = (response as any)?._id ?? draft.id;
      setDraft(prev => ({ ...prev, id: newId }));
      setHasSaved(true);

      addToast(
        status === 'published' ? 'Article published successfully!' : 'Article saved as draft',
        'success'
      );

      if (!draft.id && newId) {
        router.replace(`/admin/article/editor?id=${newId}`);
      }
    } catch (err: any) {
      addToast(err?.message ?? 'Failed to save article', 'error');
    } finally {
      setSaving(false);
    }
  }, [draft, saving, user, createArticle, updateArticle, addToast, router]);

  const handleDelete = useCallback(() => {
    const confirmed = window.confirm('Are you sure you want to delete this article? This action cannot be undone.');
    if (!confirmed) return;
    if (!draft.id) return;

    deleteArticle.mutate(draft.id, {
      onSuccess: () => {
        addToast('Article deleted', 'success');
        router.push('/admin/articles');
      },
      onError: (err: any) => {
        addToast(err?.message ?? 'Failed to delete article', 'error');
      },
    });
  }, [draft.id, deleteArticle, addToast, router]);

  const handlePreview = useCallback(() => {
    const systemUrl = process.env.NEXT_PUBLIC_SYSTEM_URL || '';
    if (!systemUrl) {
      addToast('System URL is not configured', 'warning');
      return;
    }
    const slug = draft.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    window.open(`${systemUrl}/article/${slug}`, '_blank');
  }, [draft.title, addToast]);

  const handleSettingsChange = useCallback((attrs: Partial<ArticleAttributes>) => {
    setDraft(prev => ({
      ...prev,
      summary: attrs.summary ?? prev.summary,
      password: attrs.password ?? prev.password,
      allowComments: attrs.allowComments ?? prev.allowComments,
      isRecommended: attrs.isRecommended ?? prev.isRecommended,
      categoryId: attrs.categoryId ?? prev.categoryId,
      tags: attrs.tags ?? prev.tags,
      coverImage: attrs.coverImage ?? prev.coverImage,
    }));
  }, []);

  const handleSettingsPublish = useCallback((attrs: Partial<ArticleAttributes>) => {
    handleSettingsChange(attrs);
    saveOrPublish('published');
  }, [handleSettingsChange, saveOrPublish]);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <input
          className={styles.titleInput}
          type="text"
          value={draft.title}
          onChange={e => {
            setDraft(prev => ({ ...prev, title: e.target.value }));
            setHasSaved(false);
          }}
          placeholder="Article title..."
        />
        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnDraft} ${saving ? styles.btnDisabled : ''}`}
            onClick={() => saveOrPublish('draft')}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          {canPublish ? (
            <button
              className={`${styles.btn} ${styles.btnPublish} ${saving ? styles.btnDisabled : ''}`}
              onClick={() => setSettingsOpen(true)}
              disabled={saving}
            >
              Publish
            </button>
          ) : (
            <button
              className={`${styles.btn} ${styles.btnDisabled}`}
              disabled
              title="Author privileges required to publish"
            >
              Publish
            </button>
          )}
          <button
            className={`${styles.btn} ${styles.btnSettings}`}
            onClick={() => setSettingsOpen(true)}
          >
            Settings
          </button>
          <button className={`${styles.btn} ${styles.btnPreview}`} onClick={handlePreview}>
            Preview
          </button>
          {draft.id && (
            <button className={`${styles.btn} ${styles.btnDelete}`} onClick={handleDelete}>
              Delete
            </button>
          )}
        </div>
      </div>

      <div className={styles.editorWrapper}>
        <Editor
          key={editorKey}
          defaultValue={existingArticle?.content ?? ''}
          onChange={handleEditorChange}
        />
      </div>

      <ArticleSettingDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialValues={{
          summary: draft.summary,
          password: draft.password,
          allowComments: draft.allowComments,
          isRecommended: draft.isRecommended,
          categoryId: draft.categoryId,
          tags: draft.tags,
          coverImage: draft.coverImage,
        }}
        onChange={handleSettingsPublish}
      />
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ThreeColumnLayout from '@/components/ThreeColumnLayout';
import TableOfContentsClient from '@/components/TableOfContentsClient';
import MoreStories from '@/components/MoreStories';

function getStoredVote(slug: string): 'like' | 'dislike' | null {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(`vote_${slug}`);
  if (val === 'like' || val === 'dislike') return val;
  return null;
}

function setStoredVote(slug: string, vote: 'like' | 'dislike' | null) {
  if (typeof window === 'undefined') return;
  if (vote) {
    localStorage.setItem(`vote_${slug}`, vote);
  } else {
    localStorage.removeItem(`vote_${slug}`);
  }
}

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showToc, setShowToc] = useState(true);
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchArticle() {
      try {
        const res = await fetch('/api/articles/' + slug);
        if (!res.ok) {
          setError(true);
          return;
        }
        const data = await res.json();
        setArticle(data);

        if (data.categoryId) {
          const relRes = await fetch(`/api/articles?limit=3&category=${data.categoryId}`);
          if (relRes.ok) {
            const relData = await relRes.json();
            setRelatedArticles((relData.articles || []).filter((a: any) => a.slug !== slug));
          }
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchArticle();
  }, [slug]);

  useEffect(() => {
    if (article) {
      setUserVote(getStoredVote(slug));
    }
  }, [article, slug]);

  const handleVote = useCallback(async (vote: 'like' | 'dislike') => {
    if (!article) return;

    const previousVote = getStoredVote(slug);
    const newVote = previousVote === vote ? null : vote;

    try {
      const res = await fetch(`/api/articles/${slug}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote: newVote, previousVote }),
      });
      if (res.ok) {
        const updated = await res.json();
        setArticle(updated);
      }
    } catch {}

    setStoredVote(slug, newVote);
    setUserVote(newVote);
  }, [article, slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Article Not Found</h2>
        <p className="text-gray-500">The article you are looking for does not exist.</p>
      </div>
    );
  }

  function extractTableOfContents(html: string) {
    const headingRegex = /<h([2-3])\s+id="([^"]+)"[^>]*>([^<]+)<\/h[2-3]>/g;
    const items: { id: string; title: string; level: number }[] = [];
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
      items.push({
        id: match[2],
        title: match[3].trim(),
        level: parseInt(match[1], 10)
      });
    }

    if (items.length === 0) {
      const simpleHeadingRegex = /<h([2-3])[^>]*>([^<]+)<\/h[2-3]>/g;
      let index = 0;
      while ((match = simpleHeadingRegex.exec(html)) !== null) {
        const title = match[2].trim();
        const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        items.push({
          id,
          title,
          level: parseInt(match[1], 10)
        });
        index++;
      }
    }

    return items;
  }

  const rawContent = article.content || '';
  const contentHtml = rawContent.replace(
    /<h([2-3])>(.*?)<\/h\1>/g,
    (_match: string, level: string, text: string) => {
      const id = text.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      return `<h${level} id="${id}">${text}</h${level}>`;
    }
  );
  const tableOfContents = extractTableOfContents(contentHtml);

  return (
    <ThreeColumnLayout
      leftSidebar={showToc ? <TableOfContentsClient items={tableOfContents} /> : undefined}
    >
      <article className="prose prose-lg max-w-none">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowToc((v) => !v)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className={`w-8 h-4 rounded-full transition-colors ${showToc ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-600'} relative`}>
              <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${showToc ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
            <span className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">TOC</span>
          </button>
          <div />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          {article.title}
        </h1>
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <span className="mr-4">By {article.author?.name || 'Unknown Author'}</span>
          <span className="mr-4">·</span>
          <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}</span>
          <span className="mx-4">·</span>
          <span>{article.readTime || 5} min read</span>
          <span className="mx-4">·</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-700">
            {article.category?.name || 'Uncategorized'}
          </span>
        </div>

        {article.featuredImage && (
          <div className="mb-8">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="w-full rounded-lg shadow-sm"
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              {article.featuredImageCaption || 'Article featured image'}
            </p>
          </div>
        )}

        <p className="text-xl text-gray-700 mb-6">
          {article.excerpt}
        </p>

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div className="mt-10 pt-6 border-t border-gray-200 flex items-center gap-4">
          <button
            onClick={() => handleVote('like')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
              userVote === 'like'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill={userVote === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
            <span>{article.likes ?? 0}</span>
          </button>

          <button
            onClick={() => handleVote('dislike')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
              userVote === 'dislike'
                ? 'bg-red-50 border-red-300 text-red-700'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5" fill={userVote === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
            </svg>
          </button>

          <span className="text-xs text-gray-400 ml-2">
            {article.views ?? 0} views
          </span>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </ThreeColumnLayout>
  );
}

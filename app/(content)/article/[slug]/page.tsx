'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ThreeColumnLayout from '@/components/ThreeColumnLayout';
import TableOfContentsClient from '@/components/TableOfContentsClient';
import MoreStories from '@/components/MoreStories';

export default function ArticlePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showToc, setShowToc] = useState(true);

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

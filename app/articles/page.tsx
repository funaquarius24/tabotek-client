'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useInfiniteArticles } from '@/lib/hooks/useArticles';
import { ArticleResponse } from '@/lib/types';

function ArticleCard({ article }: { article: ArticleResponse }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {article.featuredImage && (
        <div className="aspect-video relative">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{article.readTime} min read</span>
        </div>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {(article.tags ?? []).slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag.toLowerCase()}`}
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 text-xs rounded-full transition-colors no-underline"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function ArticlesPage() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteArticles({ status: 'published' });

  const articles = data?.pages.flatMap((page) => page.articles) || [];

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Articles</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="aspect-video bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">Articles</h1>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error loading articles</p>
            <p className="text-gray-600">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Articles</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
        {isFetchingNextPage && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        {!hasNextPage && articles.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">You've reached the end!</p>
          </div>
        )}
      </div>
    </div>
  );
}
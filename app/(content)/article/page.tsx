'use client';

import React from 'react';
import Link from 'next/link';
import ThreeColumnLayout from '@/components/ThreeColumnLayout';
import { useArticles } from '@/lib/hooks/useArticles';
import { useCategories } from '@/lib/hooks/useCategories';
import CategorySidebar from '@/components/CategorySidebar';
import MoreStories from '@/components/MoreStories';

export default function ArticlesPage() {
  const { data: articlesData, isLoading: articlesLoading, error: articlesError } = useArticles({ limit: 20 });
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  const articles = articlesData?.articles || [];
  const categories = categoriesData?.categories || [];

  if (articlesLoading || categoriesLoading) {
    return (
      <div className="space-y-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Articles</h1>
          <p className="text-xl text-gray-600">Browse our complete collection of articles, tutorials, and reviews.</p>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      </div>
    );
  }

  if (articlesError || categoriesError) {
    return (
      <div className="space-y-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Articles</h1>
          <p className="text-xl text-gray-600">Browse our complete collection of articles, tutorials, and reviews.</p>
        </div>
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load articles</h3>
          <p className="text-gray-500 mb-6">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          All Articles
        </h1>
        <p className="text-xl text-gray-600">
          Browse our complete collection of articles, tutorials, and reviews.
        </p>
        
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {categories.map((category: any) => (
              <Link
                key={category._id}
                href={`/category/${category.slug}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">No articles yet</h3>
          <p className="text-gray-500">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {articles.map((article: any) => (
            <article 
              key={article._id}
              className="group border-b border-gray-200 pb-8 last:border-0"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {article.featuredImage && (
                  <div className="md:w-1/3">
                    <div className="aspect-video overflow-hidden rounded-lg">
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                )}
                <div className={`${article.featuredImage ? 'md:w-2/3' : 'w-full'}`}>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{article.readTime || 5} min read</span>
                    <span className="mx-2">·</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    <Link href={`/article/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      By {article.author?.name || 'Unknown Author'}
                    </span>
                    <Link
                      href={`/article/${article.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read full article →
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
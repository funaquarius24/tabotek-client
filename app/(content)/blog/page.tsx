'use client';

import React from 'react';
import Link from 'next/link';
import ThreeColumnLayout from '@/components/ThreeColumnLayout';
import { useArticles } from '@/lib/hooks/useArticles';
import { useCategory } from '@/lib/hooks/useCategories';

export default function BlogPage() {
  const { data: articlesData, isLoading: articlesLoading, error: articlesError } = useArticles({ category: 'blog', limit: 10 });
  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategory('blog');

  const articles = articlesData?.articles || [];

  if (articlesLoading || categoryLoading) {
    return (
      <ThreeColumnLayout>
        <div className="space-y-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600">Latest articles, tech news, and guides to keep you updated.</p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading blog articles...</p>
          </div>
        </div>
      </ThreeColumnLayout>
    );
  }

  if (articlesError || categoryError) {
    return (
      <ThreeColumnLayout>
        <div className="space-y-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600">Latest articles, tech news, and guides to keep you updated.</p>
          </div>
          <div className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Failed to load blog articles</h3>
            <p className="text-gray-500 mb-6">Please try again later</p>
          </div>
        </div>
      </ThreeColumnLayout>
    );
  }
  console.log("Blog Page...");
  return (
    
    <ThreeColumnLayout>
      <div className="space-y-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {category?.name || 'Blog'}
          </h1>
          <p className="text-xl text-gray-600">
            {category?.description || 'Latest articles, tech news, and guides to keep you updated.'}
          </p>
        </div>
        
        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No articles yet</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article: any) => (
              <article 
                key={article._id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {article.featuredImage && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{article.readTime || 5} min read</span>
                    <span className="mx-2">·</span>
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                      {article.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    <Link href={`/article/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">
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
                      Read more →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </ThreeColumnLayout>
  );
}
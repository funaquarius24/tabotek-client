'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useArticles } from '@/lib/hooks/useArticles';
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
          <Link href={`/articles/${article.slug}`}>
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function TagPage() {
  const params = useParams();
  const tag = params.tag as string;

  const { data, isLoading } = useArticles({ search: tag, limit: 50 });
  const articles = data?.articles?.filter(a => a.tags?.some(t => t.toLowerCase() === tag.toLowerCase())) ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/articles" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            &larr; Back to articles
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-2xl">#{tag}</span>
            <span className="text-gray-500 text-xl font-normal">Articles</span>
          </h1>
        </div>

        {isLoading ? (
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
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏷️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h2>
            <p className="text-gray-500">No articles tagged with &ldquo;{tag}&rdquo;</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-6">{articles.length} article{articles.length !== 1 ? 's' : ''} tagged with &ldquo;{tag}&rdquo;</p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
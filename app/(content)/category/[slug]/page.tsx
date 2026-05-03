'use client';

import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ThreeColumnLayout from '@/components/ThreeColumnLayout';
import { useCategory, useCategories } from '@/lib/hooks/useCategories';
import { useArticles } from '@/lib/hooks/useArticles';
import CategorySidebar from '@/components/CategorySidebar';
import MoreStories from '@/components/MoreStories';

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategory(slug);
  const { data: articlesData, isLoading: articlesLoading, error: articlesError } = useArticles({ category: category?._id, limit: 20 });
  const { data: subcategoriesData, isLoading: subcategoriesLoading, error: subcategoriesError } = useCategories({ parent: category?._id });

  const articles = articlesData?.articles || [];
  const subcategories = subcategoriesData?.categories || [];

  if (categoryLoading || articlesLoading || subcategoriesLoading) {
    console.log("categoryLoading || articlesLoading || subcategoriesLoading");
    return (
      <div className="space-y-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-xl bg-gray-500 text-white">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Loading...</h1>
              <p className="text-xl text-gray-600 mt-2">Loading category...</p>
            </div>
          </div>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading category content...</p>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    console.log("trying categoryError || !category");
    notFound();
  }

  if (articlesError || subcategoriesError) {
    console.log("articlesError || subcategoriesError");
    return (
      <div className="space-y-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${category.color || 'bg-gray-500'} text-white`}>
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
              <p className="text-xl text-gray-600 mt-2">{category.description}</p>
            </div>
          </div>
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
        <div className="flex items-center gap-4 mb-4">
          <div className={`p-3 rounded-xl ${category.color || 'bg-gray-500'} text-white`}>
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {category.name}
            </h1>
            <p className="text-xl text-gray-600 mt-2">
              {category.description}
            </p>
          </div>
        </div>
        
        {subcategories.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Subcategories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subcategories.map((subcat: any) => (
                <Link
                  key={subcat._id}
                  href={`/category/${subcat.slug}`}
                  className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${subcat.color || 'bg-gray-200'}`}>
                      <span className="text-lg">📄</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{subcat.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {subcat.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-2xl font-semibold text-gray-700 mb-4">No articles in this category yet</h3>
          <p className="text-gray-500">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
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
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    <Link href={`/article/${article.slug}`} prefetch={true}>
                      {article.title}
                    </Link>
                  </h3>
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
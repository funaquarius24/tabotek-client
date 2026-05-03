'use client';

import React from 'react';
import MoreStories from './MoreStories';
import SimilarStories from './SimilarStories';
import { useParams, usePathname } from 'next/navigation';
import { useCategories, useCategory } from '@/lib/hooks/useCategories';
import { useArticles, useArticle } from '@/lib/hooks/useArticles';

interface MoreSimilarProps {
  moreStories?: Array<any>;
  similarStories?: Array<any>;
  showMoreStories?: boolean;
  showSimilarStories?: boolean;
  showSimilarFirst?: boolean;
}

const MoreSimilar = ({
  moreStories = [],
  similarStories = [],
  showMoreStories = true,
  showSimilarStories = true,
  showSimilarFirst = true
}: MoreSimilarProps) => {
  const components = [];

  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;

  const isArticlePage = pathname?.startsWith('/article/');
  const isCategoryPage = pathname?.startsWith('/category/');

  const { data: article } = useArticle(isArticlePage ? slug : '');

  const categoryIdentifier = isCategoryPage
    ? slug
    : (isArticlePage && article ? article.categoryId : '');

  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategory(categoryIdentifier);
  const { data: articlesData, isLoading: articlesLoading, error: articlesError } = useArticles({ category: category?._id, limit: 20 });
  const { data: subcategoriesData, isLoading: subcategoriesLoading, error: subcategoriesError } = useCategories({ parent: category?._id });

  const articles = articlesData?.articles || [];
  const subcategories = subcategoriesData?.categories || [];

  if (showSimilarFirst) {
    if (showSimilarStories && articles.length > 0) {
      components.push(
        <SimilarStories key="similar" articles={articles.slice(0, 5)} />
      );
    }
    if (showMoreStories && articles.length > 0) {
      components.push(
        <MoreStories key="more" articles={articles.slice(0, 5)} />
      );
    }
  } else {
    if (showMoreStories && articles.length > 0) {
      components.push(
        <MoreStories key="more" articles={articles.slice(0, 5)} />
      );
    }
    if (showSimilarStories && articles.length > 0) {
      components.push(
        <SimilarStories key="similar" articles={articles.slice(0, 5)} />
      );
    }
  }

  if (components.length === 0) {
    console.log("No components to render in MoreSimilar.tsx");
    return null;
  }
  else{
    console.log("Components length in MoreSimilar: ", components.length);
  }

  return (
    <div className="sticky top-8 space-y-8">
      {components.map((component, index) => (
        <React.Fragment key={index}>
          {component}
          {index < components.length - 1 && (
            <div className="pt-6 border-t border-gray-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MoreSimilar;
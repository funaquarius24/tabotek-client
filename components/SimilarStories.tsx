import React from 'react';
import Link from 'next/link';
import { ArticleResponse } from '@/lib/types';

// interface SimilarStoriesProps {
//   articles?: Array<{
//     id: number;
//     title: string;
//     author: string;
//     readTime: string;
//     category: string;
//     image: string;
//     slug: string;
//   }>;
// }

interface SimilarStoriesProps {
  articles?: ArticleResponse[];
}

const SimilarStories = ({ articles }: SimilarStoriesProps) => {
  const stories = articles || [];

  if (stories.length === 0) return null;

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-6 text-lg">Similar Stories</h3>
      <div className="space-y-6">
        {stories.map((story) => (
          <Link
            key={story._id}
            href={`/article/${story.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden">
                  <img
                    src={story.featuredImage}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {story.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-gray-500">{story.readTime} min read</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link
          href="/articles"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all trending articles →
        </Link>
      </div>
    </div>
  );
};

export default SimilarStories;
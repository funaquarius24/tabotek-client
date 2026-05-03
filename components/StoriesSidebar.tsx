import React from 'react';
import Link from 'next/link';

interface StoriesSidebarProps {
  articles?: Array<{
    id: number;
    title: string;
    author: string;
    readTime: string;
    category: string;
    image: string;
    slug: string;
  }>;
}

const StoriesSidebar = ({ articles }: StoriesSidebarProps) => {
  const stories = articles || [
    {
      id: 1,
      title: 'Optimizing Neural Networks for Edge Devices: A Practical Guide',
      author: 'Alex Chen',
      readTime: '8 min read',
      category: 'Machine Learning',
      image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=400&h=225&fit=crop',
      slug: 'optimizing-neural-networks-edge-devices',
    },
    {
      id: 2,
      title: 'Why We Migrated Our CV Pipeline from Python to Rust',
      author: 'Sarah Johnson',
      readTime: '12 min read',
      category: 'Computer Vision',
      image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w-400&h=225&fit=crop',
      slug: 'migrated-cv-pipeline-python-rust',
    },
    {
      id: 3,
      title: 'Understanding Attention Mechanisms in Vision Transformers',
      author: 'Mike Ross',
      readTime: '6 min read',
      category: 'AI Research',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
      slug: 'attention-mechanisms-vision-transformers',
    },
    {
      id: 4,
      title: 'Real-time Object Detection with YOLOv8: Architecture Deep Dive',
      author: 'Emily Zhang',
      readTime: '10 min read',
      category: 'Computer Vision',
      image: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=225&fit=crop',
      slug: 'real-time-object-detection-yolov8',
    },
  ];

  return (
    <div className="sticky top-8">
      <h3 className="font-semibold text-gray-900 mb-6 text-lg">More Stories</h3>
      <div className="space-y-6">
        {stories.map((story) => (
          <Link
            key={story.id}
            href={`/article/${story.slug}`}
            className="group block p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {story.title}
                </h4>
                <p className="text-xs text-gray-500 mt-1">{story.author}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {story.category}
                  </span>
                  <span className="text-xs text-gray-500">{story.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-8 pt-4 border-t border-gray-200">
        <Link
          href="#"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          View all trending articles →
        </Link>
      </div>
    </div>
  );
};

export default StoriesSidebar;
import Link from 'next/link';

interface CategorySidebarProps {
  categorySlug?: string;
  activeTab?: string;
}

const CategorySidebar = ({ categorySlug, activeTab }: CategorySidebarProps) => {
  const navigationItems = [
    { label: 'Articles', icon: '📄', href: categorySlug ? `/category/${categorySlug}` : '/articles' },
    { label: 'Questions', icon: '❓', href: '#questions' },
    { label: 'Chat', icon: '💬', href: '#chat' },
    { label: 'Tags', icon: '🏷️', href: '#tags' },
  ];

  return (
    <nav className="sticky top-8">
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Navigation</h3>
        {navigationItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === item.label.toLowerCase()
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Popular Tags</h4>
        <div className="flex flex-wrap gap-2">
          {['javascript', 'react', 'typescript', 'nodejs', 'python', 'ai'].map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default CategorySidebar;
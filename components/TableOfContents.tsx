import React from 'react';

interface TableOfContentsProps {
  items?: { id: string; title: string; level: number }[];
}

const TableOfContents = ({ items }: TableOfContentsProps) => {
  const headings = items || [
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'challenge-of-scale', title: 'The Challenge of Scale', level: 2 },
    { id: 'microservices-architecture', title: 'Microservices Architecture', level: 2 },
    { id: 'load-balancing-strategies', title: 'Load Balancing Strategies', level: 3 },
    { id: 'conclusion', title: 'Conclusion', level: 1 },
  ];

  return (
    <nav className="sticky top-8">
      <div className="border-l-2 border-gray-200 pl-4">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Table of Contents</h3>
        <ul className="space-y-2">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`block text-sm hover:text-blue-600 transition-colors ${
                  heading.level === 1
                    ? 'font-medium text-gray-900'
                    : heading.level === 2
                    ? 'font-normal text-gray-700 pl-2'
                    : 'font-light text-gray-600 pl-4'
                }`}
              >
                {heading.title}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Jump to any section of this article. Click a heading to scroll.
          </p>
        </div>
      </div>
    </nav>
  );
};

export default TableOfContents;
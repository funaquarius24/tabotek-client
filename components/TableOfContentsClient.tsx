'use client';

import React, { useEffect, useState } from 'react';

interface TableOfContentsClientProps {
  items: { id: string; title: string; level: number }[];
}

const TableOfContentsClient = ({ items }: TableOfContentsClientProps) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -66% 0px' }
    );

    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <nav className="sticky top-8">
      <div className="border-l-2 border-gray-200 pl-4">
        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Table of Contents</h3>
        <ul className="space-y-2">
          {items.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`block text-sm hover:text-blue-600 transition-colors ${
                  activeId === heading.id ? 'text-blue-600 font-medium' : ''
                } ${
                  heading.level === 2
                    ? 'font-medium text-gray-900'
                    : heading.level === 3
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

export default TableOfContentsClient;
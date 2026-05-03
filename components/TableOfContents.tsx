'use client';

import React, { useState } from 'react';

interface TableOfContentsProps {
  items?: { id: string; title: string; level: number }[];
}

const TableOfContents = ({ items }: TableOfContentsProps) => {
  const [visible, setVisible] = useState(true);
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 text-lg">Table of Contents</h3>
          <button
            onClick={() => setVisible((v) => !v)}
            className="relative w-9 h-5 rounded-full transition-colors bg-zinc-300 dark:bg-zinc-600 data-[on=true]:bg-blue-600"
            data-on={visible || undefined}
            aria-label="Toggle table of contents"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                visible ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        {visible && (
          <>
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
          </>
        )}
      </div>
    </nav>
  );
};

export default TableOfContents;
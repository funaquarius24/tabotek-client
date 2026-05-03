import React from 'react';

interface ThreeColumnLayoutProps {
  children: React.ReactNode;
  leftSidebar?: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export default function ThreeColumnLayout({
  children,
  leftSidebar,
  rightSidebar,
}: ThreeColumnLayoutProps) {
  const hasLeftSidebar = !!leftSidebar;
  const hasRightSidebar = !!rightSidebar;

  // Calculate grid columns dynamically based on which sidebars are present
  let gridCols = '';
  if (hasLeftSidebar && hasRightSidebar) {
    gridCols = 'lg:grid-cols-[1.51fr_5.99fr_2.5fr]';
  } else if (hasLeftSidebar && !hasRightSidebar) {
    gridCols = 'lg:grid-cols-[0.91fr_11.09fr]';
  } else if (!hasLeftSidebar && hasRightSidebar) {
    gridCols = 'lg:grid-cols-[9.5fr_2.5fr]';
  } else {
    gridCols = 'lg:grid-cols-[1fr]';
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className={`grid grid-cols-1 gap-8 ${gridCols}`}>
        {/* Left Sidebar */}
        {hasLeftSidebar && (
          <aside className="lg:sticky lg:top-8 h-fit">
            {leftSidebar}
          </aside>
        )}

        {/* Main Content */}
        <main>{children}</main>

        {/* Right Sidebar */}
        {hasRightSidebar && (
          <aside className="lg:sticky lg:top-8 h-fit">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
}
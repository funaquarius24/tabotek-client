import React from 'react';
import ThreeColumnLayout from '@/components/ThreeColumnLayout';
import TableOfContents from '@/components/TableOfContents';
import MoreStories from '@/components/MoreStories';
import CategorySidebar from '@/components/CategorySidebar';
import MoreSimilar from '@/components/MoreSimilar';

export default function ContentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("ContentLayout");
  return (
    <ThreeColumnLayout
      leftSidebar={<CategorySidebar />}
      rightSidebar={<MoreSimilar showMoreStories={true} showSimilarStories={true} />}
    >
      {children}
    </ThreeColumnLayout>
  );
}
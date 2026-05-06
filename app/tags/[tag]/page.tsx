import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchArticlesByTag(tag: string) {
  const res = await fetch(`${API}/api/articles?limit=50`, { cache: 'no-store' });
  if (!res.ok) return { articles: [] };
  const data = await res.json();
  return {
    articles: (data.articles || []).filter((a: any) =>
      a.tags?.some((t: string) => t.toLowerCase() === tag.toLowerCase())
    )
  };
}

async function fetchTagBySlug(slug: string) {
  try {
    const res = await fetch(`${API}/api/tags/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchTags() {
  try {
    const res = await fetch(`${API}/api/tags`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tags || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: slug } = await params;
  const [tag, { articles }] = await Promise.all([
    fetchTagBySlug(slug),
    fetchArticlesByTag(slug),
  ]);
  const tagName = tag?.name || slug;
  const articleCount = articles?.length || 0;

  return {
    title: `${tagName} Tutorials & Guides | Tech Hub`,
    description: tag?.description || `Learn about ${tagName} with practical examples and best practices`,
    openGraph: tag ? {
      title: `Master ${tagName} | Tech Hub`,
      description: `Step-by-step guides, code examples, and expert tips for ${tagName}`,
    } : undefined,
    alternates: {
      canonical: `https://techteg.com/tags/${slug}`,
    },
    // Noindex thin content tags with fewer than 3 articles
    robots: articleCount < 3 ? { index: false, follow: true } : undefined,
  };
}

function ArticleCard({ article }: { article: any }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {article.featuredImage && (
        <div className="aspect-video relative">
          <Image
            src={article.featuredImage}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500">{new Date(article.publishedAt).toLocaleDateString()}</span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm text-gray-500">{article.readTime} min read</span>
        </div>
        <h2 className="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
          <Link href={`/article/${article.slug}`}>
            {article.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{article.excerpt}</p>
        <div className="flex flex-wrap gap-2">
          {article.tags?.slice(0, 3).map((tag: string) => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag: slug } = await params;
  const [tag, tags, { articles }] = await Promise.all([
    fetchTagBySlug(slug),
    fetchTags(),
    fetchArticlesByTag(slug),
  ]);

  if (!articles) notFound();

  const tagDisplayName = tag?.name || slug;
  const relatedTags = tag?.relatedTags || [];
  const allTagNames = tags.map((t: any) => t.name);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/articles" className="hover:text-blue-600">Articles</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{tagDisplayName}</span>
        </nav>

        {/* Schema.org BreadcrumbList + CollectionPage structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: `${tagDisplayName} Tutorials & Guides`,
              description: tag?.description || `Articles tagged with ${tagDisplayName}`,
              breadcrumb: {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://techteg.com/' },
                  { '@type': 'ListItem', position: 2, name: 'Articles', item: 'https://techteg.com/articles' },
                  { '@type': 'ListItem', position: 3, name: tagDisplayName, item: `https://techteg.com/tags/${slug}` },
                ],
              },
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: articles.slice(0, 10).map((a: any, i: number) => ({
                  '@type': 'ListItem',
                  position: i + 1,
                  url: `https://techteg.com/article/${a.slug}`,
                })),
              },
            }),
          }}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-2xl">#{tagDisplayName}</span>
            <span className="text-gray-500 text-xl font-normal">Articles</span>
          </h1>
          {tag?.description && (
            <p className="text-gray-600 mt-3 max-w-2xl">{tag.description}</p>
          )}
        </div>

        {/* Related tags for discovery */}
        {relatedTags.length > 0 && (
          <div className="mb-6">
            <span className="text-sm text-gray-500">Related: </span>
            {relatedTags.map((related: string) => {
              const relatedSlug = allTagNames.includes(related)
                ? tags.find((t: any) => t.name === related)?.slug || related.toLowerCase().replace(/\s+/g, '-')
                : related.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={related}
                  href={`/tags/${relatedSlug}`}
                  className="inline-block px-3 py-1 mr-2 mb-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-full text-sm transition-colors"
                >
                  #{related}
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-gray-500 mb-6">{articles.length} article{articles.length !== 1 ? 's' : ''} tagged with &ldquo;{tagDisplayName}&rdquo;</p>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏷️</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No articles found</h2>
            <p className="text-gray-500">No articles tagged with &ldquo;{tagDisplayName}&rdquo;</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: any) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

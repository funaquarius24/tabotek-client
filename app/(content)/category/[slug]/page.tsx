import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

const API = process.env.NEXT_PUBLIC_API_URL || '';

async function fetchCategory(slug: string) {
  try {
    const res = await fetch(`${API}/api/categories/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchArticlesByCategory(categoryId: string) {
  const res = await fetch(`${API}/api/articles?category=${categoryId}&limit=20`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.articles || [];
}

async function fetchSubCategories(parentId: string) {
  const res = await fetch(`${API}/api/categories?parent=${parentId}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories || [];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) {
    return { title: 'Category Not Found | Tech Hub' };
  }

  return {
    title: `${category.name} Articles | Tech Hub`,
    description: category.description || `Explore our ${category.name} tutorials and guides`,
    alternates: {
      canonical: `https://techteg.com/categories/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) notFound();

  const [articles, subcategories] = await Promise.all([
    fetchArticlesByCategory(category._id),
    fetchSubCategories(category._id),
  ]);

  return (
    <>
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Schema.org BreadcrumbList + CollectionPage structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.name} Articles`,
            description: category.description || `Articles in ${category.name}`,
            breadcrumb: {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://techteg.com/' },
                { '@type': 'ListItem', position: 2, name: category.name, item: `https://techteg.com/categories/${category.slug}` },
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

      <div className="space-y-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-xl ${category.color || 'bg-gray-500'} text-white`}>
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-xl text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
          </div>

          {subcategories.length > 0 && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Subcategories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subcategories.map((subcat: any) => (
                  <Link
                    key={subcat._id}
                    href={`/category/${subcat.slug}`}
                    className="p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${subcat.color || 'bg-gray-200'}`}>
                        <span className="text-lg">📄</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{subcat.name}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{subcat.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">No articles in this category yet</h3>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
            {articles.map((article: any) => (
              <article
                key={article._id}
                className="group border-b border-gray-200 pb-8 last:border-0"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {article.featuredImage && (
                    <div className="md:w-1/3">
                      <div className="aspect-video overflow-hidden rounded-lg">
                        <img
                          src={article.featuredImage}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
                  <div className={`${article.featuredImage ? 'md:w-2/3' : 'w-full'}`}>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{article.readTime || 5} min read</span>
                      <span className="mx-2">·</span>
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      <Link href={`/article/${article.slug}`} prefetch={true}>
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4">{article.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        By {article.author?.name || 'Unknown Author'}
                      </span>
                      <Link
                        href={`/article/${article.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Read full article →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

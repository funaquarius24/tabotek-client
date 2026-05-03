'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { PhoneIcon, CodeIcon, ScissorsIcon, ArticleIcon, LaptopIcon, TabletIcon, WatchIcon, BrainIcon, ChartIcon, WebIcon, ServerIcon, HairDryerIcon, IronIcon, PotIcon, HomeIcon, NewsIcon, GuideIcon } from "@/components/icons";

function getIconComponent(iconName: string) {
  const iconMap: { [key: string]: React.ComponentType } = {
    PhoneIcon,
    CodeIcon,
    ScissorsIcon,
    ArticleIcon,
    LaptopIcon,
    TabletIcon,
    WatchIcon,
    BrainIcon,
    ChartIcon,
    WebIcon,
    ServerIcon,
    HairDryerIcon,
    IronIcon,
    PotIcon,
    HomeIcon,
    NewsIcon,
    GuideIcon
  };

  return iconMap[iconName] || ArticleIcon;
}

function getDefaultColor(categoryName: string) {
  const colorMap: { [key: string]: string } = {
    'Reviews': 'bg-blue-500',
    'Tech Tutorials': 'bg-purple-500',
    'Life Skills': 'bg-green-500',
    'Blog': 'bg-amber-500'
  };

  return colorMap[categoryName] || 'bg-gray-500';
}

export default function Home() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes] = await Promise.all([
          fetch('/api/categories?featured=true'),
          fetch('/api/articles?limit=6')
        ]);
        const catData = await catRes.json();
        setCategories(catData.categories || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const displayCategories = categories.length > 0 ? categories.map((cat: any) => ({
    name: cat.name,
    description: cat.description,
    icon: getIconComponent(cat.icon),
    href: `/category/${cat.slug}`,
    color: cat.color || getDefaultColor(cat.name),
  })) : [
    {
      name: "Reviews",
      description: "In-depth reviews of phones, laptops, tablets, and wearables.",
      icon: PhoneIcon,
      href: "#",
      color: "bg-blue-500",
    },
    {
      name: "Tech Tutorials",
      description: "Learn programming, machine learning, data science, web development, and DevOps.",
      icon: CodeIcon,
      href: "#",
      color: "bg-purple-500",
    },
    {
      name: "Life Skills",
      description: "Practical training in tailoring, hair dressing, ironing, cooking, and home maintenance.",
      icon: ScissorsIcon,
      href: "#",
      color: "bg-green-500",
    },
    {
      name: "Blog",
      description: "Latest articles, tech news, and guides to keep you updated.",
      icon: ArticleIcon,
      href: "#",
      color: "bg-amber-500",
    },
  ];

  console.log("Home");

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900 font-sans">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-black dark:text-white mb-6">
          Tech Hub & Life Skills Academy
        </h1>
        <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto mb-12">
          Your ultimate destination for expert tech reviews, hands‑on tutorials, and practical life‑skill training.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
           <Link
            href="/articles"
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-colors duration-300 shadow-lg"
          >
            Start Exploring
          </Link>
           <Link
            href="/articles"
            className="inline-block px-8 py-4 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-300"
          >
            Browse All Articles
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-6 pb-32">
        <h2 className="text-4xl font-bold text-center text-black dark:text-white mb-12">
          Explore Our Content
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {displayCategories.map((cat: any) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className="group block p-8 rounded-3xl bg-white dark:bg-zinc-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`inline-flex p-4 rounded-2xl ${cat.color} text-white mb-6`}>
                  <Icon />
                </div>
                <h3 className="text-2xl font-bold text-black dark:text-white mb-4">
                  {cat.name}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {cat.description}
                </p>
                <div className="mt-6 text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">
                  Discover →
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-6 pb-24 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-12 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Master New Skills?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join our community of learners and get access to exclusive content, interactive workshops, and expert advice.
          </p>
           <Link
            href="/auth/signin"
            className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-50 transition-colors duration-300 shadow-lg"
          >
            Sign Up Free
          </Link>
        </div>
      </section>
    </div>
  );
}

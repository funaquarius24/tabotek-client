'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import styles from './GlobalNav.module.css';
import AuthModal from './AuthModal';
import { useAuth } from './providers/AuthProvider';
import { PhoneIcon, LaptopIcon, TabletIcon, WatchIcon, CodeIcon, BrainIcon, ChartIcon, WebIcon, ServerIcon, ScissorsIcon, HairDryerIcon, IronIcon, PotIcon, HomeIcon, ArticleIcon, NewsIcon, GuideIcon, SearchIcon, UserIcon, PublishIcon } from './icons';

const navItems = [
  {
    name: 'Reviews',
    slug: 'reviews',
    items: [
      { name: 'Phones', href: '/category/phones', icon: PhoneIcon },
      { name: 'Laptops', href: '/category/laptops', icon: LaptopIcon },
      { name: 'Tablets', href: '/category/tablets', icon: TabletIcon },
      { name: 'Wearables', href: '/category/wearables', icon: WatchIcon },
    ],
  },
  {
    name: 'Tech Tutorials',
    slug: 'tech-tutorials',
    items: [
      { name: 'Programming', href: '/category/programming', icon: CodeIcon },
      { name: 'Machine Learning', href: '/category/machine-learning', icon: BrainIcon },
      { name: 'Data Science & Analytics', href: '/category/data-science-analytics', icon: ChartIcon },
      { name: 'Web Development', href: '/category/web-development', icon: WebIcon },
      { name: 'DevOps', href: '/category/devops', icon: ServerIcon },
    ],
  },
  {
    name: 'Life Skills',
    slug: 'life-skills',
    items: [
      { name: 'Tailoring', href: '/category/tailoring', icon: ScissorsIcon },
      { name: 'Hair Dressing', href: '/category/hair-dressing', icon: HairDryerIcon },
      { name: 'Ironing', href: '/category/ironing', icon: IronIcon },
      { name: 'Cooking', href: '/category/cooking', icon: PotIcon },
      { name: 'Home Maintenance', href: '/category/home-maintenance', icon: HomeIcon },
    ],
  },
  {
    name: 'Blog',
    slug: 'blog',
    items: [
      { name: 'Latest Articles', href: '/category/latest-articles', icon: ArticleIcon },
      { name: 'Tech News', href: '/category/tech-news', icon: NewsIcon },
      { name: 'Guides', href: '/category/guides', icon: GuideIcon },
    ],
  },
  {
    name: 'GeoPolitics',
    slug: 'geopolitics',
    items: [
      { name: 'News', href: '/category/geopolitics-news', icon: ArticleIcon },
      { name: 'Climate changes', href: '/category/climate-changes', icon: NewsIcon },
      { name: 'Green Energy', href: '/category/green-energy', icon: GuideIcon },
    ],
  },
  
];

export default function GlobalNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);
  const navWrapperRef = useRef<HTMLDivElement>(null);
  const { user, isLoggedIn, isLoading, signOut } = useAuth();

    return (
    <div
      ref={navWrapperRef}
      className={styles.navWrapper}
      onMouseLeave={(e) => {
        
        setActiveMenu(null);
        console.log("Mouse left navWrapper");
      }}
    >
      <nav className={styles.nav}>
        <Link href="/" className={styles.homeLink}>
          <img src="/icon.svg" alt="Home" className={styles.favicon} />
        </Link>
        <div className={`${styles.navItems} ${isMobileNavOpen ? styles.navItemsOpen : ''}`}>
          {navItems.map((section) => (
            <div
              key={section.name}
              className={styles.navItem}
              onMouseEnter={() => {
                if (isMobileNavOpen) {
                  setExpandedMobileCategory(section.name);
                } else {
                  setActiveMenu(section.name);
                }
              }}
              onMouseLeave={() => {
                console.log("Mouse left navWrapper second");
                if (isMobileNavOpen) {
                  setExpandedMobileCategory(null);
                } else {
                  //setActiveMenu(null);
                }
              }}
            >
                <Link href={`/category/${section.slug}`} className={styles.navButton}>
                  {section.name}
                </Link>
                {expandedMobileCategory === section.name && isMobileNavOpen && (
                  <div className={styles.mobileSubMenu}>
                    {section.items.map((item) => (
                      <Link href={item.href} key={item.name} className={styles.mobileSubMenuItem}>
                        <div className={styles.mobileSubMenuItemIcon}>
                          <item.icon />
                        </div>
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
        <div className={styles.searchContainer}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
        <button 
          className={styles.mobileMenuButton} 
          onClick={() => {
            console.log("Click mobile menu button");
            setIsMobileNavOpen(!isMobileNavOpen)}}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
        <div className={styles.authButtons}>
          
          {isLoading ? null : isLoggedIn ? (
            <>
              <Link href="/account" className={styles.accountLink}>
                <UserIcon />
                <span>Account</span>
              </Link>
              {
              isLoggedIn && (
                <Link href="/publish" className={styles.publishButton}>
                  <PublishIcon />
                  <span>Publish</span>
                </Link>
              )}
              <button className={styles.signOutButton} onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <button className={styles.signInButton} onClick={() => setShowAuthModal(true)}>
              Sign In
            </button>
          )}
        </div>
      </nav>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        mode="signin" 
      />

      {activeMenu && (
        <div className={styles.megaMenu}>
          <div className={styles.megaMenuContent}>
            {navItems.find((section) => section.name === activeMenu)?.items.map((item) => (
               <Link href={item.href} key={item.name} className={styles.megaMenuItem}>
                 <div className={styles.megaMenuItemIcon}>
                   <item.icon />
                 </div>
                 <div className={styles.megaMenuItemText}>
                   <p className={styles.megaMenuItemName}>{item.name}</p>
                 </div>
               </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
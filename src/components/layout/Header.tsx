// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  HtmlNavigation,
  HtmlNavigationItem,
  HtmlNavigationLink,
  HtmlNavigationLinkWithDropdown,
  HtmlNavigationDropdown,
  HtmlMobileNavigation,
  HtmlMobileNavigationItem
} from '@/components/ui/html-navigation';
import { useAuthStore } from '@/store/auth';
import { cmsApi } from '@/services/api';
import { MenuPage, Page } from '@/types';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';
import Image from "next/image";
import Search from '../ui/search';
import "@fortawesome/fontawesome-free/css/all.min.css";
// Helper function to convert slug to proper URL
const getPageUrl = (slug: string) => {
  // Handle special cases for legacy PHP URLs
  if (slug.includes('.php')) {
    // Convert PHP URLs to modern routes
    if (slug.includes('contactus')) return '/contact';
    if (slug.includes('testimonials')) return '/testimonials';
    if (slug.includes('booking')) return '/booking';
    // For other PHP files, use the slug as-is for now
    return `/${slug}`;
  }

  // Handle modern slugs
  return `/${slug}`;
};

// Helper function to convert Page to MenuPage format
const pageToMenuPage = (page: Page): MenuPage => ({
  id: page.id,
  page_title: page.page_title,
  slug: page.slug,
  link_title: page.link_title,
  is_parent: page.is_parent,
  parent_level: page.parent_level,
  weight: page.weight,
  footer_link: page.footer_link,
  featured_service: page.featured_service,
  children: []
});

// Helper function to build comprehensive hierarchical menu structure
const buildCompleteMenuHierarchy = (menuPages: MenuPage[], footerPages: MenuPage[], featuredServices: MenuPage[], allPages: Page[]) => {
  if (!menuPages) return [];

  // Convert all CMS pages to MenuPage format and combine all sources
  const cmsMenuPages = allPages.map(pageToMenuPage);
  const allMenuSources = [...menuPages, ...footerPages, ...featuredServices, ...cmsMenuPages];

  // Deduplicate pages by ID to avoid duplicates
  const uniquePages = allMenuSources.reduce((acc, page) => {
    if (!acc.has(page.id)) {
      acc.set(page.id, page);
    }
    return acc;
  }, new Map<number, MenuPage>());

  const deduplicatedPages = Array.from(uniquePages.values());

  // Create maps for different types of relationships
  const parentMap = new Map<number, MenuPage[]>();

  // Group children by their parent ID with support for multiple nesting levels
  deduplicatedPages.forEach(page => {
    const parentId = page.is_parent;

    // Skip items that don't have a parent or are special categories we don't want in main nav
    if (!parentId || parentId === 0 || parentId === 854698) {
      return;
    }

    // Include items at any reasonable parent level (supports unlimited nesting)
    if (page.parent_level > 0 && page.parent_level < 10000) {
      if (!parentMap.has(parentId)) {
        parentMap.set(parentId, []);
      }

      // Check if this child is already in the array to avoid duplicates
      const existingChildren = parentMap.get(parentId)!;
      const alreadyExists = existingChildren.some(existing => existing.id === page.id);

      if (!alreadyExists) {
        parentMap.get(parentId)!.push(page);
      }
    }
  });

  // Recursive function to build nested menu structure with unlimited depth
  const buildNestedStructure = (pageItem: MenuPage, level: number = 0): MenuPage => {
    const children = parentMap.get(pageItem.id) || [];

    // Recursively build children (supports unlimited nesting depth)
    const nestedChildren = children.map(child => buildNestedStructure(child, level + 1));

    return {
      ...pageItem,
      children: nestedChildren.sort((a, b) => a.weight - b.weight)
    };
  };

  // Build the final menu structure with complete nested hierarchy
  return menuPages.map(page => buildNestedStructure(page));
};

// Collect all descendant URLs for active-state propagation to parent menu items
const collectDescendantPaths = (item: any): string[] => {
  if (!item?.children?.length) return [];

  const paths: string[] = [];
  const walk = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (node?.page_slug) {
        paths.push(`/${node.page_slug}`);
      }
      if (node?.children?.length) {
        walk(node.children);
      }
    });
  };

  walk(item.children);
  return paths;
};



// Recursive component to render menu items with unlimited nesting
const renderMenuItem = (item: any, level: number = 0): React.ReactNode => {
  const hasChildren = item.children && item.children.length > 0;

  if (level === 0) {
    // Top level menu items
    const descendantPaths = hasChildren ? collectDescendantPaths(item) : [];
    return (
      <HtmlNavigationItem key={item.id} hasDropdown={hasChildren}>
        {hasChildren ? (
          <>
            <HtmlNavigationLinkWithDropdown href={`/${item.page_slug}`} activePaths={descendantPaths}>
              {item.page_title}
            </HtmlNavigationLinkWithDropdown>
            <HtmlNavigationDropdown className="p-1">
              <div className="grid gap-2">
                {item.children?.map((child: any) => renderMenuItem(child, level + 1))}
              </div>
            </HtmlNavigationDropdown>
          </>
        ) : (
          <HtmlNavigationLink href={`/${item.page_slug}`}>
            {item.page_title}
          </HtmlNavigationLink>
        )}
      </HtmlNavigationItem>
    );
  } else {
    // Nested menu items (level 1+)
    return (
      <div key={item.id} className="group/nested relative">
        <Link
          href={`/${item.page_slug}`}
          className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-gray-50 transition-colors"
        >
          <div>
            <div className="font-medium text-black text-sm">{item.page_title}</div>
          </div>
          {hasChildren && (
            <span className="menu-toggle-nested-icon">
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </Link>

        {/* Nested dropdown */}
        {hasChildren && (
          <div className="absolute left-full top-0 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-300 z-[9998] ml-1">
            <div className="p-3">
              <div className="font-semibold text-sm text-blue-600 border-b border-gray-100 pb-2 mb-3">
                {item.page_title}
              </div>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {item.children?.map((child: any) => renderMenuItem(child, level + 1))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  // Fetch complete menu data including CMS pages
  const { data: completeMenuData } = useQuery({
    queryKey: ['complete-menu'],
    queryFn: () => cmsApi.getCompleteMenu(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Build comprehensive hierarchical menu structure
  const hierarchicalMenu = completeMenuData ?
    completeMenuData.menu_items || [] : [];

  return (
    <header className="bg-white shadow-sm relative z-40 min-h-[160px] md:min-h-[145px]">
      <div className="mx-auto max-w-[1400px] relative xl:px-3">
      {/* Top bar */}
        <div className="flex italic bg-gray-100 justify-center text-center text-sm px-2 py-3 md:hidden">“Roadcraft Professionals For All Categories Of Driving”</div>
        <div className="w-full flex justify-end pl-[110px] md:pl-[140px]">
          <div className="flex w-full text-black p-3 flex items-center justify-end gap-3">

            <div className="flex italic hidden md:block flex-grow text-center">“Roadcraft Professionals For All Categories Of Driving”</div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex md:items-center space-y-2 flex-wrap justify-end">
                  <span className="text-sm">Welcome, {user?.first_name}</span>
                  <div className="inline-block">
                    <Link href="/bookings" className="ml-3 text-sm inline-block px-2 py-1 min-w-[75px] bg-red-600 text-center text-white rounded-tl-lg rounded-br-lg hover:bg-blue-600 text-nowrap border border-red-600 hover:border-blue-600">Book Online Now</Link>
                  </div>
                  <Link href="/dashboard" className="ml-3 text-sm border border-blue-600 px-2 py-1 min-w-[75px] border-solid text-center hover:bg-blue-600 hover:text-white">Dashboard</Link>
                  <button onClick={logout} className="ml-3 text-sm mb-2 border border-blue-600 px-2 py-1 min-w-[75px] border-solid text-center hover:bg-blue-600 hover:text-white">Logout</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-blue-600 text-sm flex-wrap md:flex-nowrap justify-end">
                  <div className="inline-block">
                  <Link href="/bookings" className="px-2 py-1 min-w-[75px] bg-red-600 text-center text-white rounded-tl-lg rounded-br-lg hover:bg-blue-600 text-nowrap border border-red-600 hover:border-blue-600">Book Online Now</Link>
                  </div>
                  <Link href="/contactus" className="border border-blue-600 px-2 py-1 min-w-[75px] border-solid text-center hover:bg-blue-600 hover:text-white">Enquiry</Link>
                  <Link href="/auth/login" className="border border-blue-600 px-2 py-1 min-w-[75px] border-solid text-center hover:bg-blue-600 hover:text-white">Login</Link>
                  <Link href="/auth/register" className="border border-blue-600 px-2 py-1 min-w-[75px] border-solid text-center hover:bg-blue-600 hover:text-white">Sign Up</Link>
                </div>
              )}
            </div>

        </div>
      </div>

      {/* Main navigation */}
      <div className="w-full px-3 ">
        <div className="flex justify-end lg:justify-between items-center pt-0 pb-2 md:py-4 pl-[130px]">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 absolute max-w-[100px] md:max-w-[125px] top-[50px] md:top-2 left-2 xl:left-6">
            <Image
            src="/logo.png"
            alt="Logo"
            width={125}
            height={130}
            priority
          />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center overflow-visible">
            <HtmlNavigation className="overflow-visible relative z-50">
              {hierarchicalMenu
                ?.sort((a: any, b: any) => a.weight - b.weight)
                ?.map((page: any) => renderMenuItem(page, 0)) || (
                  // Fallback static menu if API fails
                  <>
                    <HtmlNavigationItem>
                      <HtmlNavigationLink href="/">
                        Home
                      </HtmlNavigationLink>
                    </HtmlNavigationItem>
                    <HtmlNavigationItem>
                      <HtmlNavigationLink href="/courses">
                        Courses
                      </HtmlNavigationLink>
                    </HtmlNavigationItem>
                    <HtmlNavigationItem>
                      <HtmlNavigationLink href="/locations">
                        Locations
                      </HtmlNavigationLink>
                    </HtmlNavigationItem>
                    <HtmlNavigationItem>
                      <HtmlNavigationLink href="/contact">
                        Contact
                      </HtmlNavigationLink>
                    </HtmlNavigationItem>
                  </>
                )}
            </HtmlNavigation>
          </div>

          {/* Search Button */}
          <div className="inline-block flex-shrink-0 ml-2">
            {/* Render Search directly (avoid nesting a <button> inside the Button component) */}
            <Search />
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 ml-2 flex-shrink-0  cursor-pointer text-red-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <HtmlMobileNavigation isOpen={isMenuOpen}>
          {hierarchicalMenu
            ?.sort((a: any, b: any) => a.weight - b.weight)
            ?.map((page: any) => (
              <HtmlMobileNavigationItem
                key={page.id}
                item={page}
                level={0}
                onClose={() => setIsMenuOpen(false)}
              />
            )) || (
              // Fallback static menu
              <>
                <Link href="/" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
                <Link href="/courses" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Courses</Link>
                <Link href="/locations" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Locations</Link>
                <Link href="/contact" className="py-2 hover:text-blue-600" onClick={() => setIsMenuOpen(false)}>Contact</Link>
              </>
            )}

          {/* Find a "Book" or "Booking" page for the CTA button */}
          {completeMenuData?.menuData?.pages?.find((page: any) => page.slug.includes('booking') || page.link_title.toLowerCase().includes('book')) && (
            <Button asChild className="w-fit">
              <Link
                href={getPageUrl(
                  completeMenuData?.menuData.pages.find((page: any) =>
                    page.slug.includes('booking') || page.link_title.toLowerCase().includes('book')
                  )?.slug || 'booking'
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Book Your Course
              </Link>
            </Button>
          )}
        </HtmlMobileNavigation>
      </div>
      </div>
    </header>
  );
}
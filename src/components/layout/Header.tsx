// components/layout/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { useAuthStore } from '@/store/auth';
import { cmsApi } from '@/services/api';
import { MenuPage, Page } from '@/types';
import { Menu, X, Phone, Mail, MapPin } from 'lucide-react';

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

// Mobile Menu Item Component with collapsible sub-menus
function MobileMenuItem({ item, level, onClose }: { item: MenuPage; level: number; onClose: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  
  const levelStyles = {
    0: "font-medium text-gray-900",
    1: "text-sm text-gray-700 ml-4",
    2: "text-xs text-gray-600 ml-8", 
    3: "text-xs text-gray-500 ml-12"
  };
  
  const borderStyles = {
    0: "",
    1: "border-l-2 border-gray-200 pl-3",
    2: "border-l border-gray-300 pl-2",
    3: "border-l border-gray-400 pl-2"
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <Link 
          href={getPageUrl(item.slug)} 
          className={`py-2 hover:text-blue-600 block flex-1 ${levelStyles[level as keyof typeof levelStyles] || levelStyles[3]} ${borderStyles[level as keyof typeof borderStyles] || borderStyles[3]}`}
          onClick={onClose}
        >
          {item.link_title}
        </Link>
        
        {/* Expand/Collapse button for items with children */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600"
            aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
          >
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Collapsible children */}
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => (
            <MobileMenuItem 
              key={child.id} 
              item={child} 
              level={level + 1} 
              onClose={onClose} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

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
    buildCompleteMenuHierarchy(
      completeMenuData.menuData.pages, 
      completeMenuData.menuData.footer_pages, 
      completeMenuData.menuData.featured_services,
      completeMenuData.allPages
    ) : [];

  // Debug log (remove in production)
  if (typeof window !== 'undefined' && hierarchicalMenu.length > 0) {
    console.log('📋 Menu loaded:', hierarchicalMenu.length, 'main items');
    hierarchicalMenu.slice(0, 2).forEach(item => {
      console.log(`- ${item.link_title}: ${item.children?.length || 0} children`);
    });
  }

  return (
    <header className="bg-white shadow-sm relative z-40">
      {/* Top bar */}
      <div className="bg-blue-900 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>0800 848 8418</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>info@1stopinstruction.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span>Welcome, {user?.first_name}</span>
                  <Link href="/dashboard" className="hover:underline">Dashboard</Link>
                  <button onClick={logout} className="hover:underline">Logout</button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/login" className="hover:underline">Login</Link>
                  <Link href="/auth/register" className="hover:underline">Register</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4 relative">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold text-blue-900">
              1Stop Instruction
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-1 justify-center max-w-4xl mx-8 overflow-visible">
            <NavigationMenu className="overflow-visible">
              <NavigationMenuList className="relative z-50 flex space-x-1 overflow-visible">
              {hierarchicalMenu
                ?.sort((a, b) => a.weight - b.weight)
                ?.map((page) => (
                  <NavigationMenuItem key={page.id}>
                    {page.children && page.children.length > 0 ? (
                      <>
                        <NavigationMenuTrigger>
                          {page.link_title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="p-4 md:p-6 min-w-[500px] max-w-[800px] w-max overflow-visible">
                            <div className="grid gap-2 overflow-visible">
                              {page.children?.slice(0, 8).map((child) => (
                                <div key={child.id} className="group relative overflow-visible">
                                  {/* Level 2: Sub-menu item */}
                                  <Link 
                                    href={getPageUrl(child.slug)} 
                                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
                                    onMouseEnter={(e) => {
                                      // Trigger positioning for level 3 menu
                                      const level3Menu = e.currentTarget.parentElement?.querySelector('.level-3-menu') as HTMLElement;
                                      if (level3Menu) {
                                        const parentRect = e.currentTarget.getBoundingClientRect();
                                        const viewportWidth = window.innerWidth;
                                        let leftPos = parentRect.right + 4;
                                        
                                        if (leftPos + 320 > viewportWidth - 20) {
                                          leftPos = parentRect.left - 324;
                                        }
                                        
                                        level3Menu.style.left = Math.max(20, leftPos) + 'px';
                                        level3Menu.style.top = parentRect.top + 'px';
                                      }
                                    }}
                                  >
                                    <div>
                                      <div className="font-medium text-gray-900 text-sm">{child.link_title}</div>
                                      {child.page_title !== child.link_title && (
                                        <div className="text-xs text-gray-500 mt-1">{child.page_title}</div>
                                      )}
                                    </div>
                                    
                                    {/* Indicator for items with children */}
                                    {child.children && child.children.length > 0 && (
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    )}
                                  </Link>
                                  
                                  {/* Level 3: Sub-sub menu (hover overlay) - Fixed positioning to break overflow */}
                                  {child.children && child.children.length > 0 && (
                                    <div 
                                      className="level-3-menu fixed w-80 bg-white rounded-lg shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[9999]" 
                                      style={{ 
                                        left: '0px',
                                        top: '0px'
                                      }}
                                      onMouseEnter={(e) => {
                                        // Calculate position relative to the parent element
                                        const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                        const viewportWidth = window.innerWidth;
                                        if (parentRect) {
                                          let leftPos = parentRect.right + 4;
                                          
                                          // Check if menu would overflow right edge
                                          if (leftPos + 320 > viewportWidth - 20) {
                                            leftPos = parentRect.left - 324; // Position to left of parent
                                          }
                                          
                                          e.currentTarget.style.left = Math.max(20, leftPos) + 'px';
                                          e.currentTarget.style.top = parentRect.top + 'px';
                                        }
                                      }}
                                    >
                                      {/* Hover bridge to maintain connection */}
                                      <div className="absolute right-full top-0 w-2 h-full bg-transparent"></div>
                                      <div className="absolute left-full top-0 w-2 h-full bg-transparent"></div>
                                      
                                      <div className="p-4">
                                        <div className="font-semibold text-sm text-blue-600 border-b border-gray-100 pb-2 mb-3">
                                          {child.link_title}
                                        </div>
                                        <div className="space-y-1 max-h-96 overflow-y-auto">
                                          {child.children.slice(0, 15).map((grandChild) => (
                                            <div key={grandChild.id} className="group/nested relative">
                                              <Link
                                                href={getPageUrl(grandChild.slug)}
                                                className="flex items-center justify-between py-2 px-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                onMouseEnter={(e) => {
                                                  // Trigger positioning for level 4 menu
                                                  const level4Menu = e.currentTarget.parentElement?.querySelector('.level-4-menu') as HTMLElement;
                                                  if (level4Menu) {
                                                    const parentRect = e.currentTarget.getBoundingClientRect();
                                                    const viewportWidth = window.innerWidth;
                                                    let leftPos = parentRect.right + 6;
                                                    
                                                    if (leftPos + 288 > viewportWidth - 20) {
                                                      leftPos = parentRect.left - 294;
                                                    }
                                                    
                                                    level4Menu.style.left = Math.max(20, leftPos) + 'px';
                                                    level4Menu.style.top = parentRect.top + 'px';
                                                  }
                                                }}
                                              >
                                                <span className="truncate pr-2">{grandChild.link_title}</span>
                                                {grandChild.children && grandChild.children.length > 0 && (
                                                  <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                  </svg>
                                                )}
                                              </Link>
                                              
                                              {/* Level 4: Triple nested menu - Fixed positioning */}
                                              {grandChild.children && grandChild.children.length > 0 && (
                                                <div 
                                                  className="level-4-menu fixed w-72 bg-white rounded-lg shadow-2xl border border-gray-200 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-300 z-[9998]" 
                                                  style={{ 
                                                    left: '0px',
                                                    top: '0px'
                                                  }}
                                                  onMouseEnter={(e) => {
                                                    // Calculate position relative to the parent element
                                                    const parentRect = e.currentTarget.parentElement?.getBoundingClientRect();
                                                    const viewportWidth = window.innerWidth;
                                                    if (parentRect) {
                                                      let leftPos = parentRect.right + 6;
                                                      
                                                      // Check if menu would overflow right edge
                                                      if (leftPos + 288 > viewportWidth - 20) {
                                                        leftPos = parentRect.left - 294; // Position to left of parent
                                                      }
                                                      
                                                      e.currentTarget.style.left = Math.max(20, leftPos) + 'px';
                                                      e.currentTarget.style.top = parentRect.top + 'px';
                                                    }
                                                  }}
                                                >
                                                  <div className="p-3">
                                                    <div className="font-medium text-xs text-gray-500 uppercase tracking-wide mb-2 border-b border-gray-100 pb-1">
                                                      {grandChild.link_title}
                                                    </div>
                                                    <div className="space-y-1 max-h-72 overflow-y-auto">
                                                      {grandChild.children.slice(0, 12).map((greatGrandChild) => (
                                                        <Link
                                                          key={greatGrandChild.id}
                                                          href={getPageUrl(greatGrandChild.slug)}
                                                          className="block py-1.5 px-2 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                        >
                                                          <span className="truncate">{greatGrandChild.link_title}</span>
                                                        </Link>
                                                      ))}
                                                      {grandChild.children && grandChild.children.length > 12 && (
                                                        <div className="text-center py-1 text-xs text-gray-400">
                                                          +{grandChild.children.length - 12} more
                                                        </div>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                        
                                        {/* "View All" link if there are more items */}
                                        {child.children.length > 15 && (
                                          <Link
                                            href={getPageUrl(child.slug)}
                                            className="block text-center py-2 mt-3 text-sm text-blue-600 hover:text-blue-700 border-t border-gray-100 pt-3"
                                          >
                                            View All {child.link_title} ({child.children.length})
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              {/* "View All" link for main category if there are more items */}
                              {page.children && page.children.length > 8 && (
                                <Link
                                  href={getPageUrl(page.slug)}
                                  className="block text-center py-3 mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 border-t border-gray-100 pt-3"
                                >
                                  View All {page.link_title} ({page.children.length})
                                </Link>
                              )}
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link 
                          href={getPageUrl(page.slug)} 
                          className="px-4 py-2 hover:text-blue-600"
                        >
                          {page.link_title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                )) || (
                  // Fallback static menu if API fails
                  <>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/" className="px-4 py-2 hover:text-blue-600">
                          Home
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/courses" className="px-4 py-2 hover:text-blue-600">
                          Courses
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/locations" className="px-4 py-2 hover:text-blue-600">
                          Locations
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild>
                        <Link href="/contact" className="px-4 py-2 hover:text-blue-600">
                          Contact
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block flex-shrink-0">
            <Button asChild>
              <Link 
                href={
                  completeMenuData?.menuData?.pages?.find(page => 
                    page.slug.includes('booking') || page.link_title.toLowerCase().includes('book')
                  )?.slug ? 
                  getPageUrl(completeMenuData.menuData.pages.find(page => 
                    page.slug.includes('booking') || page.link_title.toLowerCase().includes('book')
                  )!.slug) : 
                  '/booking'
                }
              >
                Book Your Course
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 ml-2 flex-shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t max-h-[70vh] overflow-y-auto bg-white shadow-lg">
            <nav className="flex flex-col space-y-2">
              {hierarchicalMenu
                ?.sort((a, b) => a.weight - b.weight)
                ?.map((page) => (
                  <MobileMenuItem 
                    key={page.id} 
                    item={page} 
                    level={0} 
                    onClose={() => setIsMenuOpen(false)} 
                  />
                )) || (
                  // Fallback static menu
                  <>
                    <Link href="/" className="py-2 hover:text-blue-600">Home</Link>
                    <Link href="/courses" className="py-2 hover:text-blue-600">Courses</Link>
                    <Link href="/locations" className="py-2 hover:text-blue-600">Locations</Link>
                    <Link href="/contact" className="py-2 hover:text-blue-600">Contact</Link>
                  </>
                )}
              
              {/* Find a "Book" or "Booking" page for the CTA button */}
              {completeMenuData?.menuData?.pages?.find(page => page.slug.includes('booking') || page.link_title.toLowerCase().includes('book')) && (
                <Button asChild className="w-fit">
                  <Link 
                    href={getPageUrl(
                      completeMenuData?.menuData.pages.find(page => 
                        page.slug.includes('booking') || page.link_title.toLowerCase().includes('book')
                      )?.slug || 'booking'
                    )}
                  >
                    Book Your Course
                  </Link>
                </Button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
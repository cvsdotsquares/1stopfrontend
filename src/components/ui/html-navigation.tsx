'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  className?: string;
  children: React.ReactNode;
}

interface NavigationItemProps {
  className?: string;
  children: React.ReactNode;
  hasDropdown?: boolean;
}

interface NavigationLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

interface NavigationDropdownProps {
  className?: string;
  children: React.ReactNode;
  isOpen: boolean;
}

// Main Navigation Container
export function HtmlNavigation({ className, children }: NavigationProps) {
  const navRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const navItemSelector = '[class~="group/item"], [class~="group/nested"]';
    const dropdownSelector = ':scope > .absolute';

    const getDropdown = (navItem: Element) => navItem.querySelector<HTMLElement>(dropdownSelector);

    const isDropdownOpen = (dropdown: HTMLElement) => {
      if (dropdown.classList.contains('hidden')) {
        return false;
      }

      return !dropdown.classList.contains('invisible');
    };

    const closeDropdown = (dropdown: HTMLElement) => {
      if (dropdown.className.includes('group-hover/item:block')) {
        dropdown.classList.add('hidden');
      }

      if (dropdown.classList.contains('invisible') || dropdown.className.includes('group-hover/nested:visible')) {
        dropdown.classList.remove('visible', 'opacity-100');
        dropdown.classList.add('invisible', 'opacity-0');
      }
    };

    const openDropdown = (dropdown: HTMLElement) => {
      if (dropdown.className.includes('group-hover/item:block')) {
        dropdown.classList.remove('hidden');
      }

      if (dropdown.classList.contains('invisible') || dropdown.className.includes('group-hover/nested:visible')) {
        dropdown.classList.remove('invisible', 'opacity-0');
        dropdown.classList.add('visible', 'opacity-100');
      }
    };

    const closeSiblingDropdowns = (navItem: Element, currentDropdown: HTMLElement) => {
      const parentContainer = navItem.parentElement;
      if (!parentContainer) {
        return;
      }

      Array.from(parentContainer.children).forEach((sibling) => {
        if (sibling === navItem || !(sibling instanceof HTMLElement)) {
          return;
        }

        if (!sibling.matches(navItemSelector)) {
          return;
        }

        const siblingDropdown = getDropdown(sibling);
        if (siblingDropdown && siblingDropdown !== currentDropdown) {
          closeDropdown(siblingDropdown);
        }
      });
    };

    const closeAllDropdowns = () => {
      // Add 'hidden' class to all dropdowns inside li.relative.group/item
      document.querySelectorAll('li.relative.group\\/item > .absolute').forEach((dropdown) => {
        if (dropdown instanceof HTMLElement) {
          dropdown.classList.add('hidden');
        }
      });
    };

    const handleMenuToggleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const icon = target.closest('.menu-toggle-icon, .menu-toggle-nested-icon');

      if (!icon) return;

      e.preventDefault();
      e.stopPropagation();

      const navItem = icon.closest(navItemSelector);
      if (!navItem) return;

      const dropdown = getDropdown(navItem);
      if (!dropdown) return;

      closeSiblingDropdowns(navItem, dropdown);

      if (isDropdownOpen(dropdown)) {
        closeDropdown(dropdown);
      } else {
        openDropdown(dropdown);
      }
    };

    const handleClickOutside = (e: Event) => {
      const target = e.target as HTMLElement;
      const clickedInsideNav = Boolean(navRef.current?.contains(target));

      if (!clickedInsideNav) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('click', handleMenuToggleClick, true);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleMenuToggleClick, true);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <nav ref={navRef} className={cn("relative flex max-w-max flex-1 items-center justify-center", className)}>
      <ul className="group flex flex-1 list-none items-center justify-center lg:gap-1 xl:gap-1">
        {children}
      </ul>
    </nav>
  );
}

// Navigation Item (can have dropdown)
export function HtmlNavigationItem({ className, children, hasDropdown = false }: NavigationItemProps) {
  return (
    <li
      className={cn("relative", hasDropdown && "group/item", className)}
    >
      {children}
    </li>
  );
}

// Navigation Link/Trigger
export function HtmlNavigationLink({ href, className, children, onClick }: NavigationLinkProps) {
  return (
    <Link
      href={href}
      className={cn("text-black text-sm xl:text-base hover:text-white hover:bg-blue-600 px-4 py-3 rounded-md", className)}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

// Navigation Trigger (for dropdown items)
export function HtmlNavigationTrigger({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button className={cn("inline-flex items-center justify-center text-sm xl:text-base text-black hover:text-red-600", className)}>
      {children}
      <span className="menu-toggle-icon">
        <ChevronDownIcon
          className="relative top-[1px] ml-1 size-3 transition-transform duration-300 group-hover/item:rotate-180"
          aria-hidden="true"
        />
      </span>
    </button>
  );
}

// Navigation Link with Dropdown (clickable link + dropdown)
export function HtmlNavigationLinkWithDropdown({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center justify-center text-sm xl:text-base text-black hover:text-white hover:bg-blue-600 px-4 py-3 rounded-md", className)}
    >
      {children}
      <span className="menu-toggle-icon">
        <ChevronDownIcon
          className="relative top-[1px] ml-1 size-3 transition-transform duration-300 group-hover/item:rotate-180"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}

// Navigation Dropdown Content
export function HtmlNavigationDropdown({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "absolute top-full left-0 min-w-[320px] max-w-[320px] p-4",
        "bg-white border border-gray-200 rounded-md shadow-lg z-[9999]",
        "hidden group-hover/item:block @media(hover:none):block",
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile Navigation (for mobile menu)
export const HtmlMobileNavigation = React.forwardRef<HTMLDivElement, { className?: string; children: React.ReactNode; isOpen: boolean }>(
  function HtmlMobileNavigation({ className, children, isOpen }, ref) {
    const innerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (innerRef.current && !innerRef.current.contains(e.target as Node)) {
          innerRef.current.dispatchEvent(new CustomEvent('collapse-all', { bubbles: false }));
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
      <div
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        className={cn(
          "lg:hidden py-4 border-t max-h-[70vh] overflow-y-auto bg-white shadow-lg transition-all duration-300",
          isOpen ? "block" : "hidden",
          className
        )}
      >
        <nav className="flex flex-col space-y-2">
          {children}
        </nav>
      </div>
    );
  }
);

// Mobile Navigation Item
export function HtmlMobileNavigationItem({
  item,
  level = 0,
  onClose,
}: {
  item: any;
  level?: number;
  onClose: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const itemRef = useRef<HTMLDivElement>(null);
  const title = item?.link_title || item?.page_title;
  const slug = item?.slug || item?.page_slug;

  useEffect(() => {
    if (level !== 0) return;
    const nav = itemRef.current?.closest('nav')?.parentElement;
    if (!nav) return;
    const handler = () => setIsExpanded(false);
    nav.addEventListener('collapse-all', handler);
    return () => nav.removeEventListener('collapse-all', handler);
  }, [level]);

  if (!item || !title) return null;

  const levelStyles = {
    0: "font-medium text-gray-900",
    1: "text-sm text-gray-700 ml-4",
    2: "text-xs text-gray-600 ml-8",
    3: "text-xs text-gray-500 ml-12"
  };

  const borderStyles = {
    0: "",
    1: "lg:border-l-2 border-gray-200 pl-3",
    2: "lg:border-l border-gray-300 pl-2",
    3: "lg:border-l border-gray-400 pl-2"
  };

  return (
    <div ref={itemRef}>
      <div className="flex items-center justify-between">
        <Link
          href={slug ? `/${slug}` : '#'}
          className={cn(
            "py-2 hover:text-blue-600 block flex-1",
            levelStyles[level as keyof typeof levelStyles] || levelStyles[3],
            borderStyles[level as keyof typeof borderStyles] || borderStyles[3]
          )}
          onClick={onClose}
        >
          {title}
        </Link>

        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-gray-600"
            aria-label={isExpanded ? 'Collapse menu' : 'Expand menu'}
          >
            <svg
              className={cn("w-4 h-4 transition-transform duration-200", isExpanded && "rotate-90")}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child: any) => (
            <HtmlMobileNavigationItem
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
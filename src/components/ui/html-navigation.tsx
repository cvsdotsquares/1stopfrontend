'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  return (
    <nav className={cn("relative flex max-w-max flex-1 items-center justify-center", className)}>
      <ul className="group flex flex-1 list-none items-center justify-center lg:gap-3 xl:gap-6">
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
      className={cn("text-black text-sm xl:text-base hover:text-red-600", className)}
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
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition-transform duration-300 group-hover/item:rotate-180"
        aria-hidden="true"
      />
    </button>
  );
}

// Navigation Dropdown Content
export function HtmlNavigationDropdown({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div 
      className={cn(
        "absolute top-full left-0 min-w-[320px] max-w-[320px] p-4",
        "bg-white border border-gray-200 rounded-md shadow-lg z-[9999]",
        "hidden group-hover/item:block",
        className
      )}
    >
      {children}
    </div>
  );
}

// Mobile Navigation (for mobile menu)
export function HtmlMobileNavigation({ className, children, isOpen }: { className?: string; children: React.ReactNode; isOpen: boolean }) {
  return (
    <div className={cn(
      "lg:hidden py-4 border-t max-h-[70vh] overflow-y-auto bg-white shadow-lg transition-all duration-300",
      isOpen ? "block" : "hidden",
      className
    )}>
      <nav className="flex flex-col space-y-2">
        {children}
      </nav>
    </div>
  );
}

// Mobile Navigation Item
export function HtmlMobileNavigationItem({ 
  item, 
  level = 0, 
  onClose 
}: { 
  item: any; 
  level?: number; 
  onClose: () => void;
}) {
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
          href={`/${item.slug}`}
          className={cn(
            "py-2 hover:text-blue-600 block flex-1",
            levelStyles[level as keyof typeof levelStyles] || levelStyles[3],
            borderStyles[level as keyof typeof borderStyles] || borderStyles[3]
          )}
          onClick={onClose}
        >
          {item.link_title}
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
'use client';

import { useQuery } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface PageData {
  id: number;
  page_title: string;
  slug: string;
  page_content: string;
  meta_title?: string;
  meta_keyword?: string;
  meta_desc?: string;
  is_parent: number;
  parent_level: number;
  link_title?: string;
  banner_type: number;
  overlay_caption: number;
  overlay_caption_text?: string;
  carousel_static_image?: string;
  carousel_static_caption?: string;
  featured_service: number;
  featured_icon?: string;
  created: string;
  updated: string;
  relatedPages?: Array<{
    id: number;
    page_title: string;
    slug: string;
    link_title?: string;
    content_preview: string;
    featured_icon?: string;
  }>;
  navigation?: {
    prev: {
      id: number;
      page_title: string;
      slug: string;
      link_title?: string;
    } | null;
    next: {
      id: number;
      page_title: string;
      slug: string;
      link_title?: string;
    } | null;
  };
  meta: {
    title: string;
    description: string;
    keywords?: string;
    canonical: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
  };
}

interface ApiResponse {
  success: boolean;
  data: PageData;
  message?: string;
}

// Hook to fetch page data by slug
export function usePageBySlug(slug: string, options?: { enabled?: boolean }) {
  return useQuery<PageData>({
    queryKey: ['page', 'slug', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required');
      
      const response = await fetch(`${API_BASE}/cms/page/slug/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Page not found');
        }
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch page data');
      }
      
      return result.data;
    },
    enabled: options?.enabled !== false && Boolean(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error.message === 'Page not found') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to fetch page data by ID
export function usePageById(id: number, options?: { enabled?: boolean }) {
  return useQuery<PageData>({
    queryKey: ['page', 'id', id],
    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      
      const response = await fetch(`${API_BASE}/cms/pages/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Page not found');
        }
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch page data');
      }
      
      return result.data;
    },
    enabled: options?.enabled !== false && Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors
      if (error.message === 'Page not found') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Hook to fetch multiple pages (for listings, etc.)
export function usePages(params?: {
  page?: number;
  limit?: number;
  search?: string;
  parent_id?: number;
  featured?: boolean;
}) {
  const searchParams = new URLSearchParams();
  
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.parent_id) searchParams.set('parent_id', params.parent_id.toString());
  if (params?.featured) searchParams.set('featured', 'true');
  
  return useQuery({
    queryKey: ['pages', params],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/cms/pages?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pages: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch pages');
      }
      
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
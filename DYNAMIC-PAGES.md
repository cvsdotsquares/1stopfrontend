# Dynamic CMS Page System

This system allows the frontend to dynamically render pages based on slugs from the CMS API. It includes SEO optimization, proper metadata handling, and responsive design.

## 🚀 Features

- **Dynamic Routing**: Pages are generated based on CMS slugs using Next.js App Router
- **SEO Optimization**: Full metadata support including Open Graph and Twitter Cards
- **Static Generation**: Pages can be statically generated for better performance
- **Error Handling**: Custom 404 pages and error boundaries
- **Related Content**: Automatic display of related pages and navigation
- **Responsive Design**: Mobile-first responsive layout
- **Content Styling**: Automatic styling for HTML content from CMS
- **Loading States**: Beautiful loading animations and skeletons

## 📁 File Structure

```
src/
├── app/
│   └── [slug]/
│       ├── page.tsx           # Main dynamic page component
│       └── not-found.tsx      # Custom 404 page
├── components/
│   └── cms/
│       ├── PageContent.tsx    # HTML content renderer
│       ├── Breadcrumbs.tsx    # Breadcrumb navigation
│       ├── RelatedPages.tsx   # Related pages sidebar
│       └── ClientPageRenderer.tsx # Client-side page renderer
└── hooks/
    └── usePage.ts             # React Query hooks for page data
```

## 🛠 Usage

### Server-Side Rendering (Recommended)

The main dynamic page at `app/[slug]/page.tsx` handles server-side rendering with full SEO support:

```typescript
// Automatic routing: /home, /contactus.php, /faq, etc.
// URL: http://localhost:3001/home
```

### Client-Side Rendering

For dynamic client-side rendering, use the hooks and components:

```typescript
import { usePageBySlug } from '@/hooks/usePage';
import ClientPageRenderer from '@/components/cms/ClientPageRenderer';

function MyPage() {
  return <ClientPageRenderer slug="home" />;
}
```

### Custom Page Implementation

```typescript
import { usePageBySlug } from '@/hooks/usePage';
import PageContent from '@/components/cms/PageContent';

function CustomPage({ slug }: { slug: string }) {
  const { data, isLoading, error } = usePageBySlug(slug);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      <h1>{data.page_title}</h1>
      <PageContent content={data.page_content} />
    </div>
  );
}
```

## 🎨 Components

### PageContent Component
Renders HTML content from CMS with automatic styling:
- Responsive images with lazy loading
- Styled headings, paragraphs, lists
- Table formatting with responsive containers
- Code syntax highlighting
- Form element styling

### Breadcrumbs Component
Displays navigation breadcrumbs:
- Automatic hierarchy detection
- Custom breadcrumb support
- Responsive design

### RelatedPages Component
Shows related content in sidebar:
- Automatic related page detection
- Preview content with HTML stripping
- Featured icons support

## 🔧 API Integration

The system integrates with these API endpoints:

```
GET /api/cms/page/slug/{slug}    # Get page by slug
GET /api/cms/pages/{id}          # Get page by ID  
GET /api/cms/pages               # Get multiple pages
```

### Response Format

```typescript
{
  success: true,
  data: {
    id: number;
    page_title: string;
    slug: string;
    page_content: string;
    meta_title?: string;
    meta_desc?: string;
    meta_keyword?: string;
    // ... other fields
    relatedPages: Array<RelatedPage>;
    navigation: {
      prev: PageLink | null;
      next: PageLink | null;
    };
    meta: {
      title: string;
      description: string;
      canonical: string;
      ogTitle: string;
      ogDescription: string;
      ogImage?: string;
    };
  }
}
```

## 🚦 SEO Features

### Automatic Metadata Generation
- Dynamic titles and descriptions
- Open Graph tags for social sharing
- Twitter Card support
- Canonical URLs
- Schema.org structured data ready

### Static Generation
Pages are automatically statically generated for better performance:

```typescript
// generateStaticParams() fetches common pages
// ISR revalidation every 5 minutes
export const revalidate = 300;
```

## 🎯 Available Slugs

Test with these existing slugs:

### Main Pages
- `home` - Homepage
- `contactus.php` - Contact page
- `faq` - FAQ page
- `testimonials-reviews.php` - Testimonials

### Course Pages
- `cbt-compulsory-basic-training.php` - CBT Training
- `east-london/motorbike/motorcycle-training...` - Motorcycle training
- `east-london/lgv/hgv-lorry-licence-training...` - LGV Training

### Location Pages
- `east-london/motorbike/cbt-training-test-moped...` - East London CBT
- `north-london/motorbike/cbt-training-test-moped...` - North London CBT

## 🔧 Configuration

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Tailwind CSS
Line-clamp utilities are included in `globals.css`:
```css
.line-clamp-1, .line-clamp-2, .line-clamp-3
```

## 🚀 Performance

### Optimization Features
- **ISR (Incremental Static Regeneration)**: 5-minute revalidation
- **React Query Caching**: 5-minute stale time
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic component splitting
- **Prefetching**: Link prefetching for navigation

### Loading Performance
- Server-side rendering for initial load
- Client-side navigation for subsequent pages
- Skeleton loading states
- Error boundaries with retry functionality

## 🎨 Styling

### Responsive Design
- Mobile-first approach
- Flexbox and Grid layouts
- Container queries support
- Touch-friendly interactions

### Content Styling
HTML content from CMS is automatically styled with:
- Typography scales (h1-h6, p, lists)
- Component styling (tables, forms, buttons)
- Interactive elements (links, hover states)
- Accessibility considerations (focus states, ARIA)

## 🔍 Testing

### Test URLs
```bash
# Working pages
http://localhost:3001/home
http://localhost:3001/contactus.php
http://localhost:3001/faq
http://localhost:3001/testimonials-reviews.php

# Non-existent page (404)
http://localhost:3001/about-us
```

### Browser Testing
1. Open Simple Browser in VS Code
2. Navigate to test URLs
3. Check SEO metadata in page source
4. Test responsive design with device emulation
5. Verify loading states and error handling

## 📱 Mobile Support

- Responsive navigation
- Touch-friendly interface
- Optimized image loading
- Mobile-first CSS
- PWA-ready structure

## 🛡 Error Handling

### 404 Pages
Custom not-found page with:
- Helpful error messages
- Quick navigation links
- Contact information
- Popular page suggestions

### Error Recovery
- Automatic retry for network errors
- Graceful degradation for missing data
- User-friendly error messages
- Fallback content when appropriate

This system provides a complete solution for dynamic CMS-driven pages with modern web standards and excellent user experience.
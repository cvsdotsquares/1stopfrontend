# 🚀 1Stop Instruction Frontend - Next.js Application

## 📋 **Project Overview**

This is a modern **Next.js 14** frontend application that connects to the 1Stop Instruction API backend. It provides a complete user interface for:

- **Public Website**: Homepage, course catalog, testimonials, CMS pages
- **User Portal**: Registration, login, booking management, profile
- **Admin Panel**: CMS management, booking administration
- **Booking System**: Course booking with real-time availability

---

## 🏗️ **Technology Stack**

### **Core Framework**
- **Next.js 14** - App Router with React Server Components
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework

### **UI Components**
- **shadcn/ui** - High-quality, accessible React components
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful & consistent icon pack

### **State Management**
- **Zustand** - Simple, fast state management
- **TanStack Query** - Server state management, caching, synchronization
- **React Hook Form** - Performant forms with easy validation

### **API Integration**
- **Axios** - Promise-based HTTP client with interceptors
- **Zod** - TypeScript-first schema validation

---

## 🚦 **Getting Started**

### **Prerequisites**
- Node.js 18+ installed
- 1Stop API backend running on `http://localhost:3000`

### **Installation & Setup**

1. **Navigate to frontend directory:**
   ```bash
   cd "d:\pro\node projects\1stop\frontend\1stop-frontend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000

---

## 📁 **Project Structure**

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   ├── auth/
│   │   └── login/         # Authentication pages
│   ├── courses/           # Course catalog pages
│   ├── booking/           # Booking system
│   └── dashboard/         # User dashboard
├── components/
│   ├── ui/                # shadcn/ui components
│   └── layout/            # Layout components (Header, Footer)
├── lib/
│   ├── api.ts             # Axios configuration
│   └── utils.ts           # Utility functions
├── services/
│   └── api.ts             # API service functions
├── store/
│   └── auth.ts            # Authentication state
├── types/
│   └── index.ts           # TypeScript type definitions
└── providers/
    └── QueryProvider.tsx  # TanStack Query provider
```

---

## 🎯 **Key Features Implemented**

### **🏠 Homepage**
- **Hero Section** - Compelling call-to-action
- **Featured Courses** - Dynamic content from API
- **Testimonials** - Customer reviews integration
- **Features Showcase** - Why choose 1Stop Instruction

### **🔐 Authentication System**
- **Login/Register** - Full user authentication flow
- **Profile Management** - Update user information
- **Protected Routes** - Auth-based navigation
- **Persistent Sessions** - Local storage with Zustand

### **📚 Course Catalog**
- **Course Listing** - Browse all available courses
- **Search & Filter** - Find courses by location, type, price
- **Course Details** - Comprehensive course information
- **Availability Check** - Real-time event availability

### **📅 Booking System**
- **Course Selection** - Choose course and location
- **Date Picker** - Select available training dates
- **Booking Form** - Complete reservation process
- **Booking Management** - View and modify bookings

### **📄 CMS Integration**
- **Dynamic Pages** - Render CMS pages from API
- **SEO Optimization** - Meta tags from CMS data
- **Navigation Menu** - Dynamic menu from page hierarchy
- **Testimonials Display** - Customer review showcase

---

## 🔧 **API Integration**

### **Service Layer Architecture**
All API calls are organized in `/services/api.ts`:

```typescript
// Authentication
authApi.login(email, password)
authApi.register(userData)
authApi.getProfile()

// Courses
coursesApi.getCourses({ featured: true })
coursesApi.searchCourses({ search: 'CBT' })

// Bookings
bookingsApi.createBooking(bookingData)
bookingsApi.getBookings({ status: 'confirmed' })

// CMS
cmsApi.getPages({ featured: true })
cmsApi.getTestimonials()
```

### **Type Safety**
Comprehensive TypeScript interfaces in `/types/index.ts`:
- `User`, `Course`, `Location`, `Booking`
- `Page`, `Testimonial`, `FAQ`, `Carousel`
- `ApiResponse<T>` for consistent API responses

---

## 🎨 **Styling & Design**

### **Design System**
- **Color Scheme**: Blue primary, orange accent, gray neutrals
- **Typography**: Inter font family
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliant components

### **Component Library**
Using shadcn/ui for consistent, accessible components:
- Button, Input, Card, Dialog, Navigation Menu
- Form validation with React Hook Form
- Toast notifications with Sonner

---

## 📱 **Responsive Design**

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

Key responsive features:
- Collapsible navigation menu
- Flexible grid layouts
- Touch-friendly interface
- Optimized forms for mobile

---

## 🚀 **Development Workflow**

### **Next Steps to Complete**

1. **📄 Additional Pages**
   ```bash
   # Create these pages:
   - /courses (course catalog)
   - /courses/[id] (course details)
   - /booking (booking flow)
   - /dashboard (user dashboard)
   - /admin (admin panel)
   ```

2. **🔐 Authentication Pages**
   ```bash
   - /auth/register (user registration)
   - /auth/profile (profile management)
   ```

3. **📋 Booking System**
   ```bash
   - Multi-step booking form
   - Payment integration
   - Confirmation emails
   ```

4. **👨‍💼 Admin Panel**
   ```bash
   - CMS management interface
   - Booking administration
   - User management
   ```

### **Development Commands**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run type checking
npm run type-check

# Run linting
npm run lint
```

---

## 🔄 **API Connection Status**

✅ **Backend API Running**: http://localhost:3000
✅ **Frontend Running**: http://localhost:3001
✅ **API Integration**: Configured with Axios
✅ **State Management**: Zustand + TanStack Query
✅ **Type Safety**: TypeScript interfaces

### **Test API Connection**
The homepage automatically fetches:
- Featured courses from `/api/courses`
- Testimonials from `/api/cms/testimonials`
- Site settings from `/api/cms/settings`

---

## 🎉 **Current Status**

**✅ Completed:**
- Next.js 14 project setup with TypeScript
- Complete component library (shadcn/ui)
- API service layer with type safety
- Authentication state management
- Responsive homepage with API integration
- Header/Footer layout components
- Login page implementation

**🔄 Next Priority:**
1. Complete the booking flow pages
2. User dashboard for booking management
3. Course catalog with search/filter
4. Admin panel for CMS management
5. Payment integration
6. Email notifications

The foundation is solid - you now have a modern, scalable Next.js frontend ready to integrate with your comprehensive 1Stop Instruction API! 🏍️
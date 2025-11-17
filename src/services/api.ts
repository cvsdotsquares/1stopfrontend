// services/api.ts
import api from '@/lib/api';
import {
  User,
  Course,
  Location,
  CourseEvent,
  Booking,
  Page,
  Testimonial,
  FAQ,
  Carousel,
  SiteSettings,
  MenuData,
  ApiResponse
} from '@/types';

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  register: async (userData: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    date_of_birth?: string;
  }) => {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', userData);
    return response.data.data;
  },

  getProfile: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/profile');
    return response.data.data;
  },

  updateProfile: async (userData: Partial<User>) => {
    const response = await api.put<ApiResponse<User>>('/auth/profile', userData);
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post<ApiResponse<any>>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data.data;
  },
};

// Courses API
export const coursesApi = {
  getCourses: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get<ApiResponse<{ courses: Course[], pagination: any }>>('/courses', { params });
    return response.data.data;
  },

  getFeaturedCourses: async () => {
    const response = await api.get<ApiResponse<Course[]>>('/courses/featured');
    return response.data.data;
  },

  getCourse: async (id: number) => {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data.data;
  },

  searchCourses: async (params: {
    search?: string;
    location_id?: number;
    is_cbt?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<Course[]>>('/courses/search', { params });
    return response.data.data;
  },
};

// Locations API
export const locationsApi = {
  getLocations: async (params?: { limit?: number; with_courses?: boolean }) => {
    const response = await api.get<ApiResponse<Location[]>>('/courses/locations/all', { params });
    return response.data.data;
  },

  getLocation: async (id: number) => {
    const response = await api.get<ApiResponse<Location>>(`/courses/locations/${id}`);
    return response.data.data;
  },

  getLocationsWithCourses: async (params?: { location_name?: string; limit?: number }) => {
    const response = await api.get<ApiResponse<Location[]>>('/courses/locations/with-courses', { params });
    return response.data.data;
  },

  findNearestLocations: async (params: { latitude: number; longitude: number; radius?: number }) => {
    const response = await api.get<ApiResponse<Location[]>>('/courses/locations/nearest', { params });
    return response.data.data;
  },
};

// Course Events API
export const eventsApi = {
  getEvents: async (params?: {
    course_id?: number;
    location_id?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) => {
    const response = await api.get<ApiResponse<CourseEvent[]>>('/courses/events/all', { params });
    return response.data;
  },

  getAvailableDates: async (params: { course_id: number; location_id?: number }) => {
    const response = await api.get<ApiResponse<string[]>>('/courses/events/available-dates', { params });
    return response.data;
  },

  checkAvailability: async (eventId: number) => {
    const response = await api.get<ApiResponse<CourseEvent>>(`/courses/events/check-availability?event_id=${eventId}`);
    return response.data;
  },

  getEvent: async (id: number) => {
    const response = await api.get<ApiResponse<CourseEvent>>(`/courses/events/${id}`);
    return response.data;
  },
};

// Bookings API
export const bookingsApi = {
  createBooking: async (bookingData: {
    course_id: number;
    location_id: number;
    course_event_id: number;
    special_requirements?: string;
  }) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', bookingData);
    return response.data;
  },

  getBookings: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings', { params });
    return response.data;
  },

  getBooking: async (id: number) => {
    const response = await api.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return response.data;
  },

  updateBooking: async (id: number, data: Partial<Booking>) => {
    const response = await api.put<ApiResponse<Booking>>(`/bookings/${id}`, data);
    return response.data;
  },

  cancelBooking: async (id: number, reason?: string) => {
    const response = await api.post<ApiResponse<any>>(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },

  getBookingStats: async () => {
    const response = await api.get<ApiResponse<any>>('/bookings/stats');
    return response.data;
  },
};

// CMS API
export const cmsApi = {
  getPages: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    parent_id?: number;
    featured?: boolean
  }) => {
    const response = await api.get<ApiResponse<Page[]>>('/cms/pages', { params });
    return response.data;
  },

  getPage: async (identifier: string | number) => {
    const response = await api.get<ApiResponse<Page>>(`/cms/pages/${identifier}`);
    return response.data;
  },

  getTestimonials: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get<ApiResponse<Testimonial[]>>('/cms/testimonials', { params });
    return response.data.data;
  },

  createTestimonial: async (data: { review: string; review_name: string }) => {
    const response = await api.post<ApiResponse<Testimonial>>('/cms/testimonials', data);
    return response.data;
  },

  getFAQs: async (params?: { category_id?: number }) => {
    const response = await api.get<ApiResponse<{ faqs: FAQ[]; categories: any[] }>>('/cms/faqs', { params });
    return response.data;
  },

  getCarousels: async () => {
    const response = await api.get<ApiResponse<Carousel[]>>('/cms/carousels');
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get<ApiResponse<SiteSettings>>('/cms/settings');
    return response.data;
  },

  getMenu: async () => {
    const response = await api.get<ApiResponse<MenuData>>('/cms/menu');
    return response.data.data;
  },

  getCompleteMenu: async () => {
    // Get both menu structure and all pages for complete hierarchy
    const [menuResponse, pagesResponse] = await Promise.all([
      api.get<ApiResponse<MenuData>>('/cms/menu'),
      api.get<ApiResponse<Page[]>>('/cms/pages?limit=100')
    ]);

    return {
      menuData: menuResponse.data.data,
      allPages: pagesResponse.data.data
    };
  },
};
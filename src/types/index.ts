// types/index.ts

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postcode?: string;
  created: string;
  updated: string;
}

export interface Course {
  id: number;
  course_name: string;
  course_abb: string;
  description: string;
  description_preview?: string;
  dsa_fees: number;
  default_booking_limit: number;
  is_cbt: number;
  status: string;
  created: string;
  updated: string;
  booking_count?: number;
  available_events?: number;
  // Extended properties for homepage display
  course_description?: string;
  duration?: string;
  price?: number;
  features?: string[];
}

export interface Location {
  id: number;
  location_name: string;
  loc_abb: string;
  address1: string;
  address2?: string;
  postcode: string;
  latitude: number;
  longitude: number;
  status: string;
  available_courses?: number;
  available_events?: number;
  next_event_date?: string;
}

export interface CourseEvent {
  id: number;
  course_id: number;
  location_id: number;
  event_date: string;
  start_time: string;
  end_time: string;
  instructor_id?: number;
  booking_limit: number;
  current_bookings: number;
  available_spaces: number;
  status: number;
  course_name?: string;
  location_name?: string;
}

export interface Booking {
  id: number;
  user_id: number;
  course_id: number;
  location_id: number;
  course_event_id: number;
  booking_date: string;
  special_requirements?: string;
  total_amount: number;
  deposit_amount: number;
  balance_amount: number;
  payment_status: 'pending' | 'paid' | 'partial' | 'refunded';
  booking_status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired';
  created: string;
  updated: string;
  course_name?: string;
  location_name?: string;
  event_date?: string;
  start_time?: string;
}

export interface Page {
  id: number;
  page_title: string;
  slug: string;
  page_content: string;
  internal_css?: string;
  meta_title?: string;
  meta_keyword?: string;
  meta_desc?: string;
  is_parent: number;
  parent_level: number;
  link_title: string;
  banner_type: number;
  overlay_caption: number;
  overlay_caption_text?: string;
  weight: number;
  carousel_static_image?: string;
  carousel_static_caption?: string;
  featured_service: number;
  featured_icon?: string;
  footer_link: number;
  testimonial_display: number;
  featured_display: number;
  accreditation_display: number;
  created: string;
  updated: string;
}

export interface HomepageApiResponse {
  homepage: Page;
  featuredCourses: Course[];
  testimonials: Testimonial[];
  locations: Location[];
  stats: {
    studentsTrained: number;
    passRate: number;
    experienceYears: number;
    instructors: number;
  };
}

export interface Testimonial {
  id: number;
  review: string;
  review_name: string;
  status: number;
  created: string;
}

export interface FAQ {
  id: number;
  faq_title: string;
  content: string;
  category_id: number;
  category_name?: string;
  weight: number;
  status: number;
  created: string;
}

export interface Carousel {
  id: number;
  carousel_banner: string;
  caption: string;
  weight: number;
  created: string;
}

export interface SiteSettings {
  site_contact: string;
  site_email: string;
  facebook_link: string;
  twitter_link: string;
  linkedin_link: string;
  youtube_link: string;
  admin_logo_url: string;
  mobile_logo_url: string;
  vat_rate: number;
  credit_card_surcharge: number;
  paypal_surcharge: number;
}

export interface MenuPage {
  id: number;
  page_title: string;
  slug: string;
  link_title: string;
  is_parent: number;
  parent_level: number;
  weight: number;
  footer_link: number;
  featured_service: number;
  children: MenuPage[];
}

export interface MenuData {
  pages: MenuPage[];
  footer_pages: MenuPage[];
  featured_services: MenuPage[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
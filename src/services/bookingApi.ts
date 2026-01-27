const BASE_URL = 'http://localhost:3000/api/booking';

export interface Course {
  id: number;
  course_name: string;
  course_abb: string;
  description: string;
  duration: string;
  school_one_off_price: number;
  is_cbt: number;
  status: string;
  isVoucher: boolean;
}

export interface Location {
  id: number;
  location_name: string;
  address1: string;
  address2?: string;
  address3?: string;
  address4?: string;
  postcode: string;
  latitude: string;
  longitude: string;
  status: string;
}

export interface CourseEvent {
  date: string;
  available: boolean;
  available_spaces: number;
  booking_limit: number;
  bookings_done: number;
  current_locks: number;
  event_start_time: string;
  event_end_time: string;
  course_event_id: number;
  freeze: number;
}

export interface AvailabilityResponse {
  success: boolean;
  data: {
    course_id: number;
    location_id: number;
    availability: CourseEvent[];
  };
}

export interface VehicleType {
  id: number;
  type_name: string;
  status: number;
}

export interface LicenseType {
  id: number;
  licence_type: string;
  status: number;
}

export interface Settings {
  vat_rate: number;
  credit_card_surcharge: number;
  booking_bcc: string;
}

export interface PromoValidation {
  valid: boolean;
  discount_amount: number;
  discount_type: string;
  description: string;
}

export interface BookingLock {
  lock_id: number;
  expires_at: string;
  locked_spaces: number;
}

export interface Attendee {
  first_name: string;
  sur_name: string;
  contact1: string;
  contact2: string;
  email: string;
  vehicle_type: number;
  license_type: number;
  license_number: string;
  theory_number: string;
  notes: string;
  primary: boolean;
}

export interface BookingRequest {
  course_id: number;
  course_event_id: number;
  location_id: number;
  selected_date: string;
  attendees_count: number;
  user_details: {
    first_name: string;
    sur_name: string;
    email: string;
    contact1: string;
  };
  attendees: Attendee[];
  create_account: boolean;
  password: string;
}

export interface BookingResponse {
  booking_id: number;
  booking_ref: string;
  payment_due: number;
  total_fees: number;
  vat: number;
  total_amount: number;
  payment_token: string;
}

class BookingApiService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data.data;
  }

  async getCourses(): Promise<Course[]> {
    return this.fetchApi<Course[]>('/courses');
  }

  async getLocations(): Promise<Location[]> {
    return this.fetchApi<Location[]>('/locations');
  }

  async getLocationsByCourse(courseId: number): Promise<Location[]> {
    return this.fetchApi<Location[]>(`/locations/${courseId}`);
  }

  async getCourseAvailability(courseId: number, locationId: number): Promise<AvailabilityResponse> {
    const response = await fetch(`${BASE_URL}/course-availability?course_id=${courseId}&location_id=${locationId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!data.success) {
      // Return empty availability instead of throwing error
      return {
        success: false,
        data: {
          course_id: courseId,
          location_id: locationId,
          availability: []
        }
      };
    }
    
    return data;
  }

  async createBookingLock(courseEventId: number, spacesRequired: number, userSession: string): Promise<BookingLock> {
    return this.fetchApi<BookingLock>('/lock', {
      method: 'POST',
      body: JSON.stringify({
        course_event_id: courseEventId,
        spaces_required: spacesRequired,
        user_session: userSession,
      }),
    });
  }

  async getSettings(): Promise<Settings> {
    return this.fetchApi<Settings>('/settings');
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    return this.fetchApi<VehicleType[]>('/vehicle-types');
  }

  async getLicenseTypes(): Promise<LicenseType[]> {
    return this.fetchApi<LicenseType[]>('/license-types');
  }

  async validatePromoCode(promoCode: string, courseId: number, locationId: number, attendeesCount: number): Promise<PromoValidation> {
    return this.fetchApi<PromoValidation>('/promo-codes/validate', {
      method: 'POST',
      body: JSON.stringify({
        promo_code: promoCode,
        course_id: courseId,
        location_id: locationId,
        attendees_count: attendeesCount,
      }),
    });
  }

  async createBookingWithAttendees(bookingData: BookingRequest): Promise<BookingResponse> {
    return this.fetchApi<BookingResponse>('/create-with-attendees', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }
}

export const bookingApi = new BookingApiService();
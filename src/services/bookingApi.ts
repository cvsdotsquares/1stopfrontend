const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
  course_event_id: number | null;
  location_id: number | null;
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
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        console.error(`HTTP ${response.status} for ${endpoint}:`, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API Response for ${endpoint}:`, data);

      if (!data.success) {
        console.error(`API Error for ${endpoint}:`, data.error);
        throw new Error(data.error?.message || 'API request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`Fetch Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async getCourses(): Promise<Course[]> {
    return this.fetchApi<Course[]>(`/booking/courses`);
  }

  async getLocations(): Promise<Location[]> {
    return this.fetchApi<Location[]>(`/locations`);
  }

  async getLocationsByCourse(courseId: number): Promise<Location[]> {
    return this.fetchApi<Location[]>(`/booking/locations/${courseId}`);
  }

  async getCourseAvailability(courseId: number, locationId: number): Promise<AvailabilityResponse> {
    const response = await fetch(`${BASE_URL}/booking/course-availability?course_id=${courseId}&location_id=${locationId}`, {
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
    return this.fetchApi<Settings>('/booking/settings');
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    return this.fetchApi<VehicleType[]>(`/booking/vehicle-types`);
  }

  async getLicenseTypes(): Promise<LicenseType[]> {
    try {
      return this.fetchApi<LicenseType[]>(`${BASE_URL}/booking/license-types`);
    } catch (error) {
      console.warn('License types API failed:', error);
      return [{ id: 1, licence_type: "UK Full Licence", status: 1 }, { id: 2, licence_type: "Provisional Licence", status: 1 }];
    }
  }

  async getVehicleTypesByCourseAndLocation(courseId: number, locationId: number): Promise<Record<string, string>> {
    try {
      return this.fetchApi<Record<string, string>>(`/booking/vehicle-types/${courseId}/${locationId}`);
    } catch (error) {
      console.warn(`Vehicle types API failed for course ${courseId}, location ${locationId}:`, error);
      return { "1": "Manual Car", "2": "Automatic Car" };
    }
  }

  async processAttendee(attendeeData: any): Promise<any> {
    return this.fetchApi<any>('/attendee', {
      method: 'POST',
      body: JSON.stringify(attendeeData),
    });
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
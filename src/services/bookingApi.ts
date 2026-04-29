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

export interface CourseEventDate {
  day_number: number;
  event_date: string;
  event_start_time: string | null;
  event_end_time: string | null;
  is_tbc: boolean;
}

export interface CourseEventVehiclePricingOneOff {
  price: number;
  pricing_type: 'one_off';
}

export interface CourseEventVehiclePricingDeposit {
  deposit: number;
  total: number;
  pricing_type: 'deposit';
}

export type CourseEventVehiclePricing = CourseEventVehiclePricingOneOff | CourseEventVehiclePricingDeposit;

export interface CourseEventPricing {
  vehicle_options: {
    school_vehicle_available: boolean;
    own_vehicle_available: boolean;
  };
  pricing_mode: 'deposit' | 'one_off';
  deposit_period_check_enabled: boolean;
  deposit_available: boolean;
  deposit_days: number;
  deposit_note: string | null;
  school_vehicle: CourseEventVehiclePricing;
  own_vehicle: CourseEventVehiclePricing;
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
  course_name?: string;
  number_of_days?: number;
  pricing?: CourseEventPricing;
  all_dates?: CourseEventDate[];
  status?: string;
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
  promo_code_id?: number;
  eligible_attendees?: number;
  ineligible_attendees?: number;
  apply_mode?: string;
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
  booking_refs?: string[];
  booking_ids?: number[];
  temp_ref: string;
  payment_due: number;
  total_fees: number;
  vat: number;
  total_amount: number;
  payment_token: string;
  client_secret?: string;
  payment_data?: {
    url: string;
    fields: Record<string, string>;
  };
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
        let errorPayload: any = null;
        let rawText = '';
        try {
          errorPayload = await response.json();
        } catch (parseError) {
          try {
            rawText = await response.text();
          } catch (textError) {
            rawText = '';
          }
          errorPayload = null;
        }

        const isEmptyObject = errorPayload && typeof errorPayload === 'object' && Object.keys(errorPayload).length === 0;
        const errorMessage =
          (!isEmptyObject && errorPayload?.message) ||
          (rawText ? rawText : '') ||
          `HTTP ${response.status}: ${response.statusText}`;

        const logPayload = isEmptyObject ? response.statusText : (errorPayload || rawText || response.statusText);
        if (response.status >= 400 && response.status < 500) {
          console.warn(`HTTP ${response.status} for ${endpoint}:`, logPayload);
        } else {
          console.error(`HTTP ${response.status} for ${endpoint}:`, logPayload);
        }
        const err: any = new Error(errorMessage);
        err.status = response.status;
        err.data = isEmptyObject ? null : errorPayload;
        err.raw = rawText || null;
        throw err;
      }

      const data = await response.json();

      if (data.success === false) {
        console.error(`API Error for ${endpoint}:`, data.error);
        throw new Error(data.error?.message || 'API request failed');
      }

      return data.data || data;
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

  async getSettings(): Promise<Settings> {
    return this.fetchApi<Settings>('/booking/settings');
  }

  async getVehicleTypes(): Promise<VehicleType[]> {
    return this.fetchApi<VehicleType[]>(`/booking/vehicle-types`);
  }

  async getLicenseTypes(): Promise<LicenseType[]> {
    try {
      const response = await this.fetchApi<any>(`/booking/license-types`);
      const licenseTypesObj = response.licenseTypes || response;

      if (typeof licenseTypesObj === 'object' && !Array.isArray(licenseTypesObj)) {
        // Convert object to array format
        return Object.entries(licenseTypesObj).map(([id, licence_type]) => ({
          id: parseInt(id),
          licence_type: licence_type as string,
          status: 1
        }));
      }

      return Array.isArray(licenseTypesObj) ? licenseTypesObj : [{ id: 1, licence_type: "UK Full Licence", status: 1 }, { id: 2, licence_type: "Provisional Licence", status: 1 }];
    } catch (error) {
      console.warn('License types API failed:', error);
      return [{ id: 1, licence_type: "UK Full Licence", status: 1 }, { id: 2, licence_type: "Provisional Licence", status: 1 }];
    }
  }

  async getVehicleTypesByCourseAndLocation(courseId: number, locationId: number, courseEventId: number): Promise<Record<string, string>> {
    try {
      const response = await this.fetchApi<any>(`/booking/vehicle-types/${courseId}/${locationId}/${courseEventId}`);
      return response.vehicleTypes || response || { "1": "Manual Car", "2": "Automatic Car" };
    } catch (error) {
      console.warn(`Vehicle types API failed for course ${courseId}, location ${locationId}, event ${courseEventId}:`, error);
      return { "1": "Manual Car", "2": "Automatic Car" };
    }
  }

  async processAttendee(attendeeData: any): Promise<any> {
    return this.fetchApi<any>('/attendee', {
      method: 'POST',
      body: JSON.stringify(attendeeData),
    });
  }

  async validatePromoCode(promoCode: string, courseId: number, locationId: number, attendeesCount: number, licenseNumbers?: string[]): Promise<PromoValidation> {
    return this.fetchApi<PromoValidation>('/promo-codes/validate', {
      method: 'POST',
      body: JSON.stringify({
        promo_code: promoCode,
        course_id: courseId,
        location_id: locationId,
        attendees_count: attendeesCount,
        license_numbers: licenseNumbers,
      }),
    });
  }

  async createBookingWithAttendees(bookingData: BookingRequest): Promise<BookingResponse> {
    return this.fetchApi<BookingResponse>('/booking/create-with-attendees', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async createBookingWithAttendeesNew(bookingData: any): Promise<BookingResponse> {
    return this.fetchApi<BookingResponse>('/booking-flow/create-booking-with-attendees', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async checkIpBlock(ipAddress: string): Promise<any> {
    return this.fetchApi<any>('/booking/check-ip-block', {
      method: 'POST',
      body: JSON.stringify({ ip_address: ipAddress }),
    });
  }

  async calculatePrice(courseEventId: number, attendees: any[], promoCodeId?: number, promoEligibleCount?: number): Promise<any> {
    return this.fetchApi<any>('/booking/pricing/calculate', {
      method: 'POST',
      body: JSON.stringify({
        course_event_id: courseEventId,
        attendees: attendees,
        promo_code_id: promoCodeId,
        promo_eligible_count: promoEligibleCount,
        apply_deposit_logic: true
      }),
    });
  }

  // async cleanupPrebookings(userId?: number, ipAddress?: string): Promise<any> {
  //   return this.fetchApi<any>('/booking/cleanup-prebookings', {
  //     method: 'POST',
  //     // send 0 for anonymous users so backend can match prebookings locked by guests
  //     body: JSON.stringify({ user_id: userId ?? 0, ip_address: ipAddress ?? '' }),
  //   });
  // }
}

export const bookingApi = new BookingApiService();
"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { bookingApi, type Course, type Location, type Settings, type VehicleType, type LicenseType, type CourseEvent } from "@/services/bookingApi";
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';
import AttendeeForm from './AttendeeForm';
import CryptoJS from 'crypto-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

/**
 * One‑Page Booking Checkout – Dynamic API Integration
 * ------------------------------------------------------
 * • Single‑page booking. The ONLY redirect is the final payment step.
 * • No time slots — fixed service window 07:00–15:00 (walk‑in within window).
 * • Steps are collapsible.
 * • Guest checkout by default; optional account creation; optional sign‑in.
 * • Calendar availability colors: green = available, red = fully booked.
 * • Now uses dynamic data from backend APIs
 * • Handles logged-in users in step 4
 */

// ---------- Types ----------
interface CalendarCell {
  date: Date;
  available: boolean;
  spots: number;
  courseEventId?: number;
}

// ---------- Small Pure Utilities (also used by tests) ----------
function generateCalendarWeeksFrom(startRefDate = new Date(), courseEvents: CourseEvent[] = [], monthOffset = 0) {
  const today = new Date(startRefDate);
  today.setHours(0, 0, 0, 0);

  // Calculate the start date based on month offset
  const baseDate = new Date(today);
  baseDate.setMonth(baseDate.getMonth() + monthOffset);
  baseDate.setDate(1); // Start from first day of the month

  // Get the last day of the month
  const lastDay = new Date(baseDate);
  lastDay.setMonth(lastDay.getMonth() + 1);
  lastDay.setDate(0);

  const start = new Date(baseDate);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday start

  // Calculate end to include padding for complete weeks
  const end = new Date(lastDay);
  const daysToAdd = (7 - ((end.getDay() + 6) % 7) - 1) % 7;
  end.setDate(end.getDate() + daysToAdd);

  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const cells: CalendarCell[] = Array.from({ length: daysDiff }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const inPast = d < today;
    const inCurrentMonth = d.getMonth() === baseDate.getMonth() && d.getFullYear() === baseDate.getFullYear();

    // Check if this date has a course event
    const dateStr = d.toISOString().split('T')[0];
    const courseEvent = courseEvents.find(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const available = !inPast && inCurrentMonth && courseEvent ? courseEvent.available && courseEvent.available_spaces > 0 : false;
    const spots = courseEvent?.available_spaces || 0;

    return {
      date: d,
      available: inCurrentMonth ? available : false,
      spots: inCurrentMonth ? spots : 0,
      courseEventId: courseEvent?.course_event_id
    };
  });

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

function computeTotals(unitPrice: string | number | undefined, attendees: string | number | undefined, vatRate: number = 0.2) {
  const subtotal = (Number(unitPrice) || 0) * (Number(attendees) || 0);
  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  return { subtotal, vat, total };
}

// ---------- Hook wrapper for calendar ----------
function useCalendarWeeks(courseEvents: CourseEvent[], monthOffset: number) {
  return useMemo(() => generateCalendarWeeksFrom(new Date(), courseEvents, monthOffset), [courseEvents, monthOffset]);
}

// ---------- Small UI Helpers ----------
interface SectionProps {
  index: number;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  complete: boolean;
  collapsible?: boolean;
  open: boolean;
  onToggle: () => void;
  expandDisabled?: boolean;
}

function Section({ index, title, subtitle, children, complete, collapsible = true, open, onToggle, expandDisabled = false }: SectionProps) {
  return (
    <section id={`section-${index}`} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div
            className={`h-10 w-10 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${complete ? "border border-gray-300 text-white bg-blue-600" : "border-blue-600 text-blue-600"
              }`}
            aria-hidden
          >
            {index}
          </div>
          <div className="mt-2 w-px grow bg-slate-200" />
        </div>
        <div className="w-full">
          <header className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            {collapsible && (
              <button
                type="button"
                onClick={onToggle}
                disabled={expandDisabled}
                className={`ml-4 inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${expandDisabled
                  ? "border-slate-200 text-slate-400 cursor-not-allowed"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                aria-expanded={open}
              >
                {open ? "Collapse" : "Expand"}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}>
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </header>
          {(!collapsible || open) && children}
        </div>
      </div>
    </section>
  );
}

interface BadgeProps {
  children: React.ReactNode;
}

function Badge({ children }: BadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full text-center border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
      {children}
    </span>
  );
}

interface RadioCardProps {
  checked: boolean;
  onChange: () => void;
  onClick?: () => void;
  title: string;
  caption?: string;
  right?: React.ReactNode;
  disabled?: boolean;
}

function RadioCard({ checked, onChange, onClick, title, caption, right, disabled = false }: RadioCardProps) {
  const handleClick = () => {
    if (disabled) return;
    onChange();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`w-full rounded-xl border p-4 text-left transition-all ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-sm'} focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${checked ? "border-red-500 bg-red-50" : "border-slate-200 bg-white"
        }`}
      aria-pressed={!!checked}
      aria-disabled={disabled ? true : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-start gap-2">
            <div className={`h-4 w-4 mt-1 flex-none rounded-full border ${checked ? "border-red-600 bg-red-600" : "border-slate-400"}`} />
            <div>
              <p className="font-medium text-slate-900 mb-1">{title}</p>
              {caption && <p className="mt-1 text-sm text-slate-500">{caption}</p>}
            </div>
          </div>
        </div>
        {right}
      </div>
    </button>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}

function Field({ label, children, required, hint }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </label>
  );
}

interface MoneyProps {
  value: string | number;
}

function Money({ value }: MoneyProps) {
  return <span className="tabular-nums">£{Number(value).toFixed(2)}</span>;
}

// ---------- Main Component ----------
export default function OnePageBookingCheckout() {
  // Auth state
  const { isAuthenticated, user, login } = useAuthStore();

  // API Data State
  const [courses, setCourses] = useState<Course[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [licenseTypes, setLicenseTypes] = useState<LicenseType[]>([]);
  const [availableVehicleTypes, setAvailableVehicleTypes] = useState<Record<string, string>>({});
  const [courseEvents, setCourseEvents] = useState<CourseEvent[]>([]);
  const [pricing, setPricing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseLocationError, setCourseLocationError] = useState<string | null>(null);

  // Form State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourseEventId, setSelectedCourseEventId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState(1);
  const [showLogin, setShowLogin] = useState(false);
  const [confirmPhotocard, setConfirmPhotocard] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState<any>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Photocard confirmation per attendee
  const [photocardConfirmed, setPhotocardConfirmed] = useState<boolean[]>([]);
  const [licenseValidated, setLicenseValidated] = useState<boolean[]>([]);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  // Attendee details - array for multiple attendees
  const [attendeeDetails, setAttendeeDetails] = useState<Array<{
    firstName: string;
    lastName: string;
    email: string;
    confirmEmail: string;
    phone: string;
    alternativePhone: string;
    vehicleType: string;
    licenseType: string;
    licenseNumber: string;
    theoryNumber: string;
    notes: string;
    registerAsUser: boolean;
    password: string;
    confirmPassword: string;
  }>>([{
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    confirmEmail: "",
    phone: user?.phone || "",
    alternativePhone: "",
    vehicleType: "",
    licenseType: "",
    licenseNumber: "",
    theoryNumber: "",
    notes: "",
    registerAsUser: false,
    password: "",
    confirmPassword: "",
  }]);

  // Booking Flow State
  const [ipBlocked, setIpBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [userIP, setUserIP] = useState<string>('');

  // UI submit states
  const [isPaying, setIsPaying] = useState(false);

  // Stripe payment state
  const [clientSecret, setClientSecret] = useState<string>('');
  const [bookingRef, setBookingRef] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // WorldPay Form State
  const [paymentFormUrl, setPaymentFormUrl] = useState<string>('');
  const [paymentFormFields, setPaymentFormFields] = useState<Record<string, string>>({});
  const paymentFormRef = useRef<HTMLFormElement>(null);

  // Auto-submit form when fields are ready
  useEffect(() => {
    console.log('Payment Effect Triggered:', { url: paymentFormUrl, fields: Object.keys(paymentFormFields).length, formRef: !!paymentFormRef.current });
    if (paymentFormUrl && Object.keys(paymentFormFields).length > 0 && paymentFormRef.current) {
      console.log('Submitting Payment Form...');
      paymentFormRef.current.submit();
    }
  }, [paymentFormUrl, paymentFormFields]);

  // Login details
  const [loginDetails, setLoginDetails] = useState({
    email: "",
    password: "",
  });

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true, // Always start with section 1 expanded
    2: false,
    3: false,
    4: false,
    5: false,
  });

  // Attendee form expansion state - only one attendee form expanded at a time
  const [expandedAttendeeIndex, setExpandedAttendeeIndex] = useState(0);

  // Check if an attendee form is complete (all required fields filled)
  const isAttendeeComplete = (attendee: typeof attendeeDetails[0]) => {
    const ukMobileRegex = /^(?:(?:\+44\s?7|07)\d{9})$/;

    const basicFieldsComplete =
      attendee.firstName.trim() !== '' &&
      attendee.lastName.trim() !== '' &&
      attendee.email.trim() !== '' &&
      attendee.confirmEmail.trim() !== '' &&
      attendee.email === attendee.confirmEmail &&
      attendee.phone.trim() !== '' &&
      ukMobileRegex.test(attendee.phone.replace(/\s/g, '')) &&
      attendee.licenseNumber.trim().length === 16;

    if (!basicFieldsComplete) return false;

    // If registering as user, check password fields
    if (attendee.registerAsUser) {
      return attendee.password.length >= 8 && attendee.password === attendee.confirmPassword;
    }

    return true;
  };

  // Section completion validation
  const sectionComplete: Record<number, boolean> = {
    1: !!selectedCourse,
    2: !!locationId,
    3: !!selectedDate && attendees > 0,
    4: attendeeDetails.slice(0, attendees).every(a => isAttendeeComplete(a)) && photocardConfirmed.slice(0, attendees).every(c => c),
    5: false, // Final section never auto-completes
  };

  // Check if all previous sections are complete
  const allPreviousSectionsComplete = (sectionIndex: number) => {
    for (let i = 1; i < sectionIndex; i++) {
      if (!sectionComplete[i]) return false;
    }
    return true;
  };

  // Auto-expand next section when current is completed
  useEffect(() => {
    if (sectionComplete[1] && !expandedSections[2]) {
      setExpandedSections(prev => ({ ...prev, 2: true }));
      // Scroll to the newly opened section (give time for layout)
      setTimeout(() => {
        document.getElementById('section-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [sectionComplete[1]]);

  useEffect(() => {
    if (sectionComplete[2] && !expandedSections[3]) {
      setExpandedSections(prev => ({ ...prev, 3: true }));
      setTimeout(() => {
        document.getElementById('section-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [sectionComplete[2]]);

  useEffect(() => {
    if (sectionComplete[3] && !expandedSections[4]) {
      setExpandedSections(prev => ({ ...prev, 4: true }));
      setTimeout(() => {
        document.getElementById('section-4')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [sectionComplete[3]]);

  useEffect(() => {
    if (sectionComplete[4] && !expandedSections[5] && photocardConfirmed.slice(0, attendees).every(c => c)) {
      setExpandedSections(prev => ({ ...prev, 5: true }));
      setTimeout(() => {
        document.getElementById('section-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [sectionComplete[4], photocardConfirmed, attendees]);

  // Collapse first attendee when photocard is confirmed
  useEffect(() => {
    if (confirmPhotocard && expandedAttendeeIndex === 0 && attendees === 1) {
      setExpandedAttendeeIndex(-1);
    }
  }, [confirmPhotocard, attendees]);

  // Auto-expand next attendee when photocard confirmed
  useEffect(() => {
    if (attendees <= 1) return;

    const currentIndex = expandedAttendeeIndex;
    if (currentIndex >= 0 && currentIndex < attendees && photocardConfirmed[currentIndex]) {
      if (currentIndex < attendees - 1 && !photocardConfirmed[currentIndex + 1]) {
        setExpandedAttendeeIndex(currentIndex + 1);
      }
    }
  }, [photocardConfirmed, attendees]);

  // Auto-expand next attendee form when current is completed (skip first if photocard confirmed)
  useEffect(() => {
    if (attendees <= 1 || !photocardConfirmed.slice(0, attendees).every(c => c)) return;

    const currentAttendee = attendeeDetails[expandedAttendeeIndex];
    if (currentAttendee && isAttendeeComplete(currentAttendee)) {
      if (expandedAttendeeIndex < attendees - 1) {
        setExpandedAttendeeIndex(expandedAttendeeIndex + 1);
      }
    }
  }, [attendeeDetails, expandedAttendeeIndex, attendees, photocardConfirmed]);

  // Update attendeeDetails array when attendees count changes
  useEffect(() => {
    setAttendeeDetails(prev => {
      const newDetails = [...prev];
      if (attendees > prev.length) {
        // Add new attendees
        for (let i = prev.length; i < attendees; i++) {
          newDetails.push({
            firstName: "",
            lastName: "",
            email: "",
            confirmEmail: "",
            phone: "",
            alternativePhone: "",
            vehicleType: "",
            licenseType: "",
            licenseNumber: "",
            theoryNumber: "",
            notes: "",
            registerAsUser: false,
            password: "",
            confirmPassword: "",
          });
        }
      } else if (attendees < prev.length) {
        // Remove excess attendees
        newDetails.splice(attendees);
        // Reset expanded index if it's out of bounds
        if (expandedAttendeeIndex >= attendees) {
          setExpandedAttendeeIndex(Math.max(0, attendees - 1));
        }
      }
      return newDetails;
    });

    // Initialize photocard confirmations
    setPhotocardConfirmed(prev => {
      const newConfirmed = [...prev];
      if (attendees > prev.length) {
        for (let i = prev.length; i < attendees; i++) {
          newConfirmed.push(false);
        }
      } else if (attendees < prev.length) {
        newConfirmed.splice(attendees);
      }
      return newConfirmed;
    });

    // Initialize license validation
    setLicenseValidated(prev => {
      const newValidated = [...prev];
      if (attendees > prev.length) {
        for (let i = prev.length; i < attendees; i++) {
          newValidated.push(false);
        }
      } else if (attendees < prev.length) {
        newValidated.splice(attendees);
      }
      return newValidated;
    });
  }, [attendees]);

  // Save sanitized form data to localStorage whenever it changes (DO NOT store sensitive fields like passwords)
  useEffect(() => {
    if (selectedCourse || locationId || selectedDate || attendeeDetails[0]?.firstName) {
      const formData = {
        selectedCourseId: selectedCourse?.id ?? null,
        selectedCourseName: selectedCourse?.course_name ?? null,
        locationId,
        selectedDate: selectedDate?.toISOString(),
        selectedCourseEventId,
        attendees,
        attendeeDetails: attendeeDetails.map(a => ({
          firstName: a.firstName,
          lastName: a.lastName,
          email: a.email,
          phone: a.phone,
          vehicleType: a.vehicleType,
          licenseType: a.licenseType,
          licenseNumber: a.licenseNumber,
          theoryNumber: a.theoryNumber,
          notes: a.notes,
          registerAsUser: a.registerAsUser,
        })),
        confirmPhotocard,
        acceptTerms,
      };

      try {
        localStorage.setItem('booking_form_data', JSON.stringify(formData));
      } catch (e) {
        console.warn('Failed to save booking_form_data', e);
      }
    }
  }, [selectedCourse, locationId, selectedDate, selectedCourseEventId, attendees, attendeeDetails, confirmPhotocard, acceptTerms]);

  // Load settings and license types when needed (step 5) — memoized to avoid redundant calls while user types
  const step5FetchedRef = useRef<{ selectedCourseId?: number | null; locationId?: number | null; selectedDateISO?: string | null; attendees?: number } | null>(null);

  useEffect(() => {
    if (!selectedDate || attendees <= 0) return;

    const current = {
      selectedCourseId: selectedCourse?.id ?? null,
      locationId: locationId ?? null,
      selectedDateISO: selectedDate?.toISOString() ?? null,
      attendees,
    };

    // If we've already fetched for the same parameters, skip
    if (
      step5FetchedRef.current &&
      step5FetchedRef.current.selectedCourseId === current.selectedCourseId &&
      step5FetchedRef.current.locationId === current.locationId &&
      step5FetchedRef.current.selectedDateISO === current.selectedDateISO &&
      step5FetchedRef.current.attendees === current.attendees
    ) {
      return;
    }

    const loadStep5Data = async () => {
      try {
        const [settingsData, licenseTypesData, vehicleTypesData] = await Promise.all([
          bookingApi.getSettings().catch(() => ({ vat_rate: 0.2, credit_card_surcharge: 0, booking_bcc: '' })),
          bookingApi.getLicenseTypes().catch(() => [{ id: 1, licence_type: "UK Full Licence", status: 1 }]),
          current.selectedCourseId && current.locationId
            ? bookingApi.getVehicleTypesByCourseAndLocation(current.selectedCourseId, current.locationId).catch(() => ({}))
            : Promise.resolve({})
        ]);
        setSettings(settingsData);
        setLicenseTypes(licenseTypesData);
        setAvailableVehicleTypes(vehicleTypesData);

        // Default to first license/vehicle type if user hasn't chosen one yet
        setAttendeeDetails(prev => prev.map((attendee, idx) => ({
          ...attendee,
          licenseType: attendee.licenseType || (licenseTypesData && licenseTypesData.length > 0 ? String(licenseTypesData[0].id) : ''),
          vehicleType: attendee.vehicleType || (vehicleTypesData && Object.keys(vehicleTypesData).length > 0 ? Object.keys(vehicleTypesData)[0] : ''),
        })));

        step5FetchedRef.current = current;
      } catch (err) {
        console.error('Failed to load step 5 data:', err);
      }
    };

    loadStep5Data();
  }, [selectedDate?.toISOString(), attendees, selectedCourse?.id, locationId]);

  // Get user IP and check block status on load
  useEffect(() => {
    const initializeBooking = async () => {
      try {
        setLoading(true);

        // Parse URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('course_id');
        const locationIdParam = urlParams.get('location_id');
        const dateParam = urlParams.get('date');
        const courseEventId = urlParams.get('course_event_id');

        // Get user IP
        const ip = await fetch('/api/get-ip').then(r => r.json()).then(d => d.ip).catch(() => '127.0.0.1');
        setUserIP(ip);

        // Check IP block status
        const ipCheck = await bookingApi.checkIpBlock(ip).catch(() => ({ blocked: false }));

        if (ipCheck.blocked) {
          setIpBlocked(true);
          setBlockMessage(ipCheck.message || 'Your IP is temporarily blocked');
          return;
        }

        // Load courses if not blocked
        const coursesData = await bookingApi.getCourses().catch(() => []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);

        // Apply URL parameters after courses are loaded
        if (courseId && coursesData) {
          const course = coursesData.find(c => c.id === parseInt(courseId));
          if (course) {
            setSelectedCourse(course);
          } else {
            setCourseLocationError('The selected course is not available for booking. Please choose from the available courses below.');
          }
        }

        if (locationIdParam) {
          setLocationId(parseInt(locationIdParam));
        }

        // Validate course and location combination if both are provided
        if (courseId && locationIdParam && coursesData) {
          const course = coursesData.find(c => c.id === parseInt(courseId));
          if (course) {
            try {
              const locationsForCourse = await bookingApi.getLocationsByCourse(course.id);
              const locationExists = locationsForCourse.some(l => l.id === parseInt(locationIdParam));
              if (!locationExists) {
                setCourseLocationError('This course is not available at the selected location. Please choose a different location.');
              }
            } catch (err) {
              console.error('Failed to validate course/location:', err);
              setCourseLocationError('Unable to verify course availability. Please select a course and location from the options below.');
            }
          }
        }

        // Validate location exists if only location_id is provided
        if (locationIdParam && !courseId) {
          const locationExists = await bookingApi.getLocationsByCourse(1).then(locs =>
            locs.some(l => l.id === parseInt(locationIdParam))
          ).catch(() => false);
          if (!locationExists) {
            setCourseLocationError('The selected location is not available for booking. Please choose from the available locations.');
          }
        }

        if (dateParam) {
          setSelectedDate(new Date(dateParam));
        }

        if (courseEventId) {
          setSelectedCourseEventId(parseInt(courseEventId));
        }
      } catch (err) {
        console.error('Load initial data error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    initializeBooking();
  }, []);

  // Sync form data across tabs
  useEffect(() => {
    function handleStorageEvent(e: StorageEvent) {
      try {
        if (e.key === 'booking_form_data' && e.newValue) {
          const formData = JSON.parse(e.newValue);

          if (formData.selectedCourseId) {
            setSelectedCourse({ id: formData.selectedCourseId, course_name: formData.selectedCourseName } as Course);
          }

          setLocationId(formData.locationId ?? null);
          setSelectedDate(formData.selectedDate ? new Date(formData.selectedDate) : null);
          setSelectedCourseEventId(formData.selectedCourseEventId ?? null);
          setAttendees(formData.attendees ?? 1);

          if (formData.attendeeDetails) {
            setAttendeeDetails(formData.attendeeDetails.map((a: any) => ({
              ...a,
              confirmEmail: "",
              password: "",
              confirmPassword: "",
            })));
          }
          setConfirmPhotocard(!!formData.confirmPhotocard);
          setAcceptTerms(!!formData.acceptTerms);
        }
      } catch (err) {
        console.warn('Error handling storage event', err);
      }
    }

    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // Load locations when course changes
  useEffect(() => {
    const loadLocations = async () => {
      if (!selectedCourse) {
        setLocations([]);
        setLocationId(null);
        return;
      }

      try {
        const locationsData = await bookingApi.getLocationsByCourse(selectedCourse.id);
        setLocations(locationsData);
        // Don't auto-select first location - let user choose
        // Preserve current selection if it's still valid for the new course
        if (!locationsData.some(l => l.id === locationId)) {
          setLocationId(null);
        }
      } catch (err) {
        console.error('Failed to load locations:', err);
        setLocations([]);
        setLocationId(null);
      }
    };

    loadLocations();
  }, [selectedCourse]);

  // Default: select course with id 1 if available (only when user hasn't already selected a course)
  useEffect(() => {
    if (Array.isArray(courses) && courses.length > 0 && !selectedCourse) {
      const defaultCourse = courses.find(c => c.id === 1);
      if (defaultCourse) {
        setSelectedCourse(defaultCourse);
      }
    }
  }, [courses, selectedCourse]);

  // Track last availability fetch to avoid duplicate requests
  const availabilityFetchedRef = useRef<{ courseId?: number | null; locationId?: number | null } | null>(null);

  // Load availability when course/location changes (with guard to prevent redundant calls)
  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedCourse || !locationId) {
        setCourseEvents([]);
        availabilityFetchedRef.current = null;
        return;
      }

      // Skip if we already fetched for this course/location
      if (availabilityFetchedRef.current?.courseId === selectedCourse.id && availabilityFetchedRef.current?.locationId === locationId) {
        return;
      }

      try {
        const response = await bookingApi.getCourseAvailability(selectedCourse.id, locationId);
        const availability = response.data.availability;
        setCourseEvents(availability);
        availabilityFetchedRef.current = { courseId: selectedCourse.id, locationId };

        // Auto-select first available date
        if (availability.length > 0 && !selectedDate) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const nextAvailable = availability.find(event => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return event.available && event.available_spaces > 0 && eventDate >= today;
          });
          if (nextAvailable) {
            setSelectedDate(new Date(nextAvailable.date));
            setSelectedCourseEventId(nextAvailable.course_event_id);
          }
        }
      } catch (err) {
        console.error('Failed to load availability:', err);
        setCourseEvents([]);
        availabilityFetchedRef.current = null;
      }
    };

    loadAvailability();
  }, [selectedCourse, locationId]);

  const weeks = useCalendarWeeks(courseEvents, calendarMonthOffset);

  const currentLocation = useMemo(
    () => locations.find((l) => l.id === locationId) || locations[0],
    [locations, locationId]
  );

  // Calculate pricing when details change
  const pricingDeps = useMemo(
    () => attendeeDetails.slice(0, attendees).map(a => `${a.vehicleType}-${a.licenseType}`).join(','),
    [attendeeDetails, attendees]
  );

  useEffect(() => {
    const calculatePricing = async () => {
      if (!selectedCourseEventId || !attendeeDetails[0]?.vehicleType || !attendeeDetails[0]?.licenseType) {
        setPricing(null);
        return;
      }

      try {
        const attendeesArray = attendeeDetails.slice(0, attendees).map(a => ({
          vehicle_type: Number(a.vehicleType),
          license_type: a.licenseType
        }));

        const pricingResult = await bookingApi.calculatePrice(selectedCourseEventId, attendeesArray);
        setPricing(pricingResult.pricing_breakdown);
      } catch (error) {
        console.error('Failed to calculate pricing:', error);
        setPricing(null);
      }
    };

    calculatePricing();
  }, [selectedCourseEventId, attendees, pricingDeps]);

  const subtotal = pricing?.final_totals?.subtotal || 0;
  const vat = pricing?.final_totals?.vat || 0;
  const discount = promoData?.valid ? promoData.discount_amount : 0;
  const total = (pricing?.final_totals?.final_amount || 0) - discount;

  const handleLogin = async () => {
    try {
      const { token, user } = await authApi.login(loginDetails.email, loginDetails.password);
      login(token, user);
      setShowLogin(false);
      toast.success('Logged in successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  const checkBlacklisted = async (licenseNumber: string): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/helper/check-blacklisted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_number: licenseNumber })
      });
      const data = await response.json();
      return data.success && data.is_blacklisted;
    } catch (error) {
      console.error('Failed to check blacklist:', error);
      return false;
    }
  };

  const handlePhotocardChange = async (index: number, confirmed: boolean) => {
    setPhotocardConfirmed(prev => {
      const newConfirmed = [...prev];
      newConfirmed[index] = confirmed;
      return newConfirmed;
    });

    // If this is the last attendee and photocard is confirmed, expand section 5
    if (confirmed && index === attendees - 1) {
      setTimeout(() => {
        setExpandedSections(prev => ({ ...prev, 5: true }));
        setTimeout(() => {
          document.getElementById('section-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }, 100);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    if (!selectedCourse || !locationId) {
      toast.error('Please select a course and location first');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const response = await fetch(`${BASE_URL}/booking/promo-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promo_code: promoCode.trim(),
          course_id: selectedCourse.id,
          location_id: locationId,
          attendees_count: attendees
        })
      });

      const data = await response.json();

      if (data.success && data.data.valid) {
        setPromoData(data.data);
        toast.success(data.data.description || 'Promo code applied successfully!');
      } else {
        setPromoData(null);
        toast.error(data.message || 'Invalid promo code');
      }
    } catch (error) {
      setPromoData(null);
      toast.error('Failed to validate promo code');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoData(null);
    toast.info('Promo code removed');
  };

  async function handlePay() {
    const missing = [];
    if (!selectedCourse) missing.push("Course");
    if (!locationId) missing.push("Location");
    if (!selectedDate) missing.push("Date");
    if (!selectedCourseEventId) missing.push("Course event");
    if (attendees < 1) missing.push("Number of attendees");

    // Validate all attendees
    for (let idx = 0; idx < attendeeDetails.slice(0, attendees).length; idx++) {
      const attendee = attendeeDetails[idx];
      if (!attendee.firstName) missing.push(`Attendee ${idx + 1}: First name`);
      if (!attendee.lastName) missing.push(`Attendee ${idx + 1}: Last name`);
      if (!attendee.email) missing.push(`Attendee ${idx + 1}: Email`);
      if (!attendee.licenseNumber || attendee.licenseNumber.length !== 16) missing.push(`Attendee ${idx + 1}: Driving licence number (16 characters)`);

      if (attendee.registerAsUser) {
        if (!attendee.password || attendee.password.length < 8) missing.push(`Attendee ${idx + 1}: Password (min 8 characters)`);
        if (attendee.password !== attendee.confirmPassword) {
          toast.error(`Attendee ${idx + 1}: Passwords do not match`);
          return;
        }
      }

      // Check if license is blacklisted
      if (attendee.licenseNumber && attendee.licenseNumber.length === 16) {
        const isBlacklisted = await checkBlacklisted(attendee.licenseNumber);
        if (isBlacklisted) {
          toast.error(`Attendee ${idx + 1}: This driving licence number is not allowed to book`);
          return;
        }
      }
    }

    if (!photocardConfirmed.slice(0, attendees).every(c => c)) missing.push("Photocard confirmation for all attendees");
    if (!acceptTerms) missing.push("Terms & Conditions acceptance");

    if (missing.length) {
      toast.error("Please complete: " + missing.join(", "));
      return;
    }

    setIsPaying(true);
    try {
      // Encrypt passwords using AES
      const encryptPassword = (password: string) => {
        const key = process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
        if (!key) throw new Error('Encryption key not configured');
        return CryptoJS.AES.encrypt(password, key).toString();
      };

      const bookingData = {
        course_id: selectedCourse!.id,
        course_event_id: selectedCourseEventId,
        location_id: locationId,
        selected_date: selectedDate!.toISOString().split('T')[0],
        promo_code: promoData?.valid ? promoCode.trim() : undefined,
        attendees: attendeeDetails.slice(0, attendees).map((attendee) => ({
          first_name: attendee.firstName,
          sur_name: attendee.lastName,
          email: attendee.email,
          contact1: attendee.phone,
          contact2: attendee.alternativePhone || undefined,
          license_number: attendee.licenseNumber,
          license_type: Number(attendee.licenseType) || 1,
          vehicle_type: Number(attendee.vehicleType) || 0,
          theory_number: attendee.theoryNumber || undefined,
          password: attendee.registerAsUser && attendee.password ? encryptPassword(attendee.password) : undefined,
          notes: attendee.notes || undefined,
        })),
        photocard_confirmed: photocardConfirmed.slice(0, attendees).every(c => c),
        terms_agreed: acceptTerms,
      };

      const response = await bookingApi.createBookingWithAttendeesNew(bookingData);

      localStorage.removeItem('booking_form_data');

      if (response.client_secret) {
        setClientSecret(response.client_secret);
        setBookingRef(response.booking_ref);
        setShowPaymentForm(true);
        toast.success(`Booking created! Reference: ${response.booking_ref}`);
      } else {
        toast.success(`Booking created! Reference: ${response.booking_ref}. (No payment required)`);
      }
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : (error?.response?.data?.message ?? 'Unknown error');
      toast.error(`Booking failed: ${errMsg}`);
    } finally {
      setIsPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading booking options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {courseLocationError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-4 flex items-center justify-between">
          <p className="text-sm">{courseLocationError}</p>
          <button
            onClick={() => setCourseLocationError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl mb-2">Book your course</h1>
            <p className="mt-1 text-slate-600">One‑page checkout. You'll be redirected only for the payment step.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Secure booking</Badge>
            <Badge>Pay only at last step</Badge>
          </div>
        </div>

        {/* Layout */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Left: Steps */}
          <div className="md:col-span-2 space-y-6">
            {/* Step 1: Course / Voucher */}
            <Section
              index={1}
              title="Choose a course or voucher"
              subtitle="All sections are on one page – pick a course to continue."
              complete={sectionComplete[1]}
              open={expandedSections[1]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 1: !prev[1] }))}
            >
              <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2">
                {Array.isArray(courses) && courses.map((c, index) => {
                  const isSelected = !!(selectedCourse?.id === c.id && selectedCourse?.course_name === c.course_name);
                  return (
                    <RadioCard
                      key={`course-${c.id}-${c.course_name}-${index}`}
                      checked={isSelected}
                      onChange={() => setSelectedCourse(c)}
                      title={c.course_name}
                    />
                  );
                })}
              </div>
            </Section>

            {/* Step 2: Location */}
            <Section
              index={2}
              title="Pick a location"
              subtitle="Choose your preferred city/venue."
              complete={sectionComplete[2]}
              open={expandedSections[2]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 2: !prev[2] }))}
              expandDisabled={!sectionComplete[1]}
            >
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
                {locations.map((l) => (
                  <RadioCard
                    key={l.id}
                    checked={locationId === l.id}
                    onClick={() => setLocationId(l.id)}
                    onChange={() => setLocationId(l.id)}
                    title={l.location_name}
                    caption={`${l.address1}, ${l.postcode}`}
                  />
                ))}
              </div>
            </Section>

            {/* Step 3: Date & Attendees */}
            <Section
              index={3}
              title="Select date & time"
              subtitle="Pick a day and tell us how many attendees."
              complete={sectionComplete[3]}
              open={expandedSections[3]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 3: !prev[3] }))}
              expandDisabled={!sectionComplete[2]}
            >
              {/* Calendar */}
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-medium text-slate-900">Availability (next 3 months)</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-block h-3 w-3 min-w-3 rounded-sm bg-emerald-500" /> <span>Available</span>
                    <span className="inline-block h-3 w-3 min-w-3 rounded-sm bg-rose-500" /> <span>Fully booked</span>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="mb-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCalendarMonthOffset(Math.max(0, calendarMonthOffset - 1))}
                    disabled={calendarMonthOffset === 0}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← {(() => {
                      const prevMonth = new Date();
                      prevMonth.setMonth(prevMonth.getMonth() + calendarMonthOffset - 1);
                      return prevMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                    })()}
                  </button>
                  <span className="text-sm font-semibold text-slate-900">
                    {(() => {
                      const currentMonth = new Date();
                      currentMonth.setMonth(currentMonth.getMonth() + calendarMonthOffset);
                      return currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                    })()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalendarMonthOffset(calendarMonthOffset + 1)}
                    disabled={calendarMonthOffset >= 2}
                    className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(() => {
                      const nextMonth = new Date();
                      nextMonth.setMonth(nextMonth.getMonth() + calendarMonthOffset + 1);
                      return nextMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                    })()} →
                  </button>
                </div>

                {courseEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="mb-2">No availability found for this course and location.</p>
                    <p className="text-sm">Please try selecting a different course or location.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
                      {"Mon Tue Wed Thu Fri Sat Sun".split(" ").map((d) => (
                        <div key={d} className="py-1">{d}</div>
                      ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                      {weeks.flat().map((cell, idx) => {
                        const isSelected = selectedDate && new Date(selectedDate).toDateString() === cell.date.toDateString();
                        const isToday = new Date().toDateString() === cell.date.toDateString();
                        const currentMonth = new Date();
                        currentMonth.setMonth(currentMonth.getMonth() + calendarMonthOffset);
                        const inCurrentMonth = cell.date.getMonth() === currentMonth.getMonth() && cell.date.getFullYear() === currentMonth.getFullYear();

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={!cell.available || !inCurrentMonth}
                            onClick={() => {
                              setSelectedDate(cell.date);
                              setSelectedCourseEventId(cell.courseEventId || null);
                            }}
                            title={cell.available && inCurrentMonth ? `${cell.spots} spots left` : "Not available"}
                            className={`aspect-square rounded-lg border text-sm tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
                              !inCurrentMonth
                                ? "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed"
                                : cell.available
                                ? isSelected
                                  ? "border-emerald-600 bg-emerald-600 text-white font-semibold"
                                  : "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                                : "border-red-300 bg-red-50 text-red-500 cursor-not-allowed"
                              } ${isToday && inCurrentMonth ? "ring-2 ring-teal-400" : ""}`}
                          >
                            <div>{cell.date.getDate()}</div>
                            <div className="text-[10px]">{inCurrentMonth && cell.available ? `${cell.spots}×` : inCurrentMonth ? "—" : ""}</div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Selected summary */}
              <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-900">
                {selectedDate ? (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span><strong>Date:</strong> {selectedDate.toLocaleDateString()}</span>
                    <span><strong>Time window:</strong> {(() => {
                      const selectedEvent = courseEvents.find(event => {
                        const eventDate = new Date(event.date).toISOString().split('T')[0];
                        const selectedDateStr = selectedDate.toISOString().split('T')[0];
                        return eventDate === selectedDateStr;
                      });
                      return selectedEvent ? `${selectedEvent.event_start_time}–${selectedEvent.event_end_time}` : '07:00–15:00';
                    })()}</span>
                    <span><strong>Attendees:</strong> {attendees}</span>
                    <span><strong>Location:</strong> {currentLocation?.location_name}</span>
                  </div>
                ) : (
                  <span>Select a date to continue.</span>
                )}
              </div>
            </Section>

            {/* Step 4: Your Details (All Attendees) */}
            <Section
              index={4}
              title="Your details"
              subtitle="Fill in details for all attendees. We'll email booking confirmation and joining instructions."
              complete={sectionComplete[4]}
              open={expandedSections[4]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 4: !prev[4] }))}
              expandDisabled={!sectionComplete[3]}
            >
              {!isAuthenticated && (
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => setShowLogin((v) => !v)}
                    className="text-sm font-medium text-blue-700 underline-offset-2 hover:underline"
                  >
                    {showLogin ? "Hide" : "Already have an account?"} Sign in
                  </button>

                  {showLogin && (
                    <div className="grid gap-4 sm:grid-cols-2 mt-4 p-4 bg-white rounded-lg border border-slate-200">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                          value={loginDetails.email}
                          onChange={(e) => setLoginDetails(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="you@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Password <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="password"
                          className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                          value={loginDetails.password}
                          onChange={(e) => setLoginDetails(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleLogin}
                          className="w-full px-4 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
                        >
                          Sign in
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated && (
                <div className="mb-6 rounded-lg bg-green-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Logged in as {user?.first_name} {user?.last_name}</p>
                      <p className="text-sm text-green-700">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {attendeeDetails.slice(0, attendees).map((attendee, index) => {
                  // Check if this attendee's email is used by another attendee
                  const duplicateEmailIndex = attendee.email.trim()
                    ? attendeeDetails.slice(0, attendees).findIndex((a, i) =>
                        i !== index && a.email.trim().toLowerCase() === attendee.email.trim().toLowerCase()
                      )
                    : -1;

                  // Check if this attendee's license number is used by another attendee
                  const duplicateLicenseIndex = attendee.licenseNumber.trim()
                    ? attendeeDetails.slice(0, attendees).findIndex((a, i) =>
                        i !== index && a.licenseNumber.trim().toUpperCase() === attendee.licenseNumber.trim().toUpperCase()
                      )
                    : -1;

                  return (
                    <AttendeeForm
                      key={index}
                      index={index}
                      attendee={attendee}
                      onChange={(field, value) => {
                        setAttendeeDetails(prev => {
                          const newDetails = [...prev];
                          newDetails[index] = { ...newDetails[index], [field]: value };
                          return newDetails;
                        });
                      }}
                      availableVehicleTypes={availableVehicleTypes}
                      licenseTypes={licenseTypes}
                      totalAttendees={attendees}
                      isExpanded={expandedAttendeeIndex === index}
                      onToggle={() => {
                        setExpandedAttendeeIndex(index);
                      }}
                      isComplete={isAttendeeComplete(attendee)}
                      photocardConfirmed={photocardConfirmed[index] || false}
                      onPhotocardChange={(confirmed) => handlePhotocardChange(index, confirmed)}
                      licenseValidated={licenseValidated[index] || false}
                      duplicateEmailIndex={duplicateEmailIndex >= 0 ? duplicateEmailIndex : null}
                      duplicateLicenseIndex={duplicateLicenseIndex >= 0 ? duplicateLicenseIndex : null}
                    />
                  );
                })}
              </div>
            </Section>

            {/* Step 5: Review & Pay */}
            <Section
              index={5}
              title="Review & proceed to payment"
              subtitle="You'll be redirected to the secure payment page."
              complete={sectionComplete[5]}
              open={expandedSections[5]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 5: !prev[5] }))}
              expandDisabled={!sectionComplete[4]}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 font-medium text-slate-900">Booking summary</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li><span className="text-slate-500">Course:</span> {selectedCourse?.course_name}</li>
                    <li><span className="text-slate-500">Location:</span> {currentLocation?.location_name}</li>
                    <li><span className="text-slate-500">Date:</span> {selectedDate ? selectedDate.toLocaleDateString() : "—"}</li>
                    <li><span className="text-slate-500">Time window:</span> {selectedDate ? (() => {
                      const selectedEvent = courseEvents.find(event => {
                        const eventDate = new Date(event.date).toISOString().split('T')[0];
                        const selectedDateStr = selectedDate.toISOString().split('T')[0];
                        return eventDate === selectedDateStr;
                      });
                      return selectedEvent ? `${selectedEvent.event_start_time}–${selectedEvent.event_end_time}` : '07:00–15:00';
                    })() : "—"}</li>
                    <li><span className="text-slate-500">Attendees:</span> {attendees} attendee(s)</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 font-medium text-slate-900">Pricing</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between"><span className="text-slate-600">Attendees</span><span className="font-medium text-slate-900">{attendees}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-600">Course fee</span><span className="font-medium text-slate-900"><Money value={subtotal} /></span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-600">VAT (20%)</span><span className="font-medium text-slate-900"><Money value={vat} /></span></div>
                    {promoData?.valid && (
                      <div className="flex items-center justify-between text-green-600">
                        <span>Discount ({promoData.discount_type})</span>
                        <span className="font-medium">-<Money value={discount} /></span>
                      </div>
                    )}
                    <div className="mt-2 border-t pt-2 text-base font-semibold text-slate-900 flex items-center justify-between"><span>Total</span><span><Money value={total} /></span></div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-slate-700 mb-2">Have a promo code?</p>
                    {!promoData?.valid ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={isValidatingPromo || !promoCode.trim()}
                          className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isValidatingPromo ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium text-green-700">{promoCode}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-4">
                <input id="terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                <label htmlFor="terms" className="text-sm text-slate-700">I agree to the <a className="text-teal-700 underline-offset-2 hover:underline" href="#">Terms & Conditions</a> and <a className="text-teal-700 underline-offset-2 hover:underline" href="#">Privacy Policy</a>.</label>
              </div>

              <div className="mt-4 space-y-3">
                <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">Review your booking details and proceed to payment.</p>
                  <button
                    type="button"
                    onClick={handlePay}
                    disabled={isPaying}
                    aria-busy={isPaying}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${isPaying ? 'bg-teal-400 cursor-not-allowed' : 'bg-red-600 hover:bg-teal-700'}`}
                  >
                    {isPaying ? 'Processing…' : 'Proceed to payment'}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h11a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </Section>
          </div>

          {/* Right: Sticky Order Summary */}
          <aside className="md:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Order summary</h3>
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Live</span>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Course</dt><dd className="text-right text-slate-900">{selectedCourse?.course_name}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Location</dt><dd className="text-right text-slate-900">{currentLocation?.location_name}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Date</dt><dd className="text-right text-slate-900">{selectedDate ? selectedDate.toLocaleDateString() : "—"}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Time window</dt><dd className="text-right text-slate-900">{selectedDate ? (() => {
                    const selectedEvent = courseEvents.find(event => {
                      const eventDate = new Date(event.date).toISOString().split('T')[0];
                      const selectedDateStr = selectedDate.toISOString().split('T')[0];
                      return eventDate === selectedDateStr;
                    });
                    return selectedEvent ? `${selectedEvent.event_start_time}–${selectedEvent.event_end_time}` : '07:00–15:00';
                  })() : "—"}</dd></div>
                </dl>
                <div className="my-3 border-t" />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium text-slate-900"><Money value={subtotal} /></span></div>
                  <div className="flex items-center justify-between"><span className="text-slate-600">VAT</span><span className="font-medium text-slate-900"><Money value={vat} /></span></div>
                  <div className="mt-2 flex items-center justify-between text-base font-semibold text-slate-900"><span>Total</span><span><Money value={total} /></span></div>
                </div>
              </div>

              {/* Attendees */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Attendees</h4>
                <p className="mb-3 text-xs text-slate-500">Visit anytime during the scheduled time window on your chosen day.</p>
                <div className="flex items-center justify-center gap-3">
                  <button type="button" disabled={attendees <= 1} className="h-9 w-9 cursor-pointer rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setAttendees((n) => Math.max(1, n - 1))}>−</button>
                  <input type="number" min={1} max={selectedDate ? (weeks.flat().find(c => c.date.toDateString() === new Date(selectedDate).toDateString())?.spots ?? 1) : 1} className="w-16 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm" value={attendees} onChange={(e) => {
                    const maxSpots = selectedDate ? (weeks.flat().find(c => c.date.toDateString() === new Date(selectedDate).toDateString())?.spots ?? 1) : 1;
                    setAttendees(Math.max(1, Math.min(maxSpots, parseInt(e.target.value || "1", 10))));
                  }} />
                  <button type="button" disabled={attendees >= (selectedDate ? (weeks.flat().find(c => c.date.toDateString() === new Date(selectedDate).toDateString())?.spots ?? 1) : 1)} className="h-9 w-9 cursor-pointer rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => {
                    const maxSpots = selectedDate ? (weeks.flat().find(c => c.date.toDateString() === new Date(selectedDate).toDateString())?.spots ?? 1) : 1;
                    setAttendees((n) => Math.min(maxSpots, n + 1));
                  }}>+</button>
                </div>
                <p className="mt-2 text-xs text-slate-500 text-center">{selectedDate ? "Spots available: " + (weeks.flat().find(c => c.date.toDateString() === new Date(selectedDate).toDateString())?.spots ?? "—") : "Select a date to see availability."}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h4 className="mb-2 text-sm font-semibold text-slate-900">Why book with us?</h4>
                <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                  <li>Trusted UK training provider</li>
                  <li>Instant e‑mail confirmation</li>
                  <li>Only pay at the final step</li>
                  <li>Free date changes (48h notice)</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Hidden Payment Form */}
      {paymentFormUrl && Object.keys(paymentFormFields).length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Redirecting to Payment</h3>
            <p className="text-sm text-gray-600 mb-4">
              You will be redirected to the secure payment gateway. If the redirect doesn't happen automatically, click the button below.
            </p>
            <form ref={paymentFormRef} action={paymentFormUrl} method="POST">
              {Object.entries(paymentFormFields).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Fallback Hidden Form */}
      <form ref={paymentFormRef} action={paymentFormUrl} method="POST" className="hidden">
        {Object.entries(paymentFormFields).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
      </form>

      {/* Stripe Payment Modal */}
      {showPaymentForm && clientSecret && (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-8">
              <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                <StripePaymentForm
                  onSuccess={() => {
                    window.location.href = `/booking/success?ref=${bookingRef}`;
                  }}
                  onCancel={() => {
                    setShowPaymentForm(false);
                    setClientSecret('');
                  }}
                  bookingRef={bookingRef}
                  amount={Math.round(total * 100)}
                />
              </Elements>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Dev tests (manual runner) ----------
export function __runDevTests() {
  const results = [];
  try {
    // Test 1: calendar generates exactly 6 weeks x 7 days
    const w = generateCalendarWeeksFrom(new Date("2025-10-01"), []);
    const pass1 = Array.isArray(w) && w.length === 6 && w.flat().length === 42;
    results.push({ name: "calendar weeks shape", pass: pass1 });

    // Test 2: pricing math with VAT
    const { subtotal: s2, vat: v2, total: t2 } = computeTotals(129, 2, 0.2);
    const pass2 = s2 === 258 && Number(v2.toFixed(2)) === 51.6 && Number(t2.toFixed(2)) === 309.6;
    results.push({ name: "pricing math 129×2", pass: pass2 });

    // Test 3: computeTotals robustness
    const { subtotal: s3 } = computeTotals(undefined, 3, 0.2);
    results.push({ name: "computeTotals handles undefined price", pass: s3 === 0 });
  } catch (e) {
    results.push({ name: "unexpected error", pass: false, error: String(e) });
  }
  return results;
}
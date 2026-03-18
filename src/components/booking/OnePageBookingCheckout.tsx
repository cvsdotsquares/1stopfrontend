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
// Helper function to format date as YYYY-MM-DD in local timezone
function formatLocalDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

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
    const dateStr = formatLocalDate(d);
    const courseEvent = courseEvents.find(event => {
      const eventDate = new Date(event.date);
      return formatLocalDate(eventDate) === dateStr;
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

/**
 * Returns the number of whole days between today (midnight) and courseStartDate (midnight).
 * Returns 0 if the date is today, negative if in the past.
 * Timezone-safe: compares local midnight values.
 */
function daysUntilCourseStart(courseStartDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(courseStartDate);
  start.setHours(0, 0, 0, 0);
  return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Determines the effective payment type for a course event.
 * Returns 'DEPOSIT' only when deposit pricing exists AND the cutoff has not been reached.
 * Falls back to 'FULL' in all other cases (including one_off, no pricing, past cutoff).
 */
function resolvePaymentType(
  pricing: CourseEvent['pricing'],
  courseStartDate: Date | null
): { paymentType: 'DEPOSIT' | 'FULL'; forcedFullReason: string | null } {
  if (!pricing || pricing.pricing_mode !== 'deposit') {
    return { paymentType: 'FULL', forcedFullReason: null };
  }

  // deposit_available is already computed server-side using deposit_days
  if (!pricing.deposit_available) {
    return {
      paymentType: 'FULL',
      forcedFullReason: 'This course requires full payment as the course start date is too soon.',
    };
  }

  // Extra client-side guard: re-check cutoff in case the page has been open a long time
  if (courseStartDate && pricing.deposit_days > 0) {
    const days = daysUntilCourseStart(courseStartDate);
    if (days <= pricing.deposit_days) {
      return {
        paymentType: 'FULL',
        forcedFullReason: 'This course requires full payment as the course start date is too soon.',
      };
    }
  }

  return { paymentType: 'DEPOSIT', forcedFullReason: null };
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
      className={`w-full rounded-xl border p-4 text-left transition-all ${disabled ? 'cursor-not-allowed opacity-60' : 'hover:shadow-sm'} focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${checked ? "border-green-500 bg-green-50" : "border-slate-200 bg-white"
        }`}
      aria-pressed={!!checked}
      aria-disabled={disabled ? true : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-start gap-2">
            <div className={`h-4 w-4 mt-1 flex-none rounded-full border ${checked ? "border-green-600 bg-green-600" : "border-slate-400"}`} />
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
  // Force scroll to top on mount and disable browser scroll restoration
  useEffect(() => {
    // Scroll to top immediately
    window.scrollTo(0, 0);

    // Disable browser's scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    return () => {
      // Restore default behavior on unmount
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

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
  const [dateTimeConfirmed, setDateTimeConfirmed] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [confirmPhotocard, setConfirmPhotocard] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showCourseInfo, setShowCourseInfo] = useState(false);
  const [selectedCourseInfo, setSelectedCourseInfo] = useState<Course | null>(null);
  // const [showCourseInfo, setShowCourseInfo] = useState(false);
  // const [selectedCourseInfo, setSelectedCourseInfo] = useState<Course | null>(null);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoData, setPromoData] = useState<any>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [courseBulletPoints, setCourseBulletPoints] = useState<string>('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Photocard confirmation per attendee
  const [photocardConfirmed, setPhotocardConfirmed] = useState<boolean[]>([]);
  const [licenseValidated, setLicenseValidated] = useState<boolean[]>([]);
  const [calendarMonthOffset, setCalendarMonthOffset] = useState(0);

  // Attendee details - array for multiple attendees
  const [attendeeDetails, setAttendeeDetails] = useState<Array<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
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
    isPrimaryUser: boolean;
    password: string;
    confirmPassword: string;
  }>>([{
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    dateOfBirth: "",
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
    isPrimaryUser: false,
    password: "",
    confirmPassword: "",
  }]);

  // Booking Flow State
  const [ipBlocked, setIpBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [userIP, setUserIP] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasUrlParams, setHasUrlParams] = useState(false);

  // UI submit states
  const [isPaying, setIsPaying] = useState(false);

  // Stripe payment state
  const [bookingRef, setBookingRef] = useState<string>('');

  // WorldPay Form State
  const [paymentFormUrl, setPaymentFormUrl] = useState<string>('');
  const [paymentFormFields, setPaymentFormFields] = useState<Record<string, string>>({});
  const paymentFormRef = useRef<HTMLFormElement>(null);

  // Auto-submit form when fields are ready
  useEffect(() => {
    if (paymentFormUrl && Object.keys(paymentFormFields).length > 0 && paymentFormRef.current) {
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

  // Refs used in reset helpers — declared early so they are in scope
  const step5FetchedRef = useRef<{ selectedCourseId?: number | null; locationId?: number | null; selectedCourseEventId?: number | null; selectedDateISO?: string | null; attendees?: number } | null>(null);
  const availabilityFetchedRef = useRef<{ courseId?: number | null; locationId?: number | null } | null>(null);

  // Track previous course for change detection
  const prevCourseIdRef = useRef<number | null>(null);

  // Track previous date for change detection (avoids resetting attendees on first date selection)
  const prevDateStrRef = useRef<string | null>(null);

  // ---------- Downstream Reset Helpers ----------
  // Reset Step 3 and everything below (date, attendees, attendee details, pricing, promo, sections 3-5)
  const resetStep3AndBelow = () => {
    setSelectedDate(null);
    setSelectedCourseEventId(null);
    setDateTimeConfirmed(false);
    setAttendees(1);
    setCalendarMonthOffset(0);
    setPricing(null);
    setPromoCode('');
    setPromoData(null);
    setPromoError(null);
    setPromoSuccess(null);
    setAcceptTerms(false);
    setConfirmPhotocard(false);
    setPhotocardConfirmed([false]);
    setLicenseValidated([false]);
    setExpandedAttendeeIndex(0);
    // Reset date tracking ref so next date selection is treated as "first" (no auto-reset of attendees)
    prevDateStrRef.current = null;
    setAttendeeDetails([{
      firstName: user?.first_name || '', lastName: user?.last_name || '',
      dateOfBirth: '', email: user?.email || '', confirmEmail: '',
      phone: user?.phone || '', alternativePhone: '', vehicleType: '', licenseType: '',
      licenseNumber: '', theoryNumber: '', notes: '',
      registerAsUser: false, isPrimaryUser: false, password: '', confirmPassword: '',
    }]);
    // Keep section 3 expanded so user can pick a new date
    setExpandedSections(prev => ({ ...prev, 3: true, 4: false, 5: false }));
    step5FetchedRef.current = null;
  };

  // Reset Step 2 and everything below (location, availability, plus all of step 3+)
  const resetStep2AndBelow = () => {
    setLocationId(null);
    setCourseEvents([]);
    availabilityFetchedRef.current = null;
    // Keep section 2 expanded so user can pick a new location
    setExpandedSections(prev => ({ ...prev, 2: true, 3: false, 4: false, 5: false }));
    resetStep3AndBelow();
  };

  // Check if an attendee form is complete (all required fields filled)
  const isAttendeeComplete = (attendee: typeof attendeeDetails[0]) => {
    const phoneRegex = /^\+?[0-9\s()-]+$/;
    const licenseRegex = /^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isOtherLicense = attendee.licenseType === '4';
    const dobRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;

    const email = attendee.email.trim();
    const confirmEmail = attendee.confirmEmail.trim();
    const isEmailValid = emailRegex.test(email);
    const isConfirmEmailValid = emailRegex.test(confirmEmail);
    const phone = attendee.phone.trim();
    const normalizedPhone = phone.replace(/[\s()-]/g, '');
    const dob = attendee.dateOfBirth.trim();
    const dobMatch = dob.match(dobRegex);
    const isDobValid = (() => {
      if (!dobMatch) return false;
      const [, dayStr, monthStr, yearStr] = dobMatch;
      const day = Number(dayStr);
      const month = Number(monthStr);
      const year = Number(yearStr);
      const date = new Date(year, month - 1, day);
      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    })();

    const basicFieldsComplete =
      attendee.firstName.trim() !== '' &&
      attendee.lastName.trim() !== '' &&
      dob !== '' &&
      isDobValid &&
      email !== '' &&
      confirmEmail !== '' &&
      isEmailValid &&
      isConfirmEmailValid &&
      email.toLowerCase() === confirmEmail.toLowerCase() &&
      phone !== '' &&
      phoneRegex.test(phone) &&
      /^\+?[0-9]+$/.test(normalizedPhone) &&
      attendee.vehicleType.trim() !== '' &&
      attendee.licenseType.trim() !== '';

    // License number validation - skip if license type is 4
    const licenseComplete = isOtherLicense || (
      attendee.licenseNumber.trim().length === 16 &&
      licenseRegex.test(attendee.licenseNumber)
    );

    if (!basicFieldsComplete || !licenseComplete) return false;

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
    3: !!selectedDate && attendees > 0 && dateTimeConfirmed,
    4: attendeeDetails.slice(0, attendees).every(a => isAttendeeComplete(a)) && photocardConfirmed.slice(0, attendees).every(c => c),
    5: false, // Final section never auto-completes
  };

  const canPayNow = sectionComplete[1] && sectionComplete[2] && sectionComplete[3] && sectionComplete[4];

  // Check if all previous sections are complete
  const allPreviousSectionsComplete = (sectionIndex: number) => {
    for (let i = 1; i < sectionIndex; i++) {
      if (!sectionComplete[i]) return false;
    }
    return true;
  };

  // Check if URL has params (synchronous check)
  const hasUrlParameters = () => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    return !!(urlParams.get('course_id') || urlParams.get('location_id') || urlParams.get('date'));
  };


  // Auto-expand next section when current is completed
  useEffect(() => {
    if (sectionComplete[1]) {
      // Expand section if not already expanded
      if (!expandedSections[2]) {
        setExpandedSections(prev => ({ ...prev, 2: true }));
      }
      // Note: Scrolling is handled by the course change effect below
    }
  }, [sectionComplete[1]]);

  // Scroll to section 2 when course changes manually (after initial load)
  useEffect(() => {
    if (selectedCourse && !hasUrlParams && !isInitialLoad) {
      const currentCourseId = selectedCourse.id;
      // Check if course actually changed (not initial selection)
      if (prevCourseIdRef.current !== null && prevCourseIdRef.current !== currentCourseId) {
        setTimeout(() => {
          document.getElementById('section-2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
      prevCourseIdRef.current = currentCourseId;
    } else if (!selectedCourse) {
      prevCourseIdRef.current = null;
    }
  }, [selectedCourse, hasUrlParams, isInitialLoad]);

  // Reset date/time confirmation when attendees change (user needs to re-confirm)
  useEffect(() => {
    setDateTimeConfirmed(false);
  }, [attendees]);

  useEffect(() => {
    if (sectionComplete[2]) {
      // Expand section if not already expanded
      if (!expandedSections[3]) {
        setExpandedSections(prev => ({ ...prev, 3: true }));
      }
      // Scroll whenever location is complete (even if section already expanded)
      if (!hasUrlParams && !isInitialLoad) {
        setTimeout(() => {
          document.getElementById('section-3')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [sectionComplete[2], hasUrlParams, isInitialLoad]);

  useEffect(() => {
    if (sectionComplete[3]) {
      // Expand section if not already expanded
      if (!expandedSections[4]) {
        setExpandedSections(prev => ({ ...prev, 4: true }));
      }
      // Scroll whenever date is complete (even if section already expanded)
      if (!hasUrlParameters() && !isInitialLoad) {
        setTimeout(() => {
          document.getElementById('section-4')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [sectionComplete[3], isInitialLoad]);

  useEffect(() => {
    // Only expand section 5 if section 4 is truly complete (all attendees have complete details AND confirmed photocards)
    const allAttendeesComplete = attendeeDetails.slice(0, attendees).every(a => isAttendeeComplete(a));
    const allPhotocardsConfirmed = photocardConfirmed.slice(0, attendees).every(c => c);
    const shouldBeExpanded = allAttendeesComplete && allPhotocardsConfirmed;

    if (shouldBeExpanded) {
      // Expand section if not already expanded
      setExpandedSections(prev => {
        if (!prev[5]) {
          return { ...prev, 5: true };
        }
        return prev;
      });
      // Scroll whenever all attendees are complete (even if section already expanded)
      if (!hasUrlParameters() && !isInitialLoad) {
        setTimeout(() => {
          document.getElementById('section-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    } else {
      // Collapse section 5 if conditions are no longer met
      setExpandedSections(prev => {
        if (prev[5]) {
          return { ...prev, 5: false };
        }
        return prev;
      });
    }
  }, [attendeeDetails, photocardConfirmed, attendees, isInitialLoad]);

  // Collapse first attendee when photocard is confirmed
  useEffect(() => {
    if (confirmPhotocard && expandedAttendeeIndex === 0 && attendees === 1) {
      setExpandedAttendeeIndex(-1);
    }
  }, [confirmPhotocard, attendees]);

  // Track whether the user manually toggled an attendee (to avoid auto-expand overriding it)
  const manualToggleRef = useRef(false);

  // Auto-expand next attendee only when current attendee is complete AND photocard is confirmed
  // BUT skip if the user just manually toggled to go back and edit a previous attendee
  useEffect(() => {
    if (attendees <= 1) return;

    // If the user manually clicked a toggle, don't auto-advance — just reset the flag
    if (manualToggleRef.current) {
      manualToggleRef.current = false;
      return;
    }

    const currentIndex = expandedAttendeeIndex;
    // Only proceed if we have a valid current index
    if (currentIndex >= 0 && currentIndex < attendees) {
      const currentAttendee = attendeeDetails[currentIndex];
      const isCurrentComplete = isAttendeeComplete(currentAttendee);
      const isPhotocardConfirmed = photocardConfirmed[currentIndex];

      // Only auto-expand next attendee if BOTH conditions are met:
      // 1. All required fields are filled for current attendee
      // 2. Photocard is confirmed for current attendee
      if (isCurrentComplete && isPhotocardConfirmed) {
        if (currentIndex < attendees - 1) {
          setExpandedAttendeeIndex(currentIndex + 1);
        }
      }
    }
  }, [attendeeDetails, photocardConfirmed, expandedAttendeeIndex, attendees]);

  // Reset attendees to 1 only when the user picks a DIFFERENT date (not on first selection from null)
  useEffect(() => {
    const dateStr = selectedDate ? formatLocalDate(selectedDate) : null;
    if (prevDateStrRef.current !== null && dateStr !== null && prevDateStrRef.current !== dateStr) {
      // Date actually changed from one valid date to another — reset attendees & confirmation
      setAttendees(1);
      setDateTimeConfirmed(false);
    }
    prevDateStrRef.current = dateStr;
  }, [selectedDate]);

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
            dateOfBirth: "",
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
            isPrimaryUser: false,
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
        selectedDate: (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) ? selectedDate.toISOString() : null,
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

      localStorage.setItem('booking_form_data', JSON.stringify(formData));
    }
  }, [selectedCourse, locationId, selectedDate, selectedCourseEventId, attendees, attendeeDetails, confirmPhotocard, acceptTerms]);

  // Load settings and license types when needed (step 5) — memoized to avoid redundant calls while user types

  useEffect(() => {
    if (!selectedDate || attendees <= 0) return;

    const current = {
      selectedCourseId: selectedCourse?.id ?? null,
      locationId: locationId ?? null,
      selectedCourseEventId: selectedCourseEventId ?? null,
      selectedDateISO: (selectedDate instanceof Date && !isNaN(selectedDate.getTime())) ? selectedDate.toISOString() : null,
      attendees,
    };

    // If we've already fetched for the same parameters, skip
    if (
      step5FetchedRef.current &&
      step5FetchedRef.current.selectedCourseId === current.selectedCourseId &&
      step5FetchedRef.current.locationId === current.locationId &&
      step5FetchedRef.current.selectedCourseEventId === current.selectedCourseEventId &&
      step5FetchedRef.current.selectedDateISO === current.selectedDateISO &&
      step5FetchedRef.current.attendees === current.attendees
    ) {
      return;
    }

    const loadStep5Data = async () => {
      const [settingsData, licenseTypesData, vehicleTypesData] = await Promise.all([
        bookingApi.getSettings().catch(() => ({ vat_rate: 0.2, credit_card_surcharge: 0, booking_bcc: '' })),
        bookingApi.getLicenseTypes().catch(() => [{ id: 1, licence_type: "UK Full Licence", status: 1 }]),
        current.selectedCourseId && current.locationId && current.selectedCourseEventId
          ? bookingApi.getVehicleTypesByCourseAndLocation(current.selectedCourseId, current.locationId, current.selectedCourseEventId).catch(() => ({}))
          : Promise.resolve({})
      ]);
      setSettings(settingsData);
      setLicenseTypes(licenseTypesData);
      setAvailableVehicleTypes(vehicleTypesData);

      // Don't auto-select defaults - users must choose from 'Please select'

      step5FetchedRef.current = current;
    };

    loadStep5Data();
  }, [selectedDate instanceof Date && !isNaN(selectedDate.getTime()) ? selectedDate.toISOString() : null, attendees, selectedCourse?.id, locationId, selectedCourseEventId]);

  // Get user IP and check block status on load
  useEffect(() => {
    // Check URL params synchronously first to prevent race condition
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('course_id');
    const locationIdParam = urlParams.get('location_id');
    const dateParam = urlParams.get('date');
    const hasParams = !!(courseId || locationIdParam || dateParam);
    setHasUrlParams(hasParams);

    const initializeBooking = async () => {
      try {
        setLoading(true);

        // URL params already parsed above
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

        // Don't set isInitialLoad to false here - let it happen after default course selection
      } catch (err) {
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
      } catch {
        // ignore malformed storage payloads
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
        // Note: locationId validation is handled by a separate effect below to avoid stale-closure bugs
      } catch (err) {
        setLocations([]);
      }
    };

    loadLocations();
  }, [selectedCourse]);

  // Validate that the current locationId is valid for the loaded locations list.
  // This runs when locations are refreshed (e.g. after course change) and safely
  // uses current state instead of a potentially stale async closure.
  useEffect(() => {
    if (locationId !== null && locations.length > 0 && !locations.some(l => l.id === locationId)) {
      setLocationId(null);
    }
  }, [locations, locationId]);

  // Fetch course bullet points when course changes
  useEffect(() => {
    const fetchBulletPoints = async () => {
      if (!selectedCourse) {
        setCourseBulletPoints('');
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/helper/course-bullet-points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ course_id: selectedCourse.id })
        });
        const data = await response.json();
        setCourseBulletPoints(data.success && data.data?.bullet_points ? data.data.bullet_points : '');
      } catch (error) {
        setCourseBulletPoints('');
      }
    };

    fetchBulletPoints();
  }, [selectedCourse]);

  // Only auto-select course from URL params, don't pre-select by default
  useEffect(() => {
    if (Array.isArray(courses) && courses.length > 0 && !selectedCourse && hasUrlParams) {
      // Only auto-select if there are URL parameters
      const defaultCourse = courses.find(c => c.id === 1);
      if (defaultCourse) {
        setSelectedCourse(defaultCourse);
        // Start timer AFTER selecting default course to prevent scroll during initial expansion
        const timer = setTimeout(() => {
          setIsInitialLoad(false);
        }, 600);
        return () => clearTimeout(timer);
      }
    } else if (selectedCourse && isInitialLoad) {
      // If course already selected (from URL params), start timer once
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 600);
      return () => clearTimeout(timer);
    } else if (!hasUrlParams && !isInitialLoad) {
      // No URL params and not initial load, ensure timer completes
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [courses, selectedCourse, hasUrlParams]); // Removed isInitialLoad to prevent effect re-running when timer completes

  // Track last availability fetch to avoid duplicate requests

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

        // Only auto-select first available date if there was a date parameter in URL
        const urlParams = new URLSearchParams(window.location.search);
        const dateParam = urlParams.get('date');

        if (availability.length > 0 && !selectedDate && dateParam) {
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
        setCourseEvents([]);
        availabilityFetchedRef.current = null;
      }
    };

    loadAvailability();
  }, [selectedCourse, locationId]);

  const weeks = useCalendarWeeks(courseEvents, calendarMonthOffset);

  const currentLocation = useMemo(
    () => locationId ? locations.find((l) => l.id === locationId) : null,
    [locations, locationId]
  );

  // Calculate pricing when details change
  const pricingDeps = useMemo(
    () => {
      const deps = attendeeDetails.slice(0, attendees).map(a => `${a.vehicleType}-${a.licenseType}`).join(',');

      return deps;
    },
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
        setPricing(null);
      }
    };

    calculatePricing();
  }, [selectedCourseEventId, attendees, pricingDeps]);

  const subtotal = pricing?.final_totals?.subtotal || 0;
  const vat = pricing?.final_totals?.vat || 0;
  const totalBeforeDiscount = pricing?.final_totals?.final_amount || 0;
  const discount = promoData?.valid
    ? (promoData.discount_type === 'percent_off'
        ? (totalBeforeDiscount * (Number(promoData.discount_amount) || 0)) / 100
        : Number(promoData.discount_amount) || 0)
    : 0;
  const total = Math.max(0, totalBeforeDiscount - discount);

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
      return false;
    }
  };

  const handlePhotocardChange = async (index: number, confirmed: boolean) => {
    setPhotocardConfirmed(prev => {
      const newConfirmed = [...prev];
      newConfirmed[index] = confirmed;
      return newConfirmed;
    });
    // Section 5 expansion is handled by the useEffect hook that checks if ALL conditions are met:
    // 1. All attendees have complete details
    // 2. All photocards are confirmed
  };

  const handleApplyPromo = async () => {
    setPromoError(null);
    setPromoSuccess(null);

    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    if (!selectedCourse || !locationId) {
      toast.error('Please select a course and location first');
      return;
    }

    setIsValidatingPromo(true);
    toast.loading('Validating promo code...', { id: 'promo-validation' });

    try {
      // Collect all license numbers from attendee details
      const licenseNumbers = attendeeDetails
        .map(a => a.licenseNumber?.trim())
        .filter(ln => ln && ln.length > 0);

      const response = await fetch(`${BASE_URL}/booking/promo-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promo_code: promoCode.trim(),
          course_id: selectedCourse.id,
          location_id: locationId,
          attendees_count: attendees,
          license_numbers: licenseNumbers
        })
      });

      const data = await response.json();

      if (data.success && data.data.valid) {
        setPromoData(data.data);
        setPromoSuccess(data.data.description || 'Promo code applied successfully!');
        toast.success(data.data.description || 'Promo code applied successfully!', { id: 'promo-validation' });
      } else {
        setPromoData(null);
        setPromoError(data.message || 'Invalid promo code');
        toast.error(data.message || 'Invalid promo code', { id: 'promo-validation' });
      }
    } catch (error) {
      setPromoData(null);
      setPromoError('Failed to validate promo code');
      toast.error('Failed to validate promo code', { id: 'promo-validation' });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoData(null);
    setPromoError(null);
    setPromoSuccess(null);
    toast.success('Promo code removed');
  };

  async function handleCreateBooking() {
    const missing = [];
    if (!selectedCourse) missing.push("Course");
    if (!locationId) missing.push("Location");
    if (!selectedDate) missing.push("Date");
    if (!selectedCourseEventId) missing.push("Course event");
    if (attendees < 1) missing.push("Number of attendees");

    // Calculate age on course date
    const calculateAge = (dob: string, courseDate: Date): number => {
      const [day, month, year] = dob.split('/').map(Number);
      if (!day || !month || !year) return -1;
      const birthDate = new Date(year, month - 1, day);
      let age = courseDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = courseDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && courseDate.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    // Validate all attendees
    for (let idx = 0; idx < attendeeDetails.slice(0, attendees).length; idx++) {
      const attendee = attendeeDetails[idx];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[0-9\s()-]+$/;
      const dobMatch = attendee.dateOfBirth?.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      const email = attendee.email?.trim() || '';
      const confirmEmail = attendee.confirmEmail?.trim() || '';
      const phone = attendee.phone?.trim() || '';
      const normalizedPhone = phone.replace(/[\s()-]/g, '');
      const isDobValid = (() => {
        if (!dobMatch) return false;
        const [, dayStr, monthStr, yearStr] = dobMatch;
        const day = Number(dayStr);
        const month = Number(monthStr);
        const year = Number(yearStr);
        const date = new Date(year, month - 1, day);
        return (
          date.getFullYear() === year &&
          date.getMonth() === month - 1 &&
          date.getDate() === day
        );
      })();

      if (!attendee.firstName) missing.push(`Attendee ${idx + 1}: First name`);
      if (!attendee.lastName) missing.push(`Attendee ${idx + 1}: Last name`);
      if (!attendee.dateOfBirth) missing.push(`Attendee ${idx + 1}: Date of Birth`);
      if (attendee.dateOfBirth && !isDobValid) {
        toast.error(`Attendee ${idx + 1}: Please enter date of birth in dd/mm/yyyy format`);
        return;
      }
      if (!email) missing.push(`Attendee ${idx + 1}: Email`);
      if (!confirmEmail) missing.push(`Attendee ${idx + 1}: Confirm Email`);
      if (email && !emailRegex.test(email)) {
        toast.error(`Attendee ${idx + 1}: Please enter a valid email address`);
        return;
      }
      if (confirmEmail && !emailRegex.test(confirmEmail)) {
        toast.error(`Attendee ${idx + 1}: Please enter a valid confirm email address`);
        return;
      }
      if (email && confirmEmail && email.toLowerCase() !== confirmEmail.toLowerCase()) {
        toast.error(`Attendee ${idx + 1}: Emails do not match`);
        return;
      }
      if (!phone) missing.push(`Attendee ${idx + 1}: Phone`);
      if (phone && (!phoneRegex.test(phone) || !/^\+?[0-9]+$/.test(normalizedPhone))) {
        toast.error(`Attendee ${idx + 1}: Please enter a valid phone number`);
        return;
      }

      // License number validation - skip if license type is 4 (Other/No Licence)
      const isOtherLicense = attendee.licenseType === '4';
      if (!isOtherLicense) {
        if (!attendee.licenseNumber || attendee.licenseNumber.length !== 16) {
          missing.push(`Attendee ${idx + 1}: Driving licence number (16 characters)`);
        } else if (!/^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/.test(attendee.licenseNumber)) {
          toast.error(`Attendee ${idx + 1}: Invalid Licence Number.`);
          return;
        }
      }

      // Validate age on course date
      if (attendee.dateOfBirth && selectedDate) {
        const age = calculateAge(attendee.dateOfBirth, selectedDate);
        if (age < 16) {
          alert(`Attendee ${idx + 1}: You must be at least 16 years of age on the day of your course in order to proceed with your booking.`);
          return;
        }
      }

      if (attendee.registerAsUser) {
        if (!attendee.password.trim()) {
          toast.error(`Attendee ${idx + 1}: Password cannot be empty or contain only spaces`);
          return;
        }
        if (attendee.password.length < 8) missing.push(`Attendee ${idx + 1}: Password (min 8 characters)`);
        if (attendee.password !== attendee.confirmPassword) {
          toast.error(`Attendee ${idx + 1}: Passwords do not match`);
          return;
        }
      }

      // Check if license is blacklisted (skip if license type is 4)
      if (!isOtherLicense && attendee.licenseNumber && attendee.licenseNumber.length === 16) {
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

    // Deposit cutoff guard: re-evaluate at submission time in case the page was left open
    if (selectedCourseEventId && selectedDate) {
      const selectedEvent = courseEvents.find(e => e.course_event_id === selectedCourseEventId);
      if (selectedEvent?.pricing) {
        const { paymentType } = resolvePaymentType(selectedEvent.pricing, selectedDate);
        // If the server said deposit but cutoff has now passed, block submission
        if (selectedEvent.pricing.pricing_mode === 'deposit' && paymentType === 'FULL' && !selectedEvent.pricing.deposit_available) {
          toast.error('This course now requires full payment as the start date is too soon. Please refresh and try again.');
          return;
        }
      }
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
          date_of_birth: attendee.dateOfBirth,
          email: attendee.email,
          contact1: attendee.phone,
          contact2: attendee.alternativePhone || undefined,
          license_number: attendee.licenseNumber,
          license_type: Number(attendee.licenseType) || 1,
          vehicle_type: Number(attendee.vehicleType) || 0,
          theory_number: attendee.theoryNumber || undefined,
          password: attendee.registerAsUser && attendee.password ? encryptPassword(attendee.password) : undefined,
          is_primary_user: attendee.isPrimaryUser || false,
          notes: attendee.notes || undefined,
        })),
        photocard_confirmed: photocardConfirmed.slice(0, attendees).every(c => c),
        terms_agreed: acceptTerms,
      };

      const response = await bookingApi.createBookingWithAttendeesNew(bookingData);

      localStorage.removeItem('booking_form_data');

      const allRefs: string[] = response.booking_refs || [response.booking_ref];
      setBookingRef(response.booking_ref);

      if (response.client_secret) {
        toast.success(`Booking created! Reference${allRefs.length > 1 ? 's' : ''}: ${allRefs.join(', ')}`);
        return { clientSecret: response.client_secret, bookingRef: response.booking_ref, bookingRefs: allRefs, paymentRequired: true };
      }

      toast.success(`Booking created! Reference${allRefs.length > 1 ? 's' : ''}: ${allRefs.join(', ')}. (No payment required)`);
      return { bookingRef: response.booking_ref, bookingRefs: allRefs, paymentRequired: false };
    } catch (error: any) {
      const errMsg = error?.data?.message || (error instanceof Error ? error.message : (error?.response?.data?.message ?? 'Unknown error'));

      if (typeof error?.data?.available_spaces === 'number') {
        toast.error(errMsg || 'Selected date is no longer available. Please choose another date.');
        setCourseLocationError(errMsg || 'Selected date is no longer available. Please choose another date.');
        setSelectedDate(null);
        setSelectedCourseEventId(null);

        // Refresh availability to show updated spaces
        if (selectedCourse && locationId) {
          bookingApi.getCourseAvailability(selectedCourse.id, locationId)
            .then(availabilityData => {
              setCourseEvents(availabilityData.data.availability);
            })
            .catch(() => {
              setCourseEvents([]);
            });
        }
      } else if (error?.status === 400 && (!error?.data || !error?.data?.message)) {
        toast.error('We couldn’t create the booking. Please review your details and try again.');
      } else {
        toast.error(`Booking failed: ${errMsg}`);

        // Refresh availability if error mentions spaces/availability
        const lowerErrMsg = String(errMsg).toLowerCase();
        if (lowerErrMsg.includes('availab') || lowerErrMsg.includes('space') || lowerErrMsg.includes('full') || lowerErrMsg.includes('sold out')) {
          if (selectedCourse && locationId) {
            bookingApi.getCourseAvailability(selectedCourse.id, locationId)
              .then(availabilityData => {
                setCourseEvents(availabilityData.data.availability);
              })
              .catch(() => {
                setCourseEvents([]);
              });
          }
        }
      }

      throw error;
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <a href="/gift-voucher" className="text-sm font-medium text-teal-700 hover:text-teal-800 underline-offset-2 hover:underline">Purchase Gift Voucher</a>
            <div className="flex items-center gap-2">
              <Badge>Secure booking</Badge>
              <Badge>Pay only at last step</Badge>
            </div>
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
                    <div key={`course-${c.id}-${c.course_name}-${index}`} className="relative">
                      <RadioCard
                        checked={isSelected}
                        onChange={() => {
                          if (selectedCourse?.id !== c.id || selectedCourse?.course_name !== c.course_name) {
                            resetStep2AndBelow();
                          }
                          setSelectedCourse(c);
                        }}
                        title={c.course_name}
                      />
                      {c.description && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCourseInfo(c);
                            setShowCourseInfo(true);
                          }}
                          className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors z-10"
                          title="Course information"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
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
                    onChange={() => {
                      if (locationId !== l.id) {
                        resetStep3AndBelow();
                        setCourseEvents([]);
                        availabilityFetchedRef.current = null;
                      }
                      setLocationId(l.id);
                    }}
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
                                  : "border-emerald-500 bg-white text-slate-900 hover:border-emerald-600"
                                : "border-red-300 bg-red-50 text-red-500 cursor-not-allowed"
                              }`}
                          >
                            <div>{cell.date.getDate()}</div>
                            <div className="text-[10px]">{inCurrentMonth && cell.available ? `x${cell.spots}` : inCurrentMonth ? "—" : ""}</div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Attendees Selector - moved from sidebar */}
              {selectedDate && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <h4 className="mb-3 text-sm font-semibold text-slate-900">Select Number of Spaces</h4>
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
                  <p className="mt-2 text-xs text-slate-500 text-center">{selectedDate ? "Spaces Available: " + (weeks.flat().find(c => c.date.toDateString() === new Date(selectedDate).toDateString())?.spots ?? "—") : ""}</p>
                </div>
              )}

              {/* Course Details Summary */}
              {selectedDate && (() => {
                const selectedEvent = courseEvents.find(event => {
                  const eventDate = new Date(event.date);
                  return formatLocalDate(eventDate) === formatLocalDate(selectedDate);
                });

                if (!selectedEvent) return null;

                const formatTime = (time: string | null) => {
                  if (!time) return '';
                  const [hours, minutes] = time.split(':');
                  const hour = parseInt(hours);
                  const ampm = hour >= 12 ? 'pm' : 'am';
                  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                  return `${displayHour}:${minutes} ${ampm}`;
                };

                const formatEventDate = (dateStr: string) => {
                  if (dateStr === 'TBC') return 'TBC';
                  const date = new Date(dateStr);
                  const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' });
                  const day = date.getDate();
                  const suffix = day === 1 || day === 21 || day === 31 ? 'st' :
                                day === 2 || day === 22 ? 'nd' :
                                day === 3 || day === 23 ? 'rd' : 'th';
                  const month = date.toLocaleDateString('en-GB', { month: 'long' });
                  const year = date.getFullYear();
                  return `${dayName} ${day}${suffix} ${month} ${year}`;
                };

                return (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 space-y-3 text-sm">
                    {selectedEvent.course_name && (
                      <div>
                        <strong className="text-slate-700">Course:</strong>
                        <div className="mt-1 text-slate-900">{selectedEvent.course_name}</div>
                      </div>
                    )}

                    {selectedEvent.all_dates && selectedEvent.all_dates.length > 0 && (
                      <div>
                        <strong className="text-slate-700">Date and Time:</strong>
                        <div className="mt-1 space-y-1">
                          {(() => {
                            const isMultiDay = selectedEvent.all_dates.length > 1;
                            return selectedEvent.all_dates.map((dateInfo) => (
                              <div key={dateInfo.day_number} className="text-slate-900">
                                {isMultiDay && `Day ${dateInfo.day_number} - `}{dateInfo.is_tbc ? 'TBC' :
                                  `${formatEventDate(dateInfo.event_date)} (${formatTime(dateInfo.event_start_time)} - ${formatTime(dateInfo.event_end_time)})`
                                }
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}

                    {currentLocation && (
                      <div>
                        <strong className="text-slate-700">Location:</strong>
                        <div className="mt-1 text-slate-900">
                          {[
                            currentLocation.location_name,
                            currentLocation.address1,
                            currentLocation.address2,
                            currentLocation.address3,
                            currentLocation.address4,
                            currentLocation.postcode
                          ].filter(Boolean).map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedEvent.pricing && (() => {
                      const { pricing } = selectedEvent;
                      const schoolAvailable = pricing.vehicle_options.school_vehicle_available;
                      const ownAvailable = pricing.vehicle_options.own_vehicle_available;

                      // Resolve effective payment type using centralised helper
                      const courseStart = selectedDate ? new Date(selectedDate) : null;
                      const { paymentType, forcedFullReason } = resolvePaymentType(pricing, courseStart);
                      const isDeposit = paymentType === 'DEPOSIT';

                      const renderVehiclePrice = (label: string, vehiclePricing: typeof pricing.school_vehicle) => {
                        if (vehiclePricing.pricing_type === 'deposit') {
                          const dp = vehiclePricing as { deposit: number; total: number; pricing_type: 'deposit' };
                          // Skip if both values are zero/null
                          if ((!dp.deposit || dp.deposit === 0) && (!dp.total || dp.total === 0)) return null;
                          return (
                            <div className="space-y-1">
                              <div className="font-medium text-slate-800">{label}</div>
                              <div className="ml-3 text-slate-900">
                                {isDeposit ? (
                                  <>
                                    <div>Deposit to Book: <span className="font-semibold">£{(dp.deposit || 0).toFixed(2)}</span></div>
                                    <div>Total Course Price: <span className="font-semibold">£{(dp.total || 0).toFixed(2)}</span></div>
                                  </>
                                ) : (
                                  <div>Full Payment Required: <span className="font-semibold">£{(dp.total || dp.deposit || 0).toFixed(2)}</span></div>
                                )}
                              </div>
                            </div>
                          );
                        } else {
                          const op = vehiclePricing as { price: number; pricing_type: 'one_off' | 'none' };
                          if (!op.price || op.price === 0) return null;
                          return (
                            <div className="space-y-1">
                              <div className="font-medium text-slate-800">{label}</div>
                              <div className="ml-3 text-slate-900">
                                <div>Price: <span className="font-semibold">£{op.price.toFixed(2)}</span></div>
                              </div>
                            </div>
                          );
                        }
                      };

                      // Always render both options when they exist — fixes the single-option bug
                      const schoolContent = schoolAvailable ? renderVehiclePrice('Using School Vehicle', pricing.school_vehicle) : null;
                      const ownContent = ownAvailable ? renderVehiclePrice('Using Your Own Vehicle', pricing.own_vehicle) : null;

                      if (!schoolContent && !ownContent) return null;

                      const WarningIcon = () => (
                        <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      );

                      return (
                        <div>
                          <strong className="text-slate-700">Pricing (per person):</strong>
                          <div className="mt-2 space-y-3">
                            {schoolContent}
                            {ownContent}
                          </div>

                          {/* Show deposit info banner ONLY when deposit is active */}
                          {isDeposit && (
                            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                              <WarningIcon />
                              <span>
                                This course only requires a deposit payment to secure your place.
                                The balance will need to be paid not later than{' '}
                                <strong>{pricing.deposit_days}</strong> days before the first day of your course.
                              </span>
                            </div>
                          )}

                          {/* Show forced-full warning when deposit was overridden by cutoff */}
                          {!isDeposit && forcedFullReason && (
                            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex items-start gap-2">
                              <WarningIcon />
                              <span>{forcedFullReason}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div>
                      <strong className="text-slate-700">Spaces Chosen:</strong>
                      <div className="mt-1 text-slate-900">{attendees}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Confirm Button */}
              {selectedDate && attendees > 0 && !dateTimeConfirmed && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDateTimeConfirmed(true);
                      // Auto-scroll to next section after confirmation
                      setTimeout(() => {
                        document.getElementById('section-4')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 150);
                    }}
                    className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition"
                  >
                    Confirm Date & Time
                  </button>
                </div>
              )}

              {dateTimeConfirmed && (
                <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-900 flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span><strong>Date & Time Confirmed!</strong> Proceed to Attendees Details below.</span>
                </div>
              )}
            </Section>

            {/* Step 4: Attendees Details (All Attendees) */}
            <Section
              index={4}
              title="Attendees Details"
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
                          // If setting isPrimaryUser to true, unset it for all others
                          if (field === 'isPrimaryUser' && value === true) {
                            const previousPrimaryIndex = newDetails.findIndex((a, i) => i !== index && a.isPrimaryUser);
                            if (previousPrimaryIndex !== -1) {
                              toast.warning(`Attendee ${index + 1} is now the Primary User. Attendee ${previousPrimaryIndex + 1} is no longer considered as Primary.`);
                            }
                            newDetails.forEach((a, i) => {
                              if (i !== index) a.isPrimaryUser = false;
                            });
                          }
                          newDetails[index] = { ...newDetails[index], [field]: value };
                          return newDetails;
                        });
                      }}
                      availableVehicleTypes={availableVehicleTypes}
                      licenseTypes={licenseTypes}
                      totalAttendees={attendees}
                      isExpanded={expandedAttendeeIndex === index}
                      onToggle={() => {
                        // Toggle: collapse if clicking the already-expanded attendee
                        if (expandedAttendeeIndex === index) {
                          manualToggleRef.current = true;
                          setExpandedAttendeeIndex(-1);
                          return;
                        }
                        // Always allow going back to a previously completed attendee for edits
                        if (index < expandedAttendeeIndex || isAttendeeComplete(attendeeDetails[index])) {
                          manualToggleRef.current = true;
                          setExpandedAttendeeIndex(index);
                          return;
                        }
                        // Gate: only allow expanding forward if all previous attendees are complete
                        for (let i = 0; i < index; i++) {
                          if (!isAttendeeComplete(attendeeDetails[i]) || !photocardConfirmed[i]) {
                            toast.error(`Please complete all required fields for Attendee ${i + 1} before proceeding.`);
                            return;
                          }
                        }
                        manualToggleRef.current = true;
                        setExpandedAttendeeIndex(index);
                      }}
                      isComplete={isAttendeeComplete(attendee)}
                      photocardConfirmed={photocardConfirmed[index] || false}
                      onPhotocardChange={(confirmed) => handlePhotocardChange(index, confirmed)}
                      licenseValidated={licenseValidated[index] || false}
                      duplicateLicenseIndex={duplicateLicenseIndex >= 0 ? duplicateLicenseIndex : null}
                      selectedDate={selectedDate}
                      disabled={index > 0 && !attendeeDetails.slice(0, index).every((a, i) => isAttendeeComplete(a) && photocardConfirmed[i])}
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
              onToggle={() => {
                // Only allow toggle if section 4 is complete
                if (sectionComplete[4]) {
                  setExpandedSections(prev => ({ ...prev, 5: !prev[5] }));
                }
              }}
              expandDisabled={!sectionComplete[4]}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 font-medium text-slate-900">Booking summary</p>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li><span className="text-slate-500">Course:</span> {selectedCourse?.course_name}</li>
                    <li><span className="text-slate-500">Location:</span> {currentLocation?.location_name}</li>
                    <li><span className="text-slate-500">Date:</span> {selectedDate ? selectedDate.toLocaleDateString('en-GB') : "—"}</li>
                    <li><span className="text-slate-500">Start Time:</span> {selectedDate ? (() => {
                      const selectedEvent = courseEvents.find(event => {
                        const eventDate = new Date(event.date);
                        return formatLocalDate(eventDate) === formatLocalDate(selectedDate);
                      });
                      return selectedEvent ? selectedEvent.event_start_time : '07:00';
                    })() : "—"}</li>
                    <li><span className="text-slate-500">Spaces:</span> {attendees}</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 font-medium text-slate-900">Pricing (per person)</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between"><span className="text-slate-600">Spaces</span><span className="font-medium text-slate-900">{attendees}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-600">Course fee</span><span className="font-medium text-slate-900"><Money value={subtotal} /></span></div>
                    {promoData?.valid && (
                      <div className="flex items-center justify-between text-green-600">
                        <span>
                          Discount {promoData.discount_type === 'percent_off'
                            ? `(${promoData.discount_amount}% off)`
                            : '(amount off)'}
                        </span>
                        <span className="font-medium">-<Money value={discount} /></span>
                      </div>
                    )}
                    <div className="mt-2 border-t pt-2 text-base font-semibold text-slate-900 flex items-center justify-between"><span>Total Payable</span><span><Money value={total} /></span></div>
                  </div>

                  {/* Promo Code Section */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs font-medium text-slate-700 mb-2">Have a promo code?</p>
                    {!promoData?.valid ? (
                      <>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => {
                              setPromoCode(e.target.value.toUpperCase());
                              setPromoError(null);
                              setPromoSuccess(null);
                            }}
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
                        {promoError && (
                          <p className="mt-2 text-xs text-red-600">{promoError}</p>
                        )}
                        {promoSuccess && (
                          <p className="mt-2 text-xs text-green-600">{promoSuccess}</p>
                        )}
                      </>
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

              <div className="mt-6">
                {acceptTerms ? (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      onCreatePaymentIntent={handleCreateBooking}
                      onSuccess={(refs) => {
                        window.location.href = `/bookings/payment-success?refs=${refs.join(',')}`;
                      }}
                      onCancel={(ref) => {
                        if (ref) {
                          window.location.href = `/bookings/payment-cancel?ref=${ref}`;
                        } else {
                          toast.info('Payment cancelled');
                        }
                      }}
                      bookingRef={bookingRef}
                      amount={Math.round(total * 100)}
                      paymentDisabled={!canPayNow}
                    />
                  </Elements>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Please accept the Terms & Conditions and Privacy Policy to proceed to payment.
                  </div>
                )}
              </div>
            </Section>
          </div>

          {/* Right: Sticky Order Summary */}
          <aside className="md:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-green-500 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Order summary</h3>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">Live</span>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Course</dt><dd className="text-right text-slate-900">{selectedCourse?.course_name}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Location</dt><dd className="text-right text-slate-900">{currentLocation?.location_name || "—"}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Date</dt><dd className="text-right text-slate-900">{selectedDate ? selectedDate.toLocaleDateString('en-GB') : "—"}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Start Time</dt><dd className="text-right text-slate-900">{selectedDate ? (() => {
                    const selectedEvent = courseEvents.find(event => {
                      const eventDate = new Date(event.date);
                      return formatLocalDate(eventDate) === formatLocalDate(selectedDate);
                    });
                    return selectedEvent ? selectedEvent.event_start_time : '07:00';
                  })() : "—"}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-slate-500">Spaces</dt><dd className="text-right text-slate-900">{attendees}</dd></div>
                </dl>
                <div className="my-3 border-t" />
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between"><span className="text-slate-600">Subtotal</span><span className="font-medium text-slate-900"><Money value={subtotal} /></span></div>
                  <div className="mt-2 flex items-center justify-between text-base font-semibold text-slate-900"><span>Total Payable</span><span><Money value={total} /></span></div>
                </div>
              </div>
              {courseBulletPoints ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div
                    className="text-sm text-slate-600 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_li]:text-slate-600"
                    dangerouslySetInnerHTML={{ __html: courseBulletPoints }}
                  />
                </div>
              ) : null}
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

      {/* Course Description Modal */}
      {showCourseInfo && selectedCourseInfo && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCourseInfo(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b border-slate-200">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  {selectedCourseInfo.course_name}
                </h3>
                {selectedCourseInfo.duration && (
                  <p className="text-sm text-slate-500 mt-1">
                    Duration: {selectedCourseInfo.duration}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowCourseInfo(false)}
                className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div
                className="prose prose-sm sm:prose max-w-none
                  prose-headings:text-slate-900 prose-headings:font-semibold
                  prose-p:text-slate-700 prose-p:leading-relaxed
                  prose-ul:text-slate-700 prose-ol:text-slate-700
                  prose-li:text-slate-700
                  prose-strong:text-slate-900 prose-strong:font-semibold
                  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: selectedCourseInfo.description }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowCourseInfo(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition"
              >
                Close
              </button>
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

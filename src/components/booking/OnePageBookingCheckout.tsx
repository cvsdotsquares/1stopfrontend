"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { bookingApi, type Course, type Location, type Settings, type VehicleType, type LicenseType, type CourseEvent } from "@/services/bookingApi";
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
function generateCalendarWeeksFrom(startRefDate = new Date(), courseEvents: CourseEvent[] = []) {
  const today = new Date(startRefDate);
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7)); // Monday start

  const days = 7 * 6; // 6 weeks
  const cells: CalendarCell[] = Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const inPast = d < today;

    // Check if this date has a course event
    const dateStr = d.toISOString().split('T')[0];
    const courseEvent = courseEvents.find(event => {
      // Convert the backend date format to just date string for comparison
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });

    const available = !inPast && courseEvent ? courseEvent.available && courseEvent.available_spaces > 0 : false;
    const spots = courseEvent?.available_spaces || 0;

    return {
      date: d,
      available,
      spots,
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
function useCalendarWeeks(courseEvents: CourseEvent[]) {
  return useMemo(() => generateCalendarWeeksFrom(new Date(), courseEvents), [courseEvents]);
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
  const [createAccount, setCreateAccount] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [copyToSection5, setCopyToSection5] = useState(false);
  const [confirmPhotocard, setConfirmPhotocard] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Booking Flow State
  const [ipBlocked, setIpBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [bookingLock, setBookingLock] = useState<{ lock_id: string, expires_at: string, event_id: string } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // When a lock is held, collapse sections 1 & 2 and disable changes; restore previous expansion when lock is released
  const prevExpandedRef = useRef<Record<number, boolean> | null>(null);
  // Temporary holder for a restored location id (applied after locations fetch completes)
  const restoredLocationIdRef = useRef<number | null>(null);
  useEffect(() => {
    if (bookingLock) {
      setExpandedSections(prev => {
        // save current state and collapse course/location
        prevExpandedRef.current = prev;
        return { ...prev, 1: false, 2: false };
      });
    } else if (prevExpandedRef.current) {
      setExpandedSections(prev => ({ ...prev, ...prevExpandedRef.current! }));
      prevExpandedRef.current = null;
    }
  }, [bookingLock]);
  const [userIP, setUserIP] = useState<string>('');

  // UI submit states
  const [isLocking, setIsLocking] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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

  // Account creation details
  const [accountDetails, setAccountDetails] = useState({
    firstName: "",
    surname: "",
    email: "",
    confirmEmail: "",
    password: "",
    verifyPassword: "",
    contactNumber1: "",
    addressLine1: "",
    postcode: "",
    addressLine2: "",
    addressLine3: "",
    contactNumber2: "",
    contactNumber3: "",
  });

  // Personal details - pre-fill if user is logged in
  const [details, setDetails] = useState({
    firstName: user?.first_name || "",
    lastName: user?.last_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    notes: "",
    password: "",
    vehicleType: "",
    licenseType: "",
    licenseNumber: "",
    theoryNumber: "",
  });

  // Update details when user changes or when copying from account creation
  useEffect(() => {
    if (user) {
      setDetails(prev => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true, // Always start with section 1 expanded
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
  });

  // Section completion validation
  const sectionComplete: Record<number, boolean> = {
    1: !!selectedCourse,
    2: !!locationId,
    3: !!selectedDate && attendees > 0,
    4: true, // Account section is always optional/complete
    5: !!details.firstName && !!details.lastName && !!details.email,
    6: false, // Final section never auto-completes
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
    if (allPreviousSectionsComplete(5) && !expandedSections[5]) {
      setExpandedSections(prev => ({ ...prev, 5: true }));
      setTimeout(() => {
        document.getElementById('section-5')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [sectionComplete[1], sectionComplete[2], sectionComplete[3], sectionComplete[4]]);

  useEffect(() => {
    if (sectionComplete[5] && !expandedSections[6]) {
      setExpandedSections(prev => ({ ...prev, 6: true }));
      setTimeout(() => {
        document.getElementById('section-6')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [sectionComplete[5]]);

  // Copy account details to section 5 when checkbox is checked
  useEffect(() => {
    if (copyToSection5 && createAccount) {
      setDetails(prev => ({
        ...prev,
        firstName: accountDetails.firstName,
        lastName: accountDetails.surname,
        email: accountDetails.email,
        phone: accountDetails.contactNumber1,
      }));
    }
  }, [copyToSection5, accountDetails, createAccount]);

  // Save sanitized form data to localStorage whenever it changes (DO NOT store sensitive fields like passwords)
  useEffect(() => {
    if (selectedCourse || locationId || selectedDate || details.firstName) {
      const formData = {
        // store only identifiers and minimal display name for the selected course
        selectedCourseId: selectedCourse?.id ?? null,
        selectedCourseName: selectedCourse?.course_name ?? null,
        locationId,
        selectedDate: selectedDate?.toISOString(),
        selectedCourseEventId,
        attendees,
        // store only non-sensitive details
        details: {
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email,
          phone: details.phone,
          notes: details.notes,
          vehicleType: details.vehicleType,
          licenseType: details.licenseType,
          licenseNumber: details.licenseNumber,
          theoryNumber: details.theoryNumber,
        },
        // store account fields but omit passwords and verification fields
        accountDetails: {
          firstName: accountDetails.firstName,
          surname: accountDetails.surname,
          email: accountDetails.email,
          contactNumber1: accountDetails.contactNumber1,
          addressLine1: accountDetails.addressLine1,
          postcode: accountDetails.postcode,
        },
        createAccount,
        confirmPhotocard,
        acceptTerms,
      };

      try {
        localStorage.setItem('booking_form_data', JSON.stringify(formData));
      } catch (e) {
        console.warn('Failed to save booking_form_data', e);
      }
    }
  }, [selectedCourse, locationId, selectedDate, selectedCourseEventId, attendees, details, accountDetails, createAccount, confirmPhotocard, acceptTerms]);

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
        setDetails(prev => ({
          ...prev,
          licenseType: prev.licenseType || (licenseTypesData && licenseTypesData.length > 0 ? String(licenseTypesData[0].id) : ''),
          vehicleType: prev.vehicleType || (vehicleTypesData && Object.keys(vehicleTypesData).length > 0 ? Object.keys(vehicleTypesData)[0] : ''),
        }));

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

        // Check for existing booking lock first
        const savedLock = localStorage.getItem('booking_lock');
        const savedFormData = localStorage.getItem('booking_form_data');

        if (savedLock) {
          const lockInfo = JSON.parse(savedLock);
          const expiry = new Date(lockInfo.expires_at).getTime();
          const now = new Date().getTime();

          if (expiry > now) {
            // Lock is still valid, restore state
            setBookingLock(lockInfo);
            setTimeRemaining(Math.max(0, expiry - now));

            if (savedFormData) {
              try {
                const formData = JSON.parse(savedFormData);

                // Rehydrate selectedCourse with minimal shape (full object will be available after courses load)
                if (formData.selectedCourseId) {
                  setSelectedCourse({ id: formData.selectedCourseId, course_name: formData.selectedCourseName } as Course);
                }

                setLocationId(formData.locationId ?? null);
                // Store the restored location id so we can re-apply it after locations are loaded
                restoredLocationIdRef.current = formData.locationId ?? null;
                setSelectedDate(formData.selectedDate ? new Date(formData.selectedDate) : null);
                setSelectedCourseEventId(formData.selectedCourseEventId ?? null);
                setAttendees(formData.attendees ?? 1);

                if (formData.details) {
                  setDetails(prev => ({ ...prev, ...formData.details, password: "" }));
                }

                if (formData.accountDetails) {
                  setAccountDetails(prev => ({ ...prev, ...formData.accountDetails, password: "", verifyPassword: "" }));
                }

                setCreateAccount(!!formData.createAccount);
                setConfirmPhotocard(!!formData.confirmPhotocard);
                setAcceptTerms(!!formData.acceptTerms);
              } catch (e) {
                console.warn('Failed to parse saved booking_form_data', e);
              }
            }

            toast.info('Previous booking session restored. Complete payment to secure your booking.');
          } else {
            // Lock expired, clear storage
            localStorage.removeItem('booking_lock');
            localStorage.removeItem('booking_form_data');
          }
        }

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

  // Sync booking lock and form data across tabs
  useEffect(() => {
    function handleStorageEvent(e: StorageEvent) {
      try {
        if (e.key === 'booking_lock') {
          if (!e.newValue) {
            // lock removed in another tab
            setBookingLock(null);
            setTimeRemaining(0);
            toast.info('Booking lock removed in another tab');
          } else {
            const lockInfo = JSON.parse(e.newValue);
            setBookingLock(lockInfo);
            const expiry = new Date(lockInfo.expires_at).getTime();
            setTimeRemaining(Math.max(0, expiry - Date.now()));
          }
        }

        if (e.key === 'booking_form_data' && e.newValue) {
          const formData = JSON.parse(e.newValue);

          if (formData.selectedCourseId) {
            setSelectedCourse({ id: formData.selectedCourseId, course_name: formData.selectedCourseName } as Course);
          }

          setLocationId(formData.locationId ?? null);
          setSelectedDate(formData.selectedDate ? new Date(formData.selectedDate) : null);
          setSelectedCourseEventId(formData.selectedCourseEventId ?? null);
          setAttendees(formData.attendees ?? 1);

          if (formData.details) setDetails(prev => ({ ...prev, ...formData.details, password: "" }));
          if (formData.accountDetails) setAccountDetails(prev => ({ ...prev, ...formData.accountDetails, password: "", verifyPassword: "" }));

          setCreateAccount(!!formData.createAccount);
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
        // If we have a restored location id (from restored storage), prefer and apply it
        if (restoredLocationIdRef.current != null) {
          const restored = restoredLocationIdRef.current;
          if (locationsData.some(l => l.id === restored)) {
            setLocationId(restored);
          } else {
            setLocationId(null);
          }
          restoredLocationIdRef.current = null;
        } else {
          // Don't auto-select first location - let user choose
          // Preserve current selection if it's still valid for the new course
          if (!locationsData.some(l => l.id === locationId)) {
            setLocationId(null);
          }
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
        setCourseEvents(response.data.availability);
        availabilityFetchedRef.current = { courseId: selectedCourse.id, locationId };
      } catch (err) {
        console.error('Failed to load availability:', err);
        setCourseEvents([]);
        availabilityFetchedRef.current = null;
      }
    };

    loadAvailability();
  }, [selectedCourse, locationId]);

  const weeks = useCalendarWeeks(courseEvents);

  const currentLocation = useMemo(
    () => locations.find((l) => l.id === locationId) || locations[0],
    [locations, locationId]
  );

  // Calculate pricing when details change
  useEffect(() => {
    const calculatePricing = async () => {
      if (!selectedCourseEventId || !details.vehicleType || !details.licenseType) {
        setPricing(null);
        return;
      }

      try {
        const attendees = [{
          vehicle_type: Number(details.vehicleType),
          license_type: details.licenseType
        }];

        const pricingResult = await bookingApi.calculatePrice(selectedCourseEventId, attendees);
        setPricing(pricingResult.pricing_breakdown);
      } catch (error) {
        console.error('Failed to calculate pricing:', error);
        setPricing(null);
      }
    };

    calculatePricing();
  }, [selectedCourseEventId, details.vehicleType, details.licenseType]);

  const subtotal = pricing?.final_totals?.subtotal || 0;
  const vat = pricing?.final_totals?.vat || 0;
  const total = pricing?.final_totals?.final_amount || 0;

  const handleRegister = async () => {
    // Basic client-side validation
    if (!accountDetails.firstName || !accountDetails.surname || !accountDetails.email) {
      toast.error('Please complete name and email to create an account');
      return;
    }
    if (accountDetails.email !== accountDetails.confirmEmail) {
      toast.error('Email and confirmation do not match');
      return;
    }
    if (!accountDetails.password || accountDetails.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (accountDetails.password !== accountDetails.verifyPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsRegistering(true);
    try {
      const { token, user } = await authApi.register({
        first_name: accountDetails.firstName,
        last_name: accountDetails.surname,
        email: accountDetails.email,
        password: accountDetails.password,
        phone: accountDetails.contactNumber1,
      });
      login(token, user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

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

  // Countdown timer effect
  const cleanupCalledRef = React.useRef(false);

  useEffect(() => {
    if (!bookingLock) return;

    // reset cleanup guard when a new lock is created
    cleanupCalledRef.current = false;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(bookingLock.expires_at).getTime();
      const remaining = Math.max(0, expiry - now);

      setTimeRemaining(remaining);

      if (remaining <= 0 && !cleanupCalledRef.current) {
        cleanupCalledRef.current = true; // ensure we call cleanup only once

        // Clear lock locally
        setBookingLock(null);
        localStorage.removeItem('booking_lock');
        localStorage.removeItem('booking_form_data');

        // Call cleanup API via bookingApi (POST expecting user_id & ip_address)
        // For anonymous users pass 0 so backend can cleanup guest prebookings correctly
        bookingApi.cleanupPrebookings(user?.id ?? 0, userIP).catch((err) => {
          console.error('cleanupPrebookings failed', err);
        });

        toast.error('Booking lock expired. Please try again.');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [bookingLock, user, userIP]);

  const formatTime = (ms: number) => {
    if (!ms || ms <= 0) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleBookNow = async () => {
    if (!selectedCourseEventId || !userIP) {
      toast.error('Missing required booking information');
      return;
    }

    // Validate required checkboxes
    if (!confirmPhotocard) {
      toast.error('Please confirm you can present your photocard driving licence');
      return;
    }
    if (!acceptTerms) {
      toast.error('Please accept the Terms & Conditions');
      return;
    }

    setIsLocking(true);
    try {
      // Check availability first
      const availability = await fetch(`${BASE_URL}/booking/course-availability/${selectedCourseEventId}`)
        .then(r => r.json());

      if (availability.available_spaces < attendees) {
        toast.error('Not enough spaces available');
        return;
      }

      // Lock spaces (include user_id; 0 if guest)
      const lockResponse = await fetch(`${BASE_URL}/booking/lock-spaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: selectedCourseEventId.toString(),
          space_count: attendees,
          ip_address: userIP,
          user_id: (user?.id ?? 0)
        })
      }).then(r => r.json());

      if (!lockResponse.success) {
        toast.error('Failed to lock booking spaces');
        return;
      }

      // Log IP activity
      await fetch(`${BASE_URL}/booking/log-ip-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip_address: userIP,
          lock_session_id: lockResponse.lock_id,
          booking_status: 'pending'
        })
      });

      // Store lock info and form data
      const tenMinutes = 10 * 60 * 1000;
      const expiry = new Date().getTime() + tenMinutes;
      const lockInfo = {
        lock_id: lockResponse.lock_id,
        expires_at: new Date(expiry).toISOString(),
        event_id: selectedCourseEventId.toString()
      };

      const formData = {
        selectedCourseId: selectedCourse?.id ?? null,
        selectedCourseName: selectedCourse?.course_name ?? null,
        locationId,
        selectedDate: selectedDate?.toISOString(),
        selectedCourseEventId,
        attendees,
        details: {
          firstName: details.firstName,
          lastName: details.lastName,
          email: details.email,
          phone: details.phone,
          notes: details.notes,
          vehicleType: details.vehicleType,
          licenseType: details.licenseType,
          licenseNumber: details.licenseNumber,
          theoryNumber: details.theoryNumber,
        },
        accountDetails: {
          firstName: accountDetails.firstName,
          surname: accountDetails.surname,
          email: accountDetails.email,
          contactNumber1: accountDetails.contactNumber1,
          addressLine1: accountDetails.addressLine1,
          postcode: accountDetails.postcode,
        },
        createAccount,
        confirmPhotocard,
        acceptTerms,
      };

      setBookingLock(lockInfo);
      localStorage.setItem('booking_lock', JSON.stringify(lockInfo));
      try {
        localStorage.setItem('booking_form_data', JSON.stringify(formData));
      } catch (e) {
        console.warn('Failed to save booking_form_data', e);
      }

      setTimeRemaining(tenMinutes);

      toast.success('Spaces locked! Complete payment within 10 minutes.');

    } catch (error) {
      toast.error('Failed to lock booking spaces');
    } finally {
      setIsLocking(false);
    }
  };

  async function handlePay() {
    const missing = [];
    if (!selectedCourse) missing.push("Course");
    if (!locationId) missing.push("Location");
    if (!selectedDate) missing.push("Date");
    if (!selectedCourseEventId) missing.push("Course event");
    if (!details.firstName) missing.push("First name");
    if (!details.lastName) missing.push("Last name");
    if (!details.email) missing.push("Email");
    if (attendees < 1) missing.push("Number of attendees");
    if (createAccount) {
      if (!accountDetails.password) missing.push("Password (for account)");
      if (accountDetails.password !== accountDetails.verifyPassword) {
        toast.error('Account password and verification do not match');
        return;
      }
      if (accountDetails.email !== accountDetails.confirmEmail) {
        toast.error('Account email and confirmation do not match');
        return;
      }
    }

    // Licence number must be exactly 16 characters
    if (!details.licenseNumber || details.licenseNumber.length !== 16) missing.push("Driving licence number (16 characters)");

    if (!bookingLock) missing.push("Booking lock (click Book Now first)");
    if (!confirmPhotocard) missing.push("Photocard confirmation");
    if (!acceptTerms) missing.push("Terms & Conditions acceptance");

    // Verify booking lock hasn't expired
    if (bookingLock) {
      try {
        const expiry = new Date(bookingLock.expires_at).getTime();
        if (Date.now() > expiry) {
          // Clear stale lock and prompt user to re-lock
          setBookingLock(null);
          localStorage.removeItem('booking_lock');
          localStorage.removeItem('booking_form_data');
          toast.error('Booking lock expired. Please click Book Now to re-lock your spaces.');
          return;
        }
      } catch (e) {
        // If parsing fails, remove stale data to be safe
        setBookingLock(null);
        localStorage.removeItem('booking_lock');
        localStorage.removeItem('booking_form_data');
      }
    }

    if (missing.length) {
      toast.error("Please complete: " + missing.join(", "));
      return;
    }

    setIsPaying(true);
    try {
      const bookingData = {
        course_id: selectedCourse!.id,
        course_event_id: selectedCourseEventId,
        location_id: locationId,
        selected_date: selectedDate!.toISOString().split('T')[0],
        attendees_count: attendees,
        lock_id: bookingLock!.lock_id,
        user_details: {
          first_name: details.firstName,
          sur_name: details.lastName,
          email: details.email,
          contact1: details.phone,
        },
        attendees: [{
          first_name: details.firstName,
          sur_name: details.lastName,
          contact1: details.phone,
          contact2: "",
          email: details.email,
          vehicle_type: Number(details.vehicleType) || 1,
          license_type: Number(details.licenseType) || 1,
          license_number: details.licenseNumber,
          theory_number: details.theoryNumber,
          notes: details.notes,
          primary: true,
        }],
        create_account: createAccount,
        password: accountDetails.password,
      };

      const response = await bookingApi.createBookingWithAttendees(bookingData);

      // Clear localStorage on successful booking
      localStorage.removeItem('booking_lock');
      localStorage.removeItem('booking_form_data');

      if (response.payment_data) {
        console.log('Payment Data Received:', response.payment_data);
        console.log('Payment URL:', response.payment_data.url);
        console.log('Payment Fields:', response.payment_data.fields);
        toast.success(`Booking created! Reference: ${response.booking_ref}. Redirecting to payment gateway…`);
        setPaymentFormUrl(response.payment_data.url);
        setPaymentFormFields(response.payment_data.fields);
      } else {
        console.warn('No payment data in response:', response);
        toast.success(`Booking created! Reference: ${response.booking_ref}. (No payment session generated)`);
      }
      // Here you would redirect to payment with response.payment_token
    } catch (error: any) {
      const errMsg = error instanceof Error ? error.message : (error?.response?.data?.message ?? 'Unknown error');
      const responseMsg = (error?.response?.data?.message ?? '').toString().toLowerCase();
      if (responseMsg.includes('lock') || responseMsg.includes('expired')) {
        toast.error('Booking failed: booking lock invalid or expired. Please click Book Now to re-lock your spaces.');
        // Clear local lock to force user to re-lock
        setBookingLock(null);
        localStorage.removeItem('booking_lock');
        localStorage.removeItem('booking_form_data');
      } else {
        toast.error(`Booking failed: ${errMsg}`);
      }
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
            {bookingLock && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-orange-600 font-medium">
                  Spaces locked - Complete payment in {formatTime(timeRemaining)}
                </span>
              </div>
            )}
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
              expandDisabled={!!bookingLock}
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
                      disabled={!!bookingLock}
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
              expandDisabled={!sectionComplete[1] || !!bookingLock}
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
                    disabled={!!bookingLock}
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
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                {/* Calendar */}
                <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-slate-900">Availability (next 6 weeks)</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-block h-3 w-3 min-w-3 rounded-sm bg-emerald-500" /> <span>Available</span>
                      <span className="inline-block h-3 w-3 min-w-3 rounded-sm bg-rose-500" /> <span>Fully booked</span>
                    </div>
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

                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={!cell.available}
                              onClick={() => {
                                setSelectedDate(cell.date);
                                setSelectedCourseEventId(cell.courseEventId || null);
                              }}
                              title={cell.available ? `${cell.spots} spots left` : "Not available"}
                              className={`aspect-square rounded-lg border text-sm tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${cell.available
                                ? isSelected
                                  ? "border-emerald-600 bg-emerald-600 text-white font-semibold"
                                  : "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                                : "border-red-300 bg-red-50 text-red-500 cursor-not-allowed"
                                } ${isToday ? "ring-2 ring-teal-400" : ""}`}
                            >
                              <div>{cell.date.getDate()}</div>
                              <div className="text-[10px]">{cell.available ? `${cell.spots}×` : "—"}</div>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Attendees */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 font-medium text-slate-900">Attendees</p>
                  <p className="mb-3 text-xs text-slate-500">Visit anytime during the scheduled time window on your chosen day.</p>
                  <div className="flex items-center gap-3">
                    <button type="button" className="h-9 w-9 cursor-pointer rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50" onClick={() => setAttendees((n) => Math.max(1, n - 1))}>−</button>
                    <input type="number" min={1} className="w-16 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm" value={attendees} onChange={(e) => setAttendees(Math.max(1, parseInt(e.target.value || "1", 10)))} />
                    <button type="button" className="h-9 w-9 cursor-pointer rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50" onClick={() => setAttendees((n) => n + 1)}>+</button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{selectedDate ? "Spots available: " + (weeks.flat().find(c => c.date.toDateString() === new Date(selectedDate).toDateString())?.spots ?? "—") : "Select a date to see availability."}</p>
                </div>
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

            {/* Step 4: Account / Login (optional) */}
            <Section
              index={4}
              title="Account (optional)"
              subtitle={isAuthenticated ? "You're logged in and ready to book." : "Booking as a guest is allowed. Create an account only if you want."}
              complete={sectionComplete[4]}
              open={expandedSections[4]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 4: !prev[4] }))}
              expandDisabled={!sectionComplete[3]}
            >
              {isAuthenticated ? (
                <div className="rounded-lg bg-green-50 p-4">
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
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <input id="createAccount" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />
                    <label htmlFor="createAccount" className="text-sm text-slate-700">Create an account for faster checkout next time</label>
                  </div>

                  {createAccount && (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="First name" required>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.firstName}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="2-50 characters"
                          />
                        </Field>
                        <Field label="Surname" required>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-sm  border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.surname}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, surname: e.target.value }))}
                            placeholder="2-50 characters"
                          />
                        </Field>
                        <Field label="Email" required>
                          <input
                            type="email"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.email}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="you@example.com"
                          />
                        </Field>
                        <Field label="Confirm Email" required>
                          <input
                            type="email"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.confirmEmail}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, confirmEmail: e.target.value }))}
                            placeholder="Confirm email"
                          />
                        </Field>
                        <Field label="Password" required>
                          <input
                            type="password"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.password}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Min 8 chars, uppercase, lowercase, number"
                          />
                        </Field>
                        <Field label="Verify Password" required>
                          <input
                            type="password"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.verifyPassword}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, verifyPassword: e.target.value }))}
                            placeholder="Confirm password"
                          />
                        </Field>
                        <Field label="Contact Number" required>
                          <input
                            type="tel"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.contactNumber1}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, contactNumber1: e.target.value }))}
                            placeholder="UK mobile number"
                          />
                        </Field>
                        <Field label="Contact Number 2">
                          <input
                            type="tel"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.contactNumber2}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, contactNumber2: e.target.value }))}
                            placeholder="Optional"
                          />
                        </Field>
                      </div>

                      <div className="space-y-4">
                        <Field label="Address Line 1" required>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.addressLine1}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, addressLine1: e.target.value }))}
                            placeholder="1-255 characters"
                          />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Address Line 2">
                            <input
                              type="text"
                              className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                              value={accountDetails.addressLine2}
                              onChange={(e) => setAccountDetails(prev => ({ ...prev, addressLine2: e.target.value }))}
                              placeholder="Optional"
                            />
                          </Field>
                          <Field label="Address Line 3">
                            <input
                              type="text"
                              className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                              value={accountDetails.addressLine3}
                              onChange={(e) => setAccountDetails(prev => ({ ...prev, addressLine3: e.target.value }))}
                              placeholder="Optional"
                            />
                          </Field>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Postcode" required>
                            <input
                              type="text"
                              className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                              value={accountDetails.postcode}
                              onChange={(e) => setAccountDetails(prev => ({ ...prev, postcode: e.target.value }))}
                              placeholder="UK postcode"
                            />
                          </Field>
                          <Field label="Contact Number 3">
                            <input
                              type="tel"
                              className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                              value={accountDetails.contactNumber3}
                              onChange={(e) => setAccountDetails(prev => ({ ...prev, contactNumber3: e.target.value }))}
                              placeholder="Optional"
                            />
                          </Field>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <button
                          type="button"
                          onClick={handleRegister}
                          disabled={isRegistering}
                          className={`w-full cursor-pointer px-4 py-2.5 text-base radius20-left radius20-right-bottom text-center text-white transition ${isRegistering ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                        >
                          {isRegistering ? 'Creating…' : 'Create Account'}
                        </button>
                      </div>

                      <div className="flex items-start gap-3">
                        <input
                          id="copyToSection5"
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          checked={copyToSection5}
                          onChange={(e) => setCopyToSection5(e.target.checked)}
                        />
                        <label htmlFor="copyToSection5" className="text-sm text-slate-700">
                          Copy these details to the booking form below
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="text-sm">
                    <button type="button" onClick={() => setShowLogin((v) => !v)} className="font-medium text-blue-700 underline-offset-2 hover:underline">{showLogin ? "Hide" : "Have an account?"} Sign in</button>
                  </div>

                  {showLogin && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Email" required>
                        <input
                          type="email"
                          className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                          value={loginDetails.email}
                          onChange={(e) => setLoginDetails(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field label="Password" required>
                        <input
                          type="password"
                          className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                          value={loginDetails.password}
                          onChange={(e) => setLoginDetails(prev => ({ ...prev, password: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </Field>
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleLogin}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Sign in
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Section>

            {/* Step 5: Personal Details */}
            <Section
              index={5}
              title="Your details"
              subtitle="We'll email your booking confirmation and joining instructions."
              complete={sectionComplete[5]}
              open={expandedSections[5]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 5: !prev[5] }))}
              expandDisabled={!allPreviousSectionsComplete(5)}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required>
                  <input type="text" className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.firstName} onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))} />
                </Field>
                <Field label="Last name" required>
                  <input type="text" className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.lastName} onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))} />
                </Field>
                <Field label="Email" required>
                  <input type="email" className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.email} onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))} placeholder="you@example.com" />
                </Field>
                <Field label="Phone">
                  <input type="tel" className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.phone} onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))} placeholder="Optional" />
                </Field>
                <Field label="Type Of Vehicle Required" required>
                  <select
                    className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    value={details.vehicleType}
                    onChange={(e) => setDetails((d) => ({ ...d, vehicleType: e.target.value }))}
                  >
                    <option value="">Select vehicle type</option>
                    {Object.entries(availableVehicleTypes).map(([key, description]) => (
                      <option key={key} value={key}>{description}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Driving Licence Type" required>
                  <select
                    className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    value={details.licenseType}
                    onChange={(e) => setDetails((d) => ({ ...d, licenseType: e.target.value }))}
                  >
                    <option value="">Select license type</option>
                    {licenseTypes.map((license) => (
                      <option key={license.id} value={license.id}>{license.licence_type}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Driving Licence Number" required hint="Must be 16 characters long">
                  <input
                    type="text"
                    className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    value={details.licenseNumber}
                    onChange={(e) => setDetails((d) => ({ ...d, licenseNumber: e.target.value }))}
                    placeholder="Must be 16 characters long"
                    maxLength={16}
                  />
                </Field>
                <Field label="Theory Number (If Applicable)">
                  <input
                    type="text"
                    className="mt-1 w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    value={details.theoryNumber}
                    onChange={(e) => setDetails((d) => ({ ...d, theoryNumber: e.target.value }))}
                    placeholder="Optional"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Order notes">
                    <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.notes} onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))} placeholder="Anything we should know?" />
                  </Field>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <input id="confirmPhotocard" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" checked={confirmPhotocard} onChange={(e) => setConfirmPhotocard(e.target.checked)} />
                <label htmlFor="confirmPhotocard" className="text-sm text-slate-700">
                  Please tick to confirm that the person attending the course above will be able to present their photocard driving licence on the day of the course.
                </label>
              </div>
            </Section>

            {/* Step 6: Review & Pay */}
            <Section
              index={6}
              title="Review & proceed to payment"
              subtitle="You'll be redirected to the secure payment page."
              complete={sectionComplete[6]}
              open={expandedSections[6]}
              onToggle={() => setExpandedSections(prev => ({ ...prev, 6: !prev[6] }))}
              expandDisabled={!sectionComplete[5]}
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
                    <li><span className="text-slate-500">Attendee:</span> {details.firstName && details.lastName ? `${details.firstName} ${details.lastName}` : "—"}</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 font-medium text-slate-900">Pricing</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between"><span className="text-slate-600">Attendees</span><span className="font-medium text-slate-900">{attendees}</span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-600">Course fee</span><span className="font-medium text-slate-900"><Money value={subtotal} /></span></div>
                    <div className="flex items-center justify-between"><span className="text-slate-600">VAT (20%)</span><span className="font-medium text-slate-900"><Money value={vat} /></span></div>
                    <div className="mt-2 border-t pt-2 text-base font-semibold text-slate-900 flex items-center justify-between"><span>Total</span><span><Money value={total} /></span></div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-4">
                <input id="terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
                <label htmlFor="terms" className="text-sm text-slate-700">I agree to the <a className="text-teal-700 underline-offset-2 hover:underline" href="#">Terms & Conditions</a> and <a className="text-teal-700 underline-offset-2 hover:underline" href="#">Privacy Policy</a>.</label>
              </div>

              <div className="mt-4 space-y-3">
                {!bookingLock ? (
                  <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-600">Click "Book Now" to lock your spaces, then proceed to payment.</p>
                    <button
                      type="button"
                      onClick={handleBookNow}
                      disabled={isLocking}
                      aria-busy={isLocking}
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${isLocking ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'}`}
                    >
                      {isLocking ? 'Locking…' : 'Book Now (Lock Spaces)'}
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
                    <div className="text-sm">
                      <p className="text-slate-600">Spaces locked! Complete payment within:</p>
                      <p className="font-mono text-lg font-bold text-orange-600">{formatTime(timeRemaining)}</p>
                    </div>
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
                )}
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
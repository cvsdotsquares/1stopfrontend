"use client";
import React, { useMemo, useState, useEffect } from "react";
import { bookingApi, type Course, type Location, type Settings, type VehicleType, type LicenseType, type CourseEvent } from "@/services/bookingApi";
import { authApi } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import { toast } from 'sonner';

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
  defaultOpen?: boolean;
  expandDisabled?: boolean;
}

function Section({ index, title, subtitle, children, complete, collapsible = true, defaultOpen = true, expandDisabled = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div
            className={`h-10 w-10 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
              complete ? "border-teal-500 bg-teal-500 text-white" : "border-teal-400 text-teal-600"
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
              <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            {collapsible && (
              <button
                type="button"
                onClick={() => !expandDisabled && setOpen((v) => !v)}
                disabled={expandDisabled}
                className={`ml-4 inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  expandDisabled
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
    <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
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
}

function RadioCard({ checked, onChange, onClick, title, caption, right }: RadioCardProps) {
  const handleClick = () => {
    onChange();
    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full rounded-xl border p-4 text-left transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
        checked ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white"
      }`}
      aria-pressed={!!checked}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`h-4 w-4 rounded-full border ${checked ? "border-teal-600 bg-teal-600" : "border-slate-400"}`} />
            <p className="font-medium text-slate-900">{title}</p>
          </div>
          {caption && <p className="mt-1 text-sm text-slate-500">{caption}</p>}
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
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCourseEventId, setSelectedCourseEventId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState(1);
  const [createAccount, setCreateAccount] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [copyToSection5, setCopyToSection5] = useState(false);

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

  // Load settings and license types when needed (step 5)
  useEffect(() => {
    if (selectedDate && attendees > 0) {
      const loadStep5Data = async () => {
        try {
          const [settingsData, licenseTypesData, vehicleTypesData] = await Promise.all([
            bookingApi.getSettings().catch(() => ({ vat_rate: 0.2, credit_card_surcharge: 0, booking_bcc: '' })),
            bookingApi.getLicenseTypes().catch(() => [{ id: 1, licence_type: "UK Full Licence", status: 1 }]),
            selectedCourse && locationId 
              ? bookingApi.getVehicleTypesByCourseAndLocation(selectedCourse.id, locationId).catch(() => ({}))
              : Promise.resolve({})
          ]);
          setSettings(settingsData);
          setLicenseTypes(licenseTypesData);
          setAvailableVehicleTypes(vehicleTypesData);
        } catch (err) {
          console.error('Failed to load step 5 data:', err);
        }
      };
      loadStep5Data();
    }
  }, [selectedDate, attendees, selectedCourse, locationId]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const coursesData = await bookingApi.getCourses().catch(() => []);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        // Don't auto-select first course - let user choose
      } catch (err) {
        console.error('Load initial data error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
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
        setLocationId(null);
      } catch (err) {
        console.error('Failed to load locations:', err);
        setLocations([]);
        setLocationId(null);
      }
    };

    loadLocations();
  }, [selectedCourse]);

  // Load availability when course/location changes
  useEffect(() => {
    const loadAvailability = async () => {
      if (!selectedCourse || !locationId) {
        setCourseEvents([]);
        return;
      }

      try {
        const response = await bookingApi.getCourseAvailability(selectedCourse.id, locationId);
        setCourseEvents(response.data.availability);
      } catch (err) {
        console.error('Failed to load availability:', err);
        setCourseEvents([]);
      }
    };

    loadAvailability();
  }, [selectedCourse, locationId]);

  const weeks = useCalendarWeeks(courseEvents);

  const currentLocation = useMemo(
    () => locations.find((l) => l.id === locationId) || locations[0],
    [locations, locationId]
  );

  const unitPrice = selectedCourse?.school_one_off_price || 0;
  const vatRate = settings?.vat_rate || 0.2;
  const { subtotal, vat, total } = computeTotals(unitPrice, attendees, vatRate);

  const handleRegister = async () => {
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
    if (createAccount && !accountDetails.password) missing.push("Password (for account)");

    if (missing.length) {
      toast.error("Please complete: " + missing.join(", "));
      return;
    }

    try {
      const bookingData = {
        course_id: selectedCourse!.id,
        course_event_id: selectedCourseEventId,
        location_id: locationId,
        selected_date: selectedDate!.toISOString().split('T')[0],
        attendees_count: attendees,
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
      toast.success(`Booking created! Reference: ${response.booking_ref}. Redirecting to payment gateway…`);
      // Here you would redirect to payment with response.payment_token
    } catch (error) {
      toast.error(`Booking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Book your course</h1>
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
            <Section index={1} title="Choose a course or voucher" subtitle="All sections are on one page – pick a course to continue." complete={!!selectedCourse} defaultOpen={true} collapsible={false}>
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.isArray(courses) && courses.map((c, index) => (
                  <RadioCard
                    key={`${c.id}-${index}`}
                    checked={selectedCourse?.id === c.id}
                    onClick={() => setSelectedCourse(c)}
                    onChange={() => setSelectedCourse(c)}
                    title={c.course_name}
                    caption={`Duration: ${c.duration}`}
                    right={<span className="text-sm font-semibold text-slate-900"><Money value={c.school_one_off_price} /></span>}
                  />
                ))}
              </div>
            </Section>

            {/* Step 2: Location */}
            <Section index={2} title="Pick a location" subtitle="Choose your preferred city/venue." complete={!!locationId} defaultOpen={!!selectedCourse} collapsible={true}>
              <div className="grid gap-3 sm:grid-cols-3">
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
            <Section index={3} title="Select date & time" subtitle="Pick a day and tell us how many attendees." complete={!!selectedDate && attendees > 0} defaultOpen={!!locationId} collapsible={true}>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Calendar */}
                <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-medium text-slate-900">Availability (next 6 weeks)</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500" /> <span>Available</span>
                      <span className="inline-block h-3 w-3 rounded-sm bg-rose-500" /> <span>Fully booked</span>
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
                              className={`aspect-square rounded-lg border text-sm tabular-nums transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/40 ${
                                cell.available
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
                    <button type="button" className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50" onClick={() => setAttendees((n) => Math.max(1, n - 1))}>−</button>
                    <input type="number" min={1} className="w-16 rounded-lg border border-slate-300 px-3 py-2 text-center text-sm" value={attendees} onChange={(e) => setAttendees(Math.max(1, parseInt(e.target.value || "1", 10)))} />
                    <button type="button" className="h-9 w-9 rounded-lg border border-slate-300 text-lg font-semibold hover:bg-slate-50" onClick={() => setAttendees((n) => n + 1)}>+</button>
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
            <Section index={4} title="Account (optional)" subtitle={isAuthenticated ? "You're logged in and ready to book." : "Booking as a guest is allowed. Create an account only if you want."} complete defaultOpen={!!selectedDate && attendees > 0} collapsible={true}>
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
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.firstName}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="2-50 characters"
                          />
                        </Field>
                        <Field label="Surname" required>
                          <input
                            type="text"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.surname}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, surname: e.target.value }))}
                            placeholder="2-50 characters"
                          />
                        </Field>
                        <Field label="Email" required>
                          <input
                            type="email"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.email}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="you@example.com"
                          />
                        </Field>
                        <Field label="Confirm Email" required>
                          <input
                            type="email"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.confirmEmail}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, confirmEmail: e.target.value }))}
                            placeholder="Confirm email"
                          />
                        </Field>
                        <Field label="Password" required>
                          <input
                            type="password"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.password}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, password: e.target.value }))}
                            placeholder="Min 8 chars, uppercase, lowercase, number"
                          />
                        </Field>
                        <Field label="Verify Password" required>
                          <input
                            type="password"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.verifyPassword}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, verifyPassword: e.target.value }))}
                            placeholder="Confirm password"
                          />
                        </Field>
                        <Field label="Contact Number" required>
                          <input
                            type="tel"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.contactNumber1}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, contactNumber1: e.target.value }))}
                            placeholder="UK mobile number"
                          />
                        </Field>
                        <Field label="Contact Number 2">
                          <input
                            type="tel"
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
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
                            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                            value={accountDetails.addressLine1}
                            onChange={(e) => setAccountDetails(prev => ({ ...prev, addressLine1: e.target.value }))}
                            placeholder="1-255 characters"
                          />
                        </Field>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Address Line 2">
                            <input
                              type="text"
                              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                              value={accountDetails.addressLine2}
                              onChange={(e) => setAccountDetails(prev => ({ ...prev, addressLine2: e.target.value }))}
                              placeholder="Optional"
                            />
                          </Field>
                          <Field label="Address Line 3">
                            <input
                              type="text"
                              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
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
                              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                              value={accountDetails.postcode}
                              onChange={(e) => setAccountDetails(prev => ({ ...prev, postcode: e.target.value }))}
                              placeholder="UK postcode"
                            />
                          </Field>
                          <Field label="Contact Number 3">
                            <input
                              type="tel"
                              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
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
                          className="w-full rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                        >
                          Create Account
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
                    <button type="button" onClick={() => setShowLogin((v) => !v)} className="font-medium text-teal-700 underline-offset-2 hover:underline">{showLogin ? "Hide" : "Have an account?"} Sign in</button>
                  </div>

                  {showLogin && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Email" required>
                        <input
                          type="email"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                          value={loginDetails.email}
                          onChange={(e) => setLoginDetails(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field label="Password" required>
                        <input
                          type="password"
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
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
            <Section index={5} title="Your details" subtitle="We'll email your booking confirmation and joining instructions." complete={!!details.firstName && !!details.lastName && !!details.email} defaultOpen={!!selectedDate && attendees > 0} collapsible={true}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required>
                  <input type="text" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.firstName} onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))} />
                </Field>
                <Field label="Last name" required>
                  <input type="text" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.lastName} onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))} />
                </Field>
                <Field label="Email" required>
                  <input type="email" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.email} onChange={(e) => setDetails((d) => ({ ...d, email: e.target.value }))} placeholder="you@example.com" />
                </Field>
                <Field label="Phone">
                  <input type="tel" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.phone} onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))} placeholder="Optional" />
                </Field>
                <Field label="Type Of Vehicle Required" required>
                  <select
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    value={details.licenseNumber}
                    onChange={(e) => setDetails((d) => ({ ...d, licenseNumber: e.target.value }))}
                    placeholder="Must be 16 characters long"
                    maxLength={16}
                  />
                </Field>
                <Field label="Theory Number (If Applicable)">
                  <input
                    type="text"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                    value={details.theoryNumber}
                    onChange={(e) => setDetails((d) => ({ ...d, theoryNumber: e.target.value }))}
                    placeholder="Optional"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Order notes">
                    <textarea rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30" value={details.notes} onChange={(e) => setDetails((d) => ({ ...d, notes: e.target.value }))} placeholder="Anything we should know?" />
                  </Field>
                </div>
              </div>

              <div className="mt-4 flex items-start gap-3">
                <input id="confirmPhotocard" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                <label htmlFor="confirmPhotocard" className="text-sm text-slate-700">
                  Please tick to confirm that the person attending the course above will be able to present their photocard driving licence on the day of the course.
                </label>
              </div>
            </Section>

            {/* Step 6: Review & Pay */}
            <Section index={6} title="Review & proceed to payment" subtitle="You'll be redirected to the secure payment page." complete defaultOpen={false} collapsible={true} expandDisabled={!(!!details.firstName && !!details.lastName && !!details.email)}>
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
                <input id="terms" type="checkbox" className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                <label htmlFor="terms" className="text-sm text-slate-700">I agree to the <a className="text-teal-700 underline-offset-2 hover:underline" href="#">Terms & Conditions</a> and <a className="text-teal-700 underline-offset-2 hover:underline" href="#">Privacy Policy</a>.</label>
              </div>

              <div className="mt-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
                <p className="text-sm text-slate-600">You will be redirected to a secure payment page to complete your booking.</p>
                <button type="button" onClick={handlePay} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40">
                  Proceed to payment
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h11a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </Section>
          </div>

          {/* Right: Sticky Order Summary */}
          <aside className="md:col-span-1">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">Order summary</h3>
                  <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">Live</span>
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
import React from 'react';

// ---------- DOB masked-input helpers ----------
// Character positions in 'dd/mm/yyyy' (10 chars) that hold digits
const DOB_DIGIT_POSITIONS = [0, 1, 3, 4, 6, 7, 8, 9] as const;
const DOB_MASK_CHARS = ['_', '_', '/', '_', '_', '/', '_', '_', '_', '_'] as const;

/** Builds a full 10-char display string, e.g. '2_/__/____' for digits='2' */
function buildDobDisplay(digits: string): string {
  let di = 0;
  return DOB_MASK_CHARS.map(ch => (ch === '/' ? '/' : di < digits.length ? digits[di++] : ch)).join('');
}

/** Maps a char position in the display string to its digit-slot index (snaps forward to next slot) */
function charPosToDigitIdx(charPos: number): number {
  for (let i = 0; i < DOB_DIGIT_POSITIONS.length; i++) {
    if (DOB_DIGIT_POSITIONS[i] >= charPos) return i;
  }
  return DOB_DIGIT_POSITIONS.length; // past end
}
// ---------- end DOB helpers ----------

interface AttendeeFormProps {
  index: number;
  attendee: {
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
    password: string;
    confirmPassword: string;
  };
  onChange: (field: string, value: string | boolean) => void;
  availableVehicleTypes: Record<string, string>;
  licenseTypes: Array<{ id: number; licence_type: string }>;
  totalAttendees: number;
  isExpanded: boolean;
  onToggle: () => void;
  /** Optional: ask parent to expand the next attendee (index+1) */
  onExpandNext?: () => void;
  isComplete: boolean;
  photocardConfirmed: boolean;
  onPhotocardChange: (confirmed: boolean) => void;
  licenseValidated: boolean;
  duplicateLicenseIndex: number | null;
  selectedDate: Date | null;
  disabled?: boolean;
  isLoggedIn?: boolean;
  canShowRegisterAsUserOption?: boolean;
  emailCheckState?: 'idle' | 'checking' | 'exists' | 'available' | 'error';
}

export default function AttendeeForm({
  index,
  attendee,
  onChange,
  availableVehicleTypes,
  licenseTypes,
  totalAttendees,
  isExpanded,
  onToggle,
  onExpandNext,
  isComplete,
  photocardConfirmed,
  onPhotocardChange,
  licenseValidated,
  duplicateLicenseIndex,
  selectedDate,
  disabled = false,
  isLoggedIn = false,
  canShowRegisterAsUserOption = false,
  emailCheckState = 'idle',
}: AttendeeFormProps) {
  const [ageWarning, setAgeWarning] = React.useState<string | null>(null);
  const [expandedMaxHeight, setExpandedMaxHeight] = React.useState('0px');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s()-]+$/;

  const emailValue = attendee.email?.trim() || '';
  const confirmEmailValue = attendee.confirmEmail?.trim() || '';
  const isEmailValid = emailValue ? emailRegex.test(emailValue) : false;
  const isConfirmEmailValid = confirmEmailValue ? emailRegex.test(confirmEmailValue) : false;
  const areEmailsMatching =
    emailValue && confirmEmailValue && emailValue.toLowerCase() === confirmEmailValue.toLowerCase();
  const shouldCheckExistingUser =
    index === 0 &&
    !isLoggedIn &&
    emailValue !== '' &&
    confirmEmailValue !== '' &&
    isEmailValid &&
    isConfirmEmailValid &&
    areEmailsMatching;
  const requiresRegistrationPassword = canShowRegisterAsUserOption && attendee.registerAsUser;
  const showRegisterAsUserCheckbox = !isLoggedIn && canShowRegisterAsUserOption;
  const showUserLookupFeedback =
    shouldCheckExistingUser &&
    (emailCheckState === 'checking' || emailCheckState === 'error') &&
    !showRegisterAsUserCheckbox;

  const isValidDob = (dob: string) => {
    const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;
    const [, dayStr, monthStr, yearStr] = match;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  };

  const formatDobInput = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const phoneValue = attendee.phone?.trim() || '';
  const normalizedPhone = phoneValue.replace(/[\s()-]/g, '');
  const isPhoneValid = phoneValue ? /^\+?[0-9]+$/.test(normalizedPhone) : false;

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

  // Validate date of birth
  const handleDobChange = (value: string) => {
    onChange('dateOfBirth', value);
    setAgeWarning(null);

    if (!value) return;

    if (value.length === 10 && !isValidDob(value)) {
      setAgeWarning('Please enter a valid date in dd/mm/yyyy format.');
      return;
    }

    if (value.length === 10 && selectedDate) {
      const age = calculateAge(value, selectedDate);
      if (age < 16) {
        setAgeWarning('You must be at least 16 years of age on the day of your course in order to proceed with your booking.');
      } else if (age === 16) {
        setAgeWarning('As you are 16, only Automatic or Own Vehicle can be selected.');
        // Clear vehicle type if it's not allowed for 16-year-olds
        if (attendee.vehicleType) {
          const desc = availableVehicleTypes[attendee.vehicleType]?.toLowerCase() || '';
          if (!desc.includes('automatic') && !desc.includes('own vehicle')) {
            onChange('vehicleType', '');
          }
        }
      }
    }
  };

  // --- Masked DOB input ---
  const dobInputRef = React.useRef<HTMLInputElement>(null);
  const formBodyRef = React.useRef<HTMLDivElement>(null);
  const pendingDobCursorPosRef = React.useRef<number | null>(null);
  // Raw digits extracted from the stored dateOfBirth value (max 8 digits)
  const dobDigits = (attendee.dateOfBirth || '').replace(/[^0-9]/g, '').slice(0, 8);
  // Show placeholder when empty; show masked value after first digit, e.g. '2_/__/____'
  const dobDisplay = dobDigits.length > 0 ? buildDobDisplay(dobDigits) : '';

  React.useLayoutEffect(() => {
    if (!dobInputRef.current || pendingDobCursorPosRef.current === null) return;
    const pos = pendingDobCursorPosRef.current;
    dobInputRef.current.setSelectionRange(pos, pos);
    pendingDobCursorPosRef.current = null;
  }, [dobDisplay]);

  React.useLayoutEffect(() => {
    const body = formBodyRef.current;
    if (!body) return;

    if (!isExpanded) {
      setExpandedMaxHeight('0px');
      return;
    }

    const updateMaxHeight = () => {
      setExpandedMaxHeight(`${body.scrollHeight}px`);
    };

    updateMaxHeight();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateMaxHeight);
      observer.observe(body);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateMaxHeight);
    return () => window.removeEventListener('resize', updateMaxHeight);
  }, [isExpanded]);

  /** Snap cursor to the correct pixel position after a state update */
  const snapDobCursor = (input: HTMLInputElement, afterDigitIdx: number, immediate = false) => {
    const clamped = Math.min(afterDigitIdx, DOB_DIGIT_POSITIONS.length);
    const pos = clamped >= DOB_DIGIT_POSITIONS.length ? 10 : DOB_DIGIT_POSITIONS[clamped];
    if (immediate) {
      input.setSelectionRange(pos, pos);
      return;
    }
    pendingDobCursorPosRef.current = pos;
  };

  const handleDobKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    // Pass through browser/OS shortcuts and Tab
    if (e.ctrlKey || e.metaKey || e.key === 'Tab') return;
    e.preventDefault();

    const selStart = input.selectionStart ?? 0;
    const digitIdx = charPosToDigitIdx(selStart);

    if (e.key === 'ArrowLeft') {
      const prev = Math.max(0, Math.min(digitIdx, dobDigits.length) - 1);
      input.setSelectionRange(DOB_DIGIT_POSITIONS[prev], DOB_DIGIT_POSITIONS[prev]);
      return;
    }
    if (e.key === 'ArrowRight') {
      snapDobCursor(input, Math.min(dobDigits.length, digitIdx + 1), true);
      return;
    }
    if (e.key === 'Home') {
      input.setSelectionRange(0, 0);
      return;
    }
    if (e.key === 'End') {
      snapDobCursor(input, dobDigits.length, true);
      return;
    }

    if (e.key === 'Backspace') {
      if (dobDigits.length === 0) return;
      const deleteIdx = Math.min(digitIdx, dobDigits.length) - 1;
      if (deleteIdx < 0) return;
      const newDigits = dobDigits.slice(0, deleteIdx) + dobDigits.slice(deleteIdx + 1);
      handleDobChange(formatDobInput(newDigits));
      snapDobCursor(input, deleteIdx);
      return;
    }
    if (e.key === 'Delete') {
      if (dobDigits.length === 0) return;
      const deleteIdx = Math.min(digitIdx, dobDigits.length - 1);
      const newDigits = dobDigits.slice(0, deleteIdx) + dobDigits.slice(deleteIdx + 1);
      handleDobChange(formatDobInput(newDigits));
      snapDobCursor(input, deleteIdx);
      return;
    }

    if (!/^\d$/.test(e.key)) return;

    // Overwrite at insertAt; if cursor is at first empty slot it acts as append
    const insertAt = Math.min(digitIdx, dobDigits.length);
    if (insertAt > 7) return; // mask is full and cursor is past end
    const newDigits = (dobDigits.slice(0, insertAt) + e.key + dobDigits.slice(insertAt + 1)).slice(0, 8);
    handleDobChange(formatDobInput(newDigits));
    snapDobCursor(input, insertAt + 1);
  };

  const handleDobPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 8);
    if (!digits) return;
    handleDobChange(formatDobInput(digits));
    snapDobCursor(e.currentTarget, digits.length);
  };

  const handleDobFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    snapDobCursor(e.currentTarget, dobDigits.length, true);
  };

  const handleDobClick = (e: React.MouseEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const clickPos = input.selectionStart ?? 0;
    // Snap to nearest slot but never past the first empty slot
    const snapIdx = Math.min(charPosToDigitIdx(clickPos), dobDigits.length);
    snapDobCursor(input, snapIdx, true);
  };
  // --- end masked DOB input ---

  // Check if a vehicle type is disabled
  const isVehicleTypeDisabled = (key: string, description: string) => {
    if (!attendee.dateOfBirth || !selectedDate) return false;
    const age = calculateAge(attendee.dateOfBirth, selectedDate);
    if (age === 16) {
      const desc = description.toLowerCase();
      return !desc.includes('automatic') && !desc.includes('own vehicle');
    }
    return false;
  };

  // Get all vehicle types with disabled status
  const getAllVehicleTypesWithStatus = () => {
    const entries = Object.entries(availableVehicleTypes);
    entries.sort(([, a], [, b]) => {
      const aIsAuto = a.toLowerCase().includes('automatic');
      const bIsAuto = b.toLowerCase().includes('automatic');
      if (aIsAuto && !bIsAuto) return -1;
      if (!aIsAuto && bIsAuto) return 1;
      return 0;
    });
    return entries;
  };

  const incompleteReasons: string[] = [];

  if (!attendee.firstName.trim()) incompleteReasons.push('Enter first name');
  if (!attendee.lastName.trim()) incompleteReasons.push('Enter last name');
  if (!attendee.dateOfBirth.trim()) {
    incompleteReasons.push('Enter date of birth');
  } else if (!isValidDob(attendee.dateOfBirth.trim())) {
    incompleteReasons.push('Use a valid date of birth in dd/mm/yyyy');
  }
  if (!emailValue) {
    incompleteReasons.push('Enter email');
  } else if (!isEmailValid) {
    incompleteReasons.push('Use a valid email address');
  }
  if (!confirmEmailValue) {
    incompleteReasons.push('Confirm email address');
  } else if (!isConfirmEmailValid) {
    incompleteReasons.push('Use a valid confirm email address');
  } else if (emailValue && isEmailValid && emailValue.toLowerCase() !== confirmEmailValue.toLowerCase()) {
    incompleteReasons.push('Email and confirm email must match');
  }
  if (!phoneValue) {
    incompleteReasons.push('Enter phone number');
  } else if (!isPhoneValid) {
    incompleteReasons.push('Use a valid phone number');
  }
  if (!attendee.vehicleType.trim()) incompleteReasons.push('Select vehicle type');
  if (!attendee.licenseType.trim()) incompleteReasons.push('Select driving licence type');
  if (attendee.licenseType !== '4') {
    if (!attendee.licenseNumber.trim()) {
      incompleteReasons.push('Enter driving licence number');
    } else if (
      attendee.licenseNumber.trim().length !== 16 ||
      !/^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/.test(attendee.licenseNumber)
    ) {
      incompleteReasons.push('Use a valid 16-character driving licence number');
    }
  }
  if (requiresRegistrationPassword) {
    if (attendee.password.length < 8) incompleteReasons.push('Use a password with at least 8 characters');
    if (attendee.password !== attendee.confirmPassword) incompleteReasons.push('Password and confirm password must match');
  }
  return (
    <div id ={`attendee-${index}`} className={`border rounded-xl overflow-hidden ${disabled ? 'border-slate-100 bg-white opacity-70' : 'border-slate-200 bg-white'}`}>
      <button
        type="button"
        onClick={disabled ? undefined : onToggle}
        disabled={disabled}
        className={`w-full flex items-center justify-between p-4 bg-slate-50 transition ${
          disabled ? 'cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isComplete ? 'bg-green-500 text-white' : disabled ? 'bg-slate-200 text-slate-400' : 'bg-slate-300 text-slate-700'
          }`}>
            {isComplete ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : disabled ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          <div>
            <h4 className={`text-base font-semibold ${disabled ? 'text-slate-400' : 'text-slate-900'}`}>
              Fill the details for attendee {index + 1}
            </h4>
            {disabled && (
              <p className="text-xs text-amber-600 mt-0.5">Please complete the previous attendee first</p>
            )}
          </div>
        </div>
        <svg
          className={`h-5 w-5 transition-transform ${disabled ? 'text-slate-300' : 'text-slate-500'} ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        ref={formBodyRef}
        className="p-6 pt-3 transition-all duration-500 ease-in-out overflow-hidden bg-gray-50"
        style={{ maxHeight: isExpanded ? expandedMaxHeight : '0px', padding: isExpanded ? undefined : '0px' }}
        aria-hidden={!isExpanded}
      >

      {/* First name and Last name - 2 columns */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            First name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-sm border bg-white px-3 py-3 text-sm  "
            value={attendee.firstName || ''}
            onChange={(e) => onChange('firstName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-sm border  px-3 py-3 text-sm bg-white"
            value={attendee.lastName || ''}
            onChange={(e) => onChange('lastName', e.target.value)}
          />
        </div>
      </div>

      {/* Date of Birth - full width */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Date of Birth <span className="text-rose-500">*</span>
        </label>
        <input
          ref={dobInputRef}
          type="text"
          placeholder="dd/mm/yyyy"
          className={`w-full rounded-sm border px-3 py-3 text-sm font-mono tracking-wider bg-white ${
            ageWarning && ageWarning.includes('must be at least 16')
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : ageWarning && ageWarning.includes('valid date')
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
          }`}
          value={dobDisplay}
          onKeyDown={handleDobKeyDown}
          onPaste={handleDobPaste}
          onFocus={handleDobFocus}
          onClick={handleDobClick}
          onChange={() => { /* fully controlled via onKeyDown */ }}
          inputMode="numeric"
        />
        {ageWarning && (
          <p className={`mt-1 text-xs ${
            ageWarning.includes('must be at least 16') || ageWarning.includes('valid date')
              ? 'text-red-500'
              : 'text-amber-600'
          }`}>
            {ageWarning}
          </p>
        )}
      </div>

      {/* Email and Confirm Email - 2 columns */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            className={`w-full rounded-sm border px-3 py-3 text-sm bg-white ${
              emailValue && confirmEmailValue && isEmailValid && isConfirmEmailValid
                ? areEmailsMatching
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : emailValue && !isEmailValid
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="you@example.com"
          />
          {emailValue && !isEmailValid && (
            <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            className={`w-full rounded-sm border px-3 py-3 text-sm bg-white ${
              emailValue && confirmEmailValue && isEmailValid && isConfirmEmailValid
                ? areEmailsMatching
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : confirmEmailValue && !isConfirmEmailValid
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.confirmEmail || ''}
            onChange={(e) => onChange('confirmEmail', e.target.value)}
            placeholder="Confirm email"
          />
          {confirmEmailValue && !isConfirmEmailValid && (
            <p className="mt-1 text-xs text-red-500">Please enter a valid email address</p>
          )}
          {emailValue && confirmEmailValue && isEmailValid && isConfirmEmailValid && !areEmailsMatching && (
            <p className="mt-1 text-xs text-red-500">Emails do not match</p>
          )}
        </div>
      </div>

      {/* Phone and Alternative Phone - 2 columns */}
      <div className="grid gap-4 sm:grid-cols-2 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            className={`w-full rounded-sm border px-3 py-3 text-sm bg-white ${
              phoneValue
                ? isPhoneValid
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.phone || ''}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="07123456789"
          />
          <p className="mt-1 text-xs text-slate-500">Numbers, spaces, brackets, hyphens, and &quot;+&quot; are allowed</p>
          {phoneValue && (!phoneRegex.test(phoneValue) || !isPhoneValid) && (
            <p className="mt-1 text-xs text-red-500">Please enter a valid phone number</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Alternative Phone
          </label>
          <input
            type="tel"
            className="w-full rounded-sm border px-3 py-3 text-sm bg-white"
            value={attendee.alternativePhone || ''}
            onChange={(e) => onChange('alternativePhone', e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      {/* Type Of Vehicle Required - full width */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Type Of Vehicle Required <span className="text-rose-500">*</span>
        </label>
        <select
          style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
          className="w-full rounded-sm border px-3 py-3 text-sm bg-white"
          value={attendee.vehicleType || ''}
          onChange={(e) => onChange('vehicleType', e.target.value)}
        >
          <option value="">Please select</option>
          {getAllVehicleTypesWithStatus().map(([key, description]) => {
            const disabled = isVehicleTypeDisabled(key, description);
            return (
              <option key={key} value={key} disabled={disabled}>
                {description}{disabled ? ' (Not available for 16-year-olds)' : ''}
              </option>
            );
          })}
        </select>
      </div>

      {/* Driving Licence Type - full width */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Driving Licence Type <span className="text-rose-500">*</span>
        </label>
        <select
          style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
          className="w-full rounded-sm border px-3 py-3 text-sm  bg-white"
          value={attendee.licenseType || ''}
          onChange={(e) => onChange('licenseType', e.target.value)}
        >
          <option value="">Please select</option>
          {licenseTypes.map((license) => (
            <option key={license.id} value={license.id}>{license.licence_type}</option>
          ))}
        </select>
      </div>

      {/* Driving Licence Number - full width */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Driving Licence Number {attendee.licenseType !== '4' && <span className="text-rose-500">*</span>}
        </label>
        <input
          type="text"
          className={`w-full rounded-sm border bg-white px-3 py-3 text-sm ${
            duplicateLicenseIndex !== null
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : attendee.licenseNumber.length === 16
              ? /^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/.test(attendee.licenseNumber)
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
              : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
          }`}
          value={attendee.licenseNumber || ''}
          onChange={(e) => onChange('licenseNumber', e.target.value.toUpperCase())}
          placeholder={attendee.licenseType === '4' ? 'Not required for this license type' : 'Must be 16 characters long'}
          maxLength={16}
          disabled={attendee.licenseType === '4'}
        />
        <p className="mt-1 text-xs text-slate-500">{attendee.licenseType === '4' ? 'Not required for Other/No Licence' : 'Must be 16 characters long'}</p>
        {duplicateLicenseIndex !== null && (
          <p className="mt-1 text-xs text-red-500">This driving licence number is already used by Attendee {duplicateLicenseIndex + 1}</p>
        )}
        {attendee.licenseNumber.length === 16 && !/^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/.test(attendee.licenseNumber) && (
          <p className="mt-1 text-xs text-red-500">Invalid Licence Number.</p>
        )}
      </div>

      {/* Theory Number - full width */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Theory Number (If Applicable)
        </label>
        <input
          type="text"
          className="w-full rounded-sm border px-3 py-3 text-sm bg-white "
          value={attendee.theoryNumber || ''}
          onChange={(e) => onChange('theoryNumber', e.target.value)}
          placeholder="Optional"
        />
      </div>

      {(showRegisterAsUserCheckbox || showUserLookupFeedback || requiresRegistrationPassword) && (

        <div className="mt-4 pt-4">
          {showRegisterAsUserCheckbox && (
            <div className="flex items-start gap-3">
              <input
                id={`registerAsUser-${index}`}
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border text-teal-600 focus:ring-teal-500"
                checked={attendee.registerAsUser}
                onChange={(e) => onChange('registerAsUser', e.target.checked)}
              />
              <label htmlFor={`registerAsUser-${index}`} className="text-sm text-slate-700">
                { `Create an account (or leave unticked to checkout as Guest)`}
              </label>
            </div>
          )}

          {showUserLookupFeedback && (
            <div className={`${showRegisterAsUserCheckbox ? 'mt-3' : ''}`}>
              {emailCheckState === 'checking' && (
                <p className="text-sm text-slate-500">Checking whether this email is already registered…</p>
              )}
              {emailCheckState === 'error' && (
                <p className="text-sm text-amber-700">
                  We couldn&apos;t verify whether this email is already registered right now.
                </p>
              )}
            </div>
          )}

          {requiresRegistrationPassword && (
            <div className="grid gap-4 sm:grid-cols-2 mt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  className={`w-full rounded-sm border bg-white px-3 py-3 text-sm ${
                    attendee.password && attendee.confirmPassword && attendee.password.length >= 8
                      ? attendee.password === attendee.confirmPassword
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
                  }`}
                  value={attendee.password || ''}
                  onChange={(e) => onChange('password', e.target.value)}
                  placeholder="Min 8 chars"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  className={`w-full rounded-sm border bg-white px-3 py-3 text-sm ${
                    attendee.password && attendee.confirmPassword && attendee.password.length >= 8
                      ? attendee.password === attendee.confirmPassword
                        ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                        : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
                  }`}
                  value={attendee.confirmPassword || ''}
                  onChange={(e) => onChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                />
                {attendee.password && attendee.confirmPassword && attendee.password.length >= 8 && (
                  <p className={`mt-1 text-xs ${
                    attendee.password === attendee.confirmPassword ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {attendee.password === attendee.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`mt-4 pt-4 ${showRegisterAsUserCheckbox || showUserLookupFeedback || requiresRegistrationPassword ? 'border-t border-slate-300' : ''}`}>
        <div className={`flex items-start gap-3 ${!isComplete ? 'opacity-60' : ''}`}>
          <input
            id={`confirmPhotocard-${index}`}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed"
            checked={photocardConfirmed}
            onChange={(e) => {
              const checked = e.target.checked;
              onPhotocardChange(checked);
              if (checked && totalAttendees > 1 && index < totalAttendees - 1 && typeof onExpandNext === 'function') {
                onExpandNext();
              }
            }}
            disabled={!isComplete}
          />
          <label htmlFor={`confirmPhotocard-${index}`} className="text-sm text-slate-700">
            Please tick to confirm that this attendee will be able to present their photocard driving licence on the day of the course.
          </label>
        </div>

        {!isComplete && incompleteReasons.length > 0 && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-900">Please complete the following before continuing:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800">
              {incompleteReasons.slice(0, 4).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

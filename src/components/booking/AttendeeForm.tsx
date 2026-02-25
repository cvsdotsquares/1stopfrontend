import React from 'react';

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
    isPrimaryUser: boolean;
    password: string;
    confirmPassword: string;
  };
  onChange: (field: string, value: string | boolean) => void;
  availableVehicleTypes: Record<string, string>;
  licenseTypes: Array<{ id: number; licence_type: string }>;
  totalAttendees: number;
  isExpanded: boolean;
  onToggle: () => void;
  isComplete: boolean;
  photocardConfirmed: boolean;
  onPhotocardChange: (confirmed: boolean) => void;
  licenseValidated: boolean;
  duplicateEmailIndex: number | null;
  duplicateLicenseIndex: number | null;
  selectedDate: Date | null;
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
  isComplete,
  photocardConfirmed,
  onPhotocardChange,
  licenseValidated,
  duplicateEmailIndex,
  duplicateLicenseIndex,
  selectedDate,
}: AttendeeFormProps) {
  const [ageWarning, setAgeWarning] = React.useState<string | null>(null);

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
  return (
    <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            isComplete ? 'bg-green-500 text-white' : 'bg-slate-300 text-slate-700'
          }`}>
            {isComplete ? (
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          <h4 className="text-base font-semibold text-slate-900">
            Fill the details for attendee {index + 1}
          </h4>
        </div>
        <svg
          className={`h-5 w-5 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="p-6 pt-0">

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            First name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={attendee.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Last name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={attendee.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Date of Birth <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
              ageWarning && ageWarning.includes('must be at least 16')
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={(() => {
              // Convert DD/MM/YYYY to YYYY-MM-DD for date input
              if (attendee.dateOfBirth && attendee.dateOfBirth.length === 10) {
                const [day, month, year] = attendee.dateOfBirth.split('/');
                if (day && month && year) {
                  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
              }
              return '';
            })()}
            onChange={(e) => {
              // Convert YYYY-MM-DD to DD/MM/YYYY for storage
              const dateValue = e.target.value;
              if (dateValue) {
                const [year, month, day] = dateValue.split('-');
                const formattedDate = `${day}/${month}/${year}`;
                handleDobChange(formattedDate);
              } else {
                handleDobChange('');
              }
            }}
            max={(() => {
              const today = new Date();
              return today.toISOString().split('T')[0];
            })()}
          />
          {ageWarning && (
            <p className={`mt-1 text-xs ${
              ageWarning.includes('must be at least 16') ? 'text-red-500' : 'text-amber-600'
            }`}>
              {ageWarning}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
              duplicateEmailIndex !== null
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : attendee.email && attendee.confirmEmail
                ? attendee.email === attendee.confirmEmail
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="you@example.com"
          />
          {duplicateEmailIndex !== null && (
            <p className="mt-1 text-xs text-red-500">This email is already used by Attendee {duplicateEmailIndex + 1}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Confirm Email <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
              attendee.email && attendee.confirmEmail
                ? attendee.email === attendee.confirmEmail
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.confirmEmail}
            onChange={(e) => onChange('confirmEmail', e.target.value)}
            placeholder="Confirm email"
          />
          {attendee.email && attendee.confirmEmail && attendee.email !== attendee.confirmEmail && (
            <p className="mt-1 text-xs text-red-500">Emails do not match</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Phone <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
              attendee.phone
                ? /^[0-9+]+$/.test(attendee.phone)
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="07123456789"
          />
          <p className="mt-1 text-xs text-slate-500">Numbers only or "+" symbol allowed</p>
          {attendee.phone && !/^[0-9+]+$/.test(attendee.phone) && (
            <p className="mt-1 text-xs text-red-500">Only numbers and "+" symbol allowed</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Alternative Phone
          </label>
          <input
            type="tel"
            className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={attendee.alternativePhone}
            onChange={(e) => onChange('alternativePhone', e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Type Of Vehicle Required <span className="text-rose-500">*</span>
          </label>
          <select
            className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={attendee.vehicleType}
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Driving Licence Type <span className="text-rose-500">*</span>
          </label>
          <select
            className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={attendee.licenseType}
            onChange={(e) => onChange('licenseType', e.target.value)}
          >
            <option value="">Please select</option>
            {licenseTypes.map((license) => (
              <option key={license.id} value={license.id}>{license.licence_type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Driving Licence Number {attendee.licenseType !== '4' && <span className="text-rose-500">*</span>}
          </label>
          <input
            type="text"
            className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
              duplicateLicenseIndex !== null
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : attendee.licenseNumber.length === 16
                ? /^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/.test(attendee.licenseNumber)
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.licenseNumber}
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Theory Number (If Applicable)
          </label>
          <input
            type="text"
            className="w-full rounded-sm border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={attendee.theoryNumber}
            onChange={(e) => onChange('theoryNumber', e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-300">
        <div className="flex items-start gap-3">
          <input
            id={`registerAsUser-${index}`}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            checked={attendee.registerAsUser}
            onChange={(e) => onChange('registerAsUser', e.target.checked)}
          />
          <label htmlFor={`registerAsUser-${index}`} className="text-sm text-slate-700">
            Register as a user for faster checkout next time
          </label>
        </div>

        {totalAttendees > 1 && (
          <div className="flex items-start gap-3 mt-3">
            <input
              id={`isPrimaryUser-${index}`}
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              checked={attendee.isPrimaryUser}
              onChange={(e) => onChange('isPrimaryUser', e.target.checked)}
            />
            <label htmlFor={`isPrimaryUser-${index}`} className="text-sm text-slate-700">
              Set as Primary User (main leader for all attendees)
            </label>
          </div>
        )}

        {attendee.registerAsUser && (
          <div className="grid gap-4 sm:grid-cols-2 mt-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
                  attendee.password && attendee.confirmPassword && attendee.password.length >= 8
                    ? attendee.password === attendee.confirmPassword
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                      : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
                }`}
                value={attendee.password}
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
                className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
                  attendee.password && attendee.confirmPassword && attendee.password.length >= 8
                    ? attendee.password === attendee.confirmPassword
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                      : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                    : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
                }`}
                value={attendee.confirmPassword}
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

      <div className="mt-4 pt-4 border-t border-slate-300">
        <div className="flex items-start gap-3">
          <input
            id={`confirmPhotocard-${index}`}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            checked={photocardConfirmed}
            onChange={(e) => onPhotocardChange(e.target.checked)}
          />
          <label htmlFor={`confirmPhotocard-${index}`} className="text-sm text-slate-700">
            Please tick to confirm that this attendee will be able to present their photocard driving licence on the day of the course.
          </label>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}

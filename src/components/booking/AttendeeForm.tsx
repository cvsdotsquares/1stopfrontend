import React from 'react';

interface AttendeeFormProps {
  index: number;
  attendee: {
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
}: AttendeeFormProps) {
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
                ? /^(?:(?:\+44\s?7|07)\d{9})$/.test(attendee.phone.replace(/\s/g, ''))
                  ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                  : 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            placeholder="07123456789"
            maxLength={11}
          />
          <p className="mt-1 text-xs text-slate-500">UK mobile number required (11 digits)</p>
          {attendee.phone && !/^(?:(?:\+44\s?7|07)\d{9})$/.test(attendee.phone.replace(/\s/g, '')) && (
            <p className="mt-1 text-xs text-red-500">Invalid UK mobile number</p>
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
            placeholder="07123456789 or 01234567890"
            maxLength={15}
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
            <option value="">Select vehicle type</option>
            {Object.entries(availableVehicleTypes).map(([key, description]) => (
              <option key={key} value={key}>{description}</option>
            ))}
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
            <option value="">Select license type</option>
            {licenseTypes.map((license) => (
              <option key={license.id} value={license.id}>{license.licence_type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Driving Licence Number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full rounded-sm border px-3 py-3 text-sm focus:outline-none focus:ring-2 ${
              duplicateLicenseIndex !== null
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                : licenseValidated && attendee.licenseNumber.length === 16
                ? 'border-green-500 focus:border-green-500 focus:ring-green-500/30'
                : 'border-slate-300 focus:border-teal-500 focus:ring-teal-500/30'
            }`}
            value={attendee.licenseNumber}
            onChange={(e) => onChange('licenseNumber', e.target.value)}
            placeholder="Must be 16 characters long"
            maxLength={16}
          />
          <p className="mt-1 text-xs text-slate-500">Must be 16 characters long</p>
          {duplicateLicenseIndex !== null && (
            <p className="mt-1 text-xs text-red-500">This driving licence number is already used by Attendee {duplicateLicenseIndex + 1}</p>
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

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Order notes
          </label>
          <textarea
            rows={2}
            className="w-full rounded-lg border border-slate-300 px-3 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            value={attendee.notes}
            onChange={(e) => onChange('notes', e.target.value)}
            placeholder="Anything we should know?"
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

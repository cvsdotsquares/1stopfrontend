/** Shared UK DOB validation — matches booking attendee `isValidDob` behaviour. */

export const UK_DOB_REQUIRED_MESSAGE = 'Date of birth is required';

export const UK_DOB_INVALID_MESSAGE = 'Please enter a valid date in dd/mm/yyyy format.';

export const UK_DOB_MIN_AGE_MESSAGE = 'You must be at least 16 years of age to register.';

/** Full `dd/mm/yyyy` string with a real calendar date (e.g. rejects 31/02/2020). */
export function isValidUkDob(dob: string): boolean {
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
}

export function calculateUkDobAge(dob: string, referenceDate: Date = new Date()): number {
  const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return -1;
  const [, dayStr, monthStr, yearStr] = match;
  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const birthDate = new Date(year, month - 1, day);
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

export function isAtLeastUkDobAge(dob: string, minAge: number, referenceDate: Date = new Date()): boolean {
  const age = calculateUkDobAge(dob, referenceDate);
  return age >= minAge;
}

export function formatDobInputFromDigits(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
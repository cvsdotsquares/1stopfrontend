/**
 * Public-site UK / NI driving licence validation — mirrors
 * 1stopbackend/src/utils/drivingLicenceValidation.js and
 * 1stopAdmin/1stopadminfe/lib/driving-licence-validation.ts (admin source of truth).
 */

export const DRIVING_LICENCE_INVALID_MESSAGE =
  'Driving licence number is not valid. Enter a 16-character UK photocard licence or an 8-digit Northern Ireland licence.';

export const DRIVING_LICENCE_REQUIRED_MESSAGE = 'Driving licence number is required';

export function normalizeDrivingLicence(value: string | null | undefined): string {
  return String(value ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function isNorthernIrelandDrivingLicence(value: string): boolean {
  return /^\d{8}$/.test(value);
}

function isValidUkPhotocardLicence(value: string): boolean {
  if (value.length !== 16) return false;
  if (!/^[A-Z0-9]+$/.test(value)) return false;
  if (!/^[A-Z9]{5}\d[A-Z0-9]{10}$/.test(value)) return false;

  const monthRaw = parseInt(value.slice(6, 8), 10);
  const day = parseInt(value.slice(8, 10), 10);
  if (!Number.isFinite(monthRaw) || !Number.isFinite(day)) return false;

  let month = monthRaw;
  if (month > 50) month -= 50;
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;

  return true;
}

export function validateDrivingLicenceNumber(
  value: string | null | undefined,
  options: { required?: boolean } = {},
): { valid: boolean; message?: string } {
  const { required = false } = options;
  const licence = normalizeDrivingLicence(value);

  if (!licence) {
    if (required) {
      return { valid: false, message: DRIVING_LICENCE_REQUIRED_MESSAGE };
    }
    return { valid: true };
  }

  if (isNorthernIrelandDrivingLicence(licence)) {
    return { valid: true };
  }

  if (!isValidUkPhotocardLicence(licence)) {
    return { valid: false, message: DRIVING_LICENCE_INVALID_MESSAGE };
  }

  return { valid: true };
}

export function isValidDrivingLicenceNumber(value: string): boolean {
  return validateDrivingLicenceNumber(value, { required: false }).valid;
}

/** Show inline format error when the user entered a value that fails validation. */
export function shouldShowDrivingLicenceFormatError(value: string): boolean {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return false;
  return !validateDrivingLicenceNumber(value, { required: false }).valid;
}
/** UK photocard driving licence number (16 characters). */
export const UK_DRIVING_LICENCE_REGEX =
  /^[A-Za-z9]{5}\d{6}[A-Za-z9]{2}[A-Za-z0-9]{1}[A-Za-z]{2}$/;

/** Accepts standard 16-character UK format or an 8-digit licence number. */
export function isValidDrivingLicenceNumber(value: string): boolean {
  const trimmed = value.trim();
  if (/^\d{8}$/.test(trimmed)) return true;
  return trimmed.length === 16 && UK_DRIVING_LICENCE_REGEX.test(trimmed);
}

/** Show inline format error once the value is a complete but invalid 8- or 16-character entry. */
export function shouldShowDrivingLicenceFormatError(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || isValidDrivingLicenceNumber(trimmed)) return false;
  return trimmed.length === 8 || trimmed.length === 16;
}

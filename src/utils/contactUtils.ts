export interface ContactNameInput {
  civility?: string | null;
  firstname: string;
  lastname: string;
}

/**
 * Format a contact's display name.
 * Default: includes civility prefix ("Dr. Jane Smith").
 * short: true — omits civility, for compact calendar blocks.
 */
export const formatContactName = (
  contact: ContactNameInput,
  opts?: { short?: boolean },
): string => {
  const prefix = !opts?.short && contact.civility ? `${contact.civility} ` : '';
  return `${prefix}${contact.firstname} ${contact.lastname}`;
};

/**
 * Check whether a firstname/lastname pair matches a search query.
 * Matches on firstname, lastname, or full name, each as a prefix.
 */
export function matchesNameQuery(firstname: string | null, lastname: string, query: string): boolean {
  const normalizedFirstname = (firstname ?? '').toLowerCase();
  const normalizedLastname = lastname.toLowerCase();
  const normalizedQuery = query.toLowerCase();

  const matchFirstName = normalizedFirstname.startsWith(normalizedQuery);
  const matchLastName = normalizedLastname.startsWith(normalizedQuery);
  const matchFullName = `${normalizedFirstname} ${normalizedLastname}`.trim().startsWith(normalizedQuery);

  return matchFirstName || matchLastName || matchFullName;
}

const FRENCH_NATIONAL_NUMBER_LENGTH = 9;

function extractFrenchNationalDigits(phoneNumber: string): string | null {
  if (!phoneNumber.startsWith('+33')) return null;
  const nationalDigits = phoneNumber.slice(3).replace(/\D/g, '');
  return nationalDigits.length === FRENCH_NATIONAL_NUMBER_LENGTH ? nationalDigits : null;
}

function groupFrenchNationalDigits(nationalDigits: string): string {
  if (!nationalDigits) return '';
  const pairs = nationalDigits.slice(1).match(/\d{1,2}/g) ?? [];
  return [nationalDigits.slice(0, 1), ...pairs].join(' ');
}

export function formatPhoneNumber(phoneNumber: string): string {
  const nationalDigits = extractFrenchNationalDigits(phoneNumber);
  return nationalDigits ? `+33 ${groupFrenchNationalDigits(nationalDigits)}` : phoneNumber;
}

/**
 * Formats an E.164 phone number for display inside a national-number-only input (no "+33" prefix).
 * Unlike formatPhoneNumber, this does not require a complete 9-digit number — it groups whatever
 * digits are present, so it stays correct as a controlled input's value while the user is still typing.
 */
export function toFrenchNationalDisplay(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';
  return phoneNumber.startsWith('+33') ? groupFrenchNationalDigits(phoneNumber.slice(3)) : phoneNumber;
}

/** Converts a user-typed national number (with or without a leading 0) into a French E.164 number. */
export function frenchNationalToE164(rawNationalInput: string): string | undefined {
  const digitsOnly = rawNationalInput.replace(/\D/g, '');
  if (!digitsOnly) return undefined;
  const nationalSignificantNumber = digitsOnly.startsWith('0') ? digitsOnly.slice(1) : digitsOnly;
  return `+33${nationalSignificantNumber}`;
}

const FRENCH_E164_REGEX = /^\+33\d{9}$/;

/** A French phone number is valid when empty (the field is optional) or exactly 9 national digits. */
export function isValidFrenchPhoneNumber(phoneNumber: string | null | undefined): boolean {
  return !phoneNumber || FRENCH_E164_REGEX.test(phoneNumber);
}

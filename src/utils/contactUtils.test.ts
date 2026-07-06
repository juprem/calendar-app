import { describe, expect, it } from 'vitest';
import {
  formatPhoneNumber,
  frenchNationalToE164,
  isValidFrenchPhoneNumber,
  toFrenchNationalDisplay,
} from './contactUtils.ts';

describe('frenchNationalToE164', () => {
  it('prefixes a national number with no leading 0', () => {
    expect(frenchNationalToE164('612345678')).toBe('+33612345678');
  });

  it('strips the leading 0 before prefixing', () => {
    expect(frenchNationalToE164('0612345678')).toBe('+33612345678');
  });

  it('strips spaces regardless of a leading 0', () => {
    expect(frenchNationalToE164('06 12 34 56 78')).toBe('+33612345678');
    expect(frenchNationalToE164('6 12 34 56 78')).toBe('+33612345678');
  });

  it('strips dots and dashes', () => {
    expect(frenchNationalToE164('06.12.34.56.78')).toBe('+33612345678');
    expect(frenchNationalToE164('06-12-34-56-78')).toBe('+33612345678');
  });

  it('only strips a single leading 0, not 0s elsewhere in the number', () => {
    expect(frenchNationalToE164('0102030405')).toBe('+33102030405');
  });

  it('returns undefined for empty input', () => {
    expect(frenchNationalToE164('')).toBeUndefined();
  });

  it('returns undefined for input with no digits', () => {
    expect(frenchNationalToE164('   ')).toBeUndefined();
  });
});

describe('toFrenchNationalDisplay', () => {
  it('formats a stored E.164 French number without the +33 prefix', () => {
    expect(toFrenchNationalDisplay('+33612345678')).toBe('6 12 34 56 78');
  });

  it('returns an empty string for null or undefined', () => {
    expect(toFrenchNationalDisplay(null)).toBe('');
    expect(toFrenchNationalDisplay(undefined)).toBe('');
  });

  it('falls back to the raw value for a non-French number', () => {
    expect(toFrenchNationalDisplay('+14155552671')).toBe('+14155552671');
  });

  it('groups a partial (incomplete) French number instead of falling back to the raw value', () => {
    expect(toFrenchNationalDisplay('+336')).toBe('6');
    expect(toFrenchNationalDisplay('+3361')).toBe('6 1');
    expect(toFrenchNationalDisplay('+33612')).toBe('6 12');
    expect(toFrenchNationalDisplay('+336123')).toBe('6 12 3');
  });

  it('round-trips with frenchNationalToE164', () => {
    const e164 = frenchNationalToE164('06 12 34 56 78');
    expect(toFrenchNationalDisplay(e164)).toBe('6 12 34 56 78');
  });

  it('stays stable through a full keystroke-by-keystroke typing sequence starting with a leading 0', () => {
    const digitsTypedInOrder = '0612345678'.split('');
    let typedSoFar = '';
    let displayedValue = '';

    for (const digit of digitsTypedInOrder) {
      typedSoFar += digit;
      displayedValue = toFrenchNationalDisplay(frenchNationalToE164(typedSoFar));
    }

    expect(displayedValue).toBe('6 12 34 56 78');
  });
});

describe('formatPhoneNumber', () => {
  it('formats a valid French E.164 number with spacing and the +33 prefix', () => {
    expect(formatPhoneNumber('+33612345678')).toBe('+33 6 12 34 56 78');
  });

  it('returns the raw value unchanged for a non-French number', () => {
    expect(formatPhoneNumber('+14155552671')).toBe('+14155552671');
  });

  it('returns the raw value unchanged when it is not valid E.164 at all', () => {
    expect(formatPhoneNumber('0612345678')).toBe('0612345678');
  });
});

describe('isValidFrenchPhoneNumber', () => {
  it('accepts empty values, since the field is optional', () => {
    expect(isValidFrenchPhoneNumber(null)).toBe(true);
    expect(isValidFrenchPhoneNumber(undefined)).toBe(true);
    expect(isValidFrenchPhoneNumber('')).toBe(true);
  });

  it('accepts a complete 9-digit French number', () => {
    expect(isValidFrenchPhoneNumber('+33612345678')).toBe(true);
  });

  it('rejects a number with fewer than 9 national digits', () => {
    expect(isValidFrenchPhoneNumber('+3361234567')).toBe(false);
  });

  it('rejects a number with more than 9 national digits', () => {
    expect(isValidFrenchPhoneNumber('+336123456789')).toBe(false);
  });

  it('rejects a non-French E.164 number', () => {
    expect(isValidFrenchPhoneNumber('+14155552671')).toBe(false);
  });

  it('rejects the empty-prefix-only state (user typed and deleted a leading 0)', () => {
    expect(isValidFrenchPhoneNumber('+33')).toBe(false);
  });
});

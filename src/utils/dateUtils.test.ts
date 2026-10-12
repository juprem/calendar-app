import { describe, expect, it } from 'vitest';
import { getNextMondayAfter, toParisHour } from './dateUtils.ts';

describe('getNextMondayAfter', () => {
  it('returns the next day on a Sunday', () => {
    expect(getNextMondayAfter('2026-10-11')).toBe('2026-10-12');
  });

  it('returns the following week on a Monday', () => {
    expect(getNextMondayAfter('2026-10-12')).toBe('2026-10-19');
  });

  it('crosses a month boundary', () => {
    expect(getNextMondayAfter('2026-10-28')).toBe('2026-11-02');
  });
});

describe('toParisHour', () => {
  it('is UTC+2 in summer', () => {
    expect(toParisHour(new Date('2026-10-11T10:00:00.000Z'))).toBe(12);
  });

  it('is UTC+1 in winter', () => {
    expect(toParisHour(new Date('2026-11-08T11:00:00.000Z'))).toBe(12);
  });

  it('returns 0 at midnight', () => {
    expect(toParisHour(new Date('2026-11-08T23:00:00.000Z'))).toBe(0);
  });
});

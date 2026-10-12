import { describe, expect, it } from 'vitest';
import { isReminderHour } from './runtime.ts';

describe('isReminderHour', () => {
  it('acts on the summer trigger at 10:00 UTC in October', () => {
    expect(isReminderHour(new Date('2026-10-11T10:00:00.000Z'))).toBe(true);
    expect(isReminderHour(new Date('2026-10-11T11:00:00.000Z'))).toBe(false);
  });

  it('acts on the winter trigger at 11:00 UTC in November', () => {
    expect(isReminderHour(new Date('2026-11-08T10:00:00.000Z'))).toBe(false);
    expect(isReminderHour(new Date('2026-11-08T11:00:00.000Z'))).toBe(true);
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { CreateContactSchema } from './models.ts';

describe('CreateContactSchema birthDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('truncates the birth date to UTC midnight', () => {
    const contact = CreateContactSchema.parse({
      firstname: 'Marie',
      lastname: 'Curie',
      birthDate: '1867-11-07T15:42:00.000Z',
    });

    expect(contact.birthDate).toEqual(new Date('1867-11-07T00:00:00.000Z'));
  });

  it("defaults to today's UTC midnight when no birth date is given", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-07T14:30:00.000Z'));

    const contact = CreateContactSchema.parse({ firstname: 'Marie', lastname: 'Curie' });

    expect(contact.birthDate).toEqual(new Date('2026-10-07T00:00:00.000Z'));
  });
});

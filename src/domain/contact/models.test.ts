import { describe, expect, it } from 'vitest';
import { CreateContactSchema } from './models.ts';

describe('CreateContactSchema birthDate', () => {
  it('truncates the birth date to UTC midnight', () => {
    const contact = CreateContactSchema.parse({
      firstname: 'Marie',
      lastname: 'Curie',
      birthDate: '1867-11-07T15:42:00.000Z',
    });

    expect(contact.birthDate).toEqual(new Date('1867-11-07T00:00:00.000Z'));
  });

  it('keeps an absent birth date undefined so the domain can decide', () => {
    const contact = CreateContactSchema.parse({ firstname: 'Marie', lastname: 'Curie' });

    expect(contact.birthDate).toBeUndefined();
  });
});

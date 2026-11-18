import { describe, expect, it } from 'vitest';
import { toContactNameSearchWhere } from './mappers.ts';

describe('toContactNameSearchWhere', () => {
  it('matches every contact for an empty search', () => {
    expect(toContactNameSearchWhere('')).toEqual({});
  });

  it('matches a case-insensitive prefix of the first or last name for a single word', () => {
    expect(toContactNameSearchWhere('jea')).toEqual({
      OR: [
        { firstname: { startsWith: 'jea', mode: 'insensitive' } },
        { lastname: { startsWith: 'jea', mode: 'insensitive' } },
      ],
    });
  });

  it('adds one full-name alternative per space, splitting the first name exactly', () => {
    expect(toContactNameSearchWhere('marie claire d')).toEqual({
      OR: [
        { firstname: { startsWith: 'marie claire d', mode: 'insensitive' } },
        { lastname: { startsWith: 'marie claire d', mode: 'insensitive' } },
        {
          firstname: { equals: 'marie', mode: 'insensitive' },
          lastname: { startsWith: 'claire d', mode: 'insensitive' },
        },
        {
          firstname: { equals: 'marie claire', mode: 'insensitive' },
          lastname: { startsWith: 'd', mode: 'insensitive' },
        },
      ],
    });
  });

  it('matches a whole first name followed by a space with any last name', () => {
    expect(toContactNameSearchWhere('jean ')).toMatchObject({
      OR: expect.arrayContaining([
        { firstname: { equals: 'jean', mode: 'insensitive' }, lastname: { startsWith: '', mode: 'insensitive' } },
      ]),
    });
  });
});

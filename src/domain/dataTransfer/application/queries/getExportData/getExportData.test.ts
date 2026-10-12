import { Effect, Layer, Option } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { mockDay, mockDayRepository, mockRdv } from '#/domain/calendar/testSupport.ts';
import { mockContact, mockContactRepository } from '#/domain/contact/testSupport.ts';
import {
  mockGeneralPractitioner,
  mockGeneralPractitionerRepository,
} from '#/domain/generalPractitioner/testSupport.ts';
import { mockExportLog, mockExportLogRepository } from '../../../testSupport.ts';
import {
  computeRollingRange,
  computeSinceLastExportRange,
  flattenDaysToRdvExportRows,
  getExportData,
} from './getExportData.ts';

describe('computeSinceLastExportRange', () => {
  it('starts at the epoch with no start label on the first export', () => {
    const range = computeSinceLastExportRange(Option.none(), '2026-10-12');

    expect(range).toEqual({
      start: new Date(0),
      endExclusive: new Date('2026-10-13T00:00:00.000Z'),
      sinceLastExportStart: null,
    });
  });

  it('covers only today when the last export happened the same Paris day', () => {
    const range = computeSinceLastExportRange(Option.some(new Date('2026-10-12T08:00:00.000Z')), '2026-10-12');

    expect(range).toEqual({
      start: new Date('2026-10-12T00:00:00.000Z'),
      endExclusive: new Date('2026-10-13T00:00:00.000Z'),
      sinceLastExportStart: '2026-10-12',
    });
  });

  it('uses the Paris date of the last export, not its UTC date', () => {
    const range = computeSinceLastExportRange(Option.some(new Date('2026-10-11T22:30:00.000Z')), '2026-10-12');

    expect(range.sinceLastExportStart).toBe('2026-10-12');
  });
});

describe('computeRollingRange', () => {
  it('starts one month before today', () => {
    expect(computeRollingRange('2026-10-12').start).toEqual(new Date('2026-09-12T00:00:00.000Z'));
  });

  it('clamps to the end of a shorter month', () => {
    expect(computeRollingRange('2026-03-31').start).toEqual(new Date('2026-02-28T00:00:00.000Z'));
  });

  it('ends far in the future', () => {
    expect(computeRollingRange('2026-10-12').endExclusive).toEqual(new Date('9999-12-31T00:00:00.000Z'));
  });
});

describe('flattenDaysToRdvExportRows', () => {
  it('adds the day date and the contact name, or null without contact', () => {
    const contact = mockContact({ firstname: 'Marie', lastname: 'Curie' });
    const rows = flattenDaysToRdvExportRows([
      {
        ...mockDay,
        rdv: [
          { ...mockRdv({ id: 1, contactId: contact.id }), contact },
          { ...mockRdv({ id: 2 }), contact: null },
        ],
      },
    ]);

    expect(rows).toEqual([
      {
        ...mockRdv({ id: 1, contactId: contact.id }),
        date: mockDay.date,
        contactFirstname: 'Marie',
        contactLastname: 'Curie',
      },
      { ...mockRdv({ id: 2 }), date: mockDay.date, contactFirstname: null, contactLastname: null },
    ]);
  });
});

describe('getExportData', () => {
  const now = new Date('2026-10-12T10:00:00.000Z');

  it('queries both ranges and assembles the export', async () => {
    const findManyWithRdvsInRange = vi.fn(() =>
      Effect.succeed([{ ...mockDay, rdv: [{ ...mockRdv(), contact: null }] }]),
    );
    const contact = mockContact();
    const practitioner = mockGeneralPractitioner();
    const lastExport = mockExportLog({ exportedAt: new Date('2026-10-05T10:00:00.000Z') });
    const layer = Layer.mergeAll(
      mockExportLogRepository({ findLast: () => Effect.succeed(Option.some(lastExport)) }),
      mockContactRepository({ findAll: () => Effect.succeed([contact]) }),
      mockGeneralPractitionerRepository({ findAll: () => Effect.succeed([practitioner]) }),
      mockDayRepository({ findManyWithRdvsInRange }),
    );

    const result = await Effect.runPromise(getExportData(now).pipe(Effect.provide(layer)));

    expect(result.exportedAt).toEqual(now);
    expect(result.today).toBe('2026-10-12');
    expect(result.sinceLastExportStart).toBe('2026-10-05');
    expect(result.contacts).toEqual([contact]);
    expect(result.practitioners).toEqual([practitioner]);
    expect(result.rdvSinceLastExport).toHaveLength(1);
    expect(result.rdvRolling).toHaveLength(1);
    expect(findManyWithRdvsInRange).toHaveBeenNthCalledWith(
      1,
      new Date('2026-10-05T00:00:00.000Z'),
      new Date('2026-10-13T00:00:00.000Z'),
    );
    expect(findManyWithRdvsInRange).toHaveBeenNthCalledWith(
      2,
      new Date('2026-09-12T00:00:00.000Z'),
      new Date('9999-12-31T00:00:00.000Z'),
    );
  });

  it('reports a null since-last-export start on the first export', async () => {
    const layer = Layer.mergeAll(
      mockExportLogRepository(),
      mockContactRepository(),
      mockGeneralPractitionerRepository(),
      mockDayRepository({ findManyWithRdvsInRange: () => Effect.succeed([]) }),
    );

    const result = await Effect.runPromise(getExportData(now).pipe(Effect.provide(layer)));

    expect(result.sinceLastExportStart).toBeNull();
  });
});

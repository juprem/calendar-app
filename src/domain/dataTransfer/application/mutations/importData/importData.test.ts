import { Effect, Layer } from 'effect';
import { describe, expect, it, vi } from 'vitest';
import { mockContact, mockContactRepository } from '#/domain/contact/testSupport.ts';
import {
  mockGeneralPractitioner,
  mockGeneralPractitionerRepository,
} from '#/domain/generalPractitioner/testSupport.ts';
import type {
  ContactImportRow,
  ImportData,
  PractitionerImportRow,
  RdvImportRow,
} from '../../../models.ts';
import { mockDataImportRepository } from '../../../testSupport.ts';
import { importData, validateImport } from './importData.ts';

const practitionerRow = (overrides: Partial<PractitionerImportRow> = {}): PractitionerImportRow => ({
  id: 1,
  firstname: 'Jean',
  lastname: 'Dupont',
  address: null,
  ...overrides,
});

const contactRow = (overrides: Partial<ContactImportRow> = {}): ContactImportRow => ({
  id: 1,
  firstname: 'Jean',
  lastname: 'Dupont',
  email: null,
  phoneNumber: null,
  notes: null,
  birthDate: new Date('1990-01-01T00:00:00.000Z'),
  birthLocation: null,
  address: null,
  civility: null,
  generalPractitionerId: null,
  ...overrides,
});

const rdvRow = (overrides: Partial<RdvImportRow> = {}): RdvImportRow => ({
  id: 1,
  date: new Date('2026-10-12T00:00:00.000Z'),
  startHour: '09:00',
  endHour: '10:00',
  name: 'Patient',
  rdvType: null,
  isConfirmed: null,
  additionalInfos: null,
  confirmationDate: null,
  confirmationMode: null,
  contactId: null,
  ...overrides,
});

const emptyImport: ImportData = { practitioners: [], contacts: [], rdvs: [] };

describe('validateImport', () => {
  it('accepts rows whose references exist in the database or in the file', () => {
    const errors = validateImport(
      {
        practitioners: [practitionerRow({ id: 20 })],
        contacts: [contactRow({ id: 10, generalPractitionerId: 20 }), contactRow({ id: 11, firstname: 'Paul', generalPractitionerId: 5 })],
        rdvs: [rdvRow({ contactId: 10 }), rdvRow({ id: 2, contactId: 3 })],
      },
      [mockContact({ id: 3, firstname: 'Luc' })],
      [mockGeneralPractitioner({ id: 5 })],
    );

    expect(errors).toEqual([]);
  });

  it('reports an unknown general practitioner on the contact row', () => {
    const errors = validateImport(
      { ...emptyImport, contacts: [contactRow({ generalPractitionerId: 12 })] },
      [],
      [],
    );

    expect(errors).toEqual([{ entity: 'contacts', rowNumber: 2, reason: 'Médecin traitant 12 introuvable' }]);
  });

  it('reports an unknown contact on the rdv row', () => {
    const errors = validateImport(
      { ...emptyImport, rdvs: [rdvRow(), rdvRow({ id: 2, contactId: 99 })] },
      [],
      [],
    );

    expect(errors).toEqual([{ entity: 'rdvs', rowNumber: 3, reason: 'Contact 99 introuvable' }]);
  });

  it('reports a duplicate id inside one entity list', () => {
    const errors = validateImport(
      { ...emptyImport, practitioners: [practitionerRow(), practitionerRow()] },
      [],
      [],
    );

    expect(errors).toEqual([
      { entity: 'practitioners', rowNumber: 3, reason: 'Identifiant 1 en doublon dans le fichier' },
    ]);
  });

  it('reports an imported contact whose identity collides with a different database contact', () => {
    const errors = validateImport(
      { ...emptyImport, contacts: [contactRow({ id: 10, birthDate: new Date('1990-01-01T15:00:00.000Z') })] },
      [mockContact({ id: 3 })],
      [],
    );

    expect(errors).toEqual([
      { entity: 'contacts', rowNumber: 2, reason: 'Contact en doublon : Jean Dupont né(e) le 1990-01-01' },
    ]);
  });

  it('does not report the identity of an imported row that overrides the same database id', () => {
    const errors = validateImport({ ...emptyImport, contacts: [contactRow({ id: 3 })] }, [mockContact({ id: 3 })], []);

    expect(errors).toEqual([]);
  });

  it('reports two imported contacts sharing an identity', () => {
    const errors = validateImport(
      { ...emptyImport, contacts: [contactRow({ id: 10 }), contactRow({ id: 11 })] },
      [],
      [],
    );

    expect(errors.map((error) => error.rowNumber)).toEqual([2, 3]);
  });
});

describe('importData', () => {
  it('passes the repository counts through when the import is valid', async () => {
    const counts = {
      practitioners: { created: 0, updated: 0 },
      contacts: { created: 1, updated: 1 },
      rdvs: { created: 0, updated: 0 },
    };
    const applyImport = vi.fn(() => Effect.succeed(counts));
    const layer = Layer.mergeAll(
      mockContactRepository({ findAll: () => Effect.succeed([mockContact({ id: 1 })]) }),
      mockGeneralPractitionerRepository(),
      mockDataImportRepository({ applyImport }),
    );
    const data = {
      ...emptyImport,
      contacts: [contactRow({ id: 1 }), contactRow({ id: 2, firstname: 'Paul' })],
    };

    const result = await Effect.runPromise(importData(data).pipe(Effect.provide(layer)));

    expect(result).toEqual({ status: 'imported', counts });
    expect(applyImport).toHaveBeenCalledWith(data);
  });

  it('rejects without applying anything when a row is invalid', async () => {
    const applyImport = vi.fn(() => Effect.die('must not be called'));
    const layer = Layer.mergeAll(
      mockContactRepository({ findAll: () => Effect.succeed([]) }),
      mockGeneralPractitionerRepository(),
      mockDataImportRepository({ applyImport }),
    );

    const result = await Effect.runPromise(
      importData({ ...emptyImport, rdvs: [rdvRow({ contactId: 7 })] }).pipe(Effect.provide(layer)),
    );

    expect(result).toEqual({
      status: 'rejected',
      errors: [{ entity: 'rdvs', rowNumber: 2, reason: 'Contact 7 introuvable' }],
    });
    expect(applyImport).not.toHaveBeenCalled();
  });
});

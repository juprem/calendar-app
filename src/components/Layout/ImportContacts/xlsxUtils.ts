import * as XLSX from 'xlsx';
import type { CreateContact } from '#/models/ContactModel.ts';
import { toValidCivility } from '#/models/ContactModel.ts';

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

function normalizePhone(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const cleaned = String(raw).replace(/[\s.\-()]/g, '');
  let normalized: string;
  if (cleaned.startsWith('+')) {
    normalized = cleaned;
  } else if (cleaned.startsWith('00')) {
    normalized = '+' + cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    normalized = '+33' + cleaned.slice(1);
  } else {
    return undefined;
  }
  return E164_REGEX.test(normalized) ? normalized : undefined;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = String(raw).trim();
  return EMAIL_REGEX.test(trimmed) ? trimmed : undefined;
}

function normalizeCivility(raw: string | null | undefined): CreateContact['civility'] {
  if (!raw) return undefined;
  const trimmed = String(raw).trim();
  if (trimmed === 'M.' || trimmed === 'M') return toValidCivility('Mr');
  return toValidCivility(trimmed);
}

function normalizeDate(raw: unknown): Date | undefined {
  if (!raw) return undefined;
  if (typeof raw === 'number') {
    const parsed = XLSX.SSF.parse_date_code(raw);
    if (!parsed) return undefined;
    return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }
  if (typeof raw === 'string') {
    const date = new Date(raw);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
}

function buildAddress(
  street: string | null | undefined,
  postalCode: string | null | undefined,
  city: string | null | undefined,
  country: string | null | undefined,
): string | undefined {
  const parts = [street, postalCode, city, country].filter(Boolean).map(String);
  return parts.length > 0 ? parts.join(', ') : undefined;
}

type XlsxRow = Record<string, unknown>;

function toStringOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  return String(value);
}

export function mapRowToContact(row: XlsxRow): CreateContact | null {
  const firstname = row['Prénom'] ? String(row['Prénom']).trim() : undefined;
  const lastname = row['Nom'] ? String(row['Nom']).trim() : undefined;

  if (!firstname && !lastname) return null;

  const phone =
    normalizePhone(toStringOrNull(row['Téléphone mobile'])) ??
    normalizePhone(toStringOrNull(row['Téléphone privé'])) ??
    normalizePhone(toStringOrNull(row['Téléphone professionnel']));

  const address = buildAddress(
    toStringOrNull(row['Adresse 1']),
    toStringOrNull(row['Code Postal 1']),
    toStringOrNull(row['Ville 1']),
    toStringOrNull(row['Pays 1']),
  );

  return {
    firstname: firstname ?? '',
    lastname: lastname ?? '',
    civility: normalizeCivility(toStringOrNull(row['Civilité'])),
    birth_date: normalizeDate(row['Date de naissance']),
    email: normalizeEmail(toStringOrNull(row['Email'])),
    phone_number: phone,
    address,
    notes: row['Remarque'] ? String(row['Remarque']).trim() : undefined,
  };
}

export interface ParsedImportResult {
  contacts: CreateContact[];
  skippedCount: number;
}

export function parseContactsFile(file: File): Promise<ParsedImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<XlsxRow>(worksheet, { defval: null });

        const contacts: CreateContact[] = [];
        let skippedCount = 0;

        for (const row of rows) {
          const contact = mapRowToContact(row);
          if (contact) {
            contacts.push(contact);
          } else {
            skippedCount++;
          }
        }

        resolve({ contacts, skippedCount });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Impossible de lire le fichier'));
    reader.readAsBinaryString(file);
  });
}

import type { Civility } from '#/domain/contact/models.ts';

export const CIVILITY_OPTIONS = [
  { value: 'Dr' as const, label: 'Dr' },
  { value: 'Mr' as const, label: 'M.' },
  { value: 'Mme' as const, label: 'Mme' },
];

export const toValidCivility = (v: string | null): Civility | undefined => {
  if (v === 'Dr' || v === 'Mr' || v === 'Mme') return v;
  return undefined;
};

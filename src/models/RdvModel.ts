import z from 'zod';
import type { Dayjs } from 'dayjs';

export const RDV_TYPE_VALUES = [
  'Premier bilan',
  'Suivi',
  'Rééducation',
  'Bloc opératoire',
  'Urgence',
  'Privé',
] as const;

export type RdvType = (typeof RDV_TYPE_VALUES)[number];

export interface RdvTypeStyle {
  /** Subtle pill badge — light bg, coloured text, thin border */
  badge: string;
  /** Solid block — medium bg, hover, dark text */
  block: string;
  /** Icon colour to use on top of this block background */
  blockIcon: string;
}

const RDV_TYPE_STYLES: Record<RdvType, RdvTypeStyle> = {
  'Premier bilan':   { badge: 'bg-stone-50 text-stone-600 border-stone-200',      block: 'bg-stone-200 hover:bg-stone-300 text-stone-800',   blockIcon: 'text-stone-700' },
  'Suivi':           { badge: 'bg-violet-50 text-violet-700 border-violet-200',    block: 'bg-violet-200 hover:bg-violet-300 text-violet-800', blockIcon: 'text-violet-700' },
  'Rééducation':     { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', block: 'bg-emerald-200 hover:bg-emerald-300 text-emerald-800', blockIcon: 'text-emerald-700' },
  'Bloc opératoire': { badge: 'bg-sky-50 text-sky-700 border-sky-200',             block: 'bg-sky-200 hover:bg-sky-300 text-sky-800',         blockIcon: 'text-sky-700' },
  'Urgence':         { badge: 'bg-red-50 text-red-700 border-red-200',             block: 'bg-red-200 hover:bg-red-300 text-red-800',         blockIcon: 'text-red-700' },
  'Privé':           { badge: 'bg-amber-50 text-amber-700 border-amber-200',       block: 'bg-amber-200 hover:bg-amber-300 text-amber-800',   blockIcon: 'text-amber-700' },
};

const RDV_TYPE_DEFAULT_STYLE: RdvTypeStyle = {
  badge: 'bg-stone-50 text-stone-500 border-stone-200',
  block: 'bg-[#fda475] hover:bg-[#e67d46] text-[#7e2d02]',
  blockIcon: 'text-white',
};

export function getRdvTypeStyle(rdvType: string | null | undefined): RdvTypeStyle {
  if (!rdvType) return RDV_TYPE_DEFAULT_STYLE;
  return RDV_TYPE_STYLES[rdvType as RdvType] ?? RDV_TYPE_DEFAULT_STYLE;
}

export const RDV_TYPE_OPTIONS = RDV_TYPE_VALUES.map((value) => ({ value, label: value }));

export const STATUT_OPTIONS = [
  { value: true, label: 'Confirmé' },
  { value: false, label: 'En attente' },
];

export const RdvCreateSchema = z.object({
  date: z.string(),
  name: z.string(),
  start_hour: z.string(),
  end_hour: z.string(),
  rdv_type: z.enum(RDV_TYPE_VALUES).optional(),
  is_confirmed: z.boolean().optional(),
  contact_id: z.number().optional().nullable(),
  additional_infos: z.string().optional().nullable(),
});

export type CreateRdv = z.infer<typeof RdvCreateSchema>;

/** Shared Ant Design form values type for both create and edit RDV forms. */
export interface RdvFormValues {
  contact_id?: number;
  name: string;
  day: Dayjs;
  start_time: Dayjs;
  end_time: Dayjs;
  time_range?: [Dayjs, Dayjs];
  rdv_type?: RdvType;
  is_confirmed?: boolean;
  additional_infos?: string;
}

export const UpdateRdvSchema = z.object({
  id: z.number(),
  date: z.string(),
  name: z.string(),
  start_hour: z.string(),
  end_hour: z.string(),
  rdv_type: z.enum(RDV_TYPE_VALUES).optional().nullable(),
  is_confirmed: z.boolean().optional().nullable(),
  contact_id: z.number().optional().nullable(),
  additional_infos: z.string().optional().nullable(),
});

export type UpdateRdv = z.infer<typeof UpdateRdvSchema>;

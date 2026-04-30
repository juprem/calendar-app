import type { rdv } from '../../../generated/prisma/client.ts';

interface WeekRdvBlockProps {
  rdv: rdv;
  top: number;
  height: number;
}

export function WeekRdvBlock({ rdv, top, height }: WeekRdvBlockProps) {
  return (
    <div
      className="absolute left-0.5 right-0.5 bg-[#EA580C] hover:bg-[#C2410C] transition-colors rounded-md text-white text-xs px-1.5 py-1 overflow-hidden cursor-pointer z-10"
      style={{ top, height }}
      title={`${rdv.start_hour} – ${rdv.end_hour} · ${rdv.name}`}
    >
      <p className="font-semibold leading-tight truncate">{rdv.name}</p>
      {height >= 36 && (
        <p className="text-orange-100 leading-tight mt-0.5">
          {rdv.start_hour} – {rdv.end_hour}
        </p>
      )}
    </div>
  );
}

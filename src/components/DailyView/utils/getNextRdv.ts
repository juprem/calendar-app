import type { rdv } from '../../../../generated/prisma/client.ts';
import { getHourAndMinute } from '#/components/DailyView/utils/getHoursAndMinute.ts';
import dayjs from 'dayjs';

const [hour, minute] = [dayjs().hour(), dayjs().minute()];

export function getNextRdv(rdvs: rdv[]) {
  const futureRdv = rdvs.filter((rdv) => {
    const [rdvH, rdvM] = getHourAndMinute(rdv.start_hour);

    return rdvH > hour || (rdvH === hour && rdvM > minute);
  });

  if (futureRdv.length === 0) return null;

  const nextRdv = futureRdv[0];

  return {
    time: nextRdv.start_hour,
    patientName: nextRdv.name,
    consultationType: nextRdv.rdv_type,
  };
}

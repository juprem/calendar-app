import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import { formatGeneralPractitionerName } from '#/models/GeneralPractitionerModel.ts';

interface GeneralPractitionerDisplayNameProps {
  generalPractitioner: GeneralPractitioner;
}

export function GeneralPractitionerDisplayName({ generalPractitioner }: GeneralPractitionerDisplayNameProps) {
  return (
    <span>
      {formatGeneralPractitionerName(generalPractitioner)}
      {generalPractitioner.address && (
        <span className="text-[#78716C]"> — {generalPractitioner.address}</span>
      )}
    </span>
  );
}

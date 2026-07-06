import { formatPhoneNumber } from '#/utils/contactUtils.ts';

interface TooltipContentProps {
  additionalInfos: string | null;
  phoneNumber?: string | null;
}

export function TooltipContent({ additionalInfos, phoneNumber }: TooltipContentProps) {
  if (!phoneNumber && !additionalInfos) {
    return undefined;
  }

  return (
    <div className="flex flex-col gap-2">
      {additionalInfos && <span>{additionalInfos}</span>}
      <span>{phoneNumber ? formatPhoneNumber(phoneNumber) : ''}</span>
    </div>
  );
}

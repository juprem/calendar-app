import { Button, Popconfirm } from 'antd';
import { Pencil, Trash2 } from 'lucide-react';
import { ContactAvatar } from '#/components/Contacts/ContactDetail/ContactAvatar.tsx';
import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import { formatGeneralPractitionerName } from '#/models/GeneralPractitionerModel.ts';
import { useDeleteGeneralPractitioner } from '#/services/generalPractitionerService.ts';

interface PractitionerListItemProps {
  practitioner: GeneralPractitioner;
  onEdit: (practitioner: GeneralPractitioner) => void;
}

export function PractitionerListItem({ practitioner, onEdit }: PractitionerListItemProps) {
  const { mutate: deletePractitioner, isPending: isDeleting } = useDeleteGeneralPractitioner();

  return (
    <div className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#E7E5E4] bg-white">
      <ContactAvatar firstname={practitioner.firstname ?? ''} lastname={practitioner.lastname} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[#1C1917] truncate">
          {formatGeneralPractitionerName(practitioner)}
        </p>
        {practitioner.address && (
          <p className="text-xs text-[#78716C] truncate">{practitioner.address}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <Button
          shape="round"
          size="small"
          icon={<Pencil size={13} />}
          onClick={() => onEdit(practitioner)}
        />
        <Popconfirm
          title="Supprimer ce médecin ?"
          description="Cette action est irréversible."
          onConfirm={() => deletePractitioner(practitioner.id)}
          okText="Supprimer"
          cancelText="Annuler"
          okButtonProps={{ danger: true }}
        >
          <Button shape="round" size="small" danger icon={<Trash2 size={13} />} loading={isDeleting} />
        </Popconfirm>
      </div>
    </div>
  );
}

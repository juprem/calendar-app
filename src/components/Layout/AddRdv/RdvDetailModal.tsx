import { useState } from 'react';
import { Button, Modal, Popconfirm } from 'antd';
import dayjs from 'dayjs';
import { Clock, User, FileText, Trash2, Pencil, CalendarClock } from 'lucide-react';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';
import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { CONFIRMATION_MODE_OPTIONS, getRdvTypeStyle } from '#/models/RdvModel.ts';
import { RdvEditForm } from '#/components/Layout/AddRdv/RdvEditForm.tsx';
import { formatContactName, formatPhoneNumber } from '#/utils/contactUtils.ts';
import { useDeleteRdv } from '#/services/calendarService.ts';
import { RDV_MODAL_STYLES } from '#/components/Layout/AddRdv/rdvModalStyles.ts';

interface RdvDetailModalProps {
  rdv: RdvWithContact;
  isoDate: string;
  open: boolean;
  onClose: () => void;
}

export function RdvDetailModal({ rdv, isoDate, open, onClose }: RdvDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: deleteRdv, isPending: isDeleting } = useDeleteRdv(isoDate);
  const typeStyle = getRdvTypeStyle(rdv.rdvType);

  const contactLabel = rdv.contact ? formatContactName(rdv.contact) : null;
  const confirmationModeLabel = CONFIRMATION_MODE_OPTIONS.find(
    (option) => option.value === rdv.confirmationMode,
  )?.label;

  return (
    <Modal
      title={isEditing ? 'Modifier le Rendez-vous' : rdv.name}
      open={open}
      centered
      footer={null}
      styles={RDV_MODAL_STYLES}
      onCancel={onClose}
    >
      {isEditing ? (
        <RdvEditForm rdv={rdv} isoDate={isoDate} onSuccess={onClose} onCancel={() => setIsEditing(false)} />
      ) : (
        <>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-[#92400E] shrink-0" />
              <span className="text-sm text-[#1C1917] font-medium">
                {rdv.startHour} – {rdv.endHour}
              </span>
            </div>

            {rdv.rdvType && (
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${typeStyle.badge}`}>{rdv.rdvType}</span>
              </div>
            )}

            {rdv.isConfirmed !== null && (
              <div className="flex items-center gap-3">
                <RdvStatusIcon isConfirmed={rdv.isConfirmed} size={16} />
                <span className="text-sm text-[#78716C]">
                  {rdv.isConfirmed ? 'Confirmé' : 'En attente de confirmation'}
                </span>
              </div>
            )}

            {rdv.confirmationDate && (
              <div className="flex items-center gap-3">
                <CalendarClock size={16} className="text-[#92400E] shrink-0" />
                <span className="text-sm text-[#78716C]">
                  Date de confirmation : {dayjs(rdv.confirmationDate).format('DD/MM/YYYY')} (
                  {confirmationModeLabel ?? CONFIRMATION_MODE_OPTIONS[0].label})
                </span>
              </div>
            )}

            {contactLabel && (
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#92400E] shrink-0" />
                <span className="text-sm text-[#1C1917]">{contactLabel}</span>
              </div>
            )}

            {rdv.contact?.phoneNumber && (
              <div className="flex items-start gap-3">
                <span className="text-sm text-[#1C1917]">{formatPhoneNumber(rdv.contact?.phoneNumber)}</span>
              </div>
            )}

            {rdv.additionalInfos && (
              <div className="flex items-start gap-3">
                <FileText size={16} className="text-[#92400E] shrink-0 mt-0.5" />
                <p className="text-sm text-[#78716C] leading-relaxed">{rdv.additionalInfos}</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-[#E7E5E4]">
            <Popconfirm
              title="Supprimer ce rendez-vous ?"
              description="Cette action est irréversible."
              onConfirm={() => deleteRdv(rdv.id, { onSuccess: onClose })}
              okText="Supprimer"
              cancelText="Annuler"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<Trash2 size={13} />} loading={isDeleting}>
                Supprimer
              </Button>
            </Popconfirm>

            <div className="flex gap-2">
              <Button onClick={onClose}>Fermer</Button>
              <Button type="primary" icon={<Pencil size={13} />} onClick={() => setIsEditing(true)}>
                Modifier
              </Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}

import { useState } from 'react';
import { Button, Modal, Popconfirm } from 'antd';
import { Clock, User, FileText, Trash2, Pencil } from 'lucide-react';
import { RdvStatusIcon } from '#/components/RdvStatusIcon.tsx';
import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { getRdvTypeStyle } from '#/models/RdvModel.ts';
import { useDeleteRdv } from '#/services/calendarService.ts';
import { RdvEditForm } from '#/components/Layout/AddRdv/RdvEditForm.tsx';

interface RdvDetailModalProps {
  rdv: RdvWithContact;
  isoDate: string;
  open: boolean;
  onClose: () => void;
}

export function RdvDetailModal({ rdv, isoDate, open, onClose }: RdvDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: deleteRdv, isPending: isDeleting } = useDeleteRdv(isoDate);
  const typeStyle = getRdvTypeStyle(rdv.rdv_type);

  const contactLabel = rdv.contact
    ? `${rdv.contact.civility ? rdv.contact.civility + ' ' : ''}${rdv.contact.firstname} ${rdv.contact.lastname}`
    : null;

  return (
    <Modal
      title={isEditing ? 'Modifier le Rendez-vous' : rdv.name}
      open={open}
      centered
      footer={null}
      styles={{
        container: { maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
        body: { overflowY: 'auto', flex: '1 1 auto', maxHeight: '90vh' },
      }}
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
                {rdv.start_hour} – {rdv.end_hour}
              </span>
            </div>

            {rdv.rdv_type && (
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${typeStyle.badge}`}>{rdv.rdv_type}</span>
              </div>
            )}

            {rdv.is_confirmed !== null && (
              <div className="flex items-center gap-3">
                <RdvStatusIcon isConfirmed={rdv.is_confirmed} size={16} />
                <span className="text-sm text-[#78716C]">
                  {rdv.is_confirmed ? 'Confirmé' : 'En attente de confirmation'}
                </span>
              </div>
            )}

            {contactLabel && (
              <div className="flex items-center gap-3">
                <User size={16} className="text-[#92400E] shrink-0" />
                <span className="text-sm text-[#1C1917]">{contactLabel}</span>
              </div>
            )}

            {rdv.additional_infos && (
              <div className="flex items-start gap-3">
                <FileText size={16} className="text-[#92400E] shrink-0 mt-0.5" />
                <p className="text-sm text-[#78716C] leading-relaxed">{rdv.additional_infos}</p>
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

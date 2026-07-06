import { useState } from 'react';
import { Modal } from 'antd';
import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { RdvCard } from '#/components/DailyView/RdvCard/RdvCard.tsx';
import { RdvDetailModal } from '#/components/Layout/AddRdv/RdvDetailModal.tsx';

interface RdvDayListModalProps {
  rdvs: RdvWithContact[];
  isoDate: string;
  formattedDate: string;
  open: boolean;
  onClose: () => void;
}

export function RdvDayListModal({ rdvs, isoDate, formattedDate, open, onClose }: RdvDayListModalProps) {
  const [selectedRdv, setSelectedRdv] = useState<RdvWithContact | null>(null);

  if (selectedRdv) {
    return (
      <RdvDetailModal
        rdv={selectedRdv}
        isoDate={isoDate}
        open={true}
        onClose={() => setSelectedRdv(null)}
      />
    );
  }

  return (
    <Modal
      title={<span className="capitalize">{formattedDate}</span>}
      open={open}
      footer={null}
      onCancel={onClose}
      styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
    >
      <div className="pt-2">
        {rdvs.map((rdv) => (
          <RdvCard key={rdv.id} rdv={rdv} onClick={() => setSelectedRdv(rdv)} />
        ))}
      </div>
    </Modal>
  );
}

import { Modal } from 'antd';
import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { RdvEditForm } from '#/components/Layout/AddRdv/RdvEditForm.tsx';

interface EditRdvModalProps {
  rdv: RdvWithContact;
  isoDate: string;
  open: boolean;
  onClose: () => void;
}

export function EditRdvModal({ rdv, isoDate, open, onClose }: EditRdvModalProps) {
  return (
    <Modal
      title="Modifier le Rendez-vous"
      open={open}
      centered
      footer={null}
      styles={{
        container: { maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
        body: { overflowY: 'auto', flex: '1 1 auto', maxHeight: '90vh' },
      }}
      onCancel={onClose}
    >
      <RdvEditForm rdv={rdv} isoDate={isoDate} onSuccess={onClose} onCancel={onClose} />
    </Modal>
  );
}

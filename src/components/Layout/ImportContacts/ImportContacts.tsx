import { useState } from 'react';
import { Button } from 'antd';
import { Upload } from 'lucide-react';
import { ImportContactsModal } from './ImportContactsModal.tsx';

export function ImportContacts() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        shape="round"
        icon={<Upload size={13} />}
        size="small"
        onClick={() => setOpen(true)}
      >
        Importer
      </Button>
      <ImportContactsModal open={open} closeModal={() => setOpen(false)} />
    </>
  );
}

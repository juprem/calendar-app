import { useState } from 'react';
import { Button } from 'antd';
import { Upload } from 'lucide-react';
import { ImportModal } from '#/components/Layout/DataTransfer/ImportButton/ImportModal.tsx';

export function ImportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button shape="round" icon={<Upload size={13} />} size="small" onClick={() => setOpen(true)}>
        Importer
      </Button>
      <ImportModal open={open} closeModal={() => setOpen(false)} />
    </>
  );
}

import { useState } from 'react';
import { Button } from 'antd';
import { UserPlus } from 'lucide-react';
import { AddContactModal } from '#/components/Layout/AddContact/AddContactModal.tsx';

export function AddContact() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        shape="round"
        icon={<UserPlus size={13} />}
        size="small"
        onClick={() => setOpen(true)}
      >
        Contact
      </Button>
      <AddContactModal open={open} closeModal={() => setOpen(false)} />
    </>
  );
}

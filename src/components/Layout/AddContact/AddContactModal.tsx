import { useState } from 'react';
import { Button, Form, Modal } from 'antd';
import { useCreateContact } from '#/services/contactService.ts';
import type { CreateContact } from '#/models/ContactModel.ts';
import type { Dayjs } from 'dayjs';
import { ContactFormFields } from '#/components/Contacts/ContactDetail/ContactEdit/ContactFormFields.tsx';
import { GeneralPractitionerModal } from '#/components/Contacts/ContactDetail/ContactEdit/GeneralPractitionerModal.tsx';
import { useGetAllGeneralPractitioners } from '#/services/generalPractitionerService.ts';

interface AddContactModalProps {
  open: boolean;
  closeModal: () => void;
}

type ContactFormValues = Omit<CreateContact, 'birth_date'> & {
  birth_date?: Dayjs;
};

export function AddContactModal({ open, closeModal }: AddContactModalProps) {
  const { mutate, isPending } = useCreateContact();
  const [form] = Form.useForm<ContactFormValues>();
  const { data: generalPractitioners = [] } = useGetAllGeneralPractitioners();
  const [isCreatePractitionerModalOpen, setIsCreatePractitionerModalOpen] = useState(false);

  if (!open) return null;

  const handlePractitionerCreated = (newId: number) => {
    form.setFieldValue('general_practitioner_id', newId);
  };

  const onFinish = (values: ContactFormValues) => {
    mutate(
      { ...values, birth_date: values.birth_date?.toDate() },
      {
        onSuccess: () => {
          form.resetFields();
          closeModal();
        },
      },
    );
  };

  return (
    <>
      <Modal
        title="Nouveau Contact"
        open={open}
        footer={null}
        centered
        onCancel={() => {
          form.resetFields();
          closeModal();
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
          <ContactFormFields
            generalPractitioners={generalPractitioners}
            onOpenCreatePractitioner={() => setIsCreatePractitionerModalOpen(true)}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => { form.resetFields(); closeModal(); }}>
              Annuler
            </Button>
            <Button type="primary" htmlType="submit" loading={isPending}>
              Créer
            </Button>
          </div>
        </Form>
      </Modal>

      <GeneralPractitionerModal
        open={isCreatePractitionerModalOpen}
        onClose={() => setIsCreatePractitionerModalOpen(false)}
        onCreated={handlePractitionerCreated}
      />
    </>
  );
}

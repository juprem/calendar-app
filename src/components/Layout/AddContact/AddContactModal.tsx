import { Button, Form, Modal } from 'antd';
import { useCreateContact } from '#/services/contactService.ts';
import type { CreateContact } from '#/domain/contact/models.ts';
import type { Dayjs } from 'dayjs';
import { ContactFormFields } from '#/components/Contacts/ContactDetail/ContactEdit/ContactFormFields.tsx';

interface AddContactModalProps {
  open: boolean;
  closeModal: () => void;
}

type ContactFormValues = Omit<CreateContact, 'birthDate'> & {
  birthDate?: Dayjs;
};

export function AddContactModal({ open, closeModal }: AddContactModalProps) {
  const { mutate, isPending } = useCreateContact();
  const [form] = Form.useForm<ContactFormValues>();

  if (!open) return null;

  const onFinish = (values: ContactFormValues) => {
    mutate(
      { ...values, birthDate: values.birthDate?.toDate() },
      {
        onSuccess: () => {
          form.resetFields();
          closeModal();
        },
      },
    );
  };

  return (
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
        <ContactFormFields />
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
  );
}

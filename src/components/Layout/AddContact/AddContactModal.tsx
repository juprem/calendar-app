import { Button, Form, Input, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useCreateContact } from '#/services/contactService.ts';
import type { CreateContact } from '#/models/ContactModel.ts';

interface AddContactModalProps {
  open: boolean;
  closeModal: () => void;
}

export function AddContactModal({ open, closeModal }: AddContactModalProps) {
  const { mutate, isPending } = useCreateContact();
  const [form] = Form.useForm<CreateContact>();

  if (!open) return null;

  const onFinish = (values: CreateContact) => {
    mutate(values, {
      onSuccess: () => {
        form.resetFields();
        closeModal();
      },
    });
  };

  return (
    <Modal
      title="Nouveau Contact"
      open={open}
      footer={null}
      onCancel={() => {
        form.resetFields();
        closeModal();
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="firstname" label="Prénom" rules={[{ required: true }]}>
            <Input placeholder="Prénom" />
          </Form.Item>
          <Form.Item name="lastname" label="Nom" rules={[{ required: true }]}>
            <Input placeholder="Nom" />
          </Form.Item>
        </div>

        <Form.Item name="email" label="Email">
          <Input placeholder="email@example.fr" type="email" />
        </Form.Item>

        <Form.Item name="phone_number" label="Téléphone">
          <Input placeholder="+33 6 12 34 56 78" />
        </Form.Item>

        <Form.Item name="notes" label="Notes">
          <TextArea rows={3} placeholder="Ajouter des notes..." />
        </Form.Item>

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

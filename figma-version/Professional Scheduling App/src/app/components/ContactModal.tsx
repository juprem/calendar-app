import { Modal, Form, Input, Button } from 'antd';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: any) => {
    console.log('New contact:', values);
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Nouveau Contact"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <div className="flex gap-4">
          <Form.Item
            label="Prénom"
            name="firstName"
            rules={[{ required: true, message: 'Requis' }]}
            className="flex-1"
          >
            <Input placeholder="Prénom" />
          </Form.Item>

          <Form.Item
            label="Nom"
            name="lastName"
            rules={[{ required: true, message: 'Requis' }]}
            className="flex-1"
          >
            <Input placeholder="Nom" />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Requis' },
            { type: 'email', message: 'Email invalide' }
          ]}
        >
          <Input type="email" placeholder="email@example.fr" />
        </Form.Item>

        <Form.Item
          label="Téléphone"
          name="phone"
          rules={[{ required: true, message: 'Requis' }]}
        >
          <Input placeholder="+33 6 12 34 56 78" />
        </Form.Item>

        <Form.Item label="Notes" name="notes">
          <Input.TextArea rows={3} placeholder="Ajouter des notes..." />
        </Form.Item>

        <Form.Item className="mb-0 flex justify-end gap-2">
          <Button onClick={onClose}>Annuler</Button>
          <Button 
            type="primary" 
            htmlType="submit"
            style={{ backgroundColor: '#92400E' }}
          >
            Créer
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

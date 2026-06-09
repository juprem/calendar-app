import { Button, Form, Input, Modal } from 'antd';
import { useCreateGeneralPractitioner } from '#/services/generalPractitionerService.ts';

interface GeneralPractitionerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (newId: number) => void;
}

type GeneralPractitionerFormValues = {
  firstname?: string;
  lastname: string;
  address?: string;
};

const lastnameRequiredRule = { required: true, message: 'Le nom est requis' };

export function GeneralPractitionerModal({ open, onClose, onCreated }: GeneralPractitionerModalProps) {
  const [form] = Form.useForm<GeneralPractitionerFormValues>();
  const { mutate: createGP, isPending } = useCreateGeneralPractitioner();

  const handleFinish = (values: GeneralPractitionerFormValues) => {
    createGP(
      {
        lastname: values.lastname,
        firstname: values.firstname || null,
        address: values.address || null,
      },
      {
        onSuccess: (newGP) => {
          form.resetFields();
          onCreated(newGP.id);
          onClose();
        },
      },
    );
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Nouveau médecin traitant"
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          <Form.Item name="firstname" label="Prénom">
            <Input placeholder="Prénom" />
          </Form.Item>
          <Form.Item name="lastname" label="Nom" rules={[lastnameRequiredRule]}>
            <Input placeholder="Nom" />
          </Form.Item>
        </div>
        <Form.Item name="address" label="Adresse">
          <Input placeholder="12 rue de la Paix, 75001 Paris" />
        </Form.Item>
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel}>Annuler</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Ajouter
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

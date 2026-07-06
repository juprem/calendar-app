import { Button, Form, Input, Modal } from 'antd';
import type { GeneralPractitioner } from '#/domain/generalPractitioner/models.ts';
import {
  useCreateGeneralPractitioner,
  useUpdateGeneralPractitioner,
} from '#/services/generalPractitionerService.ts';

interface GeneralPractitionerFormModalProps {
  open: boolean;
  onClose: () => void;
  practitioner?: GeneralPractitioner | null;
  onSaved: (id: number) => void;
}

type GeneralPractitionerFormValues = {
  firstname?: string;
  lastname: string;
  address?: string;
};

const lastnameRequiredRule = { required: true, message: 'Le nom est requis' };

export function GeneralPractitionerFormModal({ open, onClose, practitioner, onSaved }: GeneralPractitionerFormModalProps) {
  const [form] = Form.useForm<GeneralPractitionerFormValues>();
  const { mutate: createGeneralPractitioner, isPending: isCreating } = useCreateGeneralPractitioner();
  const { mutate: updateGeneralPractitioner, isPending: isUpdating } = useUpdateGeneralPractitioner();

  const isEditing = practitioner != null;
  const initialValues: GeneralPractitionerFormValues = {
    firstname: practitioner?.firstname ?? undefined,
    lastname: practitioner?.lastname ?? '',
    address: practitioner?.address ?? undefined,
  };

  const handleFinish = (values: GeneralPractitionerFormValues) => {
    const onSuccess = (savedPractitioner: { id: number }) => {
      form.resetFields();
      onSaved(savedPractitioner.id);
      onClose();
    };

    if (isEditing) {
      updateGeneralPractitioner(
        {
          id: practitioner.id,
          lastname: values.lastname,
          firstname: values.firstname || null,
          address: values.address || null,
        },
        { onSuccess },
      );
    } else {
      createGeneralPractitioner(
        {
          lastname: values.lastname,
          firstname: values.firstname || null,
          address: values.address || null,
        },
        { onSuccess },
      );
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={isEditing ? 'Modifier le médecin traitant' : 'Nouveau médecin traitant'}
      open={open}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={handleFinish} className="mt-4">
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
          <Button type="primary" htmlType="submit" loading={isCreating || isUpdating}>
            {isEditing ? 'Enregistrer' : 'Ajouter'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

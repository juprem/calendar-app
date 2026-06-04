import { Button, DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd';
import { useAddRdv } from '#/services/calendarService.ts';
import type { Dayjs } from 'dayjs';
import { RDV_TYPE_OPTIONS, STATUT_OPTIONS } from '#/models/RdvModel.ts';
import { ContactSelectField } from '#/components/Layout/AddRdv/ContactSelectField.tsx';

interface AddRdvProps {
  open: boolean;
  onClose: () => void;
}

interface CreateRdvFormValues {
  contact_id?: number;
  name: string;
  day: Dayjs;
  start_time: Dayjs;
  end_time: Dayjs;
  rdv_type?: string;
  is_confirmed?: boolean;
  additional_infos?: string;
}

export function AddRdv({ open, onClose }: AddRdvProps) {
  const { mutate: addRdv, isPending } = useAddRdv();
  const [form] = Form.useForm<CreateRdvFormValues>();

  if (!open) return null;

  const onFinish = (values: CreateRdvFormValues) => {
    addRdv(
      {
        date: values.day.format('YYYY-MM-DD'),
        name: values.name,
        start_hour: values.start_time.format('HH:mm'),
        end_hour: values.end_time.format('HH:mm'),
        rdv_type: values.rdv_type,
        is_confirmed: values.is_confirmed,
        contact_id: values.contact_id ?? null,
        additional_infos: values.additional_infos || null,
      },
      {
        onSuccess: () => {
          form.resetFields();
          onClose();
        },
      },
    );
  };

  return (
    <Modal
      title="Nouveau Rendez-vous"
      open={open}
      centered
      footer={null}
      styles={{
        container: { maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
        body: { overflowY: 'auto', flex: '1 1 auto' },
      }}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <ContactSelectField onContactSelect={(name) => form.setFieldValue('name', name)} />

        <Form.Item label="Nom" name="name" rules={[{ required: true }]}>
          <Input placeholder="Nom du rendez-vous" />
        </Form.Item>

        <Form.Item label="Date" name="day" rules={[{ required: true }]}>
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-3">
          <Form.Item label="Heure de début" name="start_time" rules={[{ required: true }]}>
            <TimePicker
              className="w-full"
              format="HH:mm"
              minuteStep={15}
              placeholder="Sélectionner l'heure"
              needConfirm={false}
            />
          </Form.Item>
          <Form.Item label="Heure de fin" name="end_time" rules={[{ required: true }]}>
            <TimePicker
              className="w-full"
              format="HH:mm"
              minuteStep={15}
              placeholder="Sélectionner l'heure"
              needConfirm={false}
            />
          </Form.Item>
        </div>

        <Form.Item label="Type" name="rdv_type">
          <Select placeholder="Consultation" options={RDV_TYPE_OPTIONS} allowClear />
        </Form.Item>

        <Form.Item label="Statut" name="is_confirmed">
          <Select placeholder="Confirmé" options={STATUT_OPTIONS} allowClear />
        </Form.Item>

        <Form.Item label="Informations complémentaires" name="additional_infos">
          <Input.TextArea rows={2} placeholder="Notes, précautions, contexte..." />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-2">
          <Button
            onClick={() => {
              form.resetFields();
              onClose();
            }}
          >
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

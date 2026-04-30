import { Button, DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { useAddRdv } from '#/services/calendarService.ts';
import type { Dayjs } from 'dayjs';

interface AddRdvProps {
  open: boolean;
  onClose: () => void;
}

interface CreateRdvFormValues {
  name: string;
  day: Dayjs;
  start_time: Dayjs;
  end_time: Dayjs;
  rdv_type?: string;
  is_confirmed?: boolean;
}

const RDV_TYPE_OPTIONS = [
  { value: 'Consultation', label: 'Consultation' },
  { value: 'Suivi', label: 'Suivi' },
  { value: 'Bilan', label: 'Bilan' },
  { value: 'Urgence', label: 'Urgence' },
];

const STATUT_OPTIONS = [
  { value: true, label: 'Confirmé' },
  { value: false, label: 'En attente' },
];

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
      footer={null}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
    >
      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-4">
        <Form.Item label="Nom du patient" name="name" rules={[{ required: true }]}>
          <Input placeholder="Nom du patient" />
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

        <div className="flex justify-end gap-2 mt-2">
          <Button onClick={() => { form.resetFields(); onClose(); }}>
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

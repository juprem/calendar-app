import { Button, DatePicker, Form, Input, Modal, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { useAddRdv } from '#/services/calendarService.ts';
import { RDV_TYPE_OPTIONS, STATUT_OPTIONS } from '#/models/RdvModel.ts';
import type { RdvFormValues } from '#/models/RdvModel.ts';
import { ContactSelectField } from '#/components/Layout/AddRdv/ContactSelectField.tsx';
import { getHourAndMinute } from '#/utils/timeUtils.ts';

interface AddRdvProps {
  open: boolean;
  onClose: () => void;
  defaultDay?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
}

export function AddRdv({ open, onClose, defaultDay, defaultStartTime, defaultEndTime }: AddRdvProps) {
  const { mutate: addRdv, isPending } = useAddRdv();
  const [form] = Form.useForm<RdvFormValues>();

  const [sh, sm] = defaultStartTime ? getHourAndMinute(defaultStartTime) : [0, 0];
  const [eh, em] = defaultEndTime ? getHourAndMinute(defaultEndTime) : [0, 0];
  const timeRange: [Dayjs, Dayjs] | undefined = defaultStartTime && defaultEndTime
    ? [dayjs().hour(sh).minute(sm).second(0), dayjs().hour(eh).minute(em).second(0)]
    : undefined;
  const initialValues: Partial<RdvFormValues> = defaultDay
    ? {
      day: dayjs(defaultDay, 'YYYY-MM-DD'),
      ...(timeRange && { time_range: timeRange }),
    }
    : {};

  if (!open) return null;

  const onFinish = (values: RdvFormValues) => {
    const range = values.time_range;
    if (!range) return;

    addRdv(
      {
        date: values.day.format('YYYY-MM-DD'),
        name: values.name,
        start_hour: range[0].format('HH:mm'),
        end_hour: range[1].format('HH:mm'),
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
      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}
            className="mt-4 overflow-x-hidden">
        <ContactSelectField onContactSelect={(name) => form.setFieldValue('name', name)} />

        <Form.Item label="Nom" name="name" rules={[{ required: true }]}>
          <Input placeholder="Nom du rendez-vous" />
        </Form.Item>

        <Form.Item label="Date" name="day" rules={[{ required: true }]}>
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item label="Horaires" name="time_range" rules={[{ required: true }]}>
          <TimePicker.RangePicker
            className="w-full"
            format="HH:mm"
            minuteStep={15}
            needConfirm={false}
            placeholder={['Début', 'Fin']}
          />
        </Form.Item>

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

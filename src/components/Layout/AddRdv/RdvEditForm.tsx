import { useEffect } from 'react';
import { Button, DatePicker, Form, Input, Popconfirm, Select, TimePicker } from 'antd';
import { Trash2 } from 'lucide-react';
import dayjs, { type Dayjs } from 'dayjs';
import { useDeleteRdv, useUpdateRdv } from '#/services/calendarService.ts';
import { RDV_TYPE_OPTIONS, STATUT_OPTIONS } from '#/models/RdvModel.ts';
import type { RdvWithContact } from '#/models/CalendarModel.ts';
import { getHourAndMinute } from '#/utils/timeUtils.ts';
import { ContactSelectField } from '#/components/Layout/AddRdv/ContactSelectField.tsx';

interface RdvEditFormProps {
  rdv: RdvWithContact;
  isoDate: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface EditRdvFormValues {
  contact_id?: number;
  name: string;
  day: Dayjs;
  start_time: Dayjs;
  end_time: Dayjs;
  rdv_type?: string;
  is_confirmed?: boolean;
  additional_infos?: string;
}

export function RdvEditForm({ rdv, isoDate, onSuccess, onCancel }: RdvEditFormProps) {
  const { mutate: updateRdv, isPending: isUpdating } = useUpdateRdv();
  const { mutate: deleteRdv, isPending: isDeleting } = useDeleteRdv(isoDate);
  const [form] = Form.useForm<EditRdvFormValues>();

  const [startH, startM] = getHourAndMinute(rdv.start_hour);
  const [endH, endM] = getHourAndMinute(rdv.end_hour);

  const initialValues: EditRdvFormValues = {
    contact_id: rdv.contact_id ?? undefined,
    name: rdv.name,
    day: dayjs(isoDate, 'YYYY-MM-DD'),
    start_time: dayjs().hour(startH).minute(startM).second(0),
    end_time: dayjs().hour(endH).minute(endM).second(0),
    rdv_type: rdv.rdv_type ?? undefined,
    is_confirmed: rdv.is_confirmed ?? undefined,
    additional_infos: rdv.additional_infos ?? undefined,
  };

  useEffect(() => {
    form.setFieldsValue(initialValues);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rdv.id, isoDate]);

  const onFinish = (values: EditRdvFormValues) => {
    updateRdv(
      {
        id: rdv.id,
        date: values.day.format('YYYY-MM-DD'),
        name: values.name,
        start_hour: values.start_time.format('HH:mm'),
        end_hour: values.end_time.format('HH:mm'),
        rdv_type: values.rdv_type ?? null,
        is_confirmed: values.is_confirmed ?? null,
        contact_id: values.contact_id ?? null,
        additional_infos: values.additional_infos || null,
      },
      { onSuccess },
    );
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish} className="mt-4">
      <ContactSelectField onContactSelect={(name) => form.setFieldValue('name', name)} />

      <Form.Item label="Nom" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item label="Date" name="day" rules={[{ required: true }]}>
        <DatePicker className="w-full" format="DD/MM/YYYY" />
      </Form.Item>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item label="Heure de début" name="start_time" rules={[{ required: true }]}>
          <TimePicker className="w-full" format="HH:mm" minuteStep={15} needConfirm={false} />
        </Form.Item>
        <Form.Item label="Heure de fin" name="end_time" rules={[{ required: true }]}>
          <TimePicker className="w-full" format="HH:mm" minuteStep={15} needConfirm={false} />
        </Form.Item>
      </div>

      <Form.Item label="Type" name="rdv_type">
        <Select placeholder="Type de consultation" options={RDV_TYPE_OPTIONS} allowClear />
      </Form.Item>

      <Form.Item label="Statut" name="is_confirmed">
        <Select placeholder="Statut" options={STATUT_OPTIONS} allowClear />
      </Form.Item>

      <Form.Item label="Informations complémentaires" name="additional_infos">
        <Input.TextArea rows={2} placeholder="Notes, précautions, contexte..." />
      </Form.Item>

      <div className="flex justify-between items-center mt-2">
        <Popconfirm
          title="Supprimer ce rendez-vous ?"
          description="Cette action est irréversible."
          onConfirm={() => deleteRdv(rdv.id, { onSuccess })}
          okText="Supprimer"
          cancelText="Annuler"
          okButtonProps={{ danger: true }}
        >
          <Button danger icon={<Trash2 size={13} />} loading={isDeleting}>
            Supprimer
          </Button>
        </Popconfirm>

        <div className="flex gap-2">
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="primary" htmlType="submit" loading={isUpdating}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Form>
  );
}

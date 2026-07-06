import { Button, Form, Popconfirm } from 'antd';
import { Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { RdvFormValues } from '#/models/RdvModel.ts';
import { CONFIRMATION_MODE_VALUES, RDV_TYPE_VALUES } from '#/domain/calendar/models.ts';
import type { RdvWithContact } from '#/domain/calendar/models.ts';
import { getHourAndMinute } from '#/utils/timeUtils.ts';
import { RdvFormFields } from '#/components/Layout/AddRdv/RdvFormFields.tsx';
import { useDeleteRdv, useUpdateRdv } from '#/services/calendarService.ts';

interface RdvEditFormProps {
  rdv: RdvWithContact;
  isoDate: string;
  onSuccess: () => void;
  onCancel: () => void;
}


export function RdvEditForm({ rdv, isoDate, onSuccess, onCancel }: RdvEditFormProps) {
  const { mutate: updateRdv, isPending: isUpdating } = useUpdateRdv();
  const { mutate: deleteRdv, isPending: isDeleting } = useDeleteRdv(isoDate);
  const [form] = Form.useForm<RdvFormValues>();

  const [startH, startM] = getHourAndMinute(rdv.startHour);
  const [endH, endM] = getHourAndMinute(rdv.endHour);

  const timeRange: [Dayjs, Dayjs] = [
    dayjs().hour(startH).minute(startM).second(0),
    dayjs().hour(endH).minute(endM).second(0),
  ];

  const initialValues: RdvFormValues = {
    contactId: rdv.contactId ?? undefined,
    name: rdv.name,
    day: dayjs(isoDate, 'YYYY-MM-DD'),
    timeRange: timeRange,
    rdvType: RDV_TYPE_VALUES.find((t) => t === rdv.rdvType),
    isConfirmed: rdv.isConfirmed ?? undefined,
    additionalInfos: rdv.additionalInfos ?? undefined,
    confirmationDate: rdv.confirmationDate ? dayjs(rdv.confirmationDate) : undefined,
    confirmationMode: CONFIRMATION_MODE_VALUES.find((mode) => mode === rdv.confirmationMode) ?? 'email',
  };

  const onFinish = (values: RdvFormValues) => {
    const range = values.timeRange;
    if (!range) return;

    updateRdv(
      {
        id: rdv.id,
        date: values.day.format('YYYY-MM-DD'),
        name: values.name,
        startHour: range[0].format('HH:mm'),
        endHour: range[1].format('HH:mm'),
        rdvType: values.rdvType ?? null,
        isConfirmed: values.isConfirmed ?? null,
        contactId: values.contactId ?? null,
        additionalInfos: values.additionalInfos || null,
        confirmationDate: values.confirmationDate ? values.confirmationDate.format('YYYY-MM-DD') : null,
        confirmationMode: values.confirmationMode ?? null,
      },
      { onSuccess },
    );
  };

  return (
    <Form
      key={`${rdv.id}-${isoDate}`}
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      className="mt-4"
    >
      <RdvFormFields onContactSelect={(name) => form.setFieldValue('name', name)} />

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

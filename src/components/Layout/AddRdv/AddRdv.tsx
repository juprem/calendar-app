import { Button, Form, Modal } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import type { RdvFormValues } from '#/models/RdvModel.ts';
import { RdvFormFields } from '#/components/Layout/AddRdv/RdvFormFields.tsx';
import { getHourAndMinute } from '#/utils/timeUtils.ts';
import { useAddRdv } from '#/services/calendarService.ts';
import { RDV_MODAL_STYLES } from '#/components/Layout/AddRdv/rdvModalStyles.ts';

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
  const initialValues: Partial<RdvFormValues> = {
    confirmationMode: 'email',
    ...(defaultDay && {
      day: dayjs(defaultDay, 'YYYY-MM-DD'),
      ...(timeRange && { timeRange: timeRange }),
    }),
  };

  if (!open) return null;

  const onFinish = (values: RdvFormValues) => {
    const range = values.timeRange;
    if (!range) return;

    addRdv(
      {
        date: values.day.format('YYYY-MM-DD'),
        name: values.name,
        startHour: range[0].format('HH:mm'),
        endHour: range[1].format('HH:mm'),
        rdvType: values.rdvType,
        isConfirmed: values.isConfirmed,
        contactId: values.contactId ?? null,
        additionalInfos: values.additionalInfos || null,
        confirmationDate: values.confirmationDate ? values.confirmationDate.format('YYYY-MM-DD') : null,
        confirmationMode: values.confirmationMode ?? null,
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
      styles={RDV_MODAL_STYLES}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
        className="mt-4 overflow-x-hidden"
      >
        <RdvFormFields onContactSelect={(name) => form.setFieldValue('name', name)} />

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

import { DatePicker, Form, Input, Select, TimePicker } from 'antd';
import { CONFIRMATION_MODE_OPTIONS, RDV_TYPE_OPTIONS, STATUT_OPTIONS } from '#/models/RdvModel.ts';
import { ContactSelectField } from '#/components/Layout/AddRdv/ContactSelectField.tsx';

interface RdvFormFieldsProps {
  onContactSelect: (fullName: string) => void;
}

export function RdvFormFields({ onContactSelect }: RdvFormFieldsProps) {
  return (
    <>
      <ContactSelectField onContactSelect={onContactSelect} />

      <Form.Item label="Nom" name="name" rules={[{ required: true }]}>
        <Input placeholder="Nom du rendez-vous" />
      </Form.Item>

      <Form.Item label="Date" name="day" rules={[{ required: true }]}>
        <DatePicker className="w-full" format="DD/MM/YYYY" />
      </Form.Item>

      <Form.Item label="Horaires" name="timeRange" rules={[{ required: true }]}>
        <TimePicker.RangePicker
          className="w-full"
          format="HH:mm"
          minuteStep={15}
          needConfirm={false}
          placeholder={['Début', 'Fin']}
        />
      </Form.Item>

      <Form.Item label="Type" name="rdvType">
        <Select placeholder="Type de consultation" options={RDV_TYPE_OPTIONS} allowClear />
      </Form.Item>

      <div className="grid grid-cols-3 gap-3">
        <Form.Item label="Statut" name="isConfirmed">
          <Select placeholder="Statut" options={STATUT_OPTIONS} allowClear />
        </Form.Item>
        <Form.Item label="Date" name="confirmationDate">
          <DatePicker className="w-full" format="DD/MM/YYYY" />
        </Form.Item>
        <Form.Item label="Mode" name="confirmationMode">
          <Select options={CONFIRMATION_MODE_OPTIONS} allowClear />
        </Form.Item>
      </div>

      <Form.Item label="Informations complémentaires" name="additionalInfos">
        <Input.TextArea rows={2} placeholder="Notes, précautions, contexte..." />
      </Form.Item>
    </>
  );
}

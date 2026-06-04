import { DatePicker, Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { CIVILITY_OPTIONS } from '#/models/ContactModel.ts';

export function ContactFormFields() {
  return (
    <>
      <div className="grid grid-cols-[80px_1fr_1fr] gap-3">
        <Form.Item name="civility" label="Civilité">
          <Select placeholder="—" options={CIVILITY_OPTIONS} allowClear />
        </Form.Item>
        <Form.Item name="firstname" label="Prénom" rules={[{ required: true }]}>
          <Input placeholder="Prénom" />
        </Form.Item>
        <Form.Item name="lastname" label="Nom" rules={[{ required: true }]}>
          <Input placeholder="Nom" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item name="email" label="Email">
          <Input placeholder="email@example.fr" type="email" />
        </Form.Item>
        <Form.Item name="phone_number" label="Téléphone">
          <Input placeholder="+33 6 12 34 56 78" />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item name="birth_date" label="Date de naissance">
          <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="JJ/MM/AAAA" />
        </Form.Item>
        <Form.Item name="birth_location" label="Lieu de naissance">
          <Input placeholder="Ville, Pays" />
        </Form.Item>
      </div>

      <Form.Item name="address" label="Adresse">
        <Input placeholder="12 rue de la Paix, 75001 Paris" />
      </Form.Item>

      <Form.Item name="notes" label="Notes">
        <TextArea rows={3} placeholder="Ajouter des notes..." />
      </Form.Item>
    </>
  );
}

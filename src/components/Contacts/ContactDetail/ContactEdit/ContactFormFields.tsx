import { DatePicker, Form, Input, Select } from 'antd';
import type { RuleObject } from 'antd/es/form';
import TextArea from 'antd/es/input/TextArea';
import { CIVILITY_OPTIONS } from '#/models/ContactModel.ts';
import { isValidFrenchPhoneNumber } from '#/utils/contactUtils.ts';
import { GeneralPractitionerSelectField } from '#/components/Contacts/ContactDetail/ContactEdit/GeneralPractitionerSelectField/GeneralPractitionerSelectField.tsx';
import { PhoneNumberField } from '#/components/Contacts/ContactDetail/ContactEdit/PhoneNumberField/PhoneNumberField.tsx';

function validateFrenchPhoneNumber(_rule: RuleObject, phoneNumber: string | undefined): Promise<void> {
  return isValidFrenchPhoneNumber(phoneNumber)
    ? Promise.resolve()
    : Promise.reject(new Error('Le numéro doit contenir 9 chiffres'));
}

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

      <GeneralPractitionerSelectField />

      <div className="grid grid-cols-2 gap-3">
        <Form.Item name="email" label="Email">
          <Input placeholder="email@example.fr" type="email" />
        </Form.Item>
        <Form.Item name="phoneNumber" label="Téléphone" rules={[{ validator: validateFrenchPhoneNumber }]}>
          <PhoneNumberField />
        </Form.Item>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Form.Item name="birthDate" label="Date de naissance">
          <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="JJ/MM/AAAA" />
        </Form.Item>
        <Form.Item name="birthLocation" label="Lieu de naissance">
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

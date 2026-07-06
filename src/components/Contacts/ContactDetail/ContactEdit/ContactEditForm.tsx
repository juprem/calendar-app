import { Button, Form } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import type { Contact, UpdateContact } from '#/domain/contact/models.ts';
import { toValidCivility } from '#/models/ContactModel.ts';
import { ContactAvatar } from '#/components/Contacts/ContactDetail/ContactAvatar.tsx';
import { ContactFormFields } from '#/components/Contacts/ContactDetail/ContactEdit/ContactFormFields.tsx';
import { useUpdateContact } from '#/services/contactService.ts';

interface ContactEditFormProps {
  contact: Contact;
  onCancel: () => void;
}

type ContactFormValues = Omit<UpdateContact, 'id' | 'birthDate'> & {
  birthDate?: Dayjs | null;
};

export function ContactEditForm({ contact, onCancel }: ContactEditFormProps) {
  const [form] = Form.useForm<ContactFormValues>();
  const { mutate, isPending } = useUpdateContact();

  const initialValues: ContactFormValues = {
    civility: toValidCivility(contact.civility),
    firstname: contact.firstname,
    lastname: contact.lastname,
    email: contact.email ?? undefined,
    phoneNumber: contact.phoneNumber ?? undefined,
    notes: contact.notes ?? undefined,
    birthDate: dayjs(contact.birthDate),
    birthLocation: contact.birthLocation ?? undefined,
    address: contact.address ?? undefined,
    generalPractitionerId: contact.generalPractitionerId ?? undefined,
  };

  const onFinish = (values: ContactFormValues) => {
    mutate(
      {
        id: contact.id,
        ...values,
        birthDate: values.birthDate?.toDate() ?? null,
        email: values.email || null,
        phoneNumber: values.phoneNumber || null,
        notes: values.notes || null,
        birthLocation: values.birthLocation || null,
        address: values.address || null,
        generalPractitionerId: values.generalPractitionerId ?? null,
      },
      { onSuccess: onCancel },
    );
  };

  return (
    <div className="flex-1 p-8 bg-white overflow-y-auto">
      <div className="flex items-center gap-5 mb-8">
        <ContactAvatar firstname={contact.firstname} lastname={contact.lastname} size="md" />
        <h2 className="text-2xl font-bold text-[#1C1917]">Modifier le contact</h2>
      </div>

      <Form form={form} layout="vertical" initialValues={initialValues} onFinish={onFinish}>
        <ContactFormFields />
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Enregistrer
          </Button>
        </div>
      </Form>
    </div>
  );
}

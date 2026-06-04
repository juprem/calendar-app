import { Button, Form } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useUpdateContact } from '#/services/contactService.ts';
import type { Contact, UpdateContact } from '#/models/ContactModel.ts';
import { toValidCivility } from '#/models/ContactModel.ts';
import { ContactAvatar } from '#/components/Contacts/ContactAvatar.tsx';
import { ContactFormFields } from '#/components/Contacts/ContactFormFields.tsx';

interface ContactEditFormProps {
  contact: Contact;
  onCancel: () => void;
}

type ContactFormValues = Omit<UpdateContact, 'id' | 'birth_date'> & {
  birth_date?: Dayjs | null;
};

export function ContactEditForm({ contact, onCancel }: ContactEditFormProps) {
  const { mutate, isPending } = useUpdateContact();

  const initialValues: ContactFormValues = {
    civility: toValidCivility(contact.civility),
    firstname: contact.firstname,
    lastname: contact.lastname,
    email: contact.email ?? undefined,
    phone_number: contact.phone_number ?? undefined,
    notes: contact.notes ?? undefined,
    birth_date: contact.birth_date ? dayjs(contact.birth_date) : undefined,
    birth_location: contact.birth_location ?? undefined,
    address: contact.address ?? undefined,
  };

  const onFinish = (values: ContactFormValues) => {
    mutate(
      {
        id: contact.id,
        ...values,
        birth_date: values.birth_date?.toDate() ?? null,
        email: values.email || null,
        phone_number: values.phone_number || null,
        notes: values.notes || null,
        birth_location: values.birth_location || null,
        address: values.address || null,
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

      <Form layout="vertical" initialValues={initialValues} onFinish={onFinish}>
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

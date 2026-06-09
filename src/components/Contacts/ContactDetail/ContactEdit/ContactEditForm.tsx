import { useState } from 'react';
import { Button, Form } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useUpdateContact } from '#/services/contactService.ts';
import type { Contact, UpdateContact } from '#/models/ContactModel.ts';
import { toValidCivility } from '#/models/ContactModel.ts';
import { ContactAvatar } from '#/components/Contacts/ContactDetail/ContactAvatar.tsx';
import { ContactFormFields } from '#/components/Contacts/ContactDetail/ContactEdit/ContactFormFields.tsx';
import { GeneralPractitionerModal } from '#/components/Contacts/ContactDetail/ContactEdit/GeneralPractitionerModal.tsx';
import { useGetAllGeneralPractitioners } from '#/services/generalPractitionerService.ts';

interface ContactEditFormProps {
  contact: Contact;
  onCancel: () => void;
}

type ContactFormValues = Omit<UpdateContact, 'id' | 'birth_date'> & {
  birth_date?: Dayjs | null;
};

export function ContactEditForm({ contact, onCancel }: ContactEditFormProps) {
  const [form] = Form.useForm<ContactFormValues>();
  const { mutate, isPending } = useUpdateContact();
  const { data: generalPractitioners = [] } = useGetAllGeneralPractitioners();
  const [isCreatePractitionerModalOpen, setIsCreatePractitionerModalOpen] = useState(false);

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
    general_practitioner_id: contact.general_practitioner_id ?? undefined,
  };

  const handlePractitionerCreated = (newId: number) => {
    form.setFieldValue('general_practitioner_id', newId);
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
        general_practitioner_id: values.general_practitioner_id ?? null,
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
        <ContactFormFields
          generalPractitioners={generalPractitioners}
          onOpenCreatePractitioner={() => setIsCreatePractitionerModalOpen(true)}
        />
        <div className="flex justify-end gap-2">
          <Button onClick={onCancel}>Annuler</Button>
          <Button type="primary" htmlType="submit" loading={isPending}>
            Enregistrer
          </Button>
        </div>
      </Form>

      <GeneralPractitionerModal
        open={isCreatePractitionerModalOpen}
        onClose={() => setIsCreatePractitionerModalOpen(false)}
        onCreated={handlePractitionerCreated}
      />
    </div>
  );
}

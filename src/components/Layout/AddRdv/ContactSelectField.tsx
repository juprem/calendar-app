import { Form, Select } from 'antd';
import dayjs from 'dayjs';
import { useContactSearchSelect } from '#/hooks/useContactSearchSelect.ts';
import { findHomonymIds, formatContactName } from '#/utils/contactUtils.ts';

interface ContactSelectFieldProps {
  onContactSelect: (fullName: string) => void;
}

export function ContactSelectField({ onContactSelect }: ContactSelectFieldProps) {
  const form = Form.useFormInstance();
  const selectedContactId: number | undefined = Form.useWatch('contactId', form);
  const { contacts, onSearch, isFetching } = useContactSearchSelect(selectedContactId);
  const homonymIds = findHomonymIds(contacts);

  const options = contacts.map((contact) => ({
    value: contact.id,
    label: homonymIds.has(contact.id)
      ? `${formatContactName(contact)} · ${dayjs(contact.birthDate).format('DD/MM/YYYY')}`
      : formatContactName(contact),
  }));

  const handleChange = (contactId: number | undefined) => {
    const selectedContact = contacts.find((contact) => contact.id === contactId);
    if (selectedContact) onContactSelect(formatContactName(selectedContact));
  };

  return (
    <Form.Item label="Patient (contact)" name="contactId">
      <Select
        placeholder="Sélectionner un contact"
        allowClear
        showSearch={{ filterOption: false, onSearch }}
        loading={isFetching}
        options={options}
        onChange={handleChange}
      />
    </Form.Item>
  );
}

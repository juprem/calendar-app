import { Form, Select } from 'antd';
import dayjs from 'dayjs';
import { useGetAllContacts } from '#/services/contactService.ts';
import { findHomonymIds, formatContactName } from '#/utils/contactUtils.ts';

interface ContactSelectFieldProps {
  onContactSelect: (fullName: string) => void;
}

export function ContactSelectField({ onContactSelect }: ContactSelectFieldProps) {
  const { data: contacts = [] } = useGetAllContacts();
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
        showSearch
        filterOption={(searchInput, option) =>
          String(option?.label ?? '').toLowerCase().includes(searchInput.toLowerCase())
        }
        options={options}
        onChange={handleChange}
      />
    </Form.Item>
  );
}

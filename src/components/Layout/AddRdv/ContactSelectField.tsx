import { Form, Select } from 'antd';
import { useGetAllContacts } from '#/services/contactService.ts';
import { formatContactName } from '#/utils/contactUtils.ts';

interface ContactSelectFieldProps {
  onContactSelect: (fullName: string) => void;
}

export function ContactSelectField({ onContactSelect }: ContactSelectFieldProps) {
  const { data: contacts = [] } = useGetAllContacts();

  const options = contacts.map((c) => ({
    value: c.id,
    label: formatContactName(c),
  }));

  const handleChange = (id: number | undefined) => {
    if (!id) return;
    const option = options.find((o) => o.value === id);
    if (option) onContactSelect(option.label);
  };

  return (
    <Form.Item label="Patient (contact)" name="contactId">
      <Select
        placeholder="Sélectionner un contact"
        allowClear
        showSearch
        filterOption={(input, opt) =>
          String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
        }
        options={options}
        onChange={handleChange}
      />
    </Form.Item>
  );
}

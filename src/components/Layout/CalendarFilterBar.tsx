import { Select } from 'antd';
import { useContactSearchSelect } from '#/hooks/useContactSearchSelect.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { formatContactName } from '#/utils/contactUtils.ts';

export function CalendarFilterBar() {
  const contactFilter = useCalendarStore((s) => s.contactFilter);
  const setContactFilter = useCalendarStore((s) => s.setContactFilter);
  const { contacts, onSearch, isFetching } = useContactSearchSelect(contactFilter);

  const options = contacts.map((contact) => ({
    value: contact.id,
    label: formatContactName(contact),
  }));

  return (
    <Select
      className="w-48"
      size="small"
      placeholder="Filtrer par patient"
      allowClear
      showSearch={{ filterOption: false, onSearch }}
      loading={isFetching}
      value={contactFilter ?? undefined}
      options={options}
      onChange={(val) => setContactFilter(val ?? null)}
    />
  );
}

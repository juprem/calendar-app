import { Select } from 'antd';
import { useGetAllContacts } from '#/services/contactService.ts';
import { useCalendarStore } from '#/store/calendarStore.ts';
import { formatContactName } from '#/utils/contactUtils.ts';

export function CalendarFilterBar() {
  const { data: contacts = [] } = useGetAllContacts();
  const contactFilter = useCalendarStore((s) => s.contactFilter);
  const setContactFilter = useCalendarStore((s) => s.setContactFilter);

  const options = contacts.map((c) => ({
    value: c.id,
    label: formatContactName(c),
  }));

  return (
    <Select
      className="w-48"
      size="small"
      placeholder="Filtrer par patient"
      allowClear
      showSearch
      value={contactFilter ?? undefined}
      filterOption={(input, opt) =>
        String(opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
      options={options}
      onChange={(val) => setContactFilter(val ?? null)}
    />
  );
}

import { useCalendarStore } from '#/store/calendarStore.ts';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';

export function Today() {
  const today = useCalendarStore((state) => state.day);
  const setDay = useCalendarStore((state) => state.setDay);

  return (
    <div className="mb-4">
      <DatePicker
        // @ts-ignore
        locale={{ lang: { locale: 'fr' } }}
        format="dddd DD MMMM"
        value={today}
        onChange={(date) => setDay(dayjs(date))}
      />
    </div>
  );
}

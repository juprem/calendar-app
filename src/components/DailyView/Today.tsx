import dayjs from 'dayjs';
const today = dayjs().format('dddd DD MMMM');

export function Today() {

    return <div className="mb-4">{today}</div>;
}
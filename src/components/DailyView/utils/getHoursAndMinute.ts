export function getHourAndMinute(time: string) {
  const [hour, minute] = time.split(':').map((val) => parseInt(val));

  return [hour, minute];
}

/** @param {Date} date */
export function formatDateToKoreanMeridiem(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return '오전 10:30';
  }
  const hour24 = date.getHours();
  const minute = date.getMinutes();
  const meridiem = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${meridiem} ${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

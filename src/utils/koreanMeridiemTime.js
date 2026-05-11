/** @param {string} value 예: "오후 2:30", "14:30" */
export function koreanMeridiemToHHmm(value) {
  if (!value) return '10:30';
  const korean = value.match(/^(오전|오후)\s*(\d{1,2}):(\d{2})$/);
  if (korean) {
    const meridiem = korean[1];
    let hour = Number(korean[2]);
    const minute = Math.min(59, Math.max(0, Number(korean[3])));
    if (meridiem === '오전') {
      hour = hour === 12 ? 0 : hour;
    } else {
      hour = hour === 12 ? 12 : hour + 12;
    }
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  const plain = value.match(/^(\d{1,2}):(\d{2})$/);
  if (plain) {
    const h = Math.min(23, Math.max(0, Number(plain[1])));
    const min = Math.min(59, Math.max(0, Number(plain[2])));
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  return '10:30';
}

/** API `treatTime` "HH:mm" → "오전 10:30" 형식 */
export function hhmmToKoreanMeridiem(treatTime) {
  if (!treatTime || typeof treatTime !== 'string') return '오전 10:30';
  const m = treatTime.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return '오전 10:30';
  const hour24 = Math.min(23, Math.max(0, Number(m[1])));
  const minute = Math.min(59, Math.max(0, Number(m[2])));
  const meridiem = hour24 < 12 ? '오전' : '오후';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${meridiem} ${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

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

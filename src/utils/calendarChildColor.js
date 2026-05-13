import { PROFILE_COLOR_MAP } from '@/constants/profileColorData';

/** 캘린더 일정 칩용 Tailwind `bg-[#hex]` — 아이 `profileColor` enum 기준 */
function normalizeName(value) {
  return value != null ? String(value).trim() : '';
}

function resolveChildFromList(children, childId, childName) {
  const list = Array.isArray(children) ? children : [];
  const sid = childId != null && childId !== '' ? String(childId).trim() : '';
  const sname = normalizeName(childName);

  if (sid) {
    const byId = list.find((x) => String(x?.childId ?? x?.id ?? '').trim() === sid);
    if (byId) return byId;
  }

  if (!sname) return null;

  return (
    list.find((x) => normalizeName(x?.childName) === sname) ??
    list.find((x) => normalizeName(x?.nickname) === sname) ??
    list.find((x) => normalizeName(x?.name) === sname) ??
    null
  );
}

export function calendarLabelBgClassFromChildren(children, childId, childName = '') {
  const child = resolveChildFromList(children, childId, childName);
  const key = child?.profileColor;
  const hex = key && typeof PROFILE_COLOR_MAP[key] === 'string' ? PROFILE_COLOR_MAP[key] : null;
  if (!hex) return 'bg-[#FFC721]';
  return `bg-[${hex}]`;
}

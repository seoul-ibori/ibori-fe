import { PROFILE_COLOR_MAP } from '@/constants/profileColorData';

/** 캘린더 일정 칩용 Tailwind `bg-[#hex]` — 아이 `profileColor` enum 기준 */
export function calendarLabelBgClassFromChildren(children, childId) {
  const sid = childId != null && childId !== '' ? String(childId).trim() : '';
  if (!sid) return 'bg-[#FFC721]';
  const list = Array.isArray(children) ? children : [];
  const c = list.find((x) => String(x?.childId ?? x?.id ?? '').trim() === sid);
  const key = c?.profileColor;
  const hex =
    key && typeof PROFILE_COLOR_MAP[key] === 'string'
      ? PROFILE_COLOR_MAP[key]
      : PROFILE_COLOR_MAP.SKY_BLUE;
  return `bg-[${hex}]`;
}

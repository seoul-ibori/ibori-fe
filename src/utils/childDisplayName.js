/** GET /children 등에서 받은 목록에서 `childId`에 해당하는 실명(`childName`). */
export function childLegalNameFromList(children, childId) {
  if (childId == null || childId === '') return '';
  const sid = String(childId).trim();
  if (!sid) return '';
  const list = Array.isArray(children) ? children : [];
  const c = list.find((x) => String(x?.childId ?? x?.id ?? '').trim() === sid);
  if (!c) return '';
  const raw = c.childName ?? c.name;
  const name = raw != null ? String(raw).trim() : '';
  return name;
}

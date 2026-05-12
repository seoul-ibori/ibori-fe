/** 음성 녹음/아이 선택 화면용 폴백 (API 미연동·빈 목록 시). `profileColor`는 서버와 동일한 enum 문자열 */
export const VOICE_CHILDREN = [
  { id: '2', name: '우리 막둥이', profileColor: 'YELLOW' },
  { id: '1', name: '우리집 아들', profileColor: 'SKY_BLUE' },
  { id: '3', name: '우리 첫째 딸', profileColor: 'ORANGE' },
];

/**
 * 인증/회원 API 연동 후 이 목록을 서버 응답으로 교체하면 됨
 * id는 VOICE_CHILDREN과 동일하게 두어 녹음 플로우에서 넘어온 childId와 매칭
 */
export const REGISTERED_CHILDREN_DUMMY = [
  { id: '2', fullName: '김지원' },
  { id: '1', fullName: '김민준' },
  { id: '3', fullName: '김하나' },
];

export function getRegisteredChildFullName(childId) {
  if (!childId) return '';
  return REGISTERED_CHILDREN_DUMMY.find((c) => c.id === childId)?.fullName ?? '';
}

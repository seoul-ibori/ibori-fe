import { useMemo, useState } from 'react';

import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import { PROFILE_COLOR_MAP } from '@/constants/profileColorData';
import { VOICE_CHILDREN } from '@/constants/voiceChildren';

/** GET /children 등 API 한 건 → 선택 행용 */
function mapApiChildToRow(c) {
  const id = c?.childId != null ? String(c.childId) : c?.id != null ? String(c.id) : '';
  const nameRaw =
    (c?.nickname && String(c.nickname).trim()) ||
    (c?.childName && String(c.childName).trim()) ||
    (c?.name && String(c.name).trim());
  const name = nameRaw || '아이';
  const profileColor =
    typeof c?.profileColor === 'string' && c.profileColor.trim()
      ? c.profileColor.trim()
      : 'SKY_BLUE';
  return { id, name, profileColor };
}

export default function VoiceChildSelectScreen({
  isOpen,
  onClose,
  /** 서버 아이 목록 (`profileColor`: `SKY_BLUE` 등 enum). 비어 있으면 `VOICE_CHILDREN` 폴백 */
  children: childrenFromApi = null,
  onConfirm = () => {},
}) {
  const rows = useMemo(() => {
    const raw = Array.isArray(childrenFromApi) ? childrenFromApi : [];
    if (raw.length > 0) {
      return raw.map(mapApiChildToRow).filter((r) => r.id);
    }
    return VOICE_CHILDREN.map((c) => ({
      id: String(c.id),
      name: c.name,
      profileColor: c.profileColor ?? 'SKY_BLUE',
    }));
  }, [childrenFromApi]);

  const [selectedChildId, setSelectedChildId] = useState(() => rows[0]?.id ?? '');

  if (!isOpen) return null;

  const effectiveSelectedId = rows.some((r) => r.id === selectedChildId)
    ? selectedChildId
    : (rows[0]?.id ?? '');

  return (
    <div className="fixed inset-0 z-[80] bg-[#ECECEC]">
      <div className="mx-auto flex h-full w-full max-w-112.5 flex-col bg-[#FFFFFF]">
        <header className="bg-white px-6 pt-8 pb-6">
          <button type="button" onClick={onClose} aria-label="뒤로가기" className="p-1">
            <BackButtonIcon color="#706963" />
          </button>
          <p className="mt-5 ml-5 text-[18px] leading-[30px] font-semibold tracking-[-0.4px] text-[#1D1B1A]">
            AI 음성 진료 요약
          </p>
        </header>

        <div className="h-4 w-full bg-[#FAF7F2]" />

        <section className="bg-white px-[29px] py-[38px]">
          <h2 className="text-[18px] font-bold leading-[27px] text-black">
            진료 녹음을 진행할
            <br />
            아이를 선택해 주세요
          </h2>
        </section>

        <section>
          {rows.map((child) => {
            const selected = effectiveSelectedId === child.id;
            const rowBg = selected ? 'bg-[#FAF7F2]' : 'bg-[#FFFCF9]';
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={`flex w-full items-center gap-[18px] px-[26px] py-[17px] text-left ${rowBg}`}
              >
                <ChildrenImgBox
                  labelColor={child.profileColor}
                  selected={selected}
                  className="h-[46.55px] w-[46.554px] rounded-[15.871px]"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] leading-[24px] font-semibold tracking-[-0.32px] text-[#1D1B1A]">
                    {child.name}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        <div className="mt-auto px-5 pb-8">
          <Button
            onClick={() => {
              const row = rows.find((c) => c.id === effectiveSelectedId);
              if (!row) {
                onConfirm(null);
                return;
              }
              onConfirm({
                id: row.id,
                name: row.name,
                profileColor: row.profileColor,
                labelColor: PROFILE_COLOR_MAP[row.profileColor] ?? PROFILE_COLOR_MAP.SKY_BLUE,
              });
            }}
            bgColor="#FFC721"
            textColor="#FFFFFF"
          >
            아이 선택하기
          </Button>
        </div>
      </div>
    </div>
  );
}

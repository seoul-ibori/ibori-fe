import RightIcon from '@/assets/icons/settings/arrow_right_icon.svg?react';
import ChildIcon from '@/assets/icons/settings/son_icon.svg?react';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import { PROFILE_COLOR_MAP } from '@/constants/profileColorData';

function formatBirthDate(value) {
  if (!value) return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 8) return value;
  return `${digits.slice(0, 4)}년 ${Number(digits.slice(4, 6))}월 ${Number(digits.slice(6, 8))}일 생`;
}

export default function ChildCard({ child, deleteMode = false, onClick, onDelete }) {
  const color = PROFILE_COLOR_MAP[child.profileColor] ?? '#5AA7FF';
  const birthText = formatBirthDate(child.birthDate);

  return (
    <div className="relative h-41.5 overflow-hidden border-b-15 border-[#FAF7F2]">
      <div
        className={`relative z-10 flex h-full items-center gap-5.25 bg-white px-6 transition-transform duration-300 ease-out ${
          deleteMode ? '-translate-x-28.5' : 'translate-x-0'
        }`}
      >
        <button
          type="button"
          onClick={deleteMode ? undefined : onClick}
          disabled={deleteMode}
          className="flex flex-1 items-center gap-5.25 text-left"
        >
          <ChildrenImgBox
            labelColor={child.profileColor ?? 'SKY_BLUE'}
            className="size-29 rounded-[42px]"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-4.75">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <ChildIcon className="size-6" />
                <p className="text-[15px] font-medium text-[#1D1B1A]">{child.childName}</p>
              </div>
              {birthText ? (
                <p className="text-[15px] font-medium text-[#706963]">{birthText}</p>
              ) : (
                <p className="text-[15px] font-medium text-[#706963]">
                  <span className="text-[#FF3D00]">* </span>생일을 알려줘요!
                </p>
              )}
            </div>
            <div className="flex items-end gap-2">
              <span className="size-6 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="inline-flex rounded-md border border-[#EBE4D9] bg-[#FAF7F2] px-2.25 py-1 text-[12px] font-medium text-[#706963]">
                {child.nickname ? (
                  child.nickname
                ) : (
                  <>
                    <span className="text-[#FF3D00]">*</span> 별명을 지어줘요
                  </>
                )}
              </span>
            </div>
          </div>
        </button>
        {!deleteMode && (
          <button
            type="button"
            onClick={onClick}
            aria-label="아이 정보 수정"
            className="shrink-0 p-1"
          >
            <RightIcon />
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="삭제"
        className="absolute right-0 top-0 z-0 flex h-full w-28.5 items-center justify-center bg-[#FAF7F2] text-[18px] font-medium text-[#706963]"
      >
        삭제
      </button>
    </div>
  );
}

import { useRef, useState } from 'react';

import RightIcon from '@/assets/icons/settings/arrow_right_icon.svg?react';
import TrashIcon from '@/assets/icons/settings/trash_icon.svg?react';

const SWIPE_THRESHOLD = 30;

export default function MemberBar({ role, roleColor, name, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const startXRef = useRef(null);

  const handlePointerDown = (e) => {
    startXRef.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (startXRef.current == null) return;
    const delta = e.clientX - startXRef.current;
    startXRef.current = null;
    if (delta < -SWIPE_THRESHOLD) setIsOpen(true);
    else if (delta > SWIPE_THRESHOLD) setIsOpen(false);
  };

  const handlePointerCancel = () => {
    startXRef.current = null;
  };

  const handleTrashClick = (e) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className="relative h-13.75 touch-pan-y border-b-[0.5px] border-[#FAF7F2]"
    >
      <div
        className={`relative flex h-full items-center transition-transform duration-300 ease-out z-10 ${
          isOpen ? '-translate-x-12' : 'translate-x-0'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3 pl-0.5">
          <span
            className="inline-flex items-center justify-center rounded-full px-2 py-1 text-[14px] leading-none font-normal text-white"
            style={{ backgroundColor: roleColor }}
          >
            {role}
          </span>
          <span className="text-[15px] font-semibold text-[#3D3835]">{name}</span>
        </div>
        <div className="flex justify-center items-center w-15" aria-hidden="true">
          <RightIcon />
        </div>
      </div>

      <div className="absolute top-0 right-0 bottom-0 w-12 z-0 overflow-hidden">
        <button
          type="button"
          onClick={handleTrashClick}
          aria-label="삭제"
          className={`flex h-full w-full items-center justify-center bg-[#B9B2A6] transition-transform duration-300 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <TrashIcon className="size-6 text-white" />
        </button>
      </div>
    </div>
  );
}

import { useState } from 'react';

import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';

export default function Modal({ isOpen, onClose, onAgree = () => {} }) {
  const [isChecked, setIsChecked] = useState(false);
  const closeModal = () => {
    setIsChecked(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#706963]/40 px-7">
      <div className="w-full max-w-[338px] rounded-[23px] bg-white px-[23px] pb-[34px] pt-[19px]">
        <button
          type="button"
          onClick={closeModal}
          className="flex items-center gap-2 text-[18px] font-medium leading-none text-[#B9B2A6]"
        >
          <span className="inline-flex size-[14px] items-center justify-center rounded-full bg-[#B9B2A6] text-[9px] text-white">
            ×
          </span>
          끝내기
        </button>

        <div className="mt-4 h-px w-full bg-[#EBE4D9]" />

        <div className="mt-6 text-center">
          <p className="text-[18px] font-bold leading-7 text-[#1D1B1A]">
            녹음 내용은 저장되지 않고
            <br />
            요약 후 즉시 삭제돼요.
          </p>
          <p className="mt-[17px] text-[15px] font-medium leading-[1.54] text-[#B9B2A6]">
            녹음 내용은 제 3자에게 전달되지 않고,
            <br />
            진료 내용을 이해하기 쉽게 정리해 줄게요
          </p>
        </div>

        <label className="mt-[30px] flex cursor-pointer items-center justify-center gap-4 text-[15px] text-[#A8A19A]">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className="size-[19px] appearance-none border-[3px] border-[#A8A19A] bg-[#EBE4D9] checked:bg-[#A8A19A]"
          />
          정보 수집 동의하기
        </label>

        <button
          type="button"
          onClick={() => {
            onAgree();
            closeModal();
          }}
          className="mt-[31px] flex h-[52px] w-full items-center justify-center gap-[11px] rounded-[12px] bg-[#FFC721] text-[18px] font-semibold text-[#FFFCF9]"
        >
          <MicrophoneIcon className="size-6" />
          녹음 동의하기
        </button>
      </div>
    </div>
  );
}

import CancelIcon from '@/assets/icons/cancel_button_icon.svg?react';

function Spinner({ className }) {
  return (
    <svg
      viewBox="0 0 47 47"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} animate-spin`}
    >
      <circle cx="23.5" cy="23.5" r="19" stroke="#EBE4D9" strokeWidth="4" />
      <path
        d="M23.5 4.5a19 19 0 0 1 19 19"
        stroke="#1D1B1A"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CreateQuestionModal({ onClose }) {
  return (
    <div className="w-full max-w-[341px] overflow-hidden rounded-[23px] bg-white">
      <div className="px-5.5 pt-4.75">
        <button type="button" onClick={onClose} className="flex items-center gap-2">
          <CancelIcon />
          <span className="text-[18px] font-medium tracking-[-0.45px] text-[#B9B2A6]">끝내기</span>
        </button>
        <div className="mt-2.5 h-px bg-[#EBE4D9]" />
      </div>

      <div className="flex flex-col items-center gap-3.75 px-6 pt-4.75 pb-7">
        <Spinner className="size-11.75" />
        <div className="flex flex-col gap-2.5 text-center">
          <p className="text-[18px] leading-7 font-bold text-[#1D1B1A]">
            잠시만 기다려 주세요
            <br />
            지금 AI가 질문지를 만들고 있어요
          </p>
          <p className="text-sm leading-[1.541] font-medium text-[#B9B2A6]">
            증상과 함께 생활 환경 데이터를 반영해
            <br />
            질문을 구성하고 있는 중이에요
          </p>
        </div>
      </div>

      <div className="px-5.5 pb-5.5">
        <button
          type="button"
          onClick={onClose}
          className="flex h-13 w-full items-center justify-center rounded-[12px] bg-[#B9B2A6] text-[19.091px] font-bold text-[#FAF7F2]"
        >
          취소
        </button>
      </div>
    </div>
  );
}

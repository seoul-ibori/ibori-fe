import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';
import BackButtonIcon from '@/components/common/BackButtonIcon';

export default function Record({ isOpen, childName = '', onBack = () => {}, onClose = () => {} }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-[#FFFFFF]">
      <div className="mx-auto flex h-full w-full max-w-112.5 flex-col bg-[#FFFFF]">
        <header className="flex items-center gap-5 bg-white px-6 pt-10 pb-7">
          <button type="button" onClick={onBack} aria-label="뒤로가기" className="p-1">
            <BackButtonIcon color="#706963" />
          </button>
          <p className="text-[18px] font-medium tracking-[-0.72px] text-[#706963]">{childName}</p>
        </header>

        <section className="px-5 pt-8">
          <div className="flex justify-center">
            <div className="inline-flex rounded-[6.214px] bg-[#706963] px-[13px] py-[6px] text-[12px] text-[#FFFCF9]">
              녹음 대기 중
            </div>
          </div>
          <p className="mt-5 text-center text-[48px] font-bold text-[#17171B]">00:00:00</p>

          <div className="mt-8 h-[106px] rounded-[62px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.08)]" />

          <button
            type="button"
            className="mt-10 flex h-[52px] w-full items-center justify-center gap-[11px] rounded-[10px] border border-[#FF3D00] bg-[#FAF7F2] text-[18px] font-semibold text-[#FF3D00]"
          >
            <MicrophoneIcon className="size-6 [&_rect]:fill-transparent [&_path]:stroke-[#FF3D00]" />
            녹음 시작하기
          </button>

          <button
            type="button"
            className="mt-3 flex h-[52px] w-full items-center justify-center gap-[11px] rounded-[10px] bg-[#B9B2A6] text-[18px] font-semibold text-[#FAF7F2]"
          >
            <MicrophoneIcon className="size-6 [&_rect]:fill-transparent [&_path]:stroke-[#FAF7F2]" />
            녹음 다시 하기
          </button>
        </section>

        <div className="mt-6 h-4 w-full bg-[#E3E6EA]" />

        <section className="bg-white px-6 pt-8 pb-6">
          <p className="text-[16px] font-medium text-[#667085]">설명이 끝났나요?</p>
          <p className="mt-1 text-[18px] font-bold text-black">바로 AI 요약 기능을 활용해봐요</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-9 h-[52px] w-full rounded-[12px] bg-[#B9B2A6] text-[18px] font-semibold text-[#FAF7F2]"
          >
            의사 선생님 말씀 정리하기
          </button>
        </section>
      </div>
    </div>
  );
}

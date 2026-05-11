import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';
import BackButtonIcon from '@/components/common/BackButtonIcon';

function formatElapsedTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const hours = String(Math.floor(safe / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((safe % 3600) / 60)).padStart(2, '0');
  const seconds = String(safe % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function StoppedWave({ waveHeights = [], cursorIndex = 0, totalBars = 55, baseHeight = 6 }) {
  const barWidth = 1.8;
  const barGap = 3;
  const waveAreaWidth = 264;
  const drawnBars = Math.min(cursorIndex, totalBars);
  const barsCount = drawnBars;
  const liveWaveWidth = barsCount > 0 ? barsCount * barWidth + (barsCount - 1) * barGap : 0;
  const cursorOffset = Math.max(2, liveWaveWidth);

  return (
    <div className="relative mt-8 h-[106px] overflow-hidden rounded-[62px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.08)]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex w-[264px] items-center">
          <div className="flex items-center gap-[3px]">
            {Array.from({ length: totalBars }).map((_, idx) => {
              const active = idx < drawnBars;
              const height = active ? (waveHeights[idx] ?? baseHeight) : baseHeight;
              return (
                <span key={`bar-${idx}`} className="flex h-[40px] w-[1.8px] items-center">
                  <span
                    className={`w-[1.8px] rounded-full transition-[height,background-color] duration-150 ${
                      active ? 'bg-[#FF3D00]' : 'bg-[#B9B2A6]'
                    }`}
                    style={{ height: `${height}px` }}
                  />
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="absolute top-4 h-[72px] w-[2px] bg-[#FF3D00]"
        style={{ left: `calc(50% - ${waveAreaWidth / 2}px + ${cursorOffset}px)` }}
      />
      <span
        className="absolute top-3 size-[7px] rounded-full bg-[#FF3D00]"
        style={{ left: `calc(50% - ${waveAreaWidth / 2}px + ${cursorOffset - 2.5}px)` }}
      />
    </div>
  );
}

export default function RecordStop({
  isOpen,
  childName = '',
  elapsedSeconds = 0,
  waveHeights = [],
  cursorIndex = 0,
  totalBars = 55,
  baseHeight = 6,
  onBack = () => {},
  onResume = () => {},
  onRetry = () => {},
  onSummarize = () => {},
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[92] bg-[#FFFFFF]">
      <div className="mx-auto flex h-full w-full max-w-112.5 flex-col overflow-y-auto bg-[#FFFFFF]">
        <header className="flex items-center gap-5 bg-white px-6 pt-10 pb-7">
          <button type="button" onClick={onBack} aria-label="뒤로가기" className="p-1">
            <BackButtonIcon color="#706963" />
          </button>
          <p className="text-[18px] font-medium tracking-[-0.72px] text-[#706963]">{childName}</p>
        </header>

        <section className="px-5 pt-8">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-[6px] rounded-[6.214px] bg-[#FF3A3A] px-[13px] py-[6px] text-[12px] text-white">
              <span className="size-[6px] rounded-[1px] bg-white" />
              녹음을 멈추었어요!
            </div>
          </div>

          <p className="mt-5 text-center text-[48px] font-bold text-[#17171B]">
            {formatElapsedTime(elapsedSeconds)}
          </p>

          <StoppedWave
            waveHeights={waveHeights}
            cursorIndex={cursorIndex}
            totalBars={totalBars}
            baseHeight={baseHeight}
          />

          <button
            type="button"
            onClick={onResume}
            className="mt-10 flex h-[52px] w-full items-center justify-center gap-[11px] rounded-[10px] bg-[#6F0900] text-[18px] font-semibold text-[#F0F2F5]"
          >
            <MicrophoneIcon className="size-6 [&_rect]:fill-transparent [&_path]:stroke-[#F0F2F5]" />
            녹음 재개하기
          </button>

          <button
            type="button"
            onClick={onRetry}
            className="mt-3 flex h-[52px] w-full items-center justify-center gap-[11px] rounded-[10px] bg-[#FFD4C7] text-[18px] font-semibold text-[#FF3D00]"
          >
            <MicrophoneIcon className="size-6 [&_rect]:fill-transparent [&_path]:stroke-[#FF3D00]" />
            녹음 다시 하기
          </button>
        </section>

        <div className="mt-6 h-4 w-full bg-[#E3E6EA]" />

        <section className="bg-white px-6 pt-8 pb-6">
          <p className="text-[16px] font-medium text-[#667085]">설명이 끝났나요?</p>
          <p className="mt-1 text-[18px] font-bold text-black">바로 AI 요약 기능을 활용해봐요</p>
          <button
            type="button"
            onClick={onSummarize}
            className="mt-9 h-[52px] w-full rounded-[12px] bg-[#FFC721] text-[18px] font-semibold text-[#FFFCF9]"
          >
            의사 선생님 말씀 정리하기
          </button>
        </section>
      </div>
    </div>
  );
}

import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';
import { CELLS, WEEK_DAYS } from '@/constants/calenderDummyData';

export default function Calendar() {
  return (
    <section className="relative h-[500px] w-full overflow-hidden bg-white px-6 pb-6 pt-[15px]">
      <div className="mb-5 flex h-[39px] items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          className="flex size-[39px] items-center justify-center rounded-full bg-white text-[39px] leading-none text-[#0B1324] shadow-[0_0.9px_0.45px_rgba(0,14,51,0.05)]"
        >
          ‹
        </button>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="flex items-center gap-0.5 rounded-md bg-white px-[10px] py-[9px] text-[21px] font-bold leading-none text-[#5F3010] tracking-[-0.21px] shadow-[0_0.8px_0.4px_rgba(0,14,51,0.05)]"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            2026년 <span className="text-[11px] text-[#FFC721]">▼</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-0.5 rounded-md bg-white px-[10px] py-[9px] text-[21px] font-bold leading-none text-[#5F3010] tracking-[-0.21px] shadow-[0_0.8px_0.4px_rgba(0,14,51,0.05)]"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          >
            4월 <span className="text-[11px] text-[#FFC721]">▼</span>
          </button>
        </div>
        <button
          type="button"
          aria-label="다음 달"
          className="flex size-[39px] items-center justify-center rounded-full bg-white text-[39px] leading-none text-[#0B1324] shadow-[0_0.9px_0.45px_rgba(0,14,51,0.05)]"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day) => (
          <div key={day.label} className={`pb-1 text-center text-sm font-bold ${day.color}`}>
            {day.label}
          </div>
        ))}

        {CELLS.map((cell, index) => (
          <div
            key={`${cell.day}-${index}`}
            className={`px-[2px] py-[2px] ${
              cell.selected
                ? 'h-[84px] overflow-hidden rounded border border-[#FFC721]'
                : 'h-[69px]'
            }`}
          >
            <div
              className={`mb-0.5 flex h-6 items-center justify-center text-[10px] font-bold leading-none ${
                cell.muted ? 'text-[#252525]/50' : 'text-[#252525]'
              }`}
            >
              {cell.selected ? (
                <span className="flex size-[18px] items-center justify-center rounded-full bg-[#FFC721] text-[10px] text-white">
                  {cell.day}
                </span>
              ) : (
                cell.day
              )}
            </div>
            <div className="space-y-0.5">
              {cell.events?.map((event) => (
                <div
                  key={event.label}
                  className={`truncate rounded-[2px] px-1 py-0.5 text-[8px] font-medium text-[#FFFCF9] ${event.color}`}
                >
                  {event.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        aria-label="음성 입력"
        className="absolute bottom-[22px] right-6 flex size-[68px] items-center justify-center rounded-full bg-[#FFC722] text-[30px] text-white shadow-[0_4px_6px_rgba(18,18,23,0.2)]"
      >
        <MicrophoneIcon className="size-10" />
      </button>
    </section>
  );
}

import MicrophoneIcon from '@/assets/icons/summary/microphone.svg?react';

const WEEK_DAYS = [
  { label: '일', color: 'text-[#FF3D00]' },
  { label: '월', color: 'text-[#A8A19A]' },
  { label: '화', color: 'text-[#A8A19A]' },
  { label: '수', color: 'text-[#A8A19A]' },
  { label: '목', color: 'text-[#A8A19A]' },
  { label: '금', color: 'text-[#A8A19A]' },
  { label: '토', color: 'text-[#015DE7]' },
];

const CELLS = [
  { day: 29, muted: true },
  { day: 30, muted: true, events: [{ label: '민준 코로나 건사', color: 'bg-[#5AA7FF]' }] },
  { day: 1 },
  { day: 2 },
  { day: 3, events: [{ label: '하나 두통 멀미', color: 'bg-[#FF8763]' }] },
  { day: 4 },
  { day: 5, events: [{ label: '지원 처방전 발급', color: 'bg-[#FFC721]' }] },
  { day: 6 },
  { day: 7, events: [{ label: '하나 진단서 발급', color: 'bg-[#FF8763]' }] },
  { day: 8, events: [{ label: '하나 진단서', color: 'bg-[#FF8763]' }] },
  { day: 9 },
  {
    day: 10,
    selected: true,
    events: [
      { label: '민준 예방접종', color: 'bg-[#5AA7FF]' },
      { label: '하나 진단서 발급', color: 'bg-[#FF8763]' },
      { label: '지원 소아과 방문', color: 'bg-[#FFC721]' },
    ],
  },
  { day: 11 },
  { day: 12 },
  { day: 13 },
  { day: 14 },
  { day: 15 },
  { day: 16 },
  { day: 17 },
  { day: 18 },
  { day: 19 },
  { day: 20, events: [{ label: '지원 교정 검사', color: 'bg-[#FFC721]' }] },
  { day: 21 },
  { day: 22 },
  { day: 23 },
  { day: 24 },
  { day: 25, events: [{ label: '지원 사랑니 발치', color: 'bg-[#FFC721]' }] },
  { day: 26 },
  { day: 27 },
  { day: 28, muted: true, events: [{ label: '하나 엑스레이', color: 'bg-[#FF8763]' }] },
  { day: 29, muted: true },
  { day: 30, muted: true },
  { day: 31, muted: true },
  { day: 13, muted: true },
  { day: 13, muted: true },
];

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

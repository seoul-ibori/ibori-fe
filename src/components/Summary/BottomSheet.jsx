import CalendarIcon from '@/assets/icons/calender.svg?react';
import DownArrowIcon from '@/assets/icons/down-arrow.svg?react';
import PencilIcon from '@/assets/icons/pencil.svg?react';
import TrashIcon from '@/assets/icons/trash.svg?react';

function EventRow({ title, time }) {
  return (
    <div className="flex items-center justify-between border-t border-[#F3F3F3] px-6 py-5">
      <div className="flex items-center gap-4">
        <span className="h-6 w-1 rounded bg-[#FFC721]" />
        <p className="text-[18px] font-semibold leading-none text-[#8D8782]">{title}</p>
      </div>
      <div className="flex items-center gap-5">
        <span className="text-[15px] font-medium leading-none text-[#C7C1B8]">{time}</span>
        <DownArrowIcon className="size-3" />
      </div>
    </div>
  );
}

export default function BottomSheet({
  isOpen,
  selectedLabel,
  events = [],
  onClose,
  onAddSchedule = () => {},
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-112.5 -translate-x-1/2 rounded-t-[28px] bg-white pt-7 shadow-[0_-8px_20px_rgba(18,18,23,0.1)]">
      <div className="px-6 pb-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl">
              <CalendarIcon className="size-12" />
            </div>
            <div>
              <p className="text-[15px] font-bold leading-none text-[#777]">2026년</p>
              <p className="mt-2 text-[18px] font-bold leading-none text-black">{selectedLabel}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl bg-[#FFC721] text-xl text-[#773C14]"
            >
              <PencilIcon className="size-4" />
            </button>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-xl bg-[#FFC721] text-xl text-[#773C14]"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="mb-3 mx-auto w-[88%] border-t-[0.5px] border-[#A49F9B]" />

      <div>
        {events.length > 0 ? (
          events.map((event) => (
            <EventRow key={event.label} title={event.label} time="오전 10:30" />
          ))
        ) : (
          <div className="border-t border-[#F3F3F3] px-6 py-8 text-center text-[18px] text-[#B7ADA5]">
            등록된 일정이 없습니다.
          </div>
        )}
      </div>

      <div className="px-6 pb-6 pt-8">
        <button
          type="button"
          onClick={onAddSchedule}
          className="h-14 w-full rounded-xl bg-[#FFC721] text-[18px] font-bold leading-none text-white"
        >
          일정 추가하기
        </button>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-[15px] font-medium leading-none text-[#C8BFB7]"
        >
          아래 창 닫기
        </button>
      </div>
    </div>
  );
}

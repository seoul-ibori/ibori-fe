import CalenderDateEdit from '@/components/Summary/CalenderDateEdit';

export default function CalenderEdit({
  title,
  location,
  memo,
  timeDisplay,
  onTitleChange,
  onLocationChange,
  onMemoChange,
  onTimeChange,
}) {
  const fieldClass =
    'w-full bg-transparent py-2 text-[18px] leading-[28px] outline-none ring-0 border-0 rounded-none';

  return (
    <div className="px-6 pb-4 pt-1">
      <div className="border-t-[0.2px] border-[#CFD2DA]/80 pt-5">
        <div className="flex flex-col gap-3">
          <div className="space-y-[5px]">
            <p className="text-[15px] font-medium leading-normal text-[#706963]">일정 수정하기</p>
            <p className="text-[18px] font-bold leading-normal text-black">정보를 작성해주세요</p>
          </div>
          <div className="mt-0.5 border-t-[0.2px] border-[#CFD2DA]/80" aria-hidden />
          <CalenderDateEdit timeDisplay={timeDisplay} onTimeChange={onTimeChange} />
        </div>
        <div className="my-1" aria-hidden />

        <div className="space-y-0">
          <div className="border-b-[0.2px] border-[#CFD2DA]/80">
            <label htmlFor="calendar-edit-title" className="sr-only">
              일정 제목을 입력해주세요
            </label>
            <input
              id="calendar-edit-title"
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              className={`${fieldClass} font-medium text-[#706963] placeholder:font-medium placeholder:text-[#A8A19A]`}
              placeholder="일정 제목을 입력해주세요"
            />
          </div>
          <div className="border-b-[0.2px] border-[#CFD2DA]/80">
            <label htmlFor="calendar-edit-location" className="sr-only">
              병원 위치를 입력해주세요
            </label>
            <input
              id="calendar-edit-location"
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className={`${fieldClass} font-medium text-[#706963] placeholder:font-medium placeholder:text-[#A8A19A]`}
              placeholder="병원 위치를 입력해주세요"
            />
          </div>
          <div className="border-b-[0.2px] border-[#CFD2DA]/80">
            <label htmlFor="calendar-edit-memo" className="sr-only">
              메모를 작성해주세요
            </label>
            <textarea
              id="calendar-edit-memo"
              value={memo}
              onChange={(e) => onMemoChange(e.target.value)}
              rows={1}
              className={`${fieldClass} min-h-[27px] resize-none pb-1 pt-2 font-medium text-[#706963] placeholder:font-medium placeholder:text-[#A8A19A]`}
              placeholder="메모를 작성해주세요"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

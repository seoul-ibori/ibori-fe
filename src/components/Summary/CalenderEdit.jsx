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
  return (
    <div className="px-6 pb-2 pt-1">
      <h2 className="text-[18px] font-bold leading-none text-black">일정 수정하기</h2>
      <p className="mt-3 text-[15px] font-medium leading-none text-[#B7ADA5]">
        정보를 작성해주세요
      </p>

      <div className="mt-5">
        <label htmlFor="calendar-edit-time" className="sr-only">
          시간
        </label>
        <input
          id="calendar-edit-time"
          type="text"
          value={timeDisplay}
          onChange={(e) => onTimeChange(e.target.value)}
          className="inline-block min-w-[120px] rounded-full border-0 bg-[#FFC721] px-5 py-2.5 text-center text-[15px] font-bold leading-none text-[#773C14] outline-none ring-0 placeholder:text-[#773C14]/60"
          placeholder="오후 12:00"
          autoComplete="off"
        />
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label htmlFor="calendar-edit-title" className="sr-only">
            일정 이름
          </label>
          <input
            id="calendar-edit-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="h-14 w-full rounded-xl border border-[#E8E4DF] bg-white px-4 text-[16px] font-medium text-[#252525] outline-none placeholder:text-[#C8BFB7]"
            placeholder="일정 이름"
          />
        </div>
        <div>
          <label htmlFor="calendar-edit-location" className="sr-only">
            장소
          </label>
          <input
            id="calendar-edit-location"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            className="h-14 w-full rounded-xl border border-[#E8E4DF] bg-white px-4 text-[16px] font-medium text-[#252525] outline-none placeholder:text-[#C8BFB7]"
            placeholder="장소"
          />
        </div>
        <div>
          <label htmlFor="calendar-edit-memo" className="sr-only">
            메모
          </label>
          <textarea
            id="calendar-edit-memo"
            value={memo}
            onChange={(e) => onMemoChange(e.target.value)}
            rows={4}
            className="w-full resize-none rounded-xl border border-[#E8E4DF] bg-white px-4 py-3 text-[16px] font-medium text-[#252525] outline-none placeholder:text-[#C8BFB7]"
            placeholder="메모를 작성해주세요"
          />
        </div>
      </div>
    </div>
  );
}

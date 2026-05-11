import { useState } from 'react';

import DownArrowIcon from '@/assets/icons/down-arrow.svg?react';
import CalenderDateEdit from '@/components/Summary/CalenderDateEdit';
import { REGISTERED_CHILDREN_DUMMY, getRegisteredChildFullName } from '@/constants/voiceChildren';

export default function CalenderEdit({
  title,
  location,
  memo,
  timeDisplay,
  selectedChildId = '',
  onTitleChange,
  onLocationChange,
  onMemoChange,
  onTimeChange,
  onChildIdChange = () => {},
  highlightHospitalLocation = false,
  showChildSelect = false,
}) {
  const [childPickerOpen, setChildPickerOpen] = useState(false);

  const selectedChildName = getRegisteredChildFullName(selectedChildId);

  const fieldClass =
    'w-full bg-transparent py-2 text-[18px] leading-[28px] outline-none ring-0 border-0 rounded-none';
  const locationFieldClass = `${fieldClass} font-medium text-[#706963] ${
    highlightHospitalLocation
      ? 'placeholder:font-medium placeholder:text-[#FF3D00]'
      : 'placeholder:font-medium placeholder:text-[#A8A19A]'
  }`;
  const locationRowBorder = highlightHospitalLocation ? 'border-[#FF3D00]' : 'border-[#CFD2DA]/80';

  return (
    <div className="px-6 pb-4 pt-1">
      <div className="border-t-[0.2px] border-[#CFD2DA]/80 pt-5">
        <div className="flex flex-col gap-3">
          <div className="space-y-[5px]">
            <p className="text-[15px] font-medium leading-normal text-[#706963]">일정 수정하기</p>
            <p className="text-[18px] font-bold leading-normal text-black">정보를 작성해주세요</p>
          </div>
          <div className="mt-0.5 border-t-[0.2px] border-[#CFD2DA]/80" aria-hidden />
          <CalenderDateEdit
            key={timeDisplay}
            timeDisplay={timeDisplay}
            onTimeChange={onTimeChange}
          />
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

          {showChildSelect ? (
            <div className="border-b-[0.2px] border-[#CFD2DA]/80">
              <button
                type="button"
                aria-expanded={childPickerOpen}
                aria-label={selectedChildName ? `선택된 아이: ${selectedChildName}` : '아이 선택'}
                onClick={() => setChildPickerOpen((o) => !o)}
                className="flex w-full items-center justify-between gap-3 py-2 text-left"
              >
                {selectedChildName ? (
                  <span className="min-w-0 flex-1 truncate text-[18px] font-medium leading-[28px] text-[#706963]">
                    {selectedChildName}
                  </span>
                ) : (
                  <span className="min-w-0 flex-1 text-[18px] font-medium leading-[28px] text-[#A8A19A]">
                    아이 선택
                  </span>
                )}
                <DownArrowIcon
                  className={`size-3 shrink-0 transition-transform [&_path]:stroke-[#706963] ${
                    childPickerOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {childPickerOpen ? (
                <div className="mb-2 rounded-[10px] bg-[#FAF7F2] px-1 py-1">
                  {REGISTERED_CHILDREN_DUMMY.map((child) => {
                    const selected = selectedChildId === child.id;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          onChildIdChange(child.id);
                          setChildPickerOpen(false);
                        }}
                        className={`block w-full rounded-[6px] py-2.5 pr-3 text-right text-[18px] font-medium leading-none transition-colors ${
                          selected
                            ? 'bg-[#FFC721] text-[#FFFCF9]'
                            : 'bg-transparent text-[#706963] hover:bg-[#EBE4D9]/60'
                        }`}
                      >
                        {child.fullName}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className={`border-b-[0.2px] ${locationRowBorder}`}>
            <label htmlFor="calendar-edit-location" className="sr-only">
              병원 위치를 입력해주세요
            </label>
            <input
              id="calendar-edit-location"
              type="text"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className={locationFieldClass}
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

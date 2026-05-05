import { useState } from 'react';

import ChevronLeft from '@/assets/icons/arrow_left_icon.svg?react';
import ChevronRight from '@/assets/icons/arrow_right_icon.svg?react';
import DropDownIcon from '@/assets/icons/main/dropdown_icon.svg?react';
import RetryIcon from '@/assets/icons/main/retry_button_icon.svg?react';
import ChildrenBox from '@/components/Main/ChildrenBox';
import MedicalRecord from '@/components/Main/MedicalRecord';

const CalendarHeader = ({ textColor = 'text-[#AB4C0A]', faded = false }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return (
    <div className={`flex items-center justify-between px-6 ${faded ? 'opacity-30' : ''}`}>
      <div className="flex size-9.75 items-center justify-center rounded-full bg-white shadow-[0_0.891px_0.446px_rgba(0,14,51,0.05)]">
        <ChevronLeft />
      </div>
      <div className="flex gap-0.5">
        <div className="flex items-center gap-0.5 rounded-md bg-white px-2.75 py-2.25 shadow-[0_0.795px_0.397px_rgba(0,14,51,0.05)]">
          <span className={`text-[21px] font-bold ${textColor}`}>{year}년</span>
          <span className={textColor}>
            <DropDownIcon />
          </span>
        </div>
        <div className="flex items-center gap-0.5 rounded-md bg-white px-2.75 py-2.25 shadow-[0_0.795px_0.397px_rgba(0,14,51,0.05)]">
          <span className={`text-[21px] font-bold ${textColor}`}>{month}월</span>
          <span className={textColor}>
            <DropDownIcon />
          </span>
        </div>
      </div>
      <div className="flex size-9.75 items-center justify-center rounded-full bg-white shadow-[0_0.891px_0.446px_rgba(0,14,51,0.05)]">
        <ChevronRight />
      </div>
    </div>
  );
};

export default function WeeklyRecord({ isLoggedIn = false, childrenList = [], records = [] }) {
  const [barOpen, setBarOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);

  if (!isLoggedIn) {
    return (
      <section className="px-6 pt-5.25 pb-5">
        <div className="flex flex-col gap-1.25">
          <p className="text-[15px] font-medium text-[#706963]">월간 일정 기록</p>
          <p className="text-[18px] font-bold text-black">이번 주 진료 기록 살펴요!</p>
        </div>
        <div className="mt-4 border-t border-[#EBEBEB]" />
        <div className="mt-4">
          <CalendarHeader faded />
        </div>
      </section>
    );
  }

  const filteredRecords = selectedChildId
    ? records.filter((r) => r.childId === selectedChildId)
    : records;

  const handleAllClick = () => {
    setBarOpen((prev) => {
      if (prev) setSelectedChildId(null);
      return !prev;
    });
  };

  const handleChildClick = (childId) => {
    setSelectedChildId((prev) => (prev === childId ? null : childId));
  };

  return (
    <section className="pb-5">
      <div className="flex items-center justify-between px-6 pt-5.25">
        <div className="flex flex-col gap-1.25">
          <p className="text-[15px] font-medium text-[#706963]">월간 일정 기록</p>
          <p className="text-[18px] font-bold text-black">이번 주 진료 기록 살펴요!</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="새로고침"
            className="flex size-7.5 items-center justify-center rounded-[8.557px] bg-[#FFC721]"
          >
            <RetryIcon />
          </button>
          <button
            type="button"
            onClick={handleAllClick}
            className={`flex size-7.5 items-center justify-center rounded-[8.557px] text-[10.61px] font-extrabold tracking-[-0.3183px] ${
              barOpen ? 'bg-[#E28702] text-[#FFC721]' : 'bg-[#FFC721] text-[#AB4C0A]'
            }`}
          >
            ALL
          </button>
        </div>
      </div>

      {barOpen && (
        <div className="mt-4 border-y-[5px] border-[#FFFCF9] px-6.25 py-6">
          <div className="flex items-center gap-3.25">
            {childrenList.map((child) => {
              const isFaded = selectedChildId !== null && selectedChildId !== child.id;
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => handleChildClick(child.id)}
                  className={isFaded ? 'opacity-30' : ''}
                >
                  <ChildrenBox
                    name={child.name}
                    imageUrl={child.imageUrl}
                    labelColor={child.labelColor}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4">
        <CalendarHeader textColor={barOpen ? 'text-[#89512A]' : 'text-[#AB4C0A]'} />
      </div>

      <div className="relative mt-4 px-3.5">
        {filteredRecords.length > 1 && (
          <div className="pointer-events-none absolute left-15.5 top-13 bottom-13 border-l-2 border-[#F5DF7A]" />
        )}
        {filteredRecords.map((record) => (
          <MedicalRecord
            key={record.id}
            hospitalName={record.hospitalName}
            medicineName={record.medicineName}
            date={record.date}
            category={record.category}
          />
        ))}
      </div>
    </section>
  );
}

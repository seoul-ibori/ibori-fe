import { useState } from 'react';
import { useNavigate } from 'react-router';

import ChildrenBox from '@/components/Main/ChildrenBox';
import MedicalRecord from '@/components/Main/MedicalRecord';
import Button from '@/components/common/Button';
import CalendarPeriodHeader from '@/components/common/CalendarPeriodHeader';

export default function WeeklyRecord({
  childrenList = [],
  records = [],
  year,
  month,
  onPeriodChange,
  selectedChildId,
  onSelectChild,
}) {
  const navigate = useNavigate();
  const [barOpen, setBarOpen] = useState(false);

  const handlePeriodChange = (y, m) => {
    onPeriodChange?.(y, m);
  };

  const handleAllClick = () => {
    setBarOpen((prev) => {
      if (prev) onSelectChild?.(null);
      return !prev;
    });
  };

  const handleChildClick = (childId) => {
    onSelectChild?.(selectedChildId === childId ? null : childId);
  };

  return (
    <section className="pb-5">
      <div className="flex items-center justify-between px-6 pt-5.25">
        <div className="flex flex-col gap-1.25">
          <p className="text-[15px] font-medium text-[#706963]">월간 일정 기록</p>
          <p className="text-[18px] font-bold text-black">이번 주 진료 기록 살펴요!</p>
        </div>
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

      <div className="px-6 pt-4">
        <Button
          onClick={() => navigate('/record-update')}
          bgColor="#FFC721"
          textColor="#FFFCF9"
          pressedBgColor="#E28702"
          pressedTextColor="#F5DF7A"
        >
          진료내역 업데이트
        </Button>
      </div>

      {barOpen && (
        <div className="mt-4 border-y-[5px] border-[#FFFCF9] px-6.25 py-6">
          <div className="flex items-center gap-3.25">
            {childrenList.map((child) => {
              const isFaded = selectedChildId !== null && selectedChildId !== child.id;
              return (
                <button
                  key={child.childId}
                  type="button"
                  onClick={() => handleChildClick(child.childId)}
                  className={isFaded ? 'opacity-30' : ''}
                >
                  <ChildrenBox
                    name={child.nickname || child.childName}
                    imageUrl={child.imageUrl}
                    labelColor={child.profileColor}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4">
        <CalendarPeriodHeader
          textColor={barOpen ? 'text-[#89512A]' : 'text-[#AB4C0A]'}
          year={year}
          month={month}
          onChange={handlePeriodChange}
        />
      </div>

      <div className="relative mt-4 px-3.5">
        {records.length > 1 && (
          <div className="pointer-events-none absolute left-15.5 top-13 bottom-13 border-l-2 border-[#F5DF7A]" />
        )}
        {records.map((record) => (
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

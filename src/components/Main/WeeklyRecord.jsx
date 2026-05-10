import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import ChevronLeft from '@/assets/icons/arrow_left_icon.svg?react';
import ChevronRight from '@/assets/icons/arrow_right_icon.svg?react';
import DropDownIcon from '@/assets/icons/main/dropdown_icon.svg?react';
import ChildrenBox from '@/components/Main/ChildrenBox';
import MedicalRecord from '@/components/Main/MedicalRecord';
import Button from '@/components/common/Button';

const YEAR_RANGE = 10;

const CalendarHeader = ({ textColor = 'text-[#AB4C0A]', year, month, onChange }) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [yearOpen, setYearOpen] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  const pickersRef = useRef(null);

  const isCurrent = year === currentYear && month === currentMonth;

  const yearList = useMemo(
    () => Array.from({ length: YEAR_RANGE }, (_, i) => currentYear - i),
    [currentYear]
  );
  const maxMonthForYear = year === currentYear ? currentMonth : 12;
  const monthList = useMemo(
    () => Array.from({ length: maxMonthForYear }, (_, i) => i + 1),
    [maxMonthForYear]
  );

  useEffect(() => {
    if (!yearOpen && !monthOpen) return undefined;
    const handler = (e) => {
      if (pickersRef.current && !pickersRef.current.contains(e.target)) {
        setYearOpen(false);
        setMonthOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [yearOpen, monthOpen]);

  const handlePrev = () => {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  };

  const handleNext = () => {
    if (isCurrent) return;
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  };

  const handleSelectYear = (y) => {
    const max = y === currentYear ? currentMonth : 12;
    onChange(y, Math.min(month, max));
    setYearOpen(false);
  };

  const handleSelectMonth = (m) => {
    onChange(year, m);
    setMonthOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-6">
      <button
        type="button"
        onClick={handlePrev}
        aria-label="이전 달"
        className="flex size-9.75 items-center justify-center rounded-full bg-white shadow-[0_0.891px_0.446px_rgba(0,14,51,0.05)]"
      >
        <ChevronLeft />
      </button>
      <div ref={pickersRef} className="relative flex gap-0.5">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setYearOpen((v) => !v);
              setMonthOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={yearOpen}
            className="flex items-center gap-0.5 rounded-md bg-white px-2.75 py-2.25 shadow-[0_0.795px_0.397px_rgba(0,14,51,0.05)]"
          >
            <span className={`text-[21px] font-bold ${textColor}`}>{year}년</span>
            <span className={textColor}>
              <DropDownIcon />
            </span>
          </button>
          {yearOpen && (
            <ul
              role="listbox"
              className="no-scrollbar absolute left-0 top-full z-30 mt-1 max-h-50 w-full overflow-y-auto rounded-md bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              {yearList.map((y) => (
                <li key={y}>
                  <button
                    type="button"
                    onClick={() => handleSelectYear(y)}
                    className={`w-full px-3 py-2 text-left text-[15px] font-medium ${
                      y === year ? 'bg-[#FFF6D6] text-[#AB4C0A]' : 'text-[#706963]'
                    }`}
                  >
                    {y}년
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setMonthOpen((v) => !v);
              setYearOpen(false);
            }}
            aria-haspopup="listbox"
            aria-expanded={monthOpen}
            className="flex items-center gap-0.5 rounded-md bg-white px-2.75 py-2.25 shadow-[0_0.795px_0.397px_rgba(0,14,51,0.05)]"
          >
            <span className={`text-[21px] font-bold ${textColor}`}>{month}월</span>
            <span className={textColor}>
              <DropDownIcon />
            </span>
          </button>
          {monthOpen && (
            <ul
              role="listbox"
              className="no-scrollbar absolute left-0 top-full z-30 mt-1 max-h-50 w-full overflow-y-auto rounded-md bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
            >
              {monthList.map((m) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => handleSelectMonth(m)}
                    className={`w-full px-3 py-2 text-left text-[15px] font-medium ${
                      m === month ? 'bg-[#FFF6D6] text-[#AB4C0A]' : 'text-[#706963]'
                    }`}
                  >
                    {m}월
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {isCurrent ? (
        <div className="size-9.75" aria-hidden="true" />
      ) : (
        <button
          type="button"
          onClick={handleNext}
          aria-label="다음 달"
          className="flex size-9.75 items-center justify-center rounded-full bg-white shadow-[0_0.891px_0.446px_rgba(0,14,51,0.05)]"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
};

function parseRecordYearMonth(date) {
  const parts = date.split('.');
  return {
    year: parseInt(parts[0]?.trim(), 10),
    month: parseInt(parts[1]?.trim(), 10),
  };
}

export default function WeeklyRecord({ childrenList = [], records = [] }) {
  const navigate = useNavigate();
  const today = new Date();
  const [barOpen, setBarOpen] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const handlePeriodChange = (y, m) => {
    setYear(y);
    setMonth(m);
  };

  const filteredRecords = records.filter((r) => {
    if (selectedChildId && r.childId !== selectedChildId) return false;
    const { year: ry, month: rm } = parseRecordYearMonth(r.date);
    return ry === year && rm === month;
  });

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
          진료내역 불러오기
        </Button>
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
        <CalendarHeader
          textColor={barOpen ? 'text-[#89512A]' : 'text-[#AB4C0A]'}
          year={year}
          month={month}
          onChange={handlePeriodChange}
        />
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

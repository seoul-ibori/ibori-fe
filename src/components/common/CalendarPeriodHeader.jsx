import { useEffect, useMemo, useRef, useState } from 'react';

import ChevronLeft from '@/assets/icons/arrow_left_icon.svg?react';
import ChevronRight from '@/assets/icons/arrow_right_icon.svg?react';
import DropDownIcon from '@/assets/icons/main/dropdown_icon.svg?react';

const YEAR_RANGE = 10;

/**
 * 홈 `WeeklyRecord`와 동일한 월간 헤더(연·월 드롭다운, 좌우 이동).
 * @param {string} [className] — 루트 래퍼 클래스 (기본 `px-6`)
 */
export default function CalendarPeriodHeader({
  textColor = 'text-[#AB4C0A]',
  year,
  month,
  onChange,
  className = 'px-6',
}) {
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
    <div className={`flex items-center justify-between ${className}`}>
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
}

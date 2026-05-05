import { useMemo, useRef, useState } from 'react';

import Button from '@/components/common/Button';

function pad2(v) {
  return String(v).padStart(2, '0');
}

function formatKoreanMeridiem(hour, minute) {
  const meridiem = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${meridiem} ${pad2(hour12)}:${pad2(minute)}`;
}

function parseTime24(value) {
  if (!value) return { hour: 12, minute: 0 };
  const hhmm = value.match(/^(\d{1,2}):(\d{2})$/);
  if (hhmm) {
    return {
      hour: Math.min(23, Math.max(0, Number(hhmm[1]))),
      minute: Math.min(59, Math.max(0, Number(hhmm[2]))),
    };
  }

  const korean = value.match(/(오전|오후)\s*(\d{1,2}):(\d{2})/);
  if (!korean) return { hour: 12, minute: 0 };
  const hour12 = Number(korean[2]) % 12;
  const minute = Math.min(59, Math.max(0, Number(korean[3])));
  return { hour: korean[1] === '오후' ? hour12 + 12 : hour12, minute };
}

function TimeWheel({ value, min, max, onChange }) {
  const startYRef = useRef(0);
  const items = useMemo(() => Array.from({ length: max - min + 1 }, (_, i) => i + min), [max, min]);
  const safeValue = items.includes(value) ? value : min;
  const prev = safeValue <= min ? max : safeValue - 1;
  const next = safeValue >= max ? min : safeValue + 1;

  const step = (direction) => {
    let nextValue = safeValue + direction;
    if (nextValue > max) nextValue = min;
    if (nextValue < min) nextValue = max;
    onChange(nextValue);
  };

  return (
    <div
      className="w-16 touch-none select-none"
      onWheel={(e) => {
        e.preventDefault();
        step(e.deltaY > 0 ? 1 : -1);
      }}
      onTouchStart={(e) => {
        startYRef.current = e.touches[0].clientY;
      }}
      onTouchMove={(e) => {
        const dy = e.touches[0].clientY - startYRef.current;
        if (Math.abs(dy) < 16) return;
        step(dy < 0 ? 1 : -1);
        startYRef.current = e.touches[0].clientY;
      }}
    >
      <div className="flex h-12 items-center justify-center border-b border-[#EEE7DE] text-[20px] font-medium text-[#A8A19A]">
        {pad2(prev)}
      </div>
      <div className="flex h-12 items-center justify-center border-b border-[#EEE7DE] text-[24px] font-semibold leading-none text-[#706963]">
        {pad2(safeValue)}
      </div>
      <div className="flex h-12 items-center justify-center text-[20px] font-medium text-[#A8A19A]">
        {pad2(next)}
      </div>
    </div>
  );
}

export default function CalenderDateEdit({ timeDisplay, onTimeChange }) {
  const initial = parseTime24(timeDisplay);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleTogglePicker = () => {
    if (!pickerOpen) {
      const parsed = parseTime24(timeDisplay);
      setHour(parsed.hour);
      setMinute(parsed.minute);
    }
    setPickerOpen((prev) => !prev);
  };

  const handleSaveTime = () => {
    onTimeChange(`${pad2(hour)}:${pad2(minute)}`);
    setSaveFeedback(true);
    window.setTimeout(() => {
      setSaveFeedback(false);
      setPickerOpen(false);
    }, 180);
  };

  return (
    <>
      <div className="flex justify-end">
        <label htmlFor="calendar-edit-time" className="sr-only">
          시간
        </label>
        <button
          id="calendar-edit-time"
          type="button"
          onClick={handleTogglePicker}
          className="h-[33px] min-w-0 rounded-full border-0 bg-[#FFC721] px-5 pb-2 pt-1 text-center text-[15px] font-medium leading-[24px] tracking-tighter text-white outline-none placeholder:text-white/75 [field-sizing:content]"
        >
          {formatKoreanMeridiem(hour, minute)}
        </button>
      </div>
      {pickerOpen ? (
        <div className="mt-2 rounded-2xl bg-[#FFFCF9] px-5 pb-5 pt-4">
          <div className="mx-auto flex w-fit items-center gap-3">
            <TimeWheel
              value={hour}
              min={0}
              max={23}
              onChange={(nextHour) => {
                setHour(nextHour);
              }}
            />
            <span className="pt-9 text-[36px] font-semibold leading-none text-[#706963]">:</span>
            <TimeWheel
              value={minute}
              min={0}
              max={59}
              onChange={(nextMinute) => {
                setMinute(nextMinute);
              }}
            />
          </div>
          <Button
            backgroundColor={saveFeedback ? '#E89F35' : '#FFC721'}
            textColor={saveFeedback ? '#F7E595' : '#FFFFFF'}
            onClick={handleSaveTime}
            className="mt-4 text-[15px] font-semibold"
          >
            저장하기
          </Button>
        </div>
      ) : null}
    </>
  );
}

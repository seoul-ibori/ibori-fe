import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { ko } from 'date-fns/locale';

import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';

const TELECOMS = ['SKT(SKT알뜰폰)', 'KT(KT알뜰폰)', 'LG U+(LG U+알뜰폰)'];

const underlineInputClass =
  'h-9 w-full border-b border-[#EBE4D9] bg-transparent text-[18px] font-medium text-[#3D3835] outline-none placeholder:font-medium placeholder:text-[#A8A19A]';

function formatKoreanDate(date) {
  if (!date) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatBirthDateDisplay(digits) {
  if (!digits) return '';
  let result = digits.slice(0, 4);
  if (digits.length >= 4) result += '년';
  if (digits.length >= 5) result += ` ${digits.slice(4, 6)}`;
  if (digits.length >= 6) result += '월';
  if (digits.length >= 7) result += ` ${digits.slice(6, 8)}`;
  if (digits.length >= 8) result += '일';
  return result;
}

const calendarClassNames = {
  month_caption: 'flex items-center justify-start py-1 px-1',
  caption_label: 'text-[16px] font-semibold text-[#706963]',
  nav: 'flex items-center gap-2',
  button_previous: 'p-1 text-[#706963]',
  button_next: 'p-1 text-[#706963]',
  weekday: 'w-10 text-center text-[12px] font-semibold text-[rgba(60,60,67,0.3)]',
  day: 'h-10 w-10 text-center text-[18px] text-[#706963]',
  day_button: 'h-10 w-10 rounded-full hover:bg-[#FAF7F2]',
  today: 'font-bold',
  selected: '[&>button]:bg-[#706963]/15 [&>button]:font-medium',
  outside: 'opacity-30',
  disabled: 'opacity-30',
};

const calendarFormatters = {
  formatCaption: (month) => `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
  formatWeekdayName: (date) => ['일', '월', '화', '수', '목', '금', '토'][date.getDay()],
};

export default function SignUpStep2({ name, onBack, onSubmit }) {
  const [birthDate, setBirthDate] = useState('');
  const [telecom, setTelecom] = useState('');
  const [telecomOpen, setTelecomOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [periodStart, setPeriodStart] = useState(null);
  const [periodEnd, setPeriodEnd] = useState(null);
  const [calOpen, setCalOpen] = useState(null); // 'start' | 'end' | null

  const allFilled = Boolean(birthDate && telecom && phone && periodStart && periodEnd);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allFilled) return;
    onSubmit({ birthDate, telecom, phone, periodStart, periodEnd });
  };

  const handleSelectDate = (date) => {
    if (!date) return;
    if (calOpen === 'start') {
      setPeriodStart(date);
      if (periodEnd && date > periodEnd) setPeriodEnd(null);
    } else if (calOpen === 'end') {
      setPeriodEnd(date);
    }
    setCalOpen(null);
  };

  const calSelected = calOpen === 'start' ? periodStart : calOpen === 'end' ? periodEnd : undefined;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const calDisabled =
    calOpen === 'end' && periodStart
      ? [{ after: today }, { before: periodStart }]
      : { after: today };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-7 pt-11">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="이전 단계" className="-ml-1 p-1">
            <BackButtonIcon color="#1D1B1A" />
          </button>
        )}
        <p className="mt-3.5 text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">
          가족 중 첫 가입자
        </p>
      </header>
      <div className="mt-3.5 h-3.75 bg-[#FAF7F2]" />

      <div className="flex flex-1 flex-col px-6 pt-7">
        <div className="flex flex-col gap-1.25">
          <p className="text-[15px] font-medium text-[#706963]">보호자 인증을 진행하세요</p>
          <p className="text-[18px] font-bold text-black">카카오톡으로 인증하기</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 flex flex-1 flex-col">
          <div className="flex flex-col gap-7.5">
            <p className="h-9 border-b border-[#EBE4D9] text-[18px] font-semibold text-[#3D3835]">
              {name || '이름'}
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={formatBirthDateDisplay(birthDate)}
              onChange={(e) => {
                const newValue = e.target.value;
                const newDigits = newValue.replace(/\D/g, '');
                const oldDisplay = formatBirthDateDisplay(birthDate);
                if (newValue.length < oldDisplay.length && newDigits.length === birthDate.length) {
                  setBirthDate(birthDate.slice(0, -1));
                  return;
                }
                setBirthDate(newDigits.slice(0, 8));
              }}
              placeholder="생년월일 8자리"
              className={underlineInputClass}
            />

            <div>
              <button
                type="button"
                onClick={() => setTelecomOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={telecomOpen}
                className={`${underlineInputClass} flex items-center justify-between`}
              >
                <span
                  className={`text-[18px] ${
                    telecom
                      ? 'font-medium text-[#3D3835]'
                      : telecomOpen
                        ? 'font-semibold text-[#3D3835]'
                        : 'font-medium text-[#A8A19A]'
                  }`}
                >
                  {telecom || '통신사 선택'}
                </span>
                <svg
                  width="12"
                  height="6"
                  viewBox="0 0 12 6"
                  fill="none"
                  className={`transition-transform ${telecomOpen ? 'rotate-180' : ''}`}
                >
                  <path
                    d="M1 1L6 5L11 1"
                    stroke="#706963"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {telecomOpen && (
                <ul role="listbox" className="mt-2 overflow-hidden">
                  {TELECOMS.map((t, i) => {
                    const isSelected = t === telecom;
                    return (
                      <li key={t}>
                        <button
                          type="button"
                          onClick={() => {
                            setTelecom(t);
                            setTelecomOpen(false);
                          }}
                          className={`flex h-9.75 w-full items-center justify-end px-4.25 text-[12px] ${
                            isSelected
                              ? 'bg-[#FFC721] font-semibold text-[#AB4C0A]'
                              : `font-medium text-[#706963] ${
                                  i % 2 === 0 ? 'bg-[#FAF7F2]' : 'bg-[#FFFCF9]'
                                }`
                          }`}
                        >
                          {t}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="전화번호"
              className={underlineInputClass}
            />

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCalOpen('start')}
                className={`${underlineInputClass} flex-1 text-left ${
                  periodStart ? 'text-[#3D3835]' : 'text-[#A8A19A]'
                }`}
              >
                {periodStart ? formatKoreanDate(periodStart) : '진료 조회 시작일'}
              </button>
              <span className="text-[18px] font-bold text-[#1D1B1A]">~</span>
              <button
                type="button"
                onClick={() => setCalOpen('end')}
                className={`${underlineInputClass} flex-1 text-left ${
                  periodEnd ? 'text-[#3D3835]' : 'text-[#A8A19A]'
                }`}
              >
                {periodEnd ? formatKoreanDate(periodEnd) : '진료 조회 종료일'}
              </button>
            </div>
          </div>

          <div className="mt-auto pb-10 pt-12">
            <Button
              type="submit"
              disabled={!allFilled}
              bgColor={allFilled ? '#FFC721' : '#B9B2A6'}
              textColor={allFilled ? '#FFFCF9' : '#FAF7F2'}
              pressedBgColor={allFilled ? '#E28702' : undefined}
              pressedTextColor={allFilled ? '#F5DF7A' : undefined}
            >
              다음
            </Button>
          </div>
        </form>
      </div>

      {calOpen && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/30 px-6"
          onClick={() => setCalOpen(null)}
        >
          <div
            className="rounded-xl bg-white p-4 shadow-[0_9px_28px_rgba(0,0,0,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <DayPicker
              mode="single"
              locale={ko}
              selected={calSelected}
              defaultMonth={calSelected ?? undefined}
              onSelect={handleSelectDate}
              disabled={calDisabled}
              showOutsideDays={false}
              classNames={calendarClassNames}
              formatters={calendarFormatters}
            />
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

import { Drawer } from 'vaul';

import HospitalIcon from '@/assets/icons/searchHospital/hospital_icon.svg?react';

const DEFAULT_WEEKLY = [
  { day: '월', hours: '오전 10:30 ~ 오후 10:30' },
  { day: '화', hours: '오전 10:30 ~ 오후 10:30' },
  { day: '수', hours: '오전 10:30 ~ 오후 10:30' },
  { day: '목', hours: '오전 10:30 ~ 오후 10:30' },
  { day: '금', hours: '오전 10:30 ~ 오후 10:30' },
  { day: '토', hours: '오전 10:30 ~ 오후 10:30' },
  { day: '일', hours: '휴진' },
];

function ChevronDown({ className }) {
  return (
    <svg
      className={className}
      width="12"
      height="6"
      viewBox="0 0 12 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1L6 5L11 1"
        stroke="#706963"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoRow({ label, value, withBorder = true, trailing, onClick }) {
  const Component = onClick ? 'button' : 'div';
  const interactiveProps = onClick ? { type: 'button', onClick } : {};
  return (
    <Component
      {...interactiveProps}
      className={`flex h-20.25 w-full items-center justify-between text-left ${
        withBorder ? 'border-t-[0.5px] border-[#cfd2da]/80' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        <span className="block h-5 w-1.75 bg-[#ffc721]" />
        <span className="text-[18px] font-semibold text-[#706963]">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[15px] font-medium text-[#706963]">{value}</span>
        {trailing}
      </div>
    </Component>
  );
}

export default function HospitalDetailDrawer({ hospital, onClose }) {
  const open = !!hospital;
  const [expanded, setExpanded] = useState(false);
  const [prevHospitalId, setPrevHospitalId] = useState(hospital?.id ?? null);
  const weekly = hospital?.weekly ?? DEFAULT_WEEKLY;

  const currentHospitalId = hospital?.id ?? null;
  if (prevHospitalId !== currentHospitalId) {
    setPrevHospitalId(currentHospitalId);
    setExpanded(false);
  }

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
      modal={false}
      dismissible
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-30 mx-auto flex h-[60vh] w-full max-w-112.5 flex-col rounded-tl-[20px] rounded-tr-[30px] bg-white shadow-[0_-8px_30px_rgba(18,18,23,0.15)] outline-none">
          <Drawer.Title className="sr-only">{hospital?.name ?? '병원'} 정보</Drawer.Title>
          <Drawer.Description className="sr-only">
            선택한 병원의 진료시간, 유형, 연락처를 확인할 수 있습니다.
          </Drawer.Description>

          <div className="mx-auto mt-2.5 h-1 w-12 shrink-0 rounded-full bg-[#e5e1da]" />

          <div className="overflow-y-auto mt-3">
            <div className="flex shrink-0 items-center gap-4 px-7 pt-3.5">
              <HospitalIcon className="size-10" />
              <div>
                <p className="text-[15px] font-medium text-[#706963]">{hospital?.region ?? ''}</p>
                <p className="mt-1 text-[18px] font-bold text-black">{hospital?.name ?? ''}</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 px-6.25 pt-6">
              <InfoRow
                label="진료 시간"
                value={hospital?.hours ?? ''}
                onClick={() => setExpanded((v) => !v)}
                trailing={
                  <ChevronDown
                    className={`size-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  />
                }
              />

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                  expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
                aria-hidden={!expanded}
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="ml-auto w-56.75 bg-[#faf7f2] py-6">
                    <div className="flex flex-col gap-6 items-center">
                      {weekly.map((w) => (
                        <p
                          key={w.day}
                          className={`text-[15px] font-medium text-[#a8a19a] ${
                            w.hours === '휴진' ? 'text-left' : 'text-right'
                          }`}
                        >
                          {`${w.day}: ${w.hours}`}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <InfoRow label="병원 유형" value={hospital?.type ?? ''} withBorder={!expanded} />
              <InfoRow label="연락처" value={hospital?.phone ?? ''} />
            </div>

            <div className="shrink-0 px-11.25 mt-8 pb-5">
              <button
                type="button"
                onClick={() => {
                  if (!hospital) return;
                  const name = encodeURIComponent(hospital.name ?? '');
                  const { lat, lng } = hospital;
                  const url =
                    lat != null && lng != null
                      ? `https://map.kakao.com/link/map/${name},${lat},${lng}`
                      : `https://map.kakao.com/?q=${name}`;
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="w-full rounded-[10px] bg-[#ffc721] py-4 text-[18px] font-semibold text-white transition-colors active:bg-[#e28702] active:text-[#f5df7a]"
              >
                세부정보 확인하기
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full text-center text-[15px] font-medium text-[#b9b2a6]"
              >
                닫기
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

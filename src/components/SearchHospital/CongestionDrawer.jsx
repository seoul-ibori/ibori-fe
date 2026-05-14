import { Drawer } from 'vaul';

import HospitalIcon from '@/assets/icons/searchHospital/hospital_icon.svg?react';
import ManIcon from '@/assets/icons/searchHospital/man_icon.svg?react';
import ThermometerIcon from '@/assets/icons/searchHospital/thermometer_icon.svg?react';

const FACTOR_CARDS = [
  {
    Icon: ManIcon,
    sub: '소아청소년과 진료 건 수',
    title: '월별 평균 진료 수',
  },
  {
    Icon: ThermometerIcon,
    sub: '평균 기온, 일교차, 강수량',
    title: '시기에 따른 대기 상태',
  },
  {
    Icon: HospitalIcon,
    sub: '오늘 진료 중인 병원 수',
    title: '동네 소아과 진료 시간',
  },
];

const LEVEL_COLORS = {
  매우혼잡: '#FF3D00',
  '매우 혼잡': '#FF3D00',
  혼잡: '#AB4C0A',
  보통: '#FFC721',
  여유: '#B1CEF0',
};

export default function CongestionDrawer({
  open,
  onOpenChange,
  snap,
  onSnapChange,
  location,
  level,
}) {
  const hasData = Boolean(location && level);
  const levelColor = LEVEL_COLORS[level] ?? '#706963';
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[0.45, 0.95]}
      activeSnapPoint={snap}
      setActiveSnapPoint={(value) => {
        if (value === null || value === undefined) {
          onOpenChange(false);
          return;
        }
        onSnapChange(value);
      }}
      fadeFromIndex={0}
      closeThreshold={0.1}
      modal={false}
      dismissible
    >
      <Drawer.Portal>
        <Drawer.Content className="fixed pb-10 inset-x-0 bottom-0 z-30 mx-auto flex h-[95vh] w-full max-w-112.5 flex-col rounded-[30px] bg-white shadow-[0_-8px_30px_rgba(18,18,23,0.15)] outline-none">
          <Drawer.Title className="sr-only">병원 혼잡도 예측</Drawer.Title>
          <Drawer.Description className="sr-only">
            우리동네 소아과 혼잡도 예측 결과입니다.
          </Drawer.Description>

          <div className="mx-auto mt-2.5 h-1 w-12 shrink-0 rounded-full bg-[#e5e1da]" />

          <div
            className={`mt-3 no-scrollbar ${snap === 0.95 ? 'overflow-y-auto' : 'overflow-hidden'}`}
          >
            <div className="flex shrink-0 items-center gap-4 px-7 pt-3.5">
              <HospitalIcon className="size-10" />
              <div>
                <p className="text-[15px] font-medium text-[#706963]">
                  우리동네 소아과 혼잡도 예측
                </p>
                <p className="mt-1 text-[18px] font-bold text-black">병원 혼잡도를 예측했어요</p>
              </div>
            </div>

            <div className="mx-auto mt-5 h-px w-85 shrink-0 bg-[#ebe4d9]" />

            {hasData && (
              <div className="shrink-0 px-6 pt-8 text-center">
                <p className="text-[21px] font-bold leading-8.25 tracking-[-0.21px] text-[#706963]">
                  {`오늘 ${location},`}
                </p>
                <p className="text-[21px] font-bold leading-8.25 tracking-[-0.21px] text-[#706963]">
                  <span style={{ color: levelColor }}>{level}</span>
                  {' 예정입니다'}
                </p>
              </div>
            )}

            <div className="flex-1 pt-8">
              <div className="border-y-15 border-[#faf7f2] px-6 py-6">
                <p className="text-[15px] font-medium text-[#706963]">AI 수요 예측 알고리즘</p>
                <p className="mt-1 text-[18px] font-bold text-black">왜 그런 걸까요?</p>
                <div className="mt-3.5 flex justify-center text-[12px] font-medium leading-[170%] tracking-[-0.48px] text-[#706963]">
                  <p>
                    다양한 의료 이용 데이터와 날씨, 운영 시간을 종합 분석하여
                    <br />
                    <span className="font-semibold">
                      우리 동네 소아과의 붐빔 정도를 예측해드립니다.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.25 px-6 pt-9">
                {FACTOR_CARDS.map((card) => (
                  <div
                    key={card.title}
                    className="flex h-19 items-center gap-5 rounded-[15px] bg-[#faf7f2] px-3.5"
                  >
                    <card.Icon className="size-12.5 shrink-0" />
                    <div>
                      <p className="text-[14px] font-medium text-[#706963]">{card.sub}</p>
                      <p className="text-[16.785px] font-bold text-black">{card.title}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 pt-10 pb-8">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="w-full rounded-[10px] bg-[#ffc721] py-4 text-[16px] font-semibold text-white"
                >
                  지도로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

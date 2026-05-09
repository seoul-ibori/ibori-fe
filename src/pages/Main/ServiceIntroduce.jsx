import { useState } from 'react';
import { useNavigate } from 'react-router';

import Intro1 from '@/components/Main/ServiceIntroduce/Intro1';
import Intro2 from '@/components/Main/ServiceIntroduce/Intro2';
import Intro3 from '@/components/Main/ServiceIntroduce/Intro3';
import Intro4 from '@/components/Main/ServiceIntroduce/Intro4';
import Button from '@/components/common/Button';

const SLIDES = [
  {
    Component: Intro1,
    layout: 'top',
    title: ['맞벌이 가정에서는', '아이 병원 관리가 쉽지 않아요'],
    desc: [
      '맞벌이 가정에서는 아이 병원 관리가 쉽지 않아요',
      '예약부터 기록, 설명까지 모두 따로 챙겨야 하니까요',
    ],
    titleColor: '#FFFCF9',
    descColor: '#FFFCF9',
    activeDot: '#FFFCF9',
    inactiveDot: 'rgba(255, 252, 249, 0.4)',
    backColor: '#A8A19A',
    buttonText: '다음',
  },
  {
    Component: Intro2,
    layout: 'top',
    title: ['병원 방문 전부터 이후까지', '하나로 연결해 관리하세요'],
    desc: [
      '아이의 진료 과정 전체를 AI가 연결해줘요',
      ' 방문 전 준비부터 진료 후 기록까지 한 곳에서',
      '쉽게 확인하고 관리할 수 있어요',
    ],
    titleColor: '#1D1B1A',
    descColor: '#3D3835',
    activeDot: '#3D3835',
    inactiveDot: '#A8A19A',
    backColor: '#F5DF7A',
    buttonText: '다음',
  },
  {
    Component: Intro3,
    layout: 'top',
    title: ['AI가 대신 정리하고,', '정보를 예측해줘요!'],
    desc: [
      '진료 기록은 이해하기 쉽게 요약하고',
      '지역 데이터로 병원 혼잡도를 예측해요',
      '가족 모두가 같은 정보를 쉽게 공유할 수 있어요',
    ],
    titleColor: '#5F3010',
    descColor: '#AB4C0A',
    activeDot: '#FFFCF9',
    inactiveDot: 'rgba(255, 252, 249, 0.6)',
    backColor: '#AB4C0A',
    buttonText: '다음',
  },
  {
    Component: Intro4,
    layout: 'last',
    titleTop: ['맞벌이 부부를 위한', '아이 의료 통합 관리 서비스'],
    titleBottom: ['우리 가족을 위해', "이 모든 걸 '아이보리'로!"],
    activeDot: '#3D3835',
    inactiveDot: '#A8A19A',
    backColor: '#A8A19A',
    buttonText: '로그인 하기',
  },
];

function Dots({ count, current, activeColor, inactiveColor }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-1.5 rounded-full transition-all duration-300"
          style={{
            width: i === current ? 12 : 6,
            backgroundColor: i === current ? activeColor : inactiveColor,
          }}
        />
      ))}
    </div>
  );
}

export default function ServiceIntroduce() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const slide = SLIDES[index];

  const handleNext = () => {
    if (index === SLIDES.length - 1) {
      navigate('/login');
      return;
    }
    setIndex((prev) => prev + 1);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {SLIDES.map((s, i) => {
          const Slide = s.Component;
          return (
            <div key={i} className="relative h-full w-full shrink-0">
              <Slide />

              {s.layout === 'top' && (
                <div className="relative z-10 flex flex-col gap-6 px-7 pt-34">
                  <h1 className="text-2xl leading-9 font-bold" style={{ color: s.titleColor }}>
                    {s.title.map((line, j) => (
                      <span key={j} className="block">
                        {line}
                      </span>
                    ))}
                  </h1>
                  <p
                    className="text-xs leading-[18px] font-medium whitespace-pre"
                    style={{ color: s.descColor }}
                  >
                    {s.desc.map((line, j) => (
                      <span key={j} className="block">
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              )}

              {s.layout === 'last' && (
                <>
                  <div className="relative z-10 px-7 pt-50 text-center text-[15px] leading-[21px] text-[#B9B2A6]">
                    <p className="font-medium">{s.titleTop[0]}</p>
                    <p className="font-semibold">{s.titleTop[1]}</p>
                  </div>
                  <div className="absolute right-7 bottom-44 left-7 z-10 text-center text-2xl leading-9 text-[#5F3010]">
                    <p className="font-bold">{s.titleBottom[0]}</p>
                    <p className="font-extrabold">{s.titleBottom[1]}</p>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="absolute right-7 bottom-10 left-7 z-20 flex flex-col items-center gap-9">
        <Dots
          count={SLIDES.length}
          current={index}
          activeColor={slide.activeDot}
          inactiveColor={slide.inactiveDot}
        />
        <Button width="w-full" onClick={handleNext}>
          {slide.buttonText}
        </Button>
      </div>
    </div>
  );
}

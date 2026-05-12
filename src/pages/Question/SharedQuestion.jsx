import { useSearchParams } from 'react-router';

import RobotIcon from '@/assets/icons/question/robot_icon.svg?react';
import Bar from '@/components/Main/Bar';
import QuestionBox from '@/components/Question/QuestionBox';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import ChildrenNameBox from '@/components/common/ChildrenNameBox';
import PageTitleBox from '@/components/common/PageTitleBox';

function decodeShareData(encoded) {
  try {
    const json = decodeURIComponent(escape(atob(encoded)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function SharedQuestion() {
  const [searchParams] = useSearchParams();
  const encoded = searchParams.get('data');
  const data = encoded ? decodeShareData(encoded) : null;

  const childName = data?.childName ?? '';
  const childLabelColor = data?.profileColor ?? 'SKY_BLUE';
  const questions = (data?.questions ?? []).map((text, idx) => ({
    id: String(idx),
    text,
    checked: true,
  }));

  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center gap-10.5 pt-14 pb-9">
        <div className="relative size-33.25">
          <ChildrenImgBox
            labelColor={childLabelColor}
            selected
            className="size-33.25 rounded-[45.345px]"
            shadowClassName="shadow-[inset_0px_11.429px_5.714px_0px_rgba(255,255,255,0.2)]"
          />
          <ChildrenNameBox
            name={childName}
            labelColor={childLabelColor}
            className="absolute top-29.75 left-16.25 rounded-[7.727px] px-3.75 py-1 text-[17px] tracking-[-0.68px]"
          />
        </div>
        <div className="flex flex-col items-center gap-5.25">
          <PageTitleBox>AI 아이 맞춤형 생성 질문지</PageTitleBox>
          <h1 className="text-center text-[27px] leading-[39.608px] font-bold text-[#1D1B1A]">
            진료 전 우리 아이의
            <br />
            질문지를 확인해보세요
          </h1>
        </div>
      </div>

      <Bar />

      <section className="flex items-center gap-5.25 px-6.75 py-6">
        <div className="flex size-12.75 shrink-0 items-center justify-center rounded-[13.6px] bg-[#FAF7F2]">
          <RobotIcon className="size-8.75" />
        </div>
        <div className="flex flex-1 flex-col gap-1.25">
          <p className="text-[15px] font-medium text-[#706963]">AI의 분석</p>
          <p className="text-[18px] leading-6 font-bold text-[#3D3835]">
            아이의 증상을 종합적으로 해석해
            <br />
            진료에 필요한 질문을 준비했어요
          </p>
        </div>
      </section>

      <Bar />

      <div className="px-6.25 pt-9.75 pb-9">
        <QuestionBox questions={questions} />
      </div>
    </div>
  );
}

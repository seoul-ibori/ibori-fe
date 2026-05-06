import { useState } from 'react';
import { useNavigate } from 'react-router';

import RobotIcon from '@/assets/icons/question/robot_icon.svg?react';
import Bar from '@/components/Main/Bar';
import QuestionBox from '@/components/Question/QuestionBox';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import ChildrenNameBox from '@/components/common/ChildrenNameBox';
import PageTitleBox from '@/components/common/PageTitleBox';

const INITIAL_QUESTIONS = [
  {
    id: '1',
    text: '최근에 처방 받은 약이 있다는데,\n확인해 주실 수 있나요?',
    checked: true,
  },
  {
    id: '2',
    text: '아이가 알약을 잘 삼키지 못 해서 가루약, 혹은 물약 형태로 처방 받을 수 있을까요?',
    checked: true,
  },
  {
    id: '3',
    text: '열이 내린 뒤 언제부터 어린이집에 보내도\n되는지, 전염 가능성이 남아있는 기준은\n무엇인가요?',
    checked: true,
  },
  {
    id: '4',
    text: '현재 증상이 단순 감기인지, 추가 확인이\n필요한 질환 가능성이 있는지 봐야 하나요?',
    checked: true,
  },
  {
    id: '5',
    text: '요즘 A형 독감이 서울 전역 유행인데\n혹시 독감 검사를 받을 수 있을까요?',
    checked: true,
  },
];

export default function QuestionList() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);

  const handleToggleQuestion = (id) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, checked: !q.checked } : q)));

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const visibleQuestions = isEditing ? questions : questions.filter((q) => q.checked);

  return (
    <div className="flex flex-col">
      <div className="px-7 pt-7 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#A8A19A" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-10.5 pt-3 pb-9">
        <div className="relative size-33.25">
          <ChildrenImgBox
            labelColor="#FFC721"
            selected
            className="size-33.25 rounded-[45.345px]"
            shadowClassName="shadow-[inset_0px_11.429px_5.714px_0px_rgba(255,255,255,0.2)]"
          />
          <ChildrenNameBox
            name="우리 막둥이"
            labelColor="#FFC721"
            className="absolute top-29.75 left-16.25 rounded-[7.727px] px-3.75 py-1 text-[17px] tracking-[-0.68px]"
          />
        </div>
        <div className="flex flex-col items-center gap-5.25">
          <PageTitleBox>AI 아이 맞춤형 생성 질문지</PageTitleBox>
          <h1 className="text-center text-[27px] leading-[39.608px] font-bold text-[#1D1B1A]">
            우리 아이의 질문지가
            <br />
            완성되었어요!
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
            아이의 증상, 서울시 환경 데이터를
            <br />
            종합하여 질문을 준비했어요
          </p>
        </div>
      </section>

      <Bar />

      <div className="px-6.25 pt-9.75 pb-9">
        <QuestionBox
          questions={visibleQuestions}
          editable={isEditing}
          onToggle={handleToggleQuestion}
        />
      </div>

      <div className="flex flex-col gap-3.75 px-7 pb-5">
        <Button
          width="w-full"
          bgColor={isEditing ? '#EBE4D9' : '#FFC721'}
          textColor="#FFFCF9"
          disabled={isEditing}
        >
          질문지 공유하기
        </Button>
        <Button width="w-full" bgColor="#EBE4D9" textColor="#706963" onClick={handleEditToggle}>
          {isEditing ? '질문지 저장하기' : '질문지 수정하기'}
        </Button>
      </div>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="pb-9 text-center text-[14.661px] font-medium text-[#B9B2A6]"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
}

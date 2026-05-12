import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router';

import RobotIcon from '@/assets/icons/question/robot_icon.svg?react';
import Bar from '@/components/Main/Bar';
import QuestionBox from '@/components/Question/QuestionBox';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import ChildrenImgBox from '@/components/common/ChildrenImgBox';
import ChildrenNameBox from '@/components/common/ChildrenNameBox';
import PageTitleBox from '@/components/common/PageTitleBox';

const shareToKakao = ({ childName, questions }) => {
  const { Kakao } = window;

  const title = childName ? `${childName} 진료 질문지` : '아이보리 진료 질문지';
  const description =
    questions.length > 0
      ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
      : '맞벌이 가정을 위한 우리아이 종합 건강 관리!';

  Kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      imageUrl: 'https://ibori.site/thumbnail.png',
      link: {
        mobileWebUrl: 'https://ibori.site',
        webUrl: 'https://ibori.site',
      },
    },
    buttons: [
      {
        title: '웹으로 보기',
        link: {
          mobileWebUrl: 'https://ibori.site',
          webUrl: 'https://ibori.site',
        },
      },
    ],
  });
};

export default function QuestionList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useOutletContext();
  const child = location.state?.child ?? null;
  const childLabelColor = child?.profileColor ?? 'SKY_BLUE';
  const childName = child?.name ?? '';

  const initialQuestions = (location.state?.questions ?? []).map((text, idx) => ({
    id: String(idx),
    text,
    checked: true,
  }));

  const [isEditing, setIsEditing] = useState(false);
  const [questions, setQuestions] = useState(initialQuestions);

  const handleToggleQuestion = (id) =>
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, checked: !q.checked } : q)));

  const handleEditToggle = () => setIsEditing((prev) => !prev);

  const handleShare = () => {
    try {
      const checkedTexts = questions.filter((q) => q.checked).map((q) => q.text);
      shareToKakao({ childName, questions: checkedTexts });
    } catch (error) {
      console.log('카카오 공유 실패', error);
      showToast();
    }
  };

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
            아이의 증상을 종합적으로 해석해
            <br />
            진료에 필요한 질문을 준비했어요
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
          onClick={handleShare}
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

import { useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { postQuestion } from '@/api/Question';
import Bar from '@/components/Main/Bar';
import ChildrenBox from '@/components/Main/ChildrenBox';
import CreateQuestionModal from '@/components/Question/CreateQuestionModal';
import StatusQuestionBox from '@/components/Question/StatusQuestionBox';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import PageTitleBox from '@/components/common/PageTitleBox';
import { useChildrenStore } from '@/store/childrenStore';

const toChildView = (c) => ({
  id: c.childId,
  name: c.childName,
  profileColor: c.profileColor ?? 'SKY_BLUE',
});

const QUESTIONS = [
  {
    key: 'symptoms',
    question: '어떤 증상이 있나요? (중복선택 가능)',
    required: true,
    multiple: true,
    options: [
      '기침을 해요',
      '콧물이 나요',
      '열이 나요',
      '발진이 나요',
      '설사를 해요',
      '구토를 해요',
      '인후통이 있어요',
      '무기력해요',
    ],
  },
  {
    key: 'onset',
    question: '며칠 전부터 그랬나요?',
    required: true,
    custom: 'days',
  },
  {
    key: 'temperature',
    question: '체온을 입력해주세요! (선택)',
    custom: 'temperature',
  },
  {
    key: 'appetite',
    question: '아이의 식욕 변화는 어떤가요? (선택)',
    options: ['좋음', '보통', '나쁨'],
  },
  {
    key: 'sleep',
    question: '아이의 수면 변화는 어떤가요? (선택)',
    options: ['좋음', '보통', '나쁨'],
  },
  {
    key: 'medicineDifficulty',
    question: '약을 복용하는데 어려움이 있나요? (중복선택 가능)',
    multiple: true,
    options: ['알약을 못 삼켜요', '가루약을 못 먹어요', '물약을 못 먹어요', '문제 없이 잘 먹어요!'],
  },
];

const initialAnswers = {
  symptoms: [],
  onset: '',
  recentMedicine: null,
  temperature: '',
  appetite: null,
  sleep: null,
  medicineDifficulty: [],
};

export default function CreateQuestion() {
  const navigate = useNavigate();
  const { setIsModalOpen, setModalContent, showToast } = useOutletContext();
  const childrenRaw = useChildrenStore((s) => s.children);
  const childrenList = useMemo(() => childrenRaw.map(toChildView), [childrenRaw]);
  const firstChildId = childrenList[0]?.id ?? null;
  const [selectedChildId, setSelectedChildId] = useState(firstChildId);
  const [answers, setAnswers] = useState(initialAnswers);
  const isRequired = answers.symptoms && answers.onset;

  const updateAnswer = (key) => (value) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const buildPayload = () => {
    const temp = answers.temperature !== '' ? Number(answers.temperature) : null;
    return {
      symptoms: answers.symptoms,
      symptomDuration: answers.onset,
      temperature: Number.isFinite(temp) ? temp : null,
      appetiteChange: answers.appetite,
      sleepCondition: answers.sleep,
      medicationNotes: answers.medicineDifficulty,
    };
  };

  const handleSubmit = async () => {
    if (!isRequired) return;

    let cancelled = false;
    const handleCancel = () => {
      cancelled = true;
      setIsModalOpen(false);
    };

    setModalContent(<CreateQuestionModal onClose={handleCancel} />);
    setIsModalOpen(true);

    try {
      const data = await postQuestion(buildPayload());
      if (cancelled) return;
      setIsModalOpen(false);
      const selectedChild = childrenList.find((c) => c.id === selectedChildId) ?? null;
      navigate('/question-list', {
        state: { questions: data?.questions ?? [], child: selectedChild },
      });
    } catch (error) {
      if (cancelled) return;
      console.log('질문지 생성 실패', error);
      setIsModalOpen(false);
      showToast();
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center px-6 pt-3 pb-2 my-7">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#A8A19A" />
        </button>
      </div>

      <div className="flex flex-col items-center gap-3.75 px-6 pb-7.5">
        <PageTitleBox>AI 아이 맞춤형 생성 질문지</PageTitleBox>
        <h1 className="text-center text-[27px] leading-[39.608px] font-bold text-[#1D1B1A]">
          병원 가기 전,
          <br />
          질문을 준비해요
        </h1>
        <p className="text-center text-xs leading-4.5 font-medium text-[#706963]">
          맞벌이 환경에서 아이 상태를 충분히 파악하기 어려운 문제를,
          <br />
          <span className="font-bold">보호자가 입력한 증상 정보와 아이 연령대를 바탕</span>으로
          <br />
          AI가 진료 전 필요한 질문을 자동으로 정리해 해결해요!
        </p>
      </div>

      <Bar />

      <section className="flex flex-col items-center">
        <h2 className="w-full pl-7 py-7 text-[18px] leading-6.75 font-bold text-black">
          어떤 아이의 질문지를
          <br />
          만들어 드릴까요?
        </h2>
        <div className="h-1 w-full bg-[#FFFCF9]"></div>
        <div className="flex items-center gap-3.25 w-full pl-6 py-6">
          {childrenList.map((child) => {
            const isSelected = selectedChildId === child.id;
            const isFaded = selectedChildId !== null && !isSelected;
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => setSelectedChildId(child.id)}
                className={isFaded ? 'opacity-30' : ''}
              >
                <ChildrenBox
                  name={child.name}
                  labelColor={child.profileColor}
                  selected={isSelected}
                />
              </button>
            );
          })}
        </div>
      </section>

      <Bar />

      <section className="px-7 pt-9.5 pb-9">
        <h2 className="mb-9 text-[18px] leading-6.75 font-bold text-black">
          우리 아이의 상태는
          <br />
          어떤지 알려주세요!
        </h2>

        <div className="flex flex-col">
          {QUESTIONS.map((q, i) => (
            <div
              key={q.key}
              className={`py-9 ${i === 0 ? 'pt-0' : ''} ${
                i === QUESTIONS.length - 1 ? 'pb-0' : 'border-b border-[#EBE4D9]'
              }`}
            >
              {q.custom === 'temperature' ? (
                <StatusQuestionBox question={q.question}>
                  <div className="flex items-end gap-1.5 border-b-[1.5px] border-[#A8A19A] py-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={answers.temperature}
                      onChange={(e) => updateAnswer('temperature')(e.target.value)}
                      placeholder=""
                      className="flex-1 bg-transparent border-l-2 border-[#EBE4D9] pl-2 text-[15px] text-[#1D1B1A] outline-none placeholder:text-[#A8A19A]"
                    />
                    <span className="text-[15px] text-[#A8A19A]">℃</span>
                  </div>
                </StatusQuestionBox>
              ) : q.custom === 'days' ? (
                <StatusQuestionBox question={q.question} required={q.required}>
                  <div className="flex items-end gap-1.5 border-b-[1.5px] border-[#A8A19A] py-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={answers.onset}
                      onChange={(e) => updateAnswer('onset')(e.target.value.replace(/\D/g, ''))}
                      placeholder=""
                      className="flex-1 border-l-2 border-[#EBE4D9] pl-2 bg-transparent text-[15px] text-[#1D1B1A] outline-none placeholder:text-[#A8A19A]"
                    />
                    <span className="text-[15px] text-[#A8A19A]">일 전</span>
                  </div>
                </StatusQuestionBox>
              ) : (
                <StatusQuestionBox
                  question={q.question}
                  required={q.required}
                  options={q.options}
                  multiple={q.multiple}
                  value={answers[q.key]}
                  onChange={updateAnswer(q.key)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="px-6 pb-6">
        <Button
          width="w-full"
          bgColor={isRequired ? '#FFC721' : '#B9B2A6'}
          pressedBgColor={isRequired && '#E28702'}
          pressedTextColor={isRequired && '#F5DF7A'}
          onClick={handleSubmit}
          disabled={isRequired ? false : true}
        >
          질문지 생성하기
        </Button>
      </div>
    </div>
  );
}

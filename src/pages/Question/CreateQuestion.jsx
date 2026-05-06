import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import Bar from '@/components/Main/Bar';
import ChildrenBox from '@/components/Main/ChildrenBox';
import CreateQuestionModal from '@/components/Question/CreateQuestionModal';
import StatusQuestionBox from '@/components/Question/StatusQuestionBox';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';
import PageTitleBox from '@/components/common/PageTitleBox';

const CHILDREN = [
  { id: '1', name: '우리집 아들', labelColor: '#5AA7FF' },
  { id: '2', name: '우리 막둥이', labelColor: '#FFC721' },
  { id: '3', name: '우리 첫째 딸', labelColor: '#FF8763' },
];

const QUESTIONS = [
  {
    key: 'symptoms',
    question: '어떤 증상이 있나요?',
    required: true,
    multiple: true,
    options: [
      '기침을 해요',
      '콧물이 나요',
      '열이 나요',
      '발진이 나요',
      '설사를 해요',
      '구토를 해요',
    ],
  },
  {
    key: 'onset',
    question: '언제부터 그랬나요?',
    required: true,
    options: ['오늘', '어제', '3일 이상'],
  },
  {
    key: 'recentMedicine',
    question: '최근 처방 받은 약이 있나요?',
    required: true,
    options: ['네', '아니요', '몰라요'],
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
  onset: null,
  recentMedicine: null,
  temperature: '',
  appetite: null,
  sleep: null,
  medicineDifficulty: [],
};

export default function CreateQuestion() {
  const navigate = useNavigate();
  const { setIsModalOpen, setModalContent } = useOutletContext();
  const [selectedChildId, setSelectedChildId] = useState('1');
  const [answers, setAnswers] = useState(initialAnswers);

  const updateAnswer = (key) => (value) => setAnswers((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    setModalContent(<CreateQuestionModal onClose={() => setIsModalOpen(false)} />);
    setIsModalOpen(true);
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
        <p className="text-center text-xs leading-[18px] font-medium text-[#706963]">
          맞벌이 환경에서 아이 상태를 충분히 파악하기 어려운 문제를,
          <br />
          증상과 함께 <span className="font-bold">서울시 대기질·감염병 등 생활 환경 데이터</span>를
          반영한 AI가 진료 전 질문을 자동으로 정리해 해결해요!
        </p>
      </div>

      <Bar />

      <section className="flex flex-col items-center">
        <h2 className="w-full pl-7 py-7 text-[18px] leading-[27px] font-bold text-black">
          어떤 아이의 질문지를
          <br />
          만들어 드릴까요?
        </h2>
        <div className="h-1 w-full bg-[#FFFCF9]"></div>
        <div className="flex items-center gap-3.25 w-full pl-6 py-6">
          {CHILDREN.map((child) => {
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
                  labelColor={child.labelColor}
                  selected={isSelected}
                />
              </button>
            );
          })}
        </div>
      </section>

      <Bar />

      <section className="px-7 pt-9.5 pb-9">
        <h2 className="mb-9 text-[18px] leading-[27px] font-bold text-black">
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
                      className="flex-1 bg-transparent text-[15px] text-[#1D1B1A] outline-none placeholder:text-[#A8A19A]"
                    />
                    <span className="text-[15px] text-[#A8A19A]">℃</span>
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
          pressedBgColor="#E28702"
          pressedTextColor="#F5DF7A"
          onClick={handleSubmit}
        >
          질문지 생성하기
        </Button>
      </div>
    </div>
  );
}

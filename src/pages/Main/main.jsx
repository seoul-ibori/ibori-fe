import { Navigate } from 'react-router';

import { TokenManager } from '@/api/api';
import AICreateQuestion from '@/components/Main/AICreateQuestion';
import Bar from '@/components/Main/Bar';
import WeeklyRecord from '@/components/Main/WeeklyRecord';

const MOCK_CHILDREN = [
  { id: '1', name: '우리집 아들', labelColor: '#5AA7FF' },
  { id: '2', name: '우리 막둥이', labelColor: '#FFC721' },
  { id: '3', name: '우리 첫째 딸', labelColor: '#FF8763' },
];

const MOCK_RECORDS = [
  {
    id: 'r1',
    childId: '1',
    hospitalName: '서울시청 부속의원',
    medicineName: '항히스타민제 알비다정10mg',
    date: '2026. 04. 10/ 18:20',
    category: '일반외래',
  },
  {
    id: 'r2',
    childId: '2',
    hospitalName: '서울가정의학과의원',
    medicineName: '항히스타민제 알비다정10mg',
    date: '2026. 04. 10/ 15:20',
    category: '일반외래',
  },
  {
    id: 'r3',
    childId: '3',
    hospitalName: '서상렬내과의원',
    medicineName: '항히스타민제 알비다정10mg',
    date: '2026. 04. 10/ 11:20',
    category: '일반외래',
  },
];

const AISection = () => (
  <section className="flex flex-col gap-4 px-6 py-5.5">
    <div className="flex flex-col gap-1.25">
      <p className="text-[15px] font-medium text-[#706963]">AI 아이 맞춤형 생성 질문지</p>
      <p className="text-[18px] font-bold text-[#413B32]">진료 전 질문을 준비해요</p>
    </div>
    <AICreateQuestion />
  </section>
);

export default function Main() {
  const isLoggedIn = true; //Boolean(TokenManager.getAccessToken());

  if (!isLoggedIn) {
    return <Navigate to="/introduce" replace />;
  }

  return (
    <div className="flex flex-col py-5">
      <Bar />
      <WeeklyRecord childrenList={MOCK_CHILDREN} records={MOCK_RECORDS} />
      <Bar />
      <AISection />
    </div>
  );
}

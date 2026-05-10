import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';

import { TokenManager } from '@/api/api';
import { getChildren } from '@/api/child';
import { getMedicalRecord } from '@/api/medicalRecord';
import AICreateQuestion from '@/components/Main/AICreateQuestion';
import Bar from '@/components/Main/Bar';
import WeeklyRecord from '@/components/Main/WeeklyRecord';
import { useChildrenStore } from '@/store/childrenStore';

const PROFILE_COLOR_MAP = {
  PINK: '#FF8DA1',
  BLUE: '#5AA7FF',
  YELLOW: '#FFC721',
  ORANGE: '#FF8763',
  GREEN: '#7AC14A',
  PURPLE: '#A988E0',
};

const formatRecordDate = (treatDate, treatTime) => {
  if (!treatDate || treatDate.length < 8) return '';
  const y = treatDate.slice(0, 4);
  const m = treatDate.slice(4, 6);
  const d = treatDate.slice(6, 8);
  return treatTime ? `${y}. ${m}. ${d}/ ${treatTime}` : `${y}. ${m}. ${d}`;
};

const mapChild = (c) => ({
  id: c.childId,
  name: c.childName,
  labelColor: PROFILE_COLOR_MAP[c.profileColor] ?? '#5AA7FF',
});

const mapRecord = (r) => ({
  id: r.recordId,
  childId: r.childId,
  childName: r.childName,
  hospitalName: r.hospitalName,
  medicineName: r.medications?.[0]?.drugName ?? '',
  date: formatRecordDate(r.treatDate, r.treatTime),
  category: r.title ?? '',
});

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
  const isLoggedIn = Boolean(TokenManager.getAccessToken());
  const today = new Date();

  const children = useChildrenStore((s) => s.children);
  const setChildren = useChildrenStore((s) => s.setChildren);

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const data = await getChildren();
        setChildren(data);
      } catch (error) {
        console.log('아이 목록 불러오기 실패', error);
      }
    })();
  }, [isLoggedIn, setChildren]);

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const data = await getMedicalRecord({
          year,
          month,
          childId: selectedChildId ?? undefined,
        });
        setRecords(data ?? []);
      } catch (error) {
        console.log('진료 기록 불러오기 실패', error);
      }
    })();
  }, [isLoggedIn, year, month, selectedChildId]);

  if (!isLoggedIn) {
    return <Navigate to="/introduce" replace />;
  }

  const childrenList = children.map(mapChild);
  const recordsList = records.map(mapRecord);

  return (
    <div className="flex flex-col py-5">
      <Bar />
      <WeeklyRecord
        childrenList={childrenList}
        records={recordsList}
        year={year}
        month={month}
        onPeriodChange={(y, m) => {
          setYear(y);
          setMonth(m);
        }}
        selectedChildId={selectedChildId}
        onSelectChild={setSelectedChildId}
      />
      <Bar />
      <AISection />
    </div>
  );
}

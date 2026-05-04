import AICreateQuestion from '@/components/Main/AICreateQuestion';
import Bar from '@/components/Main/Bar';
import LoginSuggestBanner from '@/components/Main/LoginSuggestBanner';
import MainPost from '@/components/Main/MainPost';
import MedicalRecord from '@/components/Main/MedicalRecord';

export default function Main() {
  return (
    <div className="flex flex-col py-5">
      <section className="flex flex-col items-center py-1 gap-1">
        <MainPost />
        <LoginSuggestBanner />
      </section>
      <Bar />
      <section className="flex flex-col gap-4 px-6 py-5.5">
        <div className="flex flex-col gap-1.25">
          <p className="text-[15px] font-medium text-[#706963]">AI 아이 맞춤형 생성 질문지</p>
          <p className="text-[18px] font-bold text-[#413B32]">진료 전 질문을 준비해요</p>
        </div>
        <AICreateQuestion />
      </section>
      <Bar />
      <div>
        <MedicalRecord />
      </div>
    </div>
  );
}

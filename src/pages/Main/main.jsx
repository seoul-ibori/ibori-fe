import AICreateQuestion from '@/components/Main/AICreateQuestion';
import Bar from '@/components/Main/Bar';
import LoginSuggestBanner from '@/components/Main/LoginSuggestBanner';
import MainPost from '@/components/Main/MainPost';
import MedicalRecord from '@/components/Main/MedicalRecord';

export default function Main() {
  return (
    <div className="flex flex-col">
      <div className="flex flex-col items-center py-1 gap-1">
        <MainPost />
        <LoginSuggestBanner />
      </div>
      <Bar />
      <div>
        <AICreateQuestion />
      </div>
      <Bar />
      <div>
        <MedicalRecord />
      </div>
    </div>
  );
}

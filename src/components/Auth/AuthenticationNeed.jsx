import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';

export default function AuthenticationNeed({ onComplete }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center px-6 justify-center">
        <Spinner className="size-11.75" />
        <h1 className="mt-4 text-center text-[28px] font-bold leading-11 text-[#1D1B1A]">
          카카오톡 앱에서
          <br />
          건강보험공단 인증을
          <br />
          진행해주세요.
        </h1>
        <p className="mt-4 text-center text-[15px] font-medium leading-[1.541] text-[#706963]">
          카카오톡 간편인증을 완료한 후
          <br />
          하단의 인증완료 버튼을 클릭해주세요.
        </p>
      </div>

      <div className="px-6 pb-10">
        <Button
          onClick={onComplete}
          bgColor="#FFC721"
          textColor="#FFFCF9"
          pressedBgColor="#E28702"
          pressedTextColor="#F5DF7A"
        >
          인증 완료
        </Button>
      </div>
    </div>
  );
}

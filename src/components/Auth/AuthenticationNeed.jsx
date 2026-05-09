import AuthenticationIcon from '@/assets/icons/auth/authentication_icon.svg?react';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';

export default function AuthenticationNeed({ onBack, onComplete }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-7 pt-11">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="이전 단계" className="-ml-1 p-1">
            <BackButtonIcon color="#1D1B1A" />
          </button>
        ) : (
          <div className="h-[30px]" />
        )}
        <p className="mt-3.5 text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">
          진료내역 불러오기
        </p>
      </header>
      <div className="mt-3.5 h-[15px] bg-[#FAF7F2]" />

      <div className="flex flex-1 flex-col items-center px-6 pt-22">
        <AuthenticationIcon className="size-21" />
        <h1 className="mt-4 text-center text-[28px] font-bold leading-[44px] text-[#1D1B1A]">
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

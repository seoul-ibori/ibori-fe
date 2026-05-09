import { useNavigate } from 'react-router';

import AuthenticationIcon from '@/assets/icons/auth/authentication_icon.svg?react';
import Button from '@/components/common/Button';

export default function SignUpDone({ variant = 'full' }) {
  const navigate = useNavigate();
  const isFull = variant === 'full';

  const goToLogin = () => navigate('/login');

  return (
    <div className="flex min-h-screen flex-col">
      {isFull && (
        <>
          <header className="px-7 pt-11">
            <div className="h-[30px]" />
            <p className="mt-3.5 text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">
              진료내역 불러오기
            </p>
          </header>
          <div className="mt-3.5 h-[15px] bg-[#FAF7F2]" />
        </>
      )}

      <div
        className={`flex flex-1 flex-col items-center px-6 ${isFull ? 'pt-22' : 'justify-center'}`}
      >
        <AuthenticationIcon className="size-21" />
        <h1 className="mt-4 text-center text-[28px] font-bold leading-[44px] text-[#1D1B1A]">
          {isFull ? (
            <>
              회원가입 및 인증이
              <br />
              완료되었습니다!
            </>
          ) : (
            <>
              회원가입이
              <br />
              완료되었습니다!
            </>
          )}
        </h1>
        {isFull && (
          <p className="mt-4 text-center text-[15px] font-medium leading-[1.541] text-[#706963]">
            자녀 정보가 확인되어 연동을 진행했어요
          </p>
        )}
      </div>

      <div className="px-6 pb-10">
        <Button
          onClick={goToLogin}
          bgColor="#FFC721"
          textColor="#FFFCF9"
          pressedBgColor="#E28702"
          pressedTextColor="#F5DF7A"
        >
          로그인 하러가기
        </Button>
      </div>
    </div>
  );
}

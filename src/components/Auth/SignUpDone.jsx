import { useNavigate } from 'react-router';

import AuthenticationIcon from '@/assets/icons/auth/authentication_icon.svg?react';
import Button from '@/components/common/Button';

export default function SignUpDone({ variant = 'full' }) {
  const navigate = useNavigate();
  const isFull = variant === 'full';

  const goToMain = () => navigate('/');

  return (
    <div className="flex min-h-screen flex-col">
      <div className={`flex flex-1 flex-col items-center px-6 justify-center`}>
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
          onClick={goToMain}
          bgColor="#FFC721"
          textColor="#FFFCF9"
          pressedBgColor="#E28702"
          pressedTextColor="#F5DF7A"
        >
          홈으로 가기
        </Button>
      </div>
    </div>
  );
}

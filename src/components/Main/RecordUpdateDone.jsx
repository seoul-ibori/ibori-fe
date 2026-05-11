import { useNavigate } from 'react-router';

import AuthenticationIcon from '@/assets/icons/auth/authentication_icon.svg?react';
import Button from '@/components/common/Button';

export default function RecordUpdateDone() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <AuthenticationIcon className="size-21" />
        <h1 className="mt-4 text-center text-[27px] font-bold leading-10 text-[#1D1B1A]">
          인증이
          <br />
          완료되었어요!
        </h1>
        <p className="mt-4 text-center text-[15px] font-medium leading-[1.541] text-[#706963]">
          자녀 정보가 확인되어 연동을 진행했어요
        </p>
      </div>

      <div className="px-6 pb-10">
        <Button
          onClick={() => navigate('/')}
          bgColor="#FFC721"
          textColor="#FFFCF9"
          pressedBgColor="#E28702"
          pressedTextColor="#F5DF7A"
        >
          홈화면으로 돌아가기
        </Button>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router';

import LogoIcon from '@/assets/icons/logo_big_icon.svg?react';

const MethodButton = ({ onClick, children }) => {
  const [pressed, setPressed] = useState(false);
  const release = () => setPressed(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className={`flex w-full items-center justify-between rounded-[13.419px] px-6.25 py-9.75 transition-colors ${
        pressed ? 'bg-[#E28702]' : 'bg-[#FFC721]'
      }`}
    >
      <span
        className={`text-left text-[21px] font-bold leading-tight ${
          pressed ? 'text-[#F5DF7A]' : 'text-[#FFFCF9]'
        }`}
      >
        {children}
      </span>
      <svg
        viewBox="0 0 12 22"
        fill="none"
        stroke={pressed ? '#F5DF7A' : '#FFFCF9'}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-2.5 shrink-0"
      >
        <path d="M2 2l8 9-8 9" />
      </svg>
    </button>
  );
};

export default function SignUpSelect() {
  const navigate = useNavigate();

  const goToSignUp = (method) => {
    navigate(`/signup?method=${method}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-80 flex-col items-center gap-5.25">
        <LogoIcon className="w-38.75" />
        <p className="text-[18px] font-bold text-[#1D160C]">회원가입 수단을 선택하세요</p>
        <div className="flex w-full flex-col gap-3">
          <MethodButton onClick={() => goToSignUp('first')}>
            제가 가족 중
            <br />첫 가입자예요!
          </MethodButton>
          <MethodButton onClick={() => goToSignUp('existing')}>
            가족 구성원 중에서
            <br />
            이미 가입한 분이 있어요!
          </MethodButton>
          <div className="flex font-medium text-[#B9B2A6] text-[12px] pl-4">
            * 첫 가입자는 부모님만 가능해요
          </div>
        </div>
      </div>
    </div>
  );
}

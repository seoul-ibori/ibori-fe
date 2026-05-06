import { useState } from 'react';
import { useNavigate } from 'react-router';

import AppLogoIcon from '@/assets/icons/app_logo_icon.svg?react';
import LogoIcon from '@/assets/icons/logo_big_icon.svg?react';
import Button from '@/components/common/Button';

export default function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: 로그인 API 연결
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-25">
      <div className="flex w-full max-w-84.25 flex-col items-center gap-10.5">
        <div className="flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-7.5">
            <div className="flex size-20.25 items-center justify-center overflow-hidden rounded-[10.832px] bg-[#FFC721]">
              <AppLogoIcon className="size-13" />
            </div>
            <LogoIcon />
          </div>
          <div className="text-center text-[18px] leading-[29px] text-[#7D7D7D]">
            <p className="font-medium">시작하려면</p>
            <p className="font-bold">로그인을 진행해주세요!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
          <div className="flex w-full flex-col gap-3.75">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디"
              className="h-13 rounded-[12px] bg-[#FAF7F2] px-4.25 text-[15px] font-medium text-[#7D7D7D] outline-none placeholder:text-[#7D7D7D]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="h-13 rounded-[12px] bg-[#FAF7F2] px-4.25 text-[15px] font-medium text-[#7D7D7D] outline-none placeholder:text-[#7D7D7D]"
            />
          </div>
          <div className="flex w-full flex-col items-center gap-6">
            <Button type="submit" pressedBgColor="#E28702" pressedTextColor="#F5DF7A">
              로그인 하기
            </Button>
            <p className="text-[15px] font-medium text-[#7D7D7D]">
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup-select')}
                className="font-semibold"
              >
                회원가입하기
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

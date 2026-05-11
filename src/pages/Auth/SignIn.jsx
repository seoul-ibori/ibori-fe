import { useState } from 'react';
import { useNavigate } from 'react-router';

import { TokenManager } from '@/api/api';
import { demoLogin, login } from '@/api/auth';
import AppLogoIcon from '@/assets/icons/app_logo_icon.svg?react';
import LogoIcon from '@/assets/icons/logo_big_icon.svg?react';
import Button from '@/components/common/Button';

const saveAuthData = (data) => {
  TokenManager.setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  localStorage.setItem('userId', String(data.userId));
  localStorage.setItem('username', data.username);
  localStorage.setItem('name', data.name);
};

export default function SignIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    try {
      const data = await login({ username, password });
      saveAuthData(data);
      navigate('/');
    } catch (error) {
      console.log('로그인 실패', error);
      setErrorMessage('아이디 혹은 비밀번호를 확인해주세요.');
    }
  };

  const handleDemoLogin = async () => {
    try {
      const data = await demoLogin();
      saveAuthData(data);
      navigate('/');
    } catch (error) {
      console.log('테스트 로그인 실패', error);
      setErrorMessage('테스트 계정 로그인을 다시 시도해주세요.');
    }
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
              onChange={handleUsernameChange}
              placeholder="아이디"
              className="h-13 rounded-[12px] bg-[#FAF7F2] px-4.25 text-[15px] font-medium text-[#7D7D7D] outline-none placeholder:text-[#7D7D7D]"
            />
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="비밀번호"
              className="h-13 rounded-[12px] bg-[#FAF7F2] px-4.25 text-[15px] font-medium text-[#7D7D7D] outline-none placeholder:text-[#7D7D7D]"
            />
            {errorMessage && (
              <p className="text-[13px] font-medium text-[#E14B4B]">{errorMessage}</p>
            )}
          </div>
          <div className="flex w-full flex-col items-center gap-3">
            <Button
              type="submit"
              disabled={!isFormValid}
              bgColor={isFormValid ? '#FFC721' : '#E5E0D7'}
              pressedBgColor="#E28702"
              pressedTextColor="#F5DF7A"
            >
              로그인 하기
            </Button>
            <Button
              type="button"
              onClick={handleDemoLogin}
              pressedBgColor="#E28702"
              pressedTextColor="#F5DF7A"
            >
              테스트 계정으로 진입하기
            </Button>
            <p className="text-[15px] font-medium text-[#7D7D7D] mt-1.5">
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

import { useState } from 'react';
import { useSearchParams } from 'react-router';

import EyeCloseIcon from '@/assets/icons/auth/eye-close-icon.svg?react';
import EyeOpenIcon from '@/assets/icons/auth/eye-open-icon.svg?react';
import CheckYellowIcon from '@/assets/icons/check_yellow_icon.svg?react';
import LogoIcon from '@/assets/icons/logo_big_icon.svg?react';
import Button from '@/components/common/Button';

const inputClass =
  'h-13 w-full rounded-[12px] bg-[#FAF7F2] px-4.25 text-[14px] font-medium text-[#706963] outline-none placeholder:text-[#B9B2A6]';

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method'); // 'first' | 'existing'

  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const allFilled = Boolean(name && userId && password && passwordConfirm && familyPassword);
  const passwordMatch = Boolean(password && passwordConfirm && password === passwordConfirm);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allFilled) return;
    // TODO: method 값에 따라 다른 회원가입 API 호출
    method === 'first'; //→ 첫 가입자 플로우
    // method === 'existing' → 기존 가족원 플로우
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-6 pt-25">
      <div className="flex w-full max-w-84.25 flex-col items-center gap-10.5">
        <LogoIcon className="w-38.75" />

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
          <div className="flex w-full flex-col gap-3.75">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className={inputClass}
            />
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디"
              className={inputClass}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                className={`${inputClass} pr-16`}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {passwordMatch && <CheckYellowIcon className="size-6" />}
                <button
                  type="button"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                  onClick={() => setShowPassword((p) => !p)}
                  className="flex items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOpenIcon className="size-5" />
                  ) : (
                    <EyeCloseIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                className={`${inputClass} pr-16`}
              />
              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {passwordMatch && <CheckYellowIcon className="size-6" />}
                <button
                  type="button"
                  aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 표시'}
                  onClick={() => setShowPasswordConfirm((p) => !p)}
                  className="flex items-center justify-center"
                >
                  {showPasswordConfirm ? (
                    <EyeOpenIcon className="size-5" />
                  ) : (
                    <EyeCloseIcon className="size-5" />
                  )}
                </button>
              </div>
            </div>

            <input
              type="text"
              value={familyPassword}
              onChange={(e) => setFamilyPassword(e.target.value)}
              placeholder="가족비밀번호 등록"
              className={inputClass}
            />
          </div>

          <Button
            type="submit"
            disabled={!allFilled}
            bgColor={allFilled ? '#FFC721' : '#B9B2A6'}
            textColor={allFilled ? '#FFFCF9' : '#FAF7F2'}
            pressedBgColor={allFilled ? '#E28702' : undefined}
            pressedTextColor={allFilled ? '#F5DF7A' : undefined}
          >
            회원가입 하기
          </Button>
        </form>
      </div>
    </div>
  );
}

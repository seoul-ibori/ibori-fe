import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import EyeCloseIcon from '@/assets/icons/auth/eye-close-icon.svg?react';
import EyeOpenIcon from '@/assets/icons/auth/eye-open-icon.svg?react';
import CheckYellowIcon from '@/assets/icons/check_yellow_icon.svg?react';
import BackButtonIcon from '@/components/common/BackButtonIcon';
import Button from '@/components/common/Button';

const RELATIONS = ['아빠', '엄마', '할아버지', '할머니', '형제자매', '친척'];

const STEP1_DRAFT_KEY = 'signup:step1';

function readStep1Draft() {
  try {
    const raw = sessionStorage.getItem(STEP1_DRAFT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const underlineInputClass =
  'h-9 w-full border-b border-[#EBE4D9] bg-transparent text-[18px] font-medium text-[#3D3835] outline-none placeholder:font-medium placeholder:text-[#A8A19A]';

const passwordHint = '* 영문, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.';

function validateSecret(value) {
  if (!value || value.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  return hasLetter && hasNumber && hasSpecial;
}

export default function SignUpStep1({ method, onSubmit }) {
  const navigate = useNavigate();

  const [draft] = useState(readStep1Draft);
  const [name, setName] = useState(draft.name ?? '');
  const [userId, setUserId] = useState(draft.userId ?? '');
  const [password, setPassword] = useState(draft.password ?? '');
  const [passwordConfirm, setPasswordConfirm] = useState(draft.passwordConfirm ?? '');
  const [relation, setRelation] = useState(draft.relation ?? '');
  const [relationOpen, setRelationOpen] = useState(false);
  const [familyPassword, setFamilyPassword] = useState(draft.familyPassword ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [showFamilyPassword, setShowFamilyPassword] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STEP1_DRAFT_KEY,
        JSON.stringify({ name, userId, password, passwordConfirm, relation, familyPassword })
      );
    } catch {
      /* ignore */
    }
  }, [name, userId, password, passwordConfirm, relation, familyPassword]);

  const passwordValid = validateSecret(password);
  const familyPasswordValid = validateSecret(familyPassword);
  const passwordMatch = Boolean(password && passwordConfirm && password === passwordConfirm);

  const showPasswordError = Boolean(password) && !passwordValid;
  const showFamilyPasswordError = Boolean(familyPassword) && !familyPasswordValid;

  const allFilled = Boolean(
    name && userId && passwordValid && passwordMatch && relation && familyPasswordValid
  );

  const isFirst = method === 'first';
  const headerTitle = isFirst ? '가족 중 첫 가입자' : '가족 구성원으로 가입';
  const buttonLabel = isFirst ? '다음' : '회원가입 하기';
  const familyPwdPlaceholder = isFirst ? '가족 고유번호 등록' : '가족 고유번호 입력';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!allFilled) return;
    onSubmit({ name, userId, password, passwordConfirm, relation, familyPassword });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-7 pt-11">
        <button type="button" onClick={() => navigate(-1)} aria-label="이전" className="-ml-1 p-1">
          <BackButtonIcon color="#1D1B1A" />
        </button>
        <p className="mt-3.5 text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">
          {headerTitle}
        </p>
      </header>
      <div className="mt-3.5 h-[15px] bg-[#FAF7F2]" />

      <div className="flex flex-1 flex-col px-6 pt-7">
        <div className="flex flex-col gap-1.25">
          <p className="text-[15px] font-medium text-[#706963]">회원가입을 진행하세요</p>
          <p className="text-[18px] font-bold text-black">회원 정보 입력</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 flex flex-1 flex-col">
          <div className="flex flex-col gap-7.5">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className={underlineInputClass}
            />
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="아이디"
              className={underlineInputClass}
            />

            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호"
                  className={`${underlineInputClass} pr-10`}
                />
                <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center">
                  <button
                    type="button"
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    {showPassword ? (
                      <EyeOpenIcon className="size-5" />
                    ) : (
                      <EyeCloseIcon className="size-5" />
                    )}
                  </button>
                </div>
              </div>
              {showPasswordError && (
                <p className="mt-2 text-[12px] font-medium text-[#FF3D00]">{passwordHint}</p>
              )}
            </div>
            <div className="flex relative">
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="비밀번호 확인"
                className={`${underlineInputClass} pr-10`}
              />
              <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-2">
                {passwordMatch && <CheckYellowIcon className="size-6" />}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setRelationOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={relationOpen}
                className={`${underlineInputClass} flex items-center justify-between`}
              >
                <span className={relation ? 'text-[#3D3835]' : 'text-[#A8A19A]'}>
                  {relation || '아이와의 관계 선택'}
                </span>
                <svg
                  width="12"
                  height="6"
                  viewBox="0 0 12 6"
                  fill="none"
                  className={`transition-transform ${relationOpen ? 'rotate-180' : ''}`}
                >
                  <path
                    d="M1 1L6 5L11 1"
                    stroke="#706963"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {relationOpen && (
                <ul role="listbox" className="mt-2 overflow-hidden">
                  {RELATIONS.map((r, i) => {
                    const isSelected = r === relation;
                    return (
                      <li key={r}>
                        <button
                          type="button"
                          onClick={() => {
                            setRelation(r);
                            setRelationOpen(false);
                          }}
                          className={`flex h-9.75 w-full items-center justify-end px-4.25 text-[12px] ${
                            isSelected
                              ? 'bg-[#FFC721] font-semibold text-[#AB4C0A]'
                              : `font-medium text-[#706963] ${
                                  i % 2 === 0 ? 'bg-[#FAF7F2]' : 'bg-[#FFFCF9]'
                                }`
                          }`}
                        >
                          {r}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div>
              <div className="relative">
                <input
                  type={showFamilyPassword ? 'text' : 'password'}
                  value={familyPassword}
                  onChange={(e) => setFamilyPassword(e.target.value)}
                  placeholder={familyPwdPlaceholder}
                  className={`${underlineInputClass} pr-10`}
                />
                <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center">
                  <button
                    type="button"
                    aria-label={showFamilyPassword ? '가족 고유번호 숨기기' : '가족 고유번호 표시'}
                    onClick={() => setShowFamilyPassword((p) => !p)}
                  >
                    {showFamilyPassword ? (
                      <EyeOpenIcon className="size-5" />
                    ) : (
                      <EyeCloseIcon className="size-5" />
                    )}
                  </button>
                </div>
              </div>
              {showFamilyPasswordError && (
                <p className="mt-2 text-[12px] font-medium text-[#FF3D00]">{passwordHint}</p>
              )}
            </div>
          </div>

          <div className="mt-auto pb-10 pt-12">
            <Button
              type="submit"
              disabled={!allFilled}
              bgColor={allFilled ? '#FFC721' : '#B9B2A6'}
              textColor={allFilled ? '#FFFCF9' : '#FAF7F2'}
              pressedBgColor={allFilled ? '#E28702' : undefined}
              pressedTextColor={allFilled ? '#F5DF7A' : undefined}
            >
              {buttonLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

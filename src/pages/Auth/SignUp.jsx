import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import AuthenticationNeed from '@/components/Auth/AuthenticationNeed';
import SignUpDone from '@/components/Auth/SignUpDone';
import SignUpStep1 from '@/components/Auth/SignUpStep1';
import SignUpStep2 from '@/components/Auth/SignUpStep2';

const VALID_STEPS = new Set(['step1', 'step2', 'auth', 'done']);

const STEP1_DRAFT_KEY = 'signup:step1';
const STEP2_DRAFT_KEY = 'signup:step2';

function readDraft(key) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearDraft(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export default function SignUp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const method = searchParams.get('method'); // 'first' | 'existing'
  const stepParam = searchParams.get('step');
  const step = VALID_STEPS.has(stepParam) ? stepParam : 'step1';

  const goToStep = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('step', next);
    setSearchParams(params);
  };

  const handleStep1Submit = () => {
    if (method === 'first') {
      goToStep('step2');
      return;
    }
    // TODO: existing 가족원 가입 API 호출
    clearDraft(STEP1_DRAFT_KEY);
    goToStep('done');
  };

  const handleStep2Submit = () => {
    goToStep('auth');
  };

  const handleAuthComplete = () => {
    // TODO: first 가입자 + 인증 정보로 회원가입 API 호출
    clearDraft(STEP1_DRAFT_KEY);
    clearDraft(STEP2_DRAFT_KEY);
    goToStep('done');
  };

  // 잘못된 step 파라미터로 진입했을 때 step1로 정규화
  useEffect(() => {
    if (stepParam && !VALID_STEPS.has(stepParam)) {
      const params = new URLSearchParams(searchParams);
      params.delete('step');
      setSearchParams(params, { replace: true });
    }
  }, [stepParam, searchParams, setSearchParams]);

  if (step === 'done') {
    return <SignUpDone variant={method === 'first' ? 'full' : 'simple'} />;
  }

  if (step === 'auth') {
    return <AuthenticationNeed onComplete={handleAuthComplete} />;
  }

  if (step === 'step2') {
    const step1Draft = readDraft(STEP1_DRAFT_KEY);
    return (
      <SignUpStep2
        name={step1Draft?.name}
        onBack={() => goToStep('step1')}
        onSubmit={handleStep2Submit}
      />
    );
  }

  return <SignUpStep1 method={method} onSubmit={handleStep1Submit} />;
}

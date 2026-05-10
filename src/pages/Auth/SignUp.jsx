import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { signUp } from '@/api/auth';
import AuthenticationNeed from '@/components/Auth/AuthenticationNeed';
import SignUpDone from '@/components/Auth/SignUpDone';
import SignUpStep1 from '@/components/Auth/SignUpStep1';
import SignUpStep2 from '@/components/Auth/SignUpStep2';

const VALID_STEPS = new Set(['step1', 'step2', 'auth', 'done']);

const STEP1_DRAFT_KEY = 'signup:step1';
const STEP2_DRAFT_KEY = 'signup:step2';

const RELATION_TO_ROLE = {
  아빠: 'FATHER',
  엄마: 'MOTHER',
  할아버지: 'GRANDFATHER',
  할머니: 'GRANDMOTHER',
  형제자매: 'SIBLING',
  친척: 'RELATIVE',
};

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

function buildSignUpPayload(step1, isFirst) {
  return {
    name: step1.name,
    username: step1.userId,
    password: step1.password,
    familyCode: step1.familyPassword,
    firstFamilyMember: isFirst,
    familyRole: RELATION_TO_ROLE[step1.relation],
  };
}

export default function SignUp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const method = searchParams.get('method'); // 'first' | 'existing'
  const stepParam = searchParams.get('step');
  const step = VALID_STEPS.has(stepParam) ? stepParam : 'step1';
  const isFirst = method === 'first';

  const goToStep = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('step', next);
    setSearchParams(params);
  };

  const handleStep1Submit = async (step1Data) => {
    if (isFirst) {
      goToStep('step2');
      return;
    }
    try {
      await signUp(buildSignUpPayload(step1Data, false));
      clearDraft(STEP1_DRAFT_KEY);
      goToStep('done');
    } catch (error) {
      console.log('회원가입 실패', error);
    }
  };

  const handleStep2Submit = () => {
    goToStep('auth');
  };

  const handleAuthComplete = async () => {
    const step1Draft = readDraft(STEP1_DRAFT_KEY);
    if (!step1Draft) return;
    try {
      await signUp(buildSignUpPayload(step1Draft, true));
      clearDraft(STEP1_DRAFT_KEY);
      clearDraft(STEP2_DRAFT_KEY);
      goToStep('done');
    } catch (error) {
      console.log('회원가입 실패', error);
    }
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

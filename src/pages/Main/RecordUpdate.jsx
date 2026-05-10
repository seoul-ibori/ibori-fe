import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

import AuthenticationNeed from '@/components/Auth/AuthenticationNeed';
import SignUpStep2 from '@/components/Auth/SignUpStep2';
import RecordUpdateDone from '@/components/Main/RecordUpdateDone';

const VALID_STEPS = new Set(['form', 'auth', 'done']);

const FORM_DRAFT_KEY = 'recordUpdate:form';

function clearDraft() {
  try {
    sessionStorage.removeItem(FORM_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export default function RecordUpdate() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stepParam = searchParams.get('step');
  const step = VALID_STEPS.has(stepParam) ? stepParam : 'form';

  const goToStep = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('step', next);
    setSearchParams(params);
  };

  const handleFormSubmit = () => {
    goToStep('auth');
  };

  const handleAuthComplete = () => {
    // TODO: 진료내역 불러오기 API 호출
    clearDraft();
    goToStep('done');
  };

  useEffect(() => {
    if (stepParam && !VALID_STEPS.has(stepParam)) {
      const params = new URLSearchParams(searchParams);
      params.delete('step');
      setSearchParams(params, { replace: true });
    }
  }, [stepParam, searchParams, setSearchParams]);

  if (step === 'done') {
    return <RecordUpdateDone />;
  }

  if (step === 'auth') {
    return <AuthenticationNeed onBack={() => goToStep('form')} onComplete={handleAuthComplete} />;
  }

  return (
    <SignUpStep2
      headerTitle="진료내역 불러오기"
      draftKey={FORM_DRAFT_KEY}
      onBack={() => navigate(-1)}
      onSubmit={handleFormSubmit}
    />
  );
}

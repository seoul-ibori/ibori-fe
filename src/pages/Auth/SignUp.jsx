import { useState } from 'react';
import { useSearchParams } from 'react-router';

import AuthenticationNeed from '@/components/Auth/AuthenticationNeed';
import SignUpDone from '@/components/Auth/SignUpDone';
import SignUpStep1 from '@/components/Auth/SignUpStep1';
import SignUpStep2 from '@/components/Auth/SignUpStep2';

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const method = searchParams.get('method'); // 'first' | 'existing'

  const [step, setStep] = useState('step1');
  const [step1Data, setStep1Data] = useState(null);
  const [step2Data, setStep2Data] = useState(null);

  const handleStep1Submit = (data) => {
    setStep1Data(data);
    if (method === 'first') {
      setStep('step2');
      return;
    }
    // TODO: existing 가족원 가입 API 호출
    setStep('done');
  };

  const handleStep2Submit = (authData) => {
    setStep2Data(authData);
    setStep('auth');
  };

  const handleAuthComplete = () => {
    // TODO: first 가입자 + 인증 정보로 회원가입 API 호출
    void { ...step1Data, ...step2Data };
    setStep('done');
  };

  if (step === 'done') {
    return <SignUpDone variant={method === 'first' ? 'full' : 'simple'} />;
  }

  if (step === 'auth') {
    return <AuthenticationNeed onBack={() => setStep('step2')} onComplete={handleAuthComplete} />;
  }

  if (step === 'step2') {
    return (
      <SignUpStep2
        name={step1Data?.name}
        onBack={() => setStep('step1')}
        onSubmit={handleStep2Submit}
      />
    );
  }

  return <SignUpStep1 method={method} initialData={step1Data ?? {}} onSubmit={handleStep1Submit} />;
}

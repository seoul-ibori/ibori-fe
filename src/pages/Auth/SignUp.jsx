import { useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router';

import { TokenManager } from '@/api/api';
import { deleteUser, signUp } from '@/api/auth';
import { postMedicalRecords, postMedicalRecords2Way } from '@/api/codef';
import AuthenticationNeed from '@/components/Auth/AuthenticationNeed';
import SignUpDone from '@/components/Auth/SignUpDone';
import SignUpStep1 from '@/components/Auth/SignUpStep1';
import SignUpStep2 from '@/components/Auth/SignUpStep2';

const VALID_STEPS = new Set(['step1', 'step2', 'auth', 'done']);

const saveAuthData = (data) => {
  TokenManager.setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });
  localStorage.setItem('userId', String(data.userId));
  localStorage.setItem('username', data.username);
  localStorage.setItem('name', data.name);
};

const STEP1_DRAFT_KEY = 'signup:step1';
const STEP2_DRAFT_KEY = 'signup:step2';
const CODEF_BODY_KEY = 'signup:codefBody';
const CODEF_TWOWAY_KEY = 'signup:codefTwoWayInfo';
const SIGNUP_DONE_KEY = 'signup:signUpDone';

const RELATION_TO_ROLE = {
  아빠: 'FATHER',
  엄마: 'MOTHER',
  할아버지: 'GRANDFATHER',
  할머니: 'GRANDMOTHER',
  형제자매: 'SIBLING',
  친척: 'RELATIVE',
};

const TELECOM_MAP = {
  'SKT(SKT알뜰폰)': '0',
  'KT(KT알뜰폰)': '1',
  'LG U+(LG U+알뜰폰)': '2',
};

function formatYYYYMMDD(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function buildCodefBody(step1Draft, step2Data) {
  return {
    organization: '0002',
    loginType: '5',
    loginTypeLevel: '1',
    userName: step2Data.name,
    identity: step2Data.birthDate,
    phoneNo: step2Data.phone.replace(/\D/g, ''),
    telecom: TELECOM_MAP[step2Data.telecom] ?? '0',
    id: step1Draft?.userId ?? '',
    startDate: formatYYYYMMDD(step2Data.periodStart),
    endDate: formatYYYYMMDD(step2Data.periodEnd),
    type: '2',
    drugImageYN: '0',
    medicationDirectionYN: '0',
    detailYN: '0',
    timeOut: '170',
  };
}

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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsLoading, showToast } = useOutletContext();
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
    setIsLoading(true);
    try {
      const data = await signUp(buildSignUpPayload(step1Data, false));
      saveAuthData(data);
      clearDraft(STEP1_DRAFT_KEY);
      goToStep('done');
    } catch (error) {
      console.log('회원가입 실패', error);
      showToast();
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (step2Data) => {
    const step1Draft = readDraft(STEP1_DRAFT_KEY);
    const codefBody = buildCodefBody(step1Draft, step2Data);
    setIsLoading(true);
    try {
      const result = await postMedicalRecords(codefBody);
      sessionStorage.setItem(CODEF_BODY_KEY, JSON.stringify(codefBody));
      sessionStorage.setItem(CODEF_TWOWAY_KEY, JSON.stringify(result?.twoWayInfo ?? {}));
      goToStep('auth');
    } catch (error) {
      console.log('진료기록 1차 요청 실패', error);
      showToast();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthComplete = async () => {
    const step1Draft = readDraft(STEP1_DRAFT_KEY);
    const codefBody = readDraft(CODEF_BODY_KEY);
    const twoWayInfo = readDraft(CODEF_TWOWAY_KEY);
    if (!step1Draft || !codefBody) return;
    setIsLoading(true);
    try {
      const alreadySignedUp = sessionStorage.getItem(SIGNUP_DONE_KEY) === '1';
      if (!alreadySignedUp) {
        const data = await signUp(buildSignUpPayload(step1Draft, true));
        saveAuthData(data);
        sessionStorage.setItem(SIGNUP_DONE_KEY, '1');
      }
      const result = await postMedicalRecords2Way({
        ...codefBody,
        simpleAuth: '1',
        secureNo: '',
        secureNoRefresh: '0',
        twoWayInfo: twoWayInfo ?? {},
      });
      if (result?.resultCode === 'CF-03002') {
        showToast('카카오톡 인증을 완료해주세요.');
        return;
      }
      if (result?.rawData?.result?.extraMessage === '조회 결과가 없습니다.') {
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            await deleteUser({ userId });
          } catch (deleteError) {
            console.log('회원 정보 삭제 실패', deleteError);
          }
        }
        TokenManager.clear();
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('name');
        clearDraft(STEP1_DRAFT_KEY);
        clearDraft(STEP2_DRAFT_KEY);
        clearDraft(CODEF_BODY_KEY);
        clearDraft(CODEF_TWOWAY_KEY);
        sessionStorage.removeItem(SIGNUP_DONE_KEY);
        showToast(
          '건강보험공단에 자녀가 등록되어 있지 않습니다. 등록 완료 후 서비스 이용 부탁드립니다.'
        );
        navigate('/login');
        return;
      }
      clearDraft(STEP1_DRAFT_KEY);
      clearDraft(STEP2_DRAFT_KEY);
      clearDraft(CODEF_BODY_KEY);
      clearDraft(CODEF_TWOWAY_KEY);
      sessionStorage.removeItem(SIGNUP_DONE_KEY);
      goToStep('done');
    } catch (error) {
      console.log('회원가입 실패', error);
      const signedUp = sessionStorage.getItem(SIGNUP_DONE_KEY) === '1';
      if (signedUp) {
        const userId = localStorage.getItem('userId');
        if (userId) {
          try {
            await deleteUser({ userId });
          } catch (deleteError) {
            console.log('회원 정보 삭제 실패', deleteError);
          }
        }
        TokenManager.clear();
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('name');
        sessionStorage.removeItem(SIGNUP_DONE_KEY);
      }
      showToast();
    } finally {
      setIsLoading(false);
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

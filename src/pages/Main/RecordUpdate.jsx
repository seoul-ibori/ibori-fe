import { useEffect } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router';

import { postMedicalRecords, postMedicalRecords2Way } from '@/api/codef';
import AuthenticationNeed from '@/components/Auth/AuthenticationNeed';
import SignUpStep2 from '@/components/Auth/SignUpStep2';
import RecordUpdateDone from '@/components/Main/RecordUpdateDone';

const VALID_STEPS = new Set(['form', 'auth', 'done']);

const FORM_DRAFT_KEY = 'recordUpdate:form';
const CODEF_BODY_KEY = 'recordUpdate:codefBody';
const CODEF_TWOWAY_KEY = 'recordUpdate:codefTwoWayInfo';

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

function buildCodefBody(formData) {
  const username = localStorage.getItem('username') ?? '';
  return {
    organization: '0002',
    loginType: '5',
    loginTypeLevel: '1',
    userName: formData.name,
    identity: formData.birthDate,
    phoneNo: formData.phone.replace(/\D/g, ''),
    telecom: TELECOM_MAP[formData.telecom] ?? '0',
    id: username,
    startDate: formatYYYYMMDD(formData.periodStart),
    endDate: formatYYYYMMDD(formData.periodEnd),
    type: '1',
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

function clearAllDrafts() {
  try {
    sessionStorage.removeItem(FORM_DRAFT_KEY);
    sessionStorage.removeItem(CODEF_BODY_KEY);
    sessionStorage.removeItem(CODEF_TWOWAY_KEY);
  } catch {
    /* ignore */
  }
}

export default function RecordUpdate() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setIsLoading, showToast } = useOutletContext();
  const stepParam = searchParams.get('step');
  const step = VALID_STEPS.has(stepParam) ? stepParam : 'form';

  const goToStep = (next) => {
    const params = new URLSearchParams(searchParams);
    params.set('step', next);
    setSearchParams(params);
  };

  const handleFormSubmit = async (formData) => {
    const codefBody = buildCodefBody(formData);
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
    const codefBody = readDraft(CODEF_BODY_KEY);
    const twoWayInfo = readDraft(CODEF_TWOWAY_KEY);
    if (!codefBody) return;
    setIsLoading(true);
    try {
      await postMedicalRecords2Way({
        ...codefBody,
        simpleAuth: '1',
        secureNo: '',
        secureNoRefresh: '0',
        twoWayInfo: twoWayInfo ?? {},
      });
      clearAllDrafts();
      goToStep('done');
    } catch (error) {
      console.log('진료기록 2차 요청 실패', error);
      showToast();
    } finally {
      setIsLoading(false);
    }
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

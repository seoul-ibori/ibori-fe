import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { TokenManager } from '@/api/api';
import { deleteFamily, getFamily, patchFamilyCode } from '@/api/family';
import ChainIcon from '@/assets/icons/settings/chain_icon.svg?react';
import ChainOrangeIcon from '@/assets/icons/settings/chain_orange_icon.svg?react';
import ChildIcon from '@/assets/icons/settings/child_icon.svg?react';
import DoorIcon from '@/assets/icons/settings/door_icon.svg?react';
import HouseIcon from '@/assets/icons/settings/house_icon.svg?react';
import LetterIcon from '@/assets/icons/settings/letter_box_icon.svg?react';
import LockIcon from '@/assets/icons/settings/lock_icon.svg?react';
import LogoutIcon from '@/assets/icons/settings/logout_icon.svg?react';
import PersonIcon from '@/assets/icons/settings/person_icon.svg?react';
import Bar from '@/components/Main/Bar';
import MemberBar from '@/components/Setting/MemberBar';
import SettingBar from '@/components/Setting/SettingBar';
import SettingModal from '@/components/Setting/SettingModal';
import BackButtonIcon from '@/components/common/BackButtonIcon';

const FAMILY_ROLE_MAP = {
  MOTHER: { label: '엄마', color: '#FF7595' },
  FATHER: { label: '아빠', color: '#556FFF' },
  GRANDMOTHER: { label: '할머니', color: '#FEA100' },
  GRANDFATHER: { label: '할아버지', color: '#3EB839' },
  SIBLING: { label: '형제', color: '#479DFF' },
  RELATIVE: { label: '친척', color: '#C682DF' },
};

const INVITE_LINK = 'https://ibori.site/login';

function validateFamilyCode(value) {
  if (!value || value.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);
  return hasLetter && hasSpecial;
}

export default function Settings() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [activeModal, setActiveModal] = useState(null); // 'invite' | 'familyCode' | 'logout' | null
  const [familyCode, setFamilyCode] = useState('');

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const res = await getFamily();
        setMembers(Array.isArray(res) ? res : []);
      } catch (error) {
        console.log('가족 구성원 조회 실패', error);
      }
    };
    fetchFamily();
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setFamilyCode('');
  };

  const handleDelete = async (memberId) => {
    try {
      await deleteFamily(memberId);
      setMembers((prev) => prev.filter((m) => m.memberId !== memberId));
    } catch (error) {
      console.log('가족 구성원 삭제 실패', error);
    }
  };

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
    } catch {
      /* ignore */
    }
    closeModal();
  };

  const handleFamilyCodeSubmit = async () => {
    if (!validateFamilyCode(familyCode)) return;
    try {
      await patchFamilyCode({ familyCode });
    } catch (error) {
      console.log('가족 코드 변경 실패', error);
    }
    closeModal();
  };

  const handleLogout = () => {
    TokenManager.clear();
    closeModal();
    navigate('/');
  };

  return (
    <div className="flex flex-col">
      <div className="px-6 pt-7 pb-2">
        <button type="button" onClick={() => navigate(-1)} aria-label="뒤로가기" className="p-1">
          <BackButtonIcon color="#1D1B1A" />
        </button>
      </div>

      <div className="px-6 pt-3 pb-3.5">
        <h1 className="text-[18px] font-semibold tracking-[-0.45px] text-[#1D1B1A]">설정</h1>
      </div>

      <Bar />

      <section className="pt-5.25 pb-4">
        <div className="flex items-center gap-4 px-5.25 pb-2.5">
          <span className="flex w-5.25 justify-center">
            <PersonIcon />
          </span>
          <p className="text-[15px] font-semibold text-[#1D1B1A]">가족 구성원</p>
        </div>
        <div className="pl-13.75">
          {members.map((member) => {
            const role = FAMILY_ROLE_MAP[member.familyRole];
            return (
              member.memberType !== 'CHILD' && (
                <MemberBar
                  key={member.memberId}
                  role={role?.label ?? member.familyRole}
                  roleColor={role?.color ?? '#B9B2A6'}
                  name={member.name}
                  onDelete={() => handleDelete(member.memberId)}
                />
              )
            );
          })}
        </div>
      </section>

      <Bar />

      <section className="py-1">
        <SettingBar
          icon={<HouseIcon />}
          label="구성원 추가하기"
          onClick={() => setActiveModal('invite')}
        />
        <SettingBar
          icon={<ChildIcon />}
          label="아이 정보 수정하기"
          onClick={() => navigate('/child-list')}
        />
        <SettingBar
          icon={<LockIcon />}
          label="가족 비밀번호 수정하기"
          onClick={() => setActiveModal('familyCode')}
        />
        <SettingBar
          icon={<LogoutIcon />}
          label="로그아웃하기"
          onClick={() => setActiveModal('logout')}
        />
      </section>

      {activeModal === 'invite' && (
        <SettingModal
          onClose={closeModal}
          actionLabel="초대 링크 복사하기"
          actionIcon={<ChainIcon />}
          actionPressedIcon={<ChainOrangeIcon />}
          onAction={handleCopyInvite}
        >
          <div className="flex flex-col items-center gap-2.25 pt-5">
            <LetterIcon />
            <p className="text-center text-[18px] font-medium leading-7.25 text-[#706963]">
              아래 버튼을 눌러
              <br />
              <span className="font-semibold">초대 링크</span>를 공유해주세요
            </p>
          </div>
        </SettingModal>
      )}

      {activeModal === 'familyCode' && (
        <SettingModal
          onClose={closeModal}
          actionLabel="완료하기"
          onAction={handleFamilyCodeSubmit}
          actionDisabled={!validateFamilyCode(familyCode)}
        >
          <div className="flex flex-col gap-2 pt-3">
            <p className="text-center text-[18px] leading-[29px] text-[#706963]">
              <span className="font-bold">새로운 고유번호</span>를 입력하세요
            </p>
            <p className="text-center text-[12px] font-medium text-[#B9B2A6]">
              8자 이상이며 영문자와 특수문자 포함
            </p>
            <input
              type="text"
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value)}
              placeholder="가족 고유번호를 입력하세요"
              className="mt-3 h-13 w-full rounded-[12px] bg-[#FAF7F2] px-4.25 text-[15px] font-medium text-[#3D3835] outline-none placeholder:text-[#B9B2A6]"
            />
          </div>
        </SettingModal>
      )}

      {activeModal === 'logout' && (
        <SettingModal onClose={closeModal} actionLabel="로그아웃하기" onAction={handleLogout}>
          <div className="flex flex-col items-center gap-4 pt-5">
            <DoorIcon />
            <p className="text-[18px] font-extrabold text-[#1D1B1A]">떠나시는 건가요?</p>
            <p className="text-center text-[15px] font-medium leading-[1.541] text-[#B9B2A6]">
              아래 버튼 클릭시, 로그아웃 후
              <br />
              로그인화면으로 돌아가요
            </p>
          </div>
        </SettingModal>
      )}
    </div>
  );
}
